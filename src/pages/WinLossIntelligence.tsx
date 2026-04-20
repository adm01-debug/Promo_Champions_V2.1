import { Helmet } from "react-helmet-async";
import { useMemo, useState, useCallback } from "react";
import { PageTransition } from "@/components/transitions/PageTransition";

import { WinLossPageHeader } from "@/components/win-loss/WinLossPageHeader";
import { WinLossFilters } from "@/components/win-loss/WinLossFilters";
import { WinLossKpiBanner } from "@/components/win-loss/WinLossKpiBanner";
import { WinLossTrendChart } from "@/components/win-loss/WinLossTrendChart";
import { WinLossReasonMatrix } from "@/components/win-loss/WinLossReasonMatrix";
import { SalespersonWinLossTable } from "@/components/win-loss/SalespersonWinLossTable";
import { CompetitorBattleCard } from "@/components/win-loss/CompetitorBattleCard";
import { ActionableInsightsPanel } from "@/components/win-loss/ActionableInsightsPanel";
import { WinLossDealsDrawer, type DrawerFilter } from "@/components/win-loss/WinLossDealsDrawer";
import { WinLossEmptyState } from "@/components/win-loss/WinLossEmptyState";
import { WinLossLastRunCard } from "@/components/win-loss/WinLossLastRunCard";
import { WinLossPrintLayout } from "@/components/win-loss/WinLossPrintLayout";
import {
  KpiBannerSkeleton,
  ChartSkeleton,
  TableSkeleton,
  CompetitorGridSkeleton,
} from "@/components/win-loss/WinLossSkeletons";

import { useWinLossFilters } from "@/hooks/win-loss/useWinLossFilters";
import { useFilteredWinLossAnalyses } from "@/hooks/win-loss/useWinLossData";
import {
  aggregateByCompetitor,
  aggregateReasonMatrix,
  useWLKpis,
  useWLTrend,
} from "@/hooks/win-loss/useWinLossAggregations";
import { useSalespersonWinLossStats } from "@/hooks/win-loss/useWinLossSalespersonStats";
import { useWinLossRealtime } from "@/hooks/win-loss/useWinLossRealtime";
import { useRunWinLossAnalysis } from "@/hooks/win-loss/useRunWinLossAnalysis";
import { useWinLossExport } from "@/hooks/win-loss/useWinLossExport";
import { useWinLossShortcuts } from "@/hooks/win-loss/useWinLossShortcuts";
import { usePreviousKpisComputed, computeKpiDelta } from "@/hooks/win-loss/usePreviousPeriodKpis";
import { useWinLossForecast } from "@/hooks/win-loss/useWinLossForecast";
import { useWinLossTelemetry } from "@/hooks/win-loss/useWinLossTelemetry";
import type { SavedView } from "@/hooks/win-loss/useWinLossSavedViews";

const SITE = "https://championgifts.lovable.app";

