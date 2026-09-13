# ADR-009: Sessão em `localStorage` e o teto real da CSP via `<meta>`

**Data:** 2026-09-13
**Status:** Aceito (parcial — ver "Pendências")
**Origem:** Etapas 22 e 23 do plano de 50 etapas

## Contexto

`src/integrations/supabase/client.ts` usa `storage: localStorage` para a sessão
Supabase Auth — o padrão da lib para SPAs sem backend próprio. Isso significa
que qualquer XSS bem-sucedido no domínio exfiltra o `access_token` e o
`refresh_token` diretamente, sem precisar de `httpOnly`/`Secure` bypass.

A mitigação principal contra XSS é a CSP. Antes desta ADR, `index.html`
declarava:

```
script-src 'self' 'unsafe-inline' 'unsafe-eval';
```

`'unsafe-inline'` no `script-src` anula boa parte do propósito da CSP contra
XSS — é exatamente a superfície que uma injeção de script exploraria.
Combinado com sessão em `localStorage`, o par era especialmente perigoso: uma
CSP que deveria ser a última linha de defesa vinha com a porta de trás aberta.

## Decisão 1 — manter `localStorage`, não migrar para cookie agora

Migrar para cookie `httpOnly` exigiria um proxy de sessão (edge function ou
middleware) entre o browser e o Supabase Auth, porque o SDK client-side não
tem como setar um cookie `httpOnly` a partir do JS do browser — isso é
trabalho de backend, fora do escopo de uma correção de CSP. Decisão: manter
`localStorage` e reduzir o risco pelo lado do XSS (CSP), não pelo lado do
armazenamento. Reavaliar se um proxy de sessão for construído por outro
motivo (ex.: SSR).

**Mitigações que tornam isso aceitável hoje:**

- CSP sem `'unsafe-inline'` em `script-src` (decisão 2, abaixo).
- `autoRefreshToken: true` já limita a janela de um token roubado à duração
  do `jwt_expiry` configurado no projeto (ver etapa 24 do plano de 50 etapas
  — ainda não auditado porque exige acesso ao painel do projeto canônico).
- `known_devices` + `new-device-alert` já detectam sessão em dispositivo novo.
- `reauthentication_requests` permite step-up auth em ações sensíveis.

## Decisão 2 — remover `'unsafe-inline'` de `script-src`; manter em `style-src`

`index.html` tinha exatamente um `<script>` inline: o registro do Service
Worker. Foi extraído para `public/register-sw.js` (carregado via
`<script src="/register-sw.js" defer>`), o que elimina a única razão para
`'unsafe-inline'` em `script-src`. O `<script type="application/ld+json">`
(dados estruturados) não é afetado — esse `type` nunca é executado como JS
pelo browser, com ou sem CSP.

`style-src` mantém `'unsafe-inline'` — Tailwind gera estilos inline via
`style=""` em vários componentes (cores dinâmicas de gráficos, barras de
progresso), e remover isso é um projeto à parte (migrar para CSS custom
properties + classes), não coberto por esta ADR.

## Decisão 3 — manter `'unsafe-eval'`; não é especulativo

Verificado diretamente em `node_modules/{exceljs,jspdf}/dist` (grep por
`new Function(` e `eval(`): **exceljs tem 8 arquivos e jspdf tem 2 arquivos**
que usam essas construções internamente. Ambos são dependências de produção
usadas nos exports de Excel e PDF (`src/lib/excelExporter.ts`,
`src/lib/pdfExporter.ts` e afins). Remover `'unsafe-eval'` sem confirmar em
um browser real que os exports continuam funcionando seria trocar um risco
teórico (CSP mais permissiva) por um risco concreto (feature quebrada em
produção) — e este ambiente não tem como abrir um browser para confirmar.
Fica como item aberto, não como "resolvido".

## Descoberta técnica que revisa o plano de 50 etapas

A etapa 22 do plano previa "rodar em modo `Content-Security-Policy-Report-Only`
por 1 semana com endpoint de report antes de enforçar". **Isso não é possível
da forma como a CSP deste projeto é entregue.** A diretiva
`Content-Security-Policy-Report-Only` só tem efeito quando entregue como
**header HTTP** — a especificação CSP não permite relatório via `<meta
http-equiv>` (nem `report-uri`/`report-to` funcionam de forma confiável via
meta em todos os browsers). Este projeto entrega a CSP via `<meta>` porque,
segundo o comentário já existente em `index.html`, os headers HTTP reais
dependem do hosting (Lovable Cloud) e não foram configurados.

Consequência prática: **não há como testar esta mudança em modo
"observar sem bloquear"** enquanto a CSP for entregue por `<meta>`. A
verificação que este ambiente conseguiu fazer foi estática — build limpo,
`register-sw.js` servido com sintaxe válida, chunk principal responde 200 —
não a checagem real, em DevTools, de que nenhuma violação de CSP aparece no
console ao navegar pela aplicação. **Isso precisa ser feito por alguém com
acesso a um browser antes ou logo depois do merge desta PR.**

## Pendências

1. **Verificação em browser real** (item acima) — quem revisar esta PR deve
   abrir a aplicação, navegar pelos fluxos principais (login, dashboard,
   export de PDF/Excel, assistente de IA) e confirmar zero erro de CSP no
   console.
2. **Headers HTTP reais** — configurar HSTS, `X-Frame-Options`/
   `frame-ancestors`, `X-Content-Type-Options` no Lovable Cloud (ou onde o
   app for hospedado) é o único jeito de ter Report-Only de verdade no
   futuro, e de proteger contra ataques que `<meta>` não cobre (ex.:
   clickjacking — `frame-ancestors` via meta não tem efeito nenhum, é
   silenciosamente ignorado pelos browsers).
3. **`'unsafe-eval`** — só sai da CSP se/quando os exports de Excel/PDF forem
   validados sem ele (ex.: build de produção do exceljs/jspdf configurado
   para não usar codegen dinâmico, se essas libs oferecerem essa opção) ou
   substituídos.
