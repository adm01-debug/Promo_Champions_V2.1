import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useCadenceTasksByEnrollment } from "@/hooks/cadences/useCadenceTasksByEnrollment";
import { useCompleteCadenceTask, useSkipCadenceTask } from "@/hooks/cadences/useCadenceTaskMutations";
import { useRescheduleCadenceTask } from "@/hooks/cadences/useQuoteCadenceMutations";
import { format, parseISO, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckCircle2, SkipForward, Clock, CalendarClock, Phone, Mail, MessageSquare, FileText, History } from "lucide-react";
import { useMemo, useState } from "react";
import type { QuoteCadenceRow } from "@/hooks/cadences/useQuoteCadences";
import { motion } from "framer-motion";
import { useGamificationSafe } from "@/contexts/GamificationContext";

interface Props {
  row: QuoteCadenceRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const actionIcon: Record<string, React.ComponentType<{ className?: string }>> = {
  call: Phone,
  email: Mail,
  whatsapp: MessageSquare,
  linkedin: MessageSquare,
  task: FileText,
};

const statusColor: Record<string, string> = {
  completed: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  pending: "bg-muted text-muted-foreground border-border",
  skipped: "bg-amber-500/15 text-amber-500 border-amber-500/30",
};

export function QuoteCadenceDetailDrawer({ row, open, onOpenChange }: Props) {
  const { data: tasks, isLoading } = useCadenceTasksByEnrollment(row?.id);
  const complete = useCompleteCadenceTask();
  const skip = useSkipCadenceTask();
  const reschedule = useRescheduleCadenceTask();
  const gamification = useGamificationSafe();
  const [notesById, setNotesById] = useState<Record<string, string>>({});
  const [rescheduleById, setRescheduleById] = useState<Record<string, string>>({});

  const history = useMemo(
    () =>
      (tasks ?? [])
        .filter((t) => t.status === "completed" || t.status === "skipped")
        .sort((a, b) => {
          const da = new Date(a.completed_at ?? a.scheduled_date).getTime();
          const db = new Date(b.completed_at ?? b.scheduled_date).getTime();
          return db - da;
        }),
    [tasks],
  );

  const handleComplete = (taskId: string) => {
    complete.mutate(
      { taskId, notes: notesById[taskId] },
      {
        onSuccess: () => {
          gamification?.rewardXP(15, "Tarefa de cadência concluída");
        },
      },
    );
  };

  if (!row) return null;
  const q = row.quote;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh] md:max-h-[90vh]" aria-describedby="quote-cadence-drawer-desc">
        <DrawerHeader className="border-b border-border/40">
          <DrawerTitle className="font-display">{q?.client_name ?? "Cliente"}</DrawerTitle>
          <DrawerDescription id="quote-cadence-drawer-desc">
            {q?.quote_number ?? "Orçamento"} ·{" "}
            {q?.total_value
              ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(q.total_value)
              : "—"}{" "}
            · Etapa {row.current_step}
          </DrawerDescription>
        </DrawerHeader>

        <Tabs defaultValue="tasks" className="overflow-hidden flex flex-col">
          <TabsList className="mx-4 md:mx-6 mt-3 self-start">
            <TabsTrigger value="tasks">Tarefas</TabsTrigger>
            <TabsTrigger value="history">
              <History className="h-3.5 w-3.5 mr-1.5" />
              Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="overflow-y-auto p-4 md:p-6 space-y-3 mt-0">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-lg" />
                ))}
              </div>
            ) : !tasks || tasks.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">Nenhuma tarefa programada.</p>
            ) : (
              tasks.map((t, idx) => {
                const Icon = actionIcon[t.step?.action_type ?? "task"] ?? FileText;
                return (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="border border-border/50 rounded-lg p-3 bg-card/50 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 shrink-0">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm">
                            Etapa {t.step?.step_order} · {t.step?.title ?? "Tarefa"}
                          </p>
                          {t.step?.description && (
                            <p className="text-xs text-muted-foreground mt-0.5">{t.step.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                            <CalendarClock className="h-3 w-3" />
                            <span>{format(parseISO(t.scheduled_date), "dd MMM yyyy", { locale: ptBR })}</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className={statusColor[t.status] ?? ""}>
                        {t.status}
                      </Badge>
                    </div>

                    {t.notes && (
                      <p className="text-xs text-muted-foreground italic border-l-2 border-border/50 pl-2">
                        {t.notes}
                      </p>
                    )}

                    {t.status === "pending" && (
                      <div className="space-y-2 pt-1">
                        <Textarea
                          placeholder="Notas (opcional)..."
                          value={notesById[t.id] ?? ""}
                          onChange={(e) => setNotesById((p) => ({ ...p, [t.id]: e.target.value }))}
                          className="text-xs min-h-[60px]"
                        />
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleComplete(t.id)}
                            disabled={complete.isPending}
                            aria-label="Concluir tarefa e ganhar XP"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                            Concluir <span className="ml-1 text-[10px] opacity-80">+15 XP</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => skip.mutate({ taskId: t.id, notes: notesById[t.id] })}
                            disabled={skip.isPending}
                            aria-label="Pular esta tarefa"
                          >
                            <SkipForward className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                            Pular
                          </Button>
                          <div className="flex items-center gap-1.5">
                            <Input
                              type="date"
                              value={rescheduleById[t.id] ?? ""}
                              onChange={(e) => setRescheduleById((p) => ({ ...p, [t.id]: e.target.value }))}
                              className="h-9 w-[150px] text-xs"
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                rescheduleById[t.id] &&
                                reschedule.mutate({ taskId: t.id, newDate: rescheduleById[t.id] })
                              }
                              disabled={reschedule.isPending || !rescheduleById[t.id]}
                              aria-label="Reagendar tarefa para a data selecionada"
                            >
                              <Clock className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                              Reagendar
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="history" className="overflow-y-auto p-4 md:p-6 space-y-3 mt-0">
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-lg" />
                ))}
              </div>
            ) : history.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">Nenhuma interação concluída ainda.</p>
            ) : (
              history.map((t, idx) => {
                const Icon = actionIcon[t.step?.action_type ?? "task"] ?? FileText;
                const when = t.completed_at ? parseISO(t.completed_at) : parseISO(t.scheduled_date);
                return (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="border border-border/40 rounded-lg p-3 bg-card/30 flex items-start gap-3"
                  >
                    <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 shrink-0">
                      <Icon className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-sm truncate">
                          Etapa {t.step?.step_order} · {t.step?.title ?? "Tarefa"}
                        </p>
                        <Badge variant="outline" className={statusColor[t.status] ?? ""}>
                          {t.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDistanceToNow(when, { locale: ptBR, addSuffix: true })}
                        {" · "}
                        {format(when, "dd MMM yyyy HH:mm", { locale: ptBR })}
                      </p>
                      {t.notes && (
                        <p className="text-xs text-muted-foreground italic mt-1.5 border-l-2 border-emerald-500/40 pl-2">
                          {t.notes}
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </DrawerContent>
    </Drawer>
  );
}
