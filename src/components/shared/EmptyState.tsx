import React from 'react';
import { FileX, Users, DollarSign, Activity, Search, Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => (
  <div className="flex flex-col items-center justify-center py-16 px-4">
    <div className="text-gray-400 mb-4">{icon}</div>
    <h3 className="text-lg font-semibold mb-2 text-gray-900">{title}</h3>
    <p className="text-gray-600 mb-6 text-center max-w-md">{description}</p>
    {action && (
      <button
        onClick={action.onClick}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        {action.label}
      </button>
    )}
  </div>
);

export const NoDeals: React.FC<{ onCreate?: () => void }> = ({ onCreate }) => (
  <EmptyState
    icon={<DollarSign size={64} />}
    title="Nenhum deal encontrado"
    description="Comece criando seu primeiro deal e acompanhe suas oportunidades de vendas de perto."
    action={onCreate ? { label: 'Criar Deal', onClick: onCreate } : undefined}
  />
);

export const NoClients: React.FC<{ onCreate?: () => void }> = ({ onCreate }) => (
  <EmptyState
    icon={<Users size={64} />}
    title="Nenhum cliente cadastrado"
    description="Adicione seus primeiros clientes para começar a gerenciar seu pipeline de vendas."
    action={onCreate ? { label: 'Adicionar Cliente', onClick: onCreate } : undefined}
  />
);

export const NoActivities: React.FC = () => (
  <EmptyState
    icon={<Activity size={64} />}
    title="Nenhuma atividade registrada"
    description="Suas atividades de vendas aparecerão aqui. Registre ligações, reuniões e follow-ups."
  />
);

export const NoSearchResults: React.FC<{ onClear?: () => void }> = ({ onClear }) => (
  <EmptyState
    icon={<Search size={64} />}
    title="Nenhum resultado encontrado"
    description="Tente ajustar seus filtros ou usar termos de busca diferentes."
    action={onClear ? { label: 'Limpar Filtros', onClick: onClear } : undefined}
  />
);

export const EmptyInbox: React.FC = () => (
  <EmptyState
    icon={<Inbox size={64} />}
    title="Caixa de entrada vazia"
    description="Parabéns! Você está em dia com todas as suas tarefas e notificações."
  />
);

export const NoData: React.FC = () => (
  <EmptyState
    icon={<FileX size={64} />}
    title="Sem dados disponíveis"
    description="Não há dados para exibir no momento. Verifique seus filtros ou tente novamente mais tarde."
  />
);
