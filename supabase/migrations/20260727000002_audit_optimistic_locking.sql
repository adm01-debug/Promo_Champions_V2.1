-- ============================================================
-- promo-champions-v2.1 — Optimistic Locking Version Columns
-- Auditoria ETAPA 29-36 — Finding #75 (CRITICAL)
--
-- SIMULAÇÃO DE CENÁRIOS:
-- C1: Concurrent UPDATE on sales.amount → last write wins (lost update)
--     → Version column: UPDATE WHERE version = current → 0 rows if changed
-- C2: Race: Transaction A reads version=5, Transaction B reads version=5
--     → Transaction A writes version=6 WHERE version=5 → success
--     → Transaction B writes version=6 WHERE version=5 → 0 rows, rollback
-- C3: Trigger fires on UPDATE → increments version automatically
--     → Application code não precisa saber da versão (transparente)
-- C4: INSERT: version starts at 1
-- C5: Version column com DEFAULT 1 — não quebra INSERT existente
-- C6: Trigger AFTER UPDATE — não intercepta valores OLD/NEW (evita loops)
-- ============================================================

DO $$
BEGIN
  -- ── sales ───────────────────────────────────────────────────────────
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'sales' AND column_name = 'version'
  ) THEN
    ALTER TABLE public.sales ADD COLUMN version INT NOT NULL DEFAULT 1;
    CREATE TRIGGER trg_sales_version
      AFTER UPDATE ON public.sales
      FOR EACH ROW EXECUTE FUNCTION increment_version_column();
    RAISE NOTICE 'sales.version adicionado + trigger';
  END IF;

  -- ── quotes ─────────────────────────────────────────────────────────
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'quotes' AND column_name = 'version'
  ) THEN
    ALTER TABLE public.quotes ADD COLUMN version INT NOT NULL DEFAULT 1;
    CREATE TRIGGER trg_quotes_version
      AFTER UPDATE ON public.quotes
      FOR EACH ROW EXECUTE FUNCTION increment_version_column();
    RAISE NOTICE 'quotes.version adicionado + trigger';
  END IF;

  -- ── orders ─────────────────────────────────────────────────────────
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'version'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN version INT NOT NULL DEFAULT 1;
    CREATE TRIGGER trg_orders_version
      AFTER UPDATE ON public.orders
      FOR EACH ROW EXECUTE FUNCTION increment_version_column();
    RAISE NOTICE 'orders.version adicionado + trigger';
  END IF;

  -- ── clients ────────────────────────────────────────────────────────
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'clients' AND column_name = 'version'
  ) THEN
    ALTER TABLE public.clients ADD COLUMN version INT NOT NULL DEFAULT 1;
    CREATE TRIGGER trg_clients_version
      AFTER UPDATE ON public.clients
      FOR EACH ROW EXECUTE FUNCTION increment_version_column();
    RAISE NOTICE 'clients.version adicionado + trigger';
  END IF;

  -- ── deals ───────────────────────────────────────────────────────────
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'deals' AND column_name = 'version'
  ) THEN
    ALTER TABLE public.deals ADD COLUMN version INT NOT NULL DEFAULT 1;
    CREATE TRIGGER trg_deals_version
      AFTER UPDATE ON public.deals
      FOR EACH ROW EXECUTE FUNCTION increment_version_column();
    RAISE NOTICE 'deals.version adicionado + trigger';
  END IF;
END;
$$;

-- Função helper para incremento de versão (reutilizável)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc
    WHERE proname = 'increment_version_column'
      AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) THEN
    CREATE OR REPLACE FUNCTION public.increment_version_column()
    RETURNS TRIGGER AS $$
    BEGIN
      -- Só incrementa se version realmente mudou (evita triggers em cascade)
      IF OLD.version IS DISTINCT FROM NEW.version THEN
        RETURN NEW;
      END IF;
      NEW.version := COALESCE(OLD.version, 0) + 1;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
    RAISE NOTICE 'increment_version_column() criado';
  END IF;
END;
$$;

-- ============================================================
-- FIM: Optimistic Locking Version Columns
-- ============================================================
