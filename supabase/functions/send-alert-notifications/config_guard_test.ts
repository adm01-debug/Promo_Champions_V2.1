const sourceUrl = new URL("./index.ts", import.meta.url);

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

// Sem RESEND_API_KEY a funcao cuspia 500 generico (WORKER_ERROR), que o
// reconciler tratava como 5xx transitorio e re-enfileirava 3x.
Deno.test("send-alert-notifications responde 503 explicito sem RESEND_API_KEY", async () => {
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
  assert(
    source.includes("resend_key_missing"),
    "a falha deve ser registrada no log estruturado",
  );
});

Deno.test("send-alert-notifications le a chave em runtime antes de criar o client", async () => {
  const source = await Deno.readTextFile(sourceUrl);
  const guard = source.indexOf("if (!RESEND_API_KEY) {");
  const client = source.indexOf("const resend = new Resend(RESEND_API_KEY)");

  assert(guard >= 0, "deve existir guard para a chave ausente");
  assert(client > guard, "o client Resend so pode ser criado apos o guard");
});