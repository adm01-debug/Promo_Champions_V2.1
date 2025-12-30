// src/routes/lazy-routes.tsx
// Code Splitting - Lazy Loading de páginas pesadas
// Data: 2024-12-28

import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// ============================================================================
// LAZY IMPORTS
// ============================================================================

const Analytics = lazy(() => import('@/pages/Analytics'));
const BIGestor = lazy(() => import('@/pages/BIGestor'));
const BIVendedor = lazy(() => import('@/pages/BIVendedor'));
const Assistente = lazy(() => import('@/pages/Assistente'));
const PrevisaoDemanda = lazy(() => import('@/pages/PrevisaoDemanda'));
const Relatorios = lazy(() => import('@/pages/Relatorios'));

// ============================================================================
// LOADING SKELETONS
// ============================================================================

const AnalyticsSkeleton = () => (
  <div className="space-y-6 p-6">
    <Skeleton className="h-8 w-48" />
    <div className="grid grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-32" />
      ))}
    </div>
    <div className="grid grid-cols-2 gap-6">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-80" />
      ))}
    </div>
  </div>
);

const DashboardSkeleton = () => (
  <div className="space-y-6 p-6">
    <div className="flex justify-between">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-10 w-40" />
    </div>
    <div className="grid grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} className="h-40" />
      ))}
    </div>
    <Skeleton className="h-96" />
  </div>
);

const AssistenteSkeleton = () => (
  <div className="flex flex-col h-full p-6">
    <Skeleton className="h-12 w-full mb-4" />
    <div className="flex-1 space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-2">
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-12 flex-1" />
        </div>
      ))}
    </div>
    <Skeleton className="h-16 w-full" />
  </div>
);

// ============================================================================
// LAZY WRAPPER COMPONENT
// ============================================================================

interface LazyPageProps {
  Component: React.LazyExoticComponent<any>;
  skeleton?: React.ReactNode;
}

const LazyPage: React.FC<LazyPageProps> = ({ Component, skeleton }) => (
  <Suspense fallback={skeleton || <AnalyticsSkeleton />}>
    <Component />
  </Suspense>
);

// ============================================================================
// ROUTE CONFIGURATION
// ============================================================================

export const lazyRoutes = [
  {
    path: '/analytics',
    element: <LazyPage Component={Analytics} skeleton={<AnalyticsSkeleton />} />,
  },
  {
    path: '/bi/gestor',
    element: <LazyPage Component={BIGestor} skeleton={<DashboardSkeleton />} />,
  },
  {
    path: '/bi/vendedor',
    element: <LazyPage Component={BIVendedor} skeleton={<DashboardSkeleton />} />,
  },
  {
    path: '/assistente',
    element: <LazyPage Component={Assistente} skeleton={<AssistenteSkeleton />} />,
  },
  {
    path: '/previsao-demanda',
    element: <LazyPage Component={PrevisaoDemanda} skeleton={<AnalyticsSkeleton />} />,
  },
  {
    path: '/relatorios',
    element: <LazyPage Component={Relatorios} skeleton={<DashboardSkeleton />} />,
  },
];

// ============================================================================
// PREFETCH HELPER
// ============================================================================

export const prefetchLazyRoutes = () => {
  // Prefetch quando idle
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      Analytics.preload();
      BIGestor.preload();
      Assistente.preload();
    });
  } else {
    // Fallback: prefetch após 2s
    setTimeout(() => {
      Analytics.preload();
      BIGestor.preload();
    }, 2000);
  }
};

// ============================================================================
// ROUTE COMPONENT MAPPING
// ============================================================================

export const LAZY_COMPONENTS = {
  analytics: Analytics,
  biGestor: BIGestor,
  biVendedor: BIVendedor,
  assistente: Assistente,
  previsaoDemanda: PrevisaoDemanda,
  relatorios: Relatorios,
};

// Uso no Router
/*
import { lazyRoutes, prefetchLazyRoutes } from './routes/lazy-routes';

// Em App.tsx ou main.tsx
useEffect(() => {
  prefetchLazyRoutes();
}, []);

// No Router
{lazyRoutes.map(route => (
  <Route key={route.path} path={route.path} element={route.element} />
))}
*/
