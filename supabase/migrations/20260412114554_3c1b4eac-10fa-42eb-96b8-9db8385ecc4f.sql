-- Drop and recreate with tighter scope
DROP POLICY IF EXISTS "Scoped realtime subscriptions" ON realtime.messages;

CREATE POLICY "Scoped realtime subscriptions"
ON realtime.messages
FOR ALL
TO authenticated
USING (
  -- postgres_changes events (RLS on source tables applies)
  topic LIKE 'realtime:public:%'
  OR
  -- user-specific private channels
  topic = ('user:' || auth.uid()::text)
  OR
  -- presence channels scoped to user
  topic = ('presence:' || auth.uid()::text)
)
WITH CHECK (
  topic LIKE 'realtime:public:%'
  OR
  topic = ('user:' || auth.uid()::text)
  OR
  topic = ('presence:' || auth.uid()::text)
);
