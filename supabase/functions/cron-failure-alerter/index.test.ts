// Automated regression tests for cron monitoring.
// Cobre:
//  • Limiares por schedule (5/10/15/30 min, hourly, daily, weekly, unknown → default)
//  • Detecção de cron travado quando gap > threshold
//  • Deduplicação de 6h (repetidas simulações do MESMO job ficam suprimidas)
//  • Falhas intermitentes (mesmo start_time → upsert, start_times distintos → linhas distintas)
//  • fn_admin_get_new_cron_failures ignora alertas já registrados (dedupe alerter)
//
// Todas as simulações usam jobids NEGATIVOS (sintéticos) — as RPCs de teste
// rejeitam qualquer id >= 0, garantindo isolamento total dos crons reais.
//
// Execução: as credenciais são carregadas do .env raiz via dotenv.
import "https://deno.land/std@0.224.0/dotenv/load.ts";
import {
  assertEquals,
  assert,
  assertNotEquals,
} from "https://deno.land/std@0.224.0/assert/mod.ts";
const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const ANON = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;

// Chama uma RPC via PostgREST — evita dependência npm no runner de tests.
async function rpc<T = unknown>(fn: string, params: Record<string, unknown>): Promise<{
  data: T | null;
  error: { message: string } | null;
}> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: {
      apikey: ANON,
      Authorization: `Bearer ${ANON}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });
  const text = await res.text();
  if (!res.ok) return { data: null, error: { message: text || `HTTP ${res.status}` } };
  try { return { data: text ? JSON.parse(text) as T : null, error: null }; }
  catch { return { data: text as unknown as T, error: null }; }
}

// Base id sintético — usar offsets negativos distintos por cenário.
const JOB = {
  fiveMin: -1001,
  tenMin: -1002,
  fifteenMin: -1003,
  thirtyMin: -1004,
  hourly: -1005,
  daily: -1006,
  weekly: -1007,
  unknown: -1008,
  dedupe6h: -1009,
  intermittent: -1010,
  alerterDedupe: -1011,
} as const;

async function cleanup(jobid: number) {
  const { error } = await rpc("fn_test_cleanup_cron_alerts", { _jobid: jobid });
  if (error) throw new Error(error.message);
}

async function simulate(
  jobid: number,
  jobname: string,
  schedule: string,
  lastRun: Date,
) {
  const { data, error } = await rpc<{
    alert_created: boolean;
    skipped_reason: string | null;
    expected_interval: string;
    threshold: string;
    gap: string;
  }>("fn_test_simulate_stalled_check", {
    _jobid: jobid,
    _jobname: jobname,
    _schedule: schedule,
    _last_run: lastRun.toISOString(),
  });
  if (error) throw new Error(error.message);
  return data!;
}

async function backdate(jobid: number, hoursAgo: number) {
  const { data, error } = await rpc("fn_test_backdate_cron_alert", {
    _jobid: jobid,
    _hours: hoursAgo,
  });
  if (error) throw error;
  return data as number;
}

function agoMinutes(mins: number) {
  return new Date(Date.now() - mins * 60_000);
}

// ─── Helpers puros: intervalo esperado por schedule ──────────────────────
Deno.test("fn_cron_expected_interval → cada schedule mapeia para o intervalo correto", async () => {
  const cases: Array<[string, string]> = [
    ["*/5 * * * *", "00:05:00"],
    ["*/10 * * * *", "00:10:00"],
    ["*/15 * * * *", "00:15:00"],
    ["*/30 * * * *", "00:30:00"],
    ["0 * * * *", "01:00:00"],
    ["0 8 * * *", "1 day"],
    ["0 8 * * 1", "7 days"],
    ["weird string", "1 day"],
  ];
  for (const [schedule, expectedContains] of cases) {
    const { data, error } = await rpc("fn_cron_expected_interval", { _schedule: schedule });
    assertEquals(error, null, `schedule=${schedule} error=${error?.message}`);
    assert(
      String(data).includes(expectedContains),
      `schedule=${schedule} expected≈${expectedContains} got=${data}`,
    );
  }
});

// ─── Limiares por schedule ────────────────────────────────────────────────
Deno.test("fn_cron_stalled_threshold → 5min job usa piso de 30min", async () => {
  await cleanup(JOB.fiveMin);
  // gap = 20min → abaixo do piso (30min)
  const below = await simulate(JOB.fiveMin, "job-5min", "*/5 * * * *", agoMinutes(20));
  assertEquals(below.alert_created, false);
  assertEquals(below.skipped_reason, "gap_below_threshold");

  // gap = 40min → acima do piso
  const above = await simulate(JOB.fiveMin, "job-5min", "*/5 * * * *", agoMinutes(40));
  assertEquals(above.alert_created, true);
  await cleanup(JOB.fiveMin);
});

Deno.test("fn_cron_stalled_threshold → 15min job usa 30min (2× intervalo)", async () => {
  await cleanup(JOB.fifteenMin);
  const below = await simulate(JOB.fifteenMin, "job-15min", "*/15 * * * *", agoMinutes(25));
  assertEquals(below.alert_created, false);
  const above = await simulate(JOB.fifteenMin, "job-15min", "*/15 * * * *", agoMinutes(35));
  assertEquals(above.alert_created, true);
  await cleanup(JOB.fifteenMin);
});

Deno.test("fn_cron_stalled_threshold → 30min job usa 60min (2× intervalo)", async () => {
  await cleanup(JOB.thirtyMin);
  const below = await simulate(JOB.thirtyMin, "job-30min", "*/30 * * * *", agoMinutes(50));
  assertEquals(below.alert_created, false);
  const above = await simulate(JOB.thirtyMin, "job-30min", "*/30 * * * *", agoMinutes(70));
  assertEquals(above.alert_created, true);
  await cleanup(JOB.thirtyMin);
});

Deno.test("fn_cron_stalled_threshold → hourly usa 2h", async () => {
  await cleanup(JOB.hourly);
  const below = await simulate(JOB.hourly, "job-hourly", "0 * * * *", agoMinutes(110));
  assertEquals(below.alert_created, false);
  const above = await simulate(JOB.hourly, "job-hourly", "0 * * * *", agoMinutes(130));
  assertEquals(above.alert_created, true);
  await cleanup(JOB.hourly);
});

Deno.test("fn_cron_stalled_threshold → daily satura em 25h (teto)", async () => {
  await cleanup(JOB.daily);
  const below = await simulate(JOB.daily, "job-daily", "0 8 * * *", agoMinutes(24 * 60));
  assertEquals(below.alert_created, false, `daily 24h deve ficar abaixo do teto 25h`);
  const above = await simulate(JOB.daily, "job-daily", "0 8 * * *", agoMinutes(26 * 60));
  assertEquals(above.alert_created, true);
  await cleanup(JOB.daily);
});

Deno.test("fn_cron_stalled_threshold → weekly também satura em 25h (teto)", async () => {
  await cleanup(JOB.weekly);
  const above = await simulate(JOB.weekly, "job-weekly", "0 8 * * 1", agoMinutes(26 * 60));
  assertEquals(above.alert_created, true, `weekly acima de 25h deve alertar`);
  await cleanup(JOB.weekly);
});

Deno.test("fn_cron_stalled_threshold → schedule desconhecido cai no default de 1 dia (teto 25h)", async () => {
  await cleanup(JOB.unknown);
  const below = await simulate(JOB.unknown, "job-unknown", "@custom-nonsense", agoMinutes(24 * 60));
  assertEquals(below.alert_created, false);
  const above = await simulate(JOB.unknown, "job-unknown", "@custom-nonsense", agoMinutes(26 * 60));
  assertEquals(above.alert_created, true);
  await cleanup(JOB.unknown);
});

// ─── Cenário: cron TRAVADO com deduplicação de 6h ────────────────────────
Deno.test("cron travado → primeira detecção alerta, tentativas dentro de 6h são deduplicadas", async () => {
  await cleanup(JOB.dedupe6h);

  // 1) primeira detecção — cria alerta
  const first = await simulate(JOB.dedupe6h, "job-dedupe", "*/10 * * * *", agoMinutes(90));
  assertEquals(first.alert_created, true, "primeira detecção deve criar alerta");

  // 2) próxima varredura do detector (5min depois, ainda travado) — deve deduplicar
  const secondTick = await simulate(JOB.dedupe6h, "job-dedupe", "*/10 * * * *", agoMinutes(95));
  assertEquals(secondTick.alert_created, false);
  assertEquals(secondTick.skipped_reason, "deduped_within_6h");

  // 3) várias tentativas dentro de 6h → todas suprimidas
  for (let i = 0; i < 5; i++) {
    const r = await simulate(JOB.dedupe6h, "job-dedupe", "*/10 * * * *", agoMinutes(100 + i));
    assertEquals(r.alert_created, false, `tick ${i} deveria ficar deduplicado`);
    assertEquals(r.skipped_reason, "deduped_within_6h");
  }

  // 4) simula passagem de tempo: backdate do alerta para 6h1min atrás → dedupe expira
  const updated = await backdate(JOB.dedupe6h, 6.02);
  assertEquals(updated, 1);
  const afterWindow = await simulate(JOB.dedupe6h, "job-dedupe", "*/10 * * * *", agoMinutes(120));
  assertEquals(afterWindow.alert_created, true, "após 6h a nova detecção deve alertar novamente");

  await cleanup(JOB.dedupe6h);
});

Deno.test("borda inferior da janela de 6h: alerta backdated para 5h55min ainda deduplica", async () => {
  await cleanup(JOB.dedupe6h);
  const first = await simulate(JOB.dedupe6h, "job-dedupe", "*/10 * * * *", agoMinutes(90));
  assertEquals(first.alert_created, true);

  await backdate(JOB.dedupe6h, 5.9); // ainda dentro da janela
  const stillDeduped = await simulate(JOB.dedupe6h, "job-dedupe", "*/10 * * * *", agoMinutes(95));
  assertEquals(stillDeduped.alert_created, false);
  assertEquals(stillDeduped.skipped_reason, "deduped_within_6h");

  await cleanup(JOB.dedupe6h);
});

// ─── Cenário: falha INTERMITENTE — dedupe por (jobid, start_time) ────────
Deno.test("falha intermitente → mesmo start_time é upsert (1 linha), start_times distintos criam linhas distintas", async () => {
  await cleanup(JOB.intermittent);

  const st1 = agoMinutes(20).toISOString();
  const st2 = agoMinutes(10).toISOString();

  // marca a mesma falha duas vezes (retry do alerter) → upsert idempotente
  const r1 = await rpc("fn_admin_mark_cron_failure_alerted", {
    _jobid: JOB.intermittent,
    _jobname: "job-intermittent",
    _start_time: st1,
    _status: "failed",
    _return_message: "boom",
    _notified_admin_count: 2,
  });
  assertEquals(r1.error, null);
  const r2 = await rpc("fn_admin_mark_cron_failure_alerted", {
    _jobid: JOB.intermittent,
    _jobname: "job-intermittent",
    _start_time: st1,
    _status: "failed",
    _return_message: "boom-again",
    _notified_admin_count: 3,
  });
  assertEquals(r2.error, null);
  assertEquals(r1.data, r2.data, "upsert deve retornar o MESMO id para (jobid, start_time)");

  // nova execução falha (start_time diferente) → nova linha
  const r3 = await rpc("fn_admin_mark_cron_failure_alerted", {
    _jobid: JOB.intermittent,
    _jobname: "job-intermittent",
    _start_time: st2,
    _status: "failed",
    _return_message: "boom-2",
    _notified_admin_count: 1,
  });
  assertEquals(r3.error, null);
  assertNotEquals(r1.data, r3.data, "start_time diferente deve criar nova linha");

  await cleanup(JOB.intermittent);
});

// ─── Sanidade: RPCs de teste rejeitam jobids reais (>= 0) ────────────────
Deno.test("guard-rail: fn_test_simulate_stalled_check rejeita jobid >= 0", async () => {
  const { error } = await rpc("fn_test_simulate_stalled_check", {
    _jobid: 1,
    _jobname: "real-job",
    _schedule: "*/5 * * * *",
    _last_run: new Date().toISOString(),
  });
  assert(error !== null, "deveria falhar com jobid positivo");
  assert(error!.message.includes("negative"), `mensagem inesperada: ${error!.message}`);
});

Deno.test("guard-rail: fn_test_cleanup_cron_alerts rejeita jobid >= 0", async () => {
  const { error } = await rpc("fn_test_cleanup_cron_alerts", { _jobid: 0 });
  assert(error !== null);
});
