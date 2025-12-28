// src/hooks/useABCAnalysis.ts
// Refatorado: 6 any removidos
// Data: 2024-12-28

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type ABCCategory = 'A' | 'B' | 'C';

export interface ABCItem {
  id: string;
  name: string;
  value: number;
  percentage: number;
  cumulativePercentage: number;
  category: ABCCategory;
  rank: number;
}

export interface ABCAnalysisResult {
  items: ABCItem[];
  categoryA: {
    items: ABCItem[];
    totalValue: number;
    percentage: number;
    count: number;
  };
  categoryB: {
    items: ABCItem[];
    totalValue: number;
    percentage: number;
    count: number;
  };
  categoryC: {
    items: ABCItem[];
    totalValue: number;
    percentage: number;
    count: number;
  };
  totalValue: number;
  totalItems: number;
}

export interface ABCCriteria {
  categoryA: { min: number; max: number }; // % cumulativo (ex: 0-80)
  categoryB: { min: number; max: number }; // % cumulativo (ex: 80-95)
  categoryC: { min: number; max: number }; // % cumulativo (ex: 95-100)
}

export interface ABCFilters {
  entityType: 'clients' | 'products' | 'deals' | 'suppliers';
  dateFrom?: string;
  dateTo?: string;
  metric?: 'revenue' | 'quantity' | 'profit';
}

// ============================================================================
// CONSTANTES
// ============================================================================

const DEFAULT_CRITERIA: ABCCriteria = {
  categoryA: { min: 0, max: 80 },
  categoryB: { min: 80, max: 95 },
  categoryC: { min: 95, max: 100 },
};

// ============================================================================
// HOOK: useABCAnalysis
// ============================================================================

