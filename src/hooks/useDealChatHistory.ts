import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';

export type QuestionType = 'general' | 'analysis' | 'objections' | 'closing' | 'strategy';

export const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: 'general', label: 'Geral' },
  { value: 'analysis', label: 'Análise' },
  { value: 'objections', label: 'Objeções' },
  { value: 'closing', label: 'Fechamento' },
  { value: 'strategy', label: 'Estratégia' },
];

interface DealChatEntry {
  id: string;
  deal_id: string;
  salesperson_id: string | null;
  question: string;
  question_type: string;
  response: string | null;
  created_at: string;
}

export function useDealChatHistory(dealId: string | null) {
  const queryClient = useQueryClient();
  const [filterType, setFilterType] = useState<QuestionType | 'all'>('all');

  const { data: allHistory = [], isLoading } = useQuery({
    queryKey: ['deal-chat-history', dealId],
    queryFn: async () => {
      if (!dealId) return [];
      
      const { data, error } = await supabase
        .from('deal_chat_history')
        .select('*')
        .eq('deal_id', dealId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        if (import.meta.env.DEV) {
          console.error('Error fetching deal chat history:', error);
        }
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
      questionType = 'general',
      response 
    }: { 
      dealId: string; 
      salespersonId: string | null; 
      question: string; 
      questionType?: QuestionType;
      response?: string;
    }) => {
      const { data, error } = await supabase
        .from('deal_chat_history')
        .insert({
          deal_id: dealId,
          salesperson_id: salespersonId,
          question,
          question_type: questionType,
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

  const history = allHistory.filter(entry => 
    filterType === 'all' || entry.question_type === filterType
  );

  return {
    history,
    allHistory,
    isLoading,
    addEntry,
    deleteEntry,
    filterType,
    setFilterType,
  };
}
