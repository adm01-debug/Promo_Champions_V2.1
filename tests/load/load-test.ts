import { delay } from "https://deno.land/std@0.224.0/async/delay.ts";

const TARGET_URLS = [
  "https://rapjswienfhkobhlamxb.supabase.co/functions/v1/lead-scoring",
  "https://rapjswienfhkobhlamxb.supabase.co/functions/v1/execute-workflow",
  "https://rapjswienfhkobhlamxb.supabase.co/functions/v1/ai-copilot",
];

async function runLoadTest(concurrency: number, iterations: number) {
  console.log(`🚀 Starting load test: ${concurrency} concurrent workers, ${iterations} iterations each.`);
  
  const startTime = Date.now();
  let successCount = 0;
  let failCount = 0;
  const latencies: number[] = [];

  const workers = Array.from({ length: concurrency }).map(async (_, workerId) => {
    for (let i = 0; i < iterations; i++) {
      const url = TARGET_URLS[Math.floor(Math.random() * TARGET_URLS.length)];
      const reqStart = Date.now();
      
      try {
        // In a real test, we would use real payloads and auth headers
        // For simulation, we'll hit the OPTIONS preflight or a mock endpoint
        const response = await fetch(url, {
          method: 'OPTIONS',
          headers: {
            'Origin': 'https://freight-quest.test',
          }
        });

        latencies.push(Date.now() - reqStart);
        if (response.ok) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (e) {
        failCount++;
        console.error(`Worker ${workerId} failed:`, e.message);
      }
      
      // Small jitter to prevent perfectly synchronized requests
      await delay(Math.random() * 50);
    }
  });

  await Promise.all(workers);
  
  const totalTime = (Date.now() - startTime) / 1000;
  const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
  const p95Latency = latencies.sort((a, b) => a - b)[Math.floor(latencies.length * 0.95)];

  console.log("\n📊 Load Test Results:");
  console.log(`- Total Requests: ${successCount + failCount}`);
  console.log(`- Success Rate: ${((successCount / (successCount + failCount)) * 100).toFixed(2)}%`);
  console.log(`- Avg Latency: ${avgLatency.toFixed(2)}ms`);
  console.log(`- P95 Latency: ${p95Latency.toFixed(2)}ms`);
  console.log(`- Throughput: ${((successCount + failCount) / totalTime).toFixed(2)} req/s`);
  console.log(`- Total Duration: ${totalTime.toFixed(2)}s`);
}

// Example usage: 20 concurrent users, 50 requests each
if (import.meta.main) {
  runLoadTest(20, 50);
}
