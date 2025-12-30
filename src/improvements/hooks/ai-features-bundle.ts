// ============================================================================
// SUPPLIER RISK ANALYSIS
// src/hooks/useSupplierRisk.ts
// ============================================================================

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface RiskFactor {
  factor: string;
  weight: number;
  score: number;
  description: string;
}

interface SupplierRisk {
  supplierId: string;
  supplierName: string;
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number; // 0-100
  factors: RiskFactor[];
  recommendations: string[];
  lastUpdated: string;
}

export const useSupplierRisk = (supplierId?: string) => {
  return useQuery({
    queryKey: ['supplier-risk', supplierId],
    queryFn: async (): Promise<SupplierRisk[]> => {
      const { data, error } = await supabase.rpc('analyze_supplier_risk', {
        p_supplier_id: supplierId,
      });

      if (error) throw error;
      return data || [];
    },
    enabled: !!supplierId,
  });
};

// Risk calculation algorithm
export function calculateSupplierRisk(supplier: any): SupplierRisk {
  const factors: RiskFactor[] = [
    {
      factor: 'Atrasos de Entrega',
      weight: 0.3,
      score: calculateDelayScore(supplier.delivery_history),
      description: 'Histórico de atrasos nas entregas',
    },
    {
      factor: 'Qualidade de Produtos',
      weight: 0.25,
      score: calculateQualityScore(supplier.quality_issues),
      description: 'Taxa de defeitos e devoluções',
    },
    {
      factor: 'Saúde Financeira',
      weight: 0.2,
      score: calculateFinancialScore(supplier.financial_data),
      description: 'Indicadores financeiros do fornecedor',
    },
    {
      factor: 'Concentração de Dependência',
      weight: 0.15,
      score: calculateDependencyScore(supplier.volume_percentage),
      description: 'Percentual de compras deste fornecedor',
    },
    {
      factor: 'Compliance',
      weight: 0.1,
      score: calculateComplianceScore(supplier.certifications),
      description: 'Certificações e conformidades',
    },
  ];

  const riskScore = factors.reduce(
    (acc, f) => acc + f.score * f.weight,
    0
  );

  const overallRisk =
    riskScore >= 75 ? 'critical' :
    riskScore >= 50 ? 'high' :
    riskScore >= 25 ? 'medium' : 'low';

  const recommendations = generateRecommendations(factors, overallRisk);

  return {
    supplierId: supplier.id,
    supplierName: supplier.name,
    overallRisk,
    riskScore,
    factors,
    recommendations,
    lastUpdated: new Date().toISOString(),
  };
}

function calculateDelayScore(history: any[]): number {
  if (!history || history.length === 0) return 0;
  const delayRate = history.filter(h => h.delayed).length / history.length;
  return delayRate * 100;
}

function calculateQualityScore(issues: any[]): number {
  if (!issues || issues.length === 0) return 0;
  return Math.min((issues.length / 100) * 100, 100);
}

function calculateFinancialScore(financial: any): number {
  if (!financial) return 50;
  const score =
    (financial.debt_ratio > 0.7 ? 40 : 0) +
    (financial.profit_margin < 0.05 ? 30 : 0) +
    (financial.credit_rating === 'low' ? 30 : 0);
  return score;
}

function calculateDependencyScore(volumePercentage: number): number {
  if (volumePercentage > 50) return 80;
  if (volumePercentage > 30) return 50;
  if (volumePercentage > 15) return 20;
  return 0;
}

function calculateComplianceScore(certifications: string[]): number {
  const required = ['ISO9001', 'ISO14001'];
  const hasAll = required.every(r => certifications.includes(r));
  return hasAll ? 0 : 60;
}

function generateRecommendations(
  factors: RiskFactor[],
  overallRisk: string
): string[] {
  const recommendations: string[] = [];

  if (overallRisk === 'critical' || overallRisk === 'high') {
    recommendations.push('Considere diversificar fornecedores');
    recommendations.push('Estabeleça plano de contingência');
  }

  factors.forEach(factor => {
    if (factor.score > 50) {
      switch (factor.factor) {
        case 'Atrasos de Entrega':
          recommendations.push('Negocie SLAs mais rigorosos');
          recommendations.push('Considere fornecedor backup');
          break;
        case 'Qualidade de Produtos':
          recommendations.push('Implemente inspeção de qualidade mais rígida');
          break;
        case 'Saúde Financeira':
          recommendations.push('Monitore situação financeira mensalmente');
          recommendations.push('Negocie pagamentos antecipados com desconto');
          break;
        case 'Concentração de Dependência':
          recommendations.push('Reduza dependência gradualmente');
          break;
        case 'Compliance':
          recommendations.push('Exija certificações obrigatórias');
          break;
      }
    }
  });

  return recommendations;
}

