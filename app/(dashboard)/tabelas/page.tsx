"use client";

import { useState, useEffect, Suspense } from "react";
import { pesquisarPecas } from "@/services/peca-service";
import ClientTabelaPecas from "./_components/tabelaPecas";
import { Peca } from "@/types/peca";
import Loading from "./loading";

export default function TabelasPage() {
  const [pecas, setPecas] = useState<Peca[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    pesquisarPecas()
      .then((data) => setPecas(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Suspense fallback={<Loading />}>
      <ClientTabelaPecas pecas={pecas} titulo="Peças" />
    </Suspense>
  );
}
