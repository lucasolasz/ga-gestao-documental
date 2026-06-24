"use client";

import { Controller } from "react-hook-form";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Toast } from "primereact/toast";
import { classNames } from "primereact/utils";

import TabelaGenerica from "../../../../components/tabelaGenerica";
import CrudDialog from "../../../../components/crudDialog";
import ConfirmarExclusaoDialog from "../../../../components/confirmarExclusaoDialog";
import { useCrud } from "../../../../hooks/useCrud";
import { formatCurrency } from "@/utils/numberUtil";
import { Peca } from "@/types/peca";
import {
  criarPeca,
  atualizarPeca,
  deletarPeca as deletarPecaService,
} from "@/services/peca-service";

interface ClientTabelaPecasProps {
  pecas: Peca[];
  titulo: string;
}

const pecaVazia: Peca = {
  id: 0,
  codigo: "",
  descricao: "",
  marca: "",
  estoque: 0,
  preco_custo: 0,
  preco_venda: 0,
};

export default function ClientTabelaPecas({
  pecas,
  titulo,
}: ClientTabelaPecasProps) {
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
  } = useCrud<Peca>(pecaVazia);

  return (
    <>
      <Toast ref={toast} />

      <TabelaGenerica
        value={pecas}
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
          { field: "codigo", header: "Código", sortable: true },
          { field: "descricao", header: "Descrição", sortable: true },
          { field: "marca", header: "Marca", sortable: true },
          { field: "estoque", header: "Estoque", sortable: true },
          {
            header: "Preço custo",
            sortable: true,
            body: (row: Peca) => formatCurrency(row.preco_custo),
          },
          {
            header: "Preço venda",
            sortable: true,
            body: (row: Peca) => formatCurrency(row.preco_venda),
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
        titulo="Detalhes da Peça"
        onHide={fechar}
        onSalvar={handleSubmit((data) =>
          salvar(data, {
            criarFn: criarPeca,
            atualizarFn: atualizarPeca,
            mensagens: { criado: "Peça Criada", atualizado: "Peça Atualizada" },
          }),
        )}
        salvando={salvando}
      >
        <div className="field mb-3">
          <label htmlFor="codigo" className="font-bold">
            Código
          </label>
          <Controller
            name="codigo"
            control={control}
            rules={{ required: "Código é obrigatório" }}
            render={({ field }) => (
              <>
                <InputText
                  id="codigo"
                  {...field}
                  autoFocus
                  className={classNames({ "p-invalid": errors.codigo })}
                />
                {errors.codigo && (
                  <small className="p-error">{errors.codigo.message}</small>
                )}
              </>
            )}
          />
        </div>

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
          <label htmlFor="marca" className="font-bold">
            Marca
          </label>
          <Controller
            name="marca"
            control={control}
            render={({ field }) => (
              <InputText id="marca" {...field} value={field.value ?? ""} />
            )}
          />
        </div>

        <div className="formgrid grid">
          <div className="field col mb-3">
            <label htmlFor="estoque" className="font-bold">
              Estoque
            </label>
            <Controller
              name="estoque"
              control={control}
              render={({ field: { onChange, value, ref } }) => (
                <InputNumber
                  inputRef={ref}
                  inputId="estoque"
                  value={value ?? 0}
                  onValueChange={(e) => onChange(e.value)}
                />
              )}
            />
          </div>
        </div>

        <div className="formgrid grid gap-2">
          <div className="field col mb-3">
            <label htmlFor="preco_custo" className="font-bold">
              Preço Custo
            </label>
            <Controller
              name="preco_custo"
              control={control}
              render={({ field: { onChange, value, ref } }) => (
                <InputNumber
                  inputRef={ref}
                  inputId="preco_custo"
                  value={value ?? 0}
                  onValueChange={(e) => onChange(e.value)}
                  mode="currency"
                  currency="BRL"
                  locale="pt-BR"
                />
              )}
            />
          </div>
          <div className="field col mb-3">
            <label htmlFor="preco_venda" className="font-bold">
              Preço Venda
            </label>
            <Controller
              name="preco_venda"
              control={control}
              render={({ field: { onChange, value, ref } }) => (
                <InputNumber
                  inputRef={ref}
                  inputId="preco_venda"
                  value={value ?? 0}
                  onValueChange={(e) => onChange(e.value)}
                  mode="currency"
                  currency="BRL"
                  locale="pt-BR"
                />
              )}
            />
          </div>
        </div>
      </CrudDialog>

      <ConfirmarExclusaoDialog
        visible={dialogDeletar}
        onHide={() => setDialogDeletar(false)}
        onConfirmar={() =>
          deletar({
            deletarFn: deletarPecaService,
            mensagem: "Peça Excluída",
          })
        }
        deletando={deletando}
        descricao={
          <span>
            Tem certeza que deseja excluir a peça{" "}
            <b>{itemSelecionado.descricao}</b>?
          </span>
        }
      />
    </>
  );
}
