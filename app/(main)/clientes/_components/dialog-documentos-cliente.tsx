"use client";

import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { classNames } from "primereact/utils";

import ConfirmarExclusaoDialog from "../../../../components/confirmarExclusaoDialog";
import CrudDialog from "../../../../components/crudDialog";
import TabelaGenerica from "../../../../components/tabelaGenerica";
import { statusBodyTemplate } from "../../_components/dashboard/tabela-dashboard/document-status-template";
import {
  atualizarDocumento,
  criarDocumento,
  deletarDocumento,
  pesquisarDocumentos,
} from "@/services/documento-service";
import { pesquisarTiposDocumentos } from "@/services/tipodocumento-service";
import { Documento } from "@/types/entidades-banco/documento";
import { TipoDocumento } from "@/types/entidades-banco/tipoDocumento";
import { formatDate } from "@/utils/dateUtil";

interface Props {
  clienteId: string;
  nomeCliente: string;
  visible: boolean;
  onHide: () => void;
}

interface DocumentoForm {
  id: string;
  numero: string;
  tipo: string;
  data_emissao: string;
  data_validade: string;
}

const documentoVazio: DocumentoForm = {
  id: "",
  numero: "",
  tipo: "",
  data_emissao: "",
  data_validade: "",
};

const toISODate = (d: Date) => d.toLocaleDateString("sv");

const toDate = (iso?: string) =>
  iso ? new Date(iso + "T00:00:00") : null;

