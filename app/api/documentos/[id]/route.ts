import { createClient } from "@/lib/supabase/server";
import { getDriveClient, isFolderEmpty, nameToKey } from "@/lib/google-drive";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

type DocumentPayload = {
  client_id?: string;
  numero?: string;
  tipo?: string;
  data_emissao?: string;
  data_validade?: string;
  file_url?: string;
  file_name?: string;
};

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = (await request.json()) as DocumentPayload;

  const supabase = await createClient();

  const payload = {
    client_id: body.client_id,
    numero: body.numero,
    tipo: body.tipo,
    data_emissao: body.data_emissao,
    data_validade: body.data_validade,
    file_url: body.file_url,
    file_name: body.file_name,
  };

  const { data, error } = await supabase
    .from("documents")
    .update(payload)
    .eq("id", id)
    .select("*, client:clients(*), tipo:tipos_documentos(*)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath("/tabelas");

  return NextResponse.json(data);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: doc } = await supabase
    .from("documents")
    .select("file_url, client:clients(drive_folder_id), tipo:tipos_documentos(descricao)")
    .eq("id", id)
    .single();

  if (doc?.file_url) {
    try {
      const drive = getDriveClient();
      const fileId = new URL(doc.file_url).searchParams.get("id");
      if (fileId) await drive.files.delete({ fileId });

      const clientFolderId = (doc.client as { drive_folder_id?: string })?.drive_folder_id;
      const tipoDescricao = (doc.tipo as { descricao?: string })?.descricao;

      if (clientFolderId && tipoDescricao) {
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
      }
    } catch {
      // Don't block deletion if Drive cleanup fails
    }
  }

  const { error } = await supabase.from("documents").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath("/tabelas");

  return NextResponse.json({ success: true });
}
