-- Pacote auditoria DB/integridade — [OPTLOCK] Optimistic locking
--
-- Adiciona coluna version (INT NOT NULL DEFAULT 1) e trigger de incremento
-- automático em deals, sales e quotes. O frontend passa a exigir
-- `.eq('version', <versão lida>)` nos 2-3 pontos de edição mais críticos
-- (mudança de estágio do deal no pipeline, aprovação/status do orçamento):
-- UPDATE que não casa nenhuma linha = registro alterado por outro usuário
-- → conflito tratado como 409 com toast e refetch.
--
-- Idempotente: ADD COLUMN IF NOT EXISTS + backfill defensivo + guards.

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['deals', 'sales', 'quotes'] LOOP
    IF to_regclass('public.' || t) IS NULL THEN
      RAISE NOTICE 'Tabela % inexistente — coluna version ignorada', t;
      CONTINUE;
    END IF;

    EXECUTE format(
      'ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1',
      t
    );
    -- Backfill defensivo para o caso de a coluna já existir com NULLs
    -- (ambiente divergente da main). ADD COLUMN já cobre DEFAULT 1 nas novas linhas.
    EXECUTE format('UPDATE public.%I SET version = 1 WHERE version IS NULL', t);
    EXECUTE format(
      'COMMENT ON COLUMN public.%I.version IS ''Optimistic locking: incrementado a cada UPDATE; UPDATEs críticos devem filtrar pela versão lida.''',
      t
    );
  END LOOP;
END $$;

-- Trigger genérico: toda escrita UPDATE incrementa version automaticamente.
-- O caller nunca envia version — a guarda é somente-leitura (.eq no WHERE).
CREATE OR REPLACE FUNCTION public.bump_row_version()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.version := COALESCE(OLD.version, 0) + 1;
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.bump_row_version() IS
  'Incrementa a coluna version a cada UPDATE (optimistic locking).';

DO $$
DECLARE
  t TEXT;
  lock_tables TEXT[] := ARRAY['deals', 'sales', 'quotes'];
BEGIN
  FOREACH t IN ARRAY lock_tables LOOP
    IF to_regclass('public.' || t) IS NULL THEN
      RAISE NOTICE 'Tabela % inexistente — trigger de version ignorado', t;
      CONTINUE;
    END IF;

    EXECUTE format('DROP TRIGGER IF EXISTS bump_version ON public.%I', t);
    EXECUTE format(
      'CREATE TRIGGER bump_version BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.bump_row_version()',
      t
    );
  END LOOP;
END $$;
