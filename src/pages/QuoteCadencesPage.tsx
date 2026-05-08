import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Download, LayoutDashboard, Settings2, ShieldCheck } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useQuoteCadences } from "@/hooks/cadences/useQuoteCadences";
import { QuoteCadenceMetrics } from "@/components/cadences/quote/QuoteCadenceMetrics";
import { QuoteCadenceConversionChart } from "@/components/cadences/quote/QuoteCadenceConversionChart";
import { QuoteCadenceCard } from "@/components/cadences/quote/QuoteCadenceCard";
import { QuoteCadenceComparison } from "@/components/cadences/quote/QuoteCadenceComparison";
import { QuoteCadenceBulkBar } from "@/components/cadences/quote/QuoteCadenceBulkBar";
import { SkeletonShimmer } from "@/components/ui/skeleton-shimmer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useCallback, useMemo, useState } from "react";
import { QuoteCadenceDetailDrawer } from "@/components/cadences/quote/QuoteCadenceDetailDrawer";
import { QuoteCadenceEmptyState } from "@/components/cadences/quote/QuoteCadenceEmptyState";
import type { QuoteCadenceRow } from "@/hooks/cadences/useQuoteCadences";
import { QuoteCadenceFilters, emptyQuoteCadenceFilters, type QuoteCadenceFilterValues } from "@/components/cadences/quote/QuoteCadenceFilters";
import { differenceInCalendarDays, isToday } from "date-fns";
import { useQuoteCadenceRealtime } from "@/hooks/cadences/useQuoteCadenceRealtime";
import { exportToCSV } from "@/lib/csvExporter";
import { quoteCadencesToCsvRows } from "@/lib/quoteCadenceExport";
import { useQuoteCadenceShortcuts } from "@/hooks/cadences/useQuoteCadenceShortcuts";
import { CadenceTemplateManager } from "@/components/sales/cadence/CadenceTemplateManager";
import { ContactFrequencyRules } from "@/components/sales/cadence/ContactFrequencyRules";
import { ApprovalQueue } from "@/components/sales/cadence/ApprovalQueue";

type Filter = "all" | "active" | "paused" | "completed";
type ViewMode = "monitoring" | "strategy";

