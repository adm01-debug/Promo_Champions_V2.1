-- ============================================================
-- Auditoria Banco de Dados / Integridade — pacote [FK-ONDELETE]
-- Ações ON DELETE explícitas em FKs criadas sem regra (NO ACTION)
-- ============================================================
-- Semântica aplicada:
--   * -> auth.users / public.salespeople: SET NULL — colunas de
--     atribuição/auditoria preservam o histórico quando o usuário ou
--     vendedor é removido. Se a coluna for NOT NULL em produção, o
--     bloco aplica RESTRICT (documentado) em vez de falhar.
--   * Filhos dependentes (linhas de junção/regra/histórico que não
--     fazem sentido sem o pai): CASCADE.
--   * Demais referências de negócio (sales->clients/products/
--     pipelines/territories, trilhas de auditoria): SET NULL.
-- Defensivo e idempotente:
--   * Resolve o nome real da constraint via pg_catalog (funciona com
--     qualquer nome gerado em produção);
--   * Pula quando a ação desejada já está em vigor, quando a coluna
--     não existe ou quando a FK não existe (registra NOTICE);
--   * Só trata FKs de coluna única (multi-coluna registrada p/ revisão).
-- ATENÇÃO: a lista abaixo foi enumerada das migrations do repo
-- (grep REFERENCES sem ON DELETE). Conferir contra produção com:
--   SELECT conrelid::regclass, conname, confdeltype
--   FROM pg_constraint WHERE contype='f' AND confdeltype='a'
--   AND connamespace='public'::regnamespace;
-- ============================================================

DO $$
DECLARE
  spec       RECORD;
  v_conname  text;
  v_deltype  text;
  v_notnull  boolean;
  v_action   text;
  v_changed  int := 0;
  v_already  int := 0;
  v_skipped  int := 0;
  v_fallback int := 0;
