import { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Lightbulb, Sparkles } from "lucide-react";

interface Props {
  narrative: string;
  risks: string[];
  opportunities: string[];
}

export const ForecastNarrativeCard: FC<Props> = ({ narrative, risks, opportunities }) => {
  if (!narrative && !risks.length && !opportunities.length) return null;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Insights da IA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {narrative && (
          <p className="text-sm text-muted-foreground leading-relaxed">{narrative}</p>
        )}
        <div className="grid gap-4 md:grid-cols-2">
          {risks.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                <Badge variant="outline" className="text-[10px] h-5 border-destructive/30 text-destructive">
                  Riscos
                </Badge>
              </div>
              <ul className="space-y-1.5">
                {risks.map((r, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex gap-2">
                    <span className="text-destructive mt-0.5">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {opportunities.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-3.5 w-3.5 text-emerald-500" />
                <Badge variant="outline" className="text-[10px] h-5 border-emerald-500/30 text-emerald-500">
                  Oportunidades
                </Badge>
              </div>
              <ul className="space-y-1.5">
                {opportunities.map((o, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex gap-2">
                    <span className="text-emerald-500 mt-0.5">•</span>
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
