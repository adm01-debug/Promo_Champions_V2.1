import { FC } from 'react';
import { Bell } from 'lucide-react';
import { EmptyState } from './EmptyState';

export const EmptyStateNotifications: FC = () => {
  return (
    <EmptyState
      icon={Bell}
      title="Sem notificações"
      description="Você está em dia! Quando houver novidades, elas aparecerão aqui."
    />
  );
};
