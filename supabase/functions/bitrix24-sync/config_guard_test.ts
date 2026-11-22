const sourceUrl = new URL("./index.ts", import.meta.url);

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

// Credencial ausente e' falha permanente: 503 nomeando o secret deixa o
// reconciler classificar como http_5xx_config (non_retryable). Antes era um
// throw generico que virava 500 (retryable) e re-enfileirava 3x.
Deno.test("bitrix24-sync responde 503 explicito sem credenciais do Bitrix24", async () => {
  const source = await Deno.readTextFile(sourceUrl);

  assert(
    !/if \(!BITRIX24_DOMAIN[^)]*\)\s*\{\s*throw new Error/.test(source),
    "credencial ausente nao pode ser lancada como erro generico",
  );
  assert(
    source.includes("status: 503, headers: { ...corsHeaders"),
    "a falha de configuracao deve ser 503",
  );
  assert(
    /error: '[A-Z_]+ not configured'/.test(source),
    "o corpo precisa nomear o secret ausente para o reconciler",
  );
});

Deno.test("bitrix24-sync mantem 500 apenas para falhas operacionais", async () => {
  const source = await Deno.readTextFile(sourceUrl);
  const total500 = (source.match(/status: 500/g) ?? []).length;
  assert(
    total500 >= 1,
    "falha operacional real (API do Bitrix fora) continua 500/retryable",
  );
});
