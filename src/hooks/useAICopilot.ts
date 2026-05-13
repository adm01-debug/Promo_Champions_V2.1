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
    if (isLoading) return;
    
    // Cooldown: minimum 30s between auto-suggestions
    const now = Date.now();
    if (action === 'page_suggestion' && now - cooldownRef.current < 30000) return;
    cooldownRef.current = now;

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
    } catch (err) {
      console.error('Copilot error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, location.pathname, salesperson?.id]);

  // Auto-suggest on page change (with debounce)
  useEffect(() => {
    if (location.pathname === lastPageRef.current) return;
    lastPageRef.current = location.pathname;
    
    // Don't auto-suggest on assistant page (already has AI)
    if (location.pathname === '/assistente') return;
    
    const timer = setTimeout(() => {
      if (!isDismissed) {
        fetchSuggestion('page_suggestion');
      }
    }, 3000); // Wait 3s after page load

    return () => clearTimeout(timer);
  }, [location.pathname, isDismissed]);

  const askCopilot = useCallback((question: string) => {
    fetchSuggestion('quick_answer', question);
  }, [fetchSuggestion]);

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
  };
}
