import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { UsuarioForm } from "@/types/entidades-banco/usuario";

export async function GET() {
  const admin = createAdminClient();
  const supabase = await createClient();

  const [{ data: authData, error: authError }, { data: profiles, error: profilesError }] =
    await Promise.all([
      admin.auth.admin.listUsers(),
      supabase.from("profiles").select("id, nome, perfil, created_at"),
    ]);

  if (authError) return NextResponse.json({ error: authError.message }, { status: 500 });
  if (profilesError) return NextResponse.json({ error: profilesError.message }, { status: 500 });

  const profilesMap = new Map(profiles?.map((p) => [p.id, p]));

  const usuarios: UsuarioForm[] = authData.users.map((u) => {
    const profile = profilesMap.get(u.id);
    return {
      id: u.id,
      email: u.email ?? "",
      nome: profile?.nome ?? "",
      perfil: (profile?.perfil ?? "viewer") as UsuarioForm["perfil"],
    };
  });

  return NextResponse.json({ usuarios });
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as UsuarioForm;
  const admin = createAdminClient();
  const supabase = await createClient();

  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: body.email,
    password: body.senha,
    email_confirm: true,
  });

  if (authError) return NextResponse.json({ error: authError.message }, { status: 500 });

  const { error: profileError } = await supabase
    .from("profiles")
    .insert({ id: authData.user.id, nome: body.nome, perfil: body.perfil });

  if (profileError) {
    await admin.auth.admin.deleteUser(authData.user.id);
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  revalidatePath("/usuarios");

  return NextResponse.json({ id: authData.user.id }, { status: 201 });
}
