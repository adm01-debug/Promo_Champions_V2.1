/**
 * Dispatcher Champions -> Finance (analise de credito da 1a venda).
 *
 * O pedido da primeira venda de um cliente nasce `aguardando_credito` e vira
 * uma linha em `credit_outbox`; este job entrega essas linhas ao
 * `credito-solicitacao` do Promo Finance com HMAC SHA-256 (mesmo envelope e
 * assinatura do supply-dispatch, por isso reaproveita o contrato dele).
 *
 * Entrega por linha: sucesso marca `delivered`, falha devolve para a fila com
 * backoff (5 tentativas antes de dead-letter) sem bloquear as demais.
 */
import { createClient } from 'npm:@supabase/supabase-js@2.49.4';
import { getCorsHeaders } from '../_shared/cors.ts';
import { withRequestId } from '../_shared/request-id.ts';
import { errorEnvelope, jsonResponse } from '../_shared/http-envelope.ts';
import { isAuthorizedCronRequest } from '../_shared/cron-request-auth.ts';
import { fetchWithTimeout } from '../_shared/fetch-with-timeout.ts';
import {
  collectErrors,
  validateNumber,
  validationErrorResponse,
} from '../_shared/validation.ts';
import {
  buildEnvelope,
  isDelivered,
  signatureFor,
  type SupplyOutboxRow,
} from '../supply-dispatch/contract.ts';

const DEFAULT_FINANCE_URL =
  'https://bwwbeyolnnzppeuhgkcd.supabase.co/functions/v1/credito-solicitacao';
const BATCH_SIZE = 25;

Deno.serve(
  withRequestId('credit-dispatch', async (req, ctx) => {
    const corsHeaders = getCorsHeaders(req);
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    if (req.method !== 'POST') {
      return errorEnvelope('BAD_REQUEST', 'method_not_allowed', {
        status: 405,
        requestId: ctx.requestId,
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    let requestedLimit = BATCH_SIZE;
    const requestBody = await req.text();
    if (requestBody.trim()) {
      let parsed: unknown;
      try {
        parsed = JSON.parse(requestBody);
      } catch {
        return errorEnvelope('BAD_REQUEST', 'invalid_json', { requestId: ctx.requestId });
      }
      const limit = (parsed as { limit?: unknown } | null)?.limit;
      const errors = collectErrors([
        validateNumber(limit, 'limit', { min: 1, max: 100, integer: true }),
      ]);
      if (errors.length > 0) {
        return validationErrorResponse(errors, corsHeaders);
      }
      if (typeof limit === 'number') requestedLimit = limit;
    }

    const authorized = await isAuthorizedCronRequest(req, async () => {
      const { data, error } = await supabase
        .from('_internal_secrets')
        .select('value')
        .eq('key', 'coaching_cron_secret')
        .maybeSingle();
      if (error) throw error;
      return (data as { value?: string | null } | null)?.value;
    });
    if (!authorized) {
      return errorEnvelope('UNAUTHORIZED', 'unauthorized', { requestId: ctx.requestId });
    }

    const secret = Deno.env.get('PROMO_FINANCE_CREDITO_WEBHOOK_SECRET');
    if (!secret) {
      return errorEnvelope('INTERNAL_ERROR', 'finance_secret_missing', {
        status: 503,
        requestId: ctx.requestId,
      });
    }
    const financeUrl = Deno.env.get('PROMO_FINANCE_CREDITO_WEBHOOK_URL') || DEFAULT_FINANCE_URL;

    const { data: batch, error: claimError } = await supabase.rpc(
      'claim_credit_outbox' as never,
      { p_limit: requestedLimit } as never,
    );
    if (claimError) {
      ctx.log('error', 'credit_claim_failed', { error: claimError.message });
      return errorEnvelope('INTERNAL_ERROR', 'claim_failed', { requestId: ctx.requestId });
    }

    const rows = (Array.isArray(batch) ? batch : []) as SupplyOutboxRow[];
    if (rows.length === 0) {
      return jsonResponse({ claimed: 0, delivered: 0, failed: 0 }, { requestId: ctx.requestId });
    }

    let delivered = 0;
    let failed = 0;

    for (const row of rows) {
      const envelopeBody = JSON.stringify(buildEnvelope(row));
      let outcome: { ok: boolean; error?: string };
      try {
        const signature = await signatureFor(secret, envelopeBody);
        const response = await fetchWithTimeout(
          financeUrl,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-webhook-signature': signature,
              'x-webhook-event': row.event,
              'x-correlation-key': row.id,
            },
            body: envelopeBody,
          },
          15_000,
        );
        const bodyText = await response.text();
        outcome = isDelivered(response.status)
          ? { ok: true }
          : { ok: false, error: `HTTP ${response.status}: ${bodyText.slice(0, 300)}` };
      } catch (error) {
        outcome = {
          ok: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }

      const { error: finishError } = await supabase.rpc(
        'finish_credit_outbox' as never,
        {
          p_ids: [row.id],
          p_ok: outcome.ok,
          p_error: outcome.error ?? null,
        } as never,
      );

      if (outcome.ok) {
        delivered += 1;
      } else {
        failed += 1;
        ctx.log('warn', 'credit_delivery_failed', {
          outbox_id: row.id,
          pedido_id: row.payload?.pedido_id ?? null,
          attempts: row.attempts,
          error: outcome.error,
          finish_error: finishError?.message ?? null,
        });
      }
    }

    ctx.log('info', 'credit_dispatch_finished', {
      claimed: rows.length,
      delivered,
      failed,
    });

    return jsonResponse({ claimed: rows.length, delivered, failed }, { requestId: ctx.requestId });
  }),
);
