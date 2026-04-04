import { supabase } from "@/integrations/supabase/client";
import { XP_REWARDS, calculateLevelFromXP, getLevelInfo } from "./useSalespersonXP";
import { toast } from "sonner";

export const RANK_TITLES = {
  1: { title: "Lenda", emoji: "👑", color: "text-rank-gold" },
  2: { title: "Elite", emoji: "⚔️", color: "text-rank-silver" },
  3: { title: "Veterano", emoji: "🏆", color: "text-rank-bronze" },
};

export function getRankTitle(rank: number) {
  return RANK_TITLES[rank as keyof typeof RANK_TITLES] || null;
}

export async function triggerConfetti(saleAmount: number) {
  const confetti = (await import('canvas-confetti')).default;

  let intensity = 1;
  if (saleAmount >= 20000) intensity = 3;
  else if (saleAmount >= 5000) intensity = 2;
  else if (saleAmount >= 1000) intensity = 1.5;

  const count = Math.floor(150 * intensity);
  const defaults = { origin: { y: 0.7 }, zIndex: 9999 };

  confetti({ ...defaults, particleCount: Math.floor(count * 0.25), spread: 26 * intensity, startVelocity: 55, origin: { x: 0.2, y: 0.7 } });
  confetti({ ...defaults, particleCount: Math.floor(count * 0.2), spread: 60 * intensity, origin: { x: 0.5, y: 0.7 } });
  confetti({ ...defaults, particleCount: Math.floor(count * 0.35), spread: 100 * intensity, decay: 0.91, scalar: 0.8, origin: { x: 0.8, y: 0.7 } });
  confetti({ ...defaults, particleCount: Math.floor(count * 0.1), spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2, origin: { x: 0.5, y: 0.6 } });

  if (saleAmount >= 20000) {
    setTimeout(() => confetti({ particleCount: 100, spread: 180, origin: { x: 0.5, y: 0.5 }, colors: ['#FFD700', '#FFA500', '#FF6347'], zIndex: 9999 }), 300);
    setTimeout(() => {
      confetti({ particleCount: 80, spread: 160, origin: { x: 0.3, y: 0.6 }, zIndex: 9999 });
      confetti({ particleCount: 80, spread: 160, origin: { x: 0.7, y: 0.6 }, zIndex: 9999 });
    }, 600);
  }
}

export async function awardSaleXP(
  salespersonId: string, xpAmount: number, saleId: string, saleAmount: number, salespersonName: string
): Promise<{ leveledUp: boolean; newLevel: number; previousLevel: number } | null> {
  // eslint-disable-next-line prefer-const
  let { data: xpRecord } = await supabase
    .from("salesperson_xp").select("*").eq("salesperson_id", salespersonId).maybeSingle();

  const previousLevel = xpRecord?.current_level || 1;
  const newTotalXP = (xpRecord?.total_xp || 0) + xpAmount;
  const levelInfo = calculateLevelFromXP(newTotalXP);

  if (!xpRecord) {
    await supabase.from("salesperson_xp").insert({ salesperson_id: salespersonId, total_xp: newTotalXP, current_level: levelInfo.level, xp_to_next_level: levelInfo.xpToNext - levelInfo.xpInLevel });
  } else {
    await supabase.from("salesperson_xp").update({ total_xp: newTotalXP, current_level: levelInfo.level, xp_to_next_level: levelInfo.xpToNext - levelInfo.xpInLevel }).eq("id", xpRecord.id);
  }

  const formattedAmount = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 }).format(saleAmount);
  await supabase.from("xp_history").insert({ salesperson_id: salespersonId, xp_amount: xpAmount, source_type: "sale", source_id: saleId, description: `Venda de ${formattedAmount}` });

  const leveledUp = levelInfo.level > previousLevel;
  if (leveledUp) {
    const newLevelInfo = getLevelInfo(levelInfo.level);
    toast.success(`${newLevelInfo.emoji} ${salespersonName} subiu para o nível ${levelInfo.level}!`, { description: `Novo título: ${newLevelInfo.title}`, duration: 6000 });
  }

  return { leveledUp, newLevel: levelInfo.level, previousLevel };
}
