CREATE OR REPLACE FUNCTION public.fn_admin_cleanup_stale_logs(_days integer DEFAULT 90)
 RETURNS TABLE(table_name text, deleted_rows bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'permission denied: admin role required' USING ERRCODE = '42501';
  END IF;
  RETURN QUERY SELECT * FROM public.fn_cleanup_stale_logs(_days);
END;
$function$
