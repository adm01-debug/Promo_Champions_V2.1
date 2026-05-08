import { memo } from "react";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TaskRecord, useCompleteTask } from '@/hooks/useTasks';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  Phone, 
  Users, 
  Mail, 
  FileText, 
  Clock,
  MoreHorizontal,
  GripVertical
} from 'lucide-react';
import { cn } from '@/lib/utils';

const priorityConfig = {
  urgent: { label: 'Urgente', className: 'bg-destructive/20 text-destructive border-destructive/30' },
  high: { label: 'Alta', className: 'bg-status-error/20 text-status-error border-status-error/30' },
  medium: { label: 'Média', className: 'bg-status-warning/20 text-status-warning border-status-warning/30' },
  low: { label: 'Baixa', className: 'bg-status-success/20 text-status-success border-status-success/30' },
};

const typeConfig = {
  call: { label: 'Ligação', icon: Phone, color: 'text-status-info' },
  meeting: { label: 'Reunião', icon: Users, color: 'text-status-purple' },
  follow_up: { label: 'Follow-up', icon: Clock, color: 'text-status-warning' },
  email: { label: 'E-mail', icon: Mail, color: 'text-primary' },
  proposal: { label: 'Proposta', icon: FileText, color: 'text-accent' },
  discount: { label: 'Desconto', icon: Check, color: 'text-status-success' },
  other: { label: 'Outro', icon: MoreHorizontal, color: 'text-muted-foreground' },
};

interface DraggableTaskCardProps {
  task: TaskRecord;
  isDragging?: boolean;
}

const DraggableTaskCardInner = function DraggableTaskCard({ task, isDragging }: DraggableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id });

  const completeTask = useCompleteTask();
  const priority = priorityConfig[task.priority] || priorityConfig.medium;
  const type = typeConfig[task.task_type] || typeConfig.other;
  const TypeIcon = type.icon;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    completeTask.mutate(task.id);
  };

  return (
    <Card 
      ref={setNodeRef}
      style={style}
      className={cn(
        "p-4 bg-card/50 border-border/50 hover-lift group cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50 shadow-lg ring-2 ring-primary/50"
      )}
    >
      <div className="flex items-start gap-3">
        <div 
          className="flex items-center gap-2"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground/50 hover:text-muted-foreground" />
          <Button
            variant="outline"
            size="icon" aria-label="Arrastar"
            className="h-8 w-8 rounded-full shrink-0 border-2 hover:bg-primary hover:border-primary"
            onClick={handleComplete}
            disabled={completeTask.isPending}
          >
            <Check className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Button>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <TypeIcon className={cn("h-4 w-4", type.color)} />
            <span className={cn("text-xs", type.color)}>{type.label}</span>
            <Badge variant="outline" className={cn("text-xs", priority.className)}>
              {priority.label}
            </Badge>
          </div>

          <h4 className="font-medium text-foreground truncate">{task.title}</h4>
          
          {task.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="flex items-center justify-between mt-3">
            {task.due_time && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {task.due_time.slice(0, 5)}
              </div>
            )}

            {task.due_date && (
              <span className="text-xs text-muted-foreground">
                {new Date(task.due_date).toLocaleDateString('pt-BR')}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
export const DraggableTaskCard = memo(DraggableTaskCardInner);
