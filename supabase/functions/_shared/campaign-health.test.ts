import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

import {
  DEFAULT_THRESHOLDS,
  dedupeAlerts,
  evaluateCampaign,
  percent,
  type CampaignSnapshot,
} from "./campaign-health.ts";

const NOW = new Date("2026-07-26T12:00:00.000Z");

function snap(overrides: Partial<CampaignSnapshot> = {}): CampaignSnapshot {
  return {
    job_id: "job-1",
    owner_id: "owner-1",
    prompt: "Campanha de reativação",
    status: "completed",
    created_at: "2026-07-26T11:00:00.000Z",
    sent_count: 100,
    failed_count: 0,
    pending_count: 0,
    opted_out_count: 0,
    last_sent_at: "2026-07-26T11:55:00.000Z",
    ...overrides,
  };
}

Deno.test("percent protege contra divisão por zero", () => {
  assertEquals(percent(5, 0), 0);
  assertEquals(percent(1, 3), 33.33);
  assertEquals(percent(0, 10), 0);
});

Deno.test("campanha saudável não gera alertas", () => {
  assertEquals(evaluateCampaign(snap(), NOW).length, 0);
});

Deno.test("snapshot inválido não gera alertas", () => {
  assertEquals(evaluateCampaign(snap({ job_id: "" }), NOW).length, 0);
  assertEquals(evaluateCampaign(snap({ owner_id: "" }), NOW).length, 0);
});

Deno.test("opt-out acima do limiar gera warning e crítico", () => {
  const warn = evaluateCampaign(snap({ opted_out_count: 3 }), NOW);
  assertEquals(warn.length, 1);
  assertEquals(warn[0].alert_type, "opt_out_rate");
  assertEquals(warn[0].severity, "warning");

  const crit = evaluateCampaign(snap({ opted_out_count: 8 }), NOW);
  assertEquals(crit[0].severity, "critical");
});

Deno.test("amostra abaixo do mínimo não dispara opt-out", () => {
  const rows = evaluateCampaign(snap({ sent_count: 10, opted_out_count: 5 }), NOW);
  assertEquals(rows.filter((r) => r.alert_type === "opt_out_rate").length, 0);
});

Deno.test("taxa de falha dispara alerta proporcional", () => {
  const warn = evaluateCampaign(snap({ sent_count: 80, failed_count: 20 }), NOW);
  const failure = warn.find((r) => r.alert_type === "failure_rate");
  assertEquals(failure?.severity, "warning");

  const crit = evaluateCampaign(snap({ sent_count: 60, failed_count: 40 }), NOW);
  assertEquals(crit.find((r) => r.alert_type === "failure_rate")?.severity, "critical");
});

Deno.test("campanha parada com pendentes gera alerta travado", () => {
  const rows = evaluateCampaign(
    snap({ pending_count: 40, last_sent_at: "2026-07-26T11:00:00.000Z" }),
    NOW,
  );
  const stalled = rows.find((r) => r.alert_type === "stalled");
  assertEquals(stalled?.severity, "warning");
  assertEquals(stalled?.metrics.pending, 40);
});

Deno.test("parada há muito tempo é crítica", () => {
  const rows = evaluateCampaign(
    snap({ pending_count: 5, last_sent_at: "2026-07-26T08:00:00.000Z" }),
    NOW,
  );
  assertEquals(rows.find((r) => r.alert_type === "stalled")?.severity, "critical");
});

Deno.test("sem pendentes não há alerta travado mesmo antiga", () => {
  const rows = evaluateCampaign(
    snap({ pending_count: 0, last_sent_at: "2026-01-01T00:00:00.000Z" }),
    NOW,
  );
  assertEquals(rows.length, 0);
});

Deno.test("datas inválidas não quebram a avaliação", () => {
  const rows = evaluateCampaign(
    snap({ pending_count: 10, last_sent_at: "não-é-data", created_at: "??" }),
    NOW,
  );
  assertEquals(rows.length, 0);
});

Deno.test("dedupeAlerts respeita o cooldown", () => {
  const alerts = evaluateCampaign(snap({ opted_out_count: 8 }), NOW);
  const recent = new Map([["job-1:opt_out_rate", "2026-07-26T11:30:00.000Z"]]);
  assertEquals(dedupeAlerts(alerts, recent, 6, NOW).length, 0);
  assertEquals(dedupeAlerts(alerts, recent, 0.25, NOW).length, 1);
  assertEquals(dedupeAlerts(alerts, new Map(), 6, NOW).length, 1);
  assertEquals(
    dedupeAlerts(alerts, new Map([["job-1:opt_out_rate", "inválido"]]), 6, NOW).length,
    1,
  );
});

Deno.test("simulação de 500 campanhas mantém invariantes", () => {
  let generated = 0;
  for (let i = 0; i < 500; i++) {
    const sent = i % 200;
    const failed = i % 37;
    const pending = i % 11;
    const optedOut = i % 13;
    const rows = evaluateCampaign(
      snap({
        job_id: `job-${i}`,
        sent_count: sent,
        failed_count: failed,
        pending_count: pending,
        opted_out_count: optedOut,
        last_sent_at: i % 2 === 0 ? "2026-07-26T09:00:00.000Z" : NOW.toISOString(),
      }),
      NOW,
    );
    generated += rows.length;
    for (const r of rows) {
      // Invariantes: tipos válidos, mensagem não vazia, sem duplicidade de tipo.
      assertEquals(typeof r.message === "string" && r.message.length > 0, true);
      assertEquals(rows.filter((x) => x.alert_type === r.alert_type).length, 1);
      assertEquals(
        ["opt_out_rate", "failure_rate", "stalled"].includes(r.alert_type),
        true,
      );
    }
  }
  assertEquals(generated > 0, true);
  assertEquals(DEFAULT_THRESHOLDS.minSample, 20);
});
