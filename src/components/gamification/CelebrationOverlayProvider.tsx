import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { calculateLevelFromXP, getLevelInfo } from '@/hooks/useSalespersonXP';
import { useLevelUpCelebration } from '@/hooks/useLevelUpCelebration';
import { LevelUpOverlay, StreakMilestoneOverlay } from './LevelUpOverlay';
import { VictoryOverlay } from './VictoryOverlay';
import { useAuth } from '@/contexts/AuthContext';

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

interface VictoryData {
  salespersonId: string;
  salespersonName: string;
  title: string;
  description: string;
  eventType: 'sale' | 'achievement' | 'streak' | 'level_up';
  value?: number;
}

// Streak milestone info mapping
const STREAK_MILESTONE_INFO: Record<string, { title: string; icon: string; xp: number }> = {
  'streak_3': { title: 'Iniciante Dedicado', icon: '🔥', xp: 50 },
  'streak_7': { title: 'Semana Perfeita', icon: '⚡', xp: 150 },
  'streak_14': { title: 'Duas Semanas de Fogo', icon: '🌟', xp: 400 },
  'streak_30': { title: 'Mestre da Consistência', icon: '👑', xp: 1000 },
};

export function CelebrationOverlayProvider() {
  const { salesperson } = useAuth();
  const { triggerLevelUp, triggerStreakMilestone } = useLevelUpCelebration();
  const salespersonNamesRef = useRef<Map<string, string>>(new Map());
  
  // Overlay state
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpData, setLevelUpData] = useState<LevelUpData | null>(null);
  const [showStreak, setShowStreak] = useState(false);
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [showVictory, setShowVictory] = useState(false);
  const [victoryData, setVictoryData] = useState<VictoryData | null>(null);

  // Queue for celebrations
  const celebrationQueueRef = useRef<Array<{ type: 'levelUp' | 'streak' | 'victory'; data: any }>>([]);
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
      triggerLevelUp({
        salespersonId: data.salespersonId,
        salespersonName: data.salespersonName,
        newLevel: data.level,
        levelTitle: data.levelTitle,
        levelEmoji: data.levelEmoji,
      });
    } else if (next.type === 'streak') {
      const data = next.data as StreakData;
      setStreakData(data);
      setShowStreak(true);
      triggerStreakMilestone({
        salespersonId: data.salespersonId,
        salespersonName: data.salespersonName,
        streakDays: data.streakDays,
      });
    } else if (next.type === 'victory') {
      const data = next.data as VictoryData;
      setVictoryData(data);
      setShowVictory(true);
    }
  }, [triggerLevelUp, triggerStreakMilestone]);

  const handleComplete = useCallback(() => {
    setShowLevelUp(false);
    setShowStreak(false);
    setShowVictory(false);
    setLevelUpData(null);
    setStreakData(null);
    setVictoryData(null);
    isShowingRef.current = false;
    setTimeout(() => processQueue(), 500);
  }, [processQueue]);

  useEffect(() => {
    const loadSalespersonNames = async () => {
      const { data } = await supabase.from('salespeople').select('id, name').eq('is_active', true);
      if (data) data.forEach(sp => salespersonNamesRef.current.set(sp.id, sp.name));
    };
    loadSalespersonNames();

    // Subscribe to victory_feed for current user
    let victoryChannel: any;
    if (salesperson?.id) {
      victoryChannel = supabase
        .channel('victory-celebrations')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'victory_feed', filter: `salesperson_id=eq.${salesperson.id}` },
          (payload) => {
            const newItem = payload.new;
            celebrationQueueRef.current.push({
              type: 'victory',
              data: {
                salespersonId: salesperson.id,
                salespersonName: salesperson.name || 'Vendedor',
                title: newItem.title,
                description: newItem.description,
                eventType: newItem.event_type,
                value: newItem.value
              }
            });
            processQueue();
          }
        )
        .subscribe();
    }

    // Subscribe to XP changes
    const xpChannel = supabase
      .channel('xp-celebrations-overlay')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'salesperson_xp' }, (payload) => {
        const newRecord = payload.new as any;
        const oldRecord = payload.old as any;
        if (!newRecord || !oldRecord) return;
        const oldLevel = calculateLevelFromXP(oldRecord.total_xp);
        const newLevel = calculateLevelFromXP(newRecord.total_xp);
        if (newLevel.level > oldLevel.level) {
          const levelInfo = getLevelInfo(newLevel.level);
          celebrationQueueRef.current.push({
            type: 'levelUp',
            data: {
              salespersonId: newRecord.salesperson_id,
              salespersonName: salespersonNamesRef.current.get(newRecord.salesperson_id) || 'Vendedor',
              level: newLevel.level,
              levelTitle: levelInfo.title,
              levelEmoji: levelInfo.emoji,
            }
          });
          processQueue();
        }
      })
      .subscribe();

    return () => {
      if (victoryChannel) supabase.removeChannel(victoryChannel);
      supabase.removeChannel(xpChannel);
    };
  }, [salesperson?.id, salesperson?.name, processQueue]);

  return (
    <>
      <LevelUpOverlay
        isVisible={showLevelUp}
        level={levelUpData?.level || 1}
        levelTitle={levelUpData?.levelTitle || ''}
        levelEmoji={levelUpData?.levelEmoji || '🌟'}
        salespersonName={levelUpData?.salespersonName || ''}
        onComplete={handleComplete}
      />
      <StreakMilestoneOverlay
        isVisible={showStreak}
        streakDays={streakData?.streakDays || 0}
        salespersonName={streakData?.salespersonName || ''}
        milestoneTitle={streakData?.milestoneTitle}
        milestoneIcon={streakData?.milestoneIcon}
        xpReward={streakData?.xpReward}
        onComplete={handleComplete}
      />
      <VictoryOverlay
        isVisible={showVictory}
        title={victoryData?.title || ''}
        description={victoryData?.description || ''}
        eventType={victoryData?.eventType || 'achievement'}
        value={victoryData?.value}
        salespersonName={victoryData?.salespersonName || ''}
        onComplete={handleComplete}
      />
    </>
  );
}
