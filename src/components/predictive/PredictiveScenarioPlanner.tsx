import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  Calculator, 
  TrendingUp, 
  Users, 
  Calendar,
  Sparkles,
  Info
} from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const PredictiveScenarioPlanner = () => {
  const [hiring, setHiring] = useState([2]);
  const [conversionBoost, setConversionBoost] = useState([5]);
  const [churnReduction, setChurnReduction] = useState([2]);
  
  const baseRevenue = 2500000;
  const repProductivity = 150000;
  const hiringImpact = hiring[0] * repProductivity;
  const conversionImpact = baseRevenue * (conversionBoost[0] / 100);
  const churnImpact = baseRevenue * (churnReduction[0] / 100);
  
  const projectedRevenue = baseRevenue + hiringImpact + conversionImpact + churnImpact;


  return (
    <Card className="glass border-primary/20 shadow-2xl overflow-hidden">
      <div className="absolute top-0 right-0 p-4">
        <Sparkles className="size-12 text-primary/10 rotate-12" />
      </div>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calculator className="size-5 text-primary" />
          <CardTitle className="text-xl">Simulador de Cenários AI</CardTitle>
        </div>
        <CardDescription>
          Preveja o impacto de mudanças táticas no seu faturamento trimestral
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold flex items-center gap-2">
                  Novos Vendedores (Contratação)
                  <Info className="size-3 text-muted-foreground" />
                </label>
                <Badge variant="secondary" className="text-lg">+{hiring[0]}</Badge>
              </div>
              <Slider 
                value={hiring} 
                onValueChange={setHiring} 
                max={10} 
                step={1}
                className="py-2"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold flex items-center gap-2">
                  Melhoria na Conversão (AI Playbooks)
                  <Info className="size-3 text-muted-foreground" />
                </label>
                <Badge variant="secondary" className="text-lg">+{conversionBoost[0]}%</Badge>
              </div>
              <Slider 
                value={conversionBoost} 
                onValueChange={setConversionBoost} 
                max={20} 
                step={1}
                className="py-2"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold flex items-center gap-2">
                  Redução de Churn (CS Intelligence)
                  <Info className="size-3 text-muted-foreground" />
                </label>
                <Badge variant="secondary" className="text-lg">-{churnReduction[0]}%</Badge>
              </div>
              <Slider 
                value={churnReduction} 
                onValueChange={setChurnReduction} 
                max={10} 
                step={0.5}
                className="py-2"
              />
            </div>
          </div>

          <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10 flex flex-col justify-center items-center text-center space-y-4">
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Receita Trimestral Projetada</p>
            <div className="text-5xl font-black text-primary tracking-tighter">
              R$ {(projectedRevenue / 1000000).toFixed(2)}M
            </div>
            <div className="flex items-center gap-2 text-success font-bold">
              <TrendingUp className="size-4" />
              +R$ {((hiringImpact + conversionImpact + churnImpact) / 1000).toFixed(0)}k de incremento
            </div>
            <div className="grid grid-cols-2 gap-3 w-full mt-4">
              <div className="bg-background/50 p-3 rounded-xl border border-border/50">
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Novo Win-Rate</p>
                <p className="text-lg font-bold">{(32 + conversionBoost[0] * 0.5).toFixed(1)}%</p>
              </div>
              <div className="bg-background/50 p-3 rounded-xl border border-border/50">
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Capacidade</p>
                <p className="text-lg font-bold">{12 + hiring[0]} Reps</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl text-xs text-muted-foreground italic">
          <Calendar className="size-4 text-primary" />
          Previsão baseada em elasticidade histórica e tempo médio de ramp-up (3.2 meses).
        </div>
      </CardContent>
    </Card>
  );
};
