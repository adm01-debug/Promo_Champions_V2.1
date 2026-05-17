import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const STAGE_CONFIG: Record<string, { label: string; color: string; gradient: string }> = {
  lead: { label: "Lead", color: "bg-[#0EA5E9]", gradient: "from-[#0EA5E9] to-[#38BDF8]" },
  pending: { label: "Lead", color: "bg-[#0EA5E9]", gradient: "from-[#0EA5E9] to-[#38BDF8]" },
  qualified: { label: "Qualificado", color: "bg-[#8B5CF6]", gradient: "from-[#8B5CF6] to-[#A78BFA]" },
  proposal: { label: "Proposta", color: "bg-[#F59E0B]", gradient: "from-[#F59E0B] to-[#FBBF24]" },
  negotiation: { label: "Negociação", color: "bg-[#D946EF]", gradient: "from-[#D946EF] to-[#F472B6]" },
  won: { label: "Ganho", color: "bg-[#10B981]", gradient: "from-[#10B981] to-[#34D399]" },
  completed: { label: "Fechado", color: "bg-[#10B981]", gradient: "from-[#10B981] to-[#34D399]" },
  lost: { label: "Perdido", color: "bg-[#EF4444]", gradient: "from-[#EF4444] to-[#F87171]" },
};

export const PipelineFunnelWidget = React.memo(function PipelineFunnelWidget() {
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
    <Card className="h-full border-none shadow-sm bg-gradient-to-br from-card to-card/50 overflow-hidden group">
      <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
        <CardTitle className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-info/10">
            <BarChart3 className="h-3.5 w-3.5 text-info" />
          </div>
          Funil de Pipeline
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-5 pb-5 space-y-4">
        {entries.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 space-y-2 opacity-50">
            <BarChart3 className="h-8 w-8 text-muted-foreground/30" />
            <p className="text-xs text-muted-foreground italic font-medium">Pipeline limpo no momento</p>
          </div>
        )}
        <div className="relative">
          {entries.map(([stage, info], index) => {
            const config = STAGE_CONFIG[stage] || { label: stage, color: "bg-muted-foreground", gradient: "from-muted-foreground to-muted" };
            const pct = (info.count / maxCount) * 100;
            return (
              <div key={stage} className={cn("space-y-1.5 transition-all duration-500", index !== 0 && "mt-4")}>
                <div className="flex justify-between text-[11px] items-end">
                  <span className="font-bold text-foreground/90 uppercase tracking-tight">{config.label}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-primary">{info.count}</span>
                    <span className="text-[10px] text-muted-foreground font-medium uppercase opacity-60">Negócios</span>
                  </div>
                </div>
                <div className="h-[6px] bg-muted/40 rounded-full overflow-hidden relative shadow-inner">
                  <div 
                    className={cn("h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r shadow-lg relative z-10", config.gradient)} 
                    style={{ width: `${pct}%`, transitionDelay: `${index * 150}ms` }} 
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse mix-blend-overlay" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
});

PipelineFunnelWidget.displayName = "PipelineFunnelWidget";
