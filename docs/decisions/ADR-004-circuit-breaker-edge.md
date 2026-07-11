# ADR-004: Circuit Breaker em Edge Functions

**Data:** 2026-07-11  
**Status:** Aceito  
**Sub-agente:** 🔌 API Integrator + 🔍 Code Auditor

## Contexto

Edge functions da plataforma dependem de serviços externos (Slack, Twilio, ElevenLabs, Bitrix24, webhooks de clientes). Uma falha prolongada em qualquer um deles pode cascatear em timeout de RPCs e consumo desnecessário de conexões de banco.

## Decisão

Adotamos um circuit breaker in-memory por-isolate implementado em `supabase/functions/_shared/circuit-breaker.ts`.

- Estados: `CLOSED → OPEN → HALF_OPEN → CLOSED`
- Threshold padrão: 5 falhas consecutivas em 30s
- Timeout padrão da chamada: 8-10s
- Todo evento de transição é gravado em `public.circuit_breaker_events` (fire-and-forget via service_role)

**Nomenclatura:** `<provider>:<operation>` (ex.: `slack:quote-conversion`, `webhook:{id}`, `twilio:call-status`).

## Consequências

- **Prós:** falha rápida, dashboard admin em `/admin/platform-slo` mostra circuitos abertos, reset manual via `fn_admin_reset_circuit(name)`.
- **Contras:** estado é per-isolate — não há coordenação global. Aceitável porque edge isolates reciclam frequentemente e o custo de coordenação distribuída (Redis) supera o benefício.
- **Fallback:** quando o circuit está aberto, a chamada externa é registrada como falha no log estruturado com `circuit_open` mas o fluxo principal (auditoria, RPC) continua.

## Alternativas consideradas

1. **Retries com backoff apenas** — insuficiente durante outages longos; ainda consome recursos.
2. **Redis Cluster (Upstash)** — coordenação global, custo/latência adicional; overkill para volume atual.
3. **Sidecar Envoy** — não faz sentido em edge functions Deno.
