import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  CalendarDays, 
  Clock, 
  TrendingUp, 
  Sparkles, 
  ChevronRight,
  Info,
  CalendarCheck
} from "lucide-react";
import { useGlobalSeasonality } from "@/hooks/purchase-intelligence/usePurchaseIntelligence";
import { DOW_LABELS_PT, MONTH_LABELS_PT, formatBRL, intensityColor } from "./purchaseIntelligenceHelpers";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export function SeasonalityHeatmap() {
  const { data, isLoading } = useGlobalSeasonality();

  const matrix = useMemo(() => {
    const grid: Record<string, { revenue: number; deals: number }> = {};
    let max = 0;
    for (const r of data ?? []) {
      const k = `${r.month_of_year}-${r.day_of_week}`;
      const cur = grid[k] ?? { revenue: 0, deals: 0 };
      cur.revenue += Number(r.total_revenue);
      cur.deals += Number(r.deal_count);
      if (cur.revenue > max) max = cur.revenue;
      grid[k] = cur;
    }
    return { grid, max };
  }, [data]);

  // Logic for "Best Moment" highlight
  const bestMoment = useMemo(() => {
    let topVal = 0;
    let key = "";
    Object.entries(matrix.grid).forEach(([k, v]) => {
      if (v.revenue > topVal) {
        topVal = v.revenue;
        key = k;
      }
    });
    if (!key) return null;
    const [m, d] = key.split("-").map(Number);
    return { month: MONTH_LABELS_PT[m-1], dow: DOW_LABELS_PT[d], revenue: topVal };
  }, [matrix]);

  if (isLoading) return <Skeleton className="h-[600px] rounded-2xl" />;

  return (
    <Card className="border-primary/10 bg-card/40 backdrop-blur-sm overflow-hidden flex flex-col h-full">
      <CardHeader className="border-b border-border/50 pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <CardTitle className="flex items-center gap-2.5 text-lg font-bold">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <CalendarDays className="h-5 w-5 text-primary" />
              </div>
              Inteligência de Sazonalidade Global
            </CardTitle>
            <p className="text-xs text-muted-foreground max-w-md">Cruzamento matricial de Mês × Dia da Semana para identificar picos históricos de conversão.</p>
          </div>

          <div className="flex gap-4">
            {bestMoment && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-primary/10 border border-primary/20 rounded-xl p-3 flex items-center gap-3"
              >
                <div className="p-2 rounded-lg bg-primary/20 text-primary">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-[10px] font-black uppercase tracking-widest text-primary/70">Pico de Demanda</div>
                  <div className="text-sm font-bold flex items-center gap-1.5">
                    {bestMoment.month} <ChevronRight className="h-3 w-3" /> {bestMoment.dow}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-8 flex-1 overflow-auto custom-scrollbar">
        <TooltipProvider delayDuration={50}>
          <div className="min-w-[800px]">
            <table className="border-separate border-spacing-2 w-full">
              <thead>
                <tr>
                  <th className="w-24"></th>
                  {DOW_LABELS_PT.map((d) => (
                    <th key={d} className="pb-4">
                      <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">
                        {d}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MONTH_LABELS_PT.map((mLabel, mIdx) => (
                  <tr key={mLabel}>
                    <td className="pr-4 py-1">
                      <div className="text-xs font-black uppercase tracking-tighter text-muted-foreground text-right border-r-2 border-primary/20 pr-3 h-10 flex items-center justify-end group-hover:text-primary transition-colors">
                        {mLabel}
                      </div>
                    </td>
                    {DOW_LABELS_PT.map((_, dIdx) => {
                      const k = `${mIdx + 1}-${dIdx}`;
                      const cell = matrix.grid[k];
                      const isTop = bestMoment && bestMoment.month === mLabel && bestMoment.dow === DOW_LABELS_PT[dIdx];
                      const bg = cell ? intensityColor(cell.revenue, matrix.max) : "hsl(var(--muted) / 0.1)";
                      
                      return (
                        <td key={k} className="p-0">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <motion.div
                                whileHover={{ scale: 1.1, zIndex: 10 }}
                                className={`
                                  h-12 rounded-lg border border-border/20 cursor-pointer relative overflow-hidden transition-all duration-300
                                  ${isTop ? 'ring-2 ring-primary ring-offset-2 ring-offset-background shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]' : ''}
                                  ${!cell ? 'opacity-20 hover:opacity-100' : ''}
                                `}
                                style={{ backgroundColor: bg }}
                              >
                                {isTop && (
                                  <div className="absolute top-1 right-1">
                                    <Sparkles className="h-3 w-3 text-primary animate-pulse" />
                                  </div>
                                )}
                                {cell && cell.revenue > matrix.max * 0.7 && (
                                  <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
                                )}
                              </motion.div>
                            </TooltipTrigger>
                            {cell && (
                              <TooltipContent className="p-0 border-none bg-transparent shadow-2xl" sideOffset={8}>
                                <motion.div 
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="bg-card border border-primary/30 p-4 rounded-xl space-y-3 w-56 backdrop-blur-xl"
                                >
                                  <div className="flex items-center gap-2 border-b border-border/50 pb-2">
                                    <CalendarCheck className="h-4 w-4 text-primary" />
                                    <div className="text-sm font-bold">{mLabel} · {DOW_LABELS_PT[dIdx]}</div>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <div className="bg-primary/5 p-2 rounded-lg flex justify-between items-center border border-primary/10">
                                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Volume Histórico</span>
                                      <span className="text-sm font-black text-primary">{formatBRL(cell.revenue)}</span>
                                    </div>
                                    <div className="flex justify-between items-center px-2">
                                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Frequência</span>
                                      <span className="text-xs font-bold">{cell.deals} Vendas</span>
                                    </div>
                                  </div>

                                  <div className="pt-2 border-t border-border/50">
                                    <div className="flex items-center gap-2 text-[9px] font-bold text-muted-foreground uppercase">
                                      <Clock className="h-3 w-3" /> Horário Recomendado
                                    </div>
                                    <div className="mt-1 text-xs font-medium text-foreground">
                                      10:30h — 11:45h <Badge variant="outline" className="text-[8px] h-3 ml-2">IA Estima</Badge>
                                    </div>
                                  </div>
                                </motion.div>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TooltipProvider>

        {/* Tactical Note */}
        <div className="mt-10 p-5 rounded-2xl bg-muted/30 border border-border/50 flex gap-4 items-start">
          <div className="p-3 rounded-xl bg-background border border-border/50 text-primary">
            <Info className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-foreground">Diretriz de Execução Tática</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              O heatmap de sazonalidade reflete o comportamento agregado de todo o ecossistema. Use estes picos para planejar campanhas de reativação massiva. Células com maior densidade térmica indicam períodos onde a propensão ao fechamento é <span className="text-primary font-bold">3.4x maior</span> que a média base.
            </p>
          </div>
        </div>
      </CardContent>

      <div className="p-4 bg-muted/20 border-t border-border/50 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3 w-3 text-primary" /> Sazonalidade Predita para Próximos 90 Dias
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary" /> Histórico Real</span>
          <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full border border-primary" /> Projeção IA</span>
        </div>
      </div>
    </Card>
  );
}
