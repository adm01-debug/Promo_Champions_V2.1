import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Star, Shield, Zap, Target } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const AchievementBadgeDisplay: React.FC = () => {
  const badges = [
    { id: 1, name: "Killer Instinct", icon: Target, color: "text-status-error", bg: "bg-status-error/10", desc: "Batendo 150% da meta" },
    { id: 2, name: "Night Owl", icon: Zap, color: "text-primary", bg: "bg-primary/10", desc: "Atividades após as 18h" },
    { id: 3, name: "Unstoppable", icon: Shield, color: "text-status-info", bg: "bg-status-info/10", desc: "7 dias sem falhas" },
    { id: 4, name: "Grand Master", icon: Trophy, color: "text-rank-gold", bg: "bg-rank-gold/10", desc: "Top 1 da Arena" },
  ];

  return (
    <Card variant="glass" className="border-border/40 bg-background/20 backdrop-blur-xl group/achievements hover:bg-background/40 transition-all duration-500">
      <CardContent className="p-6">
        <div className="flex items-center justify-around gap-2">
          {badges.map(badge => (
            <TooltipProvider key={badge.id}>
              <Tooltip>
                <TooltipTrigger>
                  <div className={`p-3.5 rounded-2xl ${badge.bg} border border-white/10 transition-all duration-500 hover:scale-125 hover:-rotate-12 cursor-help relative group shadow-lg`}>
                    <div className="absolute inset-0 bg-white/30 rounded-2xl opacity-0 group-hover:opacity-100 animate-ping pointer-events-none" />
                    <badge.icon className={`h-6 w-6 ${badge.color} drop-shadow-glow`} />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="glass border-primary/20">
                  <p className="text-[10px] font-black uppercase tracking-widest">{badge.name}</p>
                  <p className="text-[9px] text-muted-foreground">{badge.desc}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};