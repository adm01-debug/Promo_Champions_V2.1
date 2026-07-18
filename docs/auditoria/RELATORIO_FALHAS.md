# Relatório Exaustivo de Falhas e Gaps — Promo Champions v2.1

> **Data:** 2026-07-18 · **Fase:** Descoberta (Fases 0–2 do plano mestre)
> **Metodologia:** Fan-out de 10 agentes de auditoria por domínio + verificação. Somente leitura — nenhuma correção aplicada nesta fase.
> **Legenda de severidade:** 🔴 CRÍTICO · 🟠 ALTO · 🟡 MÉDIO · 🔵 BAIXO · ⚪ INFO
> **CWE/OWASP** citados quando aplicável.

Este relatório é a **entrega da fase de descoberta**. As correções e a bateria E2E dirigida (Fases 3–5) seguem no plano mestre (`00_PLANO_MESTRE_AUDITORIA.md`) e aguardam aprovação.

Um **sumário executivo com contagem consolidada** está no fim do documento (preenchido ao concluir todos os domínios).

---

## Frente 1 — Segurança de Fronteira & Identidade (Módulos 01–04)

### 🟠 ALTO — Default de role permissivo concede permissões sem role atribuída
- **Local:** `src/hooks/usePermissions.ts:43`
- **CWE:** CWE-1188 (Insecure Default) / CWE-284 (Improper Access Control)
- **Descrição:** Quando a consulta a `user_roles` não retorna linha, faz fallback para `'salesperson'`: `const role = (roleData?.role || 'salesperson')`. Pior: diverge de `useUserRoles` (usado no `ProtectedRoute`), que retorna `null` e NEGA rotas — enquanto `PermissionGate` (via `usePermissions`) LIBERA como vendedor. Duas fontes de verdade de RBAC discordam para o mesmo usuário.
- **Impacto:** Usuário autenticado sem registro em `user_roles` ganha implicitamente `deals:read/write`, `clients:read/write`, `activities:read/write`. Contenção real fica 100% dependente de RLS.
- **Evidência:** `const perms = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.salesperson;`

### 🟡 MÉDIO — Autorização/roteamento puramente client-side (sem enforcement por ação no servidor)
- **Local:** `src/components/auth/ProtectedRoute.tsx:59-73`, `src/routes/AppRoutes.tsx:70-78`, `src/hooks/usePermissions.ts:13-26`
- **CWE:** CWE-602 (Client-Side Enforcement of Server-Side Security)
- **Descrição:** Toda decisão de RBAC é resolvida no cliente comparando `role` lido de `user_roles`; `ROLE_PERMISSIONS` vive no bundle. Não há RPC/edge que reavalie permissão por ação; proteção efetiva depende só de RLS por tabela.
- **Impacto:** Usuário com token no `localStorage` chama a API Supabase direto, ignorando guards de UI. Tabela sensível sem RLS estrita = bypass total.

### 🟡 MÉDIO — Rate limiter de login é client-side e fail-open
- **Local:** `src/hooks/useLoginRateLimiter.ts:62-67`, `src/hooks/auth/useAuthForm.ts:64-70`
- **CWE:** CWE-307 (Improper Restriction of Excessive Authentication Attempts)
- **Descrição:** Lockout calculado no cliente lendo `login_attempts`; em erro de consulta retorna `{ canAttempt: true }`. `signIn` chama `signInWithPassword` direto — atacante que chame a API de auth ou limpe `localStorage`/tabela contorna o lockout cosmético.
- **Impacto:** Proteção contra brute-force trivialmente contornável; nenhum travamento server-side.

### 🟡 MÉDIO — Query de permissões não escopada ao usuário (cache cross-user)
- **Local:** `src/hooks/usePermissions.ts:29-30`
- **CWE:** CWE-524 (Use of Cache Containing Sensitive Information)
- **Descrição:** `queryKey: ['user-permissions']` sem `user.id` (diferente de `useUserRoles` que usa `["user-role", user?.id]`). Role+permissões ficam cacheadas globalmente e não invalidadas no login. Mitigação atual é acidental (`signOut` faz reload completo via `window.location.href`).
- **Impacto:** Qualquer troca de usuário sem reload completo serve permissões obsoletas do usuário anterior até o `staleTime`. Bug latente de elevação/rebaixamento.

### 🟡 MÉDIO — Tokens de sessão em localStorage
- **Local:** `src/integrations/supabase/client.ts:11-17`
- **CWE:** CWE-522 (Insufficiently Protected Credentials)
- **Descrição:** Cliente configurado com `storage: localStorage`, `persistSession: true`. Access/refresh token acessível a qualquer JS da origem — sem cookie httpOnly.
- **Impacto:** Qualquer XSS (ou dependência comprometida) exfiltra o token e reutiliza a sessão. Amplifica todos os achados client-side acima.

### 🔵 BAIXO — Resolução de role via ordenação alfabética é frágil
- **Local:** `src/hooks/useUserRoles.ts:50-54`, `src/hooks/usePermissions.ts:36-41`
- **Descrição:** Para múltiplas roles seleciona-se uma via `.order("role").limit(1)`. Funciona por coincidência (`admin` < `manager` < `salesperson`), mas sem precedência explícita. Nova role (`owner`, `viewer`) pode inverter a escolha silenciosamente.
- **Impacto:** Decisão de autorização depende de ordem lexical, não de hierarquia de privilégio.

### 🔵 BAIXO — Flags de role carregadas após `isLoading=false` (flash de role incorreta)
- **Local:** `src/contexts/AuthContext.tsx:89-104`, `src/hooks/useUserRoles.ts:147-149`
- **Descrição:** Em `onAuthStateChange`, `setIsLoading(false)` é imediato enquanto `fetchSalesperson` roda fire-and-forget (`void`). `isSDR/isCloser/isHybrid` ficam com default momentâneo mesmo com `isLoading=false`.
- **Impacto:** Flash de conteúdo baseado em role incorreta logo após login (não afeta rotas admin/manager).

### ⚪ INFO — `.env.example` diverge do código (`ANON_KEY` vs `PUBLISHABLE_KEY`)
- **Local:** `.env.example` (`VITE_SUPABASE_ANON_KEY`) vs `src/integrations/supabase/client.ts` (`VITE_SUPABASE_PUBLISHABLE_KEY`)
- **Descrição:** O exemplo de ambiente documenta `VITE_SUPABASE_ANON_KEY`, mas o código de produção lê `VITE_SUPABASE_PUBLISHABLE_KEY`. Não é bug de runtime (o nome real é usado no código), mas quebra o onboarding: seguir o `.env.example` resulta em app sem chave.
- **Impacto:** Fricção de setup / app não inicializa para novos devs seguindo a doc.

### ⚪ INFO — Mensagem de política de senha inconsistente
- **Local:** `src/pages/ResetPassword.tsx:116` ("pelo menos 6 caracteres") vs `:14` (`z.string().min(8)`)
- **Impacto:** Texto confunde o usuário; requisito de senha não centralizado.

---

## Frente 6 — Qualidade Transversal · UI / Acessibilidade / Performance (Módulo 30-A)

### 🟠 ALTO — XSS armazenado em snippet de busca de calls (`ts_headline` renderizado como HTML cru)
- **Local:** `src/components/conversational/CallLibrarySearch.tsx:21-28,98` (fonte: `src/hooks/conversational/useCallLibrarySearch.ts:31` → RPC `search_call_library`)
- **CWE:** CWE-79 (Stored XSS)
- **Descrição:** `HighlightedSnippet` injeta `r.snippet` via `dangerouslySetInnerHTML` sem sanitização. O snippet vem de `ts_headline` do Postgres sobre transcrições de calls. `ts_headline` **não escapa** o HTML do documento indexado — só envolve matches em `<b></b>`, preservando qualquer markup do texto original.
- **Impacto:** Transcrição contendo `<img src=x onerror=...>`/`<script>` executa no navegador de quem pesquisa. XSS armazenado.
- **Evidência:** `<p ... dangerouslySetInnerHTML={{ __html: html }} />` com `html = r.snippet ?? ""`.
- **Correção sugerida:** DOMPurify no snippet, ou construir o highlight client-side a partir de texto escapado.

### 🟡 MÉDIO — Sanitizador de markdown caseiro é contornável (BriefingNarrative)
- **Local:** `src/components/executive-briefing/briefingHelpers.ts:58-60` (usado em `BriefingNarrative.tsx:15`)
- **CWE:** CWE-79 / CWE-116 (Improper Encoding/Escaping)
- **Descrição:** `sanitizeMarkdown` faz `md.replace(/<[^>]*>/g, "")` — single-pass, não recursivo. Entrada `<<img>img src=x onerror=alert(1)>` vira `<img src=x onerror=alert(1)>` após a 1ª remoção e não é reescaneada; depois é injetada via `dangerouslySetInnerHTML`.
- **Impacto:** Bypass do filtro anti-XSS; `narrative` vem de `executive_briefings` (gerado por IA/armazenado). Regex não substitui DOMPurify.

### 🟡 MÉDIO — `SlideOverPanel` (modal custom) sem trap de foco / Escape / ARIA
- **Local:** `src/components/molecules/SlideOverPanel.tsx:37-101`
- **CWE:** WCAG 2.1.1 / 2.4.3 (não-conformidade a11y)
- **Descrição:** Dialog off-canvas `fixed inset-0` que não move foco ao abrir, não restaura ao fechar, sem trap (Tab escapa), sem fechar por `Escape`, sem `role="dialog"`/`aria-modal`. Backdrop é `<div onClick>` sem suporte a teclado.
- **Impacto:** Usuários de teclado/leitor de tela presos fora/dentro do fluxo errado. Deveria usar o Radix Dialog já presente.

### 🟡 MÉDIO — `level-up-celebration` (modal custom) sem role/aria-modal/Escape/foco
- **Local:** `src/components/ui/level-up-celebration.tsx:33-45`
- **Descrição:** Overlay modal `fixed inset-0` sem `role="dialog"`, `aria-modal`, fechamento por `Escape` ou gerência de foco (tem botão fechar com `aria-label`, mas o container não é anunciado como modal).
- **Impacto:** Leitores de tela não anunciam contexto modal; foco não contido.

### 🟡 MÉDIO — `ErrorBoundary` único envolve toda a árvore de rotas
- **Local:** `src/routes/AppRoutes.tsx:103-106`, `App.tsx:94` (`GlobalErrorBoundary`)
- **Descrição:** Um único boundary abrange todas as páginas internas; erro de render em qualquer página derruba toda a área de conteúdo. Boundaries próprios só em Map/Race/WinLoss.
- **Impacto:** Falha localizada vira falha da aplicação inteira. Áreas críticas (pipeline, vendas, dashboards) sem boundary próprio.

