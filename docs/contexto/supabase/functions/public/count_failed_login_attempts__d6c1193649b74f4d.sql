CREATE OR REPLACE FUNCTION public.count_failed_login_attempts(check_email text, check_ip text, window_minutes integer DEFAULT 15)
 RETURNS integer
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT COUNT(*)::INTEGER
  FROM login_attempts
  WHERE (email = check_email OR ip_address = check_ip)
  AND success = false
  AND created_at > NOW() - (window_minutes || ' minutes')::INTERVAL
$function$
