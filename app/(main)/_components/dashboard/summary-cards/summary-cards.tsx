"use client";

import { StatusType } from "@/types/entidades-banco/documento-status";

interface Summary {
  expired: number;
  critical: number;
  warning: number;
  ok: number;
}

interface SummaryCardsProps {
  summary: Summary;
  activeStatus: StatusType | null;
  onStatusClick: (status: StatusType | null) => void;
}

const cards = [
  {
    key: "expired" as StatusType,
    label: "Vencidos",
    description: "Documentos já expirados",
    severity: "danger",
    hexColor: "#ef4444",
    bgColor: "#fef2f2",
    icon: "pi pi-times-circle",
  },
  {
    key: "critical" as StatusType,
    label: "Críticos",
    description: "Vencem em até 30 dias",
    severity: "warning",
    hexColor: "#f97316",
    bgColor: "#fff7ed",
    icon: "pi pi-exclamation-circle",
  },
  {
    key: "warning" as StatusType,
    label: "A vencer",
    description: "Vencem em até 90 dias",
    severity: "info",
    hexColor: "#0ea5e9",
    bgColor: "#f0f9ff",
    icon: "pi pi-calendar",
  },
  {
    key: "ok" as StatusType,
    label: "Válidos",
    description: "Dentro do prazo",
    severity: "success",
    hexColor: "#22c55e",
    bgColor: "#f0fdf4",
    icon: "pi pi-check-circle",
  },
];

export default function SummaryCards({
  summary,
  activeStatus,
  onStatusClick,
}: SummaryCardsProps) {
  function handleClick(key: StatusType) {
    onStatusClick(activeStatus === key ? null : key);
  }

  return (
    <div className="grid mb-3">
      {cards.map((card) => {
        const isActive = activeStatus === card.key;
        const count = summary[card.key as keyof Summary];

        return (
          <div key={card.key} className="col-12 lg:col-6 xl:col-3">
            <div
              className="card mb-0 cursor-pointer transition-all"
              style={{
                border: "2px solid",
                borderColor: isActive ? card.hexColor : "#cdcdcd",
                opacity: isActive ? 1 : 0.9,
                backgroundColor: card.bgColor,
              }}
              onClick={() => handleClick(card.key)}
            >
              <div className="flex justify-content-between mb-3 ">
                <div>
                  <span className="block text-500 font-medium mb-3">
                    {card.label}
                  </span>
                  <div
                    className="font-medium text-2xl"
                    style={{ color: card.hexColor }}
                  >
                    {count}
                  </div>
                </div>
                <div
                  className={`p-tag p-tag-${card.severity} rounded-2xl flex items-center justify-center`}
                  style={{ width: "2.5rem", height: "2.5rem" }}
                >
                  <i className={`${card.icon} text-xl`} />
                </div>
              </div>
              <span className="text-500 text-sm">{card.description}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
