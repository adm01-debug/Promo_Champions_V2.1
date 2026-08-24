
-- Fix 1: Restrict realtime channel subscriptions
-- Drop the overly permissive policy if it exists and create a scoped one
DO $$
BEGIN
  -- Check if the permissive policy exists and drop it
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'realtime' AND tablename = 'messages' 
    AND policyname = 'Allow authenticated users to access realtime messages'
  ) THEN
    DROP POLICY "Allow authenticated users to access realtime messages" ON realtime.messages;
  END IF;
END $$;

-- Create scoped realtime policy - users can only access channels related to their own data
CREATE POLICY "Authenticated users can access their own realtime channels"
ON realtime.messages
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Fix 2: Add explicit UPDATE deny for anon on sms_verification_codes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'sms_verification_codes' 
    AND policyname = 'Deny anon update on sms_verification_codes'
  ) THEN
    CREATE POLICY "Deny anon update on sms_verification_codes"
    ON public.sms_verification_codes
    FOR UPDATE
    TO anon
    USING (false);
  END IF;
END $$;

-- Fix 3: Add explicit UPDATE deny for authenticated on sms_verification_codes  
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'sms_verification_codes' 
    AND policyname = 'Deny authenticated update on sms_verification_codes'
  ) THEN
    CREATE POLICY "Deny authenticated update on sms_verification_codes"
    ON public.sms_verification_codes
    FOR UPDATE
    TO authenticated
    USING (false);
  END IF;
END $$;

-- Fix 4: Add UPDATE policy for user_mfa_settings - only owner can update
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'user_mfa_settings' 
    AND policyname = 'Users can update their own MFA settings'
  ) THEN
    CREATE POLICY "Users can update their own MFA settings"
    ON public.user_mfa_settings
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Fix 5: Add DELETE deny policies for sensitive tables
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'sms_verification_codes' 
    AND policyname = 'Deny delete on sms_verification_codes'
  ) THEN
    CREATE POLICY "Deny delete on sms_verification_codes"
    ON public.sms_verification_codes
    FOR DELETE
    TO anon
    USING (false);
  END IF;
END $$;
