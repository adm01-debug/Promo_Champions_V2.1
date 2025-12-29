import { useQuery } from '@tanstack/react-query';

export const useFunnelData = () => {
  return useQuery({
    queryKey: ['funnelData'],
    queryFn: async () => {
      return [];
    }
  ,
    staleTime: 5 * 60 * 1000
  });
};
