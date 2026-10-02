# Arquitetura — Promo Champions V2.1

CRM de vendas com IA, coaching e gamificação para a equipe comercial da
Promo Brindes. SPA React servida pela Lovable Cloud, backend inteiro no
Supabase (Postgres + RLS + Auth + Edge Functions Deno).

## Stack real

| Camada          | Tecnologia                                                                                                                        |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Frontend        | Vite, React 18, TypeScript, Tailwind CSS, shadcn/ui, framer-motion                                                                |
| Estado/dados    | TanStack Query 5 (server state), React Router 7 (rotas lazy), Context API (auth/session) — **não há Redux nem Zustand**           |
| Backend         | Supabase Cloud `usyxfpqlsspldubptrdl` — Postgres, RLS, Auth, ~170 Edge Functions (Deno), 612 migrations                           |
| Testes          | Vitest + Testing Library, Playwright (E2E), axe (`a11y:sweep`)                                                                    |
| Mapas/flows     | Leaflet + react-leaflet, @xyflow/react                                                                                            |
| Export          | xlsx, pdf-lib                                                                                                                     |
| Deploy          | **Lovable Cloud** (não Vercel) — build Vite, SPA estática                                                                         |
| Observabilidade | `log-web-vitals` (edge function) + painéis admin (`AdminWebVitalsPage`, `AdminPlatformSLOPage`), trilhas de auditoria em Postgres |

## Layout do `src/`

```
src/
  components/<dominio>/   # ai, analytics, bi, cadences, coaching, crm,
                          # deal-intelligence, dialer, gamification, race,
                          # revenue-intelligence, win-loss, customer-success...
  components/ui/          # primitivas shadcn (único diretório compartilhado)
  hooks/<dominio>/        # hooks TanStack Query por domínio
  pages/                  # 170+ páginas/rotas (lazy)
  routes/                 # pagePrefetchMap: mapa rota→import dinâmico
  integrations/supabase/  # client.ts singleton + tipos gerados
  services/               # lógica não-React (import/export, merge, ações)
  lib/                    # utilitários puros (money, usageAnalytics, markup...)
supabase/
  functions/              # ~170 edge functions Deno + _shared/
  migrations/             # 612+ migrations (timestamp crescente)
```

## Camadas funcionais

1. **Operação de venda (CRM core)** — pipeline Kanban, stage conversion,
   SLA de leads, cotações, cadências automáticas, comissões/premiações,
   roteamento de território, Customer Success.
2. **IA e coaching** — análise/diarização de chamadas, coaching
   intelligence, copiloto/assistente, forecast e BI por papel
   (BISDR/BICloser/BIVendedor/BIGestor), busca semântica (NLQ).
3. **Gamificação** — RaceArena, power-ups, ranking, badges, broadcast de
   vendas.

A lista completa de edge functions por domínio está em `CLAUDE.md` §4.

## Camada de dados (ADR-010)

`supabase.from()`/`supabase.rpc()` **só pode** ser chamado em
`src/hooks/`, `src/services/`, `src/lib/` e `src/integrations/`.
Enforced por `npm run check:data-layer` (ratchet + baseline em
`scripts/baselines/data-layer.txt`). Exceção por linha: `// data-layer-ok`.

- **hook** quando o resultado alimenta UI com cache/refetch (queryKey com
  prefixo de domínio, mutações invalidam keys relacionadas);
- **service** quando é ação disparada por evento sem leitura reativa;
- **lib** quando não toca Supabase (ex.: `lib/money.ts` — `formatBRL`/
  `formatBRLCompact`/`formatNumberBR`, utilitário único de moeda).

## Fronteiras entre domínios

Enforced por dois mecanismos complementares:

- `.dependency-cruiser.cjs` (`npm run deps:check`) — sem ciclos (com
  allowlist mínima em `pathNot`), sem módulos órfãos (error), regras
  directionais de camada (hooks/services não importam components/pages).
- `scripts/check-domain-boundaries.mjs` (`npm run check:domain-boundaries`)
  — arestas cross-domain entre `src/components/<dominio>` (exceto
  diretórios compartilhados: ui, layout, common, shared...) com baseline
  em `scripts/baselines/domain-boundaries.txt`; arestas novas quebram.

## Rotas e lazy loading

`App.tsx`/`MainLayout` declaram rotas com `React.lazy`. O mapa
rota→`import()` vive em `src/routes/pagePrefetchMap.ts` (módulo neutro,
sem dependência de componente) — usado por `PreloadLink`/`AppSidebar`
para prefetch no hover/intenção sem reintroduzir o ciclo
MainLayout↔lazyPages.

## Segurança

- **RLS** em todas as tabelas de tenant (ver ADR-003); RBAC de 3 papéis
  (ADR-001).
- Sessão Supabase em `localStorage` + CSP sem `'unsafe-inline'` em
  `script-src` (ADR-009).
- Edge functions com `SECURITY INVOKER` e grants mínimos; `_shared/` para
  helpers comuns; rate limiting/circuit breaker onde aplicável (ADR-004).
- WebAuthn/passkeys via edge function `webauthn`.
- Idempotência de negócio: quote→sale (ADR-005), request-id (ADR-006).

## Edge Functions (~170)

Agrupadas por domínio: CRM/pipeline, leads/roteamento, cadências, email,
voz/dialer (Twilio + ElevenLabs), IA/forecast, coaching, gamificação,
alertas/monitoramento, CS, multichannel, integrações (Bitrix24, helpdesk,
webhooks), reports/export e ops. Cron jobs monitorados pelos painéis de
`admin/connections` (SLO, rollback rate, alert metrics).

## Integrações externas

| Serviço            | Via                                                                                                                                                                          |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Twilio             | twilio-call-status/twiml/click-to-call                                                                                                                                       |
| ElevenLabs         | elevenlabs-stt/tts/voice                                                                                                                                                     |
| Bitrix24           | bitrix24-oauth, bitrix24-sync                                                                                                                                                |
| Email transacional | send-transactional-email, email-bulk-send                                                                                                                                    |
| WhatsApp           | send-multichannel-message (Evolution)                                                                                                                                        |
| Gateway MCP        | `supabase-promo-champions-v2-mcp.adm01.workers.dev` (rótulo "LOVABLE CLOUD" — aponta para `usyxfpqlsspldubptrdl`; o conector `SUPABASE_PROMO_CHAMPIONS_-_V2_MCP` está morto) |

## Deploy

- **Frontend**: build Vite → Lovable Cloud. `index.html` carrega CSP via
  `<meta>` (ver ADR-009 — o `<meta>` só endurece, não pode ser o único
  mecanismo em edge/CDN).
- **Edge functions**: `supabase functions deploy` (Deno). Migrations:
  `db_query` via gateway MCP com DDL direto; arquivos em
  `supabase/migrations/` com timestamp estritamente crescente.
- **Não há** Vercel, Cloudflare ou Sentry configurados no repositório —
  versões anteriores deste doc citavam essa stack por engano.

## Verificação local

```sh
npm run typecheck        # tsc --noEmit
npm run lint             # eslint --max-warnings 0
npm run test             # vitest
npm run deps:check       # depcruise (ciclos, órfãos, camadas)
npm run check:data-layer        # ratchet supabase.from/rpc (ADR-010)
npm run check:domain-boundaries # ratchet fronteiras de domínio
npm run test:e2e         # playwright
npm run a11y:sweep       # axe
```

## Grafo de conhecimento

`graphify-out/` contém o grafo do codebase (GRAPH_REPORT.md). Usar
`graphify query/path/explain` para navegação; `graphify update .` após
mudanças estruturais.
