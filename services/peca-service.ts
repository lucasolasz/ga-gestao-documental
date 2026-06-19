// services/peca-service.ts

import { createClient } from "@/lib/supabase/server";
import { Peca } from "@/types/peca";

export async function buscarPecas(termo: string): Promise<Peca[]> {
  const supabase = await createClient();

  // const { data, error } = await supabase.from('pecas').select('*').ilike('descricao', `%${termo}%`);
  const { data, error } = await supabase.from("pecas").select("*");

  if (error) {
    throw error;
  }

  return data ?? [];
}
