import { FC } from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Circle, Clock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCompleteTask } from "@/hooks/tasks/useTaskMutations";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Props {
  salespersonId: string | null;
  className?: string;
  limit?: number;
}

interface AssistantTask {
  id: string;
  title: string;
  due_date: string | null;
  status: string;
  task_type: string | null;
}

/**
 * Lista compacta das tarefas de hoje + atrasadas do vendedor, com botão "Concluir".
 * Usa o mesmo hook `useCompleteTask` do resto do app (optimistic update + toast).
 */
export const AssistantTodayTasks: FC<Props> = ({ salespersonId, className, limit = 6 }) => {
  const completeTask = useCompleteTask();

  const { data: tasks = [], isLoading } = useQuery<AssistantTask[]>({
    queryKey: ["tasks", "assistant-today", salespersonId],
    enabled: !!salespersonId,
    staleTime: 60_000,
    queryFn: async () => {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59).toISOString();

      const { data, error } = await supabase
        .from("tasks")
        .select("id,title,due_date,status,task_type")
        .eq("salesperson_id", salespersonId!)
        .neq("status", "completed")
        .lte("due_date", endOfDay)
        .order("due_date", { ascending: true })
        .limit(limit);

      if (error) throw error;
      return (data as AssistantTask[]).map((t) => ({
        ...t,
        // marca atrasada se due_date < startOfDay
        _overdue: t.due_date ? t.due_date < startOfDay : false,
      })) as AssistantTask[];
    },
  });

  if (!salespersonId) return null;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Ações rápidas
        </h4>
        {isLoading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
      </div>

      {!isLoading && tasks.length === 0 && (
        <p className="text-xs text-muted-foreground italic">Sem tarefas pendentes para hoje. 🎉</p>
      )}

      <ul className="space-y-1.5">
        {tasks.map((t) => {
          const isOverdue = t.due_date && new Date(t.due_date) < new Date(new Date().setHours(0, 0, 0, 0));
          const isSubmitting = completeTask.isPending && completeTask.variables === t.id;
          return (
            <li
              key={t.id}
              className="flex items-center gap-2 rounded-lg border border-border/60 bg-background/50 px-2.5 py-2 text-xs hover:bg-accent/40 transition-colors"
            >
              <Circle className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium text-foreground">{t.title}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {isOverdue && (
                    <Badge variant="destructive" className="text-[9px] px-1 py-0 h-4">
                      <Clock className="h-2.5 w-2.5 mr-0.5" /> atrasada
                    </Badge>
                  )}
                  {t.task_type && (
                    <span className="text-[10px] text-muted-foreground">{t.task_type}</span>
                  )}
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 gap-1 text-primary hover:text-primary hover:bg-primary/10"
                disabled={isSubmitting}
                onClick={() => completeTask.mutate(t.id)}
              >
                {isSubmitting ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                )}
                <span className="hidden sm:inline">Concluir</span>
              </Button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default AssistantTodayTasks;
