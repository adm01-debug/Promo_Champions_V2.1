import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.4";

interface AnalyzePayload {
  recording_id: string;
  transcript_text: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

    const body = (await req.json()) as AnalyzePayload;
    if (!body.recording_id || !body.transcript_text) {
      return new Response(JSON.stringify({ error: "recording_id e transcript_text obrigatórios" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await supabase.from("call_recordings").update({ status: "analyzing" }).eq("id", body.recording_id);

    // Salva transcript
    await supabase.from("call_transcripts").insert({
      recording_id: body.recording_id,
      full_text: body.transcript_text,
      word_count: body.transcript_text.split(/\s+/).length,
    });

    // Análise via Lovable AI
    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
              "Você é um analista expert de calls de vendas B2B. Analise a transcrição e retorne JSON estruturado em pt-BR.",
          },
          {
            role: "user",
            content: `Analise esta call e retorne APENAS um JSON válido:
{
  "sentiment_score": <-1 a 1>,
  "sentiment_label": "<very_negative|negative|neutral|positive|very_positive>",
  "talk_ratio_salesperson": <0-100>,
  "talk_ratio_client": <0-100>,
  "topics": ["<até 5 tópicos principais>"],
  "objections": ["<objeções detectadas>"],
  "next_steps": ["<próximos passos sugeridos>"],
  "key_moments": [{"timestamp_sec": 0, "label": "..."}],
  "coaching_tips": ["<3-5 dicas para o vendedor>"],
  "summary": "<resumo de 2-3 frases>",
  "questions_asked": <número>
}

TRANSCRIÇÃO:
${body.transcript_text.slice(0, 12000)}`,
          },
        ],
      }),
    });

    if (!aiRes.ok) {
      const txt = await aiRes.text();
      await supabase.from("call_recordings").update({ status: "failed" }).eq("id", body.recording_id);
      throw new Error(`AI error ${aiRes.status}: ${txt}`);
    }

    const aiJson = await aiRes.json();
    const content = aiJson.choices?.[0]?.message?.content ?? "{}";
    const cleaned = content.replace(/```json\n?|```/g, "").trim();
    const insights = JSON.parse(cleaned);

    await supabase.from("call_insights").insert({
      recording_id: body.recording_id,
      sentiment_score: insights.sentiment_score,
      sentiment_label: insights.sentiment_label,
      talk_ratio_salesperson: insights.talk_ratio_salesperson,
      talk_ratio_client: insights.talk_ratio_client,
      topics: insights.topics ?? [],
      objections: insights.objections ?? [],
      next_steps: insights.next_steps ?? [],
      key_moments: insights.key_moments ?? [],
      coaching_tips: insights.coaching_tips ?? [],
      summary: insights.summary ?? "",
      questions_asked: insights.questions_asked ?? 0,
    });

    await supabase.from("call_recordings").update({ status: "ready" }).eq("id", body.recording_id);

    return new Response(JSON.stringify({ success: true, insights }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    console.error("analyze-call error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
