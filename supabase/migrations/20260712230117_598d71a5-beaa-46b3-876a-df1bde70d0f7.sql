-- Entrega 3/4: fila assíncrona idempotente para inserts em call_recordings.

-- 1) Dedupe físico em call_recordings
CREATE UNIQUE INDEX IF NOT EXISTS call_recordings_uniq_sp_audio
  ON public.call_recordings (salesperson_id, audio_url)
  WHERE audio_url IS NOT NULL;

-- 2) Tabela da fila
CREATE TABLE IF NOT EXISTS public.call_recording_ingest_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  idempotency_key TEXT NOT NULL UNIQUE,
  recording_id UUID NOT NULL,
  salesperson_id UUID NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','processing','succeeded','failed','dead_letter')),
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 5,
  next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  locked_at TIMESTAMPTZ,
  locked_by TEXT,
  last_error TEXT,
  last_error_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS call_recording_ingest_jobs_pending_idx
  ON public.call_recording_ingest_jobs (status, next_attempt_at)
  WHERE status IN ('pending','processing');

CREATE INDEX IF NOT EXISTS call_recording_ingest_jobs_salesperson_idx
  ON public.call_recording_ingest_jobs (salesperson_id, created_at DESC);

-- 3) GRANTs
GRANT SELECT, INSERT ON public.call_recording_ingest_jobs TO authenticated;
GRANT ALL ON public.call_recording_ingest_jobs TO service_role;

-- 4) RLS
ALTER TABLE public.call_recording_ingest_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "salesperson_can_read_own_ingest_jobs"
  ON public.call_recording_ingest_jobs FOR SELECT
  TO authenticated
  USING (
    salesperson_id IN (SELECT id FROM public.salespeople WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "salesperson_can_enqueue_own_ingest_jobs"
  ON public.call_recording_ingest_jobs FOR INSERT
  TO authenticated
  WITH CHECK (
    salesperson_id IN (SELECT id FROM public.salespeople WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "admin_can_read_all_ingest_jobs"
  ON public.call_recording_ingest_jobs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 5) updated_at trigger
CREATE TRIGGER call_recording_ingest_jobs_updated_at
  BEFORE UPDATE ON public.call_recording_ingest_jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6) Dequeue atômico (FOR UPDATE SKIP LOCKED)
CREATE OR REPLACE FUNCTION public.dequeue_call_recording_ingest_jobs(
  _batch_size INTEGER DEFAULT 10,
  _worker_id  TEXT    DEFAULT 'edge-worker'
)
RETURNS SETOF public.call_recording_ingest_jobs
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  UPDATE public.call_recording_ingest_jobs j
     SET status     = 'processing',
         attempts   = j.attempts + 1,
         locked_at  = now(),
         locked_by  = _worker_id,
         updated_at = now()
   WHERE j.id IN (
     SELECT id
       FROM public.call_recording_ingest_jobs
      WHERE status IN ('pending','processing')
        AND next_attempt_at <= now()
        AND (locked_at IS NULL OR locked_at < now() - INTERVAL '5 minutes')
      ORDER BY next_attempt_at ASC
      FOR UPDATE SKIP LOCKED
      LIMIT _batch_size
   )
  RETURNING *;
END;
$$;

REVOKE ALL ON FUNCTION public.dequeue_call_recording_ingest_jobs(INTEGER, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.dequeue_call_recording_ingest_jobs(INTEGER, TEXT) TO service_role;

-- 7) Finalização com backoff exponencial + jitter
CREATE OR REPLACE FUNCTION public.complete_call_recording_ingest_job(
  _job_id UUID,
  _success BOOLEAN,
  _error TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  j public.call_recording_ingest_jobs;
  backoff_secs INTEGER;
BEGIN
  SELECT * INTO j FROM public.call_recording_ingest_jobs WHERE id = _job_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'job % not found', _job_id; END IF;

  IF _success THEN
    UPDATE public.call_recording_ingest_jobs
       SET status = 'succeeded', completed_at = now(),
           locked_at = NULL, locked_by = NULL, last_error = NULL, updated_at = now()
     WHERE id = _job_id;
  ELSIF j.attempts >= j.max_attempts THEN
    UPDATE public.call_recording_ingest_jobs
       SET status = 'dead_letter', last_error = COALESCE(_error,'unknown'),
           last_error_at = now(), locked_at = NULL, locked_by = NULL, updated_at = now()
     WHERE id = _job_id;
  ELSE
    backoff_secs := LEAST(3600, POWER(2, j.attempts)::int * 30) + FLOOR(random() * 30)::int;
    UPDATE public.call_recording_ingest_jobs
       SET status = 'pending',
           next_attempt_at = now() + make_interval(secs => backoff_secs),
           last_error = COALESCE(_error,'unknown'), last_error_at = now(),
           locked_at = NULL, locked_by = NULL, updated_at = now()
     WHERE id = _job_id;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.complete_call_recording_ingest_job(UUID, BOOLEAN, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.complete_call_recording_ingest_job(UUID, BOOLEAN, TEXT) TO service_role;