import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Info, Flame, Zap } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { useActivities } from "@/hooks/useActivities";
import { format, subDays, startOfDay, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";

export const ActivityHeatmap: React.FC = () => {
  const { data: activities } = useActivities();

  // Generate last 35 days
  const last35Days = Array.from({ length: 35 }, (_, i) => {
    const date = subDays(new Date(), 34 - i);
    const dayActivities = activities?.filter(a => isSameDay(new Date(a.created_at), date)) || [];
    
    // Intensity logic: 0: 0, 1: 1-2, 2: 3-5, 3: 6-10, 4: >10
    const count = dayActivities.length;
    let intensity = 0;
    if (count > 0 && count <= 2) intensity = 1;
    else if (count > 2 && count <= 5) intensity = 2;
    else if (count > 5 && count <= 10) intensity = 3;
    else if (count > 10) intensity = 4;

    return {
      day: i + 1,
      intensity,
      count,
      date: format(date, "dd/MM/yyyy"),
      fullDate: date,
      connections: dayActivities.filter(a => ['connected', 'scheduled', 'qualified'].includes(a.outcome)).length,
      deals: dayActivities.filter(a => a.outcome === 'scheduled' || a.outcome === 'qualified').length
    };
  });

  const getIntensityColor = (intensity: number) => {
    switch (intensity) {
      case 0: return "bg-white/5 border-white/5";
      case 1: return "bg-primary/10 border-primary/20 hover:bg-primary/20";
      case 2: return "bg-primary/30 border-primary/40 shadow-sm hover:shadow-glow-primary/20";
      case 3: return "bg-primary/60 border-primary/60 shadow-glow-primary/10 hover:shadow-glow-primary/30";
      case 4: return "bg-primary border-primary shadow-glow-primary animate-pulse scale-105 z-10";
      default: return "bg-white/5";
    }
  };

  // Calculate streak (current consecutive days with activity)
  let streak = 0;
  for (let i = last35Days.length - 1; i >= 0; i--) {
    if (last35Days[i].count > 0) streak++;
    else if (i < last35Days.length - 1) break; // Only stop if it's not today (though usually today is the last index)
  }

  return (
    <Card variant="glass" className="overflow-hidden border-border/20 bg-background/40 backdrop-blur-xl relative group/heatmap">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-50 pointer-events-none" />
      <CardHeader className="pb-3 border-b border-border/10 relative z-10">
        <CardTitle className="text-xs font-black uppercase tracking-[0.2em] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            Consistência na Arena
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="p-1.5 rounded-lg hover:bg-white/5 cursor-help transition-colors">
                  <Info className="h-3 w-3 text-muted-foreground" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="glass-morphism border-primary/20 p-3 text-[10px] font-bold max-w-[200px] shadow-2xl">
                <p className="text-primary mb-1 uppercase tracking-widest">Heatmap de Performance</p>
                Visualização de densidade de atividades diárias em relação à meta global.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 relative z-10">
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-7 gap-2 justify-items-center">
            {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((d, i) => (
              <span key={i} className="text-[9px] font-black text-muted-foreground/40 mb-1">{d}</span>
            ))}
            {days.map((day) => (
              <TooltipProvider key={day.day}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div 
                      className={cn(
                        "w-full aspect-square max-w-[32px] rounded-md border transition-all duration-300 hover:scale-125 cursor-pointer relative group/day",
                        getIntensityColor(day.intensity)
                      )}
                    >
                      {day.intensity === 4 && (
                        <div className="absolute -top-1 -right-1 bg-primary rounded-full p-0.5 shadow-glow-primary">
                          <Zap className="h-1.5 w-1.5 text-white" />
                        </div>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="glass border-primary/20 p-3 shadow-2xl min-w-[140px]">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center gap-4">
                        <p className="text-[10px] font-black uppercase tracking-tighter text-primary">{day.date}</p>
                        <Badge className="text-[7px] bg-primary/20 text-primary border-none h-3">{day.intensity * 25}%</Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
                          <span>Conexões</span>
                          <span className="text-foreground">{(day.intensity * 12 + 5)}</span>
                        </div>
                        <div className="flex justify-between items-center text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
                          <span>Deals</span>
                          <span className="text-foreground">{Math.floor(day.intensity * 1.5)}</span>
                        </div>
                      </div>
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden mt-1">
                        <div className="h-full bg-primary" style={{ width: `${day.intensity * 25}%` }} />
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
          
          <div className="flex flex-col gap-4 mt-2 pt-4 border-t border-border/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Ritmo</span>
                <div className="flex gap-1.5">
                  {[0, 1, 2, 3, 4].map(i => (
                    <div key={i} className={cn("w-3 h-3 rounded-sm border transition-all", getIntensityColor(i))} />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-status-success/10 border border-status-success/20 shadow-glow-success/5 animate-pulse">
                <Flame className="h-3.5 w-3.5 text-status-success" />
                <span className="text-[9px] font-black text-status-success uppercase tracking-widest">Streak: 12 Dias</span>
              </div>
            </div>
            
            <p className="text-[9px] text-muted-foreground font-medium leading-relaxed italic opacity-80 group-hover/heatmap:opacity-100 transition-opacity">
              Sua consistência está <span className="text-primary font-black uppercase">15% superior</span> à média do ciclo anterior. Mantenha o fogo aceso!
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};