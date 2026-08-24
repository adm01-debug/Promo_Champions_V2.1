import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  route: string;
  checkFn: () => Promise<boolean>;
}

export function useOnboardingChecklist() {
  const { salesperson } = useAuth();
  const spId = salesperson?.id;

  const { data: completionState, refetch } = useQuery({
    queryKey: ['onboarding-checklist', spId],
    queryFn: async () => {
      if (!spId) return { profile: false, client: false, sale: false, goal: false };

      const [profileRes, clientRes, saleRes, goalRes] = await Promise.all([
        supabase.from('salespeople').select('avatar_url, email').eq('id', spId).single(),
        supabase.from('sales').select('id').eq('salesperson_id', spId).limit(1),
        supabase.from('sales').select('id').eq('salesperson_id', spId).eq('status', 'won').limit(1),
        supabase.from('sales_goals').select('id').eq('salesperson_id', spId).limit(1),
      ]);

      const profile = !!(profileRes.data?.avatar_url && profileRes.data?.email);
      const client = !!(clientRes.data && clientRes.data.length > 0);
      const sale = !!(saleRes.data && saleRes.data.length > 0);
      const goal = !!(goalRes.data && goalRes.data.length > 0);

      return { profile, client, sale, goal };
    },
    enabled: !!spId,
    staleTime: 1000 * 60 * 5,
  });

  const steps: OnboardingStep[] = useMemo(() => [
    {
      id: 'profile',
      title: 'Complete seu perfil',
      description: 'Adicione sua foto e email para ser identificado pela equipe',
      completed: completionState?.profile ?? false,
      route: '/configuracoes',
      checkFn: async () => completionState?.profile ?? false,
    },
    {
      id: 'client',
      title: 'Registre seu primeiro lead',
      description: 'Crie sua primeira oportunidade no pipeline',
      completed: completionState?.client ?? false,
      route: '/pipeline',
      checkFn: async () => completionState?.client ?? false,
    },
    {
      id: 'sale',
      title: 'Feche sua primeira venda',
      description: 'Mova um deal para "Ganho" no pipeline',
      completed: completionState?.sale ?? false,
      route: '/pipeline',
      checkFn: async () => completionState?.sale ?? false,
    },
    {
      id: 'goal',
      title: 'Defina sua meta mensal',
      description: 'Configure seu objetivo de faturamento',
      completed: completionState?.goal ?? false,
      route: '/metas',
      checkFn: async () => completionState?.goal ?? false,
    },
  ], [completionState]);

  const completedCount = steps.filter(s => s.completed).length;
  const totalSteps = steps.length;
  const progress = totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0;
  const isComplete = completedCount === totalSteps;

  return { steps, completedCount, totalSteps, progress, isComplete, refetch };
}
