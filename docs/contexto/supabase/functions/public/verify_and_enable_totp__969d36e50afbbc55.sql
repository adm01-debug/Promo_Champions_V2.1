CREATE OR REPLACE FUNCTION public.verify_and_enable_totp(p_token text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_secret text;
  v_is_valid boolean := false;
  v_backup_codes text[];
  v_secret_bytes bytea;
  v_time_step bigint;
  v_counter bytea;
  v_hmac bytea;
  v_offset int;
  v_code int;
  v_expected text;
  v_i int;
  -- Base32 decode vars
  v_base32_chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  v_bits text := '';
  v_char_idx int;
  v_byte_arr bytea := E'\\x';
  v_bit_pos int;
  v_byte_val int;
  v_decoded bytea;
BEGIN
  SELECT totp_secret INTO v_secret FROM user_mfa_settings WHERE user_id = auth.uid();
  
  IF v_secret IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'TOTP not initialized');
  END IF;

  -- Basic format check first
  IF length(p_token) != 6 OR p_token !~ '^\d+$' THEN
    INSERT INTO mfa_verification_attempts (user_id, method, success, user_agent)
    VALUES (auth.uid(), 'totp', false, null);
    RETURN jsonb_build_object('success', false, 'error', 'Invalid code');
  END IF;

  -- Base32 decode the secret
  v_bits := '';
  FOR v_i IN 1..length(v_secret) LOOP
    v_char_idx := position(substr(v_secret, v_i, 1) in v_base32_chars) - 1;
    IF v_char_idx >= 0 THEN
      v_bits := v_bits || lpad(v_char_idx::bit(5)::text, 5, '0');
    END IF;
  END LOOP;
  
  -- Convert bits to bytes
  v_decoded := E'\\x'::bytea;
  FOR v_i IN 0..((length(v_bits) / 8) - 1) LOOP
    v_byte_val := 0;
    FOR v_bit_pos IN 0..7 LOOP
      IF substr(v_bits, v_i * 8 + v_bit_pos + 1, 1) = '1' THEN
        v_byte_val := v_byte_val + (1 << (7 - v_bit_pos));
      END IF;
    END LOOP;
    v_decoded := v_decoded || set_byte(E'\\x00'::bytea, 0, v_byte_val);
  END LOOP;

  v_secret_bytes := v_decoded;

  -- Try current time step and ±1 for clock skew tolerance
  FOR v_i IN -1..1 LOOP
    v_time_step := (extract(epoch from now())::bigint / 30) + v_i;
    
    -- Encode time step as 8-byte big-endian
    v_counter := E'\\x0000000000000000'::bytea;
    v_counter := set_byte(v_counter, 7, (v_time_step & 255)::int);
    v_counter := set_byte(v_counter, 6, ((v_time_step >> 8) & 255)::int);
    v_counter := set_byte(v_counter, 5, ((v_time_step >> 16) & 255)::int);
    v_counter := set_byte(v_counter, 4, ((v_time_step >> 24) & 255)::int);
    
    -- HMAC-SHA1
    v_hmac := hmac(v_counter, v_secret_bytes, 'sha1');
    
    -- Dynamic truncation (RFC 4226)
    v_offset := get_byte(v_hmac, 19) & 15;
    v_code := ((get_byte(v_hmac, v_offset) & 127) << 24)
            | (get_byte(v_hmac, v_offset + 1) << 16)
            | (get_byte(v_hmac, v_offset + 2) << 8)
            | get_byte(v_hmac, v_offset + 3);
    v_code := v_code % 1000000;
    
    v_expected := lpad(v_code::text, 6, '0');
    
    IF p_token = v_expected THEN
      v_is_valid := true;
      EXIT;
    END IF;
  END LOOP;

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
$function$
