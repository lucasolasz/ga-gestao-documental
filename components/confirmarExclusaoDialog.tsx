"use client";

import { ReactNode } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";

interface ConfirmarExclusaoDialogProps {
  visible: boolean;
  onHide: () => void;
  onConfirmar: () => void;
  deletando: boolean;
  descricao: ReactNode;
}

export default function ConfirmarExclusaoDialog({
  visible,
  onHide,
  onConfirmar,
  deletando,
  descricao,
}: ConfirmarExclusaoDialogProps) {
  const footer = (
    <>
      <Button
        label="Não"
        icon="pi pi-times"
        text
        onClick={onHide}
        disabled={deletando}
      />
      <Button
        label="Sim"
        icon="pi pi-check"
        text
        onClick={onConfirmar}
        loading={deletando}
      />
    </>
  );

  return (
    <Dialog
      visible={visible}
      style={{ width: "450px" }}
      header="Confirmar Exclusão"
      modal
      footer={footer}
      onHide={onHide}
    >
      <div className="flex align-items-center justify-content-center gap-3">
        <i className="pi pi-exclamation-triangle text-amber-500 text-4xl" />
        {descricao}
      </div>
    </Dialog>
  );
}
