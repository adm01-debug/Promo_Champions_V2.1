
-- Fix 1: MFA Settings - restrict policies to authenticated role only
DROP POLICY IF EXISTS "Users can insert their own MFA settings" ON public.user_mfa_settings;
DROP POLICY IF EXISTS "Users can update their own MFA settings" ON public.user_mfa_settings;

CREATE POLICY "Authenticated users can insert their own MFA settings"
ON public.user_mfa_settings
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Fix 2: SMS Verification Codes - explicit deny for all roles, service_role only
DROP POLICY IF EXISTS "No direct select on sms_verification_codes" ON public.sms_verification_codes;
DROP POLICY IF EXISTS "No direct insert on sms_verification_codes" ON public.sms_verification_codes;

-- Explicit deny SELECT for authenticated
CREATE POLICY "Deny select on sms_verification_codes"
ON public.sms_verification_codes
FOR SELECT
TO authenticated
USING (false);

-- Explicit deny INSERT for authenticated
CREATE POLICY "Deny insert on sms_verification_codes"
ON public.sms_verification_codes
FOR INSERT
TO authenticated
WITH CHECK (false);

-- Explicit deny UPDATE for authenticated
CREATE POLICY "Deny update on sms_verification_codes"
ON public.sms_verification_codes
FOR UPDATE
TO authenticated
USING (false);

-- Explicit deny DELETE for authenticated
CREATE POLICY "Deny delete on sms_verification_codes"
ON public.sms_verification_codes
FOR DELETE
TO authenticated
USING (false);

-- Explicit deny for anon role too
CREATE POLICY "Deny anon select on sms_verification_codes"
ON public.sms_verification_codes
FOR SELECT
TO anon
USING (false);

CREATE POLICY "Deny anon insert on sms_verification_codes"
ON public.sms_verification_codes
FOR INSERT
TO anon
WITH CHECK (false);

CREATE POLICY "Deny anon update on sms_verification_codes"
ON public.sms_verification_codes
FOR UPDATE
TO anon
USING (false);

CREATE POLICY "Deny anon delete on sms_verification_codes"
ON public.sms_verification_codes
FOR DELETE
TO anon
USING (false);

-- Fix 3: access_denied_logs - restrict INSERT to authenticated only
DROP POLICY IF EXISTS "Authenticated users can log access denied events" ON public.access_denied_logs;

CREATE POLICY "Authenticated users can log access denied events"
ON public.access_denied_logs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
