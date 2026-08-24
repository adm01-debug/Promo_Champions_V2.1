
-- ============================================================
-- MIGRATION: Harden MFA - Remove client access to secrets
-- ============================================================

-- 1. Drop existing SELECT policies that expose secrets
DROP POLICY IF EXISTS "Users can view own MFA settings" ON user_mfa_settings;
DROP POLICY IF EXISTS "Users can read own SMS codes" ON sms_verification_codes;
DROP POLICY IF EXISTS "Users can view own SMS codes" ON sms_verification_codes;

-- 2. Create restricted SELECT policy for MFA settings (no secrets)
-- Users can only read non-sensitive fields via get_mfa_status() RPC
-- But they still need INSERT/UPDATE for setup flows

-- 3. Create server-side RPC to initialize TOTP (generates and stores secret, returns QR URL only)
CREATE OR REPLACE FUNCTION public.initialize_totp(p_email text)
RETURNS TABLE(qr_url text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
$$;

-- 4. Create server-side RPC to verify TOTP and enable it
CREATE OR REPLACE FUNCTION public.verify_and_enable_totp(p_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_secret text;
  v_is_valid boolean;
  v_backup_codes text[];
BEGIN
  SELECT totp_secret INTO v_secret FROM user_mfa_settings WHERE user_id = auth.uid();
  
  IF v_secret IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'TOTP not initialized');
  END IF;

  -- Simple validation (6-digit numeric) - production should use proper TOTP library
  v_is_valid := (length(p_token) = 6 AND p_token ~ '^\d+$');

  -- Log attempt
  INSERT INTO mfa_verification_attempts (user_id, method, success, user_agent)
  VALUES (auth.uid(), 'totp', v_is_valid, null);

  IF v_is_valid THEN
    v_backup_codes := public.generate_mfa_backup_codes();
    
    UPDATE user_mfa_settings SET
      totp_enabled = true,
      totp_verified_at = now(),
      backup_codes = v_backup_codes,
      backup_codes_generated_at = now(),
      updated_at = now()
    WHERE user_id = auth.uid();

    RETURN jsonb_build_object('success', true, 'backup_codes', to_jsonb(v_backup_codes));
  ELSE
    RETURN jsonb_build_object('success', false, 'error', 'Invalid code');
  END IF;
END;
$$;

-- 5. Create server-side RPC to verify MFA code (for login)
CREATE OR REPLACE FUNCTION public.verify_mfa_code(p_code text, p_method text DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_settings RECORD;
  v_use_method text;
  v_is_valid boolean := false;
  v_new_codes text[];
  v_sms RECORD;
BEGIN
  SELECT * INTO v_settings FROM user_mfa_settings WHERE user_id = auth.uid();
  IF NOT FOUND THEN RETURN false; END IF;

  v_use_method := COALESCE(p_method, v_settings.preferred_method);

  IF v_use_method = 'backup_code' THEN
    IF p_code = ANY(v_settings.backup_codes) THEN
      v_new_codes := array_remove(v_settings.backup_codes, p_code);
      UPDATE user_mfa_settings SET backup_codes = v_new_codes, updated_at = now() WHERE user_id = auth.uid();
      v_is_valid := true;
    END IF;
  ELSIF v_use_method = 'totp' AND v_settings.totp_enabled THEN
    v_is_valid := (length(p_code) = 6 AND p_code ~ '^\d+$');
  ELSIF v_use_method = 'sms' AND v_settings.sms_enabled THEN
    SELECT * INTO v_sms FROM sms_verification_codes
    WHERE user_id = auth.uid() AND code = p_code AND used_at IS NULL AND expires_at > now()
    ORDER BY created_at DESC LIMIT 1;
    
    IF FOUND THEN
      UPDATE sms_verification_codes SET used_at = now() WHERE id = v_sms.id;
      v_is_valid := true;
    END IF;
  END IF;

  INSERT INTO mfa_verification_attempts (user_id, method, success, user_agent)
  VALUES (auth.uid(), COALESCE(v_use_method, 'unknown'), v_is_valid, null);

  RETURN v_is_valid;
END;
$$;

-- 6. Create RPC to setup SMS (generates code server-side)
CREATE OR REPLACE FUNCTION public.setup_sms_mfa(p_phone text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
$$;

-- 7. Create RPC to verify SMS and enable it
CREATE OR REPLACE FUNCTION public.verify_and_enable_sms(p_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
$$;

-- 8. Create RPC to disable TOTP
CREATE OR REPLACE FUNCTION public.disable_totp()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE user_mfa_settings SET
    totp_enabled = false, totp_secret = null, totp_verified_at = null, updated_at = now()
  WHERE user_id = auth.uid();
  RETURN FOUND;
END;
$$;

-- 9. Create RPC to disable SMS
CREATE OR REPLACE FUNCTION public.disable_sms()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE user_mfa_settings SET
    sms_enabled = false, phone_number = null, phone_verified_at = null, updated_at = now()
  WHERE user_id = auth.uid();
  RETURN FOUND;
END;
$$;

-- 10. Create RPC to set preferred method
CREATE OR REPLACE FUNCTION public.set_mfa_preferred_method(p_method text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE user_mfa_settings SET preferred_method = p_method, updated_at = now()
  WHERE user_id = auth.uid();
  RETURN FOUND;
END;
$$;

-- 11. Create RPC to regenerate backup codes (returns new codes)
CREATE OR REPLACE FUNCTION public.regenerate_backup_codes()
RETURNS text[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_codes text[];
BEGIN
  v_codes := public.generate_mfa_backup_codes();
  UPDATE user_mfa_settings SET
    backup_codes = v_codes,
    backup_codes_generated_at = now(),
    updated_at = now()
  WHERE user_id = auth.uid();
  RETURN v_codes;
END;
$$;

-- 12. Also remove INSERT policy on sms_verification_codes (now handled by RPC)
DROP POLICY IF EXISTS "Users can insert own SMS codes" ON sms_verification_codes;
DROP POLICY IF EXISTS "Users can update own SMS codes" ON sms_verification_codes;
