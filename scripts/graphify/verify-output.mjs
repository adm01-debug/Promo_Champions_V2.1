#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { findSecretSignals, validateGraphDocument } from './graphify-utils.mjs';

function readArgument(flag) {
  const index = process.argv.indexOf(flag);
  if (index === -1 || !process.argv[index + 1]) {
    throw new Error(`Informe ${flag} <caminho>.`);
  }
  return process.argv[index + 1];
}

try {
  const graphPath = path.resolve(readArgument('--graph'));
  const raw = fs.readFileSync(graphPath, 'utf8');
  const document = JSON.parse(raw);
  const signals = [...new Set([...findSecretSignals(raw), ...findSecretSignals(JSON.stringify(document))])];
  if (signals.length > 0) {
    throw new Error(`Artefato recusado por ${signals.join(', ')}.`);
  }

  const summary = validateGraphDocument(document);
  console.info(`Graphify válido: ${summary.nodes} nós, ${summary.edges} arestas.`);
  if (summary.unresolvedImports > 0) {
    console.warn(
      `Graphify reportou ${summary.unresolvedImports} importação(ões) externa(s) ou fora do escopo sem nó local.`
    );
  }
  if (summary.collapseRisk > 0) {
    console.warn(
      `Graphify reportou risco de colapso: ${summary.collapseRisk} relação(ões) em ${summary.multiRelationPairs} par(es) de nós.`
    );
  }
} catch (error) {
  console.error(`Falha ao validar saída do Graphify: ${error.message}`);
  process.exitCode = 1;
}
