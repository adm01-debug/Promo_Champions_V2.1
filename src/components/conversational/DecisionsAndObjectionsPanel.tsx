import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ShieldAlert } from "lucide-react";
import { objectionCategoryColor, type Decision, type Objection } from "./meetingSummaryHelpers";

interface Props {
  decisions: Decision[];
  objections: Objection[];
}

export const DecisionsAndObjectionsPanel = ({ decisions, objections }: Props) => {
  if (!decisions?.length && !objections?.length) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card variant="success">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle2 className="size-4 text-status-success" />
            Decisões ({decisions?.length ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {decisions?.length ? (
            decisions.map((d, i) => (
              <div key={i} className="text-sm border-l-2 border-status-success/40 pl-3 py-1">
                <p className="leading-snug">{d.text}</p>
                {d.made_by_hint && (
                  <p className="text-xs text-muted-foreground mt-0.5">— {d.made_by_hint}</p>
                )}
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground">Nenhuma decisão registrada.</p>
          )}
        </CardContent>
      </Card>

      <Card variant="warning">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldAlert className="size-4 text-status-warning" />
            Objeções ({objections?.length ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {objections?.length ? (
            objections.map((o, i) => (
              <div key={i} className="text-sm space-y-1">
                <p className="leading-snug">{o.text}</p>
                <Badge variant="outline" className={objectionCategoryColor[o.category] + " text-xs capitalize"}>
                  {o.category}
                </Badge>
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground">Nenhuma objeção identificada.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
