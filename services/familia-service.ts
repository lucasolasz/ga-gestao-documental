import { FamiliaDocumento } from "@/types/entidades-banco/familiaDocumento";

export async function pesquisarFamilias(): Promise<FamiliaDocumento[]> {
  const res = await fetch("/api/familias-documentos");
  if (!res.ok) throw new Error("Erro ao buscar famílias de documentos");
  const data = await res.json();
  return data.familias ?? [];
}

export async function criarFamilia(
  familia: Partial<FamiliaDocumento>,
): Promise<FamiliaDocumento> {
  const res = await fetch("/api/familias-documentos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(familia),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Erro ao criar família de documento");
  }
  return res.json();
}

export async function atualizarFamilia(
  id: string,
  familia: Partial<FamiliaDocumento>,
): Promise<FamiliaDocumento> {
  const res = await fetch(`/api/familias-documentos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(familia),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Erro ao atualizar família de documento");
  }
  return res.json();
}

export async function deletarFamilia(id: string): Promise<void> {
  const res = await fetch(`/api/familias-documentos/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Erro ao excluir família de documento");
  }
}
