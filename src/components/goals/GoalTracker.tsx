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
    on_track: { label: 'No caminho', color: 'bg-success', icon: TrendingUp },
    at_risk: { label: 'Em risco', color: 'bg-warning', icon: AlertCircle },
    behind: { label: 'Atrasado', color: 'bg-destructive', icon: TrendingDown },
    completed: { label: 'Concluído', color: 'bg-info', icon: CheckCircle2 }
  };

  const status = statusConfig[goal.status];
  const StatusIcon = status.icon;

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${status.color}/10`}>
            <Target className={`h-5 w-5 ${status.color.replace('bg-', 'text-')}`} />
          </div>
          <div>
            <h4 className="font-semibold">{goal.title}</h4>
            <p className="text-sm text-muted-foreground">{goal.period}</p>
          </div>
        </div>
        <Badge className={`${status.color} text-primary-foreground`}>
          <StatusIcon className="h-3 w-3 mr-1" />
          {status.label}
        </Badge>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">Progresso</span>
          <span className="font-medium">
            {goal.current.toLocaleString()} / {goal.target.toLocaleString()} {goal.unit}
          </span>
        </div>
        <Progress value={progress} className="h-3" />
      </div>

      {showDetails && (
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Prazo: {goal.dueDate}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onEdit}>
            Editar
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
