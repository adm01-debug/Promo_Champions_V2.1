import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { CommissionBonus, BonusType } from './useCommissionBonuses';

export interface EligibleBonus extends CommissionBonus {
  reason: string;
  progress?: number; // 0..1
}

interface EvaluationContext {
  salespersonId: string;
  mtdRevenue: number;
  totalSalesCount: number;
  currentStreak: number;
  monthlyRank: number | null;
}

/**
 * Pure evaluator — no I/O. Testable in isolation.
 * Supported triggers:
 *  - { milestone_amount: number }   → mtdRevenue >= milestone_amount
 *  - { rank_top: number }           → monthlyRank <= rank_top
 *  - { streak_days: number }        → currentStreak >= streak_days
 *  - { first_sale: true }           → totalSalesCount >= 1
 *  - {} / invalid                   → always eligible if active (informational)
 */
export function evaluateBonus(
  bonus: CommissionBonus,
  ctx: EvaluationContext,
): EligibleBonus | null {
  if (!bonus.is_active) return null;
  if (bonus.salesperson_id && bonus.salesperson_id !== ctx.salespersonId) return null;

  const trigger = (bonus.trigger_condition ?? {}) as Record<string, unknown>;

  const num = (k: string): number | null => {
    const v = trigger[k];
    return typeof v === 'number' && Number.isFinite(v) ? v : null;
  };

  const milestone = num('milestone_amount');
  if (milestone !== null) {
    if (ctx.mtdRevenue >= milestone) {
      return { ...bonus, reason: `Marco de R$ ${milestone.toLocaleString('pt-BR')} atingido`, progress: 1 };
    }
    return null;
  }

  const rankTop = num('rank_top');
  if (rankTop !== null) {
    if (ctx.monthlyRank !== null && ctx.monthlyRank <= rankTop) {
      return { ...bonus, reason: `Top ${rankTop} do mês (posição atual: ${ctx.monthlyRank})`, progress: 1 };
    }
    return null;
  }

  const streakDays = num('streak_days');
  if (streakDays !== null) {
    if (ctx.currentStreak >= streakDays) {
      return { ...bonus, reason: `Sequência de ${streakDays} dias atingida`, progress: 1 };
    }
    return null;
  }

  if (trigger.first_sale === true) {
    if (ctx.totalSalesCount >= 1) {
      return { ...bonus, reason: 'Primeira venda registrada', progress: 1 };
    }
    return null;
  }

  // Trigger vazio/desconhecido → informativo (não bloqueia listagem)
  return { ...bonus, reason: 'Premiação ativa', progress: 1 };
}

export function useEligibleBonuses(salespersonId: string | undefined) {
  return useQuery({
    queryKey: ['eligible-bonuses', salespersonId],
    enabled: !!salespersonId,
    staleTime: 60_000,
    queryFn: async (): Promise<EligibleBonus[]> => {
      if (!salespersonId) return [];

      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const [bonusesRes, salesRes, streakRes, allSalesRes] = await Promise.all([
        supabase
          .from('commission_bonuses')
          .select('*')
          .eq('is_active', true)
          .or(`salesperson_id.eq.${salespersonId},salesperson_id.is.null`)
          .order('priority', { ascending: false }),
        supabase
          .from('sales')
          .select('amount')
          .eq('salesperson_id', salespersonId)
          .gte('created_at', monthStart.toISOString()),
        supabase
          .from('sales_streaks')
          .select('current_streak')
          .eq('salesperson_id', salespersonId)
          .maybeSingle(),
        supabase
          .from('sales')
          .select('id', { count: 'exact', head: true })
          .eq('salesperson_id', salespersonId),
      ]);

      if (bonusesRes.error) throw bonusesRes.error;

      const bonuses = (bonusesRes.data ?? []) as unknown as CommissionBonus[];
      const mtdRevenue = (salesRes.data ?? []).reduce(
        (acc, r: { amount: number | string | null }) => acc + Number(r.amount ?? 0),
        0,
      );
      const currentStreak = Number(streakRes.data?.current_streak ?? 0);
      const totalSalesCount = allSalesRes.count ?? 0;

      const ctx: EvaluationContext = {
        salespersonId,
        mtdRevenue,
        totalSalesCount,
        currentStreak,
        monthlyRank: null, // pode ser injetado depois via prop
      };

      return bonuses
        .map((b) => evaluateBonus(b, ctx))
        .filter((b): b is EligibleBonus => b !== null);
    },
  });
}

/** Agrupa por tipo p/ UI. */
export function groupBonusesByType(bonuses: EligibleBonus[]) {
  return useMemo(() => {
    const map = new Map<BonusType, EligibleBonus[]>();
    for (const b of bonuses) {
      const arr = map.get(b.bonus_type) ?? [];
      arr.push(b);
      map.set(b.bonus_type, arr);
    }
    return map;
  }, [bonuses]);
}
