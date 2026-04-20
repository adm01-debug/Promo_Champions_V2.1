import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { useQuoteCadences } from "@/hooks/cadences/useQuoteCadences";
import { QuoteCadenceMetrics } from "@/components/cadences/quote/QuoteCadenceMetrics";
import { QuoteCadenceCard } from "@/components/cadences/quote/QuoteCadenceCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";

type Filter = "all" | "active" | "paused" | "completed";

export default function QuoteCadencesPage() {
  const { data, isLoading } = useQuoteCadences();
  const [filter, setFilter] = useState<Filter>("active");

  const rows = (data ?? []).filter((r) => filter === "all" || r.status === filter);

  return (
    <>
      <Helmet>
        <title>Cadências de Orçamento | CRM</title>
        <meta name="description" content="Acompanhe follow-ups automatizados de orçamentos enviados aos clientes." />
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
                  <QuoteCadenceCard key={r.id} row={r} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </>
  );
}
