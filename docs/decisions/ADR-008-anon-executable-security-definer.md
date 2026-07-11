# ADR-008: SECURITY DEFINER funções executáveis por `anon`

**Data:** 2026-07-11  
**Status:** Aceito  
**Sub-agente:** 🔍 Code Auditor + 🗄️ Supabase Engineer

## Contexto

O linter Supabase (`0028_anon_security_definer_function_executable`) emite `WARN` para toda função `SECURITY DEFINER` no schema `public` com `EXECUTE` concedido a `anon`. Após a auditoria SEC-05 restaram **11 funções** nesta categoria — todas envolvidas em fluxos **pré-autenticação**:

| Função | Motivo do acesso `anon` |
|---|---|
| `check_rate_limit`, `log_rate_limit` | Rate-limit em `/auth/login` antes do JWT existir |
| `count_failed_login_attempts` | Bloqueio progressivo de brute-force |
| `count_reset_requests_24h`, `has_pending_reset_request` | Fluxo "esqueci minha senha" |
| `generate_device_fingerprint` | Trusted-device na tela de login |
| `get_embedded_report_by_token` | Relatórios embed via token opaco (não usam sessão) |
| `is_authenticated` | Helper puro, retorna `auth.uid() IS NOT NULL` |
| `is_country_blocked`, `is_ip_blocked`, `is_ip_whitelisted` | Geo/IP gating antes da tela de login |

## Decisão

Manter `EXECUTE` para `anon` nas 11 funções acima. Cada uma:

1. Possui `SET search_path = public` (evita search-path hijack).
2. Não retorna dados de outros usuários — apenas contadores agregados, booleanos ou tokens já validados.
3. Está protegida por rate-limit em nível de edge (`_shared/rate-limit.ts`) quando faz escrita.

O warning é **aceito como falso-positivo** — o linter não distingue "função sensível" de "helper pré-auth necessário".

## Regra para novas funções

Qualquer nova `SECURITY DEFINER` no schema `public` deve, por padrão:

```sql
REVOKE EXECUTE ON FUNCTION public.<fn> FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.<fn> TO authenticated;
```

Só conceder `anon` se o caso de uso for **estritamente pré-login** e passar por revisão listada aqui.

## Consequências

- **Score do linter:** 0 `ERROR`, 130 `WARN` (todos categorizados: 11 anon-pré-auth + 119 `authenticated`-only já auditados na wave 4).
- **CI:** o job `enterprise-quality` ignora `0028` para essas 11 funções via allowlist em `scripts/ci-check-forbidden.sh`.
