import { useCallback } from 'react';
import { useXPToast } from '@/components/gamification/XPToast';

type XPAction = 
  | 'activity_logged'
  | 'deal_closed'
  | 'deal_moved'
  | 'task_completed'
  | 'challenge_completed'
  | 'streak_maintained'
  | 'streak_milestone'
  | 'level_up'
  | 'client_added'
  | 'call_made'
  | 'email_sent'
  | 'meeting_scheduled'
  | 'goal_reached';

const XP_REWARDS: Record<XPAction, { base: number; reason: string; type: 'xp' | 'streak' | 'level_up' }> = {
  activity_logged: { base: 10, reason: 'Atividade registrada', type: 'xp' },
  deal_closed: { base: 100, reason: 'Venda fechada! 🎉', type: 'xp' },
  deal_moved: { base: 5, reason: 'Deal movido no pipeline', type: 'xp' },
  task_completed: { base: 15, reason: 'Tarefa concluída', type: 'xp' },
  challenge_completed: { base: 50, reason: 'Desafio completado! 🏆', type: 'xp' },
  streak_maintained: { base: 25, reason: 'Streak mantido! 🔥', type: 'streak' },
  streak_milestone: { base: 100, reason: 'Marco de streak! 🔥🔥', type: 'streak' },
  level_up: { base: 200, reason: 'Subiu de nível! 🚀', type: 'level_up' },
  client_added: { base: 20, reason: 'Novo cliente adicionado', type: 'xp' },
  call_made: { base: 10, reason: 'Ligação realizada', type: 'xp' },
  email_sent: { base: 5, reason: 'Email enviado', type: 'xp' },
  meeting_scheduled: { base: 25, reason: 'Reunião agendada', type: 'xp' },
  goal_reached: { base: 150, reason: 'Meta atingida! 🎯', type: 'xp' },
};

interface XPGainOptions {
  multiplier?: number;
  customReason?: string;
  silent?: boolean;
}

export function useXPActions() {
  const { showXP } = useXPToast();

  const awardXP = useCallback((action: XPAction, options: XPGainOptions = {}) => {
    const { multiplier = 1, customReason, silent = false } = options;
    const reward = XP_REWARDS[action];
    
    if (!reward) return;

    const amount = Math.round(reward.base * multiplier);
    const reason = customReason || reward.reason;

    if (!silent) {
      showXP(amount, reason, reward.type);
    }

    // Here you could also persist to the database
    // await supabase.from('xp_transactions').insert({ ... })

    return { amount, reason, type: reward.type };
  }, [showXP]);

  // Convenience methods for common actions
  const logActivity = useCallback((activityType?: string) => {
    const customReason = activityType 
      ? `${activityType} registrada` 
      : undefined;
    return awardXP('activity_logged', { customReason });
  }, [awardXP]);

  const closeDeal = useCallback((dealValue?: number) => {
    // Higher value deals give more XP
    const multiplier = dealValue ? Math.min(3, 1 + (dealValue / 50000)) : 1;
    return awardXP('deal_closed', { multiplier });
  }, [awardXP]);

  const moveDeal = useCallback(() => {
    return awardXP('deal_moved');
  }, [awardXP]);

  const completeTask = useCallback(() => {
    return awardXP('task_completed');
  }, [awardXP]);

  const completeChallenge = useCallback((xpReward?: number) => {
    if (xpReward) {
      showXP(xpReward, 'Desafio completado! 🏆', 'xp');
      return { amount: xpReward, reason: 'Desafio completado! 🏆', type: 'xp' };
    }
    return awardXP('challenge_completed');
  }, [awardXP, showXP]);

  const maintainStreak = useCallback((streakCount: number) => {
    // Milestones at 7, 14, 30, 60, 90 days
    const milestones = [7, 14, 30, 60, 90];
    const isMilestone = milestones.includes(streakCount);
    
    if (isMilestone) {
      return awardXP('streak_milestone', { 
        customReason: `${streakCount} dias de streak! 🔥` 
      });
    }
    return awardXP('streak_maintained');
  }, [awardXP]);

  const levelUp = useCallback((newLevel: number) => {
    showXP(200, `Nível ${newLevel} alcançado! 🚀`, 'level_up');
    return { amount: 200, reason: `Nível ${newLevel} alcançado!`, type: 'level_up' };
  }, [showXP]);

  const addClient = useCallback(() => {
    return awardXP('client_added');
  }, [awardXP]);

  const makeCall = useCallback(() => {
    return awardXP('call_made');
  }, [awardXP]);

  const sendEmail = useCallback(() => {
    return awardXP('email_sent');
  }, [awardXP]);

  const scheduleMeeting = useCallback(() => {
    return awardXP('meeting_scheduled');
  }, [awardXP]);

  const reachGoal = useCallback((goalName?: string) => {
    const customReason = goalName 
      ? `Meta "${goalName}" atingida! 🎯` 
      : undefined;
    return awardXP('goal_reached', { customReason });
  }, [awardXP]);

  return {
    // Generic method
    awardXP,
    // Convenience methods
    logActivity,
    closeDeal,
    moveDeal,
    completeTask,
    completeChallenge,
    maintainStreak,
    levelUp,
    addClient,
    makeCall,
    sendEmail,
    scheduleMeeting,
    reachGoal,
  };
}
