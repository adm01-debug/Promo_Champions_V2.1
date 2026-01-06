import React, { lazy, Suspense, ComponentType } from 'react';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

type LazyComponentFactory<T extends ComponentType<unknown>> = () => Promise<{ default: T }>;

export function lazyLoad<T extends ComponentType<unknown>>(
  importFunc: LazyComponentFactory<T>,
  fallback?: React.ReactNode
): React.FC<React.ComponentProps<T>> {
  const LazyComponent = lazy(importFunc);

  const LazyWrapper: React.FC<React.ComponentProps<T>> = (props) => {
    return React.createElement(
      Suspense,
      { fallback: fallback || React.createElement(LoadingSpinner) },
      React.createElement(LazyComponent, props as any)
    );
  };

  return LazyWrapper;
}

// Preload function for hover/mouseenter
export const preloadComponent = (importFunc: () => Promise<unknown>): void => {
  importFunc();
};

// Route-based code splitting configurations
export const RouteImports = {
  Login: () => import('@/pages/Login'),
  SignUp: () => import('@/pages/SignUp'),
  Dashboard: () => import('@/pages/Dashboard'),
  SDRDashboard: () => import('@/pages/SDRDashboard'),
  CloserDashboard: () => import('@/pages/CloserDashboard'),
  Clients: () => import('@/pages/Clients'),
  ClientDetail: () => import('@/pages/ClientDetail'),
  Settings: () => import('@/pages/Settings'),
  Profile: () => import('@/pages/Profile'),
  Leaderboard: () => import('@/pages/Leaderboard'),
  Achievements: () => import('@/pages/Achievements'),
  Challenges: () => import('@/pages/Challenges'),
};
