function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function readRunner(): Promise<string> {
  return await Deno.readTextFile(new URL("./index.ts", import.meta.url));
}

Deno.test("sequence-runner só confirma e-mail após o contrato transacional aceitar a entrega", async () => {
  const source = await readRunner();
  const emailStart = source.indexOf('if (nextStep.channel === "email")');
  const emailEnd = source.indexOf(
    "} else if (MESSAGING_CHANNELS.has(nextStep.channel)",
    emailStart,
  );
  const emailBranch = source.slice(emailStart, emailEnd);

  assert(
    emailStart >= 0 && emailEnd > emailStart,
    "o canal e-mail precisa ter um caminho explícito",
  );
  assert(
    emailBranch.includes('"send-transactional-email"'),
    "e-mail precisa usar o remetente transacional",
  );
  assert(
    emailBranch.includes('purpose: "outreach"'),
    "sequências de e-mail precisam respeitar supressões",
  );
  assert(
    emailBranch.includes("if (!sendError && result?.ok)"),
    "o passo só pode ser confirmado após retorno ok do remetente",
  );
  assert(
    emailBranch.includes('outcomeReason = "missing_email"') &&
      emailBranch.includes('executionStatus = "skipped"'),
    "ausência de destinatário não pode virar sucesso implícito",
  );
  assert(
    emailBranch.indexOf("shouldAdvance = true") >
      emailBranch.indexOf("if (!sendError && result?.ok)"),
    "o e-mail só pode avançar o passo dentro do caminho de sucesso",
  );
  assert(
    /let executionStatus:\s*"sent" \| "failed" \| "skipped" \| "queued"\s*=\s*"failed"/
      .test(
        source,
      ),
    "o status inicial não pode ser sent implícito",
  );
  assert(
    source.includes("if (shouldAdvance)"),
    "current_step só pode avançar para uma ação confirmada",
  );
  assert(
    source.includes("DELIVERY_RETRY_MS") && source.includes("SKIPPED_RETRY_MS"),
    "falhas e ausências de destinatário precisam manter o passo para nova tentativa",
  );
});

Deno.test("sequence-runner usa lease condicional e confirmação durável contra corridas", async () => {
  const source = await readRunner();

  assert(
    source.includes("async function claimDueEnrollment"),
    "a inscrição vencida deve ser reivindicada antes do efeito externo",
  );
  assert(
    source.includes('.eq("current_step", enrollment.current_step)'),
    "a lease deve comparar o passo observado",
  );
  assert(
    source.includes('.lte("next_action_at", now.toISOString())'),
    "a lease só pode tomar uma ação já vencida",
  );
  assert(
    source.includes('.eq("next_action_at", leaseUntil)'),
    "a atualização final deve pertencer à mesma lease",
  );
  assert(
    source.includes("async function hasConfirmedExecution"),
    "uma entrega persistida precisa permitir recuperação sem novo envio",
  );
  assert(
    source.includes('.contains("engagement", DELIVERY_CONFIRMATION)'),
    "a recuperação deve confiar apenas em execuções endurecidas",
  );
  assert(
    source.includes("Authorization: `Bearer ${serviceRoleKey}`") &&
      source.includes('"X-Request-Id": ctx.requestId'),
    "as chamadas internas precisam autenticar e propagar a correlação",
  );
});

Deno.test("sequence-runner resolve account_contacts quando a inscrição usa o tipo contact", async () => {
  const source = await readRunner();

  assert(
    source.includes(
      'const contactIds = dueRows.filter((r) => r.contact_type === "contact")',
    ),
    "o tipo contact precisa entrar no pré-carregamento do runner",
  );
  assert(
    /\.from\("account_contacts"\)\.select\(\s*"id, name, job_title, phone, email"/
      .test(
        source,
      ),
    "o tipo contact deve ser resolvido pela tabela canônica account_contacts",
  );
  assert(
    source.includes('contactContextKey("contact", contact.id)'),
    "o contexto de account_contacts precisa preservar o tipo de origem",
  );
  assert(
    source.includes("contactContextKey(enr.contact_type, enr.contact_id)"),
    "a busca do contexto não pode colidir IDs entre tipos distintos",
  );
});
