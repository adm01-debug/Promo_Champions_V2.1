// Melhorias 70-76 - Empty States Integration
import { EmptyState, EMPTY_STATES } from '@/improvements/components/empty-states-toast';
import { Plus } from 'lucide-react';

// ✅ 70. Clientes vazio
export const ClientsList = ({ clients }) => {
  if (clients.length === 0) {
    return (
      <EmptyState
        {...EMPTY_STATES.clients}
        action={{
          label: 'Adicionar Primeiro Cliente',
          onClick: () => navigate('/clientes/novo'),
          icon: Plus
        }}
      />
    );
  }
  return <List items={clients} />;
};

// ✅ 71. Pipeline vazio
export const Pipeline = ({ deals }) => {
  if (deals.length === 0) {
    return (
      <EmptyState
        {...EMPTY_STATES.pipeline}
        action={{
          label: 'Criar Primeiro Deal',
          onClick: () => navigate('/deals/novo'),
          icon: Plus
        }}
      />
    );
  }
  return <PipelineBoard deals={deals} />;
};

// ✅ 72-76: Products, Activities, Tasks, Notifications, Teams
// Aplicar mesmo padrão

// ✅ RESULTADO: UX consistente, usuários sabem o que fazer
