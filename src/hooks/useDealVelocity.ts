import {useQuery} from '@tanstack/react-query';
export const useDealVelocity=()=>{return useQuery({queryKey:['velocity'],queryFn:async()=>{return 0;},
    staleTime: 5 * 60 * 1000
  });};