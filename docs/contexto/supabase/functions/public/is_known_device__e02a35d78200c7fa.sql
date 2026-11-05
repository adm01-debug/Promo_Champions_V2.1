CREATE OR REPLACE FUNCTION public.is_known_device(p_user_id uuid, p_fingerprint text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM known_devices
    WHERE user_id = p_user_id
    AND device_fingerprint = p_fingerprint
  )
$function$
