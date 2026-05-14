import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.4";



const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

const SUMMARY_TOOL = {
  type: "function",
  function: {
    name: "extract_meeting_summary",
    description:
      "Extrai resumo executivo, action items, decisões, objeções, próximos passos e tópicos principais de uma transcrição de reunião comercial.",
    parameters: {
      type: "object",
      properties: {
        summary: {
          type: "string",
          description:
            "Resumo executivo em 3-5 parágrafos curtos, em PT-BR, tom consultivo. Inclui contexto, principais pontos discutidos e fechamento da call.",
        },
        action_items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              owner_hint: { type: "string", description: "vendedor|cliente|outro" },
              due_hint: { type: "string", description: "ex: 'até sexta', '7 dias', '15/04'" },
              priority: { type: "string", enum: ["alta", "média", "baixa"] },
            },
            required: ["title", "priority"],
          },
        },
        decisions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              text: { type: "string" },
              made_by_hint: { type: "string" },
            },
            required: ["text"],
          },
        },
        objections: {
          type: "array",
          items: {
            type: "object",
            properties: {
              text: { type: "string" },
              category: {
                type: "string",
                enum: ["preço", "timing", "autoridade", "necessidade", "concorrência", "outro"],
              },
            },
            required: ["text", "category"],
          },
        },
        next_steps: {
          type: "array",
          items: {
            type: "object",
            properties: {
              text: { type: "string" },
              deadline_hint: { type: "string" },
            },
            required: ["text"],
          },
        },
        key_topics: {
          type: "array",
          items: { type: "string" },
          description: "5-10 tópicos centrais discutidos.",
        },
        sentiment: {
          type: "string",
          enum: ["positive", "neutral", "negative", "mixed"],
        },
      },
      required: [
        "summary",
        "action_items",
        "decisions",
        "objections",
        "next_steps",
        "key_topics",
        "sentiment",
      ],
    },
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
      global: { headers: { Authorization: authHeader } },
    });

    const { recording_id } = await req.json();
    if (!recording_id) {
      return json({ error: "recording_id obrigatório" }, 400);
    }

    const { data: rec, error: recErr } = await supabase
      .from("call_recordings")
      .select("id, salesperson_id, sale_id, client_id, title, transcript, diarization, talk_ratio_seller, talk_ratio_client")
      .eq("id", recording_id)
      .maybeSingle();

    if (recErr || !rec) return json({ error: "Gravação não encontrada" }, 404);
    if (!rec.transcript || rec.transcript.length < 50) {
      return json({ error: "Transcrição ausente ou muito curta" }, 400);
    }

    // Optional context
    let contactCtx = "";
    if (rec.client_id) {
      const { data: c } = await supabase
        .from("clients")
        .select("name, company, industry")
        .eq("id", rec.client_id)
        .maybeSingle();
      if (c) contactCtx = `Cliente: ${c.name}${c.company ? " (" + c.company + ")" : ""}${c.industry ? " · " + c.industry : ""}.`;
    }
    if (!contactCtx && rec.sale_id) {
      const { data: s } = await supabase
        .from("sales")
        .select("client_name, product_name, amount, status")
        .eq("id", rec.sale_id)
        .maybeSingle();
      if (s) contactCtx = `Negócio: ${s.client_name} · ${s.product_name ?? ""} · status ${s.status}.`;
    }

    const transcript = rec.transcript.slice(0, 18000);

    const messages = [
      {
        role: "system",
        content:
          "Você é um analista sênior de vendas B2B. Sua tarefa é transformar transcrições de reuniões em resumos acionáveis em PT-BR. Use a tool 'extract_meeting_summary' SEMPRE. Seja específico, evite generalidades. Identifique objeções pelo framework BANT (Budget/Authority/Need/Timing) e classifique o sentimento da call considerando engajamento do cliente.",
      },
      {
        role: "user",
        content: `Reunião: "${rec.title}".\n${contactCtx}\nMétricas: talk_ratio vendedor=${rec.talk_ratio_seller ?? "?"}, cliente=${rec.talk_ratio_client ?? "?"}.\n\nTranscrição:\n${transcript}\n\nGere o resumo executivo completo agora chamando a tool.`,
      },
    ];

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        tools: [SUMMARY_TOOL],
        tool_choice: { type: "function", function: { name: "extract_meeting_summary" } },
      }),
    });

    if (aiRes.status === 429) return json({ error: "Rate limit. Tente novamente em instantes." }, 429);
    if (aiRes.status === 402) return json({ error: "Créditos de IA esgotados. Adicione créditos no workspace." }, 402);
    if (!aiRes.ok) {
      const t = await aiRes.text();
      return json({ error: `Falha na IA: ${t.slice(0, 200)}` }, 502);
    }

    const data = await aiRes.json();
    const toolCall = data?.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      return json({ error: "IA não retornou tool_call estruturada" }, 502);
    }

    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(toolCall.function.arguments);
    } catch {
      return json({ error: "Argumentos da tool inválidos" }, 502);
    }

    const { error: rpcErr } = await supabase.rpc("update_call_recording_summary", {
      _recording_id: recording_id,
      _summary: payload.summary ?? null,
      _action_items: payload.action_items ?? [],
      _decisions: payload.decisions ?? [],
      _objections: payload.objections ?? [],
      _next_steps: payload.next_steps ?? [],
      _key_topics: payload.key_topics ?? [],
      _sentiment: payload.sentiment ?? "neutral",
    });

    if (rpcErr) return json({ error: `RPC: ${rpcErr.message}` }, 500);

    return json({
      recording_id,
      ...payload,
      ok: true,
    });
  } catch (e) {
    console.error("summarize-call-recording error:", e);
    return json({ error: e instanceof Error ? e.message : "Erro interno" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
