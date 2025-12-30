import { FC } from 'react';
import { Activity } from 'lucide-react';
import { EmptyState } from './EmptyState';

interface EmptyStateActivitiesProps {
  onAdd?: () => void;
}

export const EmptyStateActivities: FC<EmptyStateActivitiesProps> = ({ onAdd }) => {
  return (
    <EmptyState
      icon={Activity}
      title="Nenhuma atividade registrada"
      description="Registre ligações, emails e reuniões para manter o histórico completo."
      actionLabel={onAdd ? "Registrar Atividade" : undefined}
      onAction={onAdd}
    />
  );
};
