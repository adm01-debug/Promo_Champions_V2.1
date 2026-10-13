import { getCorsHeaders } from "../_shared/cors.ts";
import { withRequestId } from "../_shared/request-id.ts";
import { fetchWithTimeout } from "../_shared/fetch-with-timeout.ts";
import { enforceRateLimit } from "../_shared/rate-limit.ts";
import { getStageProbabilities } from "../_shared/stage-probabilities.ts";
import { LOVABLE_AI_CHAT_COMPLETIONS_URL } from "../_shared/ai-gateway.ts";
import { toBusinessDate, toBusinessMonthStart } from "../_shared/business-date.ts";
import { getServiceClient } from "../_shared/auth-client.ts";

function classifyHealth(ratio: number): "critical" | "weak" | "healthy" | "strong" {
  if (ratio < 1.5) return "critical";
  if (ratio < 2.5) return "weak";
  if (ratio < 4) return "healthy";
  return "strong";
}

Deno.serve(withRequestId("analyze-pipeline-coverage", async (req, _ctx) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    // Rate limit por IP — endpoint de IA consome créditos (função não autentica chamador)
    const rl = enforceRateLimit(req, { name: "analyze-pipeline-coverage", limit: 20, windowSeconds: 60 });
    if (rl) return rl;

  try {
    // Bypass de RLS necessário: job agrega pipeline/metas de toda a equipe e
    // roda sem JWT de usuário (cron/manual); anon key não lê sales/sales_goals.
    const supabase = getServiceClient(
      "agrega pipeline e metas de toda a equipe para snapshots de cobertura",
    );

    // Probabilidade base por estágio — fonte única stage_probabilities
    const stageProbabilities = await getStageProbabilities(supabase);

    const body = await req.json().catch(() => ({}));
    const periodDays: number = Number(body.period_days ?? 90);
    const ownerFilter: string | null = body.owner_id ?? null;
    const targetRatio = 3.0;

    const periodEnd = new Date();
    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() + periodDays);

    // Pull open deals
    let dealsQuery = supabase
      .from("sales")
      .select("id, value, stage, salesperson_id, expected_close_date, source")
      .not("stage", "in", "(closed_won,closed_lost)");
    if (ownerFilter) dealsQuery = dealsQuery.eq("salesperson_id", ownerFilter);

    const { data: deals, error: dealsErr } = await dealsQuery.limit(10000);
    if (dealsErr) throw dealsErr;

    // Metas reais por dono: sales_goals do mês corrente; fallback =
    // salespeople.monthly_goal; fallback final = média das metas configuradas
    // do time (dono sem meta nenhuma usa a média). Sem constante inventada.
    const currentMonth = toBusinessMonthStart();
    let goalsQuery = supabase
      .from("sales_goals")
      .select("salesperson_id, goal_amount")
      .eq("month", currentMonth)
      .limit(1000);
    if (ownerFilter) goalsQuery = goalsQuery.eq("salesperson_id", ownerFilter);
    const { data: goals } = await goalsQuery;

    let spQuery = supabase
      .from("salespeople")
      .select("id, monthly_goal")
      .eq("is_active", true)
      .limit(500);
    if (ownerFilter) spQuery = spQuery.eq("id", ownerFilter);
    const { data: salespeople } = await spQuery;

    const goalByOwner = new Map<string, number>();
    (goals ?? []).forEach((g: { salesperson_id: string; goal_amount: number }) => {
      goalByOwner.set(g.salesperson_id, Number(g.goal_amount ?? 0));
    });
    (salespeople ?? []).forEach((sp: { id: string; monthly_goal: number | null }) => {
      const mg = Number(sp.monthly_goal ?? 0);
      if (mg > 0 && !goalByOwner.has(sp.id)) goalByOwner.set(sp.id, mg);
    });
    const configuredGoals = Array.from(goalByOwner.values()).filter((v) => v > 0);
    const avgTeamGoal = configuredGoals.length > 0
      ? configuredGoals.reduce((s, v) => s + v, 0) / configuredGoals.length
      : 0;
    const quotaFor = (owner: string | null): number =>
      (owner ? goalByOwner.get(owner) : undefined) ?? avgTeamGoal;

    // Aggregate by owner × stage
    type Bucket = { owner: string | null; stage: string; pipeline: number; weighted: number; count: number };
    const buckets = new Map<string, Bucket>();
    (deals ?? []).forEach((d: { salesperson_id: string | null; stage: string; value: number }) => {
      const stage = (d.stage || "lead").toLowerCase();
      const key = `${d.salesperson_id ?? "global"}::${stage}`;
      const prob = stageProbabilities[stage] ?? 0.1;
      const b = buckets.get(key) ?? { owner: d.salesperson_id, stage, pipeline: 0, weighted: 0, count: 0 };
      b.pipeline += Number(d.value || 0);
      b.weighted += Number(d.value || 0) * prob;
      b.count += 1;
      buckets.set(key, b);
    });

    const calculatedAt = new Date().toISOString();
    const snapshots: Array<Record<string, unknown>> = [];

    buckets.forEach((b) => {
      const quota = quotaFor(b.owner);
      const ratio = quota > 0 ? b.weighted / quota : 0;
      const gap = Math.max(quota * targetRatio - b.weighted, 0);
      snapshots.push({
        period_start: toBusinessDate(periodStart),
        period_end: toBusinessDate(periodEnd),
        owner_id: b.owner,
        stage: b.stage,
        segment: null,
        quota_amount: quota,
        pipeline_amount: b.pipeline,
        weighted_pipeline: b.weighted,
        coverage_ratio: Math.round(ratio * 100) / 100,
        target_ratio: targetRatio,
        health: classifyHealth(ratio),
        gap_to_target: Math.round(gap),
        deals_count: b.count,
        calculated_at: calculatedAt,
      });
    });

    // Insert snapshots
    let insertedSnapshots: Array<{ id: string; owner_id: string | null; stage: string; gap_to_target: number; health: string }> = [];
    if (snapshots.length > 0) {
      const { data: ins, error: insErr } = await supabase
        .from("pipeline_coverage_snapshots")
        .insert(snapshots)
        .select("id, owner_id, stage, gap_to_target, health");
      if (insErr) throw insErr;
      insertedSnapshots = ins ?? [];
    }

    // Build AI prompt with the worst gaps
    const worst = [...insertedSnapshots]
      .filter((s) => s.health === "critical" || s.health === "weak")
      .sort((a, b) => Number(b.gap_to_target) - Number(a.gap_to_target))
      .slice(0, 8);

    const recommendations: Array<Record<string, unknown>> = [];
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (LOVABLE_API_KEY && worst.length > 0) {
      try {
        const aiResp = await fetchWithTimeout(LOVABLE_AI_CHAT_COMPLETIONS_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              {
                role: "system",
                content:
                  "You are a sales operations strategist. Given pipeline coverage gaps, return 3-5 prioritized recommendations as JSON.",
              },
              {
                role: "user",
                content: `Gaps por owner/stage (em R$):\n${JSON.stringify(worst)}\n\nResponda em JSON com array \"recommendations\": [{title, action, priority (high|medium|low), expected_impact_amount (number), snapshot_id}].`,
              },
            ],
            tools: [
              {
                type: "function",
                function: {
                  name: "submit_recommendations",
                  description: "Submit prioritized pipeline coverage recommendations",
                  parameters: {
                    type: "object",
                    properties: {
                      recommendations: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            title: { type: "string" },
                            action: { type: "string" },
                            priority: { type: "string", enum: ["high", "medium", "low"] },
                            expected_impact_amount: { type: "number" },
                            snapshot_id: { type: "string" },
                          },
                          required: ["title", "action", "priority", "expected_impact_amount", "snapshot_id"],
                        },
                      },
                    },
                    required: ["recommendations"],
                  },
                },
              },
            ],
            tool_choice: { type: "function", function: { name: "submit_recommendations" } },
          }),
        });
        if (aiResp.ok) {
          const aiJson = await aiResp.json();
          const tc = aiJson.choices?.[0]?.message?.tool_calls?.[0];
          if (tc?.function?.arguments) {
            const parsed = JSON.parse(tc.function.arguments);
            (parsed.recommendations ?? []).forEach((r: Record<string, unknown>) => {
              const sid = String(r.snapshot_id);
              const exists = insertedSnapshots.find((s) => s.id === sid);
              if (exists) {
                recommendations.push({
                  snapshot_id: sid,
                  priority: r.priority,
                  title: r.title,
                  action: r.action,
                  expected_impact_amount: r.expected_impact_amount,
                  ai_generated: true,
                });
              }
            });
          }
        }
      } catch (aiErr) {
        console.error("AI recommendation error:", aiErr);
      }
    }

    if (recommendations.length > 0) {
      await supabase.from("pipeline_coverage_recommendations").insert(recommendations);
    }

    return new Response(
      JSON.stringify({
        snapshots_inserted: snapshots.length,
        recommendations_inserted: recommendations.length,
        calculated_at: calculatedAt,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("analyze-pipeline-coverage error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
}));
