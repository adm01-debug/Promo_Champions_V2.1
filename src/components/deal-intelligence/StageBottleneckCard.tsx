import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ArrowRight, Lightbulb, TrendingDown } from "lucide-react";
import type { StageBottleneckInsight } from "@/hooks/deal-intelligence/useStageConversion";
import {
  formatPct,
  impactLabel,
  severityClasses,
  severityLabel,
  stageLabel,
} from "./conversionHelpers";

interface Props {
  insight: StageBottleneckInsight;
}

export function StageBottleneckCard({ insight }: Props) {
  const sevClass = severityClasses[insight.severity];

  return (
    <Card variant="elevated" className="glass border-border/40 h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base capitalize flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
              {stageLabel(insight.stage)}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Conversão: <span className="font-semibold tabular-nums text-foreground">
                {formatPct(insight.conversion_rate)}
              </span>
            </p>
          </div>
          <Badge variant="outline" className={`text-[10px] ${sevClass}`}>
            {severityLabel[insight.severity]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-1">
        {insight.ai_summary && (
          <p className="text-sm text-foreground/90 leading-relaxed border-l-2 border-primary/40 pl-3">
            {insight.ai_summary}
          </p>
        )}

        {insight.top_loss_reasons?.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-2">
              <AlertTriangle className="h-3 w-3" /> Top motivos de perda
            </h4>
            <ul className="space-y-1.5">
              {insight.top_loss_reasons.slice(0, 3).map((r, i) => (
                <li key={i} className="flex items-center justify-between text-xs">
                  <span className="text-foreground/80 truncate">{r.reason}</span>
                  <Badge variant="secondary" className="ml-2 tabular-nums">{r.count}</Badge>
                </li>
              ))}
            </ul>
          </div>
        )}

        {insight.recommendations?.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-2">
              <Lightbulb className="h-3 w-3" /> Ações recomendadas
            </h4>
            <ul className="space-y-2">
              {insight.recommendations.slice(0, 5).map((r, i) => (
                <li key={i} className="text-xs bg-muted/40 rounded-lg p-2.5 border border-border/30">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-medium text-foreground flex items-center gap-1.5">
                      <ArrowRight className="h-3 w-3 text-primary" /> {r.title}
                    </span>
                    <Badge variant="outline" className="text-[9px] capitalize">
                      {impactLabel[r.impact]}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{r.action}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
