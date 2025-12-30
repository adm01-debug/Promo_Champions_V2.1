import { FC } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Circle, 
  AlertCircle,
  Play,
  Pause,
  SkipForward,
  User
} from 'lucide-react';

interface CadenceStep {
  id: string;
  day: number;
  type: 'email' | 'call' | 'linkedin' | 'whatsapp';
  title: string;
  status: 'pending' | 'completed' | 'skipped' | 'failed';
  scheduledAt?: string;
}

interface CadenceTimelineProps {
  steps: CadenceStep[];
  currentStep: number;
  onStepClick?: (step: CadenceStep) => void;
}

export const CadenceTimeline: FC<CadenceTimelineProps> = ({ steps, currentStep, onStepClick }) => {
  const icons = {
    email: Mail,
    call: Phone,
    linkedin: MessageSquare,
    whatsapp: MessageSquare
  };

  const statusColors = {
    pending: 'border-muted-foreground/30',
    completed: 'border-green-500 bg-green-500/10',
    skipped: 'border-yellow-500 bg-yellow-500/10',
    failed: 'border-red-500 bg-red-500/10'
  };

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

      <div className="space-y-4">
        {steps.map((step, index) => {
          const Icon = icons[step.type];
          const isCurrent = index === currentStep;
          
          return (
            <div 
              key={step.id} 
              className={`relative flex items-start gap-4 pl-8 cursor-pointer ${
                isCurrent ? 'opacity-100' : 'opacity-70'
              }`}
              onClick={() => onStepClick?.(step)}
            >
              {/* Step indicator */}
              <div className={`
                absolute left-0 w-8 h-8 rounded-full border-2 flex items-center justify-center bg-background
                ${statusColors[step.status]}
                ${isCurrent ? 'ring-2 ring-primary ring-offset-2' : ''}
              `}>
                {step.status === 'completed' ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : step.status === 'failed' ? (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>

              {/* Content */}
              <Card className={`flex-1 p-3 ${isCurrent ? 'border-primary' : ''}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Dia {step.day}</span>
                      <Badge variant="outline" className="text-xs">
                        {step.type}
                      </Badge>
                    </div>
                    <p className="font-medium">{step.title}</p>
                  </div>
                  {step.scheduledAt && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {step.scheduledAt}
                    </span>
                  )}
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface CadenceCardProps {
  id: string;
  name: string;
  description?: string;
  totalSteps: number;
  activeProspects: number;
  completionRate: number;
  isActive: boolean;
  onEdit?: () => void;
  onToggle?: () => void;
}

export const CadenceCard: FC<CadenceCardProps> = ({
  name,
  description,
  totalSteps,
  activeProspects,
  completionRate,
  isActive,
  onEdit,
  onToggle
}) => {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-semibold">{name}</h4>
            <Badge variant={isActive ? 'default' : 'secondary'}>
              {isActive ? 'Ativa' : 'Pausada'}
            </Badge>
          </div>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={onToggle}>
          {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <p className="text-2xl font-bold">{totalSteps}</p>
          <p className="text-xs text-muted-foreground">Etapas</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold">{activeProspects}</p>
          <p className="text-xs text-muted-foreground">Prospects</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold">{completionRate}%</p>
          <p className="text-xs text-muted-foreground">Conclusão</p>
        </div>
      </div>

      <Progress value={completionRate} className="h-2 mb-4" />

      <Button variant="outline" className="w-full" onClick={onEdit}>
        Editar Cadência
      </Button>
    </Card>
  );
};

interface ProspectCadenceStatusProps {
  prospectName: string;
  cadenceName: string;
  currentStep: number;
  totalSteps: number;
  nextAction: string;
  nextActionDate: string;
  onSkip?: () => void;
  onComplete?: () => void;
}

export const ProspectCadenceStatus: FC<ProspectCadenceStatusProps> = ({
  prospectName,
  cadenceName,
  currentStep,
  totalSteps,
  nextAction,
  nextActionDate,
  onSkip,
  onComplete
}) => {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-full bg-muted">
          <User className="h-4 w-4" />
        </div>
        <div>
          <p className="font-medium">{prospectName}</p>
          <p className="text-xs text-muted-foreground">{cadenceName}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground">Progresso</span>
        <span className="text-sm font-medium">{currentStep}/{totalSteps}</span>
      </div>
      <Progress value={(currentStep / totalSteps) * 100} className="h-2 mb-4" />

      <div className="p-3 bg-muted/50 rounded-lg mb-4">
        <p className="text-xs text-muted-foreground mb-1">Próxima Ação</p>
        <p className="font-medium">{nextAction}</p>
        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
          <Calendar className="h-3 w-3" />
          {nextActionDate}
        </p>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={onSkip}>
          <SkipForward className="h-4 w-4 mr-1" />
          Pular
        </Button>
        <Button size="sm" className="flex-1" onClick={onComplete}>
          <CheckCircle2 className="h-4 w-4 mr-1" />
          Concluir
        </Button>
      </div>
    </Card>
  );
};
