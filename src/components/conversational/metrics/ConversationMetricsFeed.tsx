import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, MessageSquare, Mic, Zap } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useConversationMetricsFeed } from "@/hooks/conversational/useConversationMetrics";
import { healthBadgeVariant, healthLabel, formatPct, formatWPM } from "./metricsHelpers";

interface FeedRow {
  id: string;
  recording_id: string;
  seller_talk_ratio: number;
  silence_ratio: number;
  interruptions_count: number;
  seller_words_per_minute: number;
  engagement_score: number;
  health: "poor" | "fair" | "good" | "excellent";
  calculated_at: string;
  call_recordings?: { id: string; title: string; recorded_at: string } | null;
}

export function ConversationMetricsFeed() {
  const [health, setHealth] = useState<string>("all");
  const [sort, setSort] = useState<"recent" | "engagement" | "health">("recent");
  const { data, isLoading } = useConversationMetricsFeed(health);

  const rows = useMemo(() => {
    const list = (data ?? []) as unknown as FeedRow[];
    const sorted = [...list];
    if (sort === "engagement") sorted.sort((a, b) => b.engagement_score - a.engagement_score);
    else if (sort === "health") {
      const order = { excellent: 0, good: 1, fair: 2, poor: 3 } as const;
      sorted.sort((a, b) => order[a.health] - order[b.health]);
    }
    return sorted;
  }, [data, sort]);

  const kpis = useMemo(() => {
    const list = (data ?? []) as unknown as FeedRow[];
    if (!list.length) return null;
    const avg = (k: keyof FeedRow) =>
      list.reduce((s, r) => s + (Number(r[k]) || 0), 0) / list.length;
    const onTrack = list.filter((r) => r.health === "good" || r.health === "excellent").length;
    return {
      total: list.length,
      avgEngagement: Math.round(avg("engagement_score")),
      avgWpm: Math.round(avg("seller_words_per_minute")),
      onTrackPct: Math.round((onTrack / list.length) * 100),
    };
  }, [data]);

  return (
    <div className="space-y-4">
      {kpis && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <KpiCard icon={Activity} label="Calls analisadas" value={kpis.total} />
          <KpiCard icon={Zap} label="Engajamento médio" value={`${kpis.avgEngagement}/100`} />
          <KpiCard icon={Mic} label="WPM médio" value={formatWPM(kpis.avgWpm)} />
          <KpiCard icon={MessageSquare} label="Saudáveis" value={`${kpis.onTrackPct}%`} />
        </div>
      )}

      <Card variant="modern">
        <CardHeader className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">Feed de métricas conversacionais</CardTitle>
          <div className="flex gap-2">
            <Select value={health} onValueChange={setHealth}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toda saúde</SelectItem>
                <SelectItem value="excellent">Excelente</SelectItem>
                <SelectItem value="good">Bom</SelectItem>
                <SelectItem value="fair">Regular</SelectItem>
                <SelectItem value="poor">Crítico</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
              <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Mais recentes</SelectItem>
                <SelectItem value="engagement">Maior engajamento</SelectItem>
                <SelectItem value="health">Pior saúde</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
            </div>
          ) : rows.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhuma métrica conversacional encontrada. Transcreva e analise gravações para popular este feed.
            </p>
          ) : (
            <div className="divide-y">
              {rows.map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-foreground">
                        {r.call_recordings?.title ?? "Gravação"}
                      </span>
                      <Badge variant={healthBadgeVariant(r.health)}>{healthLabel(r.health)}</Badge>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
                      <span>Vendedor {formatPct(r.seller_talk_ratio)}</span>
                      <span>Silêncio {formatPct(r.silence_ratio)}</span>
                      <span>{r.interruptions_count} interrupções</span>
                      <span>{formatWPM(r.seller_words_per_minute)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-semibold text-foreground">
                      {Math.round(r.engagement_score)}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(r.calculated_at), { addSuffix: true, locale: ptBR })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function KpiCard({
  icon: Icon, label, value,
}: { icon: typeof Activity; label: string; value: string | number }) {
  return (
    <Card className="p-3 glass border-border/40 hover:border-primary/30 transition-all duration-300">
      <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
        <Icon className="h-3 w-3 text-primary" />
        {label}
      </div>
      <div className="mt-1 text-lg font-display font-bold text-foreground">{value}</div>
    </Card>
  );
}
