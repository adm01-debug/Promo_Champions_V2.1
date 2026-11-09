# GitHub (perímetro, CI, workflows) — referência para agentes

Ler quando mexer em branch protection, settings do repo, `.github/workflows/`, ou quando um merge
ou um workflow falhar de forma estranha. Medido no HEAD em 2026-11-08.

## Escrita no GitHub

- Repo `adm01-debug/Promo_Champions_V2.1`, branch `main`, público.
- **Escrita: MCP `GITHUB - MCP - FOREVER`** (ferramentas `mcp__GITHUB_-_MCP_-_FOREVER__*`,
  ex. `github_push_files`, `github_create_pull_request`, `github_graphql`). O MCP padrão do GitHub
  retorna 403 em write.
- PRs abertas que tocam os mesmos arquivos: `github_graphql` com
  `pullRequests(states:OPEN){nodes{number files{nodes{path}}}}` — `github_list_pull_requests` devolve
  campo demais e estoura contexto em repo com histórico grande.

## Perímetro — estado medido (não há guard automático que compare isso)

Branch protection do `main` tem **duas fontes independentes** que valem ao mesmo tempo — mexer só
uma e achar que cobriu o perímetro é o erro mais caro aqui:

| Fonte | O que exige |
|---|---|
| Branch protection clássica (`GET /branches/main/protection`) | 4 status checks: `Lint & Type Check`, `Unit Tests`, `Build Check`, `Edge Functions Lint (deno)`; `strict: true` (branch precisa estar atualizada); `allow_force_pushes: false`; `allow_deletions: false`; `enforce_admins: false` |
| Ruleset `main-protection` (Settings → Rules → Rulesets) | status check `CI Gate`; `strict: false`; 0 aprovações exigidas; bloqueia force-push e deleção de novo (`NON_FAST_FORWARD`, `DELETION`) |

Merge exige o **conjunto** das duas: os 4 checks clássicos **e** `CI Gate` (job agregador de
`pr-checks.yml`, que já inclui `lint-and-typecheck`, `test`, `build` e, desde #392,
`instrucoes-agentes`/GA02 — ver `docs/agentes/contexto-gerado.md`). O job `security-audit`
(`npm audit`) fica de fora do `CI Gate` de propósito — um advisory novo não pode travar o próprio
PR que o corrigiria —, mas **não é opcional**: `Edge Functions Lint (deno)`, nome do check gerado
pelo job `edge-functions-lint`, é um dos 4 exigidos pela branch protection clássica acima, mesmo
sem aparecer no `needs` do `CI Gate`. Os dois caminhos de required check não se sobrepõem 1:1 —
confira os dois antes de concluir que algo "não é obrigatório".

Outros fatos do repo (`github_get_repo`): `allow_squash_merge` / `allow_merge_commit` /
`allow_rebase_merge` **todos `true`** — o squash-merge da regra 5.7 do `AGENTS.md` é convenção do
agente, não é forçado pelo GitHub. `delete_branch_on_merge: true` (a branch já some sozinha depois do
merge). `allow_auto_merge: true`. `secret_scanning` e `secret_scanning_push_protection`: `enabled`.
`.github/CODEOWNERS` existe e cobre `*` com `@adm01-debug @promo-ops` — `@promo-ops` ainda não existe
como conta (ver `docs/DR_PLAN.md`), então toda revisão de CODEOWNERS recai só em `@adm01-debug`.

Sintoma de `strict: true`: merge recusado com "N of N required status checks are expected" mesmo com
CI verde — a PR ficou `BEHIND` da `main` (`mergeStateStatus`). Solução: atualizar a branch com a
`main` (merge ou rebase), não mexer no `strict`.

## Workflows (25 arquivos em `.github/workflows/`)

