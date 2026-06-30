import { Client } from "@/types/entidades-banco/client";

export interface ClienteForm extends Client {
  categoria_id: string;
  tiposDocumentosIds: string[];
}

export async function pesquisarClientes(): Promise<ClienteForm[]> {
  const res = await fetch("/api/clientes");
  if (!res.ok) throw new Error("Erro ao buscar clientes");
  const data = await res.json();
  return data.clientes ?? [];
}

export async function criarCliente(cliente: Partial<ClienteForm>): Promise<ClienteForm> {
  const res = await fetch("/api/clientes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cliente),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Erro ao criar cliente");
  }
  return res.json();
}

export async function atualizarCliente(
  id: string,
  cliente: Partial<ClienteForm>,
): Promise<ClienteForm> {
  const res = await fetch(`/api/clientes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cliente),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Erro ao atualizar cliente");
  }
  return res.json();
}

export async function deletarCliente(id: string): Promise<void> {
  const res = await fetch(`/api/clientes/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Erro ao excluir cliente");
  }
}