import React from "react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, BarChart3, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(val);

interface ForecastDeal {
  id: string;
  client_name: string;
  product_name: string;
  weighted_value: number;
  amount: number;
  probability: number;
  days_in_stage: number;
  lead_score: number | null;
}

interface ForecastTopDealsProps {
  deals: ForecastDeal[];
}

export const ForecastTopDeals = React.memo(function ForecastTopDeals({ deals }: ForecastTopDealsProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-display flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-primary" />
          Top 10 Deals por Valor Ponderado
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-[400px]">
          <div className="space-y-2">
            {deals.map((deal, i) => (
              <div key={deal.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors border border-border/30">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{deal.client_name}</p>
                  <p className="text-xs text-muted-foreground truncate">{deal.product_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatCurrency(deal.weighted_value)}</p>
                  <p className="text-[10px] text-muted-foreground">{formatCurrency(deal.amount)} × {Math.round(deal.probability * 100)}%</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant="outline" className="text-[10px] h-4">{deal.days_in_stage}d</Badge>
                  {deal.days_in_stage > 30 && <AlertTriangle className="h-3 w-3 text-status-warning" />}
                </div>
                {deal.lead_score !== null && (
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                    deal.lead_score >= 70 ? "bg-status-success/20 text-status-success" :
                    deal.lead_score >= 40 ? "bg-status-warning/20 text-status-warning" :
                    "bg-status-error/20 text-status-error"
                  )}>{deal.lead_score}</div>
                )}
              </div>
            ))}
            {deals.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhum deal ativo no pipeline</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
});
