
-- Create a safe view for public salesperson info (no email, no commission_rate)
CREATE OR REPLACE VIEW public.salespeople_public AS
SELECT id, name, avatar_url, role, is_active, auth_user_id
FROM public.salespeople;

-- Grant access to the view
GRANT SELECT ON public.salespeople_public TO authenticated;

-- Also update salespeople SELECT policy to allow reading non-sensitive columns for active users
-- This is needed because many features rely on seeing other salespeople names
DROP POLICY IF EXISTS "Users can read own full salesperson data" ON public.salespeople;

-- Allow all authenticated users to read basic fields, RLS can't restrict columns
-- So we allow full read but the view is the recommended way for listings
CREATE POLICY "Authenticated users can read salespeople"
  ON public.salespeople FOR SELECT TO authenticated
  USING (true);
