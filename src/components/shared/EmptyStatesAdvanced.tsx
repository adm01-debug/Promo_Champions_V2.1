import { FileText, Users, BarChart, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="mb-4 text-gray-400">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 mb-4 max-w-md">{description}</p>
      {action && (
        <Button onClick={action.onClick}>{action.label}</Button>
      )}
    </div>
  );
}

export function EmptyDeals() {
  return (
    <EmptyState
      icon={<BarChart size={48} />}
      title="Nenhum negócio encontrado"
      description="Comece criando seu primeiro negócio para acompanhar vendas."
      action={{ label: 'Criar Negócio', onClick: () => {} }}
    />
  );
}

export function EmptyClients() {
  return (
    <EmptyState
      icon={<Users size={48} />}
      title="Nenhum cliente cadastrado"
      description="Adicione clientes para começar a gerenciar seu funil de vendas."
      action={{ label: 'Adicionar Cliente', onClick: () => {} }}
    />
  );
}
