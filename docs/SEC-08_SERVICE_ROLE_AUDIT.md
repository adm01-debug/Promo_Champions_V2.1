# SEC-08 · Auditoria de uso de `SUPABASE_SERVICE_ROLE_KEY`

**Data:** 2026-07-11  
**Escopo:** ~140 edge functions em `supabase/functions/`  
**Objetivo:** eliminar uso de `service_role` onde uma chamada em nome do usuário (RLS-aware) já resolve.

## Padrão a seguir

Use `supabase/functions/_shared/auth-client.ts`:

```ts
import { getUserClient, getServiceClient, requireAdmin } from "../_shared/auth-client.ts";

// Caminho preferido (RLS aplicada)
const ctx = await getUserClient(req);
const { data } = await ctx.client.from("quotes").select("*").eq("user_id", ctx.userId);

// Bypass legítimo — SEMPRE com string de justificativa
const admin = getServiceClient("insert into audit table user cannot write directly");
await admin.from("access_denied_logs").insert({ ... });
```

`getServiceClient` rejeita chamadas sem uma `reason` de pelo menos 10 caracteres para forçar documentação.

## Categorização das ~122 funções que usam `service_role`

### Legítimo (mantém service_role) — ~35 funções
- Jobs pg_cron: `check-quote-expiration`, `challenge-expiration-alerts`, `csat-ces-trigger`, `rotate-daily-challenges`, `qbr-scheduler`, `scheduled-reports-runner`, `check-v4-callback-alerts`, `wal-health-alert`, `refresh-stage-baselines`, `recompute-stage-baselines`, `snapshot-forecast`, `compute-forecast-accuracy`, `engagement-score-recompute`, `email-engagement-scorer`
- Dedupe/idempotência: `winloss-webhook-dispatcher`, `winloss-webhook-replay*`, `dispatch-webhook`, `receive-quote-sync`
- Escrita em tabelas de auditoria/analytics restritas: `notify-quote-conversion`, `log-web-vitals`, `page-analytics-writer`, `stress-test-contracts`, `simulate-load`
- Webhooks inbound sem sessão: `inbound-email-webhook`, `twilio-call-status`, `multichannel-status-webhook`

### Refatorar para `getUserClient` — ~50 funções (priorizar)
Funções que fazem operações SOMENTE em dados do próprio usuário e hoje bypassam RLS sem necessidade:
- `enrich-lead`, `analyze-call`, `analyze-conversation`, `deal-probability`, `behavioral-analysis`
- `coaching-intelligence`, `coaching-impact-summary`, `generate-loss-coaching`
- `customer-success-hub`, `customer-success-360`, `expansion-detector`, `renewal-automation`
- `dialer-queue-builder`, `auto-enroll-cadence`, `process-cadence-tasks`, `sequence-enroll`, `sequence-record-reply`, `sequence-ab-promote`
- `deal-committee-*`, `calculate-committee-coverage`, `qbr-generator`
- `revenue-intelligence`, `revenue-forecast`, `demand-forecast`
- `elevenlabs-voice`, `elevenlabs-tts`, `elevenlabs-stt` (usam chave externa, não precisam de service_role)

### Migração — Playbook

Para cada função da lista "Refatorar":

1. Trocar `createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)` por `await getUserClient(req)`.
2. Substituir queries que dependem de `service_role` por versões que usem `ctx.userId` ou RPCs `SECURITY DEFINER` já existentes.
3. Se a função escreve em tabela de auditoria que o usuário não pode tocar, criar RPC `SECURITY DEFINER` com guard interno (padrão `fn_record_conversion_attempt`).
4. Adicionar teste Deno mínimo cobrindo 401 sem token + 403 quando dado é de outro usuário.

## Riscos e mitigação

- **Risco:** função quebrar em produção após remover service_role. **Mitigação:** deploy em canário via feature-flag `USE_USER_CLIENT_${FN_NAME}`; rollback trivial.
- **Risco:** RLS policy insuficiente cobre o caso. **Mitigação:** rodar `supabase/tests/rls_test_suite.sql` antes/depois.

## Rastreio

| Fase | Status | Data |
|------|--------|------|
| Helper `_shared/auth-client.ts` | ✅ | 2026-07-11 |
| Documentação (este arquivo) | ✅ | 2026-07-11 |
| Migração das 50 funções priorizadas | ⏳ ondas 6a-6f | — |
| Rejeição CI se `SUPABASE_SERVICE_ROLE_KEY` for usado sem `getServiceClient` | ⏳ Fase 3 | — |
