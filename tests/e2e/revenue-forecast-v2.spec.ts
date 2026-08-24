import { test, expect, type Page } from '@playwright/test';

/**
 * Suíte E2E — Revenue Forecast v2 (/revenue-forecast-v2)
 *
 * Cobre:
 *  1. Renderização com sliders what-if (win rate, ticket, velocity, horizonte)
 *  2. Exibição das bandas P10 / P50 / P90 (cards de resumo + legenda do gráfico)
 *  3. Export CSV — clique dispara download com header e linhas de forecast
 *
 * Estratégia: sessão Supabase mockada em localStorage; role "manager" injetada
 * via intercept do endpoint /rest/v1/user_roles; useRevenueHistory recebe 12
 * meses sintéticos via intercept do /rest/v1/quotes (fonte usada pelo hook).
 */

const MOCK_SESSION = {
  access_token: 'mock-token',
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  refresh_token: 'mock-refresh',
  user: {
    id: 'e2e-forecast-user',
    email: 'forecast@promo.test',
    aud: 'authenticated',
    role: 'authenticated',
    app_metadata: { provider: 'email' },
    user_metadata: { full_name: 'Forecast Tester' },
  },
};

// Gera 12 meses de histórico sintético (jan/2024–dez/2024) com tendência de alta.
function syntheticHistoryRows() {
  const rows: Array<{ created_at: string; total: number; status: string }> = [];
  for (let i = 0; i < 12; i++) {
    const month = String(i + 1).padStart(2, '0');
    rows.push({
      created_at: `2024-${month}-15T12:00:00Z`,
      total: 10_000 + i * 1_500,
      status: 'won',
    });
  }
  return rows;
}

async function primeForecastRoute(page: Page) {
  await page.route('**/auth/v1/user*', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_SESSION.user),
    }),
  );

  // Manager role — desbloqueia o guard <Manager> em AppRoutes.
  await page.route('**/rest/v1/user_roles*', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'content-range': '0-0/1' },
      body: JSON.stringify([
        {
          id: 'role-1',
          user_id: MOCK_SESSION.user.id,
          role: 'manager',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]),
    }),
  );

  // Fonte do useRevenueHistory — devolve 12 meses sintéticos.
  await page.route('**/rest/v1/quotes*', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'content-range': '0-11/12' },
      body: JSON.stringify(syntheticHistoryRows()),
    }),
  );

  // Fallback para qualquer outra chamada REST — resposta vazia.
  await page.route('**/rest/v1/**', (route) => {
    if (route.request().url().includes('/user_roles') || route.request().url().includes('/quotes')) {
      return route.fallback();
    }
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'content-range': '0-0/0' },
      body: '[]',
    });
  });

  await page.addInitScript((session) => {
    const key = Object.keys(localStorage).find((k) => k.startsWith('sb-')) ?? 'sb-auth-token';
    localStorage.setItem(key, JSON.stringify(session));
    localStorage.setItem('supabase.auth.token', JSON.stringify(session));
  }, MOCK_SESSION);
}

test.describe('Revenue Forecast v2 — /revenue-forecast-v2', () => {
  test('renderiza header, sliders what-if e cards P10/P50/P90', async ({ page }) => {
    await primeForecastRoute(page);
    await page.goto('/revenue-forecast-v2');

    await expect(
      page.getByRole('heading', { level: 1, name: /Revenue Forecast v2/i }),
    ).toBeVisible({ timeout: 15_000 });

    // Cards de resumo com percentis
    await expect(page.getByText(/Próximo período \(P50\)/i)).toBeVisible();
    await expect(page.getByText(/Piso \(P10 acumulado\)/i)).toBeVisible();
    await expect(page.getByText(/Teto \(P90 acumulado\)/i)).toBeVisible();

    // Sliders what-if
    await expect(page.getByText(/Δ Win rate/i)).toBeVisible();
    await expect(page.getByText(/Δ Ticket médio/i)).toBeVisible();
    await expect(page.getByText(/Δ Velocity/i)).toBeVisible();
    await expect(page.getByText(/Horizonte de previsão/i)).toBeVisible();

    // Legenda com banda P10–P90 e linha P50 (Recharts renderiza em SVG)
    await expect(page.getByText(/Banda P10–P90/)).toBeVisible();
    await expect(page.getByText(/Previsão P50/)).toBeVisible();
  });

  test('mover slider what-if de win rate recalcula os cards P50', async ({ page }) => {
    await primeForecastRoute(page);
    await page.goto('/revenue-forecast-v2');

    const p50Card = page
      .locator('div', { has: page.getByText(/Próximo período \(P50\)/i) })
      .first();
    await expect(p50Card).toBeVisible({ timeout: 15_000 });

    // Captura valor inicial
    const initialText = (await p50Card.innerText()).replace(/\s+/g, ' ');

    // Localiza o slider de Δ Win rate e move para +25%
    const winRateSlider = page
      .locator('div', { has: page.getByText(/Δ Win rate/i) })
      .locator('[role="slider"]')
      .first();
    await winRateSlider.focus();
    for (let i = 0; i < 25; i++) await page.keyboard.press('ArrowRight');

    // O valor exibido "+X%" deve refletir o aumento
    await expect(page.getByText(/^\+\d+%/).first()).toBeVisible();

    // E o card P50 deve mudar (valor recomposto)
    await expect
      .poll(async () => (await p50Card.innerText()).replace(/\s+/g, ' '), {
        timeout: 8_000,
      })
      .not.toBe(initialText);
  });

  test('export CSV baixa arquivo com header P10/P50/P90 e linhas de forecast', async ({ page }) => {
    await primeForecastRoute(page);
    await page.goto('/revenue-forecast-v2');

    const exportBtn = page.getByRole('button', { name: /Exportar CSV/i });
    await expect(exportBtn).toBeVisible({ timeout: 15_000 });
    await expect(exportBtn).toBeEnabled({ timeout: 15_000 });

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      exportBtn.click(),
    ]);

    expect(download.suggestedFilename()).toMatch(/^revenue-forecast-v2-\d+m\.csv$/);

    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream) chunks.push(chunk as Buffer);
    const csv = Buffer.concat(chunks).toString('utf-8');

    // Header
    expect(csv.split('\n')[0]).toBe('period,type,actual,p10,p50,p90');
    // Ao menos uma linha de história e uma de forecast
    expect(csv).toMatch(/,history,/);
    expect(csv).toMatch(/,forecast,,/);
  });
});
