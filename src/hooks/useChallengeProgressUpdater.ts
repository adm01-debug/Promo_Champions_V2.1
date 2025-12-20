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
  const results = [];

  // Update weekly challenges
  const { data: weeklyChallenges } = await supabase
    .from("weekly_challenges")
    .select("id, target_value, xp_reward, title")
    .eq("challenge_type", challengeType)
    .eq("is_active", true)
    .lte("start_date", today)
    .gte("end_date", today);

  if (weeklyChallenges?.length) {
    for (const challenge of weeklyChallenges) {
      const result = await updateSingleChallengeProgress(
        salespersonId,
        challenge,
        "challenge_progress"
      );
      if (result) results.push(result);
    }
  }

  // Update daily challenges
  const { data: dailyChallenges } = await supabase
    .from("daily_challenges")
    .select("id, target_value, xp_reward, title")
    .or(`challenge_type.eq.${challengeType},challenge_type.eq.any`)
    .eq("challenge_date", today)
    .eq("is_active", true);

  if (dailyChallenges?.length) {
    for (const challenge of dailyChallenges) {
      const result = await updateSingleChallengeProgress(
        salespersonId,
        challenge,
        "daily_challenge_progress"
      );
      if (result) results.push({ ...result, isDaily: true });
    }
  }

  return results.length > 0 ? results : null;
}

async function updateSingleChallengeProgress(
  salespersonId: string,
  challenge: { id: string; target_value: number; xp_reward: number; title: string },
  tableName: "challenge_progress" | "daily_challenge_progress"
) {
  const { data: existing } = await supabase
    .from(tableName)
    .select("*")
    .eq("challenge_id", challenge.id)
    .eq("salesperson_id", salespersonId)
    .maybeSingle();

  if (existing) {
    if (existing.xp_claimed) return null;

    const newValue = existing.current_value + 1;
    const { error } = await supabase
      .from(tableName)
      .update({ current_value: newValue })
      .eq("id", existing.id);

    if (!error) {
      return {
        challengeId: challenge.id,
        title: challenge.title,
        currentValue: newValue,
        targetValue: challenge.target_value,
        xpReward: challenge.xp_reward,
        justCompleted: newValue === challenge.target_value,
      };
    }
  } else {
    const { error } = await supabase
      .from(tableName)
      .insert({
        challenge_id: challenge.id,
        salesperson_id: salespersonId,
        current_value: 1,
      });

    if (!error) {
      return {
        challengeId: challenge.id,
        title: challenge.title,
        currentValue: 1,
        targetValue: challenge.target_value,
        xpReward: challenge.xp_reward,
        justCompleted: 1 === challenge.target_value,
      };
    }
  }

  return null;
}

export function useChallengeProgressUpdater() {
  const queryClient = useQueryClient();

  const updateProgress = async (salespersonId: string, activityType: string) => {
    const results = await updateChallengeProgressForActivity(salespersonId, activityType);
    
    if (results && results.length > 0) {
      queryClient.invalidateQueries({ queryKey: ["challenge-progress"] });
      queryClient.invalidateQueries({ queryKey: ["weekly-challenges"] });
      queryClient.invalidateQueries({ queryKey: ["daily-challenges"] });
      queryClient.invalidateQueries({ queryKey: ["daily-challenge-progress"] });
    }

    return results;
  };

  return { updateProgress };
}
