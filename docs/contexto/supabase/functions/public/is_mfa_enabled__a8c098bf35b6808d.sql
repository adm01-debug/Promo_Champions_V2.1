CREATE OR REPLACE FUNCTION public.is_mfa_enabled(check_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT COALESCE(
    (SELECT totp_enabled OR sms_enabled 
     FROM user_mfa_settings 
     WHERE user_id = check_user_id),
    false
  )
$function$
