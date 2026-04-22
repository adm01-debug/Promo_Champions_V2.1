// Pure resolvers for whitelisted NLQ tools. Uses caller's Supabase client (RLS applied).
// deno-lint-ignore-file no-explicit-any
import { SupabaseClient } from "npm:@supabase/supabase-js@2.49.4";

export type ResolverResult = {
  rows: Record<string, unknown>[];
  summary: Record<string, unknown>;
};

const SAFE_STATUSES = new Set([
  "completed", "pending", "cancelled", "lead", "qualified", "proposal",
  "negotiation", "closed", "prospecting", "won", "lost",
]);
const SAFE_CATEGORIES = new Set(["subscription", "service", "project", "other", "brindes"]);
const SAFE_GROUP_BY = new Set(["day", "week", "month", "salesperson", "category"]);
const SAFE_METRICS = new Set([
  "revenue", "count", "avg_ticket", "won_count", "lost_count", "conversion_rate",
]);

function clampDate(s: string | undefined, fallback: string): string {
  if (!s) return fallback;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return fallback;
  return d.toISOString();
}

function bucketKey(iso: string, group: "day" | "week" | "month"): string {
  const d = new Date(iso);
  if (group === "day") return d.toISOString().slice(0, 10);
  if (group === "month") return d.toISOString().slice(0, 7);
  // week: yyyy-Www
  const onejan = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

export async function querySalesMetric(supabase: SupabaseClient, args: any): Promise<ResolverResult> {
  const metric = SAFE_METRICS.has(args?.metric) ? args.metric : "revenue";
  const now = new Date();
  const defaultStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const period_start = clampDate(args?.period_start, defaultStart);
  const period_end = clampDate(args?.period_end, now.toISOString());
  const group_by = SAFE_GROUP_BY.has(args?.group_by) ? args.group_by : null;
  const filters = args?.filters ?? {};

  let q = supabase
    .from("sales")
    .select("id, amount, status, category, created_at, salesperson_id")
    .gte("created_at", period_start)
    .lte("created_at", period_end)
    .limit(5000);

  if (filters?.status && SAFE_STATUSES.has(filters.status)) q = q.eq("status", filters.status);
  if (filters?.category && SAFE_CATEGORIES.has(filters.category)) q = q.eq("category", filters.category);
  if (filters?.salesperson_id && typeof filters.salesperson_id === "string") {
    q = q.eq("salesperson_id", filters.salesperson_id);
  }

  // For revenue/avg_ticket we typically want closed deals; default to won/completed unless caller filtered
  if (!filters?.status && (metric === "revenue" || metric === "avg_ticket" || metric === "won_count")) {
    q = q.in("status", ["completed", "won", "closed"]);
  }
  if (!filters?.status && metric === "lost_count") q = q.eq("status", "lost");

  const { data, error } = await q;
  if (error) throw new Error(`sales query failed: ${error.message}`);
  const sales = data ?? [];

  // Compute aggregates
  const totalAmount = sales.reduce((s, r: any) => s + Number(r.amount || 0), 0);
  const count = sales.length;

  if (metric === "conversion_rate") {
    // Re-query without status filter to get full denominator
    const { data: all } = await supabase
      .from("sales")
      .select("status")
      .gte("created_at", period_start)
      .lte("created_at", period_end)
      .limit(5000);
    const total = (all ?? []).length;
    const won = (all ?? []).filter((r: any) => ["won", "completed", "closed"].includes(r.status)).length;
    const rate = total > 0 ? (won / total) * 100 : 0;
    return {
      rows: [{ total_deals: total, won_deals: won, conversion_rate: rate }],
      summary: { metric, period_start, period_end, conversion_rate: rate, total, won },
    };
  }

  let rows: Record<string, unknown>[] = [];
  if (group_by === "day" || group_by === "week" || group_by === "month") {
    const buckets = new Map<string, { revenue: number; count: number }>();
    for (const r of sales as any[]) {
      const k = bucketKey(r.created_at, group_by);
      const cur = buckets.get(k) ?? { revenue: 0, count: 0 };
      cur.revenue += Number(r.amount || 0);
      cur.count += 1;
      buckets.set(k, cur);
    }
    rows = [...buckets.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([period, v]) => ({ period, revenue: v.revenue, count: v.count, avg_ticket: v.count ? v.revenue / v.count : 0 }));
  } else if (group_by === "category") {
    const buckets = new Map<string, { revenue: number; count: number }>();
    for (const r of sales as any[]) {
      const k = r.category ?? "outros";
      const cur = buckets.get(k) ?? { revenue: 0, count: 0 };
      cur.revenue += Number(r.amount || 0);
      cur.count += 1;
      buckets.set(k, cur);
    }
    rows = [...buckets.entries()].map(([category, v]) => ({ category, revenue: v.revenue, count: v.count }));
  } else if (group_by === "salesperson") {
    const buckets = new Map<string, { revenue: number; count: number }>();
    for (const r of sales as any[]) {
      const k = r.salesperson_id ?? "unassigned";
      const cur = buckets.get(k) ?? { revenue: 0, count: 0 };
      cur.revenue += Number(r.amount || 0);
      cur.count += 1;
      buckets.set(k, cur);
    }
    const ids = [...buckets.keys()].filter(id => id !== "unassigned");
    let nameMap = new Map<string, string>();
    if (ids.length > 0) {
      const { data: ppl } = await supabase.from("salespeople_public").select("id, name").in("id", ids);
      nameMap = new Map((ppl ?? []).map((p: any) => [p.id, p.name]));
    }
    rows = [...buckets.entries()].map(([id, v]) => ({
      salesperson_id: id,
      salesperson_name: nameMap.get(id) ?? "Sem responsável",
      revenue: v.revenue,
      count: v.count,
    })).sort((a: any, b: any) => b.revenue - a.revenue);
  }

  return {
    rows,
    summary: {
      metric,
      period_start,
      period_end,
      total_revenue: totalAmount,
      count,
      avg_ticket: count > 0 ? totalAmount / count : 0,
    },
  };
}

export async function queryPipelineSnapshot(supabase: SupabaseClient, args: any): Promise<ResolverResult> {
  const stage = typeof args?.stage === "string" && SAFE_STATUSES.has(args.stage) ? args.stage : null;
  let q = supabase.from("sales").select("status, amount").not("status", "in", "(won,lost,completed,cancelled)").limit(5000);
  if (stage) q = q.eq("status", stage);
  const { data, error } = await q;
  if (error) throw new Error(`pipeline query failed: ${error.message}`);

  const map = new Map<string, { count: number; value: number }>();
  for (const r of (data ?? []) as any[]) {
    const cur = map.get(r.status) ?? { count: 0, value: 0 };
    cur.count += 1;
    cur.value += Number(r.amount || 0);
    map.set(r.status, cur);
  }
  const rows = [...map.entries()].map(([stage, v]) => ({ stage, ...v }));
  const total = rows.reduce((s, r: any) => s + r.value, 0);
  return { rows, summary: { total_pipeline_value: total, stages: rows.length } };
}

export async function queryActivities(supabase: SupabaseClient, args: any): Promise<ResolverResult> {
  const now = new Date();
  const period_start = clampDate(args?.period_start, new Date(now.getTime() - 7 * 86400000).toISOString());
  const period_end = clampDate(args?.period_end, now.toISOString());

  let q = supabase
    .from("activities")
    .select("id, activity_type, outcome, created_at, duration_minutes")
    .gte("created_at", period_start)
    .lte("created_at", period_end)
    .limit(5000);

  if (args?.type && typeof args.type === "string") q = q.eq("activity_type", args.type);

  const { data, error } = await q;
  if (error) throw new Error(`activities query failed: ${error.message}`);

  const byType = new Map<string, number>();
  for (const r of (data ?? []) as any[]) {
    byType.set(r.activity_type, (byType.get(r.activity_type) ?? 0) + 1);
  }
  const rows = [...byType.entries()].map(([activity_type, count]) => ({ activity_type, count }));
  return {
    rows,
    summary: { total: (data ?? []).length, period_start, period_end, types: rows.length },
  };
}

export async function queryTopClients(supabase: SupabaseClient, args: any): Promise<ResolverResult> {
  const limit = Math.min(Math.max(Number(args?.limit) || 5, 1), 50);
  const now = new Date();
  const period_start = clampDate(args?.period_start, new Date(now.getFullYear(), now.getMonth() - 3, 1).toISOString());
  const period_end = clampDate(args?.period_end, now.toISOString());

  const { data, error } = await supabase
    .from("sales")
    .select("client_name, amount, status")
    .in("status", ["completed", "won", "closed"])
    .gte("created_at", period_start)
    .lte("created_at", period_end)
    .limit(5000);
  if (error) throw new Error(`top clients query failed: ${error.message}`);

  const map = new Map<string, { revenue: number; deals: number }>();
  for (const r of (data ?? []) as any[]) {
    const cur = map.get(r.client_name) ?? { revenue: 0, deals: 0 };
    cur.revenue += Number(r.amount || 0);
    cur.deals += 1;
    map.set(r.client_name, cur);
  }
  const rows = [...map.entries()]
    .map(([client_name, v]) => ({ client_name, ...v }))
    .sort((a: any, b: any) => b.revenue - a.revenue)
    .slice(0, limit);
  return { rows, summary: { period_start, period_end, top_clients: rows.length } };
}
