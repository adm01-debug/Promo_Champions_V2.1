function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function read(relativePath: string): Promise<string> {
  return await Deno.readTextFile(new URL(relativePath, import.meta.url));
}

// Teste de contrato de código-fonte, no mesmo formato dos outros
// contract_test.ts do repositório (send-transactional-email, enrich-lead,
// auto-reassign-inactive, pipeline-pulse-aggregator, run-retry-tests): não há
// harness de mock do cliente Supabase para executar o handler, então o que se
// garante aqui são as invariantes de ordem e de isolamento de falha — as que
// uma regressão de refatoração quebraria sem que nenhum outro teste reclamasse.

Deno.test("inbound-email-webhook: telemetria é tratada antes da busca de inscrição", async () => {
  const source = await read("./index.ts");
  const telemetria = source.indexOf("isEmailTelemetryEvent(event.eventType)");
  const busca = source.indexOf("'match_reply_to_enrollment'");
  assert(telemetria > 0, "o ramo de telemetria deve existir");
  assert(busca > 0, "a busca de inscrição deve existir");
  assert(
    telemetria < busca,
    "abertura e clique devem ser tratados e encerrados (continue) antes da busca de inscrição, que não se aplica a eles",
  );
});

Deno.test("inbound-email-webhook: falha da busca de inscrição não derruba o evento", async () => {
  const source = await read("./index.ts");
  assert(
    !/if \(matchError\) throw matchError;/.test(source),
    "erro da RPC de inscrição não pode ser relançado: derrubava o registro do evento, o opt-out e o sinal de engajamento junto",
  );
  assert(
    source.includes("'match_reply_to_enrollment_falhou'"),
    "a falha da busca de inscrição deve ser registrada em log, não engolida em silêncio",
  );
});

Deno.test("inbound-email-webhook: sinal de resposta não depende de inscrição casada", async () => {
  const source = await read("./index.ts");
  const sinal = source.indexOf("recordReplyEngagement(admin, event)");
  const pausa = source.indexOf("if (matchedEnrollmentId && affectsEnrollment)");
  assert(sinal > 0, "o sinal de resposta deve ser gravado");
  assert(pausa > 0, "a pausa da cadência deve existir");
  assert(
    sinal < pausa,
    "o sinal de engajamento deve ser gravado fora do bloco que exige inscrição casada",
  );
  assert(
    /_signal: 'reply'/.test(source),
    "o sinal gravado para resposta deve ser 'reply'",
  );
});

Deno.test("inbound-email-webhook: efeitos só rodam para evento recém-persistido", async () => {
  const source = await read("./index.ts");
  const guard = source.indexOf("if (!insertedRows?.length) continue;");
  const sinal = source.indexOf("recordReplyEngagement(admin, event)");
  assert(guard > 0, "o guard de upsert deve existir");
  assert(
    guard < sinal,
    "o sinal de resposta deve vir depois do guard, senão reentrega assinada conta a mesma resposta duas vezes",
  );
});
