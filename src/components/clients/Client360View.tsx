import { useClient360 } from "@/hooks/crm/useClient360";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, ShoppingBag, TrendingUp, Package, BarChart3, Calendar, ArrowRight, Zap, AlertCircle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

interface Client360ViewProps {
  clientName: string;
}

export function Client360View({ clientName }: Client360ViewProps) {
  const { data, isLoading } = useClient360(clientName);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!data) return <div>Nenhum dado encontrado para este cliente.</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* KPIs Estratégicos - Etapa 1 do Plano 10/10 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-primary/5 border-primary/10 shadow-sm overflow-hidden relative group">
          <div className="absolute right-0 top-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
            <DollarSign className="h-12 w-12 text-primary" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">LTV Absoluto</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-primary tabular-nums">{formatCurrency(data.ltv)}</div>
            <p className="text-[9px] text-muted-foreground mt-1 uppercase font-bold tracking-tight">Potencial de Retorno Vitalício</p>
          </CardContent>
        </Card>

        <Card className="bg-indigo-500/5 border-indigo-500/10 shadow-sm overflow-hidden relative group">
          <div className="absolute right-0 top-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingUp className="h-12 w-12 text-indigo-500" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Ticket Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-indigo-500 tabular-nums">{formatCurrency(data.averageTicket)}</div>
            <p className="text-[9px] text-muted-foreground mt-1 uppercase font-bold tracking-tight">Consumo Médio por Evento</p>
          </CardContent>
        </Card>

        <Card className="bg-emerald-500/5 border-emerald-500/10 shadow-sm overflow-hidden relative group">
          <div className="absolute right-0 top-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
            <ShoppingBag className="h-12 w-12 text-emerald-500" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Volumetria</CardTitle>
            <ShoppingBag className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-emerald-500 tabular-nums">{data.ordersCount}</div>
            <p className="text-[9px] text-muted-foreground mt-1 uppercase font-bold tracking-tight">Total de Transações no Ciclo</p>
          </CardContent>
        </Card>

        <Card className="bg-amber-500/5 border-amber-500/10 shadow-sm overflow-hidden relative group">
          <div className="absolute right-0 top-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
            <Zap className="h-12 w-12 text-amber-500" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Recência (RFM)</CardTitle>
            <Zap className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-amber-500 tabular-nums">
              {data.orders.length > 0 
                ? `${Math.floor((new Date().getTime() - new Date(data.orders[0].created_at).getTime()) / (1000 * 60 * 60 * 24))}d` 
                : 'N/A'}
            </div>
            <p className="text-[9px] text-muted-foreground mt-1 uppercase font-bold tracking-tight">Dias desde a última compra</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card className="border-border/40 bg-card/40 backdrop-blur-md shadow-xl rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base uppercase font-black tracking-tighter">
              <Package className="h-5 w-5 text-primary" />
              Ranking de Produtos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topProducts.slice(0, 5).map((product, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-accent/20 border border-white/5 group hover:border-primary/20 transition-all">
                  <div className="flex-1">
                    <div className="text-xs font-black uppercase tracking-tight truncate group-hover:text-primary transition-colors">{product.name}</div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{product.count} vendas registradas</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-primary">{formatCurrency(product.total)}</div>
                  </div>
                </div>
              ))}
              {data.topProducts.length === 0 && (
                <div className="text-center py-12">
                  <Package className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Nenhum produto em estoque</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Purchase Journey Timeline - Etapa 1 do Plano 10/10 */}
        <Card className="border-border/40 bg-card/40 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-border/10 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base uppercase font-black tracking-tighter">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Jornada de Compra
                </CardTitle>
                <CardDescription className="text-[10px] font-bold uppercase tracking-widest mt-1 opacity-60">Linha do tempo de transações e valor</CardDescription>
              </div>
              {data.orders.length > 0 && (
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] font-black animate-pulse">
                  <CheckCircle2 className="h-3 w-3 mr-1" /> CLIENTE ATIVO
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative p-6">
              {/* Vertical Line */}
              <div className="absolute left-[31px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-primary/50 via-primary/10 to-transparent" />
              
              <div className="space-y-8">
                {data.orders.slice(0, 6).map((order, idx) => (
                  <div key={order.id} className="relative pl-10 group">
                    {/* Dot */}
                    <div className={cn(
                      "absolute left-[2px] top-1 h-3 w-3 rounded-full border-2 border-background z-10 transition-all duration-300",
                      idx === 0 ? "bg-primary scale-125 shadow-[0_0_10px_rgba(var(--primary),0.5)]" : "bg-muted-foreground/30 group-hover:bg-primary/50"
                    )} />
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-accent/10 border border-white/5 group-hover:bg-accent/20 group-hover:border-primary/20 transition-all">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                            {new Date(order.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                          {idx === 0 && <Badge className="text-[8px] h-4 bg-primary/20 text-primary border-none font-black uppercase">Último Pedido</Badge>}
                        </div>
                        <h4 className="text-sm font-black uppercase tracking-tight group-hover:text-primary transition-colors">
                          {order.product_name}
                        </h4>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-base font-black text-primary">{formatCurrency(Number(order.amount))}</div>
                          <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">Transação Aprovada</div>
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="p-2 rounded-full bg-background/50 border border-border/10 cursor-help group-hover:border-primary/30">
                                <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:text-primary" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>Ver detalhes do pedido</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </div>
                ))}

                {data.orders.length === 0 && (
                  <div className="text-center py-12">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/20" />
                    <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">Sem histórico de transações</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
