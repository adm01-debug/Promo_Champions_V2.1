function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function read(relativePath: string): Promise<string> {
  return await Deno.readTextFile(new URL(relativePath, import.meta.url));
}

Deno.test("compositor individual usa o contrato transacional para outreach", async () => {
  const source = await read("../../../src/hooks/email/useComposeEmail.ts");
  const senderStart = source.indexOf("export function useSendComposedEmail");
  const sender = source.slice(senderStart);

  assert(senderStart >= 0, "o hook de envio composto deve existir");
  assert(
    sender.includes('invoke("send-transactional-email"'),
    "o compositor deve chamar a edge transacional",
  );
  assert(
    !sender.includes("send-multichannel-message"),
    "e-mail não pode ser enviado pelo dispatcher de WhatsApp/SMS",
  );
  assert(
    sender.includes('purpose: "outreach"'),
    "o compositor deve respeitar opt-out",
  );
});

Deno.test("cadência não envia payload avulso ao processador de lote", async () => {
  const cadence = await read("../process-cadence-tasks/index.ts");

  assert(
    cadence.includes('invoke("send-transactional-email"'),
    "a cadência deve usar o contrato de e-mail individual",
  );
  assert(
    !cadence.includes('invoke("email-bulk-send"'),
    "a cadência não pode chamar email-bulk-send sem job_id",
  );
  assert(
    cadence.includes('purpose: "outreach"'),
    "cadência deve respeitar opt-out",
  );
});

Deno.test("agendamentos de lote sem rascunho não pulam controles de descadastro", async () => {
  const scheduled = await read("../process-scheduled-sends/index.ts");

  assert(
    scheduled.includes('if (row.channel === "email")'),
    "o processador deve reconhecer agendamento de e-mail",
  );
  assert(
    scheduled.includes("scheduled_email_requires_bulk_draft_contract"),
    "o e-mail agendado incompatível deve falhar de forma explícita",
  );
});
