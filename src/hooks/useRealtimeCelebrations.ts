import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLevelUpCelebration } from './useLevelUpCelebration';
import { calculateLevelFromXP, getLevelInfo } from './useSalespersonXP';

interface XPChangePayload {
  new: {
    id: string;
    salesperson_id: string;
    total_xp: number;
    current_level: number;
  };
  old: {
    id: string;
    salesperson_id: string;
    total_xp: number;
    current_level: number;
  };
}

export function useRealtimeCelebrations() {
  const { triggerLevelUp, triggerStreakMilestone } = useLevelUpCelebration();
  const salespersonNamesRef = useRef<Map<string, string>>(new Map());
  const previousLevelsRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    // Load salesperson names for celebrations
    const loadSalespersonNames = async () => {
      const { data } = await supabase
        .from('salespeople')
        .select('id, name')
        .eq('is_active', true);
      
      if (data) {
        data.forEach(sp => {
          salespersonNamesRef.current.set(sp.id, sp.name);
        });
      }
    };

    // Load current XP levels
    const loadCurrentLevels = async () => {
      const { data } = await supabase
        .from('salesperson_xp')
        .select('salesperson_id, current_level');
      
      if (data) {
        data.forEach(xp => {
          previousLevelsRef.current.set(xp.salesperson_id, xp.current_level);
        });
      }
    };

    loadSalespersonNames();
    loadCurrentLevels();

    // Subscribe to XP changes
    const channel = supabase
      .channel('xp-celebrations')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'salesperson_xp',
        },
        (payload) => {
          const { new: newRecord, old: oldRecord } = payload as unknown as XPChangePayload;
          
          if (!newRecord || !oldRecord) return;

          const salespersonId = newRecord.salesperson_id;
          const salespersonName = salespersonNamesRef.current.get(salespersonId) || 'Vendedor';
          
          // Calculate levels from XP
          const oldLevel = calculateLevelFromXP(oldRecord.total_xp);
          const newLevel = calculateLevelFromXP(newRecord.total_xp);

          // Check for level up
          if (newLevel.level > oldLevel.level) {
            const levelInfo = getLevelInfo(newLevel.level);
            
            console.log(`🎉 Level Up detected! ${salespersonName}: ${oldLevel.level} → ${newLevel.level}`);
            
            triggerLevelUp({
              salespersonId,
              salespersonName,
              newLevel: newLevel.level,
              levelTitle: levelInfo.title,
              levelEmoji: levelInfo.emoji,
            });
          }

          // Update tracked level
          previousLevelsRef.current.set(salespersonId, newLevel.level);
        }
      )
      .subscribe();

    // Subscribe to achievements for streak milestones
    const achievementsChannel = supabase
      .channel('achievement-celebrations')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'achievements',
        },
        async (payload) => {
          const achievement = payload.new as {
            salesperson_id: string;
            achievement_type: string;
            details: { streak_days?: number } | null;
          };

          if (achievement.achievement_type === 'streak_milestone') {
            const salespersonName = salespersonNamesRef.current.get(achievement.salesperson_id) || 'Vendedor';
            const streakDays = achievement.details?.streak_days || 0;

            console.log(`🔥 Streak milestone detected! ${salespersonName}: ${streakDays} days`);

            triggerStreakMilestone({
              salespersonId: achievement.salesperson_id,
              salespersonName,
              streakDays,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(achievementsChannel);
    };
  }, [triggerLevelUp, triggerStreakMilestone]);
}
