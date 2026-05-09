import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Zap, UserCheck, Send, Phone, Star, ChevronDown, PlusCircle } from "lucide-react";
import { CreateTaskDialog } from "@/components/tasks/CreateTaskDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Deal, PipelineStageId } from "@/hooks/usePipeline";

interface MacroConfig {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  actions: MacroAction[];
  color?: string;
}

interface MacroAction {
  type: "change_stage" | "create_task" | "log_activity";
  params: Record<string, string>;
}

const MACROS: MacroConfig[] = [
  {
    id: "qualify_lead",
    label: "Qualificar Lead",
    description: "Mover para Qualificado + Criar task de follow-up",
    icon: UserCheck,
    actions: [
      { type: "change_stage", params: { stage: "qualified" } },
      { type: "create_task", params: { title: "Follow-up de qualificação", priority: "high" } },
    ],
  },
  {
    id: "send_proposal",
    label: "Enviar Proposta",
    description: "Mover para Proposta + Log de atividade",
    icon: Send,
    actions: [
      { type: "change_stage", params: { stage: "proposal" } },
      { type: "log_activity", params: { type: "email", outcome: "connected", notes: "Proposta enviada" } },
    ],
  },
  {
    id: "schedule_call",
    label: "Agendar Ligação",
    description: "Criar task de ligação + Log de atividade",
    icon: Phone,
    actions: [
      { type: "create_task", params: { title: "Ligação agendada", priority: "medium", task_type: "call" } },
      { type: "log_activity", params: { type: "call", outcome: "callback", notes: "Ligação agendada" } },
    ],
  },
  {
    id: "close_deal",
    label: "Fechar Deal",
    description: "Mover para Fechado + Log de vitória",
    icon: Star,
    color: "text-green-500",
    actions: [
      { type: "change_stage", params: { stage: "closed" } },
      { type: "log_activity", params: { type: "meeting", outcome: "connected", notes: "Deal fechado com sucesso!" } },
    ],
  },
];

interface QuickActionsMenuProps {
  deal: Deal;
}

export const QuickActionsMenu = React.memo(({ deal }: QuickActionsMenuProps) => {
  const queryClient = useQueryClient();
  const [executing, setExecuting] = useState(false);

  const executeMacro = useMutation({
    mutationFn: async (macro: MacroConfig) => {
      setExecuting(true);
      for (const action of macro.actions) {
        switch (action.type) {
          case "change_stage":
            await supabase
              .from("sales")
              .update({ status: action.params.stage, updated_at: new Date().toISOString() })
              .eq("id", deal.id);
            break;

          case "create_task":
            await supabase.from("tasks").insert([{
              title: `${action.params.title} - ${deal.client_name}`,
              priority: (action.params.priority || "medium") as "high" | "medium" | "low",
              task_type: (action.params.task_type || "follow_up") as "call" | "email" | "follow_up" | "meeting" | "other" | "proposal",
              sale_id: deal.id,
              salesperson_id: deal.salesperson_id,
              due_date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
            }]);
            break;

          case "log_activity":
            await supabase.from("activities").insert([{
              activity_type: action.params.type as "call" | "email" | "meeting",
              outcome: (action.params.outcome || "connected") as "connected" | "callback" | "no_answer" | "not_interested" | "qualified" | "scheduled" | "voicemail" | "busy",
              notes: action.params.notes,
              sale_id: deal.id,
              salesperson_id: deal.salesperson_id,
              contact_name: deal.client_name,
            }]);
            break;
        }
      }
    },
    onSuccess: (_, macro) => {
      toast.success(`Macro "${macro.label}" executada com sucesso!`);
      queryClient.invalidateQueries({ queryKey: ["pipeline-deals"] });
      queryClient.invalidateQueries({ queryKey: ["pipeline-deals-multi"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      setExecuting(false);
    },
    onError: () => {
      toast.error("Erro ao executar macro");
      setExecuting(false);
    },
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          disabled={executing}
          aria-label="Ações rápidas"
        >
          <Zap className={`h-3.5 w-3.5 ${executing ? "animate-pulse text-primary" : "text-muted-foreground"}`} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs text-muted-foreground flex items-center gap-1">
          <Zap className="h-3 w-3" /> Macros
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {MACROS.map((macro) => {
          const Icon = macro.icon;
          return (
            <DropdownMenuItem
              key={macro.id}
              onClick={() => executeMacro.mutate(macro)}
              className="flex items-start gap-2 py-2 cursor-pointer"
            >
              <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${macro.color || "text-primary"}`} />
              <div>
                <p className="text-xs font-medium">{macro.label}</p>
                <p className="text-[10px] text-muted-foreground">{macro.description}</p>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

QuickActionsMenu.displayName = "QuickActionsMenu";
