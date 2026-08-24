-- Fix CWE-284: portfolio_settings had USING(true) which exposed all rows
-- (including API tokens / webhook secrets) to every authenticated user.
--
-- New policy:
--   • Non-credential settings → all authenticated users can read
--   • Credential settings (keys matching token/secret/webhook/key/password/
--     credential/api_*) → admins only
-- The admin write policy is unchanged.

DROP POLICY IF EXISTS "Authenticated can view portfolio settings"    ON portfolio_settings;
DROP POLICY IF EXISTS "Authenticated users can read portfolio_settings" ON portfolio_settings;
DROP POLICY IF EXISTS "Anyone can view portfolio settings"            ON portfolio_settings;
DROP POLICY IF EXISTS "Everyone can read portfolio_settings"          ON portfolio_settings;
DROP POLICY IF EXISTS "Anyone can read portfolio_settings"            ON portfolio_settings;

-- Non-sensitive config settings: visible to any authenticated user
CREATE POLICY "Authenticated users can read non-sensitive portfolio settings"
  ON portfolio_settings
  FOR SELECT
  TO authenticated
  USING (
    setting_key NOT ILIKE '%token%'
    AND setting_key NOT ILIKE '%secret%'
    AND setting_key NOT ILIKE '%webhook%'
    AND setting_key NOT ILIKE '%api_key%'
    AND setting_key NOT ILIKE '%password%'
    AND setting_key NOT ILIKE '%credential%'
    AND setting_key NOT ILIKE '%private%'
  );

-- Credential and sensitive settings: admins only
CREATE POLICY "Admins can read all portfolio settings including credentials"
  ON portfolio_settings
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));
