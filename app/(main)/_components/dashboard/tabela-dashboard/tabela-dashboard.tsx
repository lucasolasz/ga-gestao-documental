import TabelaGenerica from "@/components/tabelaGenerica";

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
  return (
    <TabelaGenerica
      value={documentos}
      titulo={titulo}
      columns={[
        { field: "client.nome", header: "Nome Cliente", sortable: true },
        { field: "client.cnpj", header: "CNPJ", sortable: true },
        { field: "numero", header: "Documento", sortable: true },
        { field: "tipo.descricao", header: "Tipo Documento", sortable: true },
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
  );
}
