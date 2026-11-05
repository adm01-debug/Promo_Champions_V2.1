CREATE OR REPLACE FUNCTION public.record_successful_login_attempt(p_user_agent text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_email text := lower(trim(COALESCE(auth.jwt() ->> 'email', '')));
  v_headers jsonb := COALESCE(
    NULLIF(current_setting('request.headers', true), '')::jsonb,
    '{}'::jsonb
  );
  v_ip text;
BEGIN
  IF auth.uid() IS NULL OR v_email = '' THEN
    RAISE EXCEPTION 'not_authenticated' USING ERRCODE = '28000';
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

  INSERT INTO public.login_attempts (
    email, ip_address, user_agent, success, failure_reason, created_at
  ) VALUES (
    v_email,
    v_ip,
    left(NULLIF(p_user_agent, ''), 500),
    true,
    NULL,
    now()
  );
END;
$function$
