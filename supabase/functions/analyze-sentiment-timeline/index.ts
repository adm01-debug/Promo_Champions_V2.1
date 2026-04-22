import { createClient } from "npm:@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface DiarizationTurn {
  speaker: string;
  text: string;
  start_estimate?: number;
  duration_estimate?: number;
}

const WINDOW_SECONDS = 30;

function buildWindows(turns: DiarizationTurn[]) {
  if (!turns?.length) return [];
  const windows: Array<{
    index: number;
    start: number;
    end: number;
    speaker: string;
    text: string;
  }> = [];
  let current: typeof windows[number] | null = null;
  turns.forEach((t) => {
    const start = Math.max(0, Math.floor(t.start_estimate ?? 0));
    const end = start + Math.max(1, Math.floor(t.duration_estimate ?? 5));
    if (!current || start - current.start >= WINDOW_SECONDS) {
      if (current) windows.push(current);
      current = {
        index: windows.length,
        start,
        end,
        speaker: t.speaker || "unknown",
        text: t.text || "",
      };
    } else {
      current.end = end;
      current.text += " " + (t.text || "");
      if (current.speaker !== t.speaker) current.speaker = "mixed";
    }
  });
  if (current) windows.push(current);
  return windows;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { recording_id } = await req.json();
    if (!recording_id) {
      return new Response(JSON.stringify({ error: "recording_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: rec, error: recErr } = await supabase
      .from("call_recordings")
      .select("id, diarization, transcript")
      .eq("id", recording_id)
      .maybeSingle();

    if (recErr || !rec) {
      return new Response(JSON.stringify({ error: "recording not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const turns = (rec.diarization as DiarizationTurn[] | null) ?? [];
    const windows = buildWindows(turns);
    if (!windows.length) {
      return new Response(
        JSON.stringify({ error: "no diarization available" }),
        {
          status: 422,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const userPrompt = `Analise o sentimento de cada janela da transcrição abaixo. Para cada janela retorne sentiment (very_negative|negative|neutral|positive|very_positive), score (-1.0 a 1.0), confidence (0-1) e excerpt (trecho mais representativo, máx 140 chars).\n\nJanelas:\n${windows
      .map(
        (w) =>
          `[${w.index}] ${w.start}s-${w.end}s (${w.speaker}): ${w.text.slice(0, 600)}`,
      )
      .join("\n")}`;

    const aiRes = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-lite",
          messages: [
            {
              role: "system",
              content:
                "Você é um analista especialista em sentimento de chamadas de venda B2B em português. Responda apenas via tool call.",
            },
            { role: "user", content: userPrompt },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "submit_sentiment_timeline",
                description: "Sentimento por janela",
                parameters: {
                  type: "object",
                  properties: {
                    segments: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          segment_index: { type: "integer" },
                          sentiment: {
                            type: "string",
                            enum: [
                              "very_negative",
                              "negative",
                              "neutral",
                              "positive",
                              "very_positive",
                            ],
                          },
                          score: { type: "number" },
                          confidence: { type: "number" },
                          excerpt: { type: "string" },
                        },
                        required: [
                          "segment_index",
                          "sentiment",
                          "score",
                          "confidence",
                          "excerpt",
                        ],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ["segments"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "submit_sentiment_timeline" },
          },
        }),
      },
    );

    if (aiRes.status === 429 || aiRes.status === 402) {
      return new Response(
        JSON.stringify({
          error:
            aiRes.status === 429
              ? "Rate limit exceeded"
              : "AI credits exhausted",
        }),
        {
          status: aiRes.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
    if (!aiRes.ok) {
      const txt = await aiRes.text();
      throw new Error(`AI error: ${aiRes.status} ${txt}`);
    }

    const aiJson = await aiRes.json();
    const toolCall = aiJson.choices?.[0]?.message?.tool_calls?.[0];
    const args = toolCall?.function?.arguments
      ? JSON.parse(toolCall.function.arguments)
      : { segments: [] };
    const segments: Array<{
      segment_index: number;
      sentiment: string;
      score: number;
      confidence: number;
      excerpt: string;
    }> = args.segments ?? [];

    await supabase
      .from("call_sentiment_timeline")
      .delete()
      .eq("recording_id", recording_id);

    const rows = segments
      .map((s) => {
        const w = windows.find((x) => x.index === s.segment_index);
        if (!w) return null;
        return {
          recording_id,
          segment_index: s.segment_index,
          start_sec: w.start,
          end_sec: w.end,
          speaker: w.speaker,
          sentiment: s.sentiment,
          score: Math.max(-1, Math.min(1, s.score)),
          confidence: Math.max(0, Math.min(1, s.confidence)),
          excerpt: (s.excerpt || w.text).slice(0, 280),
        };
      })
      .filter(Boolean);

    if (rows.length) {
      const { error: insErr } = await supabase
        .from("call_sentiment_timeline")
        .insert(rows);
      if (insErr) throw insErr;
    }

    return new Response(
      JSON.stringify({ recording_id, segments_count: rows.length }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (e) {
    console.error("analyze-sentiment-timeline error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
