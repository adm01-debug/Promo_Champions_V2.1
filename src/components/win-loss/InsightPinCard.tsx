import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pin, Sparkles, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  severityClasses,
  severityLabel,
  insightTypeLabel,
  type Severity,
} from "@/components/deal-intelligence/winloss/winLossHelpers";

interface PinInsight {
  id: string;
  title: string;
  description: string;
  severity: Severity | string | null;
  insight_type: string;
}

interface Props {
  insights: PinInsight[];
  onCopilot?: (insight: PinInsight) => void;
}

const severityWeight: Record<string, number> = { risk: 3, opportunity: 2, info: 1 };

export function InsightPinCard({ insights, onCopilot }: Props) {
  const top = [...insights]
    .sort((a, b) => (severityWeight[b.severity ?? "info"] ?? 0) - (severityWeight[a.severity ?? "info"] ?? 0))
    .slice(0, 3);

  if (!top.length) return null;

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-3">
          <Pin className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Pin do dia · Top 3 insights</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {top.map(i => {
            const sev = (i.severity ?? "info") as Severity;
            return (
              <div key={i.id} className="rounded-lg border border-border/50 p-2.5 bg-card">
                <div className="flex items-start justify-between gap-1 mb-1">
                  <Badge variant="outline" className={`text-[10px] ${severityClasses[sev]}`}>
                    {severityLabel[sev]}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    {insightTypeLabel[i.insight_type] ?? i.insight_type}
                  </Badge>
                </div>
                <p className="text-xs font-medium line-clamp-2">{i.title}</p>
                <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">{i.description}</p>
                {onCopilot && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2 text-[11px] mt-2 w-full justify-start"
                    onClick={() => onCopilot(i)}
                  >
                    <Sparkles className="h-3 w-3 mr-1" /> Plano de ação
                    <MessageSquare className="h-3 w-3 ml-auto opacity-60" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
