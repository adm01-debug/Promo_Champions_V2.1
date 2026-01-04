-- Webhooks System
CREATE TABLE IF NOT EXISTS webhooks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  secret TEXT NOT NULL,
  events TEXT[] NOT NULL DEFAULT '{}',
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_id UUID REFERENCES webhooks(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  request_body JSONB,
  response_status INTEGER,
  response_body JSONB,
  error_message TEXT,
  attempt INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- Policies for webhooks
CREATE POLICY "Admins can manage webhooks"
  ON webhooks
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Policies for webhook logs
CREATE POLICY "Admins can view webhook logs"
  ON webhook_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_webhooks_enabled ON webhooks(enabled);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_webhook_id ON webhook_logs(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_status ON webhook_logs(status);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at ON webhook_logs(created_at DESC);
