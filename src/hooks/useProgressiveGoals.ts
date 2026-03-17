import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ProgressiveGoal {
  id: string;
  salesperson_id: string;
  goal_type: string;
  current_level: number;
  current_target: number;
  current_progress: number;
  multiplier: number;
  completed_levels: number;
  total_xp_earned: number;
  updated_at: string;
}

const GOAL_LABELS: Record<string, { label: string; icon: string; unit: string }> = {
  revenue: { label: 'Receita', icon: '💰', unit: 'R$' },
  deals: { label: 'Negócios Fechados', icon: '🤝', unit: '' },
  calls: { label: 'Ligações', icon: '📞', unit: '' },
  meetings: { label: 'Reuniões', icon: '📅', unit: '' },
};

const LEVEL_TITLES: Record<number, string> = {
  1: 'Iniciante',
  2: 'Aprendiz',
  3: 'Competente',
  4: 'Avançado',
  5: 'Especialista',
  6: 'Mestre',
  7: 'Grão-Mestre',
  8: 'Lenda',
  9: 'Mítico',
  10: 'Transcendente',
};

export function useProgressiveGoals(salespersonId?: string) {
  const { data: goals, isLoading } = useQuery({
    queryKey: ['progressive-goals', salespersonId],
    queryFn: async () => {
      if (!salespersonId) return [];
      const { data, error } = await supabase
        .from('progressive_goals')
        .select('*')
        .eq('salesperson_id', salespersonId)
        .order('goal_type');
      if (error) throw error;
      return (data || []) as ProgressiveGoal[];
    },
    enabled: !!salespersonId,
  });

  const allGoals = useQuery({
    queryKey: ['progressive-goals-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('progressive_goals')
        .select('*, salespeople(name, avatar_url)')
        .order('current_level', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  return {
    goals: goals || [],
    allGoals: allGoals.data || [],
    isLoading,
    getLabel: (type: string) => GOAL_LABELS[type] || { label: type, icon: '🎯', unit: '' },
    getLevelTitle: (level: number) => LEVEL_TITLES[Math.min(level, 10)] || `Nível ${level}`,
  };
}
