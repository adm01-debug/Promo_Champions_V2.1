CREATE OR REPLACE FUNCTION public.record_login_attempt(p_email text, p_ip_address inet DEFAULT NULL::inet, p_success boolean DEFAULT false)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.login_attempts (email, ip_address, success, created_at)
  VALUES (
    p_email,
    p_ip_address,
    p_success,
    NOW()
  )
  ON CONFLICT DO NOTHING;   -- guard against accidental duplicate calls
END;
$function$
