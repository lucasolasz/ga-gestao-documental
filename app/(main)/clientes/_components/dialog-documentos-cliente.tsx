"use client";

import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { FileUpload, FileUploadSelectEvent } from "primereact/fileupload";
import { InputText } from "primereact/inputtext";
import { ProgressBar } from "primereact/progressbar";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import { classNames } from "primereact/utils";
import { Controller } from "react-hook-form";

import { useDocumentosCliente } from "@/hooks/useDocumentosCliente";
import { Documento } from "@/types/entidades-banco/documento";
import { formatDate } from "@/utils/dateUtil";
import ConfirmarExclusaoDialog from "../../../../components/confirmarExclusaoDialog";
import CrudDialog from "../../../../components/crudDialog";
import TabelaGenerica from "../../../../components/tabelaGenerica";
import { statusBodyTemplate } from "../../_components/dashboard/tabela-dashboard/document-status-template";
import PainelCoberturaDocumental from "./painel-cobertura-documental";

interface Props {
  clienteId: string;
  nomeCliente: string;
  visible: boolean;
  onHide: () => void;
}

const toISODate = (d: Date) => d.toLocaleDateString("sv");
const toDate = (iso?: string) => (iso ? new Date(iso + "T00:00:00") : null);

export default function DialogDocumentosCliente({
  clienteId,
  nomeCliente,
  visible,
  onHide,
}: Props) {
  const {
    toast,
    fileUploadRef,
    documentos,
    tipos,
    tiposDisponiveis,
    dialogFormAberto,
    dialogDeletar,
    setDialogDeletar,
    documentoSelecionado,
    salvando,
    deletando,
    removendoArquivo,
    uploadando,
    loadingTipos,
    pendingFile,
    setPendingFile,
    arquivoAtual,
    control,
    handleSubmit,
    errors,
    abrirNovo,
    editar,
    fecharForm,
    confirmarDeletar,
    removerArquivo,
    onSalvar,
    onDeletar,
  } = useDocumentosCliente(clienteId);

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
        <PainelCoberturaDocumental
          documentos={documentos}
          tiposDisponiveis={tiposDisponiveis}
        />

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
            {
              header: "Número do Documento",
              sortable: true,
              body: (row: Documento) =>
                row.numero || <span className="text-color-secondary">—</span>,
            },
            {
              header: "Tipo do Documento",
              sortable: false,
              body: (row: Documento) => row.tipo?.descricao ?? "—",
            },
            {
              header: "Data Emissão",
              sortable: false,
              body: (row: Documento) =>
                formatDate(row.data_emissao) || (
                  <span className="text-color-secondary">—</span>
                ),
            },
            {
              header: "Data de Validade",
              sortable: false,
              body: (row: Documento) =>
                row.data_validade ? (
                  formatDate(row.data_validade)
                ) : (
                  <Tag
                    severity="secondary"
                    icon="pi pi-question-circle"
                    value="Indefinida"
                  />
                ),
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
            render={({ field }) => (
              <InputText id="numero" {...field} autoFocus />
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
                  loading={loadingTipos}
                  disabled={loadingTipos}
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
              <i className="pi pi-paperclip text-color-secondary text-md" />
              <a
                href={arquivoAtual.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline text-md flex-1 white-space-nowrap overflow-hidden text-overflow-ellipsis"
                title={arquivoAtual.nome}
              >
                {arquivoAtual.nome}
              </a>
              <div>
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
                  label="Excluir"
                />
              </div>
            </div>
          )}
          {!arquivoAtual && (
            <>
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
                onSelect={(e: FileUploadSelectEvent) =>
                  setPendingFile(e.files[0])
                }
                onClear={() => setPendingFile(null)}
                onRemove={() => setPendingFile(null)}
                emptyTemplate={
                  <p className="m-0 text-color-secondary text-sm">
                    Arraste um arquivo ou clique para selecionar
                  </p>
                }
              />
              {uploadando && (
                <ProgressBar
                  mode="indeterminate"
                  className="mt-2"
                  style={{ height: "4px" }}
                />
              )}
            </>
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
