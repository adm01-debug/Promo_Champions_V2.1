import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CollectibleBadge {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  category: string;
  rarity: string;
  unlock_condition: string;
  unlock_threshold: number;
  xp_reward: number;
}

export interface EarnedBadge {
  id: string;
  salesperson_id: string;
  badge_id: string;
  earned_at: string;
  is_showcase: boolean;
  badge?: CollectibleBadge;
}

const RARITY_ORDER: Record<string, number> = {
  legendary: 0,
  epic: 1,
  rare: 2,
  common: 3,
};

export function useCollectibleBadges(salespersonId?: string) {
  const allBadges = useQuery({
    queryKey: ['collectible-badges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collectible_badges')
        .select('*')
        .order('created_at');
      if (error) throw error;
      return (data || []) as CollectibleBadge[];
    },
  });

  const earnedBadges = useQuery({
    queryKey: ['earned-badges', salespersonId],
    queryFn: async () => {
      if (!salespersonId) return [];
      const { data, error } = await supabase
        .from('salesperson_badges')
        .select('*, badge:badge_id(*)')
        .eq('salesperson_id', salespersonId)
        .order('earned_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((eb) => ({
        ...eb,
        badge: eb.badge as unknown as CollectibleBadge,
      })) as EarnedBadge[];
    },
    enabled: !!salespersonId,
  });

  const allBadgesLeaderboard = useQuery({
    queryKey: ['badges-leaderboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('salesperson_badges')
        .select('salesperson_id, badge:badge_id(rarity)');
      if (error) throw error;

      const countMap = new Map<string, number>();
      (data || []).forEach((r) => {
        countMap.set(r.salesperson_id, (countMap.get(r.salesperson_id) || 0) + 1);
      });

      const { data: sp } = await supabase
        .from('salespeople')
        .select('id, name, avatar_url')
        .eq('is_active', true);

      return (sp || [])
        .map(s => ({ ...s, badgeCount: countMap.get(s.id) || 0 }))
        .sort((a, b) => b.badgeCount - a.badgeCount);
    },
  });

  const { badgesByCategory, earnedIds } = useMemo(() => {
    const ids = new Set(earnedBadges.data?.map(e => e.badge_id) || []);

    const byCategory = (allBadges.data || []).reduce((acc, badge) => {
      if (!acc[badge.category]) acc[badge.category] = [];
      acc[badge.category].push({ ...badge, earned: ids.has(badge.id) });
      return acc;
    }, {} as Record<string, (CollectibleBadge & { earned: boolean })[]>);

    // Sort each category by rarity
    Object.values(byCategory).forEach(badges => {
      badges.sort((a, b) => (RARITY_ORDER[a.rarity] ?? 99) - (RARITY_ORDER[b.rarity] ?? 99));
    });

    return { badgesByCategory: byCategory, earnedIds: ids };
  }, [allBadges.data, earnedBadges.data]);

  return {
    allBadges: allBadges.data || [],
    earnedBadges: earnedBadges.data || [],
    badgesByCategory,
    leaderboard: allBadgesLeaderboard.data || [],
    earnedCount: earnedIds.size,
    totalCount: allBadges.data?.length || 0,
    isLoading: allBadges.isLoading || earnedBadges.isLoading,
  };
}
