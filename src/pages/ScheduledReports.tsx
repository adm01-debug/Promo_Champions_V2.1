import { useState, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { PageTransition, itemVariants } from "@/components/transitions/PageTransition";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Mail, Clock, Plus, Trash2, History, Play } from "lucide-react";
import {
  useScheduledReports,
  useToggleScheduledReport,
  useDeleteScheduledReport,
} from "@/hooks/reporting/useScheduledReports";
import { useTriggerScheduledReport } from "@/hooks/reporting/useTriggerScheduledReport";
import { ScheduledReportFormDialog } from "@/components/reporting/ScheduledReportFormDialog";
import { ScheduledReportRunsDrawer } from "@/components/reporting/ScheduledReportRunsDrawer";
import { formatScheduleSummary, FREQUENCY_LABELS } from "@/components/reporting/scheduledReportHelpers";

const ScheduledReports = () => {
  const { data: reports, isLoading } = useScheduledReports();
  const toggle = useToggleScheduledReport();
  const del = useDeleteScheduledReport();
  const trigger = useTriggerScheduledReport();

  const [showForm, setShowForm] = useState(false);
  const [historyId, setHistoryId] = useState<string | null>(null);
  const [historyName, setHistoryName] = useState<string>();

  const openHistory = useCallback((id: string, name: string) => {
    setHistoryId(id);
    setHistoryName(name);
  }, []);

  return (
    <>
      <Helmet>
        <title>Relatórios Agendados | Promo Champions</title>
        <meta name="description" content="Configure relatórios automáticos com entrega por email e histórico de execuções." />
      </Helmet>
      <PageTransition>
        <div className="container max-w-5xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
          <motion.div variants={itemVariants} className="flex items-center justify-between">
            <div>
              <h1 className="text-page-title font-display">Relatórios Agendados</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Automatize a geração e entrega dos seus relatórios
              </p>
            </div>
            <Button onClick={() => setShowForm(true)} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Agendamento
            </Button>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-3">
            {isLoading && Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}

            {!isLoading && (reports?.length ?? 0) === 0 && (
              <Card className="p-8 text-center glass border-border/40">
                <Mail className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">
                  Nenhum agendamento ainda. Crie um para receber relatórios automaticamente.
                </p>
              </Card>
            )}

            {reports?.map((r) => (
              <Card
                key={r.id}
                className={cn(
                  "p-4 glass border-border/40 flex items-center gap-4 transition-opacity",
                  !r.enabled && "opacity-60",
                )}
              >
                <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{r.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatScheduleSummary(r)}
                    {r.recipients.length > 0 && ` · ${r.recipients.length} destinatário(s)`}
                  </p>
                  {r.next_run_at && r.enabled && (
                    <p className="text-[11px] text-muted-foreground/70 mt-0.5">
                      Próxima: {new Date(r.next_run_at).toLocaleString("pt-BR")}
                    </p>
                  )}
                </div>
                <Badge variant="outline" className="text-xs shrink-0 hidden sm:flex">
                  <Clock className="h-3 w-3 mr-1" />
                  {FREQUENCY_LABELS[r.frequency]}
                </Badge>
                <Switch
                  checked={r.enabled}
                  onCheckedChange={(enabled) => toggle.mutate({ id: r.id, enabled })}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => trigger.mutate(r.id)}
                  disabled={trigger.isPending}
                  title="Executar agora"
                >
                  <Play className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => openHistory(r.id, r.name)}
                  title="Histórico"
                >
                  <History className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => {
                    if (confirm(`Remover agendamento "${r.name}"?`)) del.mutate(r.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </Card>
            ))}
          </motion.div>
        </div>
      </PageTransition>

      <ScheduledReportFormDialog open={showForm} onOpenChange={setShowForm} />
      <ScheduledReportRunsDrawer
        scheduleId={historyId}
        scheduleName={historyName}
        onClose={() => setHistoryId(null)}
      />
    </>
  );
};

export default ScheduledReports;
