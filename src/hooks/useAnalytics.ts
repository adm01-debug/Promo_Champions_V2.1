import { useQuery } from '@tanstack/react-query';

export const useAnalytics = () => {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      return { revenue: 0, deals: 0, conversion: 0 };
    }
  ,
    staleTime: 5 * 60 * 1000
    gcTime: 10 * 60 * 1000,
  });
};
