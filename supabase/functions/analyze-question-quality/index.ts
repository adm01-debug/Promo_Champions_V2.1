import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";

interface Turn {
  speaker?: string;
  role?: string;
  text?: string;
  start?: number;
  end?: number;
}

const OPEN_PATTERNS = ["como", "por que", "porque", "o que", "qual", "quais", "de que forma", "de que maneira"];
const CLOSED_STARTS = ["é", "tem", "pode", "consegue", "quer", "tá", "está", "tinha", "vai", "foi", "será"];
const DISCOVERY_KEYS = ["hoje", "atualmente", "problema", "desafio", "dificuldade", "processo", "ferramenta"];
const IMPACT_KEYS = ["se", "imagine", "impacto", "consequência", "custo", "perderia", "ganharia", "economiza"];
const LEADING_KEYS = ["não é mesmo", "concorda", "certo?", "verdade?", "né?"];
const NUMBER_RE = /\d+([.,]\d+)?\s*(%|reais|r\$|mil|milhões|m|k|dias|meses|horas)?/i;

function isQuestion(text: string): boolean {
  const t = text.toLowerCase().trim();
  if (t.includes("?")) return true;
  return OPEN_PATTERNS.some((p) => t.startsWith(p + " ") || t.includes(" " + p + " "));
}

function classify(text: string): { category: string; depth: number } {
  const t = text.toLowerCase();
  const isLeading = LEADING_KEYS.some((k) => t.includes(k));
  if (isLeading) return { category: "leading", depth: 1 };

  const isImpact = IMPACT_KEYS.some((k) => new RegExp(`\\b${k}\\b`).test(t));
  if (isImpact) {
    const hasNum = NUMBER_RE.test(t);
    return { category: "impact", depth: hasNum ? 5 : 4 };
  }

  const isOpen = OPEN_PATTERNS.some((p) => t.includes(p));
  if (isOpen) {
    const isDiscovery = DISCOVERY_KEYS.some((k) => t.includes(k));
    if (isDiscovery) return { category: "discovery", depth: 3 };
    return { category: "open", depth: 2 };
  }

  const words = t.replace(/[?.!,]/g, "").split(/\s+/).filter(Boolean);
  const firstWord = words[0] ?? "";
  if (CLOSED_STARTS.includes(firstWord) || words.length < 8) {
    return { category: "closed", depth: 1 };
  }
  return { category: "other", depth: 1 };
}

function classifyHealth(score: number): string {
  if (score >= 80) return "excellent";
  if (score >= 60) return "good";
  if (score >= 40) return "fair";
  return "poor";
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
    const { data: claims } = await userClient.auth.getClaims(authHeader.replace("Bearer ", ""));
    if (!claims?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const recordingId = body?.recording_id;
    if (!recordingId || typeof recordingId !== "string") {
      return new Response(JSON.stringify({ error: "recording_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: rec, error: recErr } = await admin
      .from("call_recordings")
      .select("id, duration_seconds, diarization, transcript")
      .eq("id", recordingId)
      .maybeSingle();
    if (recErr) throw recErr;
    if (!rec) throw new Error("recording not found");

    const turns = (Array.isArray(rec.diarization) ? rec.diarization : []) as Turn[];
    const sellerTurns = turns
      .map((t, idx) => ({ ...t, idx }))
      .filter((t) => {
        const r = (t.speaker || t.role || "").toLowerCase();
        return r.includes("seller") || r.includes("salesperson") || r.includes("vendedor") || r === "agent" || r === "rep";
      });

    const questions: Array<{
      recording_id: string;
      turn_index: number;
      text: string;
      category: string;
      depth: number;
      start_estimate: number;
    }> = [];

    for (const turn of sellerTurns) {
      const text = (turn.text || "").trim();
      if (!text) continue;
      const sentences = text.split(/(?<=[?.!])\s+/);
      for (const s of sentences) {
        const sentence = s.trim();
        if (!sentence || !isQuestion(sentence)) continue;
        const { category, depth } = classify(sentence);
        questions.push({
          recording_id: recordingId,
          turn_index: turn.idx,
          text: sentence.slice(0, 500),
          category,
          depth,
          start_estimate: typeof turn.start === "number" ? turn.start : 0,
        });
      }
    }

    const total = questions.length;
    const counts = { open: 0, closed: 0, discovery: 0, impact: 0, leading: 0, other: 0 };
    let depthSum = 0;
    for (const q of questions) {
      counts[q.category as keyof typeof counts]++;
      depthSum += q.depth;
    }

    const durationMin = Math.max((rec.duration_seconds ?? 0) / 60, 0.1);
    const density = total / durationMin;
    const ratio = (n: number) => (total > 0 ? n / total : 0);
    const openR = ratio(counts.open + counts.discovery + counts.impact);
    const discoveryR = ratio(counts.discovery);
    const impactR = ratio(counts.impact);
    const leadingR = ratio(counts.leading);
    const densityBonus = Math.min(density * 4, 20);
    const score = Math.max(
      0,
      Math.min(100, openR * 30 + discoveryR * 20 + impactR * 30 - leadingR * 20 + densityBonus)
    );
    const avgDepth = total > 0 ? depthSum / total : 0;
    const health = classifyHealth(score);

    await admin.from("call_questions").delete().eq("recording_id", recordingId);
    if (questions.length > 0) {
      const { error: insErr } = await admin.from("call_questions").insert(questions);
      if (insErr) throw insErr;
    }

    const { error: upErr } = await admin
      .from("call_question_analysis")
      .upsert(
        {
          recording_id: recordingId,
          total_questions: total,
          open_questions: counts.open,
          closed_questions: counts.closed,
          discovery_questions: counts.discovery,
          impact_questions: counts.impact,
          leading_questions: counts.leading,
          avg_depth: Number(avgDepth.toFixed(2)),
          question_density: Number(density.toFixed(2)),
          quality_score: Number(score.toFixed(1)),
          health,
          factors: { counts, ratios: { openR, discoveryR, impactR, leadingR }, density_bonus: densityBonus },
          calculated_at: new Date().toISOString(),
        },
        { onConflict: "recording_id" }
      );
    if (upErr) throw upErr;

    return new Response(
      JSON.stringify({ recording_id: recordingId, total, score, health, counts }),
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
