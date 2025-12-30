import { FC } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  Clock, 
  TrendingDown, 
  Target, 
  Lightbulb,
  ArrowRight,
  DollarSign,
  Calendar 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';

interface DealRisk {
  id: string;
  type: 'stagnant' | 'value_drop' | 'no_activity' | 'deadline' | 'competitor';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  recommendation?: string;
  daysInStage?: number;
  lastActivityDate?: Date;
}

interface Deal {
  id: string;
  name: string;
  value: number;
  stage: string;
  daysInStage: number;
  lastActivity?: Date;
  expectedCloseDate?: Date;
  risks: DealRisk[];
}

interface DealRiskIndicatorProps {
  deal: Deal;
  onViewDeal?: () => void;
  onDismissRisk?: (riskId: string) => void;
  className?: string;
}

const riskConfig = {
  stagnant: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-50' },
  value_drop: { icon: TrendingDown, color: 'text-red-500', bg: 'bg-red-50' },
  no_activity: { icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-50' },
  deadline: { icon: Calendar, color: 'text-purple-500', bg: 'bg-purple-50' },
  competitor: { icon: Target, color: 'text-blue-500', bg: 'bg-blue-50' },
};

const severityConfig = {
  low: { label: 'Baixo', variant: 'secondary' as const },
  medium: { label: 'Médio', variant: 'outline' as const },
  high: { label: 'Alto', variant: 'destructive' as const },
};

export const DealRiskIndicator: FC<DealRiskIndicatorProps> = ({
  deal,
  onViewDeal,
  onDismissRisk,
  className,
}) => {
  const highestRisk = deal.risks.reduce((max, risk) => {
    const severityOrder = { low: 0, medium: 1, high: 2 };
    return severityOrder[risk.severity] > severityOrder[max.severity] ? risk : max;
  }, deal.risks[0]);

  if (!highestRisk) return null;

  const config = riskConfig[highestRisk.type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className={cn('p-4 border-l-4', config.bg, className)} style={{ borderLeftColor: config.color.replace('text-', '') }}>
        <div className="flex items-start gap-3">
          <div className={cn('p-2 rounded-lg', config.bg)}>
            <Icon size={20} className={config.color} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold truncate">{deal.name}</h4>
              <Badge variant={severityConfig[highestRisk.severity].variant}>
                {severityConfig[highestRisk.severity].label}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground mb-2">
              {highestRisk.description}
            </p>

            {highestRisk.recommendation && (
              <div className="flex items-start gap-2 p-2 rounded bg-background/80">
                <Lightbulb size={14} className="text-primary mt-0.5" />
                <p className="text-xs">{highestRisk.recommendation}</p>
              </div>
            )}

            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <DollarSign size={12} />
                R$ {deal.value.toLocaleString()}
              </span>
              <span>{deal.stage}</span>
              <span>{deal.daysInStage} dias no estágio</span>
            </div>
          </div>

          <Button variant="ghost" size="sm" onClick={onViewDeal}>
            Ver <ArrowRight size={14} className="ml-1" />
          </Button>
        </div>

        {deal.risks.length > 1 && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-muted-foreground">
              +{deal.risks.length - 1} outros alertas
            </p>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

interface RiskSummaryProps {
  deals: Deal[];
  className?: string;
}

export const RiskSummary: FC<RiskSummaryProps> = ({ deals, className }) => {
  const totalRisks = deals.reduce((sum, d) => sum + d.risks.length, 0);
  const highRisks = deals.filter(d => d.risks.some(r => r.severity === 'high')).length;
  const mediumRisks = deals.filter(d => d.risks.some(r => r.severity === 'medium') && !d.risks.some(r => r.severity === 'high')).length;
  const totalValue = deals.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card className={cn('p-4', className)}>
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <AlertTriangle size={18} className="text-yellow-500" />
        Resumo de Riscos
      </h3>
      <div className="grid grid-cols-4 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold">{deals.length}</p>
          <p className="text-xs text-muted-foreground">Negócios em risco</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-red-500">{highRisks}</p>
          <p className="text-xs text-muted-foreground">Risco alto</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-yellow-500">{mediumRisks}</p>
          <p className="text-xs text-muted-foreground">Risco médio</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold">R$ {(totalValue / 1000).toFixed(0)}k</p>
          <p className="text-xs text-muted-foreground">Valor em risco</p>
        </div>
      </div>
    </Card>
  );
};
