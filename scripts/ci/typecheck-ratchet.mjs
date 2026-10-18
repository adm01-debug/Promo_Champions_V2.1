#!/usr/bin/env node
/**
 * Adaptador do gate de tipos para o verificador compartilhado da Arquitetura V2
 * (zapp-verify -> tipos.sh -> tc-rapido.sh), que espera
 * `scripts/ci/typecheck-ratchet.mjs` no repositório.
 *
 * O gate real deste repo é `npm run typecheck` = `tsc --noEmit` com ZERO erros
 * (CI: pr-checks.yml). Este repo não carrega baseline de dívida no typecheck
 * normal — qualquer diagnóstico reprova.
 *
 * Dois modos:
 *   node scripts/ci/typecheck-ratchet.mjs --output <arquivo>
 *       Analisa a saída de tsc já produzida pelo runner incremental
 *       (tc-rapido.sh) e reprova se houver qualquer `error TS`.
 *   node scripts/ci/typecheck-ratchet.mjs
 *       Roda `tsc --noEmit` (mesmo comando do CI) e propaga o resultado.
 */
import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
const outIdx = args.indexOf('--output');

if (outIdx !== -1) {
  const outFile = args[outIdx + 1];
  const text = existsSync(outFile) ? readFileSync(outFile, 'utf8') : '';
  const errors = text.match(/^\S+\(\d+,\d+\): error TS\d+:.*$/gm) ?? [];
  // TS5058 "caminho não existe": o runner compartilhado checa tsconfig.e2e.json
  // (layout do Zapp); aqui não existe — é drift de ferramenta, não erro de código.
  // Ignorado somente quando o arquivo citado realmente não existe no repo.
  const missingConfig = text.match(/error TS\d+: The specified path does not exist: '([^']+)'/g) ?? [];
  const ignorable = missingConfig.filter(line => {
    const cfg = line.match(/'([^']+)'/)?.[1];
    return cfg && !existsSync(cfg);
  });
  const otherErrors =
    (text.match(/error TS\d+:/g) ?? []).length - ignorable.length;
  if (errors.length > 0) {
    console.error(`typecheck: ${errors.length} erro(s) de tipo na saída fornecida:`);
    for (const line of errors.slice(0, 50)) console.error(`  ${line}`);
    process.exit(1);
  }
  if (otherErrors > 0) {
    console.error(`typecheck: ${otherErrors} erro(s) TS sem localização na saída fornecida:`);
    console.error(text.slice(0, 2000));
    process.exit(1);
  }
  console.log('typecheck: saída incremental limpa (0 erros).');
  process.exit(0);
}

const result = spawnSync('npx', ['--no-install', 'tsc', '--noEmit'], {
  stdio: 'inherit',
  cwd: process.cwd(),
});
process.exit(result.status ?? 1);
