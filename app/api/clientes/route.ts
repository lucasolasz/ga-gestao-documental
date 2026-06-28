import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { Categoria } from "@/types/entidades-banco/categoria";

export async function GET() {
  const supabase = await createClient();

  const [clientsRes, docsRes] = await Promise.all([
    supabase
      .from("clients")
      .select("*, categorias(id, descricao, categorias_tipos_documentos(count))", { count: "exact" })
      .order("nome"),
    supabase
      .from("documents")
      .select("client_id, tipo")
      .not("tipo", "is", null),
  ]);

  if (clientsRes.error) {
    return NextResponse.json({ error: clientsRes.error.message }, { status: 500 });
  }

  const tiposPorCliente = new Map<string, Set<string>>();
  for (const doc of docsRes.data ?? []) {
    if (!tiposPorCliente.has(doc.client_id))
      tiposPorCliente.set(doc.client_id, new Set());
    tiposPorCliente.get(doc.client_id)!.add(doc.tipo as string);
  }

  const clientes = (clientsRes.data ?? []).map((c) => ({
    id: c.id,
    nome: c.nome,
    cnpj: c.cnpj,
    telefone: c.telefone,
    drive_folder_id: c.drive_folder_id,
    categoria_id: c.categoria_id,
    categoria: c.categorias as Categoria | undefined,
    created_at: c.created_at,
    updated_at: c.updated_at,
    documentos_count: tiposPorCliente.get(c.id)?.size ?? 0,
    tipos_categoria_count:
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (c.categorias as any)?.categorias_tipos_documentos?.[0]?.count ?? 0,
  }));

  return NextResponse.json({ clientes, totalRecords: clientsRes.count ?? 0 });
}

export async function POST(request: NextRequest) {
  const body = await request.json() as {
    nome: string;
    cnpj: string;
    telefone?: string;
    categoria_id?: string;
  };

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("clients")
    .insert({
      nome: body.nome,
      cnpj: body.cnpj,
      telefone: body.telefone || null,
      categoria_id: body.categoria_id || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath("/clientes");

  return NextResponse.json(data, { status: 201 });
}
