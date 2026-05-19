import { supabase } from "@/integrations/supabase/client";
import { XP_REWARDS, calculateLevelFromXP, getLevelInfo } from "@/hooks/gamification/useSalespersonXP";
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
  salespersonId: string, 
  xpAmount: number, 
  saleId: string, 
  saleAmount: number, 
  salespersonName: string
): Promise<{ leveledUp: boolean; newLevel: number; previousLevel: number } | null> {
  const formattedAmount = new Intl.NumberFormat("pt-BR", { 
    style: "currency", 
    currency: "BRL", 
    minimumFractionDigits: 0 
  }).format(saleAmount);

  try {
    const { data, error } = await supabase.rpc('award_salesperson_xp', {
      p_salesperson_id: salespersonId,
      p_xp_amount: xpAmount,
      p_description: `Venda de ${formattedAmount}`,
      p_source_type: 'sale',
      p_source_id: saleId
    });

    if (error) throw error;

    const result = data as { leveled_up: boolean; new_level: number; previous_level?: number };
    
    if (result.leveled_up) {
      const newLevelInfo = getLevelInfo(result.new_level);
      toast.success(`${newLevelInfo.emoji} ${salespersonName} subiu para o nível ${result.new_level}!`, { 
        description: `Novo título: ${newLevelInfo.title}`, 
        duration: 6000 
      });
    }

    return { 
      leveledUp: result.leveled_up, 
      newLevel: result.new_level, 
      previousLevel: result.previous_level || (result.new_level - (result.leveled_up ? 1 : 0)) 
    };
  } catch (error) {
    console.error("Failed to award XP via RPC:", error);
    return null;
  }
}
