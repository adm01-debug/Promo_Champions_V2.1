import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { concurrency = 10, total = 100, targetUrl } = await req.json().catch(() => ({}));
    
    if (!targetUrl) {
      return new Response(JSON.stringify({ error: "targetUrl is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results = {
      passed: 0,
      failed: 0,
      latencies: [] as number[],
    };

    const runBatch = async (batchSize: number) => {
      const promises = Array.from({ length: batchSize }).map(async () => {
        const start = performance.now();
        try {
          const res = await fetch(targetUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ event: "load_test", ts: Date.now() }),
          });
          const duration = performance.now() - start;
          results.latencies.push(duration);
          if (res.ok) results.passed++;
          else results.failed++;
        } catch (e) {
          results.failed++;
          results.latencies.push(performance.now() - start);
        }
      });
      await Promise.all(promises);
    };

    const batches = Math.ceil(total / concurrency);
    for (let i = 0; i < batches; i++) {
      const currentBatchSize = Math.min(concurrency, total - i * concurrency);
      await runBatch(currentBatchSize);
    }

    const avgLatency = results.latencies.reduce((a, b) => a + b, 0) / results.latencies.length;
    const maxLatency = Math.max(...results.latencies);
    const minLatency = Math.min(...results.latencies);

    return new Response(
      JSON.stringify({
        total,
        passed: results.passed,
        failed: results.failed,
        avgLatencyMs: Math.round(avgLatency),
        maxLatencyMs: Math.round(maxLatency),
        minLatencyMs: Math.round(minLatency),
        successRate: (results.passed / total) * 100,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
