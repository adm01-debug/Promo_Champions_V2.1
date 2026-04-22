import { createClient } from "npm:@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SKILLS = ["discovery", "qualification", "objection_handling", "closing", "prospecting", "negotiation"] as const;

function levelFromScore(score: number): string {
  if (score >= 85) return "expert";
  if (score >= 65) return "advanced";
  if (score >= 40) return "intermediate";
  return "beginner";
}

function targetLevelFor(current: string): string {
  return current === "beginner" ? "intermediate" : current === "intermediate" ? "advanced" : "expert";
}

function severityWeight(s: string): number {
  return s === "critical" ? 30 : s === "high" ? 20 : s === "medium" ? 10 : 5;
}

interface OppRow { salesperson_id: string; skill_focus: string; severity: string; detected_at: string; }

async function aiPlan(apiKey: string, sellerName: string, skill: string, score: number, gaps: number): Promise<{ plan: string; milestones: { week: number; title: string }[]; weeks: number }> {
  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Você é coach sênior de vendas B2B. Responda apenas com a função fornecida." },
          { role: "user", content: `Vendedor ${sellerName} tem score ${score}/100 em "${skill}" com ${gaps} gaps recentes. Crie um plano de 4 milestones acionáveis e estimativa total de semanas.` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "development_plan",
            description: "Plano de desenvolvimento de skill",
            parameters: {
              type: "object",
              properties: {
                summary: { type: "string", description: "Resumo do plano em 1-2 frases" },
                milestones: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: { week: { type: "number" }, title: { type: "string" } },
                    required: ["week", "title"],
                  },
                  minItems: 4, maxItems: 4,
                },
                estimated_weeks: { type: "number" },
              },
              required: ["summary", "milestones", "estimated_weeks"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "development_plan" } },
      }),
    });
    if (!res.ok) throw new Error(`AI ${res.status}`);
    const data = await res.json();
    const args = JSON.parse(data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments ?? "{}");
    return { plan: args.summary ?? "", milestones: args.milestones ?? [], weeks: args.estimated_weeks ?? 4 };
  } catch (e) {
    console.error("aiPlan error", e);
    return {
      plan: `Foco em ${skill}: prática deliberada com role-plays semanais e revisão de gravações.`,
      milestones: [
        { week: 1, title: "Diagnóstico e benchmarks pessoais" },
        { week: 2, title: "Role-play com gestor (2x semana)" },
        { week: 3, title: "Aplicação em 5 deals reais com revisão" },
        { week: 4, title: "Avaliação de progresso e ajustes" },
      ],
      weeks: 4,
    };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const apiKey = Deno.env.get("LOVABLE_API_KEY")!;

    const { data: salespeople } = await supabase.from("salespeople").select("id, name").eq("active", true);
    if (!salespeople?.length) {
      return new Response(JSON.stringify({ assessments: 0, tracks: 0 }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const since90 = new Date(Date.now() - 90 * 86400e3).toISOString();
    const since180 = new Date(Date.now() - 180 * 86400e3).toISOString();
    const since30 = new Date(Date.now() - 30 * 86400e3).toISOString();

    const { data: opps180 } = await supabase
      .from("coaching_opportunities")
      .select("salesperson_id, skill_focus, severity, detected_at")
      .gte("detected_at", since180);

    const opps = (opps180 ?? []) as OppRow[];

    const assessmentRows: Record<string, unknown>[] = [];
    const trackTargets: { sp_id: string; sp_name: string; skill: string; score: number; gaps: number; current_level: string }[] = [];

    for (const sp of salespeople) {
      const spOpps = opps.filter((o) => o.salesperson_id === sp.id);
      const spOpps90 = spOpps.filter((o) => o.detected_at >= since90);
      const spOpps30 = spOpps.filter((o) => o.detected_at >= since30);
      const spOppsPrev = spOpps.filter((o) => o.detected_at < since90);

      const skillScores: { skill: string; score: number; gaps90: number; current_level: string }[] = [];

      for (const skill of SKILLS) {
        const cur = spOpps90.filter((o) => o.skill_focus === skill);
        const prev = spOppsPrev.filter((o) => o.skill_focus === skill);
        const cur30 = spOpps30.filter((o) => o.skill_focus === skill);

        const penalty = cur.reduce((s, o) => s + severityWeight(o.severity), 0);
        const score = Math.max(0, Math.min(100, 100 - penalty));
        const prevPenalty = prev.reduce((s, o) => s + severityWeight(o.severity), 0);
        const prevScore = Math.max(0, Math.min(100, 100 - prevPenalty));
        const trend = score > prevScore + 5 ? "improving" : score < prevScore - 5 ? "declining" : "stable";
        const level = levelFromScore(score);

        assessmentRows.push({
          salesperson_id: sp.id,
          skill,
          current_level: level,
          score,
          trend,
          gap_count_30d: cur30.length,
          gap_count_90d: cur.length,
          last_assessed_at: new Date().toISOString(),
          factors: { critical: cur.filter((o) => o.severity === "critical").length, high: cur.filter((o) => o.severity === "high").length, medium: cur.filter((o) => o.severity === "medium").length, low: cur.filter((o) => o.severity === "low").length },
        });
        skillScores.push({ skill, score, gaps90: cur.length, current_level: level });
      }

      // Top 3 lowest-score skills become development tracks
      const top3 = [...skillScores].sort((a, b) => a.score - b.score).slice(0, 3);
      top3.forEach((t) => trackTargets.push({ sp_id: sp.id, sp_name: sp.name, skill: t.skill, score: t.score, gaps: t.gaps90, current_level: t.current_level }));
    }

    // Upsert assessments
    if (assessmentRows.length) {
      const { error: aErr } = await supabase.from("skill_assessments").upsert(assessmentRows, { onConflict: "salesperson_id,skill" });
      if (aErr) throw aErr;
    }

    // Generate AI tracks (limit concurrency: sequential to avoid rate limits)
    const trackRows: Record<string, unknown>[] = [];
    for (let i = 0; i < trackTargets.length; i++) {
      const t = trackTargets[i];
      const ai = await aiPlan(apiKey, t.sp_name, t.skill, t.score, t.gaps);
      trackRows.push({
        salesperson_id: t.sp_id,
        skill: t.skill,
        priority: (i % 3) + 1,
        current_level: t.current_level,
        target_level: targetLevelFor(t.current_level),
        milestones: ai.milestones,
        estimated_weeks: ai.weeks,
        ai_plan: ai.plan,
      });
    }

    if (trackRows.length) {
      const { error: tErr } = await supabase.from("skill_development_tracks").upsert(trackRows, { onConflict: "salesperson_id,skill" });
      if (tErr) throw tErr;
    }

    return new Response(
      JSON.stringify({ assessments: assessmentRows.length, tracks: trackRows.length, salespeople: salespeople.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("analyze-skill-gaps error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
