import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useElevenLabsVoice = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['elevenlabsvoice'],
    queryFn: async () => {
      const { data } = await supabase.from('elevenlabsvoice').select('*');
      return data || [];
    },
  });

  return { data, isLoading };
};
