import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRecentClosedDeals } from "@/hooks/useCloserMetrics";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckCircle, DollarSign, Clock, Package, TrendingUp, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { SDRHandoffContext } from "./SDRHandoffContext";
import { Button } from "@/components/ui/button";

export function RecentClosedDeals() {
  const { data: deals } = useRecentClosedDeals();

  const totalValue = deals?.reduce((sum, deal) => sum + Number(deal.amount), 0) || 0;

  return (
    <Card className="glass dark:border-glow card-elevated hover-lift transition-all animate-fade-in">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-display font-medium flex items-center gap-2 group">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-status-success/20 to-status-success/5 shadow-lg group-hover:scale-110 transition-transform">
              <CheckCircle className="h-4 w-4 text-status-success" />
            </div>
            <span className="gradient-text">Vendas Recentes</span>
          </CardTitle>
          {deals && deals.length > 0 && (
            <Badge variant="secondary" className="text-[10px] bg-status-success/10 text-status-success shadow-sm">
              R$ {totalValue.toLocaleString("pt-BR")}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[280px] pr-2">
          <div className="space-y-2">
            {deals?.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground glass rounded-xl border border-dashed border-border/50 animate-fade-in">
                <div className="p-4 rounded-full bg-gradient-to-br from-status-success/10 to-status-success/5 mb-3 shadow-lg">
                  <DollarSign className="h-10 w-10 text-status-success/50 animate-pulse" />
                </div>
                <p className="text-sm font-display font-medium gradient-text">Nenhuma venda fechada</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Vendas fechadas aparecerão aqui</p>
              </div>
            )}
            {deals?.map((deal, index) => (
              <div 
                key={deal.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl glass border hover-lift transition-all group cursor-default animate-fade-in",
                  index === 0 
                    ? "border-status-success/30 ring-1 ring-status-success/20 hover-glow-success" 
                    : "border-border/30 hover:border-status-success/40"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={cn(
                  "p-2 rounded-lg shadow-md transition-all group-hover:scale-110 group-hover:shadow-lg",
                  index === 0 
                    ? "bg-gradient-to-br from-status-success to-status-success/70 shadow-status-success/30" 
                    : "bg-gradient-to-br from-status-success/20 to-status-success/10 border border-status-success/30"
                )}>
                  <DollarSign className={cn(
                    "h-4 w-4",
                    index === 0 ? "text-primary-foreground" : "text-status-success"
                  )} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-display font-medium truncate group-hover:text-primary transition-colors">
                      {deal.client_name}
                    </p>
                    {index === 0 && (
                      <TrendingUp className="h-3 w-3 text-status-success animate-pulse" />
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Package className="h-3 w-3 text-muted-foreground/60" />
                    <p className="text-[10px] text-muted-foreground truncate font-medium group-hover:text-foreground/70 transition-colors">
                      {deal.product_name}
                    </p>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <p className={cn(
                    "text-sm font-display font-bold transition-transform group-hover:scale-105",
                    index === 0 ? "gradient-text" : "text-status-success"
                  )}>
                    R$ {Number(deal.amount).toLocaleString("pt-BR")}
                  </p>
                  <div className="flex items-center gap-1 justify-end text-[10px] text-muted-foreground">
                    <Clock className="h-2.5 w-2.5" />
                    <span>
                      {formatDistanceToNow(new Date(deal.updated_at), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </span>
                  </div>
                </div>
                
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors">
                      <Info className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="glass sm:max-w-md border-l border-white/5">
                    <SheetHeader className="pb-6">
                      <SheetTitle className="text-xl gradient-text">Detalhes do Deal</SheetTitle>
                    </SheetHeader>
                    <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-120px)] pr-2">
                      <div className="p-4 rounded-xl bg-muted/20 border border-white/5 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Cliente</span>
                          <span className="text-sm font-semibold">{deal.client_name}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Produto</span>
                          <span className="text-sm font-semibold">{deal.product_name}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Valor</span>
                          <span className="text-sm font-bold text-status-success">R$ {Number(deal.amount).toLocaleString("pt-BR")}</span>
                        </div>
                      </div>
                      
                      <SDRHandoffContext saleId={deal.id} />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
