import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AnalysisRow { id: string; sale_id: string; outcome: string; primary_reason: string | null; competitor: string | null; lost_stage: string | null; segment: string | null; amount: number | null }

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { analysis_id, salesperson_id } = await req.json();
    if (!analysis_id) {
      return new Response(JSON.stringify({ error: "analysis_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: analysis } = await supabase
      .from("win_loss_analyses")
      .select("id, sale_id, outcome, primary_reason, competitor, lost_stage, segment, amount")
      .eq("id", analysis_id)
      .maybeSingle();

    const a = analysis as AnalysisRow | null;
    if (!a || a.outcome !== "lost") {
      return new Response(JSON.stringify({ skipped: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY missing" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const prompt = `Você é coach de vendas B2B. Um deal foi perdido.
Contexto: motivo=${a.primary_reason ?? "—"}; estágio=${a.lost_stage ?? "—"}; concorrente=${a.competitor ?? "—"}; segmento=${a.segment ?? "—"}; valor=R$${a.amount ?? 0}.
Gere EXATAMENTE 3 lições acionáveis e curtíssimas (máx 18 palavras cada), focadas em evitar repetir o erro. Retorne JSON: {"lessons": ["...", "...", "..."]}.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Coach de vendas. Sempre responda em JSON válido." },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiRes.ok) {
      const t = await aiRes.text();
      console.error("AI gateway error:", aiRes.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error", status: aiRes.status }), {
        status: aiRes.status === 429 || aiRes.status === 402 ? aiRes.status : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const json = await aiRes.json();
    const content = json.choices?.[0]?.message?.content ?? "{}";
    let lessons: string[] = [];
    try {
      const parsed = JSON.parse(content);
      lessons = Array.isArray(parsed.lessons) ? parsed.lessons.slice(0, 3) : [];
    } catch { /* ignore */ }

    if (lessons.length && salesperson_id) {
      await supabase.from("coaching_sessions").insert({
        salesperson_id,
        topic: "Lição de loss automática",
        notes: lessons.map((l, i) => `${i + 1}. ${l}`).join("\n"),
        sentiment: "constructive",
        related_analysis_id: analysis_id,
      }).then(() => null).catch(() => null);
    }

    return new Response(JSON.stringify({ lessons, count: lessons.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-loss-coaching error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
