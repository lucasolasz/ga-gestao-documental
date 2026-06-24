"use client";

import { pesquisarTiposDocumentos } from "@/services/tipodocumento-service";
import { TipoDocumento } from "@/types/entidades-banco/tipoDocumento";
import { useEffect, useState } from "react";
import TabelaTipoDocumento from "./_components/tabela-tipodocumento";

export default function TipoDocumentoPage() {
  const [tiposDocumentos, setTiposDocumentos] = useState<TipoDocumento[]>([]);

  useEffect(() => {
    pesquisarTiposDocumentos()
      .then((data) => setTiposDocumentos(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <TabelaTipoDocumento
      tiposDocumentos={tiposDocumentos}
      titulo="Tipos de Documento"
    />
  );
}
