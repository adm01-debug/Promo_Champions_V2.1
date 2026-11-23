# 01 — Inventário do sistema e registro de cobertura

Commit auditado: `17e5d6d` (`chore(main): release 1.7.4`), branch `main` espelhada em
`claude_04/youthful-hamilton-q1mk1n`. Auditoria em 2026-11-22/23, **somente leitura**.

Cada item termina com status de cobertura: **revisado**, **revisado por amostragem**
(com a amostra declarada) ou **não revisado** (com o motivo). A auditoria só pode ser
chamada de exaustiva na medida em que esta tabela mostrar o que ficou de fora.

## 0. Suposições declaradas

O campo `<contexto>` do pedido veio vazio. O que segue foi deduzido do código e da
documentação do próprio repositório, e deve ser corrigido pelo dono se estiver errado:

1. **O que o sistema faz:** CRM de vendas da Promo Brindes — pipeline de vendas,
   orçamentos/cotações, pedidos, comissões, metas, premiações, gamificação
   ("corrida"/arena), BI e relatórios, cadências de prospecção e integrações com
   Bitrix24, V4, WhatsApp, e-mail e telefonia.
2. **Quem usa:** equipe comercial própria em três funções de UI (SDR, Closer,
   híbrido) e três papéis de permissão (`salesperson`, `manager`, `admin`).
   Não é um produto multi-empresa: não há coluna de tenant/organização nas
   tabelas centrais — o isolamento é por pessoa (`salesperson_id`, `user_id`).
3. **O que mais incomoda hoje:** não informado. Por isso a priorização seguiu
   risco objetivo (dado/dinheiro/segurança), não incômodo relatado.

## 1. Stack, entrada, build e ambientes

| Camada | O que é | Evidência |
|---|---|---|
| Front | Vite 5 + React 18 + TypeScript + Tailwind + shadcn/ui + TanStack Query + React Router | `package.json`, `vite.config.ts` |
| Entrada | `index.html` → `src/main.tsx` → `src/App.tsx` → `src/routes/AppRoutes.tsx` (1155 linhas) | `index.html` |
| Backend | Supabase Cloud `usyxfpqlsspldubptrdl` — Postgres 17.6, RLS, Auth, Storage, Edge Functions (Deno) | `src/integrations/supabase/env.ts:5`, `supabase/config.toml:1` |
| Banco | 405 tabelas, 1003 policies, 320 funções, 382 triggers, 36 views, 32 cron jobs, 243 MB | `inventario/estado/banco.json` (snapshot 2026-11-12) |
| Edge Functions | 171 pastas em `supabase/functions/` + `_shared/` | `ls`, probe ao vivo |
| Migrations | 711 arquivos em `supabase/migrations/` | `ls` |
| Build | `npm run build` (`vite build`); Node 22+; lockfile `package-lock.json` | `package.json`, `.nvmrc` |
| Deploy | Vercel, automático no merge para `main`. SPA com rewrite `/(.*) → /index.html` | `vercel.json`, `AGENTS.md` §5.10 |
| Produção | https://promo-champions-v2-1.vercel.app — respondeu HTTP 200 em 2026-11-23 | EXECUTADO (curl) |
| Ambientes | `production` (Vercel/`main`), `pr-preview` (sem secrets por desenho), `staging` (`supabase/config.staging.toml`) | `.github/ENVIRONMENTS.md`, `docs/STAGING.md` |
| Variáveis públicas | apenas `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` (com defaults públicos por desenho em `env.ts`) | `.env.example` |
| CI | 28 workflows em `.github/workflows/`; gate de PR em `pr-checks.yml` | `ls` |
| Testes | Vitest (unitário), Playwright (e2e e a11y), testes SQL, Deno | `vitest.config.ts`, `playwright*.config.ts` |

**Qualidade do commit auditado (EXECUTADO, exit 0 nos três):**
`npm run typecheck` · `npm run lint` (0 warnings) · `npm run test`.
`npx tsx scripts/security/check-no-committed-service-role.ts` → "Nenhuma credencial de
serviço literal foi encontrada nos arquivos versionados".
`npm run check:migrations` → OK, 711 arquivos / 711 versões únicas (com aviso de que as
regras de arquivo novo só rodam com `--base`).

## 2. Atores, papéis e jornadas

