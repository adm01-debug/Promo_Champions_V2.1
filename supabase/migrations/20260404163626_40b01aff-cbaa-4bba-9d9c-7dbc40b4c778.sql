
-- 1. Remove the duplicate public-role INSERT policy on user_mfa_settings
DROP POLICY IF EXISTS "Users can insert own MFA settings" ON public.user_mfa_settings;

-- 2. Add user_id column to notification_preferences if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'notification_preferences'
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.notification_preferences ADD COLUMN user_id uuid;
  END IF;
END $$;

-- 3. Backfill user_id from email matching salespeople.auth_user_id
UPDATE public.notification_preferences np
SET user_id = sp.auth_user_id
FROM public.salespeople sp
WHERE np.email = sp.email AND np.user_id IS NULL;

-- 4. Drop old email-based policies
DROP POLICY IF EXISTS "Users can view own notification preferences" ON public.notification_preferences;
DROP POLICY IF EXISTS "Users can update own notification preferences" ON public.notification_preferences;
DROP POLICY IF EXISTS "Users can delete own notification preferences" ON public.notification_preferences;
DROP POLICY IF EXISTS "Users can insert own notification preferences" ON public.notification_preferences;

-- 5. Create new user_id-based policies
CREATE POLICY "Users can view own notification preferences"
ON public.notification_preferences FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can update own notification preferences"
ON public.notification_preferences FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can delete own notification preferences"
ON public.notification_preferences FOR DELETE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own notification preferences"
ON public.notification_preferences FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());
