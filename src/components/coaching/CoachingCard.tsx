import { FC } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Lightbulb, 
  Target, 
  TrendingUp, 
  MessageSquare, 
  CheckCircle2,
  XCircle,
  Clock,
  Star 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface CoachingTip {
  id: string;
  type: 'improvement' | 'strength' | 'opportunity';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  metric?: {
    name: string;
    current: number;
    target: number;
    unit?: string;
  };
}

interface CoachingCardProps {
  salesperson: {
    id: string;
    name: string;
    avatar?: string;
  };
  tips: CoachingTip[];
  overallScore?: number;
  onTipClick?: (tip: CoachingTip) => void;
  className?: string;
}

const typeConfig = {
  improvement: { icon: Target, color: 'text-yellow-500', bg: 'bg-yellow-50' },
  strength: { icon: Star, color: 'text-green-500', bg: 'bg-green-50' },
  opportunity: { icon: Lightbulb, color: 'text-blue-500', bg: 'bg-blue-50' },
};

const priorityConfig = {
  low: { label: 'Baixa', variant: 'secondary' as const },
  medium: { label: 'Média', variant: 'outline' as const },
  high: { label: 'Alta', variant: 'destructive' as const },
};

export const CoachingCard: FC<CoachingCardProps> = ({
  salesperson,
  tips,
  overallScore,
  onTipClick,
  className,
}) => {
  const improvements = tips.filter(t => t.type === 'improvement');
  const strengths = tips.filter(t => t.type === 'strength');
  const opportunities = tips.filter(t => t.type === 'opportunity');

  return (
    <Card className={cn('p-4', className)}>
      <div className="flex items-center gap-3 mb-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={salesperson.avatar} alt={salesperson.name} />
          <AvatarFallback>{salesperson.name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-semibold">{salesperson.name}</h3>
          <p className="text-sm text-muted-foreground">Coaching Insights</p>
        </div>
        {overallScore !== undefined && (
          <div className="text-center">
            <p className="text-2xl font-bold">{overallScore}</p>
            <p className="text-xs text-muted-foreground">Score</p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {strengths.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-green-600 mb-2 flex items-center gap-1">
              <Star size={12} />
              Pontos Fortes
            </h4>
            <div className="space-y-2">
              {strengths.map(tip => (
                <TipItem key={tip.id} tip={tip} onClick={() => onTipClick?.(tip)} />
              ))}
            </div>
          </div>
        )}

        {improvements.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-yellow-600 mb-2 flex items-center gap-1">
              <Target size={12} />
              Áreas de Melhoria
            </h4>
            <div className="space-y-2">
              {improvements.map(tip => (
                <TipItem key={tip.id} tip={tip} onClick={() => onTipClick?.(tip)} />
              ))}
            </div>
          </div>
        )}

        {opportunities.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-blue-600 mb-2 flex items-center gap-1">
              <Lightbulb size={12} />
              Oportunidades
            </h4>
            <div className="space-y-2">
              {opportunities.map(tip => (
                <TipItem key={tip.id} tip={tip} onClick={() => onTipClick?.(tip)} />
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

const TipItem: FC<{ tip: CoachingTip; onClick?: () => void }> = ({ tip, onClick }) => {
  const config = typeConfig[tip.type];
  const Icon = config.icon;

  return (
    <motion.div
      whileHover={{ x: 2 }}
      onClick={onClick}
      className={cn(
        'p-3 rounded-lg cursor-pointer transition-colors',
        config.bg,
        'dark:bg-muted'
      )}
    >
      <div className="flex items-start gap-2">
        <Icon size={16} className={config.color} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-medium">{tip.title}</p>
            <Badge variant={priorityConfig[tip.priority].variant} className="text-xs">
              {priorityConfig[tip.priority].label}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{tip.description}</p>
          {tip.metric && (
            <p className="text-xs mt-1 font-medium">
              {tip.metric.name}: {tip.metric.current}{tip.metric.unit} → {tip.metric.target}{tip.metric.unit}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};
