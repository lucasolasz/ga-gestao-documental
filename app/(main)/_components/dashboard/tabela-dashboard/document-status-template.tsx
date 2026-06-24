import { Documento } from "@/types/entidades-banco/documento";
import { Tag } from "primereact/tag";

export function statusBodyTemplate(documento: Documento): React.ReactNode {
  const status = documento.status;

  if (!status) {
    return null;
  }

  return (
    <Tag
      severity={status.severity}
      value={status.statusLabel}
      icon={`pi ${status.iconClass}`}
      className="font-bold"
    />
  );
}
