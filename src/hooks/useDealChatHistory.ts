import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface DealChatEntry {
  id: string;
  deal_id: string;
  salesperson_id: string | null;
  question: string;
  response: string | null;
  created_at: string;
}

export function useDealChatHistory(dealId: string | null) {
  const queryClient = useQueryClient();

  const { data: history = [], isLoading } = useQuery({
    queryKey: ['deal-chat-history', dealId],
    queryFn: async () => {
      if (!dealId) return [];
      
      const { data, error } = await supabase
        .from('deal_chat_history')
        .select('*')
        .eq('deal_id', dealId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching deal chat history:', error);
        return [];
      }

      return data as DealChatEntry[];
    },
    enabled: !!dealId,
    staleTime: 30000,
  });

  const addEntry = useMutation({
    mutationFn: async ({ 
      dealId, 
      salespersonId, 
      question, 
      response 
    }: { 
      dealId: string; 
      salespersonId: string | null; 
      question: string; 
      response?: string;
    }) => {
      const { data, error } = await supabase
        .from('deal_chat_history')
        .insert({
          deal_id: dealId,
          salesperson_id: salespersonId,
          question,
          response: response || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deal-chat-history', dealId] });
    },
  });

  const deleteEntry = useMutation({
    mutationFn: async (entryId: string) => {
      const { error } = await supabase
        .from('deal_chat_history')
        .delete()
        .eq('id', entryId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deal-chat-history', dealId] });
    },
  });

  return {
    history,
    isLoading,
    addEntry,
    deleteEntry,
  };
}
