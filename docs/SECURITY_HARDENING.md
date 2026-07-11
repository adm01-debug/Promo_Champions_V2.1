# Hardening de Segurança — SECURITY DEFINER, RLS, Edge Functions & WAL

> Aplicado nas Etapas SEC-01, SEC-02, SEC-03 e PERF-01 (2026-07-11).
> Fonte de verdade: migração `20260711134320_*.sql` + views `v_security_definer_exposure` e `v_platform_wal_health`.

---

## 1. Modelo de autorização — Roles

| Role            | Origem                        | Uso                                          |
| --------------- | ----------------------------- | -------------------------------------------- |
| `service_role`  | Chave do backend / edge fns   | Bypass total (uso interno)                   |
| `authenticated` | Usuários logados via Supabase | Chamadas RPC + acesso a tabelas via RLS      |
| `anon`          | Sessão não autenticada        | Apenas fluxos pré-login (rate limit, health) |

`admin`, `manager` e `salesperson` são **roles de aplicação** persistidas em `public.user_roles` e verificadas por `has_role(uid, role)` (SECURITY DEFINER, `search_path=public`). Não confundir com roles do Postgres.

---

## 2. Matriz esperada de EXECUTE em `SECURITY DEFINER` (149 funções)

Após a migração de hardening, todas as funções `SECURITY DEFINER` do schema `public` têm `EXECUTE` **revogado de PUBLIC / anon / authenticated** e regrantado seletivamente:

| Categoria    | Qtd | EXECUTE granted para                        | Exemplos                                                    |
| ------------ | --- | ------------------------------------------- | ----------------------------------------------------------- |
| **Internal** | 29  | `service_role` (+ postgres, sandbox)        | `fn_cleanup_webhook_dedupe`, `fn_auto_map_inbound_seller`, `enqueue_v4_callback`, `backfill_orders_conversion_seq` |
| **User**     | 113 | `authenticated` + `service_role`            | `fn_convert_quote_to_sale`, `award_salesperson_xp`, `get_detailed_kpis`, `fn_admin_wal_health` |
| **Public**   | 11  | `anon` + `authenticated` + `service_role`   | `check_rate_limit`, `count_failed_login_attempts`, `count_reset_requests_24h`, `generate_device_fingerprint` |

> Funções `fn_admin_*` são **granted para `authenticated`** mas verificam `has_role(auth.uid(),'admin')` internamente. O fallback in-function evita depender de grant granular por role de aplicação.

Ver relação completa (sempre atualizada) via:

```sql
SELECT category, count(*) FROM public.v_security_definer_exposure GROUP BY category;
SELECT * FROM public.v_security_definer_exposure ORDER BY category, function_name;
```

Ou pela RPC restrita a admin:

```ts
const { data } = await supabase.rpc('fn_admin_security_definer_exposure');
```

Colunas úteis:
- `function_name` — nome da função
- `category` — `internal` | `user` | `public`
- `granted_roles` — array com roles Postgres que possuem EXECUTE
- `has_search_path` — bool; alertar se `false`
- `is_defined_admin_only` — bool; `true` se a função checa `has_role(_,'admin')` no corpo

---

## 3. Autorização esperada por role de aplicação

| Ação                                                | admin | manager | salesperson | anon |
| --------------------------------------------------- | :---: | :-----: | :---------: | :--: |
| `fn_convert_quote_to_sale(quote_id)`                |  ✅   |   ✅    |     ✅      |  ❌  |
| `fn_admin_security_definer_exposure()`              |  ✅   |   ❌    |     ❌      |  ❌  |
| `fn_admin_wal_health()`                             |  ✅   |   ❌    |     ❌      |  ❌  |
| `fn_backfill_orders_conversion_seq()` (internal)    |  ❌*  |   ❌    |     ❌      |  ❌  |
| `fn_cleanup_webhook_dedupe()` (internal)            |  ❌*  |   ❌    |     ❌      |  ❌  |
| `check_rate_limit(key, limit, window)`              |  ✅   |   ✅    |     ✅      |  ✅  |
| `count_failed_login_attempts(email)`                |  ✅   |   ✅    |     ✅      |  ✅  |
| `award_salesperson_xp(...)`                         |  ✅   |   ✅    |     ✅      |  ❌  |
| SELECT em `user_roles`                              |  ✅   |   ❌    |     ❌      |  ❌  |
| INSERT/UPDATE em `user_roles`                       |  ✅   |   ❌    |     ❌      |  ❌  |

`❌*` = admin da aplicação **não** executa funções `internal` via Data API. Essas funções só rodam via `service_role` (edge functions, cron jobs). Isso é intencional — reduz superfície e evita que credenciais de admin comprometidas apaguem dados operacionais.

---

## 4. Edge Functions — SEC-03

### `receive-quote-sync` — dois fluxos, um endpoint

| Fluxo         | Autenticação                         | Validação                                        |
| ------------- | ------------------------------------ | ------------------------------------------------ |
| **V4 legado** | `QUOTE_SYNC_WEBHOOK_SECRET` no body  | `correlation_key` obrigatório, dedupe idempotente |
| **PromoGifts** | HMAC-SHA256 via `x-webhook-signature` | Header + body verificados; `PROMOGIFTS_WEBHOOK_SECRET` |

**Dedup:** ambos fluxos consultam `public.webhook_inbound_dedupe` por `correlation_key`. Reentrada com mesma chave → status `duplicate_ignored` (HTTP 200).

**Testes** — `supabase/functions/receive-quote-sync/index.test.ts`:
- GET não permitido
- Body inválido → 400
- Sem `x-webhook-signature` (fluxo PromoGifts) → 401
- Signature inválida → 401
- V4 sem `correlation_key` → 400

