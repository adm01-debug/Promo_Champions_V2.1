import { FC } from 'react';
import { Package } from 'lucide-react';
import { EmptyState } from './EmptyState';

interface EmptyStateProductsProps {
  onAdd?: () => void;
}

export const EmptyStateProducts: FC<EmptyStateProductsProps> = ({ onAdd }) => {
  return (
    <EmptyState
      icon={Package}
      title="Nenhum produto cadastrado"
      description="Adicione produtos para começar a gerenciar seu catálogo e acompanhar vendas."
      actionLabel={onAdd ? "Adicionar Produto" : undefined}
      onAction={onAdd}
    />
  );
};
