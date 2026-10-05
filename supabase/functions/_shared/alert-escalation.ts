// ALERT-ESCAL — Escalação de alertas operacionais críticos para canais externos.
//
// Quando um alerta tem severity=critical e um canal externo está configurado,
// além do fluxo interno (notifications/email aos admins) o alerta vai para:
//   • Slack via SLACK_ALERT_WEBHOOK_URL (canal dedicado de escalação — não
//     confundir com SLACK_WEBHOOK_URL, canal operacional já usado pelos
//     alertas existentes);
//   • Email via Resend (RESEND_API_KEY) para ALERT_ESCALATION_EMAIL
//     (fallback: ADMIN_NOTIFICATION_EMAIL).
//
// Remetente Resend: ALERT_FROM_EMAIL deve apontar para um remetente do domínio
// verificado no Resend (ex.: "Alertas <alertas@promobrindes.com.br>"). Sem a
// env, cai no fallback `onboarding@resend.dev`, que SÓ funciona para envio ao
// próprio email da conta Resend — documentado em docs/runbooks/alertas-operacionais.md.
//
// Toda mensagem escalada leva o link do runbook correspondente (RUNBOOK_URLS)
// e o trace_id da request para correlação.

import { fetchWithTimeout } from "./fetch-with-timeout.ts";
import { traceIdFromRequestId } from "./trace.ts";

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const RUNBOOK_BASE =
  "https://github.com/adm01-debug/Promo_Champions_V2.1/blob/main/docs/runbooks";

/** Slugs válidos → URL pública do runbook no repo (docs/runbooks/<slug>.md). */
export function runbookUrl(slug: string): string {
  return `${RUNBOOK_BASE}/${slug}.md`;
}

/** Remetente dos emails de alerta — domínio verificado via env, com fallback documentado. */
export function alertFromEmail(): string {
  return Deno.env.get("ALERT_FROM_EMAIL") ?? "Alertas <onboarding@resend.dev>";
}

export interface EscalationInput {
  /** Título curto do alerta (ex.: "WAL Health — lag de replicação"). */
  title: string;
  /** Linhas de detalhe (já mascaradas, sem PII/segredos). */
  lines: string[];
  /** Slug do runbook em docs/runbooks/<slug>.md (ex.: "wal-health"). */
  runbook: string;
  /** request-id da execução (correlação com logs). */
  requestId: string;
  /** Origem (nome da edge function). */
  source: string;
}

export interface EscalationResult {
  slack: "sent" | "skipped" | "failed";
  email: "sent" | "skipped" | "failed";
}

async function postSlackEscalation(webhook: string, text: string): Promise<void> {
  const res = await fetchWithTimeout(
    webhook,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    },
    8_000,
  );
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`slack ${res.status}: ${body.slice(0, 200)}`);
  }
}

async function sendResendEscalation(
  apiKey: string,
  to: string,
  subject: string,
  html: string,
): Promise<void> {
  const res = await fetchWithTimeout(
    RESEND_ENDPOINT,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: alertFromEmail(), to: [to], subject, html }),
    },
    8_000,
  );
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`resend ${res.status}: ${body.slice(0, 200)}`);
  }
}

/**
 * Escala um alerta crítico para os canais externos configurados.
 * No-op silencioso quando nenhum canal está configurado — nunca lança;
 * falhas aparecem no resultado para o caller logar.
 */
export async function escalateCriticalAlert(input: EscalationInput): Promise<EscalationResult> {
  const result: EscalationResult = { slack: "skipped", email: "skipped" };
  const runbook = runbookUrl(input.runbook);
  const traceId = traceIdFromRequestId(input.requestId);
  const detail = input.lines.join("\n");

  const slackWebhook = Deno.env.get("SLACK_ALERT_WEBHOOK_URL");
  if (slackWebhook) {
    const text =
      `:rotating_light: *[CRITICAL] ${input.title}*\n` +
      `${detail}\n\n` +
      `Runbook: ${runbook}\n_fonte: ${input.source} • trace: ${traceId}_`;
    try {
      await postSlackEscalation(slackWebhook, text);
      result.slack = "sent";
    } catch {
      result.slack = "failed";
    }
  }

  const resendKey = Deno.env.get("RESEND_API_KEY");
  const to = Deno.env.get("ALERT_ESCALATION_EMAIL") ?? Deno.env.get("ADMIN_NOTIFICATION_EMAIL");
  if (resendKey && to) {
    const items = input.lines.map((l) => `<li>${l}</li>`).join("");
    const html =
      `<h2>🚨 ${input.title}</h2><ul>${items}</ul>` +
      `<p><strong>Runbook:</strong> <a href="${runbook}">${runbook}</a></p>` +
      `<p><small>fonte: ${input.source} • trace: ${traceId} • request: ${input.requestId}</small></p>`;
    try {
      await sendResendEscalation(resendKey, to, `[CRÍTICO] ${input.title}`, html);
      result.email = "sent";
    } catch {
      result.email = "failed";
    }
  }

  return result;
}