### 🔵 BAIXO — Chaves de lista com `index` em listas de dados/interativas
- **Local:** `src/components/reporting/ReportPreview.tsx:120,185`; `EmbeddedReportView.tsx:72`; `src/components/shared/FilterPopover.tsx:83`; `src/components/sales/cadence/CadenceSimulationDialog.tsx:277`
- **CWE:** CWE-664 (uso impróprio de recurso — reconciliação por posição)
- **Descrição:** `key={i}` sobre coleções reais (linhas de tabela, filtros, passos de cadência). Reordenar/filtrar/inserir reconcilia por posição → bug de estado (inputs, seleção, foco), dados na linha errada.
- **Impacto:** Estado "vaza" entre linhas em tabelas de relatório e diálogos de simulação.

### 🔵 BAIXO — `aria-label` estático não reflete estado (ThemeToggle)
- **Local:** `src/components/atoms/ThemeToggle.tsx:26`
- **Descrição:** `aria-label="Tema claro"` fixo sobrescreve o `sr-only`; nome acessível é sempre "Tema claro" independente do tema. Idealmente `aria-pressed` + rótulo dinâmico.

### 🔵 BAIXO — Virtualização inconsistente em listas grandes
- **Local:** infra existe (`ui/virtualized-list.tsx`, `win-loss/VirtualDealsList.tsx`) mas usada só pontualmente; relatórios/leaderboards renderizam `rows.map` completo.
- **Impacto:** Custo de DOM/re-render elevado e jank em datasets grandes (não é bug funcional).

### ⚪ INFO — 3 `dangerouslySetInnerHTML` em `<style>` avaliadas como seguras
- **Local:** `src/components/ui/chart.tsx:70`; `DailyActivityRanking.tsx:373`; `MetasAtividades.tsx:150`
- **Descrição:** Duas injetam CSS 100% estático (sem risco). `chart.tsx:70` (shadcn) interpola `--color-${key}: ${color}` de config de dev — risco teórico de CSS injection só se `config.color` receber dado não confiável. Vale um guard de validação de cor.

### ⚪ INFO — Console no client (168 ocorrências) — sem vazamento de PII/segredo confirmado
- **Descrição:** `console.*` logando `email/token/senha` retornaram só `console.error('msg', error)`. `vite.config.ts` faz `pure: ['console.log','console.debug','console.info']` em produção mas mantém `console.error/warn`. Ressalva: objetos de erro do Supabase/WebAuthn podem conter detalhes de requisição — sanitizar antes de logar.

---

## Frente 5 — Backend Supabase · RLS / SECURITY DEFINER / Grants (Módulos 27–28)

> **Notas positivas verificadas:** `has_role()` lê de `public.user_roles` (server-side, escrita admin-only) — padrão correto; a migration SEC-01 `20260711134320` revoga EXECUTE de anon/authenticated em funções SECURITY DEFINER com allowlist; cobertura de RLS ampla (~363 tabelas com RLS habilitado). Os achados abaixo são o que **sobrevive** a essas correções, rastreando DROP/CREATE no estado final.

### 🟠 ALTO — `audit_logs`: policy de INSERT permite forjar `actor_id` de qualquer usuário
- **Local:** `supabase/migrations/20260416181124_7ac5204a-…​.sql:23-25`
- **CWE:** CWE-284 / CWE-345 (Insufficient Verification of Data Authenticity) — quebra de não-repúdio
- **Descrição:** `WITH CHECK (auth.uid() = actor_id OR auth.uid() IS NOT NULL)` — o `OR auth.uid() IS NOT NULL` anula a checagem. Basta estar autenticado para inserir auditoria com **qualquer** `actor_id`.
- **Impacto:** Usuário fabrica eventos de auditoria atribuídos a outra pessoa (incriminar admin, poluir trilha). É a fonte "confiável" consultada por admins.
- **Evidência:** `WITH CHECK (auth.uid() = actor_id OR auth.uid() IS NOT NULL);`

### 🟠 ALTO — Funções SECURITY DEFINER sem `SET search_path` (risco de hijack)
- **Local:** `20260105000002_audit_trail.sql:115` (`audit_trigger_func`), `:165` (`log_security_event`); `20260511203112_2dd0b918-…​.sql:88` (`fn_calculate_icp_score`) — e dezenas de outras pré-2026-07-11.
- **CWE:** CWE-426 (Untrusted Search Path)
- **Descrição:** Muitas funções SECURITY DEFINER não fixam `search_path`. O sweep SEC-01 corrigiu só os GRANTs de EXECUTE, não o `search_path`. A própria view `v_security_definer_exposure` (coluna `has_search_path`) reconhece a lacuna.
- **Impacto:** Role de menor privilégio que consiga criar objeto em schema anterior no `search_path` sequestra chamadas não-qualificadas dentro da função, executando com privilégios do owner. Trigger functions rodam em INSERT/UPDATE de usuários comuns.
- **Evidência:** `$$ LANGUAGE plpgsql SECURITY DEFINER;` sem `SET search_path` (vs. `handle_new_user_role` que faz `SET search_path = public`).

### 🟡 MÉDIO — Desempenho de vendas por vendedor nominal exposto a `anon`
- **Local:** `20260419103919_…​.sql:22` (`race_spectator_view`), `20260712221013_…​.sql:9` (`mv_competitive_ranking`)
- **CWE:** CWE-200 (Exposure of Sensitive Information)
- **Descrição:** `GRANT SELECT ... TO anon` em views/MV com `salesperson_name`, `total_sales`, `deals_count`, `score`. Na **materialized view** o GRANT a anon ignora RLS das tabelas base (MV não aplica `security_invoker`).
- **Impacto:** Não-autenticado lê faturamento/desempenho nominal da equipe (dado comercial sensível).

### 🟡 MÉDIO — `icp_parameters`: qualquer autenticado altera a config de scoring
- **Local:** `20260511203112_2dd0b918-…​.sql:19-20`
- **CWE:** CWE-284
- **Descrição:** `FOR ALL ... USING (true)` (sem `TO`/role) sobre tabela que alimenta o cálculo de ICP/lead scoring.
- **Impacto:** Qualquer autenticado insere/altera/apaga parâmetros que governam priorização de leads de toda a organização.
- **Evidência:** `CREATE POLICY "Authenticated users can manage ICP parameters" ON public.icp_parameters FOR ALL USING (true);`

### 🟡 MÉDIO — Leitura/escrita irrestrita (`USING (true)`) em tabelas de negócio sem escopo por dono
- **Local:** `20260418122352_…​.sql:24,47,72` (`deal_stage_transitions`, `stage_velocity_baselines`, `deal_velocity_alerts`); `20260418150311_…​.sql:70` (`task_catalog`); `20260508140136_…​.sql:23,26` (`cadence_funnel_rules` — `FOR ALL USING (true)`, escrita liberada)
- **Descrição:** SELECT (e ALL em `cadence_funnel_rules`) para todo autenticado sem filtro de propriedade. Transições de estágio e alertas de velocidade revelam o pipeline inteiro a qualquer vendedor.
- **Impacto:** Vazamento cross-usuário de pipeline/deals; alteração de regras de cadência por qualquer autenticado.

### 🔵 BAIXO — Gamificação com escrita irrestrita entre usuários (`USING (true)`)
- **Local:** `20260330181929_…​.sql:56-65` (`combo_tracking`, `league_members` INSERT/UPDATE USING true); `20260512163542_…​.sql:130,135` (`victory_feed`, `salesperson_xp` SELECT USING true)
- **Descrição:** Qualquer autenticado insere/atualiza combos e participação em ligas de outros e lê XP/feed de todos.
- **Impacto:** Manipulação de rankings/XP (que alimenta comissões/premiações em alguns fluxos).

### 🔵 BAIXO — `fn_test_cleanup_dedupe_privileges` re-concedida a `anon`
- **Local:** `20260707112331_…​.sql:1`
- **Descrição:** GRANT EXECUTE a `anon`; por ser SECURITY INVOKER, o sweep SEC-01 (só `prosecdef`) não a revoga. Retorna apenas booleans de checagem (read-only), mas desvia da política "nada para anon".

### ⚪ INFO — Policies PERMISSIVE sobrepostas e `DROP POLICY` com nomes incorretos
- **Local:** `clients` acumula policies em 5 migrations; `20251214145216:35,41,47` faz `DROP POLICY IF EXISTS` de nomes inexistentes (no-op silencioso).
- **Descrição:** Policies PERMISSIVE combinam por OR → acesso efetivo é a UNIÃO das sobreviventes; proliferação dificulta auditar o acesso real. `DROP IF EXISTS` com nome errado é no-op perigoso como padrão.
- **Impacto:** Risco de gap/regressão de RLS difícil de detectar. Recomenda-se validar estado final via `pg_policies` no banco (fora do escopo estático).

---

## Frente 2 — Núcleo Transacional · Quote-to-Sale & Financeiro (Módulos 05–06)

### 🔴 CRÍTICO — Trigger `tr_sync_quote_to_sale` reverte a venda recém-convertida para `lead`
- **Local:** `supabase/migrations/20260513192406_ef2d75ae-…​.sql:12-29` (`sync_quote_to_sale_status`), trigger em `20260512134826_…​.sql:33-36` (ativo, sem DROP posterior); RPC `fn_convert_quote_to_sale` `20260710142606_…​.sql:127-130`
- **CWE:** CWE-841 (Improper Enforcement of Behavioral Workflow) — corrupção de estado
- **Descrição:** Trigger `AFTER UPDATE OF status, total_value ON quotes` mapeia só `draft/sent/approved/rejected/expired`; qualquer outro cai em `ELSE 'lead'`. A RPC finaliza com `UPDATE quotes SET sale_id=…, status='converted'`. Como `'converted'` não está no `CASE` e `sale_id` já está preenchido, o trigger executa `UPDATE sales SET status='lead' WHERE id=v_sale_id`, sobrescrevendo o `status='won'` inserido pela RPC.
- **Impacto:** **TODA** conversão via RPC/botão "Converter em venda" resulta em venda `status='lead'`. Como `WON_SALE_STATUSES=['completed','won','closed']`, a venda convertida nunca conta como ganha → corrompe **receita, forecast, ranking, comissões e todo o BI de "won"**. Editar `total_value` de um quote convertido rebaixa a venda a `lead` de novo.
- **Evidência:** `v_pipeline_status := CASE … ELSE 'lead' END; … UPDATE public.sales SET status = v_pipeline_status …` (`'converted'`/`'won'` não tratados).

