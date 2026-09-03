import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { withRequestId } from "../_shared/request-id.ts";
import { verifyTwilioSignatureAny } from "../_shared/webhook-auth.ts";
import { readUtf8BodyWithinLimit } from "../_shared/request-body.ts";
import { enforceRateLimit } from "../_shared/rate-limit.ts";

// Antes deste hardening a function era um oráculo público: qualquer GET com
// ?owner_id=<uuid> devolvia o telefone do agente daquele owner no TwiML.
// Agora só a Twilio (assinatura X-Twilio-Signature válida) recebe o número.

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function candidateUrls(req: Request): string[] {
  const urls = new Set<string>();
  const override = Deno.env.get("TWILIO_TWIML_URL");
  if (override) urls.add(override);
  urls.add(req.url);
  const base = Deno.env.get("SUPABASE_URL");
  if (base) {
    // A query (?owner_id=...) integra a URL assinada pela Twilio.
    const search = new URL(req.url).search;
    urls.add(`${base}/functions/v1/twilio-call-twiml${search}`);
  }
  return [...urls];
}

Deno.serve(withRequestId("twilio-call-twiml", async (req, ctx) => {
  const limited = enforceRateLimit(req, {
    name: "twilio-call-twiml",
    limit: 240,
    windowSeconds: 60,
  });
  if (limited) return limited;

  // GET da Twilio assina só a URL; POST assina URL + corpo form-urlencoded.
  const rawBody = req.method === "GET" ? "" : (await readUtf8BodyWithinLimit(req, 64 * 1024)) ?? "";

  const url = new URL(req.url);
  const ownerId = url.searchParams.get("owner_id");

  let agentPhone: string | null = null;
  let tenantToken: string | null = null;
  if (ownerId) {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data } = await admin
      .from("channel_credentials")
      .select("credentials, from_number")
      .eq("owner_id", ownerId)
      .eq("provider", "twilio")
      .eq("enabled", true)
      .limit(1)
      .maybeSingle();
    const creds = (data?.credentials ?? {}) as Record<string, string>;
    agentPhone = creds.agent_phone || null;
    tenantToken = creds.auth_token || null;
  }

  const globalToken = Deno.env.get("TWILIO_AUTH_TOKEN") ?? null;
  if (!tenantToken && !globalToken) {
    ctx.log("error", "webhook_not_configured", { reason: "no_twilio_auth_token" });
    return new Response(JSON.stringify({ error: "webhook_not_configured" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  const signatureOk = await verifyTwilioSignatureAny(
    [tenantToken, globalToken],
    candidateUrls(req),
    rawBody,
    req.method === "GET" ? "" : (req.headers.get("content-type") ?? ""),
    req.headers.get("x-twilio-signature"),
  );
  if (!signatureOk) {
    ctx.log("warn", "invalid_signature", { owner_id: ownerId });
    return new Response(JSON.stringify({ error: "invalid_signature" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const twiml = agentPhone
    ? `<?xml version="1.0" encoding="UTF-8"?><Response><Dial record="record-from-answer" timeout="30">${escapeXml(agentPhone)}</Dial></Response>`
    : `<?xml version="1.0" encoding="UTF-8"?><Response><Say voice="alice" language="pt-BR">Conectando você ao vendedor.</Say><Pause length="60"/></Response>`;

  return new Response(twiml, {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}));
