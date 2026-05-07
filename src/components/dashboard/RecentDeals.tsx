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
      <Card className="border-none bg-transparent shadow-none">
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-3xl bg-white/[0.03]" />
          ))}
        </div>
      </Card>
    );
  }

  const statusConfig: Record<string, { label: string; classes: string }> = {
    completed: { label: "CLOSED", classes: "bg-success/10 text-success border-success/30" },
    pending: { label: "IN QUEUE", classes: "bg-warning/10 text-warning border-warning/30" },
    negotiation: { label: "STRATEGY", classes: "bg-primary/10 text-primary border-primary/30" },
    qualified: { label: "READY", classes: "bg-accent/10 text-accent-foreground border-accent/30" },
    proposal: { label: "SENT", classes: "bg-info/10 text-info border-info/30" },
    lost: { label: "ABORTED", classes: "bg-destructive/10 text-destructive border-destructive/30" },
  };

  return (
    <Card className="border-none bg-transparent shadow-none">
      <CardHeader className="pb-6 pt-0 px-0">
        <CardTitle className="text-sm font-black uppercase tracking-widest text-white/30 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 ring-1 ring-primary/20">
            <Clock className="h-4 w-4 text-primary" />
          </div>
          Live Stream
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-0">
        {deals && deals.length > 0 ? deals.map((deal) => {
          const cfg = statusConfig[deal.status || "pending"] || statusConfig.pending;
          return (
            <div
              key={deal.id}
              className="flex items-center justify-between p-4 rounded-3xl bg-white/[0.02] border border-white/[0.03] hover:bg-white/[0.05] transition-all duration-500 group"
            >
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-tight text-white/80 group-hover:text-white transition-colors truncate">{deal.client_name}</p>
                <p className="text-sm font-black text-white/40 tabular-nums">
                  R$ {(deal.amount || 0).toLocaleString("pt-BR")}
                </p>
              </div>
              <Badge variant="outline" className={cn("text-[8px] font-black tracking-widest px-2 py-0.5 rounded-full border-0 shadow-sm", cfg.classes)}>
                {cfg.label}
              </Badge>
            </div>
          );
        }) : (
          <div className="flex flex-col items-center justify-center py-12 text-center opacity-20">
             <Clock className="h-8 w-8 mb-2" />
             <p className="text-[10px] font-black uppercase tracking-widest">System idle</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

RecentDeals.displayName = "RecentDeals";
