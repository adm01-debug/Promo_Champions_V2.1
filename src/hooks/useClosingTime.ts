import {useQuery} from '@tanstack/react-query';
export const useClosingTime=()=>{return useQuery({queryKey:['closingTime'],queryFn:async()=>{return 0;},
    staleTime: 5 * 60 * 1000
    gcTime: 10 * 60 * 1000,
  });};