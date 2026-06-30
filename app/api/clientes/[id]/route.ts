import { createClient } from "@/lib/supabase/server";
import { getDriveClient } from "@/lib/google-drive";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = (await request.json()) as {
    nome: string;
    cnpj: string;
    telefone?: string;
    categoria_id?: string;
    tiposDocumentosIds?: string[];
  };

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("clients")
    .update({
      nome: body.nome,
      cnpj: body.cnpj,
      telefone: body.telefone || null,
      categoria_id: body.categoria_id || null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { error: deleteError } = await supabase
    .from("clientes_tipos_documentos")
    .delete()
    .eq("client_id", id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  if (body.tiposDocumentosIds?.length) {
    const junctions = body.tiposDocumentosIds.map((tipoId) => ({
      client_id: id,
      tipo_documento_id: tipoId,
    }));

    const { error: insertError } = await supabase
      .from("clientes_tipos_documentos")
      .insert(junctions);

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
  }

  revalidatePath("/clientes");

  return NextResponse.json(data);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: client } = await supabase
    .from("clients")
    .select("drive_folder_id")
    .eq("id", id)
    .single();

  if (client?.drive_folder_id) {
    try {
      const drive = getDriveClient();
      await drive.files.delete({ fileId: client.drive_folder_id });
    } catch {
      // Don't block deletion if Drive fails
    }
  }

  const { error } = await supabase.from("clients").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath("/clientes");

  return NextResponse.json({ success: true });
}