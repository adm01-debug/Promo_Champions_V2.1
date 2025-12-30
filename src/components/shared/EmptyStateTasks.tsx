import { FC } from 'react';
import { CheckSquare } from 'lucide-react';
import { EmptyState } from './EmptyState';

interface EmptyStateTasksProps {
  onAdd?: () => void;
}

export const EmptyStateTasks: FC<EmptyStateTasksProps> = ({ onAdd }) => {
  return (
    <EmptyState
      icon={CheckSquare}
      title="Nenhuma tarefa pendente"
      description="Crie tarefas para organizar seu dia e não perder nenhum follow-up importante."
      actionLabel={onAdd ? "Nova Tarefa" : undefined}
      onAction={onAdd}
    />
  );
};
