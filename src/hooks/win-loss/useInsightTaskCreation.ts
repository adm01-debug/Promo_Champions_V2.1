import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { TaskPriority } from "@/hooks/tasks/types";

interface CreateArgs {
  insightId: string;
  title: string;
  description?: string | null;
  severity?: "opportunity" | "risk" | "info" | null;
  salespersonId?: string | null;
  dueInDays?: number;
}

const severityToPriority = (sev?: string | null): TaskPriority => {
  if (sev === "risk") return "high";
  if (sev === "opportunity") return "medium";
  return "low";
};

export function useInsightTaskCreation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ insightId, title, description, severity, salespersonId, dueInDays = 7 }: CreateArgs) => {
      const due = new Date();
      due.setDate(due.getDate() + dueInDays);
      const dueISO = due.toISOString().split("T")[0];

      const row = {
        title: title.slice(0, 200),
        description: description ?? null,
        task_type: "follow_up" as const,
        priority: severityToPriority(severity),
        status: "pending" as const,
        due_date: dueISO,
        salesperson_id: salespersonId ?? null,
        source_insight_id: insightId,
      };

      const { error } = await (supabase as unknown as {
        from: (t: string) => {
          insert: (r: Record<string, unknown>) => Promise<{ error: Error | null }>;
        };
      })
        .from("tasks")
        .insert(row);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Tarefa criada com sucesso");
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Erro ao criar tarefa");
    },
  });
}
