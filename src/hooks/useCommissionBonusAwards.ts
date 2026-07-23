import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type AwardStatus = 'pending' | 'paid' | 'cancelled';

export interface CommissionBonusAward {
  id: string;
  bonus_id: string;
  salesperson_id: string;
  period_month: string; // YYYY-MM-DD (first day of month)
  computed_amount: number;
  bonus_kind: 'fixed' | 'percentage';
  status: AwardStatus;
  awarded_at: string;
  paid_at: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AwardWithRefs extends CommissionBonusAward {
  bonus_name?: string | null;
  salesperson_name?: string | null;
}

const AWARDS_KEY = ['commission-bonus-awards'] as const;

/** Retorna o primeiro dia do mês corrente em ISO (YYYY-MM-01). */
export function currentPeriodMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

export function useCommissionBonusAwards(opts?: {
  status?: AwardStatus;
  salespersonId?: string;
}) {
  return useQuery({
    queryKey: [...AWARDS_KEY, opts?.status ?? 'all', opts?.salespersonId ?? 'all'],
    staleTime: 30_000,
    queryFn: async (): Promise<AwardWithRefs[]> => {
      let q = supabase
        .from('commission_bonus_awards')
        .select('*, commission_bonuses(name), salespeople(name)')
        .order('awarded_at', { ascending: false })
        .limit(500);

      if (opts?.status) q = q.eq('status', opts.status);
      if (opts?.salespersonId) q = q.eq('salesperson_id', opts.salespersonId);

      const { data, error } = await q;
      if (error) throw error;

      return (data ?? []).map((r: Record<string, unknown>) => ({
        ...(r as unknown as CommissionBonusAward),
        bonus_name: ((r.commission_bonuses as { name?: string } | null) ?? null)?.name ?? null,
        salesperson_name: ((r.salespeople as { name?: string } | null) ?? null)?.name ?? null,
      }));
    },
  });
}

export function useCreateBonusAward() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      bonus_id: string;
      salesperson_id: string;
      period_month?: string;
      computed_amount: number;
      bonus_kind: 'fixed' | 'percentage';
      admin_notes?: string | null;
    }) => {
      const payload = {
        bonus_id: input.bonus_id,
        salesperson_id: input.salesperson_id,
        period_month: input.period_month ?? currentPeriodMonth(),
        computed_amount: input.computed_amount,
        bonus_kind: input.bonus_kind,
        admin_notes: input.admin_notes ?? null,
      };
      const { data, error } = await supabase
        .from('commission_bonus_awards')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data as CommissionBonusAward;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: AWARDS_KEY });
      toast.success('Premiação registrada');
    },
    onError: (e: unknown) => {
      const msg = e instanceof Error ? e.message : 'Erro ao registrar premiação';
      // Chave única
      if (/duplicate|unique/i.test(msg)) {
        toast.error('Já existe premiação para esse vendedor/bônus no mês.');
      } else {
        toast.error(msg);
      }
    },
  });
}

export function useUpdateAwardStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id: string;
      status: AwardStatus;
      admin_notes?: string | null;
    }) => {
      const patch: {
        status: AwardStatus;
        paid_at: string | null;
        admin_notes?: string | null;
      } = {
        status: input.status,
        paid_at: input.status === 'paid' ? new Date().toISOString() : null,
      };
      if (input.admin_notes !== undefined) patch.admin_notes = input.admin_notes;

      const { data, error } = await supabase
        .from('commission_bonus_awards')
        .update(patch)
        .eq('id', input.id)
        .select()
        .single();
      if (error) throw error;
      return data as CommissionBonusAward;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: AWARDS_KEY });
      toast.success('Status atualizado');
    },
    onError: (e: unknown) => {
      toast.error(e instanceof Error ? e.message : 'Erro ao atualizar');
    },
  });
}

export function useDeleteAward() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('commission_bonus_awards').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: AWARDS_KEY });
      toast.success('Registro removido');
    },
    onError: (e: unknown) => {
      toast.error(e instanceof Error ? e.message : 'Erro ao remover');
    },
  });
}
