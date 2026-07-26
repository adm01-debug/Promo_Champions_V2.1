import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { getCorsHeaders } from "../_shared/cors.ts";
import { withRequestId } from "../_shared/request-id.ts";
import { fetchWithTimeout } from "../_shared/fetch-with-timeout.ts";

interface Payload {
  ownerId: string;
  channel: "whatsapp" | "sms";
  to: string;
  body: string;
  templateId?: string;
  enrollmentId?: string;
  stepId?: string;
}

interface ProviderResult {
  ok: boolean;
  providerMessageId?: string;
  error?: string;
  raw?: unknown;
}

async function sendTwilio(
  creds: Record<string, string>,
  from: string,
  to: string,
  body: string,
  channel: "whatsapp" | "sms",
): Promise<ProviderResult> {
  const sid = creds.account_sid;
  const token = creds.auth_token;
  if (!sid || !token) return { ok: false, error: "Twilio: missing account_sid/auth_token" };

  const fromAddr = channel === "whatsapp" ? `whatsapp:${from}` : from;
  const toAddr = channel === "whatsapp" ? `whatsapp:${to}` : to;

  const form = new URLSearchParams({ From: fromAddr, To: toAddr, Body: body });
  const auth = btoa(`${sid}:${token}`);
  const r = await fetchWithTimeout(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) return { ok: false, error: j?.message || `Twilio ${r.status}`, raw: j };
  return { ok: true, providerMessageId: j?.sid, raw: j };
}

async function sendMetaCloud(
  creds: Record<string, string>,
  to: string,
  body: string,
  templateId?: string,
): Promise<ProviderResult> {
  const phoneId = creds.phone_number_id;
  const token = creds.access_token;
  if (!phoneId || !token) return { ok: false, error: "Meta Cloud: missing phone_number_id/access_token" };

  const payload: Record<string, unknown> = templateId
    ? { messaging_product: "whatsapp", to, type: "template", template: { name: templateId, language: { code: "pt_BR" } } }
    : { messaging_product: "whatsapp", to, type: "text", text: { body } };

  const r = await fetchWithTimeout(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) return { ok: false, error: j?.error?.message || `Meta ${r.status}`, raw: j };
  return { ok: true, providerMessageId: j?.messages?.[0]?.id, raw: j };
}

async function sendZapi(
  creds: Record<string, string>,
  to: string,
  body: string,
): Promise<ProviderResult> {
  const instance = creds.instance_id;
  const token = creds.token;
  const clientToken = creds.client_token;
  if (!instance || !token) return { ok: false, error: "Z-API: missing instance_id/token" };
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (clientToken) headers["Client-Token"] = clientToken;
  const r = await fetchWithTimeout(`https://api.z-api.io/instances/${instance}/token/${token}/send-text`, {
    method: "POST",
    headers,
    body: JSON.stringify({ phone: to, message: body }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) return { ok: false, error: j?.error || `Z-API ${r.status}`, raw: j };
  return { ok: true, providerMessageId: j?.messageId || j?.id, raw: j };
}

const unauthorized = (msg: string) =>
  new Response(JSON.stringify({ ok: false, error: msg }), {
    status: 401, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
  });

const forbidden = (msg: string) =>
  new Response(JSON.stringify({ ok: false, error: msg }), {
    status: 403, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
  });

Deno.serve(withRequestId("send-multichannel-message", async (req, _ctx) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey     = Deno.env.get("SUPABASE_ANON_KEY")!;

  // ── Authentication guard ───────────────────────────────────────────────
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return unauthorized("Missing Authorization header");

  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error: authErr } = await callerClient.auth.getUser();
  if (authErr || !user) return unauthorized("Invalid or expired token");
  // ──────────────────────────────────────────────────────────────────────

  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    const payload = (await req.json()) as Payload;
    if (!payload.ownerId || !payload.channel || !payload.to || !payload.body) {
      return new Response(JSON.stringify({ ok: false, error: "Missing required fields" }), {
        status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    // ── Authorization: caller may only send as themselves unless they are admin
    if (payload.ownerId !== user.id) {
      // Check if caller has admin role
      const { data: hasAdmin } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      if (!hasAdmin) return forbidden("Cannot send messages on behalf of another user");
    }

    const isMock = req.headers.get("x-mock-provider") === "true";

    // Find active credential for owner+channel
    const { data: cred, error: credErr } = await supabase
      .from("channel_credentials")
      .select("id, provider, credentials, from_number")
      .eq("owner_id", payload.ownerId)
      .eq("channel", payload.channel)
      .eq("enabled", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (credErr) throw credErr;
    if (!cred && !isMock) {
      return new Response(JSON.stringify({ ok: false, error: "no_credentials", skipped: true }), {
        status: 200, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    let result: ProviderResult;
    const provider = cred?.provider ?? "mock";

    if (isMock) {
      result = { ok: true, providerMessageId: `mock_${crypto.randomUUID()}` };
    } else {
      const credsObj = (cred!.credentials ?? {}) as Record<string, string>;
      switch (cred!.provider) {
        case "twilio":
          result = await sendTwilio(credsObj, cred!.from_number ?? "", payload.to, payload.body, payload.channel);
          break;
        case "meta_cloud":
          result = await sendMetaCloud(credsObj, payload.to, payload.body, payload.templateId);
          break;
        case "zapi":
          result = await sendZapi(credsObj, payload.to, payload.body);
          break;
        default:
          result = { ok: false, error: `Provider ${cred!.provider} not implemented` };
      }
    }

    // Log via RPC
    await supabase.rpc("record_outbound_message", {
      _owner_id: payload.ownerId,
      _enrollment_id: payload.enrollmentId ?? null,
      _step_id: payload.stepId ?? null,
      _channel: payload.channel,
      _to: payload.to,
      _body: payload.body,
      _provider: provider,
      _provider_msg_id: result.providerMessageId ?? null,
      _status: result.ok ? "sent" : "failed",
      _error: result.error ?? null,
      _template_id: payload.templateId ?? null,
    });

    return new Response(
      JSON.stringify({
        ok: result.ok,
        providerMessageId: result.providerMessageId,
        error: result.error,
      }),
      { status: result.ok ? 200 : 502, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error('send-multichannel-message error:', e);
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
}));
