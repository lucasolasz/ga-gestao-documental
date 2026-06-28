import { TipoDocumento } from "@/types/entidades-banco/tipoDocumento";

export async function pesquisarTiposDocumentos(): Promise<TipoDocumento[]> {
  const res = await fetch("/api/tipos-documentos");
  if (!res.ok) throw new Error("Erro ao buscar tipos de documentos");
  const data = await res.json();
  return data.tiposDocumentos ?? [];
}

export async function pesquisarTiposDocumentosDisponiveis(
  clientId: string,
  excluirDocumentoId?: string,
): Promise<TipoDocumento[]> {
  const params = new URLSearchParams({ client_id: clientId });
  if (excluirDocumentoId) params.set("excluir_documento_id", excluirDocumentoId);
  const res = await fetch(`/api/tipos-documentos/disponiveis?${params}`);
  if (!res.ok) throw new Error("Erro ao buscar tipos de documentos disponíveis");
  const data = await res.json();
  return data.tiposDocumentos ?? [];
}

export async function criarTipoDocumento(
  tipoDocumento: Partial<TipoDocumento>,
): Promise<TipoDocumento> {
  const res = await fetch("/api/tipos-documentos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tipoDocumento),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Erro ao criar tipo de documento");
  }
  return res.json();
}

export async function atualizarTipoDocumento(
  id: string,
  tipoDocumento: Partial<TipoDocumento>,
): Promise<TipoDocumento> {
  const res = await fetch(`/api/tipos-documentos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tipoDocumento),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Erro ao atualizar tipo de documento");
  }
  return res.json();
}

export async function deletarTipoDocumento(id: string): Promise<void> {
  const res = await fetch(`/api/tipos-documentos/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Erro ao excluir tipo de documento");
  }
}
