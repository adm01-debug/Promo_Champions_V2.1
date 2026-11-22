const sourceUrl = new URL("./index.ts", import.meta.url);

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

Deno.test("access-denied-alerts responde 503 explicito sem RESEND_API_KEY", async () => {
  const source = await Deno.readTextFile(sourceUrl);

  assert(
    !/if \(!RESEND_API_KEY\) throw/.test(source),
    "a ausencia da chave nao pode derrubar o modulo no import",
  );
  assert(
    source.includes("status: 503"),
    "a falha de configuracao deve ser sinalizada como 503",
  );
  assert(
    source.includes("RESEND_API_KEY not configured"),
    "o corpo 503 precisa nomear o secret ausente para o reconciler",
  );
});