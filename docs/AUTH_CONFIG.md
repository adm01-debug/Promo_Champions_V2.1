# Checklist — Configuração server-side do Supabase Auth

Configurações do GoTrue que **não vivem no código** — são ajustadas no dashboard
do Supabase. Conferir periodicamente (sugestão: a cada release e após qualquer
mudança de auth).

Projeto: `usyxfpqlsspldubptrdl`
Dashboard: https://supabase.com/dashboard/project/usyxfpqlsspldubptrdl

## Tokens e sessões

| Item | Onde conferir | Valor recomendado |
| --- | --- | --- |
| Expiração do JWT | Authentication → Sign In / Providers → seção "JWT" (`jwt_expiry`) | **≤ 3600 s** (1 h). Tokens curtos limitam a janela de abuso se um access token vazar. |
| Refresh token rotation | Authentication → Sign In / Providers → "Refresh Tokens" | **ON**. Cada refresh emite um novo token e invalida o anterior. |
| Reuse interval | Authentication → Sign In / Providers → "Refresh Tokens" → "Reuse Interval" | **~10 s**. Janela curta para tolerar retries de rede sem abrir brecha de replay; valores altos facilitam reuso de token roubado. |
| Revogação de sessões | — | Já no código: "Encerrar outras" usa `signOut({ scope: 'others' })` e "Encerrar todas" usa `scope: 'global'` (ver `src/hooks/useSessionManagement.ts`). |

## Senhas

| Item | Onde conferir | Valor recomendado |
| --- | --- | --- |
| Comprimento mínimo | Authentication → Sign In / Providers → Email → "Password minimum length" | **≥ 8** |
| Requisitos de complexidade | Authentication → Sign In / Providers → Email → "Password requirements" | Letras + números (ou a opção mais forte disponível) |
| Have I Been Pwned | Authentication → Sign In / Providers → Email → "Prevent use of leaked passwords" (`password_hibp_enabled`) | **ON** (`true`) — bloqueia senhas já vazadas em breaches |

## Rate limits do Auth (anti-abuse)

| Item | Onde conferir | Valor recomendado |
| --- | --- | --- |
| Login / token | Authentication → Rate Limits → `/auth/v1/token` | **ON** — ~30 req/5 min por IP+email (padrão Supabase é por hora; endurecer para travar brute-force de senha) |
| Verificação / OTP | Authentication → Rate Limits → `/auth/v1/verify` | **ON** — limite baixo (verificação é rara por usuário) |
| Sign up | Authentication → Rate Limits → sign-ups | **ON** — evita criação de contas em massa |
| Recovery | Authentication → Rate Limits → password recovery | **ON** — `send-password-reset` também tem rate limit próprio (20 req/min por admin, em código) |

## Proteção de bots

| Item | Onde conferir | Valor recomendado |
| --- | --- | --- |
| CAPTCHA em sign-in / sign-up | Authentication → Sign In / Providers → "Bot and Abuse Protection" (hCaptcha/Turnstile) | **ON** — requer a secret do provider configurada e a chave site no frontend |

## E-mail (SMTP)

| Item | Onde conferir | Valor recomendado |
| --- | --- | --- |
| SMTP custom | Project Settings → Authentication → SMTP Settings | **SMTP próprio (Resend)** em vez do SMTP compartilhado do Supabase — o default tem limite baixo e entrega inconsistente |
| Domínio do remetente | Resend dashboard → Domains | `promobrindes.com.br` verificado (SPF/DKIM), não `onboarding@resend.dev` |
| Template de recovery | Authentication → Email Templates → "Reset Password" | `redirectTo` apontando para `https://<dominio-app>/reset-password` |

## Rotação e auditoria

- Rotação das chaves `anon`/`service_role` e secrets de edge functions:
  ver `docs/SECRETS_ROTATION.md`.
- Headers de segurança do hosting e das respostas HTML das edge functions:
  ver `docs/SECURITY_HEADERS.md`.
