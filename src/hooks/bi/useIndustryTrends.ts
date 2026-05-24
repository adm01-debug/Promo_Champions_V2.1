import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getMockIndustryTrends, getMockSeasonality } from "@/lib/bi/mockData";

export const useIndustryTrends = (clientId?: string, ramoAtividade?: string) => {
  return useQuery({
    queryKey: ['bi-tool-industry-trends', clientId, ramoAtividade],
    enabled: !!ramoAtividade,
    queryFn: async () => {
      const { data: clientsInBranch } = await supabase
        .from('clients')
        .select('id')
        .ilike('ramo_atividade', ramoAtividade || '')
        .neq('id', clientId || '');
      
      const companyIds = (clientsInBranch || []).map(c => c.id);

      if (companyIds.length < 3) return getMockIndustryTrends();

      const { data: industryProducts } = await supabase.rpc('get_industry_top_products', { 
        _company_ids: companyIds, 
        _days: 90, 
        _limit: 5 
      });

      if (!industryProducts || industryProducts.length === 0) return getMockIndustryTrends();

      return industryProducts.map((p: any) => ({
        name: p.product_name,
        growth: `+${p.growth_rate}%`,
        sales: p.total_sales
      }));
    }
  });
};

export const useClientSeasonality = (clientId?: string, ramoAtividade?: string) => {
  return useQuery({
    queryKey: ['bi-tool-seasonality', clientId, ramoAtividade],
    enabled: !!clientId,
    queryFn: async () => {
      const { data: clientsInBranch } = await supabase
        .from('clients')
        .select('id')
        .ilike('ramo_atividade', ramoAtividade || '')
        .neq('id', clientId || '');
      
      const companyIds = (clientsInBranch || []).map(c => c.id);

      const [
        { data: clientSeasonalityRes },
        { data: industrySeasonalityRes }
      ] = await Promise.all([
        supabase.rpc('get_client_seasonality', { _client_id: clientId!, _months: 24 }),
        companyIds.length >= 3
          ? supabase.rpc('get_industry_seasonality', { _company_ids: companyIds, _months: 24 })
          : Promise.resolve({ data: [] })
      ]);

      const clientSeasonality = (clientSeasonalityRes || []) as any[];
      const industrySeasonality = (industrySeasonalityRes || []) as any[];

      const hasEnoughClientData = clientSeasonality.length >= 3;
      const hasEnoughIndustryData = industrySeasonality.length >= 3;

      const finalClientSeasonality = hasEnoughClientData ? clientSeasonality : getMockSeasonality(clientId!);
      const finalIndustrySeasonality = hasEnoughIndustryData ? industrySeasonality : getMockSeasonality(ramoAtividade || 'generic');

      const normalizeIntensity = (data: any[]) => {
        if (!data || data.length === 0) return [];
        const maxVal = Math.max(...data.map(d => Number(d.quotes_count || d.avg_quotes_per_company || 0)));
        return data.map(d => ({
          ...d,
          intensity: maxVal > 0 ? (Number(d.quotes_count || d.avg_quotes_per_company || 0) / maxVal) * 100 : 0
        }));
      };

      const today = new Date();
      const next12Months = [];
      for (let i = 1; i <= 12; i++) {
        const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
        next12Months.push({ month: d.getMonth() + 1, name: d.toLocaleString('pt-BR', { month: 'long' }) });
      }

      const dataSource = hasEnoughClientData ? finalClientSeasonality : finalIndustrySeasonality;
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

      return {
        months: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
        clientIntensity: normalizeIntensity(finalClientSeasonality),
        industryIntensity: normalizeIntensity(finalIndustrySeasonality),
        nextPeak: {
          month: bestMonth.name.charAt(0).toUpperCase() + bestMonth.name.slice(1),
          insight: hasEnoughClientData 
            ? `Historicamente, seu cliente apresenta demanda alta em ${bestMonth.name}.`
            : `Empresas deste setor costumam ter pico de demanda em ${bestMonth.name}.`
        }
      };
    }
  });
};
