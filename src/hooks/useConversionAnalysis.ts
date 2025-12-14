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

const STAGE_ORDER = ['lead', 'qualificado', 'proposta', 'negociacao', 'fechado'];
const STAGE_LABELS: Record<string, string> = {
  'lead': 'Lead',
  'qualificado': 'Qualificado',
  'proposta': 'Proposta',
  'negociacao': 'Negociação',
  'fechado': 'Fechado'
};

function calculateConversionData(history: any[], salespersonId?: string): { conversions: StageConversion[]; overallConversion: number; biggestBottleneck: string; bestConversion: string } {
  const filteredHistory = salespersonId
    ? history?.filter(h => (h.sales as any)?.salesperson_id === salespersonId)
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
      
      if (index < journey.length - 1) {
        const nextStage = journey[index + 1];
        const key = `${stage}->${nextStage}`;
        stageTransitions[key] = (stageTransitions[key] || 0) + 1;
      }
    });
  });

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

export function useConversionAnalysis(salespersonId?: string, enableComparison = true) {
  return useQuery({
    queryKey: ['conversion-analysis', salespersonId, enableComparison],
    queryFn: async (): Promise<ConversionAnalysisData> => {
      const now = new Date();
      const currentStart = startOfMonth(now);
      const currentEnd = endOfMonth(now);
      const previousStart = startOfMonth(subMonths(now, 1));
      const previousEnd = endOfMonth(subMonths(now, 1));

      // Fetch current period
      const { data: currentHistory, error: currentError } = await supabase
        .from('deal_stage_history')
        .select(`*, sales:sale_id (salesperson_id)`)
        .gte('entered_at', currentStart.toISOString())
        .lte('entered_at', currentEnd.toISOString());

      if (currentError) throw currentError;

      const currentData = calculateConversionData(currentHistory || [], salespersonId);

      if (!enableComparison) {
        return currentData;
      }

      // Fetch previous period
      const { data: previousHistory, error: previousError } = await supabase
        .from('deal_stage_history')
        .select(`*, sales:sale_id (salesperson_id)`)
        .gte('entered_at', previousStart.toISOString())
        .lte('entered_at', previousEnd.toISOString());

      if (previousError) throw previousError;

      const previousData = calculateConversionData(previousHistory || [], salespersonId);

      // Calculate changes
      const conversionsWithComparison = currentData.conversions.map((conv, index) => {
        const prevConv = previousData.conversions[index];
        const previousConversionRate = prevConv?.conversionRate || 0;
        const change = previousConversionRate > 0
          ? ((conv.conversionRate - previousConversionRate) / previousConversionRate) * 100
          : 0;
        return {
          ...conv,
          previousConversionRate,
          change
        };
      });

      const overallChange = previousData.overallConversion > 0
        ? ((currentData.overallConversion - previousData.overallConversion) / previousData.overallConversion) * 100
        : 0;

      return {
        ...currentData,
        conversions: conversionsWithComparison,
        previousOverallConversion: previousData.overallConversion,
        overallChange
      };
    }
  });
}
