import {useQuery} from '@tanstack/react-query';
export const useABCAnalysis=()=>{return useQuery({queryKey:['abc'],queryFn:async()=>{return [];},
    staleTime: 5 * 60 * 1000
    gcTime: 10 * 60 * 1000,
  });};