import { FC } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Shimmer, SkeletonCard, StatsGridSkeleton, ChartSkeleton, TableSkeleton,
  PageHeaderSkeleton, KPICardSkeleton, ChartCardSkeleton, GoalCardSkeleton,
} from './SkeletonPrimitives';
import { PageTransition } from '@/components/transitions/PageTransition';
import { StaggeredContainer } from '@/components/transitions/PageTransition';

// Re-export primitives for backward compatibility
export { SkeletonCard, TableSkeleton, PageHeaderSkeleton } from './SkeletonPrimitives';

// Dashboard loading skeleton — content-faithful shimmer
export const DashboardLoadingSkeleton: FC = () => (
  <StaggeredContainer className="max-w-[1600px] mx-auto px-3 py-4 sm:px-4 sm:py-6 lg:px-6 lg:py-6 space-y-6" aria-busy="true" aria-label="Carregando dashboard">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Shimmer className="h-8 w-56 rounded-lg" />
        <Shimmer className="h-4 w-80 rounded-md" />
      </div>
      <Shimmer className="h-9 w-28 rounded-lg" />
    </div>
    
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-6">
      <div className="col-span-2"><KPICardSkeleton hero /></div>
      <KPICardSkeleton />
      <KPICardSkeleton />
      <KPICardSkeleton />
    </div>
    
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-6">
      <ChartCardSkeleton className="lg:col-span-2" />
      <GoalCardSkeleton />
    </div>
    
    <div className="space-y-2">
      <div className="flex items-center gap-2 py-2">
        <Shimmer className="h-4 w-4 rounded" />
        <Shimmer className="h-5 w-24 rounded-md" />
        <Shimmer className="h-5 w-12 rounded-full" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-primary/5 bg-background/20">
            <CardContent className="p-4 space-y-3">
              <Shimmer className="h-4 w-20" />
              <Shimmer className="h-24 w-full rounded-lg" />
              <Shimmer className="h-3 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </StaggeredContainer>
);

export const VendedorDashboardLoadingSkeleton: FC = () => (
  <StaggeredContainer className="space-y-6 p-6">
    <PageHeaderSkeleton />
    <StatsGridSkeleton count={6} />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <ChartSkeleton />
      <ChartSkeleton />
      <ChartSkeleton />
    </div>
  </StaggeredContainer>
);

export const AnalyticsLoadingSkeleton: FC = () => (
  <div className="space-y-6 p-6"><PageHeaderSkeleton /><StatsGridSkeleton count={4} /><div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><ChartSkeleton /><ChartSkeleton /></div></div>
);
export const AnalyticsPageLoadingSkeleton = AnalyticsLoadingSkeleton;

export const PipelineLoadingSkeleton: FC = () => (
  <div className="space-y-6 p-6"><PageHeaderSkeleton /><div className="flex gap-4 overflow-hidden">{Array.from({ length: 5 }).map((_, i) => (<Card key={i} className="min-w-[280px] flex-shrink-0"><CardHeader><Skeleton className="h-5 w-24" /></CardHeader><CardContent className="space-y-3">{Array.from({ length: 3 }).map((_, j) => <Skeleton key={j} className="h-24 w-full" />)}</CardContent></Card>))}</div></div>
);

export const RankingLoadingSkeleton: FC = () => (
  <div className="space-y-6 p-6"><PageHeaderSkeleton /><StatsGridSkeleton count={3} /><Card><CardContent className="pt-6"><div className="space-y-4">{Array.from({ length: 10 }).map((_, i) => (<div key={i} className="flex items-center gap-4"><Skeleton className="h-10 w-10 rounded-full" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-1/3" /><Skeleton className="h-3 w-1/4" /></div><Skeleton className="h-6 w-16" /></div>))}</div></CardContent></Card></div>
);

export const SDRDashboardLoadingSkeleton: FC = () => (
  <div className="space-y-6 p-6"><PageHeaderSkeleton /><StatsGridSkeleton count={6} /><div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><ChartSkeleton /><ChartSkeleton /></div></div>
);

export const CloserDashboardLoadingSkeleton: FC = () => (
  <div className="space-y-6 p-6"><PageHeaderSkeleton /><StatsGridSkeleton count={4} /><div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><ChartSkeleton /><TableSkeleton rows={5} /></div></div>
);

export const MetasLoadingSkeleton: FC = () => (
  <div className="space-y-6 p-6"><PageHeaderSkeleton /><StatsGridSkeleton count={4} /><div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><ChartSkeleton /><ChartSkeleton /></div></div>
);

export const MetasAtividadesLoadingSkeleton: FC = () => (
  <div className="space-y-6 p-6"><PageHeaderSkeleton /><StatsGridSkeleton count={4} /><ChartSkeleton /></div>
);

export const PlaybooksLoadingSkeleton: FC = () => (
  <div className="space-y-6 p-6"><PageHeaderSkeleton /><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}</div></div>
);

export const CadenciasLoadingSkeleton: FC = () => (
  <div className="space-y-6 p-6"><PageHeaderSkeleton /><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}</div></div>
);

export const TimesLoadingSkeleton: FC = () => (
  <div className="space-y-6 p-6"><PageHeaderSkeleton /><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}</div></div>
);

