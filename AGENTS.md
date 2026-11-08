# AGENTS.md — Promo_Champions_V2.1

Regras para qualquer agente de IA. Se `docs/` contradisser este arquivo, **este arquivo vence**. Tudo em PT-BR (respostas, commits, PRs, comentários de código); nunca inglês.

<!-- §1–5: texto-mestre adm01-debug (2026-11-02), condensado. -->

## 1. Contexto

Sistema ~80% pronto, em manutenção. **O dono não é dev**: decide negócio; o agente executa a engenharia. Critério: qualidade + velocidade, caminho mais rápido e barato em tokens.

## 2. Como trabalhar

1. End-to-end via MCP. Nunca "copie e cole", "você faz X e eu faço Y" nem passo manual do dono quando existe MCP.
2. Decida como dev sênior. Pergunte só se envolver custo, arquitetura, dado destrutivo em produção, trade-off de negócio ou regra 5.8; nunca "quer que eu faça?" após pedido. Ler/inspecionar não pede permissão.
3. **Verdade acima de validação.** Não sabe/falhou → diga. Afirmação sobre código cita evidência (arquivo:linha, diff, saída); sem evidência = "NÃO VERIFICADO" + motivo. Branch/commit/PR não provam nada — leia o código.
4. **Diff mínimo, zero churn.** Causa raiz, não reescrita; não refatore/renomeie o que não foi pedido. Dependência nova ou bump major só se indispensável — avise na PR.
5. `APROVADO` = execute o plano como descrito, sem reconfirmar.
6. **Uma tarefa por vez** = uma branch = uma PR. Outro bug achado → "Próximos passos", não conserte. Travou (acesso, MCP, dependência) → reporte o erro exato e pare; não pivote nem contorne regra. Antes de concluir, releia o pedido.
7. **Tokens:** só o trecho necessário, nunca o repo inteiro; grafo (§8) antes de busca por texto; exploração ampla → subagente. Sem tool "por garantia", sem código que não será aplicado, sem replanejar a cada turno.
8. **Segredos** nunca em código, commit, PR ou resposta — só em env/secret do serviço; o repo é **público**. Nunca imprima/commite `.git-credentials`, `.env.local`, tokens, chaves, service_role.

## 3. Bugs e funcionalidades

- **Diagnóstico antes de patch:** logs e estado real, ponto exato (arquivo:linha), causa. Várias causas → liste todas, corrija a pedida.
- **Antes da PR:** typecheck/lint/testes dos arquivos tocados. Só erro seu conta; herdado do `main` → "Próximos passos".
- **Bug "pronto"** = PR mergeada + deploy confirmado + comportamento verificado (log, query ou request real). Faltou um → diga onde parou.
- **Funcionalidade pronta** = integrada ponta a ponta (componente usado, rota, entrada na UI, hook/serviço, edge function registrada, tabela com RLS, estados erro/loading/vazio, handlers), sem mock, hardcode ou TODO. Fluxo incompleto = pela metade. Não cabe na sessão → entregue o integrado e liste o que falta, com arquivos.

## 4. Comunicação

- Resultado primeiro; só o contexto que muda decisão do dono. Sem introdução, narração, hedging, lição de moral ou cortesia. Efeito no negócio; técnica só se perguntarem. Resposta proporcional ao fix. Não despeje log — cite a linha que importa. Caminhos, comandos e links completos.
- Destrutivo de verdade: uma linha ("isso apaga X, sem volta — confirma?").
- **Toda execução fecha com exatamente 3 "Próximos passos"** (`1. [título] — [por quê] · [onde]`): por impacto, do que viu nesta sessão, executáveis via MCP, para não-dev; nada genérico. É menu (`1`, `1 e 3`, `APROVADO 2`, "todos", bloco colado) = executar na ordem sem reconfirmar. Consulta ou nada pendente → `Próximos passos: nada pendente neste escopo.`

## 5. Fluxo Git (vários agentes nos mesmos repos)

Escrita no GitHub (`adm01-debug`): MCP **`GITHUB - MCP - FOREVER`** (o padrão dá 403 em write).

