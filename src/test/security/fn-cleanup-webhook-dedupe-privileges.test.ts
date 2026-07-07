/**
 * Teste de segurança: apenas `service_role` pode executar
 * `public.fn_cleanup_webhook_dedupe()`. Roles `anon`, `authenticated`
 * e `public` devem estar bloqueados.
 *
 * Usa fetch direto contra a Data API (PostgREST) para contornar o mock
 * global de `@supabase/supabase-js` presente em `src/test/setup.ts`.
 */
import { describe, it, expect } from 'vitest';

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

async function rpc<T>(fn: string, body: Record<string, unknown> = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY!,
      Authorization: `Bearer ${SUPABASE_ANON_KEY!}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  return { status: res.status, ok: res.ok, data: data as T };
}

describe.skipIf(!canRun)('fn_cleanup_webhook_dedupe — privileges', () => {
  it('has_function_privilege confirma bloqueio de anon/authenticated/public e permite service_role', async () => {
    const { ok, data } = await rpc<PrivilegeRow[]>(
      'fn_test_cleanup_dedupe_privileges',
    );
    expect(ok).toBe(true);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(4);

    const byRole = Object.fromEntries(data.map((r) => [r.role_name, r]));
    expect(byRole.anon?.can_execute).toBe(false);
    expect(byRole.authenticated?.can_execute).toBe(false);
    expect(byRole.public?.can_execute).toBe(false);
    expect(byRole.service_role?.can_execute).toBe(true);

    for (const row of data) {
      expect(row.passed, `role ${row.role_name} falhou`).toBe(true);
    }
  });

  it('anon executando fn_cleanup_webhook_dedupe recebe permission denied', async () => {
    const { ok, status, data } = await rpc<{ code?: string; message?: string }>(
      'fn_cleanup_webhook_dedupe',
    );
    expect(ok).toBe(false);
    // PostgREST devolve 401/403/404 dependendo da versão; a mensagem
    // sempre menciona permission denied / not found na exposição do RPC.
    expect([401, 403, 404]).toContain(status);
    const msg = typeof data === 'object' && data && 'message' in data ? data.message : '';
    expect(/permission denied|not.*found/i.test(msg ?? '')).toBe(true);
  });
});
