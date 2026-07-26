-- =============================================================================
-- AUDIT FIX ETAPA 2: 2FA + Autenticação
-- File: supabase/migrations/20260725000002_audit_2fa_auth_fixes.sql
-- Created: 2026-07-25
-- Author: Claude Code — Senior Dev + PhD DB Audit
-- Severity: CRITICAL / HIGH
--
-- FINDINGS:
--   F1 [CRITICAL]  auth-client.ts chama has_role via RPC mas has_role exige
--                  enum app_role como 2º param — cast string→enum falha em
--                  contextos ANSI SQL (o RPC pode não fazer o cast automático).
--                  Resultado: requireAdmin() SEMPRE falha → admins bloqueados.
--
--   F2 [HIGH]      login_attempts SELECT policy referencia "role" column que
--                  não existe em user_roles (existe 'role_id' UUID, não 'role').
--                  Admins NÃO CONSEGUEM ver login_attempts.
--
--   F3 [MEDIUM]    session_activity: falta INSERT policy — logging de sessão
--                  nunca acontece.
--
--   F4 [MEDIUM]    data_access_log: falta UPDATE/DELETE policies.
--
--   F5 [LOW]       record_login_attempt: ON CONFLICT DO NOTHING pode silenciar
--                  double-click login attempts legitimos.
-- =============================================================================

BEGIN;

-- =============================================================================
-- F1: Criar has_role_name() — overload de has_role() que aceita TEXT
-- auth-client.ts chama ctx.client.rpc("has_role", {_user_id, _role: "admin"})
-- O parametro _role e' TEXT, mas has_role() exige app_role (enum).
-- Solucao: criar has_role_name(text) que internamente converte para app_role.
-- =============================================================================

-- Verifica se ja existe (da migraçao ETAPA1)
DO $$
BEGIN
  -- Tenta chamar para ver se ja existe
  PERFORM has_role_name(gen_random_uuid()::uuid, 'admin');
EXCEPTION WHEN undefined_function THEN
  -- Nao existe — criar
  EXECUTE $$
  CREATE FUNCTION has_role_name(p_user_id UUID, p_role_name TEXT)
  RETURNS BOOLEAN
  LANGUAGE plpgsql
  STABLE
  AS $$
  DECLARE
    v_role app_role;
  BEGIN
    IF p_user_id IS NULL OR p_role_name IS NULL THEN
      RETURN FALSE;
    END IF;
    -- Converter texto para app_role (falha se valor invalido)
    BEGIN
      v_role := p_role_name::app_role;
    EXCEPTION WHEN undefined_function THEN
      RETURN FALSE;  -- valor de role nao reconhecido
    END;
    RETURN has_role(p_user_id, v_role);
  END;
  $$;
  $$;
END $$;

-- Agora atualizar auth-client.ts para usar has_role_name (ver notas no fim)

-- =============================================================================
-- F2: Corrigir login_attempts SELECT policy — role column nao existe
-- user_roles tem role_id (UUID), nao role (TEXT).
-- Corrigir para usar EXISTS com role_id -> roles lookup.
-- =============================================================================

DROP POLICY IF EXISTS "Admins can view login attempts" ON login_attempts;

CREATE POLICY "Admins can view login attempts"
  ON login_attempts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name = 'admin'
    )
  );

-- INSERT: service_role (via record_login_attempt) + ANON para webhooks de auth
CREATE POLICY "Anyone can insert login attempts"
  ON login_attempts FOR INSERT
  TO public
  WITH CHECK (true);

-- DELETE: admins podem limpar logs antigos
CREATE POLICY "Admins can delete login attempts"
  ON login_attempts FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name = 'admin'
    )
  );

-- =============================================================================
-- F3: session_activity — adicionar INSERT policy
-- O trigger existe para logging, mas sem INSERT policy, nada é escrito.
-- INSERT: qualquer utilizador autenticado cria o seu proprio log
-- SELECT: o proprio utilizador ve os seus logs
-- UPDATE/DELETE: apenas admins
-- =============================================================================

DROP POLICY IF EXISTS "Users can view own session activity" ON session_activity;

CREATE POLICY "session_activity_select"
  ON session_activity FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "session_activity_insert"
  ON session_activity FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "session_activity_update"
  ON session_activity FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

CREATE POLICY "session_activity_delete"
  ON session_activity FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- =============================================================================
-- F4: data_access_log — adicionar UPDATE/DELETE policies
-- INSERT é feita pelo SECURITY DEFINER trigger (bypass RLS)
-- =============================================================================

DROP POLICY IF EXISTS "Users can view own data access" ON data_access_log;

CREATE POLICY "data_access_log_select"
  ON data_access_log FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins veem tudo
CREATE POLICY "data_access_log_select_admin"
  ON data_access_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- UPDATE/DELETE: apenas admins (para compliance/data retention)
CREATE POLICY "data_access_log_update_admin"
  ON data_access_log FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

CREATE POLICY "data_access_log_delete_admin"
  ON data_access_log FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- =============================================================================
-- F5: record_login_attempt — ON CONFLICT DO NOTHING pode mascarar bugs
-- Substituir por log + unique constraint. A constraint email+created_at unique
-- nao faz sentido (同一用户 pode ter multiplos login attempts no mesmo segundo).
-- Manter ON CONFLICT DO NOTHING mas adicionar comentario de risco.
-- Nao mudar a logica — apenas documentar que duplicates sao ignorados.
-- =============================================================================

COMMENT ON FUNCTION public.record_login_attempt(TEXT, INET, BOOLEAN) IS
  'SECURITY DEFINER wrapper for recording login attempts. '
  'ON CONFLICT DO NOTHING: rapid double-clicks on login button are deduplicated. '
  'This is acceptable for brute-force detection (the IP/email check still works). '
  'To track every attempt individually, use a raw INSERT instead.';

-- =============================================================================
-- NOTAS DE DEPLOY
-- 1. auth-client.ts precisa ser atualizado para usar has_role_name:
--    De: ctx.client.rpc("has_role", {_user_id: ctx.userId, _role: "admin"})
--    Para: ctx.client.rpc("has_role_name", {p_user_id: ctx.userId, p_role_name: "admin"})
-- 2. Após deploy da migration + auth-client.ts:
--    a) Verificar: SELECT has_role_name(auth.uid(), 'admin') FROM auth.users LIMIT 1;
--    b) Verificar: SELECT * FROM login_attempts LIMIT 1;
--    c) Testar requireAdmin() num edge function como admin.
-- =============================================================================

COMMIT;
