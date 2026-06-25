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

  // Resolve client folder
  let clientFolderId = d.client.drive_folder_id;
  if (!clientFolderId) {
    clientFolderId = await getOrCreateFolder(
      drive,
      nameToKey(d.client.nome),
      process.env.GOOGLE_DRIVE_FOLDER_ID!,
    );
    await supabase
      .from("clients")
      .update({ drive_folder_id: clientFolderId })
      .eq("id", d.client.id);
  }

  // Resolve tipo subfolder
  const tipoFolderId = await getOrCreateFolder(
    drive,
    nameToKey(d.tipo?.descricao ?? "SEM_TIPO"),
    clientFolderId,
  );

  // Delete previous file from Drive if exists
  if (d.file_url) {
    try {
      const oldFileId = new URL(d.file_url).searchParams.get("id");
      if (oldFileId) await drive.files.delete({ fileId: oldFileId });
    } catch {
      // Don't block upload
    }
  }

  // Upload new file
  const buffer = Buffer.from(await file.arrayBuffer());
  const uploaded = await drive.files.create({
    requestBody: { name: file.name, parents: [tipoFolderId] },
    media: { mimeType: file.type, body: Readable.from(buffer) },
    fields: "id, name",
  });

  const fileId = uploaded.data.id!;
  const fileName = uploaded.data.name!;

  await drive.permissions.create({
    fileId,
    requestBody: { role: "reader", type: "anyone" },
  });

  const fileUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

  const { error } = await supabase
    .from("documents")
    .update({ file_url: fileUrl, file_name: fileName })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ file_url: fileUrl, file_name: fileName });
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

  // Delete file from Drive
  if (d.file_url) {
    try {
      const fileId = new URL(d.file_url).searchParams.get("id");
      if (fileId) await drive.files.delete({ fileId });
    } catch {
      // Continue even if Drive delete fails
    }
  }

  // Remove tipo folder if now empty
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
