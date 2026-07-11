/**
 * SEC-02 — Cenários de borda RLS: valida que a Data API rejeita leituras
 * anônimas em tabelas sensíveis e que filtros/chaves manipuladas não
 * conseguem escapar da política.
 *
 * Cobertura:
 *   - Leitura anônima em tabelas com RLS estrito (user_roles, mfa_*, sms_*)
 *   - Bypass via query params (?select=*, ?user_id=eq.<uuid>)
 *   - Bypass via header apikey ausente / inválido
 *   - Bypass via filtro IN com valores fabricados
 */
import { test, expect } from '@playwright/test';

const URL = process.env.VITE_SUPABASE_URL ?? '';
const ANON = process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '';
const HAS = Boolean(URL && ANON);

const SENSITIVE_TABLES = [
  'user_roles',
  'api_tokens',
  'salespeople',
  'user_mfa_settings',
  'user_sms_settings',
  'user_sessions',
  'webhook_inbound_dedupe',
  'quote_sync_inbound_log',
];

async function getRest(path: string, headers: Record<string, string> = {}) {
  const res = await fetch(`${URL}/rest/v1/${path}`, {
    headers: {
      apikey: ANON,
      Authorization: `Bearer ${ANON}`,
      ...headers,
    },
  });
  return { status: res.status, body: await res.text() };
}

test.describe('SEC-02 — RLS edge cases (anon)', () => {
  test.skip(!HAS, 'Supabase env vars requeridos');

  for (const table of SENSITIVE_TABLES) {
    test(`anon não lê ${table} (select cru)`, async () => {
      const { status, body } = await getRest(`${table}?select=*&limit=5`);
      // Aceitável: 200 [] (RLS filtrou tudo) OU 401/403/404 (bloqueio explícito).
      // Falha: 200 com linhas.
      if (status === 200) {
        const rows = JSON.parse(body);
        expect(Array.isArray(rows)).toBe(true);
        expect(rows.length, `RLS bypass em ${table}: ${body.slice(0, 200)}`).toBe(0);
      } else {
        expect([401, 403, 404]).toContain(status);
      }
    });

    test(`anon não lê ${table} com filtro user_id fabricado`, async () => {
      const fakeUuid = '00000000-0000-0000-0000-000000000001';
      const { status, body } = await getRest(
        `${table}?user_id=eq.${fakeUuid}&select=*`,
      );
      if (status === 200) {
        const rows = JSON.parse(body);
        expect(rows.length).toBe(0);
      } else {
        expect([400, 401, 403, 404]).toContain(status);
      }
    });
  }

  test('apikey ausente é bloqueado pelo gateway', async () => {
    const res = await fetch(`${URL}/rest/v1/user_roles?select=*`);
    expect([401, 403]).toContain(res.status);
  });

  test('apikey inválida é bloqueada', async () => {
    const res = await fetch(`${URL}/rest/v1/user_roles?select=*`, {
      headers: { apikey: 'invalid.jwt.here', Authorization: 'Bearer invalid.jwt.here' },
    });
    expect([401, 403]).toContain(res.status);
  });

  test('filtro IN com uuids fabricados não vaza linhas', async () => {
    const { status, body } = await getRest(
      `salespeople?id=in.(00000000-0000-0000-0000-000000000001,00000000-0000-0000-0000-000000000002)&select=id,email`,
    );
    if (status === 200) {
      const rows = JSON.parse(body);
      expect(rows.length).toBe(0);
    } else {
      expect([401, 403, 404]).toContain(status);
    }
  });
});
