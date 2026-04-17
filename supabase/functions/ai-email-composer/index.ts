import { corsHeaders } from "../_shared/cors.ts";

interface ContactContext {
  name?: string;
  company?: string;
  role?: string;
  industry?: string;
  last_interaction?: string;
}

interface RequestBody {
  contact_context?: ContactContext;
  goal?: "intro" | "follow_up" | "meeting" | "reactivation" | "breakup";
  tone?: "formal" | "casual" | "consultivo" | "direto";
  language?: "pt-BR" | "en";
  length?: "short" | "medium" | "long";
  custom_instructions?: string;
}

const GOAL_LABEL: Record<string, string> = {
  intro: "Apresentação inicial / cold outreach",
  follow_up: "Follow-up de conversa anterior",
  meeting: "Solicitar reunião / demo",
  reactivation: "Reativar lead frio",
  breakup: "E-mail de break-up (última tentativa)",
};

const TONE_LABEL: Record<string, string> = {
  formal: "formal e profissional",
  casual: "casual e amigável",
  consultivo: "consultivo, focado em insights e valor",
  direto: "direto ao ponto, conciso",
};

const LENGTH_LABEL: Record<string, string> = {
  short: "curto (2-3 frases no corpo)",
  medium: "médio (4-6 frases)",
  long: "longo (7-10 frases com mais contexto)",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = (await req.json()) as RequestBody;
    const goal = body.goal ?? "follow_up";
    const tone = body.tone ?? "consultivo";
    const language = body.language ?? "pt-BR";
    const length = body.length ?? "medium";
    const ctx = body.contact_context ?? {};

    const langInstruction =
      language === "pt-BR"
        ? "Responda EXCLUSIVAMENTE em português do Brasil (pt-BR)."
        : "Respond EXCLUSIVELY in English.";

    const systemPrompt = `Você é um especialista sênior em copywriting B2B para outbound sales.
Sua tarefa: gerar UM e-mail profissional, persuasivo e personalizado.

REGRAS OBRIGATÓRIAS:
1. ${langInstruction}
2. Use as variáveis Liquid quando fizer sentido: {{nome}}, {{empresa}}, {{cargo}}, {{ultima_interacao}}, {{vendedor.nome}}.
3. Subject line: máximo 60 caracteres, sem clickbait, sem emoji.
4. Tom: ${TONE_LABEL[tone]}.
5. Tamanho: ${LENGTH_LABEL[length]}.
6. Sem placeholders genéricos tipo "[empresa]" — use {{empresa}}.
7. Inclua 1 CTA claro no final.
8. Retorne APENAS via tool call, nunca texto solto.`;

    const userPrompt = `Objetivo: ${GOAL_LABEL[goal]}.

Contexto do contato:
- Nome: ${ctx.name ?? "(use {{nome}})"}
- Empresa: ${ctx.company ?? "(use {{empresa}})"}
- Cargo: ${ctx.role ?? "(use {{cargo}})"}
- Indústria: ${ctx.industry ?? "n/d"}
- Última interação: ${ctx.last_interaction ?? "n/d"}

${body.custom_instructions ? `Instruções extras do vendedor: ${body.custom_instructions}` : ""}

Gere o e-mail agora chamando a tool emit_email.`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "emit_email",
              description: "Retorna o e-mail estruturado.",
              parameters: {
                type: "object",
                properties: {
                  subject: { type: "string", description: "Assunto, máx 60 chars" },
                  body: { type: "string", description: "Corpo do e-mail com quebras de linha \\n" },
                  variables_used: {
                    type: "array",
                    items: { type: "string" },
                    description: "Lista de variáveis Liquid usadas, ex: ['nome','empresa']",
                  },
                },
                required: ["subject", "body", "variables_used"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "emit_email" } },
      }),
    });

    if (aiResp.status === 429) {
      return new Response(
        JSON.stringify({ error: "Limite de uso da IA atingido. Tente novamente em alguns instantes." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (aiResp.status === 402) {
      return new Response(
        JSON.stringify({ error: "Créditos de IA esgotados. Adicione créditos em Configurações > Workspace." }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (!aiResp.ok) {
      const errText = await aiResp.text();
      console.error("AI gateway error:", aiResp.status, errText);
      return new Response(
        JSON.stringify({ error: "Falha ao gerar e-mail com IA." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const aiJson = await aiResp.json();
    const toolCall = aiJson.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      return new Response(
        JSON.stringify({ error: "Resposta da IA sem tool call estruturada." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const parsed = JSON.parse(toolCall.function.arguments) as {
      subject: string;
      body: string;
      variables_used: string[];
    };

    return new Response(
      JSON.stringify({
        subject: parsed.subject,
        body: parsed.body,
        variables_used: parsed.variables_used ?? [],
        meta: { goal, tone, language, length },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("ai-email-composer error:", msg);
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
