# Headers de segurança — hosting e edge functions

Duas camadas distintas:

1. **Hosting (Lovable Cloud)** — headers que devem ir em TODA resposta HTTP do app.
2. **Edge functions** — respostas `text/html` servidas por Deno (páginas públicas
   como callback OAuth e descadastro de e-mail). Já implementadas em código via
   `supabase/functions/_shared/security-headers.ts` (`htmlSecurityHeaders`).

## 1. Headers recomendados no hosting

Onde configurar: o deploy é feito via **Lovable Cloud**, que não expõe hoje uma
configuração de headers custom por arquivo (como `_headers` do Netlify ou
`vercel.json`). Se o painel do Lovable não permitir headers customizados, as
opções são:

- **Cloudflare (recomendado)** — apontar o domínio para a Cloudflare (modo proxy
  laranja) e aplicar os headers via _Transform Rules → Modify Response Header_
  ou um Worker. Sem custo no plano gratuito.
- Proxy reverso dedicado (Nginx/Caddy na VPS AtomicaBR) servindo o app.

| Header                                | Valor recomendado                                  | Por quê                                                                                                                                                                   |
| ------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Strict-Transport-Security`           | `max-age=31536000; includeSubDomains`              | Força HTTPS por 1 ano em todos os subdomínios. Avaliar `preload` depois de estável.                                                                                       |
| `Content-Security-Policy`             | como _header_ (não só `<meta>`)                    | A CSP atual vive em `<meta http-equiv>` no `index.html` — header vale também para recursos sem HTML e tem prioridade sobre meta tag. Espelhar a política do `index.html`. |
| `X-Frame-Options` / `frame-ancestors` | `DENY` (ou CSP `frame-ancestors 'none'`)           | Anti-clickjacking. Se algum embed legítimo existir (ex.: `report-embed-public`), usar `frame-ancestors` com a origem exata em vez de `DENY` global.                       |
| `Referrer-Policy`                     | `strict-origin-when-cross-origin`                  | Não vaza path/query (tokens em URLs) para terceiros.                                                                                                                      |
| `Permissions-Policy`                  | `camera=(), microphone=(self), geolocation=(self)` | Abre só o que o app usa (chamadas/mapas); ajustar conforme necessidade.                                                                                                   |
| `X-Content-Type-Options`              | `nosniff`                                          | Bloqueia MIME sniffing.                                                                                                                                                   |

> Nota: `X-Frame-Options` e `frame-ancestors` são redundantes entre si — manter
> os dois cobre browsers antigos e novos. Onde houver embed público de relatório,
> `frame-ancestors` na CSP substitui o `X-Frame-Options: DENY`.

## 2. Respostas HTML das edge functions (já em código)

Padrão aplicado a toda resposta `text/html`:

- `Cache-Control: no-store`
- `Referrer-Policy: no-referrer`
- `X-Content-Type-Options: nosniff`
- `Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline';
form-action 'self'; base-uri 'none'; frame-ancestors 'none'`

Fonte única: `supabase/functions/_shared/security-headers.ts`.
Funções que renderizam HTML hoje: `email-unsubscribe`, `bitrix24-oauth`.
Qualquer nova function que responda HTML deve importar `htmlSecurityHeaders`.
