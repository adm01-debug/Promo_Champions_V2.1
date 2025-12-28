import { FC } from 'react';
import { Package, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const EmptyStateProducts: FC<{onAdd: () => void}> = ({ onAdd }) => (
  <div className="flex flex-col items-center py-16">
    <Package className="h-24 w-24 text-blue-500 mb-4" />
    <h3 className="text-xl font-semibold mb-2">Nenhum produto</h3>
    <Button onClick={onAdd}>
      <Plus className="mr-2 h-5 w-5" />Adicionar Produto
    </Button>
  </div>
);
