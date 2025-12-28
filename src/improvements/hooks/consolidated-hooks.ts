// src/hooks/consolidated/useDashboard.ts
// Consolidação: useBIGestor + useBIVendedor + useDashboardKPIs
// Data: 2024-12-28

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

type DashboardRole = 'admin' | 'manager' | 'seller';

interface DashboardData {
  kpis: {
    revenue: number;
    deals: number;
    activities: number;
    conversion: number;
  };
  charts: {
    sales: any[];
    pipeline: any[];
    performance: any[];
  };
  recent: {
    activities: any[];
    deals: any[];
  };
}

export const useDashboard = (role: DashboardRole, userId?: string) => {
  return useQuery({
    queryKey: ['dashboard', role, userId],
    queryFn: async (): Promise<DashboardData> => {
      const rpcName = role === 'admin' ? 'get_admin_dashboard' 
                    : role === 'manager' ? 'get_manager_dashboard'
                    : 'get_seller_dashboard';

      const { data, error } = await supabase.rpc(rpcName, { 
        p_user_id: userId 
      });

      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 min
  });
};

// ============================================================================
// src/hooks/consolidated/useAlerts.ts
// Consolidação: useSDRAlertNotifications + useSecurityAlertNotifications + useActivityGoalAlerts
// ============================================================================

type AlertType = 'sdr' | 'security' | 'activity' | 'goal' | 'all';

interface Alert {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  read: boolean;
  created_at: string;
}

export const useAlerts = (type?: AlertType) => {
  return useQuery({
    queryKey: ['alerts', type],
    queryFn: async (): Promise<Alert[]> => {
      let query = supabase
        .from('alerts')
        .select('*')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (type && type !== 'all') {
        query = query.eq('type', type);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 30, // 30s
  });
};

// ============================================================================
// src/hooks/consolidated/useSoundSettings.ts
// Consolidação: useSDRAlertSoundSettings + useSecurityAlertSoundSettings + useSystemSoundSettings
// ============================================================================

interface SoundSettings {
  enabled: boolean;
  volume: number;
  sounds: Record<string, string>;
}

export const useSoundSettings = (category: string = 'system') => {
  return useQuery({
    queryKey: ['sound-settings', category],
    queryFn: async (): Promise<SoundSettings> => {
      const { data, error } = await supabase
        .from('sound_settings')
        .select('*')
        .eq('category', category)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (error) throw error;
      return data || { enabled: true, volume: 0.5, sounds: {} };
    },
  });
};

// ============================================================================
// src/hooks/consolidated/useAchievements.ts
// Consolidação: useAchievements + useAchievementsByPerson + useAchievementTrends + useTeamAchievementStats
// ============================================================================

interface AchievementFilters {
  userId?: string;
  teamId?: string;
  type?: 'personal' | 'team' | 'trending';
  period?: 'day' | 'week' | 'month' | 'year';
  unlocked?: boolean;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xp_reward: number;
  unlocked: boolean;
  unlocked_at?: string;
  progress: number;
  required: number;
}

export const useAchievements = (filters: AchievementFilters = {}) => {
  return useQuery({
    queryKey: ['achievements', filters],
    queryFn: async (): Promise<Achievement[]> => {
      let query = supabase.from('achievements').select('*');

      if (filters.userId) query = query.eq('user_id', filters.userId);
      if (filters.teamId) query = query.eq('team_id', filters.teamId);
      if (filters.type) query = query.eq('type', filters.type);
      if (filters.unlocked !== undefined) {
        query = filters.unlocked 
          ? query.not('unlocked_at', 'is', null)
          : query.is('unlocked_at', null);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });
};

// Trends específico
export const useAchievementTrends = (period: string = 'week') => {
  return useQuery({
    queryKey: ['achievement-trends', period],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_achievement_trends', {
        period_type: period,
      });
      if (error) throw error;
      return data;
    },
  });
};

// Stats de time
export const useTeamAchievementStats = (teamId: string) => {
  return useQuery({
    queryKey: ['team-achievement-stats', teamId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_team_achievement_stats', {
        p_team_id: teamId,
      });
      if (error) throw error;
      return data;
    },
  });
};
