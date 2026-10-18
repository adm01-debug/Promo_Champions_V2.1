-- Correções LGPD (auditoria): consentimento por telefone, match canônico de
-- telefone, anonimização por identificador (não por nome), policy INSERT de
-- data_subject_requests e tombstone de opt-out.
--
-- 1. public.canonical_phone_key: sufixo BR canônico (11 dígitos) — alinha o
--    match SQL ao normalizeToE164 do twilio-click-to-call/send-multichannel-
--    message: '(11) 97777-6666', '04111977776666' e '+5511977776666'
--    convergem para a mesma chave. Também cobre o match exato antigo
--    (right() retorna a string inteira quando há menos de 11 dígitos).
-- 2. has_phone_consent: TRUE só quando existe titular com o telefone E TODO
--    cliente com aquele telefone normalizado tem consentimento ativo. A
--    versão anterior exigia count=1 dentro do EXISTS já filtrado por
--    consentimento — telefone compartilhado por 2 clientes onde só 1
--    consentia retornava TRUE (consentia por proxy).
-- 3. is_recipient_opted_out: match pela chave canônica dos dois lados —
--    antes '(11) 97777-6666' vs '+5511977776666' não casavam e a mensagem
--    era enviada para quem pediu descadastro.
-- 4. data_subject_requests INSERT: exige subject_id E subject_email do
--    próprio titular — o OR permitia forjar vítima (subject_id próprio +
--    e-mail alheio).
-- 5. anonymize_data_subject: para de casar por NOME em channel_interactions,
--    activities e buying_committee (dados de homônimos eram destruídos).
--    Casa por e-mail/telefone canônico do titular; em colunas sem
--    identificador próprio (contact_name), restringe às vendas do titular.
-- 6. email_opt_outs NÃO é anonimizado: a lista de supressão precisa
--    sobreviver à eliminação — anonimizar o e-mail faria o titular
--    reimportado voltar a receber mensagens (tombstone legítimo).

-- ---------------------------------------------------------------------------
-- 1. Chave canônica de telefone (sufixo nacional BR de 11 dígitos).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.canonical_phone_key(p_phone text)
RETURNS text
LANGUAGE sql
IMMUTABLE
STRICT
SET search_path = public
AS $$
  SELECT right(regexp_replace(p_phone, '\D', '', 'g'), 11);
$$;

