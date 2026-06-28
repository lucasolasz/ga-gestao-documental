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
import { FamiliaPop } from "@/types/entidades-banco/familiaPop";
import {
  pesquisarFamiliasPop,
  criarFamiliaPop,
  atualizarFamiliaPop,
  deletarFamiliaPop as deletarFamiliaPopService,
} from "@/services/familiapop-service";

interface TabelaFamiliaPopProps {
  titulo: string;
}

const familiaPopVazia: FamiliaPop = {
  id: "",
  descricao: "",
};

export default function TabelaFamiliaPop({ titulo }: TabelaFamiliaPopProps) {
  const {
    items: familiasPop,
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
  } = useCrud<FamiliaPop>(familiaPopVazia, pesquisarFamiliasPop);

  return (
    <>
      <Toast ref={toast} />

      <TabelaGenerica
        value={familiasPop}
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
        titulo="Detalhes da Familia POP"
        onHide={fechar}
        onSalvar={handleSubmit((data) =>
          salvar(data, {
            criarFn: criarFamiliaPop,
            atualizarFn: atualizarFamiliaPop,
            mensagens: {
              criado: "Familia POP Criada",
              atualizado: "Familia POP Atualizada",
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
            deletarFn: deletarFamiliaPopService,
            mensagem: "Familia POP Excluída",
          })
        }
        deletando={deletando}
        descricao={
          <span>
            Tem certeza que deseja excluir a familia POP{" "}
            <b>{itemSelecionado.descricao}</b>?
          </span>
        }
      />
    </>
  );
}
