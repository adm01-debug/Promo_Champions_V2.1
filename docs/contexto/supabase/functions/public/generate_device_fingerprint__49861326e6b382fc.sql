CREATE OR REPLACE FUNCTION public.generate_device_fingerprint(p_user_agent text, p_ip_address text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN encode(sha256((COALESCE(p_user_agent, '') || COALESCE(p_ip_address, ''))::bytea), 'hex');
END;
$function$
