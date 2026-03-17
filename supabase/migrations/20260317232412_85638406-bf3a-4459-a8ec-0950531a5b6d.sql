
-- Fix get_mfa_status with correct columns
CREATE OR REPLACE FUNCTION public.get_mfa_status()
RETURNS TABLE(totp_enabled boolean, sms_enabled boolean, preferred_method text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT totp_enabled, sms_enabled, preferred_method
  FROM user_mfa_settings
  WHERE user_id = auth.uid()
$$;
