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
// com máscara BR ou prefixo de tronco ("041..."). Normaliza para E.164 e valida
// contra a allowlist de DDIs antes de mandar para a Twilio — discagem
// internacional/premium arbitrária é toll fraud com credencial do tenant.
const ALLOWED_DIAL_PREFIXES = (Deno.env.get('TWILIO_ALLOWED_DIAL_PREFIXES') ?? '+55')
  .split(',')
  .map(p => p.trim())
  .filter(Boolean);

function isAllowedDestination(e164: string): boolean {
  return ALLOWED_DIAL_PREFIXES.some(p => e164.startsWith(p));
}

function normalizeToE164(raw: string): string | null {
  const trimmed = raw.trim();
  const hasPlus = trimmed.startsWith('+');
  let digits = trimmed.replace(/\D/g, '');
  if (!digits) return null;
  if (hasPlus) {
    const candidate = `+${digits}`;
    if (!/^\+[1-9]\d{7,14}$/.test(candidate)) return null;
    // +55: exigir DDD válido (11-99) e comprimento nacional 10-11.
    if (candidate.startsWith('+55')) {
      const national = candidate.slice(3);
      if (!/^[1-9][1-9]\d{8,9}$/.test(national)) return null;
    }
    return candidate;
  }
  // Prefixo de tronco nacional ("041 99999-8888") — comum em base importada.
  if ((digits.length === 11 || digits.length === 12) && digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  // Nacional BR: DDD (11-99) + fixo (8) ou celular (9).
  if ((digits.length === 10 || digits.length === 11) && /^[1-9][1-9]/.test(digits)) {
    return `+55${digits}`;
  }
  // Já com DDI 55 sem o "+".
  if ((digits.length === 12 || digits.length === 13) && digits.startsWith('55')) {
    const national = digits.slice(2);
    if (/^[1-9][1-9]\d{8,9}$/.test(national)) return `+${digits}`;
  }
  return null;
}

Deno.serve(
  withRequestId('twilio-click-to-call', async (req, ctx) => {
    const corsHeaders = getCorsHeaders(req);
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

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

      // Rate limit POR USUÁRIO, depois de autenticar: por IP era spoofável via
      // X-Forwarded-For e punia o escritório inteiro atrás de um NAT (o gateway
      // verify_jwt já barra chamadas sem JWT antes de chegar aqui).
      const limited = enforceRateLimit(req, {
        name: 'twilio-click-to-call',
        limit: 30,
        windowSeconds: 60,
        key: ownerId,
      });
      if (limited) return limited;

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
      if (!isAllowedDestination(toNumber)) {
        ctx.log('warn', 'blocked_dial_prefix', { prefix: toNumber.slice(0, 4) });
        return new Response(
          JSON.stringify({
            error: 'destination_not_allowed',
            message: 'Destino fora dos DDIs permitidos (padrão: +55)',
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
        // Sem 'initiated': o INSERT abaixo já grava status inicial 'initiated',
        // e o callback initiated corria contra o INSERT (chegava antes da
        // sessão existir → 401/404 espúrio no twilio-call-status).
        StatusCallbackEvent: 'ringing answered completed',
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
