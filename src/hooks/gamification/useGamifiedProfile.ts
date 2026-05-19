import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, endOfMonth } from 'date-fns';

export interface GamifiedProfile {
  id: string;
  name: string;
  avatar_url: string | null;
  role: string;
  // Ranking
  rank: number;
  totalSales: number;
  dealsCount: number;
  // Streak
  currentStreak: number;
  longestStreak: number;
  // League
  league: string | null;
  leaguePoints: number;
  // Badges
  badgeCount: number;
  // XP
  totalXp: number;
  // Kudos received
  kudosReceived: number;
  // H2H record
  h2hWins: number;
  h2hLosses: number;
}

export function useGamifiedProfile(salespersonId?: string) {
  return useQuery({
    queryKey: ['gamified-profile', salespersonId],
    queryFn: async (): Promise<GamifiedProfile | null> => {
      if (!salespersonId) return null;
      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);

      const [spRes, salesRes, streakRes, leagueRes, badgeRes, kudosRes, matchupRes] = await Promise.all([
        supabase.from('salespeople').select('id, name, avatar_url, role').eq('id', salespersonId).single(),
        supabase.from('sales').select('amount').eq('salesperson_id', salespersonId).eq('status', 'completed')
          .gte('created_at', monthStart.toISOString()).lte('created_at', monthEnd.toISOString()),
        supabase.from('sales_streaks').select('current_streak, longest_streak').eq('salesperson_id', salespersonId).maybeSingle(),
        supabase.from('salesperson_leagues').select('league, points').eq('salesperson_id', salespersonId).maybeSingle(),
        supabase.from('salesperson_badges').select('id').eq('salesperson_id', salespersonId),
        supabase.from('kudos').select('id').eq('to_salesperson_id', salespersonId),
        supabase.from('weekly_matchups').select('winner_id')
          .or(`salesperson_a_id.eq.${salespersonId},salesperson_b_id.eq.${salespersonId}`)
          .eq('status', 'completed'),
      ]);

      if (spRes.error || !spRes.data) return null;
      const sp = spRes.data;
      const sales = salesRes.data || [];
      const totalSales = sales.reduce((s, r) => s + Number(r.amount), 0);

      // Get rank
      const { data: allSales } = await supabase
        .from('sales').select('salesperson_id, amount')
        .eq('status', 'completed')
        .gte('created_at', monthStart.toISOString()).lte('created_at', monthEnd.toISOString());
      
      const salesBySp = new Map<string, number>();
      (allSales || []).forEach(s => {
        salesBySp.set(s.salesperson_id ?? '', (salesBySp.get(s.salesperson_id ?? '') || 0) + Number(s.amount));
      });
      const sortedSales = [...salesBySp.entries()].sort((a, b) => b[1] - a[1]);
      const rank = sortedSales.findIndex(([id]) => id === salespersonId) + 1;

      const matchups = matchupRes.data || [];
      const h2hWins = matchups.filter(m => m.winner_id === salespersonId).length;
      const h2hLosses = matchups.filter(m => m.winner_id && m.winner_id !== salespersonId).length;

      // Estimate XP from badges + streak
      const badgeCount = badgeRes.data?.length || 0;
      const totalXp = badgeCount * 100 + (streakRes.data?.longest_streak || 0) * 50 + sales.length * 30;

      return {
        id: sp.id,
        name: sp.name,
        avatar_url: sp.avatar_url,
        role: sp.role,
        rank: rank || 999,
        totalSales,
        dealsCount: sales.length,
        currentStreak: streakRes.data?.current_streak || 0,
        longestStreak: streakRes.data?.longest_streak || 0,
        league: leagueRes.data?.league || null,
        leaguePoints: leagueRes.data?.points || 0,
        badgeCount,
        totalXp,
        kudosReceived: kudosRes.data?.length || 0,
        h2hWins,
        h2hLosses,
      };
    },
    enabled: !!salespersonId,
    staleTime: 60000,
  });
}
