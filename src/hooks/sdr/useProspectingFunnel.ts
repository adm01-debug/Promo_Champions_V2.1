import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useProspectingFunnel() {

  return useQuery({
    queryKey: ['prospecting-funnel'],
    queryFn: async () => {
      const { data: sales } = await supabase.from('sales').select('status');

      const statusCounts = {
        lead: 0,
        qualified: 0,
        proposal: 0,
        negotiation: 0,
        completed: 0,
      };

      sales?.forEach(sale => {
        const status = sale.status as keyof typeof statusCounts;
        if (status in statusCounts) {
          statusCounts[status]++;
        }
      });

      const total = sales?.length || 1;

      return [
        {
          stage: 'Leads',
          count: statusCounts.lead,
          percentage: (statusCounts.lead / total) * 100,
          color: '#6366f1',
        },
        {
          stage: 'Qualificados',
          count: statusCounts.qualified,
          percentage: (statusCounts.qualified / total) * 100,
          color: '#8b5cf6',
        },
        {
          stage: 'Proposta',
          count: statusCounts.proposal,
          percentage: (statusCounts.proposal / total) * 100,
          color: '#a855f7',
        },
        {
          stage: 'Negociação',
          count: statusCounts.negotiation,
          percentage: (statusCounts.negotiation / total) * 100,
          color: '#d946ef',
        },
        {
          stage: 'Fechados',
          count: statusCounts.completed,
          percentage: (statusCounts.completed / total) * 100,
          color: '#22c55e',
        },
      ];
    },
  });
}

