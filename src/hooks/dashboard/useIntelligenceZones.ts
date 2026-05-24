import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

export const useIntelligenceZones = (clientId?: string, ramoAtividade?: string) => {
  return useQuery({
    queryKey: ['intelligence-zones-v4', clientId, ramoAtividade],
    queryFn: async () => {
      // 1. Resolve company IDs for the industry branch
      let companyIds: string[] = [];
      if (ramoAtividade) {
        const { data: clientsInBranch } = await supabase
          .from('clients')
          .select('id')
          .ilike('ramo_atividade', ramoAtividade)
          .neq('id', clientId || '');
        
        companyIds = (clientsInBranch || []).map(c => c.id);
      }

      // 2. Parallel fetch from RPCs
      const [
        { data: clientProductsRes },
        { data: industryProductsRes },
        { data: clientSeasonalityRes },
        { data: industrySeasonalityRes },
        { data: benchmarkRes }
      ] = await Promise.all([
        clientId 
          ? supabase.rpc('get_client_top_products', { _client_id: clientId, _limit: 5 })
          : Promise.resolve({ data: [] }),
        companyIds.length >= 3
          ? supabase.rpc('get_industry_top_products', { _company_ids: companyIds, _days: 90, _limit: 5 })
          : Promise.resolve({ data: [] }),
        clientId
          ? supabase.rpc('get_client_seasonality', { _client_id: clientId, _months: 24 })
          : Promise.resolve({ data: [] }),
        companyIds.length >= 3
          ? supabase.rpc('get_industry_seasonality', { _company_ids: companyIds, _months: 24 })
          : Promise.resolve({ data: [] }),
        companyIds.length >= 3
          ? supabase.rpc('get_industry_benchmark_stats', { _company_ids: companyIds, _days: 180 })
          : Promise.resolve({ data: [] })
      ]);

      const clientProducts = clientProductsRes || [];
      const industryProducts = industryProductsRes || [];
      const clientSeasonality = (clientSeasonalityRes || []) as any[];
      const industrySeasonality = (industrySeasonalityRes || []) as any[];
      const benchmarks = (benchmarkRes || []) as any[];

      // Normalize Seasonality Intensity
      const normalizeIntensity = (data: any[], key: string) => {
        if (!data || data.length === 0) return [];
        const maxVal = Math.max(...data.map(d => Number(d[key])));
        return data.map(d => ({
          ...d,
          intensity: maxVal > 0 ? (Number(d[key]) / maxVal) * 100 : 0
        }));
      };

      const normalizedClientSeasonality = normalizeIntensity(clientSeasonality, 'quotes_count');
      const normalizedIndustrySeasonality = normalizeIntensity(industrySeasonality, 'avg_quotes_per_company');

      const hasEnoughClientData = clientSeasonality.length >= 3;
      const hasEnoughIndustryData = companyIds.length >= 3 && industrySeasonality.length >= 3;

      // Logic for Next Peak and Strategic Insight
      const getNextPeakInfo = (clientData: any[], industryData: any[]) => {
        const next12Months = [];
        const today = new Date();
        for (let i = 1; i <= 12; i++) {
          const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
          next12Months.push({ month: d.getMonth() + 1, name: d.toLocaleString('pt-BR', { month: 'long' }) });
        }

        // Find highest intensity in next 12 months (preferring client data if available)
        const dataSource = clientData.length >= 3 ? clientData : industryData;
        if (dataSource.length === 0) return { month: 'Novembro', insight: 'Aumento histórico de 22% no setor durante a Black Friday.' };

        const monthMap = new Map(dataSource.map(d => [Number(d.month), Number(d.quotes_count || d.avg_quotes_per_company || 0)]));
        let bestMonth = next12Months[0];
        let maxVal = -1;

        next12Months.forEach(m => {
          const val = monthMap.get(m.month) || 0;
          if (val > maxVal) {
            maxVal = val;
            bestMonth = m;
          }
        });

        const intensity = maxVal > 0 ? "alta" : "moderada";
        const insight = clientData.length >= 3 
          ? `Historicamente, seu cliente apresenta demanda ${intensity} em ${bestMonth.name}.`
          : `Empresas deste setor costumam ter pico de demanda em ${bestMonth.name}.`;

        return { 
          month: bestMonth.name.charAt(0).toUpperCase() + bestMonth.name.slice(1), 
          insight: `${insight} Recomendamos antecipar o contato comercial em 30 dias.` 
        };
      };

      const nextPeak = getNextPeakInfo(finalClientSeasonality, finalIndustrySeasonality);

      // ... keep existing code
      return {
        isMocked: !hasEnoughClientData,
        isIndustryMocked: !hasEnoughIndustryData,
        customer360: {
          ltv: finalClientSeasonality.reduce((acc: number, curr: any) => acc + Number(curr.total_revenue), 0),
          avgTicket: finalClientSeasonality.length 
            ? finalClientSeasonality.reduce((acc: number, curr: any) => acc + Number(curr.avg_ticket), 0) / finalClientSeasonality.length
            : 2450,
          recency: 12,
          orderCount: finalClientSeasonality.reduce((acc: number, curr: any) => acc + Number(curr.quotes_count), 0),
          lastOrders: [
            { id: 1, date: '2026-05-20', value: 3200, status: 'delivered' },
            { id: 2, date: '2026-05-15', value: 1500, status: 'delivered' },
            { id: 3, date: '2026-05-08', value: 4100, status: 'delivered' },
          ]
        },
        benchmarks: benchmarks.length > 0 ? benchmarks.map(b => ({
          metric: b.metric_name,
          client: 85, // Placeholder - should be real client metric
          sector: Number(b.industry_avg),
          unit: b.unit,
          insight: `${b.metric_name} estável vs setor.`
        })) : [
          { metric: 'Volume', client: 85, sector: 72, unit: 'un', insight: 'Volume 18% acima da média. Consolidar estoque.' },
          { metric: 'Conversão', client: 12.4, sector: 10.8, unit: '%', insight: 'Eficiência superior. Manter estratégia atual.' },
          { metric: 'Frequência', client: 4.2, sector: 3.5, unit: 'ped/mês', insight: 'Fidelidade alta. Oportunidade de up-sell.' },
          { metric: 'Satisfação', client: 92, sector: 88, unit: 'pts', insight: 'NPS excelente vs concorrentes diretos.' },
        ],
        affinity: {
          topCategories: ['Eletrônicos', 'Periféricos', 'Office'],
          suggestedProducts: clientProducts.length 
            ? clientProducts.map((p: any) => ({ name: p.product_name, confidence: 90 }))
            : [
                { name: 'Monitor 4K UltraWide', confidence: 94 },
                { name: 'Teclado Mecânico RGB', confidence: 88 },
              ]
        },
        sectorTrends: industryProducts.length
          ? industryProducts.map((p: any) => ({ name: p.product_name, growth: `+${p.growth_rate}%`, sales: p.total_sales }))
          : [
              { name: 'MacBook Pro M3', growth: '+24%', sales: 1420 },
              { name: 'Dell XPS 15', growth: '+18%', sales: 980 },
            ],
        seasonality: {
          months: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
          clientIntensity: normalizedClientSeasonality,
          industryIntensity: normalizedIndustrySeasonality,
          nextPeak: nextPeak
        },
        expertCurated: getExpertCurated(ramoAtividade || 'geral')
      };
    },
    staleTime: 1000 * 60 * 5,
  });
};
