import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, ArrowUpCircle, ArrowDownCircle, AlertTriangle, TrendingUp, History, Plus } from "lucide-react";
import { PageTransition } from "@/components/transitions/PageTransition";
import { useInventoryLevels, useStockMovements, useAddStockMovement } from "@/hooks/useInventory";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { Progress } from "@/components/ui/progress";

function StockStatusBadge({ current, min, reorder }: { current: number; min: number; reorder: number }) {
  if (current <= min) return <Badge variant="destructive" className="font-black uppercase tracking-widest text-[10px]">CRITICAL</Badge>;
  if (current <= reorder) return <Badge className="bg-amber-500/20 text-amber-500 border-none font-black uppercase tracking-widest text-[10px]">LOW STOCK</Badge>;
  return <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-black uppercase tracking-widest text-[10px]">OPTIMAL</Badge>;
}


export default function Estoque() {
  const { data: inventory = [], isLoading: loadingInv } = useInventoryLevels();
  const { data: movements = [], isLoading: loadingMov } = useStockMovements();
  const addMovement = useAddStockMovement();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ product_id: "", movement_type: "entry", quantity: "", reason: "" });

  const criticalCount = inventory.filter(i => i.current_stock <= i.min_stock_level).length;
  const lowCount = inventory.filter(i => i.current_stock > i.min_stock_level && i.current_stock <= i.reorder_point).length;
  const totalItems = inventory.reduce((s, i) => s + i.current_stock, 0);
  const entriesCount = movements.filter(m => m.movement_type === "entry").length;

  const handleSubmit = () => {
    if (!form.product_id || !form.quantity) return;
    addMovement.mutate({
      product_id: form.product_id,
      movement_type: form.movement_type,
      quantity: parseInt(form.quantity),
      reason: form.reason || undefined,
    }, {
      onSuccess: () => {
        setOpen(false);
        setForm({ product_id: "", movement_type: "entry", quantity: "", reason: "" });
      },
    });
  };

  return (
    <>
      <Helmet>
        <title>Estoque | Promo Champions</title>
        <meta name="description" content="Gestão de estoque e movimentações" />
      </Helmet>
      <PageTransition>
      <div className="space-y-6 p-4 md:p-6">
        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="p-3 rounded-2xl bg-primary/10 ring-1 ring-primary/20 shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]">
                <Package className="h-7 w-7 text-primary animate-pulse" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background" />
            </div>
            <div>
              <h1 className="font-display font-black text-3xl uppercase tracking-tighter italic">Logistics Command</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Inventory Engine v3.1</span>
                <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                <p className="text-[10px] text-primary font-bold uppercase tracking-wider">
                  {totalItems.toLocaleString("pt-BR")} UNITS UNDER CONTROL
                </p>
              </div>
            </div>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Nova Movimentação</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Movimentação</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Select value={form.product_id} onValueChange={v => setForm(f => ({ ...f, product_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecionar produto" /></SelectTrigger>
                  <SelectContent>
                    {inventory.map(i => (
                      <SelectItem key={i.id} value={i.product_id || i.id}>
                        {i.products?.name || "Produto"} {}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={form.movement_type} onValueChange={v => setForm(f => ({ ...f, movement_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry">Entrada</SelectItem>
                    <SelectItem value="exit">Saída</SelectItem>
                    <SelectItem value="adjustment">Ajuste</SelectItem>
                  </SelectContent>
                </Select>
                <Input type="number" placeholder="Quantidade" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} />
                <Input placeholder="Motivo (opcional)" value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} />
                <Button onClick={handleSubmit} disabled={addMovement.isPending} className="w-full">
                  {addMovement.isPending ? "Registrando..." : "Registrar"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="glass-card hover-lift-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Package className="h-4 w-4" />
                <span className="text-label">Total em Estoque</span>
              </div>
              <p className="text-metric">{totalItems.toLocaleString("pt-BR")}</p>
            </CardContent>
          </Card>
          <Card className="glass-card hover-lift-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span className="text-label">Estoque Crítico</span>
              </div>
              <p className="text-metric text-destructive">{criticalCount}</p>
            </CardContent>
          </Card>
          <Card className="glass-card hover-lift-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <TrendingUp className="h-4 w-4 text-warning" />
                <span className="text-label">Estoque Baixo</span>
              </div>
              <p className="text-metric text-warning">{lowCount}</p>
            </CardContent>
          </Card>
          <Card className="glass-card hover-lift-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <ArrowUpCircle className="h-4 w-4 text-success" />
                <span className="text-label">Entradas Recentes</span>
              </div>
              <p className="text-metric text-success">{entriesCount}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="inventory">
          <TabsList>
            <TabsTrigger value="inventory"><Package className="h-4 w-4 mr-2" />Inventário</TabsTrigger>
            <TabsTrigger value="movements"><History className="h-4 w-4 mr-2" />Movimentações</TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="mt-4">
            <Card>
              <CardContent className="p-0">
                {loadingInv ? (
                  <div className="p-4 space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className="h-4 w-32 bg-muted/70 rounded animate-pulse" />
                        <div className="h-4 w-16 bg-muted/70 rounded animate-pulse" />
                        <div className="h-4 w-20 bg-muted/70 rounded animate-pulse" />
                        <div className="h-2 w-32 bg-muted/70 rounded-full animate-pulse" />
                        <div className="h-5 w-16 bg-muted/70 rounded-full animate-pulse" />
                      </div>
                    ))}
                  </div>
                ) : inventory.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">Nenhum item no inventário</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b text-left">
                          <th className="p-3 text-label">Produto</th>
                          <th className="p-3 text-label">SKU</th>
                          <th className="p-3 text-label">Estoque</th>
                          <th className="p-3 text-label">Nível</th>
                          <th className="p-3 text-label">Status</th>
                          <th className="p-3 text-label">Último Reabast.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inventory.map(item => {
                          const pct = Math.min(100, (item.current_stock / item.max_stock_level) * 100);
                          return (
                            <tr key={item.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                              <td className="p-3 font-medium">{item.products?.name || "—"}</td>
                              <td className="p-3 text-muted-foreground font-mono text-sm">{"—"}</td>
                              <td className="p-3">
                                <span className="text-metric text-base">{item.current_stock}</span>
                                <span className="text-muted-foreground text-xs ml-1">/ {item.max_stock_level}</span>
                              </td>
                              <td className="p-3 w-32">
                                <Progress value={pct} className="h-2" />
                              </td>
                              <td className="p-3">
                                <StockStatusBadge current={item.current_stock} min={item.min_stock_level} reorder={item.reorder_point} />
                              </td>
                              <td className="p-3 text-muted-foreground text-sm">
                                {item.last_restock_date
                                  ? format(new Date(item.last_restock_date), "dd/MM/yy", { locale: ptBR })
                                  : "—"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="movements" className="mt-4">
            <Card>
              <CardContent className="p-0">
                {loadingMov ? (
                  <div className="p-4 space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className="h-4 w-24 bg-muted/70 rounded animate-pulse" />
                        <div className="h-4 w-32 bg-muted/70 rounded animate-pulse" />
                        <div className="h-5 w-16 bg-muted/70 rounded-full animate-pulse" />
                        <div className="h-4 w-12 bg-muted/70 rounded animate-pulse" />
                      </div>
                    ))}
                  </div>
                ) : movements.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">Nenhuma movimentação registrada</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b text-left">
                          <th className="p-3 text-label">Data</th>
                          <th className="p-3 text-label">Produto</th>
                          <th className="p-3 text-label">Tipo</th>
                          <th className="p-3 text-label">Qtd</th>
                          <th className="p-3 text-label">Motivo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {movements.map(mov => (
                          <tr key={mov.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                            <td className="p-3 text-sm text-muted-foreground">
                              {format(new Date(mov.created_at), "dd/MM/yy HH:mm", { locale: ptBR })}
                            </td>
                            <td className="p-3 font-medium">{mov.products?.name || "—"}</td>
                            <td className="p-3">
                              {mov.movement_type === "entry" && (
                                <Badge className="bg-success/20 text-success border-success/30">
                                  <ArrowUpCircle className="h-3 w-3 mr-1" />Entrada
                                </Badge>
                              )}
                              {mov.movement_type === "exit" && (
                                <Badge variant="destructive">
                                  <ArrowDownCircle className="h-3 w-3 mr-1" />Saída
                                </Badge>
                              )}
                              {mov.movement_type === "adjustment" && (
                                <Badge variant="outline">Ajuste</Badge>
                              )}
                            </td>
                            <td className="p-3 font-mono">{mov.quantity}</td>
                            <td className="p-3 text-sm text-muted-foreground">{mov.reason || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      </PageTransition>
    </>
  );
}
