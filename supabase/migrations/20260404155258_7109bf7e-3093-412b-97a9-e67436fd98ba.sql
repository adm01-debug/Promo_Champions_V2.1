
-- Fix 1: MFA Settings - Remove direct UPDATE, replace with RPC
DROP POLICY IF EXISTS "Users can update their own MFA settings" ON public.user_mfa_settings;

-- Create secure RPC for MFA updates
CREATE OR REPLACE FUNCTION public.update_user_mfa_settings(
  p_totp_enabled BOOLEAN DEFAULT NULL,
  p_sms_enabled BOOLEAN DEFAULT NULL,
  p_preferred_method TEXT DEFAULT NULL,
  p_totp_secret TEXT DEFAULT NULL,
  p_backup_codes TEXT[] DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Validate preferred_method
  IF p_preferred_method IS NOT NULL AND p_preferred_method NOT IN ('totp', 'sms', 'none') THEN
    RAISE EXCEPTION 'Invalid preferred_method. Must be totp, sms, or none.';
  END IF;

  -- Upsert the MFA settings
  INSERT INTO public.user_mfa_settings (user_id, totp_enabled, sms_enabled, preferred_method, totp_secret, backup_codes)
  VALUES (
    v_user_id,
    COALESCE(p_totp_enabled, false),
    COALESCE(p_sms_enabled, false),
    COALESCE(p_preferred_method, 'none'),
    p_totp_secret,
    p_backup_codes
  )
  ON CONFLICT (user_id) DO UPDATE SET
    totp_enabled = COALESCE(p_totp_enabled, user_mfa_settings.totp_enabled),
    sms_enabled = COALESCE(p_sms_enabled, user_mfa_settings.sms_enabled),
    preferred_method = COALESCE(p_preferred_method, user_mfa_settings.preferred_method),
    totp_secret = CASE WHEN p_totp_secret IS NOT NULL THEN p_totp_secret ELSE user_mfa_settings.totp_secret END,
    backup_codes = CASE WHEN p_backup_codes IS NOT NULL THEN p_backup_codes ELSE user_mfa_settings.backup_codes END,
    updated_at = now();

  RETURN TRUE;
END;
$$;
