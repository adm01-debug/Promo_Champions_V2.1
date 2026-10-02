import { assertMatch } from 'jsr:@std/assert@1';

// Contrato do pacote de auditoria auth/authz (2026-10-01): garante que as
// migrations do pacote continuam contendo as proteções aprovadas e que as
// edge functions de custo mantêm autenticação + rate limit.

const readMigration = (name: string) =>
  Deno.readTextFile(new URL(`./${name}`, import.meta.url));

const readFunction = (name: string) =>
  Deno.readTextFile(new URL(`../functions/${name}/index.ts`, import.meta.url));

Deno.test(
  'user_roles: trigger de auditoria grava audit_logs + security_events',
  async () => {
    const sql = await readMigration('20261001203000_audit_trigger_user_roles.sql');

    assertMatch(sql, /CREATE OR REPLACE FUNCTION public\.audit_user_roles_change/i);
    assertMatch(sql, /AFTER INSERT OR UPDATE OR DELETE ON public\.user_roles/i);
    assertMatch(sql, /INSERT INTO public\.audit_logs/i);
    assertMatch(sql, /auth\.jwt\(\)\s*->>\s*'email'/i);
    assertMatch(sql, /INSERT INTO public\.security_events/i);
    assertMatch(sql, /severity/i);
    assertMatch(sql, /'high'/i);
    assertMatch(sql, /SECURITY DEFINER/i);
    assertMatch(sql, /SET search_path = public/i);
    assertMatch(sql, /admin_role_granted/i);
    assertMatch(sql, /admin_role_revoked/i);
  }
);

Deno.test(
  'rbac legado: drop de roles/user_permissions_cache/has_permission',
  async () => {
    const sql = await readMigration('20261001203100_drop_legacy_rbac.sql');

    assertMatch(sql, /DROP TABLE IF EXISTS public\.user_permissions_cache/i);
    assertMatch(sql, /DROP TABLE IF EXISTS public\.roles/i);
    assertMatch(
      sql,
      /DROP FUNCTION IF EXISTS public\.has_permission\(uuid, text, text\)/i
    );
    assertMatch(sql, /DROP FUNCTION IF EXISTS public\.has_permission\(text, text\)/i);
    // Policies quebradas dependentes precisam cair antes dos drops.
    assertMatch(sql, /DROP POLICY IF EXISTS "Users can read clients if has permission"/i);
  }
);

Deno.test('user_roles: SELECT restrito a próprio/admin/manager', async () => {
  const sql = await readMigration('20261001203200_restrict_user_roles_select.sql');

  assertMatch(sql, /DROP POLICY IF EXISTS "Users can view own role"/i);
  assertMatch(sql, /FOR SELECT TO authenticated/i);
  assertMatch(sql, /user_id = auth\.uid\(\)/i);
  assertMatch(sql, /has_role\(auth\.uid\(\), 'admin'::public\.app_role\)/i);
  assertMatch(sql, /is_admin_or_manager\(auth\.uid\(\)\)/i);
});

Deno.test('tabelas mortas + revokes de anon', async () => {
  const sql = await readMigration(
    '20261001203300_deny_dead_tables_revoke_anon_grants.sql'
  );

  assertMatch(sql, /COMMENT ON TABLE public\.webhook_events/i);
  assertMatch(
    sql,
    /REVOKE ALL ON TABLE public\.webhook_events FROM PUBLIC, anon, authenticated/i
  );
  assertMatch(sql, /DROP TABLE IF EXISTS public\.cadence_enrollments/i);
  assertMatch(sql, /fn_test_cleanup_dedupe_privileges\(\)/i);
  assertMatch(sql, /REVOKE EXECUTE ON FUNCTION public\.%s FROM anon/i);
});

Deno.test('apis de custo: auth + rate limit obrigatórios', async () => {
  const [voice, stt, tts, stress, simulate] = await Promise.all([
    readFunction('elevenlabs-voice'),
    readFunction('elevenlabs-stt'),
    readFunction('elevenlabs-tts'),
    readFunction('stress-test-contracts'),
    readFunction('simulate-load'),
  ]);

  for (const [name, src] of [
    ['elevenlabs-voice', voice],
    ['elevenlabs-stt', stt],
    ['elevenlabs-tts', tts],
  ] as const) {
    assertMatch(src, /getUserClient\(req\)/, `${name} precisa de getUserClient`);
    assertMatch(src, /enforceRateLimit/, `${name} precisa de enforceRateLimit`);
    assertMatch(src, /key: userId/, `${name} precisa limitar por usuário`);
    assertMatch(src, /limit: 30/, `${name} limite ~30/min`);
  }

  assertMatch(stress, /getUserClient\(req\)/);
  assertMatch(stress, /MAX_ITERATIONS = 1000/);
  assertMatch(simulate, /getUserClient\(req\)/);
  assertMatch(simulate, /isInternalServiceRequest\(req\)/);
});
