import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2.49.4';
import { getCorsHeaders } from "../_shared/cors.ts";
import { withRequestId } from '../_shared/request-id.ts';
import {
  createValidationErrorResponse,
  validateWebhookPayload,
  WebhookContracts,
} from '../_shared/webhook-validator.ts';
import { classifySuppression } from '../_shared/unsubscribe.ts';
import { authenticateInboundEmailWebhook } from '../_shared/webhook-auth.ts';
import { readUtf8BodyWithinLimit } from '../_shared/request-body.ts';
import {
  type InboundEmailPayload,
  isEmailTelemetryEvent,
  type ParsedInboundEmailEvent,
  parseInboundEmailEvents,
  shouldMatchAndPauseEnrollment,
} from '../_shared/webhook-integrity.ts';

const MAX_INBOUND_EMAIL_BODY_BYTES = 256 * 1024;

function json(req: Request, body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
  });
}


/**
 * Vocabulário de public.email_tracking_events. 'opened'/'clicked' é o que a UI
 * (src/hooks/useEmailTracking.ts), o email-engagement-scorer e o
 * send-time-optimizer já leem — não inventa um terceiro dialeto.
 */
const TRACKING_EVENT_TYPE = { open: 'opened', click: 'clicked' } as const;

/**
 * Escapa os curingas de LIKE para o e-mail ser comparado como texto literal:
 * sem isso `joao_silva@x.com` casaria com `joaoXsilva@x.com` no ilike, e `_`
 * em endereço de e-mail é comum.
 */
function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, (match) => `\\${match}`);
}

function extractClickLink(payload: Record<string, unknown>): string | null {
  const data = (payload.data ?? {}) as Record<string, unknown>;
  const click = (data.click ?? {}) as Record<string, unknown>;
  const candidate = click.link ?? payload.url ?? data.link;
  return typeof candidate === 'string' && candidate.trim().length > 0
    ? candidate.trim()
    : null;
}

type TelemetryOutcome = 'recorded' | 'no_contact' | 'duplicate' | 'no_recipient';

/**
 * Abertura e clique viram (1) uma linha em email_tracking_events, a trilha que
 * as telas de e-mail já leem, e (2) um sinal de engajamento do contato, que
 * alimenta contact_send_time_profile -> contact_engagement_score -> widget
 * "Top Contatos Quentes".
 *
 * O contato é resolvido pelo DESTINATÁRIO em public.clients. Não uso
 * match_reply_to_enrollment (caminho da resposta) de propósito: além de só
 * valer para quem está inscrito numa sequência — produção tem 0 inscrições —
 * aquela função consulta sales.email, coluna que não existe mais no banco.
 */
