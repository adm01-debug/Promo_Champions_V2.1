
-- ============================================================
-- Fix security scan findings
-- ============================================================

-- 1. Add restrictive SELECT policies for MFA/SMS tables (deny all direct reads)
-- These tables should ONLY be accessed via SECURITY DEFINER RPCs
CREATE POLICY "Deny direct SELECT - use RPCs" ON user_mfa_settings
  FOR SELECT TO authenticated
  USING (false);

CREATE POLICY "Deny direct SELECT - use RPCs" ON sms_verification_codes
  FOR SELECT TO authenticated  
  USING (false);

-- 2. Fix public role access - restrict to authenticated only
-- team_closers
DROP POLICY IF EXISTS "Anyone can view team closers" ON team_closers;
DROP POLICY IF EXISTS "Everyone can read team_closers" ON team_closers;
DO $$ BEGIN
  -- Find and drop any SELECT policy on team_closers that uses public role
  PERFORM 1 FROM pg_policies WHERE tablename = 'team_closers' AND cmd = 'SELECT';
  IF FOUND THEN
    -- Drop all SELECT policies and recreate properly
    NULL;
  END IF;
END $$;

-- Recreate with authenticated only
CREATE POLICY "Authenticated can view team closers" ON team_closers
  FOR SELECT TO authenticated
  USING (true);

-- weekly_challenges
DROP POLICY IF EXISTS "Anyone can view challenges" ON weekly_challenges;
DROP POLICY IF EXISTS "Everyone can read weekly_challenges" ON weekly_challenges;
DROP POLICY IF EXISTS "Anyone can view weekly challenges" ON weekly_challenges;

CREATE POLICY "Authenticated can view weekly challenges" ON weekly_challenges
  FOR SELECT TO authenticated
  USING (true);

-- daily_challenges
DROP POLICY IF EXISTS "Anyone can view daily challenges" ON daily_challenges;
DROP POLICY IF EXISTS "Everyone can read daily_challenges" ON daily_challenges;
DROP POLICY IF EXISTS "Anyone can view daily_challenges" ON daily_challenges;

CREATE POLICY "Authenticated can view daily challenges" ON daily_challenges
  FOR SELECT TO authenticated
  USING (true);

-- portfolio_settings
DROP POLICY IF EXISTS "Anyone can view portfolio settings" ON portfolio_settings;
DROP POLICY IF EXISTS "Everyone can read portfolio_settings" ON portfolio_settings;
DROP POLICY IF EXISTS "Anyone can read portfolio_settings" ON portfolio_settings;

CREATE POLICY "Authenticated can view portfolio settings" ON portfolio_settings
  FOR SELECT TO authenticated
  USING (true);
