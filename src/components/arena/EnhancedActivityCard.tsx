import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp, Zap, Trophy, Flame } from "lucide-react";
import { ActivityGoalProgress } from "@/hooks/useActivityGoals";
import { cn } from "@/lib/utils";

interface EnhancedActivityCardProps {
  data: ActivityGoalProgress;
  className?: string;
}

export const EnhancedActivityCard: React.FC<EnhancedActivityCardProps> = ({ data, className }) => {
  const [reactions, setReactions] = useState(Math.floor(Math.random() * 12));
  const isWinner = data.progress.overall >= 100;
  const isHighPerformer = data.progress.overall >= 80;

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-500 hover:-translate-y-2 group cursor-pointer",
      "bg-background/40 backdrop-blur-xl border-white/10 shadow-2xl",
      isWinner && "ring-2 ring-rank-gold/50 shadow-glow-gold/20",
      className
    )}>
      {/* Decorative background elements */}
      <div className={cn(
        "absolute -top-24 -right-24 w-48 h-48 blur-[80px] rounded-full opacity-20 transition-all duration-700 group-hover:scale-150",
        isWinner ? "bg-rank-gold" : isHighPerformer ? "bg-primary" : "bg-muted"
      )} />
      
      <CardContent className="p-6 relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className={cn(
                "h-16 w-16 border-2 transition-transform duration-500 group-hover:scale-110",
                isWinner ? "border-rank-gold shadow-glow-gold" : "border-white/10"
              )}>
                <AvatarImage src={data.avatar_url || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-primary/30 to-accent/20 text-xl font-bold">
                  {data.salesperson_name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -top-1 -left-1 bg-primary px-2 py-0.5 rounded-md text-[9px] font-black text-white shadow-glow-primary/50 border border-white/20 z-20 flex items-center gap-1 group-hover:scale-110 transition-transform">
                <span className="opacity-70 text-[7px]">LVL</span>
                {Math.floor(data.progress.overall / 10) + 1}
              </div>
              {isWinner && (
                <div className="absolute -bottom-1 -right-1 bg-rank-gold rounded-full p-1.5 shadow-lg animate-bounce z-20">
                  <Trophy className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-display font-black tracking-tight group-hover:gradient-text transition-all leading-none">
                {data.salesperson_name}
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest bg-white/5 h-4">
                  {data.role}
                </Badge>
                {isHighPerformer && (
                  <div className="flex items-center gap-1 text-rank-gold">
                    <Flame className="h-3 w-3 animate-pulse" />
                    <span className="text-[8px] font-black uppercase tracking-tighter">On Fire</span>
                  </div>
                )}
              </div>
              {/* XP Bar Micro-component - Strategic Progression */}
              <div className="flex flex-col gap-1.5 mt-3 group/xp">
                <div className="flex justify-between items-center">
                  <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em] animate-pulse">Nível {Math.floor(data.progress.overall / 10) + 1}</span>
                  <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">{((data.progress.overall % 10) * 10).toFixed(0)}/100 XP</span>
                </div>
                <div className="w-32 h-2 bg-black/40 rounded-full overflow-hidden border border-white/5 shadow-inner relative">
                  <div 
                    className="h-full bg-gradient-to-r from-primary/60 via-primary to-primary/60 animate-shimmer relative transition-all duration-1000" 
                    style={{ width: `${(data.progress.overall % 10) * 10}%` }} 
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                  </div>
                  {/* XP Threshold Markers */}
                  <div className="absolute top-0 left-1/4 w-[1px] h-full bg-white/10" />
                  <div className="absolute top-0 left-2/4 w-[1px] h-full bg-white/10" />
                  <div className="absolute top-0 left-3/4 w-[1px] h-full bg-white/10" />
                </div>
                <p className="text-[7px] font-bold text-muted-foreground/60 uppercase tracking-tighter opacity-0 group-hover/xp:opacity-100 transition-opacity">
                  +125 XP para o Próximo Nível
                </p>
              </div>
            </div>
          </div>
          
          <div className="text-right flex flex-col items-end">
            <div className={cn(
              "text-3xl font-display font-black tracking-tighter leading-none mb-1",
              isWinner ? "text-rank-gold drop-shadow-glow" : "text-primary"
            )}>
              {data.progress.overall.toFixed(0)}%
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Progresso Meta</span>
              {reactions > 0 && (
                <Badge variant="secondary" className="h-4 px-1.5 text-[8px] bg-primary/10 text-primary border-none font-black animate-in fade-in zoom-in">
                  <Zap className="h-2.5 w-2.5 mr-1" /> {reactions}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Floating Reactions Bar - Step 9 */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0 z-30">
          <button 
            onClick={(e) => { e.stopPropagation(); setReactions(r => r + 1); }}
            className="p-2 rounded-xl bg-primary/20 backdrop-blur-md border border-primary/30 hover:bg-primary/40 transition-colors shadow-lg"
          >
            <Flame className="h-4 w-4 text-primary animate-pulse" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); setReactions(r => r + 1); }}
            className="p-2 rounded-xl bg-rank-gold/20 backdrop-blur-md border border-rank-gold/30 hover:bg-rank-gold/40 transition-colors shadow-lg"
          >
            <Zap className="h-4 w-4 text-rank-gold" />
          </button>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="space-y-4">
          <div className="relative h-2 w-full bg-white/5 rounded-full overflow-hidden">
             <div 
               className={cn(
                 "absolute top-0 left-0 h-full transition-all duration-1000 ease-spring",
                 isWinner ? "bg-gradient-to-r from-rank-gold via-yellow-400 to-rank-gold animate-shimmer" : "bg-primary"
               )}
               style={{ width: `${Math.min(data.progress.overall, 100)}%` }}
             />
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Target, label: 'Calls', val: data.current.calls, goal: data.goals.calls, color: 'text-blue-400' },
              { icon: Zap, label: 'Lead Gen', val: data.current.emails, goal: data.goals.emails, color: 'text-purple-400' },
              { icon: TrendingUp, label: 'Deals', val: data.current.meetings, goal: data.goals.meetings, color: 'text-emerald-400' }
            ].map((stat, i) => (
              <div key={i} className="bg-white/5 rounded-xl p-3 border border-white/5 transition-colors group-hover:bg-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <stat.icon className={cn("h-3 w-3", stat.color)} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</span>
                </div>
                <div className="text-sm font-black">
                  {stat.val} <span className="text-muted-foreground">/ {stat.goal}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
