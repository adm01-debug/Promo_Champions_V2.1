import { corsHeaders } from "../_shared/cors.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.4";



const STAGE_BASELINE: Record<string, number> = {
  lead: 5, pending: 10, prospecting: 15, qualified: 25,
  in_progress: 30, proposal: 50, negotiation: 75, completed: 100,
  won: 100, lost: 0, cancelled: 0,
};

interface SaleRow {
  id: string;
  status: string;
  amount: number | null;
  salesperson_id: string | null;
  category: string | null;
  created_at: string;
  updated_at: string;
}

const isWon = (s: string) => ["completed", "won"].includes(s);
const isLost = (s: string) => ["lost", "cancelled"].includes(s);
const isOpen = (s: string) => !isWon(s) && !isLost(s);

function blendProbability(baseline: number, winRate: number, confidence: number): number {
  // calibrated = baseline*0.3 + winRate*0.7*confidence + baseline*(1-confidence)*0.7
  const w = baseline * 0.3 + winRate * 0.7 * confidence + baseline * (1 - confidence) * 0.7;
  return Math.max(0, Math.min(100, Math.round(w * 100) / 100));
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const lookbackDays = body.lookback_days ?? 180;
    const minSample = body.min_sample ?? 5;

    const since = new Date(Date.now() - lookbackDays * 86400000).toISOString();
    const { data: sales, error } = await supabase
      .from("sales")
      .select("id, status, amount, salesperson_id, category, created_at, updated_at")
      .gte("updated_at", since);
    if (error) throw error;

    const all = (sales ?? []) as SaleRow[];
    const closed = all.filter((s) => isWon(s.status) || isLost(s.status));
    const open = all.filter((s) => isOpen(s.status));

    // Aggregate win rates by scope×stage
    type Bucket = { won: number; lost: number };
    const groups: Record<string, Bucket> = {};
    const key = (scope: string, value: string | null, stage: string) => `${scope}|${value ?? "_"}|${stage}`;

    for (const s of closed) {
      const stage = s.status;
      const isW = isWon(stage);
      const cat = s.category ?? null;
      const owner = s.salesperson_id ?? null;
      const buckets = [
        key("global", null, stage),
        key("owner", owner, stage),
        key("segment", cat, stage),
        key("source", cat, stage), // proxy when no source field
      ];
      for (const k of buckets) {
        if (!groups[k]) groups[k] = { won: 0, lost: 0 };
        if (isW) groups[k].won++;
        else groups[k].lost++;
      }
    }

    const calibrationRows = Object.entries(groups).map(([k, b]) => {
      const [scope, scope_value_raw, stage] = k.split("|");
      const sample = b.won + b.lost;
      const winRate = sample > 0 ? (b.won / sample) * 100 : 0;
      const confidence = Math.min(sample / 30, 1);
      const baseline = STAGE_BASELINE[stage] ?? 20;
      const calibrated = sample >= minSample ? blendProbability(baseline, winRate, confidence) : baseline;
      return {
        scope,
        scope_value: scope_value_raw === "_" ? null : scope_value_raw,
        stage,
        historical_win_rate: Math.round(winRate * 100) / 100,
        sample_size: sample,
        confidence: Math.round(confidence * 100) / 100,
        calibrated_probability: calibrated,
        baseline_probability: baseline,
        calculated_at: new Date().toISOString(),
      };
    });

    if (calibrationRows.length > 0) {
      const { error: upErr } = await supabase
        .from("win_probability_calibrations")
        .upsert(calibrationRows, { onConflict: "scope,scope_value,stage" });
      if (upErr) throw upErr;
    }

    // Build lookup maps
    const calMap: Record<string, typeof calibrationRows[number]> = {};
    for (const c of calibrationRows) calMap[`${c.scope}|${c.scope_value ?? "_"}|${c.stage}`] = c;

    const now = Date.now();
    const dealScores = open.map((s) => {
      const stage = s.status;
      const baseline = STAGE_BASELINE[stage] ?? 20;
      const owner = s.salesperson_id ?? null;
      const cat = s.category ?? null;

      const ownerCal = calMap[`owner|${owner ?? "_"}|${stage}`];
      const segCal = calMap[`segment|${cat ?? "_"}|${stage}`];
      const srcCal = calMap[`source|${cat ?? "_"}|${stage}`];
      const globCal = calMap[`global|_|${stage}`];

      const ownerAdj = ownerCal ? (ownerCal.calibrated_probability - baseline) * ownerCal.confidence : 0;
      const segmentAdj = segCal ? (segCal.calibrated_probability - baseline) * segCal.confidence * 0.5 : 0;
      const sourceAdj = srcCal ? (srcCal.calibrated_probability - baseline) * srcCal.confidence * 0.3 : 0;

      const ageDays = (now - new Date(s.updated_at).getTime()) / 86400000;
      const recencyAdj = ageDays <= 30 ? 5 : ageDays > 90 ? -10 : 0;

      const globalCal = globCal?.calibrated_probability ?? baseline;
      const calibrated = Math.max(1, Math.min(99,
        globalCal + ownerAdj + segmentAdj + sourceAdj + recencyAdj
      ));
      const confidence = Math.min(
        ((ownerCal?.confidence ?? 0) + (segCal?.confidence ?? 0) + (globCal?.confidence ?? 0)) / 3,
        1
      );

      return {
        sale_id: s.id,
        raw_probability: baseline,
        calibrated_probability: Math.round(calibrated * 100) / 100,
        confidence: Math.round(confidence * 100) / 100,
        factors: {
          stage_baseline: baseline,
          global_calibrated: globalCal,
          owner_adj: Math.round(ownerAdj * 100) / 100,
          segment_adj: Math.round(segmentAdj * 100) / 100,
          source_adj: Math.round(sourceAdj * 100) / 100,
          recency_adj: recencyAdj,
        },
        calculated_at: new Date().toISOString(),
      };
    });

    if (dealScores.length > 0) {
      // Insert fresh snapshot per run
      const { error: dsErr } = await supabase.from("deal_probability_scores").insert(dealScores);
      if (dsErr) throw dsErr;
    }

    return new Response(
      JSON.stringify({
        ok: true,
        calibrations_written: calibrationRows.length,
        deal_scores_written: dealScores.length,
        closed_sample: closed.length,
        open_deals: open.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("calibrate-win-probability error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
