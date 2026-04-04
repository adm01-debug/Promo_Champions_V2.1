import { FC } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/** Shimmer skeleton with custom sizing for content-aware loading */
const Shimmer: FC<{ className?: string; style?: React.CSSProperties }> = ({ className, style }) => (
  <Skeleton className={cn("animate-pulse", className)} style={style} />
);

// Generic skeleton card
export const SkeletonCard: FC<{ className?: string }> = ({ className }) => (
  <Card className={className}>
    <CardHeader className="pb-2">
      <Skeleton className="h-5 w-1/3" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-8 w-1/2 mb-2" />
      <Skeleton className="h-4 w-2/3" />
    </CardContent>
  </Card>
);

// Stats grid skeleton
const StatsGridSkeleton: FC<{ count?: number }> = ({ count = 4 }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

// Chart skeleton
const ChartSkeleton: FC = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-5 w-1/4" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-64 w-full" />
    </CardContent>
  </Card>
);

// Table skeleton
export const TableSkeleton: FC<{ rows?: number }> = ({ rows = 5 }) => (
  <Card>
    <CardContent className="pt-6">
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </CardContent>
  </Card>
);

// Page header skeleton
export const PageHeaderSkeleton: FC = () => (
  <div className="flex items-center justify-between mb-6">
    <div className="space-y-2">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-72" />
    </div>
    <div className="flex gap-2">
      <Skeleton className="h-10 w-24" />
      <Skeleton className="h-10 w-24" />
    </div>
  </div>
);

// Content-aware KPI card skeleton
const KPICardSkeleton: FC<{ hero?: boolean }> = ({ hero }) => (
  <Card className={cn("overflow-hidden", hero && "relative")}>
    <CardContent className={cn("p-4 sm:p-6", hero && "sm:p-8")}>
      <div className="flex items-start justify-between">
        <div className="space-y-3 flex-1">
          <Shimmer className={cn("h-3 rounded-md", hero ? "w-24" : "w-16")} />
          <Shimmer className={cn("rounded-md", hero ? "h-10 w-44" : "h-7 w-24")} />
          <div className="flex items-center gap-2">
            <Shimmer className="h-5 w-14 rounded-md" />
            <Shimmer className="h-3 w-16 rounded-md" />
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Shimmer className={cn("rounded-xl", hero ? "h-14 w-14" : "h-10 w-10")} />
          {!hero && <Shimmer className="h-5 w-14 rounded-md" />}
        </div>
      </div>
      {hero && <Shimmer className="h-8 w-full mt-3 rounded-md" />}
    </CardContent>
  </Card>
);

// Content-aware chart skeleton
const ChartCardSkeleton: FC<{ className?: string }> = ({ className }) => (
  <Card className={className}>
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <Shimmer className="h-5 w-32" />
        <div className="flex gap-1.5">
          <Shimmer className="h-7 w-10 rounded-md" />
          <Shimmer className="h-7 w-10 rounded-md" />
          <Shimmer className="h-7 w-10 rounded-md" />
        </div>
      </div>
    </CardHeader>
    <CardContent>
      {/* Chart bars simulation */}
      <div className="flex items-end gap-1.5 h-48 pt-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <Shimmer
            key={i}
            className="flex-1 rounded-t-md"
            style={{ height: `${30 + Math.sin(i * 0.8) * 40 + 30}%` }}
          />
        ))}
      </div>
    </CardContent>
  </Card>
);

// Content-aware goal skeleton
const GoalCardSkeleton: FC = () => (
  <Card>
    <CardHeader className="pb-2">
      <Shimmer className="h-5 w-28" />
    </CardHeader>
    <CardContent className="flex flex-col items-center gap-4 py-6">
      {/* Circular progress ring skeleton */}
      <div className="relative h-28 w-28">
        <Shimmer className="absolute inset-0 rounded-full" />
        <div className="absolute inset-3 rounded-full bg-card" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Shimmer className="h-6 w-12 rounded-md" />
        </div>
      </div>
      <Shimmer className="h-3 w-36" />
      <Shimmer className="h-2 w-full rounded-full" />
    </CardContent>
  </Card>
);