### 2.1 Papéis que realmente mudam permissão
`src/hooks/useUserRoles.ts:7` — `AppRole = 'admin' | 'manager' | 'salesperson'`.
Origem (`useUserRoles.ts:42-95`): tabela `user_roles`, com
`.order('role').limit(1).maybeSingle()` — **ordem alfabética**, então `admin` > `manager` >
`salesperson` quando há mais de uma linha, e **só um papel é considerado**. Sem linha em
`user_roles`, cai para `salespeople.role` e devolve `salesperson` sintético (`:62-82`).

Níveis aplicados por `src/components/auth/ProtectedRoute.tsx:15-75`:

| Nível | Como é expresso | Nº de URLs |
|---|---|---|
| público | rota sem `ProtectedRoute` | 4 — `/auth`, `/reset-password`, `/embed/report/:token`, `/race-arena/spectator/:seasonId` |
| autenticado | `<ProtectedRoute>` sem papel | 93 |
| admin ou gestor | wrapper `Manager` → `requireAdminOrManager` | 65 |
| admin | wrapper `Admin` → `requiredRole="admin"` | 17 |

Negativa → `Navigate('/acesso-negado')` + `insert` em `access_denied_logs`
(`ProtectedRoute.tsx:33-40`). Falha ou timeout na consulta de papel devolve `null` e o
guard **nega** — fail-closed, comportamento correto.

### 2.2 Papéis que só a UI reconhece (não mudam permissão)
`salespeople.role` = `sdr | closer | hybrid` (`SalespersonForm.tsx`) e `dev`
(`src/components/auth/DevOnly.tsx:9-15`, junto com o e-mail `dev@promobrindes.com.br`).
Definem menu (`AppSidebar.tsx:75-94`) e dashboard inicial
(`src/hooks/dashboard/useDashboardRedirect.ts:22-29`) — nunca a permissão da rota.

### 2.3 Jornadas principais (RASTREADO)
- **Anônimo:** `/auth` → destino salvo em `location.state.from`, senão `/`
  (`useAuthForm.ts:51-53`). Demais superfícies públicas: `/reset-password`,
  `/embed/report/:token`, `/race-arena/spectator/:seasonId`.
- **SDR:** `/` → `/sdr` → `/pipeline`, `/atividades`, `/clientes`, `/agenda`,
  `/cadencias`, `/sequences`, `/engagement/*`, `/ranking`, `/arena`, `/race-arena`.
- **Closer/híbrido:** `/` → `/closer` → `/orcamentos` → `/cadencias-orcamentos` →
  `/vendas` → `/acompanhamento-pedidos` (+ `/meus-pedidos/:id`) → `/comissoes` →
  `/minhas-premiacoes`.
- **Gestor:** `/` → `/dashboard/visao-geral` (ou última seção salva) → `/vendedores`,
  `/metas`, `/analytics`, `/relatorios`, `/forecast`, `/revops`, `/times`, `/icp`,
  `/playbooks`, `/importar-exportar`, `/deduplicacao`, `/customer-success*`.
- **Admin:** tudo acima + bloco "Administração" (**só no desktop**,
  `AppSidebar.tsx:287-301`) → `/admin` → `/admin/conexoes`, `/admin/webhooks-*`,
  `/admin/platform-slo`, `/admin/web-vitals`, `/seguranca`, `/feature-flags`,
  `/usage-analytics`.

## 3. Interface, rotas e páginas — **revisado**

| Item | Nº | Status |
|---|---|---|
| `<Route>` em `AppRoutes.tsx` | 180 (179 rotas + shell `/*`) | revisado — parser próprio, cruzado 1:1 com `inventario/estado/rotas.json`: **0 divergências** de nível de acesso |
| Páginas em `src/pages/` | 173 | revisado por amostragem — classificação automática das 179 rotas + leitura integral das 25 de maior risco (admin, dinheiro, dado pessoal, ação destrutiva) |
| Exports de `lazyPages.ts` | 172 | revisado — todos importados **e** renderizados; 0 órfãos |
| Componentes em `src/components/` | 1226 arquivos | revisado por amostragem — varredura mecânica (botão sem handler, form sem submit, input sem estado, dado fixo) em todos + leitura dos ~40 candidatos |
| Itens de menu | 169 | revisado — `sidebarMenuData.ts` cruzado com as rotas |
| Rotas órfãs (sem menu **e** sem link/navigate) | 24 | revisado |
| `<form>` sem `onSubmit` | 0 | revisado (EXECUTADO) |
| `TODO`/`FIXME`/`WIP` em página publicada | 0 | revisado (EXECUTADO) |
| `Math.random()` alimentando métrica exibida | 0 | revisado (EXECUTADO) |
| Arquivos de produção nunca importados | 1 real (`src/components/ui/level-up-celebration.tsx`) em 1942 | revisado (EXECUTADO, script próprio) |
| Responsividade / mobile | — | revisado por amostragem — `MobileDrawer.tsx` lido integralmente; **não revisado**: layout visual real em viewport de celular (exigiria navegador contra produção autenticada, fora do escopo somente-leitura) |
| Acessibilidade | — | revisado por amostragem — `aria-label` ausente nos botões de ação destrutiva citados nos achados; **não revisado**: varredura completa com `npm run a11y:sweep` (exige servidor de preview com sessão autenticada) |

