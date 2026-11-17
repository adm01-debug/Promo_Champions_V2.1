CREATE OR REPLACE FUNCTION public.match_reply_to_enrollment(_contact_email text, _received_at timestamp with time zone DEFAULT now())
 RETURNS uuid
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _enrollment_id uuid;
BEGIN
  IF _contact_email IS NULL OR length(trim(_contact_email)) = 0 THEN
    RETURN NULL;
  END IF;

  -- Lead: public.sales não guarda e-mail; o contato é o cliente vinculado.
  SELECT se.id INTO _enrollment_id
  FROM public.sequence_enrollments se
  JOIN public.sales s   ON s.id = se.contact_id AND se.contact_type = 'lead'
  JOIN public.clients c ON c.id = s.client_id
  WHERE lower(c.email) = lower(_contact_email)
    AND se.status IN ('active','scheduled')
    AND se.auto_paused_at IS NULL
    AND se.started_at <= _received_at
  ORDER BY se.started_at DESC
  LIMIT 1;

  IF _enrollment_id IS NOT NULL THEN
    RETURN _enrollment_id;
  END IF;

  -- Cliente: e-mail direto na própria tabela.
  SELECT se.id INTO _enrollment_id
  FROM public.sequence_enrollments se
  JOIN public.clients c ON c.id = se.contact_id AND se.contact_type = 'client'
  WHERE lower(c.email) = lower(_contact_email)
    AND se.status IN ('active','scheduled')
    AND se.auto_paused_at IS NULL
    AND se.started_at <= _received_at
  ORDER BY se.started_at DESC
  LIMIT 1;

  IF _enrollment_id IS NOT NULL THEN
    RETURN _enrollment_id;
  END IF;

  -- Contato de conta: e-mail em public.account_contacts.
  SELECT se.id INTO _enrollment_id
  FROM public.sequence_enrollments se
  JOIN public.account_contacts ac
    ON ac.id = se.contact_id AND se.contact_type = 'contact'
  WHERE lower(ac.email) = lower(_contact_email)
    AND se.status IN ('active','scheduled')
    AND se.auto_paused_at IS NULL
    AND se.started_at <= _received_at
  ORDER BY se.started_at DESC
  LIMIT 1;

  RETURN _enrollment_id;
END;
$function$
