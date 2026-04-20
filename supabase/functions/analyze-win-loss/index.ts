import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/cors.ts";

interface SaleRow {
  id: string;
  status: string;
  amount: number | null;
  stage: string | null;
  segment: string | null;
  notes: string | null;
  loss_reason: string | null;
  competitor_name: string | null;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
}

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

async function classifyWithAI(notes: string, outcome: string): Promise<{ primary: string; secondary: string[]; competitor: string | null }> {
  if (!LOVABLE_API_KEY || !notes || notes.length < 10) {
    return { primary: outcome === "won" ? "Não classificado" : "Não informado", secondary: [], competitor: null };
  }
  try {
    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Você classifica motivos de vitória/derrota de deals B2B em PT-BR. Responda APENAS via tool call." },
          { role: "user", content: `Outcome: ${outcome}\nNotas: ${notes.slice(0, 1500)}` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "classify_outcome",
            description: "Classifica motivo do outcome",
            parameters: {
              type: "object",
              properties: {
                primary_reason: { type: "string", description: "Motivo principal em 2-4 palavras (ex: Preço alto, Bom relacionamento, Sem orçamento)" },
                secondary_reasons: { type: "array", items: { type: "string" }, description: "Até 3 motivos adicionais" },
                competitor: { type: "string", description: "Nome do concorrente mencionado, ou string vazia" },
              },
              required: ["primary_reason", "secondary_reasons", "competitor"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "classify_outcome" } },
      }),
    });
    if (!resp.ok) throw new Error(`AI ${resp.status}`);
    const data = await resp.json();
    const args = JSON.parse(data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments ?? "{}");
    return {
      primary: args.primary_reason || "Não classificado",
      secondary: Array.isArray(args.secondary_reasons) ? args.secondary_reasons.slice(0, 3) : [],
      competitor: args.competitor && args.competitor.length > 0 ? args.competitor : null,
    };
  } catch (e) {
    console.error("AI classify error", e);
    return { primary: "Não classificado", secondary: [], competitor: null };
  }
}

function inferSegment(amount: number | null): string {
  if (!amount) return "smb";
  if (amount >= 100000) return "enterprise";
  if (amount >= 25000) return "mid";
  return "smb";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claims, error: authErr } = await supabase.auth.getClaims(authHeader.replace("Bearer ", ""));
    if (authErr || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Mode: explain — returns AI explanation for a single insight, no DB writes.
    let body: { mode?: string; insight_id?: string; title?: string; description?: string } = {};
    try { body = await req.json(); } catch { /* no body */ }

    if (body.mode === "explain") {
      if (!LOVABLE_API_KEY) {
        return new Response(JSON.stringify({ explanation: "IA indisponível no momento." }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      try {
        const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: "Você explica insights de Win/Loss em PT-BR de forma direta e acionável. Use 3-5 frases curtas. Use **negrito** para destacar 1-2 termos-chave. Termine com uma recomendação prática iniciada com 'Recomendação:'." },
              { role: "user", content: `Insight: ${body.title ?? ""}\nDescrição: ${body.description ?? ""}\n\nExplique por que esse padrão acontece e como agir.` },
            ],
          }),
        });
        if (!r.ok) throw new Error(`AI ${r.status}`);
        const j = await r.json();
        const explanation = j.choices?.[0]?.message?.content ?? "Sem explicação disponível.";
        return new Response(JSON.stringify({ explanation }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      } catch (e) {
        console.error("explain error", e);
        return new Response(JSON.stringify({ explanation: "Falha ao gerar explicação." }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    const since = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString();
    const { data: sales, error } = await admin
      .from("sales")
      .select("id,status,amount,stage,segment,notes,loss_reason,competitor_name,created_at,updated_at,closed_at")
      .in("status", ["completed", "lost"])
      .gte("updated_at", since)
      .limit(500);
    if (error) throw error;

    let processed = 0;
    for (const s of (sales as SaleRow[] | null) ?? []) {
      const outcome = s.status === "completed" ? "won" : "lost";
      const closedAt = s.closed_at ?? s.updated_at;
      const cycleDays = closedAt ? (new Date(closedAt).getTime() - new Date(s.created_at).getTime()) / 86400000 : null;

      let primary = outcome === "lost" ? (s.loss_reason ?? "") : "";
      let secondary: string[] = [];
      let competitor = s.competitor_name ?? null;

      if (!primary || (s.notes && s.notes.length > 50)) {
        const ai = await classifyWithAI(s.notes ?? "", outcome);
        if (!primary) primary = ai.primary;
        secondary = ai.secondary;
        if (!competitor) competitor = ai.competitor;
      }

      await admin.from("win_loss_analyses").upsert({
        sale_id: s.id,
        outcome,
        primary_reason: primary || (outcome === "won" ? "Não classificado" : "Não informado"),
        secondary_reasons: secondary,
        competitor,
        lost_stage: outcome === "lost" ? s.stage : null,
        cycle_days: cycleDays,
        amount: s.amount,
        segment: s.segment ?? inferSegment(s.amount),
        analyzed_at: new Date().toISOString(),
      }, { onConflict: "sale_id" });
      processed++;
    }

    return new Response(JSON.stringify({ ok: true, processed }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("analyze-win-loss error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