async function recordEmailTelemetry(
  // deno-lint-ignore no-explicit-any -- clientes Supabase têm generics variados por function
  admin: SupabaseClient<any, any, any>,
  event: ParsedInboundEmailEvent,
): Promise<TelemetryOutcome> {
  const recipient = event.recipientEmail;
  if (!recipient) return 'no_recipient';
  const trackingType = TRACKING_EVENT_TYPE[event.eventType as 'open' | 'click'];

  // Idempotência: o svix reentrega o mesmo evento enquanto não recebe 2xx.
  // A chave natural é (message_id, tipo, instante) — dois cliques de verdade no
  // mesmo e-mail têm instantes diferentes e continuam contando os dois.
  if (event.messageId) {
    const { data: existing, error: dupErr } = await admin
      .from('email_tracking_events')
      .select('id')
      .eq('event_type', trackingType)
      .eq('tracked_at', event.receivedAt)
      .eq('metadata->>message_id', event.messageId)
      .limit(1);
    if (dupErr) throw dupErr;
    if (existing?.length) return 'duplicate';
  }

  const { data: candidates, error: clientErr } = await admin
    .from('clients')
    .select('id, user_id')
    .ilike('email', escapeLikePattern(recipient))
    .is('deleted_at', null)
    .order('created_at', { ascending: true })
    .limit(2);
  if (clientErr) throw clientErr;
  const client = (candidates?.[0] ?? null) as
    | { id: string; user_id: string | null }
    | null;

  // salesperson_id deixa o evento visível no painel de e-mail do dono da
  // carteira (useEmailTracking filtra por ele).
  let salespersonId: string | null = null;
  if (client?.user_id) {
    const { data: sp, error: spErr } = await admin
      .from('salespeople')
      .select('id')
      .eq('auth_user_id', client.user_id)
      .maybeSingle();
    if (spErr) throw spErr;
    salespersonId = (sp as { id?: string } | null)?.id ?? null;
  }

  const link = event.eventType === 'click'
    ? extractClickLink(event.payload)
    : null;

  const { error: insertErr } = await admin.from('email_tracking_events').insert({
    recipient_email: recipient,
    subject: event.subject ?? '(sem assunto)',
    event_type: trackingType,
    tracked_at: event.receivedAt,
    salesperson_id: salespersonId,
    metadata: {
      provider: event.provider,
      message_id: event.messageId,
      source: 'inbound-email-webhook',
      ...(link ? { link } : {}),
      ...(candidates && candidates.length > 1
        ? { ambiguous_recipient: true }
        : {}),
    } as never,
  });
  if (insertErr) throw insertErr;

  if (!client) return 'no_contact';

  const { error: signalErr } = await admin.rpc('record_engagement_signal', {
    _contact_id: client.id,
    _contact_type: 'client',
    _signal: event.eventType,
    _occurred_at: event.receivedAt,
  });
  if (signalErr) throw signalErr;
  return 'recorded';
}