export const useABCAnalysis = (filters: ABCFilters, criteria = DEFAULT_CRITERIA) => {
  return useQuery({
    queryKey: ['abc-analysis', filters, criteria],
    queryFn: async (): Promise<ABCAnalysisResult> => {
      const { data, error } = await supabase
        .rpc('get_abc_analysis', {
          entity_type: filters.entityType,
          date_from: filters.dateFrom,
          date_to: filters.dateTo,
          metric: filters.metric || 'revenue',
        });

      if (error) throw error;

      return performABCAnalysis(data, criteria);
    },
  });
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Realiza análise ABC nos dados
 */
function performABCAnalysis(
  rawData: Array<{ id: string; name: string; value: number }>,
  criteria: ABCCriteria
): ABCAnalysisResult {
  // Ordenar por valor (desc)
  const sorted = [...rawData].sort((a, b) => b.value - a.value);

  // Calcular total
  const totalValue = sorted.reduce((sum, item) => sum + item.value, 0);

  // Calcular percentagens e cumulativo
  let cumulativeValue = 0;
  const items: ABCItem[] = sorted.map((item, index) => {
    const percentage = (item.value / totalValue) * 100;
    cumulativeValue += item.value;
    const cumulativePercentage = (cumulativeValue / totalValue) * 100;

    // Determinar categoria baseado no percentual cumulativo
    let category: ABCCategory;
    if (cumulativePercentage <= criteria.categoryA.max) {
      category = 'A';
    } else if (cumulativePercentage <= criteria.categoryB.max) {
      category = 'B';
    } else {
      category = 'C';
    }

    return {
      id: item.id,
      name: item.name,
      value: item.value,
      percentage,
      cumulativePercentage,
      category,
      rank: index + 1,
    };
  });

  // Agrupar por categoria
  const categoryA = items.filter(item => item.category === 'A');
  const categoryB = items.filter(item => item.category === 'B');
  const categoryC = items.filter(item => item.category === 'C');

  return {
    items,
    categoryA: {
      items: categoryA,
      totalValue: categoryA.reduce((sum, item) => sum + item.value, 0),
      percentage: (categoryA.reduce((sum, item) => sum + item.value, 0) / totalValue) * 100,
      count: categoryA.length,
    },
    categoryB: {
      items: categoryB,
      totalValue: categoryB.reduce((sum, item) => sum + item.value, 0),
      percentage: (categoryB.reduce((sum, item) => sum + item.value, 0) / totalValue) * 100,
      count: categoryB.length,
    },
    categoryC: {
      items: categoryC,
      totalValue: categoryC.reduce((sum, item) => sum + item.value, 0),
      percentage: (categoryC.reduce((sum, item) => sum + item.value, 0) / totalValue) * 100,
      count: categoryC.length,
    },
    totalValue,
    totalItems: items.length,
  };
}

/**
 * Retorna insights baseados na análise ABC
 */
export function getABCInsights(
  result: ABCAnalysisResult
): Array<{
  type: 'success' | 'warning' | 'info';
  message: string;
  priority: number;
}> {
  const insights: Array<{
    type: 'success' | 'warning' | 'info';
    message: string;
    priority: number;
  }> = [];

  // Insight 1: Concentração categoria A
  if (result.categoryA.percentage > 80) {
    insights.push({
      type: 'success',
      message: `${result.categoryA.count} itens (${((result.categoryA.count / result.totalItems) * 100).toFixed(1)}%) geram ${result.categoryA.percentage.toFixed(1)}% do valor total`,
      priority: 1,
    });
  }

  // Insight 2: Categoria B muito pequena
  if (result.categoryB.count < result.totalItems * 0.1) {
    insights.push({
      type: 'warning',
      message: `Categoria B com apenas ${result.categoryB.count} itens. Considere revisar critérios de classificação.`,
      priority: 2,
    });
  }

  // Insight 3: Categoria C muito grande
  if (result.categoryC.count > result.totalItems * 0.7) {
    insights.push({
      type: 'info',
      message: `${result.categoryC.count} itens da categoria C (${result.categoryC.percentage.toFixed(1)}% do valor). Oportunidade de otimização.`,
      priority: 3,
    });
  }

  // Insight 4: Distribuição ideal
  const idealA = result.categoryA.count / result.totalItems;
  const idealB = result.categoryB.count / result.totalItems;
  const idealC = result.categoryC.count / result.totalItems;

  if (idealA >= 0.15 && idealA <= 0.25 && idealB >= 0.25 && idealB <= 0.35) {
    insights.push({
      type: 'success',
      message: 'Distribuição ABC está dentro dos padrões recomendados (A: 15-25%, B: 25-35%)',
      priority: 1,
    });
  }

  return insights.sort((a, b) => a.priority - b.priority);
}

/**
 * Formata dados para gráfico de Pareto
 */
export function formatForParetoChart(
  result: ABCAnalysisResult
): Array<{
  name: string;
  value: number;
  cumulative: number;
  category: ABCCategory;
}> {
  return result.items.map(item => ({
    name: item.name,
    value: item.value,
    cumulative: item.cumulativePercentage,
    category: item.category,
  }));
}

/**
 * Retorna recomendações de ação baseadas na categoria
 */
export function getActionRecommendations(
  category: ABCCategory
): Array<string> {
  const recommendations: Record<ABCCategory, string[]> = {
    A: [
      'Manter relacionamento próximo',
      'Oferecer condições especiais',
      'Monitorar satisfação regularmente',
      'Priorizar atendimento',
      'Investir em personalização',
    ],
    B: [
      'Acompanhar potencial de crescimento',
      'Identificar oportunidades de upsell',
      'Manter qualidade de atendimento',
      'Automatizar processos quando possível',
    ],
    C: [
      'Avaliar viabilidade de manutenção',
      'Considerar descontinuação de itens menos rentáveis',
      'Maximizar automação',
      'Agrupar atendimentos para eficiência',
      'Estabelecer critérios de corte',
    ],
  };

  return recommendations[category];
}

/**
 * Calcula oportunidades de melhoria
 */
export function calculateImprovementOpportunities(
  result: ABCAnalysisResult
): Array<{
  category: ABCCategory;
  action: string;
  potentialGain: number;
  effort: 'low' | 'medium' | 'high';
}> {
  const opportunities: Array<{
    category: ABCCategory;
    action: string;
    potentialGain: number;
    effort: 'low' | 'medium' | 'high';
  }> = [];

  // Oportunidade 1: Crescer categoria B
  if (result.categoryB.count > 0) {
    const avgBValue = result.categoryB.totalValue / result.categoryB.count;
    opportunities.push({
      category: 'B',
      action: 'Elevar 20% dos itens B para categoria A',
      potentialGain: avgBValue * Math.ceil(result.categoryB.count * 0.2),
      effort: 'medium',
    });
  }

  // Oportunidade 2: Otimizar categoria C
  if (result.categoryC.count > 10) {
    const savingsPerItem = result.categoryC.totalValue / result.categoryC.count * 0.1;
    opportunities.push({
      category: 'C',
      action: 'Reduzir custos operacionais em categoria C',
      potentialGain: savingsPerItem * result.categoryC.count,
      effort: 'low',
    });
  }

  // Oportunidade 3: Proteger categoria A
  if (result.categoryA.count > 0) {
    const riskValue = result.categoryA.totalValue * 0.05; // 5% de risco
    opportunities.push({
      category: 'A',
      action: 'Implementar programa de retenção para categoria A',
      potentialGain: riskValue,
      effort: 'high',
    });
  }

  return opportunities.sort((a, b) => b.potentialGain - a.potentialGain);
}

/**
 * Retorna cor baseada na categoria
 */
export function getCategoryColor(category: ABCCategory): string {
  const colors: Record<ABCCategory, string> = {
    A: '#10b981', // green
    B: '#f59e0b', // amber
    C: '#ef4444', // red
  };
  return colors[category];
}

// ============================================================================
// EXPORT
// ============================================================================

export default useABCAnalysis;
