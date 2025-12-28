-- Melhoria 125 - Webhooks System

CREATE TABLE IF NOT EXISTS webhooks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL,
  secret TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_id UUID REFERENCES webhooks(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  payload JSONB NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_webhook_logs_webhook ON webhook_logs(webhook_id, created_at DESC);

-- Trigger to send webhooks
CREATE OR REPLACE FUNCTION send_webhook()
RETURNS TRIGGER AS $$
DECLARE
  webhook_record RECORD;
  payload JSONB;
BEGIN
  payload := jsonb_build_object(
    'event', TG_OP,
    'table', TG_TABLE_NAME,
    'data', to_jsonb(NEW),
    'old_data', to_jsonb(OLD),
    'timestamp', NOW()
  );

  FOR webhook_record IN 
    SELECT * FROM webhooks 
    WHERE is_active = TRUE 
    AND TG_TABLE_NAME = ANY(events)
  LOOP
    -- Call Edge Function to send webhook
    PERFORM net.http_post(
      url := webhook_record.url,
      headers := jsonb_build_object('X-Webhook-Secret', webhook_record.secret),
      body := payload::text
    );
  END LOOP;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply to deals table
CREATE TRIGGER webhook_deals 
  AFTER INSERT OR UPDATE ON deals
  FOR EACH ROW 
  EXECUTE FUNCTION send_webhook();
