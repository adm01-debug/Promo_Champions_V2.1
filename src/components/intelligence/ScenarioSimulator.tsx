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
  LayoutDashboard,
  ShieldAlert,
  BarChart3,
  Lightbulb
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
    { id: 'expansion', label: 'Aggressive Expansion', icon: Target, impact: '+22%', color: 'text-emerald-500', desc: 'Foco em volume de topo de funil.' },
    { id: 'efficiency', label: 'Sales Efficiency', icon: LayoutDashboard, impact: '+15%', color: 'text-blue-500', desc: 'Otimização de conversão e processos.' },
    { id: 'retention', label: 'Retention Focus', icon: Users, impact: '+18%', color: 'text-purple-500', desc: 'Blindagem de base e cross-sell.' },
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
        setPipeline([Math.min(200, Math.round(pipeline[0] * 1.3))]);
        setConversion([Math.round(conversion[0] * 0.9)]); // volume reduces quality slightly
        setDealSize([Math.min(100, Math.round(dealSize[0] * 1.1))]);
      } else if (strategyId === 'efficiency') {
        setConversion([Math.min(100, Math.round(conversion[0] * 1.25))]);
        setPipeline([Math.round(pipeline[0] * 0.95)]);
      } else if (strategyId === 'retention') {
        setDealSize([Math.min(100, Math.round(dealSize[0] * 1.4))]);
        setConversion([Math.min(100, Math.round(conversion[0] * 1.1))]);
      }
    }, 1200);
  };

  return (
    <Card className="border-primary/20 bg-black/40 backdrop-blur-xl overflow-hidden group shadow-2xl relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="absolute -right-24 -top-24 w-48 h-48 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
      
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-xl font-black italic tracking-tighter uppercase flex items-center gap-2">
              <Dices className="size-5 text-primary animate-bounce-subtle" />
              Strategic <span className="text-primary">Scenario Simulator</span>
            </CardTitle>
            <CardDescription className="text-[10px] uppercase tracking-widest font-bold opacity-60">
              Previsão Dinâmica de Receita e Impacto Estratégico
            </CardDescription>
          </div>
          <Badge className="bg-primary/20 text-primary border-primary/30 text-[9px] font-black uppercase tracking-tighter">
            AI Engine v4.2
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-4">
        <div className="space-y-5">
          {/* Pipeline Volume */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <BarChart3 className="size-3 text-primary/60" />
                Pipeline Volume <span className="text-primary font-bold">• {pipeline[0]} Active Deals</span>
              </label>
              <span className="text-[10px] font-mono font-bold opacity-40">MAX: 200</span>
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
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <Target className="size-3 text-blue-500/60" />
                Avg. Conversion <span className="text-blue-500 font-bold">• {conversion[0]}% Probability</span>
              </label>
              <span className="text-[10px] font-mono font-bold opacity-40">MAX: 100%</span>
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
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <Users className="size-3 text-emerald-500/60" />
                Avg. Deal Size <span className="text-emerald-500 font-bold">• R$ {dealSize[0]}k Ticket</span>
              </label>
              <span className="text-[10px] font-mono font-bold opacity-40">MAX: R$ 100k</span>
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

        <div className="relative p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 mt-8 group/result overflow-hidden shadow-inner">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/result:scale-125 transition-transform duration-700">
            <TrendingUp className="size-20" />
          </div>
          
          <AnimatePresence mode="wait">
            {isSimulating ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-6"
              >
                <Sparkles className="size-10 text-primary animate-pulse mb-3" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] animate-pulse text-primary">Simulating Outcome Matrix...</p>
              </motion.div>
            ) : (
              <motion.div 
                key="result"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-1"
              >
                <p className="text-[10px] font-black text-primary/70 uppercase tracking-widest">Projected Gross Revenue (Q2)</p>
                <div className="text-5xl font-black tracking-tighter text-foreground drop-shadow-sm italic">
                  {calculateRevenue()}
                </div>
                <div className="flex gap-3 mt-4">
                  <Badge variant="outline" className="text-[9px] font-black border-emerald-500/40 text-emerald-500 bg-emerald-500/10 px-2">
                    CONFIDENCE: 84%
                  </Badge>
                  <Badge variant="outline" className="text-[9px] font-black border-blue-500/40 text-blue-500 bg-blue-500/10 px-2">
                    STABILITY: HIGH
                  </Badge>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-4 pt-4 border-t border-white/5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
              <Brain className="size-4 animate-pulse" />
              One-Click Intelligence Strategies
            </p>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 text-[8px] font-black uppercase tracking-widest gap-1.5 text-muted-foreground hover:text-primary transition-colors"
              onClick={() => {
                setPipeline([70]);
                setConversion([25]);
                setDealSize([15]);
                setActiveStrategy(null);
              }}
            >
              <RotateCcw className="size-3" /> Reset
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {strategies.map((strat) => (
              <motion.div 
                key={strat.id}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  variant="outline"
                  size="sm" 
                  className={cn(
                    "w-full h-14 text-[10px] font-black uppercase tracking-widest justify-between border-white/5 bg-white/5 hover:bg-white/10 hover:border-primary/30 transition-all px-4 group/strat",
                    activeStrategy === strat.id && "border-primary/50 bg-primary/10 shadow-[0_0_15px_rgba(var(--primary),0.1)]"
                  )}
                  onClick={() => handleSimulate(strat.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg bg-black/40 group-hover/strat:scale-110 transition-transform", strat.color)}>
                      <strat.icon className="size-4" />
                    </div>
                    <div className="text-left">
                      <p className="font-black text-[11px] leading-tight">{strat.label}</p>
                      <p className="text-[8px] font-bold text-muted-foreground normal-case tracking-normal">{strat.desc}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="outline" className={cn("text-[9px] font-black border-none bg-black/40", strat.color)}>{strat.impact} IMPACT</Badge>
                    <ArrowRight className="size-3 text-muted-foreground group-hover/strat:translate-x-1 group-hover/strat:text-primary transition-all" />
                  </div>
                </Button>
              </motion.div>
            ))}
          </div>

          <Button 
            size="sm" 
            className="w-full h-12 text-[11px] font-black uppercase tracking-[0.2em] gap-3 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 relative overflow-hidden group/btn mt-2"
            onClick={() => handleSimulate()}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
            <Zap className="size-4 fill-current" /> 
            Run Advanced AI Simulation
          </Button>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex gap-4 shadow-inner"
        >
          <div className="p-2 rounded-lg bg-amber-500/20 h-fit">
            <ShieldAlert className="size-4 text-amber-500 shrink-0" />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-amber-500 font-black uppercase tracking-widest">Risk Assessment Alert</p>
            <p className="text-[11px] text-amber-500/80 font-bold leading-relaxed">
              Increasing conversion by 20%+ without scaling SDR capacity will lead to a <span className="underline decoration-amber-500/40 underline-offset-2">12.4% drop in SQL quality</span> and burnout risk.
            </p>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
};