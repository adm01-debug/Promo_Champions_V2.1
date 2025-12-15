import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, salespersonId, conversationHistory = [] } = await req.json();

    if (!message) {
      throw new Error("Message is required");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch salesperson context if provided
    let salespersonContext = "";
    if (salespersonId) {
      // Get salesperson info
      const { data: salesperson } = await supabase
        .from("salespeople")
        .select("*")
        .eq("id", salespersonId)
        .single();

      // Get current month goals
      const currentMonth = new Date().toISOString().slice(0, 7) + "-01";
      const { data: goals } = await supabase
        .from("sales_goals")
        .select("*")
        .eq("salesperson_id", salespersonId)
        .eq("month", currentMonth)
        .single();

      // Get current month sales
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const { data: sales } = await supabase
        .from("sales")
        .select("amount, status")
        .eq("salesperson_id", salespersonId)
        .gte("created_at", startOfMonth.toISOString());

      const totalSales = sales?.filter(s => s.status === "completed").reduce((sum, s) => sum + Number(s.amount), 0) || 0;
      const pendingDeals = sales?.filter(s => s.status !== "completed" && s.status !== "cancelled").length || 0;

      // Get recent deal outcomes
      const { data: outcomes } = await supabase
        .from("deal_outcomes")
        .select("outcome, reason")
        .eq("salesperson_id", salespersonId)
        .order("created_at", { ascending: false })
        .limit(10);

      const wins = outcomes?.filter(o => o.outcome === "won").length || 0;
      const losses = outcomes?.filter(o => o.outcome === "lost").length || 0;
      const winRate = outcomes?.length ? Math.round((wins / outcomes.length) * 100) : 0;

      // Get activity goals progress
      const today = new Date().toISOString().split("T")[0];
      const { data: activities } = await supabase
        .from("activities")
        .select("activity_type")
        .eq("salesperson_id", salespersonId)
        .gte("created_at", today);

      const activityCounts = {
        call: activities?.filter(a => a.activity_type === "call").length || 0,
        email: activities?.filter(a => a.activity_type === "email").length || 0,
        meeting: activities?.filter(a => a.activity_type === "meeting").length || 0,
      };

      // Get objections library for reference
      const { data: objections } = await supabase
        .from("objections_library")
        .select("objection, response, category")
        .order("effectiveness_score", { ascending: false })
        .limit(10);

      salespersonContext = `
CONTEXTO DO VENDEDOR:
- Nome: ${salesperson?.name || "Vendedor"}
- Função: ${salesperson?.role === "sdr" ? "SDR" : salesperson?.role === "closer" ? "Closer" : "Híbrido"}
- Taxa de Comissão: ${salesperson?.commission_rate}%

MÉTRICAS DO MÊS:
- Vendas Fechadas: R$ ${totalSales.toLocaleString("pt-BR")}
- Meta: R$ ${goals?.goal_amount?.toLocaleString("pt-BR") || "Não definida"}
- Progresso: ${goals?.goal_amount ? Math.round((totalSales / goals.goal_amount) * 100) : 0}%
- Deals em Andamento: ${pendingDeals}

PERFORMANCE RECENTE:
- Win Rate (últimos 10 deals): ${winRate}%
- Vitórias: ${wins}, Perdas: ${losses}
${outcomes?.filter(o => o.outcome === "lost").slice(0, 3).map(o => `- Motivo de perda: ${o.reason}`).join("\n") || ""}

ATIVIDADES DE HOJE:
- Ligações: ${activityCounts.call}
- Emails: ${activityCounts.email}
- Reuniões: ${activityCounts.meeting}

OBJEÇÕES COMUNS E RESPOSTAS:
${objections?.slice(0, 5).map(o => `- "${o.objection}": ${o.response.substring(0, 100)}...`).join("\n") || "Nenhuma objeção cadastrada"}
`;
    }

    const systemPrompt = `Você é um Coach de Vendas IA especializado e motivador. Seu papel é:

1. TIRAR DÚVIDAS sobre técnicas de vendas, negociação, qualificação de leads, fechamento
2. DAR DICAS práticas e acionáveis baseadas no contexto do vendedor
3. MOTIVAR o vendedor com frases de incentivo e reconhecimento de conquistas
4. AJUDAR com objeções comuns e como superá-las
5. SUGERIR próximos passos baseados na situação atual

${salespersonContext}

DIRETRIZES:
- Seja direto, prático e motivador
- Use exemplos concretos quando possível
- Se o vendedor está abaixo da meta, seja encorajador mas realista
- Se está acima, celebre e mantenha o momentum
- Baseie suas sugestões nos dados reais do vendedor quando disponíveis
- Use linguagem informal mas profissional
- Responda em português brasileiro
- Mantenha respostas concisas (máximo 3 parágrafos para dúvidas simples)

ÁREAS DE EXPERTISE:
- SPIN Selling, BANT, MEDDIC
- Negociação e objeções
- Cold calling e prospecção
- Follow-up e cadências
- Técnicas de fechamento
- Gestão de pipeline
- Motivação e mindset de vendas`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: "user", content: message },
    ];

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits to your workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to get AI response");
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Error in sales-assistant-chat:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
