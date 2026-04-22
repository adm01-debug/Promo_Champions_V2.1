import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";

interface AnalysisRequest {
  interactionId?: string;
  text: string;
  contactName?: string;
  channel?: string;
  dealId?: string;
}

interface AnalysisResult {
  disc: { primary: string; secondary: string; scores: Record<string, number>; description: string };
  emotional_intelligence: { score: number; empathy: number; self_awareness: number; social_skills: number; notes: string };
  cognitive_biases: Array<{ bias: string; evidence: string; severity: 'low' | 'medium' | 'high' }>;
  summary: string;
  recommended_approach: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { interactionId, text, contactName, channel, dealId } = (await req.json()) as AnalysisRequest;

    if (!text || text.length < 100) {
      return new Response(
        JSON.stringify({ error: "Text must be at least 100 characters", skipped: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `Você é um analista comportamental sênior em vendas B2B. Analise a interação a seguir e retorne JSON estrito com:
- disc: perfil DISC (Dominância, Influência, Estabilidade, Conformidade) — primary, secondary, scores 0-100, description curta
- emotional_intelligence: score geral 0-100, empathy 0-100, self_awareness 0-100, social_skills 0-100, notes
- cognitive_biases: array de vieses cognitivos detectados (ancoragem, confirmação, aversão a perdas, etc) com evidence e severity
- summary: resumo executivo (1-2 frases)
- recommended_approach: abordagem recomendada para o vendedor

Retorne APENAS JSON válido, sem markdown.`;

    const userPrompt = `Contato: ${contactName ?? "N/A"} | Canal: ${channel ?? "N/A"}\n\nInteração:\n"""${text}"""`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (aiRes.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (aiRes.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted" }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!aiRes.ok) throw new Error(`AI gateway error: ${aiRes.status}`);

    const aiData = await aiRes.json();
    const content = aiData.choices?.[0]?.message?.content ?? "{}";
    const analysis: AnalysisResult = JSON.parse(content);

    // Persist analysis when an interactionId is provided
    if (interactionId) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      );

      await supabase.from("automation_runs").insert({
        workflow_id: "00000000-0000-0000-0000-000000000000",
        status: "completed",
        completed_at: new Date().toISOString(),
        trigger_payload: { interactionId, dealId, channel, length: text.length },
        actions_executed: { analysis },
      });
    }

    console.log("Behavioral analysis completed", {
      length: text.length,
      disc: analysis.disc?.primary,
      eq: analysis.emotional_intelligence?.score,
    });

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("behavioral-analysis error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
