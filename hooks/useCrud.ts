"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm, DefaultValues } from "react-hook-form";
import { Toast } from "primereact/toast";

interface SalvarParams<T extends { id: number | string }> {
  criarFn: (item: T) => Promise<unknown>;
  atualizarFn: (id: T["id"], item: T) => Promise<unknown>;
  mensagens?: { criado: string; atualizado: string };
}

interface DeletarParams<T extends { id: number | string }> {
  deletarFn: (id: T["id"]) => Promise<void>;
  mensagem?: string;
}

export function useCrud<T extends { id: number | string }>(itemVazio: T) {
  const router = useRouter();
  const toast = useRef<Toast>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<T>({
    defaultValues: itemVazio as DefaultValues<T>,
  });

  const [itemSelecionado, setItemSelecionado] = useState<T>(itemVazio);
  const [salvando, setSalvando] = useState(false);
  const [deletando, setDeletando] = useState(false);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [dialogDeletar, setDialogDeletar] = useState(false);

  const abrirNovo = () => {
    reset(itemVazio as DefaultValues<T>);
    setDialogAberto(true);
  };

  const fechar = () => {
    reset(itemVazio as DefaultValues<T>);
    setDialogAberto(false);
  };

  const editar = (i: T) => {
    reset(i as DefaultValues<T>);
    setDialogAberto(true);
  };

  const confirmarDeletar = (i: T) => {
    setItemSelecionado(i);
    setDialogDeletar(true);
  };

  const salvar = async (
    data: T,
    {
      criarFn,
      atualizarFn,
      mensagens = { criado: "Registro Criado", atualizado: "Registro Atualizado" },
    }: SalvarParams<T>,
  ) => {
    setSalvando(true);
    try {
      const isEdicao = !!data.id;
      if (isEdicao) {
        await atualizarFn(data.id, data);
      } else {
        await criarFn(data);
      }

      toast.current?.show({
        severity: "success",
        summary: "Sucesso",
        detail: isEdicao ? mensagens.atualizado : mensagens.criado,
        life: 3000,
      });

      fechar();
      router.refresh();
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

  const deletar = async ({
    deletarFn,
    mensagem = "Registro Excluído",
  }: DeletarParams<T>) => {
    if (!itemSelecionado.id) return;

    setDeletando(true);
    try {
      await deletarFn(itemSelecionado.id);

      toast.current?.show({
        severity: "success",
        summary: "Sucesso",
        detail: mensagem,
        life: 3000,
      });

      setDialogDeletar(false);
      setItemSelecionado(itemVazio);
      router.refresh();
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
    editar,
    confirmarDeletar,
    salvar,
    deletar,
  };
}
