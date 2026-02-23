// @ts-nocheck
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

type RoutingStrategy = 'round-robin' | 'load-based' | 'territory' | 'expertise';

export const useLeadRouting = (strategy: RoutingStrategy = 'round-robin') => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (leadId: string) => {
      const { data: salespeople } = await supabase
        .from('users')
        .select('id, full_name, territory, expertise, active_deals:deals(count)')
        .eq('role', 'salesperson')
        .eq('active', true);

      if (!salespeople || salespeople.length === 0) {
        throw new Error('No available salespeople');
      }

      let assignedTo: string;

      switch (strategy) {
        case 'round-robin':
          assignedTo = getRoundRobinSalesperson(salespeople);
          break;
        case 'load-based':
          assignedTo = getLoadBasedSalesperson(salespeople);
          break;
        default:
          assignedTo = salespeople[0].id;
      }

      const { error } = await supabase
        .from('clients')
        .update({ assigned_to: assignedTo })
        .eq('id', leadId);

      if (error) throw error;

      return { assignedTo };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
};

function getRoundRobinSalesperson(salespeople: any[]): string {
  const lastAssigned = parseInt(localStorage.getItem('lastAssignedIndex') || '0');
  const nextIndex = (lastAssigned + 1) % salespeople.length;
  localStorage.setItem('lastAssignedIndex', nextIndex.toString());
  return salespeople[nextIndex].id;
}

function getLoadBasedSalesperson(salespeople: any[]): string {
  return salespeople.reduce((min, person) =>
    person.active_deals[0].count < min.active_deals[0].count ? person : min
  ).id;
}
