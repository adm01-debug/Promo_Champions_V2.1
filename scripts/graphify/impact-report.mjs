#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { findPotentialImpact } from './multigraph.mjs';
import { digestValue } from './graphify-utils.mjs';

function readArgument(flag) {
  const index = process.argv.indexOf(flag);
  const value = process.argv[index + 1];
  if (index === -1 || !value || value.startsWith('--')) throw new Error(`Informe ${flag} <valor>.`);
  return value;
}

try {
  const graphPath = path.resolve(readArgument('--graph'));
  const changed = readArgument('--changed').split(',').map(value => value.trim()).filter(Boolean);
  if (changed.length === 0) throw new Error('--changed exige ao menos um id de nó.');
  const graph = JSON.parse(fs.readFileSync(graphPath, 'utf8'));
  const snapshotIndex = process.argv.indexOf('--snapshot');
  if (snapshotIndex !== -1 && !process.argv[snapshotIndex + 1]) throw new Error('--snapshot exige um caminho.');
  const snapshotPath = path.resolve(snapshotIndex === -1 ? path.join(path.dirname(graphPath), 'snapshot.json') : process.argv[snapshotIndex + 1]);
  if (!fs.existsSync(snapshotPath)) throw new Error('snapshot.json ausente; impacto exige geração identificada.');
  const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));
  if (snapshot.multigraph?.digest !== digestValue(graph)) throw new Error('multigraph.json não confere com snapshot.json.');
  const report = { ...findPotentialImpact(graph, changed), snapshot: { commit: snapshot.source?.commit ?? null, scope: snapshot.source?.scope ?? null } };
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  console.error(`Relatório de impacto recusado: ${error.message}`);
  process.exitCode = 1;
}
