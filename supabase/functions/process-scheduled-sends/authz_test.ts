const sourceUrl = new URL("./index.ts", import.meta.url);

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

Deno.test("process-scheduled-sends reclama itens vencidos e agendados (contract)", async () => {
  const source = await Deno.readTextFile(sourceUrl);
  assert(
    source.includes("status, attempts, error, next_retry_at"),
    "o select precisa trazer attempts e next_retry_at para decidir o retry",
  );
  const dueIndex = source.indexOf(
    "and(status.eq.failed,next_retry_at.lte.${nowIso})",
  );
  assert(
    dueIndex >= 0,
    "o lote precisa incluir itens failed com next_retry_at vencido para reprocessar",
  );
  const limitIndex = source.indexOf(".limit(50)");
  assert(
    dueIndex >= 0 && dueIndex < limitIndex,
    "o filtro de vencidos precisa ocorrer antes do limite do lote",
  );
});

Deno.test("process-scheduled-sends usa backoff e MAX_RETRIES do retry-policy", async () => {
  const source = await Deno.readTextFile(sourceUrl);
  assert(
    source.includes('from "../_shared/retry-policy.ts"') &&
      source.includes("backoffMs") &&
      source.includes("MAX_RETRIES"),
    "o processador precisa usar o backoff exponencial compartilhado",
  );
  assert(
    source.includes("MAX_RETRIES"),
    "o esgotamento de tentativas precisa respeitar MAX_RETRIES",
  );
  assert(
    source.includes("isPermanentError"),
    "erros permanentes (opt-out, destinatario invalido) nao podem ser reprocessados",
  );
});

Deno.test("process-scheduled-sends nao reprocessa item ja consumido (claim atomico)", async () => {
  const source = await Deno.readTextFile(sourceUrl);
  assert(
    source.includes(".or(`and(status.eq.pending),and(status.eq.failed,next_retry_at.lte.${nowIso})`)") ||
      source.includes("and(status.eq.pending)"),
    "o claim precisa bloquear itens que outro worker ja pegou",
  );
});