# Plano de correção e melhoria dos workflows — Promo Champions V2.1

Base: `main` @ `dde5aff` (01/10/2026), 8 workflows em `.github/workflows/`, ruleset `main-protection`,
8 secrets, os últimos 60 runs em PRs e os últimos 40 em `main`.

## Diagnóstico — o que está quebrado hoje (evidência real)

| # | Achado | Evidência |
|---|--------|-----------|
| D1 | **`main` vermelha desde 01/10 15:34.** 5 workflows falham em todo push | runs 36886395795 / -895 / -499 / -805 |
| D2 | `deno.lock` desatualizado em `main` → quebra **Edge Lint, Bundle, Request-Id, Cron Monitoring** de uma vez | job 110460025200: `deno.lock desatualizado` |
| D3 | `npm audit` falha por **dompurify (high)**. O fix já existe no Dependabot (#186), parado | job 110460025054 |
| D4 | **Supabase Types Drift** falha em TODA PR com migration: compara com o banco de **produção**, que ainda não recebeu a migration | PR #200: `deleted_by`/`delete_reason` |
| D5 | **Quote-to-Sale** falha em 4 de 4 PRs (invariants sai com exit 2, Playwright vermelho) e roda em qualquer mudança de `supabase/functions/**`. O log não mostra a causa | runs 36916073960, 36911308415 |
| D6 | **E2E, Quote-to-Sale e Invariants rodam contra o banco de PRODUÇÃO** (`usyxfpqlsspldubptrdl`) com usuário real | `pr-checks.yml:243`, `quote-to-sale-e2e.yml:63-131` |
| D7 | Runs de `push:main` aparecem como **cancelled**: o GitHub mantém só 1 run pendente por grupo de concorrência e descarta o anterior | runs 36885861617, 36885366163 |
| D8 | Os required checks são só 3 (Lint, Unit, Build), com `strict=false`, 0 aprovações e sem code owner. Com vários agentes mergeando em paralelo, PR desatualizada entra e quebra a `main` (foi o que aconteceu em D2) | ruleset 22148182 |
| D9 | **CODEOWNERS inválido**: `@promo-ops` não existe (6 erros) | API codeowners/errors |
| D10 | `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_URL` e `SUPABASE_ACCESS_TOKEN` são **secrets de repo**: qualquer branch de qualquer agente lê. `SUPABASE_DB_URL` não é usado por nenhum workflow | lista de secrets + grep |
| D11 | Actions liberadas para "all" e `sha_pinning_required=false`, embora todas já estejam pinadas por SHA | actions/permissions |
| D12 | Lighthouse publica relatório em `temporary-public-storage` (link público), e `.lighthouserc.json` define `url` e `staticDistDir` ao mesmo tempo | `.lighthouserc.json` |
| D13 | No QA semanal, o Lighthouse nunca falha (`|| echo warning`). O build sai sem as envs do Supabase (tela branca), então Lighthouse e a11y medem página vazia | `qa-exhaustive.yml:93-134` |
| D14 | Workflows agendados (QA semanal, Cron Monitoring diário, CodeQL) falham em silêncio: não há notificação, e o Slack de `pr-checks` nunca foi configurado | secrets sem `SLACK_CI_WEBHOOK_URL` |
| D15 | 7 PRs abertas mexem em CI/workflows ao mesmo tempo (#184, #189, #195, #198 e Dependabot #178) | lista de PRs |

---

## FASE 0 — Coordenação (antes de qualquer commit)

1. Mapear os arquivos tocados por #184, #189, #195 e #198 (todas mexem em `.github/workflows`). Pelo seu fluxo Git, não abro PR por cima: preciso da sua decisão sobre quais seguem.
2. Definir a ordem de merge: #189 (destrava a main) → #186/#188 (dompurify/brace-expansion) → #184 → #195 → #198.
3. Congelar novos merges até a `main` voltar a ficar verde (o ruleset atual não impede).

## FASE 1 — Destravar a `main` (P0, mesmo dia)

4. Regenerar o `deno.lock` com Deno 2.9.x, igual ao CI, e commitar (resolve D2 em 4 workflows).
5. Mergear o Dependabot #186 (dompurify 3.4.16) para zerar o `npm audit` high.
6. Mergear o #188 (brace-expansion) e conferir o `npm audit --omit=dev` local.
7. Rodar de novo os 5 workflows em `main` e confirmar tudo verde.
8. Rebase das ~15 PRs abertas sobre a `main` verde, para que os checks reflitam o código atual.

## FASE 2 — Proteção de branch e governança (P0)

9. Ruleset: `strict_required_status_checks_policy=true` (PR precisa estar atualizada com a main).
10. Avaliar merge queue (`merge_group`) como alternativa ao strict. Com vários agentes em paralelo, é o que evita "PR verde + PR verde = main vermelha".
11. Se adotar merge queue, adicionar o gatilho `merge_group:` em `pr-checks`, `edge-functions-*` e `codeql`.
12. Adicionar aos required checks: `Edge Functions Lint (deno)`, `Bundle every edge function…` e `withRequestId adoption lint…`.
13. Fazer os workflows por path emitirem um check "sempre presente" (job skip-aware). Hoje, com path filter, check obrigatório pendente trava a PR.
14. Renomear os jobs obrigatórios com prefixo único (`pr-checks / lint`). Nomes genéricos como "Lint & Type Check" colidem entre workflows.
15. Corrigir o CODEOWNERS: remover `@promo-ops` ou criar a conta. Mudança de pessoas/custo, decisão sua.
16. Ligar `require_code_owner_review` só para `/.github/workflows/` e `/supabase/migrations/`.
17. Ruleset extra para `.github/workflows/**`: só o owner altera (bloqueia agente reescrevendo CI).
18. Deixar só squash como método de merge (histórico linear e reversível).
19. Ligar "Automatically delete head branches" (hoje há dezenas de `devin/*` e `dependabot/*` órfãs).

## FASE 3 — Segurança da supply chain de Actions (P1)

20. Ligar `sha_pinning_required=true` no repo, já que tudo está pinado.
21. Trocar `allowed_actions: all` por `selected`, com allowlist (actions/*, github/*, denoland/*, supabase/*, astral-sh/*, treosh/*).
22. Adicionar `actionlint` como job em PRs que tocam `.github/workflows/**`.
23. Adicionar `zizmor` (auditoria de segurança de workflows): injection, `permissions` excessivas, `persist-credentials`.
24. `persist-credentials: false` em todos os `actions/checkout` (nenhum job faz push).
25. Remover `actions: write` de `pr-checks`, `cron-monitoring`, `quote-to-sale` e `edge-functions-bundle`, que não precisam dele para upload de artefato.
26. Passar `permissions` de workflow para `{}` e declarar no job só o necessário.
27. Mover `github.event_name` interpolado dentro de `run:` (`cron-monitoring.yml:66,70`) para `env:`, por higiene contra injection.
28. Adicionar `github/codeql-action` com a linguagem `actions` (CodeQL analisa os próprios workflows).
29. Adicionar `actions/dependency-review-action` em PRs (bloqueia dependência nova com CVE high ou licença proibida).
30. Ligar Secret Scanning + Push Protection e Dependabot security updates no repo.
31. Pinar o `supabase/setup-cli` em versão fixa (hoje `version: latest`, que quebra sem mudança de código).
32. Pinar o `@lhci/cli` exato (hoje `0.14.x` instalado globalmente no QA).

## FASE 4 — Secrets e ambientes (P0/P1)

33. Criar o Environment `ci-integration` com restrição de branch e mover para ele `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ACCESS_TOKEN` e as credenciais E2E.
34. Remover o secret `SUPABASE_DB_URL` (não usado e expõe acesso direto ao Postgres de produção).
35. Trocar `SUPABASE_ACCESS_TOKEN` (token de conta, acessa todos os projetos) por um token dedicado, de escopo mínimo.
36. `cron-monitoring`: tirar a service_role do `env` do job e passar só no step que usa.
37. `cron-monitoring`: remover o hack `SUPABASE_SERVICE_ROLE_KEY="$VITE_SUPABASE_PUBLISHABLE_KEY"`. Rodar sempre a suíte completa, ou declarar o skip.
38. Unificar `VITE_SUPABASE_PROJECT_ID` (secret em um workflow, hardcoded em outro) em uma variável de repo (`vars.`).
39. Documentar a rotação trimestral dos secrets (alinhar com o #184) e criar um lembrete agendado.
40. Garantir que nenhum job de PR de fork ou do Dependabot receba secret (auditar todos os `if:`).

## FASE 5 — Parar de testar contra produção (P0 de risco de dados)

41. Decisão de negócio: criar um projeto Supabase de staging/CI. Tem custo (~US$25/mês ou branch do Supabase), e a decisão é sua.
42. Alternativa sem custo: `supabase start` + `supabase db reset` no runner (Postgres efêmero com as 595 migrations).
43. Apontar E2E (`pr-checks`) para o banco efêmero/staging, não para `usyxfpqlsspldubptrdl`.
44. Apontar Quote-to-Sale E2E para o mesmo ambiente.
45. Rodar `verify-quote-to-sale-invariants` contra produção só via `schedule`/`push:main`, em modo leitura.
46. Criar seed determinístico para a conta E2E (hoje depende de dados reais).
47. Novo job "Migrations apply cleanly": `supabase db reset` em PR que toca `supabase/migrations/**` (verificar sobreposição com o #198).
48. Gate de timestamp de migration estritamente crescente e único (regra 3 do CLAUDE.md, hoje só manual).

## FASE 6 — Corrigir gates que dão falso vermelho (P1)

49. Types Drift: gerar os tipos a partir do banco efêmero (`supabase gen types --local`) após aplicar as migrations da PR, e não do banco de produção.
50. Enquanto o 49 não sai: rodar o Types Drift só em `push:main` / `schedule`, não em PR.
51. Quote-to-Sale: diagnosticar o exit 2 do script de invariants (o log não mostra a causa) e fazer o script imprimir qual invariante quebrou.
52. Quote-to-Sale: trocar o path `supabase/functions/**` pelos paths reais do fluxo (`receive-quote-*`, `send-quote-*`, `notify-quote-*`).
53. Quote-to-Sale: adicionar guarda de fork/Dependabot (hoje não tem `if:` e falha nessas PRs).
54. Quote-to-Sale: substituir a lógica duplicada de "configuração parcial" por um script compartilhado (`scripts/ci/check-e2e-env.sh`).
55. Lockfile drift do Deno: trocar `deno install --frozen=false` + diff por `deno install --frozen`, que falha direto, sem mutar.
56. `cron-monitoring`: o step "Sync deno.lock" (`--frozen=false`) esconde o drift. Usar `--frozen`.
57. `.lighthouserc.json`: remover `url` (conflita com `staticDistDir`) e calibrar os budgets (alinhar com o #189).
58. Lighthouse: trocar `upload.target` de `temporary-public-storage` para `filesystem` + artifact (D12).
59. `security-audit`: manter fora dos required checks, mas abrir issue automática quando falhar em `main`.

## FASE 7 — QA semanal confiável (P1)

60. QA: buildar com as envs placeholder (igual ao `pr-checks`) para Lighthouse e a11y não medirem tela branca.
61. QA: remover o `|| echo warning` do Lighthouse, para regressão real falhar.
62. QA: usar `treosh/lighthouse-ci-action` (igual ao `pr-checks`) em vez de install global + preview manual.
63. QA: subir o `vite preview` uma vez só, para Lighthouse e a11y.
64. QA: trocar `npx tsc --noEmit` por `npm run typecheck` (mesma fonte de verdade).
65. QA: dividir o job único de 30 min em jobs paralelos (static, deno, build+lhci, a11y) com `needs` mínimos.
66. QA: tirar do Summary os números fixos ("293+", "917") e gerar a partir do output real.
67. QA: abrir/atualizar uma issue `ci-weekly-failure` quando falhar (e fechar quando voltar a verde).
68. Cron Monitoring: mesma regra de issue automática na falha do agendamento diário.
69. CodeQL: enviar os alertas high/critical novos para a mesma issue/canal.

## FASE 8 — Performance e custo do CI (P2)

70. Criar a composite action `.github/actions/setup-node-deps` (checkout + node + `npm ci`), hoje repetida 12×.
71. Usar `node-version-file: .nvmrc` (o arquivo existe, valor 22) em vez de `'22'` hardcoded em 9 lugares.
72. Criar a composite `setup-deno` com cache (hoje só 2 dos 5 usos têm cache).
73. Buildar uma vez só por PR: o job `build` sobe o `dist/` como artifact, e Lighthouse e Bundle Size baixam (hoje são 3 builds).
74. Bundle-size: usar o artifact com `ANALYZE_BUNDLE=1` do build único.
75. Cache dos browsers do Playwright (`~/.cache/ms-playwright`) com chave pela versão do `@playwright/test`.
76. E2E de PR: só chromium. Deixar webkit para `push:main`/semanal (corta ~3 min por PR).
77. Rodar `lint-and-typecheck` em paralelo (lint ∥ typecheck ∥ secrets) em vez de sequencial.
78. Tirar o `needs: lint-and-typecheck` de `test`/`build` (feedback mais rápido; os required checks continuam garantindo).
79. Paralelizar o Vitest com sharding (`--shard`) se passar de 5 min.
80. Concorrência em `push:main`: grupo por SHA (`github.sha`) para não descartar run pendente (D7).
81. Adicionar `paths-ignore` (docs/md) também em CodeQL, Graphify e Quote-to-Sale.
82. Revisar o `retention-days` (30 dias para relatório Playwright é demais; 7 basta) e o uso de cache/armazenamento.
83. Remover o step "Check build size", que só imprime `du -sh` (o guard real é o bundle budget).

## FASE 9 — Observabilidade e notificação (P2)

84. Configurar `SLACK_CI_WEBHOOK_URL`, ou trocar por notificação WhatsApp via Evolution/N8N, que é o canal que vocês usam.
85. Fazer o `notify-failure` disparar só em `push:main` e `schedule` (falha de PR o autor já vê).
86. Incluir no alerta o job que falhou e o commit/autor, não só o link do run.
87. Publicar o resumo de cobertura, bundle e Lighthouse como comentário fixo na PR (sticky comment).
88. Badge de status dos workflows críticos no README.
89. Job semanal que mede a taxa de falha e flaky por workflow (via API) e publica no Summary.

## FASE 10 — Dependabot e manutenção (P2)

90. Dependabot: adicionar `cooldown` de 3–7 dias (evita pacote recém-publicado/comprometido).
91. Dependabot: `ignore` de majors arriscadas (tailwind 3→4 está aberto desde 14/09, o #152), tratadas como projeto à parte.
92. Dependabot: grupo catch-all `minor-and-patch` para reduzir o número de PRs.
93. Auto-merge de patch/minor do Dependabot quando os required checks passarem (workflow com `dependabot/fetch-metadata`).
94. Tratar o #178 (setup-uv v7→v10, major) com teste do `graphify.yml` antes do merge.
95. Adicionar o ecossistema `npm` para `tools/graphify` / `uv` se houver lockfile próprio.

## FASE 11 — Deploy e pós-merge (P2/P3)

96. Workflow de deploy das Edge Functions em `push:main` (`supabase functions deploy` só das alteradas), com Environment `production` e aprovação manual. Hoje o deploy é manual e invisível.
97. Smoke test pós-deploy: chamar o health das funções críticas e a URL do Lovable após o merge.
98. Ligar o `.github/workflows/README.md` ao estado real (falta o `edge-functions-input-validation` do #195; CodeQL também roda em PR) e validar com um check de sincronia.
99. `npm run ci` local espelhando exatamente os required checks (hoje faltam deno lint, request-id e lockfile).
100. Revisão final: matriz workflow × gatilho × required × secrets × custo/min, publicada em `docs/estado/CI_ESTADO_<data>.md`, e reauditoria em 30 dias.

---

## Execução sugerida (PRs pequenas, uma por assunto)

| Onda | Etapas | Merge |
|------|--------|-------|
| A — main verde | 4–8 | autônomo (fix de config) |
| B — ruleset/CODEOWNERS | 9–19 | **aguarda você** (governança) |
| C — hardening de Actions | 20–32 | **aguarda você** (CI/segredos) |
| D — secrets/ambientes | 33–40 | **aguarda você** |
| E — sair de produção | 41–48 | **aguarda você** (custo + arquitetura) |
| F — falsos vermelhos | 49–59 | aguarda você (CI) |
| G — QA semanal | 60–69 | aguarda você (CI) |
| H — performance | 70–83 | aguarda você (CI) |
| I/J/K — observabilidade, Dependabot, deploy | 84–100 | aguarda você |

Pela regra 8 do seu fluxo Git, toda PR que mexe em CI/segredos fica aberta para o seu merge.
