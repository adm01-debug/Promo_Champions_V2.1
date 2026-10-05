import { useMemo, useState, lazy, Suspense } from 'react';
import { DollarSign, TrendingDown, AlertTriangle, Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { usePricingIntelligence } from '@/hooks/usePricingIntelligence';
import { PricingHeader } from './PricingHeader';
import { PricingHealthBanner } from './PricingHealthBanner';
import { PricingKpiCard } from './PricingKpiCard';
import { PricingDistributionCard } from './PricingDistributionCard';
import { CompetitorRadarCard } from './CompetitorRadarCard';
import { TopDiscountersCard } from './TopDiscountersCard';
import { ProductRecommenderCard } from './ProductRecommenderCard';
import { MarginAlertsCard } from './MarginAlertsCard';

const DiscountOptimizer = lazy(() =>
  import('./DiscountOptimizer').then(m => ({ default: m.DiscountOptimizer }))
);
const PriceElasticityChart = lazy(() =>
  import('./PriceElasticityChart').then(m => ({ default: m.PriceElasticityChart }))
);
const RevenueLeakageCard = lazy(() =>
  import('./RevenueLeakageCard').then(m => ({ default: m.RevenueLeakageCard }))
);

export function PricingIntelligenceHub() {
  const [days, setDays] = useState<7 | 30 | 90>(30);
  const { data, isLoading } = usePricingIntelligence(days);

  const distribution = useMemo(
    () =>
      (data?.distribution ?? []).map(d => ({
        ...d,
        revenueShort: Math.round(d.revenue),
      })),
    [data]
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-80 w-full rounded-xl" />
      </div>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          Sem dados de pricing disponíveis para o período.
        </CardContent>
      </Card>
    );
  }

  const k = data.kpis;

  return (
    <div className="space-y-10 relative pb-20">
      {/* Background Decor Imersivo de Alta Performance */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-primary/5 blur-[160px] rounded-full animate-pulse" />
        <div
          className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-info/5 blur-[140px] rounded-full animate-pulse"
          style={{ animationDelay: '1s' }}
        />
        <div className="absolute top-[20%] left-[20%] w-[400px] h-[400px] bg-success/5 blur-[120px] rounded-full" />
      </div>

      {/* Header Premium com Efeito Glass e Floating Action */}
      <PricingHeader days={days} onDaysChange={setDays} />

      {/* Health banner Premium */}
      <PricingHealthBanner health={data.health} dealsCount={data.kpis.deals_count} />

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <PricingKpiCard
          icon={DollarSign}
          label="Ticket médio"
          numericValue={k.avg_ticket}
          isCurrency
          accent="text-info"
        />
        <PricingKpiCard
          icon={TrendingDown}
          label="Desconto médio"
          numericValue={k.avg_discount_pct * 100}
          isPercent
          accent={k.avg_discount_pct > 0.15 ? 'text-warning' : 'text-foreground'}
        />
        <PricingKpiCard
          icon={AlertTriangle}
          label="Receita perdida"
          numericValue={k.revenue_lost}
          isCurrency
          accent="text-destructive"
        />
        <PricingKpiCard
          icon={Target}
          label="Deals em alerta"
          numericValue={k.alerted_deals}
          accent={k.alert_ratio > 0.2 ? 'text-destructive' : 'text-foreground'}
        />
      </div>

      {/* Revenue Leakage Map */}
      <Suspense fallback={<Skeleton className="h-40 w-full rounded-xl" />}>
        <RevenueLeakageCard
          totalLost={k.revenue_lost}
          discountLost={data.leakage_segments?.discount ?? k.revenue_lost * 0.55}
          competitorLost={data.leakage_segments?.competitor ?? k.revenue_lost * 0.3}
          marginErosion={data.leakage_segments?.erosion ?? k.revenue_lost * 0.15}
        />
      </Suspense>

      {/* Price Elasticity Chart */}
      <Suspense fallback={<Skeleton className="h-80 w-full rounded-xl" />}>
        <PriceElasticityChart />
      </Suspense>

      {/* Simulator */}
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
        <DiscountOptimizer />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution chart */}
        <PricingDistributionCard distribution={distribution} />

        {/* Competitor Threats */}
        <CompetitorRadarCard threats={data.competitor_threats} />
      </div>

      {/* Listas Detalhadas com Visual Premium de Alta Performance */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Top discounters */}
        <TopDiscountersCard discounters={data.top_discounters} />

        {/* Product recommendations */}
        <ProductRecommenderCard recommendations={data.product_recommendations} />
      </div>
      {/* Ocultando antigo competitor threats pois foi integrado acima */}

      {/* Margin Alerts - Passo 4 Premium */}
      <MarginAlertsCard />
    </div>
  );
}
