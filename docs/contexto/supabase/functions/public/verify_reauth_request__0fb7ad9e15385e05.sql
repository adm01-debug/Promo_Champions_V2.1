CREATE OR REPLACE FUNCTION public.verify_reauth_request(p_request_id uuid, p_password text DEFAULT NULL::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_request public.reauthentication_requests%ROWTYPE;
  v_iat numeric;
BEGIN
  -- p_password faz parte do contrato, mas NÃO é lido nem persistido: a senha
  -- é validada no GoTrue pelo signInWithPassword do cliente, e o reflexo
  -- server-side disso é o iat fresco do JWT verificado abaixo.
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  SELECT * INTO v_request
  FROM public.reauthentication_requests
  WHERE id = p_request_id
    AND user_id = auth.uid();

  IF NOT FOUND OR v_request.verified OR v_request.expires_at <= now() THEN
    RETURN false;
  END IF;

  v_iat := nullif(auth.jwt() ->> 'iat', '')::numeric;
  IF v_iat IS NULL OR v_iat < extract(epoch from now() - interval '5 minutes') THEN
    RETURN false;
  END IF;

  UPDATE public.reauthentication_requests
  SET verified = true,
      verified_at = now()
  WHERE id = p_request_id;

  RETURN true;
END;
$function$
