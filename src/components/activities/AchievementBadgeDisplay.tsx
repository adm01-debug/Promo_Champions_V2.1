import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Star, Shield, Zap, Target, Crown, Flame, Gem } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export const AchievementBadgeDisplay: React.FC = () => {
  const badges = [
    { id: 1, name: "Killer Instinct", icon: Target, color: "text-status-error", bg: "bg-status-error/10", border: "border-status-error/30", desc: "Performance Explosiva: Batendo 150% da meta global." },
    { id: 2, name: "Overclock", icon: Zap, color: "text-primary", bg: "bg-primary/10", border: "border-primary/30", desc: "Modo Overclock: Atividades de alta densidade registradas." },
    { id: 3, name: "Iron Fortress", icon: Shield, color: "text-status-info", bg: "bg-status-info/10", border: "border-status-info/30", desc: "Consistência de Ferro: 7 dias consecutivos em alto nível." },
    { id: 4, name: "Arena Emperor", icon: Crown, color: "text-rank-gold", bg: "bg-rank-gold/10", border: "border-rank-gold/30", desc: "Top 1 Absoluto: Dominando o ranking da arena." },
  ];

  return (
    <Card variant="glass" className="border-border/20 bg-background/20 backdrop-blur-xl group/achievements hover:bg-background/30 transition-all duration-700 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover/achievements:opacity-100 transition-opacity" />
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 flex items-center gap-2">
              <Gem className="h-3 w-3 text-primary" /> Conquistas da Temporada
            </span>
          </div>
          
          <div className="flex items-center justify-around gap-4">
            {badges.map(badge => (
              <TooltipProvider key={badge.id}>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <div className={cn(
                      "p-4 rounded-[1.5rem] border transition-all duration-700 hover:scale-125 hover:-rotate-6 cursor-help relative group/badge shadow-2xl",
                      badge.bg,
                      badge.border
                    )}>
                      {/* Holographic Pulse Effect */}
                      <div className="absolute inset-0 bg-white/20 rounded-[1.5rem] opacity-0 group-hover/badge:opacity-40 animate-ping pointer-events-none" />
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover/badge:opacity-100 transition-opacity rounded-[1.5rem]" />
                      
                      <badge.icon className={cn("h-7 w-7 transition-all duration-500 group-hover/badge:scale-110", badge.color, "drop-shadow-glow")} />
                      
                      {/* Particle Hint */}
                      <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary animate-pulse shadow-glow-primary opacity-0 group-hover/badge:opacity-100" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="glass-morphism border-primary/20 p-4 max-w-[200px] shadow-2xl animate-in zoom-in-95">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className={cn("p-1 rounded bg-background border", badge.border)}>
                          <badge.icon className={cn("h-3 w-3", badge.color)} />
                        </div>
                        <p className="text-[11px] font-black uppercase tracking-widest text-foreground">{badge.name}</p>
                      </div>
                      <p className="text-[10px] text-muted-foreground font-medium leading-relaxed italic">{badge.desc}</p>
                      <div className="pt-2 border-t border-white/5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[8px] font-black text-primary uppercase tracking-widest">Próximo Nível</span>
                          <span className="text-[8px] font-black text-muted-foreground uppercase">85%</span>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-primary animate-shimmer" style={{ width: '85%' }} />
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[7px] font-black text-muted-foreground/50 uppercase">Rarity: ELITE</span>
                          <Flame className="h-3 w-3 text-status-warning animate-pulse" />
                        </div>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};