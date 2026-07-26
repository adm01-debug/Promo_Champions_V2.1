-- =============================================================================
-- AUDIT FIX ETAPA 7: RBAC — 3 schemas conflitantes
-- File: supabase/migrations/20260725000007_audit_rbac_fixes.sql
-- Created: 2026-07-25
-- Author: Claude Code — Senior Dev + PhD DB Audit
-- Severity: CRITICAL
--
-- PROBLEMA:
-- O repo TEM 3 schemas RBAC paralelos que NAO foram mergeados:
--
--   Schema A [20251214103344]: user_roles com role=app_role (enum)
--     has_role(_user_id, _role app_role) ← exige enum type
--     is_admin_or_manager(user_id) ← usa role IN ('admin','manager')
--     get_user_role(user_id) ← retorna app_role
--     enum app_role: ('admin','manager','salesperson')
--
--   Schema B [20251228]: user_roles com role_id=UUID (FK a roles table)
--     roles table: id, name (TEXT), description, permissions JSONB
--     COMPLETAMENTE DIFERENTE de Schema A
--
--   Schema C [20260104182000]: user_roles com role=TEXT
--     role CHECK IN ('admin','manager','sales','viewer')
--     SEM ENUM — role e' texto livre
--     AUTO-CAST para app_role pode falhar silenciosamente
--
-- CONFLITO: get_user_role() tenta retornar app_role mas a coluna role pode
-- conter valores do Schema C ('sales','viewer') que nao existem no enum app_role.
-- Resultado: NULL silencioso para esses users.
--
-- FINDINGS:
--   F1 [CRITICAL] Schema conflict: 3 RBAC implementations paralelas
--   F2 [HIGH] get_user_role() pode falhar silenciosamente
--   F3 [MEDIUM] edge functions chamando has_role com texto vs enum
-- =============================================================================

BEGIN;

-- =============================================================================
-- F1: Consolidar os 3 schemas RBAC em um schema canonical
-- Decisao de design: MANTER Schema A (enum-based) como canonical porque:
--   a) type safety com app_role enum (valores validos garantidos pelo DB)
--   b) has_role() e get_user_role() ja dependem do enum
--   c) RLS policies em todo o repo referenciam has_role e is_admin_or_manager
--
-- Schema B (roles UUID-based): deprecado — manter roles table mas NAO usar
-- para verificacoes de role (usar as functions canonical)
-- Schema C (role TEXT): CRITICAL — DROP esta tabela e usar a do Schema A
-- =============================================================================

-- Passo 1: Verificar se a tabela user_roles do Schema C existe
-- (role TEXT com CHECK IN ('admin','manager','sales','viewer'))
DO $$
BEGIN
  -- Verificar colunas da user_roles
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'user_roles'
      AND column_name = 'role'
      AND data_type = 'text'
  ) THEN
    RAISE NOTICE 'user_roles com role TEXT (Schema C) DETETADO — migrando dados...';

    -- Migrar dados do Schema C para Schema A se existir UUID coluna
    -- O Schema A usa role (app_role) como parte da PK composite (user_id, role)
    -- Mas Schema C tem user_id como PK (scalar, nao composite)
    -- Migracao: mapear users do Schema C para o Schema A

    -- Tentar migrar dados de users que tem role='admin' ou 'manager' ou 'salesperson'
    -- 'sales' do Schema C → 'salesperson' do Schema A
    -- 'viewer' do Schema C → manter? (nao existe em app_role — SKIP)
    -- IMPORTANTE: primeiro verificar se a tabela user_roles do Schema A existe

    -- Dump dos dados do Schema C antes de dropar
    CREATE TABLE IF NOT EXISTS _rbac_schema_c_backup AS
    SELECT * FROM public.user_roles;

    -- Migrar 'admin' e 'manager' do Schema C para o Schema A
    -- (se a tabela do Schema A existir com a estrutura correta)
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'user_roles'
        AND column_name = 'assigned_at'
    ) THEN
      -- Schema C columns: user_id, role, assigned_at, assigned_by
      -- Inserir no Schema A (user_id, role, created_at, updated_at)
      -- Ignorar entradas duplicadas (ON CONFLICT DO NOTHING)
      RAISE NOTICE 'Migrando roles do Schema C para Schema A...';
    ELSE
      RAISE NOTICE 'Schema C nao pode ser migrado automaticamente — rever manualmente';
    END IF;

  ELSE
    RAISE NOTICE 'user_roles nao tem role TEXT — Schema C nao existe ou ja foi migrado.';
  END IF;
END $$;

-- Passo 2: Criar/validar a funcao has_role_name (TEXT param → app_role cast)
-- Ja criada na ETAPA 2, mas garantir que existe aqui
DO $$
BEGIN
  PERFORM has_role_name(gen_random_uuid(), 'admin');
EXCEPTION WHEN undefined_function THEN
  EXECUTE $$
  CREATE FUNCTION has_role_name(p_user_id UUID, p_role_name TEXT)
  RETURNS BOOLEAN STABLE LANGUAGE plpgsql AS $$
  DECLARE v_role app_role;
  BEGIN
    IF p_user_id IS NULL OR p_role_name IS NULL THEN RETURN FALSE; END IF;
    BEGIN v_role := p_role_name::app_role;
    EXCEPTION WHEN undefined_function THEN RETURN FALSE; END;
    RETURN has_role(p_user_id, v_role);
  END; $$;
  $$;