### 🟠 ALTO — Itens do pedido vêm de fonte divergente da validada; quotes de webhook não convertem pela RPC
- **Local:** RPC `20260710142606_…​.sql:60-65,121-125`; trigger legado `convert_quote_to_order` `20260706160203_…​.sql:262-272`; webhook `supabase/functions/receive-quote-webhook/index.ts:226`
- **CWE:** CWE-345 / integridade financeira
- **Descrição:** A RPC valida/copia itens de `quote_items` (`SUM(total_price)`), o trigger legado copia de `quotes.items` (JSONB) e o webhook grava itens **só** em `quotes.items` (nunca em `quote_items`). Logo: (a) quote de webhook tem `COUNT(quote_items)=0` → RPC lança `[EMPTY_ITEMS]`, sem caminho de conversão na UI; (b) ao reaproveitar order já criada pelo trigger, o guard `IF NOT EXISTS (order_items)` faz a RPC não reconciliar itens — `order.total` = `quote.total_value` mas `order_items` vieram do JSONB, podendo não somar.
- **Impacto:** Divergência entre fonte validada e armazenada; integridade financeira do pedido não garantida; quotes de integração sem conversão consistente.

### 🟠 ALTO — Três caminhos concorrentes e não coordenados de quote→sale/order
- **Local:** RPC `fn_convert_quote_to_sale`; trigger `trg_convert_quote_to_order` `20260706160203_…​.sql:279-281`; webhook `receive-quote-webhook/index.ts:300-334`
- **CWE:** CWE-362 / CWE-841
- **Descrição:** Coexistem (1) RPC transacional; (2) trigger legado que a cada `status='approved'` cria order `pending` sem validação de autorização/total; (3) webhook que cria a `sale` e faz `UPDATE quotes SET sale_id` direto, ignorando a RPC. Trigger gera orders órfãs (sem sale) e diverge de status (`pending` vs `confirmed`).
- **Impacto:** Estado inconsistente entre orders/sales conforme o caminho; orders sem validação financeira; invariantes impossíveis de garantir.

### 🟡 MÉDIO — `useUpdateQuoteStatus`: escritas não atômicas e erro do update de `sales` engolido
- **Local:** `src/hooks/useQuotes.ts:163-199`
- **CWE:** CWE-754 (Improper Check for Unusual Conditions)
- **Descrição:** `UPDATE quotes` seguido de `UPDATE sales SET status=…` sem transação e sem checar `error`; se o 2º falhar, o erro é ignorado e `onSuccess` exibe "pipeline sincronizado". Mapeamento frontend `approved→'won'` conflita com o do trigger DB `approved→'closed'` na mesma venda.
- **Impacto:** Dessincronização silenciosa reportada como sucesso; estado parcial; conflito de status.

### 🟡 MÉDIO — Retry de `unique_violation` na RPC trata a constraint errada
- **Local:** `20260710142606_…​.sql:101-118` + índice `ux_orders_quote_id` `20260708125950_…​.sql:4`
- **Descrição:** O loop captura `unique_violation` e retenta gerando novo `order_number`, mas há duas constraints únicas (`order_number` e `ux_orders_quote_id`). Se a colisão for em `quote_id`, gerar novo número não resolve — 5 tentativas falham e a RPC `RAISE`, abortando a transação (reverte a `sale`) e retornando `UNKNOWN`, em vez de idempotência.
- **Impacto:** Em corrida, conversão falha com erro opaco em vez de reaproveitar. Janela estreita (há `FOR UPDATE` no quote), mas tratamento logicamente incorreto.

### 🟡 MÉDIO — Webhook confia no `total` do cliente sem reconciliar com itens
- **Local:** `supabase/functions/_shared/webhook-validator.ts:161-200`; `receive-quote-webhook/index.ts:218-225,307,320`
- **CWE:** CWE-20 (Improper Input Validation)
- **Descrição:** O zod valida tipos (`total` nonnegative etc.) mas não valida `total == Σ(quantity·unit_price)`. `quote.total` é gravado como `total_value` e propagado a `sales.amount` sem recomputar. O `TOTAL_MISMATCH` da RPC usa `quote_items` (que o webhook não popula) — não protege este caminho.
- **Impacto:** Total/`amount` adulterável pela origem externa entra no funil financeiro sem verificação server-side.

### ⚪ INFO — Spec principal de quote-to-sale nunca assere `sales.status`
- **Local:** `tests/e2e/quote-to-sale.spec.ts` — valida `quotes.status='converted'` e `sale_id`, mas nunca `sales.status`.
- **Descrição:** Mesmo se a suíte rodasse autenticada, não detectaria o CRÍTICO acima (venda rebaixada a `lead`), pois não há `expect` sobre o status da venda.
- **Impacto:** Cobertura cega justamente ao invariante mais importante do fluxo.

---

## Frente 6 — Qualidade Transversal · Hooks / Estado / Realtime (Módulo 29)

### 🟠 ALTO — Double-spend no giro da roleta (read-modify-write sem atomicidade)
- **Local:** `src/hooks/gamification/usePrizeWheel.ts:78,96-99`
- **CWE:** CWE-362 (Race Condition) / CWE-367 (TOCTOU)
- **Descrição:** `spin` lê `availableSpins` do cache, checa `<= 0` no cliente e grava `spins_count = (availableSpins||1) - 1` — sem decremento atômico/RPC nem guard no servidor. Dois giros concorrentes/cache stale leem o mesmo valor e gravam o mesmo resultado.
- **Impacto:** Giros grátis/prêmios duplicados; saldo validado só no client, burlável.

### 🟠 ALTO — Lost-update ao reagir a mensagens (read-modify-write de JSON)
- **Local:** `src/hooks/useCompetitiveChat.ts:98-120`
- **CWE:** CWE-362
- **Descrição:** `addReaction` faz SELECT de `reactions`, muta em memória e UPDATE do JSON inteiro. Duas reações simultâneas na mesma mensagem sobrescrevem uma à outra.
- **Impacto:** Reações perdidas silenciosamente sob concorrência (chat competitivo em tempo real).

### 🟡 MÉDIO — `setInterval`/`setTimeout` sem cleanup (leak + setState após unmount)
- **Local:** `src/hooks/useBitrix24.ts:98-107`
- **Descrição:** `authorize()` cria polling (3s) e timeout de parada (2min) num callback, sem refs nem cleanup no unmount. Desmontar antes de conectar mantém o polling chamando `refetchStatus()`/toast.
- **Impacto:** Vazamento de timer/requisições e update de estado em componente desmontado.

### 🟡 MÉDIO — Nome de canal realtime colide entre instâncias (team vs. pessoal)
- **Local:** `src/hooks/revenue-intelligence/useRevenueForecast.ts:52,65`
- **Descrição:** Canal `forecast-${periodType}-${periodStart}` sem `ownerId` no nome, mas o efeito depende de `ownerId`. Forecast do time e pessoal no mesmo período colidem no mesmo topic. `on('*')` sem `filter` invalida em qualquer mudança.
- **Impacto:** Canais duplicados no mesmo topic (footgun supabase-js v2); assinante pode não receber eventos.

### 🟡 MÉDIO — Canais realtime com nome estático + filtro por argumento
- **Local:** `useRankNotifications.ts:47-58`; `admin/useV4Callbacks.ts:29-36`; `useWinLossRealtime.ts:13`; `useKudos.ts:56`; `sales/useSalesBattles.ts:31`; `revenue/useQuotaAttainment.ts:64,95`
- **Descrição:** Nomes de canal fixos (`'rank-changes-rt'`, `'v4-dead-letters'`, `'kudos-rt'`…) com discriminação só no `filter`. Duas instâncias simultâneas (abas/painéis) colidem. O repo já tem o padrão correto (refcount por `seasonId` em `race/useRaceLeaderboard.ts`).
- **Impacto:** Assinaturas duplicadas; entrega inconsistente de eventos.

### 🟡 MÉDIO — Cadeia de promises sem `.catch` terminal (unhandled rejection)
- **Local:** `src/hooks/conversational/useTranscribeRecording.ts:22-104`
- **Descrição:** `onSuccess` encadeia ~12 `functions.invoke(...).then(...)` sequenciais; cada `.then` só trata `res.error`, mas rejeição real (rede/timeout) propaga sem `.catch` final.
- **Impacto:** Unhandled rejection; pipeline de enriquecimento abortado silenciosamente sem feedback.

### 🔵 BAIXO — Criação de sessão duplicada por corrida render↔persistência
- **Local:** `src/hooks/useSessionManagement.ts:276-280` (com `createSession:34-70`)
- **Descrição:** `if (user && !getStoredSessionId()) createSession()` — o guard só passa a valer após o INSERT async. StrictMode/re-render rápido dispara 2 efeitos → 2 linhas em `active_sessions`.
- **Impacto:** Sessões ativas duplicadas por login.

### 🔵 BAIXO — Reconhecimento de voz recriado a cada tecla e não abortado no unmount
- **Local:** `src/hooks/useVoiceNavigation.ts:54-88`
- **Descrição:** Cada Ctrl+Shift+V faz `new SpeechRecognition()`+`start()` sem parar a sessão anterior nem encerrar no cleanup.
- **Impacto:** Múltiplas instâncias simultâneas; microfone pode continuar ativo após navegar.

### 🔵 BAIXO — `setState` após `await import()` sem checar montagem
- **Local:** `src/hooks/useCelebrationEffects.ts:23-35`; `gamification/useLevelUpCelebration.ts:64,154`
- **Impacto:** Warning de update em componente desmontado (sem impacto funcional grave).

### 🔵 BAIXO — `handleAuth` engole erro não-Zod e prossegue o login
- **Local:** `src/hooks/auth/useAuthForm.ts:54-76`
- **Descrição:** `catch` só trata `z.ZodError`; qualquer outro erro é engolido e o fluxo segue para `signIn`. Contador "tentativas restantes" usa estado defasado.
- **Impacto:** Mensagens incorretas; validação pode ser ignorada em erro inesperado.

### ⚪ INFO — Mutations sem `onError` (falhas silenciosas)
- **Local:** `useKudos.ts:64-77`; `useCompetitiveChat.ts:69-90`; `sales/useSalesBattles.ts:40-77`; `gamification/usePrizeWheel.ts:75-108`; `race/useRaceReactions.ts:67-91`; `gamification/useDailyChallenges.ts:74-104`
- **Impacto:** Ações aparentam sucesso mesmo falhando no servidor (RLS/rede).

### ⚪ INFO — Assinaturas `event:'*'` sem `filter` → invalidação excessiva
- **Local:** `revenue-intelligence/useRevenueForecast.ts:53-59`; `sales/useSalesBattles.ts:32`; `admin/useV4Callbacks.ts:31`; `dashboard/useDashboardKPIsPeriod.ts:263-269`
- **Impacto:** Refetch em excesso sob volume de escrita (qualquer `sales` invalida KPI de todos).