## 4. Hooks, estado e cache — **revisado**

| Item | Nº | Status |
|---|---|---|
| Arquivos em `src/hooks/` | 547 | revisado por amostragem — varredura mecânica em 100% (deps de efeito, `queryKey`, invalidação, cleanup de subscription, catch vazio, read-modify-write) + leitura dos hooks de dinheiro e de escrita |
| Hooks distintos alcançados pelas rotas | 789 | revisado (via `inventario/estado/rotas.json`) |
| Contexts / providers | — | revisado — inclui `GamificationContext` sem Provider (achado) |
| Assinaturas realtime | 29 com `event:'*'` sem `filter` | revisado |
| Supressões de `react-hooks/exhaustive-deps` | 50 | revisado — todas com a mesma justificativa genérica (achado) |

## 5. Backend — Edge Functions — **revisado**

| Item | Nº | Status |
|---|---|---|
| Pastas em `supabase/functions/` | 171 (+ `_shared`) | revisado — classificação automática de 100% por presença de gate de autenticação, uso de `service_role` e escrita; leitura integral das de risco |
| Helpers em `_shared/` | 41 arquivos | revisado — `auth-client.ts`, `webhook-auth.ts`, `internal-service-auth.ts`, `cron-request-auth.ts`, `rate-limit.ts`, `html-escape.ts`, `http-envelope.ts`, `secret-refs.ts`, `retry-policy.ts`, `fetch-with-timeout.ts` lidos integralmente |
| Funções com `verify_jwt = false` declarado | 22 | revisado — cada uma com o comentário de justificativa conferido em `supabase/config.toml` |
| Funções sem JWT **em produção** | 79 de 100 listadas pela Management API | revisado — e **64 não estão declaradas** no `config.toml` (achado A-114) |
| Funções deployadas | 171 de 171 | revisado (EXECUTADO) — sonda `OPTIONS` em cada uma, com controle negativo |
| Funções sem nenhuma verificação de chamador | 14 classificadas, 3 confirmadas como abertas e perigosas | revisado |
| Padrão "autentica e descarta" | 13 funções | revisado (EXECUTADO, grep) |
| `createClient` com `service_role` fora do guard-rail | 90 de 142 | revisado (EXECUTADO) |
| `fetch` para terceiro sem timeout | **0** | revisado (EXECUTADO) — disciplina completa |
| Segredo em log | **0** | revisado (EXECUTADO) — só mensagens de ausência, citando o nome |
| Front → função inexistente | **0** | revisado (EXECUTADO) — os 94 nomes invocados em `src/` existem |
| Idempotência nos receptores | 5 confirmadas | revisado |
| Teste Deno | 99 arquivos, concentrados em 12 funções; **134 diretórios com 0 teste** | revisado |

**Não revisado nesta camada:** o comportamento de execução das funções com `service_role`
contra as policies das tabelas que elas tocam (`call_transcripts`, `sequence_enrollments`,
`workflow_executions`, `known_devices`, `login_alerts`, `scheduled_sends`) — o `service_role`
ignora RLS por definição, então a leitura de policy não mudaria a conclusão; e **nenhum IDOR
foi explorado**: os achados A-30 a A-35 são RASTREADOS por leitura, porque comprová-los
exigiria JWT de usuário real e escrita em produção.

## 6. Banco de dados — **revisado (sem SQL ao vivo)**

