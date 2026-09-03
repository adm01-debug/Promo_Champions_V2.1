import { getCorsHeaders } from '../_shared/cors.ts';
import { withRequestId } from '../_shared/request-id.ts';
// Executes the test cases declared in supabase/functions/winloss-webhook-dispatcher/retry_test.ts
// in-process, by overriding the global Deno.test API to capture (instead of run) the registered
// tests, then awaiting each one with timing. Returns a structured JSON suitable for a dashboard.
//
// Returns: { ran_at, total_duration_ms, passed, failed, total, file, tests: [...] }
// Each test entry: { name, status: "passed" | "failed", duration_ms, error?: string }
//
// CORS enabled. No auth required at the function layer (route is admin-gated in the UI).

type CapturedTest = {
  name: string;
  fn: () => unknown | Promise<unknown>;
  ignore?: boolean;
};

interface DenoTestDefinition {
  name: string;
  fn: () => unknown | Promise<unknown>;
  ignore?: boolean;
  only?: boolean;
}

type DenoTestArg = string | DenoTestDefinition | (() => unknown | Promise<unknown>);

function describeError(e: unknown): string {
  if (e instanceof Error) return `${e.name}: ${e.message}`;
  return String(e);
}

async function captureAndRun(): Promise<{
  tests: Array<{
    name: string;
    status: 'passed' | 'failed' | 'ignored';
    duration_ms: number;
    error?: string;
  }>;
  totalDurationMs: number;
}> {
  const captured: CapturedTest[] = [];

  // Save and override Deno.test. We capture every registration, then run them ourselves.
  // Deno.test is reassigned here, so we treat the global as a mutable record for this purpose.
  const denoMutable = Deno as unknown as { test: typeof Deno.test };
  const originalDenoTest = denoMutable.test;

  // Build an override that supports the multiple call signatures of Deno.test.
  const overrideImpl = (
    nameOrDef: DenoTestArg,
    maybeFn?: DenoTestArg,
    maybeFn2?: () => unknown | Promise<unknown>
  ) => {
    let name = '';
    let fn: (() => unknown | Promise<unknown>) | undefined;
    let ignore = false;

    if (typeof nameOrDef === 'string') {
      name = nameOrDef;
      if (typeof maybeFn === 'function') fn = maybeFn as () => unknown;
      else if (typeof maybeFn === 'object' && maybeFn !== null) {
        fn = (maybeFn as DenoTestDefinition).fn;
        ignore = !!(maybeFn as DenoTestDefinition).ignore;
        if (typeof maybeFn2 === 'function') fn = maybeFn2;
      }
    } else if (typeof nameOrDef === 'function') {
      name = nameOrDef.name || '(anonymous)';
      fn = nameOrDef as () => unknown;
    } else if (typeof nameOrDef === 'object' && nameOrDef !== null) {
      name = nameOrDef.name;
      fn = nameOrDef.fn;
      ignore = !!nameOrDef.ignore;
    }

    if (fn && name) captured.push({ name, fn, ignore });
  };
  const override = overrideImpl as unknown as typeof Deno.test;

  // Some Deno versions expose helpers like Deno.test.only/ignore. Provide no-op shims.
  const overrideWithHelpers = override as typeof Deno.test & {
    only: (def: DenoTestArg, fn?: () => unknown) => unknown;
    ignore: (def: DenoTestArg, fn?: () => unknown) => void;
  };
  overrideWithHelpers.only = (def: DenoTestArg, fn?: () => unknown) =>
    overrideImpl(def, fn);
  overrideWithHelpers.ignore = (def: DenoTestArg, fn?: () => unknown) => {
    if (typeof def === 'string' && typeof fn === 'function') {
      captured.push({ name: def, fn, ignore: true });
    }
  };

  denoMutable.test = override;

  try {
    // Dynamic import — registers all Deno.test() calls into `captured`.
    await import('./retry_test.ts');
    await import('./retry_parametric_test.ts');
    await import('./fuzz_test.ts');
    await import('./contract_test.ts');
  } finally {
    denoMutable.test = originalDenoTest;
  }

  const results: Array<{
    name: string;
    status: 'passed' | 'failed' | 'ignored';
    duration_ms: number;
    error?: string;
  }> = [];

  const suiteStart = performance.now();
  for (const t of captured) {
    if (t.ignore) {
      results.push({ name: t.name, status: 'ignored', duration_ms: 0 });
      continue;
    }
    const start = performance.now();
    try {
      await t.fn();
      const duration = performance.now() - start;
      results.push({
        name: t.name,
        status: 'passed',
        duration_ms: Math.round(duration * 100) / 100,
      });
    } catch (err) {
      const duration = performance.now() - start;
      results.push({
        name: t.name,
        status: 'failed',
        duration_ms: Math.round(duration * 100) / 100,
        error: describeError(err),
      });
    }
  }
  const totalDurationMs = Math.round((performance.now() - suiteStart) * 100) / 100;

  return { tests: results, totalDurationMs };
}

Deno.serve(withRequestId('run-retry-tests', async (req, _ctx) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { tests, totalDurationMs } = await captureAndRun();
    const passed = tests.filter(t => t.status === 'passed').length;
    const failed = tests.filter(t => t.status === 'failed').length;
    const ignored = tests.filter(t => t.status === 'ignored').length;

    return new Response(
      JSON.stringify({
        file: 'supabase/functions/winloss-webhook-dispatcher/retry_test.ts',
        ran_at: new Date().toISOString(),
        total_duration_ms: totalDurationMs,
        total: tests.length,
        passed,
        failed,
        ignored,
        tests,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    console.error('run-retry-tests error:', e);
    const msg = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}));
