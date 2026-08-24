CREATE TABLE IF NOT EXISTS public.winloss_webhook_replay_invocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id text NOT NULL,
  actor_user_id uuid NOT NULL,
  actor_email text NULL,
  source text NOT NULL CHECK (source IN ('dlq','delivery')),
  item_count integer NOT NULL DEFAULT 0,
  succeeded_count integer NOT NULL DEFAULT 0,
  failed_count integer NOT NULL DEFAULT 0,
  skipped_count integer NOT NULL DEFAULT 0,
  duration_ms integer NULL,
  ids uuid[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wh_replay_inv_actor
  ON public.winloss_webhook_replay_invocations (actor_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wh_replay_inv_request
  ON public.winloss_webhook_replay_invocations (request_id);
CREATE INDEX IF NOT EXISTS idx_wh_replay_inv_created
  ON public.winloss_webhook_replay_invocations (created_at DESC);

ALTER TABLE public.winloss_webhook_replay_invocations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins/Managers can view replay invocations"
  ON public.winloss_webhook_replay_invocations
  FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'manager'::public.app_role)
  );