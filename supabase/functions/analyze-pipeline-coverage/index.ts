import { getCorsHeaders } from "../_shared/cors.ts";
import { withRequestId } from "../_shared/request-id.ts";
import { fetchWithTimeout } from "../_shared/fetch-with-timeout.ts";
import { enforceRateLimit } from "../_shared/rate-limit.ts";
import { getStageProbabilities } from "../_shared/stage-probabilities.ts";
import { LOVABLE_AI_CHAT_COMPLETIONS_URL } from "../_shared/ai-gateway.ts";
import { toBusinessDate, toBusinessMonthStart } from "../_shared/business-date.ts";
import { getServiceClient, getUserClient, UnauthorizedError } from "../_shared/auth-client.ts";
import { isAuthorizedCronRequest } from "../_shared/cron-request-auth.ts";
import { OPEN_SALE_STATUSES } from "../_shared/sale-statuses.ts";

function classifyHealth(ratio: number): "critical" | "weak" | "healthy" | "strong" {
  if (ratio < 1.5) return "critical";
  if (ratio < 2.5) return "weak";
  if (ratio < 4) return "healthy";
  return "strong";
}

Deno.serve(withRequestId("analyze-pipeline-coverage", async (req, _ctx) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    // Rate limit por IP — endpoint de IA consome créditos
    const rl = enforceRateLimit(req, { name: "analyze-pipeline-coverage", limit: 20, windowSeconds: 60 });
    if (rl) return rl;

  try {
    // Bypass de RLS necessário: job agrega pipeline/metas de toda a equipe;
    // anon key não lê sales/sales_goals e o insert de snapshots exigiria RLS.
    const supabase = getServiceClient(
      "agrega pipeline e metas de toda a equipe para snapshots de cobertura",
    );

    // Autoriza job interno (service_role ou X-Cron-Secret do pg_cron) ou,
    // no disparo manual pelo app, usuário com papel admin/manager — chamador
    // anônimo não pode gravar snapshots gerenciais nem gastar créditos de IA.
    let authorizedByCron = false;
    try {
      authorizedByCron = await isAuthorizedCronRequest(req, async () => {
        const { data, error } = await supabase
          .from("_internal_secrets")
          .select("value")
          .eq("key", "coaching_cron_secret")
          .maybeSingle();
        if (error) throw error;
        return (data as { value?: string | null } | null)?.value;
      });
    } catch (error) {
      console.error("analyze-pipeline-coverage cron authorization unavailable:", error);
      return new Response(JSON.stringify({ error: "authorization_unavailable" }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!authorizedByCron) {
      let caller;
      try {
        caller = await getUserClient(req);
      } catch (error) {
        if (error instanceof UnauthorizedError) {
          return new Response(JSON.stringify({ error: "unauthorized" }), {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        console.error("analyze-pipeline-coverage auth client failed:", error);
        return new Response(JSON.stringify({ error: "authorization_unavailable" }), {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data: isPrivileged, error: roleError } = await caller.client.rpc(
        "is_admin_or_manager" as never,
        { _user_id: caller.userId } as never,
      );
      if (roleError) {
        console.error("analyze-pipeline-coverage role check failed:", roleError);
        return new Response(JSON.stringify({ error: "authorization_unavailable" }), {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!isPrivileged) {
        return new Response(JSON.stringify({ error: "forbidden" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Probabilidade base por estágio — fonte única stage_probabilities
    const stageProbabilities = await getStageProbabilities(supabase);

    const body = await req.json().catch(() => ({}));
    const periodDays: number = Number(body.period_days ?? 90);
    const ownerFilter: string | null = body.owner_id ?? null;
    const targetRatio = 3.0;

    const periodEnd = new Date();
    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() + periodDays);

    // Pull open deals — `value`/`expected_close_date` NÃO existem em sales
    // (a coluna monetária é `amount`) e `closed_won`/`closed_lost` não fazem
    // parte do CHECK de status: filtro por status canônico ABERTO (também
    // exclui NULL de forma explícita — NOT IN excluía por avaliação NULL).
    let dealsQuery = supabase
      .from("sales")
      .select("id, amount, status, salesperson_id")
      .in("status", [...OPEN_SALE_STATUSES]);
    if (ownerFilter) dealsQuery = dealsQuery.eq("salesperson_id", ownerFilter);

    const { data: deals, error: dealsErr } = await dealsQuery.limit(10000);
    if (dealsErr) throw dealsErr;

    // Metas reais por dono = goal_amount mais recente de sales_goals
    // (mês ≤ corrente — cobre dono sem meta lançada no mês corrente).
    // Fallback = média das metas configuradas do time. Sem constante inventada.
    let goalsQuery = supabase
      .from("sales_goals")
      .select("salesperson_id, goal_amount, month")
      .lte("month", toBusinessMonthStart())
      .order("month", { ascending: false })
      .limit(5000);
    if (ownerFilter) goalsQuery = goalsQuery.eq("salesperson_id", ownerFilter);
    const { data: goals, error: goalsErr } = await goalsQuery;
    if (goalsErr) throw goalsErr;

    const goalByOwner = new Map<string, number>();
    for (const g of goals ?? []) {
      if (!goalByOwner.has(g.salesperson_id)) {
        goalByOwner.set(g.salesperson_id, Number(g.goal_amount ?? 0));
      }
    }
    const configuredGoals = Array.from(goalByOwner.values()).filter((v) => v > 0);
    const avgTeamGoal = configuredGoals.length > 0
      ? configuredGoals.reduce((s, v) => s + v, 0) / configuredGoals.length
      : 0;
    const quotaFor = (owner: string | null): number =>
      (owner ? goalByOwner.get(owner) : undefined) ?? avgTeamGoal;

    // Aggregate by owner × stage
    type Bucket = { owner: string | null; stage: string; pipeline: number; weighted: number; count: number };
    const buckets = new Map<string, Bucket>();
    (deals ?? []).forEach((d: { salesperson_id: string | null; status: string | null; amount: number }) => {
      // Chave de estágio/probabilidade = status canônico (stage é label pt-BR
      // e frequentemente NULL — não casa com stage_probabilities).
      const stage = (d.status || "lead").toLowerCase();
      const key = `${d.salesperson_id ?? "global"}::${stage}`;
      const prob = stageProbabilities[stage] ?? 0.1;
      const b = buckets.get(key) ?? { owner: d.salesperson_id, stage, pipeline: 0, weighted: 0, count: 0 };
      b.pipeline += Number(d.amount || 0);
      b.weighted += Number(d.amount || 0) * prob;
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
