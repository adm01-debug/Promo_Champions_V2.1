import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.4";

interface Payload {
  sale_id?: string;
  client_id?: string;
  source: "call" | "email" | "meeting" | "whatsapp";
  transcript: string;
}

const SOURCES = new Set(["call", "email", "meeting", "whatsapp"]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const { data: userData } = await userClient.auth.getUser();
    if (!userData.user) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as Payload;
    if (!body?.transcript || body.transcript.trim().length < 30) {
      return new Response(JSON.stringify({ error: "transcript muito curto (mín 30 chars)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!SOURCES.has(body.source)) {
      return new Response(JSON.stringify({ error: "source inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ai = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "Você é um analista expert de conversas de vendas B2B em pt-BR. Retorne APENAS JSON válido.",
          },
          {
            role: "user",
            content: `Analise a conversa (fonte=${body.source}) e retorne JSON com este schema:
{
  "summary": "<resumo 2-3 frases>",
  "sentiment": "<positive|neutral|negative|mixed>",
  "objections": [{"text": "...", "category": "preço|timing|autoridade|necessidade|concorrência|outro"}],
  "next_steps": [{"text": "...", "deadline_hint": "opcional"}],
  "buying_signals": ["..."],
  "risk_signals": ["..."],
  "decision_makers": ["nome ou cargo mencionado"]
}

CONVERSA:
${body.transcript.slice(0, 14000)}`,
          },
        ],
      }),
    });

    if (!ai.ok) {
      const txt = await ai.text();
      if (ai.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit. Tente novamente." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (ai.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA esgotados." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI error ${ai.status}: ${txt}`);
    }

    const aiJson = await ai.json();
    const raw = aiJson.choices?.[0]?.message?.content ?? "{}";
    const cleaned = raw.replace(/```json\n?|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    const sentiment = ["positive", "neutral", "negative", "mixed"].includes(parsed.sentiment)
      ? parsed.sentiment
      : "neutral";

    const insertRow = {
      sale_id: body.sale_id ?? null,
      client_id: body.client_id ?? null,
      source: body.source,
      transcript: body.transcript,
      summary: parsed.summary ?? "",
      sentiment,
      objections: Array.isArray(parsed.objections) ? parsed.objections : [],
      next_steps: Array.isArray(parsed.next_steps) ? parsed.next_steps : [],
      buying_signals: Array.isArray(parsed.buying_signals) ? parsed.buying_signals : [],
      risk_signals: Array.isArray(parsed.risk_signals) ? parsed.risk_signals : [],
      decision_makers: Array.isArray(parsed.decision_makers) ? parsed.decision_makers : [],
      ai_model: "google/gemini-2.5-flash",
      analyzed_by: userData.user.id,
    };

    const { data: saved, error: insertError } = await admin
      .from("conversation_analyses")
      .insert(insertRow)
      .select()
      .single();
    if (insertError) throw insertError;

    return new Response(JSON.stringify({ success: true, analysis: saved }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    console.error("analyze-conversation error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
