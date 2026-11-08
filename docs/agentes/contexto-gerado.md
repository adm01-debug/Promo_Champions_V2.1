# Contexto e inventário gerado para agentes

Consulte ANTES de buscar por texto. Movido do antigo `CLAUDE.md` na limpeza das instruções para agentes.

Mesmo padrão do Zapp_Web_V2. Nada aqui é escrito à mão; se divergir do que você mediu, regere.

| Fonte                                                                                   | Onde ler                                                                                                                        | Quem gera / quando                                                                                                                                    |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Índice único (comece aqui)                                                              | `git fetch origin contexto && git show origin/contexto:docs/contexto/00-INDEX.md`                                               | `.github/workflows/contexto.yml`, a cada push em `main` e a cada 10 min                                                                               |
| Banco real ao vivo (tabelas, RLS, funções, triggers, cron, lints)                       | `docs/contexto/supabase/` na branch `contexto`                                                                                  | `scripts/supabase_snapshot/` (secret `SUPABASE_DB_URL`, sessão read-only)                                                                             |
| Código (rotas, módulos, hooks, edges, grafo, testes, convenções)                        | `docs/contexto/codigo/` na branch `contexto`                                                                                    | `scripts/ai-context/gerar.mjs` (`npm run contexto:ia`)                                                                                                |
| Regras de negócio (RLS por operação, estados, validações, lacunas)                      | `docs/contexto/regras/` na branch `contexto`; regras humanas em `docs/contexto/regras/manual/` (main)                           | `scripts/regras_negocio/`                                                                                                                             |
| Estado real versionado (banco, rotas → menu → hooks → tabelas, edges, `alertas`)        | `inventario/estado/*.json` (main)                                                                                               | `inventario-estado-semanal.yml`, segunda 10:23 UTC → PR com auto-merge                                                                                |
| `src/integrations/supabase/types.ts` × banco                                            | —                                                                                                                               | `types-sync.yml` (auto-correção): push em migrations + segunda 05:49 UTC → PR com auto-merge, ou issue `[types-sync]` se quebrar o typecheck          |

A branch `contexto` é gerada (nunca abra PR dela). Testes offline de todas as automações: `.github/workflows/contexto-testes.yml` (`node --test scripts/ci/*.unit.mjs` dos geradores).

## Graphify — detalhes

- Grafo em `graphify-out/` (`GRAPH_REPORT.md` traz a contagem de nós/arestas/comunidades e o commit de origem em "Built from commit"). Só `GRAPH_REPORT.md` e `manifest.json` são versionados; `graph.json` **não** é — num checkout/worktree novo ele não existe, e `graphify query` só funciona depois de `graphify update .` (ou do auto-sync) gerá-lo.
- Comandos: `graphify query "<pergunta>"` (perguntas de codebase), `graphify path "<A>" "<B>"` (relacionamentos), `graphify explain "<conceito>"`; após mudança de código, `graphify update .` (AST-only, sem custo de API).
- Outros scripts npm não listados no AGENTS.md: `test:coverage`, `test:deno`, `test:sql`, `a11y:report`, `lint:fix`, `format`, `format:check` (CI só checa `src/**`), `deps:check`, `graphify:test`, `graphify:verify`, `contexto:ia`.
- Frescura do grafo: compare `git rev-parse --short HEAD` com `grep "Built from commit" graphify-out/GRAPH_REPORT.md`. Se divergirem, o auto-sync N8N corrige em até 15 min; para forçar, `graphify update . --force`.
- Skill `graphify` (`.claude/skills/graphify/SKILL.md`, gatilho `/graphify`) transforma código e documentos em grafo.
- Análise de impacto: use apenas o `multigraph.json` de um snapshot identificado por `snapshot.json`; consulte a fonte indicada antes de concluir a alteração.
- `npm run graphify:contracts -- --out .graphify-local/<arquivo>.json` coleta relações estáticas de código e migrations; SQL dinâmico e referências não literais continuam como lacunas.
- O Graphify não amplia permissões: catálogo Supabase, dados, deploys e escrita seguem as regras e os acessos já existentes.
- Hooks git `post-commit` e `post-checkout` (husky) disparam rebuild em background; `GRAPHIFY_SKIP_HOOK=1` desliga.