> **Nota positiva:** a maioria dos hooks usa React Query corretamente (chaves estáveis, `enabled` guardando null, rollback otimista). Race de request antigo bem tratada onde há fetch manual (`semantic/useSemanticSearch` com `reqIdRef`). Nenhuma violação de regras de hooks encontrada.

---

## Frente 6 — Qualidade Transversal · Testes / Build / Deps / CI (Módulo 30-B)

### 🔴 CRÍTICO — Relatório de qualidade/cobertura é fabricado (hardcoded), não medido
- **Local:** `scripts/generate-quality-report.ts:9-49` → produz `TEST_QUALITY_REPORT.md`
- **CWE:** CWE-1288 (Improper Validation) / integridade de processo
- **Descrição:** O script grava números fixos: "🏆 10/10 - Enterprise Perfection", "TOTAL 97.6%", "Edge Functions 100%", "1000 concurrent / 0% failure / P95 <220ms". Nada é lido de cobertura real (vitest), load-test ou Playwright.
- **Impacto:** Métrica de qualidade totalmente ilusória; decisões de release ("blocked if coverage drops") baseadas num doc que sempre diz 97.6%/10/10.
- **Evidência:** `content += \`| **TOTAL** | **97.6%** | … | **🏆 10/10** |\`;` literal.
- **⚠️ Confirmação empírica (2026-07-18):** o workflow `CI` (`lint.yml`, job `quality` = `tsc --noEmit` + `lint` + `test`) está em **`failure` nos últimos ≥8 commits do `main`** — ou seja, o branch principal está vermelho continuamente enquanto o relatório fabricado afirma "Enterprise Perfection 10/10". As checks da PR de auditoria (docs-only) também falham por isso, não pelo diff.

### 🔴 CRÍTICO — Suíte E2E crítica (quote-to-sale) nunca executa no gate de PR — passa verde vazia
- **Local:** `.github/workflows/pr-checks.yml` job `e2e`; `tests/e2e/helpers/auth.ts:32`
- **CWE:** CWE-1053 / cobertura ilusória
- **Descrição:** O job roda `npm run test:e2e` sem secrets (`VITE_SUPABASE_*`, `E2E_TEST_EMAIL/PASSWORD`, sessão) → `HAS_AUTH=false` → ~30 specs fazem `test.skip(!HAS_AUTH)`. Todo o fluxo quote→sale (conversão, concorrência, idempotência, RLS/forbidden, audit-log) é pulado e o job fica verde. `quote-to-sale-e2e.yml` também faz `if [ -z "$E2E_TEST_EMAIL" ]; then exit 0`.
- **Impacto:** Gate obrigatório de PR dá verde sem exercitar o fluxo mais crítico. Regressões (como o CRÍTICO do trigger acima) passam despercebidas.

### 🟠 ALTO — Cobertura enforced cobre ~17 arquivos "tier-1" a dedo; resto do src fora da medição
- **Local:** `vitest.config.ts` (`coverage.include`, thresholds 85/75/85/85)
- **Descrição:** Thresholds só se aplicam à allowlist manual (~17 utilitários puros). Centenas de componentes/hooks/serviços não entram no cálculo; 85% sobre 17 arquivos vira "97.6% total" no relatório fabricado.
- **Impacto:** Falsa cobertura global; código novo sem teste nunca reduz a métrica (não está no `include`).

### 🟠 ALTO — `npm audit` neutralizado com `|| true`
- **Local:** `.github/workflows/lint.yml` step "Security Audit"
- **Descrição:** `npm audit --audit-level=high || true` — sempre passa mesmo com vulnerabilidades high/critical (inconsistente com `enterprise-quality.yml`).
- **Impacto:** Vulnerabilidades conhecidas não bloqueiam merge; mascaramento explícito de falha.

### 🟠 ALTO — `tsconfig.app.json` com type-safety praticamente desligada
- **Local:** `tsconfig.app.json` (config real; `tsconfig.json` só faz `extends`)
- **CWE:** CWE-1127 / dívida de type-safety
- **Descrição:** `strict:false`, `noImplicitAny:false`, `noImplicitReturns:false`, `noUncheckedIndexedAccess:false`, `noFallthroughCasesInSwitch:false`, `skipLibCheck:true`. O `typecheck` do CI roda contra este config.
- **Impacto:** `any` implícito, índice possivelmente-undefined, fall-through e returns faltando não detectados. "Type Check" quase decorativo. (Contraste: `tsconfig.node.json` tem `strict:true`.)

### 🟠 ALTO — `react-hooks/exhaustive-deps` rebaixado a `warn` e silenciado com 60 disables idênticos
- **Local:** `eslint.config.js` + 60 `// eslint-disable-next-line react-hooks/exhaustive-deps` no src (13 só em `RaceArena.tsx`)
- **CWE:** CWE-1006 (Bad Coding Practices)
- **Descrição:** A regra é `warn`; como o CI roda `--max-warnings 0`, cada aviso quebraria o build → inseriram 60 disables em massa (justificativa idêntica, vários sem justificativa). Correlaciona com os bugs de stale-closure/realtime do Módulo 29.
- **Impacto:** Bugs de dependência de efeito mascarados em massa.

### 🟠 ALTO — Job `e2e-simulation` roda specs Playwright com Vitest (incompatível)
- **Local:** `.github/workflows/enterprise-quality.yml` job `e2e-simulation` → `npx vitest run tests/e2e`
- **Descrição:** `tests/e2e/*` são Playwright; `vitest.config.ts` exclui `tests/e2e`. Rodar `vitest run tests/e2e` coleta 0 testes ou falha na importação — não valida jornadas.
- **Impacto:** Job "E2E Journeys" que não roda E2E; mais cobertura ilusória.

### 🟡 MÉDIO — E2E com asserções condicionais que passam vazias
- **Local:** `tests/e2e/core-flows.spec.ts` (3 testes); `tests/e2e/smoke.spec.ts`
- **Descrição:** Em `core-flows`, asserções dentro de `if (await X.isVisible())` — elemento ausente (redirect /auth) pula o bloco e passa sem asserção. `smoke` afirma `toHaveTitle(/vite/i)` mas o título real é "PROMO CHAMPIONS…" (comentário `// Adjust based on actual app title`).
- **Impacto:** Cobertura E2E aparente sem garantia; asserção de smoke desalinhada.

### 🟡 MÉDIO — Três lockfiles divergentes; gerenciador de pacotes inconsistente
- **Local:** `package-lock.json` (836 KB), `bun.lock` (549 KB), `bun.lockb` (199 KB binário)
- **Descrição:** CI usa `npm ci`; scripts `dev`/`build` usam `bunx vite`. Sem `packageManager` fixado. `bun.lockb` está no `.gitignore` mas continua versionado.
- **Impacto:** Árvore de deps do CI (npm) pode divergir do dev/build (bun) → "funciona na minha máquina".

### 🟡 MÉDIO — `.env.example` documenta variável errada (app quebra se seguido)
- **Local:** `.env.example` (`VITE_SUPABASE_ANON_KEY`) vs código (`VITE_SUPABASE_PUBLISHABLE_KEY`)
- **Descrição:** (confirma o INFO da Frente 1) 0 usos de `ANON_KEY` no src/tests; seguir o exemplo gera app/E2E sem chave (`HAS_AUTH=false`).
- **Impacto:** Onboarding quebrado; contribui para E2E silenciosamente pulado localmente.

### 🟡 MÉDIO — ESLint config duplicada/obsoleta (`.eslintrc.json`) coexiste com flat config
- **Local:** `.eslintrc.json` + `eslint.config.js`
- **Descrição:** ESLint 9 usa flat config e ignora `.eslintrc.json` (que define outras regras e referencia `@typescript-eslint/*` v7 ainda em devDeps junto do `typescript-eslint` v8 real).
- **Impacto:** Config morta e enganosa; pacotes eslint duplicados inflam a árvore.

### 🟡 MÉDIO — `deno.json` com task e escopo quebrados
- **Local:** `deno.json` (`"check": "deno check src/main.ts"` — arquivo é `main.tsx`)
- **Descrição:** Task nunca roda; `lint`/`fmt` apontam para `src/` (React/TS do frontend, não Deno).
- **Impacto:** Comando de verificação Deno inutilizável.

### 🟡 MÉDIO — `vitest.node.config.ts` órfão (não referenciado)
- **Local:** `vitest.node.config.ts` (grep = 0 referências)
- **Descrição:** Config de isolamento nunca usada; comentário sobre "react-dom 19" não bate com o pin `react-dom@^18.3.1`.
- **Impacto:** Config morta; isolamento pretendido não vigora.

### 🟡 MÉDIO — `generate-audit-pdf.yml` faz commit+push automático em trigger de push
- **Local:** `.github/workflows/generate-audit-pdf.yml`
- **CWE:** CWE-732 (Incorrect Permission Assignment) — sem `permissions:` mínimas
- **Descrição:** Em `push` que altera `AUDIT_REPORT.md`, gera PDF e faz `git commit/push` de volta ao branch; `npm install -g md-to-pdf` sem pin; sem `permissions:` declaradas (herda default amplo).
- **Impacto:** Commits automáticos indesejados/reentrância; token de escrita sem escopo mínimo; dep global sem lock.

### 🔵 BAIXO — "Coverage Check" do `enterprise-quality` é comentário, não gate
- **Local:** `.github/workflows/enterprise-quality.yml` step "Coverage Check" (só `# Block if …` comentado)
- **Impacto:** Gate aparente sem efeito.

### 🔵 BAIXO — `pre-commit` não valida tipos nem testes
- **Local:** `.husky/pre-commit` (`npx lint-staged` → só `eslint --fix`+`prettier`)
- **Impacto:** Erros de tipo/testes quebrados passam pelo commit local; validação depende só do CI (com buracos).

### 🔵 BAIXO — `lint.yml` dispara em todo push (CI duplicado 3x por PR)
- **Local:** `.github/workflows/lint.yml` (`on: push:` sem `branches:`)
- **Impacto:** Desperdício de minutos de CI; jobs redundantes (higiene).

### ⚪ INFO — Ramo FORBIDDEN dos E2E nunca é exercitado (bypass de ownership na sessão)
- **Local:** `quote-to-sale-forbidden.spec.ts:47,74`; `-api-forbidden.spec.ts:46,84`; `-error-payload-ui.spec.ts:111,127`; `-seq-no-advance.spec.ts:86,96`; `-validations.spec.ts:151`; `-backfill.spec.ts:44`
- **Descrição:** Além do `!HAS_AUTH`, `test.skip(true, 'Sessão E2E tem bypass de ownership; FORBIDDEN não aplicável.')`. A verificação de RLS/ownership em runtime real nunca é coberta; confia-se em unit test de string.

