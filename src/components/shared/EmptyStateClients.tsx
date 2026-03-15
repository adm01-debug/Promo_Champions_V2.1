import { FC } from 'react';
import { UserPlus } from 'lucide-react';
import { EmptyState } from './EmptyState';

interface EmptyStateClientsProps {
  onAdd?: () => void;
}

export const EmptyStateClients: FC<EmptyStateClientsProps> = ({ onAdd }) => {
  return (
    <EmptyState
      icon={UserPlus}
      title="Nenhum cliente cadastrado"
      description="Adicione clientes para começar a gerenciar seus relacionamentos e oportunidades."
      action={onAdd ? { label: "Adicionar Cliente", onClick: onAdd } : undefined}
    />
  );
};