### `log-web-vitals`
`verify_jwt = false`. Recebe métricas anônimas. Validação:
- Body deve ser JSON `{ metric, value, id, ...}` (schema Zod)
- Rate limiting via `check_rate_limit(ip, 60, 60)` (60 req/min por IP)

### Convenção geral
Todas as edges (exceto webhooks públicos) validam JWT via `getClaims()` conforme padrão descrito em `_shared/`. Endpoints públicos:
- Validam assinatura ou usam rate limit
- Não retornam dados sensíveis
- Usam Zod para input

---

## 5. RLS — cenários cobertos por teste

`tests/e2e/rls-authorization-edge-cases.spec.ts` valida, com anon key:

1. `SELECT *` cru em tabelas sensíveis (`user_roles`, `api_tokens`, `salespeople`, `user_mfa_settings`, `user_sms_settings`, `user_sessions`, `webhook_inbound_dedupe`, `quote_sync_inbound_log`) → **0 linhas** ou 401/403/404.
2. Filtro `user_id=eq.<uuid_fabricado>` → **0 linhas**.
3. `apikey` ausente → 401.
4. `apikey` inválida → 401.
5. Filtro `IN (<uuids fabricados>)` em `salespeople` → **0 linhas**.

Rodar:
```bash
npx playwright test tests/e2e/rls-authorization-edge-cases.spec.ts
npx playwright test tests/e2e/security-definer-rpc-access.spec.ts
```

O segundo spec enumera **todas** as 149 funções via `pg_proc`, classifica e faz uma chamada HTTP por função — falha se qualquer `internal`/`user` responder 200 para anon.

---

## 6. PERF-01 — Alertas de WAL / replicação

### View `v_platform_wal_health`
Colunas:
- `active_slots` — número de replication slots ativos
- `max_slot_lag_bytes` — maior lag entre slots (bytes)
- `wal_size_bytes` — tamanho total do WAL em disco
- `long_running_tx` — transações abertas há > 5 min
- `oldest_tx_age_seconds`
- `checked_at`

### Endpoint admin
```ts
const { data } = await supabase.rpc('fn_admin_wal_health');
// { active_slots: 2, max_slot_lag_bytes: 139264, ... }
```

### Edge function `wal-health-alert`
Dispara Slack quando qualquer gatilho é atingido:

| Métrica              | Default | Env override                 |
| -------------------- | ------- | ---------------------------- |
| `max_slot_lag_bytes` | 64 MiB  | `WAL_MAX_SLOT_LAG_BYTES`     |
| `wal_size_bytes`     | 500 MiB | `WAL_SIZE_ALERT_BYTES`       |
| `long_running_tx`    | > 0     | — (sempre alerta)            |

Requer secret `SLACK_WEBHOOK_URL`. Se ausente, a função retorna 503 com dica de setup em vez de silenciar.

**Agendamento sugerido** (a cada 5 min):
```sql
select cron.schedule(
  'wal-health-alert',
  '*/5 * * * *',
  $$select net.http_post(
    url:='https://<project>.functions.supabase.co/wal-health-alert',
    headers:='{"Authorization":"Bearer <SERVICE_ROLE>"}'::jsonb
  );$$
);
```

Alternativa: hooking em Grafana / Datadog / PagerDuty — basta trocar `postSlack` por um POST no destino escolhido. A função foi mantida provider-agnostic (JSON simples com `text` + `blocks`).

---

## 7. Como interpretar `v_security_definer_exposure`

| Sinal                              | Ação                                                             |
| ---------------------------------- | ---------------------------------------------------------------- |
| `category='internal'` e `granted_roles && ARRAY['anon','authenticated']` | **BUG** — abrir migração de correção imediatamente. |
| `has_search_path=false`            | Adicionar `SET search_path = public` no `CREATE OR REPLACE`.     |
| `is_defined_admin_only=true` mas `category='public'` | Revogar `anon`/`authenticated`; a checagem interna existe mas o grant amplia superfície. |
| Nova função aparece sem categoria clara | Rodar `SELECT * FROM v_security_definer_exposure WHERE function_name='...'` e ajustar grants na próxima migração. |

**Regra de ouro:** `EXECUTE ON FUNCTION public.<x> TO authenticated` só é aceitável se a função **valida `auth.uid()`** ou se o efeito colateral é seguro para qualquer usuário logado.

---

## 8. Checklist para novas funções `SECURITY DEFINER`

1. [ ] `SET search_path = public` explícito.
2. [ ] `REVOKE EXECUTE ... FROM PUBLIC, anon, authenticated` na criação.
3. [ ] `GRANT EXECUTE ... TO <role mínima>` — preferir `service_role` para tudo que não seja chamado pelo cliente.
4. [ ] Se granted para `authenticated`, primeira linha valida `auth.uid() IS NOT NULL` e (quando aplicável) `has_role(auth.uid(), '<role>')`.
5. [ ] Migração inclui `COMMENT ON FUNCTION` documentando a role esperada.
6. [ ] Adicionar cenário em `tests/e2e/security-definer-rpc-access.spec.ts` (a menos que a nova função já se encaixe em uma categoria existente — o spec enumera automaticamente).

---

## 9. Referências rápidas

- Migração de hardening: `supabase/migrations/20260711134320_f46c46d9-*.sql`
- View auditoria: `public.v_security_definer_exposure`
- RPC admin: `fn_admin_security_definer_exposure()`, `fn_admin_wal_health()`
- Testes: `tests/e2e/security-definer-rpc-access.spec.ts`, `tests/e2e/rls-authorization-edge-cases.spec.ts`, `supabase/functions/receive-quote-sync/index.test.ts`
- Edge alerta: `supabase/functions/wal-health-alert/index.ts`
- ADR relacionado: `docs/decisions/ADR-003-supabase-rls-security.md`
