-- Melhoria 125 - Webhooks System
CREATE TABLE IF NOT EXISTS webhooks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL,
  secret TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_id UUID REFERENCES webhooks(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  payload JSONB NOT NULL,
  response_status INT,
  response_body TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to send webhooks
CREATE OR REPLACE FUNCTION trigger_webhook()
RETURNS TRIGGER AS $$
DECLARE
  webhook RECORD;
BEGIN
  FOR webhook IN SELECT * FROM webhooks WHERE TG_TABLE_NAME = ANY(events) AND active = true LOOP
    -- Send HTTP request (implement via Edge Function)
    PERFORM http_post(webhook.url, to_jsonb(NEW), webhook.secret);
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
