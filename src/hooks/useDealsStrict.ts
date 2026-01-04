import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Deal {
  id: string;
  title: string;
  value: number;
  stage: string;
  status: 'open' | 'won' | 'lost';
  probability: number;
  client_id: string;
  owner_id: string;
  expected_close_date?: string;
  closed_at?: string;
  win_reason?: string;
  loss_reason?: string;
  created_at: string;
  updated_at: string;
}

export const useDeals = (filters?: {
  status?: Deal['status'];
  ownerId?: string;
  stage?: string;
}) => {
  return useQuery<Deal[], Error>({
    queryKey: ['deals', filters],
    queryFn: async () => {
      let query = supabase
        .from('deals')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters?.ownerId) {
        query = query.eq('owner_id', filters.ownerId);
      }
      
      if (filters?.stage) {
        query = query.eq('stage', filters.stage);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Deal[];
    },
  });
};

export const useDeal = (id: string) => {
  return useQuery<Deal, Error>({
    queryKey: ['deal', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Deal;
    },
    enabled: !!id,
  });
};

export const useCreateDeal = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Deal, Error, Omit<Deal, 'id' | 'created_at' | 'updated_at'>>({
    mutationFn: async (deal) => {
      const { data, error } = await supabase
        .from('deals')
        .insert(deal)
        .select()
        .single();
      
      if (error) throw error;
      return data as Deal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
    },
  });
};

export const useUpdateDeal = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Deal, Error, { id: string; updates: Partial<Deal> }>({
    mutationFn: async ({ id, updates }) => {
      const { data, error } = await supabase
        .from('deals')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Deal;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['deal', data.id] });
    },
  });
};
