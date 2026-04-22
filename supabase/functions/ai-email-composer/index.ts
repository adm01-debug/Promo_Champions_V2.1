import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.4";

interface ContactContext {
  name?: string;
  company?: string;
  role?: string;
  industry?: string;
  last_interaction?: string;
}

interface RequestBody {
  mode?: "sequence" | "single";
  // single mode
  recipient_id?: string;
  recipient_type?: "client" | "contact" | "manual";
  // shared
  contact_context?: ContactContext;
  goal?: "intro" | "follow_up" | "meeting" | "reactivation" | "breakup" | "proposal" | "thanks";
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
  proposal: "Envio de proposta comercial",
  thanks: "Agradecimento pós-reunião ou pós-venda",
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

async function resolveContext(
  supabase: ReturnType<typeof createClient>,
  recipientId: string,
  recipientType: "client" | "contact",
): Promise<ContactContext> {
  if (recipientType === "client") {
    const { data: client } = await supabase
      .from("clients")
      .select("name, company, email")
      .eq("id", recipientId)
      .maybeSingle();
    if (!client) return {};
    const { data: lastSale } = await supabase
      .from("sales")
      .select("created_at, status, value")
      .eq("client_id", recipientId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return {
      name: client.name,
      company: client.company ?? undefined,
      last_interaction: lastSale
        ? `Última venda em ${new Date(lastSale.created_at).toLocaleDateString("pt-BR")} (${lastSale.status})`
        : undefined,
    };
  }
  // contact
  const { data: contact } = await supabase
    .from("account_contacts")
    .select("name, job_title, department, last_contacted_at, account_id, accounts(name, industry)")
    .eq("id", recipientId)
    .maybeSingle();
  if (!contact) return {};
  const account = (contact as { accounts?: { name?: string; industry?: string } }).accounts;
  return {
    name: contact.name as string,
    role: (contact.job_title as string | null) ?? undefined,
    company: account?.name,
    industry: account?.industry,
    last_interaction: contact.last_contacted_at
      ? `Último contato em ${new Date(contact.last_contacted_at as string).toLocaleDateString("pt-BR")}`
      : undefined,
  };
}

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
    const mode = body.mode ?? "sequence";
    const goal = body.goal ?? "follow_up";
    const tone = body.tone ?? "consultivo";
    const language = body.language ?? "pt-BR";
    const length = body.length ?? "medium";
    let ctx = body.contact_context ?? {};

    // Single mode: auto-resolve context with caller's JWT (RLS enforced)
    if (mode === "single" && body.recipient_id && body.recipient_type && body.recipient_type !== "manual") {
      const authHeader = req.headers.get("Authorization") ?? "";
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? "",
        { global: { headers: { Authorization: authHeader } } },
      );
      const resolved = await resolveContext(supabase, body.recipient_id, body.recipient_type);
      ctx = { ...resolved, ...ctx };
    }

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
8. Retorne APENAS via tool call emit_email com subject + body_text + body_html (HTML simples) + suggested_send_time (ISO ou texto tipo "terça 09h-11h") + follow_up_hint.`;

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
                  body_text: { type: "string", description: "Corpo em texto puro com \\n" },
                  body_html: { type: "string", description: "Corpo em HTML simples (p, br, strong)" },
                  suggested_send_time: {
                    type: "string",
                    description: "Janela ideal de envio, ex: 'terça 09h-11h' ou ISO datetime",
                  },
                  follow_up_hint: {
                    type: "string",
                    description: "Sugestão de follow-up se não houver resposta em X dias",
                  },
                  variables_used: {
                    type: "array",
                    items: { type: "string" },
                  },
                },
                required: ["subject", "body_text", "body_html", "suggested_send_time", "follow_up_hint"],
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

    const parsed = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify({
        subject: parsed.subject,
        body: parsed.body_text, // backwards compat with sequences
        body_text: parsed.body_text,
        body_html: parsed.body_html,
        suggested_send_time: parsed.suggested_send_time,
        follow_up_hint: parsed.follow_up_hint,
        variables_used: parsed.variables_used ?? [],
        meta: { goal, tone, language, length, mode },
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
