import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface XpAdjustment {
  id: string;
  user_id: string;
  amount: number;
  reason: string;
  source: string;
  related_assignment_id: string | null;
  adjusted_by: string;
  created_at: string;
}

export const useXpAdjustments = (limit = 50) => {
  const qc = useQueryClient();

  const list = useQuery<XpAdjustment[]>({
    queryKey: ['xp-adjustments', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('xp_adjustments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data || []) as XpAdjustment[];
    },
  });

  const adjust = useMutation({
    mutationFn: async (input: { userId: string; amount: number; reason: string }) => {
      const { data, error } = await supabase.rpc('manual_xp_adjustment', {
        _user_id: input.userId,
        _amount: input.amount,
        _reason: input.reason,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['xp-adjustments'] });
      toast.success('Ajuste de XP registrado');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return { ...list, adjust };
};
