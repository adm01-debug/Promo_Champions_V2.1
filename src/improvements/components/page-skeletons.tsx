// src/components/skeletons/page-skeletons.tsx
// Skeletons para todas as páginas principais
// Data: 2024-12-28

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

// ============================================================================
// ANALYTICS SKELETON
// ============================================================================

export const AnalyticsSkeleton = () => (
  <div className="space-y-6 p-6">
    <div className="flex justify-between items-center">
      <Skeleton className="h-8 w-48" />
      <div className="flex gap-2">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-16 mb-1" />
            <Skeleton className="h-3 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

// ============================================================================
// PIPELINE SKELETON
// ============================================================================

export const PipelineSkeleton = () => (
  <div className="p-6">
    <div className="flex justify-between mb-6">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-10 w-32" />
    </div>
    
    <div className="flex gap-4 overflow-x-auto">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="min-w-[280px] space-y-3">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-16" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[...Array(3)].map((_, j) => (
                <Skeleton key={j} className="h-32 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  </div>
);

// ============================================================================
// CLIENTS SKELETON
// ============================================================================

export const ClientsSkeleton = () => (
  <div className="space-y-6 p-6">
    <div className="flex justify-between">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-40" />
    </div>

    <div className="flex gap-4">
      <Skeleton className="h-10 flex-1" />
      <Skeleton className="h-10 w-32" />
    </div>

    <div className="space-y-3">
      {[...Array(8)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4 flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-8 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

// ============================================================================
// PRODUCTS SKELETON
// ============================================================================

export const ProductsSkeleton = () => (
  <div className="space-y-6 p-6">
    <Skeleton className="h-8 w-40" />
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {[...Array(12)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <Skeleton className="h-48 w-full mb-4" />
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-4" />
            <div className="flex justify-between">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-16" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

// ============================================================================
// ACTIVITIES SKELETON
// ============================================================================

export const ActivitiesSkeleton = () => (
  <div className="space-y-6 p-6">
    <div className="flex justify-between">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-40" />
    </div>

    <div className="grid grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => (
        <Skeleton key={i} className="h-10" />
      ))}
    </div>

    <div className="space-y-4">
      {[...Array(10)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4 flex gap-4">
            <Skeleton className="h-10 w-10 rounded" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-8 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

// ============================================================================
// TASKS SKELETON
// ============================================================================

export const TasksSkeleton = () => (
  <div className="space-y-6 p-6">
    <Skeleton className="h-8 w-32" />
    
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {['To Do', 'In Progress', 'Done'].map((status, i) => (
        <div key={i} className="space-y-4">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[...Array(4)].map((_, j) => (
                <Skeleton key={j} className="h-24 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  </div>
);

// ============================================================================
// TEAMS SKELETON
// ============================================================================

export const TeamsSkeleton = () => (
  <div className="space-y-6 p-6">
    <div className="flex justify-between">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-10 w-32" />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex -space-x-2">
              {[...Array(4)].map((_, j) => (
                <Skeleton key={j} className="h-10 w-10 rounded-full border-2 border-background" />
              ))}
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

// ============================================================================
// RELATORIOS SKELETON
// ============================================================================

export const RelatoriosSkeleton = () => (
  <div className="space-y-6 p-6">
    <Skeleton className="h-8 w-48" />

    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex gap-4">
              {[...Array(6)].map((_, j) => (
                <Skeleton key={j} className="h-8 flex-1" />
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

// ============================================================================
// BI GESTOR SKELETON
// ============================================================================

export const BIGestorSkeleton = () => (
  <div className="space-y-6 p-6">
    <div className="flex justify-between">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-10 w-40" />
    </div>

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(8)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6 text-center">
            <Skeleton className="h-4 w-24 mx-auto mb-2" />
            <Skeleton className="h-10 w-16 mx-auto mb-1" />
            <Skeleton className="h-3 w-20 mx-auto" />
          </CardContent>
        </Card>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[...Array(6)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-72 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

// ============================================================================
// BI VENDEDOR SKELETON
// ============================================================================

export const BIVendedorSkeleton = () => (
  <div className="space-y-6 p-6">
    <div className="flex items-center gap-4">
      <Skeleton className="h-16 w-16 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>

    <div className="grid grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-8 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

// ============================================================================
// EXPORT ALL
// ============================================================================

export const PAGE_SKELETONS = {
  analytics: AnalyticsSkeleton,
  pipeline: PipelineSkeleton,
  clients: ClientsSkeleton,
  products: ProductsSkeleton,
  activities: ActivitiesSkeleton,
  tasks: TasksSkeleton,
  teams: TeamsSkeleton,
  relatorios: RelatoriosSkeleton,
  biGestor: BIGestorSkeleton,
  biVendedor: BIVendedorSkeleton,
};