1. Nunca em `main`; toda mudança nasce em branch própria.
2. Só escreva em branch que **você** criou nesta sessão; branch alheia é somente leitura.
3. Antes de começar, PRs abertas: `github_graphql` com `pullRequests(states:OPEN){nodes{number files{nodes{path}}}}` (`github_list_pull_requests` estoura o contexto). PR aberta nos mesmos arquivos → pare e avise.
4. Branch de `main` atualizado: `claude/<tipo>-<slug>-<AAMMDD-HHMM>` (`fix`|`feat`|`chore`|`infra`). Antes de cada push, confirme que o último commit é seu.
5. Commits curtos em PT-BR, `tipo: assunto`, 1 atômico. commitlint aceita `feat fix docs style refactor perf test chore ci build` (não `infra`: só tipo de branch); escopo opcional, ver `commitlint.config.js`. Nunca `--no-verify`: hook falhou → corrija a causa.
6. PR sempre: título = o que muda; corpo = causa + o que foi verificado, com evidência. Checklist: `.github/pull_request_template.md` (migrations/functions exigem evidência com `server_time`).
7. **Mergeie sem aprovação** PR sua (ou que você corrigiu) e pronta: CI verde, sem conflito, escopo comum (front, edge, workflow, config). Squash-merge e apague a branch.
8. **Deixe aberta e chame o dono**: DDL/migration em produção; CI/workflows, segredos, Dockerfile, stack/Swarm, Traefik; deleção de dado, arquitetura ou custo; conflito com PR de outro agente.
9. Conflito: rebase em `main`; `--force-with-lease` só na sua branch. Nunca force-push em `main`; nunca rebase, force-push ou merge em branch alheia.
10. Merge = **produção** (deploy automático na Vercel): confira o deploy e reporte. CI vermelha → leia o resumo antes de patch; vermelho do seu merge → `fix:` em branch nova na mesma sessão.
11. Reporte no fim: link da PR + estado (mergeada / aguardando o dono / CI vermelha e por quê).
12. Local: worktree isolado, nunca `git checkout -b` no checkout principal; remova ao terminar. Receita: docs/agentes/worktree.md.

## 6. Projeto

- Repo **público** `adm01-debug/Promo_Champions_V2.1`, branch `main`. CRM de vendas (Promo Brindes). Node 22+, lockfile `package-lock.json`.
- Stack: Vite/React 18/TypeScript/Tailwind/shadcn/TanStack Query/React Router; Supabase Cloud (Postgres, RLS, Auth, Edge Functions Deno); Vitest, Playwright; Vercel.
- Onde: `src/pages/` (rotas em `src/routes/AppRoutes.tsx`), `src/components/<domínio>/`, `src/integrations/supabase/` (`env.ts`, `types.ts` gerado), `supabase/functions/`, `supabase/migrations/`, `.github/workflows/` (gate: `pr-checks.yml`).
- Mapa de módulos, edge functions e integrações: docs/agentes/mapa-do-sistema.md.

## 7. Banco oficial e migrations

- Supabase Cloud `usyxfpqlsspldubptrdl` (`https://usyxfpqlsspldubptrdl.supabase.co`). Nenhum outro Supabase (VPS AtomicaBR etc.) é deste repo.
- SQL via MCP: gateway `supabase-promo-champions-v2-mcp.adm01.workers.dev`. Conector falhou: ler docs/agentes/banco-e-mcp.md.
- Migrations: DDL direto com `db_query` no MCP (não `supabase_apply_migration`); versão = timestamp `YYYYMMDDHHmmss` crescente (`SELECT max(version)` antes); toda DDL vira arquivo comentado em `supabase/migrations/`; `CREATE INDEX CONCURRENTLY` falha — use `CREATE INDEX`; functions `SECURITY INVOKER`, grants mínimos; RLS + `updated_at` obrigatórios; resto em docs/SCHEMA_CONVENTIONS.md. `npm run check:migrations` valida.
- Edge Functions: 171 no repo, plano limita a 100 deployadas. `migrate-helper` foi removida (expunha service_role).

## 8. Comandos, segurança e contexto gerado

- `npm run typecheck` · `lint` (0 warnings) · `test` (vitest run) · `test:watch` · `test:e2e` · `a11y:sweep` · `security:secrets` · `ci`.
- `env.ts` tem defaults públicos por design (publishable key; RLS controla); service_role nunca no código. Environment `pr-preview` nunca recebe secrets — workflows: ler `.github/ENVIRONMENTS.md`.
- Contexto gerado (detalhe: docs/agentes/contexto-gerado.md): `git fetch origin contexto && git show origin/contexto:docs/contexto/00-INDEX.md`; `inventario/estado/*.json`; `types.ts` via `types-sync.yml`. Nunca abra PR da branch `contexto`.
- Graphify: se `graphify-out/graph.json` existir (não versionado; `graphify update .` gera), `graphify query "<pergunta>"`, `path`, `explain`; `GRAPH_REPORT.md` = visão ampla. Frescura e skill: docs/agentes/contexto-gerado.md.
