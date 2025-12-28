import { FC } from 'react';
import { Users, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const EmptyStateTeams: FC<{onCreate: () => void}> = ({ onCreate }) => (
  <div className="flex flex-col items-center py-16">
    <Users className="h-24 w-24 text-green-500 mb-4" />
    <h3 className="text-xl font-semibold mb-2">Nenhum time</h3>
    <Button onClick={onCreate}><Plus className="mr-2 h-5 w-5" />Criar Time</Button>
  </div>
);
