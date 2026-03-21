
-- 1. Fix rank_change_notifications - restrict to own records
DROP POLICY IF EXISTS "Authenticated users can read rank notifications" ON rank_change_notifications;
DROP POLICY IF EXISTS "Authenticated users can read rank_change_notifications" ON rank_change_notifications;

CREATE POLICY "Users can read own rank notifications" ON rank_change_notifications
  FOR SELECT TO authenticated
  USING (salesperson_id = public.get_current_salesperson_id());

-- 2. Secure salespeople_public view - it's a view, so we add security_invoker
-- First check if it's a view and recreate with security
DROP VIEW IF EXISTS salespeople_public;
CREATE VIEW salespeople_public 
WITH (security_invoker = true)
AS SELECT id, name, avatar_url, role, is_active FROM salespeople WHERE is_active = true;

-- Grant access only to authenticated
REVOKE ALL ON salespeople_public FROM anon;
GRANT SELECT ON salespeople_public TO authenticated;
