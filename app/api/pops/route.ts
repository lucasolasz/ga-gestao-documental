import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { Pop } from "@/types/entidades-banco/pop";

export async function GET() {
  const supabase = await createClient();

  const { data, error, count } = await supabase
    .from("pops")
    .select("*, familias_pop(id, descricao)", { count: "exact" })
    .order("descricao");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const pops = (data ?? []).map(({ familias_pop, ...rest }) => ({
    ...rest,
    familia_pop: familias_pop,
  }));

  return NextResponse.json({ pops, totalRecords: count ?? 0 });
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Partial<Pop>;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("pops")
    .insert({ descricao: body.descricao, familia_pop_id: body.familia_pop_id })
    .select("*, familias_pop(id, descricao)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath("/pops");

  const { familias_pop, ...rest } = data as any;
  return NextResponse.json({ ...rest, familia_pop: familias_pop }, { status: 201 });
}
