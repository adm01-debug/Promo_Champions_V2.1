import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const today = new Date().toISOString().split("T")[0];

    // Find challenges expiring today
    const { data: expiringChallenges, error: challengesError } = await supabase
      .from("weekly_challenges")
      .select("id, title, xp_reward, target_value")
      .eq("is_active", true)
      .eq("end_date", today);

    if (challengesError) {
      console.error("Error fetching expiring challenges:", challengesError);
      throw challengesError;
    }

    if (!expiringChallenges || expiringChallenges.length === 0) {
      console.log("No challenges expiring today");
      return new Response(
        JSON.stringify({ message: "No challenges expiring today", notified: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${expiringChallenges.length} challenges expiring today`);

    // Get all active salespeople
    const { data: salespeople, error: spError } = await supabase
      .from("salespeople")
      .select("id, name, email")
      .eq("is_active", true);

    if (spError) {
      console.error("Error fetching salespeople:", spError);
      throw spError;
    }

    const notifications = [];

    // For each expiring challenge, check who hasn't completed it
    for (const challenge of expiringChallenges) {
      // Get progress for this challenge
      const { data: progressData } = await supabase
        .from("challenge_progress")
        .select("salesperson_id, current_value, xp_claimed")
        .eq("challenge_id", challenge.id);

      const progressMap = new Map(
        (progressData || []).map(p => [p.salesperson_id, p])
      );

      for (const sp of salespeople || []) {
        const progress = progressMap.get(sp.id);
        const currentValue = progress?.current_value || 0;
        const isCompleted = currentValue >= challenge.target_value;
        const isClaimed = progress?.xp_claimed || false;

        // Notify if not completed or completed but not claimed
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

    console.log(`Generated ${notifications.length} notifications`);

    // Log the notifications (in a real app, you'd send emails or push notifications here)
    // For now, we'll store them in the achievements table as reminders
    for (const notif of notifications) {
      await supabase.from("achievements").insert({
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
      });
    }

    return new Response(
      JSON.stringify({
        message: "Challenge expiration notifications sent",
        challenges_expiring: expiringChallenges.length,
        notifications_sent: notifications.length,
        notifications,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in challenge-expiration-alerts:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
