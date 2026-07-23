import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import type { CommissionBonusAward, AwardStatus } from './useCommissionBonusAwards';

export interface MyAwardRow extends CommissionBonusAward {
  bonus_name: string | null;
}

export interface MyAwardsPage {
  rows: MyAwardRow[];
  total: number;
}

export interface UseMyBonusAwardsOptions {
  status?: AwardStatus | 'all';
  /** YYYY-MM ou 'all' */
  period?: string;
  page: number;
  pageSize: number;
}

const KEY = ['my-bonus-awards'] as const;

/**
 * Retorna a lista paginada de premiações do vendedor autenticado.
 * A RLS garante o isolamento — não filtramos por salesperson_id no client.
 */
export function useMyBonusAwards(opts: UseMyBonusAwardsOptions) {
  const { status = 'all', period = 'all', page, pageSize } = opts;

  return useQuery({
    queryKey: [...KEY, status, period, page, pageSize],
    staleTime: 15_000,
    queryFn: async (): Promise<MyAwardsPage> => {
      const from = page * pageSize;
      const to = from + pageSize - 1;

      let q = supabase
        .from('commission_bonus_awards')
        .select('*, commission_bonuses(name)', { count: 'exact' })
        .order('awarded_at', { ascending: false })
        .range(from, to);

      if (status !== 'all') q = q.eq('status', status);

      if (period !== 'all' && /^\d{4}-\d{2}$/.test(period)) {
        const firstDay = `${period}-01`;
        // exclusivo com < próximo mês
        const [y, m] = period.split('-').map(Number);
        const nextMonth =
          m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, '0')}-01`;
        q = q.gte('period_month', firstDay).lt('period_month', nextMonth);
      }

      const { data, count, error } = await q;
      if (error) throw error;

      const rows: MyAwardRow[] = (data ?? []).map((r) => {
        const rel = (r as { commission_bonuses?: { name?: string } | null }).commission_bonuses;
        return {
          ...(r as unknown as CommissionBonusAward),
          bonus_name: rel?.name ?? null,
        };
      });

      return { rows, total: count ?? 0 };
    },
  });
}

/**
 * Busca TODAS as linhas do filtro atual (sem paginação) para exportação.
 * Faz paginação interna em blocos de 1000 para respeitar limites do PostgREST.
 */
export async function fetchAllMyBonusAwards(opts: {
  status?: AwardStatus | 'all';
  period?: string;
}): Promise<MyAwardRow[]> {
  const { status = 'all', period = 'all' } = opts;
  const CHUNK = 1000;
  const out: MyAwardRow[] = [];
  let from = 0;

  while (true) {
    let q = supabase
      .from('commission_bonus_awards')
      .select('*, commission_bonuses(name)')
      .order('awarded_at', { ascending: false })
      .range(from, from + CHUNK - 1);

    if (status !== 'all') q = q.eq('status', status);
    if (period !== 'all' && /^\d{4}-\d{2}$/.test(period)) {
      const [y, m] = period.split('-').map(Number);
      const nextMonth =
        m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, '0')}-01`;
      q = q.gte('period_month', `${period}-01`).lt('period_month', nextMonth);
    }

    const { data, error } = await q;
    if (error) throw error;
    const batch = (data ?? []).map((r) => {
      const rel = (r as { commission_bonuses?: { name?: string } | null }).commission_bonuses;
      return {
        ...(r as unknown as CommissionBonusAward),
        bonus_name: rel?.name ?? null,
      };
    });
    out.push(...batch);
    if (batch.length < CHUNK) break;
    from += CHUNK;
  }
  return out;
}

/** Assina realtime das próprias premiações e invalida a query. */
export function useMyBonusAwardsRealtime() {
  const qc = useQueryClient();
  useEffect(() => {
    const channel = supabase
      .channel(`my-bonus-awards:${crypto.randomUUID()}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'commission_bonus_awards' },
        () => {
          qc.invalidateQueries({ queryKey: KEY });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);
}
