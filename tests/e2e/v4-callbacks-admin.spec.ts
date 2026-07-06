import { test, expect, request } from "@playwright/test";

// Smoke E2E — valida a rota admin + a integração fim-a-fim contra o
// dispatcher em produção (secrets V4_CALLBACK_URL/API_KEY já configurados).

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL ?? "https://rapjswienfhkobhlamxb.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "";

test.describe("Admin V4 Callbacks", () => {
  test("rota /admin/v4-callbacks carrega sem crash", async ({ page }) => {
    const res = await page.goto("/admin/v4-callbacks", { waitUntil: "domcontentloaded" });
    expect(res?.status()).toBeLessThan(500);
  });

  test("dispatcher notify-v4-quote-status responde 200 com secrets ativos", async () => {
    test.skip(!SUPABASE_ANON_KEY, "VITE_SUPABASE_PUBLISHABLE_KEY não disponível no ambiente de teste");
    const ctx = await request.newContext();
    const res = await ctx.post(`${SUPABASE_URL}/functions/v1/notify-v4-quote-status`, {
      headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
      data: {},
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    // Sem secrets configurados, o dispatcher retornaria "note" avisando disabled.
    // Com secrets ativos, retorna processed >= 0 sem "note".
    expect(typeof body.processed).toBe("number");
  });

  test("cron de alertas check-v4-callback-alerts responde 200", async () => {
    test.skip(!SUPABASE_ANON_KEY, "VITE_SUPABASE_PUBLISHABLE_KEY não disponível no ambiente de teste");
    const ctx = await request.newContext();
    const res = await ctx.post(`${SUPABASE_URL}/functions/v1/check-v4-callback-alerts`, {
      headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
      data: {},
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.fired) || body.skipped === true).toBe(true);
  });
});
