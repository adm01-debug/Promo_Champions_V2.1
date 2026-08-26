import { getCorsHeaders } from "../_shared/cors.ts";
import { withRequestId } from "../_shared/request-id.ts";
import {
  type AuthenticatedContext,
  getServiceClient,
  getUserClient,
  UnauthorizedError,
} from "../_shared/auth-client.ts";
import { isInternalServiceRequest } from "../_shared/internal-service-auth.ts";
import { checkRateLimit, rateLimitHeaders } from "../_shared/rate-limit.ts";
import { fetchWithTimeout } from "../_shared/fetch-with-timeout.ts";
import {
  buildUnsubscribeUrl,
  filterOptedOut,
  unsubscribeFooterHtml,
  unsubscribeHeaders,
} from "../_shared/unsubscribe.ts";

const MAX_EMAIL_LENGTH = 254;
const MAX_SUBJECT_LENGTH = 200;
const MAX_BODY_LENGTH = 100_000;
const DIRECT_SEND_LIMIT = 15;

type EmailPurpose = "transactional" | "outreach";

interface TransactionalEmailPayload {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  purpose: EmailPurpose;
}

interface PreparedEmail {
  html?: string;
  text?: string;
  headers?: Record<string, string>;
}

function json(
  body: Record<string, unknown>,
  status: number,
  cors: Record<string, string>,
  headers: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json", ...headers },
  });
}

function isValidEmail(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const email = value.trim();
  return email.length > 0 && email.length <= MAX_EMAIL_LENGTH &&
    !/[\r\n]/.test(email) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function readBody(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const body = value.trim();
  return body.length > 0 && body.length <= MAX_BODY_LENGTH ? body : undefined;
}

function parsePayload(value: unknown): TransactionalEmailPayload | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;
  const to = isValidEmail(raw.to) ? raw.to.trim().toLowerCase() : null;
  const subject = typeof raw.subject === "string" ? raw.subject.trim() : "";
  const html = readBody(raw.html);
  const text = readBody(raw.text);
  const purpose = raw.purpose ?? "transactional";

  if (
    !to || !subject || subject.length > MAX_SUBJECT_LENGTH ||
    /[\r\n]/.test(subject) ||
    (!html && !text) ||
    (raw.html !== undefined && !html) ||
    (raw.text !== undefined && !text) ||
    (purpose !== "transactional" && purpose !== "outreach")
  ) {
    return null;
  }

  return { to, subject, html, text, purpose };
}

async function isAuthorizedDirectSender(
  auth: AuthenticatedContext,
): Promise<boolean> {
  const { data: salesperson, error: salespersonError } = await auth.client
    .from("salespeople")
    .select("id")
    .eq("auth_user_id", auth.userId)
    .eq("is_active", true)
    .maybeSingle();
  if (salespersonError) throw salespersonError;
  if (salesperson) return true;

  const { data: isAdminOrManager, error: roleError } = await auth.client.rpc(
    "is_admin_or_manager" as never,
    { _user_id: auth.userId } as never,
  );
  if (roleError) throw roleError;
  return Boolean(isAdminOrManager);
}

async function prepareEmail(
  payload: TransactionalEmailPayload,
  serviceClient: ReturnType<typeof getServiceClient>,
): Promise<PreparedEmail | null> {
  if (payload.purpose === "transactional") {
    return { html: payload.html, text: payload.text };
  }

  const { allowed } = await filterOptedOut(
    serviceClient as never,
    [payload],
    (item) => item.to,
  );
  if (allowed.length === 0) return null;

  const headers = await unsubscribeHeaders(payload.to);
  const html = payload.html
    ? `${payload.html}${await unsubscribeFooterHtml(payload.to)}`
    : undefined;
  const text = payload.text
    ? `${payload.text}\n\nPara não receber mais estes e-mails, acesse: ${await buildUnsubscribeUrl(
      payload.to,
    )}`
    : undefined;
  return { html, text, headers };
}

async function recordDelivery(
  serviceClient: ReturnType<typeof getServiceClient>,
  input: {
    to: string;
    subject: string;
    status: "sent" | "failed";
    purpose: EmailPurpose;
    requestId: string;
    providerMessageId?: string;
    errorCode?: string;
    actorId?: string;
  },
): Promise<boolean> {
  try {
    const { error } = await serviceClient.from("email_logs").insert({
      function_name: "send-transactional-email",
      recipient_email: input.to,
      subject: input.subject,
      status: input.status,
      error_message: input.errorCode ?? null,
      metadata: {
        provider: "resend",
        purpose: input.purpose,
        request_id: input.requestId,
        provider_message_id: input.providerMessageId ?? null,
        actor_id: input.actorId ?? null,
      },
    });
    return !error;
  } catch {
    return false;
  }
}

