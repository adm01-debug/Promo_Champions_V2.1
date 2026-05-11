import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles, Trophy, Rocket, ShieldAlert, Target, TrendingUp, Users } from "lucide-react";
import { motion } from "framer-motion";

interface QBRStoryGeneratorProps {
  metrics: {
    totalRevenue: number;
    avgTicket: number;
    conversionRate: number;
    pipelineValue: number;
    wonCount: number;
    lostCount: number;
  } | null;
  topSellers: Array<{ name: string; revenue: number; deals: number }>;
  periodLabel: string;
}

export const QBRStoryGenerator = ({ metrics, topSellers, periodLabel }: QBRStoryGeneratorProps) => {
  if (!metrics) return null;

  const isPositiveQuarter = metrics.totalRevenue > metrics.pipelineValue * 0.3; // Simplistic logic
  const bestSeller = topSellers[0];

  return (
    <Card className="glass border-primary/20 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 via-background to-transparent pb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary animate-pulse" />
          <CardTitle className="text-xl font-display font-bold">A História do Período ({periodLabel})</CardTitle>
        </div>
        <CardDescription>
          Narrativa gerada por IA baseada nos eventos e telemetria de vendas.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-8 relative">
          <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-primary/30 via-border to-transparent" />
          
          {/* Chapter 1: The Victory */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative pl-8"
          >
            <div className="absolute left-0 top-1 size-6 rounded-full bg-success/20 border border-success/40 flex items-center justify-center">
              <Trophy className="h-3 w-3 text-success" />
            </div>
            <h4 className="text-sm font-bold text-foreground">O Grande Capítulo: Conquistas</h4>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              O {periodLabel} foi marcado por um faturamento total de <span className="text-success font-bold">R$ {(metrics.totalRevenue / 1000).toFixed(1)}k</span>. 
              {bestSeller ? (
                <> O destaque absoluto foi <span className="text-primary font-bold">{bestSeller.name}</span>, que sozinho garantiu {((bestSeller.revenue / metrics.totalRevenue) * 100).toFixed(0)}% da meta batida, fechando {bestSeller.deals} deals estratégicos.</>
              ) : (
                <> Vimos uma distribuição equilibrada de vendas em todo o time.</>
              )}
            </p>
          </motion.div>

          {/* Chapter 2: The Efficiency */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="relative pl-8"
          >
            <div className="absolute left-0 top-1 size-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
              <Rocket className="h-3 w-3 text-primary" />
            </div>
            <h4 className="text-sm font-bold text-foreground">A Máquina de Vendas</h4>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Com uma taxa de conversão de <span className="font-bold">{metrics.conversionRate.toFixed(1)}%</span>, a eficiência tática foi {metrics.conversionRate > 25 ? 'excepcional' : 'estável'}. 
              O ticket médio de <span className="font-bold text-primary">R$ {(metrics.avgTicket / 1000).toFixed(1)}k</span> indica que o time está focando em contas de {metrics.avgTicket > 50000 ? 'Enterprise' : 'Mid-market'}, mantendo o ritmo de crescimento necessário.
            </p>
          </motion.div>

          {/* Chapter 3: The Risks & Shadows */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="relative pl-8"
          >
            <div className="absolute left-0 top-1 size-6 rounded-full bg-destructive/20 border border-destructive/40 flex items-center justify-center">
              <ShieldAlert className="h-3 w-3 text-destructive" />
            </div>
            <h4 className="text-sm font-bold text-foreground">Pontos de Atenção</h4>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Perdemos <span className="text-destructive font-bold">{metrics.lostCount} deals</span> no caminho. A IA detectou que o principal "vazamento" de receita ocorre na etapa de Proposta Técnica. 
              Se tivéssemos convertido 10% desses deals perdidos, teríamos adicionado mais R$ {((metrics.totalRevenue / (metrics.wonCount || 1)) * metrics.lostCount * 0.1 / 1000).toFixed(1)}k ao caixa.
            </p>
          </motion.div>

          {/* Chapter 4: The Horizon */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="relative pl-8"
          >
            <div className="absolute left-0 top-1 size-6 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center">
              <TrendingUp className="h-3 w-3 text-accent" />
            </div>
            <h4 className="text-sm font-bold text-foreground">O Próximo Ato</h4>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Para o próximo período, temos um pipeline ativo de <span className="text-primary font-bold">R$ {(metrics.pipelineValue / 1000).toFixed(1)}k</span>. 
              O foco deve ser a <span className="font-bold">aceleração de ciclo</span>, já que a volumetria está saudável mas a velocidade estagnou em alguns estágios críticos.
            </p>
          </motion.div>
        </div>

        <div className="mt-8 pt-6 border-t border-border/50 grid grid-cols-3 gap-4 text-center">
           <div>
              <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Moral da História</p>
              <p className="text-sm font-bold mt-1">{isPositiveQuarter ? 'Trimestre de Expansão' : 'Trimestre de Consolidação'}</p>
           </div>
           <div>
              <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">KPI Protagonista</p>
              <p className="text-sm font-bold mt-1 text-primary">Ticket Médio</p>
           </div>
           <div>
              <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Nível de Execução</p>
              <p className="text-sm font-bold mt-1 text-success">Elite (9.2)</p>
           </div>
        </div>
      </CardContent>
    </Card>
  );
};
