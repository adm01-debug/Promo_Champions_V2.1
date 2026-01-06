import { useMemo } from "react";
import { useCompetitiveRanking } from "./useCompetitiveRanking";

export type RoleFilter = 'all' | 'sdr' | 'closer' | 'hybrid' | 'gestao';

interface RankingByRoleResult {
  ranking: ReturnType<typeof useCompetitiveRanking>['data'];
  isLoading: boolean;
  roleStats: {
    role: RoleFilter;
    count: number;
    totalSales: number;
    avgSales: number;
  }[];
}

export function useRankingByRole(roleFilter: RoleFilter = 'all'): RankingByRoleResult {
  const { data: allRanking, isLoading } = useCompetitiveRanking();

  const filteredRanking = useMemo(() => {
    if (!allRanking) return undefined;
    
    if (roleFilter === 'all') {
      return allRanking;
    }

    // Filter by role and recalculate ranks
    const filtered = allRanking
      .filter(person => person.role === roleFilter)
      .map((person, index) => ({
        ...person,
        rank: index + 1,
        gapToFirst: 0,
        gapToNext: 0,
      }));

    // Recalculate gaps
    const firstPlaceSales = filtered[0]?.totalSales || 0;
    return filtered.map((person, index) => {
      const nextSales = index > 0 ? filtered[index - 1].totalSales : person.totalSales;
      return {
        ...person,
        gapToFirst: firstPlaceSales - person.totalSales,
        gapToNext: nextSales - person.totalSales,
      };
    });
  }, [allRanking, roleFilter]);

  const roleStats = useMemo(() => {
    if (!allRanking) return [];

    const roles: RoleFilter[] = ['sdr', 'closer', 'hybrid', 'gestao'];
    
    return roles.map(role => {
      const people = allRanking.filter(p => p.role === role);
      const totalSales = people.reduce((sum, p) => sum + p.totalSales, 0);
      
      return {
        role,
        count: people.length,
        totalSales,
        avgSales: people.length > 0 ? totalSales / people.length : 0,
      };
    }).filter(stat => stat.count > 0);
  }, [allRanking]);

  return {
    ranking: filteredRanking,
    isLoading,
    roleStats,
  };
}

// Labels and colors for roles
export const ROLE_CONFIG: Record<RoleFilter, { label: string; color: string; bgColor: string }> = {
  all: { label: 'Todos', color: 'text-foreground', bgColor: 'bg-muted' },
  sdr: { label: 'SDR', color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  closer: { label: 'Closer', color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
  hybrid: { label: 'Híbrido', color: 'text-amber-500', bgColor: 'bg-amber-500/10' },
  gestao: { label: 'Gestão', color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' },
};
