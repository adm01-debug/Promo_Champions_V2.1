// @ts-nocheck
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ClientPortfolioItem {
  id: string;
  client_id: string;
  salesperson_id: string;
  status: string;
  assigned_at: string;
  last_purchase_date: string | null;
  source: string | null;
  assigned_by: string | null;
  created_at: string;
  updated_at: string;
  client?: { name: string; email?: string; phone?: string; company?: string };
  salesperson?: { name: string };
}

export const useClientPortfolio = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['client_portfolio'],
    queryFn: async () => {
      const { data } = await supabase
        .from('client_portfolio')
        .select('*, client:clients(name, email, phone, company), salesperson:salespeople(name)');
      return (data || []) as ClientPortfolioItem[];
    },
  });

  return { data, isLoading };
};

export const useUpdatePortfolioStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ portfolioId, status, lastPurchaseDate }: { portfolioId: string; status: string; lastPurchaseDate?: string }) => {
      const updates: any = { status };
      if (lastPurchaseDate) updates.last_purchase_date = lastPurchaseDate;
      const { error } = await supabase.from('client_portfolio').update(updates).eq('id', portfolioId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client_portfolio'] });
      toast.success('Status atualizado!');
    },
    onError: (err: any) => toast.error('Erro: ' + err.message),
  });
};

export const useRemoveFromPortfolio = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (portfolioId: string) => {
      const { error } = await supabase.from('client_portfolio').delete().eq('id', portfolioId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client_portfolio'] });
      toast.success('Cliente removido do portfólio!');
    },
    onError: (err: any) => toast.error('Erro: ' + err.message),
  });
};
