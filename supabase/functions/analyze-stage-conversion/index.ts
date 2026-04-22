import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";

const admin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const STAGE_ORDER = ["lead", "prospecting", "qualified", "proposal", "negotiation", "closed_won"];

function nextStage(stage: string): string | null {
  const i = STAGE_ORDER.indexOf(stage);
  if (i < 0 || i >= STAGE_ORDER.length - 1) return null;
  return STAGE_ORDER[i + 1];
}

function severityFor(rate: number): "low" | "medium" | "high" | "critical" {
  if (rate >= 60) return "low";
  if (rate >= 40) return "medium";
  if (rate >= 20) return "high";
  return "critical";
}

async function callAi(stage: string, rate: number, lossReasons: { reason: string; count: number }[]) {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) return null;
  const tools = [{
    type: "function",
    function: {
      name: "report_bottleneck",
      description: "Diagnose stage bottleneck and suggest tactical fixes.",
      parameters: {
        type: "object",
        properties: {
          ai_summary: { type: "string", description: "1-2 sentence diagnosis in Brazilian Portuguese" },
          recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                action: { type: "string" },
                impact: { type: "string", enum: ["low", "medium", "high"] },
              },
              required: ["title", "action", "impact"],
            },
          },
        },
        required: ["ai_summary", "recommendations"],
      },
    },
  }];
  try {
    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Você é um coach de vendas B2B sênior. Responda em português do Brasil." },
          {
            role: "user",
            content: `Estágio: ${stage}\nTaxa de conversão: ${rate.toFixed(1)}%\nTop motivos de perda: ${
              lossReasons.map((r) => `${r.reason} (${r.count})`).join(", ") || "n/a"
            }\nGere diagnóstico curto + 3-5 ações táticas para destravar este gargalo.`,
          },
        ],
        tools,
        tool_choice: { type: "function", function: { name: "report_bottleneck" } },
      }),
    });
    if (!resp.ok) return null;
    const json = await resp.json();
    const args = json.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    return args ? JSON.parse(args) : null;
  } catch (e) {
    console.error("AI call failed", e);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const days = Math.min(365, Math.max(7, Number(body.days) || 90));
    const ownerId: string | null = body.owner_id ?? null;

    const since = new Date(Date.now() - days * 86400000).toISOString();
    const periodStart = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
    const periodEnd = new Date().toISOString().slice(0, 10);

    // Fetch history
    const { data: history, error: hErr } = await admin
      .from("deal_stage_history")
      .select("sale_id, stage, entered_at, exited_at")
      .gte("entered_at", since)
      .limit(50000);
    if (hErr) throw hErr;

    // Owner filter via sales
    const saleIds = [...new Set((history ?? []).map((h: any) => h.sale_id).filter(Boolean))];
    const ownerBySale = new Map<string, string | null>();
    const lostReasonBySale = new Map<string, string | null>();
    if (saleIds.length) {
      const { data: sales } = await admin
        .from("sales")
        .select("id, status, lost_reason, salesperson_id, salespeople:salesperson_id(auth_user_id)")
        .in("id", saleIds);
      for (const s of sales ?? []) {
        ownerBySale.set(s.id, (s as any).salespeople?.auth_user_id ?? null);
        lostReasonBySale.set(s.id, (s as any).lost_reason ?? null);
      }
    }

    // Group transitions by from_stage
    type Bucket = { entered: Set<string>; converted: Set<string>; lost: Set<string>; days: number[] };
    const buckets = new Map<string, Bucket>();
    const get = (k: string) => {
      if (!buckets.has(k)) buckets.set(k, { entered: new Set(), converted: new Set(), lost: new Set(), days: [] });
      return buckets.get(k)!;
    };

    for (const row of history ?? []) {
      if (ownerId && ownerBySale.get(row.sale_id) !== ownerId) continue;
      const from = (row.stage || "").toLowerCase();
      if (!STAGE_ORDER.includes(from)) continue;
      const b = get(from);
      b.entered.add(row.sale_id);
      if (row.exited_at) {
        const d = (new Date(row.exited_at).getTime() - new Date(row.entered_at).getTime()) / 86400000;
        if (d >= 0) b.days.push(d);
        // Did the sale advance to a later stage?
        const advanced = (history ?? []).some((h: any) =>
          h.sale_id === row.sale_id &&
          STAGE_ORDER.indexOf((h.stage || "").toLowerCase()) > STAGE_ORDER.indexOf(from)
        );
        if (advanced) b.converted.add(row.sale_id);
        else if (lostReasonBySale.get(row.sale_id)) b.lost.add(row.sale_id);
      }
    }

    // Build conversion rows + insights
    let upsertedMetrics = 0;
    let upsertedInsights = 0;

    for (const [from, b] of buckets) {
      const to = nextStage(from);
      if (!to) continue;
      const entered = b.entered.size;
      const converted = b.converted.size;
      const lost = b.lost.size;
      const rate = entered ? (converted / entered) * 100 : 0;
      const avgDays = b.days.length ? b.days.reduce((s, n) => s + n, 0) / b.days.length : 0;

      const metric = {
        from_stage: from,
        to_stage: to,
        owner_id: ownerId,
        entered_count: entered,
        converted_count: converted,
        lost_count: lost,
        conversion_rate: Number(rate.toFixed(2)),
        avg_transition_days: Number(avgDays.toFixed(2)),
        period_start: periodStart,
        period_end: periodEnd,
        calculated_at: new Date().toISOString(),
      };
      const { error: mErr } = await admin
        .from("stage_conversion_metrics")
        .upsert(metric, { onConflict: "from_stage,to_stage,owner_id,period_start" });
      if (!mErr) upsertedMetrics++;

      // Loss reasons aggregation for this stage
      const reasonCounts = new Map<string, number>();
      for (const sid of b.lost) {
        const r = lostReasonBySale.get(sid);
        if (r) reasonCounts.set(r, (reasonCounts.get(r) || 0) + 1);
      }
      const topLoss = [...reasonCounts.entries()]
        .sort((a, b) => b[1] - a[1]).slice(0, 5)
        .map(([reason, count]) => ({ reason, count }));

      const sev = severityFor(rate);
      const ai = await callAi(from, rate, topLoss);
      const insight = {
        stage: from,
        owner_id: ownerId,
        severity: sev,
        conversion_rate: Number(rate.toFixed(2)),
        top_loss_reasons: topLoss,
        recommendations: ai?.recommendations ?? [],
        ai_summary: ai?.ai_summary ?? `Conversão de ${rate.toFixed(0)}% em ${from}.`,
        calculated_at: new Date().toISOString(),
      };
      const { error: iErr } = await admin
        .from("stage_bottleneck_insights")
        .upsert(insight, { onConflict: "stage,owner_id" });
      if (!iErr) upsertedInsights++;
    }

    return new Response(
      JSON.stringify({ ok: true, metrics: upsertedMetrics, insights: upsertedInsights, days, owner_id: ownerId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("analyze-stage-conversion error", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
