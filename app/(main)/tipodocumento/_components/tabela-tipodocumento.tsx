"use client";

import { Controller } from "react-hook-form";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { classNames } from "primereact/utils";

import TabelaGenerica from "../../../../components/tabelaGenerica";
import CrudDialog from "../../../../components/crudDialog";
import ConfirmarExclusaoDialog from "../../../../components/confirmarExclusaoDialog";
import { useCrud } from "../../../../hooks/useCrud";
import { TipoDocumento } from "@/types/entidades-banco/tipoDocumento";
import {
  criarTipoDocumento,
  atualizarTipoDocumento,
  deletarTipoDocumento as deletarTipoDocumentoService,
} from "@/services/tipodocumento-service";

interface TabelaTipoDocumentoProps {
  tiposDocumentos: TipoDocumento[];
  titulo: string;
}

const tipoDocumentoVazio: TipoDocumento = {
  id: "",
  descricao: "",
};

export default function TabelaTipoDocumento({
  tiposDocumentos,
  titulo,
}: TabelaTipoDocumentoProps) {
  const {
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
  } = useCrud<TipoDocumento>(tipoDocumentoVazio);

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