// Dashboard loading skeleton — content-faithful shimmer
export const DashboardLoadingSkeleton: FC = () => (
  <div className="max-w-[1600px] mx-auto px-3 py-4 sm:px-4 sm:py-6 lg:px-6 lg:py-6 space-y-6" aria-busy="true" aria-label="Carregando dashboard">
    {/* Header */}
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Shimmer className="h-8 w-56 rounded-lg" />
        <Shimmer className="h-4 w-80 rounded-md" />
      </div>
      <Shimmer className="h-9 w-28 rounded-lg" />
    </div>

    {/* Hero KPIs — 2+1+1+1 grid (content-aware) */}
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-6">
      <div className="col-span-2">
        <KPICardSkeleton hero />
      </div>
      <KPICardSkeleton />
      <KPICardSkeleton />
      <KPICardSkeleton />
    </div>

    {/* Chart + Goal (content-aware) */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-6">
      <ChartCardSkeleton className="lg:col-span-2" />
      <GoalCardSkeleton />
    </div>

    {/* Collapsible section skeleton */}
    <div className="space-y-2">
      <div className="flex items-center gap-2 py-2">
        <Shimmer className="h-4 w-4 rounded" />
        <Shimmer className="h-5 w-24 rounded-md" />
        <Shimmer className="h-5 w-12 rounded-full" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 space-y-3">
              <Shimmer className="h-4 w-20" />
              <Shimmer className="h-24 w-full rounded-lg" />
              <Shimmer className="h-3 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </div>
);

// Vendedor dashboard skeleton
export const VendedorDashboardLoadingSkeleton: FC = () => (
  <div className="space-y-6 p-6">
    <PageHeaderSkeleton />
    <StatsGridSkeleton count={6} />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <ChartSkeleton />
      <ChartSkeleton />
      <ChartSkeleton />
    </div>
  </div>
);

// Analytics page skeleton
export const AnalyticsLoadingSkeleton: FC = () => (
  <div className="space-y-6 p-6">
    <PageHeaderSkeleton />
    <StatsGridSkeleton count={4} />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartSkeleton />
      <ChartSkeleton />
    </div>
  </div>
);

export const AnalyticsPageLoadingSkeleton = AnalyticsLoadingSkeleton;

// Pipeline loading skeleton
export const PipelineLoadingSkeleton: FC = () => (
  <div className="space-y-6 p-6">
    <PageHeaderSkeleton />
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i} className="min-w-[280px] flex-shrink-0">
          <CardHeader>
            <Skeleton className="h-5 w-24" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 3 }).map((_, j) => (
              <Skeleton key={j} className="h-24 w-full" />
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

// Ranking loading skeleton
export const RankingLoadingSkeleton: FC = () => (
  <div className="space-y-6 p-6">
    <PageHeaderSkeleton />
    <StatsGridSkeleton count={3} />
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

// SDR Dashboard skeleton
export const SDRDashboardLoadingSkeleton: FC = () => (
  <div className="space-y-6 p-6">
    <PageHeaderSkeleton />
    <StatsGridSkeleton count={6} />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartSkeleton />
      <ChartSkeleton />
    </div>
  </div>
);

// Closer Dashboard skeleton
export const CloserDashboardLoadingSkeleton: FC = () => (
  <div className="space-y-6 p-6">
    <PageHeaderSkeleton />
    <StatsGridSkeleton count={4} />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartSkeleton />
      <TableSkeleton rows={5} />
    </div>
  </div>
);

// Metas skeleton
export const MetasLoadingSkeleton: FC = () => (
  <div className="space-y-6 p-6">
    <PageHeaderSkeleton />
    <StatsGridSkeleton count={4} />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartSkeleton />
      <ChartSkeleton />
    </div>
  </div>
);

// Metas Atividades skeleton
export const MetasAtividadesLoadingSkeleton: FC = () => (
  <div className="space-y-6 p-6">
    <PageHeaderSkeleton />
    <StatsGridSkeleton count={4} />
    <ChartSkeleton />
  </div>
);

// Playbooks skeleton
export const PlaybooksLoadingSkeleton: FC = () => (
  <div className="space-y-6 p-6">
    <PageHeaderSkeleton />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  </div>
);

// Cadencias skeleton
export const CadenciasLoadingSkeleton: FC = () => (
  <div className="space-y-6 p-6">
    <PageHeaderSkeleton />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  </div>
);

// Times skeleton
export const TimesLoadingSkeleton: FC = () => (
  <div className="space-y-6 p-6">
    <PageHeaderSkeleton />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  </div>
);

// Notificacoes skeleton
export const NotificacoesLoadingSkeleton: FC = () => (
  <div className="space-y-6 p-6">
    <PageHeaderSkeleton />
    <Card>
      <CardContent className="pt-6 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-start gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  </div>
);

// Fonte Leads skeleton
export const FonteLeadsLoadingSkeleton: FC = () => (
  <div className="space-y-6 p-6">
    <PageHeaderSkeleton />
    <StatsGridSkeleton count={4} />
    <ChartSkeleton />
  </div>
);

// Vendas skeleton
export const VendasLoadingSkeleton: FC = () => (
  <div className="space-y-6 p-6">
    <PageHeaderSkeleton />
    <TableSkeleton rows={10} />
  </div>
);

// Tarefas skeleton
export const TarefasLoadingSkeleton: FC = () => (
  <div className="space-y-6 p-6">
    <PageHeaderSkeleton />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-5 w-24" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 4 }).map((_, j) => (
              <Skeleton key={j} className="h-20 w-full" />
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

// Relatorios skeleton
export const RelatoriosLoadingSkeleton: FC = () => (
  <div className="space-y-6 p-6">
    <PageHeaderSkeleton />
    <StatsGridSkeleton count={4} />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartSkeleton />
      <TableSkeleton />
    </div>
  </div>
);

// Relatorio Atividades skeleton
export const RelatorioAtividadesLoadingSkeleton: FC = () => (
  <div className="space-y-6 p-6">
    <PageHeaderSkeleton />
    <StatsGridSkeleton count={4} />
    <ChartSkeleton />
    <TableSkeleton rows={8} />
  </div>
);

// Atividades skeleton
export const AtividadesLoadingSkeleton: FC = () => (
  <div className="space-y-6 p-6">
    <PageHeaderSkeleton />
    <StatsGridSkeleton count={4} />
    <TableSkeleton rows={8} />
  </div>
);

// Portfolio skeleton
export const PortfolioLoadingSkeleton: FC = () => (
  <div className="space-y-6 p-6">
    <PageHeaderSkeleton />
    <StatsGridSkeleton count={4} />
    <TableSkeleton rows={10} />
  </div>
);

// Clientes skeleton
export const ClientesLoadingSkeleton: FC = () => (
  <div className="space-y-6 p-6">
    <PageHeaderSkeleton />
    <TableSkeleton rows={10} />
  </div>
);

// Produtos skeleton
export const ProdutosLoadingSkeleton: FC = () => (
  <div className="space-y-6 p-6">
    <PageHeaderSkeleton />
    <TableSkeleton rows={10} />
  </div>
);

// Vendedores skeleton
export const VendedoresLoadingSkeleton: FC = () => (
  <div className="space-y-6 p-6">
    <PageHeaderSkeleton />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  </div>
);

// Configuracoes skeleton  
export const ConfiguracoesLoadingSkeleton: FC = () => (
  <div className="space-y-6 p-6">
    <PageHeaderSkeleton />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-1">
        <CardContent className="pt-6 space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
      <Card className="lg:col-span-2">
        <CardContent className="pt-6 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  </div>
);

// Index skeleton
export const IndexLoadingSkeleton: FC = () => (
  <div className="space-y-6 p-6">
    <PageHeaderSkeleton />
    <StatsGridSkeleton count={4} />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartSkeleton />
      <ChartSkeleton />
    </div>
    <TableSkeleton />
  </div>
);

// Gamification skeleton
export const GamificationLoadingSkeleton: FC = () => (
  <div className="space-y-6 p-6">
    <PageHeaderSkeleton />
    <StatsGridSkeleton count={3} />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartSkeleton />
      <Card>
        <CardContent className="pt-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  </div>
);
