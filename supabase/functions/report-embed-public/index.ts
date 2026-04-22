import { createClient } from "npm:@supabase/supabase-js@2.49.4";

const baseCors: Record<string, string> = {
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

const SAFE_FIELD = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
const SAFE_PREFIXED = /^[a-zA-Z_][a-zA-Z0-9_]*\.[a-zA-Z_][a-zA-Z0-9_]*$/;
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
  leads: { salespeople: { fk: "salesperson_id", target: "salespeople_public" } },
};

// Hide sensitive columns from public embeds
const HIDDEN_FIELDS = new Set(["email", "commission", "commission_rate", "phone", "personal_email"]);

interface RateLimitEntry { count: number; resetAt: number; }
const rateLimit = new Map<string, RateLimitEntry>();
const RATE_LIMIT_MAX = 60;
const RATE_LIMIT_WINDOW_MS = 60_000;

function checkRateLimit(token: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(token);
  if (!entry || entry.resetAt < now) {
    rateLimit.set(token, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

function pickCorsOrigin(reqOrigin: string | null, allowed: string[]): string {
  if (!allowed || allowed.length === 0) return "*";
  if (reqOrigin && allowed.includes(reqOrigin)) return reqOrigin;
  return allowed[0];
}

function buildSelect(columns: string[], targets: Set<string>): string {
  const baseCols: string[] = [];
  const joinedCols = new Map<string, string[]>();
  for (const col of columns) {
    if (HIDDEN_FIELDS.has(col)) continue;
    const dot = col.indexOf(".");
    if (dot > 0) {
      const target = col.slice(0, dot);
      const field = col.slice(dot + 1);
      if (HIDDEN_FIELDS.has(field)) continue;
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
  const reqOrigin = req.headers.get("origin");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { ...baseCors, "Access-Control-Allow-Origin": reqOrigin ?? "*" } });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token || token.length < 20) {
      return new Response(JSON.stringify({ error: "Token inválido" }), {
        status: 400,
        headers: { ...baseCors, "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
      });
    }

    if (!checkRateLimit(token)) {
      return new Response(JSON.stringify({ error: "Rate limit excedido" }), {
        status: 429,
        headers: { ...baseCors, "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
      });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: tokenRow, error: tErr } = await admin
      .from("report_embed_tokens")
      .select("*, custom_reports(*)")
      .eq("token", token)
      .maybeSingle();

    if (tErr || !tokenRow) {
      return new Response(JSON.stringify({ error: "Token não encontrado" }), {
        status: 404,
        headers: { ...baseCors, "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
      });
    }

    if (tokenRow.revoked) {
      return new Response(JSON.stringify({ error: "Token revogado" }), {
        status: 403,
        headers: { ...baseCors, "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
      });
    }

    if (tokenRow.expires_at && new Date(tokenRow.expires_at).getTime() < Date.now()) {
      return new Response(JSON.stringify({ error: "Token expirado" }), {
        status: 403,
        headers: { ...baseCors, "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
      });
    }

    const allowedOrigins = (tokenRow.allowed_origins ?? []) as string[];
    const corsOrigin = pickCorsOrigin(reqOrigin, allowedOrigins);

    const report = tokenRow.custom_reports as {
      name: string;
      entity: string;
      config: { columns?: string[]; filters?: { field: string; op: string; value: unknown }[]; order_by?: { field: string; direction: string }[]; viz_type?: string; base?: string; joins?: { entity: string }[] };
    } | null;

    if (!report) {
      return new Response(JSON.stringify({ error: "Relatório não encontrado" }), {
        status: 404,
        headers: { ...baseCors, "Access-Control-Allow-Origin": corsOrigin, "Content-Type": "application/json" },
      });
    }

    const cfg = report.config ?? {};
    let entity = report.entity;
    let isCross = false;
    const joinTargets = new Set<string>();

    if (entity === "cross") {
      isCross = true;
      const base = cfg.base ?? "sales";
      if (!JOIN_MAP[base]) {
        return new Response(JSON.stringify({ error: "Base inválida" }), {
          status: 400,
          headers: { ...baseCors, "Access-Control-Allow-Origin": corsOrigin, "Content-Type": "application/json" },
        });
      }
      entity = base;
      for (const j of (cfg.joins ?? []).slice(0, 3)) {
        const def = JOIN_MAP[base][j.entity];
        if (def) joinTargets.add(def.target);
      }
    }

    if (entity === "salespeople") entity = "salespeople_public";
    if (!ALLOWED_ENTITIES.includes(entity)) {
      return new Response(JSON.stringify({ error: "Entidade não permitida" }), {
        status: 400,
        headers: { ...baseCors, "Access-Control-Allow-Origin": corsOrigin, "Content-Type": "application/json" },
      });
    }

    const columns = (cfg.columns ?? []).filter((c) => !HIDDEN_FIELDS.has(c));
    const selectStr = columns.length
      ? (isCross ? buildSelect(columns, joinTargets) : columns.filter((c) => SAFE_FIELD.test(c)).join(",") || "*")
      : "*";

    let q = admin.from(entity).select(selectStr).limit(500);

    for (const f of cfg.filters ?? []) {
      if (!ALLOWED_OPS.includes(f.op)) continue;
      if (HIDDEN_FIELDS.has(f.field)) continue;
      if (!SAFE_FIELD.test(f.field) && !SAFE_PREFIXED.test(f.field)) continue;
      if (f.field.includes(".")) {
        const [target] = f.field.split(".");
        if (!joinTargets.has(target)) continue;
      }
      // @ts-expect-error dynamic operator
      q = q[f.op](f.field, f.value);
    }

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

    const { data, error } = await q;

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { ...baseCors, "Access-Control-Allow-Origin": corsOrigin, "Content-Type": "application/json" },
      });
    }

    let rows = (data ?? []) as Record<string, unknown>[];
    if (isCross) {
      rows = rows.map((row) => {
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

    // Update view counter (fire and forget)
    admin
      .from("report_embed_tokens")
      .update({ view_count: (tokenRow.view_count ?? 0) + 1, last_viewed_at: new Date().toISOString() })
      .eq("id", tokenRow.id)
      .then(() => {});

    return new Response(
      JSON.stringify({
        ok: true,
        name: report.name,
        viz_type: cfg.viz_type ?? "table",
        columns,
        rows,
        generated_at: new Date().toISOString(),
      }),
      { headers: { ...baseCors, "Access-Control-Allow-Origin": corsOrigin, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Erro desconhecido" }),
      { status: 500, headers: { ...baseCors, "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" } },
    );
  }
});
