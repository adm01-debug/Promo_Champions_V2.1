CREATE OR REPLACE FUNCTION public.set_mfa_preferred_method(p_method text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE user_mfa_settings SET preferred_method = p_method, updated_at = now()
  WHERE user_id = auth.uid();
  RETURN FOUND;
END;
$function$
