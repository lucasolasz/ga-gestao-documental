export type StatusType = 'no_expiry' | 'expired' | 'critical' | 'warning' | 'ok';
export type StatusSeverity = 'danger' | 'warning' | 'info' | 'success' | 'secondary';

export interface DocumentStatus {
  diasParaVencer: number | null;
  status: StatusType;
  statusLabel: string;
  severity: StatusSeverity;
  iconClass: string;
}
