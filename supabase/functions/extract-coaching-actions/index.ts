import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.4";



interface DiarSegment {
  speaker?: string;
  start?: number;
  end?: number;
  text?: string;
}

interface CoachingItem {
  tip: string;
  category: string;
  severity: string;
  timestamp_sec: number | null;
  quote: string | null;
}

const ALLOWED_CATEGORIES = [
  "opening",
  "discovery",
  "objection",
  "closing",
  "talk_ratio",
  "pace",
  "empathy",
  "other",
];
const ALLOWED_SEVERITY = ["info", "warning", "critical"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { recording_id } = await req.json();
    if (!recording_id) throw new Error("recording_id obrigatório");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableKey) throw new Error("LOVABLE_API_KEY ausente");

    const supabase = createClient(supabaseUrl, serviceKey);

    const { data: rec, error: recErr } = await supabase
      .from("call_recordings")
      .select("id, salesperson_id, transcript, diarization, summary")
      .eq("id", recording_id)
      .single();
    if (recErr || !rec) throw new Error(`Recording não encontrado: ${recErr?.message}`);
    if (!rec.transcript) throw new Error("Transcript ausente — transcreva primeiro");

    const { data: insight } = await supabase
      .from("call_insights")
      .select("coaching_tips, key_moments, talk_ratio_salesperson, talk_ratio_client")
      .eq("recording_id", recording_id)
      .maybeSingle();

    const segments: DiarSegment[] = Array.isArray(rec.diarization) ? rec.diarization : [];
    const diarPreview = segments
      .slice(0, 80)
      .map((s) => `[${Math.round(s.start ?? 0)}s ${s.speaker ?? "?"}] ${(s.text ?? "").slice(0, 200)}`)
      .join("\n");

    const prompt = `Você é um coach sênior de vendas. Analise a chamada abaixo e gere de 3 a 7 ações de coaching ESPECÍFICAS, cada uma ancorada em um momento real da diarização.

CATEGORIAS válidas: opening, discovery, objection, closing, talk_ratio, pace, empathy, other
SEVERIDADES: info (sugestão), warning (oportunidade perdida), critical (erro grave)

Resumo: ${rec.summary ?? "—"}
Talk ratio vendedor: ${insight?.talk_ratio_salesperson ?? "?"}
Tips prévias: ${JSON.stringify(insight?.coaching_tips ?? [])}

Diarização (parcial):
${diarPreview}

Para cada ação, retorne timestamp_sec do momento citado e a quote literal (≤120 chars) do trecho.`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        tools: [
          {
            type: "function",
            function: {
              name: "submit_coaching_actions",
              description: "Retorna ações de coaching ancoradas em timestamps",
              parameters: {
                type: "object",
                properties: {
                  actions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        tip: { type: "string" },
                        category: { type: "string", enum: ALLOWED_CATEGORIES },
                        severity: { type: "string", enum: ALLOWED_SEVERITY },
                        timestamp_sec: { type: "number" },
                        quote: { type: "string" },
                      },
                      required: ["tip", "category", "severity"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["actions"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "submit_coaching_actions" } },
      }),
    });

    if (aiResp.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit excedido. Tente novamente em instantes." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (aiResp.status === 402) {
      return new Response(JSON.stringify({ error: "Créditos de IA esgotados." }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!aiResp.ok) {
      const t = await aiResp.text();
      throw new Error(`AI gateway: ${aiResp.status} ${t}`);
    }

    const aiJson = await aiResp.json();
    const toolCall = aiJson.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("AI não retornou tool_call");
    const args = JSON.parse(toolCall.function.arguments);
    const actions: CoachingItem[] = (args.actions ?? []).slice(0, 10);

    // Idempotente: remove pending antigos da mesma recording (mantém accepted/practiced)
    await supabase
      .from("coaching_actions")
      .delete()
      .eq("recording_id", recording_id)
      .eq("status", "pending")
      .eq("created_by_ai", true);

    const rows = actions.map((a) => ({
      recording_id,
      salesperson_id: rec.salesperson_id,
      tip: a.tip,
      category: ALLOWED_CATEGORIES.includes(a.category) ? a.category : "other",
      severity: ALLOWED_SEVERITY.includes(a.severity) ? a.severity : "info",
      timestamp_sec: a.timestamp_sec != null ? Math.max(0, Math.round(a.timestamp_sec)) : null,
      quote: a.quote ?? null,
      status: "pending",
      created_by_ai: true,
    }));

    if (rows.length > 0) {
      const { error: insErr } = await supabase.from("coaching_actions").insert(rows);
      if (insErr) throw insErr;
    }

    return new Response(
      JSON.stringify({ recording_id, actions_count: rows.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("extract-coaching-actions error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
