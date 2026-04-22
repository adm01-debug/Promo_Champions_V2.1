import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";

interface Body { recording_id: string }

const DIM_LABELS: Record<string, string> = {
  talk: "Talk Ratio & Pace",
  questions: "Qualidade de Perguntas",
  objections: "Tratamento de Objeções",
  sentiment: "Sentimento da Call",
  moments: "Momentos Críticos",
};

const RECS: Record<string, string[]> = {
  talk: [
    "Reduza monólogos: faça pausas a cada 30s para dar espaço ao cliente.",
    "Mire em 40-50% de fala do vendedor; ouça mais nos primeiros 5min.",
    "Diminua interrupções — espere 1s após o cliente terminar.",
  ],
  questions: [
    "Aumente perguntas abertas (como/por que) nos primeiros 5min.",
    "Faça perguntas de descoberta de dor antes de apresentar solução.",
    "Distribua perguntas ao longo da call, não só no início.",
  ],
  objections: [
    "Pratique o framework Acknowledge → Reframe → Resolve com casos reais.",
    "Tenha provas/cases prontos para objeções de preço e timing.",
    "Reduza o tempo de resposta a objeções; reconheça antes de argumentar.",
  ],
  sentiment: [
    "Demonstre mais empatia em momentos negativos do cliente.",
    "Recupere sentimento com perguntas sobre prioridades.",
    "Encerre a call com tom positivo + próximos passos claros.",
  ],
  moments: [
    "Trate sinais de risco (silêncio, frustração) imediatamente.",
    "Confirme entendimento após momentos críticos detectados.",
    "Faça follow-up rápido em momentos com decisão pendente.",
  ],
};

function classifyHealth(s: number): "poor"|"fair"|"good"|"excellent" {
  if (s >= 80) return "excellent";
  if (s >= 60) return "good";
  if (s >= 40) return "fair";
  return "poor";
}

