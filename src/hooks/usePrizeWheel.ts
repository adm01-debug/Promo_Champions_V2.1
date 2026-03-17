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

function weightedRandom(): number {
  const totalWeight = PRIZE_SLICES.reduce((s, p) => s + p.probability, 0);
  let random = Math.random() * totalWeight;
  for (let i = 0; i < PRIZE_SLICES.length; i++) {
    random -= PRIZE_SLICES[i].probability;
    if (random <= 0) return i;
  }
  return 0;
}

export function usePrizeWheel(salespersonId?: string) {
  const queryClient = useQueryClient();

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

      const prizeIndex = weightedRandom();
      const prize = PRIZE_SLICES[prizeIndex];

      // Record the spin
      const { error: spinErr } = await supabase
        .from('prize_wheel_spins')
        .insert({
          salesperson_id: salespersonId,
          prize_type: prize.type,
          prize_value: prize.value,
          prize_label: prize.label,
          trigger_type: 'mission',
        });
      if (spinErr) throw spinErr;

      // Decrement available spins
      const { error: updateErr } = await supabase
        .from('available_spins')
        .update({ spins_count: (availableSpins || 1) - 1, updated_at: new Date().toISOString() })
        .eq('salesperson_id', salespersonId);
      if (updateErr) throw updateErr;

      return { prizeIndex, prize };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['available-spins'] });
      queryClient.invalidateQueries({ queryKey: ['prize-history'] });
    },
  });

  return { availableSpins: availableSpins || 0, history, spin };
}
