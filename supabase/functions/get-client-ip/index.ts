import { getCorsHeaders } from '../_shared/cors.ts';
import { withRequestId } from '../_shared/request-id.ts';

Deno.serve(
  withRequestId('get-client-ip', async (req, _ctx) => {
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: getCorsHeaders(req) });
    }

    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      req.headers.get('cf-connecting-ip') ||
      'unknown';

    return new Response(JSON.stringify({ ip }), {
      status: 200,
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
    });
  }),
);
