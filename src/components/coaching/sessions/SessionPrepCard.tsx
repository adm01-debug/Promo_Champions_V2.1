import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, AlertTriangle, TrendingDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useSessionPrep } from "@/hooks/coaching/useCoachingSessions";
import { Badge } from "@/components/ui/badge";

interface Props {
  salespersonId: string;
}

export function SessionPrepCard({ salespersonId }: Props) {
  const { data, isLoading } = useSessionPrep(salespersonId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader><CardTitle>Preparação da sessão</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <Card variant="primary">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Preparação inteligente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.top_gaps.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-1.5 mb-2">
              <TrendingDown className="h-3.5 w-3.5" /> Top gaps
            </p>
            <div className="flex flex-wrap gap-2">
              {data.top_gaps.map((g) => (
                <Badge key={g.skill} variant="outline" className="border-warning/40 text-warning">
                  {g.label} · {g.score}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {data.at_risk_deals.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-1.5 mb-2">
              <AlertTriangle className="h-3.5 w-3.5" /> Deals em aberto
            </p>
            <ul className="text-sm space-y-1">
              {data.at_risk_deals.slice(0, 3).map((d) => (
                <li key={d.id} className="flex justify-between">
                  <span className="truncate">{d.name}</span>
                  <span className="text-muted-foreground">R$ {d.amount.toLocaleString("pt-BR")}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.ai_talking_points.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-1.5 mb-2">
              <Sparkles className="h-3.5 w-3.5" /> Talking points IA
            </p>
            <ul className="text-sm space-y-1.5 list-disc list-inside text-foreground/90">
              {data.ai_talking_points.map((tp, i) => <li key={i}>{tp}</li>)}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
