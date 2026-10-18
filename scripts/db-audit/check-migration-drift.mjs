#!/usr/bin/env node
/**
 * Adaptador do passo "migrations" do verificador compartilhado da Arquitetura V2
 * (zapp-verify), que espera `scripts/db-audit/check-migration-drift.mjs`.
 *
 * O gate real deste repo é `scripts/check-migrations.mjs` (mesmo que o CI roda):
 * invariantes do diretório supabase/migrations +, com --base <ref>, regras para
 * migrations novas (versão crescente, RLS em CREATE TABLE, sem literais de URL
 * nem tokens). Delegamos a ele; a base é BASE_DIA do .hermes-tarefa quando
 * existir, senão origin/main.
 */
import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

let base = '';
if (existsSync('.hermes-tarefa')) {
  const t = readFileSync('.hermes-tarefa', 'utf8');
  base = t.match(/^BASE_DIA=(.+)$/m)?.[1]?.trim() ?? '';
}
if (!base) {
  base =
    spawnSync('git', ['rev-parse', '-q', '--verify', 'origin/main'], {
      encoding: 'utf8',
    }).status === 0
      ? 'origin/main'
      : 'main';
}

const args = ['scripts/check-migrations.mjs', '--base', base];
const r = spawnSync(process.execPath, args, { stdio: 'inherit' });
process.exit(r.status ?? 1);
