CREATE OR REPLACE FUNCTION public.check_rate_limit(p_identifier text, p_action text)
 RETURNS TABLE(allowed boolean, remaining integer, reset_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_settings RECORD;
  v_count INTEGER;
  v_window_start TIMESTAMPTZ;
BEGIN
  -- Buscar configurações
  SELECT * INTO v_settings FROM rate_limit_settings WHERE action = p_action AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT true, 999, NOW() + INTERVAL '1 hour';
    RETURN;
  END IF;
  
  v_window_start := NOW() - (v_settings.window_seconds || ' seconds')::INTERVAL;
  
  -- Contar requests na janela
  SELECT COUNT(*) INTO v_count
  FROM rate_limit_logs
  WHERE identifier = p_identifier
  AND action = p_action
  AND created_at > v_window_start;
  
  IF v_count >= v_settings.max_requests THEN
    RETURN QUERY SELECT false, 0, NOW() + (v_settings.block_duration_seconds || ' seconds')::INTERVAL;
  ELSE
    RETURN QUERY SELECT true, (v_settings.max_requests - v_count - 1), v_window_start + (v_settings.window_seconds || ' seconds')::INTERVAL;
  END IF;
END;
$function$
