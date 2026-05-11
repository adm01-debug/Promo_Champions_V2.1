import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Info, Calculator, TrendingUp, Sparkles, TrendingDown } from "lucide-react";
import { formatCompactBRL } from "./forecastHelpers";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  baseForecast: number;
  baseCoverage: number;
  baseWinRate: number;
}

export const ForecastScenarioSimulator = ({ baseForecast, baseCoverage, baseWinRate }: Props) => {
  const [coverageMult, setCoverageMult] = useState(1);
  const [winRateMult, setWinRateMult] = useState(1);

  const simulatedForecast = useMemo(() => {
    return baseForecast * coverageMult * winRateMult;
  }, [baseForecast, coverageMult, winRateMult]);

  const delta = simulatedForecast - baseForecast;
  const isPositive = delta >= 0;

  return (
    <Card className="glass overflow-hidden border-primary/20">
      <CardHeader className="bg-primary/5 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Simulador de Cenários "What-If"</CardTitle>
          </div>
          <Badge variant="glow" className="gap-1 px-3 py-1 animate-pulse">
            <Sparkles className="h-3 w-3" />
            IA Predictive Mode
          </Badge>
        </div>
        <CardDescription>
          Simule o impacto de mudanças na cobertura do pipeline e na eficiência de conversão.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Sliders */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Cobertura do Pipeline
                </Label>
                <span className="text-sm font-mono font-bold text-primary">
                  {(coverageMult * 100).toFixed(0)}%
                </span>
              </div>
              <Slider
                value={[coverageMult * 100]}
                min={50}
                max={200}
                step={5}
                onValueChange={([v]) => setCoverageMult(v / 100)}
                className="py-4"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground italic">
                <span>Pessimista (-50%)</span>
                <span>Atual</span>
                <span>Agressivo (+100%)</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Eficiência (Win Rate)
                </Label>
                <span className="text-sm font-mono font-bold text-success">
                  {(winRateMult * 100).toFixed(0)}%
                </span>
              </div>
              <Slider
                value={[winRateMult * 100]}
                min={80}
                max={150}
                step={2}
                onValueChange={([v]) => setWinRateMult(v / 100)}
                className="py-4"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground italic">
                <span>Retração (-20%)</span>
                <span>Atual</span>
                <span>Otimização (+50%)</span>
              </div>
            </div>
          </div>

          {/* Result */}
          <div className="relative flex flex-col items-center justify-center p-6 rounded-2xl bg-background/40 border border-border/50 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2">
              Projeção Simulada
            </p>
            
            <motion.div 
              key={simulatedForecast}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-4xl font-black font-display tracking-tighter text-foreground"
            >
              {formatCompactBRL(simulatedForecast)}
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={isPositive ? "pos" : "neg"}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`mt-4 flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${
                  isPositive 
                    ? "bg-success/10 text-success border border-success/20" 
                    : "bg-destructive/10 text-destructive border border-destructive/20"
                }`}
              >
                {isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                {isPositive ? "+" : ""}{formatCompactBRL(delta)} vs Atual
              </motion.div>
            </AnimatePresence>

            <div className="mt-6 w-full pt-6 border-t border-border/40 space-y-2">
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <Info className="h-3 w-3" />
                <span>Baseado em performance histórica dos últimos 12 meses.</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
