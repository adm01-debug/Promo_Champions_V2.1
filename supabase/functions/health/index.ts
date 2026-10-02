import { getCorsHeaders } from '../_shared/cors.ts';
import { withRequestId } from '../_shared/request-id.ts';

// Endpoint público de health check para monitor externo (docs/RUNBOOK.md §4).
// Sem auth e sem acesso a banco: a única coisa que ele prova é que o runtime
// de edge functions está de pé — exatamente o sinal que um UptimeRobot/
// BetterStack/Checkly precisa para detectar indisponibilidade total.
const VERSION = Deno.env.get('APP_VERSION') ?? 'dev';

Deno.serve(
  withRequestId('health', async (req, _ctx) => {
    const corsHeaders = getCorsHeaders(req);
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    return new Response(
      JSON.stringify({
        status: 'ok',
        version: VERSION,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }),
);
