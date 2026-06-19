import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  ALL_STAGES,
  FINANCIAL_STAGES,
  OPERATIONAL_STAGES,
  POST_SALE_STAGES,
  type StageState,
  type TrackingStageKey,
  type TrackKey,
} from "@/lib/orderTracking/stages";

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
  clientName: string;
  totalValue: number;
  createdAt: string;
  estimatedDelivery: string;
  currentStage: TrackingStageKey;
  currentTrack: TrackKey;
  installments: { number: number; amount: number; dueDate: string; paid: boolean; paidAt: string | null }[];
  invoiceNumber: string | null;
  health: "on_track" | "at_risk" | "delayed";
  progressByTrack: Record<TrackKey, number>; // 0..1
  stages: TrackingStageProgress[];
}

// Deterministic pseudo-random from string id (stable per order)
function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return h;
}

function pick<T>(seed: number, arr: T[]): T {
  return arr[seed % arr.length];
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function daysAhead(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
}

function buildStages(seed: number, createdAt: string): {
  stages: TrackingStageProgress[];
  currentStage: TrackingStageKey;
  currentTrack: TrackKey;
} {
  // currentIndex in operational chain (0..8). 8 = operational done.
  const opCurrent = seed % (OPERATIONAL_STAGES.length + 1);
  // finCurrent depends a bit on op
  const finBase = Math.max(0, opCurrent - 3);
  const finCurrent = Math.min(FINANCIAL_STAGES.length, finBase + (seed % 2));
  const postCurrent = opCurrent >= OPERATIONAL_STAGES.length ? Math.min(POST_SALE_STAGES.length, 1 + (seed % 3)) : 0;

  const created = new Date(createdAt).getTime();
  const stages: TrackingStageProgress[] = [];

  const fillTrack = (
    list: typeof OPERATIONAL_STAGES,
    currentIdx: number,
    spacingDays: number,
    startOffsetDays: number,
  ) => {
    list.forEach((s, i) => {
      let state: StageState = "pending";
      let startedAt: string | null = null;
      let completedAt: string | null = null;
      if (i < currentIdx) {
        state = "done";
        startedAt = new Date(created + (startOffsetDays + i * spacingDays) * 86400000).toISOString();
        completedAt = new Date(created + (startOffsetDays + (i + 0.7) * spacingDays) * 86400000).toISOString();
      } else if (i === currentIdx) {
        state = "current";
        startedAt = new Date(created + (startOffsetDays + i * spacingDays) * 86400000).toISOString();
      }
      stages.push({ key: s.key, state, startedAt, completedAt });
    });
  };

  fillTrack(OPERATIONAL_STAGES, opCurrent, 2, 0);
  fillTrack(FINANCIAL_STAGES, finCurrent, 15, 1);
  fillTrack(POST_SALE_STAGES, postCurrent, 7, 16);

  const currentStage: TrackingStageKey =
    opCurrent < OPERATIONAL_STAGES.length
      ? OPERATIONAL_STAGES[opCurrent].key
      : finCurrent < FINANCIAL_STAGES.length
        ? FINANCIAL_STAGES[finCurrent].key
        : postCurrent < POST_SALE_STAGES.length
          ? POST_SALE_STAGES[postCurrent].key
          : "nps";

  const currentTrack: TrackKey =
    opCurrent < OPERATIONAL_STAGES.length ? "operational" : finCurrent < FINANCIAL_STAGES.length ? "financial" : "post_sale";

  return { stages, currentStage, currentTrack };
}

function buildInstallments(seed: number, total: number, createdAt: string) {
  const count = (seed % 5) + 2; // 2..6
  const paidCount = seed % (count + 1);
  const installment = Math.round((total / count) * 100) / 100;
  return Array.from({ length: count }, (_, i) => {
    const due = new Date(createdAt);
    due.setDate(due.getDate() + (i + 1) * 30);
    const paid = i < paidCount;
    return {
      number: i + 1,
      amount: installment,
      dueDate: due.toISOString(),
      paid,
      paidAt: paid ? new Date(due.getTime() - 86400000).toISOString() : null,
    };
  });
}

function projectOrder(raw: {
  id: string;
  number: string;
  client: string;
  total: number;
  createdAt: string;
}): TrackingOrder {
  const seed = hash(raw.id);
  const { stages, currentStage, currentTrack } = buildStages(seed, raw.createdAt);
  const installments = buildInstallments(seed, raw.total, raw.createdAt);
  const healthRoll = seed % 10;
  const health: TrackingOrder["health"] = healthRoll < 7 ? "on_track" : healthRoll < 9 ? "at_risk" : "delayed";

  const trackProgress = (track: TrackKey) => {
    const list = stages.filter((s) => ALL_STAGES.find((a) => a.key === s.key)?.track === track);
    const done = list.filter((s) => s.state === "done").length;
    const cur = list.find((s) => s.state === "current") ? 0.5 : 0;
    return list.length ? (done + cur) / list.length : 0;
  };

  return {
    id: raw.id,
    orderNumber: raw.number,
    clientName: raw.client,
    totalValue: raw.total,
    createdAt: raw.createdAt,
    estimatedDelivery: daysAhead(7 + (seed % 14)),
    currentStage,
    currentTrack,
    installments,
    invoiceNumber: stages.find((s) => s.key === "nf_emitida" && s.state !== "pending")
      ? `NF-${String(seed).slice(0, 6)}`
      : null,
    health,
    progressByTrack: {
      operational: trackProgress("operational"),
      financial: trackProgress("financial"),
      post_sale: trackProgress("post_sale"),
    },
    stages,
  };
}

const MOCK_CLIENTS = [
  "Acme Corp",
  "Tech Solutions Ltda",
  "Inovação Brasil",
  "Grupo Vértice",
  "Logística Atlas",
  "Construtora Horizonte",
  "Distribuidora Sul",
  "Indústria Norte",
  "Comércio União",
  "Serviços Premium",
];

function buildMockOrders(count: number): TrackingOrder[] {
  return Array.from({ length: count }, (_, i) => {
    const id = `mock-order-${i + 1}`;
    const seed = hash(id);
    return projectOrder({
      id,
      number: String(10000 + i + 1),
      client: pick(seed, MOCK_CLIENTS),
      total: 5000 + (seed % 95000),
      createdAt: daysAgo(seed % 30),
    });
  });
}

export function useOrderTracking() {
  return useQuery({
    queryKey: ["order-tracking-list"],
    staleTime: 60_000,
    queryFn: async (): Promise<TrackingOrder[]> => {
      // Try to enrich with real quotes; fallback to pure mock
      try {
        const { data: user } = await supabase.auth.getUser();
        const uid = user?.user?.id;
        if (!uid) return buildMockOrders(12);

        const { data: quotes } = await supabase
          .from("quotes")
          .select("id, quote_number, client_name, total, created_at, status")
          .eq("salesperson_id", uid)
          .in("status", ["approved", "won", "sent"])
          .order("created_at", { ascending: false })
          .limit(20);

        const real = (quotes ?? []).map((q) =>
          projectOrder({
            id: q.id,
            number: q.quote_number ?? String(q.id).slice(0, 6),
            client: q.client_name ?? "Cliente",
            total: Number(q.total ?? 0) || 1000,
            createdAt: q.created_at ?? daysAgo(5),
          }),
        );

        const mocks = buildMockOrders(Math.max(0, 8 - real.length));
        return [...real, ...mocks];
      } catch {
        return buildMockOrders(12);
      }
    },
  });
}

export function useOrderTrackingDetail(orderId: string | undefined) {
  const list = useOrderTracking();
  return {
    ...list,
    data: list.data?.find((o) => o.id === orderId) ?? null,
  };
}
