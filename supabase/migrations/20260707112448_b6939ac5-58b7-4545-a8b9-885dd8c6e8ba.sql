ALTER TABLE public.quotes_inbound
  ADD CONSTRAINT chk_quotes_inbound_total_non_negative
  CHECK (total IS NULL OR total >= 0);