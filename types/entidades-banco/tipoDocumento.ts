import { FamiliaDocumento } from "./familiaDocumento";

export interface TipoDocumento {
  id: string;
  descricao: string;
  familia_id?: string | null;
  familias_documentos?: Pick<FamiliaDocumento, "id" | "descricao"> | null;
  created_at?: string;
}
