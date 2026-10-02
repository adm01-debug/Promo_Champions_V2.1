// _shared/security-headers.ts
// Headers de segurança para respostas HTML públicas de edge functions
// (páginas renderizadas no browser: callbacks OAuth, confirmações etc.).
//
// Aplicar em TODA resposta com Content-Type: text/html:
//   - CSP restritiva: sem scripts, sem recursos externos, sem framing;
//     'unsafe-inline' apenas para style (as páginas usam <style>/style=).
//   - no-store: respostas podem conter dados sensíveis (e-mail, tokens).
//   - no-referrer: evita vazar query strings (tokens) via Referer.
//   - nosniff: bloqueia MIME sniffing.
//
// Padrão originado em email-unsubscribe; consulte docs/SECURITY_HEADERS.md
// para os headers recomendados na camada de hosting.

export const htmlSecurityHeaders: Record<string, string> = {
  "Cache-Control": "no-store",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "Content-Security-Policy":
    "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
};
