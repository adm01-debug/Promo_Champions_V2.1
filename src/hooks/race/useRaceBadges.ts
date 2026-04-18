import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface RaceBadge {
  id: string;
  salesperson_id: string;
  badge_code: string;
  season_id: string | null;
  earned_at: string;
}

export const RACE_BADGE_CATALOG = [
  { code: 'pole_position', label: 'Pole Position', emoji: '🏎️', desc: '1º lugar no fim da temporada' },
  { code: 'velocista', label: 'Velocista', emoji: '⚡', desc: '3 vendas em 1 hora' },
  { code: 'comeback_king', label: 'Comeback King', emoji: '🔥', desc: 'Saiu do último para o top 3' },
  { code: 'bandeira_quadriculada', label: 'Bandeira Quadriculada', emoji: '🏁', desc: '1º a bater a meta' },
  { code: 'drift_master', label: 'Drift Master', emoji: '🛞', desc: '5 ultrapassagens na temporada' },
  { code: 'tri_campeao', label: 'Tri-Campeão', emoji: '🏆', desc: '3 corridas seguidas no pódio' },
] as const;

export function useRaceBadges(salespersonId?: string) {
  return useQuery({
    queryKey: ['race-badges', salespersonId],
    queryFn: async (): Promise<RaceBadge[]> => {
      if (!salespersonId) return [];
      const { data, error } = await supabase
        .from('race_badges')
        .select('*')
        .eq('salesperson_id', salespersonId)
        .order('earned_at', { ascending: false });
      if (error) throw error;
      return (data || []) as RaceBadge[];
    },
    enabled: !!salespersonId,
    staleTime: 30_000,
  });
}