// ============================================================================
// DEMAND FORECAST - PREVISÃO DE DEMANDA
// src/hooks/useDemandForecast.ts
// ============================================================================

interface ForecastData {
  date: string;
  predicted: number;
  confidence: number;
  lower_bound: number;
  upper_bound: number;
}

export const useDemandForecast = (
  productId: string,
  horizon: number = 30 // days
) => {
  return useQuery({
    queryKey: ['demand-forecast', productId, horizon],
    queryFn: async (): Promise<ForecastData[]> => {
      const { data, error } = await supabase.rpc('forecast_demand', {
        p_product_id: productId,
        p_horizon_days: horizon,
      });

      if (error) throw error;
      return data || [];
    },
  });
};

// Simple moving average forecast
export function simpleMovingAverage(
  historicalData: number[],
  window: number = 7
): number {
  const recent = historicalData.slice(-window);
  return recent.reduce((a, b) => a + b, 0) / recent.length;
}

// Exponential smoothing
export function exponentialSmoothing(
  historicalData: number[],
  alpha: number = 0.3
): number[] {
  if (historicalData.length === 0) return [];

  const forecast = [historicalData[0]];

  for (let i = 1; i < historicalData.length; i++) {
    const smoothed =
      alpha * historicalData[i] + (1 - alpha) * forecast[i - 1];
    forecast.push(smoothed);
  }

  return forecast;
}

// Trend detection
export function detectTrend(data: number[]): 'increasing' | 'decreasing' | 'stable' {
  if (data.length < 3) return 'stable';

  const recent = data.slice(-7);
  const older = data.slice(-14, -7);

  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;

  const diff = ((recentAvg - olderAvg) / olderAvg) * 100;

  if (diff > 10) return 'increasing';
  if (diff < -10) return 'decreasing';
  return 'stable';
}

// ============================================================================
// NEXT BEST ACTION - RECOMENDAÇÃO DE AÇÕES
// src/hooks/useNextBestAction.ts
// ============================================================================

interface Action {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'proposal' | 'follow_up';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  deal_id?: string;
  client_id?: string;
  title: string;
  description: string;
  reason: string;
  expected_impact: string;
  deadline: string;
}

export const useNextBestAction = (userId?: string) => {
  return useQuery({
    queryKey: ['next-best-action', userId],
    queryFn: async (): Promise<Action[]> => {
      const { data, error } = await supabase.rpc('get_next_best_actions', {
        p_user_id: userId,
      });

      if (error) throw error;
      return data || [];
    },
  });
};

// Action scoring algorithm
export function scoreAction(action: any): number {
  let score = 0;

  // Deal value
  if (action.deal_value) {
    score += Math.min(action.deal_value / 1000, 50);
  }

  // Days since last contact
  const daysSinceContact = action.days_since_last_contact || 0;
  if (daysSinceContact > 14) score += 30;
  else if (daysSinceContact > 7) score += 20;
  else if (daysSinceContact > 3) score += 10;

  // Deal stage
  if (action.stage === 'proposal') score += 25;
  else if (action.stage === 'negotiation') score += 30;
  else if (action.stage === 'closing') score += 40;

  // Client engagement
  if (action.client_engaged) score += 15;

  // Overdue tasks
  if (action.has_overdue_tasks) score += 20;

  return Math.min(score, 100);
}

// Generate recommendations
export function generateNextActions(deals: any[]): Action[] {
  const actions: Action[] = [];

  deals.forEach(deal => {
    const score = scoreAction(deal);
    
    if (score >= 80) {
      actions.push({
        id: `action-${deal.id}`,
        type: 'call',
        priority: 'urgent',
        deal_id: deal.id,
        client_id: deal.client_id,
        title: `Ligar para ${deal.client_name}`,
        description: `Deal no estágio ${deal.stage} com alto valor`,
        reason: `Última interação há ${deal.days_since_last_contact} dias`,
        expected_impact: 'Alto - Deal próximo de fechamento',
        deadline: new Date(Date.now() + 86400000).toISOString(), // 1 day
      });
    } else if (score >= 60) {
      actions.push({
        id: `action-${deal.id}`,
        type: 'email',
        priority: 'high',
        deal_id: deal.id,
        client_id: deal.client_id,
        title: `Enviar follow-up para ${deal.client_name}`,
        description: `Manter engajamento no deal`,
        reason: `Cliente demonstrou interesse recentemente`,
        expected_impact: 'Médio - Manter momentum',
        deadline: new Date(Date.now() + 172800000).toISOString(), // 2 days
      });
    }
  });

  return actions.sort((a, b) => {
    const priorityWeight = { urgent: 4, high: 3, medium: 2, low: 1 };
    return priorityWeight[b.priority] - priorityWeight[a.priority];
  });
}