`a11y-sweep` · `apply-migration` · `ci-failure-alert` · `codeql` · `contexto` · `contexto-testes` ·
`cron-monitoring` · `db-backup` · `db-probe` · `dependabot-automerge` · `dependabot-fix-lockfile` ·
`deploy` · `edge-functions-bundle` · `edge-functions-input-validation` · `edge-functions-request-id` ·
`graphify` · `inventario-estado-semanal` · `main` · `migrations-drift` · `pr-checks` ·
`pr-review-sla` · `qa-exhaustive` · `quote-to-sale-e2e` · `release-please` · `types-sync`.

- **`pr-checks.yml`** é o gate canônico: `pull_request` (todos) + `push: main` (gates essenciais,
  sem os jobs pesados) + `workflow_dispatch`. Job `detect-changes` pula os jobs de código quando o
  diff é só `docs/`/`.md` — por isso o guard `instrucoes-agentes` (GA02) roda **fora** desse
  `detect-changes`: é justamente em PR doc-only que um wipe de instruções passaria batido.
- **`main.yml`** roda depois de todo push na `main` (inclusive squash merge) — defesa contra squash
  que passou no PR mas não compila contra o HEAD atualizado da base. Não deploya nada.
- **`deploy.yml`** só dispara por `workflow_dispatch` ou push de tag `v*`/`promo-champions-v2-v*`;
  o `job: deploy` roda no `environment: production` (gate de aprovador humano se "Required reviewers"
  estiver configurado ali). **Os comentários do arquivo descrevem o frontend como "Lovable Cloud" —
  isso está desatualizado**: o deploy real do frontend é a Vercel, automático a cada push na `main`
  (ver `docs/agentes/vercel-deploy.md` e `docs/DEPLOYMENT.md`, revisado 2026-10-18). O `deploy.yml`
  nunca foi atualizado depois da migração; ele só valida (typecheck/lint/testes/build/bundle de
  edges) e tenta `supabase functions deploy`/`db push` se os secrets existirem.
- **`ci-failure-alert.yml`** dispara em `workflow_run.completed` de 19 workflows nominados (lista
  verificada contra o `name:` de cada arquivo — todos existem). **5 workflows não estão nessa
  lista**: `contexto`, `contexto-testes`, `inventario-estado-semanal`, `types-sync`,
  `dependabot-fix-lockfile` — falha neles não dispara alerta automático.
- **Agendamentos (UTC):** `codeql` seg 04:23 · `types-sync` seg 05:49 (antes do inventário, que lê o
  `types.ts` que ele gera) · `migrations-drift` diário 07:00 · `cron-monitoring` diário 06:00 ·
  `db-backup` diário 03:00 · `inventario-estado-semanal` seg 10:23 · `pr-review-sla` dia útil 12:00 ·
  `dependabot-automerge` diário 11:30 · `qa-exhaustive` seg 03:00 · `contexto` a cada 10 min no
  minuto 3 (fora do minuto 0 de propósito, para não competir com a fila do GitHub nem com os outros
  crons do repo).
- **Não existe `merge_group`** em nenhum workflow — confirmar antes de assumir fila de merge nativa
  (a conta `adm01-debug` é `User`, não `Organization`; `merge_queue` responderia `422`).
- Nenhum workflow usa `secrets.SUPABASE_DB_URL`/`SUPABASE_ACCESS_TOKEN` em job que rode em PR de fork
  — `apply-migration.yml` e `deploy.yml` (os dois que tocam produção) só disparam por
  `workflow_dispatch` ou push de tag, nunca por `pull_request`.

## Guards que você pode rodar antes do PR

- `node scripts/ci/check-claude-md-integrity.mjs` (GA02; mexeu em `AGENTS.md`/`CLAUDE.md`/
  `docs/agentes/*.md`): exige os 8 cabeçalhos do `AGENTS.md` e barra o conjunto encolher >30% (ou um
  arquivo vigiado cair a menos de 50% do que tinha na base) vs `CLAUDE_MD_BASE` (default `HEAD`).
- `node scripts/check-migrations.mjs --base origin/main` (mexeu em `supabase/migrations/`).
- `npm run deps:check` (dependency-cruiser — ciclos e violação de camada).