---

## Frente 5 — Backend Supabase · Edge Functions Segurança (Módulos 22–26)

> **Causa raiz compartilhada:** a **anon key é um JWT válido e público** (embarcada no frontend). Logo `verify_jwt=true` **não** restringe a usuários específicos — só barra requests sem nenhum bearer. Funções que usam `SERVICE_ROLE_KEY` e não checam identidade/role/assinatura no código rodam efetivamente **sem controle de acesso**. Bons contraexemplos no próprio repo: `receive-quote-sync` (HMAC+dedupe+rate limit), `_shared/auth-client.ts` (`getUserClient`/`requireAdmin`), `ai-copilot`/`dispatch-webhook` (getUser+ownership).

### 🔴 CRÍTICO — `webauthn`: bypass total de autenticação / account takeover
- **Local:** `supabase/functions/webauthn/index.ts:49-64,238-315`
- **CWE:** CWE-287 (Improper Authentication) / CWE-306 (Missing Authentication)
- **Descrição:** Usa service role, não exige JWT, recebe `userId`/`credential` do body. Em `login-verify` **a assinatura WebAuthn nunca é verificada**: busca credencial por `credential_id` do body, aceita qualquer challenge `type='authentication'` (sem filtrar `user_id`/challenge/assinatura vs `public_key`) e **retorna token de login** (`generateLink` → `hashed_token`/`action_link`).
- **Impacto:** Takeover de qualquer conta: `login-options {userEmail: vítima}` devolve o `credential_id`; `login-verify {credential:{id}}` devolve action_link que autentica como a vítima. Também registra passkey para `userId` arbitrário e apaga passkeys de terceiros.
- **Evidência:** `.select('*').eq('type','authentication')…single()` sem verificação criptográfica → `auth.admin.generateLink({type:'magiclink', email: userData.user.email})`.

### 🔴 CRÍTICO — `send-multichannel-message`: WhatsApp/SMS sem auth com credenciais de terceiros
- **Local:** `supabase/functions/send-multichannel-message/index.ts:92-163`
- **CWE:** CWE-306 / CWE-284
- **Descrição:** Sem verificação de identidade. Recebe `ownerId`/`to`/`body`, carrega via service role as `channel_credentials` **daquele owner** e dispara pelo provider (Twilio/Meta/Z-API).
- **Impacto:** Qualquer um (anon key) envia WhatsApp/SMS arbitrário, para qualquer número, **à custa e em nome de qualquer owner** — smishing/impersonação/spam, esgotamento de saldo.

### 🟠 ALTO — `send-push-notification`: push arbitrário para usuários arbitrários (phishing)
- **Local:** `supabase/functions/send-push-notification/index.ts:31-88`
- **Descrição:** Sem auth. Recebe `user_ids[]`/`title`/`body`/`url`/`data` e envia web-push (service role).
- **Impacto:** Notificações com conteúdo/URL do atacante a qualquer usuário (phishing direcionado), spam, enumeração de push ativo.

### 🟠 ALTO — `execute-workflow`: escrita service-role sem auth com IDs controlados (IDOR)
- **Local:** `supabase/functions/execute-workflow/index.ts:29-141`
- **CWE:** CWE-639 (Authorization Bypass Through User-Controlled Key)
- **Descrição:** Sem checagem de usuário. Executa ações reais via service role usando `trigger_payload` do atacante: `update sales.stage where id=sale_id`, insert em `agenda_events`/`activities` para `salesperson_id` arbitrário. Sem idempotência.
- **Impacto:** Mover estágio de qualquer negócio, criar tarefas/atividades para qualquer vendedor, bypass de RLS.

### 🟠 ALTO — `enrich-lead`: escrita service-role sem auth em `clients` por `leadId` arbitrário
- **Local:** `supabase/functions/enrich-lead/index.ts:6-79`
- **Descrição:** Sem auth. Recebe `leadId` e faz `update clients` (`email_verified=true`, …) e upsert em tabelas de inteligência via service role.
- **Impacto:** IDOR de escrita cross-tenant em `clients` e poluição de tabelas de inteligência.

### 🟠 ALTO — Endpoints "hub"/agregadores expõem dados financeiros da empresa sem auth
- **Local:** `customer-success-360/index.ts:5-33`; `revops-hub/index.ts:15-113` (idem `pipeline-pulse-aggregator`, `deal-risk-digest`, `customer-success-hub`, `demand-forecast`)
- **CWE:** CWE-200
- **Descrição:** Sem verificação de identidade; service role lê agregados da empresa inteira (receita, comissões, `contract_value`, `annual_revenue`, surveys) e retorna no corpo.
- **Impacto:** Divulgação de dados financeiros/PII de clientes a qualquer chamador com anon key.

### 🟠 ALTO — `ranking-api`: controle de acesso quebrado (sem escopo de time/empresa)
- **Local:** `supabase/functions/ranking-api/index.ts:48-93,152-215,278-286`
- **CWE:** CWE-639 / CWE-284
- **Descrição:** Token de API não escopa alvos: lista todos os vendedores (incl. e-mail); `PUT team/user/edit/total` altera `score_total` de **qualquer** vendedor por e-mail sem checar `team_id`/empresa do token. Sem rate limit.
- **Impacto:** IDOR/quebra de isolamento multi-tenant: manipulação de pontuação (impacto em comissões/premiações) e leitura de PII entre times.

### 🟡 MÉDIO — `push-subscribe`: IDOR (sequestro/DoS de notificações)
- **Local:** `supabase/functions/push-subscribe/index.ts:23-66`
- **Descrição:** Sem auth; `user_id` do body. `subscribe` faz upsert `onConflict:'user_id'` — substitui a subscription da vítima; `unsubscribe` apaga a de qualquer um.
- **Impacto:** Redireciona push da vítima para endpoint do atacante (vazamento) ou nega notificações (DoS).

### 🟡 MÉDIO — Webhooks sem verificação de assinatura (cluster)
- **Local:** `twilio-call-status/index.ts:11-66` (sem `X-Twilio-Signature`); `multichannel-status-webhook/index.ts:7-90`; `inbound-email-webhook/index.ts:66-128` (sem Svix/SendGrid sig; provider inferido do user-agent); `twilio-call-twiml/index.ts:3-33` (vaza `agent_phone` por `owner_id`)
- **CWE:** CWE-345 (Insufficient Verification of Data Authenticity)
- **Descrição:** Aceitam payloads de provider sem validar autenticidade e escrevem via service role (`call_logs`, `outbound_messages.status`, `record_engagement_signal`, `inbound_reply_events` → `auto_pause_enrollment`). Sem idempotência por `provider_message_id`/`message_id`.
- **Impacto:** Forjar status/recording, envenenar métricas de engajamento/scoring, pausar cadências de terceiros (sabotagem), vazar telefone do agente.

### 🟡 MÉDIO — `dispatch-webhook` / `winloss-webhook-dispatcher`: eventos forjados com HMAC válido
- **Local:** `dispatch-webhook/index.ts:29-134` (exige só usuário autenticado qualquer); `winloss-webhook-dispatcher/index.ts:105-252` (sem auth/segredo interno)
- **Descrição:** Aceitam `event_type`/`payload`/`__replay_of` e fazem fan-out assinando com o `secret` real, sem checar propriedade/role.
- **Impacto:** Qualquer chamador injeta eventos forjados **com assinatura válida** aos subscribers e aciona replays/DLQ.

### 🟡 MÉDIO — `external-db-bridge`: proxy de escrita/leitura ao DB externo sem escopo por usuário
- **Local:** `supabase/functions/external-db-bridge/index.ts:95-341`
- **Descrição:** Exige só usuário autenticado; permite `select/insert/update/delete/rpc` em tabelas allowlist do DB externo com `rpcName` arbitrário, sem escopo por usuário. Segurança depende só da RLS anon externa.
- **Impacto:** Se a RLS anon externa for permissiva, qualquer logado lê/altera/deleta (`clients`, `sales`, `quotes`) e invoca RPCs no projeto externo.

### 🟡 MÉDIO — `bitrix24-oauth`: OAuth sem `state` (CSRF) e troca de código sem auth, tokens globais
- **Local:** `supabase/functions/bitrix24-oauth/index.ts:11-161`
- **CWE:** CWE-352 (CSRF)
- **Descrição:** Sem auth; authorize sem `state`; callback grava `access/refresh token` globalmente em `portfolio_settings`; `refresh` público.
- **Impacto:** CSRF/OAuth code injection — atacante liga a integração compartilhada à própria conta Bitrix.

### 🟡 MÉDIO — `report-embed-public`: `select *` padrão vaza todas as colunas
- **Local:** `supabase/functions/report-embed-public/index.ts:181-186`
- **Descrição:** Blocklist (`HIDDEN_FIELDS` só email/phone/commission); com `config.columns` vazio, `selectStr="*"` retorna todas as colunas (ex.: `clients`).
- **Impacto:** Exposição de colunas sensíveis fora da blocklist a qualquer detentor do token de embed.

### 🟡 MÉDIO — CORS `Access-Control-Allow-Origin: *` como padrão em endpoints autenticados
- **Local:** `supabase/functions/_shared/cors.ts:53-54,78-81`
- **CWE:** CWE-942 (Permissive Cross-domain Policy)
- **Descrição:** Sem `ALLOWED_ORIGINS`, `getCorsHeaders` cai para `*`; a maioria importa a constante estática fixa em `*`.
- **Impacto:** Qualquer origem web chama as funções a partir do navegador da vítima; amplia abuso cross-origin.

### 🔵 BAIXO — Rate limiter: bypass trivial e escopo por-isolate
- **Local:** `supabase/functions/_shared/rate-limit.ts:68-80`
- **Descrição:** Qualquer `Authorization: Bearer ey...` (regex, **sem validar**) faz bypass total; limitador in-memory por isolate (limite efetivo = instâncias × limite).
- **Impacto:** Escapar do rate limit incluindo um bearer qualquer.

### 🔵 BAIXO — Endpoints de IA/LLM sem rate limit (abuso de custo)
- **Local:** ~47 funções LLM (`nlq-query`, `ai-copilot`, `sales-assistant-chat`, `analyze-call`…); só `forecast-narrative` aplica limite.
- **Impacto:** Usuário autenticado gera custo/DoS financeiro; sem defesa em profundidade.

### 🔵 BAIXO — Vazamento de detalhes internos em mensagens de erro
- **Local:** `external-db-bridge:336`, `ranking-api:54,292`, `workflow-executor:175-178` (retornam `error.message` de DB/PostgREST)
- **Impacto:** Divulgação de nomes de tabelas/colunas/constraints.

