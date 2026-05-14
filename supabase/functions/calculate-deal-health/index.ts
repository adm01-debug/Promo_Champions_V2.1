import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.4";



interface DealContext {
  sale: any;
  daysInStage: number;
  daysSinceActivity: number | null;
  activitiesCount: number;
  criticalMomentsHigh: number;
  pendingCoachingActions: number;
  competitorMentions: number;
  hasNextStep: boolean;
}

const tierFromScore = (score: number): string => {
  if (score >= 75) return "healthy";
  if (score >= 50) return "watch";
  if (score >= 25) return "at_risk";
  return "critical";
};

async function gatherContext(supabase: any, saleId: string): Promise<DealContext | null> {
  const { data: sale, error } = await supabase
    .from("sales")
    .select("*")
    .eq("id", saleId)
    .maybeSingle();
  if (error || !sale) return null;

  const updatedAt = new Date(sale.updated_at);
  const now = new Date();
  const daysInStage = Math.floor((now.getTime() - updatedAt.getTime()) / 86400000);

  const { data: lastActivity } = await supabase
    .from("activities")
    .select("created_at")
    .eq("sale_id", saleId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const daysSinceActivity = lastActivity
    ? Math.floor((now.getTime() - new Date(lastActivity.created_at).getTime()) / 86400000)
    : null;

  const { count: activitiesCount } = await supabase
    .from("activities")
    .select("id", { count: "exact", head: true })
    .eq("sale_id", saleId);

  const { data: recordings } = await supabase
    .from("call_recordings")
    .select("id")
    .eq("sale_id", saleId);
  const recordingIds = (recordings || []).map((r: any) => r.id);

  let criticalMomentsHigh = 0;
  let competitorMentions = 0;
  if (recordingIds.length) {
    const { count: cmCount } = await supabase
      .from("call_critical_moments")
      .select("id", { count: "exact", head: true })
      .in("recording_id", recordingIds)
      .in("severity", ["high", "critical"])
      .eq("status", "new");
    criticalMomentsHigh = cmCount || 0;

    const { count: compCount } = await supabase
      .from("competitor_mentions")
      .select("id", { count: "exact", head: true })
      .in("recording_id", recordingIds);
    competitorMentions = compCount || 0;
  }

  const { count: pendingCoaching } = await supabase
    .from("coaching_actions")
    .select("id", { count: "exact", head: true })
    .eq("sale_id", saleId)
    .eq("status", "pending");

  return {
    sale,
    daysInStage,
    daysSinceActivity,
    activitiesCount: activitiesCount || 0,
    criticalMomentsHigh,
    pendingCoachingActions: pendingCoaching || 0,
    competitorMentions,
    hasNextStep: !!sale.next_action,
  };
}

async function aiScore(ctx: DealContext): Promise<{ score: number; factors: any[]; recommended_actions: any[]; recommendation: string }> {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  const fallback = () => {
    let score = 60;
    const factors: any[] = [];
    const actions: any[] = [];

    if (ctx.daysSinceActivity === null) {
      score -= 20;
      factors.push({ key: "no_activity", label: "Nenhuma atividade registrada", impact: -20, weight: 1 });
      actions.push({ title: "Registrar primeira atividade", priority: "high" });
    } else if (ctx.daysSinceActivity > 14) {
      score -= 25;
      factors.push({ key: "stale_activity", label: `${ctx.daysSinceActivity} dias sem atividade`, impact: -25, weight: 1 });
      actions.push({ title: "Reengajar o cliente com call ou e-mail", priority: "high" });
    } else if (ctx.daysSinceActivity > 7) {
      score -= 10;
      factors.push({ key: "slow_activity", label: `${ctx.daysSinceActivity} dias sem atividade`, impact: -10, weight: 1 });
    } else {
      score += 10;
      factors.push({ key: "recent_activity", label: "Atividade recente", impact: 10, weight: 1 });
    }

    if (ctx.daysInStage > 30) {
      score -= 15;
      factors.push({ key: "stage_stagnation", label: `${ctx.daysInStage} dias no mesmo estágio`, impact: -15, weight: 1 });
      actions.push({ title: "Revisar estágio e mover o deal", priority: "medium" });
    }

    if (ctx.criticalMomentsHigh > 0) {
      score -= 15;
      factors.push({ key: "critical_moments", label: `${ctx.criticalMomentsHigh} momentos críticos abertos`, impact: -15, weight: 1 });
      actions.push({ title: "Tratar momentos críticos das calls", priority: "high" });
    }

    if (ctx.competitorMentions > 0) {
      score -= 10;
      factors.push({ key: "competitor", label: `${ctx.competitorMentions} menções a concorrentes`, impact: -10, weight: 1 });
    }

    if (!ctx.hasNextStep) {
      score -= 10;
      factors.push({ key: "no_next_step", label: "Sem próximo passo definido", impact: -10, weight: 1 });
      actions.push({ title: "Definir próximo passo claro", priority: "high" });
    } else {
      factors.push({ key: "has_next_step", label: "Próximo passo definido", impact: 5, weight: 1 });
      score += 5;
    }

    if (ctx.activitiesCount >= 5) {
      score += 10;
      factors.push({ key: "good_engagement", label: `${ctx.activitiesCount} atividades registradas`, impact: 10, weight: 1 });
    }

    score = Math.max(0, Math.min(100, score));
    return { score, factors, recommended_actions: actions, recommendation: "Análise heurística aplicada." };
  };

  if (!apiKey) return fallback();

  try {
    const prompt = `Avalie a saúde deste deal e atribua score 0-100.
Deal: ${ctx.sale.client_name} | Produto: ${ctx.sale.product_name} | Valor: ${ctx.sale.amount} | Estágio: ${ctx.sale.status}
Dias no estágio: ${ctx.daysInStage}
Dias desde última atividade: ${ctx.daysSinceActivity ?? "nunca"}
Atividades totais: ${ctx.activitiesCount}
Momentos críticos abertos: ${ctx.criticalMomentsHigh}
Ações de coaching pendentes: ${ctx.pendingCoachingActions}
Menções a concorrentes: ${ctx.competitorMentions}
Próximo passo definido: ${ctx.hasNextStep ? "sim" : "não"}`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Você é um analista sênior de vendas B2B. Responda SEMPRE via tool call." },
          { role: "user", content: prompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "score_deal",
            description: "Atribui score de saúde do deal",
            parameters: {
              type: "object",
              properties: {
                score: { type: "number" },
                recommendation: { type: "string" },
                factors: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      key: { type: "string" },
                      label: { type: "string" },
                      impact: { type: "number" },
                      weight: { type: "number" },
                    },
                    required: ["key", "label", "impact", "weight"],
                  },
                },
                recommended_actions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      priority: { type: "string", enum: ["low", "medium", "high"] },
                    },
                    required: ["title", "priority"],
                  },
                },
              },
              required: ["score", "factors", "recommended_actions", "recommendation"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "score_deal" } },
      }),
    });

    if (!resp.ok) return fallback();
    const data = await resp.json();
    const args = data?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) return fallback();
    const parsed = JSON.parse(args);
    return {
      score: Math.max(0, Math.min(100, Math.round(parsed.score))),
      factors: parsed.factors || [],
      recommended_actions: parsed.recommended_actions || [],
      recommendation: parsed.recommendation || "",
    };
  } catch (e) {
    console.error("AI scoring failed", e);
    return fallback();
  }
}

