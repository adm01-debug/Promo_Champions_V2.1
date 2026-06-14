import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import {
  WebhookContracts,
  validateWebhookPayload,
} from '../_shared/webhook-validator.ts';

serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { iterations = 100, targetContract = 'crmEvent' } = await req.json();

    // @ts-expect-error: Dynamic access by string key
    const schema = WebhookContracts[targetContract];
    if (!schema) {
      return new Response(JSON.stringify({ error: 'Contract not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const results = {
      total: iterations,
      passed: 0,
      failed: 0,
      vulnerabilities_detected: [] as any[],
    };

    const fuzz = () => {
      const scenarios = [
        { name: 'Empty Object', payload: {} },
        { name: 'Null Fields', payload: { event_id: null, timestamp: null } },
        { name: 'Invalid Types', payload: { event_id: 123, timestamp: true } },
        { name: 'Malformed UUID', payload: { event_id: 'not-a-uuid' } },
        { name: 'SQL Injection String', payload: { event_id: "'; DROP TABLE users;--" } },
        { name: 'XSS String', payload: { event_id: '<script>alert(1)</script>' } },
        { name: 'Extreme Large String', payload: { event_id: 'a'.repeat(10000) } },
      ];
      return scenarios[Math.floor(Math.random() * scenarios.length)];
    };

    for (let i = 0; i < iterations; i++) {
      const scenario = fuzz();
      const validation = validateWebhookPayload(schema, scenario.payload);

      if (!validation.success) {
        results.passed++; // In fuzzing, "passed" means the system correctly REJECTED malformed data
      } else {
        // If a malformed payload is accepted, it's a failure (potential vulnerability)
        results.failed++;
        results.vulnerabilities_detected.push({
          scenario: scenario.name,
          payload: scenario.payload,
          reason: 'Payload malformed was accepted by contract',
        });
      }
    }

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
