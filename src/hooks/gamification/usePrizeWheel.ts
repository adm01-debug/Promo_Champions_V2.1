import { useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PrizeWheelSpin {
  id: string;
  prize_type: string;
  prize_value: number;
  prize_label: string;
  trigger_type: string;
  spun_at: string;
}

export interface PrizeSlice {
  label: string;
  type: string;
  value: number;
  color: string;
  probability: number;
}

export const PRIZE_SLICES: PrizeSlice[] = [
  { label: '+50 XP', type: 'xp', value: 50, color: '#3B82F6', probability: 25 },
  { label: '+100 XP', type: 'xp', value: 100, color: '#8B5CF6', probability: 20 },
  { label: '+200 XP', type: 'xp', value: 200, color: '#EC4899', probability: 10 },
  { label: '2x XP 1h', type: 'power_up', value: 2, color: '#F59E0B', probability: 15 },
  { label: 'Badge 🔥', type: 'badge', value: 1, color: '#EF4444', probability: 10 },
  { label: '+500 XP', type: 'xp', value: 500, color: '#10B981', probability: 5 },
  { label: '+25 XP', type: 'xp', value: 25, color: '#6366F1', probability: 15 },
];

export function usePrizeWheel(salespersonId?: string) {
  const queryClient = useQueryClient();
  const pendingRequestId = useRef<string | null>(null);

  const { data: availableSpins } = useQuery({
    queryKey: ['available-spins', salespersonId],
    queryFn: async () => {
      if (!salespersonId) return 0;
      const { data, error } = await supabase
        .from('available_spins')
        .select('spins_count')
        .eq('salesperson_id', salespersonId)
        .maybeSingle();
      if (error) throw error;
      return data?.spins_count || 0;
    },
    enabled: !!salespersonId,
  });

  const { data: history } = useQuery({
    queryKey: ['prize-history', salespersonId],
    queryFn: async (): Promise<PrizeWheelSpin[]> => {
      if (!salespersonId) return [];
      const { data, error } = await supabase
        .from('prize_wheel_spins')
        .select('*')
        .eq('salesperson_id', salespersonId)
        .order('spun_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data || [];
    },
    enabled: !!salespersonId,
  });

  const spin = useMutation({
    mutationFn: async () => {
      if (!salespersonId) throw new Error('No salesperson');
      if (!availableSpins || availableSpins <= 0) throw new Error('No spins available');

      // A mesma tentativa usa a mesma chave em caso de retry. O banco decide
      // o prêmio, bloqueia o saldo e registra tudo em uma transação atômica.
      const requestId = pendingRequestId.current ?? crypto.randomUUID();
      pendingRequestId.current = requestId;

      const { data, error } = await supabase.rpc('spin_prize_wheel', {
        p_request_id: requestId,
      });
      if (error) throw error;

      const result = data?.[0];
      const prize = result && PRIZE_SLICES[result.prize_index];
      if (
        !result ||
        !prize ||
        prize.type !== result.prize_type ||
        prize.value !== result.prize_value ||
        prize.label !== result.prize_label
      ) {
        throw new Error('A roleta retornou um prêmio inválido');
      }

      pendingRequestId.current = null;
      return { prizeIndex: result.prize_index, prize };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['available-spins'] });
      queryClient.invalidateQueries({ queryKey: ['prize-history'] });
    },
  });

  return { availableSpins: availableSpins || 0, history, spin };
}
