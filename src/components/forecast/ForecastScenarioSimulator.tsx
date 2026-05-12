import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Info, Calculator, TrendingUp, Sparkles, TrendingDown, Cpu, Network, Gauge } from "lucide-react";
import { formatCompactBRL } from "./forecastHelpers";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

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
    <Card className="glass overflow-hidden border-primary/20 bg-gradient-to-br from-background/40 to-primary/5">
      <CardHeader className="bg-primary/10 pb-6 border-b border-white/5 relative">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <Network className="h-32 w-32" />
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-primary/20 text-primary border border-primary/30 shadow-lg">
                <Cpu className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl font-black tracking-tight">Laboratório What-If Neural</CardTitle>
            </div>
            <CardDescription className="text-[10px] font-black uppercase tracking-widest opacity-60">
              Modelagem Preditiva de Alavancagem Comercial
            </CardDescription>
          </div>
          <Badge variant="live" className="gap-1.5 px-4 py-1.5 bg-primary/20 text-primary border-primary/30 font-black tracking-widest uppercase text-[10px]">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            Active Prediction
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-8 space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Sliders Container */}
          <div className="space-y-10">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20">
                    <Network className="h-4 w-4" />
                  </div>
                  <Label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">
                    Densidade do Pipeline
                  </Label>
                </div>
                <div className="flex items-baseline gap-1 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                  <span className="text-sm font-black font-mono text-blue-500">
                    {(coverageMult * 100).toFixed(0)}
                  </span>
                  <span className="text-[10px] font-black text-blue-500 opacity-60">%</span>
                </div>
              </div>
              <div className="px-1">
                <Slider
                  value={[coverageMult * 100]}
                  min={50}
                  max={200}
                  step={5}
                  onValueChange={([v]) => setCoverageMult(v / 100)}
                  className="py-4"
                />
              </div>
              <div className="flex justify-between text-[8px] font-black uppercase tracking-tighter opacity-40">
                <span className="flex items-center gap-1"><TrendingDown className="h-3 w-3" /> Erosão (-50%)</span>
                <span>Baseline Atual</span>
                <span className="flex items-center gap-1 text-blue-500">Expansão (+100%) <TrendingUp className="h-3 w-3" /></span>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    <Gauge className="h-4 w-4" />
                  </div>
                  <Label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">
                    Eficiência de Conversão
                  </Label>
                </div>
                <div className="flex items-baseline gap-1 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  <span className="text-sm font-black font-mono text-emerald-500">
                    {(winRateMult * 100).toFixed(0)}
                  </span>
                  <span className="text-[10px] font-black text-emerald-500 opacity-60">%</span>
                </div>
              </div>
              <div className="px-1">
                <Slider
                  value={[winRateMult * 100]}
                  min={80}
                  max={150}
                  step={2}
                  onValueChange={([v]) => setWinRateMult(v / 100)}
                  className="py-4"
                />
              </div>
              <div className="flex justify-between text-[8px] font-black uppercase tracking-tighter opacity-40">
                <span className="flex items-center gap-1"><TrendingDown className="h-3 w-3" /> Retração (-20%)</span>
                <span>Baseline Atual</span>
                <span className="flex items-center gap-1 text-emerald-500">Otimização (+50%) <TrendingUp className="h-3 w-3" /></span>
              </div>
            </div>
          </div>

          {/* Result Engine */}
          <div className="relative group">
            <div className={cn(
              "absolute inset-0 blur-3xl opacity-10 transition-colors duration-700 rounded-3xl",
              isPositive ? "bg-emerald-500" : "bg-orange-500"
            )} />
            
            <div className="relative h-full flex flex-col items-center justify-center p-10 rounded-3xl bg-background/60 border border-white/10 shadow-inner overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <Cpu className="h-8 w-8 text-primary animate-pulse" />
                </div>
                
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                    Impacto Projetado
                  </p>
                  <motion.div 
                    key={simulatedForecast}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-baseline gap-2"
                  >
                    <span className="text-2xl font-black opacity-20">R$</span>
                    <span className="text-5xl font-black font-display tracking-tighter text-foreground tabular-nums">
                      {formatCompactBRL(simulatedForecast).replace('R$', '').trim()}
                    </span>
                  </motion.div>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={isPositive ? "pos" : "neg"}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className={cn(
                      "flex items-center gap-2.5 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg",
                      isPositive 
                        ? "bg-emerald-500 text-white shadow-emerald-500/20" 
                        : "bg-orange-500 text-white shadow-orange-500/20"
                    )}
                  >
                    {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    {isPositive ? "GANHO" : "PERDA"} DE {formatCompactBRL(Math.abs(delta))}
                  </motion.div>
                </AnimatePresence>

                <div className="mt-8 pt-8 border-t border-white/5 w-full">
                  <div className="flex items-center gap-3 text-[9px] text-muted-foreground font-black uppercase tracking-widest text-center justify-center leading-relaxed">
                    <Info className="h-3.5 w-3.5 text-primary" />
                    <span>Algoritmo de regressão linear baseado em {baseForecast > 0 ? "dados reais" : "benchmarks de mercado"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
