-- Recria os índices de performance que foram declarados com CREATE INDEX CONCURRENTLY
-- em 20260104144318 e 20260104170152 — ambos nunca foram criados porque o gateway
-- transacional do Supabase rejeita CONCURRENTLY.
--
-- Estratégia de conflito de nomes:
--   idx_deals_user_status e idx_activities_user_date existem em ambas as migrations
--   com definições distintas; usamos a versão com WHERE (parcial) da 20260104170152
--   por ser mais seletiva para queries de registros não-deletados.

-- clients
CREATE INDEX IF NOT EXISTS idx_clients_user_id
  ON public.clients (user_id);
CREATE INDEX IF NOT EXISTS idx_clients_created_at
  ON public.clients (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_clients_email
  ON public.clients (email);
CREATE INDEX IF NOT EXISTS idx_clients_phone
  ON public.clients (phone);

-- deals
CREATE INDEX IF NOT EXISTS idx_deals_user_id
  ON public.deals (user_id);
CREATE INDEX IF NOT EXISTS idx_deals_client_id
  ON public.deals (client_id);
CREATE INDEX IF NOT EXISTS idx_deals_status
  ON public.deals (status);
CREATE INDEX IF NOT EXISTS idx_deals_created_at
  ON public.deals (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_deals_value
  ON public.deals (value);

-- activities
CREATE INDEX IF NOT EXISTS idx_activities_user_id
  ON public.activities (user_id);
CREATE INDEX IF NOT EXISTS idx_activities_client_id
  ON public.activities (client_id);
CREATE INDEX IF NOT EXISTS idx_activities_deal_id
  ON public.activities (deal_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at
  ON public.activities (created_at DESC);

-- products
CREATE INDEX IF NOT EXISTS idx_products_name
  ON public.products (name);
CREATE INDEX IF NOT EXISTS idx_products_category
  ON public.products (category);
CREATE INDEX IF NOT EXISTS idx_products_active
  ON public.products (active);

-- Compostos parciais (versão canônica com WHERE deleted_at IS NULL)
CREATE INDEX IF NOT EXISTS idx_deals_user_status
  ON public.deals (user_id, status)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_deals_created_status
  ON public.deals (created_at DESC, status)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_activities_user_date
  ON public.activities (user_id, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_clients_user_active
  ON public.clients (user_id)
  WHERE deleted_at IS NULL AND active = true;

-- Full-text search
CREATE INDEX IF NOT EXISTS idx_clients_name_search
  ON public.clients
  USING gin (to_tsvector('portuguese', name));

CREATE INDEX IF NOT EXISTS idx_deals_title_search
  ON public.deals
  USING gin (to_tsvector('portuguese', title));
