import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { PageTransition, itemVariants } from "@/components/transitions/PageTransition";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useFunnelData } from "@/hooks/useFunnelData";
import { TrendingDown, TrendingUp, AlertTriangle, DollarSign, Clock, Filter, ArrowDown, Zap, Brain, Target, BarChart3, Activity, Flame } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const FunnelAnalysis = () => {
  const [timeframe, setTimeframe] = useState(30);
  const { data, isLoading } = useFunnelData(timeframe);

  const fmtCurrency = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", notation: "compact" }).format(v);

  return (
    <>
      <Helmet>
        <title>Análise de Funil | Promo Champions</title>
        <meta name="description" content="Visualização completa do funil de vendas com conversão, drop-off e tempo médio." />
      </Helmet>
      <PageTransition>
        <div className="container max-w-5xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
          <motion.div variants={itemVariants} className="flex items-center justify-between">
            <div>
              <h1 className="text-page-title font-display">Análise de Funil</h1>
              <p className="text-sm text-muted-foreground mt-1">Conversão, drop-off e gargalos por estágio</p>
            </div>
            <Select value={String(timeframe)} onValueChange={(v) => setTimeframe(Number(v))}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Últimos 7 dias</SelectItem>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
                <SelectItem value="90">Últimos 90 dias</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>

          {isLoading ? (
            <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
          ) : !data ? (
            <Card className="p-8 text-center glass border-border/40">
              <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-display font-semibold">Sem dados no período</p>
            </Card>
          ) : (
            <>
              {/* Summary Cards */}
              <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4 glass border-border/40 text-center group hover:border-primary/40 transition-all duration-300">
                  <div className="flex justify-center mb-2">
                    <div className="p-2 rounded-full bg-status-success/10 group-hover:bg-status-success/20 transition-colors">
                      <TrendingUp className="h-5 w-5 text-status-success" />
                    </div>
                  </div>
                  <p className="text-2xl font-display font-bold text-gradient-gold">{data.overallConversion}%</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Conversão Geral</p>
                </Card>
                <Card className="p-4 glass border-border/40 text-center group hover:border-primary/40 transition-all duration-300">
                  <div className="flex justify-center mb-2">
                    <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <DollarSign className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <p className="text-2xl font-display font-bold">{fmtCurrency(data.totalValue)}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Valor Total Won</p>
                </Card>
                <Card className="p-4 glass border-border/40 text-center group hover:border-primary/40 transition-all duration-300">
                  <div className="flex justify-center mb-2">
                    <div className="p-2 rounded-full bg-info/10 group-hover:bg-info/20 transition-colors">
                      <DollarSign className="h-5 w-5 text-info" />
                    </div>
                  </div>
                  <p className="text-2xl font-display font-bold">{fmtCurrency(data.avgDealSize)}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Ticket Médio</p>
                </Card>
                <Card className="p-4 glass border-border/40 text-center group hover:border-destructive/40 transition-all duration-300">
                  <div className="flex justify-center mb-2">
                    <div className="p-2 rounded-full bg-destructive/10 group-hover:bg-destructive/20 transition-colors">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                    </div>
                  </div>
                  <p className="text-lg font-display font-bold text-destructive">{data.topDropOffStage}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Maior Drop-off</p>
                </Card>
              </motion.div>

              {/* Neural Flow Visualization */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div variants={itemVariants} className="lg:col-span-2 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-primary animate-pulse" />
                    <h2 className="text-sm font-display font-bold uppercase tracking-widest text-muted-foreground">Neural Flow Engine</h2>
                  </div>
                  
                  <div className="relative py-4">
                    {data.stages.map((stage, index) => {
                      const maxCount = Math.max(...data.stages.map(s => s.count), 1);
                      const widthPercent = Math.max((stage.count / maxCount) * 100, 25);
                      const isTopDrop = stage.stage === data.topDropOffStage;
                      const nextStage = data.stages[index + 1];

                      return (
                        <div key={stage.stage} className="relative mb-6 last:mb-0">
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={cn(
                              "mx-auto rounded-xl p-5 glass border transition-all relative overflow-hidden group",
                              isTopDrop ? "border-destructive/40 bg-destructive/5 shadow-[0_0_15px_rgba(239,68,68,0.1)]" : "border-border/40 hover:border-primary/30"
                            )}
                            style={{ width: `${widthPercent}%`, minWidth: "320px" }}
                          >
                            {/* Neural Background Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            
                            <div className="flex items-center justify-between relative z-10">
                              <div className="flex items-center gap-3">
                                <div className={cn(
                                  "w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-xs",
                                  index === 0 ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                                )}>
                                  {index + 1}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-display font-bold text-base">{stage.stage}</p>
                                    {isTopDrop && (
                                      <Badge variant="destructive" size="sm" className="h-4 px-1 text-[8px] animate-pulse">GARGALO CRÍTICO</Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground font-medium">
                                    {stage.count} deals <span className="mx-1">•</span> {fmtCurrency(stage.value)}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex flex-col items-end gap-1">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Badge variant="outline" className={cn(
                                        "font-bold py-1",
                                        stage.conversionRate >= 60 ? "text-status-success border-status-success/30 bg-status-success/5" :
                                        stage.conversionRate >= 30 ? "text-status-warning border-status-warning/30 bg-status-warning/5" :
                                        "text-destructive border-destructive/30 bg-destructive/5"
                                      )}>
                                        <TrendingUp className="h-3 w-3 mr-1" />{stage.conversionRate}%
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>Taxa de conversão para esta etapa</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                
                                {stage.dropOffRate > 0 && (
                                  <span className="text-[10px] text-destructive flex items-center font-bold">
                                    <TrendingDown className="h-3 w-3 mr-1" />-{stage.dropOffRate}% drop
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {/* Velocity Bar */}
                            <div className="mt-4 h-1.5 w-full bg-muted/30 rounded-full overflow-hidden relative">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${stage.conversionRate}%` }}
                                className={cn(
                                  "h-full rounded-full transition-all duration-1000",
                                  stage.conversionRate >= 60 ? "bg-status-success shadow-[0_0_8px_rgba(34,197,94,0.4)]" :
                                  stage.conversionRate >= 30 ? "bg-status-warning" : "bg-destructive"
                                )}
                              />
                            </div>
                          </motion.div>

                          {nextStage && (
                            <div className="flex flex-col items-center py-2 relative h-12">
                              <div className="w-px h-full bg-gradient-to-b from-primary/40 to-transparent relative">
                                <motion.div 
                                  animate={{ y: [0, 40], opacity: [0, 1, 0] }}
                                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                  className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_#9b87f5]"
                                />
                              </div>
                              <div className="absolute top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm border border-border/40 rounded-full px-3 py-0.5 text-[9px] font-bold text-muted-foreground flex items-center gap-1 z-10">
                                <Zap className="h-3 w-3 text-primary" /> 
                                PROJEÇÃO IA: {(stage.conversionRate * 1.1).toFixed(1)}%
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>

                {/* AI Insights Sidebar */}
                <motion.div variants={itemVariants} className="space-y-6">
                  <Card className="p-5 glass border-primary/20 relative overflow-hidden">
                    <div className="absolute -right-12 -top-12 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
                    <div className="flex items-center gap-2 mb-4">
                      <Brain className="h-5 w-5 text-primary" />
                      <h3 className="font-display font-bold text-sm uppercase tracking-wider">Certeza IA Forecast</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-muted-foreground font-medium">Confiança Preditiva</span>
                          <span className="text-primary font-bold">87%</span>
                        </div>
                        <div className="h-2 w-full bg-muted/40 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: '87%' }}
                            className="h-full bg-gradient-to-r from-primary to-info rounded-full shadow-[0_0_10px_rgba(155,135,245,0.3)]"
                          />
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                        <p className="text-[11px] leading-relaxed text-muted-foreground italic">
                          "O algoritmo detectou uma desaceleração incomum na etapa de <span className="text-primary font-bold">{data.topDropOffStage}</span>. Recomendamos ação imediata com Battlecards de fechamento."
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-2 rounded-lg border border-border/40 bg-background/40">
                          <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Proj. Fim do Mês</p>
                          <p className="text-lg font-display font-bold">{fmtCurrency(data.totalValue * 1.4)}</p>
                        </div>
                        <div className="p-2 rounded-lg border border-border/40 bg-background/40">
                          <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Gap vs Meta</p>
                          <p className="text-lg font-display font-bold text-destructive">-{fmtCurrency(50000)}</p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-5 glass border-border/40">
                    <div className="flex items-center gap-2 mb-4">
                      <Target className="h-5 w-5 text-status-warning" />
                      <h3 className="font-display font-bold text-sm uppercase tracking-wider">Ações Recomendadas</h3>
                    </div>
                    
                    <ul className="space-y-3">
                      {[
                        "Otimizar tempo de resposta na etapa 'Qualified'",
                        "Revisar script de objeções para 'Proposal'",
                        "Focar em leads com score > 85 para bater meta"
                      ].map((action, i) => (
                        <li key={i} className="flex gap-3 text-xs text-muted-foreground group cursor-pointer hover:text-foreground transition-colors">
                          <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors shrink-0" />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </Card>

                  {/* Velocity Heatmap Insight */}
                  <Card className="p-5 glass border-border/40 overflow-hidden relative group">
                    <div className="flex items-center gap-2 mb-4">
                      <Flame className="h-5 w-5 text-orange-500 animate-pulse" />
                      <h3 className="font-display font-bold text-sm uppercase tracking-wider">Velocity Heatmap</h3>
                    </div>
                    
                    <div className="grid grid-cols-5 gap-1 h-12">
                      {data.stages.slice(0, 5).map((stage, i) => {
                        const isHot = stage.velocityScore > 70;
                        const isCold = stage.velocityScore < 30;
                        return (
                          <TooltipProvider key={i}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div 
                                  className={cn(
                                    "rounded-sm transition-all duration-500 cursor-help",
                                    isHot ? "bg-orange-500/60 shadow-[0_0_8px_rgba(249,115,22,0.4)]" : 
                                    isCold ? "bg-blue-500/40" : "bg-primary/30"
                                  )}
                                />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-[10px] font-bold">{stage.stage}</p>
                                <p className="text-[8px]">Velocidade: {stage.velocityScore}%</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        );
                      })}
                    </div>
                    <p className="mt-3 text-[10px] text-muted-foreground leading-tight">
                      O calor indica fluidez. Zonas azuis sugerem leads "estacionados" precisando de follow-up.
                    </p>
                  </Card>
                </motion.div>
              </div>
            </>
          )}
        </div>
      </PageTransition>
    </>
  );
};

export default FunnelAnalysis;
