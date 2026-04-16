import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CACHE_TIMES } from "@/constants";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Heart, TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react";

interface ClientHealth {
  client_id: string;
  client_name: string;
  score: number;
  category: "healthy" | "at_risk" | "critical";
  factors: string[];
  total_value: number;
  last_purchase: string | null;
}

function computeHealthScore(client: {
  total_value: number;
  last_purchase_date: string | null;
  activity_count: number;
}): { score: number; category: "healthy" | "at_risk" | "critical"; factors: string[] } {
  let score = 50;
  const factors: string[] = [];

  // Revenue factor
  if (client.total_value > 50000) { score += 20; factors.push("Alto valor de compras"); }
  else if (client.total_value > 10000) { score += 10; factors.push("Valor moderado"); }
  else { score -= 10; factors.push("Baixo valor"); }

  // Recency factor
  if (client.last_purchase_date) {
    const daysSince = Math.floor((Date.now() - new Date(client.last_purchase_date).getTime()) / 86400000);
    if (daysSince < 30) { score += 20; factors.push("Compra recente"); }
    else if (daysSince < 90) { score += 5; factors.push("Compra nos últimos 90 dias"); }
    else { score -= 15; factors.push(`Sem compra há ${daysSince} dias`); }
  } else {
    score -= 20;
    factors.push("Sem histórico de compras");
  }

  // Activity factor
  if (client.activity_count >= 5) { score += 10; factors.push("Engajamento alto"); }
  else if (client.activity_count >= 2) { score += 5; }
  else { score -= 10; factors.push("Baixo engajamento"); }

  score = Math.max(0, Math.min(100, score));
  const category = score >= 70 ? "healthy" : score >= 40 ? "at_risk" : "critical";

  return { score, category, factors };
}

export const useClientHealthScores = () => {
  return useQuery<ClientHealth[]>({
    queryKey: ["client-health-scores"],
    queryFn: async () => {
      const { data: portfolios } = await supabase
        .from("client_portfolio")
        .select("client_id, last_purchase_date")
        .eq("status", "active");

      const { data: clients } = await supabase
        .from("clients")
        .select("id, name, total_value")
        .order("total_value", { ascending: false })
        .limit(50);

      const { data: activities } = await supabase
        .from("activities")
        .select("sale_id, id");

      const activityMap: Record<string, number> = {};
      (activities || []).forEach((a) => {
        const key = a.sale_id || "none";
        activityMap[key] = (activityMap[key] || 0) + 1;
      });

      const portfolioMap: Record<string, string | null> = {};
      (portfolios || []).forEach((p) => {
        portfolioMap[p.client_id] = p.last_purchase_date;
      });

      return (clients || []).map((c) => {
        const { score, category, factors } = computeHealthScore({
          total_value: c.total_value,
          last_purchase_date: portfolioMap[c.id] || null,
          activity_count: activityMap[c.id] || 0,
        });
        return {
          client_id: c.id,
          client_name: c.name,
          score,
          category,
          factors,
          total_value: c.total_value,
          last_purchase: portfolioMap[c.id] || null,
        };
      }).sort((a, b) => a.score - b.score);
    },
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.GC_TIME,
  });
};

const CATEGORY_CONFIG = {
  healthy: { label: "Saudável", color: "text-status-success bg-status-success/10 border-status-success/30", icon: TrendingUp },
  at_risk: { label: "Em Risco", color: "text-status-warning bg-status-warning/10 border-status-warning/30", icon: Minus },
  critical: { label: "Crítico", color: "text-destructive bg-destructive/10 border-destructive/30", icon: TrendingDown },
};

export const ClientHealthPanel = React.memo(() => {
  const { data: healthScores, isLoading } = useClientHealthScores();

  const summary = useMemo(() => {
    if (!healthScores) return { healthy: 0, at_risk: 0, critical: 0 };
    return {
      healthy: healthScores.filter((h) => h.category === "healthy").length,
      at_risk: healthScores.filter((h) => h.category === "at_risk").length,
      critical: healthScores.filter((h) => h.category === "critical").length,
    };
  }, [healthScores]);

  return (
    <div className="glass rounded-xl border border-border/40 p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Heart className="h-4 w-4 text-primary" />
        <h3 className="font-display font-semibold text-sm">Health Score dos Clientes</h3>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-2">
        {(["healthy", "at_risk", "critical"] as const).map((cat) => {
          const config = CATEGORY_CONFIG[cat];
          const Icon = config.icon;
          return (
            <div key={cat} className={cn("rounded-lg p-2 border text-center", config.color)}>
              <Icon className="h-3.5 w-3.5 mx-auto mb-1" />
              <p className="text-lg font-bold">{summary[cat]}</p>
              <p className="text-[10px]">{config.label}</p>
            </div>
          );
        })}
      </div>

      {/* Critical clients */}
      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
      ) : (
        <div className="space-y-1.5 max-h-48 overflow-y-auto scrollbar-thin">
          {(healthScores || []).filter((h) => h.category !== "healthy").slice(0, 8).map((h) => {
            const config = CATEGORY_CONFIG[h.category];
            return (
              <div key={h.client_id} className="flex items-center justify-between py-1.5 px-2 rounded-md bg-muted/20">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{h.client_name}</p>
                  <p className="text-[10px] text-muted-foreground">{h.factors[0]}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("text-xs font-bold", h.score < 40 ? "text-destructive" : "text-status-warning")}>
                    {h.score}
                  </span>
                  <Badge variant="outline" className={cn("text-[10px] px-1", config.color)}>{config.label}</Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});
ClientHealthPanel.displayName = "ClientHealthPanel";
