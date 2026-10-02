# Matriz RLS — tabela × papel

Fonte: policies efetivas em `supabase/migrations/` (replay determinístico) +
specs E2E. Cobertura executável:

- `tests/e2e/rls-scope-salesperson.spec.ts` — salesperson não lê/escreve
  linhas de terceiros (prova de escopo positiva).
- `tests/e2e/sales-markup-rls-salesperson.spec.ts` — mascaramento de custos.
- `tests/e2e/rls-authorization-edge-cases.spec.ts` — bloqueios anon/borda.
- `src/hooks/rolePermissions.test.ts` — permissão declarada × policy viva.

## Tabelas de maior risco e dono da linha

| Tabela              | Dono da linha                  | salesperson                            | manager                        | admin | Observações |
|---------------------|--------------------------------|----------------------------------------|--------------------------------|-------|-------------|
| `sales`             | `salesperson_id`/`sdr_id`/`closer_id` | só as próprias (SELECT/INSERT/UPDATE) | tudo (policies dedicadas)      | tudo  | DELETE restrito a admin/manager |
| `clients`           | `user_id` / `client_portfolio` | carteira própria + policies legadas    | tudo                           | tudo  | Histórico de policies amplas — spec vigia |
| `orders`            | `salesperson_id`/`user_id`     | próprios                               | tudo                           | tudo  | — |
| `commissions`       | `salesperson_id`               | próprios (leitura)                     | tudo                           | tudo  | Escrita só service/admin |
| `nps_surveys`       | `salesperson_id`               | próprios                               | tudo                           | tudo  | — |
| `call_recordings`   | `salesperson_id`               | próprios                               | tudo                           | tudo  | Áudio em bucket privado |
| `quotes`            | `created_by`/`external_seller_id` | próprios                            | tudo                           | tudo  | `quote_items` herda via FK da quote |
| `user_mfa_settings` | `user_id`                      | só o próprio (totp_secret jamais vaza) | só o próprio                   | tudo  | Segredo TOTP = coluna mais sensível |
| `login_attempts`    | — (auditoria de auth)          | nada                                   | nada                           | leitura | Insert via service (auth hook) |
| `user_2fa_log`      | `user_id`                      | só o próprio                           | nada                           | leitura | `REVOKE` + RLS reforçados na auditoria |

## Regras

- Tabelas `deals` e `payouts` **não existem** no schema — pipeline vive em
  `sales` (stage/pipeline_id) e repasses em `commissions`. Não criar specs
  contra tabelas inexistentes.
- Filtros "neq" no spec provam escopo: pedir explicitamente linhas de
  terceiros deve retornar `[]` ou 4xx — nunca linhas.
- INSERT cruzado (dono fabricado) deve falhar no WITH CHECK — 2xx é bug.
