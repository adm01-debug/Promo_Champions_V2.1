import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CalendarCheck, TrendingUp, TrendingDown, Sparkles, Users, ArrowRight, Zap, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useCountUp } from "@/hooks/useCountUp";

interface SchedulingRateGaugeProps {
  rate: number;
  change?: number;
  meetings: number;
  leads: number;
}

export function SchedulingRateGauge({ rate, change, meetings, leads }: SchedulingRateGaugeProps) {
  const isPositive = (change ?? 0) >= 0;
  
  const animatedRate = useCountUp(rate, { duration: 1400, decimals: 1 });
  const animatedMeetings = useCountUp(meetings, { duration: 1400 });
  const animatedLeads = useCountUp(leads, { duration: 1400 });
  
  const getRateColor = (rate: number) => {
    if (rate >= 20) return "text-primary";
    if (rate >= 10) return "text-success";
    return "text-destructive";
  };

  const getRateLabel = (rate: number) => {
    if (rate >= 25) return "SUPREME PERFORMANCE";
    if (rate >= 20) return "EXCEPTIONAL";
    if (rate >= 15) return "ELITE";
    if (rate >= 10) return "STABLE";
    if (rate >= 5) return "REGULAR";
    return "CRITICAL FAILURE";
  };

  const getRateBgColor = (rate: number) => {
    if (rate >= 20) return "bg-primary/15 border-primary/30";
    if (rate >= 10) return "bg-success/15 border-success/30";
    return "bg-destructive/15 border-destructive/30";
  };

  const getProgressColor = (rate: number) => {
    if (rate >= 20) return "[&>div]:bg-primary";
    if (rate >= 10) return "[&>div]:bg-success";
    return "[&>div]:bg-destructive";
  };

  // Calculate circular progress for gauge
  const gaugePercentage = Math.min(rate / 30 * 100, 100); 
  const circumference = 2 * Math.PI * 45; 
  const strokeDashoffset = circumference - (gaugePercentage / 100) * circumference;

  return (
    <Card className="relative overflow-hidden border-2 border-primary/20 bg-black/60 backdrop-blur-xl group">
      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-8 h-8 pointer-events-none">
        <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-primary/40" />
      </div>
      <div className="absolute bottom-0 right-0 w-8 h-8 pointer-events-none">
        <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-primary/40" />
      </div>
      
      {/* Scanning line */}
      <motion.div 
        className="absolute left-0 w-full h-[1px] bg-primary/20 z-0 pointer-events-none"
        animate={{ top: ["0%", "100%", "0%"] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Ambient Glow */}
      <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-primary/10 blur-[80px] rounded-full pointer-events-none" />

      <CardContent className="p-6 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/30 shadow-[0_0_20px_rgba(14,165,233,0.2)]">
                <CalendarCheck className="h-7 w-7 text-primary" />
              </div>
              {rate >= 20 && (
                <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary border-2 border-black flex items-center justify-center">
                  <Trophy className="h-3 w-3 text-black" />
                </div>
              )}
            </div>
            <div>
              <h2 className="text-xl font-mono font-black uppercase tracking-widest text-primary">Target Conversion</h2>
              <p className="text-[10px] font-mono font-bold text-muted-foreground tracking-[0.2em] uppercase">SDR Operational Telemetry</p>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-1">
             <Badge variant="outline" className="gap-2 px-3 py-1 text-[9px] font-mono font-black uppercase tracking-widest border-primary/30 bg-primary/10 text-primary">
              <Zap className="h-3 w-3" />
              CORE_METRIC
            </Badge>
            <span className="text-[8px] font-mono text-muted-foreground/40">SYS_ID: {Math.random().toString(16).slice(2, 8).toUpperCase()}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center justify-center md:col-span-1">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="6"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className={cn("transition-all duration-1000 ease-out", getRateColor(rate))}
                  style={{ filter: 'drop-shadow(0 0 8px currentColor)' }}
                />
              </svg>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={cn(
                  "text-4xl font-mono font-black tracking-tighter tabular-nums",
                  getRateColor(rate)
                )}>
                  {animatedRate.toFixed(1)}%
                </span>
                {change !== undefined && (
                  <span className={cn(
                    "flex items-center text-[10px] font-mono font-bold mt-1 px-1.5 py-0.5 rounded border",
                    isPositive ? "text-success border-success/30 bg-success/10" : "text-destructive border-destructive/30 bg-destructive/10"
                  )}>
                    {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                    {Math.abs(change).toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
            
            <Badge 
              variant="outline" 
              className={cn(
                "mt-6 gap-2 px-4 py-1.5 text-[10px] font-mono font-black tracking-widest border transition-all",
                getRateBgColor(rate),
                getRateColor(rate)
              )}
            >
              {getRateLabel(rate)}
            </Badge>
          </div>

          <div className="md:col-span-2 space-y-6 flex flex-col justify-center">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-4 group/item hover:bg-white/[0.05] transition-colors">
                <div className="p-2.5 rounded-lg bg-primary/10 text-primary border border-primary/20 group-hover/item:scale-110 transition-transform">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">Leads Flow</p>
                  <p className="text-xl font-mono font-black text-foreground">{leads}</p>
                </div>
              </div>
              
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-4 group/item hover:bg-white/[0.05] transition-colors">
                <div className="p-2.5 rounded-lg bg-success/10 text-success border border-success/20 group-hover/item:scale-110 transition-transform">
                  <CalendarCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">Confirmed</p>
                  <p className="text-xl font-mono font-black text-foreground">{meetings}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-mono font-bold uppercase tracking-widest">
                <span className="text-muted-foreground">Efficiency Index</span>
                <span className={getRateColor(rate)}>
                  {rate >= 15 ? `ALPHA: +${(rate - 15).toFixed(1)}%` : `DELTA: ${(15 - rate).toFixed(1)}%`}
                </span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((rate / 30) * 100, 100)}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className={cn("h-full shadow-[0_0_10px_currentColor]", getRateColor(rate).replace('text-', 'bg-'))}
                />
              </div>
            </div>

            <div className="flex items-center gap-4 text-[9px] font-mono font-bold uppercase tracking-[0.2em]">
              <div className="flex items-center gap-2 text-destructive/60">
                <div className="h-1.5 w-1.5 rounded-full bg-current" />
                <span>Critical</span>
              </div>
              <div className="flex items-center gap-2 text-success/60">
                <div className="h-1.5 w-1.5 rounded-full bg-current" />
                <span>Optimal</span>
              </div>
              <div className="flex items-center gap-2 text-primary/60">
                <div className="h-1.5 w-1.5 rounded-full bg-current" />
                <span>Apex</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}