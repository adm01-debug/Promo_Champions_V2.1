CREATE OR REPLACE FUNCTION public.verify_and_enable_sms(p_code text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_sms RECORD;
  v_backup_codes text[];
  v_existing_codes text[];
BEGIN
  SELECT * INTO v_sms FROM sms_verification_codes
  WHERE user_id = auth.uid() AND code = p_code AND used_at IS NULL AND expires_at > now()
  ORDER BY created_at DESC LIMIT 1;

  IF NOT FOUND THEN
    INSERT INTO mfa_verification_attempts (user_id, method, success) VALUES (auth.uid(), 'sms', false);
    RETURN false;
  END IF;

  UPDATE sms_verification_codes SET used_at = now() WHERE id = v_sms.id;

  SELECT backup_codes INTO v_existing_codes FROM user_mfa_settings WHERE user_id = auth.uid();
  IF v_existing_codes IS NULL THEN
    v_backup_codes := public.generate_mfa_backup_codes();
  ELSE
    v_backup_codes := v_existing_codes;
  END IF;

  UPDATE user_mfa_settings SET
    sms_enabled = true,
    phone_verified_at = now(),
    backup_codes = v_backup_codes,
    backup_codes_generated_at = COALESCE(backup_codes_generated_at, now()),
    updated_at = now()
  WHERE user_id = auth.uid();

  INSERT INTO mfa_verification_attempts (user_id, method, success) VALUES (auth.uid(), 'sms', true);
  RETURN true;
END;
$function$
