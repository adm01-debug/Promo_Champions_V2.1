import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRecentClosedDeals } from "@/hooks/useCloserMetrics";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckCircle, DollarSign } from "lucide-react";

export function RecentClosedDeals() {
  const { data: deals } = useRecentClosedDeals();

  return (
    <Card className="glass border-border/40 dark:border-glow card-elevated transition-all duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-display font-medium flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-status-success to-status-success/70 shadow-md">
            <CheckCircle className="h-4 w-4 text-white" />
          </div>
          <span className="gradient-text">Vendas Recentes</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {deals?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-6 text-muted-foreground glass rounded-lg border border-dashed border-border/50">
            <div className="p-3 rounded-full bg-gradient-to-br from-muted/50 to-muted/30 mb-2 shadow-inner">
              <DollarSign className="h-8 w-8 opacity-50" />
            </div>
            <p className="text-xs font-display font-medium gradient-text">Nenhuma venda fechada</p>
          </div>
        )}
        {deals?.map((deal, index) => (
          <div 
            key={deal.id}
            className="flex items-center gap-3 p-2.5 rounded-lg glass border border-border/30 hover:border-status-success/40 transition-all duration-300 group hover-lift animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-status-success/20 to-status-success/10 border border-status-success/30 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-md group-hover:shadow-status-success/20">
              <DollarSign className="h-3.5 w-3.5 text-status-success" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-display font-medium truncate group-hover:text-primary transition-colors">{deal.client_name}</p>
              <p className="text-[10px] text-muted-foreground truncate font-medium">
                {deal.product_name}
              </p>
            </div>
            <div className="text-right space-y-0.5">
              <p className="text-sm font-display font-bold text-status-success transition-transform duration-300 group-hover:scale-105">
                R$ {Number(deal.amount).toLocaleString("pt-BR")}
              </p>
              <p className="text-[10px] text-muted-foreground font-medium">
                {formatDistanceToNow(new Date(deal.updated_at), { 
                  addSuffix: true, 
                  locale: ptBR 
                })}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
