CREATE OR REPLACE FUNCTION public.get_login_lockout_status(p_email text)
 RETURNS TABLE(attempts integer, last_failed_at timestamp with time zone, lockout_until timestamp with time zone)
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
  v_last_success timestamptz;
  v_attempts integer := 0;
  v_last_failed timestamptz;
  v_recent integer := 0;
  v_recent_failed timestamptz;
  v_lockout_seconds integer;
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

  SELECT max(la.created_at)
    INTO v_last_success
    FROM public.login_attempts AS la
   WHERE lower(la.email) = v_email
     AND la.success IS TRUE
     AND (v_ip IS NULL OR la.ip_address = v_ip)
     AND la.created_at >= now() - interval '24 hours';

  SELECT count(*)::integer, max(la.created_at)
    INTO v_attempts, v_last_failed
    FROM public.login_attempts AS la
   WHERE lower(la.email) = v_email
     AND la.success IS FALSE
     AND (v_ip IS NULL OR la.ip_address = v_ip)
     AND la.created_at >= now() - interval '24 hours'
     AND (v_last_success IS NULL OR la.created_at > v_last_success);

  -- Espelha o limitador de escrita. Assim, um ataque distribuído ao mesmo
  -- e-mail (ou muitas contas pela mesma origem) não transforma a exceção de
  -- rate limit em fail-open no cliente: a consulta subsequente retorna lockout.
  SELECT count(*)::integer, max(la.created_at)
    INTO v_recent, v_recent_failed
    FROM public.login_attempts AS la
   WHERE la.success IS FALSE
     AND la.created_at >= now() - interval '1 minute'
     AND (
       lower(la.email) = v_email
       OR (v_ip IS NOT NULL AND la.ip_address = v_ip)
     );

  IF v_recent >= 10 THEN
    v_attempts := GREATEST(v_attempts, v_recent);
    v_last_failed := GREATEST(v_last_failed, v_recent_failed);
  END IF;

  IF v_attempts >= 5 AND v_last_failed IS NOT NULL THEN
    v_lockout_seconds := LEAST(
      3600,
      30 * power(2::numeric, LEAST(10, floor(v_attempts / 5.0)::integer - 1))::integer
    );
  END IF;

  RETURN QUERY
  SELECT v_attempts,
         v_last_failed,
         CASE
           WHEN v_lockout_seconds IS NULL THEN NULL::timestamptz
           ELSE v_last_failed + make_interval(secs => v_lockout_seconds)
         END;
END;
$function$
