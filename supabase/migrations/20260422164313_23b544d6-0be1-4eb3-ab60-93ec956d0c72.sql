-- Audit trail for webhook replay actions
CREATE TABLE IF NOT EXISTS public.winloss_webhook_replay_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dead_letter_id uuid NULL REFERENCES public.winloss_webhook_dead_letters(id) ON DELETE CASCADE,
  delivery_id uuid NULL,
  source text NOT NULL CHECK (source IN ('dlq', 'delivery')),
  request_id uuid NOT NULL,
  actor_user_id uuid NOT NULL,
  actor_email text NULL,
  succeeded boolean NOT NULL,
  status_label text NOT NULL CHECK (status_label IN ('succeeded', 'failed', 'skipped')),
  http_status integer NOT NULL DEFAULT 0,
  error text NULL,
  attempts integer NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wh_replay_audit_dead_letter
  ON public.winloss_webhook_replay_audit (dead_letter_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wh_replay_audit_delivery
  ON public.winloss_webhook_replay_audit (delivery_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wh_replay_audit_request
  ON public.winloss_webhook_replay_audit (request_id);
CREATE INDEX IF NOT EXISTS idx_wh_replay_audit_created
  ON public.winloss_webhook_replay_audit (created_at DESC);

ALTER TABLE public.winloss_webhook_replay_audit ENABLE ROW LEVEL SECURITY;

-- Admins (and managers) can view audit
CREATE POLICY "Admins/Managers can view replay audit"
  ON public.winloss_webhook_replay_audit
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- Inserts only via service role from the edge function (no client policy needed)
