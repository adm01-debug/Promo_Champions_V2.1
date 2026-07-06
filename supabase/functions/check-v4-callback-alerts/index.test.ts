import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { evaluateAlerts } from "./index.ts";

const base = {
  windowMinutes: 60,
  minEvents: 10,
  failureRateThreshold: 20,
  exhaustedThreshold24h: 5,
  pendingThreshold: 50,
  ok: 0, failed: 0, exhausted24h: 0, pending: 0,
};

Deno.test("no alerts when under thresholds", () => {
  assertEquals(evaluateAlerts({ ...base, ok: 90, failed: 5 }).length, 0);
});

Deno.test("skips failure rate when below min_events", () => {
  const r = evaluateAlerts({ ...base, ok: 1, failed: 5 });
  assertEquals(r.find(a => a.kind === "high_failure_rate"), undefined);
});

Deno.test("fires high_failure_rate", () => {
  const r = evaluateAlerts({ ...base, ok: 60, failed: 40 });
  assertEquals(r[0].kind, "high_failure_rate");
});

Deno.test("fires exhausted_spike", () => {
  const r = evaluateAlerts({ ...base, exhausted24h: 10 });
  assertEquals(r.some(a => a.kind === "exhausted_spike"), true);
});

Deno.test("fires pending_backlog", () => {
  const r = evaluateAlerts({ ...base, pending: 200 });
  assertEquals(r.some(a => a.kind === "pending_backlog"), true);
});

Deno.test("fires multiple simultaneously", () => {
  const r = evaluateAlerts({ ...base, ok: 10, failed: 40, exhausted24h: 8, pending: 100 });
  assertEquals(r.length, 3);
});
