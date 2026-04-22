import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";

interface BriefingPayload {
  headline: string;
  narrative: string;
  key_wins: Array<{ title: string; detail: string }>;
  key_risks: Array<{ title: string; detail: string; severity: "critical" | "warning" | "info" }>;
  recommended_actions: Array<{ title: string; rationale: string; module?: string }>;
}

const SYSTEM_PROMPT = `Você é um Chief Revenue Officer experiente. Receberá um snapshot do pipeline de vendas (Pulse Score, KPIs, alertas).
Gere um briefing executivo diário, em português do Brasil, conciso e acionável.

Retorne via tool call \`generate_briefing\` com:
- headline: 1 frase impactante (até 100 chars) resumindo o estado do dia
- narrative: 4-6 parágrafos em markdown explicando o cenário, tendências e prioridades
- key_wins: 2-3 vitórias/pontos fortes
- key_risks: 2-3 riscos críticos com severidade
- recommended_actions: exatamente 3 ações concretas para o dia
Tom: estratégico, direto, sem jargão vazio.`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY não configurada");

    const authHeader = req.headers.get("Authorization") ?? "";
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    const body = await req.json().catch(() => ({}));
    const generated_by: "auto" | "manual" = body?.auto ? "auto" : "manual";
    const today = new Date().toISOString().slice(0, 10);

    // Idempotência por dia
    const { data: existing } = await supabase
      .from("executive_briefings")
      .select("*")
      .eq("briefing_date", today)
      .maybeSingle();
    if (existing && !body?.force) {
      return new Response(JSON.stringify(existing), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Snapshot do Pulse
    const pulseRes = await fetch(`${SUPABASE_URL}/functions/v1/pipeline-pulse-aggregator`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader || `Bearer ${SERVICE_KEY}`,
        apikey: SERVICE_KEY,
      },
      body: JSON.stringify({}),
    });
    const pulse = pulseRes.ok ? await pulseRes.json() : { pulse_score: 0, kpis: [], alerts: [], trends: {} };

    // Histórico 7d
    const { data: history } = await supabase
      .from("executive_briefings")
      .select("briefing_date, pulse_score, headline")
      .order("briefing_date", { ascending: false })
      .limit(7);

    // Lovable AI com tool calling
    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `SNAPSHOT DE HOJE (${today}):\n${JSON.stringify(pulse, null, 2)}\n\nHISTÓRICO RECENTE:\n${JSON.stringify(history ?? [], null, 2)}`,
          },
        ],
        tools: [{
          type: "function",
          function: {
            name: "generate_briefing",
            description: "Gera o briefing executivo diário",
            parameters: {
              type: "object",
              properties: {
                headline: { type: "string" },
                narrative: { type: "string" },
                key_wins: {
                  type: "array",
                  items: { type: "object", properties: { title: { type: "string" }, detail: { type: "string" } }, required: ["title", "detail"] },
                },
                key_risks: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: { title: { type: "string" }, detail: { type: "string" }, severity: { type: "string", enum: ["critical", "warning", "info"] } },
                    required: ["title", "detail", "severity"],
                  },
                },
                recommended_actions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: { title: { type: "string" }, rationale: { type: "string" }, module: { type: "string" } },
                    required: ["title", "rationale"],
                  },
                },
              },
              required: ["headline", "narrative", "key_wins", "key_risks", "recommended_actions"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "generate_briefing" } },
      }),
    });

    if (!aiRes.ok) {
      const t = await aiRes.text();
      console.error("AI error", aiRes.status, t);
      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em instantes." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (aiRes.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA esgotados. Adicione créditos no workspace." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      throw new Error("Falha na IA");
    }

    const aiJson = await aiRes.json();
    const toolCall = aiJson.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) throw new Error("Resposta sem tool call");
    const payload: BriefingPayload = JSON.parse(toolCall.function.arguments);

    const row = {
      briefing_date: today,
      pulse_score: Math.round(pulse.pulse_score ?? 0),
      headline: payload.headline.slice(0, 200),
      narrative: payload.narrative,
      key_wins: payload.key_wins ?? [],
      key_risks: payload.key_risks ?? [],
      recommended_actions: (payload.recommended_actions ?? []).slice(0, 3),
      generated_by,
    };

    const { data: upserted, error: upErr } = await supabase
      .from("executive_briefings")
      .upsert(row, { onConflict: "briefing_date" })
      .select()
      .single();
    if (upErr) throw upErr;

    return new Response(JSON.stringify(upserted), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("generate-executive-briefing error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
