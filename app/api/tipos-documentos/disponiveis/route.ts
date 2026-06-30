import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const client_id = searchParams.get("client_id");
  const excluir_documento_id = searchParams.get("excluir_documento_id");

  if (!client_id) {
    return NextResponse.json({ error: "client_id obrigatório" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: juncoes, error: juncoesError } = await supabase
    .from("clientes_tipos_documentos")
    .select("tipo_documento_id")
    .eq("client_id", client_id);

  if (juncoesError || !juncoes?.length) {
    return NextResponse.json({ tiposDocumentos: [] });
  }

  const idsDoCliente = juncoes.map((j) => j.tipo_documento_id as string);

  let docsQuery = supabase
    .from("documents")
    .select("tipo")
    .eq("client_id", client_id)
    .not("tipo", "is", null);

  if (excluir_documento_id) {
    docsQuery = docsQuery.neq("id", excluir_documento_id);
  }

  const { data: docsUsados } = await docsQuery;

  const tiposJaUsados = new Set((docsUsados ?? []).map((d) => d.tipo as string));

  const idsDisponiveis = idsDoCliente.filter((id) => !tiposJaUsados.has(id));

  if (!idsDisponiveis.length) {
    return NextResponse.json({ tiposDocumentos: [] });
  }

  const { data, error } = await supabase
    .from("tipos_documentos")
    .select("*")
    .in("id", idsDisponiveis)
    .order("descricao");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ tiposDocumentos: data });
}