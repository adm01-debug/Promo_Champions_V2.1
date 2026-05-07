import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
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
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Recentes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const statusConfig: Record<string, { label: string; classes: string }> = {
    completed: { label: "Ganho", classes: "bg-success/10 text-success border-success/30" },
    pending: { label: "Pendente", classes: "bg-warning/10 text-warning border-warning/30" },
    negotiation: { label: "Negociação", classes: "bg-primary/10 text-primary border-primary/30" },
    qualified: { label: "Qualificado", classes: "bg-accent/10 text-accent-foreground border-accent/30" },
    proposal: { label: "Proposta", classes: "bg-info/10 text-info border-info/30" },
    lost: { label: "Perdido", classes: "bg-destructive/10 text-destructive border-destructive/30" },
  };

  return (
    <Card className="h-full border-none bg-gradient-to-br from-card/50 to-background shadow-lg shadow-black/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-2 tracking-tight uppercase">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            Fluxo Recente
          </CardTitle>
          <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest bg-primary/5">Live</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {deals && deals.length > 0 ? deals.map((deal) => {
          const cfg = statusConfig[deal.status || "pending"] || statusConfig.pending;
          return (
            <motion.div
              key={deal.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="group flex items-center justify-between p-3 rounded-xl bg-card border border-border/40 hover:border-primary/20 hover:shadow-sm transition-all cursor-default"
            >
              <div className="min-w-0 space-y-0.5">
                <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">{deal.client_name}</p>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-black text-foreground">
                    R$ {(deal.amount || 0).toLocaleString("pt-BR")}
                  </p>
                  <span className="text-[10px] text-muted-foreground">•</span>
                  <p className="text-[10px] text-muted-foreground font-medium">
                    {new Date(deal.created_at).toLocaleDateString("pt-BR", { day: '2-digit', month: 'short' })}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className={cn("text-[10px] font-bold uppercase py-0.5 px-2", cfg.classes)}>
                {cfg.label}
              </Badge>
            </motion.div>
          );
        }) : (
          <div className="flex flex-col items-center justify-center py-8 opacity-40">
            <Clock className="h-8 w-8 mb-2" />
            <p className="text-xs font-medium">Aguardando novos negócios...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

RecentDeals.displayName = "RecentDeals";
