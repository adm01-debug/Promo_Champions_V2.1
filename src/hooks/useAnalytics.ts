import { useQuery } from '@tanstack/react-query';

export const useAnalytics = () => {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      return { revenue: 0, deals: 0, conversion: 0 };
    }
  });
};
