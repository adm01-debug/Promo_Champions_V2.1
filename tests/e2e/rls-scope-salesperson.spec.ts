/**
 * SEC-RLS-Scope — cobertura positiva de escopo: prova que um salesperson
 * autenticado NÃO lê nem escreve linhas de outro usuário nas tabelas de
 * maior risco.
 *
 * Estratégia (sessão única, modelo de sales-markup-rls-salesperson.spec):
 *  1. Descobre user_id e salesperson_id da sessão E2E.
 *  2. Leitura cruzada: pede explicitamente linhas cujo dono NÃO é o usuário
 *     (`<owner_col>=neq.<meu>`). Esperado: 200 com [] ou erro 4xx/42501 —
 *     qualquer linha retornada é vazamento de escopo.
 *  3. Escrita cruzada: tenta INSERT atribuindo a linha a um uuid
 *     fabricado como dono. Esperado: 4xx (WITH CHECK violado) — nunca
 *     2xx (a policy permitiria plantar dados em nome de outro).
 *  4. Tabelas só-admin: leitura deve ser vazia ou bloqueada.
 *
 * Matriz tabela×role documentada em docs/RLS_MATRIX.md.
 */
import { test, expect } from '@playwright/test';
import {
  HAS_AUTH,
  SESSION_JSON,
  SUPABASE_ANON,
  SUPABASE_URL,
  skipReason,
} from './helpers/auth';

const FAKE_UUID = '00000000-0000-0000-0000-00000000000f';

interface TableCase {
  table: string;
  /** Coluna que identifica o dono da linha (para o filtro neq). */
  ownerCol: string;
  /** 'user' = auth.users id; 'sp' = salespeople.id */
  ownerKind: 'user' | 'sp';
  /** SELECT mínimo seguro (sem colunas sensíveis). */
  select: string;
  /** Linha de INSERT para a prova de escrita cruzada (dono = FAKE_UUID). */
  insertPayload?: Record<string, unknown>;
}

// ~15 tabelas de maior risco. Tabelas que não existem no schema (deals,
// payouts) foram substituídas pelas reais equivalentes (sales, commissions).
const CASES: TableCase[] = [
  {
    table: 'sales',
    ownerCol: 'salesperson_id',
    ownerKind: 'sp',
    select: 'id',
    insertPayload: {
      amount: 1,
      client_name: 'rls-probe',
      product_name: 'rls-probe',
      salesperson_id: FAKE_UUID,
      status: 'lead',
    },
  },
  {
    table: 'clients',
    ownerCol: 'user_id',
    ownerKind: 'user',
    select: 'id',
    insertPayload: { name: 'rls-probe', user_id: FAKE_UUID },
  },
  {
    table: 'orders',
    ownerCol: 'salesperson_id',
    ownerKind: 'sp',
    select: 'id',
    insertPayload: {
      order_number: 'rls-probe-1',
      salesperson_id: FAKE_UUID,
      user_id: FAKE_UUID,
      status: 'pending',
    },
  },
  {
    table: 'commissions',
    ownerCol: 'salesperson_id',
    ownerKind: 'sp',
    select: 'id',
    insertPayload: {
      salesperson_id: FAKE_UUID,
      sale_id: FAKE_UUID,
      base_amount: 1,
      commission_amount: 1,
      percentage: 1,
      status: 'pending',
    },
  },
  {
    table: 'nps_surveys',
    ownerCol: 'salesperson_id',
    ownerKind: 'sp',
    select: 'id',
    insertPayload: {
      salesperson_id: FAKE_UUID,
      client_name: 'rls-probe',
      survey_type: 'nps',
      status: 'pending',
    },
  },
  {
    table: 'call_recordings',
    ownerCol: 'salesperson_id',
    ownerKind: 'sp',
    select: 'id',
    insertPayload: {
      salesperson_id: FAKE_UUID,
      title: 'rls-probe',
      audio_url: 'rls-probe/x.mp3',
      status: 'ready',
    },
  },
  {
    table: 'quotes',
    ownerCol: 'created_by',
    ownerKind: 'user',
    select: 'id',
    insertPayload: {
      created_by: FAKE_UUID,
      client_name: 'rls-probe',
      quote_number: 'RLS-PROBE-1',
      status: 'draft',
      total_value: 1,
    },
  },
  {
    table: 'user_mfa_settings',
    ownerCol: 'user_id',
    ownerKind: 'user',
    select: 'id',
    // Escrita em MFA de outro usuário seria takeover — sempre bloquear.
    insertPayload: { user_id: FAKE_UUID, preferred_method: 'totp' },
  },
  {
    table: 'user_2fa_log',
    ownerCol: 'user_id',
    ownerKind: 'user',
    select: 'id',
  },
];

