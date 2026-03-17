import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const STAGE_CONFIG: Record<string, { label: string; color: string }> = {
  lead: { label: "Lead", color: "bg-blue-500" },
  pending: { label: "Lead", color: "bg-blue-500" },
  qualified: { label: "Qualificado", color: "bg-indigo-500" },
  proposal: { label: "Proposta", color: "bg-amber-500" },
  negotiation: { label: "Negociação", color: "bg-orange-500" },
  won: { label: "Ganho", color: "bg-green-500" },
  completed: { label: "Fechado", color: "bg-green-600" },
  lost: { label: "Perdido", color: "bg-red-500" },
};

export function PipelineFunnelWidget() {
  const { data, isLoading } = useQuery({
    queryKey: ["pipeline-funnel-widget"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales")
        .select("status, amount")
        .not("status", "in", "(completed,lost)");
      if (error) throw error;

      const stages: Record<string, { count: number; value: number }> = {};
      (data || []).forEach(sale => {
        const s = sale.status || "pending";
        if (!stages[s]) stages[s] = { count: 0, value: 0 };
        stages[s].count++;
        stages[s].value += Number(sale.amount) || 0;
      });
      return stages;
    },
    staleTime: 60_000,
  });

  if (isLoading) return <Skeleton className="h-full w-full rounded-xl" />;

  const entries = Object.entries(data || {}).sort((a, b) => b[1].count - a[1].count);
  const maxCount = Math.max(...entries.map(([, v]) => v.count), 1);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          <BarChart3 className="h-3.5 w-3.5 text-blue-500" />
          Funil de Pipeline
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {entries.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">Nenhum deal no pipeline</p>
        )}
        {entries.map(([stage, info]) => {
          const config = STAGE_CONFIG[stage] || { label: stage, color: "bg-muted-foreground" };
          const pct = (info.count / maxCount) * 100;
          return (
            <div key={stage} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-medium">{config.label}</span>
                <span className="text-muted-foreground">{info.count} deals</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full transition-all", config.color)} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
