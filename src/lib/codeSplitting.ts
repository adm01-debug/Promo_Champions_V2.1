import { lazy, Suspense, ComponentType } from 'react';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

/**
 * Enhanced lazy loading with error boundaries and loading states
 */
export const lazyLoad = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) => {
  const LazyComponent = lazy(importFunc);

  return (props: React.ComponentProps<T>) => (
    <Suspense fallback={fallback || <LoadingSpinner />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

// Preload function for hover/mouseenter
export const preloadComponent = (importFunc: () => Promise<any>) => {
  importFunc();
};

// Route-based code splitting
export const Routes = {
  // Auth
  Login: lazyLoad(() => import('@/pages/Login')),
  SignUp: lazyLoad(() => import('@/pages/SignUp')),

  // Dashboard
  Dashboard: lazyLoad(() => import('@/pages/Dashboard')),
  SDRDashboard: lazyLoad(() => import('@/pages/SDRDashboard')),
  CloserDashboard: lazyLoad(() => import('@/pages/CloserDashboard')),

  // CRM
  Clients: lazyLoad(() => import('@/pages/Clients')),
  ClientDetail: lazyLoad(() => import('@/pages/ClientDetail')),
  Deals: lazyLoad(() => import('@/pages/Deals')),
  DealDetail: lazyLoad(() => import('@/pages/DealDetail')),
  Activities: lazyLoad(() => import('@/pages/Activities')),
  Tasks: lazyLoad(() => import('@/pages/Tasks')),

  // Sales
  Pipeline: lazyLoad(() => import('@/pages/Pipeline')),
  Leads: lazyLoad(() => import('@/pages/Leads')),
  Cadences: lazyLoad(() => import('@/pages/Cadences')),
  Playbooks: lazyLoad(() => import('@/pages/Playbooks')),

  // Analytics
  Reports: lazyLoad(() => import('@/pages/Reports')),
  Analytics: lazyLoad(() => import('@/pages/Analytics')),
  Performance: lazyLoad(() => import('@/pages/Performance')),
  Forecast: lazyLoad(() => import('@/pages/Forecast')),

  // Settings
  Settings: lazyLoad(() => import('@/pages/Settings')),
  Profile: lazyLoad(() => import('@/pages/Profile')),
  Team: lazyLoad(() => import('@/pages/Team')),
  Integrations: lazyLoad(() => import('@/pages/Integrations')),

  // Gamification
  Leaderboard: lazyLoad(() => import('@/pages/Leaderboard')),
  Achievements: lazyLoad(() => import('@/pages/Achievements')),
  Challenges: lazyLoad(() => import('@/pages/Challenges')),
};

// Component-based code splitting
export const Components = {
  DataTable: lazyLoad(() => import('@/components/shared/DataTable')),
  Chart: lazyLoad(() => import('@/components/charts/Chart')),
  RichTextEditor: lazyLoad(() => import('@/components/editors/RichTextEditor')),
  FileUploader: lazyLoad(() => import('@/components/uploads/FileUploader')),
};