export default function DialogDocumentosCliente({
  clienteId,
  nomeCliente,
  visible,
  onHide,
}: Props) {
  const toast = useRef<Toast>(null);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [tipos, setTipos] = useState<TipoDocumento[]>([]);
  const [dialogFormAberto, setDialogFormAberto] = useState(false);
  const [dialogDeletar, setDialogDeletar] = useState(false);
  const [documentoSelecionado, setDocumentoSelecionado] =
    useState<Documento | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [deletando, setDeletando] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DocumentoForm>({ defaultValues: documentoVazio });

  const recarregar = () =>
    pesquisarDocumentos(undefined, clienteId)
      .then(setDocumentos)
      .catch(console.error);

  useEffect(() => {
    recarregar();
  }, [clienteId]);

  useEffect(() => {
    pesquisarTiposDocumentos().then(setTipos).catch(console.error);
  }, []);

  const abrirNovo = () => {
    reset(documentoVazio);
    setDialogFormAberto(true);
  };

  const editar = (doc: Documento) => {
    reset({
      id: doc.id,
      numero: doc.numero,
      tipo: doc.tipo?.id ?? "",
      data_emissao: doc.data_emissao ?? "",
      data_validade: doc.data_validade ?? "",
    });
    setDialogFormAberto(true);
  };

  const fecharForm = () => {
    reset(documentoVazio);
    setDialogFormAberto(false);
  };

  const confirmarDeletar = (doc: Documento) => {
    setDocumentoSelecionado(doc);
    setDialogDeletar(true);
  };

  const onSalvar = async (data: DocumentoForm) => {
    setSalvando(true);
    try {
      const payload = {
        numero: data.numero,
        tipo: data.tipo || undefined,
        data_emissao: data.data_emissao || undefined,
        data_validade: data.data_validade || undefined,
      };

      if (data.id) {
        await atualizarDocumento(data.id, payload);
        toast.current?.show({
          severity: "success",
          summary: "Sucesso",
          detail: "Documento atualizado",
          life: 3000,
        });
      } else {
        await criarDocumento({ ...payload, client_id: clienteId });
        toast.current?.show({
          severity: "success",
          summary: "Sucesso",
          detail: "Documento criado",
          life: 3000,
        });
      }

      fecharForm();
      recarregar();
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "Erro",
        detail: err instanceof Error ? err.message : "Erro desconhecido",
        life: 3000,
      });
    } finally {
      setSalvando(false);
    }
  };

  const onDeletar = async () => {
    if (!documentoSelecionado) return;
    setDeletando(true);
    try {
      await deletarDocumento(documentoSelecionado.id);
      toast.current?.show({
        severity: "success",
        summary: "Sucesso",
        detail: "Documento excluído",
        life: 3000,
      });
      setDialogDeletar(false);
      setDocumentoSelecionado(null);
      recarregar();
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "Erro",
        detail: err instanceof Error ? err.message : "Erro desconhecido",
        life: 3000,
      });
    } finally {
      setDeletando(false);
    }
  };

  const colunaAcoes = (doc: Documento) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-pencil"
        rounded
        severity="success"
        onClick={() => editar(doc)}
      />
      <Button
        icon="pi pi-trash"
        rounded
        severity="warning"
        onClick={() => confirmarDeletar(doc)}
      />
    </div>
  );

  return (
    <>
      <Toast ref={toast} />

      <Dialog
        visible={visible}
        style={{ width: "90%" }}
        header={`Documentos — ${nomeCliente}`}
        modal
        onHide={onHide}
      >
        <TabelaGenerica
          value={documentos}
          titulo="Documentos"
          headerActions={
            <Button
              label="Novo Documento"
              icon="pi pi-plus"
              severity="success"
              onClick={abrirNovo}
            />
          }
          columns={[
            { field: "numero", header: "Número do Documento", sortable: true },
            {
              header: "Tipo do Documento",
              sortable: false,
              body: (row: Documento) => row.tipo?.descricao ?? "—",
            },
            {
              header: "Data Emissão",
              sortable: false,
              body: (row: Documento) => formatDate(row.data_emissao),
            },
            {
              header: "Status",
              sortable: false,
              body: statusBodyTemplate,
            },
            {
              header: "Ações",
              body: colunaAcoes,
              exportable: false,
              style: { minWidth: "10rem" },
            },
          ]}
        />
      </Dialog>

      <CrudDialog
        visible={dialogFormAberto}
        titulo="Detalhes do Documento"
        onHide={fecharForm}
        onSalvar={handleSubmit(onSalvar)}
        salvando={salvando}
      >
        <div className="field mb-3">
          <label htmlFor="numero" className="font-bold">
            Número do Documento
          </label>
          <Controller
            name="numero"
            control={control}
            rules={{ required: "Número é obrigatório" }}
            render={({ field }) => (
              <>
                <InputText
                  id="numero"
                  {...field}
                  autoFocus
                  className={classNames({ "p-invalid": errors.numero })}
                />
                {errors.numero && (
                  <small className="p-error">{errors.numero.message}</small>
                )}
              </>
            )}
          />
        </div>

        <div className="field mb-3">
          <label htmlFor="tipo" className="font-bold">
            Tipo do Documento
          </label>
          <Controller
            name="tipo"
            control={control}
            rules={{ required: "Tipo é obrigatório" }}
            render={({ field }) => (
              <>
                <Dropdown
                  id="tipo"
                  value={field.value}
                  onChange={(e) => field.onChange(e.value)}
                  options={tipos}
                  optionLabel="descricao"
                  optionValue="id"
                  placeholder="Selecione um tipo"
                  filter
                  className={classNames("w-full", { "p-invalid": errors.tipo })}
                />
                {errors.tipo && (
                  <small className="p-error">{errors.tipo.message}</small>
                )}
              </>
            )}
          />
        </div>

        <div className="field mb-3">
          <label htmlFor="data_emissao" className="font-bold">
            Data de Emissão
          </label>
          <Controller
            name="data_emissao"
            control={control}
            render={({ field }) => (
              <Calendar
                id="data_emissao"
                value={toDate(field.value)}
                onChange={(e) =>
                  field.onChange(e.value ? toISODate(e.value as Date) : "")
                }
                dateFormat="dd/mm/yy"
                readOnlyInput={false}
                showIcon
                className="w-full"
              />
            )}
          />
        </div>

        <div className="field mb-3">
          <label htmlFor="data_validade" className="font-bold">
            Data de Validade
          </label>
          <Controller
            name="data_validade"
            control={control}
            render={({ field }) => (
              <Calendar
                id="data_validade"
                value={toDate(field.value)}
                onChange={(e) =>
                  field.onChange(e.value ? toISODate(e.value as Date) : "")
                }
                dateFormat="dd/mm/yy"
                readOnlyInput={false}
                showIcon
                className="w-full"
              />
            )}
          />
        </div>
      </CrudDialog>

      <ConfirmarExclusaoDialog
        visible={dialogDeletar}
        onHide={() => setDialogDeletar(false)}
        onConfirmar={onDeletar}
        deletando={deletando}
        descricao={
          <span>
            Tem certeza que deseja excluir o documento{" "}
            <b>{documentoSelecionado?.numero}</b>?
          </span>
        }
      />
    </>
  );
}
