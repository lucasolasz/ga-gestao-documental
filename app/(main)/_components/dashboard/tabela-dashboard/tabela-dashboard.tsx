"use client";

import { useState } from "react";
import TabelaGenerica from "@/components/tabelaGenerica";
import DialogDocumentosCliente from "@/app/(main)/clientes/_components/dialog-documentos-cliente";
import { formatDate } from "@/utils/dateUtil";
import { statusBodyTemplate } from "@/app/(main)/_components/dashboard/tabela-dashboard/document-status-template";
import { Documento } from "@/types/entidades-banco/documento";

interface TabelaDashboardProps {
  documentos: Documento[];
  titulo: string;
}

export default function TabelaDashboard({
  documentos,
  titulo,
}: TabelaDashboardProps) {
  const [clienteSelecionado, setClienteSelecionado] = useState<{
    id: string;
    nome: string;
  } | null>(null);

  return (
    <>
      <TabelaGenerica
        value={documentos}
        titulo={titulo}
        selectionMode="single"
        onRowSelect={(doc: Documento) =>
          setClienteSelecionado({ id: doc.client.id, nome: doc.client.nome })
        }
        columns={[
          { field: "client.nome", header: "Nome Cliente", sortable: true },
          { field: "client.cnpj", header: "CNPJ", sortable: true },
          {
            field: "numero",
            header: "Documento",
            sortable: true,
            body: (documento: Documento) =>
              documento.numero || (
                <span className="text-color-secondary">—</span>
              ),
          },
          {
            field: "tipo.descricao",
            header: "Tipo Documento",
            sortable: true,
          },
          {
            field: "data_validade",
            header: "Data Validade",
            sortable: true,
            body: (documento: Documento) => formatDate(documento.data_validade),
          },
          {
            field: "status.statusLabel",
            header: "Status",
            sortable: true,
            body: statusBodyTemplate,
          },
        ]}
      />
      {clienteSelecionado && (
        <DialogDocumentosCliente
          clienteId={clienteSelecionado.id}
          nomeCliente={clienteSelecionado.nome}
          visible={!!clienteSelecionado}
          onHide={() => setClienteSelecionado(null)}
        />
      )}
    </>
  );
}
