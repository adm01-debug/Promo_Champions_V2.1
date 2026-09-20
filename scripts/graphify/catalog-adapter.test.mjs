import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeCatalog, reconcileStaticContracts } from './catalog-adapter.mjs';
import { digestValue } from './graphify-utils.mjs';

function fixture() {
  return {
    identity: { projectRef: 'usyxfpqlsspldubptrdl', observedAt: '2026-09-11T00:00:00Z', readOnly: true },
    schemas: [{ name: 'public' }],
    tables: [{ schema: 'public', name: 'sales', rls: { enabled: true, forced: true }, columns: [{ name: 'id', type: 'uuid', nullable: false, identity: true }], constraints: [{ name: 'sales_pkey', type: 'PRIMARY KEY' }], indexes: [{ name: 'sales_pkey', unique: true }], policies: [{ name: 'sales_read', command: 'SELECT', roles: ['authenticated'], using: 'auth.uid() = owner_id' }], grants: [{ role: 'authenticated', privileges: ['SELECT'] }], defaultGrants: [{ role: 'authenticated', privileges: ['SELECT'] }], triggers: [{ name: 'sales_audit', function: 'public.audit_sale', enabled: true }] }],
    functions: [{ schema: 'public', name: 'sync_score', signature: 'uuid', securityDefiner: true, searchPath: 'public' }],
    views: [{ schema: 'public', name: 'sales_public', definition: 'select * from public.sales' }],
    enums: [{ schema: 'public', name: 'sale_status', values: ['open', 'won'] }],
    extensions: [{ name: 'pg_cron', version: '1.6', schema: 'extensions' }], roles: [{ name: 'authenticated', canLogin: false }],
    buckets: [{ name: 'avatars', public: false }], jobs: [{ id: 1, schedule: '* * * * *', active: true, command: 'select cron_job()' }],
  };
}

test('normaliza catálogo rico sem incluir linhas de negócio', () => {
  const raw = fixture();
  raw.gaps = ['token=sbp_123456789012345678901234567890'];
  raw.capabilities = { Authorization: 'Bearer abcdefghijklmnopqrstuvwxyz' };
  const catalog = normalizeCatalog(raw, 'usyxfpqlsspldubptrdl');
  assert.equal(catalog.tables[0].rls.forced, true);
  assert.equal(catalog.tables[0].policies[0].id, 'policy:public.sales.sales_read');
  assert.equal(catalog.functions[0].id, 'function:public.sync_score.uuid');
  assert.match(catalog.digest, /^[a-f0-9]{64}$/);
  assert.doesNotMatch(catalog.gaps[0], /sbp_123456789012345678901234567890/);
  assert.equal(catalog.provenance.independentlyVerified, false);
  assert.equal(catalog.capabilities.Authorization, '[REDACTED]');
  assert.equal(normalizeCatalog({ ...fixture(), tables: [{ schema: 'public', name: 'partial' }] }, 'usyxfpqlsspldubptrdl').tables[0].rls.enabled, null);
});

test('recusa projeto, sessão e linhas não comprovados', () => {
  assert.throws(() => normalizeCatalog({ ...fixture(), identity: { ...fixture().identity, projectRef: 'outro' } }, 'usyxfpqlsspldubptrdl'));
  assert.throws(() => normalizeCatalog({ ...fixture(), identity: { ...fixture().identity, readOnly: false } }, 'usyxfpqlsspldubptrdl'));
  assert.throws(() => normalizeCatalog({ ...fixture(), rows: [{ id: 1 }] }, 'usyxfpqlsspldubptrdl'));
});

test('reconciliação trata ausência como pendência, não como remoção', () => {
  const catalog = normalizeCatalog(fixture(), 'usyxfpqlsspldubptrdl');
  assert.throws(() => reconcileStaticContracts({ references: [] }, catalog));
  catalog.provenance.independentlyVerified = true;
  catalog.digest = digestValue({ ...catalog, digest: undefined });
  const result = reconcileStaticContracts({ references: [{ kind: 'table', name: 'public.sales', sourceFile: 'a.ts' }, { kind: 'rpc', name: 'missing', sourceFile: 'b.ts' }, { kind: 'dynamic_reference', name: null, sourceFile: 'c.ts' }] }, catalog);
  assert.equal(result.unresolvedStaticReferences.length, 1);
  assert.equal(result.dynamicReferences.length, 1);
  assert.match(result.limitations[0], /não prova perda/);
});
