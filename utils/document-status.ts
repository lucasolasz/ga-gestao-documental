import {
  DocumentStatus,
  StatusSeverity,
  StatusType,
} from "@/types/documento-status";

export function calculateDocumentStatus(
  dataValidade: string | null | undefined,
): DocumentStatus {
  if (!dataValidade) {
    return {
      diasParaVencer: null,
      status: "no_expiry",
      statusLabel: "Sem validade",
      severity: "secondary",
      iconClass: "pi-infinity",
    };
  }

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const vencimento = new Date(dataValidade);
  vencimento.setHours(0, 0, 0, 0);

  const diffTime = vencimento.getTime() - hoje.getTime();
  const diasParaVencer = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let status: StatusType;
  let statusLabel: string;
  let severity: StatusSeverity;
  let iconClass: string;

  if (diasParaVencer < 0) {
    status = "expired";
    statusLabel = `Vencido há ${Math.abs(diasParaVencer)} dias`;
    severity = "danger";
    iconClass = "pi-times-circle";
  } else if (diasParaVencer === 0) {
    status = "critical";
    statusLabel = "Vence hoje";
    severity = "warning";
    iconClass = "pi-exclamation-triangle";
  } else if (diasParaVencer <= 30) {
    status = "critical";
    statusLabel = `Vence em ${diasParaVencer} dias`;
    severity = "warning";
    iconClass = "pi-exclamation-triangle";
  } else if (diasParaVencer <= 90) {
    status = "warning";
    statusLabel = `Vence em ${diasParaVencer} dias`;
    severity = "info";
    iconClass = "pi-clock";
  } else {
    status = "ok";
    statusLabel = `Válido por ${diasParaVencer} dias`;
    severity = "success";
    iconClass = "pi-check-circle";
  }

  return { diasParaVencer, status, statusLabel, severity, iconClass };
}

export function getSeverity(status: StatusType): StatusSeverity {
  switch (status) {
    case "expired":
      return "danger";
    case "critical":
      return "warning";
    case "warning":
      return "info";
    case "ok":
      return "success";
    case "no_expiry":
      return "secondary";
  }
}
