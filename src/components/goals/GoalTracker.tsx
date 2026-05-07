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
    <Card className="p-4">
      <div className="flex items-center gap-3 mb-4">
        <Trophy className="h-5 w-5 text-primary" />
        <h4 className="font-semibold">Marcos</h4>
      </div>

      <div className="space-y-3">
        {milestones.map((milestone, _index) => (
          <div 
            key={milestone.id}
            className={`flex items-start gap-3 p-3 rounded-lg ${
              milestone.isCompleted ? 'bg-success/10' : 'bg-muted/50'
            }`}
          >
            <button
              onClick={() => !milestone.isCompleted && onComplete?.(milestone.id)}
              className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                milestone.isCompleted 
                  ? 'bg-success border-success text-primary-foreground' 
                  : 'border-muted-foreground hover:border-primary'
              }`}
            >
              {milestone.isCompleted && <CheckCircle2 className="h-3 w-3" />}
            </button>
            <div className="flex-1">
              <p className={`font-medium ${milestone.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                {milestone.title}
              </p>
              <p className="text-sm text-muted-foreground">{milestone.description}</p>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {milestone.isCompleted 
                  ? `Concluído em ${milestone.completedAt}` 
                  : `Prazo: ${milestone.targetDate}`
                }
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
