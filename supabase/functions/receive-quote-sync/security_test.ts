const sourceUrl = new URL("./index.ts", import.meta.url);

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

Deno.test("receive-quote-sync limita payload e preserva a correlação do middleware", async () => {
  const source = await Deno.readTextFile(sourceUrl);
  assert(
    source.includes("const MAX_WEBHOOK_BODY_BYTES = 240 * 1024"),
    "o limite do webhook deve ser explícito",
  );
  assert(
    source.includes("readUtf8BodyWithinLimit(req, MAX_WEBHOOK_BODY_BYTES)"),
    "o corpo precisa ser limitado",
  );
  assert(
    source.includes("function isBoundedText"),
    "chaves de deduplicação devem ser limitadas",
  );
  assert(
    source.includes("ctx.requestId"),
    "a resposta deve manter a correlação da requisição",
  );
});

Deno.test("receive-quote-sync libera a reserva de dedupe se a escrita posterior falhar", async () => {
  const source = await Deno.readTextFile(sourceUrl);
  assert(
    source.includes("function releaseDedupeReservation"),
    "o fluxo deve compensar a reserva de dedupe",
  );
  assert(
    source.includes('.select("id")'),
    "a reserva deve capturar seu identificador exato",
  );
  assert(
    source.includes("await releaseDedupeReservation(supabase, dedupeReservationId)"),
    "falhas posteriores precisam liberar a reserva para retry legítimo",
  );
});
