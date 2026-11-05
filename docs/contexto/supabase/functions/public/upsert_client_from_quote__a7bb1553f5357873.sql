CREATE OR REPLACE FUNCTION public.upsert_client_from_quote(p_name text, p_email text, p_phone text, p_company text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_client_id UUID;
BEGIN
  IF p_email IS NOT NULL AND length(trim(p_email)) > 0 THEN
    SELECT id INTO v_client_id
    FROM public.clients
    WHERE lower(email) = lower(trim(p_email))
      AND deleted_at IS NULL
    LIMIT 1;
  END IF;

  IF v_client_id IS NULL AND p_phone IS NOT NULL AND length(trim(p_phone)) > 0 THEN
    SELECT id INTO v_client_id
    FROM public.clients
    WHERE regexp_replace(phone, '\D', '', 'g') = regexp_replace(p_phone, '\D', '', 'g')
      AND deleted_at IS NULL
    LIMIT 1;
  END IF;

  IF v_client_id IS NULL THEN
    BEGIN
      INSERT INTO public.clients (name, email, phone, company, lead_source)
      VALUES (
        COALESCE(NULLIF(trim(p_name), ''), 'Cliente sem nome'),
        NULLIF(trim(p_email), ''),
        NULLIF(trim(p_phone), ''),
        NULLIF(trim(p_company), ''),
        'gift_store_quote'
      )
      RETURNING id INTO v_client_id;
    EXCEPTION WHEN unique_violation THEN
      -- Corrida: outra transação inseriu o mesmo e-mail primeiro.
      SELECT id INTO v_client_id
      FROM public.clients
      WHERE lower(email) = lower(trim(p_email))
        AND deleted_at IS NULL
      LIMIT 1;
      IF v_client_id IS NULL THEN
        RAISE; -- violação em outra constraint: propaga o erro original
      END IF;
    END;
  ELSE
    UPDATE public.clients
    SET
      name = COALESCE(NULLIF(trim(p_name), ''), name),
      phone = COALESCE(NULLIF(trim(p_phone), ''), phone),
      company = COALESCE(NULLIF(trim(p_company), ''), company),
      last_interaction_at = now()
    WHERE id = v_client_id;
  END IF;

  RETURN v_client_id;
END;
$function$
