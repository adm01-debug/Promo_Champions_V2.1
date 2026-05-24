import { CalendarDays, TrendingUp, Brain } from "lucide-react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface IntensityPoint {
  month: number;
  intensity: number;
  quotes_count?: number;
}

interface ClientSeasonalityHeatmapProps {
  data: {
    months: string[];
    clientIntensity: IntensityPoint[];
    industryIntensity: IntensityPoint[];
    nextPeak: { month: string; insight: string };
  };
}

export function ClientSeasonalityHeatmap({ data }: ClientSeasonalityHeatmapProps) {
  const currentMonth = new Date().getMonth() + 1;

  const getIntensityColor = (intensity: number) => {
    if (intensity >= 85) return 'bg-violet-600';
    if (intensity >= 70) return 'bg-violet-500';
    if (intensity >= 55) return 'bg-violet-400';
    if (intensity >= 40) return 'bg-violet-300';
    if (intensity >= 25) return 'bg-violet-200';
    if (intensity >= 10) return 'bg-violet-100';
    if (intensity > 0) return 'bg-violet-50';
    return 'bg-white/5';
  };

  return (
    <Card className="p-8 border-border/40 bg-card/30 backdrop-blur-xl relative overflow-hidden group rounded-3xl">
      <div className="absolute bottom-0 right-0 w-[600px] h-[300px] bg-primary/5 rounded-full blur-[100px] -mr-64 -mb-32" />
      <h3 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-2 mb-10">
        <CalendarDays className="size-6 text-primary" /> Sazonalidade <span className="text-primary">Estratégica</span>
      </h3>

      <div className="grid grid-cols-1 gap-12 relative z-10">
        <div className="space-y-4">
          <div className="grid gap-2 items-center" style={{ gridTemplateColumns: '80px repeat(12, minmax(0, 1fr))' }}>
            <div className="text-[9px] font-black text-muted-foreground uppercase">Cliente</div>
            {data.months.map((month, i) => {
              const monthIndex = i + 1;
              const point = data.clientIntensity.find(p => Number(p.month) === monthIndex);
              const intensity = point?.intensity || 0;
              return (
                <TooltipProvider key={month}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div className={cn("h-14 rounded-lg cursor-help border border-white/5 hover:border-white/20 transition-all shadow-sm", getIntensityColor(intensity), monthIndex === currentMonth && "ring-2 ring-violet-600 ring-offset-2 ring-offset-background")} />
                    </TooltipTrigger>
                    <TooltipContent className="bg-popover/95 backdrop-blur-md border-primary/20">
                      <p className="font-black uppercase text-[10px] text-primary">{month}</p>
                      <p className="text-xs font-bold">Intensidade: {intensity.toFixed(1)}%</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>

          <div className="grid gap-2 items-center" style={{ gridTemplateColumns: '80px repeat(12, minmax(0, 1fr))' }}>
            <div className="text-[9px] font-black text-muted-foreground uppercase">Setor</div>
            {data.months.map((month, i) => {
              const monthIndex = i + 1;
              const point = data.industryIntensity.find(p => Number(p.month) === monthIndex);
              const intensity = point?.intensity || 0;
              return (
                <TooltipProvider key={month}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div className={cn("h-14 rounded-lg opacity-60 cursor-help border border-white/5 hover:border-white/20 transition-all", getIntensityColor(intensity))} />
                    </TooltipTrigger>
                    <TooltipContent className="bg-popover/95 backdrop-blur-md border-primary/20">
                      <p className="font-black uppercase text-[10px] text-primary">{month}</p>
                      <p className="text-xs font-bold">Setor: {intensity.toFixed(1)}%</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>

          <div className="grid gap-2" style={{ gridTemplateColumns: '80px repeat(12, minmax(0, 1fr))' }}>
            <div />
            {data.months.map((month) => (
              <p key={month} className="text-[9px] font-black text-center text-muted-foreground uppercase tracking-widest">{month}</p>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-violet-50/5 rounded-3xl border border-violet-500/20 flex items-center gap-4 group/peak">
            <div className="size-12 bg-violet-500/20 rounded-2xl flex items-center justify-center text-violet-400 group-hover/peak:scale-110 transition-transform">
              <TrendingUp className="size-6" />
            </div>
            <div>
              <p className="text-[10px] text-violet-300 font-black uppercase tracking-widest mb-1">Próximo Pico Estimado</p>
              <p className="text-lg font-black text-violet-400 uppercase italic">{data.nextPeak.month}</p>
            </div>
          </div>

          <div className="p-6 bg-violet-50/5 rounded-3xl border border-violet-500/20 flex items-start gap-4">
            <div className="p-3 bg-violet-500/20 rounded-2xl text-violet-400">
              <Brain className="size-6" />
            </div>
            <div>
              <h4 className="text-sm font-black uppercase tracking-widest text-violet-400 mb-1">Insight Estratégico</h4>
              <p className="text-xs text-card-foreground font-medium leading-relaxed">
                {data.nextPeak.insight} Recomendamos preparar promoções direcionadas e estoque extra com 30 dias de antecedência.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
