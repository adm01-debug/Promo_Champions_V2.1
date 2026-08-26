import { getCorsHeaders } from "../_shared/cors.ts";
import { withRequestId } from "../_shared/request-id.ts";
import { fetchWithTimeout } from "../_shared/fetch-with-timeout.ts";
import {
  getServiceClient,
  getUserClient,
  UnauthorizedError,
} from "../_shared/auth-client.ts";
import { isInternalServiceRequest } from "../_shared/internal-service-auth.ts";

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
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_MESSAGE_LENGTH = 4_096;

function isValidPhone(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return /^[+\d().\s-]+$/.test(value) && digits.length >= 6 &&
    digits.length <= 20;
}

function parsePayload(value: unknown): Payload | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;

  if (
    typeof raw.ownerId !== "string" || !UUID_RE.test(raw.ownerId) ||
    (raw.channel !== "whatsapp" && raw.channel !== "sms") ||
    typeof raw.to !== "string" || !isValidPhone(raw.to.trim()) ||
    typeof raw.body !== "string" || !raw.body.trim() ||
    raw.body.length > MAX_MESSAGE_LENGTH
  ) {
    return null;
  }

  if (
    (raw.templateId !== undefined && typeof raw.templateId !== "string") ||
    (raw.enrollmentId !== undefined &&
      (typeof raw.enrollmentId !== "string" ||
        !UUID_RE.test(raw.enrollmentId))) ||
    (raw.stepId !== undefined &&
      (typeof raw.stepId !== "string" || !UUID_RE.test(raw.stepId)))
  ) {
    return null;
  }

  return {
    ownerId: raw.ownerId,
    channel: raw.channel,
    to: raw.to.trim(),
    body: raw.body,
    templateId: raw.templateId as string | undefined,
    enrollmentId: raw.enrollmentId as string | undefined,
    stepId: raw.stepId as string | undefined,
  };
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
  if (!sid || !token) return { ok: false, error: "twilio_credentials_missing" };

  const fromAddr = channel === "whatsapp" ? `whatsapp:${from}` : from;
  const toAddr = channel === "whatsapp" ? `whatsapp:${to}` : to;
  const form = new URLSearchParams({ From: fromAddr, To: toAddr, Body: body });
  const auth = btoa(`${sid}:${token}`);
  const response = await fetchWithTimeout(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form.toString(),
    },
  );
  const result = await response.json().catch(() => ({}));
  if (!response.ok) return { ok: false, error: `twilio_${response.status}` };
  return { ok: true, providerMessageId: result?.sid };
}

async function sendMetaCloud(
  creds: Record<string, string>,
  to: string,
  body: string,
  templateId?: string,
): Promise<ProviderResult> {
  const phoneId = creds.phone_number_id;
  const token = creds.access_token;
  if (!phoneId || !token) {
    return { ok: false, error: "meta_credentials_missing" };
  }

  const payload: Record<string, unknown> = templateId
    ? {
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: { name: templateId, language: { code: "pt_BR" } },
    }
    : { messaging_product: "whatsapp", to, type: "text", text: { body } };

  const response = await fetchWithTimeout(
    `https://graph.facebook.com/v20.0/${phoneId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );
  const result = await response.json().catch(() => ({}));
  if (!response.ok) return { ok: false, error: `meta_${response.status}` };
  return { ok: true, providerMessageId: result?.messages?.[0]?.id };
}

async function sendZapi(
  creds: Record<string, string>,
  to: string,
  body: string,
): Promise<ProviderResult> {
  const instance = creds.instance_id;
  const token = creds.token;
  const clientToken = creds.client_token;
  if (!instance || !token) {
    return { ok: false, error: "zapi_credentials_missing" };
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (clientToken) headers["Client-Token"] = clientToken;
  const response = await fetchWithTimeout(
    `https://api.z-api.io/instances/${instance}/token/${token}/send-text`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ phone: to, message: body }),
    },
  );
  const result = await response.json().catch(() => ({}));
  if (!response.ok) return { ok: false, error: `zapi_${response.status}` };
  return { ok: true, providerMessageId: result?.messageId || result?.id };
}

