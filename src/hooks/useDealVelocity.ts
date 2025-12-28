import {useQuery} from '@tanstack/react-query';
export const useDealVelocity=()=>{return useQuery({queryKey:['velocity'],queryFn:async()=>{return 0;}});};