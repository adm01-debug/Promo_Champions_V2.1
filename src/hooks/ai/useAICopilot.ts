import { useState, useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface CopilotSuggestion {
  text: string;
  timestamp: number;
  page: string;
}

const PAGE_CONTEXT_MAP: Record<string, string> = {
  '/': 'Dashboard principal - métricas e KPIs',
  '/pipeline': 'Pipeline de vendas - kanban de deals',
  '/tarefas': 'Lista de tarefas pendentes',
  '/atividades': 'Registro de atividades e contatos',
  '/vendas': 'Histórico de vendas',
  '/clientes': 'Base de clientes',
  '/metas': 'Metas e objetivos',
  '/ranking': 'Ranking competitivo',
  '/cadencias': 'Cadências de prospecção',
  '/analytics': 'Analytics e insights',
  '/assistente': 'Assistente IA completo',
  '/calendario': 'Calendário de atividades',
  '/forecast': 'Previsão de receita',
  '/automacoes': 'Automações de workflow',
};

export function useAICopilot() {
  const [suggestion, setSuggestion] = useState<CopilotSuggestion | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const location = useLocation();
  const loadingRef = useRef(false);
  
  const { data: salesperson } = useQuery({
    queryKey: ['current-salesperson-copilot'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase
        .from('salespeople')
        .select('id, name, role')
        .eq('auth_user_id', user.id)
        .maybeSingle();
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const lastPageRef = useRef<string>('');
  const cooldownRef = useRef<number>(0);

  const fetchSuggestion = useCallback(async (action: string = 'page_suggestion', extra?: string) => {
    if (loadingRef.current) return;
    
    // Cooldown: minimum 30s between auto-suggestions
    const now = Date.now();
    if (action === 'page_suggestion' && now - cooldownRef.current < 30000) return;
    cooldownRef.current = now;

    loadingRef.current = true;
    setIsLoading(true);
    try {
      const page = PAGE_CONTEXT_MAP[location.pathname] || location.pathname;
      
      const { data, error } = await supabase.functions.invoke('ai-copilot', {
        body: {
          context: { page, extra },
          salespersonId: salesperson?.id,
          action,
        },
      });

      if (error) throw error;
      if (data?.suggestion) {
        setSuggestion({
          text: data.suggestion,
          timestamp: Date.now(),
          page: location.pathname,
        });
        setIsOpen(true);
        setIsDismissed(false);
      }
    } catch (_err) {
      // Errors handled silently in prod to avoid noise
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
    }
  }, [location.pathname, salesperson?.id]);

  // Auto-suggest on page change
  useEffect(() => {
    if (location.pathname === lastPageRef.current) return;
    lastPageRef.current = location.pathname;
    
    if (location.pathname === '/assistente') return;
    
    const timer = setTimeout(() => {
      if (!isDismissed) {
        fetchSuggestion('page_suggestion');
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [location.pathname, isDismissed, fetchSuggestion]);

  const askCopilot = useCallback((question: string) => {
    fetchSuggestion('quick_answer', question);
  }, [fetchSuggestion]);

  /**
   * SKILL: Narrativa de forecast
   * Explica o forecast atual em linguagem natural (usa cache semântico via forecast-narrative).
   */
  const getForecastNarrative = useCallback(
    async (forecastId: string): Promise<{ narrative?: string; cached?: boolean; error?: string }> => {
      loadingRef.current = true;
      setIsLoading(true);
      try {
        const page = PAGE_CONTEXT_MAP[location.pathname] || location.pathname;
        const { data, error } = await supabase.functions.invoke('ai-copilot', {
          body: {
            context: { page },
            salespersonId: salesperson?.id,
            action: 'forecast_narrative',
            forecast_id: forecastId,
          },
        });
        if (error) return { error: error.message };
        if (data?.narrative) {
          setSuggestion({
            text: data.narrative,
            timestamp: Date.now(),
            page: location.pathname,
          });
          setIsOpen(true);
          setIsDismissed(false);
        }
        return data ?? {};
      } finally {
        loadingRef.current = false;
        setIsLoading(false);
      }
    },
    [location.pathname, salesperson?.id],
  );

  /**
   * SKILL: Plano de coaching automático
   * Gera 3 ações de coaching a partir de uma gravação (usa generate-coaching-actions).
   */
  const getCoachingPlan = useCallback(
    async (recordingId: string): Promise<{ actions?: unknown[]; error?: string }> => {
      loadingRef.current = true;
      setIsLoading(true);
      try {
        const page = PAGE_CONTEXT_MAP[location.pathname] || location.pathname;
        const { data, error } = await supabase.functions.invoke('ai-copilot', {
          body: {
            context: { page },
            salespersonId: salesperson?.id,
            action: 'coaching_plan',
            recording_id: recordingId,
          },
        });
        if (error) return { error: error.message };
        if (Array.isArray(data?.actions) && data.actions.length > 0) {
          const first = data.actions[0] as { tip?: string };
          if (first?.tip) {
            setSuggestion({
              text: `🎯 Coaching: ${first.tip}${data.actions.length > 1 ? ` (+${data.actions.length - 1} ações)` : ''}`,
              timestamp: Date.now(),
              page: location.pathname,
            });
            setIsOpen(true);
            setIsDismissed(false);
          }
        }
        return data ?? {};
      } finally {
        loadingRef.current = false;
        setIsLoading(false);
      }
    },
    [location.pathname, salesperson?.id],
  );

  const dismiss = useCallback(() => {
    setIsOpen(false);
    setIsDismissed(true);
  }, []);

  const toggle = useCallback(() => {
    if (isOpen) {
      dismiss();
    } else {
      setIsOpen(true);
      setIsDismissed(false);
      if (!suggestion || Date.now() - suggestion.timestamp > 60000) {
        fetchSuggestion('smart_tip');
      }
    }
  }, [isOpen, dismiss, suggestion, fetchSuggestion]);

  return {
    suggestion,
    isLoading,
    isOpen,
    toggle,
    dismiss,
    askCopilot,
    fetchSuggestion,
    getForecastNarrative,
    getCoachingPlan,
  };
}