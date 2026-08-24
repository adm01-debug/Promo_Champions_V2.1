import { test as base, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Fixtures dedicadas ao projeto `quote-to-sale` para diagnóstico de flakiness.
 *
 * Organização dos artefatos por execução:
 *
 *   test-results/quote-to-sale/<RUN_ID>/<testId>/
 *     ├── har/network.har
 *     ├── console/console.log
 *     ├── network/network-all.log
 *     ├── network/network-errors.log
 *     └── screenshots/checkpoint-01-<name>.png
 *
 * Trace, vídeo e screenshots de falha do próprio Playwright continuam sob
 * `test-results/quote-to-sale/<RUN_ID>/<testDir>/` (config `outputDir`).
 *
 * O `runId` global vem de `process.env.PW_RUN_ID` (definido em
 * `playwright.config.ts`) para agrupar todos os artefatos de uma execução.
 */
export const RUN_ID =
  process.env.PW_RUN_ID ??
  `${new Date().toISOString().replace(/[:.]/g, '-')}-${Math.random().toString(36).slice(2, 8)}`;

const SUBDIRS = {
  har: 'har',
  console: 'console',
  network: 'network',
  screenshots: 'screenshots',
} as const;

type Checkpoint = (name: string) => Promise<void>;

interface QuoteToSaleFixtures {
  runArtifactsDir: string;
  checkpoint: Checkpoint;
  waitForNetworkIdle: (timeoutMs?: number) => Promise<void>;
}

export const test = base.extend<QuoteToSaleFixtures>({
  runArtifactsDir: [
    async ({}, use, testInfo) => {
      const base = path.join(testInfo.project.outputDir, RUN_ID, testInfo.testId);
      for (const sub of Object.values(SUBDIRS)) {
        fs.mkdirSync(path.join(base, sub), { recursive: true });
      }
      await use(base);
    },
    { scope: 'test' },
  ],

  context: async ({ context, runArtifactsDir }, use, testInfo) => {
    const harPath = path.join(runArtifactsDir, SUBDIRS.har, 'network.har');
    await context
      .routeFromHAR(harPath, { update: true, notFound: 'fallback' })
      .catch(() => {
        /* fallback silencioso se a versão do Playwright não suportar update */
      });

    const consoleLog = fs.createWriteStream(
      path.join(runArtifactsDir, SUBDIRS.console, 'console.log'),
      { flags: 'a' },
    );
    const netErrLog = fs.createWriteStream(
      path.join(runArtifactsDir, SUBDIRS.network, 'network-errors.log'),
      { flags: 'a' },
    );
    const netAllLog = fs.createWriteStream(
      path.join(runArtifactsDir, SUBDIRS.network, 'network-all.log'),
      { flags: 'a' },
    );

    const attachPage = (page: import('@playwright/test').Page): void => {
      page.on('console', (msg) => {
        try {
          consoleLog.write(`[${new Date().toISOString()}] [${msg.type()}] ${msg.text()}\n`);
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

    consoleLog.end();
    netErrLog.end();
    netAllLog.end();

    const attachments: Array<[string, string, string]> = [
      ['har/network.har', path.join(runArtifactsDir, SUBDIRS.har, 'network.har'), 'application/json'],
      ['console/console.log', path.join(runArtifactsDir, SUBDIRS.console, 'console.log'), 'text/plain'],
      ['network/network-all.log', path.join(runArtifactsDir, SUBDIRS.network, 'network-all.log'), 'text/plain'],
      ['network/network-errors.log', path.join(runArtifactsDir, SUBDIRS.network, 'network-errors.log'), 'text/plain'],
    ];
    for (const [name, full, contentType] of attachments) {
      if (fs.existsSync(full) && fs.statSync(full).size > 0) {
        await testInfo.attach(name, { path: full, contentType }).catch(() => {});
      }
    }
  },

  checkpoint: async ({ page, runArtifactsDir }, use, testInfo) => {
    let seq = 0;
    const fn: Checkpoint = async (name) => {
      seq += 1;
      const slug = name.replace(/[^a-z0-9-_]+/gi, '_').slice(0, 60);
      const filename = `checkpoint-${String(seq).padStart(2, '0')}-${slug}.png`;
      const file = path.join(runArtifactsDir, SUBDIRS.screenshots, filename);
      try {
        await page.screenshot({ path: file, fullPage: false });
        await testInfo.attach(`screenshots/${filename}`, { path: file, contentType: 'image/png' });
      } catch {
        /* pode falhar se page fechada — ignorar */
      }
    };
    await use(fn);
  },

  /**
   * Espera determinística: aguarda `networkidle` + um pequeno settle para
   * mudanças de estado do React Query após mutações.
   */
  waitForNetworkIdle: async ({ page }, use) => {
    const fn = async (timeoutMs = 10_000): Promise<void> => {
      await page.waitForLoadState('networkidle', { timeout: timeoutMs }).catch(() => {
        /* algumas páginas mantêm conexões abertas (realtime); ignorar timeout */
      });
      await page.waitForTimeout(150);
    };
    await use(fn);
  },
});

export { expect };
