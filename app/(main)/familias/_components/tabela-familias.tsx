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
import { FamiliaDocumento } from "@/types/entidades-banco/familiaDocumento";
import {
  pesquisarFamilias,
  criarFamilia,
  atualizarFamilia,
  deletarFamilia,
} from "@/services/familia-service";

interface TabelaFamiliasProps {
  titulo: string;
}

const familiaVazia: FamiliaDocumento = {
  id: "",
  descricao: "",
};

export default function TabelaFamilias({ titulo }: TabelaFamiliasProps) {
  const {
    items: familias,
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
  } = useCrud<FamiliaDocumento>(familiaVazia, pesquisarFamilias);

  return (
    <>
      <Toast ref={toast} />

      <TabelaGenerica
        value={familias}
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
        titulo="Detalhes da Família de Documento"
        onHide={fechar}
        onSalvar={handleSubmit((data) =>
          salvar(data, {
            criarFn: criarFamilia,
            atualizarFn: atualizarFamilia,
            mensagens: {
              criado: "Família de Documento Criada",
              atualizado: "Família de Documento Atualizada",
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
            deletarFn: deletarFamilia,
            mensagem: "Família de Documento Excluída",
          })
        }
        deletando={deletando}
        descricao={
          <span>
            Tem certeza que deseja excluir a família de documento{" "}
            <b>{itemSelecionado.descricao}</b>?
          </span>
        }
      />
    </>
  );
}
