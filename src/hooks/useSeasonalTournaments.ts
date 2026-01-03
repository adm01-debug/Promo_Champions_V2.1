import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CACHE_TIMES } from '@/constants';

export interface TournamentParticipant {
  id: string;
  name: string;
  score: number;
  rank: number;
  trend: 'up' | 'down' | 'stable';
}

export interface Tournament {
  id: string;
  name: string;
  description: string;
  type: 'monthly' | 'quarterly' | 'special';
  startDate: string;
  endDate: string;
  prizePool: string;
  participants: TournamentParticipant[];
  status: 'upcoming' | 'active' | 'finished';
  metric: 'revenue' | 'deals' | 'activities';
}

export interface SeasonalTournamentsResult {
  activeTournament: Tournament | null;
  upcomingTournaments: Tournament[];
  pastTournaments: Tournament[];
  userRank: number | null;
  userScore: number;
}

export function useSeasonalTournaments() {
  return useQuery({
    queryKey: ['seasonal-tournaments'],
    queryFn: async (): Promise<SeasonalTournamentsResult> => {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // Buscar salespeople com suas vendas do mês
      const { data: salespeople } = await supabase
        .from('salespeople')
        .select('id, name');

      const { data: sales } = await supabase
        .from('sales')
        .select('salesperson_id, amount, status')
        .eq('status', 'completed')
        .gte('created_at', monthStart.toISOString())
        .lte('created_at', monthEnd.toISOString());

      // Calcular rankings
      const scoresByPerson: Record<string, number> = {};
      sales?.forEach(sale => {
        if (sale.salesperson_id) {
          scoresByPerson[sale.salesperson_id] = (scoresByPerson[sale.salesperson_id] || 0) + sale.amount;
        }
      });

      const participants: TournamentParticipant[] = (salespeople || [])
        .map(sp => ({
          id: sp.id,
          name: sp.name,
          score: scoresByPerson[sp.id] || 0,
          rank: 0,
          trend: 'stable' as const,
        }))
        .sort((a, b) => b.score - a.score)
        .map((p, idx) => ({ ...p, rank: idx + 1 }));

      // Criar torneio mensal
      const monthlyTournament: Tournament = {
        id: `monthly-${now.getFullYear()}-${now.getMonth()}`,
        name: `Torneio ${now.toLocaleDateString('pt-BR', { month: 'long' })}`,
        description: 'Quem vende mais neste mês leva o prêmio!',
        type: 'monthly',
        startDate: monthStart.toISOString(),
        endDate: monthEnd.toISOString(),
        prizePool: '🥇 R$500 + Day Off | 🥈 R$300 | 🥉 R$200',
        participants,
        status: 'active',
        metric: 'revenue',
      };

      // Criar torneio trimestral
      const quarter = Math.floor(now.getMonth() / 3) + 1;
      const quarterlyTournament: Tournament = {
        id: `quarterly-${now.getFullYear()}-Q${quarter}`,
        name: `Grande Prêmio Q${quarter}`,
        description: 'Torneio trimestral com premiação especial!',
        type: 'quarterly',
        startDate: new Date(now.getFullYear(), (quarter - 1) * 3, 1).toISOString(),
        endDate: new Date(now.getFullYear(), quarter * 3, 0).toISOString(),
        prizePool: '🏆 Viagem + R$2000 | 🥈 R$1000 | 🥉 R$500',
        participants: [],
        status: 'active',
        metric: 'revenue',
      };

      return {
        activeTournament: monthlyTournament,
        upcomingTournaments: [quarterlyTournament],
        pastTournaments: [],
        userRank: participants[0]?.rank || null,
        userScore: participants[0]?.score || 0,
      };
    },
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.GC_TIME,
  });
}
