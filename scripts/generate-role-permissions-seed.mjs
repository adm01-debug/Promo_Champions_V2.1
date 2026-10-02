#!/usr/bin/env node
// generate-role-permissions-seed.mjs
//
// Gera de forma determinística a migration que espelha a fonte única de
// permissões (src/config/role-permissions.json) nas tabelas
// public.permissions / public.role_permissions.
//
// Uso:
//   node scripts/generate-role-permissions-seed.mjs          # imprime o SQL
//   node scripts/generate-role-permissions-seed.mjs --write  # regrava a migration
//
// O teste src/hooks/rolePermissions.test.ts regenera este SQL e compara com
// o arquivo versionado — qualquer drift entre JSON e migration reprova o CI.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const JSON_PATH = path.join(REPO_ROOT, 'src/config/role-permissions.json');
const MIGRATION_PATH = path.join(
  REPO_ROOT,
  'supabase/migrations/20261001211000_role_permissions_frontend_sync.sql',
);

export const SQL_HEADER = `-- role_permissions_frontend_sync.sql — GERADO por scripts/generate-role-permissions-seed.mjs
-- Fonte única: src/config/role-permissions.json. NÃO editar à mão;
-- rode \`node scripts/generate-role-permissions-seed.mjs --write\`.
-- Idempotente: ON CONFLICT em todos os inserts.`;

export function generateSql(config) {
  const roles = config.roles ?? {};
  const lines = [SQL_HEADER, ''];

  const permSet = new Set();
  for (const role of Object.keys(roles).sort()) {
    for (const perm of roles[role]) {
      if (perm !== '*') permSet.add(perm);
    }
  }
  const perms = [...permSet].sort();

  lines.push('-- Permissões declaradas pelo frontend (vocabulário resource:action)');
  for (const perm of perms) {
    const [resource, action] = perm.split(':');
    lines.push(
      `INSERT INTO public.permissions (name, description, resource, action)\n` +
        `VALUES ('${perm}', 'Permissão ${perm} (fonte: role-permissions.json)', '${resource}', '${action}')\n` +
        `ON CONFLICT (resource, action) DO NOTHING;`,
    );
  }

  lines.push('', '-- Concessões por papel (admin usa curinga "*" = tudo)');
  for (const role of Object.keys(roles).sort()) {
    for (const perm of [...roles[role]].sort()) {
      if (perm === '*') continue;
      const [resource, action] = perm.split(':');
      lines.push(
        `INSERT INTO public.role_permissions (role, permission_id)\n` +
          `SELECT '${role}'::app_role, id FROM public.permissions\n` +
          `WHERE resource = '${resource}' AND action = '${action}'\n` +
          `ON CONFLICT (role, permission_id) DO NOTHING;`,
      );
    }
  }

  return lines.join('\n') + '\n';
}

function main() {
  const config = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
  const sql = generateSql(config);
  if (process.argv.includes('--write')) {
    fs.writeFileSync(MIGRATION_PATH, sql);
    console.log(`[ok] migration regravada: ${path.relative(REPO_ROOT, MIGRATION_PATH)}`);
  } else {
    process.stdout.write(sql);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main();
}
