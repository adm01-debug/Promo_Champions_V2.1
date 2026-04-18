ALTER TABLE public.deal_stakeholders
  ADD COLUMN IF NOT EXISTS evidence_quote text,
  ADD COLUMN IF NOT EXISTS confidence numeric;