import { Pop } from "@/types/entidades-banco/pop";

export async function pesquisarPops(): Promise<Pop[]> {
  const res = await fetch("/api/pops");
  if (!res.ok) throw new Error("Erro ao buscar POPs");
  const data = await res.json();
  return data.pops ?? [];
}

export async function criarPop(pop: Partial<Pop>): Promise<Pop> {
  const res = await fetch("/api/pops", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pop),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Erro ao criar POP");
  }
  return res.json();
}

export async function atualizarPop(id: string, pop: Partial<Pop>): Promise<Pop> {
  const res = await fetch(`/api/pops/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pop),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Erro ao atualizar POP");
  }
  return res.json();
}

export async function deletarPop(id: string): Promise<void> {
  const res = await fetch(`/api/pops/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Erro ao excluir POP");
  }
}
