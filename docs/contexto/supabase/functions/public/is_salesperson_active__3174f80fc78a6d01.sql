CREATE OR REPLACE FUNCTION public.is_salesperson_active(_salesperson_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.salespeople
    WHERE id = _salesperson_id AND is_active = true
  );
$function$
