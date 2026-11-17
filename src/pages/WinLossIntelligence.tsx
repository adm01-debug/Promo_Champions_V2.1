import { Helmet } from 'react-helmet-async';
import { useMemo, useState, useCallback, useRef, useEffect, type ReactNode } from 'react';
import { PageTransition } from '@/components/transitions/PageTransition';

import { WinLossPageHeader } from '@/components/win-loss/WinLossPageHeader';
import { WinLossFilters } from '@/components/win-loss/WinLossFilters';
import { WinLossKpiBanner } from '@/components/win-loss/WinLossKpiBanner';
import { WinLossTrendChart } from '@/components/win-loss/WinLossTrendChart';
import { WinLossReasonMatrix } from '@/components/win-loss/WinLossReasonMatrix';
import { SalespersonWinLossTable } from '@/components/win-loss/SalespersonWinLossTable';
import { CompetitorBattleCard } from '@/components/win-loss/CompetitorBattleCard';
import { ActionableInsightsPanel } from '@/components/win-loss/ActionableInsightsPanel';
import { APP_URL } from '@/config/external';
import {
  WinLossDealsDrawer,
  type DrawerFilter,
} from '@/components/win-loss/WinLossDealsDrawer';
import { WinLossEmptyState } from '@/components/win-loss/WinLossEmptyState';
import { WinLossLastRunCard } from '@/components/win-loss/WinLossLastRunCard';
import { WinLossPrintLayout } from '@/components/win-loss/WinLossPrintLayout';
import { WinLossCohortHeatmap } from '@/components/win-loss/WinLossCohortHeatmap';
import { WinLossAnomalyBanner } from '@/components/win-loss/WinLossAnomalyBanner';
import { CycleTimeHistogram } from '@/components/win-loss/CycleTimeHistogram';
import { LossReasonFlow } from '@/components/win-loss/LossReasonFlow';
import { WinLossQuickFilterChips } from '@/components/win-loss/WinLossQuickFilterChips';
import { NextBestWinLossCard } from '@/components/win-loss/NextBestWinLossCard';
import { InsightsImpactPanel } from '@/components/win-loss/InsightsImpactPanel';
import { WinByHourHeatmap } from '@/components/win-loss/WinByHourHeatmap';
import { ScriptABPanel } from '@/components/win-loss/ScriptABPanel';
import { WinLossSectionSkeleton } from '@/components/win-loss/WinLossSectionSkeleton';
import { WinLossErrorBoundary } from '@/components/win-loss/WinLossErrorBoundary';
import { ScenarioForecastChart } from '@/components/win-loss/ScenarioForecastChart';
import { ICPCorrelationMatrix } from '@/components/win-loss/ICPCorrelationMatrix';
import { SentimentTrendChart } from '@/components/win-loss/SentimentTrendChart';
import { SeasonComparisonPanel } from '@/components/win-loss/SeasonComparisonPanel';
import { AtRiskDealsFromPatterns } from '@/components/win-loss/AtRiskDealsFromPatterns';
import { WebhookSubscriptionsPanel } from '@/components/win-loss/WebhookSubscriptionsPanel';
import { WebhookHealthPanel } from '@/components/win-loss/WebhookHealthPanel';
import { WebhookDeadLetterPanel } from '@/components/win-loss/WebhookDeadLetterPanel';
import { ExportPdfButton } from '@/components/win-loss/ExportPdfButton';
import { DashboardLayoutEditor } from '@/components/win-loss/DashboardLayoutEditor';
import type { WidgetId } from '@/hooks/win-loss/useUserDashboardLayout';

