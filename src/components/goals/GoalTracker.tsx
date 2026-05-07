import { FC } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Trophy,
  Flag,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';

interface GoalData {
  id: string;
  title: string;
  type: 'revenue' | 'deals' | 'activities' | 'clients';
  target: number;
  current: number;
  unit: string;
  period: string;
  dueDate: string;
  status: 'on_track' | 'at_risk' | 'behind' | 'completed';
}

interface GoalTrackerProps {
  goal: GoalData;
  onEdit?: () => void;
  showDetails?: boolean;
}

export const GoalTracker: FC<GoalTrackerProps> = ({ goal, onEdit, showDetails = true }) => {
  const progress = Math.min((goal.current / goal.target) * 100, 100);
  
  const statusConfig = {
    on_track: { label: 'No caminho', color: 'bg-status-success', icon: TrendingUp, textColor: 'text-status-success' },
    at_risk: { label: 'Em risco', color: 'bg-status-warning', icon: AlertCircle, textColor: 'text-status-warning' },
    behind: { label: 'Atrasado', color: 'bg-status-error', icon: TrendingDown, textColor: 'text-status-error' },
    completed: { label: 'Concluído', color: 'bg-status-info', icon: CheckCircle2, textColor: 'text-status-info' }
  };

  const status = statusConfig[goal.status];
  const StatusIcon = status.icon;

  return (
    <Card className="p-5 glass border-border/40 hover:border-primary/40 transition-all duration-300 hover-lift relative overflow-hidden group">
      {/* Background decoration */}
      <div className={`absolute -right-8 -top-8 w-24 h-24 rounded-full blur-3xl opacity-10 transition-opacity group-hover:opacity-20 ${status.color}`} />
      
      <div className="flex items-start justify-between mb-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${status.color}/10 shadow-inner border border-border/10`}>
            <Target className={`h-6 w-6 ${status.textColor}`} />
          </div>
          <div>
            <h4 className="font-display font-black text-base tracking-tight uppercase group-hover:text-primary transition-colors italic">
              {goal.title}
            </h4>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-0.5">
              <Clock className="h-3 w-3" />
              {goal.period}
            </div>
          </div>
        </div>
        <Badge className={`${status.color} text-primary-foreground font-black uppercase tracking-widest text-[9px] px-2.5 py-1 border-none shadow-lg`}>
          <StatusIcon className="h-3 w-3 mr-1.5" />
          {status.label}
        </Badge>
      </div>

      <div className="mb-6 relative z-10">
        <div className="flex justify-between items-end mb-2.5 px-0.5">
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Progresso</span>
            <span className="text-lg font-black tracking-tighter gradient-text">
              {goal.current.toLocaleString()} <span className="text-[10px] text-muted-foreground font-bold italic ml-1">{goal.unit}</span>
            </span>
          </div>
          <div className="text-right">
            <span className="text-2xl font-display font-black tracking-tighter italic opacity-80">
              {progress.toFixed(0)}%
            </span>
          </div>
        </div>
        <div className="relative h-3 bg-muted/40 rounded-full overflow-hidden border border-border/5">
          <div 
            className={`absolute h-full transition-all duration-1000 ease-out ${
              goal.status === 'completed' ? 'bg-gradient-to-r from-status-info to-primary' : status.color
            }`} 
            style={{ width: `${progress}%` }} 
          />
          {goal.status === 'completed' && (
            <div className="absolute inset-0 animate-xp-shimmer opacity-30" />
          )}
        </div>
      </div>

      {showDetails && (
        <div className="flex items-center justify-between text-sm pt-4 border-t border-border/10 relative z-10">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="p-1.5 rounded-lg bg-muted/50">
              <Calendar className="h-3.5 w-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] uppercase font-black tracking-widest opacity-60 leading-none">Vencimento</span>
              <span className="text-xs font-bold text-foreground/80">{goal.dueDate}</span>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onEdit}
            className="h-8 text-[10px] font-black uppercase tracking-widest hover:bg-primary/10 hover:text-primary transition-all border border-transparent hover:border-primary/20 rounded-xl"
          >
            Ajustar Plano
          </Button>
        </div>
      )}
    </Card>
  );
};

interface GoalsDashboardProps {
  goals: GoalData[];
  onCreateGoal?: () => void;
}

