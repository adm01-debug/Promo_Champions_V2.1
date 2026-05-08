import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const RecentDeals = React.memo(() => {
  const { data: deals, isLoading } = useQuery({
    queryKey: ["recent-deals-dashboard"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales")
        .select("id, client_name, amount, status, created_at")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <Card className="h-full bg-black/40 border-white/5 backdrop-blur-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-mono font-bold uppercase tracking-[0.3em] flex items-center gap-2 text-primary/60">
            <Clock className="h-4 w-4" />
            Initializing Feed
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse border border-white/5" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const statusConfig: Record<string, { label: string; color: string; glow: string }> = {
    completed: { label: "Confirmed", color: "text-success", glow: "rgba(34, 197, 94, 0.4)" },
    pending: { label: "Syncing", color: "text-warning", glow: "rgba(234, 179, 8, 0.4)" },
    negotiation: { label: "Transmitting", color: "text-primary", glow: "rgba(14, 165, 233, 0.4)" },
    qualified: { label: "Verified", color: "text-accent-foreground", glow: "rgba(255, 255, 255, 0.2)" },
    proposal: { label: "Uplinking", color: "text-info", glow: "rgba(0, 186, 255, 0.4)" },
    lost: { label: "Dropped", color: "text-destructive", glow: "rgba(239, 68, 68, 0.4)" },
  };

  return (
    <Card className="h-full relative overflow-hidden bg-black/40 border-white/5 backdrop-blur-md group">
      {/* Decorative corner */}
      <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none">
        <div className="absolute top-2 right-2 w-1.5 h-1.5 border-t border-r border-primary/20 group-hover:border-primary/40 transition-colors" />
      </div>

      <CardHeader className="pb-3 relative z-10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-mono font-bold uppercase tracking-[0.3em] flex items-center gap-2 text-primary">
            <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
              <Clock className="h-3.5 w-3.5" />
            </div>
            Tactical Feed
          </CardTitle>
          <div className="flex items-center gap-2 px-2 py-0.5 rounded-full bg-success/10 border border-success/30">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-75 animate-ping" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
            </span>
            <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-success">Live</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-2.5 relative z-10">
        {deals && deals.length > 0 ? deals.map((deal, idx) => {
          const cfg = statusConfig[deal.status || "pending"] || statusConfig.pending;
          return (
            <motion.div
              key={deal.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group/item relative flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-primary/30 hover:bg-white/[0.05] transition-all cursor-default"
            >
              <div className="min-w-0 flex-1 pr-4">
                <p className="text-[11px] font-mono font-bold uppercase tracking-tight truncate group-hover/item:text-primary transition-colors">
                  {deal.client_name}
                </p>
                <div className="flex items-center gap-3 mt-0.5">
                  <p className="text-xs font-mono font-black text-foreground tabular-nums">
                    R$ {(deal.amount || 0).toLocaleString("pt-BR")}
                  </p>
                  <div className="h-2 w-[1px] bg-white/10" />
                  <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-tighter">
                    {new Date(deal.created_at).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              
              <div className="text-right flex flex-col items-end gap-1">
                <span className={cn(
                  "text-[8px] font-mono font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-sm border",
                  cfg.color,
                  "bg-black/40",
                  `border-${cfg.color.split('-')[1]}/30`
                )} style={{ textShadow: `0 0 8px ${cfg.glow}` }}>
                  {cfg.label}
                </span>
              </div>

              {/* Hover effect micro-line */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-0 group-hover/item:h-3/4 bg-primary transition-all duration-300" />
            </motion.div>
          );
        }) : (
          <div className="flex flex-col items-center justify-center py-10 opacity-30">
            <div className="relative mb-3">
              <Clock className="h-8 w-8 text-muted-foreground animate-pulse" />
              <div className="absolute inset-0 blur-md bg-muted-foreground/20 rounded-full" />
            </div>
            <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-center">Spectral frequency: Silence</p>
          </div>
        )}
      </CardContent>

      {/* Decorative vertical scanline */}
      <motion.div 
        className="absolute top-0 right-0 w-[1px] h-full bg-primary/10"
        animate={{ opacity: [0.1, 0.4, 0.1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </Card>
  );
});

RecentDeals.displayName = "RecentDeals";