### ⚪ INFO — `verify_jwt=true` ≠ autorização (causa raiz)
- **Local:** `supabase/config.toml` (2 overrides); ~50 `index.ts` com service role sem `getUser/has_role/assinatura`.
- **Descrição:** Recomenda-se exigir JWT de usuário + checagem de role, ou segredo interno para jobs server-to-server.

---

## Frente 4 — Inteligência & Análise · BI / Forecast / IA / NLQ / Export (Módulos 16–21)

### 🔴 CRÍTICO — Injeção de fórmula CSV no runner de relatórios agendados (service role)
- **Local:** `supabase/functions/scheduled-reports-runner/index.ts:17-29`
- **CWE:** CWE-1236 (Improper Neutralization of Formula Elements)
- **Descrição:** `toCSV()` faz só quoting RFC-4180, não neutraliza `= + - @ \t \r`. Dados vêm de `SELECT` bruto de `sales/clients/accounts` (campos livres). CSV gravado em `report-snapshots` e baixado pelo destinatário.
- **Impacto:** `=cmd|'/C calc'!A1` / `=HYPERLINK(...)` num campo de cliente executa ao abrir no Excel/Sheets → exfiltração/DDE.

### 🔴 CRÍTICO — Injeção de fórmula CSV em relatórios de Vendas/Clientes
- **Local:** `src/utils/reportDownload.ts:71-86` (usado em `src/pages/Relatorios.tsx:130`)
- **CWE:** CWE-1236
- **Descrição:** `generateCSV()` só faz quote-wrap; exporta `client_name`, `product_name`, `email`, `company`. Existe `sanitizeCsvCell` (`src/utils/csvExport.ts`) que este caminho ignora.
- **Impacto:** "Relatório oficial" para gestor/BI carrega payloads de fórmula executáveis.

### 🟠 ALTO — Export Excel (xlsx) sem neutralização de fórmula
- **Local:** `src/lib/excelExporter.ts:1-29` (`ExportButton.tsx:19`)
- **Descrição:** `worksheet.addRow(row)` insere valores crus; ExcelJS trata `=…` como fórmula real. O irmão `csvExporter.ts` chama `sanitizeCsvCell`; o ramo Excel não.
- **Impacto:** Injeção garantidamente executada (célula de fórmula real).

### 🟠 ALTO — Injeção de fórmula CSV no export de Atividades (SDR)
- **Local:** `src/components/activities/exportUtils.ts:8-35` (`ActivityList.tsx:130`)
- **Descrição:** Só quote-wrap; `contact_name`/`notes` (livre) não sanitizados.
- **Impacto:** Nota de atividade com `=/+/-/@` vira fórmula ativa no relatório SDR de outro usuário.

### 🟠 ALTO — Runner agendado (service role) sem filtro de dono/tenant — vazamento de dados
- **Local:** `supabase/functions/scheduled-reports-runner/index.ts:31-48`
- **CWE:** CWE-200
- **Descrição:** `executeReport` roda com service role (bypassa RLS) e faz `admin.from(entity).select(cols).limit(limit)` sem filtro por `created_by`/org. O builder interativo usa ANON+Authorization (respeita RLS).
- **Impacto:** Snapshot do usuário A retorna TODAS as linhas (vendas/clientes de todos os vendedores/tenants).

### 🟠 ALTO — `export-winloss-pdf` sem verificação de autorização
- **Local:** `supabase/functions/export-winloss-pdf/index.ts:13-27`
- **Descrição:** Não valida Authorization/claims; service role lê `win_loss_analyses` inteira sem filtro de dono.
- **Impacto:** Qualquer chamador obtém receita ganha, motivos de perda e concorrentes de toda a base (inteligência competitiva).

### 🟠 ALTO — Injeção de mensagem `system` via `conversationHistory` no chat de vendas
- **Local:** `supabase/functions/sales-assistant-chat/index.ts:371-378`
- **CWE:** CWE-77 (Command Injection) / LLM01 (Prompt Injection)
- **Descrição:** `conversationHistory` do body preserva o `role` do cliente; `validateArray` só valida comprimento. Cliente envia `{role:'system', content:'ignore as instruções...'}`.
- **Impacto:** Jailbreak total do coach; exfiltração do contexto de vendas de outros deals no prompt.

### 🟠 ALTO — Prompt injection de 2ª ordem (dados de BD no system prompt)
- **Local:** `supabase/functions/sales-assistant-chat/index.ts:318,324-370`
- **CWE:** LLM01
- **Descrição:** `aiAssistantName`/`salespersonName` e dados editáveis (`a.notes`, `client_name`, objeções) interpolados no `systemPrompt` sem delimitação.
- **Impacto:** Nota de deal maliciosa altera as instruções do sistema para todos que abram aquele contexto.

### 🟠 ALTO — Orquestrador executa ações privilegiadas a partir da saída da IA sem validação
- **Local:** `supabase/functions/ai-agent-orchestrator/index.ts:227-255`
- **CWE:** LLM01 / CWE-20
- **Descrição:** Com `auto_execute=true`, tool calls da IA disparam escritas service role (`add_note`, `schedule_followup`, `update_lead_score`); `args.score` gravado sem clamp 0-100 e sem amarrar entidade à propriedade do usuário.
- **Impacto:** Lead/nota envenenado induz o agente a criar notas, agendar eventos ou setar score fora de faixa.

### 🟠 ALTO — "Neural Insights"/Matrix Shifts fabricados exibidos como análise de IA
- **Local:** `src/hooks/bi/useABCAnalysis.ts:112-160` (render em `ABCAnalysis.tsx:127,199`)
- **CWE:** CWE-1099 / integridade de dados
- **Descrição:** `neuralInsights`, `matrixShifts`, `automations` são strings HARDCODED com números inventados ("85% de chance de aceitar upgrade", cliente fictício "Cliente VIP S/A" B→A) passados aos dashboards como inferência de IA real.
- **Impacto:** Decisões (upsell/retenção) baseadas em métricas fabricadas apresentadas como inteligência preditiva.

### 🟡 MÉDIO — Prompt injection em `ai-copilot` via `context.extra/page`
- **Local:** `supabase/functions/ai-copilot/index.ts:183-198`
- **Descrição:** `context.page`/`context.extra` (cliente) concatenados no `systemPrompt` sem delimitação.
- **Impacto:** Subversão de instrução e vazamento do `contextData` do vendedor (limitado por max_tokens:200).

### 🟡 MÉDIO — `next-best-action` / `predictive-intelligence` / `revenue-forecast-ai` / `behavioral-analysis` sem JWT + IDOR service role
- **Local:** `next-best-action/index.ts:37-49`; `predictive-intelligence/index.ts:54-81`; `revenue-forecast-ai/index.ts:21-40`; `behavioral-analysis/index.ts:21-35`
- **Descrição:** Não validam token; leem `salespersonId`/pipeline/`sales`/`clients` com service role e invocam o gateway de IA (alguns escrevem em `automation_runs`).
- **Impacto:** Leitura anônima do pipeline/nomes de clientes de qualquer vendedor + custo de IA descontrolado.

### 🟡 MÉDIO — Loop de até 500 chamadas de IA sequenciais sem cap de custo/timeout
- **Local:** `supabase/functions/analyze-win-loss/index.ts:123-146`
- **Descrição:** `for` sobre até 500 vendas chamando `classifyWithAI` (fetch sem AbortController) sequencialmente.
- **Impacto:** Uma invocação dispara centenas de chamadas → custo descontrolado; gateway lento trava a função sem deadline.

### 🟡 MÉDIO — Chamadas ao gateway de IA sem timeout/rate-limit (sistêmico)
- **Local:** `ai-agent-orchestrator:115-124` e idem `sales-assistant-chat`, `ai-copilot`, `next-best-action`, `analyze-call/conversation`, `qbr-generator`, `generate-executive-briefing`… Só `forecast-narrative` usa `withRetry(timeoutMs)`+`enforceRateLimit`.
- **Impacto:** Conexões penduradas retêm o worker; encadeamento infla custo.

### 🟡 MÉDIO — Agregação numérica quebrada no `group_by` do report builder
- **Local:** `supabase/functions/report-builder-execute/index.ts:233-245`
- **Descrição:** Com `group_by` só conta (`_count`) e mantém valores da PRIMEIRA linha; colunas numéricas (`amount`, `total_value`) não são somadas/mediadas.
- **Impacto:** Relatórios agrupados (receita por categoria/vendedor) mostram valor unitário arbitrário → decisão baseada em número errado.

### 🟡 MÉDIO — Forecast: confiança falsa em dados esparsos (bandas de largura zero)
- **Local:** `src/lib/revenueForecast/forecastEngine.ts:180-190`; `src/pages/RevenueForecastV2.tsx:50-53`
- **Descrição:** Executa forecast com `history.length>0` (até 1 ponto); com <2 pontos `stdDev(residuals)=0` → P10=P50=P90 (banda zero), rotulado "Ensemble ML · P10/P50/P90".
- **Impacto:** Previsão com intervalos de confiança nulos (certeza absoluta) sobre dados insuficientes.

### 🟡 MÉDIO — Forecast: MAPE in-sample contaminado infla pesos/confiança
- **Local:** `src/lib/revenueForecast/forecastEngine.ts:80-90,158-165`
- **Descrição:** O `fit` do Holt-Winters incorpora o próprio `data[i]`, então `mape(values, hw.fit)` compara real com ajuste que já o contém → erro artificialmente baixo → peso do HW e bandas P10/P90 inflados.
- **Impacto:** Ensemble comunica confiança maior que a real (não é erro out-of-sample).

### 🟡 MÉDIO — `useClientBI` mistura dados mock como reais no Client 360
- **Local:** `src/hooks/bi/useClientBI.ts:29-56`
- **Descrição:** Mesmo com `isMocked=false`, `recency`/`lastOrders` vêm de `MOCK_CLIENT_STATS`, `topCategories` hardcoded, `suggestedProducts.confidence=90` fixo.
- **Impacto:** Ficha de inteligência do cliente exibe recência/categorias/confiança fabricadas como reais.

### 🟡 MÉDIO — Severidade de risco (win-loss) diverge do backend → super-escalonamento
- **Local:** `src/lib/winloss/severityFromScore.ts:9-14` (`AtRiskDealsFromPatterns.tsx:60,86`)
- **Descrição:** Backend exige `score>=80 && conf>=0.7` para "critical"; a versão src ignora confiança e retorna "critical" para todo `score>=80`. Dois mirrors discordam.
- **Impacto:** Deals score≥80 mas baixa confiança aparecem como "crítico" na UI (falsos alarmes/priorização errada).

