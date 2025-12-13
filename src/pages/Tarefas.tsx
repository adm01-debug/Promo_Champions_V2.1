import { MainLayout } from '@/components/layout/MainLayout';
import { TaskQueue } from '@/components/tasks/TaskQueue';

export default function Tarefas() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Fila de Tarefas</h1>
          <p className="text-muted-foreground">
            Gerencie as tarefas diárias da sua equipe de vendas
          </p>
        </div>

        <TaskQueue />
      </div>
    </MainLayout>
  );
}
