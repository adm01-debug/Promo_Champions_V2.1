
-- =============================================
-- EXPANSÃO DA TABELA QUOTES PARA SYNC COM GIFT STORE
-- =============================================

-- 1. Adicionar campos de dados ricos do sistema de orçamentos externo
ALTER TABLE public.quotes 
  ADD COLUMN IF NOT EXISTS quote_number TEXT,
  ADD COLUMN IF NOT EXISTS subtotal NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_percent NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS client_email TEXT,
  ADD COLUMN IF NOT EXISTS client_phone TEXT,
  ADD COLUMN IF NOT EXISTS seller_name TEXT,
  ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS synced_from_external BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS external_quote_id TEXT,
  ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sync_status TEXT DEFAULT 'none';

-- 2. Índices para busca e performance
CREATE INDEX IF NOT EXISTS idx_quotes_quote_number ON public.quotes (quote_number);
CREATE INDEX IF NOT EXISTS idx_quotes_external_quote_id ON public.quotes (external_quote_id);
CREATE INDEX IF NOT EXISTS idx_quotes_source ON public.quotes (source);
CREATE INDEX IF NOT EXISTS idx_quotes_sync_status ON public.quotes (sync_status);
CREATE INDEX IF NOT EXISTS idx_quotes_sale_id ON public.quotes (sale_id);

-- 3. Tabela de log de sincronização de orçamentos
CREATE TABLE IF NOT EXISTS public.quote_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_quote_id TEXT,
  quote_number TEXT,
  action TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'success',
  details JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.quote_sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view sync logs"
  ON public.quote_sync_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can insert sync logs"
  ON public.quote_sync_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE INDEX idx_quote_sync_logs_created_at ON public.quote_sync_logs (created_at DESC);
CREATE INDEX idx_quote_sync_logs_external_id ON public.quote_sync_logs (external_quote_id);
