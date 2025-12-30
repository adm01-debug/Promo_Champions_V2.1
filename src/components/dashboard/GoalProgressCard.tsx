import { FC } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, TrendingUp, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface Goal {
  id: string;
  title: string;
  current: number;
  target: number;
  unit?: string;
  deadline?: Date;
  status: 'on-track' | 'at-risk' | 'behind' | 'completed';
}

interface GoalProgressCardProps {
  goal: Goal;
  showDetails?: boolean;
  onClick?: () => void;
  className?: string;
}

const statusConfig = {
  'on-track': {
    icon: TrendingUp,
    label: 'No caminho',
    color: 'text-green-600',
    bg: 'bg-green-100',
  },
  'at-risk': {
    icon: AlertTriangle,
    label: 'Em risco',
    color: 'text-yellow-600',
    bg: 'bg-yellow-100',
  },
  'behind': {
    icon: Clock,
    label: 'Atrasado',
    color: 'text-red-600',
    bg: 'bg-red-100',
  },
  'completed': {
    icon: CheckCircle2,
    label: 'Concluído',
    color: 'text-green-600',
    bg: 'bg-green-100',
  },
};

export const GoalProgressCard: FC<GoalProgressCardProps> = ({
  goal,
  showDetails = true,
  onClick,
  className,
}) => {
  const percentage = Math.min((goal.current / goal.target) * 100, 100);
  const config = statusConfig[goal.status];
  const Icon = config.icon;

  return (
    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
      <Card 
        className={cn('p-4 cursor-pointer transition-colors hover:border-primary/50', className)}
        onClick={onClick}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target size={18} className="text-primary" />
            <h4 className="font-medium">{goal.title}</h4>
          </div>
          <Badge className={cn('gap-1', config.bg, config.color)} variant="outline">
            <Icon size={12} />
            {config.label}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-medium">
              {goal.current.toLocaleString()} / {goal.target.toLocaleString()} {goal.unit}
            </span>
          </div>
          <Progress value={percentage} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{percentage.toFixed(0)}% concluído</span>
            {goal.deadline && (
              <span>Prazo: {goal.deadline.toLocaleDateString()}</span>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

interface GoalsSummaryProps {
  goals: Goal[];
  className?: string;
}

export const GoalsSummary: FC<GoalsSummaryProps> = ({ goals, className }) => {
  const completed = goals.filter(g => g.status === 'completed').length;
  const onTrack = goals.filter(g => g.status === 'on-track').length;
  const atRisk = goals.filter(g => g.status === 'at-risk').length;
  const behind = goals.filter(g => g.status === 'behind').length;

  return (
    <div className={cn('grid grid-cols-4 gap-2', className)}>
      <div className="text-center p-2 rounded-lg bg-green-50 dark:bg-green-950/30">
        <p className="text-lg font-bold text-green-600">{completed}</p>
        <p className="text-xs text-muted-foreground">Concluídas</p>
      </div>
      <div className="text-center p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30">
        <p className="text-lg font-bold text-blue-600">{onTrack}</p>
        <p className="text-xs text-muted-foreground">No caminho</p>
      </div>
      <div className="text-center p-2 rounded-lg bg-yellow-50 dark:bg-yellow-950/30">
        <p className="text-lg font-bold text-yellow-600">{atRisk}</p>
        <p className="text-xs text-muted-foreground">Em risco</p>
      </div>
      <div className="text-center p-2 rounded-lg bg-red-50 dark:bg-red-950/30">
        <p className="text-lg font-bold text-red-600">{behind}</p>
        <p className="text-xs text-muted-foreground">Atrasadas</p>
      </div>
    </div>
  );
};
