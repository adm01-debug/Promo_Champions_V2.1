import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { getCorsHeaders } from "../_shared/cors.ts";
import { withRequestId } from "../_shared/request-id.ts";
import { isAuthorizedCronRequest } from "../_shared/cron-request-auth.ts";
import { chunkedIn, type PostgrestLike } from "../_shared/chunked-in.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface Schedule {
  id: string;
  report_id: string;
  name: string;
  frequency: string;
  format: "csv" | "json";
  recipients: string[];
  created_by: string;
}

function toCSV(rows: Record<string, unknown>[]): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    if (v == null) return "";
    let s = typeof v === "object" ? JSON.stringify(v) : String(v);
    // Neutralize CSV formula injection (CWE-1236): a cell starting with
    // = + - @ TAB CR is executed as a formula by Excel/Sheets.
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
  ].join("\n");
}

// Entidades com coluna de dono (mesmo critério que a RLS aplica na UI).
// clients não tem coluna de dono própria: a carteira é client_portfolio.
const OWNER_SCOPED_ENTITIES = new Map<string, { column: string; idSpace: "sp" | "portfolio" }>([
  ["sales", { column: "salesperson_id", idSpace: "sp" }],
  ["accounts", { column: "owner_id", idSpace: "sp" }],
  ["activities", { column: "salesperson_id", idSpace: "sp" }],
  ["clients", { column: "id", idSpace: "portfolio" }],
]);

async function executeReport(
  admin: ReturnType<typeof createClient>,
  reportId: string,
  ownerAuthId: string,
) {
  const { data: report, error } = await admin.from("custom_reports").select("id, entity, config, owner_id").eq("id", reportId).single();
  if (error || !report) throw new Error(`Report ${reportId} não encontrado`);

  const cfg = (report.config ?? {}) as Record<string, unknown>;
  let entity = String(report.entity);
  if (entity === "salespeople") entity = "salespeople_public";
  if (entity === "cross") entity = String(cfg.base ?? "sales");

  const cols = Array.isArray(cfg.columns) && cfg.columns.length
    ? (cfg.columns as string[]).filter((c) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(c)).join(",") || "*"
    : "*";
  const limit = typeof cfg.limit === "number" ? Math.min(cfg.limit, 5000) : 1000;

  let query = admin.from(entity).select(cols).limit(limit);

  // O client service_role ignora RLS: o relatório rodava SEMPRE com escopo
  // global, expondo dados de toda a equipe no arquivo de um vendedor.
  // Aplica o mesmo recorte da RLS: admin/manager vê tudo; vendedor vê só
  // as linhas do seu salesperson_id.
  const scope = OWNER_SCOPED_ENTITIES.get(entity);
  if (scope) {
    const { data: isPrivileged } = await admin.rpc("is_admin_or_manager", {
      _user_id: ownerAuthId,
    });
    if (!isPrivileged) {
      const { data: sp } = await admin
        .from("salespeople")
        .select("id")
        .eq("auth_user_id", ownerAuthId)
        .maybeSingle();
      if (!sp?.id) {
        throw new Error("Dono do relatório sem vínculo de vendedor — escopo não resolvido");
      }
      if (scope.idSpace === "portfolio") {
        // Carteira de clientes via client_portfolio (mesma leitura da RLS):
        // paginada — carteira >1.000 vínculos estoura a página do PostgREST.
        // A policy também lê clients.user_id = auth.uid(): esses IDs entram
        // na união para o relatório refletir o que a UI mostra.
        const idSet = new Set<string>();
        const PAGE = 1000;
        for (let from = 0; ; from += PAGE) {
          const { data: page, error: pErr } = await admin
            .from("client_portfolio")
            .select("client_id")
            .eq("salesperson_id", sp.id)
            .range(from, from + PAGE - 1);
          if (pErr) throw new Error(`client_portfolio: ${pErr.message}`);
          if (!page?.length) break;
          for (const p of page as { client_id: string }[]) idSet.add(p.client_id);
          if (page.length < PAGE) break;
        }
        for (let from = 0; ; from += PAGE) {
          const { data: page, error: oErr } = await admin
            .from("clients")
            .select("id")
            .eq("user_id", ownerAuthId)
            .range(from, from + PAGE - 1);
          if (oErr) throw new Error(`clients próprios: ${oErr.message}`);
          if (!page?.length) break;
          for (const c of page as { id: string }[]) idSet.add(c.id);
          if (page.length < PAGE) break;
        }

        // .in() com milhares de IDs estoura a URL do PostgREST — chunkedIn
        // divide em lotes; depois dedupe por id e o limit do cfg no merge.
        // O dedupe precisa do id na projeção: se cfg.columns o omitir, o id
        // entra só internamente e é removido das linhas finais.
        const requested = cols === "*" ? null : new Set(cols.split(",").map((c) => c.trim()));
        const selectCols = requested === null || requested.has("id") ? cols : `${cols},id`;
        const rows = await chunkedIn<Record<string, unknown>>(
          [...idSet],
          (chunk) =>
            admin.from(entity).select(selectCols).in("id", chunk).limit(limit) as unknown as PostgrestLike<
              Record<string, unknown>
            >,
          // Pool limitado: processSchedule dispara até 50 agendamentos em
          // paralelo — Promise.all ilimitado aqui saturaria o banco.
          { maxConcurrency: 4, label: "report-clients" },
        );
        const seen = new Set<string>();
        const merged: Record<string, unknown>[] = [];
        for (const r of rows) {
          const rid = String(r.id);
          if (!seen.has(rid)) {
            seen.add(rid);
            if (requested !== null && !requested.has("id")) delete r.id;
            merged.push(r);
          }
        }
        return merged.slice(0, limit);
      } else {
        query = query.eq(scope.column, sp.id);
      }
    }
  }

  const { data, error: qErr } = await query;
  if (qErr) throw new Error(qErr.message);
  return (data ?? []) as Record<string, unknown>[];
}

