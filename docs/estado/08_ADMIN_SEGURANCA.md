# 08 · ADMIN / SEGURANÇA / AUTENTICAÇÃO / CONFIGURAÇÕES / TELEMETRIA

> ## ⚠️ ERRATA — inserida na Fase D (verificação independente), 2026-08-16
>
> O achado nº 2 deste documento ("🔴 Exposição anônima … expõem **100 clientes e 2.228
> atividades** a qualquer portador da chave anônima, sem login") **estava superdimensionado**.
> O texto original foi mantido abaixo, sem alteração, para que se saiba que houve revisão.
>
> **O que foi feito para verificar:** em vez de inferir a partir de `pg_policies`, assumi o papel
> `anon` no banco de produção (`SET LOCAL ROLE anon`, dentro de transação somente-leitura) e
> tentei ler cada tabela. Este é o teste empírico, não estrutural.
>
> **Resultado — o que se confirma:**
>
> | Tabela | Lida como `anon`? | Linhas obtidas |
> |---|---|---:|
> | `products` | **sim** | 17 |
> | `suppliers` | **sim** | 6 |
> | `teams` | **sim** | 3 |
>
> A exposição de `suppliers` é comercialmente sensível e o achado permanece **válido e real**
> para essas três tabelas.
>
> **Resultado — o que se refuta:**
>
> | Tabela | Lida como `anon`? | Erro retornado |
> |---|---|---|
> | `clients` | **não** | `42501: permission denied for function has_permission` |
> | `activities` | **não** | `42501: permission denied for function get_current_salesperson_id` |
>
> As 100 linhas de `clients` e as 2.228 de `activities` **não são acessíveis anonimamente**.
> A avaliação da policy aborta antes de devolver qualquer linha. A afirmação original de que
> estariam expostas está **incorreta**.
>
> **Por que o erro aconteceu:** a policy `"Users can view active clients"` é de fato do role
> `{public}` com predicado `((deleted_at IS NULL) AND true)` — estruturalmente permissiva, como
> o documento apontou. O que a leitura estrutural não capturou é que o `anon` **não tem
> `EXECUTE`** nas funções auxiliares invocadas por outras policies da mesma tabela, e o
> Postgres avalia o conjunto antes de retornar. Ler `pg_policies` sem executar não distingue
> "permissivo" de "permissivo porém inalcançável".
>
> **Ressalva que sobrevive à correção, e importa mais que o achado original:** a proteção de
> `clients` e `activities` é **acidental, não deliberada**. Ela não vem de uma policy que nega
> acesso — vem de um erro de permissão em função auxiliar. Um `GRANT EXECUTE` em
> `has_permission` ou `get_current_salesperson_id` para `anon` — uma linha de migration,
> plausível como "correção de bug" — **abriria imediatamente os 100 clientes e as 2.228
> atividades**. O risco é real; o que está errado é o tempo verbal: não *está* exposto, está a
> uma linha de distância de ficar.
>
> **Nota metodológica:** minha primeira tentativa de conferir este achado também errou — filtrei
> policies por predicado literal `'true'` e descartei `((deleted_at IS NULL) AND true)`, o que
> me deu um falso negativo e quase me fez absolver o achado inteiro por engano. Foi o teste
> empírico com `SET ROLE`, e não a segunda consulta estrutural, que produziu a resposta correta.

**Auditoria de estado real — medida, não documentada.**
Data da medição: 2026-08-16 · Banco: Supabase produção (leitura via MCP, somente SELECT)
Escopo: `src/components/admin|security|settings|auth|profile|debug|accessibility|errors|keyboard|filters|common`, `src/contexts/`, `src/pages/admin/`, edge functions de segurança.

> Nenhuma afirmação deste documento vem de `docs/*.md`. Toda linha tem `arquivo:linha` lido ou query SQL executada.

---

## 0. Números crus (medidos)

| Medição | Query | Resultado |
|---|---|---|
| Tabelas públicas | `pg_class relkind='r'` | **397** |
| Com RLS habilitado | `relrowsecurity` | **397 / 397 (100%)** |
| Com RLS **sem nenhuma policy** | `not exists (pg_policies)` | **0** |
| Usuários reais | `select count(*) from auth.users` | **2** |
| Linhas em `user_roles` | | **3** (2 usuários; um deles tem 2 papéis) |
| Logins efetivos | `auth.users.last_sign_in_at not null` | **1** |
| `feature_flags` | | **0 linhas** |
| `permissions` / `role_permissions` | | **0 / 0 linhas** |
| `roles` | | 3 linhas (`admin`, `manager`, **`seller`**) |
| `audit_logs` | | 6.933 linhas · máx `created_at` **2026-08-14** |
| `audit_log` (tabela irmã) | | 329 linhas |
| `error_logs` | | 1.208 linhas · máx `created_at` **2026-08-04** (12 dias parado) |
| `access_denied_logs` | | 4 linhas · máx 2026-08-13 |
| `page_analytics` | | 75 linhas · máx **2026-08-15** (única telemetria viva) |
| `security_events`, `active_sessions`, `blocked_ips`, `ip_whitelist`, `known_devices`, `webauthn_credentials`, `webauthn_challenges`, `user_mfa_settings`, `mfa_verification_attempts`, `rate_limit_logs`, `rate_limit_settings`, `push_subscriptions`, `session_activity`, `security_alert_settings`, `security_alert_history`, `login_attempts`, `password_reset_requests`, `geo_blocked_regions`, `geo_access_logs`, `query_telemetry`, `web_vitals_samples`, `user_permissions_cache`, `api_tokens` | | **todas 0 linhas** |
| Edge functions totais | `ls supabase/functions/*/` | **168** |
| Edge functions usando `SUPABASE_SERVICE_ROLE_KEY` cru | grep | **138 / 168 (82%)** |
| Edge functions usando `getServiceClient` (helper SEC-08) | grep | **5** |
| Edge functions usando `getUserClient` (RLS-aware) | grep | **19** |

**Papéis reais no banco:** enum `public.app_role = {admin, manager, salesperson}`.
Existe também `public.salesperson_role = {sdr, closer, hybrid}` (função comercial, não RBAC).

Usuários de fato:
- `adm01@promobrindes.com.br` — role `admin`, criado 2026-05-22, **nunca logou** (`last_sign_in_at = null`).
- `ti@promobrindes.com.br` — roles `salesperson` **e** `admin` (2 linhas), único login em 2026-08-13.

Existem 18 linhas em `public.salespeople`, mas apenas **2** têm `auth_user_id` preenchido. 16 "vendedores" são registros sem conta.

---

## 1. Tabela de estado

| Funcionalidade | UI (arquivo:linha) | Objeto de banco | Estado real (linhas/flag) | Classificação | O que falta |
|---|---|---|---|---|---|
| Login e-mail/senha | `src/hooks/auth/useAuthForm.ts:71`; `src/contexts/AuthContext.tsx:112-115`; `src/components/auth/AuthFormCard.tsx` | `auth.users` | 2 usuários, 1 login real | ✅ IMPLEMENTADO_TOTAL | — |
| Sessão + perfil salesperson | `src/contexts/AuthContext.tsx:39-43, 68-110` | `salespeople.auth_user_id` | 18 salespeople, só 2 com auth | ✅ | Vincular os 16 órfãos |
| Login Google OAuth | `src/hooks/auth/useAuthForm.ts:98` (`lovable.auth.signInWithOAuth`) | — | 0 identities OAuth verificadas | 🟦 SUGERIDO_OU_INICIADO | Provider não verificável por SQL; nenhum login OAuth registrado |
| Reset de senha (self-service) | `src/hooks/auth/useAuthForm.ts:89` | `auth` (Supabase nativo) | — | ✅ | — |
| Rate limit de login | `src/hooks/useLoginRateLimiter.ts:56, 120`; `src/hooks/auth/useAuthForm.ts:65,74,81` | `login_attempts` | **0 linhas** | 🟨 PARCIAL | RLS bloqueia: INSERT/SELECT só para role `anon` (ver Risco #3). Login bem-sucedido nunca é gravado |
| Edge `get-client-ip` | `src/hooks/useLoginRateLimiter.ts:24-38` | — | chamada real existe | ✅ | — |
| `ProtectedRoute` por role | `src/components/auth/ProtectedRoute.tsx:59-73` | `user_roles` via `useUserRoles` | 4 bloqueios reais gravados | ✅ | — |
| Log de acesso negado | `src/components/auth/ProtectedRoute.tsx:33-40` | `access_denied_logs` | **4 linhas**, máx 13/08 | ✅ | — |
| `useUserRoles` (papel corrente) | `src/hooks/useUserRoles.ts:42-95, 145-157` | `user_roles` | 3 linhas | ✅ | `order("role").limit(1)` depende da ordem do enum para "maior privilégio vence" — frágil |
| Fallback de papel via `salespeople` | `src/hooks/useUserRoles.ts:62-81` | `salespeople.role` | — | 🟨 | Concede `salesperson` no cliente sem linha em `user_roles`; RLS do banco não reconhece isso |
| Gestão de papéis (UI) | `src/components/settings/RoleManagement.tsx:45-47`; montado em `src/pages/Configuracoes.tsx:146` | `user_roles` (UPDATE) | funcional | ✅ | — |
| `RoleManager` (segunda UI de papéis) | `src/components/security/RoleManager.tsx` (289 l) | `user_roles` | **0 imports em todo o `src/`** | ⬛ MORTO_OU_ABANDONADO | Remover — duplica `RoleManagement` |
| `usePermissions` (matriz de permissões) | `src/hooks/usePermissions.ts:13-26` | **nenhum** — `ROLE_PERMISSIONS` hardcoded no TS | tabelas `permissions`/`role_permissions` = 0 | 🟨 | Permissões vivem em constante no front, não no banco; único consumidor real é `BriefingHub.tsx:22` (só `isAdmin`/`isManager`) |
| `PermissionGate` / `withPermission` | `src/components/auth/PermissionGate.tsx:19-66` | via `usePermissions` | **0 usos fora do próprio arquivo** | ⬛ | Componente inteiro nunca renderizado |
| `PermissionMatrix` (aba Permissões) | `src/components/settings/PermissionMatrix.tsx:148,228`; `src/pages/Configuracoes.tsx:183` | `permissions`, `role_permissions` | **0 / 0 linhas** | 🟨 | Tela renderiza matriz vazia |
| Tabela `roles` + `has_permission(uuid,…)` | RPC `public.has_permission(p_user_id, p_resource, p_action)` | `roles`, `user_permissions_cache` | `roles`=3, cache=0 | 🟨 | **Função quebrada**: faz `JOIN roles r ON r.id = ur.role_id`, mas `user_roles` **não tem coluna `role_id`** (colunas: id, user_id, role, created_at, updated_at). Ver Risco #2 |
| `has_permission(text,text)` (2ª sobrecarga) | RPC | `permissions` ⨝ `role_permissions` | ambas 0 linhas | 🟨 | Retorna sempre `false` |
| `has_role` / `is_admin_or_manager` / `get_user_role` | RPC SECURITY DEFINER | `user_roles` | funcionais | ✅ | Base real de quase toda a RLS |
| RLS habilitada | — | 397 tabelas | **397/397** | ✅ | — |
| Policies presentes | — | `pg_policies` | **0 tabelas sem policy** | ✅ | — |
| Feature Flags — hook | `src/hooks/useFeatureFlags.ts:42-49, 59-81` | `feature_flags` | **0 linhas** ⇒ `isEnabled()` retorna `false` para tudo | 🟨 | Nenhuma flag cadastrada |
| Feature Flags — página `/feature-flags` | `src/pages/FeatureFlagsAdmin.tsx:25,32`; rota `src/routes/AppRoutes.tsx:283` | `feature_flags` | tela vazia | 🟨 | — |
| Feature Flags — aba em Configurações | `src/components/settings/FeatureFlagsAdmin.tsx:28,33-42`; `src/pages/Configuracoes.tsx:209` | `feature_flags` | tela vazia | 🟨 | **Implementação duplicada** da página acima |
| Consumo real de flags no produto | grep `useFeatureFlag(` | — | **0 consumidores** fora do próprio admin (`src/pages/FeatureFlagsAdmin.tsx:32` usa `'experimental_ui'` só como teste) | ⬛ | Nenhuma funcionalidade está de fato atrás de flag |
| Trilha de auditoria — leitura | `src/hooks/admin/useAuditLogs.ts:34`; `src/pages/AuditLogsPage.tsx` | `audit_logs` | 6.933 linhas | ✅ | — |
| Trilha de auditoria — escrita por RPC | `src/hooks/admin/useAuditLogs.ts:59` → `rpc('log_audit_event')` | `audit_logs` | **0 linhas com `actor_email` preenchido** | 🟨 | A RPC preenche `actor_email`; nenhuma das 6.933 linhas tem — logo **a RPC nunca foi chamada em produção** |
| Trilha de auditoria — escrita por trigger | triggers `audit_sales_changes`, `audit_tasks_changes` → `handle_audit_logging()` | `audit_logs` | 6.333 `update/sales` + 600 `update/tasks` | 🟨 | Só cobre 2 tabelas e só `UPDATE`. Ver seção 3 (dado sintético) |
| Trigger `audit_trigger_func` | `clients`, `activities` | `audit_log` (singular) | 329 linhas | 🟨 | Escreve em tabela **diferente** de `audit_logs`; nenhuma UI lê `audit_log` |
| Trigger `process_audit_log` | `api_tokens` | `audit_logs` | `api_tokens` = 0 linhas | ⬛ | **Função quebrada**: insere em `audit_logs(table_name, record_id, old_data, new_data, changed_by)` — nenhuma dessas colunas existe. Ver Risco #4 |
| `cleanup_old_audit_logs` | RPC | `audit_logs` | sem agendamento verificado | 🟦 | — |
| Telemetria de erros (front) | `src/App.tsx:25` (`initErrorTracking`); `src/lib/errorTracking.ts:76` | `error_logs` | 1.208 linhas, **parado em 2026-08-04** | 🟨 | RLS: INSERT só para `anon` ⇒ usuário autenticado não consegue gravar. Ver Risco #3 |
| `SystemHealthBadge` (lê error_logs) | `src/components/atoms/SystemHealthBadge.tsx:52` | `error_logs` | lê dados congelados | 🟨 | Semáforo mostra saúde de 12 dias atrás |
| `ErrorBoundary` / `PageErrorBoundary` | `src/components/errors/ErrorBoundary.tsx:5` | `error_logs` (via captureError) | montado | ✅ | Escrita afetada pelo mesmo bloqueio de RLS |
| Telemetria de queries `/admin/telemetria` | `src/pages/AdminTelemetria.tsx:55`; rota `AppRoutes.tsx:280` | `query_telemetry` | **0 linhas** | 🟨 | Página + 4 componentes (`admin/telemetry/*`) renderizam vazio |
| Web Vitals `/admin/web-vitals` | `src/lib/webVitals.ts:5`; rota `AppRoutes.tsx:279` | `web_vitals_samples` | **0 linhas** | 🟨 | Edge `log-web-vitals` nunca gravou |
| Analytics de página | — | `page_analytics` | 75 linhas, máx **2026-08-15** | ✅ | Única fonte de telemetria viva |
| WebAuthn / Passkeys | `src/components/security/PasskeySettings.tsx`; `src/hooks/useWebAuthn.ts:30,52,78,125,143,203`; `supabase/functions/webauthn/`; `Configuracoes.tsx:169` | `webauthn_credentials`, `webauthn_challenges` | **0 / 0 linhas** | 🟨 | Fio completo (UI → hook → edge fn → tabela) mas **zero passkeys registradas** |
| MFA TOTP | `src/components/security/MFASetup.tsx:92`, `MFATotpTab.tsx`, `MFAVerification.tsx`, `src/hooks/useMFA.ts` | `user_mfa_settings`, `mfa_verification_attempts` | **0 / 0 linhas** | ⬛ | `MFASetup` e `MFAVerification` têm **0 imports** em todo o `src/`; não estão em nenhuma rota nem no fluxo de login |
| Alerta de novo dispositivo | `supabase/functions/new-device-alert/index.ts` | `known_devices` | **0 linhas** | ⬛ | **Nenhum chamador**: a string `new-device-alert` só aparece em si mesma e num comentário em `supabase/functions/send-push-notification/index.ts:51` |
| `KnownDevices` (UI) | `src/components/security/KnownDevices.tsx` | `known_devices` | 0 linhas | ⬛ | 0 imports |
| Sessões ativas | `src/components/security/SessionManager.tsx` | `active_sessions`, `session_activity` | **0 / 0 linhas** | ⬛ | 0 imports |
| IPs bloqueados | `src/components/security/BlockedIPsPanel.tsx` | `blocked_ips` | 0 linhas | ⬛ | 0 imports |
| Whitelist de IP | `src/components/security/IPWhitelistManager.tsx:128`; `Configuracoes.tsx:187` | `ip_whitelist` | **0 linhas** | 🟨 | Montado, mas nunca usado; `IPWhitelistPanel.tsx` é um 3º componente órfão |
| Geo-blocking | `src/components/security/GeoBlockingManager.tsx`; `Configuracoes.tsx:191`; `GeoBlockingMap` em `src/pages/SecurityDashboard.tsx:119` | `geo_blocked_regions`, `geo_access_logs` | **0 / 0 linhas** | 🟨 | Sem regra cadastrada |
| Dashboard de rate limit | `src/components/security/RateLimitDashboard.tsx:50` | `rate_limit_logs`, `rate_limit_settings` | **0 / 0 linhas** | ⬛ | 0 imports; tabelas sem nenhuma policy de INSERT (só service_role escreve) e ninguém escreve |
| Aprovação de reset de senha | `src/components/security/PasswordResetApproval.tsx:31,41`; `Configuracoes.tsx:195`; edge `send-password-reset` | `password_reset_requests` | **0 linhas** | 🟨 | Fluxo montado, nunca exercido |
| Re-autenticação sensível | `src/components/security/ReauthDialog.tsx`, `src/hooks/useReauthentication.ts` | — | — | ⬛ | 0 imports |
| Push notifications (segurança) | `src/components/security/PushNotificationSettings.tsx` | `push_subscriptions` | 0 linhas | ⬛ | 0 imports |
| Alertas de segurança (config/histórico) | `src/components/settings/SecurityAlertSettings.tsx`, `SecurityAlertHistory.tsx`; `Configuracoes.tsx:199-200` | `security_alert_settings`, `security_alert_history` | **0 / 0 linhas** | 🟨 | — |
| Som de alerta de segurança | `src/hooks/useSecurityAlertSoundSettings.ts:23-25`; `LayoutRealtimeEffects.tsx:5` | `localStorage` (sem banco) | ativo | ✅ | — |
| Logs de acesso negado (UI + alerta) | `src/components/settings/AccessDeniedLogs.tsx:45` → edge `access-denied-alerts`; `Configuracoes.tsx:201` | `access_denied_logs` | 4 linhas | ✅ | — |
| `SecurityDashboard` `/seguranca` | `src/pages/SecurityDashboard.tsx:119`; rota `AppRoutes.tsx:284` | `security_events`, `blocked_ips`, `geo_*` | todas **0 linhas** | 🟨 | Painel inteiro renderiza zeros |
| `AdminSecurityPanel` no dashboard | `src/components/admin/AdminSecurityPanel.tsx:40`; `src/pages/AdminDashboard.tsx:144`; `src/hooks/admin/useAdminStats.ts:21,101` | `access_denied_logs`, `security_events` | 4 / 0 | ✅ | Renderiza com dado real (parcial) |
| Circuit breaker (debug) | `src/components/debug/CircuitBreakerDashboard.tsx`; `AdminDashboard.tsx:171` e `Configuracoes.tsx:205` | `circuit_breaker_state` (**tabela não existe**) | — | 🟨 | Montado em 2 lugares; objeto de banco ausente |
| Simulação de webhook / quality report | `src/components/debug/WebhookSimulationPanel.tsx`, `QualityReportView.tsx`; `src/pages/WebhooksPage.tsx:159-160` | — | montados | ✅ | — |
| Config. de DB externo | `src/components/admin/ExternalDBSettings.tsx`; `AdminDashboard.tsx:172`, `SupabaseConnectionsTab.tsx:31` | `channel_credentials` | montado | ✅ | — |
| Atalhos de teclado + HUD | `src/App.tsx:107`; `src/components/keyboard/KeyboardShortcutsProvider.tsx:233` | — | montado globalmente | ✅ | — |
| Skip links (a11y) | `src/components/templates/MainLayout.tsx:93` | — | montado | ✅ | — |
| `FocusTrap` (a11y) | `src/components/ui/enhanced-select.tsx:210` | — | usado | ✅ | — |
| `LiveRegion` (a11y) | `src/components/accessibility/LiveRegion.tsx` | — | só exportado no barrel `index.ts` | 🟦 | Sem consumidor real |
| Filtros salvos | `src/components/filters/SavedFiltersBar.tsx`; `src/pages/Vendas.tsx:226`, `QuoteCadenceFilters.tsx:83` | localStorage | usado | ✅ | — |
| `LazyVisible` (common) | `src/components/common/LazyVisible.tsx` | — | — | ✅ | — |
| Cards de perfil | `src/components/profile/MyRaceCarMiniCard.tsx` ← `GamifiedProfile.tsx:105` | — | usado | ✅ | `ProfilePerformanceCard.tsx` tem **0 imports** ⬛ |
| Migração SEC-08 (service_role) | `supabase/functions/_shared/auth-client.ts` (existe, 3.5 KB) | — | 138/168 fns ainda com key crua; 5 com `getServiceClient`; 19 com `getUserClient` | 🟦 | Ver seção 4 |

---

## 2. RISCOS DE SEGURANÇA (ordenados por gravidade)

### 🔴 CRÍTICO 1 — 12 tabelas de negócio legíveis por `anon` (chave pública)

Não há tabela **sem RLS** e não há tabela **com RLS sem policy** — mas há policies `PERMISSIVE` atribuídas ao role `public` (que inclui `anon`) com predicado que resolve sempre para verdadeiro. Combinadas ao `GRANT SELECT` para `anon` (verificado em `information_schema.role_table_grants`), qualquer portador da chave anônima lê a tabela inteira sem autenticar.

| Tabela | Policy | `qual` | GRANT SELECT p/ anon | Linhas expostas |
|---|---|---|---|---|
| `clients` | `Users can view active clients` | `(deleted_at IS NULL) AND true` | ✅ | **100** |
| `activities` | `Users can view active activities` | `(deleted_at IS NULL) AND true` | ✅ | **2.228** |
| `products` | `Users can view active products` | `(deleted_at IS NULL) AND true` | ✅ | 17 |
| `suppliers` | `Users can view active suppliers` | `(deleted_at IS NULL) AND true` | ✅ | 6 |
| `teams` | `Users can view active teams` | `(deleted_at IS NULL) AND true` | ✅ | 3 |
| `entity_versions` | `Users can view versions` | `true` | ✅ | 0 |
| `salesperson_xp` | `Users can view their own XP` | `true` | ✅ | 0 |
| `follow_up_settings` | `Anyone can read follow_up_settings` | `true` | ✅ | 0 |
| `follow_up_templates` | `Users can view active templates` | `(is_active = true)` | ✅ | 0 |
| `cadence_alert_templates` | `Public read for alert templates` | `true` | ✅ | — |
| `cadence_funnel_rules` | `Everyone can view funnel rules` | `true` | ✅ | — |
| `cadence_outcome_rules` | `Public read for outcome rules` | `true` | ✅ | — |
| `expansion_playbooks` | `cs_ep_select` | `true` | ✅ | — |

Impacto: base de **100 clientes** e **2.228 atividades comerciais** (nomes, contatos, histórico) acessível sem login. Correção: trocar `TO public` por `TO authenticated` e substituir `true` por predicado real de posse/portfólio.

### 🔴 CRÍTICO 2 — `has_permission(uuid, text, text)` está quebrada e governa a RLS de `clients`

```sql
-- public.has_permission(p_user_id uuid, p_resource text, p_action text)
FROM user_roles ur
JOIN roles r ON r.id = ur.role_id   -- ❌ user_roles NÃO tem coluna role_id
```
Colunas reais de `user_roles`: `id, user_id, role, created_at, updated_at` (verificado em `information_schema.columns`).

4 policies de `clients` dependem dessa função (`Users can read/create/update/delete clients if has permission`). São `PERMISSIVE`, então o acesso hoje vem de outras policies — mas qualquer endurecimento que remova as policies redundantes derruba a tabela, e o "modelo de permissão por recurso" anunciado **nunca funcionou**.

### 🟠 ALTO 3 — Policies `anon-only` que impedem gravação por usuário logado (telemetria e rate-limit silenciosamente mortos)

| Tabela | Policies existentes | Consequência medida |
|---|---|---|
| `error_logs` | INSERT **apenas** `TO anon`; 2 policies de SELECT para admin | Usuário autenticado não grava. Última linha: **2026-08-04**, embora `page_analytics` registre uso até **2026-08-15** |
| `login_attempts` | INSERT `TO anon WITH CHECK true`; SELECT `TO anon USING true` | Login **bem-sucedido** (já autenticado) nunca é gravado ⇒ **0 linhas**. Pior: admin autenticado **não consegue ler** a tabela (não há policy para `authenticated`) |

`login_attempts` também é **legível por `anon` sem restrição** (`qual = true`, colunas `email, ip_address, user_agent, failure_reason`) — enumeração de e-mails e IPs assim que a tabela receber dados.

### 🟠 ALTO 4 — Triggers de auditoria quebrados

- `process_audit_log()` (trigger `trg_audit_api_tokens` em `api_tokens`) insere em `audit_logs(table_name, record_id, action, old_data, new_data, changed_by)`. **Nenhuma dessas colunas existe** — as reais são `actor_id, actor_email, action, entity_type, entity_id, changes, ip_address, user_agent, metadata`. Qualquer INSERT/UPDATE/DELETE em `api_tokens` aborta com erro. Hoje não explode porque `api_tokens` tem 0 linhas.
- `log_audit_event()` (versão trigger) insere em `audit_log` com `resource_type/resource_id` — colunas que também não batem.
- Existem **duas** tabelas de auditoria (`audit_logs` 6.933 e `audit_log` 329) alimentadas por **três** funções diferentes; nenhuma UI lê `audit_log`.

### 🟡 MÉDIO 5 — 96 tabelas legíveis por qualquer usuário autenticado (`qual = true`)

96 tabelas têm policy `SELECT ... TO authenticated USING (true)`, incluindo `commercial_approval_requests`, `webhook_inbound_log`, `executive_briefings`, `deal_probability_scores`, `forecast_snapshots`, `nps_surveys`, `sales_territories`. Com apenas 3 papéis e nenhuma segmentação por vendedor, qualquer `salesperson` lê o pipeline e as previsões de todos.

### 🟡 MÉDIO 6 — SEC-08 (service_role) essencialmente não executado

`docs/SEC-08_SERVICE_ROLE_AUDIT.md` afirma helper pronto e ~50 funções priorizadas para migração. Medição:

| Alegação do doc | Realidade medida |
|---|---|
| Helper `_shared/auth-client.ts` ✅ | ✅ existe (3.499 bytes) |
| "~122 funções usam service_role" | **138 de 168** ainda usam `SUPABASE_SERVICE_ROLE_KEY` diretamente |
| `getServiceClient` com justificativa obrigatória | **5** funções adotaram |
| Migração para `getUserClient` | **19** funções |
| Canário via flag `USE_USER_CLIENT_${FN_NAME}` | **string não existe em lugar nenhum do repositório** |

### 🟡 MÉDIO 7 — Governança de papéis inconsistente

- `roles.name` = `admin | manager | **seller**`, enquanto o enum `app_role` usa `**salesperson**`. As duas fontes nunca se cruzam.
- `usePermissions.ts:13-26` hardcoda a matriz de permissões no bundle do front — alterar permissão exige deploy, e `permissions`/`role_permissions` (as tabelas que a tela `PermissionMatrix` mostra) estão vazias.
- `useUserRoles.ts:62-81`: se não há linha em `user_roles`, o front **inventa** um papel `salesperson` a partir de `salespeople`. A RLS do banco não honra isso ⇒ UI mostra telas que as queries negam.
- `useUserRoles.ts:47-54` escolhe o papel por `order("role").limit(1)`, dependendo da ordem de declaração do enum para que "admin vença". A RPC `get_user_role` usa `CASE` explícito — as duas lógicas podem divergir se o enum mudar.
- `error_logs` tem duas policies de SELECT contraditórias (`is_admin_or_manager` e `has_role(admin)`); sendo `PERMISSIVE`, manager lê.

### 🟢 BAIXO 8 — Superfície morta de segurança

11 componentes de segurança/auth com **zero imports** em todo o `src/`: `RoleManager`, `SessionManager`, `MFASetup`, `MFAVerification`, `KnownDevices`, `BlockedIPsPanel`, `IPWhitelistPanel`, `RateLimitDashboard`, `ReauthDialog`, `PushNotificationSettings`, `PermissionGate`. Somam ~1.500 linhas que aparentam cobertura de segurança inexistente. Idem para a edge function `new-device-alert` (sem chamador).

---

## 3. Dado fictício / sintético em campos de auditoria

`audit_logs` (6.933 linhas) é **100% gerado por trigger em carga de seed**, não por atividade humana:

| Evidência | Medição |
|---|---|
| `actor_email` preenchido | **0 de 6.933** — a única função que preenche esse campo (`log_audit_event(text,text,…)`) nunca foi executada |
| Variedade de `action` | **1 valor**: `update` |
| Variedade de `entity_type` | **2 valores**: `sales` (6.333) e `tasks` (600) |
| Distribuição temporal | 4.713 em **2026-08-13**, 1.908 em **2026-08-14**, 300 em 2026-07-12, 12 em 2026-08-04 — rajadas de carga, não uso diário |
| Ações administrativas (mudança de papel, toggle de flag, bloqueio de IP) | **0 registros** |

Ou seja: **o log de auditoria não está sendo alimentado hoje** por nenhuma ação de usuário. Última escrita: 2026-08-14 (2 dias antes desta medição), e mesmo essa veio de trigger sobre `sales`/`tasks`.

`error_logs` contém referências a domínio de desenvolvimento no campo `component` (ex.: `at CreateSaleDialog (https://37bc969b-…lovableproject.com/src/components/sales/CreateSaleDialog.tsx:56:29)`) — logs de ambiente Lovable preview, não de produção.

---

## 4. Contagem por classificação

Total de funcionalidades avaliadas nesta fatia: **52**

| Classificação | Qtde | % |
|---|---|---|
| ✅ IMPLEMENTADO_TOTAL | **20 / 52** | 38% |
| 🟨 PARCIAL | **19 / 52** | 37% |
| 🟦 SUGERIDO_OU_INICIADO | **3 / 52** | 6% |
| ⬛ MORTO_OU_ABANDONADO | **10 / 52** | 19% |

Recorte por subdomínio:

| Subdomínio | ✅ | 🟨 | 🟦 | ⬛ |
|---|---|---|---|---|
| Autenticação / RBAC | 6 | 4 | 1 | 2 |
| RLS | 2 | 0 | 0 | 0 |
| Feature Flags | 0 | 3 | 0 | 1 |
| Auditoria | 2 | 3 | 1 | 1 |
| Telemetria | 2 | 4 | 0 | 0 |
| Segurança avançada (MFA/IP/Geo/Sessão) | 3 | 5 | 0 | 6 |
| Admin / debug / a11y / UX | 5 | 0 | 1 | 0 |

---

## 5. O que NÃO foi possível verificar

1. **Configuração do provedor Google OAuth** — o painel Auth do Supabase não é acessível por SQL; `auth.identities` não foi consultada por não estar no escopo autorizado de queries. Não há login OAuth em `auth.users`.
2. **Se as edge functions estão de fato deployadas** — as ferramentas MCP autorizadas para esta auditoria são apenas `db_query`, `db_list_policies` e `db_list_tables`. A existência de `supabase/functions/<nome>/index.ts` prova código, não deploy.
3. **`verify_jwt` por função** — `supabase/config.toml` não declara blocos `[functions.<nome>]` para `webauthn`, `new-device-alert`, `access-denied-alerts`, `send-password-reset` nem `get-client-ip`. O default do projeto não foi lido.
4. **Segredos** — apenas nomes observados no código (`RESEND_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`, `VITE_SUPABASE_PUBLISHABLE_KEY`). Nenhum valor lido ou impresso, por regra do escopo.
5. **Agendamentos `pg_cron`** — não consultei `cron.job`; não é possível afirmar se `cleanup_old_audit_logs` ou os alertadores rodam.
6. **Exploração ativa da exposição `anon`** — o Risco #1 foi comprovado por policy + GRANT (evidência estrutural). Não executei requisição real com a chave anônima (fora do mandato de somente-leitura via MCP).
7. **`circuit_breaker_state`** — `CircuitBreakerDashboard` está montado em dois lugares, mas não localizei o objeto de banco correspondente; a tabela não existe em `public`. Não rastreei se ele consome RPC em vez de tabela.
8. **Conteúdo de `changes`/`metadata` das 6.933 linhas de `audit_logs`** — inspecionei agregados (`actor_email`, `action`, `entity_type`, distribuição diária), não o payload linha a linha.
