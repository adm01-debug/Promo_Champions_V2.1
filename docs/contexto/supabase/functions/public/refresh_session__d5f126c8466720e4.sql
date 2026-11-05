CREATE OR REPLACE FUNCTION public.refresh_session(session_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE active_sessions
  SET 
    expires_at = NOW() + INTERVAL '24 hours',
    last_refresh_at = NOW(),
    refresh_count = refresh_count + 1,
    last_activity = NOW()
  WHERE id = session_id
  AND expires_at > NOW();
  
  RETURN FOUND;
END;
$function$
