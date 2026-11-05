CREATE OR REPLACE FUNCTION public.disable_sms()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE user_mfa_settings SET
    sms_enabled = false, phone_number = null, phone_verified_at = null, updated_at = now()
  WHERE user_id = auth.uid();
  RETURN FOUND;
END;
$function$
