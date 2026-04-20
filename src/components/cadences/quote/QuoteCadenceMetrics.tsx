import { Card, CardContent } from "@/components/ui/card";
import { SkeletonShimmer } from "@/components/ui/skeleton-shimmer";
import { Send, CheckCircle2, TrendingUp, AlertTriangle } from "lucide-react";
import { useQuoteCadenceStats } from "@/hooks/cadences/useQuoteCadences";

export function QuoteCadenceMetrics() {
  const { data, isLoading } = useQuoteCadenceStats();

  const items = [
    { label: "Follow-ups ativos", value: data?.activeFollowUps ?? 0, icon: Send, color: "text-primary" },
    { label: "Tarefas concluídas hoje", value: data?.tasksCompletedToday ?? 0, icon: CheckCircle2, color: "text-emerald-500" },
    { label: "Taxa de conversão", value: `${data?.conversionRate ?? 0}%`, icon: TrendingUp, color: "text-amber-500" },
    { label: "Atrasados", value: data?.overdueCount ?? 0, icon: AlertTriangle, color: "text-destructive" },
  ];

  return (
    <div
      role="region"
      aria-label="Métricas de cadência de orçamentos"
      className="grid grid-cols-2 md:grid-cols-4 gap-4"
    >
      {items.map((it) => (
        <Card key={it.label} className="glass border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{it.label}</span>
              <it.icon className={`h-4 w-4 ${it.color}`} aria-hidden="true" />
            </div>
            {isLoading ? (
              <SkeletonShimmer width={80} height={32} />
            ) : (
              <p
                role="status"
                aria-live="polite"
                aria-label={`${it.label}: ${it.value}`}
                className="font-display text-3xl font-bold"
              >
                {it.value}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