BEGIN
  FOR spec IN
    SELECT * FROM (VALUES
      -- ---------- Filhos dependentes -> CASCADE ----------
      ('competitive_chat_messages','matchup_id','public','weekly_matchups','id','CASCADE'),
      ('league_history','league_id','public','leagues','id','CASCADE'),
      ('competitors_pricing','product_id','public','products','id','CASCADE'),
      ('competitors_pricing','competitor_id','public','competitors_registry','id','CASCADE'),
      ('price_protection_rules','product_id','public','products','id','CASCADE'),
      ('pricing_rules','product_id','public','products','id','CASCADE'),

      -- ---------- Referências a auth.users -> SET NULL ----------
      ('audit_log','user_id','auth','users','id','SET NULL'),
      ('data_access_log','user_id','auth','users','id','SET NULL'),
      ('security_events','user_id','auth','users','id','SET NULL'),
      ('user_roles','assigned_by','auth','users','id','SET NULL'),
      ('cadences','created_by','auth','users','id','SET NULL'),
      ('entity_versions','changed_by','auth','users','id','SET NULL'),
      ('access_denied_logs','user_id','auth','users','id','SET NULL'),
      ('account_plans','created_by','auth','users','id','SET NULL'),
      ('activity_audit_logs','changed_by','auth','users','id','SET NULL'),
      ('approval_decisions','approver_id','auth','users','id','SET NULL'),
      ('approval_workflows','created_by','auth','users','id','SET NULL'),
      ('audit_logs','changed_by','auth','users','id','SET NULL'),
      ('blocked_ips','blocked_by','auth','users','id','SET NULL'),
      ('client_interactions','user_id','auth','users','id','SET NULL'),
      ('clients','user_id','auth','users','id','SET NULL'),
      ('commercial_approval_requests','approver_id','auth','users','id','SET NULL'),
      ('commercial_approval_requests','requester_id','auth','users','id','SET NULL'),
      ('cs_tickets','assigned_to','auth','users','id','SET NULL'),
      ('follow_up_audit_logs','user_id','auth','users','id','SET NULL'),
      ('follow_up_notifications','user_id','auth','users','id','SET NULL'),
      ('follow_up_templates','created_by','auth','users','id','SET NULL'),
      ('follow_up_territory_rules','salesperson_id','auth','users','id','SET NULL'),
      ('ip_whitelist','added_by','auth','users','id','SET NULL'),
      ('lead_detailed_logs','created_by','auth','users','id','SET NULL'),
      ('pipeline_inspections','inspector_id','auth','users','id','SET NULL'),
      ('slow_query_alerts','acknowledged_by','auth','users','id','SET NULL'),
      ('webhooks','created_by','auth','users','id','SET NULL'),
      ('whatsapp_conversations','sender_id','auth','users','id','SET NULL'),
      ('whatsapp_template_versions','created_by','auth','users','id','SET NULL'),

      -- ---------- Referências a salespeople -> SET NULL ----------
      ('objections_library','created_by','public','salespeople','id','SET NULL'),
      ('playbook_progress','completed_by','public','salespeople','id','SET NULL'),
      ('prospect_cadences','salesperson_id','public','salespeople','id','SET NULL'),
      ('client_portfolio','assigned_by','public','salespeople','id','SET NULL'),
      ('lead_routing_log','from_salesperson_id','public','salespeople','id','SET NULL'),
      ('lead_routing_log','to_salesperson_id','public','salespeople','id','SET NULL'),
      ('digital_signatures','created_by','public','salespeople','id','SET NULL'),
      ('quotes','created_by','public','salespeople','id','SET NULL'),
      ('sales_battles','winner_id','public','salespeople','id','SET NULL'),
      ('sales_battles','created_by','public','salespeople','id','SET NULL'),
      ('weekly_matchups','winner_id','public','salespeople','id','SET NULL'),
      ('competitive_chat_messages','target_salesperson_id','public','salespeople','id','SET NULL'),
      ('tournaments','created_by','public','salespeople','id','SET NULL'),
      ('tournament_matches','player1_id','public','salespeople','id','SET NULL'),
      ('tournament_matches','player2_id','public','salespeople','id','SET NULL'),
      ('tournament_matches','winner_id','public','salespeople','id','SET NULL'),
      ('sales_territories','current_owner_id','public','salespeople','id','SET NULL'),
      ('deal_risk_signals','resolved_by','public','salespeople','id','SET NULL'),
      ('mql_qualifications','qualified_by','public','salespeople','id','SET NULL'),
      ('territories','current_owner_id','public','salespeople','id','SET NULL'),
      ('sale_notifications_audit','seller_id','public','salespeople','id','SET NULL'),
      ('sale_notifications_audit','recipient_id','public','salespeople','id','SET NULL'),
      ('sales','salesperson_id','public','salespeople','id','SET NULL'),
      ('sales','sdr_id','public','salespeople','id','SET NULL'),
      ('sales','closer_id','public','salespeople','id','SET NULL'),
      ('sales_goals','salesperson_id','public','salespeople','id','SET NULL'),
      ('activity_goals','salesperson_id','public','salespeople','id','SET NULL'),
      ('achievements','salesperson_id','public','salespeople','id','SET NULL'),
      ('conversation_analyses','analyzed_by','public','salespeople','id','SET NULL'),

      -- ---------- Referências de negócio -> SET NULL ----------
      ('sales','client_id','public','clients','id','SET NULL'),
      ('sales','product_id','public','products','id','SET NULL'),
      ('sales','pipeline_id','public','pipelines','id','SET NULL'),
      ('sales','territory_id','public','territories','id','SET NULL'),
      ('sales','lost_to_competitor_id','public','competitors_registry','id','SET NULL'),
      ('activities','client_id','public','clients','id','SET NULL'),
      ('activities','sale_id','public','sales','id','SET NULL'),
      ('activities','salesperson_id','public','salespeople','id','SET NULL'),
      ('quote_items','product_id','public','products','id','SET NULL'),
      ('accounts','parent_account_id','public','accounts','id','SET NULL'),
      ('salespeople','squad_id','public','squads','id','SET NULL'),
      ('follow_up_notifications','sale_id','public','sales','id','SET NULL'),
      ('follow_up_notifications','audit_log_id','public','follow_up_audit_logs','id','SET NULL'),
      ('follow_up_audit_logs','sale_id','public','sales','id','SET NULL'),
      ('sale_notifications_audit','sale_id','public','sales','id','SET NULL'),
      ('follow_up_settings','current_whatsapp_version_id','public','whatsapp_template_versions','id','SET NULL'),
      ('follow_up_territory_rules','whatsapp_template_id','public','follow_up_templates','id','SET NULL'),
      ('cadence_outcome_rules','email_template_id','public','cadence_alert_templates','id','SET NULL'),
      ('cadence_outcome_rules','push_template_id','public','cadence_alert_templates','id','SET NULL'),
      ('call_intelligence_triggers','target_asset_id','public','sales_enablement_assets','id','SET NULL'),
      ('playbook_items','asset_id','public','sales_enablement_assets','id','SET NULL')
    ) AS s(child_table, child_col, parent_schema, parent_table, parent_col, desired_action)
  LOOP
    -- Resolve a FK existente (nome real em produção, coluna única)
    SELECT con.conname, con.confdeltype
      INTO v_conname, v_deltype
    FROM pg_constraint con
    JOIN pg_class ct      ON ct.oid = con.conrelid
    JOIN pg_namespace n   ON n.oid  = ct.relnamespace
    JOIN pg_class pt      ON pt.oid = con.confrelid
    JOIN pg_namespace pn  ON pn.oid = pt.relnamespace
    JOIN pg_attribute a   ON a.attrelid = con.conrelid
                         AND a.attnum   = ANY(con.conkey)
    WHERE con.contype = 'f'
      AND array_length(con.conkey, 1) = 1
      AND n.nspname  = 'public'         AND ct.relname = spec.child_table
      AND pn.nspname = spec.parent_schema AND pt.relname = spec.parent_table
      AND a.attname  = spec.child_col
    LIMIT 1;

    IF v_conname IS NULL THEN
      v_skipped := v_skipped + 1;
      RAISE NOTICE 'FK %.% -> %.% inexistente ou multi-coluna — nada a fazer',
        spec.child_table, spec.child_col, spec.parent_table, spec.parent_col;
      CONTINUE;
    END IF;

    v_action := spec.desired_action;

    -- confdeltype: a=NO ACTION r=RESTRICT c=CASCADE n=SET NULL d=SET DEFAULT
    IF (v_action = 'CASCADE'  AND v_deltype = 'c')
    OR (v_action = 'SET NULL' AND v_deltype = 'n')
    OR (v_action = 'RESTRICT' AND v_deltype = 'r') THEN
      v_already := v_already + 1;
      CONTINUE;
    END IF;

    -- Coluna NOT NULL não aceita SET NULL: aplica RESTRICT (documentado)
    IF v_action = 'SET NULL' THEN
      SELECT a.attnotnull INTO v_notnull
      FROM pg_attribute a
      JOIN pg_class c ON c.oid = a.attrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public'
        AND c.relname = spec.child_table
        AND a.attname = spec.child_col
        AND a.attnum > 0;
      IF v_notnull THEN
        v_action := 'RESTRICT';
        v_fallback := v_fallback + 1;
      END IF;
    END IF;

    EXECUTE format('ALTER TABLE public.%I DROP CONSTRAINT %I',
                   spec.child_table, v_conname);
    EXECUTE format('ALTER TABLE public.%I ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES %I.%I(%I) ON DELETE %s',
                   spec.child_table, v_conname, spec.child_col,
                   spec.parent_schema, spec.parent_table, spec.parent_col, v_action);
    v_changed := v_changed + 1;
    RAISE NOTICE 'FK %.% -> %.%: ON DELETE % aplicado',
      spec.child_table, spec.child_col, spec.parent_table, spec.parent_col, v_action;
  END LOOP;

  RAISE NOTICE 'FK-ONDELETE: % alteradas, % já corretas, % sem FK/ignoradas, % RESTRICT por NOT NULL',
    v_changed, v_already, v_skipped, v_fallback;
END $$;
