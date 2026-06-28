import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { FamiliaPop } from "@/types/entidades-banco/familiaPop";

export async function GET() {
  const supabase = await createClient();

  const { data, error, count } = await supabase
    .from("familias_pop")
    .select("*", { count: "exact" })
    .order("descricao");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ familiasPop: data, totalRecords: count ?? 0 });
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Partial<FamiliaPop>;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("familias_pop")
    .insert({ descricao: body.descricao })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath("/familiapop");

  return NextResponse.json(data, { status: 201 });
}
