
ALTER TABLE public.churn_alert_settings
  ADD COLUMN IF NOT EXISTS email_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS email_from text,
  ADD COLUMN IF NOT EXISTS email_reply_to text,
  ADD COLUMN IF NOT EXISTS email_recipients text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS email_subject_template text NOT NULL DEFAULT '[Churn] Cliente {{client_name}} em risco {{level}}',
  ADD COLUMN IF NOT EXISTS email_provider text NOT NULL DEFAULT 'lovable';
