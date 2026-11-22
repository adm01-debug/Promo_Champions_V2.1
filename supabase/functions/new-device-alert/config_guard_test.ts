const targets = [
  "broadcast-sale-notification",
  "new-device-alert",
  "sdr-consecutive-alerts",
];

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

// Sem RESEND_API_KEY o import do modulo lancava excecao e o cliente recebia
// 500 generico (WORKER_ERROR), sem indicar qual secret faltava.
for (const fn of targets) {
  Deno.test(`${fn} responde 503 explicito sem RESEND_API_KEY`, async () => {
    const source = await Deno.readTextFile(
      new URL(`../${fn}/index.ts`, import.meta.url),
    );

    assert(
      !/if \(!RESEND_API_KEY\) throw/.test(source),
      "a ausencia da chave nao pode derrubar o modulo no import",
    );
    assert(source.includes("status: 503"), "deve responder 503");
    assert(
      source.includes("RESEND_API_KEY not configured"),
      "o corpo precisa nomear o secret ausente",
    );
  });
}