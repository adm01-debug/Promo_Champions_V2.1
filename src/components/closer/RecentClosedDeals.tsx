import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRecentClosedDeals } from "@/hooks/useCloserMetrics";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckCircle, DollarSign } from "lucide-react";

export function RecentClosedDeals() {
  const { data: deals } = useRecentClosedDeals();

  return (
    <Card className="glass border-border/40">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-500" />
          Vendas Recentes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {deals?.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">
            Nenhuma venda fechada
          </p>
        )}
        {deals?.map(deal => (
          <div 
            key={deal.id}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors"
          >
            <div className="p-1.5 rounded-lg bg-green-500/10">
              <DollarSign className="h-3.5 w-3.5 text-green-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{deal.client_name}</p>
              <p className="text-[10px] text-muted-foreground truncate">
                {deal.product_name}
              </p>
            </div>
            <div className="text-right space-y-1">
              <p className="text-sm font-bold text-green-500">
                R$ {Number(deal.amount).toLocaleString("pt-BR")}
              </p>
              <p className="text-[10px] text-muted-foreground">
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
