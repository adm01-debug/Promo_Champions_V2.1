import { useTodayTasks, Task } from '@/hooks/useTasks';
import { useSalespeople } from '@/hooks/useSalespeople';
import { TaskCard } from './TaskCard';
import { CreateTaskDialog } from './CreateTaskDialog';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ClipboardList, Flame, CheckCircle } from 'lucide-react';
import { useState } from 'react';

export function TaskQueue() {
  const [selectedSalesperson, setSelectedSalesperson] = useState<string>('all');
  const { data: salespeople, isLoading: loadingSalespeople } = useSalespeople();
  const { data: tasks, isLoading: loadingTasks } = useTodayTasks(
    selectedSalesperson === 'all' ? undefined : selectedSalesperson
  );

  // Group tasks by priority
  const groupedTasks = tasks?.reduce((acc, task) => {
    acc[task.priority] = acc[task.priority] || [];
    acc[task.priority].push(task);
    return acc;
  }, {} as Record<string, Task[]>) || {};

  const highPriorityTasks = groupedTasks.high || [];
  const mediumPriorityTasks = groupedTasks.medium || [];
  const lowPriorityTasks = groupedTasks.low || [];

  const totalTasks = tasks?.length || 0;

  if (loadingTasks || loadingSalespeople) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
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
        </div>

        <CreateTaskDialog />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 bg-red-500/10 border-red-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/20">
              <Flame className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-400">{highPriorityTasks.length}</p>
              <p className="text-xs text-muted-foreground">Urgentes</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-yellow-500/10 border-yellow-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/20">
              <ClipboardList className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-400">{mediumPriorityTasks.length}</p>
              <p className="text-xs text-muted-foreground">Média</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-green-500/10 border-green-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/20">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">{lowPriorityTasks.length}</p>
              <p className="text-xs text-muted-foreground">Baixa</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Task Lists */}
      {totalTasks === 0 ? (
        <Card className="p-12 text-center">
          <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Nenhuma tarefa para hoje!</h3>
          <p className="text-muted-foreground mt-1">
            Todas as tarefas foram concluídas ou não há pendências.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* High Priority */}
          {highPriorityTasks.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-red-400" />
                <h3 className="font-semibold text-red-400">Prioridade Alta</h3>
                <span className="text-xs text-muted-foreground">
                  ({highPriorityTasks.length})
                </span>
              </div>
              <div className="space-y-2">
                {highPriorityTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>
          )}

          {/* Medium Priority */}
          {mediumPriorityTasks.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-yellow-400" />
                <h3 className="font-semibold text-yellow-400">Prioridade Média</h3>
                <span className="text-xs text-muted-foreground">
                  ({mediumPriorityTasks.length})
                </span>
              </div>
              <div className="space-y-2">
                {mediumPriorityTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>
          )}

          {/* Low Priority */}
          {lowPriorityTasks.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <h3 className="font-semibold text-green-400">Prioridade Baixa</h3>
                <span className="text-xs text-muted-foreground">
                  ({lowPriorityTasks.length})
                </span>
              </div>
              <div className="space-y-2">
                {lowPriorityTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
