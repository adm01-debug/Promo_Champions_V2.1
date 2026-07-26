ALTER TABLE public.email_bulk_drafts
  ADD COLUMN IF NOT EXISTS retry_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS next_retry_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_error_at TIMESTAMPTZ;

-- Localiza rascunhos elegíveis a nova tentativa sem varrer a tabela inteira.
CREATE INDEX IF NOT EXISTS idx_email_bulk_drafts_retry
  ON public.email_bulk_drafts (next_retry_at)
  WHERE sent_at IS NULL AND error IS NOT NULL;