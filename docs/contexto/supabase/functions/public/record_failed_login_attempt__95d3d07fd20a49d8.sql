CREATE OR REPLACE FUNCTION public.record_failed_login_attempt(p_email text, p_failure_reason text DEFAULT NULL::text, p_user_agent text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_email text := lower(trim(COALESCE(p_email, '')));
  v_headers jsonb := COALESCE(
    NULLIF(current_setting('request.headers', true), '')::jsonb,
    '{}'::jsonb
  );
  v_ip text;
  v_recent integer;
BEGIN
  IF length(v_email) < 3
     OR length(v_email) > 320
     OR v_email !~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$' THEN
    RAISE EXCEPTION 'email_invalid' USING ERRCODE = '22023';
  END IF;

  v_ip := left(trim(split_part(COALESCE(
    v_headers ->> 'cf-connecting-ip',
    v_headers ->> 'x-forwarded-for',
    v_headers ->> 'x-real-ip',
    ''
  ), ',', 1)), 64);
  IF v_ip = '' THEN
    v_ip := NULL;
  ELSE
    BEGIN
      v_ip := host(v_ip::inet);
    EXCEPTION WHEN invalid_text_representation THEN
      v_ip := NULL;
    END;
  END IF;

  SELECT count(*)::integer
    INTO v_recent
    FROM public.login_attempts AS la
   WHERE la.created_at >= now() - interval '1 minute'
     AND (
       lower(la.email) = v_email
       OR (v_ip IS NOT NULL AND la.ip_address = v_ip)
     );

  IF v_recent >= 10 THEN
    RAISE EXCEPTION 'rate_limit_exceeded' USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO public.login_attempts (
    email, ip_address, user_agent, success, failure_reason, created_at
  ) VALUES (
    v_email,
    v_ip,
    left(NULLIF(p_user_agent, ''), 500),
    false,
    left(NULLIF(p_failure_reason, ''), 200),
    now()
  );
END;
$function$
