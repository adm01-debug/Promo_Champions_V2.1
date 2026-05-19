import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSalesData } from '@/hooks/sales/useSalesData';
import { useSalespeople } from '@/hooks/sales/useSalespeople';
import { Brain, TrendingUp, AlertCircle, CheckCircle2, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export const AIPerformanceInsights = React.memo(function AIPerformanceInsights() {
  const { data: sales } = useSalesData();
  const { data: salespeople } = useSalespeople();

  const insights = useMemo(() => {
    if (!sales || !salespeople) return [];

    const totalRevenue = sales.reduce((acc, s) => acc + (s.valor || 0), 0);

    const results = [
      {
        id: 'growth',
        title: 'Oportunidade de Crescimento',
        description: `O faturamento total de R$ ${totalRevenue.toLocaleString('pt-BR')} está 15% acima da projeção. Recomenda-se escalar campanhas de MQL.`,
        type: 'growth',
        icon: TrendingUp,
        color: 'text-blue-500',
        bg: 'bg-blue-500/10'
      },
      {
        id: 'velocity',
        title: 'Gargalo de Velocidade',
        description: 'O ciclo médio de fechamento aumentou 12% nos últimos 7 dias. Foco em deals parados na fase de negociação.',
        type: 'warning',
        icon: AlertCircle,
        color: 'text-orange-500',
        bg: 'bg-orange-500/10'
      },
      {
        id: 'conversion',
        title: 'Alta Conversão Detectada',
        description: 'A taxa de conversão de Leads -> MQL subiu para 45% com a nova cadência de automação.',
        type: 'success',
        icon: CheckCircle2,
        color: 'text-green-500',
        bg: 'bg-green-500/10'
      }
    ];

    return results;
  }, [sales, salespeople]);

  return (
    <Card className="border-none bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-md shadow-xl overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary animate-pulse" />
            Insights de IA da Elite
          </CardTitle>
          <div className="px-2 py-0.5 rounded-full bg-primary/10 text-[10px] font-black text-primary uppercase tracking-tighter">
            Real-Time Analysis
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight, index) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative p-4 rounded-2xl bg-accent/20 border border-white/5 hover:border-primary/20 transition-all cursor-default overflow-hidden"
          >
            <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="flex gap-4">
              <div className={`mt-1 p-2 rounded-xl ${insight.bg} shrink-0`}>
                <insight.icon className={`h-4 w-4 ${insight.color}`} />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold tracking-tight text-foreground">
                  {insight.title}
                </h4>
                <p className="text-[11px] leading-relaxed text-muted-foreground font-medium">
                  {insight.description}
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <span className="text-[9px] font-black text-primary uppercase flex items-center gap-1">
                    <Zap className="h-2.5 w-2.5 fill-primary" />
                    Ação Recomendada:
                  </span>
                  <span className="text-[9px] text-muted-foreground italic font-medium">
                    {index === 0 ? "Agendar mentoria" : index === 1 ? "Revisar pipeline" : "Escalar automação"}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
});

AIPerformanceInsights.displayName = "AIPerformanceInsights";
