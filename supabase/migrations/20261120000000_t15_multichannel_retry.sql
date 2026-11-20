-- T15: habilita retry de envios agendados que falharam com erro transitorio.
-- Motivo: o processador grava 'processing' no claim, mas o CHECK atual
-- (scheduled_sends_status_check) nao inclui esse valor -> 23514 em todo claim.
-- Alem disso, falha transitoria virava 'failed' definitivo, sem reprocessamento.

ALTER TABLE public.scheduled_sends DROP CONSTRAINT IF EXISTS scheduled_sends_status_check;
ALTER TABLE public.scheduled_sends ADD CONSTRAINT scheduled_sends_status_check
  CHECK (status IN ('pending','processing','sent','failed','cancelled'));

ALTER TABLE public.scheduled_sends ADD COLUMN IF NOT EXISTS attempts integer NOT NULL DEFAULT 0;
ALTER TABLE public.scheduled_sends ADD COLUMN IF NOT EXISTS next_retry_at timestamptz;

-- claim atomico de itens vencidos para reprocessamento (status=failed + next_retry_at <= now)
DROP INDEX IF EXISTS idx_scheduled_sends_pending;
DROP INDEX IF EXISTS idx_scheduled_sends_retry;
CREATE INDEX idx_scheduled_sends_pending ON public.scheduled_sends(status, scheduled_for) WHERE status = 'pending';
CREATE INDEX idx_scheduled_sends_retry ON public.scheduled_sends(status, next_retry_at) WHERE status = 'failed';