import type { HealthTier } from "@/hooks/deal-intelligence/useDealHealth";

export const tierLabel = (tier: HealthTier): string => {
  switch (tier) {
    case "healthy": return "Saudável";
    case "watch": return "Atenção";
    case "at_risk": return "Em Risco";
    case "critical": return "Crítico";
  }
};

export const tierColor = (tier: HealthTier): string => {
  switch (tier) {
    case "healthy": return "bg-status-success/15 text-status-success border-status-success/30";
    case "watch": return "bg-info/15 text-info border-info/30";
    case "at_risk": return "bg-status-warning/15 text-status-warning border-status-warning/30";
    case "critical": return "bg-destructive/15 text-destructive border-destructive/30";
  }
};

export const tierRingColor = (tier: HealthTier): string => {
  switch (tier) {
    case "healthy": return "stroke-status-success";
    case "watch": return "stroke-info";
    case "at_risk": return "stroke-status-warning";
    case "critical": return "stroke-destructive";
  }
};

export const priorityColor = (p: "low" | "medium" | "high"): string => {
  switch (p) {
    case "high": return "bg-destructive/15 text-destructive border-destructive/30";
    case "medium": return "bg-status-warning/15 text-status-warning border-status-warning/30";
    case "low": return "bg-info/15 text-info border-info/30";
  }
};

export const priorityLabel = (p: "low" | "medium" | "high"): string => {
  switch (p) {
    case "high": return "Alta";
    case "medium": return "Média";
    case "low": return "Baixa";
  }
};

export const formatScore = (score: number): string => `${Math.round(score)}/100`;
