import {
  Sparkles,
  Target,
  FileText,
  CalendarClock,
  UserPlus,
  Snowflake,
  type LucideIcon,
} from "lucide-react";

export type AgentType =
  | "qualify_lead"
  | "build_proposal"
  | "schedule_followup"
  | "enrich_client"
  | "recover_cold_lead";

export type AgentStatus =
  | "pending"
  | "running"
  | "awaiting_approval"
  | "completed"
  | "failed"
  | "cancelled";

export type AgentTargetType = "lead" | "client" | "deal" | "activity";

export interface AgentRun {
  id: string;
  salesperson_id: string;
  agent_type: AgentType;
  goal: string | null;
  target_entity_type: AgentTargetType | null;
  target_entity_id: string | null;
  status: AgentStatus;
  steps: Array<{ index: number; tool: string; status: string }>;
  result: Record<string, unknown> | null;
  requires_approval: boolean;
  approved_by: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface AgentAction {
  id: string;
  run_id: string;
  step_index: number;
  tool_name: string;
  tool_input: Record<string, unknown>;
  tool_output: Record<string, unknown> | null;
  status: "success" | "error" | "pending_approval" | "skipped";
  executed_by: "ai" | "user" | "system";
  executed_at: string;
}

export const AGENT_META: Record<AgentType, { label: string; icon: LucideIcon; description: string }> = {
  qualify_lead: {
    label: "Qualificar Lead",
    icon: Target,
    description: "Analisa contexto, sugere score e próximas ações.",
  },
  build_proposal: {
    label: "Montar Proposta",
    icon: FileText,
    description: "Reúne dados do deal e propõe estrutura de proposta.",
  },
  schedule_followup: {
    label: "Agendar Follow-up",
    icon: CalendarClock,
    description: "Define melhor janela e cria evento na agenda.",
  },
  enrich_client: {
    label: "Enriquecer Cliente",
    icon: UserPlus,
    description: "Busca contexto adicional e atualiza ficha.",
  },
  recover_cold_lead: {
    label: "Recuperar Lead Frio",
    icon: Snowflake,
    description: "Plano de reativação com mensagem personalizada.",
  },
};

export const STATUS_META: Record<
  AgentStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "warning" | "success" | "info" }
> = {
  pending: { label: "Pendente", variant: "secondary" },
  running: { label: "Executando", variant: "info" },
  awaiting_approval: { label: "Aguarda aprovação", variant: "warning" },
  completed: { label: "Concluído", variant: "success" },
  failed: { label: "Falhou", variant: "destructive" },
  cancelled: { label: "Cancelado", variant: "secondary" },
};

export const AGENT_ICON = Sparkles;
