CREATE OR REPLACE FUNCTION public.fn_admin_security_definer_exposure()
 RETURNS SETOF v_security_definer_exposure
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT * FROM public.v_security_definer_exposure
  WHERE public.has_role(auth.uid(), 'admin');
$function$
