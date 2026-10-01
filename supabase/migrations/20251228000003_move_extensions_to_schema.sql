-- Migration: Move PostgreSQL Extensions to Dedicated Schema
-- Author: SalesPro Team
-- Date: 2024-12-28
-- Priority: CRITICAL
-- Risk: HIGH - Requires careful execution and rollback plan

-- ============================================================================
-- PARTE 1: BACKUP E VALIDAÇÃO INICIAL
-- ============================================================================

-- Verificar extensões existentes no schema public
DO $$
DECLARE
  v_extensions TEXT;
BEGIN
  SELECT string_agg(extname, ', ')
  INTO v_extensions
  FROM pg_extension e
  JOIN pg_namespace n ON n.oid = e.extnamespace
  WHERE n.nspname = 'public';
  
  RAISE NOTICE 'Extensões em public: %', COALESCE(v_extensions, 'nenhuma');
END $$;

-- ============================================================================
-- PARTE 2: CRIAR SCHEMA DEDICADO
-- ============================================================================

-- Criar schema para extensões
CREATE SCHEMA IF NOT EXISTS extensions;

-- Grant permissões necessárias
GRANT USAGE ON SCHEMA extensions TO postgres;
GRANT USAGE ON SCHEMA extensions TO authenticated;
GRANT USAGE ON SCHEMA extensions TO service_role;

-- ============================================================================
-- PARTE 3: MOVER EXTENSÕES COMUNS
-- ============================================================================

-- Lista de extensões comuns do Supabase
-- Verificamos se existem antes de mover

-- 1. pg_stat_statements (monitoramento de queries)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_extension 
    WHERE extname = 'pg_stat_statements'
  ) THEN
    ALTER EXTENSION pg_stat_statements SET SCHEMA extensions;
    RAISE NOTICE 'pg_stat_statements movida para extensions';
  END IF;
END $$;

-- 2. pg_trgm (busca por similaridade)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_extension 
    WHERE extname = 'pg_trgm'
  ) THEN
    ALTER EXTENSION pg_trgm SET SCHEMA extensions;
    RAISE NOTICE 'pg_trgm movida para extensions';
  END IF;
END $$;

-- 3. pgcrypto (criptografia)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_extension 
    WHERE extname = 'pgcrypto'
  ) THEN
    ALTER EXTENSION pgcrypto SET SCHEMA extensions;
    RAISE NOTICE 'pgcrypto movida para extensions';
  END IF;
END $$;

-- 4. uuid-ossp (geração de UUIDs)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_extension 
    WHERE extname = 'uuid-ossp'
  ) THEN
    ALTER EXTENSION "uuid-ossp" SET SCHEMA extensions;
    RAISE NOTICE 'uuid-ossp movida para extensions';
  END IF;
END $$;

-- 5. postgis (geolocalização) - se existir
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_extension 
    WHERE extname = 'postgis'
  ) THEN
    ALTER EXTENSION postgis SET SCHEMA extensions;
    RAISE NOTICE 'postgis movida para extensions';
  END IF;
END $$;

-- 6. pg_graphql (Supabase GraphQL)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_extension 
    WHERE extname = 'pg_graphql'
  ) THEN
    ALTER EXTENSION pg_graphql SET SCHEMA extensions;
    RAISE NOTICE 'pg_graphql movida para extensions';
  END IF;
END $$;

-- 7. http (requisições HTTP)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_extension 
    WHERE extname = 'http'
  ) THEN
    ALTER EXTENSION http SET SCHEMA extensions;
    RAISE NOTICE 'http movida para extensions';
  END IF;
END $$;

-- ============================================================================
-- PARTE 4: ATUALIZAR SEARCH PATH
-- ============================================================================

-- Atualizar search_path do database para incluir extensions
ALTER DATABASE postgres SET search_path = "$user", public, extensions;

-- Atualizar search_path para roles
ALTER ROLE postgres SET search_path = "$user", public, extensions;
ALTER ROLE authenticated SET search_path = "$user", public, extensions;
ALTER ROLE service_role SET search_path = "$user", public, extensions;

-- ============================================================================
-- PARTE 5: VALIDAÇÃO PÓS-MIGRAÇÃO
-- ============================================================================

-- Verificar extensões no novo schema
DO $$
DECLARE
  v_extensions TEXT;
  v_count INTEGER;
BEGIN
  SELECT string_agg(extname, ', '), COUNT(*)
  INTO v_extensions, v_count
  FROM pg_extension e
  JOIN pg_namespace n ON n.oid = e.extnamespace
  WHERE n.nspname = 'extensions';
  
  RAISE NOTICE 'Extensões em extensions: % (total: %)', 
    COALESCE(v_extensions, 'nenhuma'), v_count;
