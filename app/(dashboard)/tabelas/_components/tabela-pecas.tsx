"use client";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Peca } from "@/types/peca";

interface TabelaPecasProps {
  pecas: Peca[];
}

export default function TabelaPecas({ pecas }: TabelaPecasProps) {
  const precoBody = (row: Peca) =>
    row.preco_venda
      ? row.preco_venda.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })
      : "-";

  return (
    <DataTable
      value={pecas}
      header="Pecas"
      scrollable
      removableSort
      sortMode="multiple"
      showGridlines
      stripedRows
      paginator
      rows={10}
      rowsPerPageOptions={[5, 10, 25, 50]}
    >
      <Column field="codigo" header="Código" sortable filter />
      <Column field="descricao" header="Descrição" sortable filter />
      <Column field="marca" header="Marca" sortable filter />
      <Column field="estoque" header="Estoque" sortable filter />
      <Column header="Preço" body={precoBody} sortable filter />
    </DataTable>
  );
}
