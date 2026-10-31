# Fase 4 — Progresso de Remediação dos CRÍTICOs

**Data de referência:** 2026-10-31  
**SHA main analisado:** c23e4e8b42aa1c9ccda6f710285766ab2dd7ed1a  
**Verificado por:** Coordenador PROMO CHAMPIONS V2.1

## Status dos 10 CRÍTICOs

| ID | Descrição | Status | Evidência |
|----|-----------|--------|-----------|
| C1 | Trigger `sync_quote_to_sale_status` revertia vendas 'won'/'completed' para 'lead' | CORRIGIDO E VERIFICADO | `supabase/migrations/20260718000001_fix_sync_quote_no_status_downgrade.sql` — guard `IF v_current_sale_status IN ('won', 'completed', 'cancelled') THEN RETURN NEW` |
| C2 | `generate-quality-report.ts` retornava métricas completamente falsas | SUPERADO | Arquivo deletado em commit `a24228771` ("remove artefatos mortos") |
| C3 | E2E gate em `.github/workflows` passava com suite vazia | DECISÃO HUMANA | Requer edição de `.github/workflows` — proibido mergear autonomamente |
| C4 | WebAuthn `login-verify` permitia account takeover via credential_id arbitrário | CORRIGIDO E VERIFICADO | `supabase/functions/webauthn/index.ts` linhas 309–350 — login é baseado em `credData.user_id` (do banco), nunca em parâmetro do caller; verificação criptográfica da assinatura precede o lookup |
| C5 | `send-multichannel-message` sem autenticação — qualquer chamada enviava mensagens | CORRIGIDO E VERIFICADO | `supabase/functions/send-multichannel-message/index.ts` linhas 231–242 — `getUserClient` + `UnauthorizedError`; guard de owner_id na linha 274 |
| C6 | `scheduled-reports-runner` gerava CSV com injeção de fórmula (CWE-1236) | CORRIGIDO E VERIFICADO | `supabase/functions/scheduled-reports-runner/index.ts` — função `toCSV()` com neutralização explícita de células que iniciam com `= + - @ TAB CR` |
| C7 | `reportDownload.ts` gerava CSV com injeção de fórmula (CWE-1236) | CORRIGIDO E VERIFICADO | `src/utils/reportDownload.ts` linha 75 — `sanitizeCsvCell(String(value))` aplicado a todas as células |
| C8 | Cadências pausadas/canceladas disparavam mensagens (CWE-841) | CORRIGIDO E VERIFICADO | `supabase/migrations/20260718000003_add_claim_pending_cadence_tasks.sql` — `AND pc.status = 'active'` no JOIN |
| C9 | Envio duplicado por ausência de claim atômico (CWE-362 race condition) | CORRIGIDO E VERIFICADO | `supabase/migrations/20260718000003_add_claim_pending_cadence_tasks.sql` — `FOR UPDATE SKIP LOCKED` |
| C10 | Tokens OAuth/webhooks em `portfolio_settings` visíveis para todos (CWE-284) | CORRIGIDO E VERIFICADO | `supabase/migrations/20260718000002_fix_portfolio_settings_rls_credential_leak.sql` — policy `USING(true)` substituída por filtro de padrão de chave |

## Resumo

- **9 de 10 CRÍTICOs resolvidos no código/banco em main**
- **1 CRÍTICO (C3) pendente de DECISÃO HUMANA** — requer mudança em `.github/workflows`
- Fases 0–4 concluídas. Fase 5 (relatório final) no mesmo PR.

## Itens que Permanecem como DECISÃO HUMANA

| Item | Ação Necessária |
|------|----------------|
| C3 — E2E gate vazio | Editar `.github/workflows` para exigir pelo menos 1 teste |
| PR #281 | Marcar como ready (owner `adm01-debug`) — 4 bugs reais em scripts de auditoria |
| PR #280 | Rebase em main (conflito) — fix complementar ao #281 |
| PR #252 | Migração React 18→19 — breaking changes de API |
| PR #254 | TypeScript 6→7 + vite-plugin-pwa 1→2 — breaking changes |
| PR #298 | eslint-plugin-react-refresh 0.4→0.5 — major, verificar breaking changes |
| PR #345 | react-core group — Lint & Type Check failing |
| PR #347 | build-tools group — Lint & Type Check failing |