// Tabelas de segurança que salesperson não deve enxergar nem por filtro.
const ADMIN_ONLY_TABLES = ['login_attempts', 'user_2fa_log'];

function bearer(): { token: string; userId: string } {
  try {
    const parsed = JSON.parse(SESSION_JSON);
    return {
      token: parsed.access_token ?? '',
      userId: parsed?.user?.id ?? '',
    };
  } catch {
    return { token: '', userId: '' };
  }
}

async function rest(
  path: string,
  token: string,
  init?: RequestInit,
): Promise<{ status: number; json: unknown; body: string }> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SUPABASE_ANON,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  const body = await res.text();
  let json: unknown = null;
  try {
    json = JSON.parse(body);
  } catch {
    /* body não-JSON */
  }
  return { status: res.status, json, body };
}

function rowCount(json: unknown): number {
  return Array.isArray(json) ? json.length : 0;
}

test.describe('SEC-RLS-Scope — salesperson não cruza escopo', () => {
  test.skip(!HAS_AUTH, skipReason());

  let token = '';
  let userId = '';
  let salespersonId = '';

  test.beforeAll(async () => {
    ({ token, userId } = bearer());

    // Descobre o salesperson_id da sessão (dono das linhas de negócio).
    const { json } = await rest(
      `salespeople?auth_user_id=eq.${userId}&select=id&limit=1`,
      token,
    );
    salespersonId =
      Array.isArray(json) && json.length > 0
        ? String((json[0] as { id: string }).id)
        : '';
  });

  test('sessão é salesperson (skip se admin/manager)', async () => {
    expect(token, 'access_token ausente na sessão E2E').toBeTruthy();
    expect(userId, 'user.id ausente na sessão E2E').toBeTruthy();

    const { status, json } = await rest(
      `user_roles?user_id=eq.${userId}&select=role`,
      token,
    );
    expect(status).toBe(200);
    const roles = Array.isArray(json)
      ? (json as Array<{ role: string }>)
      : [];
    const isPrivileged = roles.some(
      (r) => r.role === 'admin' || r.role === 'manager',
    );
    test.skip(
      isPrivileged,
      'Sessão E2E é admin/manager — este teste exige perfil salesperson.',
    );
  });

  for (const c of CASES) {
    test(`${c.table}: filtro ${c.ownerCol}=neq.<meu> não retorna linhas de terceiros`, async () => {
      const mine = c.ownerKind === 'sp' ? salespersonId : userId;
      test.skip(
        !mine,
        `Sem ${c.ownerKind === 'sp' ? 'salesperson_id' : 'user_id'} na sessão`,
      );

      const { status, json, body } = await rest(
        `${c.table}?${c.ownerCol}=neq.${mine}&select=${c.select}&limit=50`,
        token,
      );

      if (status === 200) {
        expect(
          rowCount(json),
          `RLS vazou ${c.table} de terceiros: ${body.slice(0, 300)}`,
        ).toBe(0);
      } else {
        // Bloqueio explícito também é resultado seguro.
        expect([400, 401, 403, 404, 406]).toContain(status);
      }
    });

    if (c.insertPayload) {
      test(`${c.table}: INSERT com dono fabricado é rejeitado`, async () => {
        const { status, body } = await rest(c.table, token, {
          method: 'POST',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify(c.insertPayload),
        });
        // WITH CHECK violado => 401/403/42501; coluna/fk inexistente => 400/404/409.
        // JAMAIS 2xx — significaria que plantamos linha em nome de outro.
        expect(
          status,
          `INSERT cruzado em ${c.table} não foi bloqueado: ${body.slice(0, 300)}`,
        ).toBeGreaterThanOrEqual(400);
      });
    }
  }

  for (const table of ADMIN_ONLY_TABLES) {
    test(`${table}: salesperson não lê dados de auditoria/auth`, async () => {
      const { status, json, body } = await rest(
        `${table}?select=*&limit=10`,
        token,
      );
      if (status === 200) {
        expect(
          rowCount(json),
          `${table} vazou para salesperson: ${body.slice(0, 300)}`,
        ).toBe(0);
      } else {
        expect([400, 401, 403, 404]).toContain(status);
      }
    });
  }

  test('user_mfa_settings: totp_secret de terceiros nunca é legível', async () => {
    const { status, json, body } = await rest(
      `user_mfa_settings?user_id=neq.${userId}&select=id,totp_secret&limit=10`,
      token,
    );
    if (status === 200) {
      const rows = Array.isArray(json) ? json : [];
      expect(
        rows.length,
        `totp_secret de terceiros vazou: ${body.slice(0, 300)}`,
      ).toBe(0);
    } else {
      expect([400, 401, 403, 404]).toContain(status);
    }
  });
});
