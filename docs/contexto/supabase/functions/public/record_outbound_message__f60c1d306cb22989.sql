CREATE OR REPLACE FUNCTION public.record_outbound_message(_owner_id uuid, _enrollment_id uuid, _step_id uuid, _channel text, _to text, _body text, _provider text, _provider_msg_id text, _status text, _error text DEFAULT NULL::text, _template_id text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.outbound_messages
    (owner_id, enrollment_id, step_id, channel, provider, to_number, body, template_id, provider_message_id, status, error, sent_at)
  VALUES
    (_owner_id, _enrollment_id, _step_id, _channel, _provider, _to, _body, _template_id, _provider_msg_id,
     COALESCE(_status, 'queued'), _error,
     CASE WHEN _status IN ('sent','delivered','read') THEN now() ELSE NULL END)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$function$
