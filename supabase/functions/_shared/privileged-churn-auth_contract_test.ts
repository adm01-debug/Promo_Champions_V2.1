import {
  assert,
  assertStringIncludes,
} from 'https://deno.land/std@0.224.0/assert/mod.ts';

const readFunction = (name: string) =>
  Deno.readTextFile(new URL(`../${name}/index.ts`, import.meta.url));

Deno.test(
  'jobs de churn e fila autenticam cron ou gestão antes do service_role',
  async () => {
    for (const name of ['detect-client-churn-alerts', 'generate-urgent-client-tasks']) {
      const source = await readFunction(name);
      assertStringIncludes(source, "req.method !== 'POST'");
      assertStringIncludes(source, 'isInternalServiceRequest(req)');
      assertStringIncludes(
        source,
        'isCronSecretRequest(req, supabaseUrl, serviceRoleKey)'
      );
      assertStringIncludes(source, 'isExpectedSharedSecret(provided, expected)');
      assertStringIncludes(source, 'isAdminOrManagerRequest(req)');
      assertStringIncludes(source, "error: 'forbidden'");
      assertStringIncludes(source, "error: 'unauthorized'");

      const authGate = source.indexOf('const isInternal =');
      const firstBusinessQuery = Math.min(
        ...[".from('churn_alert_settings')", ".from('auto_task_queue_settings')"]
          .map(needle => source.indexOf(needle))
          .filter(index => index >= 0)
      );
      assert(
        authGate >= 0 && authGate < firstBusinessQuery,
        `${name} autentica tarde demais`
      );
    }
  }
);

Deno.test(
  'envio manual de alerta de churn exige gestão antes do client admin',
  async () => {
    const source = await readFunction('send-churn-alert-email');
    assertStringIncludes(source, "req.method !== 'POST'");
    assertStringIncludes(source, 'isAdminOrManagerRequest(req)');
    assertStringIncludes(source, "error: 'forbidden'");
    assertStringIncludes(source, "error: 'unauthorized'");

    const authGate = source.indexOf('if (!(await isAdminOrManagerRequest(req)))');
    const adminClient = source.indexOf('const supabase = createClient(supabaseUrl');
    assert(authGate >= 0 && authGate < adminClient, 'service_role criado antes do RBAC');
  }
);
