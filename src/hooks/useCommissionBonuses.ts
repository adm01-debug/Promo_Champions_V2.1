import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type BonusType = 'first_sale' | 'milestone' | 'ranking' | 'streak' | 'other';
export type BonusKind = 'fixed' | 'percentage';

export interface CommissionBonus {
  id: string;
  name: string;
  description: string | null;
  bonus_type: BonusType;
  trigger_condition: Record<string, unknown>;
  bonus_amount: number;
  bonus_kind: BonusKind;
  salesperson_id: string | null;
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  salespeople?: { name: string } | null;
}

export type CommissionBonusUpsert = Partial<
  Omit<CommissionBonus, 'salespeople' | 'created_at' | 'updated_at'>
>;

export function useCommissionBonuses() {
  return useQuery({
    queryKey: ['commission-bonuses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('commission_bonuses')
        .select('*, salespeople(name)')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });
      if (error) throw error;
      // eslint-disable-next-line no-restricted-syntax
      return (data ?? []) as unknown as CommissionBonus[];
    },
  });
}

export function useUpsertCommissionBonus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (bonus: CommissionBonusUpsert) => {
      const { data, error } = await supabase
        .from('commission_bonuses')
        .upsert([bonus] as never)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['commission-bonuses'] });
      toast.success('Premiação salva com sucesso');
    },
    onError: (error: Error) => toast.error(`Erro ao salvar premiação: ${error.message}`),
  });
}

export function useDeleteCommissionBonus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('commission_bonuses').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['commission-bonuses'] });
      toast.success('Premiação removida');
    },
    onError: (error: Error) => toast.error(`Erro ao remover premiação: ${error.message}`),
  });
}
