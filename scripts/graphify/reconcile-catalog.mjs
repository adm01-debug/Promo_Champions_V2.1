#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertSafeNewOutputPath, createSafeOutputParents, isPathInside, sanitizeError } from './graphify-utils.mjs';
import { reconcileStaticContracts } from './catalog-adapter.mjs';

function argument(flag) {
  const index = process.argv.indexOf(flag);
  const value = process.argv[index + 1];
  if (index === -1 || !value || value.startsWith('--')) throw new Error(`${flag} é obrigatório.`);
  return value;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const root = fs.realpathSync(process.cwd());
    const contracts = JSON.parse(fs.readFileSync(path.resolve(root, argument('--contracts')), 'utf8'));
    const catalog = JSON.parse(fs.readFileSync(path.resolve(root, argument('--catalog')), 'utf8'));
    const outputRoot = path.join(root, '.graphify-local');
    fs.mkdirSync(outputRoot, { recursive: true });
    const outputPlan = assertSafeNewOutputPath(outputRoot, path.resolve(root, argument('--out')));
    if (!isPathInside(root, outputPlan.resolvedRoot) || path.extname(outputPlan.candidate) !== '.json') throw new Error('--out deve ser JSON novo dentro de .graphify-local/.');
    createSafeOutputParents(outputPlan.resolvedRoot, outputPlan.relativePath);
    const report = { ...reconcileStaticContracts(contracts, catalog), generatedAt: new Date().toISOString(), source: { contractsDigest: contracts.digest ?? null, catalogDigest: catalog.digest ?? null } };
    fs.writeFileSync(outputPlan.candidate, `${JSON.stringify(report, null, 2)}\n`, { mode: 0o600 });
    console.info(`Reconciliação pronta: ${report.unresolvedStaticReferences.length} referências estáticas sem objeto observado e ${report.dynamicReferences.length} referências dinâmicas.`);
  } catch (error) {
    console.error(`Reconciliação recusada: ${sanitizeError(error)}`);
    process.exitCode = 1;
  }
}