async function processOne(supabase: any, saleId: string) {
  const ctx = await gatherContext(supabase, saleId);
  if (!ctx) return { saleId, error: "sale_not_found" };

  const result = await aiScore(ctx);
  const tier = tierFromScore(result.score);
  const positive = result.factors.filter((f: any) => f.impact > 0);
  const negative = result.factors.filter((f: any) => f.impact < 0);

  const { error } = await supabase
    .from("deal_health_scores")
    .upsert({
      sale_id: saleId,
      owner_id: ctx.sale.salesperson_id,
      health_score: result.score,
      health_label: tier,
      tier,
      factors: result.factors,
      recommended_actions: result.recommended_actions,
      positive_factors: positive,
      negative_factors: negative,
      ai_recommendation: result.recommendation,
      last_activity_at: ctx.daysSinceActivity !== null
        ? new Date(Date.now() - ctx.daysSinceActivity * 86400000).toISOString()
        : null,
      days_in_stage: ctx.daysInStage,
      computed_at: new Date().toISOString(),
      calculated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: "sale_id" });

  if (error) {
    console.error("upsert error", error);
    return { saleId, error: error.message };
  }
  return { saleId, score: result.score, tier };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(url, key);

    const body = await req.json().catch(() => ({}));
    const { sale_id, batch } = body || {};

    if (sale_id) {
      const result = await processOne(supabase, sale_id);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (batch) {
      const authHeader = req.headers.get("Authorization") || "";
      const token = authHeader.replace("Bearer ", "");
      const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
        global: { headers: { Authorization: `Bearer ${token}` } },
      });
      const { data: { user } } = await userClient.auth.getUser();
      if (!user) {
        return new Response(JSON.stringify({ error: "unauthorized" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data: sales } = await supabase
        .from("sales")
        .select("id")
        .eq("salesperson_id", user.id)
        .neq("status", "closed")
        .neq("status", "lost")
        .limit(50);

      const results = [];
      for (const s of sales || []) {
        results.push(await processOne(supabase, s.id));
      }
      return new Response(JSON.stringify({ processed: results.length, results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "missing sale_id or batch" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
