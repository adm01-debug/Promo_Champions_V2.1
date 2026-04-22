import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

interface AISuggestion {
  title: string;
  description: string;
  rationale: string;
  priority: "high" | "medium" | "low";
  confidence: number;
  actionType: "call" | "meeting" | "email" | "follow_up" | "proposal" | "linkedin" | "whatsapp" | "other";
  channel?: "phone" | "email" | "linkedin" | "whatsapp" | "in_person" | null;
  suggestedDate: string | null;
  suggestedTime: string | null;
  expectedImpact: string;
  dealClient: string | null;
  dealId: string | null;
  category: "urgent" | "growth" | "retention" | "prospecting" | "admin";
}

interface AIResult {
  insight: string;
  summary: { totalDeals: number; atRisk: number; goalProgress: number };
  suggestions: AISuggestion[];
}

const fallback = (msg: string): AIResult => ({
  insight: msg,
  summary: { totalDeals: 0, atRisk: 0, goalProgress: 0 },
  suggestions: [],
});

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { salespersonId, limit = 5 } = await req.json();
    if (!salespersonId) {
      return new Response(JSON.stringify({ error: "salespersonId required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const now = Date.now();
    const todayIso = new Date().toISOString();

    // Parallel context fetch
    const [
      spRes,
      dealsRes,
      tasksRes,
      activitiesRes,
      outcomesRes,
      goalRes,
      monthlyRes,
      enrollmentsRes,
      accountsRes,
      leadScoresRes,
    ] = await Promise.all([
      supabase.from("salespeople").select("id, name, role").eq("id", salespersonId).maybeSingle(),
      supabase
        .from("sales")
        .select("id, client_name, product_name, amount, status, created_at, updated_at")
        .eq("salesperson_id", salespersonId)
        .neq("status", "completed")
        .neq("status", "lost")
        .order("updated_at", { ascending: true })
        .limit(25),
      supabase
        .from("tasks")
        .select("id, title, task_type, priority, due_date, status, sale_id")
        .eq("salesperson_id", salespersonId)
        .neq("status", "completed")
        .neq("status", "cancelled")
        .order("due_date", { ascending: true })
        .limit(15),
      supabase
        .from("activities")
        .select("id, activity_type, outcome, created_at, sale_id")
        .eq("salesperson_id", salespersonId)
        .order("created_at", { ascending: false })
        .limit(40),
      supabase
        .from("deal_outcomes")
        .select("outcome, reason, created_at")
        .eq("salesperson_id", salespersonId)
        .order("created_at", { ascending: false })
        .limit(8),
      supabase
        .from("sales_goals")
        .select("goal_amount, month")
        .eq("salesperson_id", salespersonId)
        .order("month", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("sales")
        .select("amount, updated_at")
        .eq("salesperson_id", salespersonId)
        .eq("status", "completed")
        .gte("updated_at", new Date(new Date().setDate(1)).toISOString()),
      supabase
        .from("sequence_enrollments")
        .select("id, status, current_step, sequence_id, contact_id, next_action_at")
        .eq("salesperson_id", salespersonId)
        .eq("status", "active")
        .limit(10)
        .then((r) => r, () => ({ data: [], error: null })),
      supabase
        .from("accounts")
        .select("id, name, health_status, account_score, tier, updated_at")
        .eq("owner_id", salespersonId)
        .in("health_status", ["at_risk", "critical"])
        .limit(10)
        .then((r) => r, () => ({ data: [], error: null })),
      supabase
        .from("lead_scores")
        .select("client_id, score, temperature, updated_at")
        .order("updated_at", { ascending: false })
        .limit(20)
        .then((r) => r, () => ({ data: [], error: null })),
    ]);

    const salesperson = spRes.data;
    if (!salesperson) {
      return new Response(JSON.stringify(fallback("Vendedor não encontrado.")), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const deals = dealsRes.data ?? [];
    const tasks = tasksRes.data ?? [];
    const activities = activitiesRes.data ?? [];
    const outcomes = outcomesRes.data ?? [];
    const enrollments = enrollmentsRes.data ?? [];
    const atRiskAccounts = accountsRes.data ?? [];
    const leadScores = leadScoresRes.data ?? [];

    const totalRevenue = (monthlyRes.data ?? []).reduce((s, r) => s + Number(r.amount || 0), 0);
    const goalAmount = Number(goalRes.data?.goal_amount || 0);
    const goalProgress = goalAmount > 0 ? (totalRevenue / goalAmount) * 100 : 0;

    // Compute sentiment from recent activity outcomes
    const recent = activities.slice(0, 10);
    const positive = recent.filter((a) => a.outcome === "positive" || a.outcome === "success").length;
    const negative = recent.filter((a) => a.outcome === "negative" || a.outcome === "failed").length;
    const sentiment = positive > negative ? "positive" : negative > positive ? "negative" : "neutral";

    const stagnant = deals.filter((d) => {
      const days = (now - new Date(d.updated_at).getTime()) / 86400000;
      return days > 7;
    });

    const last7d = activities.filter((a) => (now - new Date(a.created_at).getTime()) / 86400000 <= 7);

    const enrichedDeals = deals.map((d) => ({
      id: d.id,
      client: d.client_name,
      product: d.product_name,
      value: Number(d.amount || 0),
      status: d.status,
      daysSinceUpdate: Math.floor((now - new Date(d.updated_at).getTime()) / 86400000),
    }));

    const systemPrompt = `Você é um Sales Coach sênior B2B com expertise em metodologias SPIN, MEDDIC e Challenger Sale. Analise dados do vendedor e gere recomendações ALTAMENTE CONTEXTUALIZADAS via tool calling.

REGRAS DE OURO:
1. Cada sugestão deve ter rationale (POR QUÊ baseado em dados específicos), confidence (0-1), data sugerida
2. Priorize por: (a) deals estagnados de alto valor, (b) accounts at_risk, (c) goal gap, (d) cadências paradas
3. Inclua canal recomendado e impacto esperado em receita ou pipeline health
4. Categorize: urgent / growth / retention / prospecting / admin
5. Use português brasileiro, seja específico (cite nomes, valores, dias)
6. Datas sugeridas: ISO YYYY-MM-DD a partir de ${todayIso.slice(0, 10)}
7. Gere ${limit} sugestões priorizadas`;

    const userPrompt = `VENDEDOR: ${salesperson.name} (${salesperson.role || "vendedor"})

📊 PERFORMANCE
- Meta mensal: R$ ${goalAmount.toLocaleString("pt-BR")} | Realizado: R$ ${totalRevenue.toLocaleString("pt-BR")} (${goalProgress.toFixed(1)}%)
- Atividades últimos 7d: ${last7d.length} | Sentiment: ${sentiment}
- Deals ativos: ${deals.length} | Estagnados (>7d): ${stagnant.length}

💼 PIPELINE (top 15 por estagnação)
${enrichedDeals
  .slice(0, 15)
  .map(
    (d) =>
      `- [${d.id.slice(0, 8)}] ${d.client} • ${d.product} • R$ ${d.value.toLocaleString("pt-BR")} • ${d.status} • ${d.daysSinceUpdate}d sem update`,
  )
  .join("\n") || "(vazio)"}

⚠️ ACCOUNTS EM RISCO
${atRiskAccounts.map((a) => `- ${a.name} (${a.health_status}, score ${a.account_score}, tier ${a.tier})`).join("\n") || "(nenhum)"}

📋 TAREFAS PENDENTES (${tasks.length})
${tasks.slice(0, 8).map((t) => `- [${t.priority}] ${t.title} (${t.task_type}) → ${t.due_date}`).join("\n") || "(nenhuma)"}

📈 CADÊNCIAS ATIVAS: ${enrollments.length}

🎯 RESULTADOS RECENTES
${outcomes.map((o) => `- ${o.outcome.toUpperCase()}: ${o.reason || "-"}`).join("\n") || "(nenhum)"}

🔥 LEAD SCORES TOP
${leadScores
  .slice(0, 5)
  .map((l) => `- score ${l.score} (${l.temperature})`)
  .join("\n") || "(nenhum)"}

Gere ${limit} próximas melhores ações usando a tool generate_next_best_actions.`;

    const tools = [
      {
        type: "function",
        function: {
          name: "generate_next_best_actions",
          description: "Gera recomendações estratégicas contextualizadas para o vendedor",
          parameters: {
            type: "object",
            properties: {
              insight: { type: "string", description: "Insight executivo (1-2 frases) sobre o estado geral" },
              summary: {
                type: "object",
                properties: {
                  totalDeals: { type: "number" },
                  atRisk: { type: "number" },
                  goalProgress: { type: "number" },
                },
                required: ["totalDeals", "atRisk", "goalProgress"],
                additionalProperties: false,
              },
              suggestions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    rationale: { type: "string", description: "POR QUÊ esta ação, citando dados específicos" },
                    priority: { type: "string", enum: ["high", "medium", "low"] },
                    confidence: { type: "number", minimum: 0, maximum: 1 },
                    actionType: {
                      type: "string",
                      enum: ["call", "meeting", "email", "follow_up", "proposal", "linkedin", "whatsapp", "other"],
                    },
                    channel: {
                      type: ["string", "null"],
                      enum: ["phone", "email", "linkedin", "whatsapp", "in_person", null],
                    },
                    suggestedDate: { type: ["string", "null"], description: "YYYY-MM-DD" },
                    suggestedTime: { type: ["string", "null"], description: "HH:MM" },
                    expectedImpact: { type: "string", description: "Impacto esperado em pipeline ou receita" },
                    dealClient: { type: ["string", "null"] },
                    dealId: { type: ["string", "null"] },
                    category: {
                      type: "string",
                      enum: ["urgent", "growth", "retention", "prospecting", "admin"],
                    },
                  },
                  required: [
                    "title",
                    "description",
                    "rationale",
                    "priority",
                    "confidence",
                    "actionType",
                    "expectedImpact",
                    "category",
                  ],
                  additionalProperties: false,
                },
              },
            },
            required: ["insight", "summary", "suggestions"],
            additionalProperties: false,
          },
        },
      },
    ];

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools,
        tool_choice: { type: "function", function: { name: "generate_next_best_actions" } },
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns minutos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes no workspace Lovable AI." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI request failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      console.error("No tool call returned:", JSON.stringify(aiData));
      return new Response(JSON.stringify(fallback("IA não retornou recomendações estruturadas.")), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let result: AIResult;
    try {
      result = JSON.parse(toolCall.function.arguments);
    } catch (e) {
      console.error("Failed to parse tool args:", e);
      return new Response(JSON.stringify(fallback("Falha ao interpretar resposta da IA.")), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Normalize + enrich suggestions to guarantee complete payload to UI
    const inferCategory = (s: Partial<AISuggestion>): AISuggestion["category"] => {
      if (s.priority === "high") return "urgent";
      if (s.actionType === "email" || s.actionType === "linkedin") return "prospecting";
      if (s.actionType === "proposal" || s.actionType === "meeting") return "growth";
      return "growth";
    };

    result.suggestions = (result.suggestions || []).map((s) => {
      const matchedDeal = s.dealId
        ? deals.find((d) => d.id === s.dealId || d.id.startsWith(s.dealId!.slice(0, 8)))
        : s.dealClient
          ? deals.find((d) => d.client_name === s.dealClient)
          : null;
      return {
        ...s,
        rationale:
          s.rationale ||
          (matchedDeal
            ? `Deal "${matchedDeal.client_name}" • R$ ${Number(matchedDeal.amount || 0).toLocaleString("pt-BR")} • status ${matchedDeal.status}.`
            : "Baseado no contexto atual do pipeline."),
        confidence: Math.max(0, Math.min(1, Number(s.confidence) || 0.75)),
        category: s.category || inferCategory(s),
        channel: s.channel || (s.actionType === "call" ? "phone" : s.actionType === "email" ? "email" : null),
        suggestedDate: s.suggestedDate || todayIso.slice(0, 10),
        suggestedTime: s.suggestedTime || null,
        expectedImpact:
          s.expectedImpact ||
          (matchedDeal
            ? `Avançar oportunidade de R$ ${Number(matchedDeal.amount || 0).toLocaleString("pt-BR")}.`
            : "Fortalecer pipeline e velocidade comercial."),
        dealClient: s.dealClient || matchedDeal?.client_name || null,
        dealId: s.dealId || matchedDeal?.id || null,
      };
    });

    if (!result.summary) {
      result.summary = {
        totalDeals: deals.length,
        atRisk: stagnant.length + atRiskAccounts.length,
        goalProgress: Math.round(goalProgress),
      };
    } else {
      const gp = Number(result.summary.goalProgress);
      result.summary.goalProgress = gp > 0 && gp <= 1 ? Math.round(gp * 100) : Math.round(gp);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("next-best-action error:", error);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
