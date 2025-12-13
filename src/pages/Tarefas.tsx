import { MainLayout } from '@/components/layout/MainLayout';
import { TaskQueue } from '@/components/tasks/TaskQueue';
import { NextBestAction } from '@/components/tasks/NextBestAction';
import { Button } from '@/components/ui/button';
import { useCreateStagnantTasks } from '@/hooks/useStagnantTasks';
import { AlertTriangle, Loader2 } from 'lucide-react';

export default function Tarefas() {
  const createStagnantTasks = useCreateStagnantTasks();

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Fila de Tarefas</h1>
            <p className="text-muted-foreground">
              Gerencie as tarefas diárias da sua equipe de vendas
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => createStagnantTasks.mutate()}
            disabled={createStagnantTasks.isPending}
            className="gap-2"
          >
            {createStagnantTasks.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            Gerar Tarefas de Follow-up
          </Button>
        </div>

        {/* Next Best Action with AI */}
        <NextBestAction />

        {/* Task Queue */}
        <TaskQueue />
      </div>
    </MainLayout>
  );
}
