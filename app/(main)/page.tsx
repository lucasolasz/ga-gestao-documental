"use client";

import { pesquisarDocumentos } from "@/services/documento-service";
import { Documento } from "@/types/documento";
import { StatusType } from "@/types/documento-status";

import { useEffect, useMemo, useState } from "react";
import TabelaDashboard from "./_components/dashboard/tabela-dashboard/tabela-dashboard";
import SummaryCards from "./_components/dashboard/summary-cards/summary-cards";

const Dashboard = () => {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [activeStatus, setActiveStatus] = useState<StatusType | null>(null);

  useEffect(() => {
    pesquisarDocumentos()
      .then((data) => setDocumentos(data))
      .catch((err) => console.error(err));
  }, []);

  const summary = useMemo(
    () => ({
      expired: documentos.filter((d) => d.status?.status === "expired").length,
      critical: documentos.filter((d) => d.status?.status === "critical")
        .length,
      warning: documentos.filter((d) => d.status?.status === "warning").length,
      ok: documentos.filter((d) => d.status?.status === "ok").length,
    }),
    [documentos],
  );

  const documentosFiltrados = useMemo(() => {
    if (!activeStatus) return documentos;
    return documentos.filter((d) => d.status?.status === activeStatus);
  }, [documentos, activeStatus]);

  const titulo = activeStatus
    ? `Documentos: ${activeStatus === "expired" ? "Vencidos" : activeStatus === "critical" ? "Críticos" : activeStatus === "warning" ? "A Vencer" : "Válidos"}`
    : "Todos os Documentos";

  return (
    <div>
      <SummaryCards
        summary={summary}
        activeStatus={activeStatus}
        onStatusClick={setActiveStatus}
      />
      <TabelaDashboard documentos={documentosFiltrados} titulo={titulo} />
    </div>
  );
};

export default Dashboard;
