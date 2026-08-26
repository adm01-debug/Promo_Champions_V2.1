import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { OrderStatus } from "@/components/orders/orderHelpers";
import type { StageState, TrackingStageKey } from "@/lib/orderTracking/stages";

/**
 * Contrato legado do componente de timeline granular. A listagem atual não o
 * preenche porque o banco só registra o status real de pedido e seus eventos.
 */
export interface TrackingStageProgress {
  key: TrackingStageKey;
  state: StageState;
  startedAt: string | null;
  completedAt: string | null;
  note?: string | null;
}

export interface TrackingOrder {
  id: string;
  orderNumber: string;
  clientName: string | null;
  totalValue: number;
  createdAt: string;
  updatedAt: string;
  status: OrderStatus;
  cancellationReason: string | null;
}

type RawTrackingOrder = {
  id: string;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
  updated_at: string;
  cancellation_reason: string | null;
  client: { name: string } | { name: string }[] | null;
};

const ORDER_STATUSES: ReadonlySet<OrderStatus> = new Set([
  "pending",
  "confirmed",
  "preparing",
  "shipped",
  "delivered",
  "cancelled",
]);

const ORDER_TRACKING_SELECT =
  "id, order_number, status, total, created_at, updated_at, cancellation_reason, client:clients(name)";

function toOrderStatus(status: string): OrderStatus {
  if (!ORDER_STATUSES.has(status as OrderStatus)) {
    throw new Error("Foi encontrado um pedido com status não suportado.");
  }

  return status as OrderStatus;
}

function clientName(client: RawTrackingOrder["client"]): string | null {
  if (Array.isArray(client)) return client[0]?.name ?? null;
  return client?.name ?? null;
}

function projectOrder(row: RawTrackingOrder): TrackingOrder {
  return {
    id: row.id,
    orderNumber: row.order_number,
    clientName: clientName(row.client),
    totalValue: Number(row.total),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    status: toOrderStatus(row.status),
    cancellationReason: row.cancellation_reason,
  };
}

/**
 * Lista somente pedidos existentes e autorizados pelas políticas RLS.
 * Não há projeção de orçamento, preenchimento aleatório ou estimativa de status.
 */
export function useOrderTracking() {
  return useQuery({
    queryKey: ["order-tracking-list"],
    staleTime: 60_000,
    queryFn: async (): Promise<TrackingOrder[]> => {
      const { data, error } = await supabase
        .from("orders")
        .select(ORDER_TRACKING_SELECT)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      return ((data ?? []) as RawTrackingOrder[]).map(projectOrder);
    },
  });
}

/**
 * Mantém o contrato usado por consumidores legados, consultando o pedido real
 * sem depender do limite da listagem.
 */
export function useOrderTrackingDetail(orderId: string | undefined) {
  return useQuery({
    queryKey: ["order-tracking-detail", orderId],
    enabled: Boolean(orderId),
    queryFn: async (): Promise<TrackingOrder | null> => {
      if (!orderId) return null;

      const { data, error } = await supabase
        .from("orders")
        .select(ORDER_TRACKING_SELECT)
        .eq("id", orderId)
        .maybeSingle();

      if (error) throw error;

      return data ? projectOrder(data as RawTrackingOrder) : null;
    },
  });
}
