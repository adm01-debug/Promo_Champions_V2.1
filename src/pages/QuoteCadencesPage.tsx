import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useQuoteCadences } from "@/hooks/cadences/useQuoteCadences";
import { QuoteCadenceMetrics } from "@/components/cadences/quote/QuoteCadenceMetrics";
import { QuoteCadenceConversionChart } from "@/components/cadences/quote/QuoteCadenceConversionChart";
import { QuoteCadenceCard } from "@/components/cadences/quote/QuoteCadenceCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useMemo, useState } from "react";
import { QuoteCadenceDetailDrawer } from "@/components/cadences/quote/QuoteCadenceDetailDrawer";
import type { QuoteCadenceRow } from "@/hooks/cadences/useQuoteCadences";
import { QuoteCadenceFilters, emptyQuoteCadenceFilters, type QuoteCadenceFilterValues } from "@/components/cadences/quote/QuoteCadenceFilters";
import { differenceInCalendarDays, isToday } from "date-fns";

type Filter = "all" | "active" | "paused" | "completed";

export default function QuoteCadencesPage() {
  const { data, isLoading } = useQuoteCadences();
  const [searchParams, setSearchParams] = useSearchParams();
  const todayOnly = searchParams.get("filter") === "today";
  const [filter, setFilter] = useState<Filter>("active");
  const [selected, setSelected] = useState<QuoteCadenceRow | null>(null);
  const [advanced, setAdvanced] = useState<QuoteCadenceFilterValues>(emptyQuoteCadenceFilters);

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
        <header className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/20">
            <Send className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-page-title">Cadências de Orçamento</h1>
            <p className="text-sm text-muted-foreground">Follow-up automatizado de propostas enviadas</p>
          </div>
        </header>

        <QuoteCadenceMetrics />

        <QuoteCadenceConversionChart />

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

          <TabsContent value={filter} className="mt-0">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-44 rounded-xl" />
                ))}
              </div>
            ) : rows.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-border/50 rounded-xl bg-muted/10">
                <Send className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                <p className="font-medium">Nenhum follow-up encontrado</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Envie um orçamento para iniciar o follow-up automático.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rows.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelected(r)}
                    aria-label={`Abrir detalhes da cadência de ${r.quote?.client_name ?? "cliente"} — status ${r.status}`}
                    className="text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-xl"
                  >
                    <QuoteCadenceCard row={r} />
                  </button>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>

      <QuoteCadenceDetailDrawer
        row={selected}
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
      />
    </>
  );
}
