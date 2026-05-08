/**
 * Merge tags engine for cadence templates and message templates.
 * Replaces {{variable}} placeholders with actual data from sale/client/salesperson context.
 */

export interface MergeTagContext {
  sale?: {
    client_name?: string | null;
    amount?: number | null;
    stage?: string | null;
    category?: string | null;
    source?: string | null;
    notes?: string | null;
  } | null;
  client?: {
    name?: string | null;
    company?: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;
  salesperson?: {
    name?: string | null;
    email?: string | null;
  } | null;
  custom?: Record<string, string | number | null | undefined>;
}

export interface MergeTagDefinition {
  key: string;
  label: string;
  example: string;
  group: "Cliente" | "Vendedor" | "Negócio" | "SINGU Intelligence" | "Outros";
}

export const AVAILABLE_MERGE_TAGS: MergeTagDefinition[] = [
  { key: "cliente.nome", label: "Nome do cliente", example: "João Silva", group: "Cliente" },
  { key: "cliente.empresa", label: "Empresa", example: "Acme Ltda", group: "Cliente" },
  { key: "cliente.email", label: "E-mail", example: "joao@acme.com", group: "Cliente" },
  { key: "cliente.telefone", label: "Telefone", example: "(11) 9 9999-9999", group: "Cliente" },
  { key: "vendedor.nome", label: "Seu nome", example: "Maria", group: "Vendedor" },
  { key: "vendedor.email", label: "Seu e-mail", example: "maria@empresa.com", group: "Vendedor" },
  { key: "negocio.valor", label: "Valor", example: "R$ 12.500,00", group: "Negócio" },
  { key: "negocio.estagio", label: "Estágio", example: "qualified", group: "Negócio" },
  { key: "negocio.categoria", label: "Categoria", example: "Brindes Premium", group: "Negócio" },
  { key: "negocio.fonte", label: "Fonte do lead", example: "LinkedIn", group: "Negócio" },
  { key: "data.hoje", label: "Data de hoje", example: "16/04/2026", group: "Outros" },
  { key: "data.amanha", label: "Amanhã", example: "17/04/2026", group: "Outros" },
  { key: "singu.primeira_frase", label: "Primeira frase (IA)", example: "Vi que vocês expandiram para o México recentemente...", group: "SINGU Intelligence" },
  { key: "singu.noticia_empresa", label: "Notícia da empresa", example: "Parabéns pela rodada Series B de R$ 50M!", group: "SINGU Intelligence" },
  { key: "singu.tecnologias", label: "Tecnologias usadas", example: "Salesforce e Hubspot", group: "SINGU Intelligence" },
];

const formatBRL = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const formatDateBR = (date: Date) =>
  new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(date);

function resolveTag(key: string, ctx: MergeTagContext): string {
  const lower = key.trim().toLowerCase();
  switch (lower) {
    case "cliente.nome":
      return ctx.client?.name ?? ctx.sale?.client_name ?? "[cliente]";
    case "cliente.empresa":
      return ctx.client?.company ?? "[empresa]";
    case "cliente.email":
      return ctx.client?.email ?? "[email]";
    case "cliente.telefone":
      return ctx.client?.phone ?? "[telefone]";
    case "vendedor.nome":
      return ctx.salesperson?.name ?? "[vendedor]";
    case "vendedor.email":
      return ctx.salesperson?.email ?? "[email-vendedor]";
    case "negocio.valor":
      return ctx.sale?.amount != null ? formatBRL(Number(ctx.sale.amount)) : "[valor]";
    case "negocio.estagio":
      return ctx.sale?.stage ?? "[estágio]";
    case "negocio.categoria":
      return ctx.sale?.category ?? "[categoria]";
    case "negocio.fonte":
      return ctx.sale?.source ?? "[fonte]";
    case "data.hoje":
      return formatDateBR(new Date());
    case "data.amanha": {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      return formatDateBR(d);
    }
    case "singu.primeira_frase":
      return ctx.custom?.["singu.primeira_frase"] != null ? String(ctx.custom["singu.primeira_frase"]) : "[IA Personalizada: Vi que a {{cliente.empresa}}...]";
    case "singu.noticia_empresa":
      return ctx.custom?.["singu.noticia_empresa"] != null ? String(ctx.custom["singu.noticia_empresa"]) : "[Notícia recente da empresa]";
    case "singu.tecnologias":
      return ctx.custom?.["singu.tecnologias"] != null ? String(ctx.custom["singu.tecnologias"]) : "[Tecnologias do stack]";
    default: {
      const customVal = ctx.custom?.[lower];
      if (customVal != null) return String(customVal);
      return `{{${key}}}`;
    }
  }
}

/**
 * Replace all {{tag}} occurrences in a template string.
 * Supports nested keys via dot-notation (e.g. cliente.nome).
 */
export function applyMergeTags(template: string, ctx: MergeTagContext): string {
  if (!template) return "";
  return template.replace(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g, (_, key) => resolveTag(key, ctx));
}

/**
 * Extract all merge tag keys present in a template — useful for previewing/highlighting.
 */
export function extractMergeTags(template: string): string[] {
  if (!template) return [];
  const matches = template.matchAll(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g);
  return Array.from(new Set(Array.from(matches, (m) => m[1])));
}
