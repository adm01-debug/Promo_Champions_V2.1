import { FC } from 'react';
import { TrendingUp } from 'lucide-react';
import { EmptyState } from './EmptyState';

interface EmptyStatePipelineProps {
  onAdd?: () => void;
}

export const EmptyStatePipeline: FC<EmptyStatePipelineProps> = ({ onAdd }) => {
  return (
    <EmptyState
      icon={TrendingUp}
      title="Pipeline vazio"
      description="Adicione negócios ao pipeline para acompanhar suas oportunidades de vendas."
      actionLabel={onAdd ? "Novo Negócio" : undefined}
      onAction={onAdd}
    />
  );
};
