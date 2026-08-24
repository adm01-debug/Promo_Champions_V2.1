/**
 * Schema de entidades disponíveis no Custom Report Builder.
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

export interface ReportJoin {
  entity: CrossJoinableEntity;
  on?: string;
}

export interface ReportConfig {
  columns: string[];
  filters?: ReportFilter[];
  group_by?: string[];
  order_by?: ReportOrderBy[];
  limit?: number;
  viz_type?: VizType;
  base?: CrossBaseEntity;
  joins?: ReportJoin[];
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

// ===== Cross-object joins =====

export type CrossBaseEntity = "sales" | "activities" | "leads";
export type CrossJoinableEntity = "accounts" | "salespeople" | "clients" | "sales";

export interface JoinDef {
  entity: CrossJoinableEntity;
  /** Coluna FK na tabela base */
  fk: string;
  /** Tabela alvo no Postgres (alias usado no select embedded) */
  target: string;
  label: string;
}

export const JOIN_MAP: Record<CrossBaseEntity, JoinDef[]> = {
  sales: [
    { entity: "accounts", fk: "account_id", target: "accounts", label: "Conta" },
    { entity: "salespeople", fk: "salesperson_id", target: "salespeople_public", label: "Vendedor" },
    { entity: "clients", fk: "client_id", target: "clients", label: "Cliente" },
  ],
  activities: [
    { entity: "salespeople", fk: "salesperson_id", target: "salespeople_public", label: "Vendedor" },
    { entity: "sales", fk: "sale_id", target: "sales", label: "Venda" },
  ],
  leads: [
    { entity: "salespeople", fk: "salesperson_id", target: "salespeople_public", label: "Vendedor" },
  ],
};

/**
 * Constrói lista de campos combinados (base + joins) com prefixo `target.field` para joined.
 */
export function buildCrossEntityFields(
  base: CrossBaseEntity,
  joins: ReportJoin[],
): EntityFieldDef[] {
  const baseFields = (ENTITY_FIELDS[base] ?? []).map((f) => ({ ...f, key: f.key, label: `${base}.${f.label}` }));
  const joined: EntityFieldDef[] = [];
  for (const j of joins) {
    const def = JOIN_MAP[base]?.find((d) => d.entity === j.entity);
    if (!def) continue;
    const fields = ENTITY_FIELDS[j.entity] ?? [];
    for (const f of fields) {
      joined.push({
        ...f,
        key: `${def.target}.${f.key}`,
        label: `${def.label}.${f.label}`,
      });
    }
  }
  return [...baseFields, ...joined];
}

/**
 * Converte lista de colunas (algumas com prefixo `target.field`) em string select PostgREST embedded.
 * Ex: ["id","amount","accounts.name","accounts.tier"] →
 *     "id,amount,accounts(name,tier)"
 */
export function serializeCrossSelect(columns: string[], joins: ReportJoin[], base: CrossBaseEntity): string {
  const baseCols: string[] = [];
  const joinedCols = new Map<string, string[]>(); // target → [fields]

  const targets = new Set(joins.map((j) => JOIN_MAP[base]?.find((d) => d.entity === j.entity)?.target).filter(Boolean) as string[]);

  for (const col of columns) {
    const dot = col.indexOf(".");
    if (dot > 0) {
      const target = col.slice(0, dot);
      const field = col.slice(dot + 1);
      if (targets.has(target)) {
        const arr = joinedCols.get(target) ?? [];
        arr.push(field);
        joinedCols.set(target, arr);
        continue;
      }
    }
    baseCols.push(col);
  }

  const parts = [...baseCols];
  for (const [target, fields] of joinedCols.entries()) {
    parts.push(`${target}(${fields.join(",")})`);
  }
  // Sempre inclui PK das tabelas joined para evitar nulos silenciosos
  return parts.join(",") || "*";
}

export function defaultConfigForEntity(entity: ReportEntity): ReportConfig {
  if (entity === "cross") {
    return {
      columns: ["id", "amount", "accounts.name", "accounts.tier"],
      base: "sales",
      joins: [{ entity: "accounts" }],
      viz_type: "table",
      filters: [],
      order_by: [{ field: "created_at", direction: "desc" }],
    };
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
