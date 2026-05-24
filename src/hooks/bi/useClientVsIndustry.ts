import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useClientVsIndustry = (clientId?: string, ramoAtividade?: string) => {
  return useQuery({
    queryKey: ['bi-tool-vs-industry', clientId, ramoAtividade],
    enabled: !!clientId && !!ramoAtividade,
    queryFn: async () => {
      const { data: clientsInBranch } = await supabase
        .from('clients')
        .select('id')
        .ilike('ramo_atividade', ramoAtividade || '')
        .neq('id', clientId || '');
      
      const companyIds = (clientsInBranch || []).map(c => c.id);
      
      const hasEnoughIndustryData = companyIds.length >= 3;
      
      const { data: benchmarkRes } = hasEnoughIndustryData
        ? await supabase.rpc('get_industry_benchmark_stats', { _company_ids: companyIds, _days: 180 })
        : { data: [] };

      const benchmarks = (benchmarkRes || []) as any[];

      if (benchmarks.length > 0) {
        return benchmarks.map(b => ({
          metric: b.metric_name,
          client: 85, // Mock client value for now as we don't have a specific client metric RPC yet
          sector: Number(b.industry_avg),
          unit: b.unit,
          insight: `${b.metric_name} estável vs setor.`
        }));
      }

      return [
        { metric: 'Volume', client: 85, sector: 72, unit: 'un', insight: 'Volume 18% acima da média. Consolidar estoque.' },
        { metric: 'Conversão', client: 12.4, sector: 10.8, unit: '%', insight: 'Eficiência superior. Manter estratégia atual.' },
        { metric: 'Frequência', client: 4.2, sector: 3.5, unit: 'ped/mês', insight: 'Fidelidade alta. Oportunidade de up-sell.' },
        { metric: 'Satisfação', client: 92, sector: 88, unit: 'pts', insight: 'NPS excelente vs concorrentes diretos.' },
      ];
    }
  });
};
