CREATE OR REPLACE FUNCTION public.check_failed_attempts(p_email text, p_minutes integer DEFAULT 15)
 RETURNS integer
 LANGUAGE sql
AS $function$
  SELECT COUNT(*)::INTEGER
  FROM login_attempts
  WHERE email = p_email
    AND success = false
    AND created_at > NOW() - (p_minutes || ' minutes')::INTERVAL;
$function$
