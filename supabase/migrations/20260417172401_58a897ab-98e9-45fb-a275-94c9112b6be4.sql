-- email_bulk_jobs
CREATE TABLE public.email_bulk_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  prompt text NOT NULL,
  tone text NOT NULL DEFAULT 'consultivo',
  language text NOT NULL DEFAULT 'pt-BR',
  target_count int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft',
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE INDEX idx_email_bulk_jobs_owner ON public.email_bulk_jobs(owner_id, created_at DESC);
CREATE INDEX idx_email_bulk_jobs_status ON public.email_bulk_jobs(status);

ALTER TABLE public.email_bulk_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner can view own bulk jobs"
ON public.email_bulk_jobs FOR SELECT
USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "owner can insert own bulk jobs"
ON public.email_bulk_jobs FOR INSERT
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "owner can update own bulk jobs"
ON public.email_bulk_jobs FOR UPDATE
USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "owner can delete own bulk jobs"
ON public.email_bulk_jobs FOR DELETE
USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- email_bulk_drafts
CREATE TABLE public.email_bulk_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.email_bulk_jobs(id) ON DELETE CASCADE,
  sale_id uuid,
  client_id uuid,
  recipient_email text,
  recipient_name text,
  subject text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  personalization_notes text,
  approved boolean NOT NULL DEFAULT false,
  sent_at timestamptz,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_email_bulk_drafts_job ON public.email_bulk_drafts(job_id);
CREATE INDEX idx_email_bulk_drafts_pending ON public.email_bulk_drafts(job_id) WHERE sent_at IS NULL;

ALTER TABLE public.email_bulk_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "draft access via parent job"
ON public.email_bulk_drafts FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.email_bulk_jobs j
  WHERE j.id = email_bulk_drafts.job_id
    AND (j.owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
));

CREATE POLICY "draft insert via parent job"
ON public.email_bulk_drafts FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.email_bulk_jobs j
  WHERE j.id = email_bulk_drafts.job_id
    AND (j.owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
));

CREATE POLICY "draft update via parent job"
ON public.email_bulk_drafts FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.email_bulk_jobs j
  WHERE j.id = email_bulk_drafts.job_id
    AND (j.owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
));

CREATE POLICY "draft delete via parent job"
ON public.email_bulk_drafts FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.email_bulk_jobs j
  WHERE j.id = email_bulk_drafts.job_id
    AND (j.owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
));

-- Triggers updated_at
CREATE TRIGGER trg_email_bulk_jobs_updated
BEFORE UPDATE ON public.email_bulk_jobs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_email_bulk_drafts_updated
BEFORE UPDATE ON public.email_bulk_drafts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RPC summary
CREATE OR REPLACE FUNCTION public.get_bulk_job_summary(_job_id uuid)
RETURNS TABLE(
  total int,
  approved int,
  sent int,
  errored int,
  pending int
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COUNT(*)::int AS total,
    COUNT(*) FILTER (WHERE approved)::int AS approved,
    COUNT(*) FILTER (WHERE sent_at IS NOT NULL)::int AS sent,
    COUNT(*) FILTER (WHERE error IS NOT NULL)::int AS errored,
    COUNT(*) FILTER (WHERE approved AND sent_at IS NULL AND error IS NULL)::int AS pending
  FROM public.email_bulk_drafts
  WHERE job_id = _job_id;
$$;

GRANT EXECUTE ON FUNCTION public.get_bulk_job_summary(uuid) TO authenticated;