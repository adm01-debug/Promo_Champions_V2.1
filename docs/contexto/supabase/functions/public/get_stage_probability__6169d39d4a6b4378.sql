CREATE OR REPLACE FUNCTION public.get_stage_probability(p_stage text)
 RETURNS numeric
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  SELECT probability FROM public.stage_probabilities WHERE stage = p_stage
$function$
