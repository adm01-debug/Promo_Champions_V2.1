-- LGPD: consentimento, solicitações de titular e anonimização
-- Pacote de auditoria BANCO DE DADOS/INTEGRIDADE.
--
-- 1. public.consent_records: registro de consentimento do titular
--    (subject_id/subject_email/subject_client_id, purpose, granted_at, revoked_at)
--    com RLS: admin/manager tudo; titular lê e revoga o próprio.
-- 2. public.data_subject_requests: fila de solicitações do titular
--    (acesso, retificação, eliminação, portabilidade, revogação) com SLA de 15 dias.
-- 3. website_visitor_logs passa a ter base legal (legitimate_interest por padrão),
--    vínculo opcional a consent_records e retention_expires_at para purge.
-- 4. public.anonymize_data_subject(...): RPC SECURITY DEFINER que reescreve PII
--    (nome, e-mail, telefone, IP, user-agent) para tombstone hash em todas as
--    tabelas com PII do schema, preservando ids e métricas agregadas.
--
-- Idempotente e defensiva: cada bloco tolera tabela/coluna ausente em produção
-- (EXCEPTION WHEN undefined_table/undefined_column), pois não há acesso ao banco
-- real para confirmar drift de schema. Verificação pós-aplicação em docs/LGPD.md.

-- ============================================================
-- 1. consent_records
-- ============================================================

CREATE TABLE IF NOT EXISTS public.consent_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  subject_email text,
  subject_client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  purpose text NOT NULL,
  legal_basis text NOT NULL DEFAULT 'consent'
    CHECK (legal_basis IN ('consent', 'legitimate_interest', 'contract', 'legal_obligation')),
  source text,
  granted_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  granted_by uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT consent_records_subject_required
    CHECK (subject_id IS NOT NULL OR subject_email IS NOT NULL OR subject_client_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_consent_records_subject_email
  ON public.consent_records (lower(subject_email)) WHERE revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_consent_records_subject_id
  ON public.consent_records (subject_id) WHERE revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_consent_records_purpose
  ON public.consent_records (purpose, revoked_at);

ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
             WHERE n.nspname = 'public' AND p.proname = 'update_updated_at_column')
     AND NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_consent_records_updated_at') THEN
    CREATE TRIGGER update_consent_records_updated_at
      BEFORE UPDATE ON public.consent_records
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

DROP POLICY IF EXISTS "Admins gerenciam consent_records" ON public.consent_records;
CREATE POLICY "Admins gerenciam consent_records" ON public.consent_records
  FOR ALL TO authenticated
  USING (public.is_admin_or_manager(auth.uid()))
  WITH CHECK (public.is_admin_or_manager(auth.uid()));

DROP POLICY IF EXISTS "Titular lê próprio consentimento" ON public.consent_records;
CREATE POLICY "Titular lê próprio consentimento" ON public.consent_records
  FOR SELECT TO authenticated
  USING (
    subject_id = auth.uid()
    OR lower(subject_email) = lower(auth.jwt() ->> 'email')
  );

DROP POLICY IF EXISTS "Titular registra próprio consentimento" ON public.consent_records;
CREATE POLICY "Titular registra próprio consentimento" ON public.consent_records
  FOR INSERT TO authenticated
  WITH CHECK (
    subject_id = auth.uid()
    OR lower(subject_email) = lower(auth.jwt() ->> 'email')
  );

DROP POLICY IF EXISTS "Titular revoga próprio consentimento" ON public.consent_records;
CREATE POLICY "Titular revoga próprio consentimento" ON public.consent_records
  FOR UPDATE TO authenticated
  USING (
    subject_id = auth.uid()
    OR lower(subject_email) = lower(auth.jwt() ->> 'email')
  );

