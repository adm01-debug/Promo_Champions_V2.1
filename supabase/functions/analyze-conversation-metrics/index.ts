import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";

interface Turn {
  speaker: "seller" | "client" | "unknown";
  text: string;
  word_count: number;
  start_estimate: number;
  duration_estimate: number;
}

function classifyHealth(score: number): "poor" | "fair" | "good" | "excellent" {
  if (score >= 80) return "excellent";
  if (score >= 60) return "good";
  if (score >= 40) return "fair";
  return "poor";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsErr } = await supabase.auth.getClaims(token);
    if (claimsErr || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const recording_id = String(body?.recording_id ?? "");
    if (!recording_id) {
      return new Response(JSON.stringify({ error: "recording_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const service = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: rec, error: recErr } = await service
      .from("call_recordings")
      .select("id, diarization, duration_seconds")
      .eq("id", recording_id)
      .maybeSingle();
    if (recErr || !rec) {
      return new Response(JSON.stringify({ error: "recording not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const turns: Turn[] = Array.isArray(rec.diarization) ? (rec.diarization as Turn[]) : [];
    const totalDuration = Number(rec.duration_seconds ?? 0) ||
      turns.reduce((s, t) => s + (t.duration_estimate ?? 0), 0) || 1;

    let sellerSec = 0, clientSec = 0, sellerWords = 0, clientWords = 0;
    let longestMonologue = 0;
    let interruptions = 0;
    for (let i = 0; i < turns.length; i++) {
      const t = turns[i];
      const dur = Number(t.duration_estimate ?? 0);
      if (t.speaker === "seller") { sellerSec += dur; sellerWords += t.word_count ?? 0; }
      else if (t.speaker === "client") { clientSec += dur; clientWords += t.word_count ?? 0; }
      if (dur > longestMonologue) longestMonologue = dur;
      if (i > 0) {
        const prev = turns[i - 1];
        const gap = (t.start_estimate ?? 0) - ((prev.start_estimate ?? 0) + (prev.duration_estimate ?? 0));
        if (gap < 1 && prev.speaker !== t.speaker && prev.speaker !== "unknown" && t.speaker !== "unknown") {
          interruptions++;
        }
      }
    }

    const sellerRatio = sellerSec / totalDuration;
    const clientRatio = clientSec / totalDuration;
    const silenceRatio = Math.max(0, 1 - sellerRatio - clientRatio);
    const sellerWPM = sellerSec > 0 ? Math.round((sellerWords / sellerSec) * 60) : 0;
    const clientWPM = clientSec > 0 ? Math.round((clientWords / clientSec) * 60) : 0;

    // Pace score: distance from 130-160 ideal
    const idealMid = 145;
    const paceDist = sellerWPM === 0 ? 100 : Math.abs(sellerWPM - idealMid);
    const paceScore = Math.max(0, 100 - paceDist * 1.5);

    // Engagement: talk balance (closer to 0.5 better) + low silence + interruption penalty
    const balance = 1 - Math.abs(sellerRatio - 0.5) * 2; // 1=perfect 0.5/0.5
    const silencePenalty = Math.min(1, silenceRatio / 0.3);
    const interruptionPenalty = Math.min(1, interruptions / 8);
    const monologuePenalty = Math.min(1, longestMonologue / 180);
    const engagement = Math.max(0, Math.min(100,
      balance * 60 + (1 - silencePenalty) * 20 - interruptionPenalty * 10 - monologuePenalty * 10 + 40,
    ));

    const overall = (paceScore + engagement) / 2;
    const health = classifyHealth(overall);

    const factors = {
      balance: Number(balance.toFixed(2)),
      silence_penalty: Number(silencePenalty.toFixed(2)),
      interruption_penalty: Number(interruptionPenalty.toFixed(2)),
      monologue_penalty: Number(monologuePenalty.toFixed(2)),
      pace_distance: paceDist,
      total_turns: turns.length,
    };

    const { error: upErr } = await service
      .from("call_conversation_metrics")
      .upsert({
        recording_id,
        seller_talk_ratio: Number(sellerRatio.toFixed(3)),
        client_talk_ratio: Number(clientRatio.toFixed(3)),
        silence_ratio: Number(silenceRatio.toFixed(3)),
        longest_monologue_seconds: Math.round(longestMonologue),
        interruptions_count: interruptions,
        seller_words_per_minute: sellerWPM,
        client_words_per_minute: clientWPM,
        pace_score: Number(paceScore.toFixed(1)),
        engagement_score: Number(engagement.toFixed(1)),
        health,
        factors,
        calculated_at: new Date().toISOString(),
      }, { onConflict: "recording_id" });

    if (upErr) {
      return new Response(JSON.stringify({ error: upErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({
      recording_id,
      health,
      pace_score: paceScore,
      engagement_score: engagement,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
