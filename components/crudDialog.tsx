"use client";

import { ReactNode } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";

interface CrudDialogProps {
  visible: boolean;
  titulo: string;
  onHide: () => void;
  onSalvar: () => void;
  salvando: boolean;
  largura?: string;
  children: ReactNode;
}

export default function CrudDialog({
  visible,
  titulo,
  onHide,
  onSalvar,
  salvando,
  largura,
  children,
}: CrudDialogProps) {
  const footer = (
    <>
      <Button
        label="Cancelar"
        icon="pi pi-times"
        text
        onClick={onHide}
        disabled={salvando}
      />
      <Button
        label="Salvar"
        icon="pi pi-check"
        text
        onClick={onSalvar}
        loading={salvando}
      />
    </>
  );

  return (
    <Dialog
      visible={visible}
      style={{ width: largura ?? "50%" }}
      header={titulo}
      modal
      className="p-fluid"
      footer={footer}
      onHide={onHide}
    >
      {children}
    </Dialog>
  );
}