-- ============================================================
-- 2. data_subject_requests (solicitações do titular — LGPD art. 18)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.data_subject_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_type text NOT NULL
    CHECK (request_type IN ('access', 'rectification', 'erasure', 'portability', 'consent_revocation', 'information')),
  subject_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  subject_email text NOT NULL,
  subject_client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected')),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  notes text,
  requested_by uuid,
  requested_at timestamptz NOT NULL DEFAULT now(),
  due_at timestamptz NOT NULL DEFAULT (now() + interval '15 days'),
  processed_by uuid,
  processed_at timestamptz,
  result jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dsr_status_due
  ON public.data_subject_requests (status, due_at);
CREATE INDEX IF NOT EXISTS idx_dsr_subject_email
  ON public.data_subject_requests (lower(subject_email));

ALTER TABLE public.data_subject_requests ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
             WHERE n.nspname = 'public' AND p.proname = 'update_updated_at_column')
     AND NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_data_subject_requests_updated_at') THEN
    CREATE TRIGGER update_data_subject_requests_updated_at
      BEFORE UPDATE ON public.data_subject_requests
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

DROP POLICY IF EXISTS "Admins gerenciam data_subject_requests" ON public.data_subject_requests;
CREATE POLICY "Admins gerenciam data_subject_requests" ON public.data_subject_requests
  FOR ALL TO authenticated
  USING (public.is_admin_or_manager(auth.uid()))
  WITH CHECK (public.is_admin_or_manager(auth.uid()));

DROP POLICY IF EXISTS "Titular abre própria solicitação" ON public.data_subject_requests;
CREATE POLICY "Titular abre própria solicitação" ON public.data_subject_requests
  FOR INSERT TO authenticated
  WITH CHECK (
    subject_id = auth.uid()
    OR lower(subject_email) = lower(auth.jwt() ->> 'email')
  );

DROP POLICY IF EXISTS "Titular lê própria solicitação" ON public.data_subject_requests;
CREATE POLICY "Titular lê própria solicitação" ON public.data_subject_requests
  FOR SELECT TO authenticated
  USING (
    subject_id = auth.uid()
    OR lower(subject_email) = lower(auth.jwt() ->> 'email')
  );

-- ============================================================
-- 3. website_visitor_logs: base legal + janela de retenção
-- ============================================================
-- A tabela guarda IP + empresa desanonimizada. Regra: legítimo interesse
-- com purge automático em 90 dias; consent_record_id prolonga a guarda
-- apenas enquanto houver consentimento ativo (revoked_at IS NULL).

ALTER TABLE public.website_visitor_logs
  ADD COLUMN IF NOT EXISTS legal_basis text NOT NULL DEFAULT 'legitimate_interest';
ALTER TABLE public.website_visitor_logs
  ADD COLUMN IF NOT EXISTS consent_record_id uuid REFERENCES public.consent_records(id) ON DELETE SET NULL;
ALTER TABLE public.website_visitor_logs
  ADD COLUMN IF NOT EXISTS retention_expires_at timestamptz;

ALTER TABLE public.website_visitor_logs
  ALTER COLUMN retention_expires_at SET DEFAULT (now() + interval '90 days');

-- Backfill defensivo: linhas antigas ganham janela de 90d a partir da identificação.
UPDATE public.website_visitor_logs
  SET retention_expires_at = identified_at + interval '90 days'
  WHERE retention_expires_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_website_visitor_logs_retention
  ON public.website_visitor_logs (retention_expires_at)
  WHERE consent_record_id IS NULL;

-- Consentimento ativo por e-mail + finalidade (usada por guards e pela verificação manual)
CREATE OR REPLACE FUNCTION public.has_active_consent(
  p_subject_email text,
  p_purpose text
) RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.consent_records c
    WHERE c.purpose = p_purpose
      AND c.revoked_at IS NULL
      AND lower(c.subject_email) = lower(p_subject_email)
  );
$$;

