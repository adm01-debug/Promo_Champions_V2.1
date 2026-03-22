import { usePlaybookAdherence } from "@/hooks/usePlaybooks";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Target, CheckCircle } from "lucide-react";

export const PlaybookAdherenceStats = () => {
  const { data: adherence } = usePlaybookAdherence();

  if (!adherence || adherence.totalItems === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <Card className="glass border-border/40">
        <CardContent className="p-4 flex flex-col items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <span className="text-2xl font-bold font-display">{adherence.totalItems}</span>
          <span className="text-xs text-muted-foreground">Total de Itens</span>
        </CardContent>
      </Card>

      <Card className="glass border-border/40">
        <CardContent className="p-4 flex flex-col items-center gap-2">
          <CheckCircle className="h-5 w-5 text-status-success" />
          <span className="text-2xl font-bold font-display">{adherence.completedItems}</span>
          <span className="text-xs text-muted-foreground">Completados</span>
        </CardContent>
      </Card>

      <Card className="glass border-border/40 col-span-2">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Taxa de Aderência</span>
            <span className="text-sm font-bold text-primary">{adherence.overallRate}%</span>
          </div>
          <Progress value={adherence.overallRate} className="h-2" />
          <div className="flex gap-4 mt-2">
            <div className="flex-1">
              <div className="flex items-center gap-1 text-xs text-status-success mb-1">
                <TrendingUp className="h-3 w-3" />
                <span>Mais completados</span>
              </div>
              {adherence.mostCompleted.slice(0, 2).map((item) => (
                <p key={item.itemId} className="text-[11px] text-muted-foreground truncate">
                  {item.content} ({item.completions}x)
                </p>
              ))}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1 text-xs text-status-warning mb-1">
                <TrendingDown className="h-3 w-3" />
                <span>Menos completados</span>
              </div>
              {adherence.leastCompleted.slice(0, 2).map((item) => (
                <p key={item.itemId} className="text-[11px] text-muted-foreground truncate">
                  {item.content} ({item.completions}x)
                </p>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
