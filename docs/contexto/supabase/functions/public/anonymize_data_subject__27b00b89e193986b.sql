CREATE OR REPLACE FUNCTION public.anonymize_data_subject(p_subject_email text DEFAULT NULL::text, p_subject_id uuid DEFAULT NULL::uuid, p_phone text DEFAULT NULL::text, p_ip text DEFAULT NULL::text, p_request_id uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_token text;
  v_name text;
  v_client_ids uuid[];
  v_salesperson_ids uuid[];
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
       OR (p_phone IS NOT NULL AND phone IS NOT NULL
           AND public.canonical_phone_key(phone) = public.canonical_phone_key(p_phone))
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
       OR (p_subject_id IS NOT NULL AND id = p_subject_id)
       OR (p_phone IS NOT NULL AND phone IS NOT NULL
           AND public.canonical_phone_key(phone) = public.canonical_phone_key(p_phone));
    v_client_ids := COALESCE(v_client_ids, '{}'::uuid[]);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_client_ids := '{}'::uuid[];
  END;

  -- Ids do titular como vendedor (quando é usuário interno): usado para
  -- quotes.seller_name — só por e-mail, o mesmo critério do UPDATE de
  -- salespeople abaixo.
  BEGIN
    SELECT array_agg(id) INTO v_salesperson_ids
    FROM public.salespeople
    WHERE p_subject_email IS NOT NULL AND lower(email) = lower(p_subject_email);
    v_salesperson_ids := COALESCE(v_salesperson_ids, '{}'::uuid[]);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_salesperson_ids := '{}'::uuid[];
  END;

  -- ---- pessoas/contatos ----

  BEGIN
    UPDATE public.clients
       SET name = 'Titular anonimizado ' || v_token,
           email = 'anon-' || v_token || '@anon.invalid',
           phone = NULL,
           updated_at = now()
     WHERE (p_subject_email IS NOT NULL AND lower(email) = lower(p_subject_email))
        OR (p_subject_id IS NOT NULL AND id = p_subject_id)
        OR (p_phone IS NOT NULL AND phone IS NOT NULL
            AND public.canonical_phone_key(phone) = public.canonical_phone_key(p_phone));
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
     WHERE (p_subject_email IS NOT NULL AND lower(email) = lower(p_subject_email))
        OR (p_phone IS NOT NULL AND phone IS NOT NULL
            AND public.canonical_phone_key(phone) = public.canonical_phone_key(p_phone));
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

  -- Logs e filas de e-mail: recipient_email era PII preservada.
  BEGIN
    UPDATE public.email_logs
       SET recipient_email = 'anon-' || v_token || '@anon.invalid'
     WHERE p_subject_email IS NOT NULL AND lower(recipient_email) = lower(p_subject_email);
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('email_logs', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('email_logs', 0);
  END;

  BEGIN
    UPDATE public.email_tracking_events
       SET recipient_email = 'anon-' || v_token || '@anon.invalid'
     WHERE p_subject_email IS NOT NULL AND lower(recipient_email) = lower(p_subject_email);
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('email_tracking_events', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('email_tracking_events', 0);
  END;

  -- Rascunhos de envio em massa: além do e-mail, casa por client_id do
  -- titular (cobra o titular identificado só por telefone).
  BEGIN
    UPDATE public.email_bulk_drafts
       SET recipient_email = 'anon-' || v_token || '@anon.invalid',
           recipient_name = 'Titular anonimizado ' || v_token,
           updated_at = now()
     WHERE (p_subject_email IS NOT NULL AND lower(recipient_email) = lower(p_subject_email))
        OR client_id = ANY (v_client_ids);
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('email_bulk_drafts', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('email_bulk_drafts', 0);
  END;

  -- Vendas do titular: client_name é PII do cliente da venda. Escopo por
  -- client_id — vendas sem client_id ficam de fora (match por nome seria
  -- homônimo-inseguro); documentado no cabeçalho.
  BEGIN
    UPDATE public.sales
       SET client_name = 'Titular anonimizado ' || v_token
     WHERE client_id = ANY (v_client_ids);
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('sales', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('sales', 0);
  END;

  -- Cotações do titular como cliente: client_name/e-mail/telefone. Match
  -- por client_id ou pelo e-mail gravado na cotação.
  BEGIN
    UPDATE public.quotes
       SET client_name = 'Titular anonimizado ' || v_token,
           client_email = 'anon-' || v_token || '@anon.invalid',
           client_phone = NULL
     WHERE client_id = ANY (v_client_ids)
        OR (p_subject_email IS NOT NULL AND lower(client_email) = lower(p_subject_email));
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('quotes', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('quotes', 0);
  END;

  -- Cotações emitidas pelo titular como vendedor: seller_name é PII dele.
  BEGIN
    UPDATE public.quotes
       SET seller_name = 'Titular anonimizado ' || v_token
     WHERE created_by = ANY (v_salesperson_ids);
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('quotes_seller', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('quotes_seller', 0);
  END;

  -- Transcrições/análises de conversa dos clientes do titular: transcript é
  -- NOT NULL, então recebe marcador; campos livres/arrays que podem conter
  -- nomes também são limpos. Órfãs (client_id NULL) casam via
  -- sale_id → sales.client_id.
  BEGIN
    UPDATE public.conversation_analyses
       SET transcript = 'Transcrição anonimizada',
           decision_makers = '{}'::text[],
           summary = NULL,
           objections = '[]'::jsonb,
           next_steps = '[]'::jsonb,
           buying_signals = '{}'::text[],
           risk_signals = '{}'::text[]
     WHERE client_id = ANY (v_client_ids)
        OR sale_id IN (
             SELECT s.id FROM public.sales s WHERE s.client_id = ANY(v_client_ids)
           );
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('conversation_analyses', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('conversation_analyses', 0);
  END;

  -- Pesquisas NPS das vendas do titular: client_name é NOT NULL (recebe
  -- marcador) e comment é texto livre que pode conter PII. Pesquisas sem
  -- sale_id não têm vínculo seguro — ficam de fora.
  BEGIN
    UPDATE public.nps_surveys
       SET client_name = 'Titular anonimizado ' || v_token,
           comment = NULL
     WHERE sale_id IN (
             SELECT s.id FROM public.sales s WHERE s.client_id = ANY(v_client_ids)
           );
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('nps_surveys', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('nps_surveys', 0);
  END;

  -- Estado de alertas de churn: só tem client_name (sem client_id). Match
  -- por nome limitado aos vendedores que têm venda com o titular — mesmo
  -- critério anti-homônimo de buying_committee/activities.
  BEGIN
    UPDATE public.client_churn_alerts_state
       SET client_name = 'Titular anonimizado ' || v_token
     WHERE client_name = v_name
       AND salesperson_id IN (
             SELECT DISTINCT s.salesperson_id
               FROM public.sales s
              WHERE s.client_id = ANY(v_client_ids)
                AND s.salesperson_id IS NOT NULL
           );
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('client_churn_alerts_state', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('client_churn_alerts_state', 0);
  END;

  -- Envios agendados: payload é JSONB livre (destino + corpo da mensagem
  -- com dados do titular). Tomba o payload e cancela envios ainda pendentes
  -- — continuar enviando a um titular eliminado viola a própria exclusão.
  BEGIN
    UPDATE public.scheduled_sends
       SET payload = '{"anonymized": true}'::jsonb,
           status = CASE WHEN status IN ('pending', 'processing')
                         THEN 'cancelled' ELSE status END
     WHERE sale_id IN (
             SELECT s.id FROM public.sales s WHERE s.client_id = ANY(v_client_ids)
           );
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('scheduled_sends', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('scheduled_sends', 0);
  END;

  -- Interações do titular: content/metadata são texto livre com PII.
  BEGIN
    UPDATE public.client_interactions
       SET content = NULL,
           metadata = NULL
     WHERE client_id = ANY (v_client_ids);
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('client_interactions', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('client_interactions', 0);
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
  -- Match por canonical_phone_key (normaliza DDI 55/formatos); nas tabelas
  -- com user_id também casa pelo subject_id do titular.

  BEGIN
    UPDATE public.sms_verification_codes
       SET phone_number = 'anon-' || v_token
     WHERE (p_subject_id IS NOT NULL AND user_id = p_subject_id)
        OR (p_phone IS NOT NULL
            AND public.canonical_phone_key(phone_number) = public.canonical_phone_key(p_phone));
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('sms_verification_codes', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('sms_verification_codes', 0);
  END;

  BEGIN
    UPDATE public.user_mfa_settings
       SET phone_number = NULL
     WHERE (p_subject_id IS NOT NULL AND user_id = p_subject_id)
        OR (p_phone IS NOT NULL
            AND public.canonical_phone_key(phone_number) = public.canonical_phone_key(p_phone));
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('user_mfa_settings', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('user_mfa_settings', 0);
  END;

  BEGIN
    UPDATE public.twilio_call_sessions
       SET from_number = CASE
             WHEN p_phone IS NOT NULL
                  AND public.canonical_phone_key(from_number) = public.canonical_phone_key(p_phone)
             THEN 'anon-' || v_token ELSE from_number END,
           to_number   = CASE
             WHEN p_phone IS NOT NULL
                  AND public.canonical_phone_key(to_number) = public.canonical_phone_key(p_phone)
             THEN 'anon-' || v_token ELSE to_number END
     WHERE p_phone IS NOT NULL
       AND (public.canonical_phone_key(from_number) = public.canonical_phone_key(p_phone)
            OR public.canonical_phone_key(to_number) = public.canonical_phone_key(p_phone));
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('twilio_call_sessions', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('twilio_call_sessions', 0);
  END;

  BEGIN
    UPDATE public.outbound_messages
       SET to_number = 'anon-' || v_token
     WHERE p_phone IS NOT NULL
       AND public.canonical_phone_key(to_number) = public.canonical_phone_key(p_phone);
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

  -- mv_client_ltv carrega clients.name — sem refresh o nome antigo fica
  -- servido até a agenda de refresh_materialized_views() rodar. REFRESH
  -- sem CONCURRENTLY é permitido em função; falhas não abortam a
  -- anonimização (a agenda cobre o reprocessamento).
  BEGIN
    REFRESH MATERIALIZED VIEW public.mv_client_ltv;
    v_counts := v_counts || jsonb_build_object('mv_client_ltv_refreshed', true);
  EXCEPTION WHEN OTHERS THEN
    v_counts := v_counts || jsonb_build_object('mv_client_ltv_refreshed', false);
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
$function$