### 🔵 BAIXO — Escritas dirigidas por transcrição não confiável sem timeout (analyze-call/conversation)
- **Local:** `analyze-call/index.ts:39-101`; `analyze-conversation/index.ts:51-132`
- **Descrição:** Fetch sem timeout; saída do modelo (`JSON.parse`) gravada em `call_insights`/`conversation_analyses` com validação parcial.
- **Impacto:** Conteúdo controlado pelo modelo persistido sem sanitização; sem deadline.

### ⚪ INFO — NLQ (texto→dados) está corretamente defendido (padrão a replicar)
- **Local:** `supabase/functions/nlq-query/queryResolvers.ts`
- **Descrição:** IA só escolhe tools whitelisted; args passam por allowlists (`SAFE_METRICS`/`SAFE_STATUSES`/…), datas via `clampDate`, query-builder parametrizado com JWT do usuário (RLS aplicada), `limit` clampeado, auth obrigatória. **Sem injeção SQL.**

---

## Frente 3 — CRM & Dados de Cliente (Módulos 10–15)

### 🔴 CRÍTICO — Cadência pausada/cancelada continua enviando mensagens automáticas
- **Local:** `supabase/functions/process-cadence-tasks/index.ts:20-33`
- **CWE:** CWE-841 / compliance (LGPD)
- **Descrição:** O motor busca `cadence_tasks` por `status='pending'`+`automatic`+`scheduled_date<=today`, faz join em `prospect_cadences` mas **nunca filtra pelo status da cadência**. `usePauseCadence`/`useCancelCadence` só mudam `prospect_cadences.status`, sem cancelar `cadence_tasks` pendentes.
- **Impacto:** Pausar/cancelar **não interrompe** os disparos de e-mail/WhatsApp — o prospect segue recebendo. Falha de compliance e perda de controle do vendedor.

### 🔴 CRÍTICO — Envio duplicado por falta de claim atômico nas engines de cadência/sequência
- **Local:** `process-cadence-tasks/index.ts:20-96`; `sequence-runner/index.ts:98-325`
- **CWE:** CWE-362 (Race Condition)
- **Descrição:** Padrão "SELECT pendentes → envia → marca enviado" sem lock/claim atômico nem chave de idempotência; a gravação ocorre **após** o envio. `useTriggerSequenceRunner`/`useEnrollContacts` deixam qualquer usuário disparar o runner pelo client.
- **Impacto:** Cron sobreposto + clique manual (ou dois cliques) selecionam a mesma linha e **enviam a mesma mensagem duas vezes**.

### 🟠 ALTO — Listagens sem filtro por owner/team — vazamento entre times dependente de RLS frágil
- **Local:** `src/services/clientService.ts:5-9`; `src/hooks/usePipeline.ts:46-84`; `src/hooks/suppliers/useSupplierQueries.ts:5-48`; `src/hooks/activities/useActivities.ts:66-104`
- **CWE:** CWE-639 / CWE-284
- **Descrição:** Listagens fazem `select('*')` sem filtro de owner/team (filtro `salespersonId` opcional e ausente por padrão), delegando 100% à RLS. Há políticas `USING(true)` remanescentes: `sales_select_policy`/`activities_select_policy` (`20260530_enable_rls_and_remove_env_risk.sql:50-58`), nunca revogadas.
- **Impacto:** RLS permissiva (OR) → qualquer autenticado lê deals/atividades/clientes de todos os times; sem defesa em profundidade no client.

### 🟠 ALTO — Sem verificação de opt-out/consentimento antes de enviar WhatsApp/e-mail
- **Local:** `send-multichannel-message/index.ts` (sem checagem); `process-cadence-tasks/index.ts:54-76`
- **CWE:** compliance (LGPD/CAN-SPAM)
- **Descrição:** Nenhum ponto consulta supressão/unsubscribe/consentimento antes de disparar. Existe outcome `'unsubscribed'` em `activities`, não consultado antes do envio.
- **Impacto:** Contatos que pediram opt-out seguem recebendo — violação de LGPD e risco de bloqueio de número/domínio.

### 🟡 MÉDIO — Paginação ausente: listagens carregam a tabela inteira no cliente
- **Local:** `src/hooks/follow-up/useFollowUpData.ts:17-100`; `useActivities.ts:106-123`; `clientService.ts:5-9`; `usePipeline.ts:46-84`; `useSupplierQueries.ts:5-33`
- **CWE:** CWE-770 (Allocation without Limits)
- **Descrição:** `select('*')` sem `.limit()`/range. `useFollowUpLeads` busca **todas** as `sales` abertas + **todas** as `tasks` + **todas** as `activities` para cruzar em memória.
- **Impacto:** Degradação/DoS do cliente conforme a base cresce.

### 🟡 MÉDIO — Inconsistência de timezone no agendamento vs. processamento de cadências
- **Local:** `useProspectCadenceMutations.ts:19` (local `format(new Date(),'yyyy-MM-dd')`) vs `process-cadence-tasks/index.ts:17` (UTC `toISOString().split`)
- **Descrição:** Inscrição grava data local do navegador; engine compara em UTC com `<= today`; display usa `getLocalISODate()`.
- **Impacto:** Tarefas disparam um dia antes/depois; lista "de hoje" diverge do que a engine executa.

### 🟡 MÉDIO — Mudança de stage sem validação de transição nem campos obrigatórios
- **Local:** `src/components/pipeline/PipelineBoard.tsx:187-260`; `usePipeline.ts:88-101` (`useMoveDeal`)
- **Descrição:** Drag-and-drop faz `update({status:newStage})` sem regra de transição (pula/volta etapas) e sem exigir dados ao mover para `won`/`lost`. Confete dispara antes da confirmação do servidor.
- **Impacto:** Estados inconsistentes; "ganhos" sem dados obrigatórios; forecast poluído. (Histórico é preservado por trigger.)

### 🔵 BAIXO — `createClient` permite atribuir cliente a `user_id` arbitrário
- **Local:** `src/services/clientService.ts:11-17`
- **Descrição:** `user_id: input.user_id || user?.id` — payload do chamador tem precedência; só barrado se INSERT `WITH CHECK (auth.uid()=user_id)` estiver ativo (há histórico de `WITH CHECK(true)`).
- **Impacto:** Possível atribuição indevida de propriedade de cliente.

### 🔵 BAIXO — `useFollowUpSettings` com `maybeSingle()` sem filtro
- **Local:** `src/hooks/follow-up/useFollowUpData.ts:9-14`
- **Descrição:** `select('*').maybeSingle()` sem `.eq()` de escopo; >1 linha lança PGRST116 ou retorna linha arbitrária.
- **Impacto:** Falha de carregamento ou config de outro escopo.

### ⚪ INFO — Migração de RLS com sintaxe inválida (`CREATE POLICY IF NOT EXISTS`)
- **Local:** `supabase/migrations/20260530_enable_rls_and_remove_env_risk.sql:50,57`
- **Descrição:** Postgres não suporta `CREATE POLICY IF NOT EXISTS` — a migração falha ou aplica inconsistente, deixando o estado real de RLS de `sales`/`activities` indeterminado (amplia o ALTO de vazamento).

> **Notas de verificação:** sem divisão por zero (guardas presentes em `routingHelpers`/`PipelineBoard`); sem lógica de merge/dedup de clientes no escopo; `useTodaysQuoteCadenceTasks` filtra corretamente por `salesperson_id`; RLS de `suppliers` restrito a admin/managers.

---

## Frente 2 — Núcleo Transacional · Comissões, Gamificação & Integrações (Módulos 07, 09 + integrações)

### 🔴 CRÍTICO — Tokens OAuth do Bitrix24 (access + refresh) legíveis por qualquer autenticado
- **Local:** `supabase/functions/bitrix24-oauth/index.ts:62-78` + política `supabase/migrations/20260321200002_…​.sql:57`
- **CWE:** CWE-522 (Insufficiently Protected Credentials) / CWE-284
- **Descrição:** Tokens OAuth gravados em texto puro em `portfolio_settings` (`setting_key=bitrix24_access_token/refresh_token`). A política final é `FOR SELECT TO authenticated USING (true)`.
- **Impacto:** Qualquer logado (até vendedor de baixo privilégio) faz `select * from portfolio_settings` e obtém os tokens do Bitrix24 → assume a integração/CRM e usa o refresh_token para acesso persistente. Expõe qualquer credencial nessa tabela.

### 🟠 ALTO — Power-ups auto-concedidos e replayáveis via RLS (ganho infinito)
- **Local:** `supabase/migrations/20260418104126_…​.sql:72-75`
- **CWE:** CWE-284 / CWE-807
- **Descrição:** `race_powerups` tem `insert/update_own_powerups` sem restrição de `powerup_type`/`effect_data`. Usuário insere power-ups arbitrários (`mega_boost`) para si e zera `used_at` (re-coleta). A edge só valida `if (pu.used_at)`.
- **Impacto:** Ganho ilimitado de vantagens de corrida sem validação server-side; economia de jogo manipulável (impacta ranking → comissões/premiações).

### 🟠 ALTO — `process-race-event` concede power-ups sem idempotência nem autorização do dono
- **Local:** `supabase/functions/process-race-event/index.ts:34-85,192-255`
- **CWE:** CWE-362 / CWE-639
- **Descrição:** Só valida existência de JWT; aceita `sale_id` arbitrário, não verifica dono/admin. `grantPowerUp` faz `insert` puro (sem dedupe); repetir com `sale_id` de venda >$10k acumula `mega_boost` ilimitados.
- **Impacto:** Farm ilimitado de power-ups; eventos/notificações duplicados; processamento de vendas de terceiros.

### 🟠 ALTO — `broadcast-sale-notification` sem autorização e conteúdo 100% do chamador
- **Local:** `supabase/functions/broadcast-sale-notification/index.ts:16-31,140-160`
- **CWE:** CWE-306
- **Descrição:** Service role sem validar Authorization/role; todos os campos vêm do body. Com anon key, qualquer um dispara e-mails (Resend) + notificações in-app para TODOS os vendedores e insere auditoria falsa.
- **Impacto:** Spam/spoofing de "vendas", phishing interno, poluição de auditoria, abuso de custo de e-mail.

### 🟠 ALTO — Cálculo de comissão ignora faixa (`min_amount`/`max_amount`) e `category`
- **Local:** `supabase/migrations/20260619145322_…​.sql:173-181` (idem `20260517141803_…​:56-65`)
- **CWE:** impacto financeiro direto
- **Descrição:** Seleção da regra: `WHERE is_active AND (salesperson_id=closer OR IS NULL) ORDER BY priority DESC LIMIT 1`. `min_amount`/`max_amount`/`category` são ignoradas. Regras de faixa/categoria do admin não têm efeito.
- **Impacto:** Comissão com percentual errado (regra que valeria só acima de X aplica a todas as vendas) → pagamentos incorretos.

