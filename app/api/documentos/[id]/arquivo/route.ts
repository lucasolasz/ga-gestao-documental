import { createClient } from "@/lib/supabase/server";
import {
  getDriveClient,
  getOrCreateFolder,
  isFolderEmpty,
  nameToKey,
} from "@/lib/google-drive";
import { NextRequest, NextResponse } from "next/server";
import { Readable } from "stream";

type DocWithRelations = {
  file_url: string | null;
  file_name: string | null;
  client: { id: string; nome: string; drive_folder_id: string | null };
  tipo: { descricao: string } | null;
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "Arquivo não informado" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: doc, error: docError } = await supabase
    .from("documents")
    .select("file_url, file_name, client:clients(id, nome, drive_folder_id), tipo:tipos_documentos(descricao)")
    .eq("id", id)
    .single();

  if (docError || !doc) {
    return NextResponse.json({ error: "Documento não encontrado" }, { status: 404 });
  }

  const d = doc as unknown as DocWithRelations;
  const drive = getDriveClient();

  let clientFolderId: string | null = d.client.drive_folder_id;
  let clientFolderCreated = false;
  let tipoFolderId: string | null = null;
  let tipoFolderCreated = false;
  let uploadedFileId: string | null = null;

  try {
    if (!clientFolderId) {
      const cf = await getOrCreateFolder(
        drive,
        nameToKey(d.client.nome),
        process.env.GOOGLE_DRIVE_FOLDER_ID!,
      );
      clientFolderId = cf.id;
      clientFolderCreated = cf.created;
      if (cf.created) {
        await supabase
          .from("clients")
          .update({ drive_folder_id: cf.id })
          .eq("id", d.client.id);
      }
    }

    const tf = await getOrCreateFolder(
      drive,
      nameToKey(d.tipo?.descricao ?? "SEM_TIPO"),
      clientFolderId,
    );
    tipoFolderId = tf.id;
    tipoFolderCreated = tf.created;

    if (d.file_url) {
      try {
        const oldFileId = new URL(d.file_url).searchParams.get("id");
        if (oldFileId) await drive.files.delete({ fileId: oldFileId });
      } catch {
        // Don't block upload
      }
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await drive.files.create({
      requestBody: { name: file.name, parents: [tipoFolderId] },
      media: { mimeType: file.type, body: Readable.from(buffer) },
      fields: "id, name",
    });

    uploadedFileId = uploaded.data.id!;
    const fileName = uploaded.data.name!;

    await drive.permissions.create({
      fileId: uploadedFileId,
      requestBody: { role: "reader", type: "anyone" },
    });

    const fileUrl = `https://drive.google.com/uc?export=download&id=${uploadedFileId}`;

    const { error } = await supabase
      .from("documents")
      .update({ file_url: fileUrl, file_name: fileName })
      .eq("id", id);

    if (error) throw new Error(error.message);

    return NextResponse.json({ file_url: fileUrl, file_name: fileName });

  } catch (err) {
    if (uploadedFileId) {
      await drive.files.delete({ fileId: uploadedFileId }).catch(() => {});
    }
    if (tipoFolderCreated && tipoFolderId) {
      await drive.files.delete({ fileId: tipoFolderId }).catch(() => {});
    }
    if (clientFolderCreated && clientFolderId) {
      await drive.files.delete({ fileId: clientFolderId }).catch(() => {});
      try {
        await supabase
          .from("clients")
          .update({ drive_folder_id: null })
          .eq("id", d.client.id);
      } catch {}
    }

    const msg = err instanceof Error ? err.message : "Erro no upload";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: doc, error: docError } = await supabase
    .from("documents")
    .select("file_url, client:clients(drive_folder_id), tipo:tipos_documentos(descricao)")
    .eq("id", id)
    .single();

  if (docError || !doc) {
    return NextResponse.json({ error: "Documento não encontrado" }, { status: 404 });
  }

  const d = doc as unknown as DocWithRelations;
  const drive = getDriveClient();

  if (d.file_url) {
    try {
      const fileId = new URL(d.file_url).searchParams.get("id");
      if (fileId) await drive.files.delete({ fileId });
    } catch {
      // Continue even if Drive delete fails
    }
  }

  const clientFolderId = d.client?.drive_folder_id;
  const tipoDescricao = d.tipo?.descricao;

  if (clientFolderId && tipoDescricao) {
    try {
      const tipoKey = nameToKey(tipoDescricao);
      const escaped = tipoKey.replace(/'/g, "\\'");
      const folderRes = await drive.files.list({
        q: `name='${escaped}' and mimeType='application/vnd.google-apps.folder' and '${clientFolderId}' in parents and trashed=false`,
        fields: "files(id)",
      });
      const tipoFolderId = folderRes.data.files?.[0]?.id;
      if (tipoFolderId && (await isFolderEmpty(drive, tipoFolderId))) {
        await drive.files.delete({ fileId: tipoFolderId });
      }
    } catch {
      // Don't block on folder cleanup
    }
  }

  await supabase
    .from("documents")
    .update({ file_url: null, file_name: null })
    .eq("id", id);

  return NextResponse.json({ success: true });
}
