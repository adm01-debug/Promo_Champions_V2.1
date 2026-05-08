import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TaskRecord, TaskPriority } from '@/hooks/useTasks';
import { DraggableTaskCard } from './DraggableTaskCard';
import { cn } from '@/lib/utils';
import { Flame, ClipboardList, CheckCircle, type LucideIcon } from 'lucide-react';

interface PriorityColumnProps {
  priority: TaskPriority;
  tasks: TaskRecord[];
  activeId: string | null;
}

const priorityConfig: Record<string, { 
  label: string; 
  icon: LucideIcon; 
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  urgent: { 
    label: 'Urgente', 
    icon: Flame, 
    color: 'text-destructive',
    bgColor: 'bg-destructive/5',
    borderColor: 'border-destructive/20'
  },
  high: { 
    label: 'Prioridade Alta', 
    icon: Flame, 
    color: 'text-status-error',
    bgColor: 'bg-status-error/5',
    borderColor: 'border-status-error/20'
  },
  medium: { 
    label: 'Prioridade Média', 
    icon: ClipboardList, 
    color: 'text-status-warning',
    bgColor: 'bg-status-warning/5',
    borderColor: 'border-status-warning/20'
  },
  low: { 
    label: 'Prioridade Baixa', 
    icon: CheckCircle, 
    color: 'text-status-success',
    bgColor: 'bg-status-success/5',
    borderColor: 'border-status-success/20'
  },
};

export function PriorityColumn({ priority, tasks, activeId }: PriorityColumnProps) {
  const config = priorityConfig[priority];
  const Icon = config.icon;

  const { setNodeRef, isOver } = useDroppable({
    id: priority,
  });

  const taskIds = tasks.map(task => task.id);

  return (
    <div 
      ref={setNodeRef}
      className={cn(
        "flex flex-col rounded-xl border p-4 min-h-[300px] transition-all",
        config.bgColor,
        config.borderColor,
        isOver && "ring-2 ring-primary/50 bg-primary/5"
      )}
    >
      <div className="flex items-center gap-2 mb-4">
        <Icon className={cn("h-5 w-5", config.color)} />
        <h3 className={cn("font-semibold", config.color)}>{config.label}</h3>
        <span className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
          {tasks.length}
        </span>
      </div>

      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="flex-1 space-y-2">
          {tasks.map((task) => (
            <DraggableTaskCard 
              key={task.id} 
              task={task}
              isDragging={activeId === task.id}
            />
          ))}
          {tasks.length === 0 && (
            <div className="flex items-center justify-center h-24 border-2 border-dashed border-border/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Arraste tarefas aqui
              </p>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
