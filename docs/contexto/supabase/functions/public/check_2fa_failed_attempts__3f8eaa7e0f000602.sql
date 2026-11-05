CREATE OR REPLACE FUNCTION public.check_2fa_failed_attempts(p_user_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_failed_count integer;
BEGIN
  IF auth.role() <> 'service_role'
     AND (
       auth.uid() IS NULL
       OR (
         p_user_id IS DISTINCT FROM auth.uid()
         AND NOT public.is_admin_or_manager(auth.uid())
       )
     ) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  SELECT count(*)::integer
    INTO v_failed_count
    FROM public.user_2fa_log AS l
   WHERE l.user_id = p_user_id
     AND l.success IS FALSE
     AND l.created_at > now() - interval '15 minutes';

  RETURN v_failed_count;
END;
$function$
