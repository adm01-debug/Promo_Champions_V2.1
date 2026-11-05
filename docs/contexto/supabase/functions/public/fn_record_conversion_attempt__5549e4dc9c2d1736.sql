CREATE OR REPLACE FUNCTION public.fn_record_conversion_attempt(_quote_id uuid, _sale_id uuid, _order_id uuid, _order_number text, _previous_status text, _new_status text, _reused_order boolean, _idempotent boolean, _success boolean, _error_code text, _error_message text, _latency_ms integer, _request_id text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_id UUID;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION '[NOT_AUTHENTICATED] auth.uid() ausente';
  END IF;

  INSERT INTO public.quote_conversion_audit (
    quote_id, sale_id, order_id, order_number,
    previous_status, new_status, reused_order, idempotent,
    success, error_code, error_message, latency_ms, request_id, actor_user_id
  ) VALUES (
    _quote_id, _sale_id, _order_id, _order_number,
    _previous_status, _new_status, COALESCE(_reused_order, false), COALESCE(_idempotent, false),
    _success, _error_code, _error_message, _latency_ms, _request_id, auth.uid()
  ) RETURNING id INTO v_id;

  RETURN v_id;
END $function$
