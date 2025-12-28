import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ConversionData {
  stage: string;
  deals_in: number;
  deals_out: number;
  conversion_rate: number;
}

export const useConversionAnalysis = () => {
  return useQuery<ConversionData[]>({
    queryKey: ['conversion-analysis'],
    queryFn: async (): Promise<ConversionData[]> => {
      const { data, error } = await supabase.rpc('get_conversion_rates');
      if (error) throw error;
      return (data || []) as ConversionData[];
    }
  });
};
