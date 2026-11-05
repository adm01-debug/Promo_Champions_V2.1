CREATE OR REPLACE FUNCTION public.initialize_totp(p_email text)
 RETURNS TABLE(qr_url text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_secret text;
  v_chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  v_i integer;
BEGIN
  v_secret := '';
  FOR v_i IN 1..32 LOOP
    v_secret := v_secret || substr(v_chars, floor(random() * 32 + 1)::int, 1);
  END LOOP;

  INSERT INTO user_mfa_settings (user_id, totp_secret, totp_enabled, preferred_method)
  VALUES (auth.uid(), v_secret, false, 'totp')
  ON CONFLICT (user_id) DO UPDATE SET
    totp_secret = v_secret,
    totp_enabled = false,
    updated_at = now();

  RETURN QUERY SELECT
    'otpauth://totp/SalesArena:' || p_email || '?secret=' || v_secret || '&issuer=SalesArena&algorithm=SHA1&digits=6&period=30';
END;
$function$
