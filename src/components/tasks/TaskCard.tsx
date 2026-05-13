import { memo } from "react";
import { TaskRecord, useCompleteTask } from '@/hooks/useTasks';
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
  MoreHorizontal,
  Linkedin,
  MessageCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

const priorityConfig = {
  urgent: { label: 'Urgente', className: 'bg-destructive/20 text-destructive border-destructive/30' },
  high: { label: 'Alta', className: 'bg-status-error/20 text-status-error border-status-error/30' },
  medium: { label: 'Média', className: 'bg-status-warning/20 text-status-warning border-status-warning/30' },
  low: { label: 'Baixa', className: 'bg-status-success/20 text-status-success border-status-success/30' },
};

const typeConfig = {
  call: { label: 'Ligação', icon: Phone, color: 'text-status-info', bgClass: 'bg-status-info/15' },
  meeting: { label: 'Reunião', icon: Users, color: 'text-accent', bgClass: 'bg-accent/15' },
  follow_up: { label: 'Follow-up', icon: Clock, color: 'text-streak', bgClass: 'bg-streak/15' },
  email: { label: 'E-mail', icon: Mail, color: 'text-secondary', bgClass: 'bg-secondary/15' },
  proposal: { label: 'Proposta', icon: FileText, color: 'text-primary', bgClass: 'bg-primary/15' },
  discount: { label: 'Desconto', icon: Check, color: 'text-status-success', bgClass: 'bg-status-success/15' },
  linkedin: { label: 'LinkedIn', icon: Linkedin, color: 'text-status-info', bgClass: 'bg-status-info/15' },
  whatsapp: { label: 'WhatsApp', icon: MessageCircle, color: 'text-status-success', bgClass: 'bg-status-success/15' },
  other: { label: 'Outro', icon: MoreHorizontal, color: 'text-muted-foreground', bgClass: 'bg-muted/40' },
};

interface TaskCardProps {
  task: TaskRecord;
}

const TaskCardInner = function TaskCard({ task }: TaskCardProps) {
  const completeTask = useCompleteTask();
  const priority = priorityConfig[task.priority] || priorityConfig.medium;
  const type = typeConfig[task.task_type] || typeConfig.other;
  const TypeIcon = type.icon;

  const handleComplete = () => {
    completeTask.mutate(task.id);
  };

  return (
    <Card variant="elevated" className="p-4 glass border border-border/40 dark:border-glow hover-lift group cursor-pointer card-elevated transition-all duration-300 animate-fade-in">
      <div className="flex items-start gap-3">
        <Button
          variant="outline"
          size="icon" aria-label="Confirmar"
          className="h-9 w-9 rounded-full shrink-0 border-2 border-border/50 hover:bg-status-success hover:border-status-success hover:text-primary-foreground hover:scale-110 hover:shadow-lg hover:shadow-status-success/30 transition-all duration-200 shadow-sm"
          onClick={handleComplete}
          disabled={completeTask.isPending}
        >
          <Check className={`h-4 w-4 opacity-0 group-hover:opacity-100 transition-all duration-200 ${completeTask.isPending ? 'animate-spin opacity-100' : ''}`} />
        </Button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <div className={cn("p-1.5 rounded-md transition-all duration-200 group-hover:scale-110", type.bgClass)}>
              <TypeIcon className={cn("h-3.5 w-3.5 transition-colors", type.color)} />
            </div>
            <span className={cn("text-xs font-medium transition-colors", type.color)}>{type.label}</span>
            <Badge variant="outline" className={cn("text-[10px] px-1.5 shadow-sm transition-all duration-200 group-hover:scale-105", priority.className)}>
              {priority.label}
            </Badge>
          </div>

          <h4 className="font-display font-medium text-foreground truncate group-hover:text-primary transition-colors duration-200">{task.title}</h4>
          
          {task.description && (
            <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2 bg-muted/30 rounded-md px-2 py-1 border border-border/20">
              {task.description}
            </p>
          )}

          {task.sale && (
            <div className="mt-2.5 text-xs text-muted-foreground flex items-center gap-1.5">
              <span className="font-medium gradient-text">{task.sale.client_name}</span>
              {task.sale.product_name && (
                <>
                  <span className="text-border">•</span>
                  <span className="text-muted-foreground/80">{task.sale.product_name}</span>
                </>
              )}
            </div>
          )}

          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border/30">
            {task.due_time && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground px-2.5 py-1 rounded-md bg-muted/40 border border-border/30 shadow-inner group-hover:bg-primary/10 group-hover:border-primary/30 transition-all duration-200">
                <Clock className="h-3 w-3 text-primary" />
                <span className="font-medium">{task.due_time.slice(0, 5)}</span>
              </div>
            )}

            {task.salesperson && (
              <div className="flex items-center gap-2 group/avatar">
                <Avatar className="h-6 w-6 border-2 border-background shadow-sm transition-all duration-200 group-hover/avatar:scale-110 group-hover/avatar:shadow-md">
                  <AvatarImage src={task.salesperson.avatar_url || undefined} />
                  <AvatarFallback className="text-[10px] font-display bg-gradient-to-br from-primary to-accent text-primary-foreground">
                    {task.salesperson.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground font-medium group-hover/avatar:text-foreground transition-colors">
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
export const TaskCard = memo(TaskCardInner);
