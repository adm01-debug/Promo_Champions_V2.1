# ADR-005: Idempotência Quote → Sale

**Data:** 2026-07-11  
**Status:** Aceito  
**Sub-agente:** 🗄️ Supabase Engineer

## Contexto

A conversão orçamento → venda pode ser disparada pelo usuário (`fn_convert_quote_to_sale`) ou pelo trigger legado (`trg_convert_quote_to_order`). Sem idempotência, um duplo-clique gera pedidos duplicados, comissões duplicadas e afeta gamificação.

## Decisão

- A RPC `fn_convert_quote_to_sale(_quote_id)` é **idempotente**: valida `quotes.status` antes de agir, reutiliza `orders` existentes quando encontrados (`reused_order = true`) e retorna `idempotent = true` quando a chamada é repetida.
- Sequência monotônica `orders_conversion_seq` garante `order_number` único (formato `ORC-<seq>`).
- Todo caminho de erro tem um `error_code` estável mapeado em `src/hooks/quoteErrorMessages.ts`.
- Toda tentativa (sucesso ou falha) é gravada em `quote_conversion_audit` via `fn_record_conversion_attempt` com `X-Request-Id` para correlação.

## Consequências

- **Prós:** zero duplicidade em 20+ specs E2E + stress test SQL; UI pode reexibir botão com segurança em caso de erro de rede.
- **Contras:** o payload de retorno tem mais campos (`reused_order`, `idempotent`) que exigem interpretação — mitigado por hook `useConvertQuoteToSale` que centraliza tratamento.

## Testes

- `tests/e2e/quote-to-sale-*.spec.ts` (24 specs)
- `supabase/tests/quote-to-sale-stress.sql`
- `scripts/verify-quote-to-sale-invariants.ts`
