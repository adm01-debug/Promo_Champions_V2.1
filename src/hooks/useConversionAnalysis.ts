import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subMonths, startOfMonth, endOfMonth } from 'date-fns';

interface StageConversion {
  fromStage: string;
  toStage: string;
  totalEntered: number;
  totalConverted: number;
  conversionRate: number;
  dropoffRate: number;
  isBottleneck: boolean;
  previousConversionRate?: number;
  change?: number;
}

interface ConversionAnalysisData {
  conversions: StageConversion[];
  overallConversion: number;
  biggestBottleneck: string;
  bestConversion: string;
  previousOverallConversion?: number;
  overallChange?: number;
}

interface StageHistoryRecord {
  sale_id: string | null;
  stage: string;
  sales: {
    salesperson_id: string;
  } | null;
}

const STAGE_ORDER = ['lead', 'qualificado', 'proposta', 'negociacao', 'fechado'];
const STAGE_LABELS: Record<string, string> = {
  'lead': 'Lead',
  'qualificado': 'Qualificado',
  'proposta': 'Proposta',
  'negociacao': 'Negociação',
  'fechado': 'Fechado'
};

function calculateConversionData(
  history: StageHistoryRecord[], 
  salespersonId?: string
): { 
  conversions: StageConversion[]; 
  overallConversion: number; 
  biggestBottleneck: string; 
  bestConversion: string 
} {
  const filteredHistory = salespersonId
    ? history?.filter(h => h.sales?.salesperson_id === salespersonId)
    : history;

  const dealJourneys: Record<string, string[]> = {};
  filteredHistory?.forEach(record => {
    if (!dealJourneys[record.sale_id!]) dealJourneys[record.sale_id!] = [];
    dealJourneys[record.sale_id!].push(record.stage);
  });

  const stageEntries: Record<string, number> = {};
  const stageTransitions: Record<string, number> = {};

  Object.values(dealJourneys).forEach(journey => {
    journey.forEach((stage, index) => {
      stageEntries[stage] = (stageEntries[stage] || 0) + 1;
      
      if (index > 0) {
        const prevStage = journey[index - 1];
        const transitionKey = `${prevStage}_to_${stage}`;
        stageTransitions[transitionKey] = (stageTransitions[transitionKey] || 0) + 1;
      }
    });
  });

  const conversions: StageConversion[] = [];
  for (let i = 0; i < STAGE_ORDER.length - 1; i++) {
    const fromStage = STAGE_ORDER[i];
    const toStage = STAGE_ORDER[i + 1];
    const totalEntered = stageEntries[fromStage] || 0;
    const transitionKey = `${fromStage}_to_${toStage}`;
    const totalConverted = stageTransitions[transitionKey] || 0;
    const conversionRate = totalEntered > 0 ? (totalConverted / totalEntered) * 100 : 0;
    const dropoffRate = 100 - conversionRate;

    conversions.push({
      fromStage: STAGE_LABELS[fromStage],
      toStage: STAGE_LABELS[toStage],
      totalEntered,
      totalConverted,
      conversionRate,
      dropoffRate,
      isBottleneck: false,
    });
  }

  conversions.sort((a, b) => a.conversionRate - b.conversionRate);
  
  if (conversions.length > 0) {
    conversions[0].isBottleneck = true;
  }

  const totalLeads = stageEntries['lead'] || 0;
  const totalClosed = stageEntries['fechado'] || 0;
  const overallConversion = totalLeads > 0 ? (totalClosed / totalLeads) * 100 : 0;

  const biggestBottleneck = conversions[0]?.fromStage || 'N/A';
  const bestConversion = conversions[conversions.length - 1]?.fromStage || 'N/A';

  return {
    conversions: conversions.sort((a, b) => {
      const aIndex = STAGE_ORDER.indexOf(a.fromStage.toLowerCase());
      const bIndex = STAGE_ORDER.indexOf(b.fromStage.toLowerCase());
      return aIndex - bIndex;
    }),
    overallConversion,
    biggestBottleneck,
    bestConversion,
  };
}

export function useConversionAnalysis(salespersonId?: string) {
  const currentMonth = new Date();
  const previousMonth = subMonths(currentMonth, 1);

  return useQuery({
    queryKey: ['conversion-analysis', salespersonId],
    queryFn: async (): Promise<ConversionAnalysisData> => {
      // Use deal_stage_history instead of sales_stage_history
      const { data: currentHistory, error: currentError } = await supabase
        .from('deal_stage_history')
        .select(`
          sale_id,
          stage,
          sales:sale_id (
            salesperson_id
          )
        `)
        .gte('entered_at', startOfMonth(currentMonth).toISOString())
        .lte('entered_at', endOfMonth(currentMonth).toISOString());

      if (currentError) throw currentError;

      const { data: previousHistory, error: previousError } = await supabase
        .from('deal_stage_history')
        .select(`
          sale_id,
          stage,
          sales:sale_id (
            salesperson_id
          )
        `)
        .gte('entered_at', startOfMonth(previousMonth).toISOString())
        .lte('entered_at', endOfMonth(previousMonth).toISOString());

      if (previousError) throw previousError;

      const currentData = calculateConversionData(
        (currentHistory || []) as unknown as StageHistoryRecord[], 
        salespersonId
      );
      const previousData = calculateConversionData(
        (previousHistory || []) as unknown as StageHistoryRecord[], 
        salespersonId
      );

      const conversionsWithChange = currentData.conversions.map((conv, index) => {
        const prevConv = previousData.conversions[index];
        return {
          ...conv,
          previousConversionRate: prevConv?.conversionRate,
          change: prevConv ? conv.conversionRate - prevConv.conversionRate : undefined,
        };
      });

      const overallChange = currentData.overallConversion - previousData.overallConversion;

      return {
        ...currentData,
        conversions: conversionsWithChange,
        previousOverallConversion: previousData.overallConversion,
        overallChange,
      };
    },
  });
}
