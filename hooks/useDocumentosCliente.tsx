"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { FileUpload } from "primereact/fileupload";
import { Toast } from "primereact/toast";

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

export interface DocumentoForm {
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

export function useDocumentosCliente(clienteId: string) {
  const toast = useRef<Toast>(null);
  const fileUploadRef = useRef<FileUpload>(null);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [tipos, setTipos] = useState<TipoDocumento[]>([]);
  const [tiposDisponiveis, setTiposDisponiveis] = useState<TipoDocumento[]>([]);
  const [dialogFormAberto, setDialogFormAberto] = useState(false);
  const [dialogDeletar, setDialogDeletar] = useState(false);
  const [documentoSelecionado, setDocumentoSelecionado] = useState<Documento | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [deletando, setDeletando] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [arquivoAtual, setArquivoAtual] = useState<{ url: string; nome: string } | null>(null);
  const [docIdEditando, setDocIdEditando] = useState<string>("");
  const [removendoArquivo, setRemovendoArquivo] = useState(false);
  const [uploadando, setUploadando] = useState(false);
  const [loadingTipos, setLoadingTipos] = useState(false);

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

  const abrirNovo = () => {
    reset(documentoVazio);
    setDocIdEditando("");
    setArquivoAtual(null);
    setPendingFile(null);
    setLoadingTipos(true);
    pesquisarTiposDocumentosDisponiveis(clienteId)
      .then(setTipos)
      .catch(console.error)
      .finally(() => setLoadingTipos(false));
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
    setDocIdEditando(doc.id);
    setArquivoAtual(
      doc.file_url && doc.file_name
        ? { url: doc.file_url, nome: doc.file_name }
        : null,
    );
    setPendingFile(null);
    setLoadingTipos(true);
    pesquisarTiposDocumentosDisponiveis(clienteId, doc.id)
      .then(setTipos)
      .catch(console.error)
      .finally(() => setLoadingTipos(false));
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
        detail: isEdicao
          ? "Documento atualizado com sucesso"
          : "Documento criado com sucesso",
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

  return {
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
  };
}
