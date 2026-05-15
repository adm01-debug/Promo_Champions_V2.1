import { Helmet } from "react-helmet-async";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, ArrowUpCircle, ArrowDownCircle, AlertTriangle, TrendingUp, History, Plus, Sparkles, Zap, TrendingDown, Clock, ShieldAlert } from "lucide-react";
import { PageTransition } from "@/components/transitions/PageTransition";
import { useInventoryLevels, useStockMovements, useAddStockMovement } from "@/hooks/useInventory";
import { useStockForecast } from "@/hooks/useStockForecast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

function StockStatusBadge({ current, min, reorder }: { current: number; min: number; reorder: number }) {
  if (current <= min) return <Badge variant="destructive" className="font-black uppercase tracking-widest text-[10px]">CRITICAL</Badge>;
  if (current <= reorder) return <Badge className="bg-amber-500/20 text-amber-500 border-none font-black uppercase tracking-widest text-[10px]">LOW STOCK</Badge>;
  return <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-black uppercase tracking-widest text-[10px]">OPTIMAL</Badge>;
}

export default function Estoque() {
  const { data: inventory = [], isLoading: loadingInv } = useInventoryLevels();
  const { data: movements = [], isLoading: loadingMov } = useStockMovements();
  const { data: forecast = [], isLoading: loadingForecast } = useStockForecast();
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
        <meta name="description" content="Gestão de estoque e previsões inteligentes" />
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
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Inventory Engine v3.5</span>
                  <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                  <p className="text-[10px] text-primary font-bold uppercase tracking-wider">
                    {totalItems.toLocaleString("pt-BR")} UNITS UNDER CONTROL
                  </p>
                </div>
              </div>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="h-11 px-6 rounded-xl bg-primary text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]">
                  <Plus className="h-4 w-4 mr-2" />Deploy Movement
                </Button>
              </DialogTrigger>

              <DialogContent className="glass border-border/50">
                <DialogHeader className="pb-4 border-b border-border/10">
                  <DialogTitle className="font-display font-black text-xl uppercase tracking-tighter italic">Logistics Deployment</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Target Unit</p>
                    <Select value={form.product_id} onValueChange={v => setForm(f => ({ ...f, product_id: v }))}>
                      <SelectTrigger className="h-12 bg-muted/20 border-border/40 font-bold"><SelectValue placeholder="Select Product" /></SelectTrigger>
                      <SelectContent>
                        {inventory.map(i => (
                          <SelectItem key={i.id} value={i.product_id || i.id}>
                            {i.products?.name || "Produto"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Type</p>
                      <Select value={form.movement_type} onValueChange={v => setForm(f => ({ ...f, movement_type: v }))}>
                        <SelectTrigger className="h-12 bg-muted/20 border-border/40 font-bold"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="entry" className="text-xs font-bold uppercase tracking-widest">Intake (+)</SelectItem>
                          <SelectItem value="exit" className="text-xs font-bold uppercase tracking-widest">Release (-)</SelectItem>
                          <SelectItem value="adjustment" className="text-xs font-bold uppercase tracking-widest">Adjustment (±)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Quantity</p>
                      <Input type="number" placeholder="0" className="h-12 bg-muted/20 border-border/40 text-sm font-bold" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Operational Briefing</p>
                    <Input placeholder="Reason for this movement..." className="h-12 bg-muted/20 border-border/40 text-sm font-medium italic" value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} />
                  </div>

                  <Button onClick={handleSubmit} disabled={addMovement.isPending} className="w-full bg-primary text-[10px] font-black uppercase tracking-widest h-12 rounded-xl mt-2">
                    {addMovement.isPending ? "Syncing..." : "Confirm Deployment"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="relative overflow-hidden bg-gradient-to-br from-card/80 to-card/40 border-none shadow-2xl backdrop-blur-md group">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-primary/10 ring-1 ring-white/5 group-hover:bg-primary/20 transition-colors">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest leading-none">Global Stock</p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-display font-black text-3xl tracking-tighter">{totalItems.toLocaleString("pt-BR")}</span>
                    <span className="text-[10px] font-bold text-primary italic">UNITS</span>
                  </div>
                </div>
              </CardContent>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-transparent opacity-20" />
            </Card>

            <Card className="relative overflow-hidden bg-gradient-to-br from-card/80 to-card/40 border-none shadow-2xl backdrop-blur-md group">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-rose-500/10 ring-1 ring-white/5 group-hover:bg-rose-500/20 transition-colors">
                  <AlertTriangle className="h-6 w-6 text-rose-500" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest leading-none">Critical Units</p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-display font-black text-3xl tracking-tighter text-rose-500">{criticalCount}</span>
                    <span className="text-[10px] font-bold text-rose-500 italic">ALERTS</span>
                  </div>
                </div>
              </CardContent>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500/50 to-transparent opacity-20" />
            </Card>

            <Card className="relative overflow-hidden bg-gradient-to-br from-card/80 to-card/40 border-none shadow-2xl backdrop-blur-md group">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-amber-500/10 ring-1 ring-white/5 group-hover:bg-amber-500/20 transition-colors">
                  <TrendingUp className="h-6 w-6 text-amber-500" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest leading-none">Low Supply</p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-display font-black text-3xl tracking-tighter text-amber-500">{lowCount}</span>
                    <span className="text-[10px] font-bold text-amber-500 italic">WARNING</span>
                  </div>
                </div>
              </CardContent>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500/50 to-transparent opacity-20" />
            </Card>

            <Card className="relative overflow-hidden bg-gradient-to-br from-card/80 to-card/40 border-none shadow-2xl backdrop-blur-md group">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-emerald-500/10 ring-1 ring-white/5 group-hover:bg-emerald-500/20 transition-colors">
                  <ArrowUpCircle className="h-6 w-6 text-emerald-500" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest leading-none">Recent Intake</p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-display font-black text-3xl tracking-tighter text-emerald-500">{entriesCount}</span>
                    <span className="text-[10px] font-bold text-emerald-500 italic">TX</span>
                  </div>
                </div>
              </CardContent>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/50 to-transparent opacity-20" />
            </Card>
          </div>

          <Tabs defaultValue="inventory" className="w-full">
            <TabsList className="bg-muted/20 border border-border/10 p-1 rounded-xl h-12">
              <TabsTrigger value="inventory" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-[10px] font-black uppercase tracking-widest px-6 h-full">
                <Package className="h-3.5 w-3.5 mr-2" />Equipment
              </TabsTrigger>
              <TabsTrigger value="forecast" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-[10px] font-black uppercase tracking-widest px-6 h-full">
                <Sparkles className="h-3.5 w-3.5 mr-2" />Forecast Intelligence
              </TabsTrigger>
              <TabsTrigger value="movements" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-[10px] font-black uppercase tracking-widest px-6 h-full">
                <History className="h-3.5 w-3.5 mr-2" />Tactical Log
              </TabsTrigger>
            </TabsList>

            <TabsContent value="inventory" className="mt-4">
              <Card className="relative overflow-hidden bg-gradient-to-br from-card/80 to-card/40 border border-border/20 shadow-2xl backdrop-blur-md rounded-2xl">
                <CardHeader className="p-6 border-b border-border/10 flex flex-row items-center justify-between">
                  <CardTitle className="text-lg font-black uppercase tracking-tighter italic">Strategic Inventory</CardTitle>
                  <div className="px-3 py-1 rounded-lg bg-primary/5 border border-primary/10 text-[10px] font-black text-primary uppercase tracking-widest">
                    Live Monitoring
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {loadingInv ? (
                    <div className="p-6 space-y-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-4">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-2 w-full rounded-full" />
                        </div>
                      ))}
                    </div>
                  ) : inventory.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center">
                      <Package className="h-12 w-12 text-muted-foreground/20 mb-3" />
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Aguardando suprimentos da elite...</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border/10 text-left bg-muted/20">
                            <th className="p-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Equipment</th>
                            <th className="p-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Stock Level</th>
                            <th className="p-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Condition</th>
                            <th className="p-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right">Last Sync</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/10">
                          {inventory.map(item => {
                            const pct = Math.min(100, (item.current_stock / (item.max_stock_level || 100)) * 100);
                            return (
                              <tr key={item.id} className="group hover:bg-primary/5 transition-colors">
                                <td className="p-4">
                                  <div className="flex flex-col">
                                    <span className="font-display font-black text-sm uppercase tracking-tighter group-hover:text-primary transition-colors">
                                      {item.products?.name || "UNIDENTIFIED UNIT"}
                                    </span>
                                    <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">SKU: {(item.products as { sku?: string })?.sku || "—"}</span>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="space-y-2 min-w-[200px]">
                                    <div className="flex items-center justify-between gap-2">
                                      <div className="flex items-baseline gap-1.5">
                                        <span className="font-display font-black text-lg">{item.current_stock}</span>
                                        <span className="text-[10px] font-bold text-muted-foreground/40 uppercase">/ {item.max_stock_level}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        {pct < 20 ? (
                                          <TrendingDown className="h-3 w-3 text-rose-500 animate-bounce" />
                                        ) : pct > 80 ? (
                                          <TrendingUp className="h-3 w-3 text-emerald-500" />
                                        ) : (
                                          <div className="h-1 w-1 rounded-full bg-primary/40" />
                                        )}
                                        <span className={cn("text-[10px] font-black uppercase tracking-tight", pct < 20 ? "text-rose-500" : pct > 80 ? "text-emerald-500" : "text-muted-foreground/60")}>
                                          {Math.round(pct)}%
                                        </span>
                                      </div>
                                    </div>
                                    <div className="h-2 w-full bg-muted/20 rounded-full overflow-hidden relative">
                                      <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${pct}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className={cn(
                                          "h-full rounded-full transition-all duration-500 relative z-10",
                                          pct <= 20 ? "bg-gradient-to-r from-rose-600 to-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.5)]" : 
                                          pct <= 40 ? "bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.3)]" : 
                                          "bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                                        )}
                                      />
                                      {/* Reorder Point Indicator */}
                                      {item.reorder_point && item.max_stock_level && (
                                        <div 
                                          className="absolute top-0 bottom-0 w-0.5 bg-white/20 z-20"
                                          style={{ left: `${(item.reorder_point / item.max_stock_level) * 100}%` }}
                                          title={`Reorder Point: ${item.reorder_point}`}
                                        />
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="p-4 flex items-center gap-3">
                                  <StockStatusBadge current={item.current_stock} min={item.min_stock_level} reorder={item.reorder_point} />
                                  <div className="flex flex-col">
                                    <span className="text-[9px] font-black text-muted-foreground/40 uppercase leading-none">Min: {item.min_stock_level}</span>
                                    <span className="text-[9px] font-black text-primary/40 uppercase leading-none mt-1">Reorder: {item.reorder_point}</span>
                                  </div>
                                </td>
                                <td className="p-4 text-right">
                                  <span className="text-[10px] font-black text-muted-foreground uppercase tabular-nums">
                                    {item.last_restock_date
                                      ? format(new Date(item.last_restock_date), "dd/MM/yy", { locale: ptBR })
                                      : "NEVER"}
                                  </span>
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

            <TabsContent value="forecast" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {loadingForecast ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <Card key={i} className="bg-card/40 border-border/20 p-6 space-y-4">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-4 w-24" />
                      </Card>
                    ))
                  ) : forecast.length === 0 ? (
                    <div className="col-span-full p-12 text-center bg-card/40 rounded-2xl border border-dashed border-border/50">
                      <Sparkles className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Aguardando telemetria de vendas para processar previsões...</p>
                    </div>
                  ) : (
                    forecast.map((item, idx) => (
                      <motion.div
                        key={item.productId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <Card className={cn(
                          "relative overflow-hidden border-none shadow-xl backdrop-blur-md transition-all hover:scale-[1.02]",
                          item.urgency === 'critical' ? "bg-rose-500/10 ring-1 ring-rose-500/30" : 
                          item.urgency === 'warning' ? "bg-amber-500/10 ring-1 ring-amber-500/30" : 
                          "bg-emerald-500/5 ring-1 ring-emerald-500/20"
                        )}>
                          <CardHeader className="p-5 pb-2">
                            <div className="flex justify-between items-start">
                              <Badge variant="outline" className={cn(
                                "text-[10px] font-black uppercase tracking-widest",
                                item.urgency === 'critical' ? "bg-rose-500/20 text-rose-500 border-rose-500/40" : 
                                item.urgency === 'warning' ? "bg-amber-500/20 text-amber-500 border-amber-500/40" : 
                                "bg-emerald-500/20 text-emerald-500 border-emerald-500/40"
                              )}>
                                {item.urgency === 'critical' ? "Critical Reorder" : 
                                 item.urgency === 'warning' ? "Supply Warning" : "Stable Flow"}
                              </Badge>
                              {item.urgency === 'critical' && <ShieldAlert className="h-4 w-4 text-rose-500 animate-pulse" />}
                            </div>
                            <CardTitle className="font-display font-black text-lg uppercase tracking-tighter italic mt-2">
                              {item.productName}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-5 pt-0 space-y-4">
                            <div className="flex justify-between items-end">
                              <div>
                                <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">Daily Velocity</p>
                                <p className="font-display font-black text-xl">{item.dailyVelocity.toFixed(2)} <span className="text-[10px] italic">UN/DAY</span></p>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">Est. Out of Stock</p>
                                <p className={cn(
                                  "font-display font-black text-xl",
                                  item.urgency === 'critical' ? "text-rose-500" : "text-foreground"
                                )}>
                                  {item.daysRemaining > 365 ? "∞" : `${item.daysRemaining} DAYS`}
                                </p>
                              </div>
                            </div>
                            
                            <div className="space-y-1.5 pt-2 border-t border-border/10">
                              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                <span className="text-muted-foreground">Repletion Status</span>
                                <span className={item.urgency === 'critical' ? "text-rose-500" : "text-emerald-500"}>
                                  {Math.round((item.currentStock / 100) * 100)}%
                                </span>
                              </div>
                              <Progress 
                                value={Math.min(100, (item.currentStock / 100) * 100)} 
                                className={cn(
                                  "h-1.5",
                                  item.urgency === 'critical' ? "bg-rose-500/20" : "bg-emerald-500/20"
                                )}
                              />
                            </div>

                            {item.expectedOutOfStockDate && (
                              <div className="flex items-center gap-2 mt-4 p-2 rounded-lg bg-black/20 border border-white/5">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                  Expected Zero-Day: {format(item.expectedOutOfStockDate, "dd/MM/yyyy")}
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </TabsContent>

            <TabsContent value="movements" className="mt-4">
              <Card className="relative overflow-hidden bg-gradient-to-br from-card/80 to-card/40 border border-border/20 shadow-2xl backdrop-blur-md rounded-2xl">
                <CardHeader className="p-6 border-b border-border/10 flex flex-row items-center justify-between">
                  <CardTitle className="text-lg font-black uppercase tracking-tighter italic">Tactical Movements</CardTitle>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-accent/30 border border-white/5">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Live Flow</span>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {loadingMov ? (
                    <div className="p-6 space-y-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-4">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                      ))}
                    </div>
                  ) : movements.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center">
                      <History className="h-12 w-12 text-muted-foreground/20 mb-3" />
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No strategic movements recorded in the tactical logs.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border/10 text-left bg-muted/20">
                            <th className="p-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Time</th>
                            <th className="p-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Type</th>
                            <th className="p-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Equipment</th>
                            <th className="p-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Quantity</th>
                            <th className="p-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Briefing</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/10">
                          {movements.map(move => (
                            <tr key={move.id} className="group hover:bg-white/5 transition-colors">
                              <td className="p-4 text-[10px] font-black text-muted-foreground uppercase tabular-nums">
                                {format(new Date(move.created_at), "dd/MM HH:mm", { locale: ptBR })}
                              </td>
                              <td className="p-4">
                                <Badge className={cn(
                                  "text-[10px] font-black uppercase tracking-widest",
                                  move.movement_type === "entry" ? "bg-emerald-500/20 text-emerald-500 border-emerald-500/30" : 
                                  move.movement_type === "exit" ? "bg-rose-500/20 text-rose-500 border-rose-500/30" : 
                                  "bg-amber-500/20 text-amber-500 border-amber-500/30"
                                )}>
                                  {move.movement_type === "entry" ? "Intake" : move.movement_type === "exit" ? "Release" : "Adjustment"}
                                </Badge>
                              </td>
                              <td className="p-4">
                                <span className="font-display font-bold text-xs uppercase tracking-tight">
                                  {move.products?.name || "UNIDENTIFIED"}
                                </span>
                              </td>
                              <td className="p-4 font-display font-black text-sm">
                                {move.movement_type === "exit" ? "-" : "+"}{move.quantity}
                              </td>
                              <td className="p-4 text-xs italic text-muted-foreground max-w-[200px] truncate">
                                {move.reason || "N/A"}
                              </td>
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
