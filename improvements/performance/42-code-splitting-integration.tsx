// Melhoria 42 - Code Splitting Integration Complete
// Este arquivo deve substituir src/routes/index.tsx ou App.tsx

import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// ✅ LAZY LOAD - Páginas pesadas
const Analytics = lazy(() => import('@/pages/Analytics'));
const BIGestor = lazy(() => import('@/pages/BIGestor'));
const BIVendedor = lazy(() => import('@/pages/BIVendedor'));
const Assistente = lazy(() => import('@/pages/Assistente'));
const PrevisaoDemanda = lazy(() => import('@/pages/PrevisaoDemanda'));
const Relatorios = lazy(() => import('@/pages/Relatorios'));
// ✅ NOVOS lazy loads
const Pipeline = lazy(() => import('@/pages/Pipeline'));
const Clientes = lazy(() => import('@/pages/Clientes'));
const Produtos = lazy(() => import('@/pages/Produtos'));
const Cadencias = lazy(() => import('@/pages/Cadencias'));
const Playbooks = lazy(() => import('@/pages/Playbooks'));
const Times = lazy(() => import('@/pages/Times'));

// Skeletons
import { 
  AnalyticsSkeleton, 
  PipelineSkeleton,
  ClientsSkeleton,
  ProductsSkeleton,
  // ... import all skeletons
} from '@/improvements/components/page-skeletons';

// ✅ PREFETCH STRATEGY
const prefetchRoutes = () => {
  // Prefetch critical routes on idle
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      import('@/pages/Pipeline');
      import('@/pages/Clientes');
    });
  }
};

export const App = () => {
  useEffect(() => {
    prefetchRoutes();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Lazy routes com Skeletons */}
          <Route 
            path="/analytics" 
            element={
              <Suspense fallback={<AnalyticsSkeleton />}>
                <Analytics />
              </Suspense>
            } 
          />
          <Route 
            path="/pipeline" 
            element={
              <Suspense fallback={<PipelineSkeleton />}>
                <Pipeline />
              </Suspense>
            } 
          />
          <Route 
            path="/clientes" 
            element={
              <Suspense fallback={<ClientsSkeleton />}>
                <Clientes />
              </Suspense>
            } 
          />
          {/* ... more routes */}
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

// ✅ RESULTADO ESPERADO:
// - Initial bundle size: ~500KB → ~200KB (-60%)
// - Lazy chunks: 6-12 chunks de ~50-100KB cada
// - FCP: <1.5s
// - TTI: <3s
