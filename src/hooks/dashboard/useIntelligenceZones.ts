import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getExpertRecommendations } from '@/lib/bi/industryRecommendations';

export interface SeasonalityPoint {
  year: number;
  month: number;
  quotes_count: number;
  total_revenue: number;
  avg_ticket: number;
  intensity: number; // 0-100 normalized
}

export interface IndustrySeasonalityPoint {
  year: number;
  month: number;
  avg_quotes_per_company: number;
  avg_revenue_per_company: number;
  companies_active: number;
  intensity: number; // 0-100 normalized
}

interface SeasonalityRow {
  month?: number | string;
  quotes_count?: number | string;
  total_revenue?: number | string;
  avg_ticket?: number | string;
  avg_quotes_per_company?: number | string;
  [key: string]: unknown;
}

interface BenchmarkRow {
  metric_name: string;
  industry_avg: number | string;
  unit: string;
  [key: string]: unknown;
}

interface TopProductRow {
  product_name: string;
  growth_rate?: number | string;
  total_sales?: number | string;
  [key: string]: unknown;
}

export const useIntelligenceZones = (clientId?: string, ramoAtividade?: string) => {
  return useQuery({
    queryKey: ['intelligence-zones-v5', clientId, ramoAtividade],
    queryFn: async () => {
      let companyIds: string[] = [];
      if (ramoAtividade) {
        const { data: clientsInBranch } = await supabase
          .from('clients')
          .select('id')
          .ilike('ramo_atividade', ramoAtividade)
          .neq('id', clientId || '');

        companyIds = (clientsInBranch || []).map(c => c.id);
      }

      const [
        { data: clientProductsRes },
        { data: industryProductsRes },
        { data: clientSeasonalityRes },
        { data: industrySeasonalityRes },
        { data: benchmarkRes },
      ] = await Promise.all([
        clientId
          ? supabase.rpc('get_client_top_products', { _client_id: clientId, _limit: 5 })
          : Promise.resolve({ data: [] }),
        companyIds.length >= 3
          ? supabase.rpc('get_industry_top_products', {
              _company_ids: companyIds,
              _days: 90,
              _limit: 5,
            })
          : Promise.resolve({ data: [] }),
        clientId
          ? supabase.rpc('get_client_seasonality', { _client_id: clientId, _months: 24 })
          : Promise.resolve({ data: [] }),
        companyIds.length >= 3
          ? supabase.rpc('get_industry_seasonality', {
              _company_ids: companyIds,
              _months: 24,
            })
          : Promise.resolve({ data: [] }),
        companyIds.length >= 3
          ? supabase.rpc('get_industry_benchmark_stats', {
              _company_ids: companyIds,
              _days: 180,
            })
          : Promise.resolve({ data: [] }),
      ]);

      const clientProducts = (clientProductsRes || []) as TopProductRow[];
      const industryProducts = (industryProductsRes || []) as TopProductRow[];
      const clientSeasonality = (clientSeasonalityRes || []) as SeasonalityRow[];
      const industrySeasonality = (industrySeasonalityRes || []) as SeasonalityRow[];
      const benchmarks = (benchmarkRes || []) as BenchmarkRow[];

      const hasEnoughClientData = clientSeasonality.length >= 3;
      const hasEnoughIndustryData =
        companyIds.length >= 3 && industrySeasonality.length >= 3;

      const normalizeIntensity = (data: SeasonalityRow[], key: string) => {
        if (!data || data.length === 0) return [];
        const maxVal = Math.max(...data.map(d => Number(d[key])));
        return data.map(d => ({
          ...d,
          intensity: maxVal > 0 ? (Number(d[key]) / maxVal) * 100 : 0,
        }));
      };

      const normalizedClientSeasonality = normalizeIntensity(
        clientSeasonality,
        'quotes_count'
      );
      const normalizedIndustrySeasonality = normalizeIntensity(
        industrySeasonality,
        'quotes_count'
      );

      const getNextPeakInfo = (cData: SeasonalityRow[], iData: SeasonalityRow[]) => {
        const next12Months = [];
        const today = new Date();
        for (let i = 1; i <= 12; i++) {
          const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
          next12Months.push({
            month: d.getMonth() + 1,
            name: d.toLocaleString('pt-BR', { month: 'long' }),
          });
        }

        const dataSource = hasEnoughClientData ? cData : iData;
        if (dataSource.length === 0) {
          return {
            month: '—',
            insight: 'Sem dados de sazonalidade suficientes.',
          };
        }

        const monthMap = new Map(
          dataSource.map(d => [Number(d.month), Number(d.quotes_count || 0)])
        );

        let bestMonth = next12Months[0];
        let maxVal = -1;

        next12Months.forEach(m => {
          const val = monthMap.get(m.month) || 0;
          if (val > maxVal) {
            maxVal = val;
            bestMonth = m;
          }
        });

        const intensity = maxVal > 15 ? 'alta' : 'moderada';
        const insight = hasEnoughClientData
          ? `Historicamente, seu cliente apresenta demanda ${intensity} em ${bestMonth.name}.`
          : `Empresas deste setor costumam ter pico de demanda em ${bestMonth.name}.`;

        return {
          month: bestMonth.name.charAt(0).toUpperCase() + bestMonth.name.slice(1),
          insight: `${insight} Recomendamos antecipar o contato comercial em 30 dias.`,
        };
      };

      return {
        hasClientData: hasEnoughClientData,
        hasIndustryData: hasEnoughIndustryData,
        customer360: {
          ltv: clientSeasonality.reduce(
            (acc: number, curr: SeasonalityRow) => acc + Number(curr.total_revenue),
            0
          ),
          avgTicket:
            clientSeasonality.length > 0
              ? clientSeasonality.reduce(
                  (acc: number, curr: SeasonalityRow) => acc + Number(curr.avg_ticket),
                  0
                ) / clientSeasonality.length
              : 0,
          recency: 0,
          orderCount: clientSeasonality.reduce(
            (acc: number, curr: SeasonalityRow) => acc + Number(curr.quotes_count),
            0
          ),
          lastOrders: [],
        },
        benchmarks: benchmarks.map(b => ({
          metric: b.metric_name,
          client: 0,
          sector: Number(b.industry_avg),
          unit: b.unit,
          insight: `${b.metric_name}: ${b.industry_avg}${b.unit}.`,
        })),
        affinity: {
          topCategories: [],
          suggestedProducts: clientProducts.map((p: TopProductRow) => ({
            name: p.product_name,
            confidence: 90,
          })),
        },
        sectorTrends: industryProducts.map((p: TopProductRow) => ({
          name: p.product_name,
          growth: p.growth_rate !== undefined ? `+${p.growth_rate}%` : '',
          sales: p.total_sales,
        })),
        seasonality: {
          months: [
            'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
            'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
          ],
          clientIntensity: normalizedClientSeasonality,
          industryIntensity: normalizedIndustrySeasonality,
          nextPeak: getNextPeakInfo(clientSeasonality, industrySeasonality),
        },
        expertCurated: getExpertRecommendations(ramoAtividade || 'geral'),
      };
    },
    staleTime: 1000 * 60 * 5,
  });
};