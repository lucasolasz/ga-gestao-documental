import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { Pop } from "@/types/entidades-banco/pop";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = (await request.json()) as Partial<Pop>;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("pops")
    .update({ descricao: body.descricao, familia_pop_id: body.familia_pop_id })
    .eq("id", id)
    .select("*, familias_pop(id, descricao)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath("/pops");

  const { familias_pop, ...rest } = data as any;
  return NextResponse.json({ ...rest, familia_pop: familias_pop });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const supabase = await createClient();

  const { error } = await supabase.from("pops").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath("/pops");

  return NextResponse.json({ success: true });
}
