#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { assertSafeNewOutputPath, createSafeOutputParents, digestValue, isPathInside } from './graphify-utils.mjs';

const CODE_EXTENSIONS = new Set(['.ts', '.tsx']);
const SQL_EXTENSION = '.sql';
const SQL_EVENT = /\b(CREATE|ALTER|DROP)\s+(?:OR\s+REPLACE\s+)?(MATERIALIZED\s+VIEW|TABLE|FUNCTION|VIEW|TYPE|INDEX|TRIGGER)\s+(?:IF\s+(?:NOT\s+)?EXISTS\s+)?((?:"[^"]+"|[A-Za-z_][\w$]*)(?:\s*\.\s*(?:"[^"]+"|[A-Za-z_][\w$]*))?)/gi;
const IDENTIFIER = '(?:"[^"]+"|[A-Za-z_][\\w$]*)(?:\\s*\\.\\s*(?:"[^"]+"|[A-Za-z_][\\w$]*))?';
const POLICY_EVENT = new RegExp(`\\b(CREATE|ALTER|DROP)\\s+POLICY\\s+(?:IF\\s+EXISTS\\s+)?(${IDENTIFIER})\\s+ON\\s+(${IDENTIFIER})`, 'gi');
const RLS_EVENT = new RegExp(`\\bALTER\\s+TABLE\\s+(?:ONLY\\s+)?(${IDENTIFIER})\\s+(ENABLE|DISABLE|FORCE|NO\\s+FORCE)\\s+ROW\\s+LEVEL\\s+SECURITY`, 'gi');
const UNSUPPORTED_SQL = [
  ['privilégios/ACL', /\b(?:GRANT|REVOKE|ALTER\s+DEFAULT\s+PRIVILEGES)\b/i],
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

function appendMasked(scanner, value) {
  scanner.result += scanner.preserveStrings ? value : value.replace(/[^\n]/g, ' ');
}

function consumeCode(scanner) {
  const { source, index } = scanner;
  const character = source[index];
  const next = source[index + 1];
  if (character === '-' && next === '-') {
    appendMasked(scanner, '--'); scanner.index += 2; scanner.state = 'line-comment'; return;
  }
  if (character === '/' && next === '*') {
    appendMasked(scanner, '/*'); scanner.index += 2; scanner.state = 'block-comment'; return;
  }
  if (character === "'") {
    appendMasked(scanner, character); scanner.index += 1; scanner.state = 'single-quote'; return;
  }
  if (character === '"') {
    scanner.result += character; scanner.index += 1; scanner.state = 'double-quote'; return;
  }
  const tag = character === '$' ? /^\$[A-Za-z_][\w$]*\$|^\$\$/.exec(source.slice(index))?.[0] : null;
  if (tag) {
    appendMasked(scanner, tag); scanner.index += tag.length; scanner.state = 'dollar-quote'; scanner.dollarTag = tag; return;
  }
  scanner.result += character;
  scanner.index += 1;
}

function consumeLineComment(scanner) {
  const character = scanner.source[scanner.index];
  appendMasked(scanner, character);
  scanner.index += 1;
  if (character === '\n') scanner.state = 'code';
}

function consumeBlockComment(scanner) {
  const { source, index } = scanner;
  if (source[index] === '*' && source[index + 1] === '/') {
    appendMasked(scanner, '*/'); scanner.index += 2; scanner.state = 'code'; return;
  }
  appendMasked(scanner, source[index]);
  scanner.index += 1;
}

function consumeSingleQuote(scanner) {
  const { source, index } = scanner;
  if (source[index] === "'" && source[index + 1] === "'") {
    appendMasked(scanner, "''"); scanner.index += 2; return;
  }
  const character = source[index];
  appendMasked(scanner, character);
  scanner.index += 1;
  if (character === "'") scanner.state = 'code';
}

function consumeDoubleQuote(scanner) {
  const { source, index } = scanner;
  const character = source[index];
  scanner.result += character;
  scanner.index += 1;
  if (character === '"' && source[index + 1] === '"') {
    scanner.result += source[index + 1]; scanner.index += 1; return;
  }
  if (character === '"') scanner.state = 'code';
}

function consumeDollarQuote(scanner) {
  const { source, index, dollarTag } = scanner;
  if (source.startsWith(dollarTag, index)) {
    appendMasked(scanner, dollarTag); scanner.index += dollarTag.length; scanner.state = 'code'; scanner.dollarTag = null; return;
  }
  appendMasked(scanner, source[index]);
  scanner.index += 1;
}

const SQL_STATE_CONSUMERS = {
  code: consumeCode,
  'line-comment': consumeLineComment,
  'block-comment': consumeBlockComment,
  'single-quote': consumeSingleQuote,
  'double-quote': consumeDoubleQuote,
  'dollar-quote': consumeDollarQuote,
};

function sqlMasks(source, { preserveStrings = false } = {}) {
  const scanner = { source, preserveStrings, result: '', index: 0, state: 'code', dollarTag: null };
  while (scanner.index < source.length) SQL_STATE_CONSUMERS[scanner.state](scanner);
  return scanner.result;
}

function structuralSql(source) {
  return sqlMasks(source);
}

function functionStatements(source, structural) {
  const statements = [];
  let start = 0;
  for (let index = 0; index < structural.length; index += 1) {
    if (structural[index] !== ';') continue;
    const structuralStatement = structural.slice(start, index + 1);
    if (/^\s*CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\b/i.test(structuralStatement)) {
      statements.push(source.slice(start, index + 1));
    }
    start = index + 1;
  }
  return statements;
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
  for (const match of structural.matchAll(POLICY_EVENT)) {
    events.push({
      action: match[1].toUpperCase(),
      objectType: 'policy',
      objectName: `${match[3].replace(/\s+/g, '')}.${match[2].replace(/\s+/g, '')}`,
      line: lineAt(structural, match.index),
    });
  }
  for (const match of structural.matchAll(RLS_EVENT)) {
    events.push({
      action: 'ALTER',
      objectType: 'row_level_security',
      objectName: match[1].replace(/\s+/g, ''),
      operation: match[2].replace(/\s+/g, ' ').toUpperCase(),
      line: lineAt(structural, match.index),
    });
  }
  const gaps = [];
  if (!version) gaps.push('Nome sem versão de migration reconhecida.');
  const commentFree = sqlMasks(source, { preserveStrings: true });
  if (functionStatements(commentFree, structural).some(statement => /\bEXECUTE\b|\bFORMAT\s*\(/i.test(statement))) gaps.push('SQL dinâmico em corpo de função: objetos podem não ser extraídos estaticamente.');
  if (/\b(?:CREATE|ALTER|DROP)\s+POLICY\b|\b(?:ENABLE|DISABLE|FORCE|NO\s+FORCE)\s+ROW\s+LEVEL\s+SECURITY\b/i.test(structural) && !events.some(event => event.objectType === 'policy' || event.objectType === 'row_level_security')) {
    gaps.push('RLS/policy com sintaxe não reconhecida estaticamente.');
  }
  for (const [kind, expression] of UNSUPPORTED_SQL) {
    if (expression.test(structural)) gaps.push(`Construto ${kind} ainda não é modelado estaticamente.`);
  }
  return { version, events, gaps };
}

export function extractCodeReferences(_filePath, source) {
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
