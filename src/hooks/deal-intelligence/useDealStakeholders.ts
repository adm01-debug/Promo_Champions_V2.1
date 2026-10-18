import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type {
  DMURole,
  InfluenceLevel,
  Sentiment,
} from '@/components/deal-intelligence/committeeHelpers';

export interface DealStakeholder {
  id: string;
  sale_id: string;
  owner_id: string;
  name: string;
  role_title: string | null;
  dmu_role: DMURole;
  influence_level: InfluenceLevel;
  engagement_score: number;
  sentiment: Sentiment;
  email: string | null;
  phone: string | null;
  linkedin_url: string | null;
  notes: string | null;
  signals: string[];
  last_interaction_at: string | null;
  source: 'manual' | 'ai_extracted' | 'email' | 'call';
  evidence_quote: string | null;
  confidence: number | null;
  created_at: string;
  updated_at: string;
}

export const useDealStakeholders = (saleId: string | null | undefined) => {
  const qc = useQueryClient();

  useEffect(() => {
    if (!saleId) return;
    const ch = supabase
      .channel(`stakeholders-${saleId}-${crypto.randomUUID()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'deal_stakeholders',
          filter: `sale_id=eq.${saleId}`,
        },
        () => qc.invalidateQueries({ queryKey: ['deal-stakeholders', saleId] })
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [saleId, qc]);

  return useQuery({
    queryKey: ['deal-stakeholders', saleId],
    queryFn: async (): Promise<DealStakeholder[]> => {
      if (!saleId) return [];
      const { data, error } = await supabase
        .from('deal_stakeholders')
        .select('*')
        .eq('sale_id', saleId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data || []) as DealStakeholder[];
    },
    enabled: !!saleId,
  });
};
