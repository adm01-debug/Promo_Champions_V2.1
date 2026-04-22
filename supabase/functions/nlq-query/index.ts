// NLQ — Natural Language Queries against CRM data via Lovable AI tool calling.
// Auth required (verify_jwt = true). Uses caller JWT so RLS applies.
// deno-lint-ignore-file no-explicit-any
import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import {
  querySalesMetric,
  queryPipelineSnapshot,
  queryActivities,
  queryTopClients,
} from "./queryResolvers.ts";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TOOLS = [
  {
    type: "function",
    function: {
      name: "query_sales_metric",
      description:
        "Query aggregated sales/deals metrics (revenue, count, avg_ticket, won/lost counts, conversion_rate). Optionally group by day/week/month/salesperson/category.",
      parameters: {
        type: "object",
        properties: {
          metric: { type: "string", enum: ["revenue", "count", "avg_ticket", "won_count", "lost_count", "conversion_rate"] },
          period_start: { type: "string", description: "ISO date" },
          period_end: { type: "string", description: "ISO date" },
          group_by: { type: "string", enum: ["day", "week", "month", "salesperson", "category"] },
          filters: {
            type: "object",
            properties: {
              salesperson_id: { type: "string" },
              status: { type: "string" },
              category: { type: "string" },
            },
          },
        },
        required: ["metric", "period_start", "period_end"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "query_pipeline_snapshot",
      description: "Snapshot of current open pipeline grouped by stage with count and value.",
      parameters: {
        type: "object",
        properties: { stage: { type: "string" } },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "query_activities",
      description: "Aggregate completed activities (calls/emails/meetings/whatsapp) for a period.",
      parameters: {
        type: "object",
        properties: {
          type: { type: "string" },
          period_start: { type: "string" },
          period_end: { type: "string" },
        },
        required: ["period_start", "period_end"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "query_top_clients",
      description: "Top clients by closed revenue in a period.",
      parameters: {
        type: "object",
        properties: {
          period_start: { type: "string" },
          period_end: { type: "string" },
          limit: { type: "number" },
        },
        required: ["period_start", "period_end"],
      },
    },
  },
];

const SYSTEM_PROMPT = `Você é um analista de dados do CRM da Promo Champions. Responda em PT-BR.
Hoje é ${new Date().toISOString().slice(0, 10)}.
SEMPRE chame uma das ferramentas disponíveis para buscar dados reais antes de responder.
NUNCA invente números. Se a ferramenta retornar zero registros, diga isso claramente.
Quando o usuário citar um período (ex.: "março", "essa semana", "último trimestre"), converta para datas ISO precisas.
Após receber os dados, escreva uma resposta curta e clara, formatando valores em R$ (pt-BR), datas em pt-BR, e destacando o número principal em **negrito**.`;

async function resolveTool(name: string, args: any, supabase: any) {
  switch (name) {
    case "query_sales_metric": return await querySalesMetric(supabase, args);
    case "query_pipeline_snapshot": return await queryPipelineSnapshot(supabase, args);
    case "query_activities": return await queryActivities(supabase, args);
    case "query_top_clients": return await queryTopClients(supabase, args);
    default: throw new Error(`Unknown tool: ${name}`);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData, error: userErr } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { question, conversation } = await req.json();
    if (!question || typeof question !== "string" || question.length > 1000) {
      return new Response(JSON.stringify({ error: "Pergunta inválida (máx 1000 caracteres)." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY não configurada");

    const baseMessages: any[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...(Array.isArray(conversation) ? conversation.slice(-6) : []),
      { role: "user", content: question },
    ];

    // First call: model decides which tool to invoke
    const firstRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: baseMessages,
        tools: TOOLS,
        tool_choice: "auto",
      }),
    });

    if (firstRes.status === 429) {
      return new Response(JSON.stringify({ error: "Limite de requisições atingido. Tente novamente em instantes." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (firstRes.status === 402) {
      return new Response(JSON.stringify({ error: "Créditos de IA esgotados. Adicione créditos em Configurações > Workspace." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!firstRes.ok) {
      const t = await firstRes.text();
      console.error("ai gateway error", firstRes.status, t);
      throw new Error(`AI gateway error ${firstRes.status}`);
    }

    const firstJson = await firstRes.json();
    const choice = firstJson?.choices?.[0]?.message;
    const toolCalls = choice?.tool_calls ?? [];

    if (!toolCalls.length) {
      // Model responded directly without tool call
      return new Response(JSON.stringify({
        answer: choice?.content ?? "Não consegui interpretar a pergunta. Tente reformular.",
        data: [], tool_calls: [], period: null,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const resolvedToolMessages: any[] = [];
    const collectedData: any[] = [];
    const collectedToolMeta: any[] = [];

    for (const tc of toolCalls) {
      const fnName = tc.function?.name;
      let parsedArgs: any = {};
      try { parsedArgs = JSON.parse(tc.function?.arguments ?? "{}"); } catch { /* ignore */ }
      try {
        const result = await resolveTool(fnName, parsedArgs, supabase);
        collectedData.push({ tool: fnName, args: parsedArgs, ...result });
        collectedToolMeta.push({ tool: fnName, args: parsedArgs, summary: result.summary });
        resolvedToolMessages.push({
          role: "tool",
          tool_call_id: tc.id,
          content: JSON.stringify({ rows: result.rows.slice(0, 100), summary: result.summary }),
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "tool failed";
        resolvedToolMessages.push({
          role: "tool", tool_call_id: tc.id, content: JSON.stringify({ error: msg }),
        });
      }
    }

    // Second call: model writes the final natural-language answer
    const secondRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [...baseMessages, choice, ...resolvedToolMessages],
      }),
    });

    if (!secondRes.ok) {
      const t = await secondRes.text();
      console.error("ai gateway error (second)", secondRes.status, t);
      throw new Error(`AI gateway error (second) ${secondRes.status}`);
    }

    const secondJson = await secondRes.json();
    const answer = secondJson?.choices?.[0]?.message?.content ?? "Sem resposta.";

    return new Response(JSON.stringify({
      answer,
      data: collectedData,
      tool_calls: collectedToolMeta,
      period: collectedToolMeta[0]?.args?.period_start
        ? { start: collectedToolMeta[0].args.period_start, end: collectedToolMeta[0].args.period_end }
        : null,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("nlq-query fatal", err);
    return new Response(JSON.stringify({
      error: err instanceof Error ? err.message : "Erro desconhecido",
    }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
