"use client";

import {
  useState,
  useMemo,
  ReactNode,
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";
import { DataTable } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";

function flattenToString(obj: any): string {
  if (obj === null || obj === undefined) return "";
  if (typeof obj !== "object") return String(obj);
  return Object.values(obj).map(flattenToString).join(" ");
}

interface TabelaGenericaProps<T> {
  value: T[];
  titulo: string;
  children: ReactNode;
  toolbarEsquerda?: ReactNode;
  toolbarDireita?: ReactNode;
  selection?: any;
  onSelectionChange?: (e: any) => void;
  headerActions?: ReactNode;
  getFilterString?: (row: T) => string;
}

// Usamos forwardRef para permitir que o componente pai acione o exportCSV(), igual ao Sakai
const TabelaGenerica = forwardRef(
  <T extends Record<string, any>>(
    {
      value,
      titulo,
      children,
      toolbarEsquerda,
      toolbarDireita,
      selection,
      onSelectionChange,
      headerActions,
      getFilterString,
    }: TabelaGenericaProps<T>,
    ref: any,
  ) => {
    const [globalFilterValue, setGlobalFilterValue] = useState("");
    const dtRef = useRef<DataTable<any>>(null);

    const filteredValue = useMemo(() => {
      const search = globalFilterValue.trim().toLowerCase();
      if (!search) return value;
      const stringify = getFilterString ?? flattenToString;
      return value.filter((row) =>
        stringify(row).toLowerCase().includes(search),
      );
    }, [value, globalFilterValue, getFilterString]);

    // Expõe os métodos internos do DataTable (como exportCSV) para quem chamar a TabelaGenerica
    useImperativeHandle(ref, () => ({
      exportCSV: () => dtRef.current?.exportCSV(),
    }));

    const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setGlobalFilterValue(e.target.value.replace(",", "."));
    };

    const header = (
      <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center gap-3">
        <h1 className="text-2xl font-bold">{titulo}</h1>
        <div className="flex align-items-center gap-3">
          {headerActions}
          <IconField iconPosition="left">
            <InputIcon className="pi pi-search" />
            <InputText
              value={globalFilterValue}
              onChange={onGlobalFilterChange}
              placeholder="Busca geral..."
            />
          </IconField>
        </div>
      </div>
    );

    return (
      <div className="card p-4">
        {/* Barra de Ferramentas Condicional igual ao Sakai */}
        {(toolbarEsquerda || toolbarDireita) && (
          <div className="flex justify-between items-center mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
            <div>{toolbarEsquerda}</div>
            <div>{toolbarDireita}</div>
          </div>
        )}

        <DataTable
          ref={dtRef}
          value={filteredValue}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25]}
          header={header}
          dataKey="id"
          selection={selection}
          onSelectionChange={onSelectionChange}
          removableSort
          sortMode="multiple"
          showGridlines
          stripedRows
          responsiveLayout="scroll"
          emptyMessage="Nenhum registro encontrado."
        >
          {children}
        </DataTable>
      </div>
    );
  },
);

TabelaGenerica.displayName = "TabelaGenerica";
export default TabelaGenerica;
