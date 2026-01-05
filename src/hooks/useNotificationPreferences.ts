import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useNotificationPreferences = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['notificationpreferences'],
    queryFn: async () => {
      const { data } = await supabase.from('notificationpreferences').select('*');
      return data || [];
    },
  });

  return { data, isLoading };
};
