import { FC, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Workflow, 
  Plus, 
  Play, 
  Pause, 
  Settings, 
  Trash2, 
  Copy,
  Zap,
  Clock,
  Mail,
  Bell,
  ArrowRight
} from 'lucide-react';

interface WorkflowStep {
  id: string;
  type: 'trigger' | 'condition' | 'action';
  name: string;
  config: Record<string, unknown>;
}

interface WorkflowData {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  steps: WorkflowStep[];
  lastRun?: string;
  runCount: number;
}

interface WorkflowBuilderProps {
  workflow?: WorkflowData;
  onSave?: (workflow: WorkflowData) => void;
}

export const WorkflowBuilder: FC<WorkflowBuilderProps> = ({ workflow, onSave }) => {
  const [steps, setSteps] = useState<WorkflowStep[]>(workflow?.steps || []);

  const stepTypes = [
    { type: 'trigger', icon: Zap, label: 'Gatilho', color: 'bg-yellow-500' },
    { type: 'condition', icon: Settings, label: 'Condição', color: 'bg-blue-500' },
    { type: 'action', icon: Play, label: 'Ação', color: 'bg-green-500' }
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Workflow className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">{workflow?.name || 'Novo Workflow'}</h3>
            <p className="text-sm text-muted-foreground">
              {workflow?.description || 'Configure as etapas do seu workflow'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={workflow?.isActive} />
          <Button variant="outline" size="sm">
            <Play className="h-4 w-4 mr-2" />
            Testar
          </Button>
          <Button size="sm">Salvar</Button>
        </div>
      </div>

      {/* Workflow steps */}
      <div className="space-y-4">
        {steps.length === 0 ? (
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <Zap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="font-medium mb-2">Comece adicionando um gatilho</p>
            <p className="text-sm text-muted-foreground mb-4">
              O gatilho define quando o workflow será executado
            </p>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Gatilho
            </Button>
          </div>
        ) : (
          steps.map((step, index) => (
            <div key={step.id} className="flex items-center gap-4">
              <WorkflowStepCard step={step} />
              {index < steps.length - 1 && (
                <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              )}
            </div>
          ))
        )}

        {steps.length > 0 && (
          <Button variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Etapa
          </Button>
        )}
      </div>
    </Card>
  );
};

interface WorkflowStepCardProps {
  step: WorkflowStep;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const WorkflowStepCard: FC<WorkflowStepCardProps> = ({ step, onEdit, onDelete }) => {
  const icons = {
    trigger: Zap,
    condition: Settings,
    action: Play
  };
  const colors = {
    trigger: 'bg-yellow-500/10 text-yellow-600',
    condition: 'bg-blue-500/10 text-blue-600',
    action: 'bg-green-500/10 text-green-600'
  };
  const Icon = icons[step.type];

  return (
    <Card className="p-4 flex-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${colors[step.type]}`}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <p className="font-medium">{step.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{step.type}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={onEdit}>
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

interface WorkflowListItemProps {
  workflow: WorkflowData;
  onEdit?: () => void;
  onToggle?: (active: boolean) => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
}

export const WorkflowListItem: FC<WorkflowListItemProps> = ({ 
  workflow, 
  onEdit, 
  onToggle,
  onDuplicate,
  onDelete 
}) => {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Switch 
            checked={workflow.isActive} 
            onCheckedChange={onToggle}
          />
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-medium">{workflow.name}</h4>
              <Badge variant={workflow.isActive ? 'default' : 'secondary'}>
                {workflow.isActive ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {workflow.steps.length} etapas • {workflow.runCount} execuções
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onDuplicate}>
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
