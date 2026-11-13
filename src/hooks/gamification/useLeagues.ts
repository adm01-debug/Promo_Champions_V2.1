import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type LeagueTier = 'bronze' | 'silver' | 'gold' | 'diamond' | 'legendary';

interface LeagueMember {
  id: string;
  salesperson_id: string;
  name: string;
  avatar_url: string | null;
  league: LeagueTier;
  points: number;
  league_id: string | null;
  promoted_at?: string | null;
  demoted_at?: string | null;
}

export const LEAGUE_CONFIG: Record<
  LeagueTier,
  {
    label: string;
    emoji: string;
    color: string;
    gradient: string;
    minPoints: number;
    xpBonus: number;
  }
> = {
  bronze: {
    label: 'Bronze',
    emoji: '🥉',
    color: '#CD7F32',
    gradient: 'from-amber-700 to-orange-900',
    minPoints: 0,
    xpBonus: 0,
  },
  silver: {
    label: 'Prata',
    emoji: '🥈',
    color: '#C0C0C0',
    gradient: 'from-slate-300 to-slate-500',
    minPoints: 500,
    xpBonus: 5,
  },
  gold: {
    label: 'Ouro',
    emoji: '🥇',
    color: '#FFD700',
    gradient: 'from-amber-400 to-yellow-600',
    minPoints: 1500,
    xpBonus: 10,
  },
  diamond: {
    label: 'Diamante',
    emoji: '💎',
    color: '#B9F2FF',
    gradient: 'from-cyan-300 to-blue-500',
    minPoints: 3000,
    xpBonus: 15,
  },
  legendary: {
    label: 'Lendário',
    emoji: '👑',
    color: '#FF6B35',
    gradient: 'from-orange-400 to-red-600',
    minPoints: 5000,
    xpBonus: 25,
  },
};

interface SalespersonRow {
  id: string;
  name: string;
  avatar_url: string | null;
}

interface LeagueMemberRow {
  id: string;
  salesperson_id: string;
  weekly_xp?: number | null;
  league_id?: string | null;
  promoted_at?: string | null;
  demoted_at?: string | null;
  leagues?: { tier?: number | null } | null;
}

export function useLeagues() {
  return useQuery({
    queryKey: ['salesperson-leagues'],
    queryFn: async (): Promise<LeagueMember[]> => {
      const { data: salespeople, error: spErr } = await supabase
        .from('salespeople')
        .select('id, name, avatar_url')
        .eq('is_active', true);
      if (spErr) {
        console.error('Error fetching salespeople:', spErr);
        throw spErr;
      }

      // Try to get league members from new table
      const { data: members, error: membersErr } = await supabase
        .from('league_members')
        .select('*, leagues(*)');

      // Sem as inscrições não dá para dizer quem está em qual liga: propaga o erro
      // para a tela mostrar falha em vez de "nenhum vendedor participa".
      if (membersErr) throw membersErr;

      return (salespeople || [])
        .map((sp: SalespersonRow) => {
          const member = (members as LeagueMemberRow[] | null)?.find(
            m => m.salesperson_id === sp.id
          );
          const points = member?.weekly_xp || 0;
          const leagueTier = member?.leagues?.tier;
          const leagueKey =
            leagueTier === 5
              ? 'legendary'
              : leagueTier === 4
                ? 'diamond'
                : leagueTier === 3
                  ? 'gold'
                  : leagueTier === 2
                    ? 'silver'
                    : 'bronze';

          return {
            id: member?.id || sp.id,
            salesperson_id: sp.id,
            name: sp.name,
            avatar_url: sp.avatar_url,
            league: leagueKey as LeagueTier,
            points,
            league_id: member?.league_id || null,
            promoted_at: member?.promoted_at || null,
            demoted_at: member?.demoted_at || null,
          };
        })
        .sort((a, b) => b.points - a.points);
    },
    staleTime: 60000,
  });
}

interface LeagueEnrollment {
  /** Vendedor ligado ao usuário logado (null se o usuário não é vendedor). */
  salespersonId: string | null;
  /** Liga de entrada (menor tier cadastrado); null se não há liga cadastrada. */
  starterLeagueId: string | null;
}

export function useLeagueEnrollment() {
  return useQuery({
    queryKey: ['league-enrollment'],
    queryFn: async (): Promise<LeagueEnrollment> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return { salespersonId: null, starterLeagueId: null };

      const { data: sp, error: spErr } = await supabase
        .from('salespeople')
        .select('id')
        .eq('auth_user_id', user.id)
        .maybeSingle();
      if (spErr) throw spErr;

      const { data: league, error: leagueErr } = await supabase
        .from('leagues')
        .select('id')
        .order('tier', { ascending: true })
        .limit(1)
        .maybeSingle();
      if (leagueErr) throw leagueErr;

      return { salespersonId: sp?.id ?? null, starterLeagueId: league?.id ?? null };
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useJoinLeague() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      salespersonId,
      leagueId,
    }: {
      salespersonId: string;
      leagueId: string;
    }) => {
      // INSERT (não upsert): a RLS só permite ao vendedor inserir a própria linha;
      // UPDATE em league_members é restrito a admin/gestor.
      const { error } = await supabase
        .from('league_members')
        .insert({ salesperson_id: salespersonId, league_id: leagueId, weekly_xp: 0 });
      if (error) {
        if (error.code === '23505') throw new Error('Você já participa de uma liga.');
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salesperson-leagues'] });
    },
  });
}
