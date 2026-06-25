import { Documento } from "@/types/entidades-banco/documento";
import { calculateDocumentStatus } from "@/utils/document-status";

type DocumentPayload = {
  client_id?: string;
  numero?: string;
  tipo?: string;
  data_emissao?: string;
  data_validade?: string;
  file_url?: string;
  file_name?: string;
};

export async function pesquisarDocumentos(
  termo?: string,
  clientId?: string,
): Promise<Documento[]> {
  const params = new URLSearchParams();
  if (termo) params.set("termo", termo);
  if (clientId) params.set("client_id", clientId);
  const query = params.toString() ? `?${params.toString()}` : "";
  const res = await fetch(`/api/documentos${query}`);
  if (!res.ok) throw new Error("Erro ao buscar documentos");
  const data = await res.json();
  const documents: Documento[] = data.documents ?? [];

  return documents.map((doc) => ({
    ...doc,
    status: calculateDocumentStatus(doc.data_validade),
  }));
}

export async function criarDocumento(doc: DocumentPayload): Promise<Documento> {
  const res = await fetch("/api/documentos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(doc),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Erro ao criar documento");
  }
  return res.json();
}

export async function atualizarDocumento(
  id: string,
  doc: DocumentPayload,
): Promise<Documento> {
  const res = await fetch(`/api/documentos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(doc),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Erro ao atualizar documento");
  }
  return res.json();
}

export async function deletarDocumento(id: string): Promise<void> {
  const res = await fetch(`/api/documentos/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Erro ao excluir documento");
  }
}

export async function uploadArquivoDocumento(
  documentId: string,
  file: File,
): Promise<{ file_url: string; file_name: string }> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`/api/documentos/${documentId}/arquivo`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Erro ao enviar arquivo");
  }
  return res.json();
}

export async function deletarArquivoDocumento(documentId: string): Promise<void> {
  const res = await fetch(`/api/documentos/${documentId}/arquivo`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Erro ao remover arquivo");
  }
}