REVOKE ALL ON FUNCTION public.canonical_phone_key(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.canonical_phone_key(text) TO authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 2. Consentimento por telefone: TODOS os titulares do número precisam ter
--    consentido, não apenas um.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.has_phone_consent(
  p_phone text,
  p_purpose text
) RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    -- o telefone precisa resolver para pelo menos um titular
    EXISTS (
      SELECT 1
      FROM public.clients cl
      WHERE cl.phone IS NOT NULL
        AND cl.deleted_at IS NULL
        AND public.canonical_phone_key(cl.phone) = public.canonical_phone_key(p_phone)
    )
    -- e nenhum titular com o mesmo telefone pode estar sem consentimento:
    -- consentir por proxy gravaria a chamada de quem nunca aceitou.
    AND NOT EXISTS (
      SELECT 1
      FROM public.clients cl
      WHERE cl.phone IS NOT NULL
        AND cl.deleted_at IS NULL
        AND public.canonical_phone_key(cl.phone) = public.canonical_phone_key(p_phone)
        AND NOT (
          (cl.email IS NOT NULL AND public.has_active_consent(cl.email, p_purpose))
          OR EXISTS (
            SELECT 1
            FROM public.consent_records c
            WHERE c.subject_client_id = cl.id
              AND c.purpose = p_purpose
              AND c.revoked_at IS NULL
          )
        )
    );
$$;

REVOKE ALL ON FUNCTION public.has_phone_consent(text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_phone_consent(text, text) TO authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 3. Opt-out por telefone: match pela chave canônica em clients e
--    account_contacts (alinhado ao normalizeToE164 das funções de envio).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_recipient_opted_out(
  p_phone text
) RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.clients cl
    WHERE cl.phone IS NOT NULL
      AND cl.email IS NOT NULL
      AND cl.deleted_at IS NULL
      AND public.canonical_phone_key(cl.phone) = public.canonical_phone_key(p_phone)
      AND public.is_email_opted_out(cl.email)
  )
  OR EXISTS (
    SELECT 1
    FROM public.account_contacts ac
    WHERE ac.phone IS NOT NULL
      AND ac.email IS NOT NULL
      AND public.canonical_phone_key(ac.phone) = public.canonical_phone_key(p_phone)
      AND public.is_email_opted_out(ac.email)
  );
$$;

REVOKE ALL ON FUNCTION public.is_recipient_opted_out(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_recipient_opted_out(text) TO authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 4. INSERT de data_subject_requests: subject_id e subject_email precisam
--    ser do próprio titular (ambos), não um OU outro.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Titular abre própria solicitação" ON public.data_subject_requests;
CREATE POLICY "Titular abre própria solicitação" ON public.data_subject_requests
  FOR INSERT TO authenticated
  WITH CHECK (
    subject_id = auth.uid()
    AND lower(subject_email) = lower(auth.jwt() ->> 'email')
  );

-- ---------------------------------------------------------------------------
-- 5+6. anonymize_data_subject: identificação por e-mail/telefone/ids (nunca
--      por nome sozinho) e tombstone de email_opt_outs preservado.
-- ---------------------------------------------------------------------------
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
  v_client_ids uuid[];
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
  -- que só guardam o nome — usado SOMENTE dentro das vendas do próprio
  -- titular (v_client_ids), nunca como match global (homônimos).
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

  -- Ids dos clientes do titular: escopo id-based para as colunas que só
  -- guardam nome (activities.contact_name, buying_committee.contact_name).
  BEGIN
    SELECT array_agg(id) INTO v_client_ids
    FROM public.clients
    WHERE (p_subject_email IS NOT NULL AND lower(email) = lower(p_subject_email))
       OR (p_subject_id IS NOT NULL AND id = p_subject_id);
    v_client_ids := COALESCE(v_client_ids, '{}'::uuid[]);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_client_ids := '{}'::uuid[];
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

  -- buying_committee só tem contact_name: antes casava por nome global e
  -- destruía dados de homônimos. Agora limita às vendas do titular
  -- (client_id resolvido por e-mail/subject_id).
  BEGIN
    UPDATE public.buying_committee
       SET contact_name = 'Titular anonimizado ' || v_token,
           notes = NULL
     WHERE contact_name = v_name
       AND sale_id IN (
         SELECT s.id FROM public.sales s WHERE s.client_id = ANY(v_client_ids)
       );
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

  -- channel_interactions: casa por e-mail ou telefone canônico do titular
  -- em contact_info — o OR por contact_name global removia dados de
  -- homônimos que nunca foram o titular.
  BEGIN
    UPDATE public.channel_interactions
       SET contact_name = 'Titular anonimizado ' || v_token,
           contact_info = 'anon-' || v_token || '@anon.invalid'
     WHERE (p_subject_email IS NOT NULL AND lower(contact_info) = lower(p_subject_email))
        OR (p_phone IS NOT NULL
            AND (contact_info = p_phone
                 OR public.canonical_phone_key(contact_info) = public.canonical_phone_key(p_phone)));
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('channel_interactions', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('channel_interactions', 0);
  END;

  -- activities só tem contact_name: mesmo critério do buying_committee —
  -- nome dentro das vendas do titular, nunca match global por nome.
  BEGIN
    UPDATE public.activities
       SET contact_name = 'Titular anonimizado ' || v_token
     WHERE contact_name = v_name
       AND sale_id IN (
         SELECT s.id FROM public.sales s WHERE s.client_id = ANY(v_client_ids)
       );
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

  -- Tombstone de supressão: email_opt_outs NÃO é anonimizado. A lista de
  -- opt-out é a base legal para nunca mais contatar o titular — apagar o
  -- e-mail aqui faria um titular reimportado voltar a receber mensagens.
  BEGIN
    SELECT count(*) INTO v_n
    FROM public.email_opt_outs
    WHERE p_subject_email IS NOT NULL AND lower(email) = lower(p_subject_email);
    v_counts := v_counts || jsonb_build_object('email_opt_outs_preserved', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('email_opt_outs_preserved', 0);
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
       SET ip_address = NULL
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
