import { memo, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Hourglass } from "lucide-react";
import type { WLAnalysisRow } from "@/hooks/win-loss/useWinLossData";

interface Props {
  rows: WLAnalysisRow[];
  onBinClick?: (binLabel: string, outcome: "won" | "lost") => void;
}

const BINS: { label: string; min: number; max: number }[] = [
  { label: "0-7d", min: 0, max: 7 },
  { label: "8-14d", min: 8, max: 14 },
  { label: "15-30d", min: 15, max: 30 },
  { label: "31-60d", min: 31, max: 60 },
  { label: "60+", min: 61, max: Infinity },
];

interface BinDatum { label: string; won: number; lost: number }

export const CycleTimeHistogram = memo(function CycleTimeHistogram({ rows, onBinClick }: Props) {
  const data: BinDatum[] = useMemo(() => {
    const buckets = BINS.map(b => ({ label: b.label, won: 0, lost: 0 }));
    rows.forEach(r => {
      const days = Number(r.cycle_days) || 0;
      if (days <= 0) return;
      const idx = BINS.findIndex(b => days >= b.min && days <= b.max);
      if (idx === -1) return;
      if (r.outcome === "won") buckets[idx].won++;
      else buckets[idx].lost++;
    });
    return buckets;
  }, [rows]);

  const empty = data.every(d => d.won === 0 && d.lost === 0);

  return (
    <Card className="glass border-border/40 hover:border-primary/40 transition-all duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Hourglass className="h-4 w-4 text-primary" />
          Tempo até fechamento (Won vs. Lost)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {empty ? (
          <p className="text-sm text-muted-foreground py-12 text-center">Sem ciclos registrados.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="label" className="text-xs" />
              <YAxis className="text-xs" allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar
                dataKey="won"
                name="Won"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
                onClick={(d: any) => onBinClick?.(d.label as string, "won")}
                style={{ cursor: onBinClick ? "pointer" : undefined }}
              />
              <Bar
                dataKey="lost"
                name="Lost"
                fill="hsl(var(--destructive))"
                radius={[4, 4, 0, 0]}
                onClick={(d: any) => onBinClick?.(d.label as string, "lost")}
                style={{ cursor: onBinClick ? "pointer" : undefined }}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
});
