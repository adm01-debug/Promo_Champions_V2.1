import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { withRequestId } from "../_shared/request-id.ts";
import { verifyTwilioSignatureAny } from "../_shared/webhook-auth.ts";
import { readUtf8BodyWithinLimit } from "../_shared/request-body.ts";
import { enforceRateLimit } from "../_shared/rate-limit.ts";
import { collectErrors, validateUUID, validationErrorResponse } from "../_shared/validation.ts";
import { resolveChannelCredentials } from "../_shared/secret-refs.ts";

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
  let rawBody = "";
  if (req.method !== "GET") {
    const body = await readUtf8BodyWithinLimit(req, 64 * 1024);
    if (body === null) {
      return new Response(JSON.stringify({ error: "payload_too_large" }), {
        status: 413,
        headers: { "Content-Type": "application/json" },
      });
    }
    rawBody = body;
  }

  const url = new URL(req.url);
  const ownerId = url.searchParams.get("owner_id");

  // owner_id alimenta uma query com service_role antes da checagem de
  // assinatura: um valor malformado derrubava a consulta (500) e servia de
  // sonda. UUID inválido nunca casa uma linha — responder 400 imediato.
  const ownerIdErrors = collectErrors([validateUUID(ownerId, "owner_id")]);
  if (ownerIdErrors.length) return validationErrorResponse(ownerIdErrors, {});

  let agentPhone: string | null = null;
  let tenantToken: string | null = null;
  let fromNumber: string | null = null;
  // O service client fica fora do bloco porque também atende à checagem de
  // consentimento de gravação (LGPD) depois da verificação de assinatura.
  let admin: ReturnType<typeof createClient> | null = null;
  if (ownerId) {
    admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    // ORDER BY obrigatório: um owner tem 2+ linhas twilio (whatsapp + sms);
    // o click-to-call assina com a MAIS RECENTE — sem a mesma ordenação aqui,
    // a verificação usaria o token da linha errada e derrubaria a chamada.
    const { data, error } = await admin
      .from("channel_credentials")
      .select("id, owner_id, credentials, from_number")
      .eq("owner_id", ownerId)
      .eq("provider", "twilio")
      .eq("enabled", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) {
      // Falha de banco não pode virar decisão de auth (503/401 enganoso).
      ctx.log("error", "credentials_lookup_failed", { detail: error.message });
      return new Response(JSON.stringify({ error: "internal_error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
    // integration_secret_refs tem precedência sobre o jsonb em texto puro.
    const creds: Record<string, string> = data
      ? await resolveChannelCredentials(admin, data)
      : {};
    agentPhone = creds.agent_phone || null;
    tenantToken = creds.auth_token || null;
    fromNumber = typeof data?.from_number === "string" ? data.from_number : null;
  }

  // Token do tenant tem precedência; o global é só fallback (nunca em paralelo
  // — senão vira chave-mestra cross-tenant). Sem nenhum, responde igual a
  // assinatura inválida (não dar oráculo de configuração); o log diferencia.
  const globalToken = Deno.env.get("TWILIO_AUTH_TOKEN") ?? null;
  const tokens = tenantToken ? [tenantToken] : [globalToken];
  if (!tenantToken && !globalToken) {
    ctx.log("error", "webhook_not_configured", { reason: "no_twilio_auth_token" });
  }

  const signatureOk = await verifyTwilioSignatureAny(
    tokens,
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

  // LGPD: a gravação só é ligada com consentimento ativo do titular
  // (consent_records, purpose='voice_recording'), resolvido pelo telefone da
  // parte remota — 'To'/'Called' na perna de saída (click-to-call) e
  // 'Caller'/'From' na de entrada; o from_number da empresa é ignorado.
  // Sem consentimento (ou sem como prová-lo) o Dial segue do-not-record.
  const callParams = new URLSearchParams(rawBody);
  const subjectPhone = ["Called", "To", "Caller", "From"]
    .map((key) => callParams.get(key) ?? url.searchParams.get(key))
    .find((p): p is string => !!p && p !== fromNumber);
  let recordAttr = "do-not-record";
  if (agentPhone && admin && subjectPhone) {
    const { data: consented, error: consentError } = await admin.rpc(
      "has_phone_consent",
      { p_phone: subjectPhone, p_purpose: "voice_recording" },
    );
    if (consentError) {
      ctx.log("error", "recording_consent_check_failed", {
        detail: consentError.message,
      });
    } else if (consented === true) {
      recordAttr = "record-from-answer";
    }
  }

  const twiml = agentPhone
    ? `<?xml version="1.0" encoding="UTF-8"?><Response><Dial record="${recordAttr}" timeout="30">${escapeXml(agentPhone)}</Dial></Response>`
    : `<?xml version="1.0" encoding="UTF-8"?><Response><Say voice="alice" language="pt-BR">Conectando você ao vendedor.</Say><Pause length="60"/></Response>`;

  return new Response(twiml, {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}));
