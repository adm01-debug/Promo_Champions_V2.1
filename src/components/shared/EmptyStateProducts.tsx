import { FC } from 'react';
import { Package } from 'lucide-react';

export const EmptyStateProducts: FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <Package className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold">Nenhum produto</h3>
      <p className="text-sm text-muted-foreground">Adicione produtos para começar</p>
    </div>
  );
};
