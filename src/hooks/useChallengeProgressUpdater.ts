import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

// Challenge types that can be updated
export type ChallengeUpdateType = "calls" | "emails" | "meetings" | "linkedin" | "whatsapp" | "sales";

// Map activity types to challenge types
const ACTIVITY_TO_CHALLENGE_TYPE: Record<string, ChallengeUpdateType> = {
  call: "calls",
  email: "emails",
  meeting: "meetings",
  linkedin: "linkedin",
  whatsapp: "whatsapp",
};

export async function updateChallengeProgressForActivity(
  salespersonId: string,
  activityType: string
) {
  const challengeType = ACTIVITY_TO_CHALLENGE_TYPE[activityType];
  if (!challengeType) return null;

  return updateChallengeProgress(salespersonId, challengeType);
}

export async function updateChallengeProgressForSale(salespersonId: string) {
  return updateChallengeProgress(salespersonId, "sales");
}

async function updateChallengeProgress(
  salespersonId: string,
  challengeType: ChallengeUpdateType
) {

  const today = new Date().toISOString().split("T")[0];

  // Find active challenges that match this activity type
  const { data: challenges, error: challengesError } = await supabase
    .from("weekly_challenges")
    .select("id, target_value, xp_reward, title")
    .eq("challenge_type", challengeType)
    .eq("is_active", true)
    .lte("start_date", today)
    .gte("end_date", today);

  if (challengesError || !challenges?.length) return null;

  const results = [];

  for (const challenge of challenges) {
    // Check if progress exists
    const { data: existing } = await supabase
      .from("challenge_progress")
      .select("*")
      .eq("challenge_id", challenge.id)
      .eq("salesperson_id", salespersonId)
      .maybeSingle();

    if (existing) {
      // Don't update if already claimed
      if (existing.xp_claimed) continue;

      const newValue = existing.current_value + 1;
      const { error: updateError } = await supabase
        .from("challenge_progress")
        .update({ current_value: newValue })
        .eq("id", existing.id);

      if (!updateError) {
        results.push({
          challengeId: challenge.id,
          title: challenge.title,
          currentValue: newValue,
          targetValue: challenge.target_value,
          xpReward: challenge.xp_reward,
          justCompleted: newValue === challenge.target_value,
        });
      }
    } else {
      // Create new progress
      const { error: insertError } = await supabase
        .from("challenge_progress")
        .insert({
          challenge_id: challenge.id,
          salesperson_id: salespersonId,
          current_value: 1,
        });

      if (!insertError) {
        results.push({
          challengeId: challenge.id,
          title: challenge.title,
          currentValue: 1,
          targetValue: challenge.target_value,
          xpReward: challenge.xp_reward,
          justCompleted: 1 === challenge.target_value,
        });
      }
    }
  }

  return results;
}

export function useChallengeProgressUpdater() {
  const queryClient = useQueryClient();

  const updateProgress = async (salespersonId: string, activityType: string) => {
    const results = await updateChallengeProgressForActivity(salespersonId, activityType);
    
    if (results && results.length > 0) {
      // Invalidate challenge queries to reflect updates
      queryClient.invalidateQueries({ queryKey: ["challenge-progress"] });
      queryClient.invalidateQueries({ queryKey: ["weekly-challenges"] });
    }

    return results;
  };

  return { updateProgress };
}
