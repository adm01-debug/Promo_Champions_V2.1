const sourceUrl = new URL("./index.ts", import.meta.url);

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

Deno.test("migrate-helper permanece aposentado e falha fechado", async () => {
  const source = await Deno.readTextFile(sourceUrl);

  assert(
    source.includes('withRequestId("migrate-helper"'),
    "deve propagar request ID",
  );
  assert(
    source.includes("status: 410"),
    "deve responder como recurso aposentado",
  );
  assert(
    !source.includes("SUPABASE_SERVICE_ROLE_KEY"),
    "não pode ler service_role",
  );
  assert(
    !source.includes("SUPABASE_DB_URL"),
    "não pode ler a DSN administrativa",
  );
  assert(
    !source.includes('action === "credentials"'),
    "não pode expor credenciais",
  );
  assert(
    !/\bACCESS_KEY\s*=/.test(source),
    "não pode conter chave de acesso literal",
  );
});
