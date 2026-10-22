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

-- deals: tabela pode não existir em DBs de staging/teste sem seed completo
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'deals' AND n.nspname = 'public' AND c.relkind = 'r') THEN
    CREATE INDEX IF NOT EXISTS idx_deals_user_id ON deals(user_id);
    CREATE INDEX IF NOT EXISTS idx_deals_client_id ON deals(client_id);
    CREATE INDEX IF NOT EXISTS idx_deals_status ON deals(status);
    CREATE INDEX IF NOT EXISTS idx_deals_created_at ON deals(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_deals_value ON deals(value);
    CREATE INDEX IF NOT EXISTS idx_deals_user_status ON deals(user_id, status);
  ELSE
    RAISE NOTICE 'Tabela deals não encontrada — índices pulados.';
  END IF;
END $$;

-- activities: guarda de tabela + guarda de coluna (user_id/client_id/deal_id podem
-- não existir no schema de produção — a tabela original não os inclui)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'activities' AND n.nspname = 'public' AND c.relkind = 'r') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'activities' AND column_name = 'user_id') THEN
      CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
    ELSE
      RAISE NOTICE 'Coluna activities.user_id não encontrada — índice pulado.';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'activities' AND column_name = 'client_id') THEN
      CREATE INDEX IF NOT EXISTS idx_activities_client_id ON activities(client_id);
    ELSE
      RAISE NOTICE 'Coluna activities.client_id não encontrada — índice pulado.';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'activities' AND column_name = 'deal_id') THEN
      CREATE INDEX IF NOT EXISTS idx_activities_deal_id ON activities(deal_id);
    ELSE
      RAISE NOTICE 'Coluna activities.deal_id não encontrada — índice pulado.';
    END IF;
    CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'activities' AND column_name = 'user_id') THEN
      CREATE INDEX IF NOT EXISTS idx_activities_user_date ON activities(user_id, created_at DESC);
    ELSE
      RAISE NOTICE 'Coluna activities.user_id não encontrada — índice user_date pulado.';
    END IF;
  ELSE
    RAISE NOTICE 'Tabela activities não encontrada — índices pulados.';
  END IF;
END $$;

-- products: mesma guarda
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'products' AND n.nspname = 'public' AND c.relkind = 'r') THEN
    CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
    CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
  ELSE
    RAISE NOTICE 'Tabela products não encontrada — índices pulados.';
  END IF;
END $$;

-- ------------------------------------------------------------------
-- De 20260104170152_additional_indexes.sql
-- Os índices parciais (WHERE deleted_at IS NULL) recebem sufixo _active
-- para evitar conflito de nome com os não-parciais criados acima.
-- ------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_clients_user_active
  ON clients(user_id) WHERE deleted_at IS NULL AND active = true;

CREATE INDEX IF NOT EXISTS idx_clients_name_search
  ON clients USING gin(to_tsvector('portuguese', name));

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'deals' AND n.nspname = 'public' AND c.relkind = 'r') THEN
    CREATE INDEX IF NOT EXISTS idx_deals_user_status_active
      ON deals(user_id, status) WHERE deleted_at IS NULL;
    CREATE INDEX IF NOT EXISTS idx_deals_created_status_active
      ON deals(created_at DESC, status) WHERE deleted_at IS NULL;
    CREATE INDEX IF NOT EXISTS idx_deals_title_search
      ON deals USING gin(to_tsvector('portuguese', title));
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'activities' AND n.nspname = 'public' AND c.relkind = 'r') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'activities' AND column_name = 'user_id') THEN
      CREATE INDEX IF NOT EXISTS idx_activities_user_date_active
        ON activities(user_id, created_at DESC) WHERE deleted_at IS NULL;
    ELSE
      RAISE NOTICE 'Coluna activities.user_id não encontrada — índice user_date_active pulado.';
    END IF;
  END IF;
END $$;
