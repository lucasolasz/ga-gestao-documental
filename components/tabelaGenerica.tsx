"use client";

import {
  useState,
  useMemo,
  ReactNode,
  forwardRef,
  useImperativeHandle,
  useRef,
  CSSProperties,
} from "react";
import PrimeReact, { addLocale } from "primereact/api";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import ptBR from "primelocale/pt-BR.json";

addLocale("pt-BR", ptBR["pt-BR"]);
PrimeReact.locale = "pt-BR";

export interface ColumnDef<T> {
  field?: string;
  header?: string;
  sortable?: boolean;
  body?: (row: T) => ReactNode;
  filterValue?: (row: T) => string;
  exportable?: boolean;
  style?: CSSProperties;
  selectionMode?: "single" | "multiple";
}

interface TabelaGenericaProps<T> {
  value: T[] | undefined;
  titulo: string;
  columns: ColumnDef<T>[];
  toolbarEsquerda?: ReactNode;
  toolbarDireita?: ReactNode;
  selection?: any;
  onSelectionChange?: (e: any) => void;
  headerActions?: ReactNode;
  selectionMode?: "single" | "multiple";
  onRowSelect?: (row: T) => void;
}

function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((acc, key) => acc?.[key], obj);
}

const TabelaGenerica = forwardRef(
  <T extends Record<string, any>>(
    {
      value,
      titulo,
      columns,
      toolbarEsquerda,
      toolbarDireita,
      selection,
      onSelectionChange,
      headerActions,
      selectionMode,
      onRowSelect,
    }: TabelaGenericaProps<T>,
    ref: any,
  ) => {
    const [globalFilterValue, setGlobalFilterValue] = useState("");
    const dtRef = useRef<DataTable<any>>(null);

    useImperativeHandle(ref, () => ({
      exportCSV: () => dtRef.current?.exportCSV(),
    }));

    const filteredValue = useMemo(() => {
      if (value === undefined) return [];
      const search = globalFilterValue.trim().toLowerCase();
      if (!search) return value;

      return value.filter((row) => {
        const parts: string[] = [];
        for (const col of columns) {
          if (col.filterValue) {
            parts.push(col.filterValue(row));
          } else if (col.body) {
            const result = col.body(row);
            if (typeof result === "string" || typeof result === "number") {
              parts.push(String(result));
            }
            // JSX result (e.g. action buttons): ignored in filter
          } else if (col.field) {
            const val = getNestedValue(row, col.field);
            if (val != null) parts.push(String(val));
          }
        }
        return parts.join(" ").toLowerCase().includes(search);
      });
    }, [value, globalFilterValue, columns]);

    const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setGlobalFilterValue(e.target.value.replace(",", "."));
    };

    const header = (
      <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center gap-3">
        <h1 className="text-2xl font-bold">{titulo}</h1>
        <div className="flex flex-column sm:flex-row md:align-items-center gap-3 w-full md:w-auto">
          {headerActions}
          <IconField iconPosition="left">
            <InputIcon className="pi pi-search" />
            <InputText
              value={globalFilterValue}
              onChange={onGlobalFilterChange}
              placeholder="Busca geral..."
              className="w-full sm:w-auto"
            />
          </IconField>
        </div>
      </div>
    );

    const footer = globalFilterValue.trim()
      ? `Exibindo ${filteredValue.length} de ${value?.length ?? 0} registro(s)`
      : `Total: ${value?.length ?? 0} registro(s)`;

    return (
      <div className="card p-4">
        {(toolbarEsquerda || toolbarDireita) && (
          <div className="flex justify-between items-center mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
            <div>{toolbarEsquerda}</div>
            <div>{toolbarDireita}</div>
          </div>
        )}

        <DataTable
          ref={dtRef}
          value={filteredValue}
          loading={value === undefined}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25]}
          header={header}
          footer={footer}
          dataKey="id"
          selection={selection}
          onSelectionChange={onSelectionChange}
          {...(selectionMode && {
            selectionMode,
            cellSelection: false,
            metaKeySelection: false,
            onRowSelect: onRowSelect
              ? (e: any) => onRowSelect(e.data)
              : undefined,
          })}
          removableSort
          sortMode="multiple"
          showGridlines
          stripedRows
          responsiveLayout="scroll"
          emptyMessage="Nenhum registro encontrado."
        >
          {columns.map((col, i) => (
            <Column
              key={col.field ?? col.header ?? i}
              field={col.field}
              header={col.header}
              sortable={col.sortable}
              body={col.body}
              exportable={col.exportable}
              style={col.style}
              selectionMode={col.selectionMode}
            />
          ))}
        </DataTable>
      </div>
    );
  },
);

TabelaGenerica.displayName = "TabelaGenerica";

export default TabelaGenerica as <T extends Record<string, any>>(
  props: TabelaGenericaProps<T> & {
    ref?: React.Ref<{ exportCSV: () => void }>;
  },
) => React.ReactElement;
