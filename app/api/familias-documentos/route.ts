import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { FamiliaDocumento } from "@/types/entidades-banco/familiaDocumento";

export async function GET() {
  const supabase = await createClient();

  const { data, error, count } = await supabase
    .from("familias_documentos")
    .select("*", { count: "exact" })
    .order("descricao");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ familias: data, totalRecords: count ?? 0 });
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Partial<FamiliaDocumento>;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("familias_documentos")
    .insert({ descricao: body.descricao })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath("/familias");

  return NextResponse.json(data, { status: 201 });
}
