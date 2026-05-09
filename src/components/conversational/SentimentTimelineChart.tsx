import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, TrendingUp } from "lucide-react";
import { useSentimentTimeline, useAnalyzeSentiment } from "@/hooks/conversational/useSentimentTimeline";
import {
  detectShifts,
  formatTimestamp,
  type SentimentSegment,
} from "./sentimentHelpers";
import type { RechartsTooltipProps } from "@/types/recharts";
import { severityHexColor, type CriticalMoment } from "./criticalMomentsHelpers";
import type { Intent } from "./IntentTracker";

interface Props {
  recordingId: string;
  currentTime?: number;
  onSeek?: (sec: number) => void;
  moments?: CriticalMoment[];
  intents?: Intent[];
}

const ChartTooltip = ({ active, payload }: RechartsTooltipProps) => {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload as unknown as SentimentSegment;
  return (
    <div className="rounded-md border bg-popover px-3 py-2 text-xs shadow-md max-w-xs">
      <div className="font-semibold">
        {formatTimestamp(p.start_sec)} → {formatTimestamp(p.end_sec)}
      </div>
      <div className="text-muted-foreground capitalize">
        {p.speaker} · score {p.score.toFixed(2)}
      </div>
      {p.excerpt && <div className="mt-1 italic line-clamp-3">"{p.excerpt}"</div>}
    </div>
  );
};

export const SentimentTimelineChart = ({ recordingId, currentTime, onSeek, moments }: Props) => {
  const { data: timeline, isLoading } = useSentimentTimeline(recordingId);
  const analyze = useAnalyzeSentiment();

  const shifts = useMemo(() => (timeline ? detectShifts(timeline) : []), [timeline]);

  const handleClick = (e: any) => {
    const seg = e?.activePayload?.[0]?.payload;
    if (seg && onSeek) onSeek(seg.start_sec);
  };

  return (
    <Card className="glass">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Curva de sentimento
        </CardTitle>
        <Button
          size="sm"
          variant="outline"
          onClick={() => analyze.mutate(recordingId)}
          disabled={analyze.isPending}
          className="gap-1.5 h-7 text-xs"
        >
          <Sparkles className="h-3 w-3" />
          {analyze.isPending ? "Analisando..." : timeline?.length ? "Reanalisar" : "Analisar"}
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : !timeline?.length ? (
          <div className="text-center py-8 text-muted-foreground text-xs border border-dashed rounded-lg">
            Sem curva ainda. Clique em "Analisar" para gerar.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={timeline} onClick={handleClick} margin={{ top: 6, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="sentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--status-success))" stopOpacity={0.55} />
                  <stop offset="50%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="hsl(var(--destructive))" stopOpacity={0.55} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="start_sec"
                tickFormatter={(v) => formatTimestamp(Number(v))}
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
              />
              <YAxis domain={[-1, 1]} stroke="hsl(var(--muted-foreground))" fontSize={10} />
              <Tooltip content={<ChartTooltip />} />
              <ReferenceLine y={0} stroke="hsl(var(--border))" />
              <Area
                type="monotone"
                dataKey="score"
                stroke="hsl(var(--primary))"
                fill="url(#sentGrad)"
                strokeWidth={2}
                isAnimationActive={false}
              />
              {typeof currentTime === "number" && currentTime > 0 && (
                <ReferenceLine x={currentTime} stroke="hsl(var(--primary))" strokeDasharray="2 2" />
              )}
              {shifts.map((s, i) => (
                <ReferenceDot
                  key={i}
                  x={s.start_sec}
                  y={s.to}
                  r={5}
                  fill="hsl(var(--primary))"
                  stroke="hsl(var(--background))"
                  strokeWidth={2}
                />
              ))}
              {(moments ?? [])
                .filter((m) => m.severity === "high" || m.severity === "critical")
                .map((m) => (
                  <ReferenceLine
                    key={m.id}
                    x={m.timestamp_sec}
                    stroke={severityHexColor(m.severity)}
                    strokeWidth={1.5}
                    strokeDasharray="3 2"
                  />
                ))}
            </AreaChart>
          </ResponsiveContainer>
        )}
        {shifts.length > 0 && (
          <div className="mt-2 text-[11px] text-muted-foreground">
            {shifts.length} virada{shifts.length === 1 ? "" : "s"} detectada
            {shifts.length === 1 ? "" : "s"}. Clique no gráfico para ouvir.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
