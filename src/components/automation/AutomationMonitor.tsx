import { FC } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Play, 
  Pause,
  RefreshCw,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

interface AutomationExecution {
  id: string;
  automationName: string;
  trigger: string;
  status: 'running' | 'completed' | 'failed' | 'paused';
  startedAt: string;
  completedAt?: string;
  stepsCompleted: number;
  totalSteps: number;
  error?: string;
}

interface AutomationMonitorProps {
  executions: AutomationExecution[];
  onRetry?: (id: string) => void;
  onCancel?: (id: string) => void;
  onViewDetails?: (id: string) => void;
}

export const AutomationMonitor: FC<AutomationMonitorProps> = ({
  executions,
  onRetry,
  onCancel,
  onViewDetails
}) => {
  const statusConfig = {
    running: { icon: Loader2, color: 'text-blue-500', label: 'Executando', animate: true },
    completed: { icon: CheckCircle2, color: 'text-green-500', label: 'Concluído', animate: false },
    failed: { icon: XCircle, color: 'text-red-500', label: 'Falhou', animate: false },
    paused: { icon: Pause, color: 'text-yellow-500', label: 'Pausado', animate: false }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <Zap className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">Monitor de Automações</h3>
          <p className="text-sm text-muted-foreground">Acompanhe execuções em tempo real</p>
        </div>
      </div>

      <div className="space-y-3">
        {executions.map((execution) => {
          const status = statusConfig[execution.status];
          const StatusIcon = status.icon;
          
          return (
            <div 
              key={execution.id}
              className="p-4 border rounded-lg hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => onViewDetails?.(execution.id)}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <StatusIcon className={`h-4 w-4 ${status.color} ${status.animate ? 'animate-spin' : ''}`} />
                    <span className="font-medium">{execution.automationName}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Gatilho: {execution.trigger}
                  </p>
                </div>
                <Badge variant={execution.status === 'failed' ? 'destructive' : 'secondary'}>
                  {status.label}
                </Badge>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4 text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {execution.startedAt}
                  </span>
                  <span>
                    {execution.stepsCompleted}/{execution.totalSteps} passos
                  </span>
                </div>
                
                {execution.status === 'failed' && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); onRetry?.(execution.id); }}
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Tentar Novamente
                  </Button>
                )}
                {execution.status === 'running' && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); onCancel?.(execution.id); }}
                  >
                    <XCircle className="h-3 w-3 mr-1" />
                    Cancelar
                  </Button>
                )}
              </div>

              {execution.error && (
                <div className="mt-2 p-2 bg-red-500/10 rounded text-sm text-red-500 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  {execution.error}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};

interface AutomationStatsProps {
  stats: {
    total: number;
    active: number;
    executionsToday: number;
    successRate: number;
    avgDuration: string;
  };
}

export const AutomationStats: FC<AutomationStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {[
        { label: 'Total', value: stats.total, icon: Zap },
        { label: 'Ativas', value: stats.active, icon: Play },
        { label: 'Execuções Hoje', value: stats.executionsToday, icon: Clock },
        { label: 'Taxa de Sucesso', value: `${stats.successRate}%`, icon: CheckCircle2 },
        { label: 'Duração Média', value: stats.avgDuration, icon: Clock }
      ].map((stat) => (
        <Card key={stat.label} className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <stat.icon className="h-4 w-4" />
            <span className="text-xs">{stat.label}</span>
          </div>
          <p className="text-2xl font-bold">{stat.value}</p>
        </Card>
      ))}
    </div>
  );
};

interface TriggerConfigProps {
  triggers: {
    id: string;
    type: string;
    name: string;
    description: string;
    icon: string;
  }[];
  selectedTrigger?: string;
  onSelect?: (triggerId: string) => void;
}

export const TriggerConfig: FC<TriggerConfigProps> = ({
  triggers,
  selectedTrigger,
  onSelect
}) => {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {triggers.map((trigger) => (
        <Card 
          key={trigger.id}
          className={`p-4 cursor-pointer transition-colors ${
            selectedTrigger === trigger.id 
              ? 'border-primary bg-primary/5' 
              : 'hover:border-primary/50'
          }`}
          onClick={() => onSelect?.(trigger.id)}
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h4 className="font-medium">{trigger.name}</h4>
              <p className="text-sm text-muted-foreground">{trigger.description}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