async function processSchedule(admin: ReturnType<typeof createClient>, s: Schedule) {
  const { data: run } = await admin
    .from("scheduled_report_runs")
    .insert({ schedule_id: s.id, status: "running" })
    .select()
    .single();

  try {
    const rows = await executeReport(admin, s.report_id, s.created_by);
    const content = s.format === "json" ? JSON.stringify(rows, null, 2) : toCSV(rows);
    const ext = s.format;
    const path = `${s.created_by}/${s.id}/${new Date().toISOString().replace(/[:.]/g, "-")}.${ext}`;

    const { error: upErr } = await admin.storage
      .from("report-snapshots")
      .upload(path, new Blob([content], { type: s.format === "csv" ? "text/csv" : "application/json" }), {
        upsert: false,
      });
    if (upErr) throw new Error(`Upload: ${upErr.message}`);

    await admin
      .from("scheduled_report_runs")
      .update({
        status: "success",
        finished_at: new Date().toISOString(),
        rows_count: rows.length,
        file_path: path,
      })
      .eq("id", run!.id);

    await admin
      .from("scheduled_reports")
      .update({ last_run_at: new Date().toISOString() })
      .eq("id", s.id);

    return { ok: true, schedule_id: s.id, rows: rows.length, path };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido";
    await admin
      .from("scheduled_report_runs")
      .update({ status: "failed", finished_at: new Date().toISOString(), error_message: msg })
      .eq("id", run!.id);
    return { ok: false, schedule_id: s.id, error: msg };
  }
}

Deno.serve(withRequestId("scheduled-reports-runner", async (req, _ctx) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // Autorização: apenas chamada interna (service_role ou X-Cron-Secret do pg_cron).
    try {
      const authorized = await isAuthorizedCronRequest(req, async () => {
        const { data, error } = await admin
          .from("_internal_secrets")
          .select("value")
          .eq("key", "coaching_cron_secret")
          .maybeSingle();
        if (error) throw error;
        return (data as { value?: string | null } | null)?.value;
      });
      if (!authorized) {
        return new Response(JSON.stringify({ error: "unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } catch (error) {
      console.error("scheduled-reports-runner authorization failed:", error);
      return new Response(JSON.stringify({ error: "authorization_unavailable" }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const forceId: string | undefined = body.schedule_id;

    let query = admin.from("scheduled_reports").select("id, report_id, name, frequency, format, recipients, created_by").eq("enabled", true);
    if (forceId) {
      query = query.eq("id", forceId);
    } else {
      query = query.lte("next_run_at", new Date().toISOString());
    }

    const { data: schedules, error } = await query.limit(50);
    if (error) throw error;

    const results = await Promise.all(
      ((schedules ?? []) as unknown as Schedule[]).map((s) => processSchedule(admin, s))
    );

    return new Response(JSON.stringify({ ok: true, processed: results.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error('scheduled-reports-runner error:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Erro" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
}));
