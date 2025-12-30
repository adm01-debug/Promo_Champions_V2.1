import { FC } from 'react';
import { Users } from 'lucide-react';
import { EmptyState } from './EmptyState';

interface EmptyStateTeamsProps {
  onAdd?: () => void;
}

export const EmptyStateTeams: FC<EmptyStateTeamsProps> = ({ onAdd }) => {
  return (
    <EmptyState
      icon={Users}
      title="Nenhum time criado"
      description="Crie times para organizar seus vendedores e acompanhar a performance de cada grupo."
      actionLabel={onAdd ? "Criar Time" : undefined}
      onAction={onAdd}
    />
  );
};
