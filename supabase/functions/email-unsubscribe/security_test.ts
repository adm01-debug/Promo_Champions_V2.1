const sourceUrl = new URL('./index.ts', import.meta.url);
const sharedHeadersUrl = new URL('../_shared/security-headers.ts', import.meta.url);

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

Deno.test(
  'email-unsubscribe exige POST para mutação e limita abuso público',
  async () => {
    const source = await Deno.readTextFile(sourceUrl);
    const getConfirmation = source.indexOf('if (req.method === "GET")');
    const recordOptOut = source.indexOf('.rpc("record_email_opt_out"');
    assert(
      getConfirmation >= 0 && getConfirmation < recordOptOut,
      'GET deve apenas confirmar antes do RPC'
    );
    assert(
      source.includes('bypassAuthenticated: false'),
      'Bearer sintático não pode burlar o limite'
    );
  }
);

Deno.test(
  'email-unsubscribe serve HTML com os headers de segurança compartilhados',
  async () => {
    const source = await Deno.readTextFile(sourceUrl);
    const shared = await Deno.readTextFile(sharedHeadersUrl);
    assert(
      source.includes('htmlSecurityHeaders'),
      'a página pública deve usar os headers centralizados em _shared/security-headers.ts'
    );
    assert(
      shared.includes('"Referrer-Policy": "no-referrer"'),
      'o token não pode vazar por Referer'
    );
    assert(
      shared.includes('Content-Security-Policy'),
      'a página pública deve ter CSP restritiva'
    );
    assert(
      shared.includes('"Cache-Control": "no-store"'),
      'respostas com dados sensíveis não podem ser cacheadas'
    );
  }
);
