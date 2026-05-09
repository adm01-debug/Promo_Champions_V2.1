import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Zap, Trophy, TrendingUp, Star, Flame, Target, MessageCircle } from "lucide-react";
import { ActivityGoalProgress } from "@/hooks/useActivityGoals";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ArenaPulseFeedProps {
  data: ActivityGoalProgress[];
}

interface PulseEvent {
  id: string;
  type: 'victory' | 'streak' | 'velocity' | 'milestone';
  salesperson: string;
  message: string;
  time: string;
  icon: any;
  color: string;
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
          time: "Agora",
          icon: Trophy,
          color: "text-status-success"
        });
      } else if (sp.progress.overall >= 70) {
        newEvents.push({
          id: `milestone-${sp.salesperson_id}`,
          type: 'milestone',
          salesperson: sp.salesperson_name,
          message: "Faltam apenas 20% para o topo!",
          time: "5m atrás",
          icon: Star,
          color: "text-primary"
        });
      }
      
      if (sp.current.calls > 15) {
        newEvents.push({
          id: `streak-${sp.salesperson_id}`,
          type: 'streak',
          salesperson: sp.salesperson_name,
          message: `Em sequência de ${Math.floor(sp.current.calls / 5)} ligações!`,
          time: "10m atrás",
          icon: Flame,
          color: "text-status-warning"
        });
      }
    });

    // Sort by type priority for now since we don't have real timestamps
    return newEvents.sort((a, b) => {
      const priority = { victory: 0, streak: 1, milestone: 2, velocity: 3 };
      return priority[a.type] - priority[b.type];
    }).slice(0, 5);
  }, [data]);

  return (
    <Card variant="glass" className="overflow-hidden border-primary/20 shadow-glow-primary/5 group/feed">
      <CardHeader className="pb-3 border-b border-white/5 bg-primary/5">
        <CardTitle className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary animate-pulse" />
          Pulse da Arena Live
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-white/5">
          {events.length > 0 ? (
            events.map((event, idx) => (
              <div 
                key={event.id} 
                className={cn(
                  "p-4 flex items-start gap-4 transition-colors hover:bg-white/5 animate-fade-in",
                  idx === 0 && "bg-primary/5"
                )}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className={cn(
                  "mt-1 p-2 rounded-xl bg-background/50 border border-white/10 shadow-sm",
                  event.color.replace('text-', 'bg-').replace('status-', '') + '/10'
                )}>
                  <event.icon className={cn("h-4 w-4", event.color)} />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      {event.salesperson}
                    </p>
                    <span className="text-[9px] font-medium text-muted-foreground/60">{event.time}</span>
                  </div>
                  <p className="text-xs font-bold leading-relaxed">
                    {event.message}
                  </p>
                  {event.type === 'victory' && (
                    <div className="flex gap-1 mt-2">
                      <Badge variant="outline" className="text-[8px] border-status-success/30 text-status-success bg-status-success/10 font-black">MVP DO DIA</Badge>
                      <Badge variant="outline" className="text-[8px] border-primary/30 text-primary bg-primary/10 font-black">+500 XP</Badge>
                    </div>
                  )}
                </div>
                <div className="self-center">
                  <Zap className="h-3 w-3 text-primary/30" />
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center space-y-2 opacity-50 italic">
              <p className="text-xs">Aguardando movimentação na arena...</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};