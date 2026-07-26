import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  filterOptedOut,
  makeUnsubscribeToken,
  normalizeEmail,
  safeEqual,
  verifyUnsubscribeToken,
} from "./unsubscribe.ts";

Deno.env.set("UNSUBSCRIBE_SECRET", "test-secret-key");

Deno.test("normalizeEmail apara e normaliza caixa", () => {
  assertEquals(normalizeEmail("  Foo@Bar.COM "), "foo@bar.com");
  assertEquals(normalizeEmail(null), "");
});

Deno.test("token é determinístico e case-insensitive", async () => {
  const a = await makeUnsubscribeToken("user@example.com");
  const b = await makeUnsubscribeToken(" USER@example.com ");
  assertEquals(a, b);
  assertEquals(a.length, 32);
});

Deno.test("token de outro e-mail não valida", async () => {
  const t = await makeUnsubscribeToken("a@example.com");
  assert(await verifyUnsubscribeToken("a@example.com", t));
  assertEquals(await verifyUnsubscribeToken("b@example.com", t), false);
  assertEquals(await verifyUnsubscribeToken("a@example.com", ""), false);
  assertEquals(await verifyUnsubscribeToken("a@example.com", "x".repeat(32)), false);
});

Deno.test("safeEqual compara corretamente", () => {
  assert(safeEqual("abc", "abc"));
  assertEquals(safeEqual("abc", "abd"), false);
  assertEquals(safeEqual("abc", "abcd"), false);
});

function clientWith(optedOut: string[], fail = false) {
  return {
    from: () => ({
      select: () => ({
        in: (_col: string, values: string[]) =>
          Promise.resolve(
            fail
              ? { data: null, error: { message: "boom" } }
              : { data: values.filter((v) => optedOut.includes(v)).map((email) => ({ email })), error: null },
          ),
      }),
    }),
  };
}

Deno.test("filterOptedOut separa bloqueados", async () => {
  const items = [{ email: "A@x.com" }, { email: "b@x.com" }, { email: null }];
  const { allowed, blocked } = await filterOptedOut(
    clientWith(["a@x.com"]) as never,
    items,
    (i) => i.email,
  );
  assertEquals(blocked.length, 1);
  assertEquals(allowed.length, 2);
});

Deno.test("filterOptedOut falha fechada quando a consulta quebra", async () => {
  let threw = false;
  try {
    await filterOptedOut(clientWith([], true) as never, [{ email: "a@x.com" }], (i) => i.email);
  } catch {
    threw = true;
  }
  assert(threw);
});

Deno.test("filterOptedOut sem e-mails retorna tudo", async () => {
  const items = [{ email: "" }, { email: null }];
  const { allowed, blocked } = await filterOptedOut(clientWith([]) as never, items, (i) => i.email);
  assertEquals(allowed.length, 2);
  assertEquals(blocked.length, 0);
});

Deno.test("filterOptedOut lida com mais de 200 destinatários (chunking)", async () => {
  const items = Array.from({ length: 450 }, (_, i) => ({ email: `u${i}@x.com` }));
  const { allowed, blocked } = await filterOptedOut(
    clientWith(["u10@x.com", "u300@x.com"]) as never,
    items,
    (i) => i.email,
  );
  assertEquals(blocked.length, 2);
  assertEquals(allowed.length, 448);
});
