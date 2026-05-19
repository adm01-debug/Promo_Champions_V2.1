import React from "react";
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Phone, Mail, Calendar, MessageCircle, Linkedin, Settings, PartyPopper, Flame, Zap, Target, Trophy, TrendingUp } from "lucide-react";
import { ActivityGoalProgress } from "@/hooks/activities/useActivityGoals";
import { useCelebration } from "@/hooks/useCelebration";
import { useSalespersonStreak } from "@/hooks/gamification/useAchievements";

interface ActivityGoalCardProps {
  data: ActivityGoalProgress;
  onEdit: (salespersonId: string) => void;
}

const roleLabels: Record<string, { label: string; color: string }> = {
  sdr: { label: "SDR", color: "bg-status-info/20 text-status-info" },
  closer: { label: "Closer", color: "bg-status-purple/20 text-status-purple" },
  hybrid: { label: "Híbrido", color: "bg-status-success/20 text-status-success" },
};

const getStreakDisplay = (current: number, best: number) => {
  // Check if beat record (current equals or exceeds previous best)
  const isBeatRecord = current > 1 && current >= best && best > 1;
  // Check if near record (1 day away)
  const isNearRecord = current > 1 && current === best - 1;

  if (isBeatRecord) {
    return {
      icon: <Trophy className="h-3.5 w-3.5" />,
      color: "bg-gradient-to-r from-rank-gold/30 to-rank-gold/20 text-rank-gold border-rank-gold/50 animate-tada",
      label: "Novo Recorde!",
      showRecordBadge: true,
    };
  }
  if (isNearRecord) {
    return {
      icon: <TrendingUp className="h-3.5 w-3.5" />,
      color: "bg-gradient-to-r from-status-purple/30 to-accent/30 text-status-purple border-status-purple/50 animate-pulse",
      label: "Quase lá!",
      showRecordBadge: false,
      nearRecordMessage: `A 1 dia do recorde de ${best} dias!`,
    };
  }
  if (current >= 7) {
    return {
      icon: <Flame className="h-3.5 w-3.5" />,
      color: "bg-gradient-to-r from-status-warning/30 to-status-error/30 text-status-warning border-status-warning/50",
      label: "Em Chamas!",
      showRecordBadge: false,
    };
  }
  if (current >= 3) {
    return {
      icon: <Zap className="h-3.5 w-3.5" />,
      color: "bg-status-info/20 text-status-info border-status-info/40",
      label: "Sequência",
      showRecordBadge: false,
    };
  }
  return {
    icon: <Target className="h-3.5 w-3.5" />,
    color: "bg-status-success/20 text-status-success border-status-success/40",
    label: "Iniciando",
    showRecordBadge: false,
  };
};