import { useWinLossFilters } from '@/hooks/win-loss/useWinLossFilters';
import {
  useWinLossViewPrefs,
  VIEW_PREFS_DEFAULTS,
} from '@/hooks/win-loss/useWinLossViewPrefs';
import { toast } from 'sonner';
import { useFilteredWinLossAnalyses } from '@/hooks/win-loss/useWinLossData';
import {
  aggregateByCompetitor,
  aggregateReasonMatrix,
  useWLKpis,
  useWLTrend,
} from '@/hooks/win-loss/useWinLossAggregations';
import { useSalespersonWinLossStats } from '@/hooks/win-loss/useWinLossSalespersonStats';
import { useWinLossRealtime } from '@/hooks/win-loss/useWinLossRealtime';
import { useRunWinLossAnalysis } from '@/hooks/win-loss/useRunWinLossAnalysis';
import { useWinLossExport } from '@/hooks/win-loss/useWinLossExport';
import { useWinLossShortcuts } from '@/hooks/win-loss/useWinLossShortcuts';
import {
  usePreviousKpisComputed,
  computeKpiDelta,
} from '@/hooks/win-loss/usePreviousPeriodKpis';
import { useWinLossForecast } from '@/hooks/win-loss/useWinLossForecast';
import { useWinLossTelemetry } from '@/hooks/win-loss/useWinLossTelemetry';
import { useWinLossAnomalies } from '@/hooks/win-loss/useWinLossAnomalies';
import { useWinLossDigest } from '@/hooks/win-loss/useWinLossDigest';
import { useWinLossInsights } from '@/hooks/deal-intelligence/useWinLoss';
import type { SavedView } from '@/hooks/win-loss/useWinLossSavedViews';
import { WIN_LOSS_OUTCOME } from '@/constants';

const SITE = APP_URL;

