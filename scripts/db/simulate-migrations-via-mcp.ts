/**
 * Compila migrations no banco-alvo dentro de uma única transação e força
 * rollback ao final. O endpoint MCP é recebido por ambiente e nunca é logado.
 *
 * Uso:
 *   PROMO_CHAMPIONS_MCP_URL=https://.../mcp deno run \
 *     --allow-read --allow-net --allow-env=PROMO_CHAMPIONS_MCP_URL \
 *     scripts/db/simulate-migrations-via-mcp.ts \
 *     supabase/migrations/20260831....sql
 */

const endpoint = Deno.env.get("PROMO_CHAMPIONS_MCP_URL");
if (!endpoint) {
  console.error("PROMO_CHAMPIONS_MCP_URL não configurada");
  Deno.exit(2);
}

let endpointUrl: URL;
try {
  endpointUrl = new URL(endpoint);
} catch {
  console.error("PROMO_CHAMPIONS_MCP_URL inválida");
  Deno.exit(2);
}
if (endpointUrl.protocol !== "https:") {
  console.error("PROMO_CHAMPIONS_MCP_URL deve usar HTTPS");
  Deno.exit(2);
}
if (Deno.args.length === 0) {
  console.error("Informe ao menos uma migration para simular");
  Deno.exit(2);
}

const statements = await Promise.all(
  Deno.args.map((path) => Deno.readTextFile(path)),
);
const rollbackMarker = `codex_simulation_rollback_${crypto.randomUUID()}`;
statements.push(
  `DO $$ BEGIN RAISE EXCEPTION '${rollbackMarker}'; END $$;`,
);

const response = await fetch(endpointUrl, {
  method: "POST",
  redirect: "error",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
  },
  body: JSON.stringify({
    jsonrpc: "2.0",
    id: crypto.randomUUID(),
    method: "tools/call",
    params: {
      name: "supabase_db_transaction",
      arguments: { statements },
    },
  }),
});

const responseText = await response.text();
if (!response.ok) {
  console.error(`MCP respondeu HTTP ${response.status}`);
  Deno.exit(1);
}
if (!responseText.includes(rollbackMarker)) {
  console.error(
    "A simulação não alcançou o marcador de rollback; uma migration falhou antes do fim.",
  );
  console.error(responseText.slice(0, 4000));
  Deno.exit(1);
}

console.log(
  `${Deno.args.length} migration(s) compiladas; rollback transacional confirmado.`,
);
