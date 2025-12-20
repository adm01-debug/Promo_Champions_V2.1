import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { calculateLevelFromXP, getLevelInfo } from '@/hooks/useSalespersonXP';
import { useLevelUpCelebration } from '@/hooks/useLevelUpCelebration';
import { LevelUpOverlay, StreakMilestoneOverlay } from './LevelUpOverlay';

interface LevelUpData {
  salespersonId: string;
  salespersonName: string;
  level: number;
  levelTitle: string;
  levelEmoji: string;
}

interface StreakData {
  salespersonId: string;
  salespersonName: string;
  streakDays: number;
  milestoneTitle?: string;
  milestoneIcon?: string;
  xpReward?: number;
}

// Streak milestone info mapping
const STREAK_MILESTONE_INFO: Record<string, { title: string; icon: string; xp: number }> = {
  'streak_3': { title: 'Iniciante Dedicado', icon: '🔥', xp: 50 },
  'streak_7': { title: 'Semana Perfeita', icon: '⚡', xp: 150 },
  'streak_14': { title: 'Duas Semanas de Fogo', icon: '🌟', xp: 400 },
  'streak_30': { title: 'Mestre da Consistência', icon: '👑', xp: 1000 },
};

export function CelebrationOverlayProvider() {
  const { triggerLevelUp, triggerStreakMilestone } = useLevelUpCelebration();
  const salespersonNamesRef = useRef<Map<string, string>>(new Map());
  
  // Overlay state
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpData, setLevelUpData] = useState<LevelUpData | null>(null);
  const [showStreak, setShowStreak] = useState(false);
  const [streakData, setStreakData] = useState<StreakData | null>(null);

  // Queue for celebrations
  const celebrationQueueRef = useRef<Array<{ type: 'levelUp' | 'streak'; data: LevelUpData | StreakData }>>([]);
  const isShowingRef = useRef(false);

  const processQueue = useCallback(() => {
    if (isShowingRef.current || celebrationQueueRef.current.length === 0) return;
    
    const next = celebrationQueueRef.current.shift();
    if (!next) return;

    isShowingRef.current = true;

    if (next.type === 'levelUp') {
      const data = next.data as LevelUpData;
      setLevelUpData(data);
      setShowLevelUp(true);
      // Also trigger confetti
      triggerLevelUp({
        salespersonId: data.salespersonId,
        salespersonName: data.salespersonName,
        newLevel: data.level,
        levelTitle: data.levelTitle,
        levelEmoji: data.levelEmoji,
      });
    } else {
      const data = next.data as StreakData;
      setStreakData(data);
      setShowStreak(true);
      // Also trigger confetti
      triggerStreakMilestone({
        salespersonId: data.salespersonId,
        salespersonName: data.salespersonName,
        streakDays: data.streakDays,
      });
    }
  }, [triggerLevelUp, triggerStreakMilestone]);

  const handleLevelUpComplete = useCallback(() => {
    setShowLevelUp(false);
    setLevelUpData(null);
    isShowingRef.current = false;
    // Process next in queue after a short delay
    setTimeout(() => processQueue(), 500);
  }, [processQueue]);

  const handleStreakComplete = useCallback(() => {
    setShowStreak(false);
    setStreakData(null);
    isShowingRef.current = false;
    // Process next in queue after a short delay
    setTimeout(() => processQueue(), 500);
  }, [processQueue]);

  useEffect(() => {
    // Load salesperson names
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

    loadSalespersonNames();

    // Subscribe to XP changes for level-ups
    const xpChannel = supabase
      .channel('xp-celebrations-overlay')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'salesperson_xp',
        },
        (payload) => {
          const newRecord = payload.new as { salesperson_id: string; total_xp: number; current_level: number };
          const oldRecord = payload.old as { salesperson_id: string; total_xp: number; current_level: number };
          
          if (!newRecord || !oldRecord) return;

          const salespersonId = newRecord.salesperson_id;
          const salespersonName = salespersonNamesRef.current.get(salespersonId) || 'Vendedor';
          
          // Calculate levels from XP
          const oldLevel = calculateLevelFromXP(oldRecord.total_xp);
          const newLevel = calculateLevelFromXP(newRecord.total_xp);

          // Check for level up
          if (newLevel.level > oldLevel.level) {
            const levelInfo = getLevelInfo(newLevel.level);
            
            console.log(`🎉 Level Up overlay queued! ${salespersonName}: ${oldLevel.level} → ${newLevel.level}`);
            
            celebrationQueueRef.current.push({
              type: 'levelUp',
              data: {
                salespersonId,
                salespersonName,
                level: newLevel.level,
                levelTitle: levelInfo.title,
                levelEmoji: levelInfo.emoji,
              }
            });
            processQueue();
          }
        }
      )
      .subscribe();

    // Subscribe to achievements for streak milestones (legacy)
    const achievementsChannel = supabase
      .channel('achievement-celebrations-overlay')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'achievements',
        },
        (payload) => {
          const achievement = payload.new as {
            salesperson_id: string;
            achievement_type: string;
            details: { streak_days?: number } | null;
          };

          if (achievement.achievement_type === 'streak_milestone') {
            const salespersonName = salespersonNamesRef.current.get(achievement.salesperson_id) || 'Vendedor';
            const streakDays = achievement.details?.streak_days || 0;

            console.log(`🔥 Streak milestone overlay queued! ${salespersonName}: ${streakDays} days`);

            celebrationQueueRef.current.push({
              type: 'streak',
              data: {
                salespersonId: achievement.salesperson_id,
                salespersonName,
                streakDays,
              }
            });
            processQueue();
          }
        }
      )
      .subscribe();

    // Subscribe to daily_streak_achievements for new streak system
    const dailyStreakChannel = supabase
      .channel('daily-streak-celebrations-overlay')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'daily_streak_achievements',
        },
        (payload) => {
          const streakAchievement = payload.new as {
            salesperson_id: string;
            streak_type: string;
            streak_count: number;
            xp_awarded: number;
          };

          const salespersonName = salespersonNamesRef.current.get(streakAchievement.salesperson_id) || 'Vendedor';
          const milestoneInfo = STREAK_MILESTONE_INFO[streakAchievement.streak_type];

          console.log(`🔥 Daily streak achievement overlay queued! ${salespersonName}: ${streakAchievement.streak_type}`);

          celebrationQueueRef.current.push({
            type: 'streak',
            data: {
              salespersonId: streakAchievement.salesperson_id,
              salespersonName,
              streakDays: streakAchievement.streak_count,
              milestoneTitle: milestoneInfo?.title || 'Conquista de Streak!',
              milestoneIcon: milestoneInfo?.icon || '🔥',
              xpReward: streakAchievement.xp_awarded,
            }
          });
          processQueue();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(xpChannel);
      supabase.removeChannel(achievementsChannel);
      supabase.removeChannel(dailyStreakChannel);
    };
  }, [processQueue]);

  return (
    <>
      <LevelUpOverlay
        isVisible={showLevelUp}
        level={levelUpData?.level || 1}
        levelTitle={levelUpData?.levelTitle || ''}
        levelEmoji={levelUpData?.levelEmoji || '🌟'}
        salespersonName={levelUpData?.salespersonName || ''}
        onComplete={handleLevelUpComplete}
      />
      <StreakMilestoneOverlay
        isVisible={showStreak}
        streakDays={streakData?.streakDays || 0}
        salespersonName={streakData?.salespersonName || ''}
        milestoneTitle={streakData?.milestoneTitle}
        milestoneIcon={streakData?.milestoneIcon}
        xpReward={streakData?.xpReward}
        onComplete={handleStreakComplete}
      />
    </>
  );
}
