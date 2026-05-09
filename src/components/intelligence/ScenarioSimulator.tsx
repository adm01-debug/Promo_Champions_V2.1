import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dices, 
  ArrowRight, 
  TrendingUp, 
  AlertTriangle, 
  Zap,
  RotateCcw,
  Sparkles,
  Target,
  Users,
  Brain,
  LayoutDashboard
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export const ScenarioSimulator = () => {
  const [pipeline, setPipeline] = useState([70]);
  const [conversion, setConversion] = useState([25]);
  const [dealSize, setDealSize] = useState([15]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeStrategy, setActiveStrategy] = useState<string | null>(null);

  const strategies = [
    { id: 'expansion', label: 'Aggressive Expansion', icon: Target, impact: '+22%', color: 'text-emerald-500' },
    { id: 'efficiency', label: 'Sales Efficiency', icon: LayoutDashboard, impact: '+15%', color: 'text-blue-500' },
    { id: 'retention', label: 'Retention Focus', icon: Users, impact: '+18%', color: 'text-purple-500' },
  ];

  const calculateRevenue = () => {
    return (pipeline[0] * conversion[0] * dealSize[0] * 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const handleSimulate = (strategyId?: string) => {
    setIsSimulating(true);
    if (strategyId) setActiveStrategy(strategyId);
    setTimeout(() => {
      setIsSimulating(false);
      if (strategyId === 'expansion') {
        setPipeline([pipeline[0] * 1.2]);
        setConversion([conversion[0] * 0.95]); // volume reduces quality slightly
        setDealSize([dealSize[0] * 1.1]);
      } else if (strategyId === 'efficiency') {
        setConversion([conversion[0] * 1.15]);
      }
    }, 1500);
  };

  return (
    <Card className="border-primary/20 bg-black/40 backdrop-blur-xl overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl font-black italic tracking-tighter uppercase flex items-center gap-2">
              <Dices className="size-5 text-primary" />
              Strategic <span className="text-primary">Scenario Simulator</span>
            </CardTitle>
            <CardDescription className="text-[10px] uppercase tracking-widest font-bold opacity-60">
              Previsão Dinâmica de Receita e Impacto
            </CardDescription>
          </div>
          <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] font-bold">AI POWERED</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-4">
        <div className="space-y-6">
          {/* Pipeline Volume */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                Pipeline Volume <span className="text-primary opacity-50">• {pipeline[0]} Deals</span>
              </label>
            </div>
            <Slider 
              value={pipeline} 
              onValueChange={setPipeline} 
              max={200} 
              step={1} 
              className="py-2"
            />
          </div>

          {/* Conversion Rate */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                Avg. Conversion <span className="text-blue-500 opacity-50">• {conversion[0]}%</span>
              </label>
            </div>
            <Slider 
              value={conversion} 
              onValueChange={setConversion} 
              max={100} 
              step={1} 
              className="py-2"
            />
          </div>

          {/* Avg. Deal Size */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                Avg. Deal Size <span className="text-emerald-500 opacity-50">• R$ {dealSize[0]}k</span>
              </label>
            </div>
            <Slider 
              value={dealSize} 
              onValueChange={setDealSize} 
              max={100} 
              step={5} 
              className="py-2"
            />
          </div>
        </div>

        <div className="relative p-6 rounded-2xl bg-primary/5 border border-primary/10 mt-8 group/result overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/result:scale-110 transition-transform">
            <TrendingUp className="size-16" />
          </div>
          
          <AnimatePresence mode="wait">
            {isSimulating ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-4"
              >
                <Sparkles className="size-8 text-primary animate-pulse mb-2" />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] animate-pulse">Recalculating Outcomes...</p>
              </motion.div>
            ) : (
              <motion.div 
                key="result"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <p className="text-[10px] font-black text-primary uppercase tracking-widest">Projected Revenue (Q2)</p>
                <div className="text-4xl font-black tracking-tighter text-foreground">
                  {calculateRevenue()}
                </div>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline" className="text-[9px] border-emerald-500/30 text-emerald-500 bg-emerald-500/5">
                    Confidence: 84%
                  </Badge>
                  <Badge variant="outline" className="text-[9px] border-blue-500/30 text-blue-500 bg-blue-500/5">
                    Scenario: Moderate
                  </Badge>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-1 gap-4 pt-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 text-[9px] font-bold uppercase tracking-widest gap-2 text-muted-foreground hover:text-foreground"
            onClick={() => {
              setPipeline([70]);
              setConversion([25]);
              setDealSize([15]);
              setActiveStrategy(null);
            }}
          >
            <RotateCcw className="size-3" /> Reset Scenarios
          </Button>
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
              <Brain className="size-3" /> Select Strategy Play
            </p>
            <div className="grid grid-cols-1 gap-2">
              {strategies.map((strat) => (
                <Button 
                  key={strat.id}
                  variant="outline"
                  size="sm" 
                  className={cn(
                    "h-10 text-[10px] font-bold uppercase tracking-widest justify-between border-white/5 bg-white/5 hover:bg-white/10 transition-all",
                    activeStrategy === strat.id && "border-primary/50 bg-primary/10"
                  )}
                  onClick={() => handleSimulate(strat.id)}
                >
                  <div className="flex items-center gap-2">
                    <strat.icon className={cn("size-3", strat.color)} />
                    {strat.label}
                  </div>
                  <Badge variant="outline" className="text-[9px] border-none bg-black/40 text-muted-foreground">{strat.impact} Impact</Badge>
                </Button>
              ))}
            </div>
            <Button 
              size="sm" 
              className="h-10 text-[10px] font-bold uppercase tracking-widest gap-2 bg-primary hover:bg-primary/90 mt-2"
              onClick={() => handleSimulate()}
            >
              <Zap className="size-3" /> Custom Simulation
            </Button>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10 flex gap-3">
          <AlertTriangle className="size-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[10px] text-amber-500/80 font-medium leading-relaxed">
            <span className="font-bold">Risk Alert:</span> Increasing conversion without scaling SDR capacity will lead to a 12% drop in SQL quality.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};