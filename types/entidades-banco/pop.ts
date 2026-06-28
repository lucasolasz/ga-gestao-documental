import { FamiliaPop } from "./familiaPop";

export interface Pop {
  id: string;
  descricao: string;
  familia_pop_id: string;
  familia_pop?: FamiliaPop;
  created_at?: string;
}
