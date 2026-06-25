"use client";

import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { FileUpload, FileUploadSelectEvent } from "primereact/fileupload";
import { InputText } from "primereact/inputtext";
import { Panel } from "primereact/panel";
import { ProgressBar } from "primereact/progressbar";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import { classNames } from "primereact/utils";

import ConfirmarExclusaoDialog from "../../../../components/confirmarExclusaoDialog";
import CrudDialog from "../../../../components/crudDialog";
import TabelaGenerica from "../../../../components/tabelaGenerica";
import { statusBodyTemplate } from "../../_components/dashboard/tabela-dashboard/document-status-template";
import {
  atualizarDocumento,
  criarDocumento,
  deletarArquivoDocumento,
  deletarDocumento,
  pesquisarDocumentos,
  uploadArquivoDocumento,
} from "@/services/documento-service";
import { pesquisarTiposDocumentosDisponiveis } from "@/services/tipodocumento-service";
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

const toDate = (iso?: string) => (iso ? new Date(iso + "T00:00:00") : null);

export default function DialogDocumentosCliente({
  clienteId,
  nomeCliente,
  visible,
  onHide,
}: Props) {
  const toast = useRef<Toast>(null);
  const fileUploadRef = useRef<FileUpload>(null);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [tipos, setTipos] = useState<TipoDocumento[]>([]);
  const [dialogFormAberto, setDialogFormAberto] = useState(false);
  const [dialogDeletar, setDialogDeletar] = useState(false);
  const [documentoSelecionado, setDocumentoSelecionado] =
    useState<Documento | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [deletando, setDeletando] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [arquivoAtual, setArquivoAtual] = useState<{
    url: string;
    nome: string;
  } | null>(null);
  const [docIdEditando, setDocIdEditando] = useState<string>("");
  const [removendoArquivo, setRemovendoArquivo] = useState(false);
  const [uploadando, setUploadando] = useState(false);
  const [tiposDisponiveis, setTiposDisponiveis] = useState<TipoDocumento[]>([]);
  const [painelExpandido, setPainelExpandido] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DocumentoForm>({ defaultValues: documentoVazio });

  const recarregarTiposDisponiveis = () =>
    pesquisarTiposDocumentosDisponiveis(clienteId)
      .then(setTiposDisponiveis)
      .catch(console.error);

  const recarregar = () => {
    pesquisarDocumentos(undefined, clienteId, true)
      .then(setDocumentos)
      .catch(console.error);
    recarregarTiposDisponiveis();
  };

  useEffect(() => {
    recarregar();
  }, [clienteId]);

  const abrirNovo = async () => {
    reset(documentoVazio);
    setDocIdEditando("");
    setArquivoAtual(null);
    setPendingFile(null);
    pesquisarTiposDocumentosDisponiveis(clienteId)
      .then(setTipos)
      .catch(console.error);
    setDialogFormAberto(true);
  };

  const editar = async (doc: Documento) => {
    reset({
      id: doc.id,
      numero: doc.numero,
      tipo: doc.tipo?.id ?? "",
      data_emissao: doc.data_emissao ?? "",
      data_validade: doc.data_validade ?? "",
    });
    setDocIdEditando(doc.id);
    setArquivoAtual(
      doc.file_url && doc.file_name
        ? { url: doc.file_url, nome: doc.file_name }
        : null,
    );
    setPendingFile(null);
    pesquisarTiposDocumentosDisponiveis(clienteId, doc.id)
      .then(setTipos)
      .catch(console.error);
    setDialogFormAberto(true);
  };

  const fecharForm = () => {
    reset(documentoVazio);
    setDocIdEditando("");
    setArquivoAtual(null);
    setPendingFile(null);
    fileUploadRef.current?.clear();
    setDialogFormAberto(false);
  };

  const confirmarDeletar = (doc: Documento) => {
    setDocumentoSelecionado(doc);
    setDialogDeletar(true);
  };

  const removerArquivo = async () => {
    if (!docIdEditando) return;
    setRemovendoArquivo(true);
    try {
      await deletarArquivoDocumento(docIdEditando);
      setArquivoAtual(null);
      recarregar();
      toast.current?.show({
        severity: "success",
        summary: "Sucesso",
        detail: "Arquivo removido",
        life: 3000,
      });
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "Erro",
        detail: err instanceof Error ? err.message : "Erro desconhecido",
        life: 3000,
      });
    } finally {
      setRemovendoArquivo(false);
    }
  };

  const onSalvar = async (data: DocumentoForm) => {
    setSalvando(true);
    const isEdicao = !!data.id;
    try {
      const payload = {
        numero: data.numero,
        tipo: data.tipo || undefined,
        data_emissao: data.data_emissao || undefined,
        data_validade: data.data_validade || undefined,
      };

      let docId: string;

      if (isEdicao) {
        await atualizarDocumento(data.id, payload);
        docId = data.id;
      } else {
        const novo = await criarDocumento({ ...payload, client_id: clienteId });
        docId = novo.id;
      }

      if (pendingFile) {
        setUploadando(true);
        try {
          await uploadArquivoDocumento(docId, pendingFile);
        } finally {
          setUploadando(false);
        }
      }

      toast.current?.show({
        severity: "success",
        summary: "Sucesso",
        detail: isEdicao ? "Documento atualizado com sucesso" : "Documento criado com sucesso",
        life: 3000,
      });

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

  const colunaArquivo = (doc: Documento) => {
    if (!doc.file_url) return <span className="text-color-secondary">—</span>;
    return (
      <a
        href={doc.file_url}
        target="_blank"
        rel="noopener noreferrer"
        title={doc.file_name}
      >
        <Tag
          severity="info"
          icon="pi pi-file"
          value={doc.file_name}
          className="cursor-pointer"
        />
      </a>
    );
  };

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
        {(() => {
          const LIMIT = 10;
          const tiposPreenchidos = documentos
            .map((d) => d.tipo)
            .filter((t): t is TipoDocumento => !!t);
          const preenchidosVisiveis = painelExpandido
            ? tiposPreenchidos
            : tiposPreenchidos.slice(0, LIMIT);
          const faltandoVisiveis = painelExpandido
            ? tiposDisponiveis
            : tiposDisponiveis.slice(0, LIMIT);
          const totalOculto =
            Math.max(0, tiposPreenchidos.length - LIMIT) +
            Math.max(0, tiposDisponiveis.length - LIMIT);
          const temMais = totalOculto > 0;

          return (
            <Panel header="Cobertura Documental" toggleable className="mb-3">
              <div className="grid">
                <div className="col-6">
                  <span className="font-bold text-sm">
                    Preenchidos ({tiposPreenchidos.length})
                  </span>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {preenchidosVisiveis.map((t) => (
                      <Tag key={t.id} value={t.descricao} severity="success" />
                    ))}
                    {tiposPreenchidos.length === 0 && (
                      <span className="text-color-secondary text-sm">Nenhum</span>
                    )}
                  </div>
                </div>
                <div className="col-6">
                  <span className="font-bold text-sm">
                    Faltando ({tiposDisponiveis.length})
                  </span>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {faltandoVisiveis.map((t) => (
                      <Tag key={t.id} value={t.descricao} severity="primary" />
                    ))}
                    {tiposDisponiveis.length === 0 && (
                      <span className="text-color-secondary text-sm">Nenhum</span>
                    )}
                  </div>
                </div>
              </div>
              {temMais && (
                <div className="mt-2">
                  <Button
                    label={
                      painelExpandido
                        ? "Ver menos"
                        : `Ver mais +${totalOculto} tipos`
                    }
                    link
                    icon={
                      painelExpandido
                        ? "pi pi-chevron-up"
                        : "pi pi-chevron-down"
                    }
                    iconPos="right"
                    type="button"
                    onClick={() => setPainelExpandido((p) => !p)}
                    className="p-0 text-sm"
                  />
                </div>
              )}
            </Panel>
          );
        })()}

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
              header: "Arquivo",
              sortable: false,
              body: colunaArquivo,
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
                mask="99/99/9999"
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
                mask="99/99/9999"
                readOnlyInput={false}
                showIcon
                className="w-full"
              />
            )}
          />
        </div>

        <div className="field mb-3">
          <label className="font-bold block mb-2">Arquivo</label>
          {arquivoAtual && (
            <div className="flex align-items-center gap-2 mb-2">
              <i className="pi pi-paperclip text-color-secondary text-sm" />
              <a
                href={arquivoAtual.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline text-sm flex-1 white-space-nowrap overflow-hidden text-overflow-ellipsis"
                title={arquivoAtual.nome}
              >
                {arquivoAtual.nome}
              </a>
              <Button
                icon="pi pi-times"
                rounded
                text
                severity="danger"
                size="small"
                type="button"
                loading={removendoArquivo}
                onClick={removerArquivo}
                tooltip="Remover arquivo"
                tooltipOptions={{ position: "left" }}
              />
            </div>
          )}
          <FileUpload
            ref={fileUploadRef}
            mode="advanced"
            multiple={false}
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            maxFileSize={30 * 1024 * 1024}
            auto={false}
            chooseLabel="Selecionar arquivo"
            cancelLabel="Cancelar"
            uploadOptions={{ className: "hidden" }}
            onSelect={(e: FileUploadSelectEvent) => setPendingFile(e.files[0])}
            onClear={() => setPendingFile(null)}
            onRemove={() => setPendingFile(null)}
            emptyTemplate={
              <p className="m-0 text-color-secondary text-sm">
                Arraste um arquivo ou clique para selecionar
              </p>
            }
          />
          {uploadando && (
            <ProgressBar mode="indeterminate" className="mt-2" style={{ height: "4px" }} />
          )}
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
