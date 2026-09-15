#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertSafeNewOutputPath, createSafeOutputParents, digestValue, isPathInside, redactSensitiveText } from './graphify-utils.mjs';

const COLLECTIONS = ['schemas', 'tables', 'functions', 'views', 'enums', 'extensions', 'roles', 'buckets', 'jobs'];

function objectId(kind, value) {
  return `${kind}:${value}`;
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

function sanitizeMetadata(value) {
  if (typeof value === 'string') return safeText(value);
  if (Array.isArray(value)) return value.map(sanitizeMetadata);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, sanitizeMetadata(item)]));
  }
  return value ?? null;
}

function normalizeTable(table) {
  if (!table?.schema || !table?.name) throw new Error('Tabela sem schema ou nome.');
  const qualified = `${table.schema}.${table.name}`;
  return {
    id: objectId('table', qualified), schema: table.schema, name: table.name,
    rls: { enabled: Boolean(table.rls?.enabled), forced: Boolean(table.rls?.forced) },
    columns: (table.columns ?? []).map(column => ({
      id: objectId('column', `${qualified}.${column.name}`), name: column.name, type: column.type ?? null,
      nullable: column.nullable ?? null, default: safeText(column.default), generated: Boolean(column.generated), identity: Boolean(column.identity),
    })),
    constraints: (table.constraints ?? []).map(constraint => ({ id: objectId('constraint', `${qualified}.${constraint.name}`), name: constraint.name, type: constraint.type, definition: safeText(constraint.definition) })),
    indexes: (table.indexes ?? []).map(index => ({ id: objectId('index', `${qualified}.${index.name}`), name: index.name, unique: Boolean(index.unique), definition: safeText(index.definition) })),
    policies: (table.policies ?? []).map(policy => ({ id: objectId('policy', `${qualified}.${policy.name}`), name: policy.name, command: policy.command, permissive: policy.permissive ?? null, roles: policy.roles ?? [], using: safeText(policy.using), check: safeText(policy.check) })),
    grants: (table.grants ?? []).map(grant => ({ role: grant.role, privileges: [...(grant.privileges ?? [])].sort() })),
    defaultGrants: (table.defaultGrants ?? []).map(grant => ({ role: grant.role, privileges: [...(grant.privileges ?? [])].sort() })),
    triggers: (table.triggers ?? []).map(trigger => ({ id: objectId('trigger', `${qualified}.${trigger.name}`), name: trigger.name, function: trigger.function ?? null, enabled: trigger.enabled ?? null })),
  };
}

function validateRawCatalog(raw, expectedProject) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('Catálogo bruto inválido.');
  if (raw.rows || raw.records || raw.data) throw new Error('O adaptador aceita apenas metadados, nunca linhas de negócio.');
  if (raw.identity?.projectRef !== expectedProject) throw new Error('Projeto do catálogo não confere com o projeto esperado.');
  if (raw.identity?.readOnly !== true) throw new Error('O catálogo precisa comprovar sessão somente leitura.');
}

function mapSchemas(raw) {
  return (raw.schemas ?? []).map(schema => ({ id: objectId('schema', schema.name), name: schema.name }));
}

function mapFunctions(raw) {
  return (raw.functions ?? []).map(fn => ({ id: objectId('function', `${fn.schema}.${fn.name}.${fn.signature ?? ''}`), schema: fn.schema, name: fn.name, signature: fn.signature ?? '', securityDefiner: Boolean(fn.securityDefiner), searchPath: safeText(fn.searchPath), grants: sanitizeMetadata(fn.grants ?? []) }));
}

function mapViews(raw) {
  return (raw.views ?? []).map(view => ({ id: objectId('view', `${view.schema}.${view.name}`), schema: view.schema, name: view.name, materialized: Boolean(view.materialized), definition: safeText(view.definition) }));
}

function mapEnums(raw) {
  return (raw.enums ?? []).map(enumeration => ({ id: objectId('enum', `${enumeration.schema}.${enumeration.name}`), schema: enumeration.schema, name: enumeration.name, values: enumeration.values ?? [] }));
}

function mapExtensions(raw) {
  return (raw.extensions ?? []).map(extension => ({ id: objectId('extension', extension.name), name: extension.name, version: extension.version ?? null, schema: extension.schema ?? null }));
}

function mapRoles(raw) {
  return (raw.roles ?? []).map(role => ({ id: objectId('role', role.name), name: role.name, canLogin: role.canLogin ?? null, memberships: sanitizeMetadata(role.memberships ?? []) }));
}

function mapBuckets(raw) {
  return (raw.buckets ?? []).map(bucket => ({ id: objectId('bucket', bucket.name), name: bucket.name, public: Boolean(bucket.public), fileSizeLimit: bucket.fileSizeLimit ?? null, policies: sanitizeMetadata(bucket.policies ?? []) }));
}

function mapJobs(raw) {
  return (raw.jobs ?? []).map(job => ({ id: objectId('job', String(job.id)), idValue: job.id, schedule: safeText(job.schedule), active: Boolean(job.active), command: safeText(job.command), target: job.target ?? null }));
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
  const tables = new Set(catalog.tables.map(table => `${table.schema}.${table.name}`));
  const functions = new Set(catalog.functions.map(fn => `${fn.schema}.${fn.name}`));
  const buckets = new Set(catalog.buckets.map(bucket => bucket.name));
  const references = contracts.references ?? [];
  const unresolved = references.filter(reference => {
    if (!reference.name) return false;
    if (reference.kind === 'table') return !tables.has(reference.name) && !tables.has(`public.${reference.name}`);
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
    console.error(`Catálogo recusado: ${error.message}`);
    process.exitCode = 1;
  }
}
