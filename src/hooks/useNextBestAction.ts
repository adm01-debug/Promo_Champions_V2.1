import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ActionSuggestion {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  dealClient: string | null;
  actionType: 'call' | 'meeting' | 'email' | 'follow_up' | 'proposal' | 'other';
}

export interface NextBestActionResult {
  suggestions: ActionSuggestion[];
  insight: string;
}

export function useNextBestAction() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (salespersonId: string): Promise<NextBestActionResult> => {
      const { data, error } = await supabase.functions.invoke('next-best-action', {
        body: { salespersonId }
      });

      if (error) throw error;
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      return data as NextBestActionResult;
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao gerar sugestões',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
