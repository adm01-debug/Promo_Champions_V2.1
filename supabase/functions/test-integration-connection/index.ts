import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";

interface Body {
  connection_id: string;
  triggered_by?: "manual" | "auto";
}

interface ConnectionRow {
  id: string;
  kind: "database" | "bitrix24" | "n8n" | "mcp" | "webhook" | "other";
  label: string;
  config: Record<string, unknown>;
}

async function probeDatabase(cfg: Record<string, unknown>) {
  const url = String(cfg.url ?? "");
  const key = String(cfg.anon_key ?? Deno.env.get("EXTERNAL_SUPABASE_ANON_KEY") ?? "");
  const table = String(cfg.test_table ?? "salespeople");
  if (!url || !key) throw new Error("Missing url or anon_key");
  const r = await fetch(`${url.replace(/\/$/, "")}/rest/v1/${table}?select=*&limit=1`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
    signal: AbortSignal.timeout(8000),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}: ${(await r.text()).slice(0, 200)}`);
  await r.json();
}

async function probeN8n(cfg: Record<string, unknown>) {
  const baseUrl = String(cfg.base_url ?? "").replace(/\/$/, "");
  const apiKey = String(cfg.api_key ?? Deno.env.get(String(cfg.api_key_secret ?? "N8N_API_KEY")) ?? "");
  if (!baseUrl) throw new Error("Missing base_url");
  const r = await fetch(`${baseUrl}/healthz`, {
    headers: apiKey ? { "X-N8N-API-KEY": apiKey } : {},
    signal: AbortSignal.timeout(8000),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  await r.text();
}

async function probeMcp(cfg: Record<string, unknown>) {
  const url = String(cfg.url ?? "");
  const auth = cfg.auth_header ? String(cfg.auth_header) : null;
  if (!url) throw new Error("Missing url");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
  };
  if (auth) headers.Authorization = auth;
  const body = JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "lovable-probe", version: "1.0" } },
  });
  const r = await fetch(url, { method: "POST", headers, body, signal: AbortSignal.timeout(10000) });
  const text = await r.text();
  if (!r.ok) throw new Error(`HTTP ${r.status}: ${text.slice(0, 200)}`);
}

async function probeWebhook(cfg: Record<string, unknown>) {
  const url = String(cfg.url ?? "");
  if (!url) throw new Error("Missing url");
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Webhook-Event": "test.ping" },
    body: JSON.stringify({ event: "test.ping", at: new Date().toISOString() }),
    signal: AbortSignal.timeout(8000),
  });
  await r.text();
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
}

async function probeBitrix(_cfg: Record<string, unknown>) {
  // Reuse internal bitrix24-oauth status endpoint
  const url = `${Deno.env.get("SUPABASE_URL")}/functions/v1/bitrix24-oauth`;
  const r = await fetch(url, {
    headers: { Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}` },
    signal: AbortSignal.timeout(8000),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok || !data?.connected) throw new Error("Bitrix24 not connected");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { connection_id, triggered_by = "manual" } = (await req.json()) as Body;
    if (!connection_id) {
      return new Response(JSON.stringify({ error: "connection_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: conn, error: connErr } = await supabase
      .from("integration_connections")
      .select("id, kind, label, config")
      .eq("id", connection_id)
      .maybeSingle();

    if (connErr || !conn) {
      return new Response(JSON.stringify({ error: "Connection not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const c = conn as ConnectionRow;
    const cfg = (c.config ?? {}) as Record<string, unknown>;
    const start = Date.now();
    let status: "success" | "failure" = "success";
    let error: string | null = null;

    try {
      switch (c.kind) {
        case "database": await probeDatabase(cfg); break;
        case "bitrix24": await probeBitrix(cfg); break;
        case "n8n": await probeN8n(cfg); break;
        case "mcp": await probeMcp(cfg); break;
        case "webhook": await probeWebhook(cfg); break;
        default: throw new Error(`Unsupported kind: ${c.kind}`);
      }
    } catch (e) {
      status = "failure";
      error = e instanceof Error ? e.message : String(e);
    }

    const latency_ms = Date.now() - start;

    await supabase.from("integration_health_checks").insert({
      connection_id: c.id,
      status,
      latency_ms,
      error,
      triggered_by,
    });

    return new Response(
      JSON.stringify({ ok: status === "success", status, latency_ms, error, label: c.label, kind: c.kind }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
