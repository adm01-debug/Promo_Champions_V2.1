// Advanced Bundle Splitting Configuration
// This file provides utilities for optimizing bundle sizes

// Chunk groups for vendor splitting
export const vendorChunks = {
  // React core
  react: ['react', 'react-dom', 'react-router-dom'],
  
  // UI Libraries
  ui: ['@radix-ui', 'lucide-react', 'class-variance-authority', 'clsx', 'tailwind-merge'],
  
  // Data fetching & state
  query: ['@tanstack/react-query', '@supabase/supabase-js'],
  
  // Charts & visualization
  charts: ['recharts'],
  
  // Forms
  forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
  
  // Animations
  motion: ['framer-motion'],
  
  // Date utilities
  dates: ['date-fns'],
  
  // PDF & exports
  exports: ['jspdf', 'jspdf-autotable', 'xlsx', 'papaparse'],
  
  // DnD
  dnd: ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
};

// Dynamic import helpers for code splitting
export const dynamicImports = {
  // Heavy components that should be lazy loaded
  charts: () => import('recharts'),
  pdf: () => import('jspdf'),
  excel: () => import('xlsx'),
  
  // Feature modules
  kanban: () => import('@/pages/KanbanPage'),
  reports: () => import('@/pages/RelatoriosPage'),
  admin: () => import('@/pages/AdminPage'),
};

// Preload hints for critical routes
export const preloadRoutes = [
  '/', 
  '/pipeline',
  '/vendas',
];

// Route-based chunk naming
export const routeChunks: Record<string, string> = {
  '/': 'home',
  '/pipeline': 'pipeline',
  '/vendas': 'sales',
  '/clientes': 'clients',
  '/relatorios': 'reports',
  '/admin': 'admin',
  '/kanban': 'kanban',
};

// Get chunk name for a route
export function getChunkName(route: string): string {
  return routeChunks[route] || 'page';
}

// Check if a route should be preloaded
export function shouldPreload(route: string): boolean {
  return preloadRoutes.includes(route);
}
