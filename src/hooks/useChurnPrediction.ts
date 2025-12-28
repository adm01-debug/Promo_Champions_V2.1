import {useQuery} from '@tanstack/react-query';
export const useChurnPrediction=()=>{return useQuery({queryKey:['churn'],queryFn:async()=>{return [];}});};