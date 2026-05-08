import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CACHE_TIMES } from "@/constants";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Heart, TrendingUp, TrendingDown, Minus, Activity, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

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

  if (client.total_value > 50000) { score += 20; factors.push("High Asset Value"); }
  else if (client.total_value > 10000) { score += 10; factors.push("Moderate Revenue"); }
  else { score -= 10; factors.push("Low Revenue Profile"); }

  if (client.last_purchase_date) {
    const daysSince = Math.floor((Date.now() - new Date(client.last_purchase_date).getTime()) / 86400000);
    if (daysSince < 30) { score += 20; factors.push("Recent Signal Detected"); }
    else if (daysSince < 90) { score += 5; factors.push("Active within 90d window"); }
    else { score -= 15; factors.push(`Signal Lost: ${daysSince} days`); }
  } else {
    score -= 20;
    factors.push("No Signal Record");
  }

  if (client.activity_count >= 5) { score += 10; factors.push("High Engagement Telemetry"); }
  else if (client.activity_count >= 2) { score += 5; }
  else { score -= 10; factors.push("Engagement Anomalies Detected"); }

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
  healthy: { label: "Stable", color: "text-success bg-success/10 border-success/30", icon: TrendingUp },
  at_risk: { label: "Fluctuating", color: "text-warning bg-warning/10 border-warning/30", icon: Minus },
  critical: { label: "Decaying", color: "text-destructive bg-destructive/10 border-destructive/30", icon: TrendingDown },
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
    <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-black/40 backdrop-blur-xl p-5 space-y-6 group">
      {/* Decorative corners */}
      <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none">
        <div className="absolute top-2 right-2 w-1.5 h-1.5 border-t border-r border-primary/20 group-hover:border-primary/40 transition-colors" />
      </div>

      <div className="flex items-center gap-3 relative z-10">
        <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
          <Heart className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="text-xs font-mono font-bold uppercase tracking-[0.3em] text-primary">Biometric Asset Status</h3>
          <p className="text-[9px] font-mono text-muted-foreground/60 uppercase tracking-widest">Client Health Telemetry</p>
        </div>
      </div>

      {/* Summary grid */}
      <div className="grid grid-cols-3 gap-3 relative z-10">
        {(["healthy", "at_risk", "critical"] as const).map((cat) => {
          const config = CATEGORY_CONFIG[cat];
          const Icon = config.icon;
          return (
            <div key={cat} className={cn("relative rounded-xl p-3 border text-center group/item transition-all hover:bg-white/5", config.color)}>
              <Icon className="h-3.5 w-3.5 mx-auto mb-1.5" />
              <p className="text-2xl font-mono font-black tabular-nums">{summary[cat]}</p>
              <p className="text-[8px] font-mono font-bold uppercase tracking-widest opacity-60">{config.label}</p>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[1px] bg-current opacity-20" />
            </div>
          );
        })}
      </div>

      {/* Detail list */}
      <div className="relative z-10 space-y-2">
        <div className="flex items-center gap-2 mb-2">
           <ShieldAlert className="h-3 w-3 text-destructive/60" />
           <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-muted-foreground">Anomaly Priority List</span>
        </div>
        
        {isLoading ? (
          <div className="space-y-2">
             {[1, 2, 3].map((i) => <div key={i} className="h-10 rounded-lg bg-white/5 animate-pulse" />)}
          </div>
        ) : (
          <div className="space-y-1.5 max-h-56 overflow-y-auto scrollbar-none hover:scrollbar-thin pr-1">
            {(healthScores || []).filter((h) => h.category !== "healthy").slice(0, 10).map((h, idx) => {
              const config = CATEGORY_CONFIG[h.category];
              return (
                <motion.div 
                  key={h.client_id} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/20 transition-all group/row"
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-[11px] font-mono font-black uppercase truncate group-row:text-primary transition-colors">{h.client_name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                       <Activity className="h-2.5 w-2.5 text-muted-foreground/40" />
                       <p className="text-[8px] font-mono text-muted-foreground/60 uppercase tracking-tighter truncate">{h.factors[0]}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                       <span className={cn("text-xs font-mono font-black tabular-nums", h.score < 40 ? "text-destructive" : "text-warning")}>
                        {h.score}
                      </span>
                      <p className="text-[7px] font-mono uppercase tracking-tighter text-muted-foreground/40">Score</p>
                    </div>
                    <Badge variant="outline" className={cn("text-[8px] font-mono font-black uppercase tracking-widest h-5 px-1.5 bg-black/40", config.color)}>
                      {config.label}
                    </Badge>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Decorative vertical scanline */}
      <motion.div 
        className="absolute top-0 right-0 w-[1px] h-full bg-primary/10"
        animate={{ opacity: [0.1, 0.4, 0.1] }}
        transition={{ duration: 7, repeat: Infinity }}
      />
    </div>
  );
});
ClientHealthPanel.displayName = "ClientHealthPanel";