import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Calendar, MessageCircle, Linkedin, Settings, PartyPopper } from "lucide-react";
import { ActivityGoalProgress } from "@/hooks/useActivityGoals";
import { useCelebration } from "@/hooks/useCelebration";

interface ActivityGoalCardProps {
  data: ActivityGoalProgress;
  onEdit: (salespersonId: string) => void;
}

const roleLabels: Record<string, { label: string; color: string }> = {
  sdr: { label: "SDR", color: "bg-blue-500/20 text-blue-400" },
  closer: { label: "Closer", color: "bg-purple-500/20 text-purple-400" },
  hybrid: { label: "Híbrido", color: "bg-emerald-500/20 text-emerald-400" },
};

export function ActivityGoalCard({ data, onEdit }: ActivityGoalCardProps) {
  const { celebrate } = useCelebration();
  const hasReachedGoal = data.hasGoals && data.progress.overall >= 100;

  // Trigger celebration when goal is reached
  useEffect(() => {
    if (hasReachedGoal) {
      celebrate(data.salesperson_id, data.salesperson_name, data.salesperson_id);
    }
  }, [hasReachedGoal, data.salesperson_id, data.salesperson_name, celebrate]);

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return "bg-green-500";
    if (progress >= 70) return "bg-blue-500";
    if (progress >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getStatusBadge = () => {
    if (data.progress.overall >= 100) {
      return (
        <Badge className="bg-green-500/20 text-green-400 text-[10px] animate-pulse">
          🎉 Meta Batida!
        </Badge>
      );
    }
    if (data.progress.overall >= 70) {
      return <Badge className="bg-blue-500/20 text-blue-400 text-[10px]">📈 No Caminho</Badge>;
    }
    if (data.progress.overall >= 40) {
      return <Badge className="bg-yellow-500/20 text-yellow-400 text-[10px]">⚡ Acelerar</Badge>;
    }
    return <Badge className="bg-red-500/20 text-red-400 text-[10px]">🚨 Atenção</Badge>;
  };

  const activities = [
    { icon: Phone, label: "Calls", current: data.current.calls, goal: data.goals.calls, progress: data.progress.calls, color: "text-green-400" },
    { icon: Mail, label: "Emails", current: data.current.emails, goal: data.goals.emails, progress: data.progress.emails, color: "text-blue-400" },
    { icon: Calendar, label: "Reuniões", current: data.current.meetings, goal: data.goals.meetings, progress: data.progress.meetings, color: "text-purple-400" },
    { icon: Linkedin, label: "LinkedIn", current: data.current.linkedin, goal: data.goals.linkedin, progress: data.progress.linkedin, color: "text-sky-400" },
    { icon: MessageCircle, label: "WhatsApp", current: data.current.whatsapp, goal: data.goals.whatsapp, progress: data.progress.whatsapp, color: "text-emerald-400" },
  ];

  return (
    <Card className={`glass border-border/40 hover:border-border/60 transition-all ${hasReachedGoal ? 'ring-2 ring-green-500/50 shadow-lg shadow-green-500/20' : ''}`}>
      <CardContent className="p-4 relative overflow-hidden">
        {/* Celebration overlay */}
        {hasReachedGoal && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-2 right-2 animate-bounce">
              <PartyPopper className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="absolute top-2 left-2 animate-bounce" style={{ animationDelay: '0.2s' }}>
              <PartyPopper className="h-4 w-4 text-pink-400" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-green-500/5 to-transparent" />
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className={`h-10 w-10 border-2 ${hasReachedGoal ? 'border-green-500 ring-2 ring-green-500/30' : 'border-border/40'}`}>
              <AvatarImage src={data.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/20 text-primary text-sm">
                {data.salesperson_name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-medium text-sm ${hasReachedGoal ? 'text-green-400' : ''}`}>
                  {data.salesperson_name}
                </span>
                <Badge className={`${roleLabels[data.role]?.color || ''} text-[10px] px-1.5`}>
                  {roleLabels[data.role]?.label || data.role}
                </Badge>
              </div>
              {data.hasGoals && getStatusBadge()}
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 relative z-10" onClick={() => onEdit(data.salesperson_id)}>
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {!data.hasGoals ? (
          <div className="text-center py-4 text-muted-foreground text-sm">
            <p>Nenhuma meta configurada</p>
            <Button variant="link" size="sm" onClick={() => onEdit(data.salesperson_id)}>
              Configurar metas
            </Button>
          </div>
        ) : (
          <>
            {/* Overall Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Progresso Geral</span>
                <span className={`text-sm font-bold ${hasReachedGoal ? 'text-green-400' : ''}`}>
                  {data.progress.overall.toFixed(0)}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${getProgressColor(data.progress.overall)} ${hasReachedGoal ? 'animate-pulse' : ''}`}
                  style={{ width: `${Math.min(data.progress.overall, 100)}%` }}
                />
              </div>
            </div>

            {/* Activity Breakdown */}
            <div className="space-y-2">
              {activities.filter(a => a.goal > 0).map((activity, index) => (
                <div key={index} className="flex items-center gap-2">
                  <activity.icon className={`h-3.5 w-3.5 ${activity.color} flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[10px] text-muted-foreground">{activity.label}</span>
                      <span className="text-[10px] font-medium">
                        {activity.current}/{activity.goal}
                      </span>
                    </div>
                    <Progress value={activity.progress} className="h-1" />
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
