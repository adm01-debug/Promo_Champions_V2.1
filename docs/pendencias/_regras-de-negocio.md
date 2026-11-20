# Regras de Negócio — Promo_Champions_V2.1

> Extraídas do código no HEAD `7bf29f5` (pós-#586). Evidência = arquivo:linha.
> Fonte única de verdade de status/conversão para front e edge functions.

## Ciclo de vida da venda (`sales.status`)

- Domínio do CHECK (SQL) + helpers TS: `lead, prospecting, qualified, proposal, negotiation, pending, completed, lost, cancelled, won, closed`. Fonte: `src/constants/index.ts:83-95`, `supabase/migrations` (constraint `sales_status_check`).
- **Won** (receita/conversão) = `completed | won | closed` — os três contam como ganhas (`WON_SALE_STATUSES`, `src/constants/index.ts:59-60`). Entrada manual usa `completed`; sync Bitrix24 usa `won`/`closed`. **Regra: todo cálculo de conversão/receita trata os três uniformemente.**
- **Lost** = `lost | cancelled` (`LOST_SALE_STATUSES`, `src/constants/index.ts:62`).
- **Aberto** = tudo que não é won/lost (`isOpenSaleStatus`, `src/constants/index.ts:91-92`). `open` é legado fora do CHECK, mas tratado como aberto.
- Labels UI: `pending→Pendente, qualified→Qualificada, proposal→Proposta, negotiation→Negociação, completed→Concluída, lost→Perdida` (`SALE_STATUS_LABELS`, `src/constants/index.ts:31-37`).
- O arquivo de constantes é a fonte única: edge functions espelham em `_shared/sale-statuses.ts`.

## Markup / margens

- `markup_pct = ((amount - total_cost) / total_cost) * 100`; `margin_amount = amount - total_cost` (`src/lib/markupHelpers.ts:5-6`).
- Tiers de exibição: `>=40%` excelente · `20–40%` saudável · `<20%` crítico · sem custo = neutro (`src/lib/markupHelpers.ts:8-14`).
- Colunas vêm da view `sales_with_markup` na listagem (`SALES_LIST_COLUMNS` em `src/services/salesService.ts:27-48`): `markup_pct, margin_amount, unit_cost, total_cost, cost_source, cost_synced_at`.

## RBAC / permissões

- Tabelas `roles`, `user_roles` (m2m com `auth.users`), `user_permissions_cache` (`supabase/migrations/20251228000002_advanced_permissions.sql`).
- Roles default: `admin`, `manager`, e demais com permissões JSONB por módulo (`clients/deals/products/teams/settings/reports/audit`), ex.: admin tem `["create","read","update","delete"]` em clients.
- As policies RLS restritivas de sales/activities são o plano de autorização (pós-#582/#583); `sales_select_policy`/`activities_select_policy` legadas com `USING(true)` foram removidas.

## Entidades principais (migrations)

| Entidade                               | Migration origem                                                                 |
| -------------------------------------- | -------------------------------------------------------------------------------- |
| sales / activities                     | `20260530000003_idempotent_tables_if_not_exists.sql`                             |
| products / clients / teams / suppliers | `20251228000001_add_soft_delete.sql`                                             |
| client_portfolio                       | `20251214172514_c1966e7a-...sql`                                                 |
| combos                                 | `20260404154338_8884326f-...sql`                                                 |
| commissions                            | `20260416170135_cc109372-...sql`                                                 |
| inventory                              | `20251220181346_ade3d719-...sql`                                                 |
| roles/user_roles/permissions cache     | `20251228000002_advanced_permissions.sql`                                        |
| audit_log / audit_trail                | `20250102000001_audit_log.sql`, `20260105000002_audit_trail.sql`                 |
| soft delete                            | `20251228000001_add_soft_delete.sql` + `20260104210000_soft_delete_enhanced.sql` |
| 2FA                                    | `20260104200000_2fa_complete.sql`, `20260105000001_2fa_system.sql`               |
| webhooks                               | `20260104180000_webhooks_complete.sql`                                           |

## Timezone (regra de negócio crítica — bug real corrigido na #586)

- Datas ISO-somente (`YYYY-MM-DD`) parseadas com `new Date()` viram **UTC meia-noite** → viram o dia anterior em `America/Sao_Paulo`. **Sempre parse local explícito**: `new Date(\`${startDate}T00:00:00\`)`. Evidência: fix em `src/hooks/useEvolutionCurves.ts` (PR #586).

## Convenções

- Listagem de sales não usa `SELECT *`: colunas explícitas da view (performático e acoplado ao schema).
- `fetchAllRows` + `chunkedIn` para volumes altos (`src/services/salesService.ts`, `src/lib/supabase/`).
