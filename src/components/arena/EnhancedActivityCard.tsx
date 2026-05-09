import React from 'react';
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
              <div className="absolute -top-1 -left-1 bg-primary px-1.5 py-0.5 rounded-md text-[8px] font-black text-white shadow-lg border border-white/20 z-20">
                LVL {Math.floor(data.progress.overall / 10) + 1}
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
              {/* XP Bar Micro-component */}
              <div className="w-24 h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                <div 
                  className="h-full bg-primary/60 animate-shimmer" 
                  style={{ width: `${(data.progress.overall % 10) * 10}%` }} 
                />
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className={cn(
              "text-3xl font-display font-black tracking-tighter leading-none mb-1",
              isWinner ? "text-rank-gold drop-shadow-glow" : "text-primary"
            )}>
              {data.progress.overall.toFixed(0)}%
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Progresso Meta</span>
          </div>
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
