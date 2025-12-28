import { FC } from 'react';
import { CheckSquare } from 'lucide-react';

export const EmptyStateTasks: FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <CheckSquare className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold">Nenhuma tarefa</h3>
      <p className="text-sm text-muted-foreground">Crie tarefas para organizar</p>
    </div>
  );
};
