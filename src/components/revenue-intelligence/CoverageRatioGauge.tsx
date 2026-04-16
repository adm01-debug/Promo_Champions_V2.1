import { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

interface Props {
  ratio: number;
  target: number;
  weightedPipeline: number;
  healthLabel: "excellent" | "healthy" | "warning" | "critical";
}

const config = {
  excellent: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/30", label: "Excelente" },
  healthy: { icon: Shield, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/30", label: "Saudável" },
  warning: { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/30", label: "Atenção" },
  critical: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30", label: "Crítico" },
};

export const CoverageRatioGauge: FC<Props> = ({ ratio, target, weightedPipeline, healthLabel }) => {
  const cfg = config[healthLabel];
  const Icon = cfg.icon;
  const pct = Math.min((ratio / 4) * 100, 100);
  const fmt = (n: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(n);

  return (
    <Card className={`glass border ${cfg.border}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="font-display text-base">Pipeline Coverage Ratio</CardTitle>
          <Badge className={`${cfg.bg} ${cfg.color} border-0`}>
            <Icon className="h-3 w-3 mr-1" />{cfg.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-2 mb-3">
          <span className={`text-5xl font-display font-bold ${cfg.color}`}>{ratio.toFixed(1)}x</span>
          <span className="text-sm text-muted-foreground mb-2">do target (ideal: 3x-4x)</span>
        </div>
        <Progress value={pct} className="h-2 mb-3" />
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-xs text-muted-foreground">Pipeline ponderado</div>
            <div className="font-medium">{fmt(weightedPipeline)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Target</div>
            <div className="font-medium">{fmt(target)}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
