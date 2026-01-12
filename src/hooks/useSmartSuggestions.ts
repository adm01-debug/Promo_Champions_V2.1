import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SuggestionItem {
  id: string;
  type: 'action' | 'insight' | 'reminder' | 'tip';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  dismissible?: boolean;
}

interface UseSmartSuggestionsOptions {
  salespersonId?: string;
  enabled?: boolean;
  maxSuggestions?: number;
}

/**
 * useSmartSuggestions - Hook for AI-powered suggestions based on user data
 * Analyzes sales patterns, activities, and goals to provide actionable insights
 */
export function useSmartSuggestions(options: UseSmartSuggestionsOptions = {}) {
  const { salespersonId, enabled = true, maxSuggestions = 5 } = options;
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSuggestions = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const generatedSuggestions: SuggestionItem[] = [];

      // 1. Check for stagnant deals
      const { data: stagnantDeals } = await supabase
        .from('sales')
        .select('id, client_name, status, updated_at')
        .in('status', ['pending', 'in_progress', 'negotiation'])
        .lt('updated_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .limit(3);

      if (stagnantDeals && stagnantDeals.length > 0) {
        generatedSuggestions.push({
          id: 'stagnant-deals',
          type: 'action',
          title: `${stagnantDeals.length} negócio(s) parado(s)`,
          description: `Você tem negócios sem atualização há mais de 7 dias. Considere fazer follow-up.`,
          priority: 'high',
          action: {
            label: 'Ver negócios',
            href: '/pipeline'
          },
          dismissible: true
        });
      }

      // 2. Check goal progress
      const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
      const { data: goals } = await supabase
        .from('sales_goals')
        .select('*')
        .eq('month', currentMonth)
        .limit(1);

      if (goals && goals.length > 0) {
        const goal = goals[0];
        
        // Fetch current revenue for this month
        const { data: salesData } = await supabase
          .from('sales')
          .select('amount')
          .eq('status', 'completed')
          .gte('created_at', currentMonth);
        
        const currentRevenue = salesData?.reduce((sum, s) => sum + (s.amount || 0), 0) || 0;
        const progressPercent = goal.goal_amount > 0 
          ? (currentRevenue / goal.goal_amount) * 100 
          : 0;
        
        const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
        const dayOfMonth = new Date().getDate();
        const expectedProgress = (dayOfMonth / daysInMonth) * 100;

        if (progressPercent < expectedProgress - 10) {
          generatedSuggestions.push({
            id: 'goal-behind',
            type: 'insight',
            title: 'Meta abaixo do esperado',
            description: `Você está em ${progressPercent.toFixed(0)}% da meta, mas deveria estar em ${expectedProgress.toFixed(0)}%. Intensifique as atividades!`,
            priority: 'high',
            action: {
              label: 'Ver metas',
              href: '/metas'
            },
            dismissible: true
          });
        } else if (progressPercent >= 100) {
          generatedSuggestions.push({
            id: 'goal-achieved',
            type: 'insight',
            title: '🎉 Meta batida!',
            description: `Parabéns! Você atingiu ${progressPercent.toFixed(0)}% da meta. Continue assim!`,
            priority: 'low',
            dismissible: true
          });
        }
      }

      // 3. Check recent completed sales for follow-up
      const { data: recentSales } = await supabase
        .from('sales')
        .select('client_name, created_at')
        .eq('status', 'completed')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentSales && recentSales.length >= 3) {
        generatedSuggestions.push({
          id: 'upsell-opportunity',
          type: 'tip',
          title: 'Oportunidade de upsell',
          description: `Você fechou ${recentSales.length} vendas recentemente. Considere oferecer produtos complementares.`,
          priority: 'medium',
          action: {
            label: 'Ver clientes',
            href: '/clientes'
          },
          dismissible: true
        });
      }

      // 4. Activity reminder
      const { data: recentActivities } = await supabase
        .from('activities')
        .select('id')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .limit(1);

      if (!recentActivities || recentActivities.length === 0) {
        generatedSuggestions.push({
          id: 'no-activities',
          type: 'reminder',
          title: 'Registre suas atividades',
          description: 'Você não registrou atividades hoje. Mantenha seu histórico atualizado!',
          priority: 'medium',
          action: {
            label: 'Registrar atividade',
            href: '/atividades'
          },
          dismissible: true
        });
      }

      // 5. Quick tips
      const tips = [
        {
          id: 'tip-follow-up',
          type: 'tip' as const,
          title: 'Dica: Follow-up eficiente',
          description: 'O melhor horário para follow-up é entre 10h-11h ou 14h-16h. Evite segundas e sextas.',
          priority: 'low' as const,
          dismissible: true
        },
        {
          id: 'tip-negotiation',
          type: 'tip' as const,
          title: 'Dica: Negociação',
          description: 'Sempre busque entender a real necessidade do cliente antes de apresentar a solução.',
          priority: 'low' as const,
          dismissible: true
        },
        {
          id: 'tip-objections',
          type: 'tip' as const,
          title: 'Dica: Objeções',
          description: 'Transforme objeções em oportunidades. Pergunte "além disso, há mais alguma dúvida?"',
          priority: 'low' as const,
          dismissible: true
        }
      ];

      // Add a random tip if we have room
      if (generatedSuggestions.length < maxSuggestions) {
        const randomTip = tips[Math.floor(Math.random() * tips.length)];
        generatedSuggestions.push(randomTip);
      }

      // Sort by priority and limit
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const sortedSuggestions = generatedSuggestions
        .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
        .slice(0, maxSuggestions);

      setSuggestions(sortedSuggestions);
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Error generating suggestions:', err);
      }
      setError('Erro ao carregar sugestões');
    } finally {
      setIsLoading(false);
    }
  }, [enabled, maxSuggestions, salespersonId]);

  // Dismiss a suggestion
  const dismissSuggestion = useCallback((id: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== id));
    
    // Store dismissed suggestions in localStorage
    const dismissed = JSON.parse(localStorage.getItem('dismissedSuggestions') || '[]');
    dismissed.push({ id, dismissedAt: Date.now() });
    localStorage.setItem('dismissedSuggestions', JSON.stringify(dismissed));
  }, []);

  // Refresh suggestions
  const refresh = useCallback(() => {
    generateSuggestions();
  }, [generateSuggestions]);

  // Initial load
  useEffect(() => {
    generateSuggestions();
  }, [generateSuggestions]);

  // Refresh every 30 minutes
  useEffect(() => {
    const interval = setInterval(generateSuggestions, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [generateSuggestions]);

  return {
    suggestions,
    isLoading,
    error,
    refresh,
    dismissSuggestion
  };
}
