"use client";

import { useEffect, useState } from "react";
import { Controller } from "react-hook-form";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { classNames } from "primereact/utils";

import TabelaGenerica from "../../../../components/tabelaGenerica";
import CrudDialog from "../../../../components/crudDialog";
import ConfirmarExclusaoDialog from "../../../../components/confirmarExclusaoDialog";
import { useCrud } from "../../../../hooks/useCrud";
import { TipoDocumento } from "@/types/entidades-banco/tipoDocumento";
import { FamiliaDocumento } from "@/types/entidades-banco/familiaDocumento";
import {
  pesquisarTiposDocumentos,
  criarTipoDocumento,
  atualizarTipoDocumento,
  deletarTipoDocumento as deletarTipoDocumentoService,
} from "@/services/tipodocumento-service";
import { pesquisarFamilias } from "@/services/familia-service";

interface TabelaTipoDocumentoProps {
  titulo: string;
}

const tipoDocumentoVazio: TipoDocumento = {
  id: "",
  descricao: "",
  familia_id: null,
};

export default function TabelaTipoDocumento({
  titulo,
}: TabelaTipoDocumentoProps) {
  const [familias, setFamilias] = useState<FamiliaDocumento[]>([]);

  useEffect(() => {
    pesquisarFamilias().then(setFamilias).catch(console.error);
  }, []);

  const {
    items: tiposDocumentos,
    control,
    handleSubmit,
    errors,
    itemSelecionado,
    salvando,
    deletando,
    dialogAberto,
    dialogDeletar,
    setDialogDeletar,
    toast,
    abrirNovo,
    fechar,
    colunaAcoes,
    salvar,
    deletar,
  } = useCrud<TipoDocumento>(tipoDocumentoVazio, pesquisarTiposDocumentos);

  return (
    <>
      <Toast ref={toast} />

      <TabelaGenerica
        value={tiposDocumentos}
        titulo={titulo}
        headerActions={
          <Button
            label="Novo"
            icon="pi pi-plus"
            severity="success"
            onClick={abrirNovo}
          />
        }
        columns={[
          { field: "descricao", header: "Descrição", sortable: true },
          {
            field: "familias_documentos.descricao",
            header: "Família",
            sortable: true,
            filterValue: (row: TipoDocumento) =>
              row.familias_documentos?.descricao ?? "",
            body: (rowData: TipoDocumento) =>
              rowData.familias_documentos?.descricao ?? (
                <span className="text-color-secondary">—</span>
              ),
          },
          {
            header: "Ações",
            body: colunaAcoes,
            exportable: false,
            style: { minWidth: "12rem" },
          },
        ]}
      />

      <CrudDialog
        visible={dialogAberto}
        titulo="Detalhes do Tipo de Documento"
        onHide={fechar}
        onSalvar={handleSubmit((data) =>
          salvar(data, {
            criarFn: criarTipoDocumento,
            atualizarFn: atualizarTipoDocumento,
            mensagens: {
              criado: "Tipo de Documento Criado",
              atualizado: "Tipo de Documento Atualizado",
            },
          }),
        )}
        salvando={salvando}
      >
        <div className="field mb-3">
          <label htmlFor="descricao" className="font-bold">
            Descrição
          </label>
          <Controller
            name="descricao"
            control={control}
            rules={{ required: "Descrição é obrigatória" }}
            render={({ field }) => (
              <>
                <InputText
                  id="descricao"
                  {...field}
                  autoFocus
                  className={classNames({ "p-invalid": errors.descricao })}
                />
                {errors.descricao && (
                  <small className="p-error">{errors.descricao.message}</small>
                )}
              </>
            )}
          />
        </div>

        <div className="field mb-3">
          <label htmlFor="familia_id" className="font-bold">
            Família
          </label>
          <Controller
            name="familia_id"
            control={control}
            rules={{ required: "Família é obrigatória" }}
            render={({ field }) => (
              <>
                <Dropdown
                  id="familia_id"
                  value={field.value}
                  onChange={(e) => field.onChange(e.value)}
                  options={familias}
                  optionLabel="descricao"
                  optionValue="id"
                  placeholder="Selecione uma família"
                  className={classNames({ "p-invalid": errors.familia_id })}
                />
                {errors.familia_id && (
                  <small className="p-error">{errors.familia_id.message}</small>
                )}
              </>
            )}
          />
        </div>
      </CrudDialog>

      <ConfirmarExclusaoDialog
        visible={dialogDeletar}
        onHide={() => setDialogDeletar(false)}
        onConfirmar={() =>
          deletar({
            deletarFn: deletarTipoDocumentoService,
            mensagem: "Tipo de Documento Excluído",
          })
        }
        deletando={deletando}
        descricao={
          <span>
            Tem certeza que deseja excluir o tipo de documento{" "}
            <b>{itemSelecionado.descricao}</b>?
          </span>
        }
      />
    </>
  );
}
