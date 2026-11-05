CREATE OR REPLACE FUNCTION public.log_rate_limit(p_identifier text, p_identifier_type text, p_action text, p_blocked boolean DEFAULT false)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO rate_limit_logs (identifier, identifier_type, action, blocked)
  VALUES (p_identifier, p_identifier_type, p_action, p_blocked);
END;
$function$
