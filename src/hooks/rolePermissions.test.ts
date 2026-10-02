/**
 * ROLE-SOURCE — trava a fonte única de permissões.
 *
 * 1. Paridade JSON ↔ migration: o SQL versionado deve ser byte-a-byte o
 *    que scripts/generate-role-permissions-seed.mjs produz do
 *    src/config/role-permissions.json. Drift = alterar um lado sem o outro.
 * 2. Permissão declarada vs. policy efetiva: para cada `resource:action`
 *    prometido a um papel, deve existir pelo menos uma policy viva (criada
 *    e não dropada depois) cobrindo a ação SQL equivalente na(s) tabela(s)
 *    mapeadas — ex.: `deals:delete` prometido a manager exige policy
 *    FOR DELETE (ou FOR ALL) em `sales`.
 *
 * O que NÃO é verificado estaticamente: se a policy se aplica ao papel
 * específico (o corpo USING/CHECK exigiria simular RLS). O check responde
 * "existe policy alguma concedendo a ação?" — a prova por papel fica nos
 * specs E2E (tests/e2e/rls-scope-salesperson.spec.ts).
 */
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateSql } from '../../scripts/generate-role-permissions-seed.mjs';
import config from '../config/role-permissions.json';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../..');
const MIGRATIONS_DIR = path.join(REPO_ROOT, 'supabase/migrations');
const SYNC_MIGRATION = path.join(
  MIGRATIONS_DIR,
  '20261001211000_role_permissions_frontend_sync.sql'
);

/** Ações PostgREST que cada verbo lógico exige na tabela mapeada. */
const ACTION_TO_SQL: Record<string, string[]> = {
  read: ['SELECT'],
  write: ['INSERT', 'UPDATE'],
  delete: ['DELETE'],
};

interface LivePolicies {
  /** tabela -> map(nomeDaPolicy -> ações SQL cobertas) */
  [table: string]: Map<string, Set<string>>;
}

/**
 * Replay determinístico das migrations em ordem de nome (timestamps
 * crescentes): registra CREATE POLICY e desfaz DROP POLICY por nome+tabela.
 */
function computeLivePolicies(): LivePolicies {
  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort();
  const live: LivePolicies = {};
  const createRe =
    /CREATE\s+POLICY(?:\s+IF\s+NOT\s+EXISTS)?\s+"([^"]+)"\s+ON\s+(?:public\.)?(\w+)(?:\s+FOR\s+(ALL|SELECT|INSERT|UPDATE|DELETE))?/gi;
  const dropRe =
    /DROP\s+POLICY(?:\s+IF\s+EXISTS)?\s+"([^"]+)"\s+ON\s+(?:public\.)?(\w+)/gi;

  for (const file of files) {
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
    for (const m of sql.matchAll(createRe)) {
      const [, name, table, action] = m;
      const t = table.toLowerCase();
      live[t] ??= new Map();
      const actions = live[t].get(name) ?? new Set<string>();
      if (!action || action.toUpperCase() === 'ALL') {
        ['SELECT', 'INSERT', 'UPDATE', 'DELETE'].forEach(a => actions.add(a));
      } else {
        actions.add(action.toUpperCase());
      }
      live[t].set(name, actions);
    }
    for (const m of sql.matchAll(dropRe)) {
      const [, name, table] = m;
      live[table.toLowerCase()]?.delete(name);
    }
  }
  return live;
}

function coveredActions(live: LivePolicies, table: string): Set<string> {
  const out = new Set<string>();
  for (const actions of live[table]?.values() ?? []) {
    actions.forEach(a => out.add(a));
  }
  return out;
}

describe('fonte única de permissões (role-permissions.json)', () => {
  it('migration versionada é idêntica ao SQL gerado do JSON (sem drift)', () => {
    const expected = generateSql(config);
    const actual = fs.readFileSync(SYNC_MIGRATION, 'utf8');
    expect(
      actual,
      'role_permissions_frontend_sync.sql diverge do JSON — rode ' +
        '`node scripts/generate-role-permissions-seed.mjs --write`'
    ).toBe(expected);
  });

  it('toda permissão declarada tem policy viva cobrindo a ação na tabela mapeada', () => {
    const live = computeLivePolicies();
    const missing: string[] = [];

    for (const [role, perms] of Object.entries(config.roles)) {
      for (const perm of perms) {
        if (perm === '*') continue;
        const [resource, action] = perm.split(':');
        const required = ACTION_TO_SQL[action];
        expect(required, `ação desconhecida em "${perm}"`).toBeTruthy();
        const tables =
          (config.resourceTables as Record<string, string[]>)[resource] ?? [];
        if (tables.length === 0) continue; // permissão de app, sem tabela
        for (const table of tables) {
          const covered = coveredActions(live, table);
          const ok = required.some(a => covered.has(a));
          if (!ok) {
            missing.push(
              `${role} promete "${perm}" mas ${table} não tem policy viva para ${required.join('/')}`
            );
          }
        }
      }
    }

    expect(missing, `Permissões sem lastro em policy:\n${missing.join('\n')}`).toEqual(
      []
    );
  });

  it('papeis e recursos declarados usam o vocabulário esperado', () => {
    const validRoles = new Set(['admin', 'manager', 'salesperson']);
    const validActions = new Set(['read', 'write', 'delete']);
    for (const [role, perms] of Object.entries(config.roles)) {
      expect(validRoles.has(role), `papel desconhecido: ${role}`).toBe(true);
      for (const perm of perms) {
        if (perm === '*') {
          expect(role, 'curinga "*" só é válido para admin').toBe('admin');
          continue;
        }
        const [resource, action, extra] = perm.split(':');
        expect(extra, `permissão malformada: ${perm}`).toBeUndefined();
        expect(
          (config.resourceTables as Record<string, unknown>)[resource] !== undefined,
          `recurso "${resource}" sem entrada em resourceTables`
        ).toBe(true);
        expect(validActions.has(action), `ação inválida em "${perm}"`).toBe(true);
      }
    }
  });
});
