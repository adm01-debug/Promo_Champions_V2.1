import { assertEquals, assertStringIncludes } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { buildFallbackContent, isAiDisabledError } from "./fallback.ts";

const context = {
  salespersonName: "Ana Silva",
  goal: 100_000,
  mtdRevenue: 40_000,
  progressPercent: 40,
  projectedEOM: 80_000,
  criticalDeals: [{ client_name: "Cliente A", amount: 15_000, days_stagnant: 8 }],
  overdueTasks: [{ title: "Retornar proposta", due_date: "2026-08-03" }],
  todayTasks: [{ title: "Reunião", due_time: "14:00" }],
  coachingTips: [{ tip: "Confirme o próximo passo." }],
};

Deno.test("identifica somente o 403 específico de IA desabilitada", () => {
  const body = JSON.stringify({
    type: "forbidden",
    title: "Lovable AI is disabled for this workspace.",
  });
  assertEquals(isAiDisabledError(403, body), true);
  assertEquals(isAiDisabledError(429, body), false);
  assertEquals(isAiDisabledError(403, '{"type":"forbidden","title":"Other"}'), false);
});

Deno.test("fallback de briefing usa dados reais e permanece acionável", () => {
  const content = buildFallbackContent("briefing", context);
  assertStringIncludes(content, "Ana");
  assertStringIncludes(content, "Cliente A");
  assertStringIncludes(content, "Retornar proposta");
  assertStringIncludes(content, "R$ 40.000");
});

Deno.test("fallback de chat informa indisponibilidade sem deixar mensagem vazia", () => {
  const content = buildFallbackContent("chat", context);
  assertStringIncludes(content, "temporariamente indisponível");
  assertStringIncludes(content, "Cliente A");
});

Deno.test("fallback proativo não gera alertas artificiais", () => {
  assertEquals(buildFallbackContent("proactive_nudge", context), "NO_NUDGE");
});