Deno.serve(
  withRequestId('inbound-email-webhook', async (req, ctx) => {
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: getCorsHeaders(req) });
    }
    if (req.method !== 'POST') {
      return json(req, { error: 'method_not_allowed' }, 405);
    }

    const rawBody = await readUtf8BodyWithinLimit(req, MAX_INBOUND_EMAIL_BODY_BYTES);
    if (rawBody === null) {
      return json(req, { ok: false, error: 'payload_too_large' }, 413);
    }
    const authentication = await authenticateInboundEmailWebhook(
      req.headers,
      rawBody,
      name => Deno.env.get(name)
    );
    if (!authentication.ok) {
      return json(req, { ok: false, error: authentication.code }, authentication.status);
    }

    let payload: InboundEmailPayload;
    try {
      const parsed: unknown = JSON.parse(rawBody);
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('payload inválido');
      }
      payload = parsed as InboundEmailPayload;
    } catch {
      return json(req, { ok: false, error: 'invalid_json' }, 400);
    }

    const events = parseInboundEmailEvents(payload, authentication.provider);
    if (events.length === 0) {
      return json(req, { ok: false, error: 'invalid_payload' }, 422);
    }

    // Valida o lote inteiro antes de qualquer escrita. Isso impede que um item
    // inválido deixe o lote parcialmente aceito sem sinalização ao provedor.
    for (const event of events) {
      const validation = validateWebhookPayload(
        WebhookContracts.inboundEmail,
        event,
        '1.1.0'
      );
      if (!validation.success) {
        return createValidationErrorResponse(
          validation.error ?? 'Payload inválido',
          validation.details ?? [],
          validation.contract_version,
          getCorsHeaders(req)
        );
      }
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceRoleKey) {
      return json(req, { ok: false, error: 'server_misconfigured' }, 503);
    }

    const admin = createClient(supabaseUrl, serviceRoleKey);

    try {
      const matchedEnrollmentIds: string[] = [];
      let telemetryRecorded = 0;
      for (const event of events) {
        // Telemetria não entra em inbound_reply_events: a chave única daquela
        // tabela é (provider, message_id), de um evento terminal por mensagem,
        // e um clique depois de uma abertura do mesmo e-mail seria descartado
        // junto com o sinal de engajamento.
        if (isEmailTelemetryEvent(event.eventType)) {
          const outcome = await recordEmailTelemetry(admin, event);
          if (outcome === 'recorded') {
            telemetryRecorded += 1;
          } else {
            ctx.log('info', 'email_telemetry_sem_sinal', {
              outcome,
              event_type: event.eventType,
              provider: event.provider,
            });
          }
          continue;
        }

        let matchedEnrollmentId: string | null = null;
        const affectsEnrollment = shouldMatchAndPauseEnrollment(event.eventType);
        if (affectsEnrollment && event.fromEmail) {
          const { data: matched, error: matchError } = await admin.rpc(
            'match_reply_to_enrollment',
            {
              _contact_email: event.fromEmail,
              _received_at: event.receivedAt,
            }
          );
          if (matchError) throw matchError;
          matchedEnrollmentId = (matched as string | null) ?? null;
        }

        const { data: insertedRows, error: insertError } = await admin
          .from('inbound_reply_events')
          .upsert(
            {
              provider: event.provider,
              message_id: event.messageId,
              from_email: event.fromEmail,
              subject: event.subject,
              received_at: event.receivedAt,
              event_type: event.eventType,
              matched_enrollment_id: matchedEnrollmentId,
              payload: event.payload as never,
            },
            {
              onConflict: 'provider,message_id',
              ignoreDuplicates: true,
            }
          )
          .select('id');
        if (insertError) throw insertError;

        // Efeitos colaterais só ocorrem para um evento recém-persistido. Um
        // retry assinado retorna sucesso sem repetir opt-out ou pausa de cadência.
        if (!insertedRows?.length) continue;

        // Supressão automática: hard bounce, reclamação de spam e descadastro do
        // provedor entram na lista de opt-out (soft bounce é preservado).
        const suppression = classifySuppression(event.eventType, event.payload);
        if (suppression && event.fromEmail) {
          const { error: supErr } = await admin.rpc('record_email_opt_out', {
            _email: event.fromEmail,
            _reason: suppression,
            _source: `webhook:${event.provider}`,
            _owner_id: null,
            _metadata: {
              message_id: event.messageId,
              event_type: event.eventType,
            } as never,
          } as never);
          if (supErr) throw supErr;
        }

        if (matchedEnrollmentId && affectsEnrollment) {
          const reason =
            event.eventType === 'bounce'
              ? 'bounce'
              : event.eventType === 'unsubscribe'
                ? 'unsubscribe'
                : event.eventType === 'complaint'
                  ? 'complaint'
                  : 'reply_detected';
          const { error: pauseError } = await admin.rpc('auto_pause_enrollment', {
            _enrollment_id: matchedEnrollmentId,
            _reason: reason,
          });
          if (pauseError) throw pauseError;
          if (event.eventType === 'reply') {
            // Marca APENAS a execução enviada mais recente — senão uma
            // resposta contamina a métrica de todas as variantes A/B da
            // inscrição (mesmo critério do sequence-record-reply).
            const { data: latestExec } = await admin
              .from('sequence_step_executions')
              .select('id')
              .eq('enrollment_id', matchedEnrollmentId)
              .eq('status', 'sent')
              .is('replied_at', null)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();
            if (latestExec?.id) {
              await admin
                .from('sequence_step_executions')
                .update({ replied_at: event.receivedAt })
                .eq('id', latestExec.id);
            }
          }
          matchedEnrollmentIds.push(matchedEnrollmentId);
        }
      }

      return json(req, {
        ok: true,
        processed: events.length,
        matched: matchedEnrollmentIds.length,
        telemetry: telemetryRecorded,
        event_type: events.length === 1 ? events[0].eventType : undefined,
      });
    } catch (e) {
      ctx.log('error', 'inbound_email_processing_failed', {
        error: e instanceof Error ? e.message : String(e),
      });
      return json(req, { ok: false, error: 'processing_failed' }, 500);
    }
  })
);
