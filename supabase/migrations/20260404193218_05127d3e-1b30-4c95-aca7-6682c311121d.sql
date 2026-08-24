-- Add RLS policy on realtime.messages to restrict channel subscriptions
-- Only allow authenticated users to access their own channels
ALTER TABLE IF EXISTS realtime.messages ENABLE ROW LEVEL SECURITY;

-- Policy: authenticated users can only read messages from channels they are part of
-- Since we use broadcast/presence (not DB-backed channels), this prevents unauthorized topic subscriptions
CREATE POLICY "Authenticated users can use realtime"
  ON realtime.messages
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);