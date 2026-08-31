const sourceUrl = new URL("./index.ts", import.meta.url);

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

Deno.test("campaign-health-alert exige POST e autorização interna ou de gestão", async () => {
  const source = await Deno.readTextFile(sourceUrl);
  assert(
    /req\.method\s*!==\s*["']POST["']/.test(source),
    "o processador deve aceitar apenas POST",
  );
  assert(
    source.includes("isInternalServiceRequest(req)"),
    "cron deve provar service_role",
  );
  assert(
    source.includes("isCronSecretRequest(req, supabaseUrl, serviceRoleKey)"),
    "pg_cron deve usar segredo compartilhado",
  );
  assert(
    source.includes("isExpectedSharedSecret"),
    "segredo do cron deve ter comparação constante",
  );
  assert(
    source.includes("isAdminOrManagerRequest(req)"),
    "execução manual deve validar gestão",
  );
  assert(
    /error:\s*["']forbidden["']/.test(source),
    "vendedor comum deve ser negado",
  );
});
