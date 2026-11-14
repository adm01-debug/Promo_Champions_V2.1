CREATE OR REPLACE FUNCTION public.match_whatsapp_reply_to_enrollment(_from_digits text, _owner_ids uuid[] DEFAULT NULL::uuid[], _received_at timestamp with time zone DEFAULT now())
 RETURNS uuid
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _enrollment_id uuid;
  _digits text;
BEGIN
  _digits := regexp_replace(COALESCE(_from_digits, ''), '[^0-9]', '', 'g');
  IF length(_digits) = 0 THEN
    RETURN NULL;
  END IF;

  SELECT se.id INTO _enrollment_id
  FROM public.sequence_enrollments se
  JOIN public.outbound_messages om ON om.enrollment_id = se.id
  WHERE om.channel = 'whatsapp'
    AND om.provider = 'evolution'
    AND regexp_replace(om.to_number, '[^0-9]', '', 'g') = _digits
    AND se.status IN ('active', 'scheduled')
    AND se.auto_paused_at IS NULL
    AND se.started_at <= _received_at
  ORDER BY
    -- Preferência pelo dono da credencial da instância que recebeu a
    -- resposta (mesmo critério do fallback no webhook); depois o outbound
    -- mais recente para o número.
    CASE WHEN _owner_ids IS NOT NULL AND om.owner_id = ANY(_owner_ids)
         THEN 0 ELSE 1 END,
    om.created_at DESC
  LIMIT 1;

  RETURN _enrollment_id;
END;
$function$
