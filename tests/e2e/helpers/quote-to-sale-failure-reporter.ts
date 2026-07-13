import type {
  FullConfig,
  FullResult,
  Reporter,
  TestCase,
  TestResult,
} from '@playwright/test/reporter';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Reporter dedicado ao projeto `quote-to-sale`: quando qualquer spec do
 * projeto termina definitivamente em falha (status !== 'passed' após todas
 * as retentativas), empacota TODOS os artefatos da execução atual em
 *
 *   test-results/quote-to-sale-artifacts-<RUN_ID>.zip
 *
 * Rodamos o empacotamento uma única vez em `onEnd` (evita zips parciais
 * durante retries). A pasta origem é `test-results/quote-to-sale/<RUN_ID>/`.
 */
export default class QuoteToSaleFailureReporter implements Reporter {
  private hasDefinitiveFailure = false;
  private runId: string;
  private root: string;

  constructor() {
    this.runId = process.env.PW_RUN_ID ?? 'unknown-run';
    this.root = path.resolve('test-results/quote-to-sale');
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    if (test.parent.project()?.name !== 'quote-to-sale') return;
    // Só considera falha definitiva se não houver mais retries pendentes.
    const maxRetries = test.retries;
    if (result.status !== 'passed' && result.retry >= maxRetries) {
      this.hasDefinitiveFailure = true;
    }
  }

  async onEnd(_result: FullResult): Promise<void> {
    if (!this.hasDefinitiveFailure) return;
    const src = path.join(this.root, this.runId);
    if (!fs.existsSync(src)) {
       
      console.warn(`[quote-to-sale reporter] Sem artefatos em ${src}; nada a empacotar.`);
      return;
    }
    const out = path.resolve(`test-results/quote-to-sale-artifacts-${this.runId}.zip`);
    try {
      execSync(`zip -r ${JSON.stringify(out)} ${JSON.stringify(this.runId)}`, {
        cwd: this.root,
        stdio: 'inherit',
      });
       
      console.log(`\n📦 [quote-to-sale] Artefatos empacotados em falha:\n   ${out}\n`);
    } catch (err) {
       
      console.error(`[quote-to-sale reporter] Falha ao empacotar artefatos:`, err);
    }
  }

  // Silencia hooks obrigatórios (interface Reporter).
  onBegin(_config: FullConfig): void {}
  printsToStdio(): boolean {
    return false;
  }
}
