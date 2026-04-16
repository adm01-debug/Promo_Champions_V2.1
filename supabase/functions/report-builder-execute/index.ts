import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/cors.ts";

interface ReportFilter {
  field: string;
  op: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "like" | "ilike" | "in" | "is";
  value: unknown;
}

interface ReportConfig {
  columns: string[];
  filters?: ReportFilter[];
  group_by?: string[];
  order_by?: { field: string; direction: "asc" | "desc" }[];
  limit?: number;
  viz_type?: string;
  joins?: { entity: string; on: string }[];
}

const ALLOWED_ENTITIES = ["sales", "accounts", "activities", "leads", "salespeople_public", "clients"];
const ALLOWED_OPS = ["eq", "neq", "gt", "gte", "lt", "lte", "like", "ilike", "in", "is"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: authErr } = await supabase.auth.getClaims(token);
    if (authErr || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Token inválido" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const { report_id, override_config, page = 1, page_size = 100 } = body;

    if (!report_id) {
      return new Response(JSON.stringify({ error: "report_id obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch report (RLS ensures user has access)
    const { data: report, error: rErr } = await supabase
      .from("custom_reports")
      .select("*")
      .eq("id", report_id)
      .single();

    if (rErr || !report) {
      return new Response(JSON.stringify({ error: "Relatório não encontrado" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const cfg: ReportConfig = override_config ?? report.config ?? {};
    let entity: string = report.entity;

    // Map cross / salespeople
    if (entity === "cross") entity = cfg.joins?.[0]?.entity ?? "sales";
    if (entity === "salespeople") entity = "salespeople_public";

    if (!ALLOWED_ENTITIES.includes(entity)) {
      return new Response(JSON.stringify({ error: `Entidade não permitida: ${entity}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const columns = (cfg.columns?.length ? cfg.columns : ["*"])
      .filter((c) => /^[a-zA-Z_][a-zA-Z0-9_,\s\.]*$/.test(c))
      .join(",") || "*";

    let q = supabase.from(entity).select(columns, { count: "exact" });

    // Apply filters
    for (const f of cfg.filters ?? []) {
      if (!ALLOWED_OPS.includes(f.op)) continue;
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(f.field)) continue;
      // @ts-expect-error dynamic operator
      q = q[f.op](f.field, f.value);
    }

    // Order
    for (const o of cfg.order_by ?? []) {
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(o.field)) continue;
      q = q.order(o.field, { ascending: o.direction !== "desc" });
    }

    const from = (page - 1) * page_size;
    const to = from + page_size - 1;
    q = q.range(from, Math.min(to, from + 999));

    const t0 = performance.now();
    const { data, error, count } = await q;
    const duration_ms = Math.round(performance.now() - t0);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Group-by post-processing (simple in-memory aggregation)
    let result = data ?? [];
    if (cfg.group_by?.length) {
      const groups = new Map<string, Record<string, unknown>>();
      for (const row of result) {
        const key = cfg.group_by.map((g) => String((row as Record<string, unknown>)[g] ?? "")).join("|");
        const existing = groups.get(key);
        if (!existing) {
          groups.set(key, { ...(row as Record<string, unknown>), _count: 1 });
        } else {
          existing._count = (existing._count as number) + 1;
        }
      }
      result = Array.from(groups.values());
    }

    return new Response(
      JSON.stringify({
        ok: true,
        rows: result,
        total: count,
        page,
        page_size,
        duration_ms,
        entity,
        viz_type: cfg.viz_type ?? "table",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
