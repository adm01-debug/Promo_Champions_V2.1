/**
 * SEC-01 / SEC-02 — Suíte E2E que valida hardening de EXECUTE nas funções
 * SECURITY DEFINER do schema `public`.
 *
 * Estratégia (sem dependência de rede autenticada):
 *  1. Lê pg_proc + acl e classifica cada função em uma das 3 categorias:
 *       - internal   → só service_role/postgres executam
 *       - user       → authenticated executa; anon NÃO
 *       - public     → anon executa (pre-login flows)
 *  2. Chama cada função via PostgREST usando a anon key.
 *     Espera:
 *       - internal → 401/403/404 (permission denied)
 *       - user     → 401/403/404 (sem sessão de authenticated)
 *       - public   → 200/4xx **de validação** (ou seja, NÃO permission denied)
 *  3. Falha se qualquer função retornar 200 com anon quando não deveria,
 *     ou 401/403 em função pública sem argumentos obrigatórios.
 */
import { test, expect } from '@playwright/test';
import { execSync } from 'node:child_process';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? '';
const ANON = process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '';
const HAS_PG = Boolean(process.env.PGHOST);
const HAS_HTTP = Boolean(SUPABASE_URL && ANON);

type Row = { proname: string; grantees: string };

function loadFunctions(): Row[] {
  if (!HAS_PG) return [];
  const sql = `SELECT p.proname, coalesce(string_agg(DISTINCT a.rolname, ',' ORDER BY a.rolname), '') AS grantees
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid=p.pronamespace
    LEFT JOIN LATERAL aclexplode(p.proacl) ax ON true
    LEFT JOIN pg_roles a ON a.oid=ax.grantee
    WHERE n.nspname='public' AND p.prosecdef=true AND (ax.privilege_type='EXECUTE' OR ax.privilege_type IS NULL)
    GROUP BY p.proname ORDER BY p.proname`;
  const out = execSync(`psql -tAF'|' -c ${JSON.stringify(sql)}`, { encoding: 'utf8' });
  return out
    .trim()
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [proname, grantees] = line.split('|');
      return { proname, grantees: grantees ?? '' };
    });
}

function categorize(r: Row): 'internal' | 'user' | 'public' {
  const roles = new Set(r.grantees.split(',').filter(Boolean));
  if (roles.has('anon')) return 'public';
  if (roles.has('authenticated')) return 'user';
  return 'internal';
}

async function callRpc(fn: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: {
      apikey: ANON,
      Authorization: `Bearer ${ANON}`,
      'Content-Type': 'application/json',
    },
    body: '{}',
  });
  const text = await res.text();
  return { status: res.status, text };
}

test.describe('SEC-01/02 — SECURITY DEFINER access matrix', () => {
  test.skip(!HAS_PG || !HAS_HTTP, 'psql + Supabase env vars requeridos');

  test('anon é bloqueado em toda função internal/user e não é bloqueado em funções públicas', async () => {
    const rows = loadFunctions();
    expect(rows.length).toBeGreaterThan(100);

    const violations: string[] = [];
    const summary = { internal: 0, user: 0, public: 0, passed: 0 };

    // limita concorrência para não estourar o gateway
    const chunkSize = 8;
    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize);
      await Promise.all(
        chunk.map(async (r) => {
          const cat = categorize(r);
          summary[cat]++;
          const { status, text } = await callRpc(r.proname);

          if (cat === 'internal' || cat === 'user') {
            // Deve ser bloqueado: PostgREST retorna 401/403/404 quando anon
            // não tem EXECUTE. 200 aqui = exposição indevida.
            const blocked = [401, 403, 404].includes(status);
            if (!blocked) {
              violations.push(
                `${r.proname} [${cat}] status=${status} body=${text.slice(0, 120)}`,
              );
            } else {
              summary.passed++;
            }
          } else {
            // public: qualquer status EXCETO 401/403 por permissão é ok.
            // 400 (args faltando) e 200 (executou) contam como acessível.
            const permDenied =
              [401, 403].includes(status) &&
              /permission denied|not.*authorized/i.test(text);
            if (permDenied) {
              violations.push(
                `${r.proname} [public] indevidamente bloqueado: ${text.slice(0, 120)}`,
              );
            } else {
              summary.passed++;
            }
          }
        }),
      );
    }

    console.log('[SEC-01] resumo:', summary);
    if (violations.length) {
      console.log('[SEC-01] violações:\n' + violations.join('\n'));
    }
    expect(violations, `Violations:\n${violations.join('\n')}`).toEqual([]);
  });
});
