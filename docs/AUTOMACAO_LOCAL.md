# Automação local — Promo_Champions_V2.1

O dispatcher `scripts/automation.mjs` liga as suites, o motor de manutenção e o adaptador de grafo. O perfil versionado `scripts/automation.config.json` é a fonte dos aliases e do registro exato de scripts. Apenas ferramentas determinísticas locais: não há chamadas de IA nem cobrança de API de IA. O CI usa minutos do GitHub Actions sujeitos ao plano da conta; execução local usa os recursos da máquina.

## Comandos

| Alias                        | Comando executado                                       | Efeito                                                                                |
| ---------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `automation:doctor`          | `node scripts/automation.mjs doctor`                    | Verifica arquivos, aliases, registros e instalação local de hooks.                    |
| `automation:test`            | `node scripts/automation.mjs test`                      | Roda exclusivamente as suites registradas abaixo.                                     |
| `automation:check`           | `node scripts/automation.mjs check --ref HEAD`          | Inspeciona a referência HEAD em worktree isolada.                                     |
| `automation:heal`            | `node scripts/automation.mjs heal --ref origin/main`    | Propõe e valida correções limitadas a partir de origin/main; não faz push.            |
| `automation:nightly`         | `node scripts/automation.mjs nightly --ref origin/main` | Atualiza o grafo e tenta manutenção isolada; relata as duas falhas independentemente. |
| `automation:graph`           | `node scripts/automation.mjs graph`                     | Encaminha subcomandos do grafo; acrescente status, query, path ou explain.            |
| `automation:status`          | `node scripts/automation.mjs graph status`              | Mostra a situação local do grafo.                                                     |
| `automation:install-hooks`   | `node scripts/automation.mjs install-hooks`             | Instala pontes locais reversíveis, encadeando hooks originais.                        |
| `automation:uninstall-hooks` | `node scripts/automation.mjs uninstall-hooks`           | Restaura o hooksPath anterior, recusando sobrescrever alteração de terceiros.         |

O comando estático para CI é `node scripts/automation.mjs doctor --static`. Ele verifica contratos; não comprova merge, execução remota, timer ou ponte instalada. `doctor` sem `--static` também exige a instalação local. Ausência de dependência é erro explícito; o dispatcher não instala pacotes automaticamente.

## Gatilhos e ativação

| Gatilho                                                  | Cadeia real de execução                                                                                                                                                          | Ativação                                                                                                                                                                                                              |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PR para main / push em main / dispatch                   | `.github/workflows/automation-local.yml` → `doctor --static` → `test` → suites exatas do perfil                                                                                  | Workflow versionado; atividade remota depende de publicação/merge e run observado.                                                                                                                                    |
| pre-commit com tooling staged                            | Ponte privada → hook original → `automation.mjs hook pre-commit` → suites registradas                                                                                            | `automation:install-hooks` instala por clone; não é instalado pelo prepare.                                                                                                                                           |
| pre-push                                                 | Ponte privada → hook original → doctor local → suites registradas                                                                                                                | A mesma instalação local; erro bloqueia a operação.                                                                                                                                                                   |
| Fontes staged / post-commit / post-merge / post-checkout | Ponte privada → hook original → adaptador de grafo marca estado sujo                                                                                                             | Não reconstrói grafo durante commit nem altera staging.                                                                                                                                                               |
| Noturno local, previsto 04:30                            | `repo-maintenance.service` → `repo-automation-nightly` → `repo-automation nightly` → `central.mjs` → suites do snapshot → nightly do snapshot → graph ensure + motor bridge heal | Configuração do timer fica fora do repositório, sob responsabilidade do runtime local. A cadeia instalada usa o snapshot aprovado antes do merge; presença dos arquivos versionados não comprova serviço/timer ativo. |

A ponte privada fica em `.tools/repo-automation/`; não substitui os arquivos Husky. Preserva erros, argumentos e stdin dos hooks originais, incluindo commit-msg. `prepare`, hooks e guards existentes foram preservados. Para reverter, use `automation:uninstall-hooks`. `nightly.command` declara o comando real do core. O timer instalado usa o snapshot aprovado por projeto antes do merge; o alias `automation:nightly` chama o core versionado manualmente após integração. Não há callback shell redundante no repositório nem `nightly.file` fictício. A existência do perfil não comprova agendamento ativo. O runtime deve conferir `systemctl --user status` e a cadeia do callback instalado antes de declarar o timer ativo.

