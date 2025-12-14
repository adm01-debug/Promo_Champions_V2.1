import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Briefcase, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";

interface RecentDeal {
  id: string;
  client_name: string;
  product_name: string;
  amount: number;
  status: string;
  created_at: string;
}

const statusConfig: Record<string, { label: string; class: string }> = {
  completed: { label: "Fechado", class: "bg-status-success/20 text-status-success border-status-success/30" },
  pending: { label: "Pendente", class: "bg-warning/20 text-warning border-warning/30" },
  qualified: { label: "Qualificado", class: "bg-status-info/20 text-status-info border-status-info/30" },
  proposal: { label: "Proposta", class: "bg-status-purple/20 text-status-purple border-status-purple/30" },
  negotiation: { label: "Negociação", class: "bg-accent/20 text-accent border-accent/30" },
  lost: { label: "Perdido", class: "bg-destructive/20 text-destructive border-destructive/30" },
};

const useRecentDeals = () => {
  return useQuery({
    queryKey: ["recent-deals-dashboard"],
    queryFn: async (): Promise<RecentDeal[]> => {
      const { data, error } = await supabase
        .from("sales")
        .select("id, client_name, product_name, amount, status, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });
};

export const RecentDeals = () => {
  const { data: deals, isLoading } = useRecentDeals();

  if (isLoading) {
    return (
      <div className="glass rounded-xl p-6 border border-border/40 dark:border-glow card-elevated">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!deals || deals.length === 0) {
    return (
      <div className="glass rounded-xl p-6 border border-border/40 dark:border-glow card-elevated">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl gradient-primary">
              <Briefcase className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold font-display gradient-text">Negócios Recentes</h3>
              <p className="text-sm text-muted-foreground">Últimas vendas</p>
            </div>
          </div>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          <Briefcase className="h-10 w-10 mx-auto mb-3 opacity-50" />
          <p>Nenhuma venda registrada ainda</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-6 border border-border/40 dark:border-glow card-elevated">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl gradient-primary">
            <Briefcase className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold font-display gradient-text">Negócios Recentes</h3>
            <p className="text-sm text-muted-foreground">Últimas vendas</p>
          </div>
        </div>
        <Link 
          to="/vendas" 
          className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1 hover:gap-2 group"
        >
          Ver todos
          <ArrowRight className="h-3.5 w-3.5 transition-all" />
        </Link>
      </div>

      <div className="space-y-2">
        {deals.map((deal) => {
          const status = statusConfig[deal.status] || statusConfig.pending;
          const initials = deal.client_name
            .split(" ")
            .map((word) => word[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

          return (
            <div
              key={deal.id}
              className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/30 hover-lift cursor-pointer group border border-transparent hover:border-border/40 transition-all"
            >
              <Avatar className="h-11 w-11 border-2 border-border/50 group-hover:border-primary/50 transition-colors">
                <AvatarFallback className="gradient-primary text-white text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate group-hover:text-primary transition-colors font-display">
                  {deal.client_name}
                </p>
                <p className="text-xs text-muted-foreground truncate">{deal.product_name}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold gradient-text">
                  R$ {Number(deal.amount).toLocaleString("pt-BR")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(deal.created_at), { addSuffix: true, locale: ptBR })}
                </p>
              </div>
              <Badge variant="outline" className={`${status.class} text-xs`}>
                {status.label}
              </Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
};
