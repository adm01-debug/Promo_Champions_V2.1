import { supabase } from "@/integrations/supabase/client";

export const COMBO_TIERS = [
  { minActions: 0, multiplier: 1.0, label: "Normal", color: "#94a3b8", emoji: "⭐" },
  { minActions: 3, multiplier: 1.5, label: "Aquecendo", color: "#3b82f6", emoji: "⚡" },
  { minActions: 5, multiplier: 2.0, label: "Em Chamas!", color: "#f97316", emoji: "🔥" },
  { minActions: 8, multiplier: 2.5, label: "Imparável!", color: "#ef4444", emoji: "💥" },
  { minActions: 12, multiplier: 3.0, label: "LENDÁRIO!", color: "#f59e0b", emoji: "👑" },
];

export const comboService = {
  getComboTier(actionsCount: number) {
    let tier = COMBO_TIERS[0];
    for (const t of COMBO_TIERS) {
      if (actionsCount >= t.minActions) tier = t;
    }
    return tier;
  },

  getComboTierIndex(actionsCount: number) {
    let index = 0;
    for (let i = 0; i < COMBO_TIERS.length; i++) {
      if (actionsCount >= COMBO_TIERS[i].minActions) index = i;
    }
    return index;
  },

  getNextTier(actionsCount: number) {
    const currentIndex = this.getComboTierIndex(actionsCount);
    return currentIndex < COMBO_TIERS.length - 1 ? COMBO_TIERS[currentIndex + 1] : null;
  },

  async getTodayCombo(salespersonId: string) {
    const today = new Date().toISOString().split("T")[0];
    const { data, error } = await supabase
      .from("combo_tracking")
      .select("*")
      .eq("salesperson_id", salespersonId)
      .eq("combo_date", today)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async registerAction(salespersonId: string) {
    const today = new Date().toISOString().split("T")[0];
    
    // Try to get existing combo
    const combo = await this.getTodayCombo(salespersonId);

    if (!combo) {
      // Create new combo for today
      const { data, error } = await supabase
        .from("combo_tracking")
        .insert({
          salesperson_id: salespersonId,
          combo_date: today,
          actions_count: 1,
          current_multiplier: 1.0,
          current_tier: 0,
          max_tier_today: 0,
        })
        .select()
        .single();

      if (error) throw error;
      return { combo: data, tierChanged: false, newTier: 0 };
    }

    const newCount = combo.actions_count + 1;
    const oldTierIndex = this.getComboTierIndex(combo.actions_count);
    const newTierIndex = this.getComboTierIndex(newCount);
    const newTier = COMBO_TIERS[newTierIndex];
    const tierChanged = newTierIndex > oldTierIndex;

    const { data, error } = await supabase
      .from("combo_tracking")
      .update({
        actions_count: newCount,
        current_multiplier: newTier.multiplier,
        current_tier: newTierIndex,
        max_tier_today: Math.max(combo.max_tier_today, newTierIndex),
        updated_at: new Date().toISOString(),
      })
      .eq("id", combo.id)
      .select()
      .single();

    if (error) throw error;
    return { combo: data, tierChanged, newTier: newTierIndex };
  },
};
