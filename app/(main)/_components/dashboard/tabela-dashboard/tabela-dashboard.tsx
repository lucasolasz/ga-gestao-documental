import TabelaGenerica from "@/components/tabelaGenerica";
import { Documento } from "@/types/document";
import { formatDate } from "@/utils/dateUtil";

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
      ]}
    />
  );
}
