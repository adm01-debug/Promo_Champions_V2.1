import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";

interface RecordingRow {
  id: string;
  title: string;
  duration_seconds: number | null;
  recorded_at: string;
  status: string;
  salesperson_id: string;
  client_id: string | null;
  sale_id: string | null;
}

interface InsightRow {
  recording_id: string;
  sentiment_score: number | null;
  sentiment_label: string | null;
  talk_ratio_salesperson: number | null;
  talk_ratio_client: number | null;
  questions_asked: number | null;
  summary: string | null;
  topics: unknown;
  objections: unknown;
  next_steps: unknown;
  coaching_tips: unknown;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization") ?? "";

    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser();
    if (!userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceKey);
    const url = new URL(req.url);
    const days = Number(url.searchParams.get("days") ?? "30");
    const since = new Date(Date.now() - days * 86400_000).toISOString();

    const { data: recordings, error: recErr } = await admin
      .from("call_recordings")
      .select("id,title,duration_seconds,recorded_at,status,salesperson_id,client_id,sale_id")
      .gte("recorded_at", since)
      .order("recorded_at", { ascending: false })
      .limit(200);
    if (recErr) throw recErr;

    const ids = (recordings ?? []).map((r: RecordingRow) => r.id);
    let insights: InsightRow[] = [];
    if (ids.length > 0) {
      const { data: ins, error: insErr } = await admin
        .from("call_insights")
        .select("*")
        .in("recording_id", ids);
      if (insErr) throw insErr;
      insights = (ins ?? []) as InsightRow[];
    }

    const insightMap = new Map(insights.map((i) => [i.recording_id, i]));

    let totalDuration = 0;
    let analyzedCount = 0;
    let sentimentSum = 0;
    let talkRatioSum = 0;
    let questionsSum = 0;
    const sentimentBuckets = { positive: 0, neutral: 0, negative: 0 };
    const objectionTally: Record<string, number> = {};
    const topicTally: Record<string, number> = {};

    const items = (recordings ?? []).map((r: RecordingRow) => {
      totalDuration += r.duration_seconds ?? 0;
      const ins = insightMap.get(r.id);
      if (ins) {
        analyzedCount++;
        if (ins.sentiment_score != null) sentimentSum += Number(ins.sentiment_score);
        if (ins.talk_ratio_salesperson != null) talkRatioSum += Number(ins.talk_ratio_salesperson);
        if (ins.questions_asked != null) questionsSum += ins.questions_asked;
        const lbl = (ins.sentiment_label ?? "neutral").toLowerCase();
        if (lbl in sentimentBuckets) sentimentBuckets[lbl as keyof typeof sentimentBuckets]++;
        const objs = Array.isArray(ins.objections) ? ins.objections : [];
        for (const o of objs as unknown[]) {
          const key = typeof o === "string" ? o : (o as { type?: string })?.type ?? "outras";
          objectionTally[key] = (objectionTally[key] ?? 0) + 1;
        }
        const tps = Array.isArray(ins.topics) ? ins.topics : [];
        for (const t of tps as unknown[]) {
          const key = typeof t === "string" ? t : (t as { name?: string })?.name ?? "geral";
          topicTally[key] = (topicTally[key] ?? 0) + 1;
        }
      }
      return {
        id: r.id,
        title: r.title,
        duration_seconds: r.duration_seconds ?? 0,
        recorded_at: r.recorded_at,
        status: r.status,
        salesperson_id: r.salesperson_id,
        sentiment_label: ins?.sentiment_label ?? null,
        sentiment_score: ins?.sentiment_score ?? null,
        talk_ratio_salesperson: ins?.talk_ratio_salesperson ?? null,
        talk_ratio_client: ins?.talk_ratio_client ?? null,
        questions_asked: ins?.questions_asked ?? null,
        summary: ins?.summary ?? null,
        objections_count: Array.isArray(ins?.objections) ? (ins!.objections as unknown[]).length : 0,
        next_steps_count: Array.isArray(ins?.next_steps) ? (ins!.next_steps as unknown[]).length : 0,
        has_insights: !!ins,
      };
    });

    const top = (obj: Record<string, number>) =>
      Object.entries(obj)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([label, count]) => ({ label, count }));

    return new Response(
      JSON.stringify({
        horizon_days: days,
        kpis: {
          total_calls: recordings?.length ?? 0,
          analyzed_calls: analyzedCount,
          total_duration_minutes: Math.round(totalDuration / 60),
          avg_duration_minutes:
            recordings && recordings.length > 0
              ? Math.round(totalDuration / recordings.length / 60)
              : 0,
          avg_sentiment: analyzedCount > 0 ? Number((sentimentSum / analyzedCount).toFixed(2)) : 0,
          avg_talk_ratio_salesperson:
            analyzedCount > 0 ? Math.round((talkRatioSum / analyzedCount) * 100) / 100 : 0,
          avg_questions_per_call: analyzedCount > 0 ? Math.round(questionsSum / analyzedCount) : 0,
          coverage_percent:
            recordings && recordings.length > 0
              ? Math.round((analyzedCount / recordings.length) * 100)
              : 0,
        },
        sentiment_distribution: sentimentBuckets,
        top_objections: top(objectionTally),
        top_topics: top(topicTally),
        recordings: items,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
