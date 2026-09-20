#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertSafeNewOutputPath, createSafeOutputParents, digestValue, isPathInside, redactSensitiveText, sanitizeError } from './graphify-utils.mjs';

const COLLECTIONS = ['schemas', 'tables', 'functions', 'views', 'enums', 'extensions', 'roles', 'buckets', 'jobs'];
const SENSITIVE_META_KEY = /(?:authorization|api[_-]?key|token|secret|password|credential|connection(?:_?string)?|access[_-]?key)/i;

function objectId(kind, value) {
  return `${kind}:${value}`;
}

function requiredText(value, label) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} ausente ou inválido.`);
  return value;
}

function observedBoolean(value) {
  return typeof value === 'boolean' ? value : null;
}

function unique(items, label) {
  const ids = new Set();
  for (const item of items) {
    if (!item?.id || ids.has(item.id)) throw new Error(`Catálogo contém ${label} inválido ou duplicado.`);
    ids.add(item.id);
  }
  return items;
}

function safeText(value) {
  return typeof value === 'string' ? redactSensitiveText(value, 500) : value ?? null;
}

function sanitizeMetadata(value, key = '') {
  if (SENSITIVE_META_KEY.test(key)) return '[REDACTED]';
  if (typeof value === 'string') return safeText(value);
  if (Array.isArray(value)) return value.map(item => sanitizeMetadata(item));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([childKey, item]) => [childKey, sanitizeMetadata(item, childKey)]));
  }
  return value ?? null;
}

function normalizeTable(table) {
  const schema = requiredText(table?.schema, 'Schema da tabela');
  const name = requiredText(table?.name, 'Nome da tabela');
  const qualified = `${schema}.${name}`;
  return {
    id: objectId('table', qualified), schema, name,
    rls: { enabled: observedBoolean(table.rls?.enabled), forced: observedBoolean(table.rls?.forced) },
    columns: (table.columns ?? []).map(column => ({
      id: objectId('column', `${qualified}.${requiredText(column?.name, 'Nome da coluna')}`), name: requiredText(column?.name, 'Nome da coluna'), type: column.type ?? null,
      nullable: observedBoolean(column.nullable), default: safeText(column.default), generated: observedBoolean(column.generated), identity: observedBoolean(column.identity),
    })),
    constraints: (table.constraints ?? []).map(constraint => ({ id: objectId('constraint', `${qualified}.${requiredText(constraint?.name, 'Nome da constraint')}`), name: requiredText(constraint?.name, 'Nome da constraint'), type: constraint.type, definition: safeText(constraint.definition) })),
    indexes: (table.indexes ?? []).map(index => ({ id: objectId('index', `${qualified}.${requiredText(index?.name, 'Nome do índice')}`), name: requiredText(index?.name, 'Nome do índice'), unique: observedBoolean(index.unique), definition: safeText(index.definition) })),
    policies: (table.policies ?? []).map(policy => ({ id: objectId('policy', `${qualified}.${requiredText(policy?.name, 'Nome da policy')}`), name: requiredText(policy?.name, 'Nome da policy'), command: policy.command ?? null, permissive: observedBoolean(policy.permissive), roles: sanitizeMetadata(policy.roles ?? []), using: safeText(policy.using), check: safeText(policy.check) })),
    grants: (table.grants ?? []).map(grant => ({ role: grant.role, privileges: [...(grant.privileges ?? [])].sort() })),
    defaultGrants: (table.defaultGrants ?? []).map(grant => ({ role: grant.role, privileges: [...(grant.privileges ?? [])].sort() })),
    triggers: (table.triggers ?? []).map(trigger => ({ id: objectId('trigger', `${qualified}.${requiredText(trigger?.name, 'Nome do trigger')}`), name: requiredText(trigger?.name, 'Nome do trigger'), function: trigger.function ?? null, enabled: observedBoolean(trigger.enabled) })),
  };
}

function validateRawCatalog(raw, expectedProject) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('Catálogo bruto inválido.');
  if (raw.rows || raw.records || raw.data) throw new Error('O adaptador aceita apenas metadados, nunca linhas de negócio.');
  if (raw.identity?.projectRef !== expectedProject) throw new Error('Projeto do catálogo não confere com o projeto esperado.');
  if (raw.identity?.readOnly !== true) throw new Error('O catálogo precisa declarar sessão somente leitura.');
}

function mapSchemas(raw) {
  return (raw.schemas ?? []).map(schema => {
    const name = requiredText(schema?.name, 'Nome do schema');
    return { id: objectId('schema', name), name };
  });
}

function mapFunctions(raw) {
  return (raw.functions ?? []).map(fn => {
    const schema = requiredText(fn?.schema, 'Schema da função');
    const name = requiredText(fn?.name, 'Nome da função');
    return { id: objectId('function', `${schema}.${name}.${fn.signature ?? ''}`), schema, name, signature: fn.signature ?? '', securityDefiner: observedBoolean(fn.securityDefiner), searchPath: safeText(fn.searchPath), grants: sanitizeMetadata(fn.grants ?? []) };
  });
}

function mapViews(raw) {
  return (raw.views ?? []).map(view => {
    const schema = requiredText(view?.schema, 'Schema da view');
    const name = requiredText(view?.name, 'Nome da view');
    return { id: objectId('view', `${schema}.${name}`), schema, name, materialized: observedBoolean(view.materialized), definition: safeText(view.definition) };
  });
}

function mapEnums(raw) {
  return (raw.enums ?? []).map(enumeration => {
    const schema = requiredText(enumeration?.schema, 'Schema do enum');
    const name = requiredText(enumeration?.name, 'Nome do enum');
    return { id: objectId('enum', `${schema}.${name}`), schema, name, values: sanitizeMetadata(enumeration.values ?? []) };
  });
}

function mapExtensions(raw) {
  return (raw.extensions ?? []).map(extension => {
    const name = requiredText(extension?.name, 'Nome da extensão');
    return { id: objectId('extension', name), name, version: extension.version ?? null, schema: extension.schema ?? null };
  });
}

function mapRoles(raw) {
  return (raw.roles ?? []).map(role => {
    const name = requiredText(role?.name, 'Nome da role');
    return { id: objectId('role', name), name, canLogin: observedBoolean(role.canLogin), memberships: sanitizeMetadata(role.memberships ?? []) };
  });
}

function mapBuckets(raw) {
  return (raw.buckets ?? []).map(bucket => {
    const name = requiredText(bucket?.name, 'Nome do bucket');
    return { id: objectId('bucket', name), name, public: observedBoolean(bucket.public), fileSizeLimit: bucket.fileSizeLimit ?? null, policies: sanitizeMetadata(bucket.policies ?? []) };
  });
}

function mapJobs(raw) {
  return (raw.jobs ?? []).map(job => {
    const idValue = requiredText(String(job?.id ?? ''), 'Id do job');
    return { id: objectId('job', idValue), idValue: job.id, schedule: safeText(job.schedule), active: observedBoolean(job.active), command: safeText(job.command), target: job.target ?? null };
  });
}

function assertCollectionsUnique(normalized) {
  for (const collection of COLLECTIONS) unique(normalized[collection], collection);
  for (const table of normalized.tables) {
    unique(table.columns, 'colunas'); unique(table.constraints, 'constraints'); unique(table.indexes, 'índices'); unique(table.policies, 'policies'); unique(table.triggers, 'triggers');
  }
}

export function normalizeCatalog(raw, expectedProject) {
  validateRawCatalog(raw, expectedProject);
  const normalized = {
    schemaVersion: 1,
    identity: { projectRef: raw.identity.projectRef, observedAt: raw.identity.observedAt ?? null, readOnly: true },
    // A declaração RO é uma evidência de proveniência, não uma prova técnica da sessão.
    provenance: { readOnlyDeclared: true, independentlyVerified: false },
    capabilities: sanitizeMetadata(raw.capabilities ?? {}),
    schemas: mapSchemas(raw),
    tables: (raw.tables ?? []).map(normalizeTable),
    functions: mapFunctions(raw),
    views: mapViews(raw),
    enums: mapEnums(raw),
    extensions: mapExtensions(raw),
    roles: mapRoles(raw),
    buckets: mapBuckets(raw),
    jobs: mapJobs(raw),
    gaps: sanitizeMetadata(raw.gaps ?? []),
  };
  assertCollectionsUnique(normalized);
  normalized.digest = digestValue({ ...normalized, digest: undefined });
  return normalized;
}

export function reconcileStaticContracts(contracts, catalog) {
  if (catalog.schemaVersion !== 1 || catalog.provenance?.independentlyVerified !== true || catalog.digest !== digestValue({ ...catalog, digest: undefined })) {
    throw new Error('Reconciliação exige catálogo íntegro e verificado por coletor RO confiável.');
  }
  const tables = new Set(catalog.tables.map(table => `${table.schema}.${table.name}`));
  const functions = new Set(catalog.functions.map(fn => `${fn.schema}.${fn.name}`));
  const buckets = new Set(catalog.buckets.map(bucket => bucket.name));
  const references = contracts.references ?? [];
  const unresolved = references.filter(reference => {
    if (!reference.name) return false;
    if (reference.kind === 'table') return !tables.has(reference.name);
    if (reference.kind === 'rpc') return !functions.has(reference.name) && !functions.has(`public.${reference.name}`);
    if (reference.kind === 'storage_bucket') return !buckets.has(reference.name);
    return false;
  });
  return {
    schemaVersion: 1,
    projectRef: catalog.identity.projectRef,
    staticReferences: references.length,
    unresolvedStaticReferences: unresolved,
    dynamicReferences: references.filter(reference => reference.kind === 'dynamic_reference'),
    limitations: ['Ausência no catálogo observado não prova perda: pode haver schema não selecionado, referência dinâmica, ambiente divergente ou objeto intencionalmente removido.'],
  };
}

function parseArguments() {
  const values = new Map();
  for (let index = 2; index < process.argv.length; index += 2) values.set(process.argv[index], process.argv[index + 1]);
  for (const key of ['--input', '--out', '--expected-project']) if (!values.get(key)) throw new Error(`${key} é obrigatório.`);
  return values;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const args = parseArguments();
    const root = fs.realpathSync(process.cwd());
    const outputRoot = path.join(root, '.graphify-local');
    fs.mkdirSync(outputRoot, { recursive: true });
    const outputPlan = assertSafeNewOutputPath(outputRoot, path.resolve(root, args.get('--out')));
    if (!isPathInside(root, outputPlan.resolvedRoot) || path.extname(outputPlan.candidate) !== '.json') throw new Error('--out deve ser JSON novo dentro de .graphify-local/.');
    createSafeOutputParents(outputPlan.resolvedRoot, outputPlan.relativePath);
    const normalized = normalizeCatalog(JSON.parse(fs.readFileSync(path.resolve(root, args.get('--input')), 'utf8')), args.get('--expected-project'));
    fs.writeFileSync(outputPlan.candidate, `${JSON.stringify(normalized, null, 2)}\n`, { mode: 0o600 });
    console.info(`Catálogo normalizado: ${normalized.tables.length} tabelas, ${normalized.functions.length} funções e ${normalized.gaps.length} lacunas.`);
  } catch (error) {
    console.error(`Catálogo recusado: ${sanitizeError(error)}`);
    process.exitCode = 1;
  }
}
