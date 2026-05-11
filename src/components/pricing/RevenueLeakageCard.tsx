import { memo } from "react";
import { Card } from "@/components/ui/card";
import { TrendingDown, AlertCircle, ShieldOff, Sparkles, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

interface Props {
  totalLost: number;
  discountLost: number;
  competitorLost: number;
  marginErosion: number;
}

const fmtBRL = (n: number) => 
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(n);

export const RevenueLeakageCard = memo(function RevenueLeakageCard({ totalLost, discountLost, competitorLost, marginErosion }: Props) {
  const total = discountLost + competitorLost + marginErosion || 1;

  const items = [
    { 
      label: "Descontos Excessivos", 
      value: discountLost, 
      icon: TrendingDown, 
      color: "text-warning", 
      bg: "bg-warning",
      recommendation: "Revisar alçadas de aprovação e treinar equipe em negociação baseada em valor."
    },
    { 
      label: "Pressão Competitiva", 
      value: competitorLost, 
      icon: ShieldOff, 
      color: "text-destructive", 
      bg: "bg-destructive",
      recommendation: "Ajustar posicionamento de preço ou destacar diferenciais exclusivos em relação à concorrência."
    },
    { 
      label: "Erosão de Margem", 
      value: marginErosion, 
      icon: AlertCircle, 
      color: "text-info", 
      bg: "bg-info",
      recommendation: "Implementar gatilhos de reajuste por inflação ou custos variáveis nos contratos."
    },
  ];

  const handleApplyRecovery = () => {
    toast.success("Plano de Recuperação Iniciado", {
      description: "A IA está revisando as sugestões de preços e ajustando as alçadas de desconto.",
      duration: 5000,
    });
  };

  return (
    <Card className="glass border-destructive/20 overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
        <div className="p-6 bg-destructive/5 border-r border-border/40 flex flex-col justify-center">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-destructive">
            Vazamento Total
          </p>
          <motion.p 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-4xl font-black font-display tracking-tighter text-destructive mt-2"
          >
            {fmtBRL(totalLost)}
          </motion.p>
          <p className="text-xs text-muted-foreground mt-2 italic">
            Receita perdida no período por ineficiência de pricing.
          </p>
          <Button 
            size="sm" 
            variant="ghost" 
            className="mt-4 h-8 text-[10px] font-bold text-destructive hover:text-destructive hover:bg-destructive/10 gap-1 p-0 justify-start"
            onClick={handleApplyRecovery}
          >
            <Sparkles className="h-3 w-3" />
            APLICAR RECUPERAÇÃO
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
        <div className="md:col-span-2 p-6 space-y-4">
          <TooltipProvider>
            {items.map((item, i) => {
              const pct = (item.value / total) * 100;
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-help">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <item.icon className={`h-3.5 w-3.5 ${item.color}`} />
                            <span className="text-xs font-bold">{item.label}</span>
                          </div>
                          <span className="text-sm font-mono font-black tracking-tight">{fmtBRL(item.value)}</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 1, delay: i * 0.15 }}
                            className={`h-full ${item.bg} rounded-full`}
                          />
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[240px] p-3 text-xs">
                      <p className="font-bold mb-1">{item.label}</p>
                      <p className="text-muted-foreground mb-2">{item.recommendation}</p>
                      <div className="text-[10px] text-primary bg-primary/10 px-2 py-1 rounded inline-block">
                        Impacto: {pct.toFixed(1)}% do total
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </motion.div>
              );
            })}
          </TooltipProvider>
        </div>
      </div>
    </Card>
  );
});
