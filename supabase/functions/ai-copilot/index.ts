import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the request (optional - works for anonymous users too)
    const authHeader = req.headers.get("Authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    let user = null;
    if (authHeader && !authHeader.endsWith(supabaseAnonKey)) {
      const authClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data } = await authClient.auth.getUser();
      user = data?.user ?? null;
    }

    const body = await req.json();
    
    // Input validation
    const { context, salespersonId, action } = body;
    if (!context || typeof context !== "object" || !context.page) {
      return new Response(JSON.stringify({ error: "Campo 'context.page' é obrigatório" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (action && !["page_suggestion", "smart_tip", "auto_fill", "quick_answer"].includes(action)) {
      return new Response(JSON.stringify({ error: "Ação inválida" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (salespersonId && typeof salespersonId !== "string") {
      return new Response(JSON.stringify({ error: "salespersonId deve ser string" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let contextData = "";

    // Fetch relevant data based on current page context
    if (salespersonId) {
      const { data: salesperson } = await supabase
        .from("salespeople")
        .select("name, role, xp, level, commission_rate")
        .eq("id", salespersonId)
        .single();

      if (salesperson) {
        contextData += `Vendedor: ${salesperson.name} (${salesperson.role}), Nível ${salesperson.level}, XP: ${salesperson.xp}\n`;
      }

      // Get today's pending tasks
      const today = new Date().toISOString().split("T")[0];
      const { data: tasks, count: taskCount } = await supabase
        .from("tasks")
        .select("title, priority, due_date", { count: "exact" })
        .eq("assigned_to", salespersonId)
        .eq("is_completed", false)
        .order("due_date", { ascending: true })
        .limit(5);

      if (taskCount && taskCount > 0) {
        contextData += `Tarefas pendentes: ${taskCount}. Próximas: ${tasks?.map(t => `${t.title} (${t.priority})`).join(", ")}\n`;
      }

      // Get recent activities count
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
      const { count: activityCount } = await supabase
        .from("activities")
        .select("id", { count: "exact", head: true })
        .eq("salesperson_id", salespersonId)
        .gte("created_at", weekAgo);

      contextData += `Atividades na semana: ${activityCount || 0}\n`;

      // Get open deals
      const { data: deals, count: dealCount } = await supabase
        .from("sales")
        .select("title, value, status", { count: "exact" })
        .eq("salesperson_id", salespersonId)
        .in("status", ["open", "lead", "qualified", "proposal", "negotiation"])
        .order("value", { ascending: false })
        .limit(3);

      if (dealCount && dealCount > 0) {
        contextData += `Deals abertos: ${dealCount}. Top: ${deals?.map(d => `${d.title} (R$${d.value})`).join(", ")}\n`;
      }
    }

    const systemPrompt = `Você é o Copilot do PROMO CHAMPIONS, um assistente de vendas ultra-conciso e proativo.
Sua função é dar micro-sugestões contextuais baseadas na tela atual e nos dados do vendedor.
REGRAS:
- Máximo 2-3 frases curtas
- Seja direto e acionável
- Use emojis sparingly (1-2 max)
- Foque em produtividade e próximos passos
- Fale em português brasileiro
- Não repita informações óbvias da tela

Dados do vendedor:
${contextData}

Tela atual: ${context.page}
${context.extra ? `Contexto extra: ${context.extra}` : ""}`;

    let userMessage = "";

    if (action === "page_suggestion") {
      userMessage = `Dê uma micro-sugestão proativa para a tela "${context.page}". O que o vendedor deveria fazer agora?`;
    } else if (action === "smart_tip") {
      userMessage = `Baseado nos dados, dê uma dica rápida de performance para o vendedor.`;
    } else if (action === "auto_fill") {
      userMessage = `Sugira preenchimento inteligente para: ${context.extra}`;
    } else if (action === "quick_answer") {
      userMessage = context.question || "Dê uma dica rápida.";
    } else {
      userMessage = context.question || "O que devo fazer agora?";
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit atingido. Tente novamente em breve." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const suggestion = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ suggestion }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-copilot error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
