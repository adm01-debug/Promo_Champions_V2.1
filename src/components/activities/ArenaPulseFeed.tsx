import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Zap, Trophy, TrendingUp, Star, Flame, Target, MessageCircle, Radar, Ghost } from "lucide-react";
import { ActivityGoalProgress } from "@/hooks/useActivityGoals";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ArenaPulseFeedProps {
  data: ActivityGoalProgress[];
}

interface PulseEvent {
  id: string;
  type: 'victory' | 'streak' | 'velocity' | 'milestone' | 'stealth';
  salesperson: string;
  message: string;
  time: string;
  icon: any;
  color: string;
  bgColor: string;
}

export const ArenaPulseFeed: React.FC<ArenaPulseFeedProps> = ({ data }) => {
  const events = useMemo(() => {
    const newEvents: PulseEvent[] = [];
    
    // Derive events from progress data
    data.forEach(sp => {
      if (sp.progress.overall >= 100) {
        newEvents.push({
          id: `victory-${sp.salesperson_id}`,
          type: 'victory',
          salesperson: sp.salesperson_name,
          message: "META DIÁRIA ATINGIDA! 🏆",
          time: "LIVE",
          icon: Trophy,
          color: "text-status-success",
          bgColor: "bg-status-success/20"
        });
      } else if (sp.progress.overall >= 80) {
        newEvents.push({
          id: `milestone-${sp.salesperson_id}`,
          type: 'milestone',
          salesperson: sp.salesperson_name,
          message: "Rumo ao topo: 80% concluído!",
          time: "5m",
          icon: Target,
          color: "text-primary",
          bgColor: "bg-primary/20"
        });
      }
      
      if (sp.current.calls > 20) {
        newEvents.push({
          id: `streak-${sp.salesperson_id}`,
          type: 'streak',
          salesperson: sp.salesperson_name,
          message: `Hot Streak: ${sp.current.calls} Conexões!`,
          time: "10m",
          icon: Flame,
          color: "text-status-warning",
          bgColor: "bg-status-warning/20"
        });
      }

      if (sp.progress.overall < 20 && sp.hasGoals) {
        newEvents.push({
          id: `stealth-${sp.salesperson_id}`,
          type: 'stealth',
          salesperson: sp.salesperson_name,
          message: "Modo Stealth: Aquecendo motores...",
          time: "20m",
          icon: Ghost,
          color: "text-muted-foreground",
          bgColor: "bg-muted/20"
        });
      }
    });

    // Sort by type priority
    return newEvents.sort((a, b) => {
      const priority = { victory: 0, streak: 1, milestone: 2, velocity: 3, stealth: 4 };
      return priority[a.type] - priority[b.type];
    }).slice(0, 6);
  }, [data]);

  return (
    <Card variant="glass" className="overflow-hidden border-primary/20 shadow-2xl group/feed relative">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Radar className="h-24 w-24 text-primary animate-spin-slow" />
      </div>
      
      <CardHeader className="pb-3 border-b border-white/10 bg-gradient-to-r from-primary/10 via-transparent to-transparent relative">
        <div className="flex flex-col gap-1.5">
          <CardTitle className="text-xs font-black uppercase tracking-[0.3em] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Activity className="h-4 w-4 text-primary animate-pulse" />
                <div className="absolute -inset-1 bg-primary/20 blur-sm rounded-full animate-pulse" />
              </div>
              Pulse da Arena Live
            </div>
            <Badge variant="outline" className="bg-primary/5 text-[8px] font-black border-primary/30 animate-pulse">
              SISTEMA ATIVO
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2 px-1">
            <div className="flex -space-x-1.5 overflow-hidden">
              {data.slice(0, 3).map((sp, i) => (
                <div key={i} className="w-4 h-4 rounded-full border border-background bg-muted text-[6px] font-black flex items-center justify-center uppercase">
                  {sp.salesperson_name[0]}
                </div>
              ))}
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest text-primary/70">
              +{data.length} Pilotos em Operação
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="relative">
          {/* Scanning line for the list */}
          <div className="absolute left-0 top-0 w-[2px] h-full bg-gradient-to-b from-transparent via-primary to-transparent opacity-20" />
          
          <div className="divide-y divide-white/5">
            {events.length > 0 ? (
              events.map((event, idx) => (
                <div 
                  key={event.id} 
                  className={cn(
                    "p-4 flex items-start gap-4 transition-all duration-500 hover:bg-white/5 relative group/item",
                    "animate-fade-in-up",
                    event.type === 'victory' && "bg-status-success/5"
                  )}
                  style={{ animationDelay: `${idx * 150}ms` }}
                >
                  <div className={cn(
                    "mt-1 p-2 rounded-xl border transition-transform duration-500 group-hover/item:scale-110 group-hover/item:rotate-6 shadow-lg",
                    event.bgColor,
                    event.color.replace('text-', 'border-') + '/30'
                  )}>
                    <event.icon className={cn("h-4 w-4", event.color)} />
                  </div>
                  
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground group-hover/item:text-foreground transition-colors">
                        {event.salesperson}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-bold text-muted-foreground/40 font-mono">{event.time}</span>
                        <div className="h-1 w-1 rounded-full bg-primary/40" />
                      </div>
                    </div>
                    
                    <p className="text-xs font-bold leading-relaxed tracking-tight">
                      {event.message}
                    </p>
                    
                    {event.type === 'victory' && (
                      <div className="flex gap-1.5 mt-2">
                        <Badge className="text-[7px] bg-status-success hover:bg-status-success text-white font-black px-2 py-0 h-4 border-none shadow-glow-success/40">
                          MVP STATUS
                        </Badge>
                        <Badge variant="outline" className="text-[7px] border-primary/30 text-primary bg-primary/10 font-black h-4 px-2 py-0">
                          +500 XP Gained
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <div className="self-center opacity-0 group-hover/item:opacity-100 transition-opacity">
                    <Zap className="h-3.5 w-3.5 text-primary animate-pulse" />
                  </div>
                </div>
              ))
            ) : (
              <div className="p-16 text-center space-y-4">
                <Radar className="h-12 w-12 text-muted-foreground/20 mx-auto animate-spin-slow" />
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 italic">Sincronizando com a Arena...</p>
                  <p className="text-[8px] text-muted-foreground/30 font-mono">Status: WAITING_FOR_OPERATIONS</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-3 bg-black/20 border-t border-white/5 text-center">
          <p className="text-[8px] font-black uppercase tracking-[0.5em] text-muted-foreground/30 animate-pulse">
            End of Live Feed
          </p>
        </div>
      </CardContent>
    </Card>
  );
};