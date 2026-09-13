function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

Deno.test("enrich-lead não persiste inteligência fictícia sem provedor real", async () => {
  const source = await Deno.readTextFile(
    new URL("./index.ts", import.meta.url),
  );

  assert(source.includes('req.method !== "POST"'), "aceita somente POST");
  assert(
    source.includes("getUserClient(req)"),
    "exige JWT válido antes da resposta",
  );
  assert(
    source.includes("enrichment_provider_not_configured"),
    "expõe indisponibilidade explícita",
  );
  assert(
    /enrichment_provider_not_configured[\s\S]*?503,\s*\n\s*corsHeaders/.test(
      source,
    ),
    "indisponibilidade deve usar status 503",
  );
  assert(
    !source.includes("Math.random"),
    "não pode gerar atributos aleatórios",
  );
  assert(
    !source.includes("enriched_company_intelligence"),
    "não pode escrever empresa simulada",
  );
  assert(
    !source.includes("person_intelligence"),
    "não pode escrever pessoa simulada",
  );
  assert(
    !source.includes("buying_signals"),
    "não pode escrever sinal de compra simulado",
  );
  assert(
    !source.includes("getServiceClient"),
    "não precisa de privilégio elevado enquanto indisponível",
  );
});
