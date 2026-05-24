import { useIntelligenceZones } from "@/hooks/dashboard/useIntelligenceZones";
import { Card } from "@/components/ui/card";
import { 
  Users, 
  TrendingUp, 
  BarChart3, 
  Zap, 
  CalendarDays, 
  Target, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowDownRight, 
  Lightbulb,
  Clock,
  Package,
  Star
} from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const IntelligenceZones = () => {
  const { data, isLoading } = useIntelligenceZones();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
        <div className="col-span-1 lg:col-span-2 h-64 bg-card/50 rounded-2xl" />
        <div className="h-64 bg-card/50 rounded-2xl" />
        <div className="h-64 bg-card/50 rounded-2xl" />
        <div className="h-64 bg-card/50 rounded-2xl" />
        <div className="col-span-full h-64 bg-card/50 rounded-2xl" />
      </div>
    );
  }

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-10">
      {/* Row 1: 360 View & Expert Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-8 p-8 border-border/40 bg-card/30 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 transition-transform duration-1000 group-hover:scale-110" />
          
          <div className="flex items-center justify-between mb-8 relative z-10">
            <h3 className="text-lg font-black uppercase italic tracking-tighter flex items-center gap-2">
              <Users className="size-5 text-primary" /> Visão <span className="text-primary">360°</span> do Cliente
            </h3>
            <Badge variant="outline" className="font-mono text-[10px] bg-primary/5 border-primary/20 text-primary">Live Data</Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 relative z-10">
            {[
              { label: "LTV", value: formatCurrency(data?.customer360.ltv || 0), icon: Star, color: "text-amber-500" },
              { label: "Ticket Médio", value: formatCurrency(data?.customer360.avgTicket || 0), icon: Target, color: "text-blue-500" },
              { label: "Recência", value: `${data?.customer360.recency} dias`, icon: Clock, color: "text-emerald-500" },
              { label: "Pedidos", value: data?.customer360.orderCount, icon: Package, color: "text-purple-500" },
            ].map((m, i) => (
              <motion.div 
                key={m.label} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-primary/20 transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <m.icon className={`size-3.5 ${m.color}`} />
                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{m.label}</p>
                </div>
                <p className="text-xl font-black font-mono tracking-tighter">{m.value}</p>
              </motion.div>
            ))}
          </div>

          <div className="space-y-4 relative z-10">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
              <TrendingUp className="size-3 text-primary" /> Timeline 5 Últimos Pedidos
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {data?.customer360.lastOrders.map((order, i) => (
                <div key={order.id} className="p-3 bg-black/40 rounded-xl border border-white/5 flex flex-col justify-between group/order hover:border-primary/30 transition-all">
                  <p className="text-[9px] text-muted-foreground font-mono">{new Date(order.date).toLocaleDateString('pt-BR')}</p>
                  <p className="text-sm font-black text-primary mt-1">{formatCurrency(order.value)}</p>
                  <div className="mt-2 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ delay: 0.5 + (i * 0.1) }}
                      className="h-full bg-emerald-500" 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-4 p-8 border-border/40 bg-card/30 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:rotate-12 transition-transform">
            <Zap className="size-24 text-primary" />
          </div>
          
          <h3 className="text-lg font-black uppercase italic tracking-tighter flex items-center gap-2 mb-8 relative z-10">
            <Zap className="size-5 text-primary" /> Sugestão do <span className="text-primary">Especialista</span>
          </h3>
          
          <div className="space-y-4 relative z-10">
            {data?.expertCurated.map((item, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group/item flex flex-col gap-2 p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-primary/40 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary group-hover/item:scale-110 transition-transform">
                      <Brain className="size-5" />
                    </div>
                    <p className="text-sm font-black uppercase tracking-tighter">{item.name}</p>
                  </div>
                  <ArrowUpRight className="size-4 text-primary opacity-0 group-hover/item:opacity-100 transition-opacity" />
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed italic">{item.reason}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-primary/10 rounded-2xl border border-primary/20 relative overflow-hidden group/tip">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent -translate-x-full group-hover/tip:translate-x-full transition-transform duration-1000" />
            <h4 className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2 mb-1">
              <Lightbulb className="size-3" /> Tip do Dia
            </h4>
            <p className="text-[10px] font-medium leading-relaxed">Foque em cross-sell de segurança este mês; a demanda no setor subiu 18%.</p>
          </div>
        </Card>
      </div>

      {/* Row 2: Benchmark & Affinity & Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Benchmark */}
        <Card className="p-8 border-border/40 bg-card/30 backdrop-blur-xl group">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black uppercase italic tracking-tighter flex items-center gap-2">
              <BarChart3 className="size-5 text-primary" /> Cliente × <span className="text-primary">Setor</span>
            </h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="outline" className="text-[9px] uppercase tracking-widest bg-emerald-500/5 text-emerald-500 border-emerald-500/20">Benchmark OK</Badge>
                </TooltipTrigger>
                <TooltipContent>Métricas dentro da média do ramo (±15%)</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="space-y-6">
            {data?.benchmarks.map((b, i) => {
              const diff = ((b.client - b.sector) / b.sector) * 100;
              return (
                <div key={b.metric} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{b.metric}</p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black font-mono">{b.client}{b.unit}</span>
                      <span className={`text-[9px] font-bold ${diff >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {diff >= 0 ? '+' : ''}{diff.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden relative">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(b.client / (b.client + b.sector)) * 100}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className="h-full bg-primary relative z-10" 
                    />
                    <div 
                      className="absolute top-0 h-full w-0.5 bg-white/20 z-20" 
                      style={{ left: '50%' }}
                    />
                  </div>
                  <div className="flex justify-between text-[8px] text-muted-foreground uppercase font-bold tracking-tighter">
                    <span>Cliente</span>
                    <span>Setor: {b.sector}{b.unit}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Affinity Analysis */}
        <Card className="p-8 border-border/40 bg-card/30 backdrop-blur-xl">
          <h3 className="text-lg font-black uppercase italic tracking-tighter flex items-center gap-2 mb-8">
            <Target className="size-5 text-primary" /> Perfil de <span className="text-primary">Afinidade</span>
          </h3>

          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {data?.affinity.topCategories.map((cat, i) => (
                <Badge key={cat} className="bg-primary/20 text-primary border-primary/30 px-3 py-1 font-black uppercase tracking-widest text-[9px]">
                  {cat}
                </Badge>
              ))}
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <CheckCircle2 className="size-3 text-emerald-500" /> Produtos Sugeridos
              </p>
              {data?.affinity.suggestedProducts.map((prod, i) => (
                <div key={prod.name} className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between group cursor-pointer hover:border-primary/20 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="size-8 bg-black/40 rounded flex items-center justify-center text-[10px] font-bold text-primary">#{i+1}</div>
                    <p className="text-xs font-bold uppercase tracking-tighter">{prod.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] text-muted-foreground font-black uppercase">Confiança</p>
                    <p className="text-[10px] font-black text-emerald-500">{prod.confidence}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Trends */}
        <Card className="p-8 border-border/40 bg-card/30 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-16 -mt-16" />
          
          <h3 className="text-lg font-black uppercase italic tracking-tighter flex items-center gap-2 mb-8 relative z-10">
            <TrendingUp className="size-5 text-primary" /> Tendência <span className="text-primary">Setor</span>
          </h3>

          <div className="grid grid-cols-1 gap-4 relative z-10">
            {data?.sectorTrends.map((trend, i) => (
              <motion.div 
                key={trend.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="space-y-1">
                  <p className="text-[11px] font-black uppercase tracking-tighter">{trend.name}</p>
                  <p className="text-[9px] text-muted-foreground font-medium">{trend.sales.toLocaleString()} vendidos / 90d</p>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-black text-[10px]">
                  {trend.growth}
                </Badge>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>

      {/* Row 3: Seasonality Heatmap */}
      <Card className="p-8 border-border/40 bg-card/30 backdrop-blur-xl relative overflow-hidden group">
        <div className="absolute bottom-0 right-0 w-[600px] h-[300px] bg-primary/5 rounded-full blur-[100px] -mr-64 -mb-32" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 relative z-10">
          <div>
            <h3 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-2 mb-2">
              <CalendarDays className="size-6 text-primary" /> Sazonalidade <span className="text-primary">Estratégica</span>
            </h3>
            <p className="text-xs text-muted-foreground font-medium">Comparativo de volume mensal: Cliente vs Média do Setor (Janela 24 meses)</p>
          </div>
          
          <div className="flex gap-4">
            <div className="p-4 bg-black/40 rounded-2xl border border-primary/20 flex items-center gap-4 group/peak">
              <div className="size-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary group-hover/peak:animate-pulse">
                <TrendingUp className="size-5" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Próximo Pico</p>
                <p className="text-sm font-black text-primary uppercase italic">{data?.seasonality.nextPeak.month}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8 relative z-10">
          <div className="grid grid-cols-12 gap-2 h-48 items-end">
            {data?.seasonality.months.map((month, i) => {
              const clientVal = data.seasonality.clientData[i];
              const sectorVal = data.seasonality.sectorData[i];
              const maxVal = Math.max(...data.seasonality.clientData, ...data.seasonality.sectorData);
              
              return (
                <div key={month} className="col-span-1 space-y-4 group/bar">
                  <div className="relative h-full w-full flex gap-1 items-end justify-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: `${(sectorVal / maxVal) * 100}%` }}
                            transition={{ duration: 1, delay: i * 0.05 }}
                            className="w-1.5 bg-white/10 rounded-t-sm group-hover/bar:bg-white/20 transition-colors" 
                          />
                        </TooltipTrigger>
                        <TooltipContent className="bg-card border-border/40">Setor: {sectorVal}%</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: `${(clientVal / maxVal) * 100}%` }}
                            transition={{ duration: 1, delay: 0.2 + (i * 0.05) }}
                            className="w-2.5 bg-primary rounded-t-sm relative shadow-[0_0_10px_rgba(var(--primary),0.3)] group-hover/bar:scale-x-125 transition-transform" 
                          />
                        </TooltipTrigger>
                        <TooltipContent className="bg-primary text-primary-foreground">Cliente: {clientVal}%</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-center text-muted-foreground group-hover/bar:text-primary transition-colors">{month}</p>
                </div>
              );
            })}
          </div>

          <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10 flex items-start gap-4">
            <div className="p-3 bg-primary/20 rounded-2xl text-primary">
              <Brain className="size-6" />
            </div>
            <div>
              <h4 className="text-sm font-black uppercase tracking-widest text-primary mb-1">Insight Preditivo</h4>
              <p className="text-xs text-card-foreground font-medium leading-relaxed max-w-3xl">
                {data?.seasonality.nextPeak.insight} Recomendamos antecipar estoque em <span className="font-black text-primary">25%</span> e lançar campanha de aquisição em <span className="font-black text-primary">Setembro</span>.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
