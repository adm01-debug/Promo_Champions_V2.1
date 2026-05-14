import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.4";



type Turn = { speaker: "seller" | "client" | string; text: string; start?: number; end?: number };
type ObjType = "price" | "timing" | "authority" | "need" | "competition" | "trust" | "other";
type Quality = "acknowledged" | "reframed" | "resolved" | "deflected" | "ignored";
type Status = "resolved" | "partial" | "unresolved";

const PATTERNS: Record<ObjType, RegExp[]> = {
  price: [/\bcaro\b/i, /\bpre[çc]o\b/i, /valor\s+alto/i, /\bcusto\b/i, /\bor[çc]amento\b/i, /muito\s+dinheiro/i],
  timing: [/agora\s+n[ãa]o/i, /\bdepois\b/i, /pr[óo]ximo\s+ano/i, /n[ãa]o\s+[ée]\s+o\s+momento/i, /ainda\s+n[ãa]o/i],
  authority: [/preciso\s+falar/i, /n[ãa]o\s+decido/i, /meu\s+s[óo]cio/i, /\bdiretor\b/i, /\bcomit[êe]\b/i, /aprova[çc][ãa]o/i],
  need: [/n[ãa]o\s+preciso/i, /j[áa]\s+temos/i, /n[ãa]o\s+vejo\s+valor/i, /resolve\s+sozinho/i],
  competition: [/concorrent/i, /outra\s+solu[çc][ãa]o/i, /estamos\s+vendo/i, /\bcota[çc][ãa]o\b/i],
  trust: [/garantia/i, /nunca\s+ouvi/i, /\bcase\b/i, /refer[êe]ncia/i, /\brisco\b/i, /seguran[çc]a/i],
  other: [],
};

function classifyObjection(text: string): { type: ObjType; pattern: string } | null {
  for (const [type, regs] of Object.entries(PATTERNS)) {
    for (const re of regs) {
      const m = text.match(re);
      if (m) return { type: type as ObjType, pattern: m[0].toLowerCase() };
    }
  }
  return null;
}

const ACK = /(entendo|faz\s+sentido|compreendo|claro|entend[ií])/i;
const REFRAME = /(por[ée]m|no\s+entanto|al[ée]m\s+disso|justamente|na\s+verdade|veja\s+bem|olha)/i;
const PROOF = /(\d+%|\d+\s*(reais|r\$|clientes|empresas|meses|dias|x\s+mais)|case|estudo|garantia|roi|economia)/i;

function classifyResponse(text: string | null): Quality {
  if (!text || text.trim().length < 3) return "ignored";
  const ack = ACK.test(text);
  const reframe = REFRAME.test(text);
  const proof = PROOF.test(text);
  if (ack && reframe && proof) return "resolved";
  if (ack && reframe) return "reframed";
  if (ack) return "acknowledged";
  return "deflected";
}

function qualityToStatus(q: Quality): Status {
  if (q === "resolved") return "resolved";
  if (q === "reframed" || q === "acknowledged") return "partial";
  return "unresolved";
}

