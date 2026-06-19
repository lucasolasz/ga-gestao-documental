// app/tabelas/page.tsx

import { buscarPecas } from "@/services/peca-service";
import TabelaPecas from "./_components/tabela-pecas";

export default async function TabelasPage() {
  const pecas = await buscarPecas("");

  return (
    <>
      <h1 className="text-2xl mb-4">Peças</h1>
      <TabelaPecas pecas={pecas} />
    </>
  );
}