export const NotificacoesLoadingSkeleton: FC = () => (
  <div className="space-y-6 p-6"><PageHeaderSkeleton /><Card><CardContent className="pt-6 space-y-4">{Array.from({ length: 5 }).map((_, i) => (<div key={i} className="flex items-start gap-4"><Skeleton className="h-10 w-10 rounded-full" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /></div></div>))}</CardContent></Card></div>
);

export const FonteLeadsLoadingSkeleton: FC = () => (
  <div className="space-y-6 p-6"><PageHeaderSkeleton /><StatsGridSkeleton count={4} /><ChartSkeleton /></div>
);

export const VendasLoadingSkeleton: FC = () => (
  <div className="space-y-6 p-6"><PageHeaderSkeleton /><TableSkeleton rows={10} /></div>
);

export const TarefasLoadingSkeleton: FC = () => (
  <div className="space-y-6 p-6"><PageHeaderSkeleton /><div className="grid grid-cols-1 md:grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, i) => (<Card key={i}><CardHeader><Skeleton className="h-5 w-24" /></CardHeader><CardContent className="space-y-3">{Array.from({ length: 4 }).map((_, j) => <Skeleton key={j} className="h-20 w-full" />)}</CardContent></Card>))}</div></div>
);

export const RelatoriosLoadingSkeleton: FC = () => (
  <div className="space-y-6 p-6"><PageHeaderSkeleton /><StatsGridSkeleton count={4} /><div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><ChartSkeleton /><TableSkeleton /></div></div>
);

export const RelatorioAtividadesLoadingSkeleton: FC = () => (
  <div className="space-y-6 p-6"><PageHeaderSkeleton /><StatsGridSkeleton count={4} /><ChartSkeleton /><TableSkeleton rows={8} /></div>
);

export const AtividadesLoadingSkeleton: FC = () => (
  <div className="space-y-6 p-6"><PageHeaderSkeleton /><StatsGridSkeleton count={4} /><TableSkeleton rows={8} /></div>
);

export const PortfolioLoadingSkeleton: FC = () => (
  <div className="space-y-6 p-6"><PageHeaderSkeleton /><StatsGridSkeleton count={4} /><TableSkeleton rows={10} /></div>
);

export const ClientesLoadingSkeleton: FC = () => (
  <div className="space-y-6 p-6"><PageHeaderSkeleton /><TableSkeleton rows={10} /></div>
);

export const ProdutosLoadingSkeleton: FC = () => (
  <div className="space-y-6 p-6"><PageHeaderSkeleton /><TableSkeleton rows={10} /></div>
);

export const VendedoresLoadingSkeleton: FC = () => (
  <div className="space-y-6 p-6">
    <PageHeaderSkeleton />
    {/* Podium skeleton — mimics 2nd/1st/3rd layout */}
    <div className="flex items-end justify-center gap-4 py-8">
      <div className="flex flex-col items-center gap-2">
        <Skeleton className="h-16 w-16 rounded-full" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-24 w-28 rounded-t-lg" />
      </div>
      <div className="flex flex-col items-center gap-2 -mt-6">
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-20 w-20 rounded-full" />
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-32 w-32 rounded-t-lg" />
      </div>
      <div className="flex flex-col items-center gap-2">
        <Skeleton className="h-16 w-16 rounded-full" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-20 w-28 rounded-t-lg" />
      </div>
    </div>
    {/* Grid skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  </div>
);

export const ConfiguracoesLoadingSkeleton: FC = () => (
  <div className="space-y-6 p-6"><PageHeaderSkeleton /><div className="grid grid-cols-1 lg:grid-cols-3 gap-6"><Card className="lg:col-span-1"><CardContent className="pt-6 space-y-2">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</CardContent></Card><Card className="lg:col-span-2"><CardContent className="pt-6 space-y-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</CardContent></Card></div></div>
);

export const IndexLoadingSkeleton: FC = () => (
  <div className="space-y-6 p-6"><PageHeaderSkeleton /><StatsGridSkeleton count={4} /><div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><ChartSkeleton /><ChartSkeleton /></div><TableSkeleton /></div>
);

export const GamificationLoadingSkeleton: FC = () => (
  <div className="space-y-6 p-6"><PageHeaderSkeleton /><StatsGridSkeleton count={3} /><div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><ChartSkeleton /><Card><CardContent className="pt-6 space-y-4">{Array.from({ length: 5 }).map((_, i) => (<div key={i} className="flex items-center gap-4"><Skeleton className="h-12 w-12 rounded-full" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-1/2" /><Skeleton className="h-3 w-1/3" /></div></div>))}</CardContent></Card></div></div>
);
