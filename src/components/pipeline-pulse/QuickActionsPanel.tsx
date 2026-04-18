import { FC, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Route, TrendingUp, MessageSquare, CheckCircle2 } from "lucide-react";
import { useQuickAction, type QuickActionId } from "@/hooks/pipeline-pulse/useQuickAction";

const ACTIONS: Array<{ id: QuickActionId; label: string; icon: typeof Activity; description: string }> = [
  { id: "recompute-health", label: "Recomputar Health Scores", icon: Activity, description: "Reavalia todos os deals abertos" },
  { id: "route-pending-leads", label: "Rotear leads pendentes", icon: Route, description: "Distribui leads na fila para closers" },
  { id: "refresh-forecast", label: "Gerar forecast atualizado", icon: TrendingUp, description: "Recalcula projeção 30d com IA" },
  { id: "analyze-recent-calls", label: "Analisar últimas calls", icon: MessageSquare, description: "Processa transcrições pendentes" },
];

export const QuickActionsPanel: FC = () => {
  const action = useQuickAction();
  const [lastRun, setLastRun] = useState<Record<string, string>>({});

  const handleRun = (id: QuickActionId) => {
    action.mutate(id, {
      onSuccess: () => setLastRun((p) => ({ ...p, [id]: new Date().toLocaleTimeString("pt-BR") })),
    });
  };

  return (
    <Card variant="elevated" className="h-full">
      <CardHeader>
        <CardTitle className="text-base">Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {ACTIONS.map((a) => {
          const Icon = a.icon;
          const isRunning = action.isPending && action.variables === a.id;
          const last = lastRun[a.id];
          return (
            <div key={a.id} className="rounded-lg border border-border/40 p-3 hover:bg-accent/5 transition-colors">
              <div className="flex items-start gap-3">
                <div className="rounded-md bg-primary/10 p-2 shrink-0">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{a.label}</p>
                  <p className="text-xs text-muted-foreground">{a.description}</p>
                  {last && (
                    <p className="text-[10px] text-status-success mt-1 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Última run: {last}
                    </p>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRun(a.id)}
                  loading={isRunning}
                  loadingText="..."
                  className="shrink-0"
                >
                  Executar
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
