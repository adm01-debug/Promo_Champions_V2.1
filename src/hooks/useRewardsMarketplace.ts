import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CACHE_TIMES } from '@/constants';
import { toast } from 'sonner';

export interface Reward {
  id: string;
  name: string;
  description: string;
  xpCost: number;
  category: 'physical' | 'digital' | 'experience' | 'benefit';
  available: boolean;
  stock: number;
}

export interface UserXP {
  total: number;
  available: number;
  spent: number;
  level: number;
}

export interface RewardsMarketplaceResult {
  rewards: Reward[];
  userXP: UserXP;
}

const MOCK_REWARDS: Reward[] = [
  { id: '1', name: 'Day Off Extra', description: 'Um dia de folga adicional', xpCost: 5000, category: 'benefit', available: true, stock: 10 },
  { id: '2', name: 'Voucher R$100', description: 'Vale presente iFood/Uber', xpCost: 2000, category: 'digital', available: true, stock: 20 },
  { id: '3', name: 'Curso Online', description: 'Acesso a curso de sua escolha', xpCost: 3000, category: 'digital', available: true, stock: 15 },
  { id: '4', name: 'Almoço com CEO', description: 'Almoço exclusivo com a liderança', xpCost: 8000, category: 'experience', available: true, stock: 2 },
  { id: '5', name: 'Home Office Week', description: 'Uma semana de trabalho remoto', xpCost: 4000, category: 'benefit', available: true, stock: 5 },
  { id: '6', name: 'Gadget Surprise', description: 'Um gadget tech de surpresa', xpCost: 10000, category: 'physical', available: true, stock: 3 },
];

export function useRewardsMarketplace() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['rewards-marketplace', user?.id],
    queryFn: async (): Promise<RewardsMarketplaceResult> => {
      if (!user?.id) {
        return { rewards: MOCK_REWARDS, userXP: { total: 0, available: 0, spent: 0, level: 1 } };
      }

      // Buscar achievements count
      const { count: achievementCount } = await supabase
        .from('achievements')
        .select('id', { count: 'exact', head: true });

      // Calcular XP baseado em achievements
      const totalXP = (achievementCount || 0) * 100 + 500; // Base XP + achievements
      const spentXP = 0;

      return {
        rewards: MOCK_REWARDS,
        userXP: {
          total: totalXP,
          available: totalXP - spentXP,
          spent: spentXP,
          level: Math.floor(totalXP / 1000) + 1,
        },
      };
    },
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.GC_TIME,
    enabled: !!user,
  });
}

export function useRedeemReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ rewardId, xpCost }: { rewardId: string; xpCost: number }) => {
      toast.success('Recompensa resgatada com sucesso! 🎉');
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards-marketplace'] });
    },
    onError: () => {
      toast.error('Erro ao resgatar recompensa');
    },
  });
}
