import { getCorsHeaders } from '../_shared/cors.ts';
import { withRequestId } from '../_shared/request-id.ts';
import {
  WebhookContracts,
  validateWebhookPayload,
} from '../_shared/webhook-validator.ts';
import { collectErrors, validateNumber, validateString } from '../_shared/validation.ts';

Deno.serve(withRequestId('stress-test-contracts', async (req, _ctx) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const parsed: unknown = await req.json().catch(() => ({}));
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return new Response(JSON.stringify({ error: 'corpo_json_invalido' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const { iterations = 100, targetContract = 'crmEvent' } = parsed as {
      iterations?: unknown;
      targetContract?: unknown;
    };

    const payloadErrors = collectErrors([
      validateNumber(iterations, 'iterations', { integer: true, min: 1, max: 10_000 }),
      validateString(targetContract, 'targetContract', { maxLength: 200 }),
    ]);
    if (payloadErrors.length) {
      return new Response(JSON.stringify({ error: 'dados_invalidos', details: payloadErrors }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const totalIterations = iterations as number;
    const contractName = targetContract as string;

    // @ts-expect-error: Dynamic access by string key
    const schema = WebhookContracts[contractName];
    if (!schema) {
      return new Response(JSON.stringify({ error: 'Contract not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const results = {
      total: totalIterations,
      passed: 0,
      failed: 0,
      vulnerabilities_detected: [] as Array<{
        scenario: string;
        payload: Record<string, unknown>;
        reason: string;
      }>,
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

    for (let i = 0; i < totalIterations; i++) {
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
    console.error('stress-test-contracts error:', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}));
