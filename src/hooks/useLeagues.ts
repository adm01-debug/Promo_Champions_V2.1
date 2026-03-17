import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type LeagueTier = 'bronze' | 'silver' | 'gold' | 'diamond';

export interface LeagueMember {
  id: string;
  salesperson_id: string;
  name: string;
  avatar_url: string | null;
  league: LeagueTier;
  points: number;
  promoted_at: string | null;
  demoted_at: string | null;
}

export const LEAGUE_CONFIG: Record<LeagueTier, { label: string; emoji: string; color: string; minPoints: number }> = {
  bronze: { label: 'Bronze', emoji: '🥉', color: 'from-amber-700 to-orange-900', minPoints: 0 },
  silver: { label: 'Prata', emoji: '🥈', color: 'from-slate-300 to-slate-500', minPoints: 500 },
  gold: { label: 'Ouro', emoji: '🥇', color: 'from-amber-400 to-yellow-600', minPoints: 1500 },
  diamond: { label: 'Diamante', emoji: '💎', color: 'from-cyan-300 to-blue-500', minPoints: 3000 },
};

export function useLeagues() {
  return useQuery({
    queryKey: ['salesperson-leagues'],
    queryFn: async (): Promise<LeagueMember[]> => {
      const { data: salespeople, error: spErr } = await supabase
        .from('salespeople')
        .select('id, name, avatar_url')
        .eq('is_active', true);
      if (spErr) throw spErr;

      const { data: leagues, error: lgErr } = await supabase
        .from('salesperson_leagues')
        .select('*')
        .order('points', { ascending: false });
      if (lgErr) throw lgErr;

      return (salespeople || []).map(sp => {
        const lg = leagues?.find(l => l.salesperson_id === sp.id);
        return {
          id: lg?.id || sp.id,
          salesperson_id: sp.id,
          name: sp.name,
          avatar_url: sp.avatar_url,
          league: (lg?.league as LeagueTier) || 'bronze',
          points: lg?.points || 0,
          promoted_at: lg?.promoted_at || null,
          demoted_at: lg?.demoted_at || null,
        };
      }).sort((a, b) => b.points - a.points);
    },
    staleTime: 60000,
  });
}
