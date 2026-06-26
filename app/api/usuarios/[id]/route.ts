import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { UsuarioForm } from "@/types/entidades-banco/usuario";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = (await request.json()) as UsuarioForm;

  const admin = createAdminClient();
  const supabase = await createClient();

  const adminUpdates: { email?: string; password?: string } = {};
  if (body.email) adminUpdates.email = body.email;
  if (body.senha) adminUpdates.password = body.senha;

  if (Object.keys(adminUpdates).length > 0) {
    const { error } = await admin.auth.admin.updateUserById(id, adminUpdates);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ nome: body.nome, perfil: body.perfil })
    .eq("id", id);

  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 });

  revalidatePath("/usuarios");

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const admin = createAdminClient();

  const { error } = await admin.auth.admin.deleteUser(id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidatePath("/usuarios");

  return NextResponse.json({ success: true });
}
