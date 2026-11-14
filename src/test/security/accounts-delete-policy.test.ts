/**
 * Teste de segurança: DELETE em `public.accounts` só para gestor.
 *
 * Apagar uma conta remove em cascata (ON DELETE CASCADE) contatos, planos,
 * renovações, tickets e demais dados de CS. A policy FOR ALL antiga
 * liberava isso ao dono (vendedor). Aqui reproduzimos as migrations em
 * ordem (CREATE/DROP POLICY) e verificamos o estado final: toda policy viva
 * que cobre DELETE exige `is_admin_or_manager` e não aceita o dono, e
 * SELECT/INSERT/UPDATE do dono continuam cobertos.
 */
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.resolve(__dirname, '../../../supabase/migrations');

interface LivePolicy {
  cmd: 'ALL' | 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
  body: string;
}

const CREATE_RE =
  /^CREATE\s+POLICY(?:\s+IF\s+NOT\s+EXISTS)?\s+"([^"]+)"\s+ON\s+(?:public\.)?accounts\b(?:\s+AS\s+\w+)?(?:\s+FOR\s+(ALL|SELECT|INSERT|UPDATE|DELETE))?([\s\S]*)$/i;
const DROP_RE =
  /^DROP\s+POLICY(?:\s+IF\s+EXISTS)?\s+"([^"]+)"\s+ON\s+(?:public\.)?accounts\b/i;

function stripComments(sql: string): string {
  return sql.replace(/--[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
}

/** Replay das migrations em ordem de nome: estado final das policies de accounts. */
function liveAccountsPolicies(): Map<string, LivePolicy> {
  const live = new Map<string, LivePolicy>();
  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort();
  for (const file of files) {
    const sql = stripComments(fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8'));
    for (const raw of sql.split(';')) {
      const stmt = raw.trim();
      const drop = DROP_RE.exec(stmt);
      if (drop) {
        live.delete(drop[1]!);
        continue;
      }
      const create = CREATE_RE.exec(stmt);
      if (create) {
        live.set(create[1]!, {
          cmd: (create[2]?.toUpperCase() ?? 'ALL') as LivePolicy['cmd'],
          body: create[3] ?? '',
        });
      }
    }
  }
  return live;
}

const covers = (p: LivePolicy, cmd: LivePolicy['cmd']) =>
  p.cmd === 'ALL' || p.cmd === cmd;

describe('accounts — RLS de DELETE só para gestor', () => {
  const live = liveAccountsPolicies();

  it('existe policy viva cobrindo DELETE', () => {
    const del = [...live.values()].filter(p => covers(p, 'DELETE'));
    expect(del.length).toBeGreaterThan(0);
  });

  it('nenhuma policy que cobre DELETE aceita o dono (vendedor)', () => {
    for (const [name, p] of live) {
      if (!covers(p, 'DELETE')) continue;
      expect(p.body, `policy "${name}" libera DELETE ao dono`).not.toMatch(
        /owner_id|get_current_salesperson_id/i
      );
      expect(p.body, `policy "${name}" não exige gestor`).toMatch(/is_admin_or_manager/i);
    }
  });

  it('a policy FOR ALL antiga foi removida', () => {
    expect(live.has('Owners and managers can manage accounts')).toBe(false);
  });

  it.each(['SELECT', 'INSERT', 'UPDATE'] as const)('dono continua coberto em %s', cmd => {
    const ownerPolicies = [...live.values()].filter(
      p =>
        covers(p, cmd) &&
        /owner_id\s*=\s*\(\s*SELECT\s+public\.get_current_salesperson_id\(\)\s*\)/i.test(
          p.body
        )
    );
    expect(ownerPolicies.length).toBeGreaterThan(0);
  });
});
