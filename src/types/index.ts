// ===== CORE ENTITIES =====

/**
 * Representa uma oportunidade de negócio no pipeline de vendas
 */
export interface Deal {
  id: string;
  title: string;
  value: number;
  amount?: number;
  client_id: string;
  client_name?: string;
  stage_id: string;
  status: 'open' | 'won' | 'lost' | 'abandoned' | 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed';
  probability: number;
  expected_close_date?: string;
  closed_at?: string;
  assigned_to: string;
  created_at: string;
  updated_at: string;
  products?: DealProduct[];
  activities?: Activity[];
}

/**
 * Representa um cliente/empresa no sistema
 */
export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  website?: string;
  region?: string;
  segment?: 'enterprise' | 'mid-market' | 'smb' | 'startup';
  industry?: string;
  employee_count?: number;
  annual_revenue?: number;
  total_value?: number;
  lat?: number;
  lng?: number;
  lead_source?: string;
  is_activated?: boolean;
  activated_at?: string;
  created_at: string;
  updated_at: string;
  last_contact_date?: string;
  deals?: Deal[];
}

/**
 * Representa uma atividade/interação com cliente ou lead
 */
export interface Activity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'whatsapp' | 'linkedin';
  client_id: string;
  deal_id?: string;
  user_id: string;
  duration_seconds?: number;
  outcome?: 'successful' | 'no_answer' | 'callback' | 'not_interested' | 'meeting_scheduled';
  notes?: string;
  scheduled_at?: string;
  completed_at?: string;
  created_at: string;
  metadata?: Record<string, unknown>;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  role: 'admin' | 'manager' | 'sales_rep' | 'sales_ops';
  team_id?: string;
  created_at: string;
  is_active: boolean;
  phone?: string;
  timezone?: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  label?: string;
  order: number;
  probability: number;
  pipeline_id: string;
  color?: string;
  created_at: string;
}

export interface Pipeline {
  id: string;
  name: string;
  description?: string;
  stages: PipelineStage[];
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  sku?: string;
  category?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Representa uma oportunidade de negócio no pipeline de vendas
 */
export interface DealProduct {
  id: string;
  deal_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  discount?: number;
  total: number;
  created_at: string;
}

export interface Cadence {
  id: string;
  name: string;
  description?: string;
  steps: CadenceStep[];
  active: boolean;
  created_by: string;
  created_at: string;
}

export interface CadenceStep {
  id: string;
  cadence_id: string;
  order: number;
  type: 'email' | 'call' | 'task' | 'linkedin' | 'whatsapp';
  wait_days: number;
  template?: string;
  subject?: string;
  created_at: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xp_reward: number;
  category: 'sales' | 'activity' | 'streak' | 'team' | 'revenue';
  requirement_type: 'count' | 'value' | 'streak' | 'percentage';
  requirement_value: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  created_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  type: 'revenue' | 'deals' | 'calls' | 'meetings' | 'emails';
  target_value: number;
  current_value: number;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  assigned_to: string;
  created_by: string;
  due_date?: string;
  due_time?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  task_type?: 'call' | 'email' | 'meeting' | 'follow_up' | 'other';
  client_id?: string;
  deal_id?: string;
  sale_id?: string;
  salesperson_id?: string;
  created_at: string;
  sale?: { client_name: string };
  salesperson?: { name: string; avatar_url?: string };
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface MetricData {
  label: string;
  value: number;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
}


// ===== FILTERS & PAGINATION =====

export interface FilterOptions {
  dateRange?: DateRange;
  userId?: string;
  teamId?: string;
  stageId?: string;
  status?: Deal['status'];
  segment?: Client['segment'];
  search?: string;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Response padrão para queries paginadas
 * @template T - Tipo dos dados retornados
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ===== API RESPONSES =====

export interface ApiResponse<T> {
  data: T;
  error?: string;
  metadata?: {
    total?: number;
    page?: number;
    pageSize?: number;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export type DealStatus = Deal['status'];
export type ActivityType = Activity['type'];
export type UserRole = User['role'];

// ===== COMMERCIAL & APPROVALS =====

export interface CommercialGoal {
  id: string;
  salesperson_id: string;
  month: string;
  goal_amount: number;
  created_at?: string;
}

export interface ScoringRule {
  id: string;
  label: string;
  weight: number;
  points_per_unit: number;
  month: string | null;
  created_at?: string;
}

export interface CommissionConfig {
  id: string;
  salesperson_id: string;
  month: string;
  rate: number;
  created_at?: string;
}

export interface ApprovalRequest {
  id: string;
  requester_id: string;
  approver_id?: string;
  type: 'goal' | 'scoring_rule' | 'commission';
  entity_id: string;
  competence_month: string;
  new_values: Record<string, string | number | boolean | null | undefined>;
  old_values?: Record<string, string | number | boolean | null | undefined>;
  justification?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  changes: {
    from: Record<string, string | number | boolean | null | undefined>;
    to: Record<string, string | number | boolean | null | undefined>;
  };
  metadata?: Record<string, string | number | boolean | null | undefined>;
  created_at: string;
}
