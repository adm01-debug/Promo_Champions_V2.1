import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";

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
    const s = typeof v === "object" ? JSON.stringify(v) : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
  ].join("\n");
}

async function executeReport(admin: ReturnType<typeof createClient>, reportId: string) {
  const { data: report, error } = await admin.from("custom_reports").select("*").eq("id", reportId).single();
  if (error || !report) throw new Error(`Report ${reportId} não encontrado`);

  const cfg = (report.config ?? {}) as Record<string, unknown>;
  let entity = String(report.entity);
  if (entity === "salespeople") entity = "salespeople_public";
  if (entity === "cross") entity = String(cfg.base ?? "sales");

  const cols = Array.isArray(cfg.columns) && cfg.columns.length
    ? (cfg.columns as string[]).filter((c) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(c)).join(",") || "*"
    : "*";
  const limit = typeof cfg.limit === "number" ? Math.min(cfg.limit, 5000) : 1000;

  const { data, error: qErr } = await admin.from(entity).select(cols).limit(limit);
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
    const rows = await executeReport(admin, s.report_id);
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const body = await req.json().catch(() => ({}));
    const forceId: string | undefined = body.schedule_id;

    let query = admin.from("scheduled_reports").select("*").eq("enabled", true);
    if (forceId) {
      query = query.eq("id", forceId);
    } else {
      query = query.lte("next_run_at", new Date().toISOString());
    }

    const { data: schedules, error } = await query.limit(50);
    if (error) throw error;

    const results = [];
    for (const s of (schedules ?? []) as unknown as Schedule[]) {
      results.push(await processSchedule(admin, s));
    }

    return new Response(JSON.stringify({ ok: true, processed: results.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Erro" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
