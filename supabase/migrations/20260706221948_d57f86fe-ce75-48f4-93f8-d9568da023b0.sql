-- Índice 1: salespeople.auth_user_id (RLS policy em quotes_inbound faz subquery aqui)
CREATE INDEX IF NOT EXISTS idx_salespeople_auth_user_id
  ON public.salespeople (auth_user_id)
  WHERE auth_user_id IS NOT NULL;

-- Índice 2: quotes_inbound.seller_email (coluna usada na RLS WHERE seller_email = ...)
CREATE INDEX IF NOT EXISTS idx_quotes_inbound_seller_email
  ON public.quotes_inbound (seller_email)
  WHERE seller_email IS NOT NULL;

-- Índice 3: quotes_inbound por source + status (queries de listagem no CRM)
CREATE INDEX IF NOT EXISTS idx_quotes_inbound_source_status
  ON public.quotes_inbound (source, status);

-- Índice 4: quotes_inbound.last_event (filtros de evento)
CREATE INDEX IF NOT EXISTS idx_quotes_inbound_last_event
  ON public.quotes_inbound (last_event)
  WHERE last_event IS NOT NULL;