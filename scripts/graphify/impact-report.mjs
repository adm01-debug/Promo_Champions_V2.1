#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { findPotentialImpact } from './multigraph.mjs';
import { digestFiles, digestValue, isPathInside, sanitizeError } from './graphify-utils.mjs';

function readArgument(flag) {
  const index = process.argv.indexOf(flag);
  const value = process.argv[index + 1];
  if (index === -1 || !value || value.startsWith('--')) throw new Error(`Informe ${flag} <valor>.`);
  return value;
}

function currentGitState(root) {
  const head = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' });
  const status = spawnSync('git', ['status', '--porcelain=v1', '--untracked-files=no'], { cwd: root, encoding: 'utf8' });
  if (head.status !== 0 || status.status !== 0) throw new Error('Não foi possível validar o estado Git atual.');
  return { commit: head.stdout.trim(), worktreeDigest: digestValue(status.stdout) };
}

function assertFreshSnapshot(snapshot, root) {
  const scope = snapshot.source?.scope;
  if (!scope || typeof scope !== 'string') throw new Error('snapshot.json não informa escopo de origem.');
  const scopePath = path.resolve(root, scope);
  if (!isPathInside(root, scopePath) || !fs.existsSync(scopePath)) throw new Error('Escopo do snapshot não está disponível neste checkout.');
  const state = currentGitState(root);
  if (snapshot.source.commit !== state.commit || snapshot.source.worktreeDigest !== state.worktreeDigest || snapshot.source.digest !== digestFiles(scopePath)) {
    throw new Error('Snapshot está obsoleto para este checkout; gere uma nova extração ou use --allow-stale com suíte completa.');
  }
}

try {
  const graphPath = path.resolve(readArgument('--graph'));
  const changed = readArgument('--changed').split(',').map(value => value.trim()).filter(Boolean);
  if (changed.length === 0) throw new Error('--changed exige ao menos um id de nó.');
  const graph = JSON.parse(fs.readFileSync(graphPath, 'utf8'));
  const nodeIds = new Set(graph.nodes?.map(node => node.id));
  const unknown = changed.filter(id => !nodeIds.has(id));
  if (unknown.length > 0) throw new Error('Há ids alterados que não existem no snapshot. Execute a suíte completa e gere um snapshot novo.');
  const snapshotIndex = process.argv.indexOf('--snapshot');
  if (snapshotIndex !== -1 && !process.argv[snapshotIndex + 1]) throw new Error('--snapshot exige um caminho.');
  const snapshotPath = path.resolve(snapshotIndex === -1 ? path.join(path.dirname(graphPath), 'snapshot.json') : process.argv[snapshotIndex + 1]);
  if (!fs.existsSync(snapshotPath)) throw new Error('snapshot.json ausente; impacto exige geração identificada.');
  const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));
  if (snapshot.multigraph?.digest !== digestValue(graph)) throw new Error('multigraph.json não confere com snapshot.json.');
  if (!process.argv.includes('--allow-stale')) assertFreshSnapshot(snapshot, fs.realpathSync(process.cwd()));
  const report = { ...findPotentialImpact(graph, changed), snapshot: { commit: snapshot.source?.commit ?? null, scope: snapshot.source?.scope ?? null } };
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  console.error(`Relatório de impacto recusado: ${sanitizeError(error)}`);
  process.exitCode = 1;
}
