import { corsHeaders } from "../_shared/cors.ts";
import { withRequestId } from "../_shared/request-id.ts";

/**
 * Tombstone da função temporária de migração.
 *
 * A implementação anterior expunha credenciais administrativas mediante uma
 * chave literal versionada. O helper foi aposentado no V2 e não possui
 * consumidores no repositório; o diretório é mantido apenas para que qualquer
 * implantação residual falhe de forma explícita até a remoção remota ser
 * autorizada e confirmada pelo operador.
 */
Deno.serve(withRequestId("migrate-helper", async (req, _ctx) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  return new Response(
    JSON.stringify({ error: "migrate_helper_retired" }),
    {
      status: 410,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    },
  );
}));