Deno.serve(withRequestId("send-multichannel-message", async (req, ctx) => {
  const responseCorsHeaders = getCorsHeaders(req);
  const json = (body: Record<string, unknown>, status = 200): Response => {
    return new Response(JSON.stringify(body), {
      status,
      headers: { ...responseCorsHeaders, "Content-Type": "application/json" },
    });
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: responseCorsHeaders });
  }
  if (req.method !== "POST") {
    return json({ ok: false, error: "method_not_allowed" }, 405);
  }
  if (req.headers.has("x-mock-provider")) {
    return json({ ok: false, error: "mock_provider_disabled" }, 403);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    ctx.log("error", "environment_not_configured");
    return json({ ok: false, error: "service_not_configured" }, 503);
  }

  const internalRequest = isInternalServiceRequest(req);
  let caller: Awaited<ReturnType<typeof getUserClient>> | null = null;

  if (!internalRequest) {
    try {
      caller = await getUserClient(req);
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        return json({ ok: false, error: "unauthorized" }, 401);
      }
      ctx.log("error", "user_authentication_failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      return json({ ok: false, error: "service_not_configured" }, 503);
    }
  }

  let payload: Payload | null;
  try {
    payload = parsePayload(await req.json());
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }
  if (!payload) return json({ ok: false, error: "invalid_payload" }, 400);

  // `record_outbound_message` é uma RPC privilegiada. Enrollment e step são
  // referências de auditoria internas, não uma escolha do navegador: aceitar
  // IDs arbitrários de uma chamada humana permitiria registrar atividade em
  // uma cadência de terceiro. Jobs autenticados por service_role continuam
  // podendo propagar esses vínculos já carregados do banco.
  if (!internalRequest && (payload.enrollmentId || payload.stepId)) {
    return json({ ok: false, error: "direct_cadence_reference_forbidden" }, 403);
  }

  let supabase;
  try {
    supabase = getServiceClient(
      "send-multichannel-message lê credenciais e registra o resultado do provedor",
    );
  } catch (error) {
    ctx.log("error", "service_client_unavailable", {
      error: error instanceof Error ? error.message : String(error),
    });
    return json({ ok: false, error: "service_not_configured" }, 503);
  }

  if (caller && payload.ownerId !== caller.userId) {
    const { data: isAdminOrManager, error: roleError } = await caller.client
      .rpc(
        "is_admin_or_manager" as never,
        { _user_id: caller.userId } as never,
      );
    if (roleError) {
      ctx.log("error", "role_check_failed", { error: roleError.message });
      return json({ ok: false, error: "authorization_unavailable" }, 503);
    }
    if (!isAdminOrManager) return json({ ok: false, error: "forbidden" }, 403);
  }

  try {
    const { data: credential, error: credentialError } = await supabase
      .from("channel_credentials")
      .select("id, provider, credentials, from_number")
      .eq("owner_id", payload.ownerId)
      .eq("channel", payload.channel)
      .eq("enabled", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (credentialError) throw credentialError;
    if (!credential) {
      return json({ ok: false, error: "no_credentials", skipped: true });
    }

    const credentials = credential.credentials;
    if (
      !credentials || typeof credentials !== "object" ||
      Array.isArray(credentials)
    ) {
      return json({ ok: false, error: "invalid_provider_credentials" }, 502);
    }

    let result: ProviderResult;
    switch (credential.provider) {
      case "twilio":
        result = await sendTwilio(
          credentials as Record<string, string>,
          credential.from_number ?? "",
          payload.to,
          payload.body,
          payload.channel,
        );
        break;
      case "meta_cloud":
        result = await sendMetaCloud(
          credentials as Record<string, string>,
          payload.to,
          payload.body,
          payload.templateId,
        );
        break;
      case "zapi":
        result = await sendZapi(
          credentials as Record<string, string>,
          payload.to,
          payload.body,
        );
        break;
      default:
        result = { ok: false, error: "provider_not_supported" };
    }

    const { data: outboundMessageId, error: recordError } = await supabase.rpc(
      "record_outbound_message",
      {
        _owner_id: payload.ownerId,
        _enrollment_id: payload.enrollmentId ?? null,
        _step_id: payload.stepId ?? null,
        _channel: payload.channel,
        _to: payload.to,
        _body: payload.body,
        _provider: credential.provider,
        _provider_msg_id: result.providerMessageId ?? null,
        _status: result.ok ? "sent" : "failed",
        _error: result.error ?? null,
        _template_id: payload.templateId ?? null,
      },
    );

    if (recordError) {
      ctx.log("error", "outbound_message_record_failed", {
        provider: credential.provider,
        provider_message_id: result.providerMessageId ?? null,
        error: recordError.message,
      });
      return json({
        ok: result.ok,
        providerMessageId: result.providerMessageId,
        error: result.error,
        recorded: false,
      }, result.ok ? 202 : 502);
    }

    return json({
      ok: result.ok,
      providerMessageId: result.providerMessageId,
      error: result.error,
      outboundMessageId,
      recorded: true,
    }, result.ok ? 200 : 502);
  } catch (error) {
    ctx.log("error", "send_failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return json({ ok: false, error: "send_failed" }, 500);
  }
}));
