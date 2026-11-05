CREATE OR REPLACE FUNCTION public.validate_session(session_id uuid)
 RETURNS TABLE(valid boolean, needs_refresh boolean, reason text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  session_record RECORD;
BEGIN
  SELECT * INTO session_record FROM active_sessions WHERE id = session_id;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, false, 'Session not found'::TEXT;
    RETURN;
  END IF;
  
  -- Verificar se expirou
  IF session_record.expires_at < NOW() THEN
    RETURN QUERY SELECT false, false, 'Session expired'::TEXT;
    RETURN;
  END IF;
  
  -- Verificar se precisa refresh (últimas 2 horas antes de expirar)
  IF session_record.expires_at - INTERVAL '2 hours' < NOW() THEN
    RETURN QUERY SELECT true, true, 'Needs refresh'::TEXT;
    RETURN;
  END IF;
  
  RETURN QUERY SELECT true, false, 'Valid'::TEXT;
END;
$function$
