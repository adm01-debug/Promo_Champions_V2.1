import { useQuery } from '@tanstack/react-query';

export const useLeadScoring = (clientId?: string) => {
  return useQuery({
    queryKey: ['leadScoring', clientId],
    queryFn: async () => {
      return { score: 0, category: 'cold' };
    }
  ,
    staleTime: 5 * 60 * 1000
    gcTime: 10 * 60 * 1000,
  });
};
