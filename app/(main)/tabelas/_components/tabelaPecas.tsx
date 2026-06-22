"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Toast } from "primereact/toast";
import { classNames } from "primereact/utils";

import TabelaGenerica from "../../../../components/tabelaGenerica";
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

export default function ClientTabelaPecas({
  pecas,
  titulo,
}: ClientTabelaPecasProps) {
  const router = useRouter();

  const pecaVazia: Peca = {
    id: 0,
    codigo: "",
    descricao: "",
    marca: "",
    estoque: 0,
    preco_custo: 0,
    preco_venda: 0,
  };

  const [peca, setPeca] = useState<Peca>(pecaVazia);
  const [submetido, setSubmetido] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [deletando, setDeletando] = useState(false);

  const [dialogPeca, setDialogPeca] = useState(false);
  const [dialogDeletarPeca, setDialogDeletarPeca] = useState(false);

  const toast = useRef<Toast>(null);

  const abrirNovo = () => {
    setPeca(pecaVazia);
    setSubmetido(false);
    setDialogPeca(true);
  };

  const esconderDialog = () => {
    setSubmetido(false);
    setDialogPeca(false);
  };

  const editarPeca = (item: Peca) => {
    setPeca({ ...item });
    setDialogPeca(true);
  };

  const confirmarDeletarPeca = (item: Peca) => {
    setPeca(item);
    setDialogDeletarPeca(true);
  };

  const salvarPeca = async () => {
    setSubmetido(true);

    if (!peca.descricao?.trim() || !peca.codigo?.trim()) {
      return;
    }

    setSalvando(true);

    try {
      const isEdicao = peca.id > 0;

      if (isEdicao) {
        await atualizarPeca(peca.id, peca);
      } else {
        await criarPeca(peca);
      }

      toast.current?.show({
        severity: "success",
        summary: "Sucesso",
        detail: isEdicao ? "Peça Atualizada" : "Peça Criada",
        life: 3000,
      });

      setDialogPeca(false);
      setPeca(pecaVazia);
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

  const deletarPeca = async () => {
    if (!peca.id) return;

    setDeletando(true);

    try {
      await deletarPecaService(peca.id);

      toast.current?.show({
        severity: "success",
        summary: "Sucesso",
        detail: "Peça Excluída",
        life: 3000,
      });

      setDialogDeletarPeca(false);
      setPeca(pecaVazia);
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

  const onInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    name: string,
  ) => {
    const val = e.target.value || "";
    setPeca((prev) => ({ ...prev, [name]: val }));
  };

  const onInputNumberChange = (
    val: number | null | undefined,
    name: string,
  ) => {
    setPeca((prev) => ({ ...prev, [name]: val || 0 }));
  };

  const colunaAcoesTemplate = (rowData: Peca) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-pencil"
        rounded
        severity="success"
        onClick={() => editarPeca(rowData)}
      />
      <Button
        icon="pi pi-trash"
        rounded
        severity="warning"
        onClick={() => confirmarDeletarPeca(rowData)}
      />
    </div>
  );

  const rodapeDialogPeca = (
    <>
      <Button
        label="Cancelar"
        icon="pi pi-times"
        text
        onClick={esconderDialog}
        disabled={salvando}
      />
      <Button
        label="Salvar"
        icon="pi pi-check"
        text
        onClick={salvarPeca}
        loading={salvando}
      />
    </>
  );

  const rodapeDeletarPeca = (
    <>
      <Button
        label="Não"
        icon="pi pi-times"
        text
        onClick={() => setDialogDeletarPeca(false)}
        disabled={deletando}
      />
      <Button
        label="Sim"
        icon="pi pi-check"
        text
        onClick={deletarPeca}
        loading={deletando}
      />
    </>
  );

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
      >
        <Column field="codigo" header="Código" sortable />
        <Column field="descricao" header="Descrição" sortable />
        <Column field="marca" header="Marca" sortable />
        <Column field="estoque" header="Estoque" sortable />
        <Column
          header="Preço custo"
          sortable
          body={(row: Peca) => formatCurrency(row.preco_custo)}
        />
        <Column
          header="Preço venda"
          sortable
          body={(row: Peca) => formatCurrency(row.preco_venda)}
        />
        <Column
          header="Ações"
          body={colunaAcoesTemplate}
          exportable={false}
          style={{ minWidth: "12rem" }}
        ></Column>
      </TabelaGenerica>

      <Dialog
        visible={dialogPeca}
        style={{ width: "450px" }}
        header="Detalhes da Peça"
        modal
        className="p-fluid"
        footer={rodapeDialogPeca}
        onHide={esconderDialog}
      >
        <div className="field mb-3">
          <label htmlFor="codigo" className="font-bold">
            Código
          </label>
          <InputText
            id="codigo"
            value={peca.codigo}
            onChange={(e) => onInputChange(e, "codigo")}
            required
            autoFocus
            className={classNames({ "p-invalid": submetido && !peca.codigo })}
          />
          {submetido && !peca.codigo && (
            <small className="p-error">Código é obrigatório.</small>
          )}
        </div>

        <div className="field mb-3">
          <label htmlFor="descricao" className="font-bold">
            Descrição
          </label>
          <InputText
            id="descricao"
            value={peca.descricao}
            onChange={(e) => onInputChange(e, "descricao")}
            required
            className={classNames({
              "p-invalid": submetido && !peca.descricao,
            })}
          />
          {submetido && !peca.descricao && (
            <small className="p-error">Descrição é obrigatória.</small>
          )}
        </div>

        <div className="field mb-3">
          <label htmlFor="marca" className="font-bold">
            Marca
          </label>
          <InputText
            id="marca"
            value={peca.marca ?? ""}
            onChange={(e) => onInputChange(e, "marca")}
          />
        </div>

        <div className="formgrid grid">
          <div className="field col mb-3">
            <label htmlFor="estoque" className="font-bold">
              Estoque
            </label>
            <InputNumber
              id="estoque"
              value={peca.estoque ?? 0}
              onValueChange={(e) => onInputNumberChange(e.value, "estoque")}
            />
          </div>
        </div>

        <div className="formgrid grid gap-2">
          <div className="field col mb-3">
            <label htmlFor="preco_custo" className="font-bold">
              Preço Custo
            </label>
            <InputNumber
              id="preco_custo"
              value={peca.preco_custo ?? 0}
              onValueChange={(e) => onInputNumberChange(e.value, "preco_custo")}
              mode="currency"
              currency="BRL"
              locale="pt-BR"
            />
          </div>
          <div className="field col mb-3">
            <label htmlFor="preco_venda" className="font-bold">
              Preço Venda
            </label>
            <InputNumber
              id="preco_venda"
              value={peca.preco_venda ?? 0}
              onValueChange={(e) => onInputNumberChange(e.value, "preco_venda")}
              mode="currency"
              currency="BRL"
              locale="pt-BR"
            />
          </div>
        </div>
      </Dialog>

      <Dialog
        visible={dialogDeletarPeca}
        style={{ width: "450px" }}
        header="Confirmar Exclusão"
        modal
        footer={rodapeDeletarPeca}
        onHide={() => setDialogDeletarPeca(false)}
      >
        <div className="flex align-items-center justify-content-center gap-3">
          <i className="pi pi-exclamation-triangle text-amber-500 text-4xl" />
          {peca && (
            <span>
              Tem certeza que deseja excluir a peça <b>{peca.descricao}</b>?
            </span>
          )}
        </div>
      </Dialog>
    </>
  );
}