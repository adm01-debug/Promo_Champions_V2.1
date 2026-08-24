import React from "react";
import { FC, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ListTodo, 
  Plus, 
  Calendar, 
  Clock, 
  User,
  Trash2,
  Edit
} from 'lucide-react';

interface TaskItem {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  dueTime?: string;
  priority: 'low' | 'medium' | 'high';
  assignee?: { id: string; name: string };
  isCompleted: boolean;
  tags?: string[];
}

interface TaskListAdvancedProps {
  tasks: TaskItem[];
  onToggle?: (taskId: string) => void;
  onEdit?: (task: TaskItem) => void;
  onDelete?: (taskId: string) => void;
  onAddTask?: () => void;
}

export const TaskListAdvanced: FC<TaskListAdvancedProps> = ({
  tasks,
  onToggle,
  onEdit,
  onDelete,
  onAddTask
}) => {
  const priorityConfig = {
    low: { color: 'text-success', bg: 'bg-success/10', label: 'Baixa' },
    medium: { color: 'text-warning', bg: 'bg-warning/10', label: 'Média' },
    high: { color: 'text-destructive', bg: 'bg-destructive/10', label: 'Alta' }
  };

  const pendingTasks = tasks.filter(t => !t.isCompleted);
  const completedTasks = tasks.filter(t => t.isCompleted);

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <ListTodo className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Tarefas</h3>
            <p className="text-sm text-muted-foreground">
              {pendingTasks.length} pendentes, {completedTasks.length} concluídas
            </p>
          </div>
        </div>
        <Button size="sm" onClick={onAddTask}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Tarefa
        </Button>
      </div>

      <div className="space-y-2">
        {pendingTasks.map((task) => {
          const priority = priorityConfig[task.priority];
          
          return (
            <div 
              key={task.id}
              className="flex items-start gap-3 p-3 border rounded-lg hover:border-primary/50 transition-colors group"
            >
              <Checkbox
                checked={task.isCompleted}
                onCheckedChange={() => onToggle?.(task.id)}
                className="mt-0.5"
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{task.title}</span>
                  <Badge variant="outline" className={`text-xs ${priority.color}`}>
                    {priority.label}
                  </Badge>
                </div>
                
                {task.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                    {task.description}
                  </p>
                )}
                
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  {task.dueDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {task.dueDate}
                    </span>
                  )}
                  {task.dueTime && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {task.dueTime}
                    </span>
                  )}
                  {task.assignee && (
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {task.assignee.name}
                    </span>
                  )}
                </div>

                {task.tags && task.tags.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {task.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                <Button variant="ghost" size="icon" aria-label="Editar tarefa" className="h-7 w-7" onClick={() => onEdit?.(task)}>
                  <Edit className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="icon" aria-label="Excluir tarefa" className="h-7 w-7" onClick={() => onDelete?.(task.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          );
        })}

        {completedTasks.length > 0 && (
          <>
            <div className="py-2 text-sm text-muted-foreground">
              Concluídas ({completedTasks.length})
            </div>
            {completedTasks.map((task) => (
              <div 
                key={task.id}
                className="flex items-center gap-3 p-3 border rounded-lg opacity-60"
              >
                <Checkbox
                  checked={task.isCompleted}
                  onCheckedChange={() => onToggle?.(task.id)}
                />
                <span className="line-through text-muted-foreground">{task.title}</span>
              </div>
            ))}
          </>
        )}
      </div>
    </Card>
  );
};

interface QuickTaskInputProps {
  onAdd?: (title: string) => void;
  placeholder?: string;
}

export const QuickTaskInput: FC<QuickTaskInputProps> = ({ 
  onAdd, 
  placeholder = "Adicionar tarefa rápida..." 
}) => {
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    if (!value.trim()) return;
    onAdd?.(value);
    setValue('');
  };

  return (
    <div className="flex gap-2">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
      />
      <Button onClick={handleSubmit}>
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
};

interface TaskKanbanColumnProps {
  title: string;
  count: number;
  tasks: TaskItem[];
  onTaskClick?: (task: TaskItem) => void;
}

export const TaskKanbanColumn: FC<TaskKanbanColumnProps> = ({
  title,
  count,
  tasks,
  onTaskClick
}) => {
  return (
    <div className="flex-1 min-w-[280px]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h4 className="font-medium">{title}</h4>
          <Badge variant="secondary">{count}</Badge>
        </div>
        <Button variant="ghost" size="icon" aria-label="Mais opções" className="h-7 w-7">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-2">
        {tasks.map((task) => (
          <Card 
            key={task.id}
            className="p-3 cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => onTaskClick?.(task)}
          >
            <p className="font-medium text-sm">{task.title}</p>
            {task.dueDate && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {task.dueDate}
              </p>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
