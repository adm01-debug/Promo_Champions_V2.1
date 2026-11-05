CREATE OR REPLACE FUNCTION public.setup_sms_mfa(p_phone text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_code text;
BEGIN
  v_code := lpad(floor(random() * 1000000)::text, 6, '0');

  INSERT INTO sms_verification_codes (user_id, phone_number, code, expires_at)
  VALUES (auth.uid(), p_phone, v_code, now() + interval '10 minutes');

  INSERT INTO user_mfa_settings (user_id, phone_number, sms_enabled, preferred_method)
  VALUES (auth.uid(), p_phone, false, 'sms')
  ON CONFLICT (user_id) DO UPDATE SET
    phone_number = p_phone,
    sms_enabled = false,
    updated_at = now();

  -- In production: send SMS via Twilio/etc with v_code
  RETURN true;
END;
$function$
