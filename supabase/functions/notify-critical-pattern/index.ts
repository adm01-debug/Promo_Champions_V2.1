import { getCorsHeaders } from "../_shared/cors.ts";
import { withRequestId } from "../_shared/request-id.ts";
import { fetchWithTrace } from "../_shared/fetch-with-timeout.ts";
import { alertFromEmail } from "../_shared/alert-escalation.ts";

interface Payload {
  pattern_id?: string;
  name?: string;
  confidence?: number;
}

Deno.serve(withRequestId("notify-critical-pattern", async (req, ctx) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = (await req.json().catch(() => ({}))) as Payload;
    const apiKey = Deno.env.get("RESEND_API_KEY");
    const adminEmail = Deno.env.get("ADMIN_NOTIFICATION_EMAIL");

    if (!apiKey || !adminEmail) {
      return new Response(JSON.stringify({ ok: false, skipped: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const html = `
      <h2>🚨 Padrão crítico detectado</h2>
      <p><strong>${body.name ?? "Padrão"}</strong> com confiança ${(Number(body.confidence ?? 0) * 100).toFixed(0)}%.</p>
      <p>ID: <code>${body.pattern_id ?? "—"}</code></p>
      <p>Investigue no módulo Win/Loss Intelligence.</p>
    `;

    const r = await fetchWithTrace("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: alertFromEmail(),
        to: [adminEmail],
        subject: `Padrão crítico: ${body.name ?? "novo padrão"}`,
        html,
      }),
    }, {
      requestId: ctx.requestId,
      fnName: "notify-critical-pattern",
      operation: "resend_email",
    });

    return new Response(JSON.stringify({ ok: r.ok }), {
      status: r.ok ? 200 : 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    ctx.log('error', 'notify_critical_pattern_failed', { error: (e as Error).message });
    return new Response(JSON.stringify({ ok: false, error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}));
