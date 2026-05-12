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
import { TrendingDown, TrendingUp, AlertTriangle, DollarSign, Clock, Filter, ArrowDown, Zap, Brain, Target, BarChart3, Activity } from "lucide-react";
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
                <Card className="p-4 glass border-border/40 text-center">
                  <TrendingUp className="h-5 w-5 mx-auto mb-1 text-status-success" />
                  <p className="text-2xl font-display font-bold">{data.overallConversion}%</p>
                  <p className="text-[10px] text-muted-foreground">Conversão Geral</p>
                </Card>
                <Card className="p-4 glass border-border/40 text-center">
                  <DollarSign className="h-5 w-5 mx-auto mb-1 text-primary" />
                  <p className="text-2xl font-display font-bold">{fmtCurrency(data.totalValue)}</p>
                  <p className="text-[10px] text-muted-foreground">Valor Total Won</p>
                </Card>
                <Card className="p-4 glass border-border/40 text-center">
                  <DollarSign className="h-5 w-5 mx-auto mb-1 text-info" />
                  <p className="text-2xl font-display font-bold">{fmtCurrency(data.avgDealSize)}</p>
                  <p className="text-[10px] text-muted-foreground">Ticket Médio</p>
                </Card>
                <Card className="p-4 glass border-border/40 text-center">
                  <AlertTriangle className="h-5 w-5 mx-auto mb-1 text-destructive" />
                  <p className="text-lg font-display font-bold">{data.topDropOffStage}</p>
                  <p className="text-[10px] text-muted-foreground">Maior Drop-off</p>
                </Card>
              </motion.div>

              {/* Funnel Visualization */}
              <motion.div variants={itemVariants} className="space-y-1">
                {data.stages.map((stage, index) => {
                  const maxCount = Math.max(...data.stages.map(s => s.count), 1);
                  const widthPercent = Math.max((stage.count / maxCount) * 100, 15);
                  const isTopDrop = stage.stage === data.topDropOffStage;

                  return (
                    <div key={stage.stage} className="space-y-1">
                      <div
                        className={cn(
                          "mx-auto rounded-lg p-4 glass border transition-all relative overflow-hidden",
                          isTopDrop ? "border-destructive/40 bg-destructive/5" : "border-border/40"
                        )}
                        style={{ width: `${widthPercent}%`, minWidth: "280px" }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-display font-semibold text-sm">{stage.stage}</p>
                            <p className="text-xs text-muted-foreground">{stage.count} deals • {fmtCurrency(stage.value)}</p>
                          </div>
                          <div className="flex gap-2 items-center">
                            <Badge variant="outline" className={cn(
                              "text-[10px]",
                              stage.conversionRate >= 60 ? "text-status-success border-status-success/30" :
                              stage.conversionRate >= 30 ? "text-status-warning border-status-warning/30" :
                              "text-destructive border-destructive/30"
                            )}>
                              <TrendingUp className="h-3 w-3 mr-1" />{stage.conversionRate}%
                            </Badge>
                            {stage.dropOffRate > 0 && (
                              <Badge variant="outline" className="text-[10px] text-destructive border-destructive/30">
                                <TrendingDown className="h-3 w-3 mr-1" />-{stage.dropOffRate}%
                              </Badge>
                            )}
                          </div>
                        </div>
                        {isTopDrop && (
                          <Badge className="absolute top-1 right-1 text-[8px] bg-destructive/20 text-destructive border-none">
                            ⚠️ Gargalo
                          </Badge>
                        )}
                      </div>
                      {index < data.stages.length - 1 && (
                        <div className="flex justify-center">
                          <ArrowDown className="h-4 w-4 text-muted-foreground/50" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </motion.div>
            </>
          )}
        </div>
      </PageTransition>
    </>
  );
};

export default FunnelAnalysis;
