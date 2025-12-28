import { FC } from 'react';
import { Users, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateClientsProps {
  onAddClient: () => void;
}

export const EmptyStateClients: FC<EmptyStateClientsProps> = ({ onAddClient }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
        <Users className="h-12 w-12 text-blue-600" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        Nenhum cliente cadastrado
      </h3>
      <p className="text-gray-500 text-center mb-6 max-w-md">
        Comece adicionando seu primeiro cliente para gerenciar oportunidades de vendas
        e acompanhar o relacionamento.
      </p>
      <Button onClick={onAddClient} size="lg">
        <Plus className="h-5 w-5 mr-2" />
        Adicionar Primeiro Cliente
      </Button>
      <div className="mt-8 grid grid-cols-3 gap-4 text-sm text-gray-600">
        <div className="text-center">
          <div className="font-semibold text-gray-900">📊</div>
          <div className="mt-1">Análise ABC</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-gray-900">💰</div>
          <div className="mt-1">Histórico vendas</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-gray-900">📈</div>
          <div className="mt-1">Previsão churn</div>
        </div>
      </div>
    </div>
  );
};
