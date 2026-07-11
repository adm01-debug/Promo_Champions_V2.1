// PERF-01 — Alerta de WAL/replicação para canal de observabilidade.
//
// Lê `public.v_platform_wal_health` (via RPC admin-only
// `fn_admin_wal_health`) e dispara notificação em Slack (ou webhook
// genérico) quando qualquer um dos gatilhos abaixo é acionado:
//
//   • max_slot_lag_bytes  > MAX_SLOT_LAG_BYTES  (default 64 MiB)
//   • long_running_tx      > 0
//   • wal_size_bytes       > WAL_SIZE_ALERT_BYTES (default 500 MiB)
//
// Secrets requeridos:
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY   (auto-injetados)
//   SLACK_WEBHOOK_URL                          (obrigatório)
//   WAL_MAX_SLOT_LAG_BYTES, WAL_SIZE_ALERT_BYTES (opcionais)
//
// Deploy: automaticamente pelo Lovable. Agende via cron pg_cron chamando
// esta função a cada 5 minutos.

import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";
import { withRequestId } from "../_shared/request-id.ts";
import { withEdgeCircuitBreaker, CircuitBreakerOpenError } from "../_shared/circuit-breaker.ts";

const DEFAULT_SLOT_LAG = 64 * 1024 * 1024; // 64 MiB
const DEFAULT_WAL_SIZE = 500 * 1024 * 1024; // 500 MiB

function bytes(n: number): string {
  const units = ["B", "KiB", "MiB", "GiB"];
  let i = 0;
  let v = n;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(1)} ${units[i]}`;
}

async function postSlack(webhook: string, text: string, blocks?: unknown) {
  await withEdgeCircuitBreaker(
    "slack:wal-health-alert",
    async () => {
      const res = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(blocks ? { text, blocks } : { text }),
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`slack webhook ${res.status}: ${body.slice(0, 200)}`);
      }
    },
    { failureThreshold: 3, resetTimeout: 60_000, timeoutMs: 5_000 },
  );
}

Deno.serve(withRequestId("wal-health-alert", async (req, ctx) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const slack = Deno.env.get("SLACK_WEBHOOK_URL");
    const maxLag = Number(
      Deno.env.get("WAL_MAX_SLOT_LAG_BYTES") ?? DEFAULT_SLOT_LAG,
    );
    const maxWal = Number(
      Deno.env.get("WAL_SIZE_ALERT_BYTES") ?? DEFAULT_WAL_SIZE,
    );

    if (!slack) {
      return new Response(
        JSON.stringify({
          error: "SLACK_WEBHOOK_URL not configured",
          hint: "Adicione o secret SLACK_WEBHOOK_URL para habilitar alertas.",
        }),
        {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const supabase = createClient(url, serviceKey, {
      auth: { persistSession: false },
    });

    // Lê a view (service_role tem SELECT total).
    const { data, error } = await supabase
      .from("v_platform_wal_health")
      .select("*")
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error("v_platform_wal_health returned no rows");

    const alerts: string[] = [];
    const slotLag = Number(data.max_slot_lag_bytes ?? 0);
    const walSize = Number(data.wal_size_bytes ?? 0);
    const longTx = Number(data.long_running_tx ?? 0);

    if (slotLag > maxLag) {
      alerts.push(
        `🔴 *Replication slot lag* — ${bytes(slotLag)} (limite ${bytes(maxLag)})`,
      );
    }
    if (longTx > 0) {
      alerts.push(`🟠 *Long-running transactions*: ${longTx}`);
    }
    if (walSize > maxWal) {
      alerts.push(
        `🟡 *WAL size acima do limite* — ${bytes(walSize)} (limite ${bytes(maxWal)})`,
      );
    }

    if (alerts.length === 0) {
      return new Response(
        JSON.stringify({ ok: true, alerts: [], snapshot: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const text =
      `*[WAL Health Alert]* ${alerts.length} evento(s)\n` + alerts.join("\n");

    await postSlack(slack, text, [
      { type: "section", text: { type: "mrkdwn", text } },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `slots=${data.active_slots} • wal=${bytes(walSize)} • max_lag=${bytes(slotLag)} • long_tx=${longTx}`,
          },
        ],
      },
    ]);

    return new Response(
      JSON.stringify({ ok: true, alerts, snapshot: data }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (e instanceof CircuitBreakerOpenError) {
      ctx.log("warn", "slack_circuit_open", { circuit: "slack:wal-health-alert" });
      return new Response(
        JSON.stringify({ ok: false, degraded: true, reason: "slack_circuit_open" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    ctx.log("error", "wal_health_alert_failed", { error: msg });
    return new Response(
      JSON.stringify({ error: msg }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
}));
