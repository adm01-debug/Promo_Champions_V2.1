function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function read(relativePath: string): Promise<string> {
  return await Deno.readTextFile(new URL(relativePath, import.meta.url));
}

Deno.test("send-transactional-email exige método, identidade e permissão operacional", async () => {
  const source = await read("./index.ts");

  assert(
    /req\.method\s*!==\s*["']POST["']/.test(source),
    "a edge deve aceitar somente POST",
  );
  assert(
    source.includes("getCorsHeaders(req)"),
    "a edge deve aplicar CORS conforme a origem da requisição",
  );
  assert(
    source.includes("isInternalServiceRequest(req)"),
    "encadeamentos internos precisam validar service_role",
  );
  assert(
    source.includes("getUserClient(req)"),
    "chamadas do navegador precisam validar JWT",
  );
  assert(
    source.includes('.eq("auth_user_id", auth.userId)'),
    "o remetente direto deve possuir vínculo ativo com vendedor",
  );
  assert(
    source.includes('"is_admin_or_manager"'),
    "admin e manager devem ser autorizados explicitamente",
  );
});

Deno.test("send-transactional-email valida o payload e limita disparos diretos", async () => {
  const source = await read("./index.ts");

  assert(
    source.includes("function parsePayload"),
    "o payload precisa ser validado em runtime",
  );
  assert(
    source.includes("MAX_EMAIL_LENGTH"),
    "o destinatário precisa ter limite",
  );
  assert(source.includes("MAX_SUBJECT_LENGTH"), "o assunto precisa ter limite");
  assert(source.includes("MAX_BODY_LENGTH"), "o corpo precisa ter limite");
  assert(
    source.includes("/[\\r\\n]/.test(subject)"),
    "o assunto deve bloquear injeção de cabeçalho",
  );
  assert(
    source.includes("checkRateLimit(req"),
    "o envio direto precisa sofrer rate limit",
  );
  assert(
    source.includes("bypassAuthenticated: false"),
    "JWT não pode burlar o rate limit deste endpoint",
  );
  assert(
    source.includes("rate_limit_exceeded"),
    "o limite deve retornar resposta explícita",
  );
});

Deno.test("send-transactional-email falha fechado e preserva supressões de outreach", async () => {
  const source = await read("./index.ts");

  assert(
    source.includes('Deno.env.get("RESEND_API_KEY")'),
    "a chave do provedor deve ser exigida",
  );
  assert(
    source.includes('Deno.env.get("BULK_EMAIL_FROM")'),
    "o remetente verificado deve ser exigido",
  );
  assert(
    source.includes('"https://api.resend.com/emails"'),
    "o contrato deve usar o provedor documentado",
  );
  assert(
    source.includes("fetchWithTimeout("),
    "a chamada ao provedor deve ter timeout",
  );
  assert(
    source.includes("filterOptedOut("),
    "outreach deve consultar supressões",
  );
  assert(
    source.includes("unsubscribeFooterHtml("),
    "outreach em HTML deve ter rodapé de descadastro",
  );
  assert(
    source.includes("unsubscribeHeaders("),
    "outreach deve expor one-click unsubscribe",
  );
  assert(
    source.includes("recipient_opted_out"),
    "destinatário descadastrado não pode receber envio",
  );
  assert(
    source.includes('!internalRequest && payload.purpose !== "outreach"'),
    "chamadas humanas não podem escolher o canal transacional para burlar opt-out",
  );
  assert(
    source.includes("direct_transactional_send_forbidden"),
    "a tentativa direta de usar mensagem transacional deve falhar explicitamente",
  );
  assert(
    source.includes("email_provider_not_configured"),
    "configuração ausente deve falhar fechada",
  );
});
