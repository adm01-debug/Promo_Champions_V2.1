import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CACHE_TIMES } from '@/constants';

export interface CompetitorAnalysis {
  competitor: string;
  deals: number;
  won: number;
  lost: number;
  winRate: number;
  avgDealSize: number;
  commonReasons: string[];
}

export interface CompetitiveWinRateResult {
  overallWinRate: number;
  competitors: CompetitorAnalysis[];
  topWinReason: string;
  topLossReason: string;
  winsByCategory: Record<string, { won: number; total: number; winRate: number }>;
}

export function useCompetitiveWinRate() {
  return useQuery({
    queryKey: ['competitive-win-rate'],
    queryFn: async (): Promise<CompetitiveWinRateResult> => {
      const now = new Date();
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);

      // Buscar outcomes de deals
      const { data: outcomes, error: outcomesError } = await supabase
        .from('deal_outcomes')
        .select('sale_id, outcome, reason, notes')
        .gte('created_at', sixMonthsAgo.toISOString());

      if (outcomesError) throw outcomesError;

      // Buscar sales relacionadas
      const saleIds = outcomes?.map(o => o.sale_id).filter(Boolean) || [];
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select('id, amount, category, status')
        .in('id', saleIds.length > 0 ? saleIds : ['none']);

      if (salesError) throw salesError;

      // Extrair competidores mencionados nos notes
      const competitorMentions: Record<string, { won: number; lost: number; deals: number[]; amounts: number[] }> = {};
      const winReasons: Record<string, number> = {};
      const lossReasons: Record<string, number> = {};

      outcomes?.forEach(o => {
        const sale = sales?.find(s => s.id === o.sale_id);
        if (!sale) return;

        // Contar razões
        if (o.outcome === 'won') {
          winReasons[o.reason] = (winReasons[o.reason] || 0) + 1;
        } else if (o.outcome === 'lost') {
          lossReasons[o.reason] = (lossReasons[o.reason] || 0) + 1;
        }

        // Extrair menções de competidores do notes
        if (o.notes) {
          const competitorPatterns = [
            /concorrente[:\s]+([^,.\n]+)/gi,
            /competidor[:\s]+([^,.\n]+)/gi,
            /perdemos para[:\s]+([^,.\n]+)/gi,
            /ganhamos de[:\s]+([^,.\n]+)/gi,
          ];

          competitorPatterns.forEach(pattern => {
            const matches = o.notes?.matchAll(pattern);
            if (matches) {
              for (const match of matches) {
                const competitor = match[1]?.trim();
                if (competitor) {
                  if (!competitorMentions[competitor]) {
                    competitorMentions[competitor] = { won: 0, lost: 0, deals: [], amounts: [] };
                  }
                  competitorMentions[competitor].deals.push(sale.id as unknown as number);
                  competitorMentions[competitor].amounts.push(sale.amount);
                  if (o.outcome === 'won') competitorMentions[competitor].won++;
                  else if (o.outcome === 'lost') competitorMentions[competitor].lost++;
                }
              }
            }
          });
        }
      });

      // Processar competidores
      const competitors: CompetitorAnalysis[] = Object.entries(competitorMentions)
        .map(([competitor, data]) => {
          const total = data.won + data.lost;
          return {
            competitor,
            deals: total,
            won: data.won,
            lost: data.lost,
            winRate: total > 0 ? (data.won / total) * 100 : 0,
            avgDealSize: data.amounts.length > 0 
              ? data.amounts.reduce((a, b) => a + b, 0) / data.amounts.length 
              : 0,
            commonReasons: [],
          };
        })
        .sort((a, b) => b.deals - a.deals);

      // Win rate geral
      const totalWon = outcomes?.filter(o => o.outcome === 'won').length || 0;
      const totalLost = outcomes?.filter(o => o.outcome === 'lost').length || 0;
      const totalClosed = totalWon + totalLost;
      const overallWinRate = totalClosed > 0 ? (totalWon / totalClosed) * 100 : 0;

      // Top razões
      const topWinReason = Object.entries(winReasons)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Não especificado';
      const topLossReason = Object.entries(lossReasons)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Não especificado';

      // Win rate por categoria
      const winsByCategory: Record<string, { won: number; total: number; winRate: number }> = {};
      
      outcomes?.forEach(o => {
        const sale = sales?.find(s => s.id === o.sale_id);
        if (!sale) return;
        
        if (!winsByCategory[sale.category]) {
          winsByCategory[sale.category] = { won: 0, total: 0, winRate: 0 };
        }
        winsByCategory[sale.category].total++;
        if (o.outcome === 'won') winsByCategory[sale.category].won++;
      });

      Object.keys(winsByCategory).forEach(cat => {
        const data = winsByCategory[cat];
        data.winRate = data.total > 0 ? (data.won / data.total) * 100 : 0;
      });

      return {
        overallWinRate,
        competitors,
        topWinReason,
        topLossReason,
        winsByCategory,
      };
    },
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.GC_TIME,
  });
}