function metricsHealthScore(h: string | null | undefined): number {
  return ({ excellent: 90, good: 70, fair: 50, poor: 25 } as Record<string, number>)[h ?? ""] ?? 50;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { recording_id }: Body = await req.json();
    if (!recording_id) {
      return new Response(JSON.stringify({ error: "recording_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const [recRes, metricsRes, qRes, objRes, sentRes, momRes] = await Promise.all([
      supabase.from("call_recordings").select("id, salesperson_id, sentiment").eq("id", recording_id).maybeSingle(),
      supabase.from("call_conversation_metrics").select("engagement_score, pace_score, health").eq("recording_id", recording_id).maybeSingle(),
      supabase.from("call_question_analysis").select("quality_score, health").eq("recording_id", recording_id).maybeSingle(),
      supabase.from("call_objection_analysis").select("handling_score, health").eq("recording_id", recording_id).maybeSingle(),
      supabase.from("call_sentiment_timeline").select("sentiment_score").eq("recording_id", recording_id),
      supabase.from("call_critical_moments").select("severity").eq("recording_id", recording_id),
    ]);

    const rec = recRes.data;
    if (!rec) {
      return new Response(JSON.stringify({ error: "recording not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const talk_score = metricsRes.data
      ? Math.round((Number(metricsRes.data.engagement_score ?? 0) + Number(metricsRes.data.pace_score ?? 0)) / 2)
      : metricsHealthScore(metricsRes.data?.health);
    const question_score = qRes.data ? Number(qRes.data.quality_score ?? 0) : 50;
    const objection_score = objRes.data ? Number(objRes.data.handling_score ?? 0) : 60;

    const sentRows = sentRes.data ?? [];
    const sentiment_score = sentRows.length > 0
      ? Math.round(((sentRows.reduce((s, r) => s + Number(r.sentiment_score ?? 0), 0) / sentRows.length) + 1) * 50)
      : ({ positive: 80, neutral: 55, negative: 30 } as Record<string, number>)[rec.sentiment ?? "neutral"] ?? 55;

    const moments = momRes.data ?? [];
    const critical = moments.filter((m) => m.severity === "critical").length;
    const warnings = moments.filter((m) => m.severity === "warning").length;
    const moments_score = Math.max(0, 100 - critical * 20 - warnings * 8);

    const overall_score = Math.round(
      talk_score * 0.20 + question_score * 0.25 + objection_score * 0.25 +
      sentiment_score * 0.15 + moments_score * 0.15,
    );
    const health = classifyHealth(overall_score);

    const dims = [
      { key: "talk", score: talk_score },
      { key: "questions", score: question_score },
      { key: "objections", score: objection_score },
      { key: "sentiment", score: sentiment_score },
      { key: "moments", score: moments_score },
    ];
    const sortedDesc = [...dims].sort((a, b) => b.score - a.score);
    const sortedAsc = [...dims].sort((a, b) => a.score - b.score);

    const top_strengths = sortedDesc.slice(0, 2).map((d) => ({
      key: d.key, label: DIM_LABELS[d.key], score: d.score,
    }));
    const top_gaps = sortedAsc.slice(0, 2).map((d) => ({
      key: d.key, label: DIM_LABELS[d.key], score: d.score,
    }));

    const recommendations: { category: string; tip: string; priority: number }[] = [];
    top_gaps.forEach((g, idx) => {
      (RECS[g.key] ?? []).slice(0, 2).forEach((tip, i) => {
        recommendations.push({ category: g.key, tip, priority: idx * 10 + i });
      });
    });

    await supabase.from("call_coaching_scorecards").upsert({
      recording_id,
      salesperson_id: rec.salesperson_id,
      overall_score, talk_score, question_score, objection_score, sentiment_score, moments_score,
      health,
      top_strengths, top_gaps, recommendations: recommendations.slice(0, 5),
      factors: { critical_moments: critical, warning_moments: warnings, sentiment_samples: sentRows.length },
      calculated_at: new Date().toISOString(),
    }, { onConflict: "recording_id" });

    // Aggregate for salesperson (rolling 30d vs prior 30d)
    if (rec.salesperson_id) {
      const now = new Date();
      const start = new Date(now); start.setDate(start.getDate() - 30);
      const prevStart = new Date(now); prevStart.setDate(prevStart.getDate() - 60);

      const { data: scores } = await supabase
        .from("call_coaching_scorecards")
        .select("overall_score, talk_score, question_score, objection_score, sentiment_score, top_gaps, calculated_at")
        .eq("salesperson_id", rec.salesperson_id)
        .gte("calculated_at", prevStart.toISOString());

      const all = scores ?? [];
      const recent = all.filter((s) => new Date(s.calculated_at) >= start);
      const prior = all.filter((s) => new Date(s.calculated_at) < start);

      const avg = (arr: typeof all, k: keyof typeof all[number]) =>
        arr.length ? arr.reduce((s, r) => s + Number(r[k] ?? 0), 0) / arr.length : 0;

      const avg_overall = avg(recent, "overall_score");
      const prev_overall = avg(prior, "overall_score");
      const trend_delta = avg_overall - prev_overall;
      const trend_direction = trend_delta > 3 ? "up" : trend_delta < -3 ? "down" : "flat";

      const gapCounts = new Map<string, number>();
      recent.forEach((s) => {
        const gaps = (s.top_gaps as { key: string }[]) ?? [];
        gaps.forEach((g) => gapCounts.set(g.key, (gapCounts.get(g.key) ?? 0) + 1));
      });
      const top_recurring_gap = [...gapCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

      await supabase.from("salesperson_coaching_aggregates").upsert({
        salesperson_id: rec.salesperson_id,
        period_start: start.toISOString().slice(0, 10),
        period_end: now.toISOString().slice(0, 10),
        calls_analyzed: recent.length,
        avg_overall: Math.round(avg_overall * 10) / 10,
        avg_talk: Math.round(avg(recent, "talk_score") * 10) / 10,
        avg_questions: Math.round(avg(recent, "question_score") * 10) / 10,
        avg_objections: Math.round(avg(recent, "objection_score") * 10) / 10,
        avg_sentiment: Math.round(avg(recent, "sentiment_score") * 10) / 10,
        trend_direction,
        trend_delta: Math.round(trend_delta * 10) / 10,
        top_recurring_gap,
        last_calculated_at: new Date().toISOString(),
      }, { onConflict: "salesperson_id" });
    }

    return new Response(JSON.stringify({ recording_id, overall_score, health }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
