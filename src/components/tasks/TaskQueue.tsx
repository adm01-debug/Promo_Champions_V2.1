import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useTodayTasks, TaskRecord, TaskPriority, useUpdateTask } from '@/hooks/useTasks';
import { useSalespeople } from '@/hooks/useSalespeople';
import { PriorityColumn } from './PriorityColumn';
import { DraggableTaskCard } from './DraggableTaskCard';
import { CreateTaskDialog } from './CreateTaskDialog';
import { RescheduleDialog } from './RescheduleDialog';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ClipboardList, Flame, CheckCircle, Calendar, Columns3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PRIORITIES: TaskPriority[] = ['high', 'medium', 'low'];

export function TaskQueue() {
  const [selectedSalesperson, setSelectedSalesperson] = useState<string>('all');
  const [activeTask, setActiveTask] = useState<TaskRecord | null>(null);
  const [rescheduleTask, setRescheduleTask] = useState<TaskRecord | null>(null);
  const [viewMode, setViewMode] = useState<'columns' | 'list'>('columns');

  const { data: salespeople, isLoading: loadingSalespeople } = useSalespeople();
  const { data: tasks, isLoading: loadingTasks } = useTodayTasks(
    selectedSalesperson === 'all' ? undefined : selectedSalesperson
  );
  const updateTask = useUpdateTask();
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Group tasks by priority
  const groupedTasks = tasks?.reduce((acc, task) => {
    acc[task.priority] = acc[task.priority] || [];
    acc[task.priority].push(task);
    return acc;
  }, {} as Record<TaskPriority, TaskRecord[]>) || {} as Record<TaskPriority, TaskRecord[]>;

  const highPriorityTasks = groupedTasks.high || [];
  const mediumPriorityTasks = groupedTasks.medium || [];
  const lowPriorityTasks = groupedTasks.low || [];
  const totalTasks = tasks?.length || 0;

  const findTaskById = (id: string): TaskRecord | undefined => {
    return tasks?.find(task => task.id === id);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = findTaskById(event.active.id as string);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragOver = (_event: DragOverEvent) => {
    // Handle drag over logic if needed
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Check if dropped on a priority column
    if (PRIORITIES.includes(overId as TaskPriority)) {
      const task = findTaskById(activeId);
      if (task && task.priority !== overId) {
        updateTask.mutate(
          { id: activeId, priority: overId as TaskPriority },
          {
            onSuccess: () => {
              toast({
                title: 'Prioridade atualizada!',
                description: `Tarefa movida para prioridade ${getPriorityLabel(overId as TaskPriority)}`,
              });
            },
          }
        );
      }
    }
  };

  const getPriorityLabel = (priority: TaskPriority): string => {
    const labels = { high: 'alta', medium: 'média', low: 'baixa' };
    return labels[priority];
  };

  if (loadingTasks || loadingSalespeople) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            <Skeleton className="h-10 w-52 rounded-lg animate-shimmer" />
            <Skeleton className="h-10 w-28 rounded-lg animate-shimmer" style={{ animationDelay: '50ms' }} />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32 rounded-lg animate-shimmer" style={{ animationDelay: '100ms' }} />
            <Skeleton className="h-10 w-32 rounded-lg animate-shimmer" style={{ animationDelay: '150ms' }} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton 
              key={i} 
              className="h-24 w-full rounded-xl animate-shimmer" 
              style={{ animationDelay: `${i * 75}ms` }}
            />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton 
              key={i} 
              className="h-[400px] w-full rounded-xl animate-shimmer" 
              style={{ animationDelay: `${200 + i * 75}ms` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 rounded-xl glass border border-border/40 dark:border-glow card-elevated">
        <div className="flex items-center gap-4">
          <Select value={selectedSalesperson} onValueChange={setSelectedSalesperson}>
            <SelectTrigger className="w-[220px] border-border/50 bg-background/50 hover:border-primary/50 transition-colors">
              <SelectValue placeholder="Todos os vendedores" />
            </SelectTrigger>
            <SelectContent className="bg-popover/95 backdrop-blur-md border-border/50">
              <SelectItem value="all">Todos os Vendedores</SelectItem>
              {salespeople?.map((sp) => (
                <SelectItem key={sp.id} value={sp.id}>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-5 w-5 border border-background">
                      <AvatarImage src={sp.avatar_url || undefined} />
                      <AvatarFallback className="text-[9px] bg-gradient-to-br from-primary to-accent text-white">
                        {sp.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {sp.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'columns' ? 'list' : 'columns')}
            className="border-border/50 hover:border-primary/50 hover:bg-primary/10 hover:scale-105 transition-all duration-200"
          >
            <Columns3 className="h-4 w-4 mr-2" />
            {viewMode === 'columns' ? 'Lista' : 'Colunas'}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className="border-border/50 hover:border-primary/50 hover:bg-primary/10 hover:scale-105 transition-all duration-200"
            onClick={() => {
              if (tasks && tasks.length > 0) {
                setRescheduleTask(tasks[0]);
              }
            }}
            disabled={!tasks || tasks.length === 0}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Reagendar
          </Button>
          <CreateTaskDialog />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 glass border border-status-error/30 hover-lift cursor-pointer hover-glow-error transition-all duration-300 animate-fade-in group" style={{ animationDelay: '0ms' }}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-status-error/30 to-status-error/10 shadow-md transition-all duration-200 group-hover:scale-110 group-hover:shadow-lg">
              <Flame className="h-5 w-5 text-status-error group-hover:animate-pulse" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-status-error">{highPriorityTasks.length}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Urgentes</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 glass border border-status-warning/30 hover-lift cursor-pointer hover-glow transition-all duration-300 animate-fade-in group" style={{ animationDelay: '75ms' }}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-status-warning/30 to-status-warning/10 shadow-md transition-all duration-200 group-hover:scale-110 group-hover:shadow-lg">
              <ClipboardList className="h-5 w-5 text-status-warning" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-status-warning">{mediumPriorityTasks.length}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Média</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 glass border border-status-success/30 hover-lift cursor-pointer hover-glow-success transition-all duration-300 animate-fade-in group" style={{ animationDelay: '150ms' }}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-status-success/30 to-status-success/10 shadow-md transition-all duration-200 group-hover:scale-110 group-hover:shadow-lg">
              <CheckCircle className="h-5 w-5 text-status-success" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-status-success">{lowPriorityTasks.length}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Baixa</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Task Board */}
      {totalTasks === 0 ? (
        <Card className="p-12 text-center glass border border-border/40 dark:border-glow card-elevated animate-fade-in">
          <div className="p-4 rounded-full bg-gradient-to-br from-status-success/30 to-status-success/10 w-fit mx-auto mb-4 shadow-lg shadow-status-success/20">
            <CheckCircle className="h-12 w-12 text-status-success animate-pulse" />
          </div>
          <h3 className="text-lg font-display font-semibold gradient-text">Nenhuma tarefa para hoje!</h3>
          <p className="text-muted-foreground mt-2">
            Todas as tarefas foram concluídas ou não há pendências.
          </p>
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className={viewMode === 'columns' 
            ? "grid grid-cols-1 md:grid-cols-3 gap-4" 
            : "space-y-4"
          }>
            {viewMode === 'columns' ? (
              PRIORITIES.map((priority) => (
                <PriorityColumn
                  key={priority}
                  priority={priority}
                  tasks={groupedTasks[priority] || []}
                  activeId={activeTask?.id || null}
                />
              ))
            ) : (
              <>
                {highPriorityTasks.length > 0 && (
                  <PriorityColumn priority="high" tasks={highPriorityTasks} activeId={activeTask?.id || null} />
                )}
                {mediumPriorityTasks.length > 0 && (
                  <PriorityColumn priority="medium" tasks={mediumPriorityTasks} activeId={activeTask?.id || null} />
                )}
                {lowPriorityTasks.length > 0 && (
                  <PriorityColumn priority="low" tasks={lowPriorityTasks} activeId={activeTask?.id || null} />
                )}
              </>
            )}
          </div>

          <DragOverlay>
            {activeTask ? (
              <div className="opacity-90 rotate-2 scale-105 shadow-2xl shadow-primary/20">
                <DraggableTaskCard task={activeTask} isDragging />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Reschedule Dialog */}
      <RescheduleDialog
        task={rescheduleTask}
        onClose={() => setRescheduleTask(null)}
        allTasks={tasks || []}
      />
    </div>
  );
}
