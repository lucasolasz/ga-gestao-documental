import { Categoria } from "@/types/entidades-banco/categoria";

export type CategoriaForm = Categoria;

export async function pesquisarCategorias(): Promise<CategoriaForm[]> {
  const res = await fetch("/api/categorias");
  if (!res.ok) throw new Error("Erro ao buscar categorias");
  const data = await res.json();
  return data.categorias ?? [];
}

export async function criarCategoria(
  categoria: Partial<CategoriaForm>,
): Promise<CategoriaForm> {
  const res = await fetch("/api/categorias", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(categoria),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Erro ao criar categoria");
  }
  return res.json();
}

export async function atualizarCategoria(
  id: string,
  categoria: Partial<CategoriaForm>,
): Promise<CategoriaForm> {
  const res = await fetch(`/api/categorias/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(categoria),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Erro ao atualizar categoria");
  }
  return res.json();
}

export async function deletarCategoria(id: string): Promise<void> {
  const res = await fetch(`/api/categorias/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Erro ao excluir categoria");
  }
}
