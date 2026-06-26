"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm, DefaultValues } from "react-hook-form";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import React from "react";

interface SalvarParams<T extends { id: number | string }> {
  criarFn: (item: T) => Promise<unknown>;
  atualizarFn: (id: T["id"], item: T) => Promise<unknown>;
  mensagens?: { criado: string; atualizado: string };
}

interface DeletarParams<T extends { id: number | string }> {
  deletarFn: (id: T["id"]) => Promise<void>;
  mensagem?: string;
}

interface UseCrudOptions<T> {
  acoesExtras?: (rowData: T) => React.ReactNode;
}

export function useCrud<T extends { id: number | string }>(
  itemVazio: T,
  fetchFn?: () => Promise<T[]>,
  options?: UseCrudOptions<T>,
) {
  const router = useRouter();
  const toast = useRef<Toast>(null);

  const [items, setItems] = useState<T[] | undefined>(undefined);

  const buscar = useCallback(() => {
    fetchFn?.().then(setItems).catch(console.error);
  }, [fetchFn]);

  useEffect(() => {
    buscar();
  }, [buscar]);

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

  const colunaAcoes = (rowData: T) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-pencil"
        rounded
        severity="success"
        onClick={() => editar(rowData)}
      />
      <Button
        icon="pi pi-trash"
        rounded
        severity="warning"
        onClick={() => confirmarDeletar(rowData)}
      />
      {options?.acoesExtras?.(rowData)}
    </div>
  );

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
      buscar();
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
      buscar();
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
    items,
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
    colunaAcoes,
    salvar,
    deletar,
  };
}