### 🟡 MÉDIO — Regras de comissão sobrepostas: global de maior prioridade vence a específica do vendedor
- **Local:** `supabase/migrations/20260619145322_…​.sql:176-177`
- **Descrição:** `OR salesperson_id IS NULL` + `ORDER BY priority DESC` sem critério de especificidade nem tie-break determinístico.
- **Impacto:** Percentual imprevisível quando há regras concorrentes; difícil de auditar.

### 🟡 MÉDIO — Trigger insere duas comissões com o mesmo `sale_id` sob `UNIQUE(sale_id)`
- **Local:** `20260619145322_…​.sql:183-197`; constraint `20260416170135_…​.sql:63`
- **Descrição:** Em ativação com SDR, o trigger faz dois `INSERT INTO commissions` com `sale_id=NEW.id`; a tabela tem `UNIQUE(sale_id)` → 2º insert viola constraint → rollback da conclusão da venda (ou comissões duplicadas se a constraint foi removida).
- **Impacto:** Vendas com SDR não concluem (erro) ou comissão SDR nunca é gerada — perda de comissão.

### 🟡 MÉDIO — Roleta de prêmios: prêmio escolhido no cliente e giros auto-gerenciáveis
- **Local:** `src/hooks/gamification/usePrizeWheel.ts:80-100`; política `20260317205046_…​.sql:82` (`available_spins FOR ALL USING (own)`)
- **CWE:** CWE-602 / CWE-362
- **Descrição:** `weightedRandom()` roda no cliente; `insert` recebe `prize_type/value/label` arbitrários (RLS só exige `salesperson_id` próprio). `FOR ALL` sem `WITH CHECK` de valor permite `update spins_count=9999`. Decremento client-side sujeito a corrida.
- **Impacto:** Giros ilimitados e sempre o melhor prêmio — manipulação de recompensas.

### 🟡 MÉDIO — `ranking-api`: edição de score não escopada ao time do token
- **Local:** `supabase/functions/ranking-api/index.ts:152-215,217-266`
- **CWE:** CWE-639 (duplica/reforça achado da Frente 5)
- **Descrição:** `PUT team/user/edit/total` (por e-mail) e `addfield/{userId}` alteram `score_total`/custom fields de qualquer usuário sem checar `team_id` do token; `company/users` retorna todos.
- **Impacto:** Qualquer token válido manipula placar de qualquer usuário (impacto em comissões/premiações) e lê cross-tenant.

### 🟡 MÉDIO — `dispatch-webhook`: qualquer autenticado dispara payloads assinados arbitrários
- **Local:** `supabase/functions/dispatch-webhook/index.ts:29-90` (reforça achado da Frente 5)
- **Descrição:** Exige só JWT válido (sem role); `event_type`/`payload` arbitrários enviados assinados com HMAC do webhook.
- **Impacto:** Usuário de baixo privilégio forja eventos "confiáveis" para sistemas downstream.

### 🟡 MÉDIO — OAuth Bitrix24 sem `state` (CSRF de autorização)
- **Local:** `supabase/functions/bitrix24-oauth/index.ts:26-34,37-50` (reforça achado da Frente 5)
- **CWE:** CWE-352
- **Impacto:** Atacante força conexão da conta Bitrix dele (ou reusa code interceptado) e sobrescreve os tokens.

### 🟡 MÉDIO — PDFs de orçamento em bucket público com caminho previsível
- **Local:** `supabase/functions/receive-quote-webhook/index.ts:273-283`
- **CWE:** CWE-200 / CWE-639
- **Descrição:** PDF salvo como `proposta-${quote_number}.pdf` via `getPublicUrl` (bucket público); caminho enumerável pelo número do orçamento.
- **Impacto:** Vazamento de propostas (nome/valores de clientes) para quem enumerar o número, sem autenticação.

### 🔵 BAIXO — `collect-race-powerup`: TOCTOU permite dupla coleta
- **Local:** `supabase/functions/collect-race-powerup/index.ts:48,64`
- **Descrição:** `if (pu.used_at)` e `update({used_at})` não atômicos (sem `.is('used_at', null)` no update).
- **Impacto:** Coleta/efeito duplicado; infla badge `powerup_collector`.

### 🔵 BAIXO — Comissão do SDR paga percentual cheio sobre o valor total (pagamento em dobro)
- **Local:** `supabase/migrations/20260619145322_…​.sql:189-196`
- **Descrição:** `v_sdr_commission := NEW.amount * v_rule_percentage / 100` — mesmo percentual/base do closer; `sdr_commission_amount` existe mas não é usada.
- **Impacto:** Se não for intencional, dobra o custo de comissão em ativações com SDR.

### 🔵 BAIXO — INSERT client-side de `salesperson_xp` sem validação do valor
- **Local:** `src/hooks/gamification/useSalespersonXP.ts:214-228`; política `20260317222414_…​.sql:10-12`
- **Descrição:** UPDATE de XP foi restrito a admin, mas o INSERT permanece `WITH CHECK (own)`; usuário sem registro insere `total_xp` arbitrário calculado no cliente.
- **Impacto:** Semear XP inicial arbitrário (limitado a quem ainda não tem registro).

### ⚪ INFO — Aprovação/pagamento de comissão define `approved_by` no cliente (sem segregação de função)
- **Local:** `src/hooks/useCommissions.ts:88-100`
- **Descrição:** Status/`approved_by`/`paid_by` setados client-side; mitigado por RLS admin/manager, mas manager que também vende pode auto-aprovar a própria comissão; `approved_by` é auto-declarado.
- **Impacto:** Falta de segregação de funções em aprovação financeira.

> **Notas positivas:** `receive-quote-webhook` bem protegido (x-api-key com comparação constante + idempotência por `external_quote_id`); `start-race-season`/`race_badges` INSERT restritos a admin; credenciais do frontend via env (sem hardcode).

---

# 📊 Sumário Executivo Consolidado

Auditados **10 domínios / 30 módulos** por fan-out de agentes com verificação direta no código. Contagem de achados **brutos** (antes de deduplicação entre agentes):

| Severidade | Qtde (bruta) |
|-----------|:---:|
| 🔴 CRÍTICO | 10 |
| 🟠 ALTO | 33 |
| 🟡 MÉDIO | 49 |
| 🔵 BAIXO | 22 |
| ⚪ INFO | 14 |
| **Total** | **~128** |

> Há sobreposição intencional entre agentes (ex.: `dispatch-webhook`, `ranking-api` e Bitrix `state`/tokens aparecem em mais de uma frente). Após deduplicação, os **10 CRÍTICOS são distintos**.

## Top 10 CRÍTICOS (distintos) — ação prioritária

| # | Falha | Local | Impacto |
|---|-------|-------|---------|
| 1 | **Account takeover via `webauthn`** (assinatura nunca verificada, retorna token de login) | `functions/webauthn/index.ts` | Sequestro de **qualquer** conta |
| 2 | **Trigger reverte venda convertida para `lead`** | `migrations/20260513192406…` | Corrompe **receita, comissões, forecast, ranking** de toda venda |
| 3 | **Tokens OAuth Bitrix24 legíveis por qualquer autenticado** (`USING(true)`) | `portfolio_settings` RLS | Roubo de credenciais de integração/CRM |
| 4 | **`send-multichannel-message` sem auth** usa credenciais de terceiros | `functions/send-multichannel-message` | WhatsApp/SMS arbitrário à custa de qualquer owner |
| 5 | **Cadência pausada/cancelada continua enviando** | `functions/process-cadence-tasks` | Envio indevido / violação LGPD |
| 6 | **Envio duplicado** (sem claim atômico) em cadência/sequência | `process-cadence-tasks`, `sequence-runner` | Mensagem enviada 2× ao contato |
| 7 | **CSV/formula injection** em relatórios agendados (service role) | `functions/scheduled-reports-runner` | RCE no Excel/Sheets do destinatário |
| 8 | **CSV/formula injection** em relatórios de Vendas/Clientes | `src/utils/reportDownload.ts` | Idem, no "relatório oficial" |
| 9 | **Relatório de qualidade fabricado** (97.6%/10-10 hardcoded) | `scripts/generate-quality-report.ts` | Métrica de release ilusória |
| 10 | **E2E crítico passa verde sem rodar** no gate de PR | `.github/workflows/pr-checks.yml` | Regressões (ex.: #2) passam despercebidas |

## Temas estruturais recorrentes

1. **Enforcement de segurança só no client / edge sem checar identidade** — RBAC no bundle, ~50 edge functions com `SERVICE_ROLE_KEY` sem `getUser`/role. A **anon key pública** torna `verify_jwt=true` insuficiente. → Causa raiz de ~15 achados ALTO/CRÍTICO.
2. **Cobertura ilusória** — relatório fabricado, E2E verde-vazio, cobertura enforced sobre ~17 arquivos, `tsconfig strict:false`, `npm audit || true`, `exhaustive-deps` silenciado com 60 disables. → O CI não pega os CRÍTICOS.
3. **Read-modify-write sem atomicidade** — roleta, reações, power-ups, cadências, quote→order. → Corrida = double-spend / envio duplicado / estado corrompido.
4. **Múltiplos caminhos concorrentes para o mesmo efeito** (quote→sale: RPC + trigger legado + webhook) sem fonte única de verdade. → Invariantes impossíveis de garantir.
5. **Injeção** — CSV/formula (export), prompt injection (system role no chat, dados de BD no prompt, ações auto-executadas). NLQ é o **contraexemplo correto**.
6. **Dados fabricados apresentados como IA/BI real** — "Neural Insights", Client 360 com mock, forecast com banda-zero. → Decisões sobre números inventados.
7. **Webhooks sem verificação de assinatura/idempotência** — Twilio, e-mail, multichannel, winloss. `receive-quote-sync` é o contraexemplo correto (HMAC+dedupe).
8. **Compliance/LGPD** — sem opt-out antes de enviar; auditoria forjável (`actor_id`).

## Cobertura e limitações desta auditoria
- **Estática (somente leitura):** nenhum código foi modificado; nenhum teste E2E foi executado (Fase 3 pendente). Achados de RLS/constraint foram verificados rastreando `DROP/CREATE` nas 553 migrations, **não** contra o banco vivo — validar estado final via `pg_policies`/`information_schema` é recomendado.
- **Amostragem:** 162 edge functions e 553 migrations foram amostradas priorizando escrita/auth/financeiro; funções de menor risco podem ter achados adicionais.
- **Próximos passos (plano mestre, Fases 3–5):** provisionar sessão de teste para destravar E2E, escrever provas E2E para cada CRÍTICO, remediar por prioridade, e revisão de segurança pós-correção.

---

*Fim do relatório de descoberta. Correções aguardam aprovação conforme o plano mestre.*
