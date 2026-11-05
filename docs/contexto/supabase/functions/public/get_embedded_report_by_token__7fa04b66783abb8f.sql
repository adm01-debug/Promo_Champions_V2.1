CREATE OR REPLACE FUNCTION public.get_embedded_report_by_token(_token uuid)
 RETURNS TABLE(report_id uuid, report_name text, report_entity text, report_config jsonb, is_valid boolean, reason text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _t RECORD;
  _r RECORD;
BEGIN
  SELECT * INTO _t FROM public.embedded_report_tokens WHERE public_token = _token AND is_active = true;
  IF NOT FOUND THEN
    RETURN QUERY SELECT NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::JSONB, false, 'Token inválido';
    RETURN;
  END IF;
  IF _t.expires_at IS NOT NULL AND _t.expires_at < now() THEN
    RETURN QUERY SELECT NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::JSONB, false, 'Token expirado';
    RETURN;
  END IF;
  SELECT * INTO _r FROM public.custom_reports WHERE id = _t.report_id;
  IF NOT FOUND THEN
    RETURN QUERY SELECT NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::JSONB, false, 'Relatório removido';
    RETURN;
  END IF;
  -- Track view
  UPDATE public.embedded_report_tokens
    SET view_count = view_count + 1, last_viewed_at = now()
    WHERE id = _t.id;
  RETURN QUERY SELECT _r.id, _r.name, _r.entity, _r.config, true, NULL::TEXT;
END;
$function$
