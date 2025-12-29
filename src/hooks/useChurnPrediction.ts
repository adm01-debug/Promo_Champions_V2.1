import {useQuery} from '@tanstack/react-query';
import { CACHE_TIMES } from '@/constants';

export const useChurnPrediction=()=>{return useQuery({queryKey:['churn'],queryFn:async()=>{return [];},
    staleTime: CACHE_TIMES.STALE_TIME
    gcTime: CACHE_TIMES.GC_TIME,
  });};