CREATE OR REPLACE FUNCTION public.has_pending_reset_request(check_email text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM password_reset_requests
    WHERE user_email = check_email
    AND status = 'pending'
    AND expires_at > NOW()
  )
$function$
