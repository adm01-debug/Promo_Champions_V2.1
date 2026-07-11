# ADR-006: Estratégia de X-Request-Id

**Data:** 2026-07-11  
**Status:** Aceito  
**Sub-agente:** 🔍 Code Auditor

## Contexto

Correlacionar logs entre frontend → edge function → RPC → webhook exige um ID único que atravesse todas as camadas.

## Decisão

- Frontend gera `X-Request-Id` (UUID v4) ao invocar edge functions críticas via `supabase.functions.invoke`.
- Edge functions adotam o helper `withRequestId` em `supabase/functions/_shared/request-id.ts`:
  - Aceita ID recebido se casa com `/^[A-Za-z0-9_-]{8,64}$/` (defesa contra log-injection).
  - Caso contrário mina novo UUID.
- Todos os logs estruturados JSON incluem `requestId`.
- Response headers ecoam `X-Request-Id`.
- Tabelas `winloss_webhook_deliveries` e `quote_conversion_audit` persistem o `request_id` para trilha end-to-end.

## Consequências

- **Prós:** debug de conversão quote→sale drops de horas para minutos; script `verify-dispatcher-request-id.sh` valida propagação em CI.
- **Contras:** exige disciplina de adoção — funções antigas ainda não usam o helper (roadmap OBS-03 fase 2).

## Formato aceito

`^[A-Za-z0-9_-]{8,64}$` — cobre UUIDs, short IDs (nanoid) e IDs de tracing externos (Datadog, W3C Trace Context truncado).
