import { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Receipt, RefreshCw, TrendingUp, TrendingDown, User, Building, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { useSalesInsights } from "@/hooks/sales/useSalesInsights";

const formatCurrency = (value: number) =>
  `R$ ${value.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;

const ChangeIndicator: FC<{ value: number }> = ({ value }) => {
  if (value === 0) return null;
  const isPositive = value > 0;
  return (
    <span className={cn(
      "inline-flex items-center gap-1 text-xs font-semibold",
      isPositive ? "text-success" : "text-destructive"
    )}>
      {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {isPositive && "+"}{value.toFixed(1)}%
    </span>
  );
};

export const BISalesInsights: FC<{ className?: string }> = ({ className }) => {
  const { data, isLoading } = useSalesInsights();

  if (isLoading) {
    return (
      <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-6", className)}>
        {[1, 2].map(i => (
          <Card key={i} className="glass-card">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-muted rounded w-1/3" />
                <div className="h-16 bg-muted rounded" />
                {[1, 2, 3].map(j => (
                  <div key={j} className="h-12 bg-muted rounded" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const avgTicket = data?.avgTicketGlobal || 0;
  const repurchaseRate = data?.repurchaseRateGlobal || 0;
  const topByTicket = data?.topByAvgTicket || [];
  const topByRepurchase = data?.topByRepurchase || [];

  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-6", className)}>
      {/* Ticket Médio por Cliente */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-glow">
              <Receipt className="h-4 w-4 text-primary-foreground" />
            </div>
            Ticket Médio por Cliente
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Global KPI */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-primary/10 to-transparent border border-primary/20 mb-4">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Ticket Médio Geral</p>
              <p className="text-2xl font-black gradient-text">{formatCurrency(avgTicket)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">vs mês anterior</p>
              <ChangeIndicator value={data?.avgTicketChange || 0} />
            </div>
          </div>

          {/* Top clients */}
          <ScrollArea className="h-[280px]">
            <div className="space-y-2.5 pr-2">
              {topByTicket.map((client, idx) => (
                <motion.div
                  key={`${client.name}-${idx}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
                >
                  <div className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                    idx === 0 ? "bg-rank-gold text-rank-gold-foreground" :
                    idx === 1 ? "bg-rank-silver text-rank-silver-foreground" :
                    idx === 2 ? "bg-rank-bronze text-rank-bronze-foreground" :
                    "bg-muted text-muted-foreground"
                  )}>
                    {idx + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                      {client.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {client.company && (
                        <span className="flex items-center gap-1 truncate">
                          <Building className="h-3 w-3" />
                          {client.company}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <ShoppingBag className="h-3 w-3" />
                        {client.totalOrders} ped.
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-bold text-sm">{formatCurrency(client.avgTicket)}</p>
                    <p className="text-xs text-muted-foreground">
                      Total: {formatCurrency(client.totalValue)}
                    </p>
                  </div>
                </motion.div>
              ))}
              {topByTicket.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Receipt className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhum dado encontrado</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Taxa de Recompra */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-success to-success/80">
              <RefreshCw className="h-4 w-4 text-success-foreground" />
            </div>
            Taxa de Recompra
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Global KPI */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-success/10 to-transparent border border-success/20 mb-4">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Taxa de Recompra Geral</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-black text-success">{repurchaseRate.toFixed(1)}%</p>
                <span className="text-xs text-muted-foreground">
                  ({data?.totalRepurchaseClients || 0} de {data?.totalUniqueClients || 0} clientes)
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">vs mês anterior</p>
              <ChangeIndicator value={data?.repurchaseRateChange || 0} />
            </div>
          </div>

          {/* Top repurchase clients */}
          <ScrollArea className="h-[280px]">
            <div className="space-y-2.5 pr-2">
              {topByRepurchase.map((client, idx) => (
                <motion.div
                  key={`${client.name}-${idx}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                    <User className="h-5 w-5 text-success" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate group-hover:text-success transition-colors">
                      {client.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {client.company && (
                        <span className="flex items-center gap-1 truncate">
                          <Building className="h-3 w-3" />
                          {client.company}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <Badge variant="secondary" className="mb-1">
                      {client.purchaseCount} compras
                    </Badge>
                    <p className="text-xs font-semibold">{formatCurrency(client.totalValue)}</p>
                  </div>
                </motion.div>
              ))}
              {topByRepurchase.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <RefreshCw className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhum cliente recorrente encontrado</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
