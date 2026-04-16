/**
 * Schema de entidades disponíveis no Custom Report Builder.
 * Mapeia cada entidade às colunas selecionáveis.
 */

export type ReportEntity =
  | "sales"
  | "accounts"
  | "activities"
  | "leads"
  | "salespeople"
  | "clients"
  | "cross";

export type FilterOp =
  | "eq" | "neq" | "gt" | "gte" | "lt" | "lte"
  | "like" | "ilike" | "in" | "is";

export interface ReportFilter {
  field: string;
  op: FilterOp;
  value: unknown;
}

export interface ReportOrderBy {
  field: string;
  direction: "asc" | "desc";
}

export type VizType = "table" | "bar" | "line" | "pie" | "funnel" | "heatmap" | "kpi";

export interface ReportConfig {
  columns: string[];
  filters?: ReportFilter[];
  group_by?: string[];
  order_by?: ReportOrderBy[];
  limit?: number;
  viz_type?: VizType;
  joins?: { entity: ReportEntity; on: string }[];
}

export interface EntityFieldDef {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "bool" | "enum";
  options?: string[];
}

export const ENTITY_FIELDS: Record<Exclude<ReportEntity, "cross">, EntityFieldDef[]> = {
  sales: [
    { key: "id", label: "ID", type: "text" },
    { key: "client_name", label: "Cliente", type: "text" },
    { key: "product_name", label: "Produto", type: "text" },
    { key: "amount", label: "Valor", type: "number" },
    { key: "status", label: "Status", type: "enum", options: ["lead","prospecting","qualified","proposal","negotiation","completed","lost","cancelled"] },
    { key: "category", label: "Categoria", type: "text" },
    { key: "source", label: "Origem", type: "text" },
    { key: "stage", label: "Etapa", type: "text" },
    { key: "created_at", label: "Criado em", type: "date" },
    { key: "updated_at", label: "Atualizado em", type: "date" },
  ],
  accounts: [
    { key: "id", label: "ID", type: "text" },
    { key: "name", label: "Nome", type: "text" },
    { key: "tier", label: "Tier", type: "enum", options: ["smb","mid_market","enterprise","strategic"] },
    { key: "industry", label: "Setor", type: "text" },
    { key: "country", label: "País", type: "text" },
    { key: "annual_revenue", label: "Receita Anual", type: "number" },
    { key: "employee_count", label: "Funcionários", type: "number" },
    { key: "account_score", label: "Score", type: "number" },
    { key: "health_status", label: "Saúde", type: "enum", options: ["healthy","at_risk","critical","unknown"] },
    { key: "created_at", label: "Criado em", type: "date" },
  ],
  activities: [
    { key: "id", label: "ID", type: "text" },
    { key: "activity_type", label: "Tipo", type: "text" },
    { key: "outcome", label: "Resultado", type: "text" },
    { key: "duration_minutes", label: "Duração (min)", type: "number" },
    { key: "contact_name", label: "Contato", type: "text" },
    { key: "created_at", label: "Data", type: "date" },
  ],
  leads: [
    { key: "id", label: "ID", type: "text" },
    { key: "client_name", label: "Lead", type: "text" },
    { key: "source", label: "Origem", type: "text" },
    { key: "amount", label: "Valor potencial", type: "number" },
    { key: "created_at", label: "Criado em", type: "date" },
  ],
  salespeople: [
    { key: "id", label: "ID", type: "text" },
    { key: "name", label: "Nome", type: "text" },
    { key: "role", label: "Função", type: "text" },
    { key: "is_active", label: "Ativo", type: "bool" },
    { key: "created_at", label: "Criado em", type: "date" },
  ],
  clients: [
    { key: "id", label: "ID", type: "text" },
    { key: "name", label: "Nome", type: "text" },
    { key: "company", label: "Empresa", type: "text" },
    { key: "email", label: "Email", type: "text" },
    { key: "total_value", label: "Valor total", type: "number" },
    { key: "created_at", label: "Criado em", type: "date" },
  ],
};

export const ENTITY_LABELS: Record<ReportEntity, string> = {
  sales: "Vendas / Deals",
  accounts: "Contas (B2B)",
  activities: "Atividades",
  leads: "Leads",
  salespeople: "Vendedores",
  clients: "Clientes",
  cross: "Cross-objects (joins)",
};

export const VIZ_LABELS: Record<VizType, string> = {
  table: "Tabela",
  bar: "Barras",
  line: "Linhas",
  pie: "Pizza",
  funnel: "Funil",
  heatmap: "Heatmap",
  kpi: "KPI / Card",
};

export const FILTER_OP_LABELS: Record<FilterOp, string> = {
  eq: "Igual a",
  neq: "Diferente de",
  gt: "Maior que",
  gte: "Maior ou igual",
  lt: "Menor que",
  lte: "Menor ou igual",
  like: "Contém (case-sensitive)",
  ilike: "Contém",
  in: "Em (lista)",
  is: "É (null/true/false)",
};

export function defaultConfigForEntity(entity: ReportEntity): ReportConfig {
  if (entity === "cross") {
    return { columns: [], viz_type: "table", joins: [{ entity: "sales", on: "salesperson_id" }] };
  }
  const fields = ENTITY_FIELDS[entity] ?? [];
  return {
    columns: fields.slice(0, 5).map((f) => f.key),
    filters: [],
    order_by: fields.find((f) => f.key === "created_at")
      ? [{ field: "created_at", direction: "desc" }]
      : [],
    viz_type: "table",
  };
}

export function validateConfig(config: ReportConfig): { ok: boolean; error?: string } {
  if (!Array.isArray(config.columns) || config.columns.length === 0) {
    return { ok: false, error: "Selecione ao menos uma coluna" };
  }
  return { ok: true };
}
