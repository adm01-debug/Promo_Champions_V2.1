CREATE OR REPLACE FUNCTION public.fn_get_orders_conversion_seq_last()
 RETURNS bigint
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT last_value FROM public.orders_conversion_seq;
$function$
