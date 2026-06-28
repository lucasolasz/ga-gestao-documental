import { FamiliaPop } from "@/types/entidades-banco/familiaPop";

export async function pesquisarFamiliasPop(): Promise<FamiliaPop[]> {
  const res = await fetch("/api/familias-pop");
  if (!res.ok) throw new Error("Erro ao buscar familias POP");
  const data = await res.json();
  return data.familiasPop ?? [];
}

export async function criarFamiliaPop(
  familiaPop: Partial<FamiliaPop>,
): Promise<FamiliaPop> {
  const res = await fetch("/api/familias-pop", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(familiaPop),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Erro ao criar familia POP");
  }
  return res.json();
}

export async function atualizarFamiliaPop(
  id: string,
  familiaPop: Partial<FamiliaPop>,
): Promise<FamiliaPop> {
  const res = await fetch(`/api/familias-pop/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(familiaPop),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Erro ao atualizar familia POP");
  }
  return res.json();
}

export async function deletarFamiliaPop(id: string): Promise<void> {
  const res = await fetch(`/api/familias-pop/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Erro ao excluir familia POP");
  }
}