Deno.serve(withRequestId("send-transactional-email", async (req, ctx) => {
  const cors = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") {
    return json({ ok: false, error: "method_not_allowed" }, 405, cors);
  }

  const internalRequest = isInternalServiceRequest(req);
  let auth: AuthenticatedContext | null = null;
  if (!internalRequest) {
    try {
      auth = await getUserClient(req);
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        return json({ ok: false, error: "unauthorized" }, 401, cors);
      }
      ctx.log("error", "user_authentication_unavailable", {
        error: error instanceof Error ? error.message : String(error),
      });
      return json({ ok: false, error: "service_not_configured" }, 503, cors);
    }

    try {
      if (!await isAuthorizedDirectSender(auth)) {
        return json({ ok: false, error: "forbidden" }, 403, cors);
      }
    } catch (error) {
      ctx.log("error", "sender_authorization_unavailable", {
        error: error instanceof Error ? error.message : String(error),
      });
      return json({ ok: false, error: "authorization_unavailable" }, 503, cors);
    }

    const limit = checkRateLimit(req, {
      name: "send-transactional-email",
      limit: DIRECT_SEND_LIMIT,
      windowSeconds: 60,
      bypassAuthenticated: false,
    });
    if (!limit.allowed) {
      return json(
        { ok: false, error: "rate_limit_exceeded" },
        429,
        cors,
        rateLimitHeaders(limit),
      );
    }
  }

  let payload: TransactionalEmailPayload | null;
  try {
    payload = parsePayload(await req.json());
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400, cors);
  }
  if (!payload) return json({ ok: false, error: "invalid_payload" }, 400, cors);

  // O navegador só possui fluxo de composição comercial. Permitir que ele
  // escolha `transactional` transformaria uma entrada controlada pelo usuário
  // em bypass de opt-out e do rodapé de descadastro. Mensagens transacionais
  // ficam restritas a encadeamentos internos com service_role.
  if (!internalRequest && payload.purpose !== "outreach") {
    return json({ ok: false, error: "direct_transactional_send_forbidden" }, 403, cors);
  }

  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("BULK_EMAIL_FROM");
  if (!resendApiKey || !from || /[\r\n]/.test(from)) {
    ctx.log("error", "email_provider_not_configured");
    return json(
      { ok: false, error: "email_provider_not_configured" },
      503,
      cors,
    );
  }

  let serviceClient: ReturnType<typeof getServiceClient>;
  try {
    serviceClient = getServiceClient(
      "send-transactional-email consulta supressões e grava auditoria de entrega",
    );
  } catch (error) {
    ctx.log("error", "service_client_unavailable", {
      error: error instanceof Error ? error.message : String(error),
    });
    return json({ ok: false, error: "service_not_configured" }, 503, cors);
  }

  let prepared: PreparedEmail | null;
  try {
    prepared = await prepareEmail(payload, serviceClient);
  } catch (error) {
    ctx.log("error", "delivery_preparation_failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return json({ ok: false, error: "delivery_preparation_failed" }, 503, cors);
  }
  if (!prepared) {
    return json({ ok: false, error: "recipient_opted_out" }, 409, cors);
  }

  let providerResponse: Response;
  try {
    providerResponse = await fetchWithTimeout(
      "https://api.resend.com/emails",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
          ...(prepared.headers ?? {}),
        },
        body: JSON.stringify({
          from,
          to: [payload.to],
          subject: payload.subject,
          ...(prepared.html ? { html: prepared.html } : {}),
          ...(prepared.text ? { text: prepared.text } : {}),
        }),
      },
      15_000,
    );
  } catch (error) {
    ctx.log("error", "provider_request_failed", {
      error: error instanceof Error ? error.name : String(error),
    });
    await recordDelivery(serviceClient, {
      to: payload.to,
      subject: payload.subject,
      status: "failed",
      purpose: payload.purpose,
      requestId: ctx.requestId,
      errorCode: "provider_request_failed",
      actorId: auth?.userId,
    });
    return json({ ok: false, error: "email_provider_unavailable" }, 502, cors);
  }

  const providerData = await providerResponse.json().catch(() => null) as {
    id?: unknown;
  } | null;
  if (!providerResponse.ok) {
    ctx.log("warn", "provider_rejected_delivery", {
      status: providerResponse.status,
    });
    await recordDelivery(serviceClient, {
      to: payload.to,
      subject: payload.subject,
      status: "failed",
      purpose: payload.purpose,
      requestId: ctx.requestId,
      errorCode: `resend_${providerResponse.status}`,
      actorId: auth?.userId,
    });
    return json({ ok: false, error: "email_provider_rejected" }, 502, cors);
  }

  const providerMessageId = typeof providerData?.id === "string"
    ? providerData.id
    : undefined;
  const auditLogged = await recordDelivery(serviceClient, {
    to: payload.to,
    subject: payload.subject,
    status: "sent",
    purpose: payload.purpose,
    requestId: ctx.requestId,
    providerMessageId,
    actorId: auth?.userId,
  });
  if (!auditLogged) {
    ctx.log("warn", "delivery_audit_failed", {
      provider_message_id: providerMessageId ?? null,
    });
  }

  return json(
    {
      ok: true,
      provider_message_id: providerMessageId ?? null,
      audit_logged: auditLogged,
    },
    200,
    cors,
  );
}));
