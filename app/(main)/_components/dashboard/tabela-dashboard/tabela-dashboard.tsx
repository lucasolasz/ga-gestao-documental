import TabelaGenerica from "@/components/tabelaGenerica";
import { Documento } from "@/types/document";
import { formatDate } from "@/utils/dateUtil";
import { Column } from "primereact/column";

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
      getFilterString={(documento) =>
        [
          documento.client?.nome,
          documento.client?.cnpj,
          documento.numero,
          documento.tipo?.descricao,
          formatDate(documento.data_validade),
        ]
          .filter(Boolean)
          .join(" ")
      }
    >
      <Column field="client.nome" header="Nome Cliente" sortable />
      <Column field="client.cnpj" header="CNPJ" sortable />
      <Column field="numero" header="Documento" sortable />
      <Column field="tipo.descricao" header="Tipo Documento" sortable />
      <Column field="tipo.descricao" header="Tipo Documento" sortable />
      <Column
        header="Data Validade"
        field="data_validade"
        sortable
        body={(documento: Documento) => formatDate(documento.data_validade)}
      />

      {/* <Column field="descricao" header="Descrição" sortable />
      <Column field="marca" header="Marca" sortable />
      <Column field="estoque" header="Estoque" sortable /> */}
    </TabelaGenerica>
  );
}
