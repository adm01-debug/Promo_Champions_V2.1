/**
 * SEC-Markup — Garante que um usuário com role "salesperson" enxerga
 * markup_pct via `sales_with_markup`, mas NUNCA recebe unit_cost/total_cost
 * (mascarados como null pela view por questões de proteção de dados).
 *
 * Estratégia:
 *  1. Usa a sessão E2E persistida (global-setup) para chamar a Data API.
 *  2. Confirma que o usuário atual NÃO é admin/manager (senão o teste é
 *     inválido para este objetivo e é pulado).
 *  3. Lê `sales_with_markup` diretamente e valida linha a linha:
 *       - markup_pct pode ser null OU number;
 *       - unit_cost e total_cost DEVEM ser null.
 *  4. Tenta também acessar a tabela base `sales` selecionando as colunas
 *     de custo — o PostgREST deve retornar erro (coluna inexistente na
 *     projeção pública) OU linhas com custos nulos. Nunca valores > 0.
 */
import { test, expect } from '@playwright/test';
import {
  HAS_AUTH,
  SESSION_JSON,
  SUPABASE_ANON,
  SUPABASE_URL,
  skipReason,
} from './helpers/auth';

function bearer(): string {
  try {
    const parsed = JSON.parse(SESSION_JSON);
    return parsed.access_token ?? '';
  } catch {
    return '';
  }
}

async function rest(path: string, token: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SUPABASE_ANON,
      Authorization: `Bearer ${token}`,
    },
  });
  const text = await res.text();
  let json: unknown = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* keep raw */
  }
  return { status: res.status, body: text, json };
}

test.describe('SEC-Markup — salesperson não vê custos', () => {
  test.skip(!HAS_AUTH, skipReason());

  let token = '';
  let userId = '';

  test.beforeAll(() => {
    token = bearer();
    try {
      const parsed = JSON.parse(SESSION_JSON);
      userId = parsed?.user?.id ?? '';
    } catch {
      userId = '';
    }
  });

  test('sessão é de salesperson (skip se admin/manager)', async () => {
    expect(token, 'access_token ausente na sessão E2E').toBeTruthy();
    expect(userId, 'user.id ausente na sessão E2E').toBeTruthy();

    const { status, json } = await rest(
      `user_roles?user_id=eq.${userId}&select=role`,
      token,
    );
    expect(status).toBe(200);
    const roles = Array.isArray(json) ? (json as Array<{ role: string }>) : [];
    const isPrivileged = roles.some(
      (r) => r.role === 'admin' || r.role === 'manager',
    );
    test.skip(
      isPrivileged,
      'Sessão E2E é admin/manager — este teste exige perfil salesperson.',
    );
  });

  test('sales_with_markup expõe markup_pct e mascara unit_cost/total_cost', async () => {
    const { status, json } = await rest(
      'sales_with_markup?select=id,valor,markup_pct,margin_amount,unit_cost,total_cost,cost_source&limit=50',
      token,
    );
    expect(status, `Falha HTTP ao ler sales_with_markup: ${status}`).toBe(200);
    const rows = Array.isArray(json)
      ? (json as Array<Record<string, unknown>>)
      : [];

    // Não é obrigatório existir venda, mas se houver, todas devem estar mascaradas.
    for (const row of rows) {
      expect(
        row.unit_cost,
        `unit_cost vazou para salesperson na venda ${String(row.id)}: ${JSON.stringify(row)}`,
      ).toBeNull();
      expect(
        row.total_cost,
        `total_cost vazou para salesperson na venda ${String(row.id)}: ${JSON.stringify(row)}`,
      ).toBeNull();
      if (row.markup_pct !== null && row.markup_pct !== undefined) {
        expect(typeof row.markup_pct).toBe('number');
      }
    }
  });

  test('tabela base sales não retorna unit_cost/total_cost com valor > 0', async () => {
    const { status, json } = await rest(
      'sales?select=id,unit_cost,total_cost&limit=50',
      token,
    );

    // Cenário aceitável 1: PostgREST bloqueia a projeção (colunas revogadas)
    if (status >= 400) {
      expect([400, 401, 403, 404]).toContain(status);
      return;
    }

    // Cenário aceitável 2: retorna linhas, mas todas com custos nulos.
    expect(status).toBe(200);
    const rows = Array.isArray(json)
      ? (json as Array<Record<string, unknown>>)
      : [];
    for (const row of rows) {
      expect(
        row.unit_cost,
        `unit_cost vazou via tabela base para venda ${String(row.id)}`,
      ).toBeNull();
      expect(
        row.total_cost,
        `total_cost vazou via tabela base para venda ${String(row.id)}`,
      ).toBeNull();
    }
  });

  test('filtro em unit_cost não escapa da máscara', async () => {
    // Se o RLS ou a view estivesse quebrado, um filtro `unit_cost=gt.0`
    // poderia devolver linhas onde o custo é conhecido. Deve resultar
    // em zero linhas OU em erro do PostgREST.
    const { status, json } = await rest(
      'sales_with_markup?unit_cost=gt.0&select=id,unit_cost&limit=5',
      token,
    );
    if (status === 200) {
      const rows = Array.isArray(json) ? (json as unknown[]) : [];
      expect(
        rows.length,
        'salesperson conseguiu enumerar vendas por unit_cost > 0',
      ).toBe(0);
    } else {
      expect([400, 401, 403, 404]).toContain(status);
    }
  });
});
