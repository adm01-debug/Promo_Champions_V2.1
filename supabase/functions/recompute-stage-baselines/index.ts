import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.4";



function percentile(sorted: number[], p: number): number {
  if (!sorted.length) return 0;
  const idx = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
  return sorted[idx];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const { data: transitions, error } = await supabase
      .from("deal_stage_transitions")
      .select("to_stage, duration_hours")
      .not("duration_hours", "is", null)
      .gte("entered_at", since);

    if (error) throw error;

    const byStage = new Map<string, number[]>();
    for (const t of transitions || []) {
      const dur = Number(t.duration_hours);
      if (!isFinite(dur) || dur < 0) continue;
      if (!byStage.has(t.to_stage)) byStage.set(t.to_stage, []);
      byStage.get(t.to_stage)!.push(dur);
    }

    const upserts: Array<Record<string, unknown>> = [];
    for (const [stage, arr] of byStage.entries()) {
      arr.sort((a, b) => a - b);
      upserts.push({
        stage,
        segment: "all",
        p50_hours: Number(percentile(arr, 50).toFixed(2)),
        p75_hours: Number(percentile(arr, 75).toFixed(2)),
        p90_hours: Number(percentile(arr, 90).toFixed(2)),
        sample_size: arr.length,
        computed_at: new Date().toISOString(),
      });
    }

    if (upserts.length) {
      const { error: upErr } = await supabase
        .from("stage_velocity_baselines")
        .upsert(upserts, { onConflict: "stage,segment" });
      if (upErr) throw upErr;
    }

    return new Response(JSON.stringify({ ok: true, baselines: upserts.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("recompute-stage-baselines error", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