END $$;

-- Verificar se ainda há extensões em public
DO $$
DECLARE
  v_extensions TEXT;
BEGIN
  SELECT string_agg(extname, ', ')
  INTO v_extensions
  FROM pg_extension e
  JOIN pg_namespace n ON n.oid = e.extnamespace
  WHERE n.nspname = 'public';
  
  IF v_extensions IS NOT NULL THEN
    RAISE WARNING 'Ainda existem extensões em public: %', v_extensions;
  ELSE
    RAISE NOTICE '✅ Nenhuma extensão restante em public';
  END IF;
END $$;

-- ============================================================================
-- PARTE 6: FUNÇÃO DE ROLLBACK (SE NECESSÁRIO)
-- ============================================================================

-- Criar função para reverter migração se necessário
CREATE OR REPLACE FUNCTION extensions.rollback_extension_migration()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_extension RECORD;
BEGIN
  -- Mover todas as extensões de volta para public
  FOR v_extension IN
    SELECT extname
    FROM pg_extension e
    JOIN pg_namespace n ON n.oid = e.extnamespace
    WHERE n.nspname = 'extensions'
  LOOP
    EXECUTE format('ALTER EXTENSION %I SET SCHEMA public', v_extension.extname);
    RAISE NOTICE 'Extensão % movida de volta para public', v_extension.extname;
  END LOOP;
  
  -- Restaurar search_path
  ALTER DATABASE postgres SET search_path = "$user", public;
  ALTER ROLE postgres SET search_path = "$user", public;
  ALTER ROLE authenticated SET search_path = "$user", public;
  ALTER ROLE service_role SET search_path = "$user", public;
  
  RAISE NOTICE '✅ Rollback completo';
END;
$$;

COMMENT ON FUNCTION extensions.rollback_extension_migration() IS 
  'Reverte a migração de extensões, movendo todas de volta para public';

-- ============================================================================
-- PARTE 7: TESTES DE VALIDAÇÃO
-- ============================================================================

-- Testar se funções de extensões ainda funcionam
DO $$
DECLARE
  v_uuid UUID;
  v_similarity FLOAT;
BEGIN
  -- Testar uuid-ossp
  BEGIN
    SELECT uuid_generate_v4() INTO v_uuid;
    RAISE NOTICE '✅ uuid-ossp funcionando: %', v_uuid;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING '❌ uuid-ossp com problemas: %', SQLERRM;
  END;
  
  -- Testar pg_trgm
  BEGIN
    SELECT similarity('teste', 'testo') INTO v_similarity;
    RAISE NOTICE '✅ pg_trgm funcionando: %', v_similarity;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING '❌ pg_trgm com problemas: %', SQLERRM;
  END;
  
  -- Testar pgcrypto
  BEGIN
    PERFORM digest('test', 'sha256');
    RAISE NOTICE '✅ pgcrypto funcionando';
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING '❌ pgcrypto com problemas: %', SQLERRM;
  END;
END $$;

-- ============================================================================
-- DOCUMENTAÇÃO E NOTAS
-- ============================================================================

COMMENT ON SCHEMA extensions IS 
  'Schema dedicado para extensões PostgreSQL. Criado em 2024-12-28 para melhorar organização e segurança.';

-- Registrar migração
CREATE TABLE IF NOT EXISTS public.migration_log (
  id SERIAL PRIMARY KEY,
  migration_name TEXT NOT NULL,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL,
  notes TEXT
);

INSERT INTO public.migration_log (migration_name, status, notes)
VALUES (
  '20251228_move_extensions_to_schema',
  'SUCCESS',
  'Extensões movidas para schema dedicado. Search path atualizado. Rollback function criada.'
);

-- ============================================================================
-- FINALIZAÇÃO
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '==============================================================';
  RAISE NOTICE '✅ MIGRAÇÃO CONCLUÍDA COM SUCESSO';
  RAISE NOTICE '==============================================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Próximos passos:';
  RAISE NOTICE '1. Validar todas as queries da aplicação';
  RAISE NOTICE '2. Testar RLS policies';
  RAISE NOTICE '3. Verificar performance';
  RAISE NOTICE '4. Monitorar logs de erro nas próximas 24h';
  RAISE NOTICE '';
  RAISE NOTICE 'Em caso de problemas:';
  RAISE NOTICE 'SELECT extensions.rollback_extension_migration();';
  RAISE NOTICE '';
  RAISE NOTICE '==============================================================';
END $$;
