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

<!-- SECOES SEGUINTES PREENCHIDAS CONFORME AGENTES CONCLUEM -->
