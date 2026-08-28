const sourceUrl = new URL("./index.ts", import.meta.url);

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

Deno.test("email-bulk-retry exige POST e autorização interna ou de gestão", async () => {
  const source = await Deno.readTextFile(sourceUrl);
  assert(
    source.includes('req.method !== "POST"'),
    "o processador deve aceitar apenas POST",
  );
  assert(
    source.includes("isInternalServiceRequest(req)"),
    "cron deve provar service_role",
  );
  assert(
    source.includes("isAdminOrManagerRequest(req)"),
    "execução manual deve validar gestão",
  );
  assert(
    source.includes('error: "forbidden"'),
    "vendedor comum deve ser negado",
  );
});

Deno.test("email-bulk-retry filtra tentativas vencidas antes de limitar o lote", async () => {
  const source = await Deno.readTextFile(sourceUrl);
  const dueFilter = source.indexOf(
    ".or(`next_retry_at.is.null,next_retry_at.lte.${now.toISOString()}`)",
  );
  const limit = source.indexOf(".limit(SCAN_LIMIT)");

  assert(
    dueFilter >= 0,
    "a consulta precisa selecionar somente rascunhos vencidos ou sem agenda",
  );
  assert(
    dueFilter < limit,
    "o filtro de vencimento precisa ocorrer antes do limite do lote",
  );
});
