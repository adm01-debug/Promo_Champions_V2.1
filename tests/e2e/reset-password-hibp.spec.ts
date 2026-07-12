import { test, expect, type Page } from '@playwright/test';

/**
 * Suíte E2E — HIBP (leaked password) na página /reset-password
 *
 * Objetivo: validar ponta-a-ponta o comportamento da UI quando o usuário tenta
 * definir uma senha vazada conhecida (`Password123!`). O Supabase Auth, com
 * `password_hibp_enabled: true`, responde `422 { code: "weak_password", msg }`
 * ao endpoint PUT /auth/v1/user. A spec:
 *   1. Mocka sessão de recuperação para renderizar /reset-password
 *   2. Intercepta PUT /auth/v1/user devolvendo o payload real do HIBP
 *   3. Submete o formulário com Password123! (senha notoriamente vazada)
 *   4. Assert: toast em PT-BR de classifyPasswordError e permanência na rota
 *
 * Para o cenário de senha forte, a spec intercepta com sucesso e valida a
 * transição de UI para o estado "Senha Atualizada!".
 */

const MOCK_SESSION = {
  access_token: 'mock-recovery-token',
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  refresh_token: 'mock-refresh',
  user: {
    id: 'e2e-reset-user',
    email: 'reset@promo.test',
    aud: 'authenticated',
    role: 'authenticated',
    app_metadata: { provider: 'email' },
    user_metadata: { full_name: 'Reset Tester' },
  },
};

async function primeRecoverySession(page: Page) {
  await page.route('**/auth/v1/user*', (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_SESSION.user),
      });
    }
    return route.fallback();
  });

  await page.addInitScript((session) => {
    const key = Object.keys(localStorage).find((k) => k.startsWith('sb-')) ?? 'sb-auth-token';
    localStorage.setItem(key, JSON.stringify(session));
    localStorage.setItem('supabase.auth.token', JSON.stringify(session));
  }, MOCK_SESSION);
}

test.describe('/reset-password — HIBP end-to-end', () => {
  test('senha vazada Password123! é bloqueada com mensagem PT-BR', async ({ page }) => {
    await primeRecoverySession(page);

    // Intercept apenas o PUT /auth/v1/user (updateUser) devolvendo o payload
    // exato que o Supabase Auth emite quando HIBP acusa a senha como vazada.
    await page.route('**/auth/v1/user', (route) => {
      if (route.request().method() !== 'PUT') return route.fallback();
      return route.fulfill({
        status: 422,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 'weak_password',
          error_code: 'weak_password',
          msg: 'Password is known to be weak and easy to guess, please choose a different one',
          message: 'Password is known to be weak and easy to guess, please choose a different one',
          weak_password: { reasons: ['pwned'] },
        }),
      });
    });

    await page.goto('/reset-password');

    // Preenche formulário com senha notoriamente vazada
    const pwd = page.getByLabel(/^Nova Senha$/i);
    const confirm = page.getByLabel(/Confirmar Senha/i);
    await expect(pwd).toBeVisible({ timeout: 15_000 });

    await pwd.fill('Password123!');
    await confirm.fill('Password123!');
    await page.getByRole('button', { name: /Atualizar Senha/i }).click();

    // Toast (sonner) exibe a mensagem PT-BR de classifyPasswordError → kind 'leaked'
    await expect(page.getByText(/vazamentos públicos conhecidos/i)).toBeVisible({
      timeout: 10_000,
    });

    // Permanece em /reset-password (não navegou para "/")
    await expect(page).toHaveURL(/\/reset-password/);

    // Não deve exibir o estado de sucesso
    await expect(page.getByText(/Senha Atualizada!/i)).toHaveCount(0);
  });

  test('senha forte é aceita e mostra estado de sucesso', async ({ page }) => {
    await primeRecoverySession(page);

    await page.route('**/auth/v1/user', (route) => {
      if (route.request().method() !== 'PUT') return route.fallback();
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ...MOCK_SESSION.user }),
      });
    });

    await page.goto('/reset-password');

    const pwd = page.getByLabel(/^Nova Senha$/i);
    await expect(pwd).toBeVisible({ timeout: 15_000 });

    await pwd.fill('Xk9!mQ2#vLp$7wZr');
    await page.getByLabel(/Confirmar Senha/i).fill('Xk9!mQ2#vLp$7wZr');
    await page.getByRole('button', { name: /Atualizar Senha/i }).click();

    await expect(page.getByText(/Senha Atualizada!/i)).toBeVisible({ timeout: 10_000 });
  });

  test('rejeita senha curta antes de chamar backend', async ({ page }) => {
    await primeRecoverySession(page);

    let putCalled = false;
    await page.route('**/auth/v1/user', (route) => {
      if (route.request().method() === 'PUT') putCalled = true;
      return route.fallback();
    });

    await page.goto('/reset-password');

    const pwd = page.getByLabel(/^Nova Senha$/i);
    await expect(pwd).toBeVisible({ timeout: 15_000 });

    await pwd.fill('abc12');
    await page.getByLabel(/Confirmar Senha/i).fill('abc12');
    await page.getByRole('button', { name: /Atualizar Senha/i }).click();

    await expect(page.getByText(/pelo menos 8 caracteres/i)).toBeVisible({ timeout: 5_000 });
    expect(putCalled).toBe(false);
  });
});
