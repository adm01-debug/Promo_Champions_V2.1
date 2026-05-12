import { memo, useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { TrendingDown, AlertCircle, ShieldOff, Sparkles, ChevronRight, Info, PieChart, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  totalLost: number;
  discountLost: number;
  competitorLost: number;
  marginErosion: number;
}

const fmtBRL = (n: number) => 
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(n);

const CountUp = ({ value, className }: { value: number; className?: string }) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  useMemo(() => {
    let start = 0;
    const end = value;
    const duration = 2000;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutExpo = 1 - Math.pow(2, -10 * progress);
      const current = easeOutExpo * (end - start) + start;
      
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return (
    <span className={className}>
      {Math.round(displayValue).toLocaleString("pt-BR")}
    </span>
  );
};

export const RevenueLeakageCard = memo(function RevenueLeakageCard({ totalLost, discountLost, competitorLost, marginErosion }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const total = discountLost + competitorLost + marginErosion || 1;

  const items = [
    { 
      label: "Descontos Excessivos", 
      value: discountLost, 
      icon: TrendingDown, 
      color: "text-warning", 
      bg: "bg-warning",
      recommendation: "Revisar alçadas de aprovação e treinar equipe em negociação baseada em valor.",
      subItems: [
        { name: "Descontos > 20%", impact: "R$ " + (discountLost * 0.6).toLocaleString("pt-BR") },
        { name: "Promoções não autorizadas", impact: "R$ " + (discountLost * 0.4).toLocaleString("pt-BR") }
      ]
    },
    { 
      label: "Pressão Competitiva", 
      value: competitorLost, 
      icon: ShieldOff, 
      color: "text-destructive", 
      bg: "bg-destructive",
      recommendation: "Ajustar posicionamento de preço ou destacar diferenciais exclusivos em relação à concorrência.",
      subItems: [
        { name: "Guerra de preços - Setor Tech", impact: "R$ " + (competitorLost * 0.75).toLocaleString("pt-BR") },
        { name: "Match de preço automático", impact: "R$ " + (competitorLost * 0.25).toLocaleString("pt-BR") }
      ]
    },
    { 
      label: "Erosão de Margem", 
      value: marginErosion, 
      icon: AlertCircle, 
      color: "text-info", 
      bg: "bg-info",
      recommendation: "Implementar gatilhos de reajuste por inflação ou custos variáveis nos contratos.",
      subItems: [
        { name: "Aumento de custo logístico", impact: "R$ " + (marginErosion * 0.5).toLocaleString("pt-BR") },
        { name: "Ineficiência tributária", impact: "R$ " + (marginErosion * 0.5).toLocaleString("pt-BR") }
      ]
    },
  ];

  const handleApplyRecovery = () => {
    toast.success("Plano de Recuperação Iniciado", {
      description: "A IA está revisando as sugestões de preços e ajustando as alçadas de desconto.",
      duration: 5000,
    });
  };

  return (
    <Card className="glass border-destructive/20 overflow-hidden relative group transition-all duration-500 hover:shadow-[0_0_40px_rgba(239,68,68,0.1)]">
      {/* Background Neural Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(239,68,68,0.05),transparent)] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 via-transparent to-transparent opacity-50" />
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-0 relative z-10">
        {/* Lado Esquerdo: Resumo Crítico */}
        <div className="md:col-span-4 p-8 bg-destructive/5 border-r border-border/40 flex flex-col justify-center relative overflow-hidden group-hover:bg-destructive/[0.08] transition-colors">
          <div className="absolute -left-10 -top-10 w-32 h-32 bg-destructive/20 blur-3xl rounded-full animate-pulse" />
          
          <div className="flex items-center gap-2 mb-2">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-destructive/80">
              Vazamento Total
            </p>
            <Badge variant="outline" className="text-[8px] py-0 px-1 border-destructive/30 text-destructive bg-destructive/5 animate-bounce">CRÍTICO</Badge>
          </div>
          
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold text-destructive/60">R$</span>
            <CountUp 
              value={totalLost} 
              className="text-5xl font-black font-display tracking-tighter text-destructive drop-shadow-[0_0_15px_rgba(239,68,68,0.3)]" 
            />
          </div>
          
          <p className="text-xs text-muted-foreground mt-4 leading-relaxed italic font-medium">
            Receita perdida no período por ineficiências detectadas no pricing. A IA projeta recuperação de <span className="text-success font-bold">R$ {(totalLost * 0.42).toLocaleString("pt-BR")}</span> se as recomendações forem aplicadas.
          </p>
          
          <div className="flex flex-col gap-3 mt-8">
            <Button 
              size="sm" 
              className="bg-destructive text-white hover:bg-destructive/90 shadow-lg shadow-destructive/20 rounded-full px-6 h-11 font-bold text-xs tracking-wider gap-2 w-full transition-transform hover:scale-[1.02] active:scale-95"
              onClick={handleApplyRecovery}
            >
              <Sparkles className="h-4 w-4" />
              INICIAR RECUPERAÇÃO
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-full h-11 border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold gap-2"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <PieChart className="h-4 w-4" />
              {isExpanded ? "RECOLHER ANÁLISE" : "VER ANÁLISE DETALHADA"}
            </Button>
          </div>
        </div>

        {/* Lado Direito: Breakdown & Insights */}
        <div className="md:col-span-8 p-8 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" />
              Composição do Vazamento
            </h3>
            <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
              <span>Frequência: Semanal</span>
              <div className="h-1 w-1 rounded-full bg-muted-foreground" />
              <span className="text-success">Confiança: 98%</span>
            </div>
          </div>

          <TooltipProvider>
            <div className="space-y-6">
              {items.map((item, i) => {
                const pct = (item.value / total) * 100;
                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="relative"
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="cursor-help group/item">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className={cn("p-2 rounded-lg bg-white/5 border border-white/10 group-hover/item:border-white/20 transition-all", item.color)}>
                                <item.icon className="h-4 w-4" />
                              </div>
                              <div>
                                <span className="text-xs font-black uppercase tracking-tight block">{item.label}</span>
                                <span className="text-[10px] text-muted-foreground font-bold">Fator de Risco: {pct > 50 ? "Muito Alto" : "Moderado"}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-mono font-black tracking-tight">{fmtBRL(item.value)}</div>
                              <div className={cn("text-[10px] font-bold flex items-center gap-1 justify-end", pct > 40 ? "text-destructive" : "text-warning")}>
                                {pct > 40 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                {pct.toFixed(1)}% do Total
                              </div>
                            </div>
                          </div>
                          <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden relative">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 1.5, ease: "circOut", delay: i * 0.2 }}
                              className={cn("h-full rounded-full relative z-10", item.bg)}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/30 animate-pulse" />
                            </motion.div>
                          </div>
                          
                          {/* Sub- breakdown expandido */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="mt-4 pl-12 space-y-2"
                              >
                                {item.subItems.map((sub, idx) => (
                                  <div key={idx} className="flex items-center justify-between text-[10px] border-l border-white/10 pl-4 py-1">
                                    <span className="text-muted-foreground font-medium">{sub.name}</span>
                                    <span className="font-mono font-bold">{sub.impact}</span>
                                  </div>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[280px] p-4 bg-slate-900/95 backdrop-blur-xl border-white/10 text-xs shadow-2xl">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="h-3.5 w-3.5 text-primary" />
                          <p className="font-black uppercase tracking-widest text-[10px]">Sugestão de Recuperação</p>
                        </div>
                        <p className="text-muted-foreground mb-3 leading-relaxed">{item.recommendation}</p>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                          <span className="text-[10px] text-muted-foreground">Potencial de Ganho:</span>
                          <span className="text-[10px] text-success font-black">+{fmtBRL(item.value * 0.4)}</span>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </motion.div>
                );
              })}
            </div>
          </TooltipProvider>

          {/* Neural Insight Footer */}
          <div className="mt-8 pt-6 border-t border-white/5 flex items-start gap-4 bg-primary/5 rounded-2xl p-4 border border-primary/10">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Zap className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">IA Strategic Insight</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                A pressão competitiva no setor Tech está gerando um "efeito cascata" nos seus descontos. Recomendo desvincular a aprovação de descontos acima de 15% do time de vendas e centralizar no Price Committee para recuperar <span className="text-foreground font-bold">R$ 42.500</span> em margem bruta até o final do trimestre.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
});