export default function QuoteCadencesPage() {
  useQuoteCadenceRealtime();
  const { data, isLoading } = useQuoteCadences();
  const [searchParams, setSearchParams] = useSearchParams();
  const todayOnly = searchParams.get("filter") === "today";
  const [filter, setFilter] = useState<Filter>("active");
  const [viewMode, setViewMode] = useState<ViewMode>("monitoring");
  const [selected, setSelected] = useState<QuoteCadenceRow | null>(null);
  const [advanced, setAdvanced] = useState<QuoteCadenceFilterValues>(emptyQuoteCadenceFilters);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelect = (id: string) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const rows = useMemo(() => {
    const base = (data ?? []).filter((r) => filter === "all" || r.status === filter);
    const search = advanced.search.trim().toLowerCase();
    const seller = advanced.seller.trim().toLowerCase();
    const min = advanced.minValue !== "" ? Number(advanced.minValue) : null;
    const max = advanced.maxValue !== "" ? Number(advanced.maxValue) : null;
    const today = new Date();

    return base.filter((r) => {
      const q = r.quote;
      if (search && !(q?.client_name ?? "").toLowerCase().includes(search)) return false;
      if (seller && !(q?.seller_name ?? "").toLowerCase().includes(seller)) return false;
      if (min !== null && (q?.total_value ?? 0) < min) return false;
      if (max !== null && (q?.total_value ?? 0) > max) return false;
      if (advanced.daysWithoutResponse > 0) {
        const sentAt = q?.sent_at ? new Date(q.sent_at) : (r.started_at ? new Date(r.started_at) : null);
        if (!sentAt) return false;
        if (differenceInCalendarDays(today, sentAt) < advanced.daysWithoutResponse) return false;
      }
      if (todayOnly) {
        if (!r.next_action_date) return false;
        if (!isToday(new Date(r.next_action_date))) return false;
      }
      return true;
    });
  }, [data, filter, advanced, todayOnly]);

  const handleExport = useCallback(() => exportToCSV(quoteCadencesToCsvRows(rows), "cadencias-orcamentos"), [rows]);

  const handleSelectAll = useCallback(() => {
    setSelectedIds((prev) => (prev.length === rows.length ? [] : rows.map((r) => r.id)));
  }, [rows]);

  useQuoteCadenceShortcuts({
    onExport: handleExport,
    onSelectAll: handleSelectAll,
    onClearSelection: () => setSelectedIds([]),
    onCloseDrawer: () => setSelected(null),
    hasSelection: selectedIds.length > 0,
    drawerOpen: !!selected,
  });

  const clearTodayFilter = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("filter");
    setSearchParams(next, { replace: true });
  };

  return (
    <>
      <Helmet>
        <title>Cadência de Orçamentos | Promo Champions</title>
        <meta
          name="description"
          content="Follow-up automatizado de orçamentos: acompanhe etapas, conversão e tarefas do dia em uma cadência inteligente."
        />
        <link rel="canonical" href="https://championgifts.lovable.app/cadencias-orcamentos" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://championgifts.lovable.app/cadencias-orcamentos" />
        <meta property="og:title" content="Cadência de Orçamentos | Promo Champions" />
        <meta
          property="og:description"
          content="Follow-up automatizado de orçamentos com métricas de conversão e tarefas diárias."
        />
        <meta property="og:image" content="https://championgifts.lovable.app/favicon.ico" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Cadência de Orçamentos | Promo Champions" />
        <meta
          name="twitter:description"
          content="Follow-up automatizado de orçamentos com métricas de conversão e tarefas diárias."
        />
      </Helmet>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 p-4 md:p-6">
        <header className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/20">
              <Send className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-page-title">Cadências de Orçamento</h1>
              <p className="text-sm text-muted-foreground">Follow-up automatizado de propostas enviadas</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={rows.length === 0}
            aria-label="Exportar cadências filtradas para CSV"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </header>

        <QuoteCadenceMetrics />

        <QuoteCadenceConversionChart />

        <QuoteCadenceComparison />

        {todayOnly && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Tarefas para hoje
            </Badge>
            <Button variant="ghost" size="sm" onClick={clearTodayFilter} aria-label="Limpar filtro de hoje">
              Limpar filtro
            </Button>
          </div>
        )}

        <QuoteCadenceFilters values={advanced} onChange={setAdvanced} />

        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)} className="space-y-4">
          <TabsList>
            <TabsTrigger value="active">Ativos</TabsTrigger>
            <TabsTrigger value="paused">Pausados</TabsTrigger>
            <TabsTrigger value="completed">Concluídos</TabsTrigger>
            <TabsTrigger value="all">Todos</TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div
              key={filter}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <TabsContent value={filter} className="mt-0" forceMount>
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-md:snap-x max-md:snap-mandatory max-md:overflow-x-auto max-md:grid-flow-col max-md:auto-cols-[85%] max-md:-mx-4 max-md:px-4 max-md:pb-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <SkeletonShimmer key={i} className="h-44 rounded-xl" />
                    ))}
                  </div>
                ) : rows.length === 0 ? (
                  <QuoteCadenceEmptyState />
                ) : (
                  <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-md:snap-x max-md:snap-mandatory max-md:overflow-x-auto max-md:grid-flow-col max-md:auto-cols-[85%] max-md:-mx-4 max-md:px-4 max-md:pb-2"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: { opacity: 1, transition: { staggerChildren: 0.03 } },
                    }}
                  >
                    {rows.map((r) => (
                      <motion.button
                        key={r.id}
                        type="button"
                        onClick={() => setSelected(r)}
                        aria-label={`Abrir detalhes da cadência de ${r.quote?.client_name ?? "cliente"} — status ${r.status}`}
                        className="text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-xl snap-start"
                        variants={{
                          hidden: { opacity: 0, y: 8 },
                          visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
                        }}
                      >
                        <QuoteCadenceCard
                          row={r}
                          selected={selectedIds.includes(r.id)}
                          onToggleSelect={toggleSelect}
                        />
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </motion.div>

      <QuoteCadenceBulkBar selectedIds={selectedIds} onClear={() => setSelectedIds([])} />

      <QuoteCadenceDetailDrawer
        row={selected}
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
      />
    </>
  );
}
