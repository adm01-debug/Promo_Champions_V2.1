CREATE OR REPLACE FUNCTION public.get_mfa_status()
 RETURNS TABLE(totp_enabled boolean, sms_enabled boolean, preferred_method text, migrated_to_native_mfa boolean, needs_reenrollment boolean)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT
    s.totp_enabled,
    s.sms_enabled,
    s.preferred_method,
    s.migrated_to_native_mfa,
    (s.totp_enabled AND NOT s.migrated_to_native_mfa) AS needs_reenrollment
  FROM public.user_mfa_settings s
  WHERE s.user_id = auth.uid()
$function$
