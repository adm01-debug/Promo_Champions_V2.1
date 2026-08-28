const sourceUrl = new URL("./index.ts", import.meta.url);

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

Deno.test("log-web-vitals mantém a escrita pública limitada e sem identidade forjada", async () => {
  const source = await Deno.readTextFile(sourceUrl);
  assert(
    source.includes("bypassAuthenticated: false"),
    "Bearer sintático não pode burlar o limite",
  );
  assert(
    source.includes("readUtf8BodyWithinLimit(req, MAX_BODY_BYTES)"),
    "o corpo público deve ter limite",
  );
  assert(
    source.includes("const MAX_BODY_BYTES = 32 * 1024"),
    "o limite deve ser explícito",
  );
  assert(
    !source.includes("user_id: typeof o.user_id"),
    "o chamador público não pode atribuir user_id",
  );
  assert(
    source.includes('error: "insert_failed"'),
    "erros internos não devem vazar ao chamador público",
  );
});
