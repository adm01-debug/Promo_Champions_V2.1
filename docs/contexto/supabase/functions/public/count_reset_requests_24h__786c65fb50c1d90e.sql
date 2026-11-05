CREATE OR REPLACE FUNCTION public.count_reset_requests_24h(check_email text)
 RETURNS integer
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT COUNT(*)::INTEGER FROM password_reset_requests
  WHERE user_email = check_email
  AND requested_at > NOW() - INTERVAL '24 hours'
$function$
