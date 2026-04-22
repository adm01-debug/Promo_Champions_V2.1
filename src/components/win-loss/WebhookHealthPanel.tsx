import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Activity, AlertTriangle, BellRing } from "lucide-react";
import { toast } from "sonner";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import {
  useWebhookDeliveryStats,
  type WebhookStatsWindow,
} from "@/hooks/win-loss/useWebhookDeliveryStats";
import { useWebhookAlerts, activeAlertsBySubscription } from "@/hooks/win-loss/useWebhookAlerts";
import type { RechartsTooltipProps } from "@/types/recharts";
import { cn } from "@/lib/utils";
import { WebhookAttemptSliceDrawer } from "./WebhookAttemptSliceDrawer";

const WINDOW_OPTIONS: ReadonlyArray<{ value: WebhookStatsWindow; label: string; aria: string }> = [
  { value: "24h", label: "24h", aria: "Últimas 24 horas" },
  { value: "7d", label: "7d", aria: "Últimos 7 dias" },
  { value: "30d", label: "30d", aria: "Últimos 30 dias" },
];

const WINDOW_LABEL: Record<WebhookStatsWindow, string> = {
  "24h": "últimas 24 horas",
  "7d": "últimos 7 dias",
  "30d": "últimos 30 dias",
};

function rateClasses(rate: number, total: number) {
  if (total === 0) return "text-muted-foreground";
  if (rate >= 95) return "text-success";
  if (rate >= 80) return "text-warning";
  return "text-destructive";
}

function HealthTooltip({ active, payload }: RechartsTooltipProps) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload as { attempt: number; failures: number; total: number };
  return (
    <div className="rounded-md border bg-card px-2.5 py-1.5 text-xs shadow-md">
      <p className="font-medium">Tentativa {p.attempt}</p>
      <p className="text-muted-foreground">
        {p.failures} falha{p.failures === 1 ? "" : "s"} de {p.total} tentativa{p.total === 1 ? "" : "s"}
      </p>
    </div>
  );
}

function ReasonTooltip({ active, payload }: RechartsTooltipProps) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload as {
    label: string;
    count: number;
    sampleMessage: string | null;
  };
  return (
    <div className="rounded-md border bg-card px-2.5 py-1.5 text-xs shadow-md max-w-[260px]">
      <p className="font-medium">{p.label}</p>
      <p className="text-muted-foreground">
        {p.count} falha{p.count === 1 ? "" : "s"}
      </p>
      {p.sampleMessage && (
        <p className="mt-1 text-muted-foreground/80 italic break-words">"{p.sampleMessage}"</p>
      )}
    </div>
  );
}

/** Color-code reason bars: 5xx → destructive, 4xx → warning, network/other → muted. */
function reasonColor(status: number | null, key: string): string {
  if (status !== null && status >= 500) return "hsl(var(--destructive))";
  if (status !== null && status >= 400) return "hsl(var(--warning))";
  if (key === "network") return "hsl(var(--destructive))";
  return "hsl(var(--muted-foreground))";
}

const THRESHOLD_STORAGE_KEY = "winloss-webhook-success-threshold";
const DEFAULT_THRESHOLD = 95;

function loadThreshold(): number {
  if (typeof window === "undefined") return DEFAULT_THRESHOLD;
  const raw = window.localStorage.getItem(THRESHOLD_STORAGE_KEY);
  if (!raw) return DEFAULT_THRESHOLD;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) return DEFAULT_THRESHOLD;
  return parsed;
}

