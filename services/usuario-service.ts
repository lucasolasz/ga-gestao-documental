import { UsuarioForm } from "@/types/entidades-banco/usuario";

export async function pesquisarUsuarios(): Promise<UsuarioForm[]> {
  const res = await fetch("/api/usuarios");
  if (!res.ok) throw new Error("Erro ao buscar usuários");
  const data = await res.json();
  return data.usuarios ?? [];
}

export async function criarUsuario(usuario: UsuarioForm): Promise<void> {
  const res = await fetch("/api/usuarios", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(usuario),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Erro ao criar usuário");
  }
}

export async function atualizarUsuario(id: string, usuario: UsuarioForm): Promise<void> {
  const res = await fetch(`/api/usuarios/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(usuario),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Erro ao atualizar usuário");
  }
}

export async function deletarUsuario(id: string): Promise<void> {
  const res = await fetch(`/api/usuarios/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Erro ao excluir usuário");
  }
}
