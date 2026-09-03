import { createClient } from 'npm:@supabase/supabase-js@2.49.4';
import { getCorsHeaders } from '../_shared/cors.ts';
import { withRequestId } from '../_shared/request-id.ts';
import { fetchWithTimeout } from '../_shared/fetch-with-timeout.ts';
import {
  withEdgeCircuitBreaker,
  CircuitBreakerOpenError,
} from '../_shared/circuit-breaker.ts';
import { enforceRateLimit } from '../_shared/rate-limit.ts';

interface Payload {
  to_number: string;
  sale_id?: string;
  queue_item_id?: string;
  from_number?: string;
}

// O front envia o telefone cru do banco (account_contacts.phone), muitas vezes
// com máscara BR. Normaliza para E.164 antes de mandar para a Twilio — e
// rejeita o que não normalizar (fecha discagem arbitrária/toll fraud com lixo).
function normalizeToE164(raw: string): string | null {
  const trimmed = raw.trim();
  const hasPlus = trimmed.startsWith('+');
  const digits = trimmed.replace(/\D/g, '');
  if (!digits) return null;
  if (hasPlus) {
    const candidate = `+${digits}`;
    return /^\+[1-9]\d{7,14}$/.test(candidate) ? candidate : null;
  }
  // Nacional BR: fixo (10 dígitos) ou celular (11 dígitos) → prefixa +55.
  if (digits.length === 10 || digits.length === 11) return `+55${digits}`;
  // Já com DDI 55 sem o "+".
  if ((digits.length === 12 || digits.length === 13) && digits.startsWith('55')) {
    return `+${digits}`;
  }
  return null;
}

Deno.serve(
  withRequestId('twilio-click-to-call', async (req, ctx) => {
  const corsHeaders = getCorsHeaders(req);
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

    const limited = enforceRateLimit(req, {
      name: 'twilio-click-to-call',
      limit: 10,
      windowSeconds: 60,
    });
    if (limited) return limited;

    try {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
        global: { headers: { Authorization: authHeader } },
      });
      const admin = createClient(supabaseUrl, serviceKey);

      const { data: userData, error: userErr } = await userClient.auth.getUser();
      if (userErr || !userData.user) {
        return new Response(JSON.stringify({ error: 'Invalid token' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const ownerId = userData.user.id;

      const body = (await req.json()) as Payload;
      if (!body.to_number || typeof body.to_number !== 'string') {
        return new Response(JSON.stringify({ error: 'to_number required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const toNumber = normalizeToE164(body.to_number);
      if (!toNumber) {
        return new Response(
          JSON.stringify({
            error: 'invalid_to_number',
            message: 'Número inválido — informe DDD + número (BR) ou formato E.164 (+55...)',
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Load Twilio credentials for owner
      const { data: cred } = await admin
        .from('channel_credentials')
        .select('credentials, from_number')
        .eq('owner_id', ownerId)
        .eq('provider', 'twilio')
        .eq('enabled', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!cred) {
        return new Response(
          JSON.stringify({ error: 'Twilio não configurado. Conecte em Multichannel.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const creds = cred.credentials as Record<string, string>;
      const accountSid = creds.account_sid;
      const authToken = creds.auth_token;
      if (!accountSid || !authToken) {
        return new Response(JSON.stringify({ error: 'Credenciais Twilio incompletas' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const fromNumber = body.from_number || cred.from_number;
      if (!fromNumber) {
        return new Response(JSON.stringify({ error: 'from_number ausente' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const twimlUrl = `${supabaseUrl}/functions/v1/twilio-call-twiml?owner_id=${ownerId}`;
      const statusUrl = `${supabaseUrl}/functions/v1/twilio-call-status`;

      const params = new URLSearchParams({
        To: toNumber,
        From: fromNumber,
        Url: twimlUrl,
        StatusCallback: statusUrl,
        StatusCallbackEvent: 'initiated ringing answered completed',
        StatusCallbackMethod: 'POST',
        Record: 'true',
      });

      let twilioRes: Response;
      try {
        twilioRes = await withEdgeCircuitBreaker(
          'twilio:calls',
          async () => {
            const r = await fetchWithTimeout(
              `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`,
              {
                method: 'POST',
                headers: {
                  Authorization: `Basic ${btoa(`${accountSid}:${authToken}`)}`,
                  'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: params.toString(),
              }
            );
            if (r.status >= 500) throw new Error(`twilio_5xx_${r.status}`);
            return r;
          },
          { failureThreshold: 5, resetTimeout: 30_000, timeoutMs: 35_000 }
        );
      } catch (err) {
        if (err instanceof CircuitBreakerOpenError) {
          return new Response(
            JSON.stringify({
              error: 'circuit_open',
              message: 'Twilio temporariamente indisponível',
            }),
            {
              status: 503,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }
        throw err;
      }

      const twilioData = await twilioRes.json();
      if (!twilioRes.ok) {
        // Payload bruto da Twilio só no log; a mensagem dela é útil ao usuário
        // ("invalid To number"), o resto não sai na resposta.
        ctx.log('warn', 'twilio_call_create_failed', {
          status: twilioRes.status,
          twilio_code: twilioData.code,
          twilio_message: twilioData.message,
        });
        return new Response(
          JSON.stringify({ error: twilioData.message || 'Twilio error' }),
          { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const callSid = twilioData.sid as string;

      const { data: session, error: insErr } = await admin
        .from('twilio_call_sessions')
        .insert({
          owner_id: ownerId,
          sale_id: body.sale_id ?? null,
          queue_item_id: body.queue_item_id ?? null,
          call_sid: callSid,
          from_number: fromNumber,
          to_number: toNumber,
          status: 'initiated',
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insErr) {
        console.error('Insert error:', insErr);
      }

      return new Response(
        JSON.stringify({ ok: true, call_sid: callSid, session_id: session?.id }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (e) {
      ctx.log('error', 'twilio_click_to_call_failed', {
        error: e instanceof Error ? e.message : String(e),
      });
      return new Response(JSON.stringify({ error: 'internal_error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  })
);