export default function WinLossIntelligence() {
  const insightsRef = useRef<HTMLDivElement | null>(null);
  const [pulse, setPulse] = useState(false);

  const focusInsights = useCallback(() => {
    insightsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setPulse(true);
    setTimeout(() => setPulse(false), 3000);
  }, []);

  useWinLossRealtime({ onNewPattern: focusInsights });

  const { filters, setFilters, reset } = useWinLossFilters();
  const {
    prefs: viewPrefs,
    update: updateViewPrefs,
    reset: resetViewPrefs,
  } = useWinLossViewPrefs();
  const viewPrefsAreDefault =
    viewPrefs.granularity === VIEW_PREFS_DEFAULTS.granularity &&
    viewPrefs.forecastHorizon === VIEW_PREFS_DEFAULTS.forecastHorizon;
  const handleResetViewPrefs = useCallback(() => {
    resetViewPrefs();
    toast.success('Preferências de visualização restauradas', {
      description: 'Granularidade Mensal · Horizonte 3 períodos',
    });
  }, [resetViewPrefs]);
  const { data: allRows = [], isLoading } = useFilteredWinLossAnalyses(filters);

  // Quick filter overlay state (client-side, doesn't refetch)
  const [outcomeFilter, setOutcomeFilter] = useState<'won' | 'lost' | null>(null);
  const [competitorFilter, setCompetitorFilter] = useState<string | null>(null);

  const rows = useMemo(() => {
    return allRows.filter(r => {
      if (outcomeFilter && r.outcome !== outcomeFilter) return false;
      if (competitorFilter && r.competitor !== competitorFilter) return false;
      return true;
    });
  }, [allRows, outcomeFilter, competitorFilter]);

  const kpis = useWLKpis(rows);
  const monthly = useWLTrend(rows, 'month');
  const weekly = useWLTrend(rows, 'week');
  const competitors = useMemo(() => aggregateByCompetitor(rows), [rows]);
  const matrix = useMemo(() => aggregateReasonMatrix(rows), [rows]);
  const { data: spStats = [], isLoading: spLoading } = useSalespersonWinLossStats(rows);

  const { kpis: prevKpis } = usePreviousKpisComputed(filters);
  const delta = useMemo(() => computeKpiDelta(kpis, prevKpis), [kpis, prevKpis]);
  const forecast = useWinLossForecast(monthly, 8);
  const anomaly = useWinLossAnomalies(weekly);
  const track = useWinLossTelemetry();

  const { data: insightsData = [] } = useWinLossInsights();
  const digest = useWinLossDigest(
    kpis,
    delta,
    insightsData.map(i => ({
      title: i.title,
      description: i.description ?? null,
      severity: i.severity ?? null,
    })),
    competitors
  );

  const runAnalysis = useRunWinLossAnalysis();
  const exportCsv = useWinLossExport(rows);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTitle, setDrawerTitle] = useState('');
  const [drawerFilter, setDrawerFilter] = useState<DrawerFilter | undefined>(undefined);

  const openDrawer = useCallback(
    (title: string, filter?: DrawerFilter) => {
      setDrawerTitle(title);
      setDrawerFilter(filter);
      setDrawerOpen(true);
      track('winloss_drill', { title, ...filter });
    },
    [track]
  );

  const onWins = () => openDrawer(`${kpis.wins} deals ganhos`, { outcome: 'won' });
  const onLosses = () => openDrawer(`${kpis.losses} deals perdidos`, { outcome: 'lost' });
  const onPeriod = (period: string) => openDrawer(`Deals em ${period}`, { period });
  const onMatrix = (reason: string, stage: string) =>
    openDrawer(`${reason} · ${stage}`, { outcome: 'lost', reason, stage });
  const onCompetitor = (name: string) => openDrawer(`vs. ${name}`, { competitor: name });
  const onSalesperson = (id: string, name: string) => {
    setFilters({ salespersonIds: [id] });
    openDrawer(`Deals de ${name}`);
  };
  const onCohort = (created: string, closed: string) =>
    openDrawer(`Cohort ${created} → ${closed}`);
  const onCycleBin = (bin: string, outcome: 'won' | 'lost') =>
    openDrawer(`Ciclo ${bin} · ${outcome === WIN_LOSS_OUTCOME.WON ? 'Won' : 'Lost'}`, {
      outcome,
    });
  const onLossLeaf = (stage: string, reason: string) =>
    openDrawer(`${reason} · ${stage}`, { outcome: 'lost', reason, stage });

  const handleExport = useCallback(() => {
    track('winloss_export', { count: rows.length });
    exportCsv();
  }, [exportCsv, rows.length, track]);

  const handleRun = useCallback(() => {
    track('winloss_run');
    runAnalysis.mutate();
  }, [runAnalysis, track]);

  const handlePrint = useCallback(() => {
    track('winloss_print');
    window.print();
  }, [track]);

  const handleCopyDigest = useCallback(() => {
    track('winloss_digest');
    track('winloss_digest_copied');
    digest();
  }, [digest, track]);

  const handleLoadView = useCallback(
    (v: SavedView) => {
      track('winloss_load_view', { name: v.name });
      track('winloss_view_saved', { name: v.name });
      setFilters(v.filters);
    },
    [setFilters, track]
  );

  const handleQuickFilter = useCallback(
    (patch: {
      filters?: Partial<typeof filters>;
      outcome?: 'won' | 'lost' | null;
      competitor?: string | null;
    }) => {
      if (patch.filters) setFilters(patch.filters);
      if (patch.outcome !== undefined) setOutcomeFilter(patch.outcome);
      if (patch.competitor !== undefined) setCompetitorFilter(patch.competitor);
      track('winloss_quick_filter', { ...patch });
      track('winloss_quick_filter_clicked', { ...patch });
    },
    [setFilters, track]
  );

  // Filter-applied telemetry whenever active filters change
  useEffect(() => {
    track('winloss_filter_applied', {
      period: filters.period,
      hasSalesperson: filters.salespersonIds.length > 0,
      hasSegment: filters.segments.length > 0,
      minAmount: filters.minAmount,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- dependencias intencionais (comportamento pre-existente verificado)
  }, [filters]);

  useWinLossShortcuts({
    onExport: handleExport,
    onRun: handleRun,
    onEscape: () => setDrawerOpen(false),
  });

  const isEmpty = !isLoading && allRows.length === 0;
  const url = `${SITE}/win-loss-intelligence`;

  const winLossWidgets: Record<
    WidgetId,
    { label: string; node: ReactNode; className?: string }
  > = {
    kpi: {
      label: 'KPIs',
      className: 'lg:col-span-6',
      node: (
        <WinLossErrorBoundary section="KPIs">
          <WinLossKpiBanner
            kpis={kpis}
            onWinsClick={onWins}
            onLossesClick={onLosses}
            delta={delta}
            forecast={forecast}
          />
        </WinLossErrorBoundary>
      ),
    },
    'next-best': {
      label: 'Next Best Action',
      className: 'lg:col-span-6 no-print',
      node: (
        <WinLossErrorBoundary section="Next Best Action">
          <NextBestWinLossCard />
        </WinLossErrorBoundary>
      ),
    },
    trend: {
      label: 'Tendência',
      className: 'lg:col-span-4',
      node: (
        <WinLossErrorBoundary section="Tendência" fallbackHeight={260}>
          <WinLossTrendChart
            monthly={monthly}
            weekly={weekly}
            granularity={viewPrefs.granularity}
            onGranularityChange={g => updateViewPrefs({ granularity: g })}
            onPointClick={onPeriod}
          />
        </WinLossErrorBoundary>
      ),
    },
    matrix: {
      label: 'Matriz de motivos',
      className: 'lg:col-span-2',
      node: (
        <WinLossErrorBoundary section="Matriz de motivos" fallbackHeight={260}>
          <WinLossReasonMatrix cells={matrix} onCellClick={onMatrix} />
        </WinLossErrorBoundary>
      ),
    },
    cycle: {
      label: 'Histograma de ciclo',
      className: 'lg:col-span-3',
      node: (
        <WinLossErrorBoundary section="Histograma de ciclo" fallbackHeight={220}>
          <CycleTimeHistogram rows={rows} onBinClick={onCycleBin} />
        </WinLossErrorBoundary>
      ),
    },
    'loss-flow': {
      label: 'Funil de perdas',
      className: 'lg:col-span-3',
      node: (
        <WinLossErrorBoundary section="Funil de perdas" fallbackHeight={220}>
          <LossReasonFlow rows={rows} onLeafClick={onLossLeaf} />
        </WinLossErrorBoundary>
      ),
    },
    cohort: {
      label: 'Cohort',
      className: 'lg:col-span-6',
      node: (
        <WinLossErrorBoundary section="Cohort">
          <WinLossCohortHeatmap rows={rows} onCellClick={onCohort} />
        </WinLossErrorBoundary>
      ),
    },
    'win-by-hour': {
      label: 'Heatmap horário',
      className: 'lg:col-span-6',
      node: (
        <WinLossErrorBoundary section="Heatmap horário">
          <WinByHourHeatmap onCellClick={(d, h) => openDrawer(`Fechamentos ${d}h${h}`)} />
        </WinLossErrorBoundary>
      ),
    },
    salespeople: {
      label: 'Vendedores',
      className: 'lg:col-span-6',
      node: (
        <WinLossErrorBoundary section="Vendedores">
          <SalespersonWinLossTable
            stats={spStats}
            isLoading={spLoading}
            onRowClick={onSalesperson}
          />
        </WinLossErrorBoundary>
      ),
    },
    competitors: {
      label: 'Concorrentes',
      className: 'lg:col-span-6',
      node: (
        <WinLossErrorBoundary section="Concorrentes">
          <CompetitorBattleCard
            competitors={competitors}
            onCompetitorClick={onCompetitor}
          />
        </WinLossErrorBoundary>
      ),
    },
    'script-ab': {
      label: 'Script A/B',
      className: 'lg:col-span-6',
      node: (
        <WinLossErrorBoundary section="Script A/B">
          <ScriptABPanel />
        </WinLossErrorBoundary>
      ),
    },
    scenarios: {
      label: 'Forecast cenários',
      className: 'lg:col-span-3',
      node: (
        <WinLossErrorBoundary section="Forecast cenários" fallbackHeight={260}>
          <ScenarioForecastChart
            points={monthly}
            horizon={viewPrefs.forecastHorizon}
            onHorizonChange={h => updateViewPrefs({ forecastHorizon: h })}
          />
        </WinLossErrorBoundary>
      ),
    },
    icp: {
      label: 'ICP correlação',
      className: 'lg:col-span-3',
      node: (
        <WinLossErrorBoundary section="ICP correlação" fallbackHeight={260}>
          <ICPCorrelationMatrix rows={rows} />
        </WinLossErrorBoundary>
      ),
    },
    sentiment: {
      label: 'Sentimento × Win',
      className: 'lg:col-span-3',
      node: (
        <WinLossErrorBoundary section="Sentimento × Win" fallbackHeight={260}>
          <SentimentTrendChart />
        </WinLossErrorBoundary>
      ),
    },
    season: {
      label: 'Comparativo de safras',
      className: 'lg:col-span-3',
      node: (
        <WinLossErrorBoundary section="Comparativo de safras">
          <SeasonComparisonPanel rows={rows} />
        </WinLossErrorBoundary>
      ),
    },
    'at-risk': {
      label: 'Deals em risco e webhooks',
      className: 'lg:col-span-6',
      node: (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <WinLossErrorBoundary section="Deals em risco">
            <AtRiskDealsFromPatterns />
          </WinLossErrorBoundary>
          <WinLossErrorBoundary section="Webhooks">
            <div className="space-y-4">
              <WebhookHealthPanel />
              <WebhookSubscriptionsPanel />
            </div>
          </WinLossErrorBoundary>
          <WinLossErrorBoundary section="Webhooks Dead Letter">
            <WebhookDeadLetterPanel />
          </WinLossErrorBoundary>
        </div>
      ),
    },
  };

  return (
    <>
      <Helmet>
        <title>Win/Loss Intelligence | Promo Champions</title>
        <meta
          name="description"
          content="Análise robusta de vitórias e derrotas com IA, filtros, tendências, drill-down por deal e battle cards de concorrentes."
        />
        <link rel="canonical" href={url} />
        <meta property="og:title" content="Win/Loss Intelligence | Promo Champions" />
        <meta
          property="og:description"
          content="Padrões de win/loss, tendências e benchmarks por vendedor com inteligência artificial."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={url} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      {/* Skip-link a11y AAA */}
      <a
        href="#wl-insights"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-60 focus:bg-primary focus:text-primary-foreground focus:px-3 focus:py-1.5 focus:rounded-md focus:text-sm"
      >
        Pular para insights
      </a>

      <PageTransition>
        <div
          className="space-y-4 pb-[env(safe-area-inset-bottom)]"
          role="main"
          aria-label="Win/Loss Intelligence"
        >
          <WinLossPageHeader
            onRun={handleRun}
            onExport={handleExport}
            onPrint={handlePrint}
            onCopyDigest={handleCopyDigest}
            isRunning={runAnalysis.isPending}
            filters={filters}
            onLoadView={handleLoadView}
          />

          <div className="flex justify-end no-print">
            <ExportPdfButton filters={filters} />
          </div>

          <div className="no-print">
            <WinLossFilters
              filters={filters}
              onChange={setFilters}
              onReset={reset}
              onResetViewPrefs={handleResetViewPrefs}
              viewPrefsAreDefault={viewPrefsAreDefault}
            />
          </div>

          {!isEmpty && !isLoading && (
            <WinLossQuickFilterChips
              filters={filters}
              topCompetitor={competitors[0]}
              outcomeFilter={outcomeFilter}
              competitorFilter={competitorFilter}
              onApply={handleQuickFilter}
            />
          )}

          {anomaly.isAnomaly && (
            <WinLossAnomalyBanner anomaly={anomaly} onInvestigate={onPeriod} />
          )}

          <WinLossPrintLayout kpis={kpis} />

          <div className="no-print">
            <WinLossLastRunCard onRun={handleRun} isRunning={runAnalysis.isPending} />
          </div>

          {isLoading ? (
            <>
              <WinLossSectionSkeleton variant="kpi" />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <WinLossSectionSkeleton variant="chart" />
                </div>
                <div>
                  <WinLossSectionSkeleton variant="chart" height={220} />
                </div>
              </div>
              <WinLossSectionSkeleton variant="table" rows={5} />
              <WinLossSectionSkeleton variant="chart" height={180} />
            </>
          ) : isEmpty ? (
            <WinLossEmptyState
              onAdjustFilters={reset}
              onRunAnalysis={handleRun}
              isAnalyzing={runAnalysis.isPending}
            />
          ) : (
            <DashboardLayoutEditor widgets={winLossWidgets} />
          )}

          <div
            id="wl-insights"
            ref={insightsRef}
            className={
              pulse
                ? 'rounded-xl ring-2 ring-primary/60 ring-offset-2 ring-offset-background animate-pulse transition-all'
                : ''
            }
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <WinLossErrorBoundary section="Insights acionáveis">
                <ActionableInsightsPanel />
              </WinLossErrorBoundary>
              <WinLossErrorBoundary section="Impacto dos insights">
                <InsightsImpactPanel />
              </WinLossErrorBoundary>
            </div>
          </div>

          <WinLossDealsDrawer
            open={drawerOpen}
            onOpenChange={setDrawerOpen}
            title={drawerTitle}
            rows={rows}
            filter={drawerFilter}
          />
        </div>
      </PageTransition>
    </>
  );
}
