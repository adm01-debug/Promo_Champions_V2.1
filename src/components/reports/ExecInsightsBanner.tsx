import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, CheckCircle2, AlertTriangle, Brain } from "lucide-react";

interface Insight {
  type: "success" | "warning" | "info";
  text: string;
}

interface ExecInsightsBannerProps {
  insights: Insight[];
  periodLabel: string;
}

const ICON_MAP = {
  success: <CheckCircle2 className="h-4 w-4 text-status-success mt-0.5 shrink-0" />,
  warning: <AlertTriangle className="h-4 w-4 text-status-warning mt-0.5 shrink-0" />,
  info: <Brain className="h-4 w-4 text-primary mt-0.5 shrink-0" />,
};

export const ExecInsightsBanner = React.memo(function ExecInsightsBanner({ insights, periodLabel }: ExecInsightsBannerProps) {
  if (insights.length === 0) return null;

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Insights Automáticos — {periodLabel}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {insights.map((insight, i) => (
          <div key={i} className="flex items-start gap-2 text-sm">
            {ICON_MAP[insight.type]}
            <span className="text-muted-foreground">{insight.text}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
});
