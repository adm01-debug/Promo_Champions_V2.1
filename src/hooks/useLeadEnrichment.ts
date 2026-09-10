import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

async function getFunctionErrorMessage(error: unknown): Promise<string> {
  if (error instanceof FunctionsHttpError) {
    const response = error.context.clone();
    const payload = (await response.json().catch(() => null)) as {
      message?: unknown;
    } | null;
    if (typeof payload?.message === 'string') return payload.message;
  }

  return 'Não foi possível enriquecer o lead. Tente novamente.';
}

export const useLeadEnrichment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      leadId,
      companyName,
      contactEmail,
    }: {
      leadId: string;
      companyName?: string;
      contactEmail?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('enrich-lead', {
        body: { leadId, companyName, contactEmail },
      });

      if (error) throw new Error(await getFunctionErrorMessage(error));
      return data;
    },
    onSuccess: () => {
      toast.success('Lead enriquecido com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['bi-sdr'] });
    },
    onError: (error: Error) => {
      console.error('Enrichment error:', error);
      toast.error(error.message);
    },
  });
};
