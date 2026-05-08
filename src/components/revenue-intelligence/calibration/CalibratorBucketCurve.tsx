import { FC, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCalibrationBuckets } from "@/hooks/revenue/useWinProbabilityCalibrator";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const CalibratorBucketCurve: FC = () => {
  const [stage, setStage] = useState<string>("all");
  const { data: buckets } = useCalibrationBuckets();

  const stages = useMemo(() => {
    const s = new Set<string>();
    (buckets ?? []).forEach((b) => s.add(b.stage));
    return Array.from(s);
  }, [buckets]);

  const data = useMemo(() => {
    const filtered = (buckets ?? []).filter((b) => stage === "all" || b.stage === stage);
    const map = new Map<number, { declared: number; actualSum: number; sample: number }>();
    for (const b of filtered) {
      const mid = (Number(b.bucket_min) + Number(b.bucket_max)) / 2;
      const cur = map.get(mid) ?? { declared: mid, actualSum: 0, sample: 0 };
      cur.actualSum += Number(b.actual_win_rate) * 100 * b.sample_size;
      cur.sample += b.sample_size;
      map.set(mid, cur);
    }
    return Array.from(map.values())
      .map((v) => ({
        declared: v.declared,
        ideal: v.declared,
        actual: v.sample > 0 ? Number((v.actualSum / v.sample).toFixed(2)) : 0,
        sample: v.sample,
      }))
      .sort((a, b) => a.declared - b.declared);
  }, [buckets, stage]);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
        <CardTitle className="text-base">Curva por Bucket de Probabilidade</CardTitle>
        <Select value={stage} onValueChange={setStage}>
          <SelectTrigger className="w-40 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos estágios</SelectItem>
            {stages.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Sem dados ainda. Clique em Recalibrar.</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="declared" type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} formatter={(v: any) => `${v.toFixed(1)}%`} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="ideal" stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" dot={false} name="Ideal" />
              <Line type="monotone" dataKey="actual" stroke="hsl(var(--primary))" strokeWidth={2} name="Taxa real" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
