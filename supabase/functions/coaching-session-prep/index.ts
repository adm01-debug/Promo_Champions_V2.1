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

    // Recent scorecards (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data: scorecards } = await supabase
      .from("call_coaching_scorecards")
      .select("overall_score, talk_score, question_score, objection_score, sentiment_score, moments_score, top_gaps, calculated_at")
      .eq("salesperson_id", salesperson_id)
      .gte("calculated_at", thirtyDaysAgo)
      .order("calculated_at", { ascending: false })
      .limit(10);

    // Aggregate gaps
    const dimensionScores: Record<string, number[]> = {
      talk: [], questions: [], objections: [], sentiment: [], moments: [],
    };
    (scorecards ?? []).forEach((s: Record<string, number | string | unknown>) => {
      dimensionScores.talk.push(Number(s.talk_score));
      dimensionScores.questions.push(Number(s.question_score));
      dimensionScores.objections.push(Number(s.objection_score));
      dimensionScores.sentiment.push(Number(s.sentiment_score));
      dimensionScores.moments.push(Number(s.moments_score));
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

    // At-risk deals: open deals owned by salesperson with high value
    const { data: deals } = await supabase
      .from("sales")
      .select("id, client_name, amount, stage")
      .eq("salesperson_id", salesperson_id)
      .not("stage", "in", "(closed_won,closed_lost)")
      .order("amount", { ascending: false })
      .limit(5);

    const at_risk_deals = (deals ?? []).map((d: Record<string, unknown>) => ({
      id: String(d.id),
      name: String(d.client_name ?? "Deal"),
      amount: Number(d.amount ?? 0),
      stage: String(d.stage ?? ""),
    }));

    // AI-generated talking points via Lovable AI
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    let ai_talking_points: string[] = [];
    if (LOVABLE_API_KEY && top_gaps.length > 0) {
      const prompt = `Você é um coach de vendas. Vendedor: ${sp?.name ?? "—"}. 
Principais gaps (score 0-100, menor = pior): ${top_gaps.map((g) => `${g.label}=${g.score}`).join(", ")}.
${at_risk_deals.length} deals em aberto com receita total R$${at_risk_deals.reduce((a, d) => a + d.amount, 0).toLocaleString("pt-BR")}.
Gere 4 talking points específicos e acionáveis (máx 1 frase cada) para uma sessão 1:1 de 30min. Retorne apenas a lista, sem numeração.`;

      try {
        const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [{ role: "user", content: prompt }],
          }),
        });
        if (aiResp.ok) {
          const aiData = await aiResp.json();
          const content = aiData.choices?.[0]?.message?.content ?? "";
          ai_talking_points = content
            .split("\n")
            .map((l: string) => l.replace(/^[-*•\d.)\s]+/, "").trim())
            .filter((l: string) => l.length > 10)
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
