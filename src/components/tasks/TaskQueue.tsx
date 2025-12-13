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
import { useTodayTasks, Task, TaskPriority, useUpdateTask } from '@/hooks/useTasks';
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
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [rescheduleTask, setRescheduleTask] = useState<Task | null>(null);
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
  }, {} as Record<TaskPriority, Task[]>) || {} as Record<TaskPriority, Task[]>;

  const highPriorityTasks = groupedTasks.high || [];
  const mediumPriorityTasks = groupedTasks.medium || [];
  const lowPriorityTasks = groupedTasks.low || [];
  const totalTasks = tasks?.length || 0;

  const findTaskById = (id: string): Task | undefined => {
    return tasks?.find(task => task.id === id);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = findTaskById(event.active.id as string);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
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
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[400px] w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Select value={selectedSalesperson} onValueChange={setSelectedSalesperson}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Todos os vendedores" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Vendedores</SelectItem>
              {salespeople?.map((sp) => (
                <SelectItem key={sp.id} value={sp.id}>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={sp.avatar_url || undefined} />
                      <AvatarFallback className="text-xs">
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
          >
            <Columns3 className="h-4 w-4 mr-2" />
            {viewMode === 'columns' ? 'Lista' : 'Colunas'}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
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
        <Card className="p-4 bg-status-error/10 border-status-error/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-status-error/20">
              <Flame className="h-5 w-5 text-status-error" />
            </div>
            <div>
              <p className="text-2xl font-bold text-status-error">{highPriorityTasks.length}</p>
              <p className="text-xs text-muted-foreground">Urgentes</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-status-warning/10 border-status-warning/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-status-warning/20">
              <ClipboardList className="h-5 w-5 text-status-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-status-warning">{mediumPriorityTasks.length}</p>
              <p className="text-xs text-muted-foreground">Média</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-status-success/10 border-status-success/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-status-success/20">
              <CheckCircle className="h-5 w-5 text-status-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-status-success">{lowPriorityTasks.length}</p>
              <p className="text-xs text-muted-foreground">Baixa</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Task Board */}
      {totalTasks === 0 ? (
        <Card className="p-12 text-center">
          <CheckCircle className="h-12 w-12 text-status-success mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Nenhuma tarefa para hoje!</h3>
          <p className="text-muted-foreground mt-1">
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
              <div className="opacity-80">
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
