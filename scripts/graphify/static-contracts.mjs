#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { assertSafeNewOutputPath, createSafeOutputParents, digestValue, isPathInside } from './graphify-utils.mjs';

const CODE_EXTENSIONS = new Set(['.ts', '.tsx']);
const SQL_EXTENSION = '.sql';
const SQL_EVENT = /\b(CREATE|ALTER|DROP)\s+(?:OR\s+REPLACE\s+)?(MATERIALIZED\s+VIEW|TABLE|FUNCTION|VIEW|TYPE|INDEX|TRIGGER)\s+(?:IF\s+(?:NOT\s+)?EXISTS\s+)?((?:"[^"]+"|[A-Za-z_][\w$]*)(?:\s*\.\s*(?:"[^"]+"|[A-Za-z_][\w$]*))?)/gi;
const UNSUPPORTED_SQL = [
  ['privilégios/ACL', /\b(?:GRANT|REVOKE|ALTER\s+DEFAULT\s+PRIVILEGES)\b/i],
  ['RLS/policy', /\b(?:ENABLE|FORCE)\s+ROW\s+LEVEL\s+SECURITY\b|\bCREATE\s+POLICY\b/i],
  ['extensão', /\bCREATE\s+EXTENSION\b/i],
  ['cron/job', /\b(?:cron\.schedule|pg_cron)\b/i],
  ['Storage', /\bstorage\./i],
  ['bloco procedural', /\bDO\s*\$/i],
];
const CODE_REFERENCES = [
  ['table', /(?<!storage)\.from\(\s*['"]([^'"]+)['"]/g],
  ['rpc', /\.rpc\(\s*['"]([^'"]+)['"]/g],
  ['edge_function', /\.functions\.invoke\(\s*['"]([^'"]+)['"]/g],
  ['storage_bucket', /\.storage\.from\(\s*['"]([^'"]+)['"]/g],
  ['realtime_channel', /\.channel\(\s*['"]([^'"]+)['"]/g],
];

function walk(directory) {
  const files = [];
  const queue = [directory];
  while (queue.length > 0) {
    const current = queue.pop();
    if (!fs.existsSync(current)) continue;
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const entryPath = path.join(current, entry.name);
      if (entry.isDirectory()) queue.push(entryPath);
      if (entry.isFile()) files.push(entryPath);
    }
  }
  return files.sort();
}

function lineAt(source, offset) {
  return source.slice(0, offset).split('\n').length;
}

function blank(match) {
  return match.replace(/[^\n]/g, ' ');
}

function structuralSql(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, blank)
    .replace(/--[^\n]*/g, blank)
    .replace(/'(?:''|[^'])*'/g, blank);
}

export function parseMigrationFile(filePath, source) {
  const name = path.basename(filePath);
  const version = /^(\d{8,14})_/.exec(name)?.[1] ?? null;
  const events = [];
  const structural = structuralSql(source);
  for (const match of structural.matchAll(SQL_EVENT)) {
    events.push({
      action: match[1].toUpperCase(),
      objectType: match[2].replace(/\s+/g, '_').toLowerCase(),
      objectName: match[3].replace(/\s+/g, ''),
      line: lineAt(structural, match.index),
    });
  }
  const gaps = [];
  if (!version) gaps.push('Nome sem versão de migration reconhecida.');
  if (/\bEXECUTE\b|\bFORMAT\s*\(/i.test(structural)) gaps.push('SQL dinâmico: objetos podem não ser extraídos estaticamente.');
  for (const [kind, expression] of UNSUPPORTED_SQL) {
    if (expression.test(structural)) gaps.push(`Construto ${kind} ainda não é modelado estaticamente.`);
  }
  return { version, events, gaps };
}

export function extractCodeReferences(filePath, source) {
  const references = [];
  for (const [kind, expression] of CODE_REFERENCES) {
    expression.lastIndex = 0;
    for (const match of source.matchAll(expression)) {
      const prefix = source.slice(Math.max(0, match.index - 220), match.index);
      const schema = kind === 'table' ? /\.schema\(\s*['"]([^'"]+)['"]\s*\)\s*$/.exec(prefix)?.[1] ?? 'public' : null;
      references.push({ kind, name: schema ? `${schema}.${match[1]}` : match[1], schema, line: lineAt(source, match.index) });
    }
  }
  if (/\.(?:from|rpc|invoke|channel)\(\s*[^'"]/m.test(source)) {
    references.push({ kind: 'dynamic_reference', name: null, line: null });
  }
  return references;
}

export function collectStaticContracts(repositoryRoot) {
  const files = [
    ...walk(path.join(repositoryRoot, 'src')),
    ...walk(path.join(repositoryRoot, 'supabase', 'functions')),
    ...walk(path.join(repositoryRoot, 'supabase', 'migrations')),
  ];
  const references = [];
  const migrationEvents = [];
  const gaps = [];
  const versions = new Map();
  for (const filePath of files) {
    const source = fs.readFileSync(filePath, 'utf8');
    const relative = path.relative(repositoryRoot, filePath);
    const extension = path.extname(filePath);
    if (CODE_EXTENSIONS.has(extension)) {
      for (const reference of extractCodeReferences(filePath, source)) references.push({ ...reference, sourceFile: relative });
    }
    if (extension === SQL_EXTENSION && relative.startsWith('supabase/migrations/')) {
      const parsed = parseMigrationFile(filePath, source);
      for (const event of parsed.events) migrationEvents.push({ ...event, sourceFile: relative, version: parsed.version });
      for (const gap of parsed.gaps) gaps.push({ sourceFile: relative, detail: gap });
      if (parsed.version) versions.set(parsed.version, [...(versions.get(parsed.version) ?? []), relative]);
    }
  }
  for (const [version, versionFiles] of versions) {
    if (versionFiles.length > 1) gaps.push({ sourceFile: versionFiles.join(', '), detail: `Versão de migration repetida: ${version}.` });
  }
  return {
    schemaVersion: 1,
    source: { files: files.length },
    references: references.sort((left, right) => `${left.kind}:${left.name ?? ''}:${left.sourceFile}:${left.line ?? 0}`.localeCompare(`${right.kind}:${right.name ?? ''}:${right.sourceFile}:${right.line ?? 0}`)),
    migrationEvents: migrationEvents.sort((left, right) => `${left.version ?? ''}:${left.sourceFile}:${left.line}`.localeCompare(`${right.version ?? ''}:${right.sourceFile}:${right.line}`)),
    gaps: gaps.sort((left, right) => `${left.sourceFile}:${left.detail}`.localeCompare(`${right.sourceFile}:${right.detail}`)),
  };
}

function repositoryRoot() {
  const result = spawnSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error('Execute o comando dentro de um repositório Git.');
  return fs.realpathSync(result.stdout.trim());
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
  const outIndex = process.argv.indexOf('--out');
  if (outIndex === -1 || !process.argv[outIndex + 1]) throw new Error('Informe --out <arquivo-relativo-em-.graphify-local>.');
  const root = repositoryRoot();
  const requestedOutput = path.resolve(root, process.argv[outIndex + 1]);
  const allowed = path.join(root, '.graphify-local');
  fs.mkdirSync(allowed, { recursive: true });
  const outputPlan = assertSafeNewOutputPath(allowed, requestedOutput);
  if (!isPathInside(root, outputPlan.resolvedRoot) || path.extname(outputPlan.candidate) !== '.json') {
    throw new Error('--out deve ser um JSON dentro de .graphify-local/.');
  }
  createSafeOutputParents(outputPlan.resolvedRoot, outputPlan.relativePath);
  const contracts = collectStaticContracts(root);
  const document = { ...contracts, generatedAt: new Date().toISOString(), digest: digestValue(contracts) };
  fs.writeFileSync(outputPlan.candidate, `${JSON.stringify(document, null, 2)}\n`, { mode: 0o600 });
  console.info(`Contratos estáticos prontos: ${contracts.references.length} referências, ${contracts.migrationEvents.length} eventos e ${contracts.gaps.length} lacunas.`);
  } catch (error) {
    console.error(`Coleta estática recusada: ${error.message}`);
    process.exitCode = 1;
  }
}