export function WebhookHealthPanel() {
  const [windowKey, setWindowKey] = useState<WebhookStatsWindow>("7d");
  const [drillAttempt, setDrillAttempt] = useState<number | null>(null);
  const [threshold, setThreshold] = useState<number>(() => loadThreshold());
  const [thresholdInput, setThresholdInput] = useState<string>(() => String(loadThreshold()));
  const { data, isLoading } = useWebhookDeliveryStats(null, windowKey);
  const { data: alerts } = useWebhookAlerts();
  const activeBySub = activeAlertsBySubscription(alerts ?? []);
  const degradedCount = activeBySub.size;

  const belowThreshold =
    !!data && data.total > 0 && data.successRate < threshold;

  // Notify (once) when crossing below threshold within the current view.
  useEffect(() => {
    if (!belowThreshold || !data) return;
    const key = `${windowKey}:${threshold}:${data.successRate.toFixed(1)}`;
    const lastKey = sessionStorage.getItem("winloss-webhook-threshold-toast");
    if (lastKey === key) return;
    sessionStorage.setItem("winloss-webhook-threshold-toast", key);
    toast.warning("Taxa de sucesso de webhooks abaixo do limite", {
      description: `${data.successRate.toFixed(1)}% nas ${WINDOW_LABEL[windowKey]} (limite: ${threshold}%).`,
    });
  }, [belowThreshold, data, threshold, windowKey]);

  const commitThreshold = (raw: string) => {
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) {
      setThresholdInput(String(threshold));
      return;
    }
    const clamped = Math.min(100, Math.max(0, Math.round(parsed * 10) / 10));
    setThreshold(clamped);
    setThresholdInput(String(clamped));
    if (typeof window !== "undefined") {
      window.localStorage.setItem(THRESHOLD_STORAGE_KEY, String(clamped));
    }
  };

  const openDrill = (attempt: number, failures: number) => {
    if (failures <= 0) return;
    setDrillAttempt(attempt);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4 text-primary" aria-hidden />
            Saúde de entregas{" "}
            <span className="text-xs font-normal text-muted-foreground">
              · {WINDOW_LABEL[windowKey]}
            </span>
          </CardTitle>
          <ToggleGroup
            type="single"
            size="sm"
            value={windowKey}
            onValueChange={(v) => {
              if (v === "24h" || v === "7d" || v === "30d") setWindowKey(v);
            }}
            aria-label="Janela temporal"
            className="bg-background/60"
          >
            {WINDOW_OPTIONS.map((opt) => (
              <ToggleGroupItem
                key={opt.value}
                value={opt.value}
                aria-label={opt.aria}
                className="h-7 px-2.5 text-xs"
              >
                {opt.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {degradedCount > 0 && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive"
          >
            <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" aria-hidden />
            <p>
              <strong>{degradedCount}</strong> assinatura{degradedCount === 1 ? "" : "s"} com alerta ativo nos últimos 60 minutos.
              Verifique a lista abaixo para detalhes.
            </p>
          </div>
        )}
        {isLoading ? (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
            <Skeleton className="h-40 w-full" />
          </div>
        ) : !data || data.total === 0 ? (
          <p className="text-xs text-muted-foreground py-8 text-center">
            Nenhuma entrega registrada nas {WINDOW_LABEL[windowKey]}.
          </p>
        ) : (
          <>
            <div
              className="grid grid-cols-3 gap-2"
              role="img"
              aria-label={`${data.successRate.toFixed(1)}% de sucesso, ${data.failed} falhas em ${data.total} tentativas`}
            >
              <div className="rounded-md border bg-muted/20 px-3 py-2">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Taxa de sucesso</p>
                <p className={cn("text-2xl font-bold", rateClasses(data.successRate, data.total))}>
                  {data.successRate.toFixed(1)}%
                </p>
              </div>
              <div className="rounded-md border bg-muted/20 px-3 py-2">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Tentativas</p>
                <p className="text-2xl font-bold">{data.total}</p>
              </div>
              <div className="rounded-md border bg-muted/20 px-3 py-2">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Falhas</p>
                <p className={cn("text-2xl font-bold", data.failed > 0 ? "text-destructive" : "text-muted-foreground")}>
                  {data.failed}
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-baseline justify-between mb-1">
                <p className="text-xs text-muted-foreground">Falhas por tentativa</p>
                <p className="text-[10px] text-muted-foreground/70">
                  Clique numa barra para detalhar
                </p>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={data.failuresByAttempt} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                  <XAxis
                    dataKey="attempt"
                    tickFormatter={(v) => `Tentativa ${v}`}
                    className="text-[11px]"
                  />
                  <YAxis allowDecimals={false} className="text-[11px]" />
                  <Tooltip
                    cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
                    content={<HealthTooltip />}
                  />
                  <Bar
                    dataKey="failures"
                    radius={[4, 4, 0, 0]}
                    onClick={(payload: unknown) => {
                      const p = payload as { attempt?: number; failures?: number } | undefined;
                      if (p?.attempt !== undefined && p?.failures !== undefined) {
                        openDrill(p.attempt, p.failures);
                      }
                    }}
                  >
                    {data.failuresByAttempt.map((b) => (
                      <Cell
                        key={b.attempt}
                        fill="hsl(var(--destructive))"
                        cursor={b.failures > 0 ? "pointer" : "default"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              <ul className="mt-2 grid grid-cols-3 gap-1.5">
                {data.failuresByAttempt.map((b) => {
                  const interactive = b.failures > 0;
                  return (
                    <li key={b.attempt}>
                      <button
                        type="button"
                        onClick={() => openDrill(b.attempt, b.failures)}
                        disabled={!interactive}
                        className={cn(
                          "w-full rounded-md border bg-muted/10 px-2 py-1.5 text-left text-[11px] transition-colors",
                          interactive
                            ? "hover:bg-muted/40 hover:border-destructive/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                            : "opacity-60 cursor-not-allowed",
                        )}
                        aria-label={
                          interactive
                            ? `Ver ${b.failures} falha${b.failures === 1 ? "" : "s"} da tentativa ${b.attempt}`
                            : `Sem falhas na tentativa ${b.attempt}`
                        }
                      >
                        <p className="text-muted-foreground">Tentativa {b.attempt}</p>
                        <p
                          className={cn(
                            "tabular-nums font-semibold",
                            b.failures > 0 ? "text-destructive" : "text-muted-foreground",
                          )}
                        >
                          {b.failures}
                          <span className="ml-1 text-[10px] font-normal text-muted-foreground/70">
                            / {b.total}
                          </span>
                        </p>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div>
              <div className="flex items-baseline justify-between mb-1">
                <p className="text-xs text-muted-foreground">Principais causas de falha</p>
                <p className="text-[10px] text-muted-foreground/70">
                  por código HTTP
                </p>
              </div>
              {data.failureReasons.length === 0 ? (
                <p className="text-xs text-muted-foreground py-6 text-center">
                  Nenhuma falha registrada na janela.
                </p>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={Math.max(120, data.failureReasons.length * 28)}>
                    <BarChart
                      data={data.failureReasons}
                      layout="vertical"
                      margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                      <XAxis type="number" allowDecimals={false} className="text-[11px]" />
                      <YAxis
                        type="category"
                        dataKey="label"
                        width={92}
                        className="text-[11px]"
                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                      />
                      <Tooltip
                        cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
                        content={<ReasonTooltip />}
                      />
                      <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                        {data.failureReasons.map((r) => (
                          <Cell key={r.key} fill={reasonColor(r.status, r.key)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>

                  <ul className="mt-2 space-y-1">
                    {data.failureReasons.map((r) => {
                      const pct = data.failed > 0 ? (r.count / data.failed) * 100 : 0;
                      return (
                        <li
                          key={r.key}
                          className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground"
                        >
                          <span className="flex items-center gap-1.5 min-w-0">
                            <span
                              className="inline-block h-2 w-2 rounded-sm shrink-0"
                              style={{ backgroundColor: reasonColor(r.status, r.key) }}
                              aria-hidden
                            />
                            <span className="truncate">{r.label}</span>
                          </span>
                          <span className="tabular-nums shrink-0">
                            {r.count} ({pct.toFixed(0)}%)
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
            </div>
          </>
        )}
      </CardContent>
      <WebhookAttemptSliceDrawer
        attempt={drillAttempt}
        windowKey={windowKey}
        open={drillAttempt !== null}
        onOpenChange={(o) => !o && setDrillAttempt(null)}
      />
    </Card>
  );
}
