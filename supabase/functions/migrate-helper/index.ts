// Função desativada por segurança.
//
// A versão anterior era um atalho temporário de migração e expunha uma
// superfície incompatível com produção. A implantação desta versão substitui
// o endpoint por uma resposta explícita, sem ler ou devolver variáveis de
// ambiente. Migrações devem usar o fluxo administrativo autenticado.

import { getCorsHeaders } from '../_shared/cors.ts';
import { withRequestId } from '../_shared/request-id.ts';

const handler = async (req: Request): Promise<Response> => {
  const headers = {
    ...getCorsHeaders(req),
    'Content-Type': 'application/json',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  return new Response(
    JSON.stringify({
      error: 'Endpoint de migração desativado',
      code: 'MIGRATION_HELPER_DISABLED',
    }),
    { status: 410, headers },
  );
};

Deno.serve(withRequestId('migrate-helper', handler));
