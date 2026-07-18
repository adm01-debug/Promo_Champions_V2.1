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

<!-- SECOES SEGUINTES PREENCHIDAS CONFORME AGENTES CONCLUEM -->
