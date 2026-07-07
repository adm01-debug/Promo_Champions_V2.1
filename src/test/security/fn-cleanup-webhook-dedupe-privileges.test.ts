/**
 * Teste de segurança: apenas `service_role` pode executar
 * `public.fn_cleanup_webhook_dedupe()`. Roles `anon`, `authenticated`
 * e `public` devem estar bloqueados.
 *
 * Estratégia: consultar `has_function_privilege` via a função utilitária
 * `public.fn_test_cleanup_dedupe_privileges()` (SECURITY INVOKER) e validar
 * que todos os papéis retornaram `passed = true`.
 */
import { describe, it, expect } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as
  | string
  | undefined;

interface PrivilegeRow {
  role_name: string;
  can_execute: boolean;
  expected: boolean;
  passed: boolean;
}

const canRun = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

describe.skipIf(!canRun)('fn_cleanup_webhook_dedupe — privileges', () => {
  const client = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);

  it('apenas service_role pode executar; anon/authenticated/public bloqueados', async () => {
    const { data, error } = await client.rpc(
      'fn_test_cleanup_dedupe_privileges' as never,
    );
    expect(error).toBeNull();
    const rows = (data ?? []) as PrivilegeRow[];
    expect(rows.length).toBe(4);

    const byRole = Object.fromEntries(rows.map((r) => [r.role_name, r]));
    expect(byRole.anon?.can_execute).toBe(false);
    expect(byRole.authenticated?.can_execute).toBe(false);
    expect(byRole.public?.can_execute).toBe(false);
    expect(byRole.service_role?.can_execute).toBe(true);

    for (const row of rows) {
      expect(row.passed, `role ${row.role_name} falhou no privilégio`).toBe(
        true,
      );
    }
  });

  it('chamar fn_cleanup_webhook_dedupe como anon é rejeitado', async () => {
    const { error } = await client.rpc('fn_cleanup_webhook_dedupe' as never);
    expect(error).not.toBeNull();
    // 42501 = permission denied
    expect(error?.code === '42501' || /permission denied/i.test(error?.message ?? '')).toBe(true);
  });
});
