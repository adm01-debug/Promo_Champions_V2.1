import { FC } from 'react';
import { Bell } from 'lucide-react';

export const EmptyStateNotifications: FC = () => (
  <div className="flex flex-col items-center py-16">
    <Bell className="h-24 w-24 text-gray-400 mb-4" />
    <h3 className="text-xl font-semibold mb-2">Sem notificações</h3>
    <p className="text-muted-foreground">Você está em dia!</p>
  </div>
);
