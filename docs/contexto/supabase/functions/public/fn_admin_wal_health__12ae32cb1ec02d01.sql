CREATE OR REPLACE FUNCTION public.fn_admin_wal_health()
 RETURNS SETOF v_platform_wal_health
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT * FROM public.v_platform_wal_health
  WHERE public.has_role(auth.uid(), 'admin');
$function$
