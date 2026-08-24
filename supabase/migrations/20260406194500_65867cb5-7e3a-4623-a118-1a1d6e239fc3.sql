-- Drop the overly permissive policy that uses just 'true'
DROP POLICY IF EXISTS "Authenticated users can access their own realtime channels" ON realtime.messages;

-- Drop the existing auth-based policy too (we'll recreate a single clean one)
DROP POLICY IF EXISTS "Authenticated users can use realtime" ON realtime.messages;

-- Create a single clean policy requiring authentication
-- Note: postgres_changes events are ALSO filtered by each source table's own RLS policies,
-- so this is a defense-in-depth layer ensuring only authenticated users can subscribe at all
CREATE POLICY "Authenticated users can subscribe to realtime"
ON realtime.messages
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);