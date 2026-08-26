function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function read(relativePath: string): Promise<string> {
  return await Deno.readTextFile(new URL(relativePath, import.meta.url));
}

Deno.test("send-multichannel-message bloqueia mock forjado e exige autenticação real", async () => {
  const source = await read("./index.ts");
  assert(
    source.includes('req.headers.has("x-mock-provider")'),
    "o cabeçalho de mock precisa ser bloqueado",
  );
  assert(
    source.includes('error: "mock_provider_disabled"'),
    "o mock não pode seguir para o provedor",
  );
  assert(
    source.includes("getUserClient(req)"),
    "o caminho de usuário precisa validar JWT",
  );
  assert(
    source.includes("isInternalServiceRequest(req)"),
    "o caminho interno precisa validar service_role",
  );
  assert(
    source.includes("direct_cadence_reference_forbidden"),
    "o navegador não pode forjar enrollmentId/stepId em auditoria de cadência",
  );
  assert(
    source.includes('"is_admin_or_manager"'),
    "envio em nome de terceiro exige role operacional",
  );
});

Deno.test("send-multichannel-message valida contrato e confirma o registro de saída", async () => {
  const source = await read("./index.ts");
  assert(
    source.includes("function parsePayload"),
    "o payload precisa ser validado em runtime",
  );
  assert(
    source.includes('raw.channel !== "whatsapp" && raw.channel !== "sms"'),
    "não pode aceitar canal fora do schema",
  );
  assert(
    /supabase\.rpc\(\s*"record_outbound_message"/.test(source),
    "todo envio precisa tentar registro",
  );
  assert(
    source.includes("if (recordError)"),
    "falha de registro não pode ser ignorada",
  );
  assert(
    source.includes("recorded: false"),
    "o chamador precisa saber quando a auditoria falhar",
  );
});

Deno.test("chamadores internos usam owner canônico e claim condicional", async () => {
  const cadence = await read("../process-cadence-tasks/index.ts");
  const scheduled = await read("../process-scheduled-sends/index.ts");
  const sequence = await read("../sequence-runner/index.ts");
  const quote = await read("../send-quote-to-client/index.ts");

  assert(
    cadence.includes("salespeople!sales_salesperson_id_fkey(auth_user_id)"),
    "cadência deve mapear o vendedor para auth_user_id",
  );
  assert(
    cadence.includes("isInternalServiceRequest(req)"),
    "processador de cadência deve distinguir chamadas internas",
  );
  assert(cadence.includes("ownerId,"), "cadência deve enviar ownerId canônico");
  assert(
    scheduled.includes('.eq("status", "pending")'),
    "agendados devem ter claim condicional",
  );
  assert(
    scheduled.includes(
      "body: { ...payload, ownerId: row.owner_id, channel: row.channel }",
    ),
    "dados persistidos não podem sobrescrever owner/canal",
  );
  assert(
    sequence.includes('select("id, auth_user_id")'),
    "runner deve consultar a coluna real de salespeople",
  );
  assert(
    sequence.includes('dueQuery.eq("sequences.owner_id", callerUserId)'),
    "runner chamado pelo usuário deve limitar execuções ao próprio owner",
  );
  assert(
    quote.includes("ownerId: auth.userId"),
    "orçamento deve enviar pelo canal do usuário autorizado",
  );
  assert(
    quote.includes("body: msg"),
    "orçamento deve usar o campo body do contrato multicanal",
  );
});
