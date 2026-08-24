import { test, expect } from '@playwright/test';
import { HAS_AUTH, SESSION_JSON, STORAGE_KEY, skipReason } from './helpers/auth';

/**
 * E2E — Auth logout flow (complementa `auth-navigation.spec.ts`)
 *
 * Cenário: usuário logado clica em "Sair do sistema" no DesktopTopBar,
 * a sessão é limpa e o app redireciona para /auth.
 */

test.describe('Auth — logout desktop', () => {
  test('signOut limpa sessão e redireciona para /auth', async ({ page, viewport }) => {
    test.skip(!HAS_AUTH, skipReason());
    test.skip((viewport?.width ?? 0) < 1024, 'Botão Sair só no DesktopTopBar');

    // Restaura sessão
    await page.goto('/');
    await page.evaluate(
      ([k, v]) => window.localStorage.setItem(k, v),
      [STORAGE_KEY, SESSION_JSON],
    );

    await page.goto('/dashboard');
    // Espera app carregar autenticado
    await expect(page).not.toHaveURL(/.*auth/, { timeout: 15_000 });

    // Clica em Sair (título estável definido no componente)
    const signOutBtn = page.getByTitle('Sair do sistema').first();
    if (!(await signOutBtn.isVisible().catch(() => false))) {
      // Fallback: procura pelo texto exato
      await page.getByText('Sair do sistema', { exact: true }).first().click();
    } else {
      await signOutBtn.click();
    }

    // Após logout, deve chegar em /auth
    await expect(page).toHaveURL(/.*auth/, { timeout: 15_000 });

    // Sessão foi removida do storage
    const storageEmpty = await page.evaluate(
      (k) => window.localStorage.getItem(k) === null,
      STORAGE_KEY,
    );
    expect(storageEmpty).toBe(true);
  });
});
