import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { TipoDocumento } from "@/types/entidades-banco/tipoDocumento";

export async function GET() {
  const supabase = await createClient();

  const { data, error, count } = await supabase
    .from("tipos_documentos")
    .select("*, familias_documentos(id, descricao)", { count: "exact" })
    .order("descricao");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ tiposDocumentos: data, totalRecords: count ?? 0 });
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Partial<TipoDocumento>;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tipos_documentos")
    .insert({ descricao: body.descricao, familia_id: body.familia_id })
    .select("*, familias_documentos(id, descricao)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath("/tipodocumento");

  return NextResponse.json(data, { status: 201 });
}