## Suites efetivamente executadas

- `scripts/automation.unit.mjs`
- `scripts/maintenance/maintenance.unit.mjs`
- `scripts/graphify-local.unit.mjs`

As suites usam fixtures descartáveis e não executam os scripts operacionais do inventário. O motor mantém isolamento de rede, validações obrigatórias, escopo e quotas; um gate herdado vermelho bloqueia o patch. Nenhuma referência, tipo gerado, configuração de produção ou regra de negócio é alterada para forçar verde. O grafo usa o perfil específico `graphify.local.json`; seu estado local fica em `.tools/graphify/local-state/`.

## Registro exato dos demais scripts

Os registros `legacy` abaixo preservam ferramentas anteriores e seus chamadores; não são incluídos automaticamente no novo pipeline. Para arquivos TypeScript de apoio sem runner comprovado, o comando listado só valida o inventário; os chamadores originais continuam sendo a referência de execução. Referência literal indica onde o arquivo é citado, sem garantir que esse caminho rode nem autorização para executar operações contra serviços. Sem referência, o arquivo é mantido manual porque função, parâmetros e ambiente precisam de revisão antes de ativar qualquer gatilho. Scripts novos não cobertos por registro fazem `doctor --static` falhar; não existe registro genérico `scripts/**` para ocultá-los.

