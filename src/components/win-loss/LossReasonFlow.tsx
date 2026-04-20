import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, Treemap, Tooltip } from "recharts";
import { GitBranch } from "lucide-react";
import type { WLAnalysisRow } from "@/hooks/win-loss/useWinLossData";
import { stageLabel } from "@/components/deal-intelligence/winloss/winLossHelpers";

interface Props {
  rows: WLAnalysisRow[];
  onLeafClick?: (stage: string, reason: string) => void;
}

interface Leaf { name: string; size: number; stage: string; reason: string; fill: string }
interface Node { name: string; children: Leaf[] }

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--destructive))",
  "hsl(220 70% 50%)",
  "hsl(160 70% 45%)",
  "hsl(280 65% 55%)",
  "hsl(40 90% 55%)",
];

export function LossReasonFlow({ rows, onLeafClick }: Props) {
  const data: Node[] = useMemo(() => {
    const grouped = new Map<string, Map<string, number>>();
    rows.filter(r => r.outcome === "lost").forEach(r => {
      const stage = r.lost_stage ?? "—";
      const reason = r.primary_reason ?? "—";
      const inner = grouped.get(stage) ?? new Map<string, number>();
      inner.set(reason, (inner.get(reason) ?? 0) + 1);
      grouped.set(stage, inner);
    });
    return Array.from(grouped.entries()).map(([stage, reasons], i) => ({
      name: stageLabel(stage),
      children: Array.from(reasons.entries()).map(([reason, count]) => ({
        name: reason,
        size: count,
        stage,
        reason,
        fill: COLORS[i % COLORS.length],
      })),
    }));
  }, [rows]);

  const empty = data.length === 0;

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <GitBranch className="h-4 w-4 text-primary" />
          Funil de motivos de perda
        </CardTitle>
      </CardHeader>
      <CardContent>
        {empty ? (
          <p className="text-sm text-muted-foreground py-12 text-center">Sem perdas registradas.</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <Treemap
              data={data}
              dataKey="size"
              stroke="hsl(var(--background))"
              isAnimationActive={false}
              onClick={(node: unknown) => {
                const n = node as { stage?: string; reason?: string };
                if (onLeafClick && n.stage && n.reason) onLeafClick(n.stage, n.reason);
              }}
            >
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                formatter={(value: number, _name: string, item: { payload?: { reason?: string } }) =>
                  [`${value} perdas`, item?.payload?.reason ?? ""]
                }
              />
            </Treemap>
          </ResponsiveContainer>
        )}
        <p className="text-[10px] text-muted-foreground mt-2">Tamanho proporcional ao volume — clique para drill-down.</p>
      </CardContent>
    </Card>
  );
}