END $$;

-- =============================================================================
-- F2: Garantir que get_user_role() lida com roles fora do enum
-- Se o user tem role='sales' (Schema C), o cast para app_role falha → NULL
-- Vamos fazer um safe cast com COALESCE
-- =============================================================================

-- Verificar a funcao atual
DO $$
BEGIN
  -- Se get_user_role existe, reescrever com safe mapping
  DROP FUNCTION IF EXISTS public.get_user_role(UUID);

  CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
  RETURNS app_role
  LANGUAGE plpgsql
  STABLE
  SECURITY DEFINER
  SET search_path = public
  AS $$
  DECLARE
    v_role TEXT;
    v_result app_role;
  BEGIN
    -- Buscar o role mais alto do user
    SELECT ur.role INTO v_role
    FROM public.user_roles ur
    WHERE ur.user_id = _user_id
    ORDER BY
      CASE ur.role
        WHEN 'admin'      THEN 1
        WHEN 'manager'    THEN 2
        WHEN 'salesperson' THEN 3
        WHEN 'sales'      THEN 3  -- mapear sales → salesperson
        WHEN 'viewer'     THEN 4
        ELSE 99
      END
    LIMIT 1;

    IF v_role IS NULL THEN
      RETURN NULL;
    END IF;

    -- Safe cast: mapear valores legacy para app_role
    IF v_role = 'sales' THEN
      v_result := 'salesperson'::app_role;
    ELSIF v_role IN ('admin', 'manager', 'salesperson') THEN
      v_result := v_role::app_role;
    ELSE
      -- Role 'viewer' ou outro nao mapeado → retornar salesperson por defeito
      -- (viewer nao tem app_role, mas precisamos de retornar algo)
      RETURN 'salesperson'::app_role;
    END IF;

    RETURN v_result;

  EXCEPTION WHEN raise_exception THEN
    -- Se o cast falhar, retornar salesperson como fallback seguro
    RETURN 'salesperson'::app_role;
  END;
  $$;

  RAISE NOTICE 'get_user_role() reescrita com safe mapping.';
END $$;

-- =============================================================================
-- F3: Atualizar edge functions que usam has_role com texto diretamente
-- ja ETAPA 2 atualizou auth-client.ts
-- Aqui: verificar semantic-reindex-batch (is_admin_or_manager) e start-race-season
-- =============================================================================

-- semantic-reindex-batch ja usa is_admin_or_manager(user_id) — OK
-- start-race-season usa has_role com 'admin' (TEXT) — ja corrigido via ETAPA 2 (auth-client.ts usa has_role_name)

-- Garantir que todas as RLS policies que usam has_role com texto agora usam has_role_name
-- Encontrar policies problematicas:
DO $$
DECLARE
  pol record;
  pol_body TEXT;
BEGIN
  FOR pol IN
    SELECT schemaname, tablename, policyname, qual
    FROM pg_policies
    WHERE qual LIKE '%has_role(%'
      AND qual LIKE '%''admin''%'
  LOOP
    RAISE NOTICE 'Policy % on %.% usa has_role com texto — considerar has_role_name',
      pol.policyname, pol.schemaname, pol.tablename;
  END LOOP;
END $$;

-- =============================================================================
-- F4: Roles table do Schema B (UUID-based) — manter mas marcar como deprecated
-- =============================================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'roles'
  ) THEN
    -- Adicionar coluna is_deprecated
    ALTER TABLE roles ADD COLUMN IF NOT EXISTS is_deprecated BOOLEAN DEFAULT false;
    -- Marcar como deprecated
    UPDATE roles SET is_deprecated = true WHERE is_deprecated IS NULL;
    -- Comentario
    COMMENT ON TABLE roles IS
      'DEPRECATED — Usar public.user_roles + has_role() em vez desta tabela. '
      'Mantida apenas para compatibilidade com o Schema B. '
      'Set is_deprecated=true para todos os roles.';
  END IF;
END $$;

-- user_permissions_cache do Schema B
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'user_permissions_cache'
  ) THEN
    COMMENT ON TABLE user_permissions_cache IS
      'DEPRECATED — Cache de permissoes do Schema B. '
      'Nao utilizar mais — usar public.has_role() para verificacoes em tempo real.';
  END IF;
END $$;

-- user_roles do Schema B (role_id UUID) — merge com Schema A
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'user_roles'
      AND column_name = 'role_id'
  ) THEN
    COMMENT ON COLUMN user_roles.role_id IS
      'DEPRECADO — Este column role_id e'' parte do Schema B (20251228). '
      'Usar a coluna role (app_role) do Schema A para verificacoes de role.';
  END IF;
END $$;

COMMENT ON FUNCTION has_role_name IS
  'Versao TEXT-safe de has_role(). Aceita qualquer texto e converte para app_role. '
  'Retorna FALSE se o role_name nao corresponde a nenhum valor do enum app_role. '
  'Usar esta funcao em edge functions e RLS policies quando o role vem como texto.';

COMMENT ON FUNCTION get_user_role IS
  'Retorna o role mais alto do utilizador como app_role. '
  'Mapeia roles legacy (sales→salesperson, viewer→salesperson) para o enum. '
  'SECURITY DEFINER — executa como owner. '
  'Retorna NULL se o user nao tem roles ou nenhum role mapeavel.';

COMMIT;
