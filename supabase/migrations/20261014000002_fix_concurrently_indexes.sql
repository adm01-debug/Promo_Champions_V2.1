-- Corrige CREATE INDEX CONCURRENTLY das migrations de janeiro/2026.
-- O gateway Supabase roda DDL dentro de uma transação; CONCURRENTLY é
-- proibido em bloco transacional (CLAUDE.md §1 R5) e falha com:
--   "CREATE INDEX CONCURRENTLY cannot run inside a transaction block"
-- Esta migration re-cria os mesmos índices com CREATE INDEX simples.
-- Em produção os índices já existem (as migrations originais foram aplicadas
-- antes do gateway transacional ser adotado); o IF NOT EXISTS é no-op.
-- Em staging/fresh DB, esta migration substitui as originais com sucesso.

-- ------------------------------------------------------------------
-- De 20260104144318_performance_indexes.sql
-- ------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone);

CREATE INDEX IF NOT EXISTS idx_deals_user_id ON deals(user_id);
CREATE INDEX IF NOT EXISTS idx_deals_client_id ON deals(client_id);
CREATE INDEX IF NOT EXISTS idx_deals_status ON deals(status);
CREATE INDEX IF NOT EXISTS idx_deals_created_at ON deals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_deals_value ON deals(value);

CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_client_id ON activities(client_id);
CREATE INDEX IF NOT EXISTS idx_activities_deal_id ON activities(deal_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);

CREATE INDEX IF NOT EXISTS idx_deals_user_status ON deals(user_id, status);
CREATE INDEX IF NOT EXISTS idx_activities_user_date ON activities(user_id, created_at DESC);

-- ------------------------------------------------------------------
-- De 20260104170152_additional_indexes.sql
-- Os índices parciais (WHERE deleted_at IS NULL) recebem sufixo _active
-- para evitar conflito de nome com os não-parciais criados acima.
-- ------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_deals_user_status_active
  ON deals(user_id, status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_deals_created_status_active
  ON deals(created_at DESC, status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_activities_user_date_active
  ON activities(user_id, created_at DESC) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_clients_user_active
  ON clients(user_id) WHERE deleted_at IS NULL AND active = true;

CREATE INDEX IF NOT EXISTS idx_clients_name_search
  ON clients USING gin(to_tsvector('portuguese', name));

CREATE INDEX IF NOT EXISTS idx_deals_title_search
  ON deals USING gin(to_tsvector('portuguese', title));