const ActivityGoalCardComponent = ({ data, onEdit }: ActivityGoalCardProps) => {
  const { celebrate } = useCelebration();
  const { data: streakData } = useSalespersonStreak(data.salesperson_id);
  const currentStreak = streakData?.current ?? 0;
  const bestStreak = streakData?.best ?? 0;
  const hasReachedGoal = data.hasGoals && data.progress.overall >= 100;

  // Trigger celebration when goal is reached
  useEffect(() => {
    if (hasReachedGoal) {
      celebrate(data.salesperson_id, data.salesperson_name, data.salesperson_id);
    }
  }, [hasReachedGoal, data.salesperson_id, data.salesperson_name, celebrate]);

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return "bg-status-success";
    if (progress >= 70) return "bg-status-info";
    if (progress >= 40) return "bg-status-warning";
    return "bg-status-error";
  };

  const getStatusBadge = () => {
    if (data.progress.overall >= 100) {
      return (
        <Badge className="bg-status-success/20 text-status-success text-[10px] animate-pulse">
          🎉 Meta Batida!
        </Badge>
      );
    }
    if (data.progress.overall >= 70) {
      return <Badge className="bg-status-info/20 text-status-info text-[10px]">📈 No Caminho</Badge>;
    }
    if (data.progress.overall >= 40) {
      return <Badge className="bg-status-warning/20 text-status-warning text-[10px]">⚡ Acelerar</Badge>;
    }
    return <Badge className="bg-status-error/20 text-status-error text-[10px]">🚨 Atenção</Badge>;
  };

  const activities = [
    { icon: Phone, label: "Calls", current: data.current.calls, goal: data.goals.calls, progress: data.progress.calls, color: "text-status-success", weight: 0.3 },
    { icon: Mail, label: "Emails", current: data.current.emails, goal: data.goals.emails, progress: data.progress.emails, color: "text-status-info", weight: 0.1 },
    { icon: Calendar, label: "Reuniões", current: data.current.meetings, goal: data.goals.meetings, progress: data.progress.meetings, color: "text-status-purple", weight: 0.5 },
    { icon: Linkedin, label: "LinkedIn", current: data.current.linkedin, goal: data.goals.linkedin, progress: data.progress.linkedin, color: "text-primary", weight: 0.05 },
    { icon: MessageCircle, label: "WhatsApp", current: data.current.whatsapp, goal: data.goals.whatsapp, progress: data.progress.whatsapp, color: "text-accent", weight: 0.05 },
  ];

  const streakDisplay = currentStreak > 0 ? getStreakDisplay(currentStreak, bestStreak) : null;
  const isBeatRecord = currentStreak > 1 && currentStreak >= bestStreak && bestStreak > 1;
  const isNearRecord = currentStreak > 1 && currentStreak === bestStreak - 1;

  return (
    <Card className={`glass border-border/40 dark:border-glow hover:border-border/60 transition-all duration-300 hover-lift card-elevated ${hasReachedGoal ? 'ring-2 ring-status-success/50 shadow-lg shadow-status-success/20 hover-glow-success' : ''} ${isBeatRecord ? 'ring-2 ring-rank-gold/50 shadow-lg shadow-rank-gold/20 hover-glow-gold' : ''}`}>
      <CardContent className="p-4 relative overflow-hidden">
        {/* Celebration overlay */}
        {hasReachedGoal && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-2 right-2 animate-bounce">
              <PartyPopper className="h-5 w-5 text-rank-gold drop-shadow-glow" />
            </div>
            <div className="absolute top-2 left-2 animate-bounce" style={{ animationDelay: '0.2s' }}>
              <PartyPopper className="h-4 w-4 text-accent" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-status-success/10 to-transparent" />
          </div>
        )}

        {/* Record overlay */}
        {isBeatRecord && !hasReachedGoal && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-2 right-2 animate-bounce">
              <Trophy className="h-5 w-5 text-rank-gold drop-shadow-glow" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-rank-gold/10 to-transparent" />
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className={`h-10 w-10 border-2 transition-all duration-300 ${hasReachedGoal ? 'border-status-success ring-2 ring-status-success/30' : 'border-border/40 hover:border-primary/50'}`}>
                <AvatarImage src={data.avatar_url || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-primary/30 to-accent/20 text-primary text-sm font-medium">
                  {data.salesperson_name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {/* Streak indicator on avatar */}
              {currentStreak >= 3 && (
                <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5 shadow-md">
                  <div className={`rounded-full p-1 ${isBeatRecord ? 'bg-gradient-to-br from-rank-gold/40 to-rank-gold/20' : currentStreak >= 7 ? 'bg-gradient-to-br from-status-warning/40 to-status-warning/20' : 'bg-gradient-to-br from-status-info/40 to-status-info/20'}`}>
                    {isBeatRecord ? (
                      <Trophy className="h-3 w-3 text-rank-gold" />
                    ) : currentStreak >= 7 ? (
                      <Flame className="h-3 w-3 text-status-warning" />
                    ) : (
                      <Zap className="h-3 w-3 text-status-info" />
                    )}
                  </div>
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-display font-semibold text-sm transition-colors ${hasReachedGoal ? 'gradient-text' : ''}`}>
                  {data.salesperson_name}
                </span>
                <Badge className={`${roleLabels[data.role]?.color || ''} text-[10px] px-1.5 border`}>
                  {roleLabels[data.role]?.label || data.role}
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-1">
                {data.hasGoals && getStatusBadge()}
                {/* Streak badge */}
                {currentStreak > 0 && streakDisplay && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge className={`${streakDisplay.color} text-[10px] px-1.5 flex items-center gap-1 cursor-help border transition-all hover:scale-105`}>
                          {streakDisplay.icon}
                          <span>{currentStreak} dias</span>
                          {isBeatRecord && <span>🏆</span>}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent className="glass border-border/50">
                        <p className="font-display font-medium">{streakDisplay.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {currentStreak} {currentStreak === 1 ? 'dia' : 'dias'} consecutivos batendo meta
                        </p>
                        {isNearRecord && (
                          <p className="text-xs text-status-purple mt-1">
                            ⚡ A 1 dia do recorde de {bestStreak} dias!
                          </p>
                        )}
                        {isBeatRecord && (
                          <p className="text-xs text-rank-gold mt-1">
                            🏆 Novo recorde pessoal!
                          </p>
                        )}
                        {bestStreak > 0 && !isBeatRecord && !isNearRecord && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Recorde: {bestStreak} dias
                          </p>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" aria-label="Editar meta" className="h-8 w-8 relative z-10 hover:bg-primary/10 hover:text-primary transition-colors" onClick={() => onEdit(data.salesperson_id)}>
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {!data.hasGoals ? (
          <div className="text-center py-4 text-muted-foreground text-sm bg-muted/20 rounded-lg border border-dashed border-border/50">
            <p>Nenhuma meta configurada</p>
            <Button variant="link" size="sm" className="text-primary hover:text-primary/80" onClick={() => onEdit(data.salesperson_id)}>
              Configurar metas
            </Button>
          </div>
        ) : (
          <>
            {/* Overall Progress with Weight Breakdown */}
            <div className="mb-4 p-4 rounded-xl glass border border-border/30 shadow-inner bg-gradient-to-br from-background/50 to-muted/30">
              <div className="flex items-center justify-between mb-2">
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Power Score</span>
                  <span className="text-[9px] text-primary italic">Ponderado por Impacto</span>
                </div>
                <span className={`text-xl font-display font-black transition-all duration-300 ${hasReachedGoal ? 'gradient-text scale-110 drop-shadow-glow-sm' : ''}`}>
                  {data.progress.overall.toFixed(0)}%
                </span>
              </div>
              <div className="relative">
                <div className="h-3 rounded-full bg-muted/50 overflow-hidden shadow-inner border border-border/10">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out shadow-inner ${getProgressColor(data.progress.overall)} ${hasReachedGoal ? 'animate-pulse' : ''}`}
                    style={{ 
                      width: `${Math.min(data.progress.overall, 100)}%`,
                      boxShadow: hasReachedGoal ? '0 0 15px hsl(var(--status-success) / 0.8)' : undefined
                    }}
                  />
                </div>
                {/* Indicator markers */}
                <div className="absolute top-0 left-[40%] w-px h-3 bg-background/20 z-10" />
                <div className="absolute top-0 left-[70%] w-px h-3 bg-background/20 z-10" />
              </div>
              <div className="flex justify-between mt-1 px-0.5">
                <span className="text-[8px] text-muted-foreground uppercase font-bold">Start</span>
                <span className="text-[8px] text-muted-foreground uppercase font-bold">Turbo</span>
                <span className="text-[8px] text-status-success uppercase font-bold">Max</span>
              </div>
            </div>

            {/* Activity Breakdown */}
            <div className="space-y-2.5">
              {activities.filter(a => a.goal > 0).map((activity, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-2.5 group animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={`p-1.5 rounded-lg transition-all duration-300 border ${
                    activity.progress >= 100 
                      ? 'bg-status-success/20 border-status-success/30 shadow-sm shadow-status-success/20' 
                      : 'bg-muted/40 border-border/30 group-hover:bg-muted/60 group-hover:border-primary/30'
                  }`}>
                    <activity.icon className={`h-3.5 w-3.5 flex-shrink-0 transition-all duration-300 group-hover:scale-110 ${
                      activity.progress >= 100 ? 'text-status-success' : activity.color
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-muted-foreground font-medium">{activity.label}</span>
                      <span className={`text-[10px] font-semibold transition-colors ${
                        activity.progress >= 100 ? 'text-status-success' : 'group-hover:text-primary'
                      }`}>
                        {activity.current}/{activity.goal}
                      </span>
                    </div>
                    <Progress value={activity.progress} className="h-1.5" />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export const ActivityGoalCard = React.memo(ActivityGoalCardComponent);
