#!/usr/bin/env node
// Gate de higiene de migrations (pacote auditoria DB/integridade, 2026-10-01).
//
// Invariantes verificadas em TODO PR (scan do diretório):
//   1. Todo arquivo em supabase/migrations/ segue ^\d{8,14}_.*\.sql$
//      (sem testes, docs ou versões com letras misturadas ao timestamp).
//   2. Versões (prefixo antes do primeiro "_") são únicas.
//   3. Nenhuma migration é vazia (só comentários/espaços).
//
// Regras sobre ARQUIVOS NOVOS (só com --base <ref>, diff contra a base do PR):
//   4. Migration adicionada no PR precisa ter versão estritamente MAIOR que
//      todas as versões já presentes na base (timestamp crescente, CLAUDE.md §1).
//   5. Migration nova com CREATE TABLE exige ENABLE ROW LEVEL SECURITY
//      no mesmo arquivo.
//   6. Migrations novas não podem conter literais *.supabase.co nem tokens
//      JWT ('eyJhbGci' é o prefixo base64 de {"alg":"HS256",...}).
//
// Renomeações (status R no diff) só validam o novo nome — não introduzem
// SQL novo, então as regras 4-6 não se aplicam.
//
// Uso:
//   node scripts/check-migrations.mjs                  # invariantes do diretório
//   node scripts/check-migrations.mjs --base origin/main   # + regras de arquivo novo

import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const MIGRATIONS_DIR = 'supabase/migrations';
const NAME_PATTERN = /^\d{8,14}_.*\.sql$/;
const CREATE_TABLE = /\bCREATE\s+TABLE\b/i;
const ENABLE_RLS = /\bENABLE\s+ROW\s+LEVEL\s+SECURITY\b/i;
const FORBIDDEN_LITERALS = [
  { pattern: /[a-z0-9-]+\.supabase\.co/gi, label: 'URL *.supabase.co' },
  { pattern: /eyJhbGci[A-Za-z0-9_-]*/g, label: "token JWT (prefixo 'eyJhbGci')" },
];

const errors = [];
const warnings = [];

function fail(msg) {
  errors.push(msg);
}

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim();
}

function versionOf(name) {
  return name.split('_')[0];
}

function stripComments(sql) {
  return sql
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .filter((line) => {
      const trimmed = line.trim();
      return trimmed !== '' && !trimmed.startsWith('--');
    })
    .join('\n');
}

// --- Regras 1-3: estado atual do diretório -----------------------------------

const entries = readdirSync(MIGRATIONS_DIR, { withFileTypes: true })
  .filter((entry) => entry.isFile())
  .map((entry) => entry.name)
  .sort();

const versions = new Map();
for (const name of entries) {
  if (!NAME_PATTERN.test(name)) {
    fail(
      `${MIGRATIONS_DIR}/${name}: nome fora do padrão '<versão numérica 8-14 dígitos>_<descrição>.sql'`,
    );
    continue;
  }
  const version = versionOf(name);
  if (versions.has(version)) {
    fail(
      `${MIGRATIONS_DIR}/${name}: versão '${version}' duplicada (já usada por ${versions.get(version)})`,
    );
  }
  versions.set(version, name);
}

for (const name of entries) {
  if (!name.endsWith('.sql')) continue;
  const sql = readFileSync(join(MIGRATIONS_DIR, name), 'utf8');
  if (stripComments(sql).trim() === '') {
    fail(`${MIGRATIONS_DIR}/${name}: migration vazia (apenas comentários/espaços)`);
  }
}

// --- Regras 4-6: arquivos novos no PR -----------------------------------------

const baseIndex = process.argv.indexOf('--base');
const baseRef = baseIndex >= 0 ? process.argv[baseIndex + 1] : null;

if (baseRef) {
  let diff;
  try {
    diff = git(['diff', '--name-status', '--find-renames', `${baseRef}...HEAD`]);
  } catch {
    fail(
      `não foi possível diffar contra '${baseRef}' — no CI use actions/checkout com fetch-depth: 0`,
    );
  }

  if (diff) {
    let baseVersions = [];
    try {
      baseVersions = git(['ls-tree', '--name-only', baseRef, '--', MIGRATIONS_DIR])
        .split('\n')
        .map((path) => path.slice(MIGRATIONS_DIR.length + 1))
        .filter((name) => NAME_PATTERN.test(name))
        .map(versionOf);
    } catch {
      warnings.push(
        `base '${baseRef}' não contém ${MIGRATIONS_DIR} — regra de versão crescente ignorada`,
      );
    }
    const maxBaseVersion = baseVersions.reduce(
      (max, v) => (BigInt(v) > max ? BigInt(v) : max),
      0n,
    );

    for (const line of diff.split('\n')) {
      const [status, ...paths] = line.split('\t');
      const code = status[0];
      const target = code === 'R' ? paths[1] : paths[0];

      if (code === 'R' && target.startsWith(`${MIGRATIONS_DIR}/`)) {
        const name = target.slice(MIGRATIONS_DIR.length + 1);
        if (!NAME_PATTERN.test(name)) {
          fail(
            `${target}: migration renomeada para nome fora do padrão '<versão numérica 8-14 dígitos>_<descrição>.sql'`,
          );
        }
        continue;
      }

      if (code !== 'A' || !target.startsWith(`${MIGRATIONS_DIR}/`)) continue;
      if (!target.endsWith('.sql')) {
        fail(`${target}: arquivo não-.sql adicionado em ${MIGRATIONS_DIR}`);
        continue;
      }

      const name = target.slice(MIGRATIONS_DIR.length + 1);
      if (!NAME_PATTERN.test(name)) {
        // já reportado pelo scan do diretório; evita duplicar a mensagem
        continue;
      }

      const version = versionOf(name);
      if (BigInt(version) <= maxBaseVersion) {
        fail(
          `${target}: versão '${version}' não é estritamente maior que a maior versão da base ('${maxBaseVersion}')`,
        );
      }

      const content = readFileSync(target, 'utf8');
      if (CREATE_TABLE.test(content) && !ENABLE_RLS.test(content)) {
        fail(
          `${target}: CREATE TABLE sem 'ENABLE ROW LEVEL SECURITY' no mesmo arquivo`,
        );
      }
      for (const { pattern, label } of FORBIDDEN_LITERALS) {
        if (pattern.test(content)) {
          fail(`${target}: contém literal proibido (${label})`);
        }
      }
    }
  }
} else {
  warnings.push(
    'sem --base <ref>: regras de arquivo novo (versão crescente, RLS, literais proibidos) não verificadas',
  );
}

// --- Resultado ----------------------------------------------------------------

for (const warning of warnings) {
  console.warn(`::warning::${warning}`);
}

if (errors.length > 0) {
  console.error('Gate de migrations REPROVADO:');
  for (const error of errors) {
    console.error(`  - ${error}`);
  }
  process.exit(1);
}

console.log(
  `Gate de migrations OK: ${entries.length} arquivos, ${versions.size} versões únicas` +
    (baseRef ? `, diff contra ${baseRef} verificado` : ''),
);