| Item | Nº | Status |
|---|---|---|
| Tabelas em `public` | 405 (SNAPSHOT 12/11) → 408 (SCHEMA 17/11) | revisado |
| Tabelas sem RLS | **0** nas duas fontes | revisado |
| Policies | 1003 (SNAPSHOT) → 1017 (SCHEMA): `authenticated` 601, `PUBLIC` 401, `service_role` 6, `anon` 5, `anon+authenticated` 4 | revisado — parser próprio sobre `supabase/schema.sql`, com as contagens batendo com os cabeçalhos do arquivo |
| Policies `USING (true)`/`WITH CHECK (true)` | 116 (110 para `authenticated`, 6 para `service_role`) | revisado — 14 tabelas sensíveis identificadas; as demais classificadas como intencionais (etapa 023 produz o inventário completo) |
| Funções | 320 (SNAPSHOT) → 378 (SCHEMA), 304 `SECURITY DEFINER` | revisado — **todas as 304 têm `SET search_path`**, 0 violações |
| Gatilhos | 386; **111 tabelas com dois `updated_at` idênticos** | revisado |
| Views | 36 | revisado — 29 sondadas ao vivo pelo papel anônimo |
| Índices | 889; **14 grupos duplicados** | revisado |
| Chaves estrangeiras | 420; nenhuma apontando para tabela inexistente, nenhuma `NOT VALID` | revisado |
| Colunas `*_id uuid` sem FK | 27 (só 6 em tabela com dado) | revisado |
| Colunas de dinheiro | 53 `numeric` sem escala, 27 `numeric(12,2)`, 7 `numeric(14,2)`, 5 `numeric(5,2)` | revisado |
| Colunas `timestamp` sem fuso | **0** | revisado — convenção cumprida integralmente |
| Grants para `anon` | **400 de 408 tabelas** com DML completo; 18 revogadas | revisado (EXECUTADO + SCHEMA) |
| Migrations | 711 arquivos; 50 acima do ledger; 7 com data futura | revisado |
| Cron jobs | 32 ativos | revisado (SNAPSHOT) — agenda, falhas 24 h/7 d, duração e horas paradas |
| Buckets de storage | 6 | revisado (EXECUTADO) — teste diferencial de visibilidade em cada um |
| Tabelas órfãs | 31 (0 linhas, sem uso), com 55 policies e 15 gatilhos | revisado |

**Não revisado / não coberto nesta camada (e por quê):**
- **SQL arbitrário ao vivo: não disponível.** O conector MCP
  `SUPABASE PROMO CHAMPIONS V2 1` respondeu `Management API 401: Invalid access token` em
  todas as chamadas; o gateway `supabase-promo-champions-v2-mcp.adm01.workers.dev` responde
  `GET /health` com 200 (e confirma o projeto `usyxfpqlsspldubptrdl`) mas devolve 404 em todo
  caminho POST testado (`/mcp`, `/rpc`, `/jsonrpc`, `/messages`, `/tools`, `/query`, `/sql`,
  `/db/query`, `/v1/query`, `/tools/call`, `/call`, `/api/query`, `/mcp/v1`); e a Management
  API com o token do ambiente só alcança outra organização
  (`"Your account does not have the necessary privileges to access this endpoint"`).
  **Consequência:** nenhum achado de policy, função, gatilho ou índice é EXECUTADO — todos
  são RASTREADO sobre `supabase/schema.sql` (introspecção de produção de 17/11) ou sobre as
  migrations. A primeira ação do executor em qualquer etapa de banco é reconfirmar o estado
  com SQL.
- **Contagem de linhas e órfãos de dado:** não verificável sem `SELECT`. As contagens citadas
  são do SNAPSHOT de 12/11.
- **Existência de PITR ou backup restaurável:** afirmação de `supabase/schema.sql:7-10` de que
  não há; **não verificada** (exigiria o painel ou a Management API).

## 7. Integrações, webhooks e cron — **revisado**

| Item | Nº | Status |
|---|---|---|
| Integrações com terceiro (saída) | Bitrix24, V4, PromoGifts/gift_store, Twilio, Meta/WhatsApp, Z-API, Resend, ElevenLabs, gateway de IA, helpdesk (Freshdesk/Intercom), geocodificação | revisado |
| Webhooks de entrada | 7 endpoints públicos (`inbound-email-webhook`, `whatsapp-inbound-webhook`, `multichannel-status-webhook`, `receive-quote-sync`, `receive-quote-webhook`, `twilio-call-status`, `twilio-call-twiml`) | revisado — assinatura testada ao vivo em 4; mecanismo compartilhado lido integralmente |
| Webhooks de saída | 2 subsistemas (`dispatch-webhook` genérico e `winloss-webhook-dispatcher`) | revisado |
| Cron jobs | 32 | revisado — agenda, saúde e caminho de disparo (`trigger_internal_edge_job`) |
| Filas / dead letter | `v4_callback_dead_letters`, `webhook_deliveries`, `webhook_inbound_dedupe`, `edge_call_failures` | revisado |
| Credenciais de integração | `channel_credentials` (0 linhas), `integration_secret_refs` (0 linhas), `_internal_secrets` (3 linhas) | revisado |

