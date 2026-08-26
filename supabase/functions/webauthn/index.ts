// WebAuthn está temporariamente indisponível.
//
// A implementação anterior não fazia a verificação criptográfica obrigatória
// das asserções e atestações. Não é seguro emitir sessão, registrar
// credenciais ou modificar contadores até que uma implementação compatível
// com WebAuthn valide assinatura, challenge, origin, RP ID, flags e contador.

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
      error: 'Login por passkey está temporariamente indisponível por manutenção de segurança.',
      code: 'WEBAUTHN_DISABLED_PENDING_CRYPTOGRAPHIC_VERIFICATION',
    }),
    { status: 503, headers },
  );
};

Deno.serve(withRequestId('webauthn', handler));
