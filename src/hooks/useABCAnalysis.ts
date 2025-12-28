import {useQuery} from '@tanstack/react-query';
export const useABCAnalysis=()=>{return useQuery({queryKey:['abc'],queryFn:async()=>{return [];}});};