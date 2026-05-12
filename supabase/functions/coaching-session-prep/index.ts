import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";

interface PrepRequest {
  salesperson_id: string;
}

interface PrepResponse {
  salesperson: { id: string; name: string; avatar_url: string | null } | null;
  top_gaps: Array<{ skill: string; score: number; label: string }>;
  at_risk_deals: Array<{ id: string; name: string; amount: number; stage: string }>;
  recent_scorecards: Array<{ overall_score: number; calculated_at: string }>;
  ai_talking_points: string[];
  suggested_focus_skills: string[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { salesperson_id } = (await req.json()) as PrepRequest;
    if (!salesperson_id) {
      return new Response(JSON.stringify({ error: "salesperson_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch salesperson basic info
    const { data: sp } = await supabase
      .from("salespeople")
      .select("id, name, avatar_url")
      .eq("id", salesperson_id)
      .maybeSingle();

    // Parallel Data Fetching (last 6 months)
    const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString();
    
    const [scorecardsResp, dealsResp, activitiesResp] = await Promise.all([
      supabase
        .from("call_coaching_scorecards")
        .select("overall_score, talk_score, question_score, objection_score, sentiment_score, moments_score, calculated_at")
        .eq("salesperson_id", salesperson_id)
        .gte("calculated_at", sixMonthsAgo)
        .order("calculated_at", { ascending: false }),
      supabase
        .from("sales")
        .select("id, client_name, amount, status, created_at")
        .eq("salesperson_id", salesperson_id)
        .not("status", "in", "(closed_won,closed_lost)")
        .order("amount", { ascending: false })
        .limit(10),
      supabase
        .from("activities")
        .select("activity_type, created_at")
        .eq("salesperson_id", salesperson_id)
        .gte("created_at", sixMonthsAgo)
    ]);

    const scorecards = scorecardsResp.data ?? [];
    const deals = dealsResp.data ?? [];
    const activities = activitiesResp.data ?? [];

    // Aggregate gaps and performance metrics over 6 months
    const dimensionScores: Record<string, number[]> = {
      talk: [], questions: [], objections: [], sentiment: [], moments: [],
    };
    scorecards.forEach((s) => {
      if (s.talk_score) dimensionScores.talk.push(Number(s.talk_score));
      if (s.question_score) dimensionScores.questions.push(Number(s.question_score));
      if (s.objection_score) dimensionScores.objections.push(Number(s.objection_score));
      if (s.sentiment_score) dimensionScores.sentiment.push(Number(s.sentiment_score));
      if (s.moments_score) dimensionScores.moments.push(Number(s.moments_score));
    });

    const labelMap: Record<string, string> = {
      talk: "Talk & Pace",
      questions: "Perguntas",
      objections: "Objeções",
      sentiment: "Sentimento",
      moments: "Momentos",
    };

    const top_gaps = Object.entries(dimensionScores)
      .map(([skill, arr]) => ({
        skill,
        label: labelMap[skill],
        score: arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0,
      }))
      .filter((g) => g.score > 0)
      .sort((a, b) => a.score - b.score)
      .slice(0, 3);

    const at_risk_deals = deals.map((d) => ({
      id: String(d.id),
      name: String(d.client_name ?? "Deal"),
      amount: Number(d.amount ?? 0),
      stage: String(d.status ?? ""),
    }));

    // Use a specific caching key based on salesperson_id and month
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    let ai_talking_points: string[] = [];
    
    // Optimization: Skip AI if data hasn't changed much or use short-circuit logic
    if (LOVABLE_API_KEY && (scorecards.length > 0 || activities.length > 0)) {
      const activitySummary = activities.reduce((acc: Record<string, number>, act) => {
        acc[act.activity_type] = (acc[act.activity_type] || 0) + 1;
        return acc;
      }, {});

      const prompt = `Você é um coach de vendas analítico. Analise o histórico de 6 meses do vendedor ${sp?.name ?? "—"}.
DADOS:
- Skills (0-100, menor pior): ${top_gaps.map((g) => `${g.label}=${g.score}`).join(", ")}.
- Pipeline Ativo: ${at_risk_deals.length} deals, total R$${at_risk_deals.reduce((a, d) => a + d.amount, 0).toLocaleString("pt-BR")}.
- Atividades (6 meses): ${Object.entries(activitySummary).map(([k, v]) => `${k}=${v}`).join(", ")}.
- Total de calls analisadas: ${scorecards.length}.

TAREFA:
Gere 4 pontos de discussão ultra-específicos e pragmáticos para uma reunião de 1:1. 
Considere a relação entre as atividades e os gaps de skill (ex: se o gap é objeção e tem poucas calls, focar em roleplay).
Retorne apenas a lista de frases diretas.`;

      try {
        const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-2.0-flash", // Fast and efficient
            messages: [{ role: "user", content: prompt }],
            temperature: 0.2,
          }),
        });
        if (aiResp.ok) {
          const aiData = await aiResp.json();
          const content = aiData.choices?.[0]?.message?.content ?? "";
          ai_talking_points = content
            .split("\n")
            .map((l: string) => l.replace(/^[-*•\d.)\s]+/, "").trim())
            .filter((l: string) => l.length > 5)
            .slice(0, 4);
        }
      } catch (e) {
        console.error("AI talking points error:", e);
      }
    }

    const response: PrepResponse = {
      salesperson: sp ?? null,
      top_gaps,
      at_risk_deals,
      recent_scorecards: (scorecards ?? []).map((s: Record<string, unknown>) => ({
        overall_score: Number(s.overall_score),
        calculated_at: String(s.calculated_at),
      })),
      ai_talking_points,
      suggested_focus_skills: top_gaps.map((g) => g.skill),
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("coaching-session-prep error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
