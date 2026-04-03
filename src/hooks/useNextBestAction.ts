import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface NextBestAction {
  title: string;
  description: string;
  actionType: string;
  priority: 'high' | 'medium' | 'low';
  dealClient?: string | null;
  dealName?: string;
}

export interface NextBestActionResult {
  insight: string;
  suggestions: NextBestAction[];
}

/**
 * Query hook — auto-fetches next best actions for a salesperson.
 * Tries the AI-powered edge function first, falls back to local heuristics.
 */
export function useNextBestActionQuery(salespersonId?: string) {
  return useQuery<NextBestActionResult>({
    queryKey: ['next-best-action', salespersonId],
    queryFn: async () => {
      // Try edge function (AI-powered)
      try {
        const { data, error } = await supabase.functions.invoke('next-best-action', {
          body: { salespersonId },
        });

        if (!error && data?.suggestions) {
          return data as NextBestActionResult;
        }
      } catch {
        // Fallback to local
      }

      return generateLocalSuggestions(salespersonId!);
    },
    enabled: !!salespersonId,
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });
}

/**
 * Mutation hook — on-demand generation (backwards compatible).
 */
export const useNextBestAction = () => {
  return useMutation<NextBestActionResult, Error, string>({
    mutationFn: async (salespersonId: string) => {
      try {
        const { data, error } = await supabase.functions.invoke('next-best-action', {
          body: { salespersonId },
        });

        if (!error && data?.suggestions) {
          return data as NextBestActionResult;
        }
      } catch {
        // Fallback
      }

      return generateLocalSuggestions(salespersonId);
    },
  });
};

async function generateLocalSuggestions(salespersonId: string): Promise<NextBestActionResult> {
  const { data: sp } = await supabase
    .from('salespeople')
    .select('name')
    .eq('id', salespersonId)
    .single();

  const { data: sales } = await supabase
    .from('sales')
    .select('id, client_name, amount, status, created_at, updated_at')
    .eq('salesperson_id', salespersonId)
    .order('created_at', { ascending: false })
    .limit(20);

  const { data: activities } = await supabase
    .from('activities')
    .select('id, activity_type, outcome, created_at')
    .eq('salesperson_id', salespersonId)
    .order('created_at', { ascending: false })
    .limit(30);

  const allSales = sales || [];
  const allActivities = activities || [];
  const suggestions: NextBestAction[] = [];
  const now = Date.now();

  // Stagnant deals
  const stagnantDeals = allSales.filter(s => {
    if (s.status === 'completed' || s.status === 'lost') return false;
    return (now - new Date(s.updated_at).getTime()) / (1000 * 60 * 60 * 24) > 7;
  });

  stagnantDeals.slice(0, 3).forEach(deal => {
    const days = Math.round((now - new Date(deal.updated_at).getTime()) / (1000 * 60 * 60 * 24));
    suggestions.push({
      title: `Follow-up urgente: ${deal.client_name}`,
      description: `Deal sem atualização há ${days} dias. Recomenda-se contato imediato.`,
      actionType: 'follow_up',
      priority: days > 14 ? 'high' : 'medium',
      dealClient: deal.client_name,
    });
  });

  // Activity volume check
  const last7Days = allActivities.filter(a =>
    (now - new Date(a.created_at).getTime()) / (1000 * 60 * 60 * 24) <= 7
  );

  if (last7Days.length < 10) {
    suggestions.push({
      title: 'Aumentar volume de atividades',
      description: `Apenas ${last7Days.length} atividades nos últimos 7 dias. Meta recomendada: 15+.`,
      actionType: 'call',
      priority: last7Days.length < 5 ? 'high' : 'medium',
    });
  }

  // Proposal follow-up
  const proposalDeals = allSales.filter(s => s.status === 'proposal' || s.status === 'Proposta');
  if (proposalDeals.length > 0) {
    suggestions.push({
      title: `Acompanhar ${proposalDeals.length} proposta(s) enviada(s)`,
      description: 'Propostas em aberto precisam de acompanhamento para avançar.',
      actionType: 'meeting',
      priority: 'medium',
    });
  }

  // Pipeline health
  const openDeals = allSales.filter(s => s.status !== 'completed' && s.status !== 'lost');
  if (openDeals.length < 5) {
    suggestions.push({
      title: 'Reforçar prospecção',
      description: `Pipeline com apenas ${openDeals.length} deals ativos.`,
      actionType: 'email',
      priority: 'high',
    });
  }

  const completedCount = allSales.filter(s => s.status === 'completed').length;
  const totalRevenue = allSales.filter(s => s.status === 'completed').reduce((sum, s) => sum + (s.amount || 0), 0);

  const insight = suggestions.length === 0
    ? `${sp?.name || 'Vendedor'} está com bom desempenho! ${completedCount} vendas fechadas com R$ ${totalRevenue.toLocaleString('pt-BR')} em receita.`
    : `${sp?.name || 'Vendedor'} tem ${openDeals.length} deals ativos e ${stagnantDeals.length} estagnados. Foco nas ações recomendadas pode melhorar a conversão.`;

  return { insight, suggestions: suggestions.slice(0, 5) };
}
