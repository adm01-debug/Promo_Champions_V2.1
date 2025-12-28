import {useQuery} from '@tanstack/react-query';
export const useClosingTime=()=>{return useQuery({queryKey:['closingTime'],queryFn:async()=>{return 0;}});};