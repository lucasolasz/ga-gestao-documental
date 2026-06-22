"use client";

import { pesquisarPecas } from "@/services/peca-service";
import { Peca } from "@/types/peca";
import { useEffect, useState } from "react";
import ClientTabelaPecas from "./_components/tabelaPecas";

export default function TabelasPage() {
  const [pecas, setPecas] = useState<Peca[]>([]);

  useEffect(() => {
    pesquisarPecas()
      .then((data) => setPecas(data))
      .catch((err) => console.error(err));
  }, []);

  return <ClientTabelaPecas pecas={pecas} titulo="Peças" />;
}
