import {useQuery} from '@tanstack/react-query';
import { CACHE_TIMES } from '@/constants';

export const useABCAnalysis=()=>{return useQuery({queryKey:['abc'],queryFn:async()=>{return [];},
    staleTime: CACHE_TIMES.STALE_TIME
    gcTime: CACHE_TIMES.GC_TIME,
  });};