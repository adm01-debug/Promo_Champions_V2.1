import {
  assert,
  assertEquals,
  assertMatch,
  assertNotMatch,
} from "jsr:@std/assert@1";

const readMigration = (name: string) =>
  Deno.readTextFile(new URL(`./${name}`, import.meta.url));

Deno.test("migrations pendentes preservam idempotência e autorização", async () => {
  const [webhooks, prizeWheel, leadRouting] = await Promise.all([
    readMigration(
      "20260827000001_harden_webhooks_portfolio_and_idempotency.sql",
    ),
    readMigration("20260830000001_secure_prize_wheel_spins.sql"),
    readMigration("20260830000002_harden_lead_routing.sql"),
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
    /DROP\s+POLICY\s+IF\s+EXISTS\s+"Users can insert own client_portfolio"/i,
  );
});

Deno.test("default ACL de supabase_admin não concede TRUNCATE futuro", async () => {
  const sql = await readMigration(
    "20260910130000_revoke_supabase_admin_default_truncate.sql",
  );
  const assertions = await Deno.readTextFile(
    new URL("../tests/db01_default_acl_assertions.sql", import.meta.url),
  );

  assertMatch(
    sql,
    /ALTER\s+DEFAULT\s+PRIVILEGES\s+FOR\s+ROLE\s+supabase_admin\s+IN\s+SCHEMA\s+public\s+REVOKE\s+TRUNCATE\s+ON\s+TABLES\s+FROM\s+anon,\s*authenticated/i,
  );
  assertMatch(sql, /d\.defaclrole\s*=\s*'supabase_admin'::regrole/i);
  assertMatch(sql, /a\.privilege_type\s*=\s*'TRUNCATE'/i);
  assertNotMatch(sql, /\b(GRANT|DROP\s+(TABLE|COLUMN|FUNCTION))\b/i);
  assertMatch(assertions, /db01_default_acl_truncate_still_present/i);
});

Deno.test("hardening público fecha bypass de views e policies placeholder", async () => {
  const sql = await readMigration(
    "20260831130000_harden_public_access_and_privileged_rpcs.sql",
  );

  const invokerViews = [
    "activities_active",
    "clients_active",
    "tasks_active",
    "v_active_activities",
    "v_active_clients",
    "v_active_products",
    "v_active_suppliers",
    "v_active_teams",
    "v_deleted_clients",
  ];
  for (const view of invokerViews) {
    assertMatch(
      sql,
      new RegExp(
        `ALTER\\s+VIEW\\s+public\\.${view}\\s+SET\\s*\\(security_invoker\\s*=\\s*true\\)`,
        "i",
      ),
      `${view} deve obedecer ao RLS da tabela-base`,
    );
  }

  for (
    const table of ["activities", "clients", "products", "suppliers", "teams"]
  ) {
    assertMatch(
      sql,
      new RegExp(
        `DROP\\s+POLICY\\s+IF\\s+EXISTS\\s+"Users can view active ${table}"`,
        "i",
      ),
      `policy placeholder de ${table} deve ser removida`,
    );
  }

  assertMatch(
    sql,
    /REVOKE\s+ALL\s+ON\s+public\.maintenance_log\s+FROM\s+PUBLIC,\s*anon/i,
  );
  assertMatch(
    sql,
    /DROP\s+POLICY\s+IF\s+EXISTS\s+"anon can read own login attempts"/i,
  );
  assertMatch(
    sql,
    /CREATE\s+OR\s+REPLACE\s+FUNCTION\s+public\.get_login_lockout_status/i,
  );
  assertMatch(
    sql,
    /CREATE\s+OR\s+REPLACE\s+FUNCTION\s+public\.record_failed_login_attempt/i,
  );
  assertMatch(sql, /current_setting\('request\.headers',\s*true\)/i);
  assertMatch(sql, /la\.ip_address\s*=\s*v_ip/i);
  assertMatch(
    sql,
    /GRANT\s+EXECUTE\s+ON\s+FUNCTION\s+public\.record_failed_login_attempt[\s\S]*TO\s+anon/i,
  );
  assertMatch(
    sql,
    /REVOKE\s+ALL\s+ON\s+FUNCTION\s+public\.claim_pending_cadence_tasks[\s\S]*FROM\s+PUBLIC,\s*anon,\s*authenticated/i,
  );

  assertNotMatch(sql, /\bDROP\s+(TABLE|COLUMN|FUNCTION)\b/i);
  assertNotMatch(sql, /\bTRUNCATE\s+TABLE\b/i);
});

Deno.test("helpers privilegiados usam auth.uid e allowlist canônica", async () => {
  const sql = await readMigration(
    "20260831130000_harden_public_access_and_privileged_rpcs.sql",
  );

  for (
    const fn of [
      "soft_delete_record",
      "restore_deleted_record",
      "get_deleted_records",
      "hard_delete_record",
      "restore_record",
    ]
  ) {
    const start = sql.indexOf(`FUNCTION public.${fn}`);
    assert(start >= 0, `${fn} deve existir na migration`);
    const body = sql.slice(start, sql.indexOf("$$;", start) + 3);
    assertMatch(body, /auth\.uid\(\)|auth\.role\(\)/i);
    assertMatch(
      body,
      /NOT\s+IN\s*\('clients',\s*'activities',\s*'products',\s*'suppliers',\s*'teams'\)/i,
    );
    assertNotMatch(body, /'deals'/i);
  }

  const hardDelete = sql.slice(
    sql.indexOf("FUNCTION public.hard_delete_record"),
  );
  assertMatch(
    hardDelete,
    /p_admin_user_id\s+IS\s+DISTINCT\s+FROM\s+auth\.uid\(\)/i,
  );
  assertMatch(hardDelete, /has_role\(auth\.uid\(\),\s*'admin'/i);
});

Deno.test("reparos de cron qualificam extensões e são idempotentes", async () => {
  const sql = await readMigration(
    "20260831130001_repair_cron_and_fk_indexes.sql",
  );

  assertMatch(sql, /extensions\.digest\(r\.query_text,\s*'sha1'\)/i);
  assertMatch(sql, /extensions\.pg_stat_statements_reset\(\)/i);
  assertMatch(sql, /information_schema\.tables\s+AS\s+ist/i);
  assertMatch(sql, /ON\s+CONFLICT\s*\(jobid,\s*start_time\)\s+DO\s+NOTHING/i);
  assertMatch(sql, /pg_advisory_xact_lock/i);
  assertMatch(
    sql,
    /md5\(s\.id::text\s*\|\|\s*':'\s*\|\|\s*v_week_start::text\)/i,
  );

  const fkIndexes =
    sql.match(/CREATE\s+INDEX\s+IF\s+NOT\s+EXISTS\s+idx_[^\s]+_fk/gi) ?? [];
  assertEquals(
    fkIndexes.length,
    11,
    "as 11 FKs sem índice líder devem ser cobertas",
  );
  assertNotMatch(sql, /\bDROP\s+INDEX\b/i);
});

Deno.test("storage ganha limites, MIME allowlist e bucket winloss privado", async () => {
  const sql = await readMigration("20260831130002_harden_storage_buckets.sql");

  for (
    const bucket of [
      "avatars",
      "call-recordings",
      "quote-pdfs",
      "report-exports",
      "report-snapshots",
    ]
  ) {
    assertMatch(sql, new RegExp(`WHERE\\s+id\\s*=\\s*'${bucket}'`, "i"));
  }
  assertMatch(sql, /'winloss-reports'[\s\S]*false[\s\S]*'text\/markdown'/i);
  assertMatch(sql, /'audio\/m4a'/i);
  assertNotMatch(sql, /DELETE\s+FROM\s+storage\.objects/i);
  assertNotMatch(sql, /DROP\s+POLICY[^;]*winloss/i);
});

Deno.test("cron de campanha usa destino interno sem literal de credencial", async () => {
  const sql = await readMigration(
    "20260831130003_fix_campaign_health_cron.sql",
  );

  assertMatch(sql, /FROM\s+public\._internal_secrets\s+AS\s+s/i);
  assertMatch(
    sql,
    /rtrim\(v_base_url,\s*'\/'\)\s*\|\|\s*'\/campaign-health-alert'/i,
  );
  assertMatch(sql, /'X-Cron-Secret',\s*v_cron_secret/i);
  assertMatch(sql, /SET\s+search_path\s*=\s*public,\s*net/i);
  assertNotMatch(sql, /rapjswienfhkobhlamxb|usyxfpqlsspldubptrdl/i);
  assertNotMatch(sql, /eyJ[A-Za-z0-9_-]{20,}/);
  assertNotMatch(sql, /EXCEPTION\s+WHEN\s+OTHERS/i);
});

Deno.test("crons privilegiados de churn e fila usam segredo interno", async () => {
  const sql = await readMigration(
    "20260831163000_secure_churn_and_task_crons.sql",
  );

  for (
    const endpoint of [
      "generate-urgent-client-tasks",
      "detect-client-churn-alerts",
    ]
  ) {
    assertMatch(
      sql,
      new RegExp(`rtrim\\(v_base_url,\\s*'/'\\)\\s*\\|\\|\\s*'/${endpoint}'`, "i"),
    );
  }
  assertEquals((sql.match(/'X-Cron-Secret',\s*v_cron_secret/gi) ?? []).length, 2);
  assertEquals((sql.match(/SET\s+search_path\s*=\s*public,\s*net/gi) ?? []).length, 2);
  assertMatch(
    sql,
    /'SELECT public\.trigger_generate_urgent_client_tasks\(\);'/i,
  );
  assertMatch(
    sql,
    /'SELECT public\.trigger_detect_client_churn_alerts\(\);'/i,
  );
  assertNotMatch(sql, /rapjswienfhkobhlamxb|usyxfpqlsspldubptrdl/i);
  assertNotMatch(sql, /eyJ[A-Za-z0-9_-]{20,}/);
  assertNotMatch(sql, /\bDROP\s+(TABLE|COLUMN|FUNCTION)\b/i);
});

Deno.test("crons Edge operacionais usam allowlist e segredo interno", async () => {
  const sql = await readMigration(
    "20260831170000_secure_operational_edge_crons.sql",
  );

  const endpoints = [
    "notify-v4-quote-status",
    "check-v4-callback-alerts",
    "cron-failure-alerter",
    "process-call-recording-ingest",
    "edge-retry-threshold-alert",
  ];
  for (const endpoint of endpoints) {
    assertMatch(sql, new RegExp(`'${endpoint}'`, "i"));
    assertMatch(
      sql,
      new RegExp(
        `trigger_internal_edge_job\\(''${endpoint}''\\)`,
        "i",
      ),
    );
  }

  assertMatch(sql, /p_function_name\s*=\s*ANY\s*\(ARRAY/i);
  assertMatch(sql, /FROM\s+public\._internal_secrets\s+AS\s+s/i);
  assertMatch(sql, /'X-Cron-Secret',\s*v_cron_secret/i);
  assertMatch(sql, /SET\s+search_path\s*=\s*public,\s*net/i);
  assertMatch(
    sql,
    /REVOKE\s+ALL\s+ON\s+FUNCTION\s+public\.trigger_internal_edge_job\(text\)/i,
  );
  assertNotMatch(sql, /rapjswienfhkobhlamxb|usyxfpqlsspldubptrdl/i);
  assertNotMatch(sql, /eyJ[A-Za-z0-9_-]{20,}/);
  assertNotMatch(sql, /\bDROP\s+(TABLE|COLUMN|FUNCTION)\b/i);
});
