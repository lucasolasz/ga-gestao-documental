"use client";

import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputMask } from "primereact/inputmask";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { classNames } from "primereact/utils";
import { useEffect, useState } from "react";
import { Controller } from "react-hook-form";

import { formatDate } from "@/utils/dateUtil";
import { pesquisarCategorias } from "@/services/categoria-service";
import {
  atualizarCliente,
  ClienteForm,
  criarCliente,
  deletarCliente as deletarClienteService,
  pesquisarClientes,
} from "@/services/cliente-service";
import { Categoria } from "@/types/entidades-banco/categoria";
import { Client } from "@/types/entidades-banco/client";
import ConfirmarExclusaoDialog from "../../../../components/confirmarExclusaoDialog";
import CrudDialog from "../../../../components/crudDialog";
import TabelaGenerica from "../../../../components/tabelaGenerica";
import { useCrud } from "../../../../hooks/useCrud";
import DialogDocumentosCliente from "./dialog-documentos-cliente";

interface TabelaClientesProps {
  titulo: string;
}

const clienteVazio: ClienteForm = {
  id: "",
  nome: "",
  cnpj: "",
  telefone: "",
  categoria_id: "",
};

export default function TabelaClientes({ titulo }: TabelaClientesProps) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [clienteParaDocumentos, setClienteParaDocumentos] =
    useState<Client | null>(null);
  const [dialogDocumentosVisivel, setDialogDocumentosVisivel] = useState(false);

  useEffect(() => {
    pesquisarCategorias().then(setCategorias).catch(console.error);
  }, []);

  const {
    items: clientes,
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
  } = useCrud<ClienteForm>(clienteVazio, pesquisarClientes, {
    acoesExtras: (row) => (
      <Button
        icon="pi pi-folder-open"
        rounded
        severity="info"
        tooltip="Documentos"
        onClick={() => {
          setClienteParaDocumentos(row as unknown as Client);
          setDialogDocumentosVisivel(true);
        }}
      />
    ),
  });

  return (
    <>
      <Toast ref={toast} />

      <TabelaGenerica
        value={clientes}
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
          { field: "nome", header: "Nome", sortable: true },
          {
            header: "Categoria",
            sortable: false,
            body: (row: ClienteForm) => row.categoria?.descricao ?? "—",
          },
          {
            header: "Documentos",
            sortable: false,
            body: (row: ClienteForm) =>
              `${row.documentos_count ?? 0}/${row.tipos_categoria_count ?? 0}`,
          },
          { field: "cnpj", header: "CNPJ", sortable: true },
          { field: "telefone", header: "Telefone", sortable: false },
          {
            header: "Cadastrado em",
            sortable: true,
            body: (row: ClienteForm) => formatDate(row.created_at) || "—",
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
        titulo="Detalhes do Cliente"
        onHide={fechar}
        onSalvar={handleSubmit((data) =>
          salvar(data, {
            criarFn: criarCliente,
            atualizarFn: atualizarCliente,
            mensagens: {
              criado: "Cliente Criado",
              atualizado: "Cliente Atualizado",
            },
          }),
        )}
        salvando={salvando}
      >
        <div className="field mb-3">
          <label htmlFor="nome" className="font-bold">
            Nome
          </label>
          <Controller
            name="nome"
            control={control}
            rules={{ required: "Nome é obrigatório" }}
            render={({ field }) => (
              <>
                <InputText
                  id="nome"
                  {...field}
                  autoFocus
                  className={classNames({ "p-invalid": errors.nome })}
                />
                {errors.nome && (
                  <small className="p-error">{errors.nome.message}</small>
                )}
              </>
            )}
          />
        </div>

        <div className="field mb-3">
          <label htmlFor="cnpj" className="font-bold">
            CNPJ
          </label>
          <Controller
            name="cnpj"
            control={control}
            rules={{ required: "CNPJ é obrigatório" }}
            render={({ field }) => (
              <>
                <InputMask
                  id="cnpj"
                  mask="99.999.999/9999-99"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.value)}
                  className={classNames({ "p-invalid": errors.cnpj })}
                />
                {errors.cnpj && (
                  <small className="p-error">{errors.cnpj.message}</small>
                )}
              </>
            )}
          />
        </div>

        <div className="field mb-3">
          <label htmlFor="telefone" className="font-bold">
            Telefone
          </label>
          <Controller
            name="telefone"
            control={control}
            render={({ field }) => (
              <InputMask
                id="telefone"
                mask="(99) 99999-9999"
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.value)}
              />
            )}
          />
        </div>

        <div className="field mb-3">
          <label htmlFor="categoria_id" className="font-bold">
            Categoria
          </label>
          <Controller
            name="categoria_id"
            control={control}
            render={({ field }) => (
              <Dropdown
                id="categoria_id"
                value={field.value}
                onChange={(e) => field.onChange(e.value)}
                options={categorias}
                optionLabel="descricao"
                optionValue="id"
                placeholder="Selecione uma categoria"
                filter
                className="w-full"
              />
            )}
          />
        </div>
      </CrudDialog>

      <ConfirmarExclusaoDialog
        visible={dialogDeletar}
        onHide={() => setDialogDeletar(false)}
        onConfirmar={() =>
          deletar({
            deletarFn: deletarClienteService,
            mensagem: "Cliente Excluído",
          })
        }
        deletando={deletando}
        descricao={
          <span>
            Tem certeza que deseja excluir o cliente{" "}
            <b>{itemSelecionado.nome}</b>?
          </span>
        }
      />

      {clienteParaDocumentos && (
        <DialogDocumentosCliente
          key={clienteParaDocumentos.id}
          clienteId={clienteParaDocumentos.id}
          nomeCliente={clienteParaDocumentos.nome}
          visible={dialogDocumentosVisivel}
          onHide={() => setDialogDocumentosVisivel(false)}
        />
      )}
    </>
  );
}
