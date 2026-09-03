import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { getCorsHeaders } from "../_shared/cors.ts";
import { withRequestId } from "../_shared/request-id.ts";
import { chunkedIn } from "../_shared/chunked-in.ts";

interface Body {
  sale_ids?: string[];
  recompute_all?: boolean;
}

function tierFor(score: number): "cold" | "warm" | "hot" | "champion" {
  if (score >= 75) return "champion";
  if (score >= 50) return "hot";
  if (score >= 25) return "warm";
  return "cold";
}

Deno.serve(withRequestId("email-engagement-scorer", async (req, _ctx) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    let body: Body = {};
    if (req.method === "POST") {
      try { body = await req.json(); } catch { body = {}; }
    }

    const since = new Date(Date.now() - 90 * 86400000).toISOString();

    let saleIds: string[] = body.sale_ids ?? [];
    if (body.recompute_all || saleIds.length === 0) {
      const { data: rows } = await admin
        .from("email_tracking_events")
        .select("sale_id")
        .gte("tracked_at", since)
        .not("sale_id", "is", null)
        .limit(5000);
      saleIds = Array.from(new Set((rows ?? []).map((r: { sale_id: string }) => r.sale_id))).slice(0, 500);
    }

    const tierCounts = { cold: 0, warm: 0, hot: 0, champion: 0 };

    // Batch-fetch ALL events for ALL saleIds in one round-trip (was N queries)
    const allEvents = await chunkedIn<{ sale_id: string; event_type: string; tracked_at: string }>(
      saleIds,
      (chunk) =>
        admin
          .from("email_tracking_events")
          .select("sale_id, event_type, tracked_at")
          .in("sale_id", chunk)
          .gte("tracked_at", since)
          .order("tracked_at", { ascending: true }),
      { parallel: true, label: "email-engagement-scorer.events" },
    );

    // Group events by sale_id in memory
    const eventsBySaleId = new Map<string, Array<{ event_type: string; tracked_at: string }>>();
    for (const ev of allEvents) {
      const bucket = eventsBySaleId.get(ev.sale_id) ?? [];
      bucket.push({ event_type: ev.event_type, tracked_at: ev.tracked_at });
      eventsBySaleId.set(ev.sale_id, bucket);
    }

    // Compute scores in memory — no DB calls inside the loop
    const nowMs = Date.now();
    const nowIso = new Date(nowMs).toISOString();
    const upsertRows = [];
    for (const saleId of saleIds) {
      const ev = eventsBySaleId.get(saleId) ?? [];
      const sent = ev.filter((e) => e.event_type === "sent").length;
      const opens = ev.filter((e) => e.event_type === "opened").length;
      const clicks = ev.filter((e) => e.event_type === "clicked").length;
      const replies = ev.filter((e) => e.event_type === "replied").length;

      const openRate = sent > 0 ? (opens / sent) * 100 : 0;
      const clickRate = sent > 0 ? (clicks / sent) * 100 : 0;
      const replyRate = sent > 0 ? (replies / sent) * 100 : 0;

      let avgResp: number | null = null;
      const sentTimes = ev.filter((e) => e.event_type === "sent").map((e) => new Date(e.tracked_at).getTime());
      const replyTimes = ev.filter((e) => e.event_type === "replied").map((e) => new Date(e.tracked_at).getTime());
      if (sentTimes.length && replyTimes.length) {
        const diffs: number[] = [];
        for (const r of replyTimes) {
          const prevSent = sentTimes.filter((s) => s < r).pop();
          if (prevSent) diffs.push((r - prevSent) / 60000);
        }
        if (diffs.length) avgResp = Math.round(diffs.reduce((a, b) => a + b, 0) / diffs.length);
      }

      const last = ev[ev.length - 1];
      const recencyDays = last
        ? Math.floor((nowMs - new Date(last.tracked_at).getTime()) / 86400000)
        : 90;

      const recencyBonus = Math.max(0, 100 - (recencyDays / 30) * 100);
      const rawScore = openRate * 0.25 + clickRate * 0.30 + replyRate * 0.35 + recencyBonus * 0.10;
      const score = Math.max(0, Math.min(100, Math.round(rawScore)));
      const tier = tierFor(score);
      tierCounts[tier] += 1;

      upsertRows.push({
        sale_id: saleId,
        score,
        tier,
        open_rate: Number(openRate.toFixed(2)),
        click_rate: Number(clickRate.toFixed(2)),
        reply_rate: Number(replyRate.toFixed(2)),
        avg_response_minutes: avgResp,
        recency_days: recencyDays,
        total_sent: sent,
        total_opens: opens,
        total_clicks: clicks,
        total_replies: replies,
        last_calculated_at: nowIso,
      });
    }

    // Single batch upsert for all scores (was N upserts)
    let updated = 0;
    if (upsertRows.length > 0) {
      const { error } = await admin
        .from("email_engagement_scores")
        .upsert(upsertRows, { onConflict: "sale_id" });
      if (error) console.error("email-engagement-scorer upsert error:", error);
      else updated = upsertRows.length;
    }

    return new Response(
      JSON.stringify({ ok: true, updated, by_tier: tierCounts, total_processed: saleIds.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error('email-engagement-scorer error:', e);
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}));
