import {useQuery} from '@tanstack/react-query';
export const useChurnPrediction=()=>{return useQuery({queryKey:['churn'],queryFn:async()=>{return [];},
    staleTime: 5 * 60 * 1000
    gcTime: 10 * 60 * 1000,
  });};