import { Helmet } from 'react-helmet-async';
import { ClientKanban } from '@/components/clients/ClientKanban';

export default function KanbanClientes() {
  return (
    <>
      <Helmet>
        <title>Kanban de Clientes | Sales Arena</title>
        <meta name="description" content="Visualize e gerencie seus clientes por estágio de relacionamento" />
      </Helmet>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kanban de Clientes</h1>
          <p className="text-muted-foreground">Gerencie o relacionamento arrastando clientes entre estágios</p>
        </div>
        <ClientKanban />
      </div>
    </>
  );
}
