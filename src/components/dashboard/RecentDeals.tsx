import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

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
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          Recentes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {deals && deals.length > 0 ? deals.map((deal) => {
          const cfg = statusConfig[deal.status || "pending"] || statusConfig.pending;
          return (
            <div
              key={deal.id}
              className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{deal.client_name}</p>
                <p className="text-xs text-muted-foreground">
                  R$ {(deal.amount || 0).toLocaleString("pt-BR")}
                </p>
              </div>
              <Badge variant="outline" className={cfg.classes}>
                {cfg.label}
              </Badge>
            </div>
          );
        }) : (
          <p className="text-sm text-muted-foreground text-center py-4">Nenhum deal recente</p>
        )}
      </CardContent>
    </Card>
  );
});

RecentDeals.displayName = "RecentDeals";
