CREATE OR REPLACE FUNCTION public.disable_totp()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE user_mfa_settings SET
    totp_enabled = false, totp_secret = null, totp_verified_at = null, updated_at = now()
  WHERE user_id = auth.uid();
  RETURN FOUND;
END;
$function$
