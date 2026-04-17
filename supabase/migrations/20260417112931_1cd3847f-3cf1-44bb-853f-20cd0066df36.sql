-- 1. channel_credentials
CREATE TABLE IF NOT EXISTS public.channel_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  channel text NOT NULL CHECK (channel IN ('whatsapp','sms')),
  provider text NOT NULL CHECK (provider IN ('twilio','meta_cloud','zapi','messagebird')),
  label text,
  credentials jsonb NOT NULL DEFAULT '{}'::jsonb,
  from_number text,
  enabled boolean NOT NULL DEFAULT true,
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_channel_credentials_owner ON public.channel_credentials(owner_id, channel, enabled);

ALTER TABLE public.channel_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view their credentials"
  ON public.channel_credentials FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Owners can insert their credentials"
  ON public.channel_credentials FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update their credentials"
  ON public.channel_credentials FOR UPDATE TO authenticated
  USING (owner_id = auth.uid() OR public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Owners can delete their credentials"
  ON public.channel_credentials FOR DELETE TO authenticated
  USING (owner_id = auth.uid() OR public.is_admin_or_manager(auth.uid()));

CREATE TRIGGER trg_channel_credentials_updated_at
  BEFORE UPDATE ON public.channel_credentials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. outbound_messages
CREATE TABLE IF NOT EXISTS public.outbound_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  enrollment_id uuid REFERENCES public.sequence_enrollments(id) ON DELETE SET NULL,
  step_id uuid REFERENCES public.sequence_steps(id) ON DELETE SET NULL,
  channel text NOT NULL CHECK (channel IN ('whatsapp','sms')),
  provider text NOT NULL,
  to_number text NOT NULL,
  body text,
  template_id text,
  provider_message_id text,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','sent','delivered','read','failed')),
  error text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  sent_at timestamptz,
  delivered_at timestamptz,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_outbound_messages_owner ON public.outbound_messages(owner_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_outbound_messages_enrollment ON public.outbound_messages(enrollment_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_outbound_messages_provider_msg ON public.outbound_messages(provider_message_id) WHERE provider_message_id IS NOT NULL;

ALTER TABLE public.outbound_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view their outbound messages"
  ON public.outbound_messages FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Owners can insert their outbound messages"
  ON public.outbound_messages FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid() OR public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Owners can update their outbound messages"
  ON public.outbound_messages FOR UPDATE TO authenticated
  USING (owner_id = auth.uid() OR public.is_admin_or_manager(auth.uid()));

CREATE TRIGGER trg_outbound_messages_updated_at
  BEFORE UPDATE ON public.outbound_messages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. sequence_steps.whatsapp_template_id
ALTER TABLE public.sequence_steps
  ADD COLUMN IF NOT EXISTS whatsapp_template_id text;

-- 4. RPC record_outbound_message
CREATE OR REPLACE FUNCTION public.record_outbound_message(
  _owner_id uuid,
  _enrollment_id uuid,
  _step_id uuid,
  _channel text,
  _to text,
  _body text,
  _provider text,
  _provider_msg_id text,
  _status text,
  _error text DEFAULT NULL,
  _template_id text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.outbound_messages
    (owner_id, enrollment_id, step_id, channel, provider, to_number, body, template_id, provider_message_id, status, error, sent_at)
  VALUES
    (_owner_id, _enrollment_id, _step_id, _channel, _provider, _to, _body, _template_id, _provider_msg_id,
     COALESCE(_status, 'queued'), _error,
     CASE WHEN _status IN ('sent','delivered','read') THEN now() ELSE NULL END)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;