import { useState } from 'react';
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, DragStartEvent, DragEndEvent, DragOverEvent } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useTodayTasks, TaskRecord, TaskPriority, useUpdateTask } from '@/hooks/useTasks';
import { useSalespeople } from '@/hooks/useSalespeople';
import { PriorityColumn } from './PriorityColumn';
import { DraggableTaskCard } from './DraggableTaskCard';
import { CreateTaskDialog } from './CreateTaskDialog';
import { RescheduleDialog } from './RescheduleDialog';
import { TaskStatsCards } from './TaskStatsCards';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Calendar, Columns3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PRIORITIES: TaskPriority[] = ['urgent', 'high', 'medium', 'low'];

export function TaskQueue() {
  const [selectedSalesperson, setSelectedSalesperson] = useState<string>('all');
  const [activeTask, setActiveTask] = useState<TaskRecord | null>(null);
  const [rescheduleTask, setRescheduleTask] = useState<TaskRecord | null>(null);
  const [viewMode, setViewMode] = useState<'columns' | 'list'>('columns');

  const { data: salespeople, isLoading: loadingSalespeople } = useSalespeople();
  const { data: tasks, isLoading: loadingTasks } = useTodayTasks(selectedSalesperson === 'all' ? undefined : selectedSalesperson);
  const updateTask = useUpdateTask();
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const groupedTasks = tasks?.reduce((acc, task) => { acc[task.priority] = acc[task.priority] || []; acc[task.priority].push(task); return acc; }, {} as Record<TaskPriority, TaskRecord[]>) || {} as Record<TaskPriority, TaskRecord[]>;

  const findTaskById = (id: string) => tasks?.find(task => task.id === id);
  const getPriorityLabel = (p: TaskPriority) => ({ urgent: 'urgente', high: 'alta', medium: 'média', low: 'baixa' }[p]);

  const handleDragStart = (event: DragStartEvent) => { const task = findTaskById(event.active.id as string); if (task) setActiveTask(task); };
  const handleDragOver = (_event: DragOverEvent) => {};
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;
    const activeId = active.id as string;
    const overId = over.id as string;
    if (PRIORITIES.includes(overId as TaskPriority)) {
      const task = findTaskById(activeId);
      if (task && task.priority !== overId) {
        updateTask.mutate({ id: activeId, priority: overId as TaskPriority }, { onSuccess: () => { toast({ title: 'Prioridade atualizada!', description: `Tarefa movida para prioridade ${getPriorityLabel(overId as TaskPriority)}` }); } });
      }
    }
  };

  if (loadingTasks || loadingSalespeople) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center"><div className="flex gap-4"><Skeleton className="h-10 w-52 rounded-lg animate-shimmer" /><Skeleton className="h-10 w-28 rounded-lg animate-shimmer" style={{ animationDelay: '50ms' }} /></div><div className="flex gap-2"><Skeleton className="h-10 w-32 rounded-lg animate-shimmer" style={{ animationDelay: '100ms' }} /><Skeleton className="h-10 w-32 rounded-lg animate-shimmer" style={{ animationDelay: '150ms' }} /></div></div>
        <div className="grid grid-cols-3 gap-4">{[1, 2, 3].map((i) => (<Skeleton key={i} className="h-24 w-full rounded-xl animate-shimmer" style={{ animationDelay: `${i * 75}ms` }} />))}</div>
        <div className="grid grid-cols-3 gap-4">{[1, 2, 3].map((i) => (<Skeleton key={i} className="h-[400px] w-full rounded-xl animate-shimmer" style={{ animationDelay: `${200 + i * 75}ms` }} />))}</div>
      </div>
    );
  }

  const totalTasks = tasks?.length || 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 rounded-xl glass border border-border/40 dark:border-glow card-elevated">
        <div className="flex items-center gap-4">
          <Select value={selectedSalesperson} onValueChange={setSelectedSalesperson}>
            <SelectTrigger className="w-[220px] border-border/50 bg-background/50 hover:border-primary/50 transition-colors"><SelectValue placeholder="Todos os vendedores" /></SelectTrigger>
            <SelectContent className="bg-popover/95 backdrop-blur-md border-border/50">
              <SelectItem value="all">Todos os Vendedores</SelectItem>
              {salespeople?.map((sp) => (<SelectItem key={sp.id} value={sp.id}><div className="flex items-center gap-2"><Avatar className="h-5 w-5 border border-background"><AvatarImage src={sp.avatar_url || undefined} /><AvatarFallback className="text-[9px] bg-gradient-to-br from-primary to-accent text-primary-foreground">{sp.name.charAt(0)}</AvatarFallback></Avatar>{sp.name}</div></SelectItem>))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => setViewMode(viewMode === 'columns' ? 'list' : 'columns')} className="border-border/50 hover:border-primary/50 hover:bg-primary/10 hover:scale-105 transition-all duration-200"><Columns3 className="h-4 w-4 mr-2" />{viewMode === 'columns' ? 'Lista' : 'Colunas'}</Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="border-border/50 hover:border-primary/50 hover:bg-primary/10 hover:scale-105 transition-all duration-200" onClick={() => { if (tasks?.length) setRescheduleTask(tasks[0]); }} disabled={!tasks?.length}><Calendar className="h-4 w-4 mr-2" />Reagendar</Button>
          <CreateTaskDialog />
        </div>
      </div>

      <TaskStatsCards high={(groupedTasks.high || []).length} medium={(groupedTasks.medium || []).length} low={(groupedTasks.low || []).length} />

      {totalTasks === 0 ? (
        <Card className="p-12 text-center glass border border-border/40 dark:border-glow card-elevated animate-fade-in">
          <div className="p-4 rounded-full bg-gradient-to-br from-status-success/30 to-status-success/10 w-fit mx-auto mb-4 shadow-lg shadow-status-success/20"><CheckCircle className="h-12 w-12 text-status-success animate-pulse" /></div>
          <h3 className="text-lg font-display font-semibold gradient-text">Nenhuma tarefa para hoje!</h3>
          <p className="text-muted-foreground mt-2">Todas as tarefas foram concluídas ou não há pendências.</p>
        </Card>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
          <div className={viewMode === 'columns' ? "grid grid-cols-1 md:grid-cols-3 gap-4" : "space-y-4"}>
            {viewMode === 'columns' ? (
              PRIORITIES.map((priority) => (<PriorityColumn key={priority} priority={priority} tasks={groupedTasks[priority] || []} activeId={activeTask?.id || null} />))
            ) : (
              <>
                {(groupedTasks.high || []).length > 0 && <PriorityColumn priority="high" tasks={groupedTasks.high} activeId={activeTask?.id || null} />}
                {(groupedTasks.medium || []).length > 0 && <PriorityColumn priority="medium" tasks={groupedTasks.medium} activeId={activeTask?.id || null} />}
                {(groupedTasks.low || []).length > 0 && <PriorityColumn priority="low" tasks={groupedTasks.low} activeId={activeTask?.id || null} />}
              </>
            )}
          </div>
          <DragOverlay>{activeTask ? (<div className="opacity-90 rotate-2 scale-105 shadow-2xl shadow-primary/20"><DraggableTaskCard task={activeTask} isDragging /></div>) : null}</DragOverlay>
        </DndContext>
      )}

      <RescheduleDialog task={rescheduleTask} onClose={() => setRescheduleTask(null)} allTasks={tasks || []} />
    </div>
  );
}