**Não coberto:** o comportamento real dos terceiros (resposta do Bitrix24, da V4, do provedor
de e-mail) — nenhuma chamada de escrita a terceiro foi feita, por ser produção.

## 8. Regras de negócio — **revisado**

Regras extraídas de validações, restrições, nomes de status, cálculos e gatilhos, com o local
de cada uma. Domínios cobertos: **comissões** (trigger, resolução de regra, split de SDR,
fallback), **premiações e gamificação** (elegibilidade, concessão, XP, nível, liga, roleta),
**metas e ranking** (meta mensal, atingimento, data de corte, fuso), **pipeline e estágios**
(máquina de estados, transições, quatro pipelines), **aprovações** (quórum, limite por valor,
prazo), **descontos, markup e cotações** (markup por venda e agregado, conversão
cotação→venda→pedido).

Para cada regra, o relatório de origem registra **onde está implementada** e **onde deveria
estar e não está** — é a origem dos achados A-122 a A-141.

**Não coberto:** as regras que vivem apenas na cabeça do dono. O campo `<contexto>` do pedido
veio vazio, então toda divergência entre camadas foi reportada como divergência, **sem
decidir qual lado é o correto** — 23 etapas do plano pedem explicitamente essa decisão
(marcadas com aprovação humana).

## 9. Testes e observabilidade — **revisado**

| Item | Nº | Status |
|---|---|---|
| Testes unitários (Vitest) | 144 arquivos | revisado |
| Specs de ponta a ponta (Playwright) | 49, em 5 projetos | revisado — cruzados com os workflows: 23 rodam em PR, **26 nunca rodam** |
| Testes Deno | 99 arquivos | revisado |
| Testes SQL | 8 arquivos | revisado |
| Varredura de acessibilidade | `playwright.a11y.config.ts`, roda em PR e no semanal | revisado por configuração; **não executada** (exige servidor de pré-visualização com sessão) |
| Cobertura declarada | piso global de 4,64% de linhas; ladder com pisos de 100% em 5 módulos | revisado (EXECUTADO) |
| `.skip`/`.only`/`.todo` | 222 ocorrências, todas condicionais; **nenhum `.only`** | revisado (EXECUTADO) |
| Quarentena de testes instáveis | `tests/flaky-quarantine.json` → `specs: []` | revisado — nada escondido |
| Captura de erro no front | `initErrorTracking` + 5 limites de erro | revisado — e os dois destinos estão cegos (A-149) |
| Log estruturado nas funções | 171 de 172 com `withRequestId` | revisado |

**Não coberto:** execução da suíte de ponta a ponta (exigiria credencial de teste e sessão
autenticada) e a varredura de acessibilidade (idem). As etapas 225 a 227 do plano existem
justamente para cobrir essa lacuna.

## 10. Resumo da cobertura

| Camada | Status |
|---|---|
| Interface, rotas e páginas | revisado |
| Hooks, estado e cache | revisado |
| Backend (Edge Functions) | revisado; nenhum IDOR explorado (declarado) |
| Banco de dados | revisado **sem SQL ao vivo** (limitação declarada, com o erro exato) |
| Integrações, webhooks e cron | revisado; sem chamada de escrita a terceiro |
| Infraestrutura, deploy e CI | revisado (EXECUTADO contra a API do GitHub) |
| Regras de negócio | revisado; decisões de negócio devolvidas ao dono |
| Testes e observabilidade | revisado; suíte e2e e a11y **não executadas** |
| Acessibilidade | revisado por amostragem; varredura **não executada** |
| Responsividade real em dispositivo | **não coberto** — exigiria navegador contra produção autenticada |
| Carga e desempenho sob uso real | **não coberto** — `pg_stat_statements` inacessível sem SQL; etapa 168 cobre |
| Segurança de dependências | revisado (EXECUTADO) — `npm audit` sem vulnerabilidade, com e sem dev |
