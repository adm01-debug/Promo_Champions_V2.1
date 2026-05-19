import { useClient360 } from "@/hooks/crm/useClient360";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, ShoppingBag, TrendingUp, Package, BarChart3 } from "lucide-react";

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
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-primary/5 border-primary/10 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-widest">LTV</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-primary">{formatCurrency(data.ltv)}</div>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold tracking-wider">Valor vitalício acumulado</p>
          </CardContent>
        </Card>

        <Card className="bg-indigo-500/5 border-indigo-500/10 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Ticket Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-indigo-500">{formatCurrency(data.averageTicket)}</div>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold tracking-wider">Média por pedido</p>
          </CardContent>
        </Card>

        <Card className="bg-emerald-500/5 border-emerald-500/10 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Pedidos</CardTitle>
            <ShoppingBag className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-emerald-500">{data.ordersCount}</div>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold tracking-wider">Total de transações</p>
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

        {/* Recent Orders */}
        <Card className="border-border/40 bg-card/40 backdrop-blur-md shadow-xl rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base uppercase font-black tracking-tighter">
              <BarChart3 className="h-5 w-5 text-primary" />
              Atividade Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border/10">
                    <TableHead className="text-[9px] uppercase font-black tracking-[0.2em] text-muted-foreground/50">Timestamp</TableHead>
                    <TableHead className="text-[9px] uppercase font-black tracking-[0.2em] text-muted-foreground/50">Unit</TableHead>
                    <TableHead className="text-[9px] uppercase font-black tracking-[0.2em] text-muted-foreground/50 text-right">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.orders.slice(0, 6).map((order) => (
                    <TableRow key={order.id} className="border-border/5 hover:bg-primary/5 group transition-colors">
                      <TableCell className="text-[10px] font-bold text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-[10px] font-black uppercase truncate max-w-[120px] group-hover:text-primary transition-colors">
                        {order.product_name}
                      </TableCell>
                      <TableCell className="text-xs text-right font-black text-primary">
                        {formatCurrency(Number(order.amount))}
                      </TableCell>
                    </TableRow>
                  ))}
                  {data.orders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-12">
                        <BarChart3 className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Sem logs de atividade</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
