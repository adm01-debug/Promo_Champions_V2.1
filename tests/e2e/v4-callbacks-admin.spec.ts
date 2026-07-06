import { test, expect } from "@playwright/test";

// Smoke E2E — valida que a rota admin existe e responde.
// Fluxo completo (approved → V4 confirma → CRM reflete) fica marcado como TODO
// até o endpoint receptor no V4 existir e os secrets estarem configurados.

test.describe("Admin V4 Callbacks", () => {
  test("rota /admin/v4-callbacks carrega sem crash (não autenticado redireciona para auth)", async ({ page }) => {
    const res = await page.goto("/admin/v4-callbacks", { waitUntil: "domcontentloaded" });
    expect(res?.status()).toBeLessThan(500);
  });

  test.skip("[E2E completo] approved → callback enfileirado → V4 confirma → painel reflete", async () => {
    // Pré-requisitos para destravar este teste:
    // 1. Endpoint receptor publicado no PROMO GIFTS V4
    // 2. Secrets V4_CALLBACK_URL e V4_CALLBACK_API_KEY configurados no CRM
    // 3. Mock do V4 respondendo 200 em ambiente de teste
    //
    // Passos:
    // - Login como admin
    // - Enviar POST no receive-quote-webhook com status=approved
    // - Aguardar até 60s pelo dispatcher rodar (ou invocar manualmente)
    // - Assertar que aparece na aba "Resolvidos" do /admin/v4-callbacks
    // - Assertar que o quote tem status=approved no /orcamentos
  });
});
