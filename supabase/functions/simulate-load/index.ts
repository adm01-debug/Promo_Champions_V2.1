import { createClient } from 'npm:@supabase/supabase-js@2.49.4';
import { getCorsHeaders } from '../_shared/cors.ts';
import { withRequestId } from '../_shared/request-id.ts';
import { fetchWithTimeout } from "../_shared/fetch-with-timeout.ts";

const PRIVATE_IP_RE =
  /^(localhost|127\.|0\.0\.0\.0|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|::1|fd[0-9a-f]{2}:|169\.254\.)/i;

function isPrivateUrl(raw: string): boolean {
  try {
    const { hostname } = new URL(raw);
    return PRIVATE_IP_RE.test(hostname);
  } catch {
    return true;
  }
}

Deno.serve(withRequestId('simulate-load', async (req, _ctx) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  // Require valid JWT — this endpoint can generate significant outbound traffic
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Authorization header required' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const {
    data: { user },
    error: authError,
  } = await authClient.auth.getUser();
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { concurrency = 10, total = 100, targetUrl } = await req.json().catch(() => ({}));

    if (!targetUrl) {
      return new Response(JSON.stringify({ error: 'targetUrl is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Block SSRF — reject requests targeting private/internal network addresses
    if (isPrivateUrl(targetUrl)) {
      return new Response(
        JSON.stringify({ error: 'Requests to private or internal addresses are not allowed' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Cap concurrency and total to reasonable limits
    const safeConcurrency = Math.min(Math.max(1, concurrency), 20);
    const safeTotal = Math.min(Math.max(1, total), 200);

    const results = {
      passed: 0,
      failed: 0,
      latencies: [] as number[],
    };

    const runBatch = async (batchSize: number) => {
      const promises = Array.from({ length: batchSize }).map(async () => {
        const start = performance.now();
        try {
          const res = await fetchWithTimeout(targetUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ event: 'load_test', ts: Date.now() }),
          });
          const duration = performance.now() - start;
          results.latencies.push(duration);
          if (res.ok) results.passed++;
          else results.failed++;
        } catch (_e) {
          results.failed++;
          results.latencies.push(performance.now() - start);
        }
      });
      await Promise.all(promises);
    };

    const batches = Math.ceil(safeTotal / safeConcurrency);
    for (let i = 0; i < batches; i++) {
      const currentBatchSize = Math.min(safeConcurrency, safeTotal - i * safeConcurrency);
      await runBatch(currentBatchSize);
    }

    const avgLatency = results.latencies.reduce((a, b) => a + b, 0) / results.latencies.length;
    const maxLatency = Math.max(...results.latencies);
    const minLatency = Math.min(...results.latencies);

    return new Response(
      JSON.stringify({
        total: safeTotal,
        passed: results.passed,
        failed: results.failed,
        avgLatencyMs: Math.round(avgLatency),
        maxLatencyMs: Math.round(maxLatency),
        minLatencyMs: Math.round(minLatency),
        successRate: (results.passed / safeTotal) * 100,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    console.error('simulate-load error:', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}));
