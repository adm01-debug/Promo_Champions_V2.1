import { useQuery } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { CommissionBonus, BonusType } from './useCommissionBonuses';

export interface EligibleBonus extends CommissionBonus {
  reason: string;
  progress: number; // 0..1
  achieved: boolean;
  remainingLabel?: string;
}

interface EvaluationContext {
  salespersonId: string;
  mtdRevenue: number;
  totalSalesCount: number;
  currentStreak: number;
  monthlyRank: number | null;
}

const BRL0 = (n: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(n);

/**
 * Pure evaluator — no I/O. Testable in isolation.
 * Retorna sempre um EligibleBonus (com `achieved` indicando se já foi conquistado)
 * ou null quando não se aplica ao vendedor / está inativo.
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
  const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

  const milestone = num('milestone_amount');
  if (milestone !== null) {
    const progress = milestone > 0 ? clamp01(ctx.mtdRevenue / milestone) : 0;
    const achieved = ctx.mtdRevenue >= milestone;
    return {
      ...bonus,
      achieved,
      progress,
      reason: achieved
        ? `Marco de ${BRL0(milestone)} atingido`
        : `${BRL0(ctx.mtdRevenue)} de ${BRL0(milestone)} · faltam ${BRL0(Math.max(0, milestone - ctx.mtdRevenue))}`,
      remainingLabel: achieved ? undefined : BRL0(Math.max(0, milestone - ctx.mtdRevenue)),
    };
  }

  const rankTop = num('rank_top');
  if (rankTop !== null) {
    const rank = ctx.monthlyRank;
    const achieved = rank !== null && rank <= rankTop;
    return {
      ...bonus,
      achieved,
      progress: achieved ? 1 : 0,
      reason: achieved
        ? `Top ${rankTop} do mês (posição atual: ${rank})`
        : rank !== null
          ? `Posição atual: ${rank}º · precisa alcançar Top ${rankTop}`
          : `Alcance o Top ${rankTop} do mês`,
    };
  }

  const streakDays = num('streak_days');
  if (streakDays !== null) {
    const progress = streakDays > 0 ? clamp01(ctx.currentStreak / streakDays) : 0;
    const achieved = ctx.currentStreak >= streakDays;
    return {
      ...bonus,
      achieved,
      progress,
      reason: achieved
        ? `Sequência de ${streakDays} dias atingida`
        : `Sequência atual: ${ctx.currentStreak} · faltam ${Math.max(0, streakDays - ctx.currentStreak)} dia(s)`,
    };
  }

  if (trigger.first_sale === true) {
    const achieved = ctx.totalSalesCount >= 1;
    return {
      ...bonus,
      achieved,
      progress: achieved ? 1 : 0,
      reason: achieved ? 'Primeira venda registrada' : 'Registre sua primeira venda',
    };
  }

  // Trigger vazio/desconhecido → informativo
  return { ...bonus, achieved: true, progress: 1, reason: 'Premiação ativa' };
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

/** Agrupa por tipo p/ UI. Função pura — memoize no call-site via useMemo se necessário. */
export function groupBonusesByType(bonuses: EligibleBonus[]): Map<BonusType, EligibleBonus[]> {
  const map = new Map<BonusType, EligibleBonus[]>();
  for (const b of bonuses) {
    const arr = map.get(b.bonus_type) ?? [];
    arr.push(b);
    map.set(b.bonus_type, arr);
  }
  return map;
}
