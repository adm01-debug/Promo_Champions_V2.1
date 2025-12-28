import { FC } from 'react';
import { CheckSquare, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const EmptyStateTasks: FC<{onAdd: () => void}> = ({ onAdd }) => (
  <div className="flex flex-col items-center py-16">
    <CheckSquare className="h-24 w-24 text-purple-500 mb-4" />
    <h3 className="text-xl font-semibold mb-2">Nenhuma tarefa</h3>
    <Button onClick={onAdd}><Plus className="mr-2 h-5 w-5" />Nova Tarefa</Button>
  </div>
);
