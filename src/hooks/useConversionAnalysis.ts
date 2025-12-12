import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface StageConversion {
  fromStage: string;
  toStage: string;
  totalEntered: number;
  totalConverted: number;
  conversionRate: number;
  dropoffRate: number;
  isBottleneck: boolean;
}

interface ConversionAnalysisData {
  conversions: StageConversion[];
  overallConversion: number;
  biggestBottleneck: string;
  bestConversion: string;
}

const STAGE_ORDER = ['lead', 'qualificado', 'proposta', 'negociacao', 'fechado'];
const STAGE_LABELS: Record<string, string> = {
  'lead': 'Lead',
  'qualificado': 'Qualificado',
  'proposta': 'Proposta',
  'negociacao': 'Negociação',
  'fechado': 'Fechado'
};

export function useConversionAnalysis(salespersonId?: string) {
  return useQuery({
    queryKey: ['conversion-analysis', salespersonId],
    queryFn: async (): Promise<ConversionAnalysisData> => {
      let query = supabase
        .from('deal_stage_history')
        .select(`
          *,
          sales:sale_id (salesperson_id)
        `);

      const { data: history, error } = await query;

      if (error) throw error;

      // Filter by salesperson if provided
      const filteredHistory = salespersonId
        ? history?.filter(h => (h.sales as any)?.salesperson_id === salespersonId)
        : history;

      // Group by sale_id to track journey
      const dealJourneys: Record<string, string[]> = {};
      filteredHistory?.forEach(record => {
        if (!dealJourneys[record.sale_id!]) dealJourneys[record.sale_id!] = [];
        dealJourneys[record.sale_id!].push(record.stage);
      });

      // Count stage entries and transitions
      const stageEntries: Record<string, number> = {};
      const stageTransitions: Record<string, number> = {};

      Object.values(dealJourneys).forEach(journey => {
        journey.forEach((stage, index) => {
          stageEntries[stage] = (stageEntries[stage] || 0) + 1;
          
          if (index < journey.length - 1) {
            const nextStage = journey[index + 1];
            const key = `${stage}->${nextStage}`;
            stageTransitions[key] = (stageTransitions[key] || 0) + 1;
          }
        });
      });

      // Calculate conversion rates between consecutive stages
      const conversions: StageConversion[] = [];
      
      for (let i = 0; i < STAGE_ORDER.length - 1; i++) {
        const fromStage = STAGE_ORDER[i];
        const toStage = STAGE_ORDER[i + 1];
        const totalEntered = stageEntries[fromStage] || 0;
        const transitionKey = `${fromStage}->${toStage}`;
        const totalConverted = stageTransitions[transitionKey] || 0;
        const conversionRate = totalEntered > 0 ? (totalConverted / totalEntered) * 100 : 0;

        conversions.push({
          fromStage: STAGE_LABELS[fromStage],
          toStage: STAGE_LABELS[toStage],
          totalEntered,
          totalConverted,
          conversionRate,
          dropoffRate: 100 - conversionRate,
          isBottleneck: false
        });
      }

      // Mark bottlenecks (lowest conversion rates)
      const validConversions = conversions.filter(c => c.totalEntered > 0);
      if (validConversions.length > 0) {
        const minRate = Math.min(...validConversions.map(c => c.conversionRate));
        conversions.forEach(c => {
          if (c.conversionRate === minRate && c.totalEntered > 0) {
            c.isBottleneck = true;
          }
        });
      }

      const totalLeads = stageEntries['lead'] || 0;
      const totalClosed = stageEntries['fechado'] || 0;
      const overallConversion = totalLeads > 0 ? (totalClosed / totalLeads) * 100 : 0;

      const bottleneck = validConversions.find(c => c.isBottleneck);
      const best = validConversions.length > 0
        ? validConversions.reduce((a, b) => a.conversionRate > b.conversionRate ? a : b)
        : null;

      return {
        conversions,
        overallConversion,
        biggestBottleneck: bottleneck ? `${bottleneck.fromStage} → ${bottleneck.toStage}` : '-',
        bestConversion: best ? `${best.fromStage} → ${best.toStage}` : '-'
      };
    }
  });
}
