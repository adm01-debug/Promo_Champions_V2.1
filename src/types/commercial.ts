/**
 * Tipos administrativos comerciais — MAINT-02.
 *
 * Substituem os `any` remanescentes em `AdminComercial.tsx`, `Cadencias.tsx`
 * e utilitários de export. Todos os campos refletem o schema atual do banco
 * (public.approval_requests, public.approval_decisions, etc.).
 *
 * Nunca use estes tipos como `Record<string, any>` — se aparecer um campo
 * novo, adicione-o aqui e propague para os consumidores.
 */

export type ApprovalRequestType =
  | 'goal_change'
  | 'commission_change'
  | 'territory_change'
  | 'scoring_rule_change'
  | 'discount_override'
  | 'other';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface CommercialGoalPayload {
  salesperson_id: string;
  period: string; // YYYY-MM
  target_value: number;
  target_units?: number;
  bonus_pct?: number;
  notes?: string;
}

export interface CommissionRulePayload {
  salesperson_id: string;
  product_category?: string;
  base_pct: number;
  accelerator_pct?: number;
  min_margin_pct?: number;
  effective_from: string; // ISO date
  effective_to?: string | null;
}

export interface ScoringRulePayload {
  metric: string;
  operator: '>' | '>=' | '=' | '<=' | '<' | '!=';
  value: number;
  weight: number;
  description?: string;
}

export type ApprovalPayload =
  | { type: 'goal_change'; new_values: CommercialGoalPayload; old_values?: Partial<CommercialGoalPayload> }
  | { type: 'commission_change'; new_values: CommissionRulePayload; old_values?: Partial<CommissionRulePayload> }
  | { type: 'scoring_rule_change'; new_values: ScoringRulePayload; old_values?: Partial<ScoringRulePayload> }
  | { type: 'territory_change'; new_values: Record<string, unknown>; old_values?: Record<string, unknown> }
  | { type: 'discount_override'; new_values: Record<string, unknown>; old_values?: Record<string, unknown> }
  | { type: 'other'; new_values: Record<string, unknown>; old_values?: Record<string, unknown> };

export interface ApprovalRequest {
  id: string;
  requested_by: string;
  approver_id?: string | null;
  type: ApprovalRequestType;
  status: ApprovalStatus;
  new_values: ApprovalPayload['new_values'];
  old_values?: ApprovalPayload['old_values'];
  reason?: string | null;
  approved_at?: string | null;
  rejected_at?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Metadata canônica gravada em `audit_logs.metadata` para ações comerciais.
 * Cada `action` tem seu conjunto obrigatório de campos.
 */
export type CommercialAuditMetadata =
  | {
      action: 'approved_goal';
      request_id: string;
      salesperson_id: string;
      previous_target?: number;
      new_target: number;
      approver_id: string;
    }
  | {
      action: 'rejected_goal';
      request_id: string;
      salesperson_id: string;
      reason: string;
      approver_id: string;
    }
  | {
      action: 'commission_updated';
      request_id: string;
      salesperson_id: string;
      diff: Record<string, { from: unknown; to: unknown }>;
      approver_id: string;
    }
  | {
      action: 'scoring_rule_created' | 'scoring_rule_updated' | 'scoring_rule_deleted';
      rule: ScoringRulePayload;
      actor_id: string;
    };

/** Type-guard helpers para narrow safety em componentes. */
export function isApprovalRequest(value: unknown): value is ApprovalRequest {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return typeof v.id === 'string' && typeof v.type === 'string' && typeof v.status === 'string';
}

export function isCommercialAuditMetadata(value: unknown): value is CommercialAuditMetadata {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return typeof v.action === 'string';
}
