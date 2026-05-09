import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  Calculator, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle,
  Percent,
  CheckCircle2,
  HelpCircle
} from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const DiscountOptimizer = () => {
  const [discount, setDiscount] = useState([10]);
  
  // Mock elasticity logic: lower discount = lower win rate but higher margin
  const winRateBase = 0.35;
  const winRateElasticity = 0.8; // change in winrate per % discount
  const currentWinRate = winRateBase + (discount[0] / 100) * winRateElasticity;
  
  const dealValue = 50000;
  const marginBase = 0.6;
  const currentMargin = marginBase - (discount[0] / 100);
  
  const expectedRevenue = dealValue * currentWinRate;
  const expectedProfit = dealValue * currentMargin * currentWinRate;

  return (
    <Card className="glass border-primary/20 bg-gradient-to-br from-card to-primary/5 shadow-xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Calculator className="size-5 text-primary" />
              Simulador de Elasticidade de Preço
            </CardTitle>
            <CardDescription>
              Ajuste o desconto para prever o impacto no Win-Rate e Lucratividade
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            AI Beta
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold flex items-center gap-2">
              Nível de Desconto Sugerido
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="size-3.5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-xs">A elasticidade é calculada com base no histórico de deals similares fechados nos últimos 12 meses.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </label>
            <span className="text-2xl font-black text-primary">{discount[0]}%</span>
          </div>
          <Slider 
            value={discount} 
            onValueChange={setDiscount} 
            max={40} 
            step={1}
            className="py-4"
          />
          <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            <span>Margem Máxima</span>
            <span>Equilíbrio</span>
            <span>Volume Máximo</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MetricBlock 
            label="Win-Rate Previsto" 
            value={`${(currentWinRate * 100).toFixed(1)}%`} 
            icon={Percent}
            subValue={discount[0] > 15 ? "Probabilidade Alta" : "Resistência Média"}
            status={discount[0] > 20 ? "warning" : "success"}
          />
          <MetricBlock 
            label="Margem de Contribuição" 
            value={`${(currentMargin * 100).toFixed(1)}%`} 
            icon={TrendingUp}
            subValue={`R$ ${(dealValue * currentMargin).toLocaleString()} por deal`}
            status={currentMargin < 0.4 ? "critical" : "success"}
          />
        </div>

        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="size-4 text-primary" />
              Recomendação Estratégica
            </h4>
          </div>
          <p className="text-sm text-card-foreground/80 leading-relaxed italic">
            "Para este deal, um desconto de <span className="font-bold text-primary">12%</span> maximiza o lucro esperado (R$ {(expectedProfit).toLocaleString()}). Acima de 18%, a erosão de margem supera o ganho de volume."
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

const MetricBlock = ({ label, value, icon: Icon, subValue, status }: any) => {
  const statusColors = {
    success: "text-success",
    warning: "text-warning",
    critical: "text-destructive",
  }[status as "success" | "warning" | "critical"];

  return (
    <div className="p-4 rounded-xl border bg-card/40 space-y-1">
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        <Icon className="size-3.5" />
        <span className="text-[10px] font-bold uppercase tracking-tight">{label}</span>
      </div>
      <div className={`text-2xl font-black ${statusColors}`}>{value}</div>
      <div className="text-[10px] font-medium text-muted-foreground">{subValue}</div>
    </div>
  );
};
