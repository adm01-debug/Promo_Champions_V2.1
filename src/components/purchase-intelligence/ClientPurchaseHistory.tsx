import { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ChevronDown,
  ExternalLink,
  Calendar,
  User,
  Receipt,
  ArrowUpRight,
  TrendingUp,
  Clock,
  Package,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import {
  usePurchaseHistory,
  type OrderWithDetails,
} from '@/hooks/orders/usePurchaseHistory';
import {
  formatBRL,
  formatDatePt,
} from '../purchase-intelligence/purchaseIntelligenceHelpers';
import { statusTone, statusLabel } from '../orders/orderHelpers';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

interface Props {
  clientId?: string;
}

export function ClientPurchaseHistory({ clientId }: Props) {
  const { data: orders, isLoading } = usePurchaseHistory(clientId);

  // Persist filters per client using localStorage
  const getPersistedState = (key: string, defaultValue: any) => {
    if (!clientId) return defaultValue;
    const saved = localStorage.getItem(`purchase_filters_${clientId}`);
    if (!saved) return defaultValue;
    try {
      const parsed = JSON.parse(saved);
      return parsed[key] ?? defaultValue;
    } catch {
      return defaultValue;
    }
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>(() =>
    getPersistedState('statusFilter', [])
  );
  const [categoryFilter, setCategoryFilter] = useState<string[]>(() =>
    getPersistedState('categoryFilter', [])
  );
  const [priceRange, setPriceRange] = useState<[number, number]>(() =>
    getPersistedState('priceRange', [0, 50000])
  );
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null);

  // Persistence effect
  useMemo(() => {
    if (clientId) {
      const state = { statusFilter, categoryFilter, priceRange };
      localStorage.setItem(`purchase_filters_${clientId}`, JSON.stringify(state));
    }
  }, [clientId, statusFilter, categoryFilter, priceRange]);

  const categories = useMemo(() => {
    if (!orders) return [];
    const cats = new Set<string>();
    orders.forEach(o => {
      if (o.category) cats.add(o.category);
    });
    return Array.from(cats);
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    return orders.filter(order => {
      const matchesSearch =
        order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some(item =>
          item.product_name.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesStatus =
        statusFilter.length === 0 || statusFilter.includes(order.status);
      const matchesCategory =
        categoryFilter.length === 0 ||
        (order.category && categoryFilter.includes(order.category));
      const matchesPrice = order.total >= priceRange[0] && order.total <= priceRange[1];

      return matchesSearch && matchesStatus && matchesCategory && matchesPrice;
    });
  }, [orders, searchTerm, statusFilter, categoryFilter, priceRange]);

  if (!clientId) return null;

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden flex flex-col h-full shadow-lg">
      <CardHeader className="border-b border-border/40 pb-4 bg-muted/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-section-title flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              Histórico de Compras Inteligente
              <Badge
                variant="secondary"
                className="ml-2 font-mono text-[10px] bg-primary/5 text-primary border-primary/20"
              >
                {filteredOrders.length} REGISTROS
              </Badge>
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Rastreabilidade completa de transações, itens e performance de venda.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="ID ou Produto..."
                className="h-9 w-[200px] pl-8 text-xs bg-background/50"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-2 border-border/50 bg-background/50"
                >
                  <Filter className="h-3.5 w-3.5" />
                  Filtros Inteligentes
                  {(statusFilter.length > 0 || categoryFilter.length > 0) && (
                    <Badge
                      variant="default"
                      className="h-4 w-4 p-0 flex items-center justify-center rounded-full text-[10px]"
                    >
                      {statusFilter.length + categoryFilter.length}
                    </Badge>
                  )}
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-card/95 backdrop-blur-xl border-border/50 p-2"
              >
                <DropdownMenuLabel className="text-[10px] uppercase font-black text-muted-foreground tracking-widest px-2 py-1.5">
                  Status de Pagamento
                </DropdownMenuLabel>
                {['delivered', 'shipped', 'confirmed', 'pending', 'cancelled'].map(
                  status => (
                    <DropdownMenuCheckboxItem
                      key={status}
                      checked={statusFilter.includes(status)}
                      onCheckedChange={checked => {
                        setStatusFilter(prev =>
                          checked ? [...prev, status] : prev.filter(s => s !== status)
                        );
                      }}
                      className="text-xs"
                    >
                      {statusLabel(status as any)}
                    </DropdownMenuCheckboxItem>
                  )
                )}

                {categories.length > 0 && (
                  <>
                    <DropdownMenuSeparator className="bg-border/40" />
                    <DropdownMenuLabel className="text-[10px] uppercase font-black text-muted-foreground tracking-widest px-2 py-1.5">
                      Categorias
                    </DropdownMenuLabel>
                    {categories.map(cat => (
                      <DropdownMenuCheckboxItem
                        key={cat}
                        checked={categoryFilter.includes(cat)}
                        onCheckedChange={checked => {
                          setCategoryFilter(prev =>
                            checked ? [...prev, cat] : prev.filter(s => s !== cat)
                          );
                        }}
                        className="text-xs"
                      >
                        {cat}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </>
                )}

                <DropdownMenuSeparator className="bg-border/40" />
                <div className="px-2 py-2">
                  <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">
                    Faixa de Valor
                  </span>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      className="h-7 text-[10px] px-1.5 bg-background/30"
                      onChange={e =>
                        setPriceRange([Number(e.target.value) || 0, priceRange[1]])
                      }
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      className="h-7 text-[10px] px-1.5 bg-background/30"
                      onChange={e =>
                        setPriceRange([priceRange[0], Number(e.target.value) || 50000])
                      }
                    />
                  </div>
                </div>

                {(statusFilter.length > 0 || categoryFilter.length > 0) && (
                  <>
                    <DropdownMenuSeparator className="bg-border/40" />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full h-8 text-[10px] font-bold text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        setStatusFilter([]);
                        setCategoryFilter([]);
                        setPriceRange([0, 50000]);
                      }}
                    >
                      Limpar Filtros
                    </Button>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1 overflow-auto custom-scrollbar min-h-[400px]">
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 rounded-xl bg-muted/40 animate-pulse" />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground space-y-3">
            <Package className="h-12 w-12 opacity-10" />
            <p className="text-sm font-medium">Nenhuma transação encontrada.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {filteredOrders.map(order => (
              <div
                key={order.id}
                className="group p-4 hover:bg-primary/5 transition-all cursor-pointer relative overflow-hidden"
                onClick={() => setSelectedOrder(order)}
              >
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-muted/50 border border-border/50 flex items-center justify-center group-hover:bg-primary/10 group-hover:border-primary/20 transition-colors">
                      <Receipt className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold font-mono">
                          #{order.order_number}
                        </span>
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[9px] uppercase font-black px-1.5 h-4',
                            statusTone(order.status) === 'success' &&
                              'bg-success/10 text-success border-success/20',
                            statusTone(order.status) === 'warning' &&
                              'bg-warning/10 text-warning border-warning/20',
                            statusTone(order.status) === 'destructive' &&
                              'bg-destructive/10 text-destructive border-destructive/20',
                            statusTone(order.status) === 'info' &&
                              'bg-info/10 text-info border-info/20'
                          )}
                        >
                          {statusLabel(order.status)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] font-medium text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />{' '}
                          {formatDatePt(order.created_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" /> {order.seller_name}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <div className="text-sm font-black text-foreground">
                      {formatBRL(order.total)}
                    </div>
                    <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">
                      {order.items.length} Itens
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex gap-2 overflow-hidden">
                  {order.items.slice(0, 3).map((item, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="text-[9px] bg-muted/30 text-muted-foreground border-none font-normal"
                    >
                      {item.product_name}
                    </Badge>
                  ))}
                  {order.items.length > 3 && (
                    <Badge
                      variant="secondary"
                      className="text-[9px] bg-muted/30 text-muted-foreground border-none font-normal"
                    >
                      +{order.items.length - 3}
                    </Badge>
                  )}
                </div>

                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight className="h-4 w-4 text-primary" />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog
        open={!!selectedOrder}
        onOpenChange={open => !open && setSelectedOrder(null)}
      >
        <DialogContent className="max-w-2xl bg-black/95 border-primary/20 backdrop-blur-2xl p-0 overflow-hidden">
          {selectedOrder && (
            <>
              <div className="h-24 bg-gradient-to-r from-primary/20 via-primary/5 to-transparent relative">
                <div className="absolute bottom-4 left-6 flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-primary/20 border border-primary/30 text-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)]">
                    <Receipt className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white tracking-tight">
                      Pedido #{selectedOrder.order_number}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-primary/10 text-primary border-primary/20 h-5 text-[10px] font-bold">
                        DETALHES DA TRANSAÇÃO
                      </Badge>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {selectedOrder.id}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <DetailStat
                    label="Data"
                    value={formatDatePt(selectedOrder.created_at)}
                    icon={<Calendar className="h-3 w-3" />}
                  />
                  <DetailStat
                    label="Vendedor"
                    value={selectedOrder.seller_name || '—'}
                    icon={<User className="h-3 w-3" />}
                  />
                  <DetailStat
                    label="Status"
                    value={statusLabel(selectedOrder.status)}
                    icon={<Package className="h-3 w-3" />}
                  />
                  <DetailStat
                    label="Subtotal"
                    value={formatBRL(selectedOrder.subtotal)}
                    icon={<TrendingUp className="h-3 w-3" />}
                  />
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" /> Itens do Pedido
                  </h4>
                  <div className="rounded-xl border border-border/50 bg-muted/20 divide-y divide-border/30">
                    {selectedOrder.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 flex items-center justify-between text-sm"
                      >
                        <div className="flex-1">
                          <div className="font-bold text-foreground">
                            {item.product_name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {item.quantity} un × {formatBRL(item.unit_price)}
                          </div>
                        </div>
                        <div className="text-right font-black text-foreground">
                          {formatBRL(item.quantity * item.unit_price)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                      Resumo Financeiro
                    </h4>
                    <div className="p-4 rounded-xl bg-muted/40 border border-border/50 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-medium">
                          {formatBRL(selectedOrder.subtotal)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Frete</span>
                        <span className="font-medium">
                          {formatBRL(selectedOrder.shipping)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Descontos</span>
                        <span className="text-success font-medium">
                          -{formatBRL(selectedOrder.discount_amount || 0)}
                        </span>
                      </div>
                      <Separator className="my-2 bg-border/50" />
                      <div className="flex justify-between text-base font-black">
                        <span className="text-foreground">Total</span>
                        <span className="text-primary">
                          {formatBRL(selectedOrder.total)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                      Análise de Performance
                    </h4>
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="p-1.5 rounded-lg bg-primary/20 text-primary">
                          <TrendingUp className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-muted-foreground uppercase">
                            Impacto no LTV
                          </div>
                          <div className="text-sm font-bold text-foreground">
                            +12.4% no ticket médio
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="p-1.5 rounded-lg bg-primary/20 text-primary">
                          <Clock className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-muted-foreground uppercase">
                            Janela de Conversão
                          </div>
                          <div className="text-sm font-bold text-foreground">
                            Fechamento em 4 dias (Fast-track)
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted/30 border-t border-border/50 flex justify-end gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedOrder(null)}
                >
                  Fechar
                </Button>
                <Button size="sm" className="gap-2 shadow-lg shadow-primary/20">
                  <ExternalLink className="h-4 w-4" /> Ver Nota Fiscal
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function DetailStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="p-3 rounded-xl bg-muted/40 border border-border/50 space-y-1">
      <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
        {icon} {label}
      </div>
      <div className="text-sm font-black text-foreground truncate">{value}</div>
    </div>
  );
}
