import { createClient } from "@/lib/supabase/server";
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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page")) || 1;
  const rows = Number(searchParams.get("rows")) || 10;
  const termo = searchParams.get("termo") || "";
  const client_id = searchParams.get("client_id") || "";

  const supabase = await createClient();

  const from = (page - 1) * rows;
  const to = from + rows - 1;

  let query = supabase
    .from("documents")
    .select("*, client:clients(*), tipo:tipos_documentos(*)", {
      count: "exact",
    });

  if (termo) {
    query = query.ilike("numero", `%${termo}%`);
  }

  if (client_id) {
    query = query.eq("client_id", client_id);
  }

  query = query.not("data_validade", "is", null);

  const { data, error, count } = await query
    .order("data_validade")
    .range(from, to);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ documents: data, totalRecords: count ?? 0 });
}

export async function POST(request: NextRequest) {
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
    .insert(payload)
    .select("*, client:clients(*), tipo:tipos_documentos(*)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath("/tabelas");

  return NextResponse.json(data, { status: 201 });
}
