/**
 * Shared helpers used across all page-level E2E specs.
 * All page specs use the same auth restore + navigation pattern.
 */

import { test as base, Page } from '@playwright/test';
import { HAS_AUTH, SESSION_JSON, STORAGE_KEY, skipReason } from './auth';

/**
 * Base test suite — every page spec extends this.
 * Skips all authenticated tests when E2E credentials are not configured.
 */
export const test = base;

export function expect(sessionAuthenticated: boolean) {
  return sessionAuthenticated ? base : base.skip;
}

export const it = base;

/** Restore Supabase session in the browser's localStorage. */
export async function restoreSession(page: Page): Promise<void> {
  await page.goto('/');
  await page.evaluate(
    ([k, v]: [string, string]) => window.localStorage.setItem(k, v),
    [STORAGE_KEY, SESSION_JSON],
  );
}

/** Navigate to a route and wait for the page to finish loading. */
export async function loadPage(page: Page, route: string, timeout?: number): Promise<void> {
  await page.goto(route, { waitUntil: 'networkidle', timeout: timeout ?? 20_000 });
}

/**
 * Returns an error-skip decorator so tests fail fast if the page throws
 * an uncaught console.error during load.
 */
export function withConsoleErrorGuard(page: Page) {
  const errors: string[] = [];
  const handler = (msg: { type(): string; text(): string }) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  };
  page.on('console', handler);
  return {
    collect(): string[] {
      page.off('console', handler);
      return errors;
    },
  };
}

export { HAS_AUTH, SESSION_JSON, STORAGE_KEY, skipReason };
