import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";

interface ReportFilter {
  field: string;
  op: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "like" | "ilike" | "in" | "is";
  value: unknown;
}

interface ReportJoin {
  entity: "accounts" | "salespeople" | "clients" | "sales";
}

interface ReportConfig {
  columns: string[];
  filters?: ReportFilter[];
  group_by?: string[];
  order_by?: { field: string; direction: "asc" | "desc" }[];
  limit?: number;
  viz_type?: string;
  base?: "sales" | "activities" | "leads";
  joins?: ReportJoin[];
}

const ALLOWED_ENTITIES = ["sales", "accounts", "activities", "leads", "salespeople_public", "clients"];
const ALLOWED_OPS = ["eq", "neq", "gt", "gte", "lt", "lte", "like", "ilike", "in", "is"];

const JOIN_MAP: Record<string, Record<string, { fk: string; target: string }>> = {
  sales: {
    accounts: { fk: "account_id", target: "accounts" },
    salespeople: { fk: "salesperson_id", target: "salespeople_public" },
    clients: { fk: "client_id", target: "clients" },
  },
  activities: {
    salespeople: { fk: "salesperson_id", target: "salespeople_public" },
    sales: { fk: "sale_id", target: "sales" },
  },
  leads: {
    salespeople: { fk: "salesperson_id", target: "salespeople_public" },
  },
};

const SAFE_FIELD = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
const SAFE_PREFIXED = /^[a-zA-Z_][a-zA-Z0-9_]*\.[a-zA-Z_][a-zA-Z0-9_]*$/;

function buildSelect(columns: string[], targets: Set<string>): string {
  const baseCols: string[] = [];
  const joinedCols = new Map<string, string[]>();
  for (const col of columns) {
    const dot = col.indexOf(".");
    if (dot > 0) {
      const target = col.slice(0, dot);
      const field = col.slice(dot + 1);
      if (targets.has(target) && SAFE_FIELD.test(target) && SAFE_FIELD.test(field)) {
        const arr = joinedCols.get(target) ?? [];
        arr.push(field);
        joinedCols.set(target, arr);
        continue;
      }
    }
    if (SAFE_FIELD.test(col)) baseCols.push(col);
  }
  const parts = [...baseCols];
  for (const [target, fields] of joinedCols.entries()) {
    parts.push(`${target}(${fields.join(",")})`);
  }
  return parts.join(",") || "*";
}

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
    let isCross = false;
    let joinTargets = new Set<string>();

    if (entity === "cross") {
      isCross = true;
      const base = cfg.base ?? "sales";
      if (!JOIN_MAP[base]) {
        return new Response(JSON.stringify({ error: `Base inválida para cross: ${base}` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      entity = base;
      const joins = (cfg.joins ?? []).slice(0, 3);
      for (const j of joins) {
        const def = JOIN_MAP[base][j.entity];
        if (def) joinTargets.add(def.target);
      }
    }

    if (entity === "salespeople") entity = "salespeople_public";

    if (!ALLOWED_ENTITIES.includes(entity)) {
      return new Response(JSON.stringify({ error: `Entidade não permitida: ${entity}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const columns = cfg.columns?.length
      ? (isCross ? buildSelect(cfg.columns, joinTargets) : cfg.columns.filter((c) => SAFE_FIELD.test(c)).join(",") || "*")
      : "*";

    let q = supabase.from(entity).select(columns, { count: "exact" });

    // Apply filters
    for (const f of cfg.filters ?? []) {
      if (!ALLOWED_OPS.includes(f.op)) continue;
      // Aceita field ou target.field para joined
      if (!SAFE_FIELD.test(f.field) && !SAFE_PREFIXED.test(f.field)) continue;
      if (f.field.includes(".")) {
        const [target] = f.field.split(".");
        if (!joinTargets.has(target)) continue;
      }
      // @ts-expect-error dynamic operator
      q = q[f.op](f.field, f.value);
    }

    // Order
    for (const o of cfg.order_by ?? []) {
      if (!SAFE_FIELD.test(o.field) && !SAFE_PREFIXED.test(o.field)) continue;
      if (o.field.includes(".")) {
        const [target, field] = o.field.split(".");
        if (!joinTargets.has(target)) continue;
        q = q.order(field, { ascending: o.direction !== "desc", referencedTable: target });
      } else {
        q = q.order(o.field, { ascending: o.direction !== "desc" });
      }
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

    // Flatten joined records for table viz
    let result: Record<string, unknown>[] = (data ?? []) as Record<string, unknown>[];
    if (isCross) {
      result = result.map((row) => {
        const flat: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(row)) {
          if (v && typeof v === "object" && !Array.isArray(v)) {
            for (const [sk, sv] of Object.entries(v as Record<string, unknown>)) {
              flat[`${k}.${sk}`] = sv;
            }
          } else {
            flat[k] = v;
          }
        }
        return flat;
      });
    }

    if (cfg.group_by?.length) {
      const groups = new Map<string, Record<string, unknown>>();
      for (const row of result) {
        const key = cfg.group_by.map((g) => String(row[g] ?? "")).join("|");
        const existing = groups.get(key);
        if (!existing) {
          groups.set(key, { ...row, _count: 1 });
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
        is_cross: isCross,
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
