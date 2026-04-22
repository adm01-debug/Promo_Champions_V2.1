import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

interface Analysis {
  outcome: string;
  primary_reason: string | null;
  competitor: string | null;
  lost_stage: string | null;
  cycle_days: number | null;
  amount: number | null;
  segment: string | null;
}

function aggregate(rows: Analysis[]) {
  const winFactors = new Map<string, { count: number; cycle: number[]; amt: number[] }>();
  const lossFactors = new Map<string, { count: number; cycle: number[]; amt: number[] }>();
  const stuckStages = new Map<string, { count: number; cycle: number[]; amt: number[] }>();
  const competitors = new Map<string, { encounters: number; wins: number; cycle: number[]; amt: number[] }>();
  const segments = new Map<string, { wins: number; losses: number }>();

  for (const r of rows) {
    const key = r.primary_reason ?? "Não informado";
    const cycle = r.cycle_days ?? 0;
    const amt = r.amount ?? 0;
    const target = r.outcome === "won" ? winFactors : lossFactors;
    const e = target.get(key) ?? { count: 0, cycle: [], amt: [] };
    e.count++; e.cycle.push(cycle); e.amt.push(amt);
    target.set(key, e);

    if (r.outcome === "lost" && r.lost_stage) {
      const s = stuckStages.get(r.lost_stage) ?? { count: 0, cycle: [], amt: [] };
      s.count++; s.cycle.push(cycle); s.amt.push(amt);
      stuckStages.set(r.lost_stage, s);
    }
    if (r.competitor) {
      const c = competitors.get(r.competitor) ?? { encounters: 0, wins: 0, cycle: [], amt: [] };
      c.encounters++; if (r.outcome === "won") c.wins++;
      c.cycle.push(cycle); c.amt.push(amt);
      competitors.set(r.competitor, c);
    }
    if (r.segment) {
      const sg = segments.get(r.segment) ?? { wins: 0, losses: 0 };
      if (r.outcome === "won") sg.wins++; else sg.losses++;
      segments.set(r.segment, sg);
    }
  }

  const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
  const total = rows.length || 1;

  const patterns: Array<Record<string, unknown>> = [];
  for (const [label, v] of winFactors) {
    patterns.push({ pattern_type: "win_factor", label, outcome: "won", frequency: v.count, win_rate: 100, avg_cycle_days: avg(v.cycle), avg_amount: avg(v.amt), confidence: Math.min(100, (v.count / total) * 100 * 2) });
  }
  for (const [label, v] of lossFactors) {
    patterns.push({ pattern_type: "loss_factor", label, outcome: "lost", frequency: v.count, win_rate: 0, avg_cycle_days: avg(v.cycle), avg_amount: avg(v.amt), confidence: Math.min(100, (v.count / total) * 100 * 2) });
  }
  for (const [label, v] of stuckStages) {
    patterns.push({ pattern_type: "stuck_stage", label, outcome: "lost", frequency: v.count, win_rate: 0, avg_cycle_days: avg(v.cycle), avg_amount: avg(v.amt), confidence: Math.min(100, (v.count / total) * 100 * 2) });
  }
  for (const [label, v] of competitors) {
    patterns.push({ pattern_type: "competitor", label, outcome: null, frequency: v.encounters, win_rate: v.encounters ? (v.wins / v.encounters) * 100 : 0, avg_cycle_days: avg(v.cycle), avg_amount: avg(v.amt), confidence: Math.min(100, (v.encounters / total) * 100 * 2) });
  }
  for (const [label, v] of segments) {
    const tot = v.wins + v.losses;
    patterns.push({ pattern_type: "icp_match", label, outcome: null, frequency: tot, win_rate: tot ? (v.wins / tot) * 100 : 0, avg_cycle_days: 0, avg_amount: 0, confidence: Math.min(100, (tot / total) * 100 * 2) });
  }
  return patterns;
}

async function generateInsights(patterns: Array<Record<string, unknown>>, totalRows: number): Promise<Array<Record<string, unknown>>> {
  if (!LOVABLE_API_KEY || patterns.length === 0) return [];
  try {
    const top = patterns.slice().sort((a, b) => (b.frequency as number) - (a.frequency as number)).slice(0, 20);
    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Você é um analista de vendas B2B. Gere 3-5 insights acionáveis em PT-BR a partir de padrões de win/loss. Use tool call." },
          { role: "user", content: `Total deals analisados: ${totalRows}\nPadrões:\n${JSON.stringify(top)}` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "emit_insights",
            description: "Emite insights acionáveis",
            parameters: {
              type: "object",
              properties: {
                insights: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      insight_type: { type: "string", enum: ["win_pattern", "loss_pattern", "competitor", "icp", "process"] },
                      title: { type: "string" },
                      description: { type: "string", description: "Recomendação acionável em 1-2 frases" },
                      severity: { type: "string", enum: ["info", "opportunity", "risk"] },
                    },
                    required: ["insight_type", "title", "description", "severity"],
                  },
                },
              },
              required: ["insights"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "emit_insights" } },
      }),
    });
    if (!resp.ok) throw new Error(`AI ${resp.status}`);
    const data = await resp.json();
    const args = JSON.parse(data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments ?? "{}");
    return Array.isArray(args.insights)
      ? args.insights.slice(0, 5).map((i: Record<string, unknown>) => ({ ...i, evidence: { sample_size: totalRows, top_patterns: top.slice(0, 5) } }))
      : [];
  } catch (e) {
    console.error("AI insights error", e);
    return [];
  }
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
    const { data: rows, error } = await admin
      .from("win_loss_analyses")
      .select("outcome,primary_reason,competitor,lost_stage,cycle_days,amount,segment");
    if (error) throw error;

    const analyses = (rows as Analysis[] | null) ?? [];
    const patterns = aggregate(analyses).map(p => ({ ...p, computed_at: new Date().toISOString() }));

    // Replace patterns: delete then insert
    await admin.from("win_loss_patterns").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (patterns.length) await admin.from("win_loss_patterns").insert(patterns);

    const insights = await generateInsights(patterns, analyses.length);
    await admin.from("win_loss_insights").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (insights.length) await admin.from("win_loss_insights").insert(insights);

    return new Response(JSON.stringify({ ok: true, patterns: patterns.length, insights: insights.length, analyzed: analyses.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("mine-win-loss-patterns error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
