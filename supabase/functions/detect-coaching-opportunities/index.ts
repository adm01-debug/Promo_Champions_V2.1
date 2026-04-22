import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";

interface MetricRow {
  salesperson_id: string;
  metric_key: string;
  metric_label: string;
  current_value: number;
  skill_focus: string;
}

const METRICS_META: Record<string, { label: string; skill: string; higherIsBetter: boolean }> = {
  conversion_rate: { label: "Taxa de Conversão", skill: "qualification", higherIsBetter: true },
  stage_duration: { label: "Duração Média no Estágio (dias)", skill: "negotiation", higherIsBetter: false },
  win_rate: { label: "Win Rate", skill: "closing", higherIsBetter: true },
  avg_ticket: { label: "Ticket Médio", skill: "negotiation", higherIsBetter: true },
  activities_per_day: { label: "Atividades por Dia", skill: "prospecting", higherIsBetter: true },
};

function severityFromGap(gap: number): "low" | "medium" | "high" | "critical" {
  const abs = Math.abs(gap);
  if (abs >= 40) return "critical";
  if (abs >= 25) return "high";
  if (abs >= 10) return "medium";
  return "low";
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function quartile75(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.floor(sorted.length * 0.75);
  return sorted[Math.min(idx, sorted.length - 1)];
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const since = new Date(Date.now() - 90 * 86400000).toISOString();

    const [{ data: salespeople }, { data: sales }, { data: activities }] = await Promise.all([
      supabase.from("salespeople").select("id, name, is_active").eq("is_active", true),
      supabase.from("sales").select("id, salesperson_id, status, amount, created_at, updated_at").gte("created_at", since),
      supabase.from("activities").select("id, salesperson_id, created_at").gte("created_at", since),
    ]);

    const reps = salespeople ?? [];
    const allSales = sales ?? [];
    const allActs = activities ?? [];

    // Per-rep metrics
    const repMetrics: Record<string, Record<string, number>> = {};
    for (const sp of reps) {
      const myDeals = allSales.filter((d) => d.salesperson_id === sp.id);
      const won = myDeals.filter((d) => d.status === "completed");
      const lost = myDeals.filter((d) => d.status === "lost");
      const myActs = allActs.filter((a) => a.salesperson_id === sp.id).length;

      const conversion_rate = myDeals.length > 0 ? (won.length / myDeals.length) * 100 : 0;
      const win_rate = (won.length + lost.length) > 0 ? (won.length / (won.length + lost.length)) * 100 : 0;
      const avg_ticket = won.length > 0 ? won.reduce((s, d) => s + Number(d.amount ?? 0), 0) / won.length : 0;
      const activities_per_day = myActs / 90;
      const stageDurations = myDeals
        .filter((d) => d.updated_at && d.created_at)
        .map((d) => (new Date(d.updated_at).getTime() - new Date(d.created_at).getTime()) / 86400000);
      const stage_duration = median(stageDurations);

      repMetrics[sp.id] = { conversion_rate, win_rate, avg_ticket, activities_per_day, stage_duration };
    }

    // Team benchmarks
    const benchmarks: Record<string, { team_avg: number; top_quartile: number; sample_size: number }> = {};
    for (const key of Object.keys(METRICS_META)) {
      const values = Object.values(repMetrics).map((m) => m[key]).filter((v) => Number.isFinite(v));
      const team_avg = values.length > 0 ? values.reduce((s, v) => s + v, 0) / values.length : 0;
      benchmarks[key] = { team_avg, top_quartile: quartile75(values), sample_size: values.length };
    }

    // Upsert benchmarks
    await supabase.from("coaching_skill_benchmarks").upsert(
      Object.entries(benchmarks).map(([metric_key, b]) => ({
        metric_key,
        team_avg: b.team_avg,
        top_quartile: b.top_quartile,
        sample_size: b.sample_size,
        computed_at: new Date().toISOString(),
      })),
      { onConflict: "metric_key" },
    );

    // Detect gaps per rep
    const opportunities: Array<MetricRow & { gap: number; severity: string; priority: number; recommended_action: string }> = [];

    for (const sp of reps) {
      const metrics = repMetrics[sp.id];
      const gaps: Array<{ key: string; gap: number; current: number; benchmark: number }> = [];
      for (const [key, meta] of Object.entries(METRICS_META)) {
        const current = metrics[key];
        const benchmark = benchmarks[key].team_avg;
        if (benchmark === 0) continue;
        // For higherIsBetter=false, invert
        const rawGap = ((benchmark - current) / benchmark) * 100;
        const gap = meta.higherIsBetter ? rawGap : -rawGap;
        if (gap > 5) gaps.push({ key, gap, current, benchmark });
      }
      gaps.sort((a, b) => b.gap - a.gap);
      const topGaps = gaps.slice(0, 3);

      // AI recommendations
      let aiActions: string[] = [];
      const apiKey = Deno.env.get("LOVABLE_API_KEY");
      if (apiKey && topGaps.length > 0) {
        try {
          const prompt = `Vendedor: ${sp.name}. Top ${topGaps.length} gaps de performance vs equipe:\n${topGaps.map((g, i) => `${i + 1}. ${METRICS_META[g.key].label}: atual ${g.current.toFixed(2)}, equipe ${g.benchmark.toFixed(2)} (gap ${g.gap.toFixed(0)}%)`).join("\n")}\n\nGere uma ação de coaching curta e específica (máx 120 chars) para CADA gap. Responda em JSON: {"actions": ["ação 1", "ação 2", "ação 3"]}`;
          const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              messages: [
                { role: "system", content: "Você é um coach de vendas. Responda apenas JSON válido." },
                { role: "user", content: prompt },
              ],
              response_format: { type: "json_object" },
            }),
          });
          if (aiRes.ok) {
            const j = await aiRes.json();
            const content = j.choices?.[0]?.message?.content ?? "{}";
            const parsed = JSON.parse(content);
            aiActions = Array.isArray(parsed.actions) ? parsed.actions.slice(0, 3) : [];
          }
        } catch (e) {
          console.error("AI error for", sp.id, e);
        }
      }

      topGaps.forEach((g, i) => {
        opportunities.push({
          salesperson_id: sp.id,
          metric_key: g.key,
          metric_label: METRICS_META[g.key].label,
          current_value: g.current,
          skill_focus: METRICS_META[g.key].skill,
          gap: g.gap,
          severity: severityFromGap(g.gap),
          priority: i + 1,
          recommended_action: aiActions[i] ?? `Revisar ${METRICS_META[g.key].label.toLowerCase()} com gestor`,
        });
      });
    }

    // Insert opportunities (use today date as part of unique key)
    if (opportunities.length > 0) {
      const today = new Date().toISOString().slice(0, 10);
      // Delete existing today entries to allow re-run
      await supabase
        .from("coaching_opportunities")
        .delete()
        .gte("detected_at", `${today}T00:00:00Z`)
        .lte("detected_at", `${today}T23:59:59Z`);

      const rows = opportunities.map((o) => ({
        salesperson_id: o.salesperson_id,
        metric_key: o.metric_key,
        metric_label: o.metric_label,
        current_value: o.current_value,
        team_benchmark: benchmarks[o.metric_key].team_avg,
        severity: o.severity,
        skill_focus: o.skill_focus,
        recommended_action: o.recommended_action,
        priority: o.priority,
      }));
      const { error: insErr } = await supabase.from("coaching_opportunities").insert(rows);
      if (insErr) console.error("insert err", insErr);
    }

    return new Response(
      JSON.stringify({
        success: true,
        reps_analyzed: reps.length,
        opportunities_detected: opportunities.length,
        critical_count: opportunities.filter((o) => o.severity === "critical").length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("detect-coaching-opportunities error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
