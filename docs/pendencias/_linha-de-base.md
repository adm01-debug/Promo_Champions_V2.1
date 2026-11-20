# Linha de Base — Promo_Champions_V2.1

> Base congelada no HEAD `7bf29f5` (pós-PR #586 fix timezone). Serve de piso anti-regressão: nada abaixo desses números pode ir para trás.

## Inventário do sistema (HEAD `7bf29f5`)

| Item                     | Quantidade | Fonte                                                 |
| ------------------------ | ---------- | ----------------------------------------------------- |
| Páginas front (rotas)    | 180        | `src/pages/**/*.tsx`                                  |
| Workflows CI             | 27         | `.github/workflows/*.yml`                             |
| Migrations SQL           | 700        | `supabase/migrations/*.sql`                           |
| Edge functions           | 172        | `supabase/functions/*/`                               |
| Arquivos de teste        | 154        | `src/**/*.test.*` + `supabase`                        |
| Testes executados        | 985        | vitest                                                |
| Testes passando          | 983        | vitest                                                |
| Testes pulados (skip)    | 2          | vitest                                                |
| Testes falhando          | 0          | vitest                                                |
| Typecheck (tsc --noEmit) | 0 erros    | `node_modules/typescript/bin/tsc`                     |
| Strict ratchet (novos)   | 0          | `scripts/check-typecheck-baseline.mjs` (baseline 882) |

## Comandos de verificação usados

```powershell
node node_modules/typescript/bin/tsc --noEmit                       # typecheck: 0 erros
node scripts/check-typecheck-baseline.mjs                            # strict: 0 novos (baseline 882)
npx vitest run                                                       # 985 testes: 983 pass / 2 skip / 0 fail
```

## Erros herdados conhecidos (NÃO são regressão desta base)

- `Edge Functions Tests (deno)` falha por CI em 3 arquivos, baseline independente do código mergeado:
  - `cron-failure-alerter/index.test.ts` — 504 (timeout) na 1ª chamada.
  - `process-race-event/index_test.ts` — erro CORS.
  - `race-commentary/index_test.ts` — erro CORS.
- Esse job **não é obrigatório** no branch protection de `main` (obrigatórios: Lint & Type Check, Unit Tests, Build Check, Edge Functions Lint).

## Backlog de governança (itens já decididos, aguardando execução)

- Aplicar migrations pendentes em produção (crons da máquina de vendas `20261112224500`) — falta `SUPABASE_DB_PASSWORD`.
- Rotacionar credenciais antigas expostas (item A2 da auditoria).
- Limpar PII em repo público.