REVOKE ALL ON FUNCTION public.has_active_consent(text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_active_consent(text, text) TO authenticated, service_role;

-- Guard de inserção: carimba a janela de retenção e vincula consentimento de
-- visitor_tracking quando existir (mesmo domínio/e-mail da empresa identificada).
CREATE OR REPLACE FUNCTION public.fn_website_visitor_log_consent()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF NEW.retention_expires_at IS NULL THEN
    NEW.retention_expires_at := COALESCE(NEW.identified_at, now()) + interval '90 days';
  END IF;

  IF NEW.consent_record_id IS NULL AND NEW.domain IS NOT NULL THEN
    SELECT c.id INTO NEW.consent_record_id
    FROM public.consent_records c
    WHERE c.purpose = 'visitor_tracking'
      AND c.revoked_at IS NULL
      AND c.subject_email IS NOT NULL
      AND lower(split_part(c.subject_email, '@', 2)) = lower(NEW.domain)
    ORDER BY c.granted_at DESC
    LIMIT 1;

    IF NEW.consent_record_id IS NOT NULL THEN
      NEW.legal_basis := 'consent';
      NEW.retention_expires_at := NULL; -- guarda regida pelo consentimento, não pela janela
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_website_visitor_log_consent ON public.website_visitor_logs;
CREATE TRIGGER trg_website_visitor_log_consent
  BEFORE INSERT ON public.website_visitor_logs
  FOR EACH ROW EXECUTE FUNCTION public.fn_website_visitor_log_consent();

-- ============================================================
-- 4. Anonimização do titular (direito de eliminação — LGPD art. 18, VI)
-- ============================================================
-- Reescreve PII para tombstone derivado de hash dos identificadores,
-- preservando ids, FKs e métricas agregadas (valores, datas, scores).
-- Cada UPDATE é isolado em bloco BEGIN/EXCEPTION: se a tabela ou coluna
-- não existir em produção, o bloco é pulado e registrado como 0 linhas.

CREATE OR REPLACE FUNCTION public.anonymize_data_subject(
  p_subject_email text DEFAULT NULL,
  p_subject_id uuid DEFAULT NULL,
  p_phone text DEFAULT NULL,
  p_ip text DEFAULT NULL,
  p_request_id uuid DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_token text;
  v_name text;
  v_counts jsonb := '{}'::jsonb;
  v_n bigint;
BEGIN
  IF auth.role() <> 'service_role'
     AND NOT public.is_admin_or_manager(auth.uid()) THEN
    RAISE EXCEPTION 'forbidden: somente admin/manager ou service_role podem anonimizar titulares';
  END IF;

  IF p_subject_email IS NULL AND p_subject_id IS NULL AND p_phone IS NULL AND p_ip IS NULL THEN
    RAISE EXCEPTION 'pelo menos um identificador do titular é obrigatório (email, subject_id, phone ou ip)';
  END IF;

  v_token := left(md5(
    coalesce(lower(p_subject_email), '') || '|' ||
    coalesce(p_subject_id::text, '') || '|' ||
    coalesce(p_phone, '')
  ), 16);
  v_name := 'Titular anonimizado ' || v_token;

  -- Captura o nome atual do titular (quando houver) para limpar colunas
  -- que só guardam o nome (activities.contact_name, buying_committee.contact_name).
  BEGIN
    SELECT name INTO v_name
    FROM public.clients
    WHERE (p_subject_email IS NOT NULL AND lower(email) = lower(p_subject_email))
       OR (p_subject_id IS NOT NULL AND id = p_subject_id)
    LIMIT 1;
    v_name := COALESCE(v_name, 'Titular anonimizado ' || v_token);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_name := 'Titular anonimizado ' || v_token;
  END;

  -- ---- pessoas/contatos ----

  BEGIN
    UPDATE public.clients
       SET name = 'Titular anonimizado ' || v_token,
           email = 'anon-' || v_token || '@anon.invalid',
           phone = NULL,
           updated_at = now()
     WHERE (p_subject_email IS NOT NULL AND lower(email) = lower(p_subject_email))
        OR (p_subject_id IS NOT NULL AND id = p_subject_id);
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('clients', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('clients', 0);
  END;

  BEGIN
    UPDATE public.account_contacts
       SET name = 'Titular anonimizado ' || v_token,
           email = 'anon-' || v_token || '@anon.invalid',
           phone = NULL,
           linkedin_url = NULL,
           notes = NULL
     WHERE p_subject_email IS NOT NULL AND lower(email) = lower(p_subject_email);
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('account_contacts', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('account_contacts', 0);
  END;

  BEGIN
    UPDATE public.person_intelligence
       SET full_name = 'Titular anonimizado ' || v_token,
           email = 'anon-' || v_token || '@anon.invalid',
           current_title = NULL,
           previous_titles = '[]'::jsonb,
           linkedin_url = NULL,
           updated_at = now()
     WHERE p_subject_email IS NOT NULL AND lower(email) = lower(p_subject_email);
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('person_intelligence', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('person_intelligence', 0);
  END;

  BEGIN
    UPDATE public.deal_stakeholders
       SET name = 'Titular anonimizado ' || v_token,
           email = 'anon-' || v_token || '@anon.invalid',
           phone = NULL,
           linkedin_url = NULL,
           notes = NULL
     WHERE p_subject_email IS NOT NULL AND lower(email) = lower(p_subject_email);
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('deal_stakeholders', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('deal_stakeholders', 0);
  END;

  BEGIN
    UPDATE public.buying_committee_members
       SET contact_name = 'Titular anonimizado ' || v_token,
           contact_email = 'anon-' || v_token || '@anon.invalid',
           notes = NULL
     WHERE p_subject_email IS NOT NULL AND lower(contact_email) = lower(p_subject_email);
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('buying_committee_members', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('buying_committee_members', 0);
  END;

  BEGIN
    UPDATE public.buying_committee
       SET contact_name = 'Titular anonimizado ' || v_token,
           notes = NULL
     WHERE contact_name = v_name;
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('buying_committee', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('buying_committee', 0);
  END;

  BEGIN
    UPDATE public.document_signers
       SET name = 'Titular anonimizado ' || v_token,
           email = 'anon-' || v_token || '@anon.invalid'
     WHERE p_subject_email IS NOT NULL AND lower(email) = lower(p_subject_email);
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('document_signers', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('document_signers', 0);
  END;

  BEGIN
    UPDATE public.csat_ces_surveys
       SET contact_email = 'anon-' || v_token || '@anon.invalid'
     WHERE p_subject_email IS NOT NULL AND lower(contact_email) = lower(p_subject_email);
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('csat_ces_surveys', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('csat_ces_surveys', 0);
  END;

  BEGIN
    UPDATE public.channel_interactions
       SET contact_name = 'Titular anonimizado ' || v_token,
           contact_info = 'anon-' || v_token || '@anon.invalid'
     WHERE (p_subject_email IS NOT NULL AND lower(contact_info) = lower(p_subject_email))
        OR (p_phone IS NOT NULL AND contact_info = p_phone)
        OR contact_name = v_name;
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('channel_interactions', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('channel_interactions', 0);
  END;

  BEGIN
    UPDATE public.activities
       SET contact_name = 'Titular anonimizado ' || v_token
     WHERE contact_name = v_name;
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('activities', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('activities', 0);
  END;

  BEGIN
    UPDATE public.suppliers
       SET contact_name = 'Titular anonimizado ' || v_token,
           email = 'anon-' || v_token || '@anon.invalid',
           phone = NULL,
           cnpj = NULL,
           address = NULL,
           updated_at = now()
     WHERE p_subject_email IS NOT NULL AND lower(email) = lower(p_subject_email);
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('suppliers', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('suppliers', 0);
  END;

  BEGIN
    UPDATE public.salespeople
       SET name = 'Titular anonimizado ' || v_token,
           email = 'anon-' || v_token || '@anon.invalid',
           avatar_url = NULL,
           updated_at = now()
     WHERE p_subject_email IS NOT NULL AND lower(email) = lower(p_subject_email);
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('salespeople', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('salespeople', 0);
  END;

  BEGIN
    UPDATE public.email_opt_outs
       SET email = 'anon-' || v_token || '@anon.invalid'
     WHERE p_subject_email IS NOT NULL AND lower(email) = lower(p_subject_email);
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('email_opt_outs', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('email_opt_outs', 0);
  END;

  BEGIN
    UPDATE public.notification_preferences
       SET email = 'anon-' || v_token || '@anon.invalid'
     WHERE p_subject_email IS NOT NULL AND lower(email) = lower(p_subject_email);
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('notification_preferences', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('notification_preferences', 0);
  END;

  -- ---- telefone (SMS/MFA/chamadas/mensagens) ----

  BEGIN
    UPDATE public.sms_verification_codes
       SET phone_number = 'anon-' || v_token
     WHERE p_phone IS NOT NULL AND phone_number = p_phone;
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('sms_verification_codes', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('sms_verification_codes', 0);
  END;

  BEGIN
    UPDATE public.user_mfa_settings
       SET phone_number = NULL
     WHERE p_phone IS NOT NULL AND phone_number = p_phone;
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('user_mfa_settings', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('user_mfa_settings', 0);
  END;

  BEGIN
    UPDATE public.twilio_call_sessions
       SET from_number = CASE WHEN from_number = p_phone THEN 'anon-' || v_token ELSE from_number END,
           to_number   = CASE WHEN to_number   = p_phone THEN 'anon-' || v_token ELSE to_number   END
     WHERE p_phone IS NOT NULL AND (from_number = p_phone OR to_number = p_phone);
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('twilio_call_sessions', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('twilio_call_sessions', 0);
  END;

  BEGIN
    UPDATE public.outbound_messages
       SET to_number = 'anon-' || v_token
     WHERE p_phone IS NOT NULL AND to_number = p_phone;
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('outbound_messages', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('outbound_messages', 0);
  END;

  BEGIN
    UPDATE public.integration_logs
       SET recipient = 'anon-' || v_token || '@anon.invalid'
     WHERE p_subject_email IS NOT NULL AND lower(recipient) = lower(p_subject_email);
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('integration_logs', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('integration_logs', 0);
  END;

  -- ---- website_visitor_logs (IP + empresa desanonimizada) ----

  BEGIN
    UPDATE public.website_visitor_logs
       SET ip_address = NULL,
           company_name = NULL,
           domain = NULL,
           referrer = NULL,
           legal_basis = 'anonymized',
           retention_expires_at = now()
     WHERE (p_ip IS NOT NULL AND ip_address::text = p_ip)
        OR consent_record_id IN (
             SELECT c.id FROM public.consent_records c
             WHERE c.subject_id = p_subject_id
                OR (p_subject_email IS NOT NULL AND lower(c.subject_email) = lower(p_subject_email))
           );
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('website_visitor_logs', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('website_visitor_logs', 0);
  END;

  -- ---- logs de segurança/sessão com IP e user-agent do titular ----

  BEGIN
    UPDATE public.audit_log
       SET ip_address = NULL, user_agent = NULL
     WHERE p_subject_id IS NOT NULL AND user_id = p_subject_id;
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('audit_log', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('audit_log', 0);
  END;

  BEGIN
    UPDATE public.audit_logs
       SET ip_address = NULL, user_agent = NULL
     WHERE p_subject_id IS NOT NULL
       AND (changed_by = p_subject_id OR actor_id = p_subject_id);
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('audit_logs', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('audit_logs', 0);
  END;

  BEGIN
    UPDATE public.login_attempts
       SET email = 'anon-' || v_token || '@anon.invalid',
           ip_address = NULL,
           user_agent = NULL
     WHERE p_subject_email IS NOT NULL AND lower(email) = lower(p_subject_email);
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('login_attempts', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('login_attempts', 0);
  END;

  BEGIN
    UPDATE public.session_activity
       SET ip_address = NULL, user_agent = NULL
     WHERE p_subject_id IS NOT NULL AND user_id = p_subject_id;
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('session_activity', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('session_activity', 0);
  END;

  BEGIN
    UPDATE public.active_sessions
       SET ip_address = NULL, user_agent = NULL
     WHERE p_subject_id IS NOT NULL AND user_id = p_subject_id;
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('active_sessions', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('active_sessions', 0);
  END;

  BEGIN
    UPDATE public.known_devices
       SET ip_address = NULL, user_agent = NULL
     WHERE p_subject_id IS NOT NULL AND user_id = p_subject_id;
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('known_devices', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('known_devices', 0);
  END;

  BEGIN
    UPDATE public.security_events
       SET ip_address = NULL
     WHERE p_subject_id IS NOT NULL AND user_id = p_subject_id;
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('security_events', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('security_events', 0);
  END;

  BEGIN
    UPDATE public.login_alerts
       SET ip_address = NULL, user_agent = NULL
     WHERE p_subject_id IS NOT NULL AND user_id = p_subject_id;
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('login_alerts', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('login_alerts', 0);
  END;

  BEGIN
    UPDATE public.mfa_verification_attempts
       SET ip_address = NULL, user_agent = NULL
     WHERE p_subject_id IS NOT NULL AND user_id = p_subject_id;
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('mfa_verification_attempts', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('mfa_verification_attempts', 0);
  END;

  BEGIN
    UPDATE public.password_reset_requests
       SET ip_address = NULL, user_agent = NULL
     WHERE p_subject_id IS NOT NULL AND user_id = p_subject_id;
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('password_reset_requests', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('password_reset_requests', 0);
  END;

  BEGIN
    UPDATE public.reauthentication_requests
       SET ip_address = NULL
     WHERE p_subject_id IS NOT NULL AND user_id = p_subject_id;
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('reauthentication_requests', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('reauthentication_requests', 0);
  END;

  BEGIN
    UPDATE public.user_2fa_log
       SET ip_address = NULL, user_agent = NULL
     WHERE p_subject_id IS NOT NULL AND user_id = p_subject_id;
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('user_2fa_log', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('user_2fa_log', 0);
  END;

  BEGIN
    UPDATE public.access_denied_logs
       SET ip_address = NULL, user_agent = NULL
     WHERE p_subject_id IS NOT NULL AND user_id = p_subject_id;
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('access_denied_logs', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('access_denied_logs', 0);
  END;

  BEGIN
    UPDATE public.error_logs
       SET user_agent = NULL
     WHERE p_subject_id IS NOT NULL AND user_id = p_subject_id;
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('error_logs', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('error_logs', 0);
  END;

  BEGIN
    UPDATE public.web_vitals_samples
       SET user_agent = NULL, session_id = NULL
     WHERE p_subject_id IS NOT NULL AND user_id = p_subject_id;
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('web_vitals_samples', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('web_vitals_samples', 0);
  END;

  -- Revoga consentimentos ativos do titular (registro da eliminação)
  BEGIN
    UPDATE public.consent_records
       SET revoked_at = now(), updated_at = now()
     WHERE revoked_at IS NULL
       AND (subject_id = p_subject_id
            OR (p_subject_email IS NOT NULL AND lower(subject_email) = lower(p_subject_email)));
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('consent_records_revoked', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('consent_records_revoked', 0);
  END;

  -- Se a chamada veio de uma solicitação de titular, marca-a como concluída.
  IF p_request_id IS NOT NULL THEN
    UPDATE public.data_subject_requests
       SET status = 'completed',
           processed_by = auth.uid(),
           processed_at = now(),
           result = v_counts,
           updated_at = now()
     WHERE id = p_request_id;
  END IF;

  RETURN v_counts;
END;
$$;

REVOKE ALL ON FUNCTION public.anonymize_data_subject(text, uuid, text, text, uuid)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.anonymize_data_subject(text, uuid, text, text, uuid)
  TO authenticated, service_role;
