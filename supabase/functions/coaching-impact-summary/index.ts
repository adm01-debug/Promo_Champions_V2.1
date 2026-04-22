import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";

interface ImpactRow {
  session_id: string;
  salesperson_id: string;
  coach_id: string;
  completed_at: string;
  focus_skills: string[] | null;
  outcome_rating: number | null;
  pre_avg_overall: number;
  post_avg_overall: number;
  delta_overall: number;
  pre_conversion: number;
  post_conversion: number;
  delta_conversion: number;
  pre_ticket: number;
  post_ticket: number;
  delta_ticket: number;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } } },
    );

    const { data, error } = await supabase
      .from("coaching_impact_metrics")
      .select("*")
      .order("completed_at", { ascending: false })
      .limit(200);

    if (error) throw error;

    const rows = (data ?? []) as ImpactRow[];
    const total_sessions = rows.length;

    const avg = (k: keyof ImpactRow) =>
      total_sessions
        ? rows.reduce((s, r) => s + (Number(r[k]) || 0), 0) / total_sessions
        : 0;

    const avg_delta_overall = avg("delta_overall");
    const avg_delta_conversion = avg("delta_conversion");
    const avg_delta_ticket = avg("delta_ticket");

    // ROI estimate: extra revenue from delta_ticket * post_conversion uplift
    const roi_estimate = rows.reduce((sum, r) => {
      const ticketGain = (r.post_ticket - r.pre_ticket) || 0;
      const convUplift = Math.max(0, r.post_conversion - r.pre_conversion);
      return sum + ticketGain * convUplift * 10; // 10 deals proxy/window
    }, 0);

    // Top impactful sessions
    const top_sessions = [...rows]
      .sort((a, b) => b.delta_overall - a.delta_overall)
      .slice(0, 10);

    // Skill heatmap: avg delta per focus skill
    const skillMap = new Map<string, { sum: number; count: number }>();
    for (const r of rows) {
      for (const sk of r.focus_skills ?? []) {
        const cur = skillMap.get(sk) ?? { sum: 0, count: 0 };
        cur.sum += r.delta_overall;
        cur.count += 1;
        skillMap.set(sk, cur);
      }
    }
    const skill_impact = Array.from(skillMap.entries())
      .map(([skill, v]) => ({ skill, avg_delta: v.sum / v.count, sessions: v.count }))
      .sort((a, b) => b.avg_delta - a.avg_delta);

    // Timeline: monthly avg delta
    const monthly = new Map<string, { sum: number; count: number }>();
    for (const r of rows) {
      const key = r.completed_at.slice(0, 7);
      const cur = monthly.get(key) ?? { sum: 0, count: 0 };
      cur.sum += r.delta_overall;
      cur.count += 1;
      monthly.set(key, cur);
    }
    const timeline = Array.from(monthly.entries())
      .map(([month, v]) => ({ month, avg_delta: v.sum / v.count, sessions: v.count }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return new Response(
      JSON.stringify({
        summary: {
          total_sessions,
          avg_delta_overall,
          avg_delta_conversion,
          avg_delta_ticket,
          roi_estimate,
        },
        top_sessions,
        skill_impact,
        timeline,
        rows,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
