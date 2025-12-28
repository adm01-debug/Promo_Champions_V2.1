import { FC } from 'react';
import { Activity } from 'lucide-react';

export const EmptyStateActivities: FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Activity className="h-20 w-20 text-gray-400 mb-4" />
      <h3 className="text-lg font-semibold mb-2">Nenhuma atividade registrada</h3>
      <p className="text-sm text-muted-foreground">
        As atividades aparecerão aqui conforme você interage com clientes
      </p>
    </div>
  );
};
