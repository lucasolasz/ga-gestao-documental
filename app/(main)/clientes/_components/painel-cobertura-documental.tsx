"use client";

import { Button } from "primereact/button";
import { Panel } from "primereact/panel";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import { useRef, useState } from "react";

import { Documento } from "@/types/entidades-banco/documento";
import { TipoDocumento } from "@/types/entidades-banco/tipoDocumento";

interface Props {
  documentos: Documento[];
  tiposDisponiveis: TipoDocumento[];
}

const LIMIT = 10;

export default function PainelCoberturaDocumental({
  documentos,
  tiposDisponiveis,
}: Props) {
  const [expandido, setExpandido] = useState(false);
  const toast = useRef<Toast>(null);

  function generatePlainText() {
    const hoje = new Date().toLocaleDateString("pt-BR");
    const present =
      tiposPreenchidos.map((t) => `- ${t.descricao}`).join("\n") || "- Nenhum";
    const missing =
      tiposDisponiveis.map((t) => `- ${t.descricao}`).join("\n") || "- Nenhum";
    return `Assunto: Documentos necessários — ${hoje}\n\nPreenchidos:\n${present}\n\nFaltando:\n${missing}`;
  }

  async function copyAsPlain() {
    const text = generatePlainText();
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.cssText = "position:fixed;opacity:0;pointer-events:none";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      toast.current?.show({
        severity: "success",
        summary: "Copiado!",
        detail: "Texto copiado para a área de transferência",
        life: 3000,
      });
    } catch {
      toast.current?.show({
        severity: "error",
        summary: "Erro",
        detail: "Erro ao copiar texto",
        life: 3000,
      });
    }
  }

  const tiposPreenchidos = documentos
    .map((d) => d.tipo)
    .filter((t): t is TipoDocumento => !!t);

  const preenchidosVisiveis = expandido
    ? tiposPreenchidos
    : tiposPreenchidos.slice(0, LIMIT);
  const faltandoVisiveis = expandido
    ? tiposDisponiveis
    : tiposDisponiveis.slice(0, LIMIT);
  const totalOculto =
    Math.max(0, tiposPreenchidos.length - LIMIT) +
    Math.max(0, tiposDisponiveis.length - LIMIT);
  const temMais = totalOculto > 0;

  return (
    <>
      <Toast ref={toast} />
      <Panel
        headerTemplate={(options) => (
          <div className={options.className}>
            <span className={options.titleClassName}>Cobertura Documental</span>
            <div className="flex align-items-center gap-2 ml-auto">
              <Button
                icon="pi pi-copy"
                label="Copiar"
                size="small"
                text
                severity="secondary"
                type="button"
                onClick={copyAsPlain}
                style={{ background: "#f0f0f0" }}
              />
              {options.togglerElement}
            </div>
          </div>
        )}
        toggleable
        className="mb-3"
      >
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
            Faltandos ({tiposDisponiveis.length})
          </span>
          <div className="flex flex-wrap gap-1 mt-2">
            {faltandoVisiveis.map((t) => (
              <Tag
                key={t.id}
                value={t.descricao}
                style={{ background: "#808080" }}
              />
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
            label={expandido ? "Ver menos" : `Ver mais +${totalOculto} tipos`}
            link
            icon={expandido ? "pi pi-chevron-up" : "pi pi-chevron-down"}
            iconPos="right"
            type="button"
            onClick={() => setExpandido((p) => !p)}
            className="p-0 text-sm"
          />
        </div>
      )}
      </Panel>
    </>
  );
}
