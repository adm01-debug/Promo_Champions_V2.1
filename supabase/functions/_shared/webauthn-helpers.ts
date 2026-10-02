// Helpers puros da edge function `webauthn` — extraídos para permitir
// `deno test` sem subir o handler. Sem dependências externas.

/** Uint8Array → base64url (sem padding), formato que o SimpleWebAuthn usa. */
export function bytesToBase64url(bytes: Uint8Array): string {
  let binary = '';
  for (const b of bytes) {
    binary += String.fromCharCode(b);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** base64url (com ou sem padding) → Uint8Array. Lanca erro em input invalido. */
export function base64urlToBytes(input: string): Uint8Array<ArrayBuffer> {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Origens aceitas para verifyRegistrationResponse/verifyAuthenticationResponse.
 * O rpId vem do cliente (hostname da página); aceitamos `https://<rpId>` e,
 * como fallback, o Origin do request quando o hostname dele casa com o rpId
 * (subdomínio incluso) ou é localhost — caso de dev e previews.
 */
export function expectedOrigins(originHeader: string | null, rpId: string): string[] {
  const origins = new Set<string>([`https://${rpId}`]);

  if (originHeader) {
    try {
      const host = new URL(originHeader).hostname;
      const matchesRp = host === rpId || host.endsWith(`.${rpId}`);
      const isLocal = host === 'localhost' || host === '127.0.0.1';
      if (matchesRp || isLocal) {
        origins.add(originHeader);
      }
    } catch {
      // Origin malformado é ignorado — a verificação falha sem origem válida.
    }
  }

  return [...origins];
}
