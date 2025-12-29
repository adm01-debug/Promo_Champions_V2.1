import {useQuery} from '@tanstack/react-query';
export const useWinLossAnalysis=()=>{return useQuery({queryKey:['winLoss'],queryFn:async()=>{return {won:0,lost:0};},
    staleTime: 5 * 60 * 1000
    gcTime: 10 * 60 * 1000,
  });};