| Arquivo exato                                         | Invocação manual de inventário                               | Chamadores literais / justificativa                                                         |
| ----------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| `scripts/ai-context/cenarios.mjs`                     | `node scripts/ai-context/cenarios.mjs`                       | .github/workflows/contexto-testes.yml, .github/workflows/contexto.yml                       |
| `scripts/ai-context/gerar.mjs`                        | `node scripts/ai-context/gerar.mjs`                          | package.json:scripts, .github/workflows/contexto-testes.yml, .github/workflows/contexto.yml |
| `scripts/ai-context/gerar.unit.mjs`                   | `node --test scripts/ai-context/gerar.unit.mjs`              | package.json:scripts, .github/workflows/contexto-testes.yml, .github/workflows/contexto.yml |
| `scripts/bundle-edge-functions.ts`                    | `node scripts/automation.mjs doctor --static`                | .github/workflows/deploy.yml, .github/workflows/edge-functions-bundle.yml                   |
| `scripts/check-bundle-budget.mjs`                     | `node scripts/check-bundle-budget.mjs`                       | package.json:scripts, .github/workflows/pr-checks.yml, .github/workflows/qa-exhaustive.yml  |
| `scripts/check-coverage-ladder.mjs`                   | `node scripts/check-coverage-ladder.mjs`                     | package.json:scripts                                                                        |
| `scripts/check-coverage-ratchet.mjs`                  | `node scripts/check-coverage-ratchet.mjs`                    | package.json:scripts                                                                        |
| `scripts/check-data-layer.mjs`                        | `node scripts/check-data-layer.mjs`                          | package.json:scripts                                                                        |
| `scripts/check-deno-types.mjs`                        | `node scripts/check-deno-types.mjs`                          | .github/workflows/pr-checks.yml                                                             |
| `scripts/check-domain-boundaries.mjs`                 | `node scripts/check-domain-boundaries.mjs`                   | package.json:scripts                                                                        |
| `scripts/check-migrations.mjs`                        | `node scripts/check-migrations.mjs`                          | package.json:scripts, .github/workflows/deploy.yml, .github/workflows/pr-checks.yml         |
| `scripts/check-test-spec-patterns.ts`                 | `node scripts/automation.mjs doctor --static`                | package.json:scripts                                                                        |
| `scripts/check-typecheck-baseline.mjs`                | `node scripts/check-typecheck-baseline.mjs`                  | package.json:scripts                                                                        |
| `scripts/ci-check-forbidden.sh`                       | `sh scripts/ci-check-forbidden.sh`                           | Sem chamador literal; manter manual e revisar parâmetros/ambiente antes de executar.        |
| `scripts/ci/ai-context-generator.unit.mjs`            | `node --test scripts/ci/ai-context-generator.unit.mjs`       | .github/workflows/contexto-testes.yml                                                       |
| `scripts/ci/check-claude-md-integrity.mjs`            | `node scripts/ci/check-claude-md-integrity.mjs`              | .github/workflows/contexto-testes.yml, .github/workflows/pr-checks.yml                      |
| `scripts/ci/contexto-indice.unit.mjs`                 | `node --test scripts/ci/contexto-indice.unit.mjs`            | .github/workflows/contexto-testes.yml                                                       |
| `scripts/ci/contexto-publicacao.unit.mjs`             | `node --test scripts/ci/contexto-publicacao.unit.mjs`        | .github/workflows/contexto-testes.yml                                                       |
| `scripts/ci/inventario-banco.unit.mjs`                | `node --test scripts/ci/inventario-banco.unit.mjs`           | .github/workflows/contexto-testes.yml                                                       |
| `scripts/ci/inventario-mudou.unit.mjs`                | `node --test scripts/ci/inventario-mudou.unit.mjs`           | .github/workflows/contexto-testes.yml                                                       |
| `scripts/ci/inventario-rotas.unit.mjs`                | `node --test scripts/ci/inventario-rotas.unit.mjs`           | .github/workflows/contexto-testes.yml                                                       |
| `scripts/ci/lint-ratchet.mjs`                         | `node scripts/ci/lint-ratchet.mjs`                           | .github/workflows/contexto-testes.yml                                                       |
| `scripts/ci/regras-negocio.unit.mjs`                  | `node --test scripts/ci/regras-negocio.unit.mjs`             | .github/workflows/contexto-testes.yml                                                       |
| `scripts/ci/supabase-snapshot.unit.mjs`               | `node --test scripts/ci/supabase-snapshot.unit.mjs`          | .github/workflows/contexto-testes.yml                                                       |
| `scripts/ci/typecheck-ratchet.mjs`                    | `node scripts/ci/typecheck-ratchet.mjs`                      | .github/workflows/contexto-testes.yml                                                       |
| `scripts/ci/types-sync.unit.mjs`                      | `node --test scripts/ci/types-sync.unit.mjs`                 | .github/workflows/contexto-testes.yml                                                       |
| `scripts/codemod-money.mjs`                           | `node scripts/codemod-money.mjs`                             | Sem chamador literal; manter manual e revisar parâmetros/ambiente antes de executar.        |
| `scripts/codemod-typography.mjs`                      | `node scripts/codemod-typography.mjs`                        | Sem chamador literal; manter manual e revisar parâmetros/ambiente antes de executar.        |
| `scripts/db-audit/check-migration-drift.mjs`          | `node scripts/db-audit/check-migration-drift.mjs`            | Sem chamador literal; manter manual e revisar parâmetros/ambiente antes de executar.        |
| `scripts/db-audit/gen-migration-probes.mjs`           | `node scripts/db-audit/gen-migration-probes.mjs`             | .github/workflows/db-probe.yml                                                              |
| `scripts/db-audit/gen-migration-probes.test.mjs`      | `node --test scripts/db-audit/gen-migration-probes.test.mjs` | scripts/db-audit/gen-migration-probes.mjs                                                   |
| `scripts/db/simulate-migrations-via-mcp.ts`           | `node scripts/automation.mjs doctor --static`                | Sem chamador literal; manter manual e revisar parâmetros/ambiente antes de executar.        |
| `scripts/debt-report.mjs`                             | `node scripts/debt-report.mjs`                               | package.json:scripts                                                                        |
| `scripts/deno-test-suite.mjs`                         | `node scripts/deno-test-suite.mjs`                           | package.json:scripts, .github/workflows/pr-checks.yml                                       |
| `scripts/dev-kpis-as-role.sh`                         | `sh scripts/dev-kpis-as-role.sh`                             | Sem chamador literal; manter manual e revisar parâmetros/ambiente antes de executar.        |
| `scripts/e2e-precheck.mjs`                            | `node scripts/e2e-precheck.mjs`                              | .github/workflows/pr-checks.yml, .github/workflows/quote-to-sale-e2e.yml                    |
| `scripts/flaky-report.mjs`                            | `node scripts/flaky-report.mjs`                              | package.json:scripts, .github/workflows/pr-checks.yml                                       |
| `scripts/gen-api-catalog.mjs`                         | `node scripts/gen-api-catalog.mjs`                           | Sem chamador literal; manter manual e revisar parâmetros/ambiente antes de executar.        |
| `scripts/gen-data-dict.mjs`                           | `node scripts/gen-data-dict.mjs`                             | Sem chamador literal; manter manual e revisar parâmetros/ambiente antes de executar.        |
| `scripts/generate-role-permissions-seed.mjs`          | `node scripts/generate-role-permissions-seed.mjs`            | Sem chamador literal; manter manual e revisar parâmetros/ambiente antes de executar.        |
| `scripts/graphify/catalog-adapter.mjs`                | `node scripts/graphify/catalog-adapter.mjs`                  | package.json:scripts, .github/workflows/graphify.yml                                        |
| `scripts/graphify/catalog-adapter.test.mjs`           | `node --test scripts/graphify/catalog-adapter.test.mjs`      | package.json:scripts, .github/workflows/graphify.yml                                        |
| `scripts/graphify/docs-index.mjs`                     | `node scripts/graphify/docs-index.mjs`                       | package.json:scripts, .github/workflows/graphify.yml                                        |
| `scripts/graphify/docs-index.test.mjs`                | `node --test scripts/graphify/docs-index.test.mjs`           | package.json:scripts, .github/workflows/graphify.yml                                        |
| `scripts/graphify/extract-code-only.mjs`              | `node scripts/graphify/extract-code-only.mjs`                | package.json:scripts, .github/workflows/graphify.yml                                        |
| `scripts/graphify/extract-code-only.test.mjs`         | `node --test scripts/graphify/extract-code-only.test.mjs`    | package.json:scripts, .github/workflows/graphify.yml                                        |
| `scripts/graphify/graphify-utils.mjs`                 | `node scripts/graphify/graphify-utils.mjs`                   | package.json:scripts, .github/workflows/graphify.yml                                        |
| `scripts/graphify/graphify-utils.test.mjs`            | `node --test scripts/graphify/graphify-utils.test.mjs`       | package.json:scripts, .github/workflows/graphify.yml                                        |
| `scripts/graphify/impact-report.mjs`                  | `node scripts/graphify/impact-report.mjs`                    | package.json:scripts, .github/workflows/graphify.yml                                        |
| `scripts/graphify/multigraph.mjs`                     | `node scripts/graphify/multigraph.mjs`                       | package.json:scripts, .github/workflows/graphify.yml                                        |
| `scripts/graphify/multigraph.test.mjs`                | `node --test scripts/graphify/multigraph.test.mjs`           | package.json:scripts, .github/workflows/graphify.yml                                        |
| `scripts/graphify/reconcile-catalog.mjs`              | `node scripts/graphify/reconcile-catalog.mjs`                | package.json:scripts, .github/workflows/graphify.yml                                        |
| `scripts/graphify/static-contracts.mjs`               | `node scripts/graphify/static-contracts.mjs`                 | package.json:scripts, .github/workflows/graphify.yml                                        |
| `scripts/graphify/static-contracts.test.mjs`          | `node --test scripts/graphify/static-contracts.test.mjs`     | package.json:scripts, .github/workflows/graphify.yml                                        |
| `scripts/graphify/verify-output.mjs`                  | `node scripts/graphify/verify-output.mjs`                    | package.json:scripts, .github/workflows/graphify.yml                                        |
| `scripts/inventario/gerar-banco.mjs`                  | `node scripts/inventario/gerar-banco.mjs`                    | .github/workflows/contexto-testes.yml, .github/workflows/inventario-estado-semanal.yml      |
| `scripts/inventario/gerar-repo.mjs`                   | `node scripts/inventario/gerar-repo.mjs`                     | .github/workflows/contexto-testes.yml, .github/workflows/inventario-estado-semanal.yml      |
| `scripts/inventario/gerar-rotas.mjs`                  | `node scripts/inventario/gerar-rotas.mjs`                    | .github/workflows/contexto-testes.yml, .github/workflows/inventario-estado-semanal.yml      |
| `scripts/inventario/mudou-conteudo.mjs`               | `node scripts/inventario/mudou-conteudo.mjs`                 | .github/workflows/contexto-testes.yml, .github/workflows/inventario-estado-semanal.yml      |
| `scripts/lib/requireSupabaseAdminEnv.ts`              | `node scripts/automation.mjs doctor --static`                | Sem chamador literal; manter manual e revisar parâmetros/ambiente antes de executar.        |
| `scripts/lint-input-validation.ts`                    | `node scripts/automation.mjs doctor --static`                | .github/workflows/edge-functions-input-validation.yml                                       |
| `scripts/lint-request-id.ts`                          | `node scripts/automation.mjs doctor --static`                | .github/workflows/edge-functions-request-id.yml                                             |
| `scripts/load/k6-smoke.js`                            | `node scripts/load/k6-smoke.js`                              | package.json:scripts, .github/workflows/pr-checks.yml                                       |
| `scripts/pack-quote-to-sale-artifacts.ts`             | `node scripts/automation.mjs doctor --static`                | Sem chamador literal; manter manual e revisar parâmetros/ambiente antes de executar.        |
| `scripts/prod-health-check.ts`                        | `node scripts/automation.mjs doctor --static`                | Sem chamador literal; manter manual e revisar parâmetros/ambiente antes de executar.        |
| `scripts/regras_negocio/generate.py`                  | `python3 scripts/regras_negocio/generate.py`                 | .github/workflows/contexto-testes.yml, .github/workflows/contexto.yml                       |
| `scripts/regras_negocio/indice.py`                    | `python3 scripts/regras_negocio/indice.py`                   | .github/workflows/contexto-testes.yml, .github/workflows/contexto.yml                       |
| `scripts/regras_negocio/publish.sh`                   | `sh scripts/regras_negocio/publish.sh`                       | .github/workflows/contexto-testes.yml, .github/workflows/contexto.yml                       |
| `scripts/regras_negocio/test_generate.py`             | `python3 scripts/regras_negocio/test_generate.py`            | .github/workflows/contexto-testes.yml, .github/workflows/contexto.yml                       |
| `scripts/run-sql-tests.sh`                            | `sh scripts/run-sql-tests.sh`                                | package.json:scripts, .github/workflows/pr-checks.yml                                       |
| `scripts/run-win-loss-analysis.ts`                    | `node scripts/automation.mjs doctor --static`                | Sem chamador literal; manter manual e revisar parâmetros/ambiente antes de executar.        |
| `scripts/security/check-no-committed-service-role.ts` | `node scripts/automation.mjs doctor --static`                | package.json:scripts                                                                        |
| `scripts/seed-august-sales.ts`                        | `node scripts/automation.mjs doctor --static`                | Sem chamador literal; manter manual e revisar parâmetros/ambiente antes de executar.        |
| `scripts/seed-deal-outcomes.ts`                       | `node scripts/automation.mjs doctor --static`                | Sem chamador literal; manter manual e revisar parâmetros/ambiente antes de executar.        |
| `scripts/seed-fake-data.ts`                           | `node scripts/automation.mjs doctor --static`                | Sem chamador literal; manter manual e revisar parâmetros/ambiente antes de executar.        |
| `scripts/seed-probe.ts`                               | `node scripts/automation.mjs doctor --static`                | Sem chamador literal; manter manual e revisar parâmetros/ambiente antes de executar.        |
| `scripts/seed-race-cars.ts`                           | `node scripts/automation.mjs doctor --static`                | Sem chamador literal; manter manual e revisar parâmetros/ambiente antes de executar.        |
| `scripts/seed-real-people.ts`                         | `node scripts/automation.mjs doctor --static`                | Sem chamador literal; manter manual e revisar parâmetros/ambiente antes de executar.        |
| `scripts/smoke-target-backend.ts`                     | `node scripts/automation.mjs doctor --static`                | package.json:scripts                                                                        |
| `scripts/smokeTargetHelpers.ts`                       | `node scripts/automation.mjs doctor --static`                | Sem chamador literal; manter manual e revisar parâmetros/ambiente antes de executar.        |
| `scripts/sql-coverage-matrix.mjs`                     | `node scripts/sql-coverage-matrix.mjs`                       | scripts/run-sql-tests.sh                                                                    |
| `scripts/supabase_snapshot/snapshot.py`               | `python3 scripts/supabase_snapshot/snapshot.py`              | .github/workflows/contexto-testes.yml, .github/workflows/contexto.yml                       |
| `scripts/supabase_snapshot/test_snapshot.py`          | `python3 scripts/supabase_snapshot/test_snapshot.py`         | .github/workflows/contexto-testes.yml, .github/workflows/contexto.yml                       |
| `scripts/types-sync/validar.mjs`                      | `node scripts/types-sync/validar.mjs`                        | .github/workflows/contexto-testes.yml, .github/workflows/types-sync.yml                     |
| `scripts/update-coverage-baseline.mjs`                | `node scripts/update-coverage-baseline.mjs`                  | package.json:scripts                                                                        |
| `scripts/update-typecheck-baseline.mjs`               | `node scripts/update-typecheck-baseline.mjs`                 | package.json:scripts                                                                        |
| `scripts/verify-dispatcher-request-id.sh`             | `sh scripts/verify-dispatcher-request-id.sh`                 | Sem chamador literal; manter manual e revisar parâmetros/ambiente antes de executar.        |
| `scripts/verify-quote-to-sale-invariants.ts`          | `node scripts/automation.mjs doctor --static`                | .github/workflows/quote-to-sale-e2e.yml                                                     |

