import { CheckCircle2, Package, Truck, Home, ShoppingBag, XCircle, type LucideIcon } from "lucide-react";

export type OrderStatus = "pending" | "confirmed" | "preparing" | "shipped" | "delivered" | "cancelled";

export interface StatusStep {
  key: OrderStatus;
  label: string;
  icon: LucideIcon;
}

export const STATUS_STEPS: StatusStep[] = [
  { key: "pending", label: "Criado", icon: ShoppingBag },
  { key: "confirmed", label: "Confirmado", icon: CheckCircle2 },
  { key: "preparing", label: "Em preparação", icon: Package },
  { key: "shipped", label: "Enviado", icon: Truck },
  { key: "delivered", label: "Entregue", icon: Home },
];

export const CANCELLED_STEP: StatusStep = { key: "cancelled", label: "Cancelado", icon: XCircle };

export function statusLabel(status: OrderStatus): string {
  if (status === "cancelled") return "Cancelado";
  return STATUS_STEPS.find((s) => s.key === status)?.label ?? status;
}

export type StatusTone = "warning" | "info" | "success" | "destructive" | "default";

export function statusTone(status: OrderStatus): StatusTone {
  switch (status) {
    case "pending":
      return "warning";
    case "confirmed":
    case "preparing":
    case "shipped":
      return "info";
    case "delivered":
      return "success";
    case "cancelled":
      return "destructive";
    default:
      return "default";
  }
}

export function statusIndex(status: OrderStatus): number {
  return STATUS_STEPS.findIndex((s) => s.key === status);
}

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
export const formatBRL = (value: number) => brl.format(value);

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
