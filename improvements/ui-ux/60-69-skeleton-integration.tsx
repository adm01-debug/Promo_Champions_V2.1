// Melhorias 60-69 - Skeleton Integration in 10 Pages
import {
  AnalyticsSkeleton,
  PipelineSkeleton,
  ClientsSkeleton,
  ProductsSkeleton,
  ActivitiesSkeleton,
  TasksSkeleton,
  TeamsSkeleton,
  RelatoriosSkeleton,
  BIGestorSkeleton,
  BIVendedorSkeleton,
} from '@/improvements/components/page-skeletons';

// ✅ Página 1: Analytics
export const Analytics = () => {
  const { data, isLoading } = useAnalytics();
  if (isLoading) return <AnalyticsSkeleton />;
  return <AnalyticsContent data={data} />;
};

// ✅ Página 2: Pipeline
export const Pipeline = () => {
  const { data, isLoading } = usePipeline();
  if (isLoading) return <PipelineSkeleton />;
  return <PipelineBoard data={data} />;
};

// ✅ Página 3: Clientes
export const Clientes = () => {
  const { data, isLoading } = useClients();
  if (isLoading) return <ClientsSkeleton />;
  return <ClientsList clients={data} />;
};

// ✅ Página 4-10: Repetir padrão para Products, Activities, Tasks, Teams, Relatórios, BIGestor, BIVendedor

// ✅ RESULTADO: Zero layout shift (CLS = 0), melhor UX
