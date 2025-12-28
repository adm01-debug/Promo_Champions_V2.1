// src/hooks/useLeadRouting.ts
// Refatorado: 6 any removidos
// Data: 2024-12-28

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type RoutingCriteria = 
  | 'round_robin'
  | 'weighted'
  | 'availability'
  | 'skill_based'
  | 'performance'
  | 'territory';

export type AssignmentStatus = 'pending' | 'assigned' | 'rejected' | 'reassigned';

export interface RoutingRule {
  id: string;
  criteria: RoutingCriteria;
  weight: number;
  priority: number;
  active: boolean;
  conditions?: RoutingConditions;
}

export interface RoutingConditions {
  leadScore?: { min: number; max: number };
  leadSource?: string[];
  territory?: string[];
  productCategory?: string[];
}

export interface SalesRepCapacity {
  userId: string;
  userName: string;
  currentLoad: number;
  maxCapacity: number;
  availableSlots: number;
  skills: string[];
  territories: string[];
  performanceScore: number;
  averageCloseRate: number;
}

export interface RoutingAssignment {
  leadId: string;
  assignedTo: string;
  assignedAt: Date;
  status: AssignmentStatus;
  criteria: RoutingCriteria;
  score: number;
  reason: string;
}

export interface RoutingMetrics {
  totalAssignments: number;
  successRate: number;
  averageResponseTime: number;
  byMethod: Record<RoutingCriteria, number>;
  bySalesRep: Record<string, number>;
}

// ============================================================================
// HOOK: useLeadRouting
// ============================================================================

export const useLeadRouting = () => {
  return useQuery({
    queryKey: ['lead-routing-rules'],
    queryFn: async (): Promise<RoutingRule[]> => {
      const { data, error } = await supabase
        .from('lead_routing_rules')
        .select('*')
        .eq('active', true)
        .order('priority', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });
};

// ============================================================================
// HOOK: useSalesRepCapacity
// ============================================================================

export const useSalesRepCapacity = () => {
  return useQuery({
    queryKey: ['sales-rep-capacity'],
    queryFn: async (): Promise<SalesRepCapacity[]> => {
      const { data, error } = await supabase
        .rpc('get_sales_rep_capacity');

      if (error) throw error;
      return data || [];
    },
  });
};

// ============================================================================
// HOOK: useRoutingMetrics
// ============================================================================

export const useRoutingMetrics = (period: 'day' | 'week' | 'month' = 'week') => {
  return useQuery({
    queryKey: ['routing-metrics', period],
    queryFn: async (): Promise<RoutingMetrics> => {
      const { data, error } = await supabase
        .rpc('get_routing_metrics', { period_type: period });

      if (error) throw error;
      
      return {
        totalAssignments: data.total_assignments || 0,
        successRate: data.success_rate || 0,
        averageResponseTime: data.avg_response_time || 0,
        byMethod: data.by_method || {},
        bySalesRep: data.by_sales_rep || {},
      };
    },
  });
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calcula o score de roteamento para um vendedor
 */
export function calculateRoutingScore(
  lead: { score: number; source: string; territory?: string },
  salesRep: SalesRepCapacity,
  criteria: RoutingCriteria
): number {
  let score = 0;

  switch (criteria) {
    case 'round_robin':
      // Distribuição igualitária
      score = 100 - (salesRep.currentLoad / salesRep.maxCapacity) * 100;
      break;

    case 'weighted':
      // Baseado em performance
      score = salesRep.performanceScore * (salesRep.availableSlots / salesRep.maxCapacity);
      break;

    case 'availability':
      // Prioriza quem tem mais slots disponíveis
      score = (salesRep.availableSlots / salesRep.maxCapacity) * 100;
      break;

    case 'skill_based':
      // Match de skills (simplificado)
      const hasSkills = salesRep.skills.length > 0;
      score = hasSkills ? salesRep.performanceScore : 0;
      break;

    case 'performance':
      // Baseado em taxa de conversão
      score = salesRep.averageCloseRate * salesRep.performanceScore;
      break;

    case 'territory':
      // Match de território
      const matchesTerritory = lead.territory && 
        salesRep.territories.includes(lead.territory);
      score = matchesTerritory ? 100 : 0;
      break;

    default:
      score = 50; // Fallback
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Encontra o melhor vendedor para um lead
 */
export function findBestMatch(
  lead: { score: number; source: string; territory?: string },
  salesReps: SalesRepCapacity[],
  rules: RoutingRule[]
): RoutingAssignment | null {
  if (!salesReps.length || !rules.length) return null;

  let bestMatch: {
    salesRep: SalesRepCapacity;
    score: number;
    criteria: RoutingCriteria;
  } | null = null;

  // Aplicar cada regra e pegar a melhor pontuação
  for (const rule of rules) {
    for (const salesRep of salesReps) {
      // Verificar se vendedor tem capacidade
      if (salesRep.availableSlots <= 0) continue;

      // Verificar condições da regra
      if (rule.conditions) {
        if (!matchesConditions(lead, salesRep, rule.conditions)) {
          continue;
        }
      }

      const score = calculateRoutingScore(lead, salesRep, rule.criteria);
      const weightedScore = score * rule.weight;

      if (!bestMatch || weightedScore > bestMatch.score) {
        bestMatch = {
          salesRep,
          score: weightedScore,
          criteria: rule.criteria,
        };
      }
    }
  }

  if (!bestMatch) return null;

  return {
    leadId: '', // Será preenchido ao usar
    assignedTo: bestMatch.salesRep.userId,
    assignedAt: new Date(),
    status: 'assigned',
    criteria: bestMatch.criteria,
    score: bestMatch.score,
    reason: `Assigned via ${bestMatch.criteria} (score: ${bestMatch.score.toFixed(1)})`,
  };
}

/**
 * Verifica se lead/vendedor atendem condições da regra
 */
function matchesConditions(
  lead: { score: number; source: string; territory?: string },
  salesRep: SalesRepCapacity,
  conditions: RoutingConditions
): boolean {
  // Lead score
  if (conditions.leadScore) {
    if (lead.score < conditions.leadScore.min || 
        lead.score > conditions.leadScore.max) {
      return false;
    }
  }

  // Lead source
  if (conditions.leadSource && conditions.leadSource.length > 0) {
    if (!conditions.leadSource.includes(lead.source)) {
      return false;
    }
  }

  // Territory
  if (conditions.territory && conditions.territory.length > 0) {
    if (!lead.territory || 
        !conditions.territory.some(t => salesRep.territories.includes(t))) {
      return false;
    }
  }

  return true;
}

// ============================================================================
// EXPORT
// ============================================================================

export default useLeadRouting;
