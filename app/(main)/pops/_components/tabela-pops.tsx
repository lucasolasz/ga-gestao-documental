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
import { Pop } from "@/types/entidades-banco/pop";
import { FamiliaPop } from "@/types/entidades-banco/familiaPop";
import { pesquisarPops, criarPop, atualizarPop, deletarPop as deletarPopService } from "@/services/pop-service";
import { pesquisarFamiliasPop } from "@/services/familiapop-service";

interface TabelaPopsProps {
  titulo: string;
}

const popVazio: Pop = {
  id: "",
  descricao: "",
  familia_pop_id: "",
};

export default function TabelaPops({ titulo }: TabelaPopsProps) {
  const [familiasPop, setFamiliasPop] = useState<FamiliaPop[]>([]);

  useEffect(() => {
    pesquisarFamiliasPop().then(setFamiliasPop).catch(console.error);
  }, []);

  const {
    items: pops,
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
  } = useCrud<Pop>(popVazio, pesquisarPops);

  return (
    <>
      <Toast ref={toast} />

      <TabelaGenerica
        value={pops}
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
            header: "Familia POP",
            sortable: false,
            body: (row: Pop) => row.familia_pop?.descricao ?? <span className="text-color-secondary">—</span>,
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
        titulo="Detalhes do POP"
        onHide={fechar}
        onSalvar={handleSubmit((data) =>
          salvar(data, {
            criarFn: criarPop,
            atualizarFn: atualizarPop,
            mensagens: {
              criado: "POP Criado",
              atualizado: "POP Atualizado",
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
          <label htmlFor="familia_pop_id" className="font-bold">
            Familia POP
          </label>
          <Controller
            name="familia_pop_id"
            control={control}
            rules={{ required: "Familia POP é obrigatória" }}
            render={({ field }) => (
              <>
                <Dropdown
                  id="familia_pop_id"
                  value={field.value}
                  onChange={(e) => field.onChange(e.value)}
                  options={familiasPop}
                  optionLabel="descricao"
                  optionValue="id"
                  placeholder="Selecione uma familia POP"
                  filter
                  className={classNames("w-full", { "p-invalid": errors.familia_pop_id })}
                />
                {errors.familia_pop_id && (
                  <small className="p-error">{errors.familia_pop_id.message}</small>
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
            deletarFn: deletarPopService,
            mensagem: "POP Excluído",
          })
        }
        deletando={deletando}
        descricao={
          <span>
            Tem certeza que deseja excluir o POP <b>{itemSelecionado.descricao}</b>?
          </span>
        }
      />
    </>
  );
}