function healthFor(score: number): string {
  if (score >= 80) return "excellent";
  if (score >= 60) return "good";
  if (score >= 40) return "fair";
  return "poor";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsErr } = await supabase.auth.getClaims(token);
    if (claimsErr || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const { recording_id } = await req.json();
    if (!recording_id) {
      return new Response(JSON.stringify({ error: "recording_id required" }), { status: 400, headers: corsHeaders });
    }

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: rec, error: recErr } = await admin
      .from("call_recordings")
      .select("id, diarization, duration_seconds")
      .eq("id", recording_id)
      .single();

    if (recErr || !rec) {
      return new Response(JSON.stringify({ error: "Recording not found" }), { status: 404, headers: corsHeaders });
    }

    const turns: Turn[] = Array.isArray(rec.diarization) ? rec.diarization : (rec.diarization?.turns ?? []);
    if (!turns.length) {
      return new Response(JSON.stringify({ error: "No diarization available" }), { status: 422, headers: corsHeaders });
    }

    const objections: Array<{
      client_turn_index: number;
      objection_text: string;
      objection_type: ObjType;
      seller_response_text: string | null;
      response_quality: Quality;
      resolution_status: Status;
      start_estimate: number;
      response_time: number;
      pattern: string;
    }> = [];

    for (let i = 0; i < turns.length; i++) {
      const t = turns[i];
      if (t.speaker !== "client") continue;
      const cls = classifyObjection(t.text || "");
      if (!cls) continue;

      const responseTurns: Turn[] = [];
      for (let j = i + 1; j < Math.min(i + 4, turns.length); j++) {
        if (turns[j].speaker === "seller") responseTurns.push(turns[j]);
        if (responseTurns.length >= 3) break;
      }
      const responseText = responseTurns.map((r) => r.text).join(" ").trim() || null;
      const quality = classifyResponse(responseText);
      const status = qualityToStatus(quality);
      const responseTime = responseTurns[0]?.start && t.end ? Math.max(0, responseTurns[0].start - t.end) : 0;

      objections.push({
        client_turn_index: i,
        objection_text: t.text.slice(0, 1000),
        objection_type: cls.type,
        seller_response_text: responseText?.slice(0, 2000) ?? null,
        response_quality: quality,
        resolution_status: status,
        start_estimate: t.start ?? 0,
        response_time: responseTime,
        pattern: cls.pattern,
      });
    }

    const total = objections.length;
    const resolved = objections.filter((o) => o.resolution_status === "resolved").length;
    const partial = objections.filter((o) => o.resolution_status === "partial").length;
    const unresolved = objections.filter((o) => o.resolution_status === "unresolved").length;
    const avgRT = total ? objections.reduce((a, o) => a + o.response_time, 0) / total : 0;
    const baseScore = total ? (resolved * 100 + partial * 50) / total : 0;
    const latencyPenalty = Math.min(15, Math.max(0, (avgRT - 2) * 2));
    const score = Math.max(0, Math.min(100, baseScore - latencyPenalty));
    const health = healthFor(score);

    await admin.from("call_objections").delete().eq("recording_id", recording_id);
    if (total > 0) {
      await admin.from("call_objections").insert(
        objections.map((o) => ({
          recording_id,
          client_turn_index: o.client_turn_index,
          objection_text: o.objection_text,
          objection_type: o.objection_type,
          seller_response_text: o.seller_response_text,
          response_quality: o.response_quality,
          resolution_status: o.resolution_status,
          start_estimate: o.start_estimate,
          factors: { response_time: o.response_time, pattern: o.pattern },
        }))
      );
    }

    await admin.from("call_objection_analysis").upsert(
      {
        recording_id,
        total_objections: total,
        resolved_count: resolved,
        partially_resolved_count: partial,
        unresolved_count: unresolved,
        avg_response_time_seconds: avgRT,
        handling_score: score,
        health,
        factors: { latency_penalty: latencyPenalty, base_score: baseScore },
        calculated_at: new Date().toISOString(),
      },
      { onConflict: "recording_id" }
    );

    // Update objection_library
    const grouped = new Map<string, { type: ObjType; pattern: string; bestQ: Quality; bestText: string | null }>();
    const QRANK: Record<Quality, number> = { resolved: 4, reframed: 3, acknowledged: 2, deflected: 1, ignored: 0 };
    for (const o of objections) {
      const key = `${o.objection_type}::${o.pattern}`;
      const cur = grouped.get(key);
      if (!cur || QRANK[o.response_quality] > QRANK[cur.bestQ]) {
        grouped.set(key, { type: o.objection_type, pattern: o.pattern, bestQ: o.response_quality, bestText: o.seller_response_text });
      }
    }

    for (const [, v] of grouped) {
      const { data: existing } = await admin
        .from("objection_library")
        .select("id, frequency_count, best_response_text")
        .eq("objection_type", v.type)
        .eq("pattern_text", v.pattern)
        .maybeSingle();

      if (existing) {
        const update: Record<string, unknown> = {
          frequency_count: (existing.frequency_count ?? 0) + 1,
          last_seen_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        if (v.bestQ === "resolved" && v.bestText) {
          update.best_response_text = v.bestText;
          update.best_response_recording_id = recording_id;
        }
        await admin.from("objection_library").update(update).eq("id", existing.id);
      } else {
        await admin.from("objection_library").insert({
          objection_type: v.type,
          pattern_text: v.pattern,
          frequency_count: 1,
          best_response_text: v.bestQ === "resolved" ? v.bestText : null,
          best_response_recording_id: v.bestQ === "resolved" ? recording_id : null,
        });
      }
    }

    return new Response(
      JSON.stringify({ recording_id, total, resolved, partial, unresolved, handling_score: score, health }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
