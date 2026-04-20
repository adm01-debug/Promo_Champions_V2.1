import { Helmet } from "react-helmet-async";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/transitions/PageTransition";
import { Button } from "@/components/ui/button";
import { Trophy, RefreshCw, Sparkles } from "lucide-react";

import { WinLossFilters } from "@/components/win-loss/WinLossFilters";
import { WinLossKpiBanner } from "@/components/win-loss/WinLossKpiBanner";
import { WinLossTrendChart } from "@/components/win-loss/WinLossTrendChart";
import { WinLossReasonMatrix } from "@/components/win-loss/WinLossReasonMatrix";
import { SalespersonWinLossTable } from "@/components/win-loss/SalespersonWinLossTable";
import { CompetitorBattleCard } from "@/components/win-loss/CompetitorBattleCard";
import { ActionableInsightsPanel } from "@/components/win-loss/ActionableInsightsPanel";
import { WinLossDealsDrawer } from "@/components/win-loss/WinLossDealsDrawer";

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
import { useAnalyzeWinLoss, useMinePatterns } from "@/hooks/deal-intelligence/useWinLoss";

export default function WinLossIntelligence() {
  useWinLossRealtime();
  const { filters, setFilters, reset } = useWinLossFilters();
  const { data: rows = [], isLoading } = useFilteredWinLossAnalyses(filters);
  const kpis = useWLKpis(rows);
  const monthly = useWLTrend(rows, "month");
  const weekly = useWLTrend(rows, "week");
  const competitors = useMemo(() => aggregateByCompetitor(rows), [rows]);
  const matrix = useMemo(() => aggregateReasonMatrix(rows), [rows]);
  const { data: spStats, isLoading: spLoading } = useSalespersonWinLossStats(rows);

  const analyze = useAnalyzeWinLoss();
  const mine = useMinePatterns();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTitle, setDrawerTitle] = useState("");
  const [drawerRows, setDrawerRows] = useState<typeof rows>([]);

  const openWins = () => { setDrawerTitle("Deals ganhos"); setDrawerRows(rows.filter(r => r.outcome === "won")); setDrawerOpen(true); };
  const openLosses = () => { setDrawerTitle("Deals perdidos"); setDrawerRows(rows.filter(r => r.outcome === "lost")); setDrawerOpen(true); };

  return (
    <>
      <Helmet>
        <title>Win/Loss Intelligence | Promo Champions</title>
        <meta name="description" content="Análise robusta de vitórias e derrotas com IA, filtros, tendências e battle cards de concorrentes." />
      </Helmet>
      <PageTransition>
        <div className="space-y-4">
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="p-3 rounded-xl gradient-primary">
              <Trophy className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h1 className="text-page-title gradient-text">Win/Loss Intelligence</h1>
              <p className="text-muted-foreground text-sm">
                Padrões de vitória, derrota e concorrência — com IA e drill-down por deal.
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => analyze.mutate()} disabled={analyze.isPending}>
                <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${analyze.isPending ? "animate-spin" : ""}`} />
                Analisar deals
              </Button>
              <Button size="sm" onClick={() => mine.mutate()} disabled={mine.isPending}>
                <Sparkles className={`h-3.5 w-3.5 mr-1.5 ${mine.isPending ? "animate-pulse" : ""}`} />
                Minerar padrões
              </Button>
            </div>
          </motion.div>

          <WinLossFilters filters={filters} onChange={setFilters} onReset={reset} />

          <WinLossKpiBanner kpis={kpis} isLoading={isLoading} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <WinLossTrendChart monthly={monthly} weekly={weekly} />
            </div>
            <div>
              <WinLossReasonMatrix cells={matrix} />
            </div>
          </div>

          <SalespersonWinLossTable stats={spStats} isLoading={spLoading} />

          <CompetitorBattleCard competitors={competitors} />

          <ActionableInsightsPanel />

          {/* Quick drill-down buttons */}
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={openWins}>Ver {kpis.wins} wins</Button>
            <Button size="sm" variant="ghost" onClick={openLosses}>Ver {kpis.losses} losses</Button>
          </div>

          <WinLossDealsDrawer
            open={drawerOpen}
            onOpenChange={setDrawerOpen}
            title={drawerTitle}
            rows={drawerRows}
          />
        </div>
      </PageTransition>
    </>
  );
}
