-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can subscribe to realtime" ON realtime.messages;

-- Create scoped policy: users can only subscribe to public channels or their own user channel
CREATE POLICY "Scoped realtime subscriptions"
ON realtime.messages
FOR ALL
TO authenticated
USING (
  -- Allow public broadcast channels
  topic LIKE 'public:%'
  OR
  -- Allow user-specific channels  
  topic = ('user:' || auth.uid()::text)
  OR
  -- Allow table change subscriptions (postgres_changes format)
  topic LIKE 'realtime:public:%'
)
WITH CHECK (
  topic LIKE 'public:%'
  OR
  topic = ('user:' || auth.uid()::text)
  OR
  topic LIKE 'realtime:public:%'
);
