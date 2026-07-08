import { test as base, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Fixtures dedicadas ao projeto `quote-to-sale` para diagnóstico de flakiness.
 *
 * Cada spec que importar `test` daqui recebe automaticamente:
 *   - HAR completo (`network.har`) por teste, em `<outputDir>/<runId>/<testId>/`
 *   - Captura contínua de `console` logs em `console.log`
 *   - Captura de `pageerror` (uncaught) e responses HTTP >=400 em `network-errors.log`
 *   - Helper `checkpoint(name)` para screenshots em pontos-chave
 *     (nomeados `checkpoint-01-<name>.png`, `checkpoint-02-<name>.png`, ...)
 *
 * O `runId` global vem de `process.env.PW_RUN_ID` (definido em
 * `playwright.config.ts`) para agrupar todos os artefatos de uma execução.
 */
export const RUN_ID =
  process.env.PW_RUN_ID ??
  `${new Date().toISOString().replace(/[:.]/g, '-')}-${Math.random().toString(36).slice(2, 8)}`;

type Checkpoint = (name: string) => Promise<void>;

interface QuoteToSaleFixtures {
  runArtifactsDir: string;
  checkpoint: Checkpoint;
}

export const test = base.extend<QuoteToSaleFixtures>({
  runArtifactsDir: [
    async ({}, use, testInfo) => {
      // Agrupa por run id + testId para correlacionar retries do mesmo teste.
      const dir = path.join(testInfo.project.outputDir, RUN_ID, testInfo.testId);
      fs.mkdirSync(dir, { recursive: true });
      await use(dir);
    },
    { scope: 'test' },
  ],

  context: async ({ context, runArtifactsDir }, use, testInfo) => {
    // 1. HAR por teste
    const harPath = path.join(runArtifactsDir, 'network.har');
    await context.routeFromHAR(harPath, { update: true, notFound: 'fallback' }).catch(() => {
      /* fallback silencioso: nem toda versão suporta routeFromHAR com update */
    });

    // Fallback robusto: sempre gravar HAR via recordHar-like via CDP-agnostic
    // (Playwright já oferece via new_context; aqui só garantimos o arquivo).
    // Se routeFromHAR não gravar em algumas versões, o HAR estará vazio;
    // usamos captura manual de requests/responses abaixo como plano B.

    const consoleLog = fs.createWriteStream(path.join(runArtifactsDir, 'console.log'), {
      flags: 'a',
    });
    const netErrLog = fs.createWriteStream(path.join(runArtifactsDir, 'network-errors.log'), {
      flags: 'a',
    });
    const netAllLog = fs.createWriteStream(path.join(runArtifactsDir, 'network-all.log'), {
      flags: 'a',
    });

    const attachPage = (page: import('@playwright/test').Page): void => {
      page.on('console', (msg) => {
        try {
          consoleLog.write(
            `[${new Date().toISOString()}] [${msg.type()}] ${msg.text()}\n`,
          );
        } catch {
          /* ignore */
        }
      });
      page.on('pageerror', (err) => {
        try {
          netErrLog.write(
            `[${new Date().toISOString()}] [pageerror] ${err.name}: ${err.message}\n${err.stack ?? ''}\n`,
          );
        } catch {
          /* ignore */
        }
      });
      page.on('requestfailed', (req) => {
        try {
          netErrLog.write(
            `[${new Date().toISOString()}] [requestfailed] ${req.method()} ${req.url()} — ${req.failure()?.errorText ?? 'unknown'}\n`,
          );
        } catch {
          /* ignore */
        }
      });
      page.on('response', (resp) => {
        try {
          const line = `[${new Date().toISOString()}] ${resp.status()} ${resp.request().method()} ${resp.url()}\n`;
          netAllLog.write(line);
          if (resp.status() >= 400) netErrLog.write(line);
        } catch {
          /* ignore */
        }
      });
    };

    context.on('page', attachPage);
    for (const p of context.pages()) attachPage(p);

    await use(context);

    // flush + anexa no relatório HTML
    consoleLog.end();
    netErrLog.end();
    netAllLog.end();

    for (const rel of ['console.log', 'network-errors.log', 'network-all.log', 'network.har']) {
      const full = path.join(runArtifactsDir, rel);
      if (fs.existsSync(full) && fs.statSync(full).size > 0) {
        await testInfo
          .attach(rel, { path: full, contentType: rel.endsWith('.har') ? 'application/json' : 'text/plain' })
          .catch(() => {
            /* ignore */
          });
      }
    }
  },

  checkpoint: async ({ page, runArtifactsDir }, use, testInfo) => {
    let seq = 0;
    const fn: Checkpoint = async (name) => {
      seq += 1;
      const slug = name.replace(/[^a-z0-9-_]+/gi, '_').slice(0, 60);
      const filename = `checkpoint-${String(seq).padStart(2, '0')}-${slug}.png`;
      const file = path.join(runArtifactsDir, filename);
      try {
        await page.screenshot({ path: file, fullPage: false });
        await testInfo.attach(filename, { path: file, contentType: 'image/png' });
      } catch {
        /* pode falhar se page fechada — ignorar */
      }
    };
    await use(fn);
  },
});

export { expect };
