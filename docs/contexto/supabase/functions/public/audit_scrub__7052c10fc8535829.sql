CREATE OR REPLACE FUNCTION public.audit_scrub(p_data jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO 'public'
AS $function$
DECLARE
  sensitive_exact TEXT[] := ARRAY[
    'password', 'password_hash', 'hashed_password', 'passphrase',
    'token', 'access_token', 'refresh_token', 'id_token',
    'api_key', 'apikey', 'secret', 'client_secret',
    'mfa_secret', 'totp_secret', 'otp', 'otp_code',
    'authorization', 'cookie', 'session_id', 'session',
    'private_key', 'service_role_key', 'anon_key', 'jwt',
    'credit_card', 'card_number', 'cvv', 'cpf'
  ];
  k TEXT;
  v JSONB;
  result JSONB := '{}'::jsonb;
BEGIN
  IF p_data IS NULL OR jsonb_typeof(p_data) <> 'object' THEN
    RETURN p_data;
  END IF;

  FOR k, v IN SELECT key, value FROM jsonb_each(p_data) LOOP
    IF lower(k) = ANY (sensitive_exact)
       OR lower(k) LIKE '%\_token' ESCAPE '\'
       OR lower(k) LIKE '%\_secret' ESCAPE '\'
       OR lower(k) LIKE '%password%' THEN
      result := result || jsonb_build_object(k, '[REDACTED]');
    ELSIF jsonb_typeof(v) = 'object' THEN
      result := result || jsonb_build_object(k, public.audit_scrub(v));
    ELSE
      result := result || jsonb_build_object(k, v);
    END IF;
  END LOOP;

  RETURN result;
END;
$function$