export const GoalsDashboard: FC<GoalsDashboardProps> = ({ goals, onCreateGoal }) => {
  const completedCount = goals.filter(g => g.status === 'completed').length;
  const onTrackCount = goals.filter(g => g.status === 'on_track').length;
  const atRiskCount = goals.filter(g => g.status === 'at_risk' || g.status === 'behind').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Minhas Metas</h3>
          <p className="text-sm text-muted-foreground">
            {completedCount} concluídas, {onTrackCount} no caminho, {atRiskCount} em risco
          </p>
        </div>
        <Button onClick={onCreateGoal}>
          <Flag className="h-4 w-4 mr-2" />
          Nova Meta
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {goals.map((goal) => (
          <GoalTracker key={goal.id} goal={goal} />
        ))}
      </div>
    </div>
  );
};

interface MilestoneProps {
  milestones: {
    id: string;
    title: string;
    description: string;
    targetDate: string;
    isCompleted: boolean;
    completedAt?: string;
  }[];
  onComplete?: (id: string) => void;
}

export const MilestoneTracker: FC<MilestoneProps> = ({ milestones, onComplete }) => {
  return (
    <Card className="p-6 glass border-border/40 card-elevated overflow-hidden relative group">
      <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-primary/5 blur-[80px] rounded-full pointer-events-none transition-opacity group-hover:opacity-20" />
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-xl shadow-primary/20 group-hover:rotate-6 transition-all duration-500">
            <Trophy className="h-6 w-6 text-white" />
          </div>
          <div>
            <h4 className="font-display font-black text-xl tracking-tighter uppercase italic gradient-text">Roadmap de Elite</h4>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-black uppercase tracking-[0.15em] mt-1 opacity-70">
              <Target className="h-3 w-3 text-primary" />
              Progressão de Conquistas
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <Badge variant="glass" className="text-[10px] font-black uppercase tracking-widest px-3 py-1 border-primary/20 text-primary mb-1">
            {milestones.filter(m => m.isCompleted).length} / {milestones.length}
          </Badge>
          <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40">Concluídos</span>
        </div>
      </div>

      <div className="space-y-4 relative z-10">
        {milestones.map((milestone, index) => (
          <div 
            key={milestone.id}
            className={`flex items-start gap-5 p-5 rounded-2xl transition-all duration-500 border ${
              milestone.isCompleted 
                ? 'bg-status-success/5 border-status-success/20 shadow-inner' 
                : 'bg-background/20 border-border/10 hover:bg-background/40 hover:border-primary/20'
            } group/milestone relative overflow-hidden`}
          >
            <div className={`absolute inset-0 bg-gradient-to-r from-status-success/5 to-transparent transition-opacity duration-700 ${milestone.isCompleted ? 'opacity-100' : 'opacity-0'}`} />
            
            <button
              onClick={() => !milestone.isCompleted && onComplete?.(milestone.id)}
              className={`mt-0.5 w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all duration-500 relative z-10 ${
                milestone.isCompleted 
                  ? 'bg-status-success border-status-success text-white shadow-lg shadow-status-success/30 rotate-12 scale-110' 
                  : 'border-muted-foreground/30 hover:border-primary hover:scale-110'
              }`}
            >
              {milestone.isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <div className="w-2 h-2 rounded-full bg-muted-foreground/20 group-hover/milestone:bg-primary/40 transition-colors" />}
            </button>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className={`font-display font-bold text-sm tracking-tight ${milestone.isCompleted ? 'text-muted-foreground/70' : 'text-foreground'}`}>
                  {milestone.title}
                </p>
                {milestone.isCompleted && (
                  <Badge className="bg-status-success/10 text-status-success text-[8px] font-black border-none h-4 uppercase">
                    Done
                  </Badge>
                )}
              </div>
              <p className={`text-xs leading-relaxed ${milestone.isCompleted ? 'text-muted-foreground/50' : 'text-muted-foreground'}`}>
                {milestone.description}
              </p>
              
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest">
                  <Clock className={`h-3 w-3 ${milestone.isCompleted ? 'text-muted-foreground/40' : 'text-primary'}`} />
                  <span className={milestone.isCompleted ? 'text-muted-foreground/40' : 'text-muted-foreground'}>
                    {milestone.isCompleted ? `Finalizado: ${milestone.completedAt}` : `Deadline: ${milestone.targetDate}`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {milestones.length === 0 && (
          <div className="text-center py-10 glass rounded-2xl border border-dashed border-border/40">
            <Flag className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/40">Nenhum marco definido</p>
          </div>
        )}
      </div>
    </Card>
  );
};
