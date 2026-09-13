import { getCorsHeaders } from "../_shared/cors.ts";
import { getUserClient, UnauthorizedError } from "../_shared/auth-client.ts";
import { withRequestId } from "../_shared/request-id.ts";

function json(
  body: Record<string, unknown>,
  status: number,
  corsHeaders: HeadersInit,
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(withRequestId("enrich-lead", async (req, _ctx) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "method_not_allowed" }, 405, corsHeaders);
  }

  try {
    await getUserClient(req);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return json({ error: "unauthorized" }, 401, corsHeaders);
    }
    throw error;
  }

  // A versão anterior inventava atributos aleatórios, e ainda tentava
  // relacionar um sale.id como clients.id.
  // Sem uma fonte de dados real configurada, persistir esse conteúdo corrompe os
  // indicadores do CRM. O endpoint permanece autenticado para preservar o
  // contrato da UI, mas não grava nenhum dado até haver um provedor validado.
  return json(
    {
      error: "enrichment_provider_not_configured",
      message:
        "O enriquecimento está indisponível até a configuração de um provedor de dados validado.",
    },
    503,
    corsHeaders,
  );
}));
