import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { getCorsHeaders(req), getCorsHeaders } from "../_shared/cors.ts";
import { withRequestId } from "../_shared/request-id.ts";
import { errorEnvelope, jsonResponse } from "../_shared/http-envelope.ts";
import { chunkedIn } from "../_shared/chunked-in.ts";

Deno.serve(withRequestId("challenge-expiration-alerts", async (req, ctx) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const today = new Date().toISOString().split("T")[0];

  const { data: expiringChallenges, error: challengesError } = await supabase
    .from("weekly_challenges")
    .select("id, title, xp_reward, target_value")
    .eq("is_active", true)
    .eq("end_date", today);

  if (challengesError) {
    ctx.log("error", "fetch_challenges_failed", { error: challengesError.message });
    return errorEnvelope("INTERNAL_ERROR", challengesError.message, { requestId: ctx.requestId });
  }

  if (!expiringChallenges || expiringChallenges.length === 0) {
    ctx.log("info", "no_expiring_challenges");
    return jsonResponse({ message: "No challenges expiring today", notified: 0 }, {
      requestId: ctx.requestId,
    });
  }

  ctx.log("info", "expiring_found", { count: expiringChallenges.length });

  const { data: salespeople, error: spError } = await supabase
    .from("salespeople")
    .select("id, name, email")
    .eq("is_active", true)
    .limit(500);

  if (spError) {
    ctx.log("error", "fetch_salespeople_failed", { error: spError.message });
    return errorEnvelope("INTERNAL_ERROR", spError.message, { requestId: ctx.requestId });
  }

  // Batch-fetch all challenge_progress in one query — eliminates N+1 (one per challenge)
  const challengeIds = expiringChallenges.map(c => c.id);
  const allProgressData = await chunkedIn<{ challenge_id: string; salesperson_id: string; current_value: number; xp_claimed: boolean }>(
    challengeIds,
    (chunk) => supabase
      .from("challenge_progress")
      .select("challenge_id, salesperson_id, current_value, xp_claimed")
      .in("challenge_id", chunk),
    { parallel: true, label: "challenge-expiration-alerts.progress" },
  );

  const progressByChallenge = new Map<string, Map<string, { current_value: number; xp_claimed: boolean }>>();
  for (const p of allProgressData) {
    if (!progressByChallenge.has(p.challenge_id)) progressByChallenge.set(p.challenge_id, new Map());
    progressByChallenge.get(p.challenge_id)!.set(p.salesperson_id, { current_value: p.current_value, xp_claimed: p.xp_claimed });
  }

  const notifications: Array<Record<string, unknown>> = [];

  for (const challenge of expiringChallenges) {
    const progressMap = progressByChallenge.get(challenge.id) ?? new Map();

    for (const sp of salespeople || []) {
      const progress = progressMap.get(sp.id);
      const currentValue = progress?.current_value || 0;
      const isCompleted = currentValue >= challenge.target_value;
      const isClaimed = progress?.xp_claimed || false;

      if (!isClaimed) {
        const remaining = challenge.target_value - currentValue;
        const percentage = Math.round((currentValue / challenge.target_value) * 100);
        notifications.push({
          salesperson_id: sp.id,
          salesperson_name: sp.name,
          salesperson_email: sp.email,
          challenge_id: challenge.id,
          challenge_title: challenge.title,
          xp_reward: challenge.xp_reward,
          current_value: currentValue,
          target_value: challenge.target_value,
          remaining,
          percentage,
          is_completed: isCompleted,
        });
      }
    }
  }

  ctx.log("info", "notifications_generated", { count: notifications.length });

  if (notifications.length > 0) {
    const achievementRows = notifications.map(notif => ({
      salesperson_id: notif.salesperson_id,
      achievement_type: "challenge_expiring",
      achievement_date: today,
      details: {
        challenge_id: notif.challenge_id,
        challenge_title: notif.challenge_title,
        xp_reward: notif.xp_reward,
        current_value: notif.current_value,
        target_value: notif.target_value,
        remaining: notif.remaining,
        percentage: notif.percentage,
        is_completed: notif.is_completed,
        message: notif.is_completed
          ? `⏰ Último dia para resgatar ${notif.xp_reward} XP do desafio "${notif.challenge_title}"!`
          : `⏰ Último dia! Faltam ${notif.remaining} para completar "${notif.challenge_title}" (+${notif.xp_reward} XP)`,
      },
    }));
    await supabase.from("achievements").insert(achievementRows);
  }

  return jsonResponse({
    message: "Challenge expiration notifications sent",
    challenges_expiring: expiringChallenges.length,
    notifications_sent: notifications.length,
    notifications,
  }, { requestId: ctx.requestId });
}));
