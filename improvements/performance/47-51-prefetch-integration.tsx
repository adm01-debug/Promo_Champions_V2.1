// Melhorias 47-51 - Prefetch Strategy Integration
import { usePrefetchDeal, usePrefetchClient } from '@/improvements/hooks/prefetch-strategies';

// ✅ Componente 1: DealCard com prefetch
export const DealCard = ({ deal }) => {
  const prefetch = usePrefetchDeal();
  
  return (
    <Card
      onMouseEnter={() => prefetch.onMouseEnter(deal.id)}
      onMouseLeave={prefetch.onMouseLeave}
      onClick={() => navigate(`/deals/${deal.id}`)}
    >
      <h3>{deal.title}</h3>
      <p>{deal.value}</p>
    </Card>
  );
};

// ✅ Componente 2: ClientRow com prefetch
export const ClientRow = ({ client }) => {
  const prefetch = usePrefetchClient();
  
  return (
    <tr
      onMouseEnter={() => prefetch.onMouseEnter(client.id)}
      onMouseLeave={prefetch.onMouseLeave}
    >
      <td>{client.name}</td>
      <td>{client.email}</td>
    </tr>
  );
};

// ✅ Componente 3: Pipeline com prefetch de próxima página
export const PipelineColumn = ({ stage }) => {
  const prefetch = usePrefetchNextPage();
  
  useEffect(() => {
    prefetch.prefetch(stage.id, stage.deals.length);
  }, [stage]);
  
  return <Column />;
};

// ✅ Componente 4: Sidebar com prefetch de rotas
export const SidebarLink = ({ to, label }) => {
  const prefetch = usePrefetchRoute();
  
  return (
    <Link
      to={to}
      onMouseEnter={() => prefetch.onMouseEnter(to)}
    >
      {label}
    </Link>
  );
};

// ✅ Componente 5: Dashboard com prefetch automático
export const Dashboard = () => {
  const prefetch = useBatchPrefetch();
  
  useEffect(() => {
    // Prefetch dados críticos em background
    prefetch.prefetch(['clients', 'deals', 'activities']);
  }, []);
  
  return <DashboardContent />;
};

// ✅ RESULTADO: Navegação instantânea (dados já em cache)
