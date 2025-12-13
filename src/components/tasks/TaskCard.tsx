import { Task, useCompleteTask } from '@/hooks/useTasks';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  Phone, 
  Users, 
  Mail, 
  FileText, 
  Clock,
  MoreHorizontal 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const priorityConfig = {
  high: { label: 'Alta', className: 'bg-status-error/20 text-status-error border-status-error/30' },
  medium: { label: 'Média', className: 'bg-status-warning/20 text-status-warning border-status-warning/30' },
  low: { label: 'Baixa', className: 'bg-status-success/20 text-status-success border-status-success/30' },
};

const typeConfig = {
  call: { label: 'Ligação', icon: Phone, color: 'text-status-info' },
  meeting: { label: 'Reunião', icon: Users, color: 'text-accent' },
  follow_up: { label: 'Follow-up', icon: Clock, color: 'text-streak' },
  email: { label: 'E-mail', icon: Mail, color: 'text-secondary' },
  proposal: { label: 'Proposta', icon: FileText, color: 'text-primary' },
  other: { label: 'Outro', icon: MoreHorizontal, color: 'text-muted-foreground' },
};

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const completeTask = useCompleteTask();
  const priority = priorityConfig[task.priority];
  const type = typeConfig[task.task_type];
  const TypeIcon = type.icon;

  const handleComplete = () => {
    completeTask.mutate(task.id);
  };

  return (
    <Card className="p-4 bg-card/50 border-border/50 hover:border-primary/30 transition-all group">
      <div className="flex items-start gap-3">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full shrink-0 border-2 hover:bg-primary hover:border-primary"
          onClick={handleComplete}
          disabled={completeTask.isPending}
        >
          <Check className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Button>

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

          {task.sale && (
            <div className="mt-2 text-xs text-muted-foreground">
              <span className="text-primary">{task.sale.client_name}</span>
              <span className="mx-1">•</span>
              <span>{task.sale.product_name}</span>
            </div>
          )}

          <div className="flex items-center justify-between mt-3">
            {task.due_time && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {task.due_time.slice(0, 5)}
              </div>
            )}

            {task.salesperson && (
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={task.salesperson.avatar_url || undefined} />
                  <AvatarFallback className="text-xs bg-primary/20">
                    {task.salesperson.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">
                  {task.salesperson.name}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
