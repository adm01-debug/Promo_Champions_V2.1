import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { validateString, validateUUID, validateArray, collectErrors, validationErrorResponse } from "../_shared/validation.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { message, salespersonId, conversationHistory = [], dealContext, aiAssistantName, salespersonName } = body;

    // Input validation
    const errors = collectErrors([
      validateString(message, "message", { required: true, maxLength: 5000 }),
      validateUUID(salespersonId, "salespersonId"),
      validateArray(conversationHistory, "conversationHistory", { maxLength: 50 }),
      validateString(aiAssistantName, "aiAssistantName", { maxLength: 100 }),
      validateString(salespersonName, "salespersonName", { maxLength: 100 }),
    ]);
    if (errors.length > 0) {
      return validationErrorResponse(errors, corsHeaders);
    }

    // Use custom AI name if provided, otherwise default
    const assistantName = aiAssistantName || "Coach IA";
    const userName = salespersonName || "Vendedor";

    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch salesperson context if provided
    let salespersonContext = "";
    let dealContextStr = "";
    let performanceSuggestions = "";
    
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
        .select("id, amount, status, client_name, product_name, category, source, created_at, updated_at")
        .eq("salesperson_id", salespersonId)
        .gte("created_at", startOfMonth.toISOString());

      const totalSales = sales?.filter(s => s.status === "completed").reduce((sum, s) => sum + Number(s.amount), 0) || 0;
      const pendingDeals = sales?.filter(s => s.status !== "completed" && s.status !== "cancelled") || [];
      const goalAmount = goals?.goal_amount || 0;
      const progressPercent = goalAmount ? Math.round((totalSales / goalAmount) * 100) : 0;

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
        .select("activity_type, outcome")
        .eq("salesperson_id", salespersonId)
        .gte("created_at", today);

      const { data: activityGoals } = await supabase
        .from("activity_goals")
        .select("*")
        .eq("salesperson_id", salespersonId)
        .single();

      const activityCounts = {
        call: activities?.filter(a => a.activity_type === "call").length || 0,
        email: activities?.filter(a => a.activity_type === "email").length || 0,
        meeting: activities?.filter(a => a.activity_type === "meeting").length || 0,
        linkedin: activities?.filter(a => a.activity_type === "linkedin").length || 0,
        whatsapp: activities?.filter(a => a.activity_type === "whatsapp").length || 0,
      };

      const scheduledMeetings = activities?.filter(a => a.outcome === "scheduled").length || 0;

      // Get objections library for reference
      const { data: objections } = await supabase
        .from("objections_library")
        .select("objection, response, category")
        .order("effectiveness_score", { ascending: false })
        .limit(10);

      // Get lead scores for pending deals
      const pendingDealIds = pendingDeals.map(d => d.id);
      const { data: leadScores } = await supabase
        .from("lead_scores")
        .select("sale_id, score, factors")
        .in("sale_id", pendingDealIds);

      // Generate performance-based suggestions
      const lossReasons = outcomes?.filter(o => o.outcome === "lost").map(o => o.reason) || [];
      const topLossReason = lossReasons.length > 0 
        ? lossReasons.reduce((a, b, i, arr) => 
            arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b
          )
        : null;

      performanceSuggestions = `
ANÁLISE DE PERFORMANCE E SUGESTÕES AUTOMÁTICAS:`;
      
      if (progressPercent < 50 && new Date().getDate() > 15) {
        performanceSuggestions += `
- ⚠️ ALERTA: Progresso de meta abaixo de 50% na segunda metade do mês. Foque em deals de alto valor.`;
      }
      
      if (winRate < 30 && outcomes?.length && outcomes.length >= 5) {
        performanceSuggestions += `
- 📉 Win rate baixo (${winRate}%). Revise seu processo de qualificação.`;
      }
      
      if (topLossReason) {
        performanceSuggestions += `
- 🔍 Principal motivo de perda: "${topLossReason}". Prepare argumentos para essa objeção.`;
      }

      if (activityGoals) {
        const callProgress = activityGoals.calls_goal ? (activityCounts.call / activityGoals.calls_goal) * 100 : 100;
        if (callProgress < 50 && new Date().getHours() >= 14) {
          performanceSuggestions += `
- 📞 Ligações abaixo do esperado para esse horário. Aumente o ritmo!`;
        }
      }

      const hotDeals = leadScores?.filter(ls => ls.score >= 75) || [];
      if (hotDeals.length > 0) {
        performanceSuggestions += `
- 🔥 Você tem ${hotDeals.length} lead(s) quente(s). Priorize o follow-up deles!`;
      }

      // Build deals list for context
      const dealsListStr = pendingDeals.slice(0, 10).map(d => {
        const score = leadScores?.find(ls => ls.sale_id === d.id);
        return `  - ${d.client_name} | ${d.product_name} | R$ ${Number(d.amount).toLocaleString("pt-BR")} | Status: ${d.status}${score ? ` | Score: ${score.score}` : ""}`;
      }).join("\n");

      salespersonContext = `
CONTEXTO DO VENDEDOR:
- Nome: ${salesperson?.name || "Vendedor"}
- Função: ${salesperson?.role === "sdr" ? "SDR" : salesperson?.role === "closer" ? "Closer" : "Híbrido"}
- Taxa de Comissão: ${salesperson?.commission_rate}%

MÉTRICAS DO MÊS:
- Vendas Fechadas: R$ ${totalSales.toLocaleString("pt-BR")}
- Meta: R$ ${goalAmount.toLocaleString("pt-BR") || "Não definida"}
- Progresso: ${progressPercent}%
- Deals em Andamento: ${pendingDeals.length}

PERFORMANCE RECENTE:
- Win Rate (últimos 10 deals): ${winRate}%
- Vitórias: ${wins}, Perdas: ${losses}
${outcomes?.filter(o => o.outcome === "lost").slice(0, 3).map(o => `- Motivo de perda: ${o.reason}`).join("\n") || ""}

ATIVIDADES DE HOJE:
- Ligações: ${activityCounts.call}${activityGoals?.calls_goal ? `/${activityGoals.calls_goal}` : ""}
- Emails: ${activityCounts.email}${activityGoals?.emails_goal ? `/${activityGoals.emails_goal}` : ""}
- Reuniões: ${activityCounts.meeting}${activityGoals?.meetings_goal ? `/${activityGoals.meetings_goal}` : ""}
- LinkedIn: ${activityCounts.linkedin}${activityGoals?.linkedin_goal ? `/${activityGoals.linkedin_goal}` : ""}
- WhatsApp: ${activityCounts.whatsapp}${activityGoals?.whatsapp_goal ? `/${activityGoals.whatsapp_goal}` : ""}
- Reuniões Agendadas Hoje: ${scheduledMeetings}

DEALS EM ANDAMENTO (até 10):
${dealsListStr || "Nenhum deal em andamento"}

OBJEÇÕES COMUNS E RESPOSTAS:
${objections?.slice(0, 5).map(o => `- "${o.objection}": ${o.response.substring(0, 100)}...`).join("\n") || "Nenhuma objeção cadastrada"}
${performanceSuggestions}
`;

      // If a specific deal context is provided, fetch detailed info
      if (dealContext?.dealId) {
        const { data: deal } = await supabase
          .from("sales")
          .select("*")
          .eq("id", dealContext.dealId)
          .single();

        if (deal) {
          const { data: dealScore } = await supabase
            .from("lead_scores")
            .select("score, factors")
            .eq("sale_id", dealContext.dealId)
            .single();

          const { data: dealActivities } = await supabase
            .from("activities")
            .select("activity_type, outcome, created_at, notes")
            .eq("sale_id", dealContext.dealId)
            .order("created_at", { ascending: false })
            .limit(5);

          const { data: stageHistory } = await supabase
            .from("deal_stage_history")
            .select("stage, entered_at, exited_at")
            .eq("sale_id", dealContext.dealId)
            .order("entered_at", { ascending: false })
            .limit(5);

          dealContextStr = `

🎯 CONTEXTO DO DEAL ESPECÍFICO:
- Cliente: ${deal.client_name}
- Produto: ${deal.product_name}
- Valor: R$ ${Number(deal.amount).toLocaleString("pt-BR")}
- Status: ${deal.status}
- Categoria: ${deal.category}
- Fonte: ${deal.source || "Não informada"}
- Criado em: ${new Date(deal.created_at).toLocaleDateString("pt-BR")}
${dealScore ? `- Lead Score: ${dealScore.score}/100` : ""}
${dealScore?.factors ? `- Fatores do Score: ${JSON.stringify(dealScore.factors)}` : ""}

Histórico de Estágios:
${stageHistory?.map(s => `  - ${s.stage}: ${new Date(s.entered_at).toLocaleDateString("pt-BR")}${s.exited_at ? ` → ${new Date(s.exited_at).toLocaleDateString("pt-BR")}` : " (atual)"}`).join("\n") || "Sem histórico"}

Últimas Atividades:
${dealActivities?.map(a => `  - ${a.activity_type} (${a.outcome}): ${new Date(a.created_at).toLocaleDateString("pt-BR")}${a.notes ? ` - "${a.notes.substring(0, 50)}..."` : ""}`).join("\n") || "Nenhuma atividade registrada"}
`;
        }
      }
    }

    const systemPrompt = `Você é ${assistantName}, um Coach de Vendas IA especializado e motivador. O vendedor que está conversando com você se chama ${userName}.

REGRAS DE COMUNICAÇÃO HUMANIZADA:
- SEMPRE chame o vendedor pelo nome (${userName}) durante as conversas
- Seja caloroso, empático e crie uma conexão pessoal
- Use o nome do vendedor naturalmente, como um mentor real faria
- Celebre pequenas vitórias e reconheça esforços
- Seja um parceiro de jornada, não apenas um assistente

SEU NOME É: ${assistantName}
- Apresente-se pelo nome quando apropriado
- Mantenha uma personalidade consistente e acolhedora
- Crie um vínculo de confiança com ${userName}

SEU PAPEL:
1. TIRAR DÚVIDAS sobre técnicas de vendas, negociação, qualificação de leads, fechamento
2. DAR DICAS práticas e acionáveis baseadas no contexto do vendedor
3. MOTIVAR ${userName} com frases de incentivo e reconhecimento de conquistas
4. AJUDAR com objeções comuns e como superá-las
5. SUGERIR próximos passos baseados na situação atual
6. ANALISAR deals específicos quando o contexto de um deal for fornecido
7. FORNECER sugestões proativas baseadas na análise de performance

${salespersonContext}
${dealContextStr}

DIRETRIZES:
- Seja direto, prático e motivador
- Use exemplos concretos quando possível
- Se ${userName} está abaixo da meta, seja encorajador mas realista
- Se está acima, celebre e mantenha o momentum
- Baseie suas sugestões nos dados reais do vendedor quando disponíveis
- Use linguagem informal mas profissional
- Responda em português brasileiro
- Mantenha respostas concisas (máximo 3 parágrafos para dúvidas simples)
- Quando analisar um deal específico, dê dicas contextualizadas para avançar esse deal
- Use os dados de ANÁLISE DE PERFORMANCE para dar sugestões proativas

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
