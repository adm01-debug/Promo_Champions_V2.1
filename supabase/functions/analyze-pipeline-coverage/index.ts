import { createClient } from "npm:@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const STAGE_PROBABILITY: Record<string, number> = {
  lead: 0.05,
  prospecting: 0.1,
  qualified: 0.25,
  proposal: 0.5,
  negotiation: 0.75,
  closed_won: 1.0,
  closed_lost: 0,
};

function classifyHealth(ratio: number): "critical" | "weak" | "healthy" | "strong" {
  if (ratio < 1.5) return "critical";
  if (ratio < 2.5) return "weak";
  if (ratio < 4) return "healthy";
  return "strong";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

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

    const { data: deals, error: dealsErr } = await dealsQuery;
    if (dealsErr) throw dealsErr;

    // Pull closed_won for quota proxy (last period)
    const histStart = new Date();
    histStart.setDate(histStart.getDate() - periodDays);
    let wonQuery = supabase
      .from("sales")
      .select("value, salesperson_id")
      .eq("stage", "closed_won")
      .gte("created_at", histStart.toISOString());
    if (ownerFilter) wonQuery = wonQuery.eq("salesperson_id", ownerFilter);
    const { data: won } = await wonQuery;

    // Quota = 1.2x last period closed_won, min 50000 per owner
    const quotaByOwner = new Map<string, number>();
    (won ?? []).forEach((w: { salesperson_id: string | null; value: number }) => {
      const k = w.salesperson_id ?? "global";
      quotaByOwner.set(k, (quotaByOwner.get(k) ?? 0) + Number(w.value || 0));
    });

    // Aggregate by owner × stage
    type Bucket = { owner: string | null; stage: string; pipeline: number; weighted: number; count: number };
    const buckets = new Map<string, Bucket>();
    (deals ?? []).forEach((d: { salesperson_id: string | null; stage: string; value: number }) => {
      const stage = (d.stage || "lead").toLowerCase();
      const key = `${d.salesperson_id ?? "global"}::${stage}`;
      const prob = STAGE_PROBABILITY[stage] ?? 0.1;
      const b = buckets.get(key) ?? { owner: d.salesperson_id, stage, pipeline: 0, weighted: 0, count: 0 };
      b.pipeline += Number(d.value || 0);
      b.weighted += Number(d.value || 0) * prob;
      b.count += 1;
      buckets.set(key, b);
    });

    const calculatedAt = new Date().toISOString();
    const snapshots: Array<Record<string, unknown>> = [];

    buckets.forEach((b) => {
      const quota = Math.max((quotaByOwner.get(b.owner ?? "global") ?? 0) * 1.2, 50000);
      const ratio = quota > 0 ? b.weighted / quota : 0;
      const gap = Math.max(quota * targetRatio - b.weighted, 0);
      snapshots.push({
        period_start: periodStart.toISOString().slice(0, 10),
        period_end: periodEnd.toISOString().slice(0, 10),
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
        const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
});