## Hooks e workflows anteriores

Hooks inventariados: `.husky/_` era o hooksPath observado. A tabela registra os arquivos, sem afirmar bootstrap instalado ou execução efetiva em outro clone. O registro legacy desses hooks limita apenas execução arbitrária pelo dispatcher; o Git e a ponte preservam os gatilhos originais.

| Hook exato             | Gatilho Git original | Referência de inventário                              |
| ---------------------- | -------------------- | ----------------------------------------------------- |
| `.husky/commit-msg`    | `commit-msg`         | Hook preservado e encadeado antes do novo dispatcher. |
| `.husky/post-checkout` | `post-checkout`      | Hook preservado e encadeado antes do novo dispatcher. |
| `.husky/post-commit`   | `post-commit`        | Hook preservado e encadeado antes do novo dispatcher. |
| `.husky/pre-commit`    | `pre-commit`         | Hook preservado e encadeado antes do novo dispatcher. |

Workflows anteriores preservados: 25. Os gatilhos e condições de cada arquivo continuam definidos no YAML original; esta listagem não os promove ao novo pipeline e não executa suas operações.

- `.github/workflows/a11y-sweep.yml`
- `.github/workflows/apply-migration.yml`
- `.github/workflows/ci-failure-alert.yml`
- `.github/workflows/codeql.yml`
- `.github/workflows/contexto-testes.yml`
- `.github/workflows/contexto.yml`
- `.github/workflows/cron-monitoring.yml`
- `.github/workflows/db-backup.yml`
- `.github/workflows/db-probe.yml`
- `.github/workflows/dependabot-automerge.yml`
- `.github/workflows/dependabot-fix-lockfile.yml`
- `.github/workflows/deploy.yml`
- `.github/workflows/edge-functions-bundle.yml`
- `.github/workflows/edge-functions-input-validation.yml`
- `.github/workflows/edge-functions-request-id.yml`
- `.github/workflows/graphify.yml`
- `.github/workflows/inventario-estado-semanal.yml`
- `.github/workflows/main.yml`
- `.github/workflows/migrations-drift.yml`
- `.github/workflows/pr-checks.yml`
- `.github/workflows/pr-review-sla.yml`
- `.github/workflows/qa-exhaustive.yml`
- `.github/workflows/quote-to-sale-e2e.yml`
- `.github/workflows/release-please.yml`
- `.github/workflows/types-sync.yml`

Os helpers dos corretores anteriores são cobertos por suites de regressão em fixtures; a chamada operacional original continua no respectivo hook/workflow. Os quatro registros principais e helpers ficam explícitos no JSON, sem globs para novos arquivos.
