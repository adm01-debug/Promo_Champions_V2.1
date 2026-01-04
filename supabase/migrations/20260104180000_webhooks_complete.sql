-- Webhooks System
CREATE TABLE IF NOT EXISTS webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL,
  secret TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
  attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMP WITH TIME ZONE,
  next_retry_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  webhook_event_id UUID NOT NULL REFERENCES webhook_events(id) ON DELETE CASCADE,
  response_status INTEGER,
  response_body TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes
CREATE INDEX idx_webhooks_user_id ON webhooks(user_id);
CREATE INDEX idx_webhooks_active ON webhooks(is_active) WHERE is_active = true;
CREATE INDEX idx_webhook_events_status ON webhook_events(status) WHERE status = 'pending';
CREATE INDEX idx_webhook_events_retry ON webhook_events(next_retry_at) WHERE status = 'pending';

-- RLS Policies
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own webhooks"
  ON webhooks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own webhooks"
  ON webhooks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own webhooks"
  ON webhooks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own webhooks"
  ON webhooks FOR DELETE
  USING (auth.uid() = user_id);
