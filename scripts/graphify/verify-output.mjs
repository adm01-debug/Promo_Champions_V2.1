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
  const signals = findSecretSignals(raw);
  if (signals.length > 0) {
    throw new Error(`Artefato recusado por ${signals.join(', ')}.`);
  }

  const summary = validateGraphDocument(JSON.parse(raw));
  console.info(`Graphify válido: ${summary.nodes} nós, ${summary.edges} arestas.`);
  if (summary.externalReferences > 0) {
    console.warn(
      `Graphify reportou ${summary.externalReferences} referência(s) externa(s) de importação sem nó local.`
    );
  }
} catch (error) {
  console.error(`Falha ao validar saída do Graphify: ${error.message}`);
  process.exitCode = 1;
}
