import { lazy, Suspense, ComponentType } from 'react';

export function lazyLoad<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  fallback: React.ReactNode = <div>Carregando...</div>
) {
  const LazyComponent = lazy(factory);
  
  return (props: any) => (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  );
}

// Usage
export const DashboardPage = lazyLoad(() => import('@/pages/Dashboard'));
export const ClientsPage = lazyLoad(() => import('@/pages/Clients'));
export const DealsPage = lazyLoad(() => import('@/pages/Deals'));
export const ReportsPage = lazyLoad(() => import('@/pages/Reports'));
