import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Send, CheckCircle2, TrendingUp } from "lucide-react";
import { useQuoteCadenceStats } from "@/hooks/cadences/useQuoteCadences";

export function QuoteCadenceMetrics() {
  const { data, isLoading } = useQuoteCadenceStats();

  const items = [
    { label: "Follow-ups ativos", value: data?.activeFollowUps ?? 0, icon: Send, color: "text-primary" },
    { label: "Tarefas concluídas hoje", value: data?.tasksCompletedToday ?? 0, icon: CheckCircle2, color: "text-emerald-500" },
    { label: "Taxa de conversão", value: `${data?.conversionRate ?? 0}%`, icon: TrendingUp, color: "text-amber-500" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {items.map((it) => (
        <Card key={it.label} className="glass border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{it.label}</span>
              <it.icon className={`h-4 w-4 ${it.color}`} />
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <p className="font-display text-3xl font-bold">{it.value}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
