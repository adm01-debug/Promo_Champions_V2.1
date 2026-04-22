import { createClient } from "npm:@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface Moment {
  moment_type: string;
  severity: string;
  timestamp_sec: number;
  quote: string;
  context: string;
  suggested_action: string;
}

const MOMENT_TOOL = {
  type: "function",
  function: {
    name: "report_critical_moments",
    description:
      "Reporta momentos críticos detectados na call de vendas com timestamps exatos e ações sugeridas.",
    parameters: {
      type: "object",
      properties: {
        moments: {
          type: "array",
          items: {
            type: "object",
            properties: {
              moment_type: {
                type: "string",
                enum: [
                  "objection",
                  "buying_signal",
                  "price_mention",
                  "discount_request",
                  "churn_signal",
                  "competitor",
                  "commitment",
                  "next_step",
                ],
              },
              severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
              timestamp_sec: { type: "integer", minimum: 0 },
              quote: { type: "string" },
              context: { type: "string" },
              suggested_action: { type: "string" },
            },
            required: [
              "moment_type",
              "severity",
              "timestamp_sec",
              "quote",
              "context",
              "suggested_action",
            ],
            additionalProperties: false,
          },
        },
      },
      required: ["moments"],
      additionalProperties: false,
    },
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsErr } = await supabase.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub as string;

    const body = await req.json().catch(() => ({}));
    const recordingId: string | undefined = body?.recording_id;
    if (!recordingId) {
      return new Response(JSON.stringify({ error: "recording_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: rec, error: recErr } = await admin
      .from("call_recordings")
      .select("id, salesperson_id, transcript, diarization, title")
      .eq("id", recordingId)
      .maybeSingle();
    if (recErr || !rec) {
      return new Response(JSON.stringify({ error: "Recording not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const transcript = (rec.transcript ?? "").toString().slice(0, 18000);
    if (!transcript.trim()) {
      return new Response(
        JSON.stringify({ error: "Transcript ausente. Transcreva primeiro." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: timeline } = await admin
      .from("call_sentiment_timeline")
      .select("start_sec, end_sec, sentiment, score, excerpt")
      .eq("recording_id", recordingId)
      .order("segment_index", { ascending: true })
      .limit(80);

    const sentimentCtx = (timeline ?? [])
      .map((s) => `[${s.start_sec}-${s.end_sec}s ${s.sentiment} ${s.score}] ${s.excerpt ?? ""}`)
      .join("\n")
      .slice(0, 4000);

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY ausente");

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "Você é um sales coach sênior. Detecte momentos CRÍTICOS reais em uma call de vendas em PT-BR: objeções fortes, sinais de compra, menções de preço, pedidos de desconto, sinais de churn/insatisfação, menção a concorrentes, compromissos firmes e próximos passos acordados. Para cada momento retorne timestamp_sec exato (em segundos do início), severity (low/medium/high/critical), quote (frase literal curta), context (1 frase explicando) e suggested_action (ação concreta para o vendedor agora). NÃO invente momentos: só reporte os que aparecem no transcript.",
          },
          {
            role: "user",
            content: `Call: ${rec.title}\n\nTranscript:\n${transcript}\n\nTimeline de sentimento:\n${sentimentCtx}`,
          },
        ],
        tools: [MOMENT_TOOL],
        tool_choice: { type: "function", function: { name: "report_critical_moments" } },
      }),
    });

    if (aiResp.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit, tente novamente em instantes." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (aiResp.status === 402) {
      return new Response(
        JSON.stringify({ error: "Créditos esgotados. Adicione em Settings > Workspace > Usage." }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (!aiResp.ok) {
      const txt = await aiResp.text();
      console.error("AI gateway error:", aiResp.status, txt);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiJson = await aiResp.json();
    const toolCall = aiJson?.choices?.[0]?.message?.tool_calls?.[0];
    const args = toolCall ? JSON.parse(toolCall.function.arguments) : { moments: [] };
    const moments: Moment[] = Array.isArray(args.moments) ? args.moments : [];

    // Idempotente: limpar 'new' antigos
    await admin
      .from("call_critical_moments")
      .delete()
      .eq("recording_id", recordingId)
      .eq("status", "new");

    let inserted = 0;
    if (moments.length) {
      const rows = moments.slice(0, 30).map((m) => ({
        recording_id: recordingId,
        owner_id: userId,
        salesperson_id: rec.salesperson_id,
        moment_type: m.moment_type,
        severity: m.severity,
        timestamp_sec: Math.max(0, Math.floor(m.timestamp_sec || 0)),
        quote: (m.quote ?? "").slice(0, 600),
        context: (m.context ?? "").slice(0, 800),
        suggested_action: (m.suggested_action ?? "").slice(0, 500),
        status: "new",
      }));
      const { error: insErr } = await admin.from("call_critical_moments").insert(rows);
      if (insErr) {
        console.error("insert error", insErr);
        return new Response(JSON.stringify({ error: insErr.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      inserted = rows.length;
    }

    return new Response(
      JSON.stringify({ recording_id: recordingId, moments_detected: inserted }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("detect-critical-moments error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
