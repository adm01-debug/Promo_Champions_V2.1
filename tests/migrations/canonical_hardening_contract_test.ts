import { assert, assertEquals, assertMatch, assertNotMatch } from 'jsr:@std/assert@1';

const MIGRATIONS_DIR = new URL('../../supabase/migrations/', import.meta.url);

const readMigration = (name: string) => Deno.readTextFile(new URL(name, MIGRATIONS_DIR));

Deno.test('migrations pendentes preservam idempotência e autorização', async () => {
  const [webhooks, prizeWheel, leadRouting] = await Promise.all([
    readMigration('20260827000001_harden_webhooks_portfolio_and_idempotency.sql'),
    readMigration('20260830000001_secure_prize_wheel_spins.sql'),
    readMigration('20260830000002_harden_lead_routing.sql'),
  ]);

  assertMatch(webhooks, /uq_inbound_reply_events_provider_message_id/i);
  assertMatch(webhooks, /uq_campaign_health_alerts_dedupe_bucket/i);
  assertMatch(webhooks, /auth\.uid\(\)\s+IS\s+NULL/i);

  assertMatch(prizeWheel, /p_request_id\s+uuid/i);
  assertMatch(prizeWheel, /FOR\s+UPDATE/i);
  assertMatch(prizeWheel, /prize_wheel_spins_salesperson_request_id_key/i);
  assertMatch(prizeWheel, /DROP\s+POLICY\s+IF\s+EXISTS\s+"Insert own spins"/i);

  assertMatch(leadRouting, /pg_advisory_xact_lock/i);
  assertMatch(leadRouting, /auth\.role\(\)\s*<>\s*'service_role'/i);
  assertMatch(leadRouting, /reassign_inactive_client_portfolio/i);
  assertMatch(
    leadRouting,
    /DROP\s+POLICY\s+IF\s+EXISTS\s+"Users can insert own client_portfolio"/i
  );
});

Deno.test('hardening público fecha bypass de views e policies placeholder', async () => {
  const sql = await readMigration(
    '20260831130000_harden_public_access_and_privileged_rpcs.sql'
  );

  const invokerViews = [
    'activities_active',
    'clients_active',
    'tasks_active',
    'v_active_activities',
    'v_active_clients',
    'v_active_products',
    'v_active_suppliers',
    'v_active_teams',
    'v_deleted_clients',
  ];
  for (const view of invokerViews) {
    assertMatch(
      sql,
      new RegExp(
        `ALTER\\s+VIEW\\s+public\\.${view}\\s+SET\\s*\\(security_invoker\\s*=\\s*true\\)`,
        'i'
      ),
      `${view} deve obedecer ao RLS da tabela-base`
    );
  }

  for (const table of ['activities', 'clients', 'products', 'suppliers', 'teams']) {
    assertMatch(
      sql,
      new RegExp(
        `DROP\\s+POLICY\\s+IF\\s+EXISTS\\s+"Users can view active ${table}"`,
        'i'
      ),
      `policy placeholder de ${table} deve ser removida`
    );
  }

  assertMatch(
    sql,
    /REVOKE\s+ALL\s+ON\s+public\.maintenance_log\s+FROM\s+PUBLIC,\s*anon/i
  );
  assertMatch(sql, /DROP\s+POLICY\s+IF\s+EXISTS\s+"anon can read own login attempts"/i);
  assertMatch(
    sql,
    /CREATE\s+OR\s+REPLACE\s+FUNCTION\s+public\.get_login_lockout_status/i
  );
  assertMatch(
    sql,
    /CREATE\s+OR\s+REPLACE\s+FUNCTION\s+public\.record_failed_login_attempt/i
  );
  assertMatch(sql, /current_setting\('request\.headers',\s*true\)/i);
  assertMatch(sql, /la\.ip_address\s*=\s*v_ip/i);
  assertMatch(
    sql,
    /GRANT\s+EXECUTE\s+ON\s+FUNCTION\s+public\.record_failed_login_attempt[\s\S]*TO\s+anon/i
  );
  assertMatch(
    sql,
    /REVOKE\s+ALL\s+ON\s+FUNCTION\s+public\.claim_pending_cadence_tasks[\s\S]*FROM\s+PUBLIC,\s*anon,\s*authenticated/i
  );

  assertNotMatch(sql, /\bDROP\s+(TABLE|COLUMN|FUNCTION)\b/i);
  assertNotMatch(sql, /\bTRUNCATE\s+TABLE\b/i);
});

