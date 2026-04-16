import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface BehavioralAnalysis {
  disc: {
    primary: string;
    secondary: string;
    scores: Record<string, number>;
    description: string;
  };
  emotional_intelligence: {
    score: number;
    empathy: number;
    self_awareness: number;
    social_skills: number;
    notes: string;
  };
  cognitive_biases: Array<{
    bias: string;
    evidence: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  summary: string;
  recommended_approach: string;
}

interface AnalyzePayload {
  text: string;
  interactionId?: string;
  dealId?: string;
  contactName?: string;
  channel?: string;
}

/**
 * Hook to trigger automated behavioral analysis on long interactions
 * (>100 chars). Returns DISC profile, EQ scores and cognitive biases.
 */
export const useBehavioralAnalysis = () => {
  return useMutation({
    mutationFn: async (payload: AnalyzePayload): Promise<BehavioralAnalysis | null> => {
      if (!payload.text || payload.text.length < 100) return null;

      const { data, error } = await supabase.functions.invoke('behavioral-analysis', {
        body: payload,
      });

      if (error) throw error;
      if (data?.skipped) return null;
      return data?.analysis ?? null;
    },
    onError: (err: Error) => {
      if (err.message?.includes('429')) {
        toast.error('Limite de análises atingido. Tente novamente em instantes.');
      } else if (err.message?.includes('402')) {
        toast.error('Créditos de IA esgotados.');
      } else {
        toast.error('Falha na análise comportamental');
      }
    },
  });
};
