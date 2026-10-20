-- Corrige CREATE INDEX CONCURRENTLY das migrations de janeiro/2026.
-- O gateway Supabase roda DDL dentro de uma transação; CONCURRENTLY é
-- proibido em bloco transacional (CLAUDE.md §1 R5) e falha com:
--   "CREATE INDEX CONCURRENTLY cannot run inside a transaction block"
-- Esta migration re-cria os mesmos índices com CREATE INDEX simples.
--
-- Rollback: índices são estruturas auxiliares — desfazer esta migration é
-- só DROPAR os índices, sem perda de dados:
--   DROP INDEX IF EXISTS public.idx_clients_user_id;
--   DROP INDEX IF EXISTS public.idx_clients_created_at;
--   DROP INDEX IF EXISTS public.idx_clients_email;
--   DROP INDEX IF EXISTS public.idx_clients_phone;
--   DROP INDEX IF EXISTS public.idx_activities_client_id;
--   DROP INDEX IF EXISTS public.idx_activities_created_at;
--   DROP INDEX IF EXISTS public.idx_products_name;
--   DROP INDEX IF EXISTS public.idx_products_category;
--   DROP INDEX IF EXISTS public.idx_products_active;
--   DROP INDEX IF EXISTS public.idx_clients_name_search;
--
-- Correção 20/10/2026: a redação anterior incluía 14 índices sobre objetos
-- que não existem no schema real deste projeto, e o apply inteiro caía no
-- primeiro deles (psql com ON_ERROR_STOP=1 aborta a transação):
--   relation "deals" does not exist (apply de 20/10/2026).
-- A tabela deals nunca existiu em nenhuma migration do repo (o funil usa a
-- tabela sales, que já tem índices próprios: idx_sales_status,
-- idx_sales_created_at, idx_sales_salesperson_id); activities não tem as
-- colunas user_id nem deal_id (usa salesperson_id e sale_id); clients não
-- tem a coluna active. Conferido em 3 fontes: o erro do apply, os tipos
-- gerados do banco real (src/integrations/supabase/types.ts: 439 tabelas,
-- sem deals) e a sonda de hoje (14 índices ausentes, todos nesses objetos).
-- Esses 14 CREATE INDEX foram removidos. Os 10 restantes são no-op em
-- produção (os índices já existem) e continuam válidos para fresh DB.

-- ------------------------------------------------------------------
-- De 20260104144318_performance_indexes.sql (só os aplicáveis ao schema)
-- ------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone);

CREATE INDEX IF NOT EXISTS idx_activities_client_id ON activities(client_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);

-- ------------------------------------------------------------------
-- De 20260104170152_additional_indexes.sql (só os aplicáveis ao schema)
-- Os índices parciais (WHERE deleted_at IS NULL) recebem sufixo _active
-- para evitar conflito de nome com os não-parciais criados acima.
-- ------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_clients_name_search
  ON clients USING gin(to_tsvector('portuguese', name));
