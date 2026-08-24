
-- Drop old public-role SELECT policies
DROP POLICY IF EXISTS "Authenticated users can read daily_challenges" ON daily_challenges;
DROP POLICY IF EXISTS "Authenticated users can read portfolio_settings" ON portfolio_settings;
DROP POLICY IF EXISTS "Authenticated users can read team_closers" ON team_closers;
DROP POLICY IF EXISTS "Authenticated users can read weekly_challenges" ON weekly_challenges;
