CREATE OR REPLACE FUNCTION public.fn_admin_web_vitals_p75()
 RETURNS SETOF v_web_vitals_p75
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'permission denied: admin role required' USING ERRCODE = '42501';
  END IF;
  RETURN QUERY SELECT * FROM public.v_web_vitals_p75;
END;
$function$
