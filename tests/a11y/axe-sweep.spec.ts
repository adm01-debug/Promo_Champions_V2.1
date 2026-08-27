import { test, expect, type BrowserContext, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { A11Y_ROUTES } from './routes';

const AUTH_INJECTED = process.env.LOVABLE_BROWSER_AUTH_STATUS === 'injected';
const REPORT_ONLY = process.env.A11Y_REPORT_ONLY === '1';

const SESSION_JSON = process.env.LOVABLE_BROWSER_SUPABASE_SESSION_JSON;
const STORAGE_KEY = process.env.LOVABLE_BROWSER_SUPABASE_STORAGE_KEY;
const COOKIES_JSON = process.env.LOVABLE_BROWSER_SUPABASE_COOKIES_JSON;

const BASE_URL = process.env.A11Y_BASE_URL ?? 'http://localhost:5173';

/**
 * Restaura a sessão Supabase (localStorage + cookies SSR) antes de navegar
 * para uma rota autenticada. No-op se a sessão gerenciada não estiver injetada.
 */
async function restoreSupabaseSession(
  context: BrowserContext,
  page: Page
): Promise<void> {
  if (!AUTH_INJECTED) return;

  if (COOKIES_JSON) {
    try {
      const cookies = JSON.parse(COOKIES_JSON) as Array<Record<string, unknown>>;
      const scoped = cookies.map(c => ({ ...c, url: BASE_URL }));
      // Playwright aceita cookies como array; tipagem tolerante ao formato do @supabase/ssr.
      await context.addCookies(scoped as Parameters<BrowserContext['addCookies']>[0]);
    } catch {
      /* silencioso — cookies opcionais */
    }
  }

  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

  if (STORAGE_KEY && SESSION_JSON) {
    await page.evaluate(
      ([key, value]) => {
        window.localStorage.setItem(key, value);
      },
      [STORAGE_KEY, SESSION_JSON] as const
    );
  }
}

interface AxeViolationNode {
  target: string[] | string;
  html?: string;
  failureSummary?: string;
}

interface AxeViolation {
  id: string;
  impact?: string | null;
  help: string;
  helpUrl: string;
  nodes: AxeViolationNode[];
}

function formatViolations(routeName: string, violations: AxeViolation[]): string {
  const lines: string[] = [
    `\n[a11y] ${routeName} — ${violations.length} violação(ões) serious/critical:`,
  ];
  for (const v of violations) {
    lines.push(`  • ${v.id} (${v.impact ?? 'unknown'}) — ${v.help}`);
    lines.push(`    ${v.helpUrl}`);
    for (const node of v.nodes.slice(0, 3)) {
      const selector = Array.isArray(node.target)
        ? node.target.join(' ')
        : String(node.target);
      lines.push(`      ↳ ${selector}`);
    }
    if (v.nodes.length > 3) lines.push(`      … +${v.nodes.length - 3} nó(s)`);
  }
  return lines.join('\n');
}

test.describe('Onda Q — a11y sweep (axe-core)', () => {
  for (const route of A11Y_ROUTES) {
    const label = `[${route.name}] ${route.path}`;
    test(label, async ({ page, context }) => {
      test.setTimeout(60_000);

      if (route.requiresAuth && !AUTH_INJECTED) {
        test.skip(
          true,
          'Sessão Supabase gerenciada não injetada (LOVABLE_BROWSER_AUTH_STATUS != injected).'
        );
        return;
      }

      if (route.requiresAuth) {
        await restoreSupabaseSession(context, page);
      }

      await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle').catch(() => {
        /* algumas rotas mantêm polling; segue com selector-âncora */
      });
      await expect(page.locator(route.waitFor).first()).toBeVisible({ timeout: 15_000 });

      // Pequeno buffer para animações Framer / hydration completar
      await page.waitForTimeout(400);

      const builder = new AxeBuilder({ page }).withTags([
        'wcag2a',
        'wcag2aa',
        'wcag21a',
        'wcag21aa',
      ]);

      if (route.ignoreRules?.length) {
        builder.disableRules(route.ignoreRules);
      }

      const results = await builder.analyze();
      const blocking = (results.violations as AxeViolation[]).filter(
        v => v.impact === 'serious' || v.impact === 'critical'
      );

      const routeAttachment: Record<string, unknown> = {
        route: route.name,
        path: route.path,
        blockingCount: blocking.length,
        totalViolations: results.violations.length,
        violations: blocking.map(v => ({
          id: v.id,
          impact: v.impact,
          help: v.help,
          helpUrl: v.helpUrl,
          nodes: v.nodes.length,
        })),
      };
      await test.info().attach(`a11y-${route.name}.json`, {
        body: JSON.stringify(routeAttachment, null, 2),
        contentType: 'application/json',
      });

      if (blocking.length > 0) {
        const msg = formatViolations(route.name, blocking);
        if (REPORT_ONLY) {
          console.warn(`[report-only] ${msg}`);
          return;
        }
        expect(blocking, msg).toEqual([]);
      }
    });
  }
});
