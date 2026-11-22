const sourceUrl = new URL("./index.ts", import.meta.url);

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

// sales possui tres FKs para salespeople (salesperson_id, closer_id, sdr_id).
// O embed implicito "salespeople (...)" gera PGRST201 e a funcao responde 500
// em toda execucao; o embed precisa apontar a FK desejada explicitamente.
Deno.test("check-lead-sla desambigua o embed de salespeople pela FK", async () => {
  const source = await Deno.readTextFile(sourceUrl);

  assert(
    source.includes("salespeople:salespeople!sales_salesperson_id_fkey"),
    "o embed deve usar o hint da FK sales_salesperson_id_fkey",
  );
  assert(
    !/(^|[^_:!])salespeople\s*\(/.test(source),
    "nao deve restar embed implicito de salespeople",
  );
});

Deno.test("check-lead-sla mantem o email opcional quando falta o secret", async () => {
  const source = await Deno.readTextFile(sourceUrl);

  assert(
    source.includes("const resendApiKey = Deno.env.get('RESEND_API_KEY')"),
    "a chave deve ser lida em runtime, sem throw no carregamento",
  );
  assert(
    !/if \(!RESEND_API_KEY\) throw/.test(source),
    "a ausencia da chave nao pode derrubar a funcao no import",
  );
  assert(
    source.includes("resendApiKey &&"),
    "o envio precisa ficar condicionado a chave presente",
  );
});