import { assertEquals, assertRejects } from "jsr:@std/assert@1";
import { isAuthorizedCronRequest } from "./cron-request-auth.ts";

Deno.test("cron sem credencial é negado sem consultar o segredo", async () => {
  let loads = 0;
  const authorized = await isAuthorizedCronRequest(
    new Request("https://example.test/job", { method: "POST" }),
    () => {
      loads++;
      return Promise.resolve("segredo-esperado");
    },
  );

  assertEquals(authorized, false);
  assertEquals(loads, 0);
});

Deno.test("cron aceita somente o segredo compartilhado completo", async () => {
  const accepted = await isAuthorizedCronRequest(
    new Request("https://example.test/job", {
      method: "POST",
      headers: { "X-Cron-Secret": "segredo-completo" },
    }),
    () => Promise.resolve("segredo-completo"),
  );
  const rejected = await isAuthorizedCronRequest(
    new Request("https://example.test/job", {
      method: "POST",
      headers: { "X-Cron-Secret": "segredo" },
    }),
    () => Promise.resolve("segredo-completo"),
  );

  assertEquals(accepted, true);
  assertEquals(rejected, false);
});

Deno.test("falha ao carregar segredo não é convertida em autorização", async () => {
  await assertRejects(
    () =>
      isAuthorizedCronRequest(
        new Request("https://example.test/job", {
          method: "POST",
          headers: { "X-Cron-Secret": "qualquer" },
        }),
        () => Promise.reject(new Error("secret_store_unavailable")),
      ),
    Error,
    "secret_store_unavailable",
  );
});
