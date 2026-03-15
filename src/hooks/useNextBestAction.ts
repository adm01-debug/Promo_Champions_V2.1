import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ActionSuggestion {
  title: string;
  description: string;
  actionType: string;
  priority: 'high' | 'medium' | 'low';
  dealName?: string;
}

interface NextBestActionResult {
  insight: string;
  suggestions: ActionSuggestion[];
}

/**
 * Hook for generating next best action suggestions for a salesperson.
 * Returns a mutation that generates suggestions based on sales data.
 */
export const useNextBestAction = () => {
  return useMutation<NextBestActionResult, Error, string>({
    mutationFn: async (salespersonId: string): Promise<NextBestActionResult> => {
      // Get salesperson info
      const { data: sp } = await supabase
        .from('salespeople')
        .select('name')
        .eq('id', salespersonId)
        .single();

      // Get recent sales for context
      const { data: sales } = await supabase
        .from('sales')
        .select('id, client_name, amount, status, created_at, updated_at')
        .eq('salesperson_id', salespersonId)
        .order('created_at', { ascending: false })
        .limit(20);

      // Get recent activities
      const { data: activities } = await supabase
        .from('activities')
        .select('id, activity_type, outcome, created_at')
        .eq('salesperson_id', salespersonId)
        .order('created_at', { ascending: false })
        .limit(30);

      const allSales = sales || [];
      const allActivities = activities || [];
      const suggestions: ActionSuggestion[] = [];

      // Identify stagnant deals (no update in 7+ days)
      const now = Date.now();
      const stagnantDeals = allSales.filter(s => {
        if (s.status === 'completed' || s.status === 'lost') return false;
        const daysSince = (now - new Date(s.updated_at).getTime()) / (1000 * 60 * 60 * 24);
        return daysSince > 7;
      });

      stagnantDeals.slice(0, 3).forEach(deal => {
        const days = Math.round((now - new Date(deal.updated_at).getTime()) / (1000 * 60 * 60 * 24));
        suggestions.push({
          title: `Follow-up urgente: ${deal.client_name}`,
          description: `Deal sem atualização há ${days} dias. Recomenda-se contato imediato.`,
          actionType: 'follow_up',
          priority: days > 14 ? 'high' : 'medium',
          dealName: deal.client_name,
        });
      });

      // Check activity volume
      const last7Days = allActivities.filter(a => {
        const daysSince = (now - new Date(a.created_at).getTime()) / (1000 * 60 * 60 * 24);
        return daysSince <= 7;
      });

      if (last7Days.length < 10) {
        suggestions.push({
          title: 'Aumentar volume de atividades',
          description: `Apenas ${last7Days.length} atividades nos últimos 7 dias. Meta recomendada: 15+.`,
          actionType: 'call',
          priority: last7Days.length < 5 ? 'high' : 'medium',
        });
      }

      // Check for deals in proposal stage
      const proposalDeals = allSales.filter(s => s.status === 'proposal' || s.status === 'Proposta');
      if (proposalDeals.length > 0) {
        suggestions.push({
          title: `Acompanhar ${proposalDeals.length} proposta(s) enviada(s)`,
          description: 'Propostas em aberto precisam de acompanhamento para avançar.',
          actionType: 'meeting',
          priority: 'medium',
        });
      }

      // Suggest prospecting if low pipeline
      const openDeals = allSales.filter(s => s.status !== 'completed' && s.status !== 'lost');
      if (openDeals.length < 5) {
        suggestions.push({
          title: 'Reforçar prospecção',
          description: `Pipeline com apenas ${openDeals.length} deals ativos. Recomenda-se buscar novos leads.`,
          actionType: 'email',
          priority: 'high',
        });
      }

      // Generate insight
      const completedCount = allSales.filter(s => s.status === 'completed').length;
      const totalRevenue = allSales
        .filter(s => s.status === 'completed')
        .reduce((sum, s) => sum + (s.amount || 0), 0);
      
      const insight = suggestions.length === 0
        ? `${sp?.name || 'Vendedor'} está com bom desempenho! ${completedCount} vendas fechadas com R$ ${totalRevenue.toLocaleString('pt-BR')} em receita.`
        : `${sp?.name || 'Vendedor'} tem ${openDeals.length} deals ativos e ${stagnantDeals.length} estagnados. Foco nas ${suggestions.length} ações recomendadas pode melhorar a conversão.`;

      return {
        insight,
        suggestions: suggestions.slice(0, 5),
      };
    },
  });
};