export default function WinLossIntelligence() {
  useWinLossRealtime();
  const { filters, setFilters, reset } = useWinLossFilters();
  const { data: rows = [], isLoading } = useFilteredWinLossAnalyses(filters);
  const kpis = useWLKpis(rows);
  const monthly = useWLTrend(rows, "month");
  const weekly = useWLTrend(rows, "week");
  const competitors = useMemo(() => aggregateByCompetitor(rows), [rows]);
  const matrix = useMemo(() => aggregateReasonMatrix(rows), [rows]);
  const { data: spStats = [], isLoading: spLoading } = useSalespersonWinLossStats(rows);

  const { kpis: prevKpis } = usePreviousKpisComputed(filters);
  const delta = useMemo(() => computeKpiDelta(kpis, prevKpis), [kpis, prevKpis]);
  const forecast = useWinLossForecast(monthly, 8);
  const track = useWinLossTelemetry();

  const runAnalysis = useRunWinLossAnalysis();
  const exportCsv = useWinLossExport(rows);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTitle, setDrawerTitle] = useState("");
  const [drawerFilter, setDrawerFilter] = useState<DrawerFilter | undefined>(undefined);

  const openDrawer = useCallback((title: string, filter?: DrawerFilter) => {
    setDrawerTitle(title);
    setDrawerFilter(filter);
    setDrawerOpen(true);
    track("winloss_drill", { title, ...filter });
  }, [track]);

  const onWins = () => openDrawer(`${kpis.wins} deals ganhos`, { outcome: "won" });
  const onLosses = () => openDrawer(`${kpis.losses} deals perdidos`, { outcome: "lost" });
  const onPeriod = (period: string) => openDrawer(`Deals em ${period}`, { period });
  const onMatrix = (reason: string, stage: string) => openDrawer(`${reason} · ${stage}`, { outcome: "lost", reason, stage });
  const onCompetitor = (name: string) => openDrawer(`vs. ${name}`, { competitor: name });
  const onSalesperson = (id: string, name: string) => {
    setFilters({ salespersonIds: [id] });
    openDrawer(`Deals de ${name}`);
  };

  const handleExport = useCallback(() => {
    track("winloss_export", { count: rows.length });
    exportCsv();
  }, [exportCsv, rows.length, track]);

  const handleRun = useCallback(() => {
    track("winloss_run");
    runAnalysis.mutate();
  }, [runAnalysis, track]);

  const handlePrint = useCallback(() => {
    track("winloss_print");
    window.print();
  }, [track]);

  const handleLoadView = useCallback((v: SavedView) => {
    track("winloss_load_view", { name: v.name });
    setFilters(v.filters);
  }, [setFilters, track]);

  useWinLossShortcuts({
    onExport: handleExport,
    onRun: handleRun,
    onEscape: () => setDrawerOpen(false),
  });

  const isEmpty = !isLoading && rows.length === 0;
  const url = `${SITE}/win-loss-intelligence`;

  return (
    <>
      <Helmet>
        <title>Win/Loss Intelligence | Promo Champions</title>
        <meta name="description" content="Análise robusta de vitórias e derrotas com IA, filtros, tendências, drill-down por deal e battle cards de concorrentes." />
        <link rel="canonical" href={url} />
        <meta property="og:title" content="Win/Loss Intelligence | Promo Champions" />
        <meta property="og:description" content="Padrões de win/loss, tendências e benchmarks por vendedor com inteligência artificial." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={url} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <PageTransition>
        <div className="space-y-4 pb-[env(safe-area-inset-bottom)]" role="main" aria-label="Win/Loss Intelligence">
          <WinLossPageHeader
            onRun={handleRun}
            onExport={handleExport}
            onPrint={handlePrint}
            isRunning={runAnalysis.isPending}
            filters={filters}
            onLoadView={handleLoadView}
          />

          <div className="no-print">
            <WinLossFilters filters={filters} onChange={setFilters} onReset={reset} />
          </div>

          <WinLossPrintLayout kpis={kpis} />

          <div className="no-print">
            <WinLossLastRunCard onRun={handleRun} isRunning={runAnalysis.isPending} />
          </div>

          {isLoading ? (
            <>
              <KpiBannerSkeleton />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2"><ChartSkeleton /></div>
                <div><ChartSkeleton height={220} /></div>
              </div>
              <TableSkeleton rows={5} />
              <CompetitorGridSkeleton />
            </>
          ) : isEmpty ? (
            <WinLossEmptyState
              onAdjustFilters={reset}
              onRunAnalysis={handleRun}
              isAnalyzing={runAnalysis.isPending}
            />
          ) : (
            <>
              <WinLossKpiBanner
                kpis={kpis}
                onWinsClick={onWins}
                onLossesClick={onLosses}
                delta={delta}
                forecast={forecast}
              />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <WinLossTrendChart monthly={monthly} weekly={weekly} onPointClick={onPeriod} />
                </div>
                <div>
                  <WinLossReasonMatrix cells={matrix} onCellClick={onMatrix} />
                </div>
              </div>

              <SalespersonWinLossTable stats={spStats} isLoading={spLoading} onRowClick={onSalesperson} />

              <CompetitorBattleCard competitors={competitors} onCompetitorClick={onCompetitor} />
            </>
          )}

          <ActionableInsightsPanel />

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