Deno.test('helpers privilegiados usam auth.uid e allowlist canônica', async () => {
  const sql = await readMigration(
    '20260831130000_harden_public_access_and_privileged_rpcs.sql'
  );

  for (const fn of [
    'soft_delete_record',
    'restore_deleted_record',
    'get_deleted_records',
    'hard_delete_record',
    'restore_record',
  ]) {
    const start = sql.indexOf(`FUNCTION public.${fn}`);
    assert(start >= 0, `${fn} deve existir na migration`);
    const body = sql.slice(start, sql.indexOf('$$;', start) + 3);
    assertMatch(body, /auth\.uid\(\)|auth\.role\(\)/i);
    assertMatch(
      body,
      /NOT\s+IN\s*\('clients',\s*'activities',\s*'products',\s*'suppliers',\s*'teams'\)/i
    );
    assertNotMatch(body, /'deals'/i);
  }

  const hardDelete = sql.slice(sql.indexOf('FUNCTION public.hard_delete_record'));
  assertMatch(hardDelete, /p_admin_user_id\s+IS\s+DISTINCT\s+FROM\s+auth\.uid\(\)/i);
  assertMatch(hardDelete, /has_role\(auth\.uid\(\),\s*'admin'/i);
});

Deno.test('reparos de cron qualificam extensões e são idempotentes', async () => {
  const sql = await readMigration('20260831130001_repair_cron_and_fk_indexes.sql');

  assertMatch(sql, /extensions\.digest\(r\.query_text,\s*'sha1'\)/i);
  assertMatch(sql, /extensions\.pg_stat_statements_reset\(\)/i);
  assertMatch(sql, /information_schema\.tables\s+AS\s+ist/i);
  assertMatch(sql, /ON\s+CONFLICT\s*\(jobid,\s*start_time\)\s+DO\s+NOTHING/i);
  assertMatch(sql, /pg_advisory_xact_lock/i);
  assertMatch(sql, /md5\(s\.id::text\s*\|\|\s*':'\s*\|\|\s*v_week_start::text\)/i);

  const fkIndexes =
    sql.match(/CREATE\s+INDEX\s+IF\s+NOT\s+EXISTS\s+idx_[^\s]+_fk/gi) ?? [];
  assertEquals(fkIndexes.length, 11, 'as 11 FKs sem índice líder devem ser cobertas');
  assertNotMatch(sql, /\bDROP\s+INDEX\b/i);
});

Deno.test('storage ganha limites, MIME allowlist e bucket winloss privado', async () => {
  const sql = await readMigration('20260831130002_harden_storage_buckets.sql');

  for (const bucket of [
    'avatars',
    'call-recordings',
    'quote-pdfs',
    'report-exports',
    'report-snapshots',
  ]) {
    assertMatch(sql, new RegExp(`WHERE\\s+id\\s*=\\s*'${bucket}'`, 'i'));
  }
  assertMatch(sql, /'winloss-reports'[\s\S]*false[\s\S]*'text\/markdown'/i);
  assertMatch(sql, /'audio\/m4a'/i);
  assertNotMatch(sql, /DELETE\s+FROM\s+storage\.objects/i);
  assertNotMatch(sql, /DROP\s+POLICY[^;]*winloss/i);
});

Deno.test('cron de campanha usa destino interno sem literal de credencial', async () => {
  const sql = await readMigration('20260831130003_fix_campaign_health_cron.sql');

  assertMatch(sql, /FROM\s+public\._internal_secrets\s+AS\s+s/i);
  assertMatch(sql, /rtrim\(v_base_url,\s*'\/'\)\s*\|\|\s*'\/campaign-health-alert'/i);
  assertMatch(sql, /'X-Cron-Secret',\s*v_cron_secret/i);
  assertMatch(sql, /SET\s+search_path\s*=\s*public,\s*net/i);
  assertNotMatch(sql, /rapjswienfhkobhlamxb|usyxfpqlsspldubptrdl/i);
  assertNotMatch(sql, /eyJ[A-Za-z0-9_-]{20,}/);
  assertNotMatch(sql, /EXCEPTION\s+WHEN\s+OTHERS/i);
});

Deno.test('crons privilegiados de churn e fila usam segredo interno', async () => {
  const sql = await readMigration('20260831163000_secure_churn_and_task_crons.sql');

  for (const endpoint of ['generate-urgent-client-tasks', 'detect-client-churn-alerts']) {
    assertMatch(
      sql,
      new RegExp(`rtrim\\(v_base_url,\\s*'/'\\)\\s*\\|\\|\\s*'/${endpoint}'`, 'i')
    );
  }
  assertEquals((sql.match(/'X-Cron-Secret',\s*v_cron_secret/gi) ?? []).length, 2);
  assertEquals((sql.match(/SET\s+search_path\s*=\s*public,\s*net/gi) ?? []).length, 2);
  assertMatch(sql, /'SELECT public\.trigger_generate_urgent_client_tasks\(\);'/i);
  assertMatch(sql, /'SELECT public\.trigger_detect_client_churn_alerts\(\);'/i);
  assertNotMatch(sql, /rapjswienfhkobhlamxb|usyxfpqlsspldubptrdl/i);
  assertNotMatch(sql, /eyJ[A-Za-z0-9_-]{20,}/);
  assertNotMatch(sql, /\bDROP\s+(TABLE|COLUMN|FUNCTION)\b/i);
});

Deno.test('crons Edge operacionais usam allowlist e segredo interno', async () => {
  const sql = await readMigration('20260831170000_secure_operational_edge_crons.sql');

  const endpoints = [
    'notify-v4-quote-status',
    'check-v4-callback-alerts',
    'cron-failure-alerter',
    'process-call-recording-ingest',
    'edge-retry-threshold-alert',
  ];
  for (const endpoint of endpoints) {
    assertMatch(sql, new RegExp(`'${endpoint}'`, 'i'));
    assertMatch(sql, new RegExp(`trigger_internal_edge_job\\(''${endpoint}''\\)`, 'i'));
  }

  assertMatch(sql, /p_function_name\s*=\s*ANY\s*\(ARRAY/i);
  assertMatch(sql, /FROM\s+public\._internal_secrets\s+AS\s+s/i);
  assertMatch(sql, /'X-Cron-Secret',\s*v_cron_secret/i);
  assertMatch(sql, /SET\s+search_path\s*=\s*public,\s*net/i);
  assertMatch(
    sql,
    /REVOKE\s+ALL\s+ON\s+FUNCTION\s+public\.trigger_internal_edge_job\(text\)/i
  );
  assertNotMatch(sql, /rapjswienfhkobhlamxb|usyxfpqlsspldubptrdl/i);
  assertNotMatch(sql, /eyJ[A-Za-z0-9_-]{20,}/);
  assertNotMatch(sql, /\bDROP\s+(TABLE|COLUMN|FUNCTION)\b/i);
});

Deno.test(
  'reconciliação operacional cobre jobs quebrados sem expor segredos',
  async () => {
    const sql = await readMigration(
      '20260910153000_reconcile_operational_edge_crons.sql'
    );

    for (const [jobName, endpoint] of [
      ['notify-v4-quote-status-every-5min', 'notify-v4-quote-status'],
      ['check-v4-callback-alerts-every-5min', 'check-v4-callback-alerts'],
      ['cron-failure-alerter-10min', 'cron-failure-alerter'],
      ['process-call-recording-ingest-1min', 'process-call-recording-ingest'],
      ['deal-risk-digest-daily', 'deal-risk-digest'],
      ['email-bulk-retry-15min', 'email-bulk-retry'],
    ]) {
      assertMatch(sql, new RegExp(`cron\\.unschedule\\('${jobName}'`, 'i'));
      assertMatch(sql, new RegExp(`cron\\.schedule\\([\\s\\S]*'${jobName}'`, 'i'));
      assertMatch(sql, new RegExp(`trigger_internal_edge_job\\(''${endpoint}''\\)`, 'i'));
    }

    assertMatch(sql, /p_function_name\s*=\s*ANY\s*\(ARRAY/i);
    assertMatch(sql, /'X-Cron-Secret',\s*v_cron_secret/i);
    assertMatch(sql, /SET\s+search_path\s*=\s*public,\s*net/i);
    assertNotMatch(sql, /rapjswienfhkobhlamxb|usyxfpqlsspldubptrdl/i);
    assertNotMatch(sql, /eyJ[A-Za-z0-9_-]{20,}/);
    assertNotMatch(sql, /\bDROP\s+(TABLE|COLUMN|FUNCTION)\b/i);
  }
);

Deno.test('crons de saúde WAL/webhook seguem o mesmo padrão interno', async () => {
  const sql = await readMigration(
    '20261001144000_schedule_wal_and_webhook_health_crons.sql'
  );

  for (const [jobName, endpoint] of [
    ['wal-health-alert-5min', 'wal-health-alert'],
    ['winloss-webhook-health-monitor-15min', 'winloss-webhook-health-monitor'],
  ]) {
    assertMatch(sql, new RegExp(`'${endpoint}'`, 'i'));
    assertMatch(sql, new RegExp(`cron\\.unschedule\\('${jobName}'`, 'i'));
    assertMatch(sql, new RegExp(`cron\\.schedule\\([\\s\\S]*'${jobName}'`, 'i'));
    assertMatch(sql, new RegExp(`trigger_internal_edge_job\\(''${endpoint}''\\)`, 'i'));
  }

  assertMatch(sql, /p_function_name\s*=\s*ANY\s*\(ARRAY/i);
  assertMatch(sql, /'X-Cron-Secret',\s*v_cron_secret/i);
  assertMatch(sql, /SET\s+search_path\s*=\s*public,\s*net/i);
  assertNotMatch(sql, /rapjswienfhkobhlamxb|usyxfpqlsspldubptrdl/i);
  assertNotMatch(sql, /eyJ[A-Za-z0-9_-]{20,}/);
  assertNotMatch(sql, /\bDROP\s+(TABLE|COLUMN|FUNCTION)\b/i);
});

Deno.test('soft delete usa deleted_at e restringe DELETE a admin/manager', async () => {
  const sql = await readMigration('20261001193000_soft_delete_business_tables.sql');

  // Colunas defensivas + índice parcial
  assertMatch(sql, /ADD COLUMN IF NOT EXISTS deleted_at timestamptz/i);
  assertMatch(sql, /CREATE INDEX IF NOT EXISTS idx_(\w+|%I)_deleted_at/i);
  assertMatch(sql, /WHERE\s+deleted_at\s+IS\s+NOT\s+NULL/i);

  // Policies FOR DELETE restritas a admin/manager
  assertMatch(sql, /is_admin_or_manager\(auth\.uid\(\)\)/i);
  assertMatch(sql, /FOR DELETE/i);
  assertMatch(sql, /DROP POLICY IF EXISTS/i);

  // View de vendas filtra excluídos
  assertMatch(sql, /sales_with_markup/i);
  assertMatch(sql, /s\.deleted_at IS NULL/i);

  assertNotMatch(
    sql,
    /\bDELETE\s+FROM\s+public\.(clients|suppliers|deals|quotes|sales)\b/i
  );
  assertNotMatch(sql, /CREATE\s+(UNIQUE\s+)?INDEX\s+CONCURRENTLY/i);
  assertNotMatch(sql, /eyJ[A-Za-z0-9_-]{20,}/);
});

Deno.test('audit canônico consolida definições e marca superseded', async () => {
  const sql = await readMigration('20261001193100_audit_log_canonical.sql');

  // Tabela canônica com campos exigidos
  assertMatch(sql, /audit_logs/i);
  assertMatch(
    sql,
    /ADD COLUMN IF NOT EXISTS (table_name|record_id|old_data|new_data|request_id)/i
  );

  // Sanitização de dados sensíveis
  assertMatch(sql, /audit_scrub/i);
  assertMatch(sql, /REDACTED/i);

  // Triggers AFTER UPDATE OR DELETE nas tabelas de negócio
  assertMatch(sql, /CREATE TRIGGER audit_business_changes/i);
  assertMatch(sql, /AFTER UPDATE OR DELETE/i);
  assertMatch(sql, /audit_log_row_change/i);

  // Definições antigas marcadas como superseded
  assertMatch(sql, /superseded/i);

  // log_audit_event recriada com grants mínimos
  assertMatch(sql, /CREATE OR REPLACE FUNCTION public\.log_audit_event/i);
  assertMatch(sql, /REVOKE EXECUTE/i);
  assertMatch(sql, /GRANT EXECUTE.*authenticated/i);

  assertNotMatch(sql, /CREATE\s+(UNIQUE\s+)?INDEX\s+CONCURRENTLY/i);
  assertNotMatch(sql, /eyJ[A-Za-z0-9_-]{20,}/);
});

Deno.test('optimistic locking adiciona version e trigger bump', async () => {
  const sql = await readMigration('20261001193200_optimistic_locking.sql');

  assertMatch(sql, /ADD COLUMN IF NOT EXISTS version integer/i);
  assertMatch(sql, /DEFAULT 1/i);
  assertMatch(sql, /bump_row_version/i);
  assertMatch(sql, /CREATE TRIGGER bump_version/i);
  assertMatch(sql, /BEFORE UPDATE/i);
  assertMatch(sql, /to_regclass/i);

  assertNotMatch(sql, /CREATE\s+(UNIQUE\s+)?INDEX\s+CONCURRENTLY/i);
  assertNotMatch(sql, /eyJ[A-Za-z0-9_-]{20,}/);
});

Deno.test(
  'diretório de migrations segue nomenclatura canônica e versões únicas',
  async () => {
    const names: string[] = [];
    for await (const entry of Deno.readDir(MIGRATIONS_DIR)) {
      names.push(entry.name);
    }
    assert(names.length > 0, 'diretório de migrations não pode estar vazio');

    const versions = new Map<string, string>();
    for (const name of names) {
      assertMatch(
        name,
        /^\d{8,14}_.*\.sql$/,
        `nome fora do padrão '<versão numérica>_<descrição>.sql': ${name}`
      );
      const version = name.split('_')[0];
      assert(
        !versions.has(version),
        `versão duplicada '${version}': ${versions.get(version)} e ${name}`
      );
      versions.set(version, name);
    }
  }
);

Deno.test('nenhuma migration é vazia (apenas comentários)', async () => {
  for await (const entry of Deno.readDir(MIGRATIONS_DIR)) {
    if (!entry.name.endsWith('.sql')) continue;
    const sql = await readMigration(entry.name);
    const executable = sql
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .split('\n')
      .filter(line => {
        const trimmed = line.trim();
        return trimmed !== '' && !trimmed.startsWith('--');
      });
    assert(
      executable.length > 0,
      `migration sem nenhum statement executável: ${entry.name}`
    );
  }
});

Deno.test(
  'sync_quote_from_webhook concentra fluxo quote→items→sale em RPC atômica',
  async () => {
    const sql = await readMigration('20261001200000_atomic_quote_sync_rpc.sql');
    const webhook = await Deno.readTextFile(
      new URL('../../supabase/functions/receive-quote-webhook/index.ts', import.meta.url)
    );

    // RPC existe, é SECURITY DEFINER com search_path fixado
    assertMatch(sql, /CREATE OR REPLACE FUNCTION public\.sync_quote_from_webhook/i);
    assertMatch(sql, /SECURITY DEFINER/i);
    assertMatch(sql, /SET\s+search_path\s*=\s*public/i);

    // Grants mínimos: revoga de todos, concede só a service_role
    assertMatch(
      sql,
      /REVOKE ALL ON FUNCTION public\.sync_quote_from_webhook[\s\S]*FROM PUBLIC, anon, authenticated/i
    );
    assertMatch(
      sql,
      /GRANT EXECUTE ON FUNCTION public\.sync_quote_from_webhook[\s\S]*TO service_role/i
    );

    // Todas as escritas do fluxo vivem dentro da função (transação implícita)
    for (const frag of [
      'public.upsert_client_from_quote',
      'public.external_seller_map',
      'public.quotes',
      'public.quote_items',
      'public.sales',
    ]) {
      assertMatch(sql, new RegExp(frag.replace(/\./g, '\\.'), 'i'));
    }
    // Corrida de criação tratada e lock para serializar retries
    assertMatch(sql, /unique_violation/i);
    assertMatch(sql, /FOR UPDATE/i);

    // Webhook delega à RPC; única escrita direta restante em quotes é pdf_url
    assertMatch(webhook, /\.rpc\(\s*"sync_quote_from_webhook"/);
    assertMatch(webhook, /from\("quote_sync_logs"\)/);
    assertNotMatch(webhook, /from\("quote_items"\)/);
    assertNotMatch(webhook, /from\("sales"\)/);
    assertNotMatch(webhook, /from\("external_seller_map"\)/);
    const quotesCalls = webhook.match(/from\("quotes"\)[\s\S]*?;/g) ?? [];
    assertEquals(quotesCalls.length, 1, 'esperado apenas o update de pdf_url');
    assertMatch(quotesCalls.join(' '), /pdf_url/);

    // Sem drops destrutivos nem segredos literais
    assertNotMatch(sql, /\bDROP\s+(TABLE|COLUMN|FUNCTION)\b/i);
    assertNotMatch(sql, /eyJ[A-Za-z0-9_-]{20,}/);
  }
);

Deno.test('pacote LGPD: consentimento, DSR e anonimização defensiva', async () => {
  const sql = await readMigration('20261001150100_lgpd_consent_and_anonymization.sql');

  for (const table of ['consent_records', 'data_subject_requests']) {
    assertMatch(
      sql,
      new RegExp(`CREATE\\s+TABLE\\s+IF\\s+NOT\\s+EXISTS\\s+public\\.${table}`, 'i'),
      `${table} deve ser criada idempotentemente`
    );
    assertMatch(
      sql,
      new RegExp(
        `ALTER\\s+TABLE\\s+public\\.${table}\\s+ENABLE\\s+ROW\\s+LEVEL\\s+SECURITY`,
        'i'
      ),
      `${table} deve ter RLS habilitado`
    );
  }

  // RLS: admin/manager gerencia; titular lê/registra/revoga o próprio.
  assertMatch(sql, /is_admin_or_manager\(auth\.uid\(\)\)/i);
  assertMatch(sql, /auth\.jwt\(\)\s*->>\s*'email'/i);

  // visitor_logs: base legal + janela de retenção + guard de consentimento.
  assertMatch(sql, /ADD\s+COLUMN\s+IF\s+NOT\s+EXISTS\s+legal_basis/i);
  assertMatch(sql, /retention_expires_at/i);
  assertMatch(sql, /fn_website_visitor_log_consent/i);

  // RPC de anonimização: privilegiada, restrita e auditável.
  assertMatch(sql, /CREATE\s+OR\s+REPLACE\s+FUNCTION\s+public\.anonymize_data_subject/i);
  assertMatch(sql, /SECURITY\s+DEFINER/i);
  assertMatch(sql, /SET\s+search_path\s*=\s*public/i);
  assertMatch(
    sql,
    /REVOKE\s+ALL\s+ON\s+FUNCTION\s+public\.anonymize_data_subject[\s\S]*FROM\s+PUBLIC,\s*anon/i
  );
  assertMatch(sql, /EXCEPTION\s+WHEN\s+undefined_table\s+OR\s+undefined_column/i);

  // Sem segredos literais nem destrutivo irreversível.
  assertNotMatch(sql, /eyJ[A-Za-z0-9_-]{20,}/);
  assertNotMatch(sql, /\bDROP\s+(TABLE|COLUMN|FUNCTION)\b/i);
  assertNotMatch(sql, /\bTRUNCATE\s+TABLE\b/i);
});

Deno.test('retenção: política versionada, purge em lotes e cron diário', async () => {
  const sql = await readMigration('20261001151000_log_retention_indexes_and_purge.sql');

  assertMatch(
    sql,
    /CREATE\s+TABLE\s+IF\s+NOT\s+EXISTS\s+public\.data_retention_policies/i
  );
  assertMatch(sql, /retention_days\s+integer\s+NOT\s+NULL/i);
  assertMatch(sql, /CREATE\s+INDEX\s+IF\s+NOT\s+EXISTS/i);
  assertMatch(sql, /CREATE\s+OR\s+REPLACE\s+FUNCTION\s+public\.fn_apply_data_retention/i);
  assertMatch(sql, /SECURITY\s+DEFINER/i);
  assertMatch(sql, /'data-retention-purge-daily'/i);
  assertMatch(sql, /cron\.schedule/i);
  assertMatch(sql, /cron\.unschedule\('data-retention-purge-daily'/i);
  assertMatch(sql, /pg_extension.*pg_cron|extname\s*=\s*'pg_cron'/i);
  // Tolerância a schema drift em produção.
  assertMatch(sql, /to_regclass\('public\.'/i);
  assertMatch(sql, /EXCEPTION\s+WHEN\s+OTHERS/i);

  assertNotMatch(sql, /eyJ[A-Za-z0-9_-]{20,}/);
  assertNotMatch(sql, /\bDROP\s+(TABLE|COLUMN|FUNCTION)\b/i);
  assertNotMatch(sql, /\bCONCURRENTLY\b/i);
});

Deno.test('dedupe via constraints é idempotente e defensivo', async () => {
  const sql = await readMigration('20261001190000_dedupe_unique_constraints.sql');

  // clients: dedupe procedural antes do índice único parcial
  assertMatch(sql, /merge_clients\(v_target,\s*v_dups\)/i);
  assertMatch(sql, /deleted_at\s*=\s*now\(\)/i);
  assertMatch(
    sql,
    /CREATE\s+UNIQUE\s+INDEX\s+IF\s+NOT\s+EXISTS\s+ux_clients_email[\s\S]*WHERE\s+email\s+IS\s+NOT\s+NULL\s+AND\s+deleted_at\s+IS\s+NULL/i
  );

  // icp_data: índice único TOTAL (inferência de ON CONFLICT exige índice sem predicado)
  assertMatch(
    sql,
    /CREATE\s+UNIQUE\s+INDEX\s+IF\s+NOT\s+EXISTS\s+ux_icp_data_bitrix_id\s+ON\s+public\.icp_data\s*\(bitrix_id\)/i
  );
  assertNotMatch(
    sql,
    /ux_icp_data_bitrix_id[\s\S]{0,400}WHERE\s+bitrix_id\s+IS\s+NOT\s+NULL/i
  );

  // sales: external_deal_id + unique composta real p/ ON CONFLICT
  assertMatch(sql, /ADD\s+COLUMN\s+IF\s+NOT\s+EXISTS\s+external_deal_id/i);
  assertMatch(
    sql,
    /CREATE\s+UNIQUE\s+INDEX\s+IF\s+NOT\s+EXISTS\s+ux_sales_source_external_deal\s+ON\s+public\.sales\s*\(source,\s*external_deal_id\)/i
  );

  // corrida em upsert_client_from_quote tratada
  assertMatch(sql, /EXCEPTION\s+WHEN\s+unique_violation/i);

  assertNotMatch(sql, /\bCONCURRENTLY\b/i);
  assertNotMatch(sql, /\bDROP\s+(TABLE|COLUMN|FUNCTION)\b/i);
  assertNotMatch(sql, /rapjswienfhkobhlamxb|usyxfpqlsspldubptrdl/i);
});

Deno.test('FK-ONDELETE resolve constraints dinamicamente com guardas', async () => {
  const sql = await readMigration('20261001190500_fk_on_delete_actions.sql');

  // Resolução dinâmica do nome real da constraint + pulo quando já correto
  assertMatch(sql, /pg_constraint/i);
  assertMatch(sql, /confdeltype/i);
  assertMatch(sql, /DROP\s+CONSTRAINT\s+%I/i);
  assertMatch(sql, /ON\s+DELETE\s+%s/i);

  // Filhos dependentes CASCADE; atribuição/auditoria SET NULL
  assertMatch(sql, /'matchup_id'[\s\S]*'CASCADE'/i);
  assertMatch(sql, /'league_id'[\s\S]*'CASCADE'/i);
  assertMatch(sql, /'quote_items','product_id'[\s\S]*'SET NULL'/i);
  assertMatch(sql, /'clients','user_id','auth','users'/i);

  // Fallback RESTRICT quando a coluna é NOT NULL
  assertMatch(sql, /attnotnull/i);
  assertMatch(sql, /v_action\s*:=\s*'RESTRICT'/i);

  assertNotMatch(sql, /\bCONCURRENTLY\b/i);
  assertNotMatch(sql, /\bDROP\s+(TABLE|COLUMN|FUNCTION)\b/i);
  assertNotMatch(sql, /rapjswienfhkobhlamxb|usyxfpqlsspldubptrdl/i);
});
