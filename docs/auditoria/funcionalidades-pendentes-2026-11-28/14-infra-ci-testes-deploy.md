# Infra, CI, testes e deploy

[Voltar ao índice](README.md)

667 itens não implementados, parciais ou não verificáveis neste domínio.

## Não implementado (185)

### F1166 · Etapa 35 (Graphify): Publicar visualização privada e utilizável

- **Tipo:** Componente
- **O que os docs afirmam:** HTML local por comunidade/filtro sem tela no produto; escape e a11y.
- **Fontes:** `docs/planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md:323-328`
- **O que falta:** Criar gerador de visualização agregada (por comunidade) em .graphify-local/ com escape de rótulos e fixture de HTML malicioso testada (scripts/graphify/*.test.mjs), conforme etapa 35.
- **Evidência:** docs/planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md:323-328 (pendente); docs/graphify/BASELINE_AST_SRC_2026-09-11.md:39 'não foi gerado HTML nem clusterização'; docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:485 etapa 35 = NI, 'graph.html ignorado; nenhuma alternativa'. `grep -rn -i 'html\\|escape\\|visualiz' scripts/graphify-local.mjs scripts/graphify/*.mjs` → 0 resultados (só docs/graphify/README.md:83, que proíbe publicar HTML).
- **Revisão:** sem contestação cética concluída.

### F3612 · Agendamento (cron) fn_check_slo_burn_rate (2 afirmações nos docs)

- **Tipo:** Agendamento (cron)
- **O que os docs afirmam:** Agendamento do SLO burn-rate no pg_cron está pendente.| NÃO INICIADO: função criada em 20261002000100_slo_burn_rate.sql sem cron.schedule.
- **Fontes:** `docs/runbooks/alertas-operacionais.md:65`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:321`
- **O que falta:** Falta o job pg_cron chamando public.fn_check_slo_burn_rate(), versionado em migration.
- **Evidência:** nenhum job em pg_cron para "fn_check_slo_burn_rate" (cron.md, 45 jobs)| cético: A função existe no banco real: contexto/supabase/functions.md:179 (public.fn_check_slo_burn_rate, grant só service_role). Nenhum job a agenda: grep -i slo cron.md → 0 resultados entre os 45 jobs. A migration supabase/migrations/20261002000100_slo_burn_rate.sql não contém cron.schedule.

### F3613 · Cron versionado `reindex-tables`

- **Tipo:** Agendamento (cron)
- **O que os docs afirmam:** O doc lista `reindex-tables` entre os 25 jobs pg_cron versionados em migrations (não verificado no banco).
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:5`
- **O que falta:** Falta o cron.schedule('reindex-tables') ativo e versionado. A afirmação do doc de que ele é 'versionado' é falsa.
- **Evidência:** nenhum job em pg_cron para "reindex-tables" (cron.md, 45 jobs)| cético: O cron nunca foi versionado de verdade. supabase/migrations/20260104184000_performance_indexes_additional.sql:64 só tem a linha comentada '-- SELECT cron.schedule('reindex-tables', ...)'. grep reindex cron.md → 0 resultados. A função public.reindex_tables existe no banco (functions.md:322), com grant anon, authenticated e service_role.

### F3614 · E-mails de alerta agendados por CRON (pg_cron)

- **Tipo:** Agendamento (cron)
- **O que os docs afirmam:** Alertas por e-mail baseados em CRON.
- **Fontes:** `docs/FEATURE_SUMMARY.md:80-80; docs/FUNCIONALIDADES_SISTEMA.md:509-509`
- **O que falta:** nenhum job em pg_cron para "pg_net" (cron.md, 45 jobs)
- **Evidência:** nenhum job em pg_cron para "pg_net" (cron.md, 45 jobs)| CONTESTADO pelo cético (PARCIAL): Há crons de alerta ativos via pg_net, e o helper public.trigger_internal_edge_job faz net.http_post com X-Cron-Secret (functions/public/trigger_internal_edge_job__f02f045c8b4350ab.sql:62-71). Jobs em cron.md: activity-goal-alerts-daily (linha 46), challenge-expiration-alerts-daily (47), send-alert-notifications-5min (48), sdr-consecutive-alerts-daily (45) e deal-risk-digest-daily (22). As execuções aparecem com succeeded (cron-runs.md:349-355). activity-goal-alerts envia e-mail via Resend (supabase/functions/activity-goal-alerts/index.ts:246-280) e está na allowlist de deploy.yml:144. Já send-alert-notifications, challenge-expiration-alerts e sdr-consecutive-alerts estão fora da allowlist, então o cron chama function não publicada. email_logs tem 0 linhas (stats.md:195).
- **Revisão:** em disputa. O cético propõe Parcial e o juiz ainda não decidiu.

### F3615 · Etapa 052 (CI): Schedule de smoke diário para edge-functions-bundle (deno check de 170 funções)

- **Tipo:** Agendamento (cron)
- **O que os docs afirmam:** Detecta esm.sh/npm: quebrado sem PR.
- **Fontes:** `docs/execucao/PLANO_WORKFLOWS_GITHUB_ACTIONS_100_ETAPAS_2026-09-27.md:124`
- **O que falta:** Falta adicionar 'schedule: - cron' diário em edge-functions-bundle.yml.
- **Evidência:** nenhum job em pg_cron para "edge-functions-bundle" (cron.md, 45 jobs)| cético: .github/workflows/edge-functions-bundle.yml:3-20 só dispara em push/pull_request. grep -c schedule .github/workflows/edge-functions-bundle.yml → 0.

### F3616 · Etapa 083 (CI): Job db-drift semanal comparando migrations do repo com schema_migrations do banco

- **Tipo:** Agendamento (cron)
- **O que os docs afirmam:** Abre issue se divergir.
- **Fontes:** `docs/execucao/PLANO_WORKFLOWS_GITHUB_ACTIONS_100_ETAPAS_2026-09-27.md:164`
- **O que falta:** nenhum job em pg_cron para "db-drift" (cron.md, 45 jobs)
- **Evidência:** nenhum job em pg_cron para "db-drift" (cron.md, 45 jobs)| CONTESTADO pelo cético (PARCIAL): .github/workflows/migrations-drift.yml:1-12 compara as migrations do repo com supabase_migrations.schema_migrations. O agendamento é diário, não semanal: schedule cron '0 7 * * *' (linha 26). Tem 'permissions: contents: read' (linhas 29-30) e não há criação de issue: grep issue migrations-drift.yml → 0.
- **Revisão:** em disputa. O cético propõe Parcial e o juiz ainda não decidiu.

### F1170 · Etapa 100 (CI): Revisão trimestral automatizada no N8N (actionlint/zizmor, actions desatualizadas, falhas de schedule)

- **Tipo:** Agendamento (cron)
- **O que os docs afirmam:** 1º dia do trimestre reabre este documento.
- **Fontes:** `docs/execucao/PLANO_WORKFLOWS_GITHUB_ACTIONS_100_ETAPAS_2026-09-27.md:187`
- **O que falta:** Criar o fluxo (no N8N ou como workflow `schedule: '0 9 1 1,4,7,10 *'`) rodando actionlint/zizmor e listando falhas de schedule dos 90 dias; painel N8N não acessível para confirmar fluxo externo.
- **Evidência:** docs/execucao/PLANO_WORKFLOWS_GITHUB_ACTIONS_100_ETAPAS_2026-09-27.md:187 (planejado). `grep -rn -i 'trimestr\\|quarter' .github/workflows/*.yml` → 0 resultados; única integração N8N no repo é .github/workflows/ci-failure-alert.yml:4-5,46-54 (alerta de falha em main). Nenhum artefato (workflow, script ou doc de fluxo) de revisão trimestral.
- **Revisão:** sem contestação cética concluída.

### F3617 · Lembrete automático de rotação de secrets

- **Tipo:** Agendamento (cron)
- **O que os docs afirmam:** docs/SECRETS_ROTATION.md:69-70 prevê lembrete; não existe.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:65`
- **O que falta:** Falta um workflow agendado (.github/workflows/secrets-rotation-reminder.yml) que abra issue de rotação trimestral/semestral.
- **Evidência:** nenhum job em pg_cron para "secrets-rotation-reminder" (cron.md, 45 jobs)| cético: Não há workflow de lembrete: grep -rni 'rotation\|rotação\|secrets-rotation' .github/workflows → 0 resultados. A política de cadência existe só como texto em docs/SECRETS_ROTATION.md:65-72.

### F3618 · Migration 20260903000002_fix_cron_project_ref (replace do ref antigo em cron.job)

- **Tipo:** Agendamento (cron)
- **O que os docs afirmam:** PR #103 adiciona UPDATE cron.job substituindo rapjswienfhkobhlamxb; tabela já vazia; não aplicada.
- **Fontes:** `docs/postmortems/2026-08-30_cron_outage.md:21`
- **O que falta:** nenhum job em pg_cron para "20260903000002_fix_cron_project_ref" (cron.md, 45 jobs)
- **Evidência:** nenhum job em pg_cron para "20260903000002_fix_cron_project_ref" (cron.md, 45 jobs)| CONTESTADO pelo cético (IMPLEMENTADO): O arquivo supabase/migrations/20260903000002_fix_cron_project_ref.sql existe. A versão consta como aplicada em contexto/supabase/migrations.md:610 (schema_migrations). grep -c rapjswienfhkobhlamxb cron.md → 0, ou seja, nenhum command com o ref antigo.
- **Revisão:** em disputa. O cético propõe Implementado e o juiz ainda não decidiu.

### F3619 · Migrations 20260831163000_secure_churn_and_task_crons e 20260831170000_secure_operational_edge_crons aplicadas

- **Tipo:** Agendamento (cron)
- **O que os docs afirmam:** Migrations de 31/08 reagendam 7 dos 25 jobs com segredos em _internal_secrets; nunca aplicadas (ledger parado em 20260802150910).
- **Fontes:** `docs/postmortems/2026-08-30_cron_outage.md:19`
- **O que falta:** nenhum job em pg_cron para "20260831163000_secure_churn_and_task_crons" (cron.md, 45 jobs)
- **Evidência:** nenhum job em pg_cron para "20260831163000_secure_churn_and_task_crons" (cron.md, 45 jobs)| CONTESTADO pelo cético (IMPLEMENTADO): As duas versões aparecem em schema_migrations: migrations.md:603 (20260831163000) e migrations.md:604 (20260831170000). Os 7 jobs dessas migrations estão ativos em cron.md: auto-task-queue-hourly (24), detect-client-churn-alerts-hourly (25), notify-v4-quote-status (26), check-v4-callback-alerts (27), cron-failure-alerter (28), process-call-recording-ingest (29) e edge-retry-threshold-alert (30). Todos usam _internal_secrets via trigger_internal_edge_job.
- **Revisão:** em disputa. O cético propõe Implementado e o juiz ainda não decidiu.

### F3620 · Restauração dos jobs cron HTTP perdidos em 2026-08-30

- **Tipo:** Agendamento (cron)
- **O que os docs afirmam:** mig/20260913150000:2-3 registra que os 25 jobs de produção sumiram em 2026-08-30; só os 12 SQL foram restaurados e os HTTP ficaram para "migration própria".
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/F_banco_dados.md:149,291`
- **O que falta:** nenhum job em pg_cron para "2026-08-30" (cron.md, 45 jobs)
- **Evidência:** nenhum job em pg_cron para "2026-08-30" (cron.md, 45 jobs)| CONTESTADO pelo cético (PARCIAL): Os 10 jobs HTTP declarados nas migrations 20260831170000, 20260910153000, 20261001144000 e 20261002010000 estão ativos em cron.md: ids 21, 26, 36, 37, 38, 39, 40, 41, 42 e 44 (linhas 22-33), com execuções succeeded em cron-runs.md:182-224. Porém 4 dos alvos estão fora da allowlist deploy.yml:144 e não rodam em produção: check-v4-callback-alerts, process-call-recording-ingest, winloss-webhook-health-monitor e webvitals-regression-alert.
- **Revisão:** em disputa. O cético propõe Parcial e o juiz ainda não decidiu.

### F3621 · SLO burn-rate (fn_slo_burn_rate, fn_check_slo_burn_rate) agendado

- **Tipo:** Agendamento (cron)
- **O que os docs afirmam:** Funções de SLO burn-rate sem cron nem consumidor.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/F_banco_dados.md:89,177`
- **O que falta:** nenhum job em pg_cron para "fn_slo_burn_rate" (cron.md, 45 jobs)
- **Evidência:** nenhum job em pg_cron para "fn_slo_burn_rate" (cron.md, 45 jobs)| CONTESTADO pelo cético (PARCIAL): As duas funções existem no banco real: functions.md:179 (fn_check_slo_burn_rate) e functions.md:193 (fn_slo_burn_rate); a primeira usa a segunda. Não há cron: grep -i slo cron.md → 0. Não há consumidor: grep -rn fn_check_slo_burn_rate src supabase/functions → só types.ts.
- **Revisão:** em disputa. O cético propõe Parcial e o juiz ainda não decidiu.

### F3622 · Timer noturno local 04:30 (repo-maintenance.service → repo-automation nightly → central.mjs)

- **Tipo:** Agendamento (cron)
- **O que os docs afirmam:** Configuração do timer fica fora do repositório; presença dos arquivos não comprova serviço ativo.
- **Fontes:** `docs/AUTOMACAO_LOCAL.md:29-31`
- **O que falta:** nenhum job em pg_cron para "repo-maintenance" (cron.md, 45 jobs)
- **Evidência:** nenhum job em pg_cron para "repo-maintenance" (cron.md, 45 jobs)| CONTESTADO pelo cético (NAO_VERIFICAVEL): Os scripts de automação local existem: scripts/automation.mjs:28 e :67 (ação 'nightly') e scripts/maintenance/run.mjs:439 ('repo-maintenance'). Já central.mjs e a unit do timer não estão no repo: git ls-files \| grep -iE 'central\.mjs\|repo-maintenance' → 0. O timer é uma unit systemd na máquina do runtime.
- **Revisão:** em disputa. O cético propõe Não verificável e o juiz ainda não decidiu.

### F1187 · 3 SLOs formais documentados no RUNBOOK (disponibilidade log-web-vitals, p95 top 5 functions, taxa DLQ)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Doc aponta SLOs sem definição auditável; ação: documentar 3 SLOs com query pronta no RUNBOOK.
- **Fontes:** `docs/auditoria/AUDITORIA_TECNICA_EXAUSTIVA_2026-09-02.md:235,240,577`
- **O que falta:** Criar seção 'SLOs' em docs/RUNBOOK.md com target numérico e query SQL para cada um dos 3 (web_vitals/edge_function_metrics/dead-letter), ligada aos alertas existentes.
- **Evidência:** `grep -rn -i slo docs/RUNBOOK.md` → 0 resultados (368 linhas). docs/PROCESSOS.md:68-77 'Revisão mensal de SLOs' declara os 3 SLOs como Pendente. docs/runbooks/alertas-operacionais.md:50-66 documenta só burn-rate (fn_check_slo_burn_rate, thresholds em app_config) com agendamento pg_cron pendente — não são os 3 SLOs (disponibilidade log-web-vitals, p95 top 5 functions, taxa DLQ) com query pronta. Fonte: AUDITORIA_TECNICA_EXAUSTIVA_2026-09-02.md:240.
- **Revisão:** sem contestação cética concluída.

### F1200 · Achado U: Lighthouse com upload.target temporary-public-storage e numberOfRuns 3

- **Tipo:** Doc/config
- **O que os docs afirmam:** Relatório em URL pública; 3 runs por PR.
- **Fontes:** `docs/execucao/PLANO_WORKFLOWS_GITHUB_ACTIONS_100_ETAPAS_2026-09-27.md:49`
- **O que falta:** Em .lighthouserc.json trocar `upload.target` para `filesystem` (o artefato já sobe via uploadArtifacts em pr-checks.yml:633) e reduzir `numberOfRuns` para 1 em PR; ou registrar em docs/ que a URL pública temporária é aceita.
- **Evidência:** .lighthouserc.json:7 `"numberOfRuns": 3` e :23-25 `"upload": {"target": "temporary-public-storage"}` inalterados; usado por pr-checks.yml:631-634 (treosh/lighthouse-ci-action, uploadArtifacts: true) e qa-exhaustive.yml:117. Nenhum doc registra aceite da URL pública.
- **Revisão:** sem contestação cética concluída.

### F1204 · ADR de topologia (destino de rapjs)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Etapa 3 P: decisão em IDENTIDADE_BANCO e CLAUDE.md, sem ADR.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:21`
- **O que falta:** Criar docs/decisions/ADR-011-topologia-banco-canonico.md (Status/Contexto/Decisão/Consequências) consolidando: usyxfpqlsspldubptrdl como único Supabase do repo e destino do projeto rapjswienfhkobhlamxb (desativar/despublicar functions), referenciando IDENTIDADE_BANCO_2026-09-13.md.
- **Evidência:** ausente: `grep -rln 'rapjs\\|topologia\\|usyxf' docs/decisions/*.md` → 0 resultados; docs/decisions tem ADR-001..010 (RBAC, React Query, RLS, circuit breaker, idempotência, request-id, retenção, SECURITY DEFINER, sessionStorage/CSP, service layer, WebAuthn), nenhum sobre topologia/banco canônico. A decisão de fato segue em docs/estado/IDENTIDADE_BANCO_2026-09-13.md e AGENTS.md §7, como aponta docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:21.
- **Revisão:** sem contestação cética concluída.

### F1207 · Ambiente de staging

- **Tipo:** Doc/config
- **O que os docs afirmam:** Não existe staging; docs/STAGING.md contradiz.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:125`
- **O que falta:** Decisão de custo do dono: criar projeto Supabase de staging (STAGING.md §1) e cadastrar STAGING_SUPABASE_URL/PUBLISHABLE_KEY/DB_URL nos secrets do GitHub, apontando e2e/sql-tests para ele; alternativa barata: job com `supabase start` (Docker) aplicando supabase/migrations para sql-tests.
- **Evidência:** docs/STAGING.md:3: 'Hoje existe um único projeto Supabase de produção (usyxfpqlsspldubptrdl)'; §7 'CI com staging (futuro)' (STAGING.md:66-70). Nenhum workflow sobe banco efêmero: `grep -nE 'supabase (start\|db start)\|services:\|image: (postgres\|supabase)' .github/workflows/*.yml` → 0; sql-tests usa `SUPABASE_DB_URL` de produção (pr-checks.yml:384,396-400); e2e roda no environment pr-preview contra o backend real (pr-checks.yml:472, quote-to-sale-e2e.yml:66,107). Não há secrets STAGING_* (API list_actions_secrets: 10 secrets, nenhum STAGING).
- **Revisão:** sem contestação cética concluída.

### F1215 · Arquivo tests/components/TelemetryCharts.test.tsx citado em TELEMETRY_MODULE_DOCS.md nunca existiu

- **Tipo:** Doc/config
- **O que os docs afirmam:** Citado como prova em TELEMETRY_MODULE_DOCS.md; git log --all mostra que nunca existiu no repositório.
- **Fontes:** `docs/estado/14_VERIFICACAO_DA_AUDITORIA.md:139`
- **O que falta:** Criar o spec de gráficos de telemetria ou remover a tabela/exemplos da seção 9 (docs/TELEMETRY_MODULE_DOCS.md:692-756).
- **Evidência:** ausente: ls tests/components/TelemetryCharts.test.tsx → No such file; git log --all --oneline -- tests/components/TelemetryCharts.test.tsx (histórico completo, 12.915 commits após --unshallow) → 0 commits. Doc ainda cita: docs/TELEMETRY_MODULE_DOCS.md:8, :695 ("38 testes"), :731, :754; o próprio cabeçalho docs/TELEMETRY_MODULE_DOCS.md:7-11 admite que os arquivos não existem (verificado 2026-10-18). Único teste de telemetria que já existiu: src/components/admin/telemetry/**tests**/TelemetryModule.test.tsx (commit bd52c0991), também ausente no HEAD.| cético: ausente: ls tests/components/TelemetryCharts.test.tsx → No such file; git log --all --oneline -- tests/components/TelemetryCharts.test.tsx → 0 commits (repo não shallow, 13.743 commits). Doc ainda cita: docs/TELEMETRY_MODULE_DOCS.md:8, :695 ("38" testes), :731, :754; cabeçalho docs/TELEMETRY_MODULE_DOCS.md:6-11 já admite que não exist…

### F1216 · Arquivo tests/lib/external-db-bridge-telemetry.test.ts citado em TELEMETRY_MODULE_DOCS.md nunca existiu

- **Tipo:** Doc/config
- **O que os docs afirmam:** Citado como prova em TELEMETRY_MODULE_DOCS.md; git log --all mostra que nunca existiu no repositório.
- **Fontes:** `docs/estado/14_VERIFICACAO_DA_AUDITORIA.md:141`
- **O que falta:** Criar o teste de emitTelemetry da external-db-bridge ou remover docs/TELEMETRY_MODULE_DOCS.md:697 e :753-756.
- **Evidência:** ausente: ls tests/lib/external-db-bridge-telemetry.test.ts → No such file; git log --all -- tests/lib/external-db-bridge-telemetry.test.ts (histórico completo) → 0 commits. Citado em docs/TELEMETRY_MODULE_DOCS.md:9, :697 ("67 testes"), :756; cabeçalho :7-11 reconhece a inexistência.| cético: ausente: ls tests/lib/external-db-bridge-telemetry.test.ts → No such file; git log --all -- tests/lib/external-db-bridge-telemetry.test.ts → 0 commits. Citado em docs/TELEMETRY_MODULE_DOCS.md:9, :697 ("67"), :756; cabeçalho :6-11 reconhece a inexistência.

### F1217 · Arquivo tests/lib/telemetry-logic.test.ts citado em TELEMETRY_MODULE_DOCS.md nunca existiu

- **Tipo:** Doc/config
- **O que os docs afirmam:** Citado como prova em TELEMETRY_MODULE_DOCS.md; git log --all mostra que nunca existiu no repositório.
- **Fontes:** `docs/estado/14_VERIFICACAO_DA_AUDITORIA.md:140`
- **O que falta:** Criar o spec de lógica pura (thresholds/severidade/CSV) ou remover docs/TELEMETRY_MODULE_DOCS.md:694 e :704-730.
- **Evidência:** ausente: ls tests/lib/telemetry-logic.test.ts → No such file; git log --all -- tests/lib/telemetry-logic.test.ts (histórico completo) → 0 commits. Citado em docs/TELEMETRY_MODULE_DOCS.md:8, :694 ("77 testes"), :704, :753; cabeçalho :7-11 reconhece a inexistência.| cético: ausente: ls tests/lib/telemetry-logic.test.ts → No such file; git log --all -- tests/lib/telemetry-logic.test.ts → 0 commits. Citado em docs/TELEMETRY_MODULE_DOCS.md:8, :694 ("77"), :704, :753.

### F1218 · Arquivo tests/pages/AdminTelemetriaPage.test.tsx citado em TELEMETRY_MODULE_DOCS.md nunca existiu

- **Tipo:** Doc/config
- **O que os docs afirmam:** Citado como prova em TELEMETRY_MODULE_DOCS.md; git log --all mostra que nunca existiu no repositório.
- **Fontes:** `docs/estado/14_VERIFICACAO_DA_AUDITORIA.md:138`
- **O que falta:** Criar teste da página /admin/telemetria ou remover docs/TELEMETRY_MODULE_DOCS.md:696 e :755.
- **Evidência:** ausente: ls tests/pages/AdminTelemetriaPage.test.tsx → No such file; git log --all -- tests/pages/AdminTelemetriaPage.test.tsx e -- tests/pages/AdminTelemetria.test.tsx (histórico completo) → 0 commits cada. O doc cita a variante tests/pages/AdminTelemetria.test.tsx em docs/TELEMETRY_MODULE_DOCS.md:9 e :696 ("47 testes"); cabeçalho :7-11 reconhece a inexistência. docs/estado/14_VERIFICACAO_DA_AUDITORIA.md:134 registra "nunca existiu".| cético: ausente: ls tests/pages/AdminTelemetriaPage.test.tsx e tests/pages/AdminTelemetria.test.tsx → No such file; git log --all -- (ambos) → 0 commits. Doc cita a variante AdminTelemetria.test.tsx em docs/TELEMETRY_MODULE_DOCS.md:9, :696 ("47"), :755.

### F1221 · Ata go/no-go de prontidão

- **Tipo:** Doc/config
- **O que os docs afirmam:** Etapa 100 NI.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:99`
- **O que falta:** Redigir a ata go/no-go (ex.: docs/execucao/ATA_GO_NO_GO_<data>.md) com critérios, evidências e decisão do dono.
- **Evidência:** ausente: grep -rniE 'go[/ -]?no[- ]?go' docs → só listas de pendência (docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:100 "\| 100| Certificar prontidão \| NI \| ausente \| Ata go/no-go \|", AUDITORIA_EXAUSTIVA_2026-08-26/30, STATUS_100_ETAPAS_2026-08-30.md, GAPS_CLASSE_MUNDIAL.md); nenhum documento de ata assinada no repo. \| CONTESTADO pelo cético (PARCIAL): Existe documento de certificação de prontidão que o verificador não considerou: docs/prod-readiness.md:1-6 ("Prontidão para produção", cada item OK com prova ou BLOQUEADO), resumo :8-18, seção 'Fechamento' :1049-1065 (fechado em 2026-11-13 sobre main 31447ff16, tabela de 9 critérios) e backlog residual BLOQUEADOS B1–B18 + 'Decisões pendentes do dono' (:1065). Porém não há decisão go/no-go explícita do dono nem cobre restore/tráfego saudável exigidos pela etapa 100 (docs/execucao/STATUS_100_ETAPAS_2026-08-3…
- **Revisão:** em disputa. O cético propõe Parcial e o juiz ainda não decidiu.

### F1228 · Baseline de tráfego/erros 30-90 dias

- **Tipo:** Doc/config
- **O que os docs afirmam:** Etapa 20 NI.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:34`
- **O que falta:** Inventário de consumidores reais 30-90 dias a partir de logs de edges/cron_runs/error_logs, versionado em inventario/estado/ ou docs/estado/.
- **Evidência:** ausente: grep -rniE 'baseline de tr[aá]fego\|tr[aá]fego/erros\|inventário de consumidores' docs → só as listas de pendência (docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:34 "\| 20| Baseline de tráfego/erros \| NI \| ausente \|", AUDITORIA_EXAUSTIVA_2026-08-26, STATUS_100_ETAPAS_2026-08-30); grep em scripts/ e .github/ → 0 artefatos de baseline de tráfego. \| cético: ausente: grep -rliE 'consumidores reais\|baseline de tr[aá]fego\|tr[aá]fego 30\|inventário de consumidores' docs inventario scripts → só listas de pendência (A_planos_execucao.md:34, AUDITORIA_EXAUSTIVA_2026-08-26, STATUS_100_ETAPAS_2026-08-30, C_estado_runbooks.md:224 que trata de feature flags). inventario/estado/edges.json só tem chave sem_chamador_no_repo (chamadores estáticos no código, não tráfego).

### F1265 · Congelamento de deploys destrutivos registrado

- **Tipo:** Doc/config
- **O que os docs afirmam:** Etapa 2 NI.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:20`
- **O que falta:** Registrar formalmente a janela de congelamento (doc em docs/execucao/ com data, escopo e autorização) ou declarar a etapa 2 obsoleta em docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:120 e A_planos_execucao.md:20.
- **Evidência:** ausente: grep -rniE 'janela de mudan\|change freeze\|freeze window' docs/ CHANGELOG.md (fora de docs/auditoria e docs/execucao/STATUS_100_ETAPAS) → 0 resultados. Único registro é o status pendente: docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:20 ('NI; nenhuma janela registrada') e docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:120 ('🔶 Decisão do operador'). Migrations continuaram até supabase/migrations/20261119700000_fix_rls_sales_activities_using_true.sql.
- **Revisão:** sem contestação cética concluída.

### F1271 · Contatos de plantão preenchidos (placeholders {{ ... }})

- **Tipo:** Doc/config
- **O que os docs afirmam:** Tabela de contatos (primário, backup, PO, admin infra, dono de credenciais) tem placeholders a preencher.
- **Fontes:** `docs/runbooks/on-call.md:15-23`
- **O que falta:** Dono preencher a tabela docs/runbooks/on-call.md:17-23 com nomes/canais reais (dado de negócio, não inferível do código).
- **Evidência:** docs/runbooks/on-call.md:15 '## Contatos (preencher)'; :19-23 ainda com placeholders '{{ NOME_PLANTAO_PRIMARIO }}', '{{ NOME_BACKUP }}', '{{ NOME_PO }}', '{{ NOME_ADMIN_INFRA }}', '{{ NOME_DONO_CREDENCIAIS }}' e '{{ CANAL/TELEFONE }}'. ausente: grep -rn 'Plantão primário\|NOME_PLANTAO' docs/ fora de on-call.md → 0 resultados.
- **Revisão:** sem contestação cética concluída.

### F1284 · D9: CODEOWNERS referencia @promo-ops inexistente (6 erros)

- **Tipo:** Doc/config
- **O que os docs afirmam:** API codeowners/errors retorna 6 erros.
- **Fontes:** `docs/estado/PLANO_CI_WORKFLOWS_2026-10-01.md:18,58`
- **O que falta:** Criar a conta @promo-ops e convidá-la com acesso Write (docs/DR_PLAN.md) ou remover o handle das 6 linhas de .github/CODEOWNERS até existir.
- **Evidência:** GET repos/adm01-debug/Promo_Champions_V2.1/codeowners/errors (2026-11-20) → errors.length = 6, todos 'Unknown owner @promo-ops'. .github/CODEOWNERS:8 '* @adm01-debug @promo-ops', :16-18 (/supabase/, /supabase/migrations/, /supabase/functions/) e :21-22 (/.github/, /.github/workflows/) referenciam @promo-ops; comentário em :5-7 reconhece que a conta ainda precisa ser provisionada. gh api users/promo-ops bloqueado pelo proxy (sessão restrita ao repo).
- **Revisão:** sem contestação cética concluída.

### F1292 · DEP-02: @types/react fixado em 18.3 documentado em ADR

- **Tipo:** Doc/config
- **O que os docs afirmam:** @types/react fixado em 18.3 por bloqueio consciente do react-leaflet; recomenda documentar a decisão em ADR.
- **Fontes:** `docs/reports/AUDIT_2026-07-13.md:46-46`
- **O que falta:** Não há ADR. A premissa (pin em 18.3) está obsoleta: registrar ADR da migração para React 19 / react-leaflet 5 ou marcar DEP-02 como obsoleto em docs/reports/AUDIT_2026-07-13.md:46.
- **Evidência:** ADR ausente: `grep -rln "@types/react" docs/decisions` → 0 resultados; docs/decisions contém apenas ADR-001..ADR-010 (rbac, react-query, rls, circuit-breaker, idempotency, request-id, log-retention, security-definer, csp, service-layer, webauthn). Premissa obsoleta: package.json:164 `@types/react ^19.3.0` (não 18.3), package.json:133 `react ^19.3.1`, package.json:139 `react-leaflet ^5.0.0` – migração em d620c119e (2026-11-14, #398). `grep -rln -i "react 19\|react-leaflet" docs/decisions CHANGELOG.md` → 0.| cético: package.json:164 `@types/react ^19.3.0` (lock 19.3.0), não 18.3; package.json:139 `react-leaflet ^5.0.0`. `ls docs/decisions` → só ADR-001..ADR-010, nenhum sobre @types/react. A mudança veio do commit Dependabot d620c119e 'chore(deps): bump the react-core group ... (#398)', que não registra remoção deliberada, então REMOVIDO_INTENCIONALMENTE não se aplica.

### F1294 · Dependabot com cooldown, ignore de major e grupo catch-all

- **Tipo:** Doc/config
- **O que os docs afirmam:** .github/dependabot.yml sem cooldown, ignore de major e grupo catch-all.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:69`
- **O que falta:** Adicionar `cooldown`, `ignore` de semver-major e um grupo catch-all `patterns: ["*"]` nos dois ecossistemas de .github/dependabot.yml.
- **Evidência:** `grep -n -E "cooldown\|ignore\|update-types\|semver-major" .github/dependabot.yml` → 0 resultados. Groups existem (:18-41 radix-ui/react-core/testing/build-tools; :55-63 actions-core/actions-runtime) mas nenhum com `patterns: ["*"]` (catch-all): `grep -n '"\*"' .github/dependabot.yml` → 0.| cético: .github/dependabot.yml:1-63 lido inteiro: não tem `cooldown`, `ignore` nem `update-types`. Os grupos de :18-41 e :55-63 são por padrão específico, e nenhum usa `"*"` (catch-all).

### F1318 · Deploy pós-hotfix via 'Publish' no Lovable (desatualizado — produção é Vercel)

- **Tipo:** Doc/config
- **O que os docs afirmam:** HOTFIX.md manda publicar no Lovable após merge; DEPLOYMENT.md diz que a Vercel publica a main automaticamente.
- **Fontes:** `docs/HOTFIX.md:34-35,8`
- **O que falta:** Reescrever docs/HOTFIX.md:10 e :34-35 para 'merge na main → Vercel publica automaticamente; confirmar status check Vercel (docs/agentes/vercel-deploy.md)'.
- **Evidência:** docs/HOTFIX.md:10 ainda diz 'produção = o que está publicado no Lovable a partir da main' e docs/HOTFIX.md:34-35 manda 'então **Publish** no Lovable' — contradiz docs/DEPLOYMENT.md:19-24 e docs/RUNBOOK.md:27 ('sem botão Publish — o deploy saiu do Lovable em out/2026'). A correção do HOTFIX.md não foi feita.| cético: Confirmado: docs/HOTFIX.md:10 diz 'produção = o que está publicado no Lovable a partir da main' e docs/HOTFIX.md:34-35 manda 'aplicar migration ... antes do Publish; ... então **Publish** no Lovable'. Isso contradiz docs/RUNBOOK.md:27 ('sem botão "Publish" — o deploy saiu do Lovable em out/2026'). A correção não foi feita.

### F1330 · docs/auditoria/RELATORIO_E2E.md

- **Tipo:** Doc/config
- **O que os docs afirmam:** A.4 #40 NI.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:243`
- **O que falta:** Criar docs/auditoria/RELATORIO_E2E.md com o resultado real da última execução e2e (run id, data e resultado por spec).
- **Evidência:** ausente: `ls docs/auditoria/RELATORIO_E2E.md` → No such file; `find docs -name 'RELATORIO_E2E*'` → 0 resultados. docs/auditoria/ contém RELATORIO_FALHAS.md e RELATORIO_FINAL.md, mas nenhum relatório E2E (relatórios de QA existentes ficam em docs/reports/QA_EXHAUSTIVE_2026-07-15.md e QUOTE_TO_SALE_QA_REPORT.md, fora do contrato A.4 #40).| cético: ausente: `ls docs/auditoria` não lista RELATORIO_E2E.md. `git ls-files \| grep -i -E 'e2e.*(relat\|report)\|(relat\|report).*e2e'` só retorna tests/e2e/helpers/quote-to-sale-failure-reporter.ts e tests/e2e/pages-reports-hubs.spec.ts, que são código de teste e não relatório. docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:243 marca o item como NI.

### F1344 · Environment ci-integration com secrets fora do nível do repo

- **Tipo:** Doc/config
- **O que os docs afirmam:** Não existe environment ci-integration.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:63`
- **O que falta:** Criar environment `ci-integration` com deployment_branch_policy restrita, mover SUPABASE_SERVICE_ROLE_KEY/SUPABASE_ACCESS_TOKEN/E2E_* para ele e declarar `environment: ci-integration` nos jobs e2e, deno-tests(live), sql-tests de pr-checks.yml; atualizar .github/ENVIRONMENTS.md.
- **Evidência:** GitHub API repos/adm01-debug/Promo_Champions_V2.1/environments (20/11/2026) → 4 environments: copilot, pr-preview, Preview, Production; nenhum `ci-integration`. Secrets continuam no nível do repo (API actions/secrets → 10 secrets, incl. SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ACCESS_TOKEN, E2E_TEST_*). .github/ENVIRONMENTS.md:36-41 documenta explicitamente que ficam no nível do repositório. docs/estado/PLANO_CI_WORKFLOWS_2026-10-01.md:74 ainda lista como etapa 33 a criar.
- **Revisão:** sem contestação cética concluída.

### F1346 · Esforço S/M/L e quick wins no RELATORIO_FALHAS

- **Tipo:** Doc/config
- **O que os docs afirmam:** A.4 #26/#27 NI.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:235-236`
- **O que falta:** Adicionar coluna Esforço (S/M/L) por achado e seção 'Quick wins' em docs/auditoria/RELATORIO_FALHAS.md.
- **Evidência:** ausente: grep -c -i 'esforço\|quick win' docs/auditoria/RELATORIO_FALHAS.md → 0. Confirmado por docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:235-236 (#26/#27 NI).
- **Revisão:** sem contestação cética concluída.

### F1348 · ESTADO_ATUAL.md com cabeçalho de validade (não cita rapjs como produção)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Etapa 95 P.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:94`
- **O que falta:** Inserir no topo de docs/estado/ESTADO_ATUAL.md um bloco 'Validade: snapshot histórico de 2026-08-16 do projeto rapjs (desativado); produção atual = usyxfpqlsspldubptrdl, ver docs/contexto/supabase'.
- **Evidência:** docs/estado/ESTADO_ATUAL.md:3 ainda diz 'Banco de produção `rapjswienfhkobhlamxb`' sem cabeçalho de validade/obsolescência (linhas 1-5 só trazem 'Medição: 2026-08-16'); banco canônico é usyxfpqlsspldubptrdl (AGENTS.md §7). docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:94 confirma pendência.
- **Revisão:** sem contestação cética concluída.

### F1353 · Etapa 012 (CI): Publicar docs/execucao/STATUS_CI_2026-09.md

- **Tipo:** Doc/config
- **O que os docs afirmam:** Tabela workflow × último verde × causa da última falha como baseline.
- **Fontes:** `docs/execucao/PLANO_WORKFLOWS_GITHUB_ACTIONS_100_ETAPAS_2026-09-27.md:75`
- **O que falta:** Criar docs/execucao/STATUS_CI_2026-09.md com tabela workflow × último run verde × causa da última falha (dados via gh run list).
- **Evidência:** ausente: find docs -iname '_STATUS_CI_' → 0 resultados (docs/execucao/ tem só STATUS_100_ETAPAS_2026-08-30.md).
- **Revisão:** sem contestação cética concluída.

### F1354 · Etapa 014 (CI): Ativar sha_pinning_required: true nas Actions permissions

- **Tipo:** Doc/config
- **O que os docs afirmam:** Via github_set_actions_permissions, após etapa 13.
- **Fontes:** `docs/execucao/PLANO_WORKFLOWS_GITHUB_ACTIONS_100_ETAPAS_2026-09-27.md:80`
- **O que falta:** Dono: Settings → Actions → General → 'Require actions to be pinned to a full-length commit SHA' (ou github_set_actions_permissions com sha_pinning_required=true); pré-requisito: todas as actions já pinadas por SHA (pr-checks.yml:146 valida pins).
- **Evidência:** GitHub API repos/adm01-debug/Promo_Champions_V2.1/actions/permissions (20/11/2026) → {"enabled":true,"allowed_actions":"all","sha_pinning_required":false}.
- **Revisão:** sem contestação cética concluída.

### F1355 · Etapa 015 (CI): Restringir allowed_actions para selected com allowlist

- **Tipo:** Doc/config
- **O que os docs afirmam:** actions/_, github/_, denoland/setup-deno, supabase/setup-cli, treosh/lighthouse-ci-action, astral-sh/setup-uv.
- **Fontes:** `docs/execucao/PLANO_WORKFLOWS_GITHUB_ACTIONS_100_ETAPAS_2026-09-27.md:81`
- **O que falta:** Dono: definir allowed_actions=selected com allowlist actions/_, github/_, denoland/setup-deno, supabase/setup-cli, treosh/lighthouse-ci-action, astral-sh/setup-uv (github_set_actions_permissions + github_set_selected_actions).
- **Evidência:** GitHub API actions/permissions → allowed_actions="all"; actions/permissions/selected-actions → 409 'All actions and workflows are allowed on this repository'.
- **Revisão:** sem contestação cética concluída.

### F1356 · Etapa 019 (CI): Registrar regra "nunca usar pull_request_target" em .github/workflows/README.md

- **Tipo:** Doc/config
- **O que os docs afirmam:** Hoje não é usado; manter assim.
- **Fontes:** `docs/execucao/PLANO_WORKFLOWS_GITHUB_ACTIONS_100_ETAPAS_2026-09-27.md:85`
- **O que falta:** Registrar em .github/workflows/README.md a regra sobre pull_request_target e decidir sobre dependabot-fix-lockfile.yml (documentar a exceção com guard de actor=dependabot ou migrar para workflow_run/dispatch).
- **Evidência:** ausente: grep -i pull_request_target .github/workflows/README.md → 0 resultados (README.md:1-40 só descreve workflows). Além disso a premissa 'hoje não é usado' deixou de valer: .github/workflows/dependabot-fix-lockfile.yml:3-6 usa `on: pull_request_target` com permissões do repo base.
- **Revisão:** sem contestação cética concluída.

### F1359 · Etapa 023 (CI): Habilitar secret_scanning_non_provider_patterns e validity_checks

- **Tipo:** Doc/config
- **O que os docs afirmam:** Hoje disabled.
- **Fontes:** `docs/execucao/PLANO_WORKFLOWS_GITHUB_ACTIONS_100_ETAPAS_2026-09-27.md:89`
- **O que falta:** Dono: Settings → Code security → Secret scanning → habilitar 'Non-provider patterns' e 'Validity checks' (ou PATCH /repos com security_and_analysis).
- **Evidência:** GitHub API repos/adm01-debug/Promo_Champions_V2.1 (20/11/2026) security_and_analysis: secret_scanning=enabled, push_protection=enabled, secret_scanning_non_provider_patterns=disabled, secret_scanning_validity_checks=disabled.
- **Revisão:** sem contestação cética concluída.

### F1360 · Etapa 027 (CI): actionlint + zizmor em pre-commit via lint-staged

- **Tipo:** Doc/config
- **O que os docs afirmam:** Para .github/workflows/*.yml.
- **Fontes:** `docs/execucao/PLANO_WORKFLOWS_GITHUB_ACTIONS_100_ETAPAS_2026-09-27.md:93`
- **O que falta:** Adicionar em package.json lint-staged a chave `.github/workflows/*.yml`: ["actionlint", "zizmor"] e documentar instalação das duas ferramentas (ou via npx/uvx) em docs/agentes/github-ci.md.
- **Evidência:** package.json:191-199 lint-staged só cobre `*.{ts,tsx}` (eslint/prettier) e `*.{css,json,md}` (prettier); .husky/pre-commit = `npx lint-staged`. ausente: grep 'actionlint\|zizmor' package.json .husky .lintstagedrc* → 0 resultados (zizmor aparece só como comentário `# zizmor: ignore[...]` em contexto.yml:310, inventario-estado-semanal.yml:43, types-sync.yml:143).
- **Revisão:** sem contestação cética concluída.

### F1361 · Etapa 028 (CI): Adicionar Edge Functions Lint, Security Audit e Bundle Size aos required checks

- **Tipo:** Doc/config
- **O que os docs afirmam:** Não adicionar E2E/Lighthouse até fase 5.
- **Fontes:** `docs/execucao/PLANO_WORKFLOWS_GITHUB_ACTIONS_100_ETAPAS_2026-09-27.md:97`
- **O que falta:** Decisão de governança: ou adicionar edge-functions-lint, security-audit e bundle-size ao `needs` do ci-gate (pr-checks.yml:711) / ao ruleset, ou marcar a etapa 028 como descartada em docs/execucao/PLANO_WORKFLOWS_GITHUB_ACTIONS_100_ETAPAS_2026-09-27.md:97 citando pr-checks.yml:708-710.
- **Evidência:** Ruleset main-protection (id 22148182, API 20/11/2026) required_status_checks = só ["CI Gate"]. .github/workflows/pr-checks.yml:704-711 job ci-gate `needs: [lint-and-typecheck, test, build, instrucoes-agentes]` com comentário :708-710 'security-audit e edge-functions-lint são informativos — intencionalmente fora do gate'; bundle-size (pr-checks.yml:636) também fora. docs/agentes/github-ci.md:24-30 documenta a decisão de manter security-audit fora do CI Gate. Branch protection clássica (github-ci.md:23) não legível (API 403 'Resource not accessible by integration').
- **Revisão:** sem contestação cética concluída.

### F1362 · Etapa 029 (CI): Ativar strict_required_status_checks_policy: true

- **Tipo:** Doc/config
- **O que os docs afirmam:** Branch precisa estar atualizada com main.
- **Fontes:** `docs/execucao/PLANO_WORKFLOWS_GITHUB_ACTIONS_100_ETAPAS_2026-09-27.md:98`
- **O que falta:** Dono: Settings → Rules → main-protection → marcar 'Require branches to be up to date before merging' (github_update_ruleset com strict_required_status_checks_policy=true).
- **Evidência:** Ruleset main-protection (API 20/11/2026) rule required_status_checks: strict_required_status_checks_policy=false. docs/agentes/github-ci.md:24 confirma 'strict: false'.
- **Revisão:** sem contestação cética concluída.

### F1364 · Etapa 031 (CI): required_linear_history e allowed_merge_methods só squash

- **Tipo:** Doc/config
- **O que os docs afirmam:** Hoje permite merge.
- **Fontes:** `docs/execucao/PLANO_WORKFLOWS_GITHUB_ACTIONS_100_ETAPAS_2026-09-27.md:100`
- **O que falta:** Dono: no ruleset main-protection adicionar regra required_linear_history e restringir allowed_merge_methods a ["squash"]; no repo desabilitar allow_merge_commit e allow_rebase_merge.
- **Evidência:** Ruleset main-protection (API 20/11/2026) rules = pull_request, required_status_checks, deletion, non_fast_forward — sem `required_linear_history`; pull_request.allowed_merge_methods=["squash","merge"]. Repo: allow_merge_commit=true, allow_rebase_merge=true, allow_squash_merge=true.
- **Revisão:** sem contestação cética concluída.

### F1366 · Etapa 039 (CI): Regra de ruleset code_scanning exigindo 0 high/critical novos por PR

- **Tipo:** Doc/config
- **O que os docs afirmam:** Gate CodeQL.
- **Fontes:** `docs/execucao/PLANO_WORKFLOWS_GITHUB_ACTIONS_100_ETAPAS_2026-09-27.md:108`
- **O que falta:** Adicionar ao ruleset main-protection a regra `code_scanning` (CodeQL, security_alerts_threshold high_or_higher) — ação do dono em Settings → Rules (regra 5.8).
- **Evidência:** GitHub API rulesets (github_list_rulesets): único ruleset `main-protection` (id 22148182); github_get_branch_rules main → regras `pull_request`, `required_status_checks` (só `CI Gate`), `deletion`, `non_fast_forward`; nenhuma regra `code_scanning`. .github/workflows/codeql.yml existe mas sem gate no ruleset.
- **Revisão:** sem contestação cética concluída.

### F1367 · Etapa 04 (Graphify): Registrar ADR de arquitetura local-first

- **Tipo:** Doc/config
- **O que os docs afirmam:** ADR em docs/decisions/ com versão candidata, runtime isolado, licença e alternativas.
- **Fontes:** `docs/planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md:94-99`
- **O que falta:** Escrever docs/decisions/ADR-011-graphify-local-first.md registrando versão (graphifyy 0.9.70 em tools/graphify/pyproject.toml:7), runtime isolado uv, licença e alternativas.
- **Evidência:** ausente: `grep -rli graphify docs/decisions/` → 0 resultados (ADR-001..ADR-010 existentes não citam Graphify); `grep -rn 'local-first' docs/decisions` → 0. Critério secundário atendido: `grep -n graphify package.json` só retorna scripts (linhas 48-55), nenhuma dependência no bundle React.
- **Revisão:** sem contestação cética concluída.

### F1368 · Etapa 048 (CI): Pinar @lhci/cli como devDependency e usar npx lhci

- **Tipo:** Doc/config
- **O que os docs afirmam:** Remove npm install -g sem lock.
- **Fontes:** `docs/execucao/PLANO_WORKFLOWS_GITHUB_ACTIONS_100_ETAPAS_2026-09-27.md:120`
- **O que falta:** Adicionar `@lhci/cli` em devDependencies (package-lock), trocar qa-exhaustive.yml:109-117 por `npx lhci autorun` e remover o `npm install -g`.
- **Evidência:** .github/workflows/qa-exhaustive.yml:109 (`npm install -g @lhci/cli@0.14.x`) e :117 (`lhci autorun`); ausente: `grep -n lhci package.json` → 0 resultados (não é devDependency).
- **Revisão:** sem contestação cética concluída.

### F1371 · Etapa 061 (CI): npm run lint e lint:complexity em um único eslint run

- **Tipo:** Doc/config
- **O que os docs afirmam:** --max-warnings por regra via config.
- **Fontes:** `docs/execucao/PLANO_WORKFLOWS_GITHUB_ACTIONS_100_ETAPAS_2026-09-27.md:136`
- **O que falta:** Mover `complexity`/`max-lines` para eslint.config.js (severity warn) e unificar em um só `eslint .` com teto; remover o script lint:complexity e os steps duplicados em pr-checks.yml:119 e qa-exhaustive.yml:48.
- **Evidência:** package.json:27 (`lint`: eslint --max-warnings 0) e :28 (`lint:complexity`: segunda invocação de eslint com `--rule` inline e `--max-warnings 131`); .github/workflows/pr-checks.yml:119 e qa-exhaustive.yml:48 rodam `npm run lint:complexity` como passo separado; ausente: `grep -n 'max-warnings\\|complexity' eslint.config.js` → 0 resultados (regras não estão na config).
- **Revisão:** sem contestação cética concluída.

### F1372 · Etapa 063 (CI): engines.npm e check de versão do npm vs lockfileVersion no setup

- **Tipo:** Doc/config
- **O que os docs afirmam:** Garante npm compatível com package-lock.
- **Fontes:** `docs/execucao/PLANO_WORKFLOWS_GITHUB_ACTIONS_100_ETAPAS_2026-09-27.md:138`
- **O que falta:** Adicionar `"npm": ">=10"` em engines (package.json:188) e um step no job setup de pr-checks.yml que compare `npm --version` com lockfileVersion 3 (ou `npm ci --engine-strict`).
- **Evidência:** package.json:188-190 (`engines` só com `node: >=22.0.0`, sem `npm`); package-lock.json:4 (`lockfileVersion: 3`); ausente: `grep -rn 'lockfileVersion\\|npm --version\\|engines' .github/workflows/*.yml` → 0 resultados (nenhum check de versão do npm no setup).
- **Revisão:** sem contestação cética concluída.

### F1374 · Etapa 072 (CI): Tornar E2E Tests required após 10 runs verdes consecutivos

- **Tipo:** Doc/config
- **O que os docs afirmam:** Registrar contagem na etapa 12.
- **Fontes:** `docs/execucao/PLANO_WORKFLOWS_GITHUB_ACTIONS_100_ETAPAS_2026-09-27.md:150`
- **O que falta:** Após 10 runs verdes consecutivos do job E2E (pr-checks.yml), adicionar o contexto E2E em required_status_checks do ruleset main-protection (ação do dono) e registrar a contagem na etapa 12 do plano.
- **Evidência:** GitHub API github_get_branch_rules main → `required_status_checks` contém apenas `{"context":"CI Gate"}`; nenhum check E2E required. Nenhum registro de contagem de 10 runs verdes nos docs (`grep -rn '10 runs' docs/execucao/PLANO_WORKFLOWS_GITHUB_ACTIONS_100_ETAPAS_2026-09-27.md` só na própria etapa).
- **Revisão:** sem contestação cética concluída.

### F1376 · Etapa 075 (CI): lint:complexity teto 126 → 100 com ratchet automático

- **Tipo:** Doc/config
- **O que os docs afirmam:** Script lê número atual e falha se subir.
- **Fontes:** `docs/execucao/PLANO_WORKFLOWS_GITHUB_ACTIONS_100_ETAPAS_2026-09-27.md:153`
- **O que falta:** Criar scripts/ci/complexity-ratchet.mjs que leia o número atual de warnings de complexity/max-lines, falhe se subir e abaixe o teto automaticamente; reduzir --max-warnings em package.json:28 rumo a 100.
- **Evidência:** package.json:28 (`lint:complexity` com `--max-warnings 131` — teto subiu de 126 para 131, não caiu para 100); scripts/debt-report.mjs:6 (`vs teto 126`, só relatório); scripts/ci/lint-ratchet.mjs:8-13 é ratchet de `npm run lint` com baseline vazia, não da complexidade; ausente: `grep -rn 'complexity' scripts/ci/` → 0 resultados.
- **Revisão:** sem contestação cética concluída.

### F1378 · Etapa 081 (CI): Protection rule em Production (required reviewer = dono)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Preview sem regra.
- **Fontes:** `docs/execucao/PLANO_WORKFLOWS_GITHUB_ACTIONS_100_ETAPAS_2026-09-27.md:162`
- **O que falta:** Dono configurar em Settings → Environments → Production: Required reviewers = adm01-debug e deployment branch policy = main/tags v* (regra 5.8).
- **Evidência:** GitHub API github_get_environment Production → `protection_rules: []`, `deployment_branch_policy: null`, `can_admins_bypass: true` (environments copilot, pr-preview, Preview idem). .github/workflows/deploy.yml:119 (`environment: production`) e :8-10 só funcionam como gate 'enquanto o ambiente tiver Required reviewers' — não tem.
- **Revisão:** sem contestação cética concluída.

### F1379 · Etapa 088 (CI): Remover/atualizar seção "Evidência Pós-Aplicação" do PR template quando etapa 80 ativa

- **Tipo:** Doc/config
- **O que os docs afirmam:** Ou referenciar run de deploy.
- **Fontes:** `docs/execucao/PLANO_WORKFLOWS_GITHUB_ACTIONS_100_ETAPAS_2026-09-27.md:169`
- **O que falta:** Quando o deploy de migrations for automatizado (secret SUPABASE_DB_PASSWORD + decisão F1377), atualizar pull_request_template.md:28-47 para aceitar link do run de deploy como evidência; hoje a seção é coerente com o modelo manual vigente.
- **Evidência:** .github/pull_request_template.md:28-47 mantém a seção '🗄️ Evidência Pós-Aplicação' com `server_time: (SELECT now();)` sem referência a run de deploy; a etapa 80 está só parcialmente ativa: deploy.yml:131-148 deploya edge functions com SUPABASE_ACCESS_TOKEN (secret existe), mas deploy.yml:158-161 exige `SUPABASE_DB_PASSWORD` para migrations e esse secret não existe (github_list_actions_secrets: 10 nomes, sem SUPABASE_DB_PASSWORD) — migrations seguem manuais, e AGENTS.md §5.6 exige a evidência com server_time.
- **Revisão:** sem contestação cética concluída.

### F1381 · Etapa 090 (CI): dependabot.yml cooldown 7 dias para majors e versioning-strategy increase

- **Tipo:** Doc/config
- **O que os docs afirmam:** dependabot.yml cooldown 7 dias para majors e versioning-strategy increase
- **Fontes:** `docs/execucao/PLANO_WORKFLOWS_GITHUB_ACTIONS_100_ETAPAS_2026-09-27.md:174`
- **O que falta:** Adicionar em .github/dependabot.yml (bloco npm, após :9) `cooldown: {semver-major-days: 7}` e `versioning-strategy: increase`.
- **Evidência:** ausente: `grep -n 'cooldown\\|versioning-strategy' .github/dependabot.yml` → 0 resultados (arquivo tem 63 linhas: schedule, assignees, labels, commit-message, groups).
- **Revisão:** sem contestação cética concluída.

### F1384 · Etapa 094 (CI): Adicionar ecossistema uv (tools/graphify) ao Dependabot

- **Tipo:** Doc/config
- **O que os docs afirmam:** Formalizar o "Graph Update: uv".
- **Fontes:** `docs/execucao/PLANO_WORKFLOWS_GITHUB_ACTIONS_100_ETAPAS_2026-09-27.md:178`
- **O que falta:** Adicionar em .github/dependabot.yml bloco `package-ecosystem: "uv"`, `directory: "/tools/graphify"`, schedule semanal.
- **Evidência:** .github/dependabot.yml:4 e :44 — só `package-ecosystem: npm` e `github-actions`; ausente: `grep -n 'uv' .github/dependabot.yml` → 0 resultados; ausente: `grep -rn -i 'uv lock\\|Graph Update' .github/workflows/*.yml` → 0 resultados (nenhum workflow de atualização do uv.lock).
- **Revisão:** sem contestação cética concluída.

### F1390 · Etapa 100: matriz workflow × gatilho × required × secrets × custo em docs/estado/CI_ESTADO_<data>.md

- **Tipo:** Doc/config
- **O que os docs afirmam:** Reauditoria em 30 dias.
- **Fontes:** `docs/estado/PLANO_CI_WORKFLOWS_2026-10-01.md:172`
- **O que falta:** Criar docs/estado/CI_ESTADO_<data>.md com a matriz workflow × gatilho × required × secrets × custo de todos os workflows atuais e data da reauditoria em 30 dias.
- **Evidência:** ausente: ls docs/estado/| grep -i CI_ESTADO → 0 resultados; única menção é o próprio plano (docs/estado/PLANO_CI_WORKFLOWS_2026-10-01.md:162). Existe tabela parcial Workflow × Gatilho × Bloqueante em docs/estado/12_INFRA_CI_TESTES.md:49, sem colunas required/secrets/custo e fora do arquivo previsto. \| cético: ausente: ls docs/estado \| grep CI_ESTADO → 0 (pasta só tem 01..15, ESTADO_ATUAL, IDENTIDADE_BANCO, PLANO_CI_WORKFLOWS, README); grep -rl CI_ESTADO docs → só docs/estado/PLANO_CI_WORKFLOWS_2026-10-01.md. A tabela de docs/estado/12_INFRA_CI_TESTES.md:47-52 é Workflow×Gatilho×Bloqueante, sem secrets/custo, e ainda cita lint.yml (desatualizada).

### F1391 · Etapa 12: adicionar Edge Functions Lint (deno), Bundle e withRequestId lint aos required checks

- **Tipo:** Doc/config
- **O que os docs afirmam:** Ampliar required checks.
- **Fontes:** `docs/estado/PLANO_CI_WORKFLOWS_2026-10-01.md:48`
- **O que falta:** Decisão do dono: incluir edge-functions-lint no needs do ci-gate (pr-checks.yml:711) e os checks de bundle e withRequestId no ruleset main-protection.
- **Evidência:** Ruleset main-protection (GET /repos/.../rulesets/22148182) required_status_checks = apenas [{context:'CI Gate'}]. .github/workflows/pr-checks.yml:704-711: job ci-gate needs [lint-and-typecheck, test, build, instrucoes-agentes]; comentário linhas 708-709: 'security-audit e edge-functions-lint são informativos — intencionalmente fora do gate'. Jobs 'Bundle every edge function…' (.github/workflows/edge-functions-bundle.yml:34) e 'withRequestId adoption lint…' (.github/workflows/edge-functions-request-id.yml:34) estão em workflows separados, não listados no ruleset.| cético: GET /repos/adm01-debug/Promo_Champions_V2.1/rulesets/22148182 (lido 2026-11-28, updated_at 2026-11-21): required_status_checks = [{context:'CI Gate'}] apenas. .github/workflows/pr-checks.yml:708-711: ci-gate needs [lint-and-typecheck, test, build, instrucoes-agentes]; comentário diz edge-functions-lint 'intencionalmente…

### F1394 · Etapa 15: corrigir CODEOWNERS (remover @promo-ops ou criar conta)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Decisão do dono.
- **Fontes:** `docs/estado/PLANO_CI_WORKFLOWS_2026-10-01.md:51`
- **O que falta:** Decisão do dono: remover @promo-ops das 6 linhas ou criar a conta com acesso Write; confirmar codeowners/errors vazio.
- **Evidência:** .github/CODEOWNERS:8,16,17,18,21,22 ainda referenciam @promo-ops (comentário linhas 5-7 diz 'conta de serviço a provisionar'). GET /repos/adm01-debug/Promo_Champions_V2.1/codeowners/errors (2026-11-20) retorna 6 erros 'Unknown owner on line N: make sure @promo-ops exists and has write access'.| cético: .github/CODEOWNERS:8,16,17,18,21,22 ainda com @promo-ops; GET codeowners/errors (2026-11-28) retorna 6 erros 'Unknown owner on line N: make sure @promo-ops exists and has write access'.

### F1395 · Etapa 16: require_code_owner_review só para .github/workflows/ e supabase/migrations/

- **Tipo:** Doc/config
- **O que os docs afirmam:** Governança seletiva.
- **Fontes:** `docs/estado/PLANO_CI_WORKFLOWS_2026-10-01.md:52`
- **O que falta:** Depois de F1394, ativar require_code_owner_review (ruleset por path para .github/workflows/** e supabase/migrations/**) com pelo menos 1 aprovação.
- **Evidência:** Ruleset main-protection (rulesets/22148182) rule pull_request: require_code_owner_review=false, required_approving_review_count=0. CODEOWNERS tem entradas para /.github/workflows/ (linha 22) e /supabase/migrations/ (linha 17), mas com owner inválido @promo-ops (codeowners/errors). Não há ruleset separado por path (lista de rulesets tem só 1).| cético: Ruleset main-protection (rulesets/22148182, lido 2026-11-28): pull_request.require_code_owner_review=false, required_approving_review_count=0. CODEOWNERS tem /supabase/migrations/ (linha 17) e /.github/workflows/ (linha 22), mas com owner inválido @promo-ops.

### F1398 · Etapa 18: só squash como método de merge

- **Tipo:** Doc/config
- **O que os docs afirmam:** Histórico linear.
- **Fontes:** `docs/estado/PLANO_CI_WORKFLOWS_2026-10-01.md:54`
- **O que falta:** Definir allow_merge_commit=false e allow_rebase_merge=false, e allowed_merge_methods=['squash'] no ruleset (decisão do dono).
- **Evidência:** GET /repos/adm01-debug/Promo_Champions_V2.1 (2026-11-20): allow_merge_commit=true, allow_rebase_merge=true, allow_squash_merge=true. Ruleset main-protection allowed_merge_methods=['squash','merge'].| cético: GET /repos/adm01-debug/Promo_Champions_V2.1 (2026-11-28): allow_merge_commit=true, allow_rebase_merge=true, allow_squash_merge=true. Ruleset main-protection allowed_merge_methods=['squash','merge'].

### F1403 · Etapa 29 (Graphify): Priorizar achados sem aplicar correções automáticas

- **Tipo:** Doc/config
- **O que os docs afirmam:** Backlog deduplicado com hipótese, reprodução e responsável.
- **Fontes:** `docs/planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md:279-284`
- **O que falta:** docs/graphify/BACKLOG_ACHADOS_<data>.md deduplicado com hipótese, reprodução e responsável (depende de F1402).
- **Evidência:** ausente: grep -ril 'backlog deduplicado\|reprodução mínima' docs/graphify → 0 resultados; docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:163 etapa 29 PENDENTE 'backlog funcional deduplicado do produto depende da matriz ainda ausente'. O diretório docs/auditoria/funcionalidades-pendentes-2026-10-12/ lista pendências, mas sem hipótese/reprodução/responsável por item e não deriva do grafo.| cético: docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:163 etapa 29 PENDENTE. ls docs/graphify → só BASELINE, EXECUCAO_LOTE_A..F, README, REVISAO e revisao-20260911/ (reproduzir.mjs, resultados.json), sem backlog.

### F1407 · Etapa 40 (Graphify): Definir manutenção e atualização de dependências

- **Tipo:** Doc/config
- **O que os docs afirmam:** Responsável, revisão periódica, changelog, licença, teste lado a lado.
- **Fontes:** `docs/planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md:360-365`
- **O que falta:** docs/graphify/MANUTENCAO.md com responsável, cadência, licença, teste lado a lado e rollback de versão.
- **Evidência:** ausente: grep -i 'manutenção\|changelog\|licença\|atualização de depend' docs/graphify/*.md → só REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:174 (etapa 40 PENDENTE: 'Pinagem presente não equivale a rotina de atualização, licença, migração de formato e rollback testado'). Só existe o pin graphifyy==0.9.48 (docs/graphify/README.md:14).| cético: docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:174 etapa 40 PENDENTE; grep -rliE 'handoff\|rollback\|runbook\|manuten' docs/graphify → só REVISAO_EXAUSTIVA_PLANO; docs/runbooks/ (16 arquivos) sem graphify (grep -il graphify → 0).

### F1408 · Etapa 47 (Graphify): Expandir por domínios e registrar integrações bloqueadas

- **Tipo:** Doc/config
- **O que os docs afirmam:** Uso rotineiro em todos os domínios; matriz domínio→fonte→cobertura→owner.
- **Fontes:** `docs/planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md:413-418`
- **O que falta:** docs/graphify/MATRIZ_DOMINIOS.md domínio→fonte→cobertura→owner→estado.
- **Evidência:** ausente: grep -iE 'domínio.*fonte._cobertura\|owner' docs/graphify/_.md → só REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:181 (etapa 47 PENDENTE: 'Faltam todos os domínios com fonte, owner, atualização e perfil estático formal; catálogo indisponível'). O índice gerado docs/contexto/codigo/modulos.json (branch contexto) lista módulos, mas sem owner/estado de atualização e não é a matriz da etapa.| cético: docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:181 etapa 47 PENDENTE 'Faltam todos os domínios com fonte, owner…'; ls docs/graphify → nenhuma matriz de domínios.

### F1410 · Etapa 49 (Graphify): Entregar handoff e treinar uso responsável

- **Tipo:** Doc/config
- **O que os docs afirmam:** Exemplos para dev, Cline e Codex; limites de confiança; política de acesso.
- **Fontes:** `docs/planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md:427-432`
- **O que falta:** docs/graphify/HANDOFF.md com exemplos dev/Cline/Codex, limites de confiança, política de acesso e reprodução por terceiro.
- **Evidência:** ausente: grep -ril handoff docs/graphify docs/agentes → só docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:183 (etapa 49 PENDENTE: 'Handoff específico com comandos finais e reprodução por outra pessoa não foi entregue').| cético: docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:183 etapa 49 PENDENTE. O único handoff é docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md (anterior ao plano Graphify, de outro plano); grep -il graphify docs/handoff/* → 0.

### F1415 · Etapa 88: badges de status dos workflows críticos no README

- **Tipo:** Doc/config
- **O que os docs afirmam:** Visibilidade.
- **Fontes:** `docs/estado/PLANO_CI_WORKFLOWS_2026-10-01.md:152`
- **O que falta:** Badges de status (pr-checks.yml, deploy.yml, codeql.yml, migrations-drift.yml) no topo de README.md.
- **Evidência:** ausente: grep -n 'badge\\|actions/workflows\\|shields.io' README.md → 0 resultados. README.md:60 só cita 'CI/Lint| ESLint + Prettier + Husky + Lighthouse CI' em tabela de stack, sem badge de status. \| cético: ausente: grep -n -i 'badge\\|shields\\|actions/workflows' README.md → 0 resultados (HEAD 90170947d). Confirma o verificador.

### F1416 · Etapa 9: ruleset com strict_required_status_checks_policy=true

- **Tipo:** Doc/config
- **O que os docs afirmam:** PR precisa estar atualizada com main.
- **Fontes:** `docs/estado/PLANO_CI_WORKFLOWS_2026-10-01.md:45`
- **O que falta:** Alterar o ruleset main-protection para strict_required_status_checks_policy=true (ou merge queue); decisão do dono (AGENTS.md §5.8).
- **Evidência:** gh api repos/adm01-debug/Promo_Champions_V2.1/rulesets/22148182 (ruleset 'main-protection', enforcement active, updated 2026-11-06): rules.required_status_checks.parameters.strict_required_status_checks_policy = false; required_status_checks = [{context:'CI Gate'}]; rules = pull_request, required_status_checks, deletion, non_fast_forward. docs/estado/PLANO_CI_WORKFLOWS_2026-10-01.md:45 pede strict=true.| cético: gh api repos/adm01-debug/Promo_Champions_V2.1/rulesets/22148182 --jq '.rules[]\|select(.type=="required_status_checks")\|.parameters.strict_required_status_checks_policy' → false (lido nesta sessão). Pedido em docs/estado/PLANO_CI_WORKFLOWS_2026-10-01.md:45.

### F1418 · Etapa 91: Dependabot ignore de majors arriscadas (tailwind 3→4, #152)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Majors tratadas à parte.
- **Fontes:** `docs/estado/PLANO_CI_WORKFLOWS_2026-10-01.md:159`
- **O que falta:** Bloco ignore para majors arriscadas no ecosystem npm (tailwind já está em 4; aplicar a vitest/vite/react-router etc.).
- **Evidência:** ausente: grep -c ignore .github/dependabot.yml → 0. O arquivo (76 linhas) tem só ecosystems npm '/' e github-actions, com groups radix-ui/react-core/testing/build-tools/actions-core/actions-runtime. CHANGELOG.md:185 cita 'ignore de majors do vitest' (a24228771), mas o bloco foi removido depois (git log -S'ignore:' -- .github/dependabot.yml → 859276aed). Nenhum ignore para tailwindcss.| cético: .github/dependabot.yml:1-63 lido inteiro: só ecosystems npm (linhas 4-41) e github-actions (44-63), nenhum bloco ignore (grep -c ignore → 0). Observação: o motivo específico (tailwind 3→4) já foi ultrapassado — package.json:180 "tailwindcss": "^4.3.5"; o ignore de majors arriscadas segue inexistente.

### F1419 · Etapa 92: grupo catch-all minor-and-patch no Dependabot

- **Tipo:** Doc/config
- **O que os docs afirmam:** Reduz PRs.
- **Fontes:** `docs/estado/PLANO_CI_WORKFLOWS_2026-10-01.md:160`
- **O que falta:** Grupo catch-all minor-and-patch (patterns ['*'], update-types ['minor','patch']) no ecosystem npm.
- **Evidência:** .github/dependabot.yml:17-39 groups do npm = radix-ui, react-core, testing, build-tools (todos por patterns de pacote); .github/dependabot.yml:54-62 groups de actions = actions-core, actions-runtime. ausente: grep -n 'minor-and-patch\\|update-types' .github/dependabot.yml → 0 resultados.| cético: .github/dependabot.yml:18-41 groups radix-ui, react-core, testing, build-tools (por patterns); :55-63 actions-core, actions-runtime. ausente: grep -n 'minor-and-patch\\|update-types' .github/dependabot.yml → 0.

### F1422 · Etapa 95: ecossistema npm/uv para tools/graphify no Dependabot

- **Tipo:** Doc/config
- **O que os docs afirmam:** Se houver lockfile próprio.
- **Fontes:** `docs/estado/PLANO_CI_WORKFLOWS_2026-10-01.md:163`
- **O que falta:** Entrada package-ecosystem 'uv' (ou 'pip') com directory '/tools/graphify'.
- **Evidência:** tools/graphify/ tem lockfile próprio: ls tools/graphify → pyproject.toml, uv.lock, graphify/. .github/dependabot.yml só declara package-ecosystem npm (directory '/') e github-actions (directory '/'); ausente: grep -n 'uv\\|pip\\|tools/graphify' .github/dependabot.yml → 0 resultados.| cético: ls tools/graphify → pyproject.toml, uv.lock (lockfile próprio existe). .github/dependabot.yml:4-5 e :44-45 só npm e github-actions em directory '/'; ausente: grep -n 'uv\\|pip\\|tools/graphify' .github/dependabot.yml → 0.

### F1438 · FAQ cita Lovable como host do frontend (VITE_SUPABASE_PUBLISHABLE_KEY (Lovable), integração Lovable→Supabase)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Referências desatualizadas ao host.
- **Fontes:** `docs/FAQ_TROUBLESHOOTING.md:58,61`
- **O que falta:** Reescrever FAQ_TROUBLESHOOTING.md:58 e :61 para Vercel.
- **Evidência:** docs/FAQ_TROUBLESHOOTING.md:58 '`VITE_SUPABASE_PUBLISHABLE_KEY` (Lovable) vs `.env` local' e :61 'Integração Lovable→Supabase apontando pro projeto antigo' permanecem no texto atual (grep -n -i lovable docs/FAQ_TROUBLESHOOTING.md → linhas 13, 58, 61; a 13 é LOVABLE_API_KEY, env legítima). Host real é Vercel (AGENTS.md §6, docs/agentes/vercel-deploy.md).| cético: docs/FAQ_TROUBLESHOOTING.md:58 '`VITE_SUPABASE_PUBLISHABLE_KEY` (Lovable) vs `.env` local' e :61 'Integração Lovable→Supabase apontando pro projeto antigo' seguem no texto atual (lidos).

### F1439 · Feature flag USE_USER_CLIENT_${FN_NAME} para canário

- **Tipo:** Doc/config
- **O que os docs afirmam:** Mitigação: deploy canário por feature flag por function.
- **Fontes:** `docs/SEC-08_SERVICE_ROLE_AUDIT.md:54`
- **O que falta:** Ler Deno.env.get(`USE_USER_CLIENT_${FN_NAME}`) nas functions-alvo da SEC-08 ou registrar descarte da mitigação.
- **Evidência:** ausente: grep -rn 'USE_USER_CLIENT' supabase/ src/ scripts/ .github/ → 0 resultados. Única menção: docs/SEC-08_SERVICE_ROLE_AUDIT.md:54 (mitigação planejada 'deploy em canário via feature-flag USE_USER_CLIENT_${FN_NAME}').| cético: grep -rln 'USE_USER_CLIENT' . (fora de node_modules) → só docs: docs/SEC-08_SERVICE_ROLE_AUDIT.md, docs/estado/08_ADMIN_SEGURANCA.md, docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md; 0 em supabase/functions.

### F1455 · Graphify: conjunto de perguntas de negócio/avaliação

- **Tipo:** Doc/config
- **O que os docs afirmam:** Etapa 03 NI.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:467`
- **O que falta:** Criar docs/graphify/ com conjunto de ≥20 perguntas, respostas de referência independentes e métricas (plano :87-92).
- **Evidência:** ausente: `grep -rni 'pergunta' docs/graphify/README.md` → 0 resultados; `ls docs/graphify/` lista só BASELINE_AST_SRC, EXECUCAO_LOTE_A..F, README, REVISAO_EXAUSTIVA e revisao-20260911 — nenhum conjunto de perguntas de negócio/avaliação. docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:467 confirma 'Etapa 03 NI — ausente em docs/graphify/'.| cético: ls docs/graphify/ → nenhum arquivo de perguntas; grep -rli 'pergunta\|questions' docs/graphify tools/graphify scripts/graphify → só REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:137, que registra etapa 03 como PENDENTE. Só há 2 exemplos em texto de plano (docs/planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md:90), não um artefato de avaliação.

### F1469 · Hook pre-commit roda typecheck/testes

- **Tipo:** Doc/config
- **O que os docs afirmam:** .husky/pre-commit só roda lint-staged (eslint --fix + prettier).
- **Fontes:** `docs/auditoria/RELATORIO_FALHAS.md:368-370`
- **O que falta:** Criar .husky/pre-push com `npm run typecheck && npx vitest related --run` (ou adicionar `tsc --noEmit` ao lint-staged).
- **Evidência:** .husky/pre-commit (1 linha): `npx lint-staged`; lint-staged em package.json:191-200 roda só `eslint --fix`, `prettier --write`, `eslint --max-warnings 0` — nenhum tsc nem vitest. `ls .husky/` → commit-msg, post-checkout, post-commit, pre-commit: não existe pre-push. `grep -rn 'tsc\\|vitest' .husky/ package.json#lint-staged` → 0. Typecheck/testes só no CI (.github/workflows/pr-checks.yml:112,122,220).
- **Revisão:** sem contestação cética concluída.

### F1491 · Logs de invocação de EF via Management API

- **Tipo:** Doc/config
- **O que os docs afirmam:** NÃO INICIADO: "quem chama" só estático.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:297`
- **O que falta:** Criar script (ex.: scripts/inventario/gerar-invocacoes-ef.mjs) que consulte os logs de edge functions via Management API/analytics com SUPABASE_ACCESS_TOKEN e gere relatório de invocações por function; integrar ao workflow contexto.yml.
- **Evidência:** Nenhum artefato coleta logs de invocação de edge functions. Management API só é usada para inventário de banco e metadados: scripts/inventario/gerar-banco.mjs:12,36 (POST /database/query/read-only), scripts/inventario/README.md:9 (só /database/query/read-only e GET /functions), scripts/supabase_snapshot/README.md:56,126 (metadados, não logs). `grep -rni 'function_edge_logs\|/analytics/\|invocations\|edge_logs' scripts .github/workflows` → 0 resultados. Snapshot contexto/supabase/edge-functions.md:3: 'Management API desabilitada'. 'Quem chama' em contexto/codigo/edge-functions.json continua estático (chaves: edges, chamadas_sem_pasta).
- **Revisão:** sem contestação cética concluída.

### F1512 · on-call: escala de contatos preenchida

- **Tipo:** Doc/config
- **O que os docs afirmam:** NÃO INICIADO: placeholders {{ … }}.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:329`
- **O que falta:** Preencher a tabela de escala em docs/runbooks/on-call.md:19-23 com nomes e canais reais (decisão do dono).
- **Evidência:** docs/runbooks/on-call.md:19-23: todos os contatos são placeholders ({{ NOME_PLANTAO_PRIMARIO }}, {{ NOME_BACKUP }}, {{ NOME_PO }}, {{ NOME_ADMIN_INFRA }}, {{ NOME_DONO_CREDENCIAIS }}, {{ CANAL/TELEFONE }}); :3 avisa que os campos devem ser preenchidos.
- **Revisão:** sem contestação cética concluída.

### F1518 · Permissions-Policy camera=(), microphone=(self), geolocation=(self)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Restringe APIs do browser ao que o app usa.
- **Fontes:** `docs/SECURITY_HEADERS.md:28`
- **O que falta:** Adicionar `{"key":"Permissions-Policy","value":"camera=(), microphone=(self), geolocation=(self)"}` ao bloco de headers de vercel.json (linhas 12-37) e validar com `curl -I` após deploy.
- **Evidência:** vercel.json:9-56 (blocos `/((?!embed/).*)` e `/embed/(.*)`) tem X-Content-Type-Options, X-Frame-Options, CSP frame-ancestors, Referrer-Policy, HSTS e X-DNS-Prefetch-Control — sem Permissions-Policy. `grep -rn "Permissions-Policy" --include=*.json --include=*.ts --include=*.html --include=*.toml .` → apenas index.html:48 (comentário que afirma ser aplicado via vercel.json, o que não ocorre). docs/SECURITY_HEADERS.md:28 lista como recomendado.
- **Revisão:** sem contestação cética concluída.

### F1520 · Plano 30/08 etapa 1 (P001): Congelamento temporário de releases até classificar P0/P1

- **Tipo:** Doc/config
- **O que os docs afirmam:** Etapa 1 do plano de 100 etapas (auditoria 30/08; = P001 do handoff): Instituir congelamento de releases; saída: registro de exceções e responsáveis.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:647-647`
- **O que falta:** Criar docs/execucao/CONGELAMENTO_RELEASES_<data>.md com decisão (congelar ou formalmente não congelar), exceções e responsáveis; ou marcar a etapa como descartada no plano.
- **Evidência:** `grep -rn -i congelamento docs --include=*.md` → só a própria etapa (AUDITORIA_EXAUSTIVA_2026-08-30...:647) e STATUS_100_ETAPAS_2026-08-30.md:279,323 (congelamento da origem Lovable, outro tema). docs/execucao/ sem registro de freeze/exceções. A_planos_execucao.md:113 confirma "Congelar releases| NI \| sem registro". Ruleset da main (gh api rules/branches/main): PR obrigatória com 0 aprovações + status check `CI Gate`, sem congelamento.
- **Revisão:** sem contestação cética concluída.

### F1531 · Plano graphify com tabela de status por etapa

- **Tipo:** Doc/config
- **O que os docs afirmam:** Etapa 50 NI.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:497`
- **O que falta:** Adicionar ao plano tabela `etapa| status \| evidência \| data` para as 50 etapas (insumo em docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:448-497).
- **Evidência:** docs/planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md existe (fases A–J, linhas 71-404) mas sem tabela de status por etapa (`grep -n -i "^\|.*status"` → 0). A_planos_execucao.md:497: "50| Auditar as 50 etapas \| NI \| o plano segue sem tabela de status por etapa".
- **Revisão:** sem contestação cética concluída.

### F1542 · PR template com backup/dry-run/rollback

- **Tipo:** Doc/config
- **O que os docs afirmam:** P020 NI: pull_request_template.md sem esses itens.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:130`
- **O que falta:** Incluir em .github/pull_request_template.md seção para PRs com migrations/infra: backup prévio (link do dump/snapshot), dry-run executado (saída) e plano de rollback (comando/migration reversa).
- **Evidência:** .github/pull_request_template.md (lido inteiro) tem checklists de qualidade, evidência pós-aplicação, segurança, performance e a11y; ausente: grep -n -i 'backup\|dry-run\|rollback' .github/pull_request_template.md → 0 resultados.
- **Revisão:** sem contestação cética concluída.

### F1543 · Previews da Vercel apontam para staging (hoje produção por default de env.ts)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Sem env, build cai no default de produção (env.ts:4-12), contrariando STAGING.md:49.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:157`
- **O que falta:** Provisionar o projeto Supabase de staging (F1546) e, no painel vercel.com/juca1/promo-champions-v2-1 → Settings → Environment Variables, definir VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY do staging no escopo Preview; confirmar via bundle do preview.
- **Evidência:** src/integrations/supabase/env.ts:4-5 e 9-12 — sem env, o bundle usa https://usyxfpqlsspldubptrdl.supabase.co (produção). docs/STAGING.md:3 afirma que só existe projeto de produção; supabase/config.staging.toml não tem project ref (site_url staging.salespro.com, template). docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:157 'Previews da Vercel batem em produção — DIVERGENTE'. docs/agentes/vercel-deploy.md:19-22 registra que o MCP Vercel não acessa o projeto; painel da Vercel não foi consultável nesta sessão (curl ao domínio bloqueado pelo proxy). Sem projeto de staging, não há destino para a env de preview.
- **Revisão:** sem contestação cética concluída.

### F1546 · Projeto Supabase de staging promo-champions-staging

- **Tipo:** Doc/config
- **O que os docs afirmam:** Guia para provisionar projeto de staging; hoje só existe produção.
- **Fontes:** `docs/STAGING.md:3-16`
- **O que falta:** Criar o projeto no dashboard Supabase, registrar o ref em supabase/config.staging.toml (project_id) e docs/STAGING.md, aplicar migrations (supabase db push --project-ref <ref>) e adicionar job/workflow que aplique migrations no staging antes de produção.
- **Evidência:** docs/STAGING.md:3 'Hoje existe um único projeto Supabase de produção'; STAGING.md:11 só sugere o nome promo-champions-staging. supabase/config.staging.toml existe (commit 326ec2dbf) mas é template de CLI local sem project ref (config.staging.toml:15-16 site_url = https://staging.salespro.com). Nenhum workflow referencia staging: grep -rn -i 'staging\|STAGING_PROJECT_REF' .github/workflows/*.yml → 0 resultados. G_infra_ci_integracoes.md:155 'Staging NÃO INICIADO; config.staging.toml não é usado'. Organização Supabase não acessível nesta sessão (MCPs disponíveis são de outros projetos), mas nenhum artefato do repo aponta para um ref de staging.
- **Revisão:** sem contestação cética concluída.

### F1550 · react-hooks/exhaustive-deps como error sem disables em massa

- **Tipo:** Doc/config
- **O que os docs afirmam:** Regra é warn e há 60 `eslint-disable-next-line react-hooks/exhaustive-deps` (13 em RaceArena.tsx).
- **Fontes:** `docs/auditoria/RELATORIO_FALHAS.md:317-321`
- **O que falta:** Corrigir as 50 dependências de efeito (prioridade RaceArena.tsx, 13 casos), remover os disables e promover a regra para 'error' em eslint.config.js:44.
- **Evidência:** eslint.config.js:44 'react-hooks/exhaustive-deps': 'warn' (não 'error'). Disables: grep -rn 'eslint-disable.*react-hooks/exhaustive-deps' src → 50 ocorrências (doc dizia 60), 13 em src/components/race/RaceArena.tsx.
- **Revisão:** sem contestação cética concluída.

### F1554 · Referências a Lovable (championgifts.lovable.app, painel Lovable → History) no runbook de plantão

- **Tipo:** Doc/config
- **O que os docs afirmam:** Runbook instrui reprodução em championgifts.lovable.app e rollback via painel Lovable, enquanto RUNBOOK.md diz que o deploy saiu do Lovable em out/2026 (domínio legado).
- **Fontes:** `docs/runbooks/on-call.md:27-34,46`
- **O que falta:** Atualizar docs/runbooks/on-call.md:27-30 e :46 para Vercel (https://promo-champions-v2-1.vercel.app / promochampions.com.br; rollback via vercel.com/juca1/promo-champions-v2-1 → Deployments → Promote/Rollback).
- **Evidência:** docs/runbooks/on-call.md:27-28 'reprodução manual em championgifts.lovable.app'; :29 'frontend (Lovable)'; :30 'rollback Lovable'; :46 'Deploy/rollback frontend: painel Lovable → History'; :22 'Admin Supabase/Lovable'. Contradiz docs/RUNBOOK.md:27 ('o deploy saiu do Lovable em out/2026') e :49 (championgifts.lovable.app é legado) e docs/agentes/vercel-deploy.md:10. Inconsistência confirmada; on-call.md não foi atualizado.
- **Revisão:** sem contestação cética concluída.

### F1560 · Registros "Conclusão P0nn" por etapa

- **Tipo:** Doc/config
- **O que os docs afirmam:** §16 NI.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:203`
- **O que falta:** Adicionar, no arquivo de status das 100 etapas, um bloco 'Conclusão P0nn' por etapa concluída com evidência (PR, deploy, verificação).
- **Evidência:** grep -rn 'Conclusão P0' docs → 2 resultados: docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:203 (o próprio achado 'nenhum registro') e docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:107 ('Conclusão P0-004', um único parágrafo sobre service_role, não um registro padronizado por etapa). Não há registro 'Conclusão P0nn' para as demais etapas.
- **Revisão:** sem contestação cética concluída.

### F1563 · RELATORIO_E2E.md com resultados por ferramenta

- **Tipo:** Doc/config
- **O que os docs afirmam:** Etapa 40: registrar RELATORIO_E2E.md com resultados.
- **Fontes:** `docs/auditoria/00_PLANO_MESTRE_AUDITORIA.md:121`
- **O que falta:** Executar a bateria E2E dirigida (Fase 3, etapas 31–40) e registrar docs/auditoria/RELATORIO_E2E.md com resultados por ferramenta/função (saídas reais de playwright/vitest/deno).
- **Evidência:** ausente: ls docs/auditoria/RELATORIO_E2E.md → No such file; find docs -iname '_E2E_' → 0 resultados. docs/auditoria/00_PLANO_MESTRE_AUDITORIA.md:121 (etapa 40) e :142 (Fase 3 pendente). RELATORIO_FINAL.md:71-72 trata só do gate E2E vazio (C3), sem resultados por ferramenta/função.
- **Revisão:** sem contestação cética concluída.

### F1566 · Remoção da sonda **probe**

- **Tipo:** Doc/config
- **O que os docs afirmam:** ONDA_0 bloq. 7 NI.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:400`
- **O que falta:** Apagar scripts/seed-probe.ts (e a entrada em scripts/automation.config.json:714 e docs/AUTOMACAO_LOCAL.md:122); em produção, `DELETE FROM activities WHERE notes='__probe__'` após `SELECT count(*)` de confirmação.
- **Evidência:** Sonda ainda presente: scripts/seed-probe.ts:28-36 insere em `activities` com notes: '**probe**' usando service_role (requireSupabaseAdminEnv, scripts/seed-probe.ts:2-3). Registrado como manual em docs/AUTOMACAO_LOCAL.md:122 e scripts/automation.config.json:714. Doc confirma pendente: A_planos_execucao.md:400 (NI). Snapshot não traz linhas de `activities`, logo não é possível saber se há registro **probe** gravado em produção.
- **Revisão:** sem contestação cética concluída.

### F1570 · Reverter env/secret no painel Supabase ou Lovable Cloud (desatualizado: Vercel)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Rollback de variáveis menciona Lovable Cloud em vez de Vercel.
- **Fontes:** `docs/ROLLBACK.md:27-30`
- **O que falta:** Editar docs/ROLLBACK.md:27-30 para 'Vercel → Settings → Environment Variables (+ Redeploy)' e Supabase → Edge Functions → Secrets; remover 'Lovable' das linhas 5 e 7.
- **Evidência:** docs/ROLLBACK.md:29 ainda diz 'Revertas os valores no painel do Supabase ou Lovable Cloud'; docs/ROLLBACK.md:5,7 'Lovable/Vercel'. Host real é Vercel: docs/agentes/vercel-deploy.md:8-9 (projeto `promo-champions-v2-1`), .github/workflows/deploy.yml:24-29. `grep -n Vercel docs/ROLLBACK.md` só encontra as menções mistas 'Lovable/Vercel' (linhas 5,7).
- **Revisão:** sem contestação cética concluída.

### F1575 · Ruleset main-protection com strict, aprovações e code owners

- **Tipo:** Doc/config
- **O que os docs afirmam:** Ruleset 22148182 exige só o check CI Gate, strict=false, 0 aprovações, sem code owner, permite squash e merge.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:9,29`
- **O que falta:** Dono decide (regra 5.8 — CI/segurança): PUT em rulesets/22148182 com strict_required_status_checks_policy=true, required_approving_review_count≥1, require_code_owner_review=true; antes, corrigir .github/CODEOWNERS (owner @promo-ops inválido, G_infra:30).
- **Evidência:** `gh api …/rulesets/22148182` (ao vivo, 20/11/2026): required_approving_review_count=0, require_code_owner_review=false, strict_required_status_checks_policy=false, allowed_merge_methods ['squash','merge']. Exatamente o estado descrito como pendente em G_infra_ci_integracoes.md:9,29. Nenhum dos três reforços (strict, ≥1 aprovação, code owners) está ativo.
- **Revisão:** sem contestação cética concluída.

### F1577 · Runbook de bootstrap de _internal_secrets (functions_base_url, anon_key)

- **Tipo:** Doc/config
- **O que os docs afirmam:** DIVERGENTE/bloqueante: só coaching_cron_secret existe; crons levantam internal_edge_job_secrets_missing.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:308`
- **O que falta:** Criar docs/runbooks/internal-secrets-bootstrap.md (ou seção em RUNBOOK.md) com INSERT ... ON CONFLICT (key) DO UPDATE para as 3 chaves e verificação `SELECT key, updated_at FROM public._internal_secrets`; executar a inserção em produção via MCP.
- **Evidência:** Runbook de bootstrap ausente: `grep -rni bootstrap docs/runbooks docs/RUNBOOK.md` → 0 (só docs/agentes/replay-do-repo-261117.md:15 em outro contexto); nenhuma migration/script insere as chaves. Banco real: public._internal_secrets com 1 linha (snapshot stats.md:238) — as 3 chaves exigidas (RUNBOOK.md:53-54) não estão presentes; funções SQL em produção lançam `internal_edge_job_secrets_missing` sem elas (functions/public/trigger_internal_edge_job__f02f045c8b4350ab.sql:56).
- **Revisão:** sem contestação cética concluída.

### F1580 · RUNBOOK: procedimento de inserção de secrets em _internal_secrets

- **Tipo:** Doc/config
- **O que os docs afirmam:** NÃO INICIADO (bloqueante).
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:347`
- **O que falta:** Adicionar em docs/RUNBOOK.md (seção Secrets) o procedimento: `INSERT INTO public._internal_secrets(key,value) VALUES (...) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=now()` + `SELECT key FROM public._internal_secrets ORDER BY key` esperando 3 linhas; executar em produção.
- **Evidência:** docs/RUNBOOK.md:53-56 apenas lista as chaves `coaching_cron_secret`, `anon_key`, `functions_base_url` em public._internal_secrets; não há procedimento de inserção nem `SELECT key` de verificação (`grep -n 'INSERT\\|SELECT key' docs/RUNBOOK.md` → 0). Banco real: 1 linha na tabela (snapshot stats.md:238) — chaves faltando. Estado idêntico ao 'NÃO INICIADO' de C_estado_runbooks.md:347.
- **Revisão:** sem contestação cética concluída.

### F1587 · Scorecard de prontidão atualizado

- **Tipo:** Doc/config
- **O que os docs afirmam:** Etapa 10 P: STATUS §4 e ESTADO_ATUAL (08-16, sobre rapjs).
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:27`
- **O que falta:** Reescrever docs/estado/ESTADO_ATUAL.md com medição sobre usyxfpqlsspldubptrdl (snapshot em docs/contexto/supabase) e scorecard vermelho/amarelo/verde; remover a referência a STATUS §4 ou criar o arquivo.
- **Evidência:** docs/estado/ESTADO_ATUAL.md:3 ainda 'Medição: 2026-08-16. Banco de produção `rapjswienfhkobhlamxb`' (banco antigo; oficial é usyxfpqlsspldubptrdl, AGENTS.md §7); último commit do arquivo 1309366ed 2026-08-16. `find . -name STATUS.md` → 0 (a 'matriz em STATUS §4' citada em A_planos_execucao.md:27 não existe no repo).
- **Revisão:** sem contestação cética concluída.

### F1589 · Scripts do package.json sem uso removidos

- **Tipo:** Doc/config
- **O que os docs afirmam:** Scripts que nunca rodam no CI.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:293`
- **O que falta:** Decidir lista de scripts a manter (dev, preview, lint:fix são conveniências legítimas) e remover do package.json os sem chamador (automation:_, maintenance:_, graphify:* não usados, debt:report, flaky:report), ou ligá-los a um workflow.
- **Evidência:** package.json declara 63 scripts; apenas 15 comandos `npm run …` distintos aparecem em .github/workflows/_.yml. Varredura (grep 'run <nome>' em .github, .husky, scripts/, docs/agentes, AGENTS.md, README.md, package.json) → 38 scripts sem nenhuma referência, ex.: maintenance:doctor/check/heal, build:bun/node, test:deno, test:sql, test:load, flaky:report, debt:report, graphify:verify/impact/catalog/reconcile/docs, automation:_ (10). Nenhuma remoção feita; fonte funcionalidades-pendentes README.md:293 continua válida.
- **Revisão:** sem contestação cética concluída.

### F1603 · Segundo admin (bus factor) definido

- **Tipo:** Doc/config
- **O que os docs afirmam:** @promo-ops não existe (CODEOWNERS, DR_PLAN).
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:162`
- **O que falta:** Criar a segunda conta admin no GitHub e no Supabase e atualizar CODEOWNERS e docs/DR_PLAN.md.
- **Evidência:** .github/CODEOWNERS:5-8 declara '@promo-ops = conta de serviço/segundo admin a provisionar (bus factor)' e `* @adm01-debug @promo-ops`; github_get_user('promo-ops') → 404 Not Found (usuário não existe); github_list_collaborators → apenas adm01-debug (role admin). Segunda conta admin no Supabase não verificável (sem acesso ao painel/organização xkwxmfhdzgjzbkmbozcg).| cético: .github/CODEOWNERS:5-8 marca '@promo-ops = conta de serviço/segundo admin a provisionar (bus factor)' e `* @adm01-debug @promo-ops`. github_get_user('promo-ops') → 404 Not Found (consultado hoje). O handle é um placeholder sem conta real.

### F1609 · Status page pública

- **Tipo:** Doc/config
- **O que os docs afirmam:** NÃO INICIADO: "_pendente_".
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:349`
- **O que falta:** Deployar `health` e criar a status page no provedor de uptime, registrando o link em RUNBOOK.md:118.
- **Evidência:** docs/RUNBOOK.md:118 'Status page pública (opcional): o próprio provedor gera — link a registrar'; docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:349 'NÃO INICIADO'. ausente: `grep -rniE 'statuspage\|uptimerobot\|betteruptime\|instatus\|status\.promo' src .github vercel.json` → 0 resultados (único hit 'StatusPage' é RetryTestStatusPage.tsx, página interna de testes de retry, não status page pública).| cético: docs/RUNBOOK.md:118 'Status page pública (opcional): ... link a registrar'. ausente: `grep -rniE 'statuspage\|uptimerobot\|betteruptime\|instatus' src .github vercel.json` → 0 resultados. A única rota com 'status' é /admin/retry-test-status (src/routes/AppRoutes.tsx:1093-1096), uma página interna de testes. Além disso, a function `health` nem está deployada (fora da allowlist de deploy.yml:144).

### F1610 · supabase/.temp rastreado (estado de máquina/projeto)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Candidato a limpeza listado na auditoria: supabase/.temp rastreado (estado de máquina/projeto); nenhuma exclusão autorizada sem aprovação nominal.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:602-624`
- **O que falta:** `git rm -r --cached supabase/.temp` e adicionar `supabase/.temp/` ao .gitignore, com nota de que `supabase link --project-ref usyxfpqlsspldubptrdl` regenera a pasta.
- **Evidência:** `git ls-files supabase/.temp` → 8 arquivos rastreados (gotrue-version, linked-project.json, pooler-url, postgres-version, project-ref, rest-version, storage-migration, storage-version), introduzidos no commit b722848dd (`git log -- supabase/.temp`). `.gitignore` não contém 'supabase' nem '.temp' (`grep -n 'temp\\|supabase' .gitignore` → 0). Limpeza pendente desde docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:602-624.| cético: `git ls-files supabase/.temp` → 8 arquivos rastreados. ausente: `grep -n -i 'temp\\|supabase' .gitignore` → 0 resultados.

### F1616 · supabase/config.toml sem blocos [functions.<nome>] para funções de segurança

- **Tipo:** Doc/config
- **O que os docs afirmam:** Sem declaração de verify_jwt para webauthn, new-device-alert, access-denied-alerts, send-password-reset, get-client-ip; default não lido.
- **Fontes:** `docs/estado/08_ADMIN_SEGURANCA.md:296`
- **O que falta:** Declarar [functions.<nome>] verify_jwt explicitamente em supabase/config.toml para as 5 funções e registrar a decisão em docs/estado/08_ADMIN_SEGURANCA.md:296.
- **Evidência:** ausente: grep -n 'webauthn\\|new-device-alert\\|access-denied-alerts\\|send-password-reset\\|get-client-ip' supabase/config.toml → 0 resultados (blocos existentes só em config.toml:3-89, nenhum para essas 5). Pastas existem (supabase/functions/{webauthn,new-device-alert,access-denied-alerts,send-password-reset,get-client-ip}/). Sem bloco vale o default do Supabase (verify_jwt=true). Na allowlist deploy.yml:144 só webauthn e access-denied-alerts; new-device-alert, send-password-reset e get-client-ip estão fora (não rodam em produção).| cético: ausente: grep -nE 'webauthn\|new-device-alert\|access-denied-alerts\|send-password-reset\|get-client-ip' supabase/config.toml → 0 resultados. Na allowlist deploy.yml:144 estão webauthn e access-denied-alerts (1 cada); new-device-alert, send-password-reset e get-client-ip não estão (0 cada).

### F1634 · UAT registrado

- **Tipo:** Doc/config
- **O que os docs afirmam:** P098 NI.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:187`
- **O que falta:** Criar o registro de UAT (roteiro, data, executor, resultado) em docs/uat/.
- **Evidência:** ausente: grep -rln 'UAT' docs → só docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:187 ('\| 98| UAT \| NI \| ausente \|'), AUDITORIA_EXAUSTIVA_2026-08-30 e handoff (planos). ls docs/uat docs/UAT → No such file; grep UAT em src/ tests/ e2e/ → 0 resultados. Nenhum roteiro, ata ou evidência de aceitação pelo usuário. \| cético: ausente: git grep -il '\bUAT\b\|aceitação do usuário\|user acceptance' → só planos (A_planos_execucao.md, AUDITORIA_EXAUSTIVA_2026-08-30, HANDOFF_CLINE) e um falso positivo binário (public/icon-192.png). ls docs \| grep -iE 'uat\|aceite\|homolog' → 0 resultados.

### F1647 · Visualização privada do grafo

- **Tipo:** Doc/config
- **O que os docs afirmam:** Etapa 35 NI.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:485`
- **O que falta:** Decidir se vale publicar graph.html como artifact do workflow graphify.yml (upload-artifact com retenção curta) ou documentar em docs/agentes/contexto-gerado.md que a visualização é só local (graphify update . gera graph.html).
- **Evidência:** .gitignore:49-51 ignora /graphify-out/* exceto GRAPH_REPORT.md e manifest.json (graph.html ignorado); ls graphify-out → só GRAPH_REPORT.md e manifest.json; grep -niE 'html\|upload-artifact\|pages' .github/workflows/graphify.yml → 0 resultados; grep -rniE 'graph.html\|visualiza' docs/graphify/README.md docs/agentes/contexto-gerado.md → 0 resultados. Nenhuma alternativa de visualização privada.
- **Revisão:** sem contestação cética concluída.

### F3627 · Edge function health (REAL)

- **Tipo:** Edge function
- **O que os docs afirmam:** Doc classifica como REAL. Chamador(es): monitor externo + .github/workflows/deploy.yml:154-156 + scripts/smoke-target-backend.ts:59. Utilitário (não lê banco). APP_VERSION.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:120-120`
- **O que falta:** pasta supabase/functions/smoke-target-backend/index.ts ausente
- **Evidência:** pasta supabase/functions/smoke-target-backend/index.ts ausente| CONTESTADO pelo cético (PARCIAL): A pré-checagem procurou a pasta errada. supabase/functions/health/index.ts existe (29 linhas, retorna status/version via APP_VERSION). O chamador é .github/workflows/deploy.yml:177-185 (pós-deploy, só emite warning). scripts/smoke-target-backend.ts:59 chama /auth/v1/health, não a edge. 'health' está FORA da allowlist deploy.yml:144 (grep -x health → 0), portanto não está publicada.
- **Revisão:** em disputa. O cético propõe Parcial e o juiz ainda não decidiu.

### F3632 · Endpoint /health padronizado nas edge functions

- **Tipo:** Edge function
- **O que os docs afirmam:** Poucas funções têm health check; recomenda /health padrão, verificação de DB e monitor de uptime externo.
- **Fontes:** `docs/reports/BACKEND_ANALYSIS_REPORT.md:731-737`
- **O que falta:** pasta supabase/functions/health-check/index.ts ausente
- **Evidência:** pasta supabase/functions/health-check/index.ts ausente| CONTESTADO pelo cético (PARCIAL): Existe um endpoint de health dedicado: supabase/functions/health/index.ts:1-29. Ele não toca o banco e está fora da allowlist deploy.yml:144. Não há handler compartilhado: ls supabase/functions/_shared \| grep health → só campaign-health.ts, sem health.ts.
- **Revisão:** em disputa. O cético propõe Parcial e o juiz ainda não decidiu.

### F3633 · Etapa 040 (CI): Triar 11 alertas CodeQL high e 18 stack-trace-exposure em edge functions

- **Tipo:** Edge function
- **O que os docs afirmam:** 1 PR por domínio; toca supabase/functions/**.
- **Fontes:** `docs/execucao/PLANO_WORKFLOWS_GITHUB_ACTIONS_100_ETAPAS_2026-09-27.md:109`
- **O que falta:** pasta supabase/functions/stack-trace-exposure/index.ts ausente
- **Evidência:** pasta supabase/functions/stack-trace-exposure/index.ts ausente| CONTESTADO pelo cético (PARCIAL): Consultei os alertas abertos do CodeQL pelo MCP GitHub (github_list_code_scanning_alerts state=open): 34 alertas e 0 do tipo js/stack-trace-exposure, ou seja, os 18 foram resolvidos. Ainda há 11 'high' abertos. Em supabase/functions: _shared/cors_test.ts:7-8 (alertas #38, #39, #52, #53) e helpdesk-sync/index.ts:56 (#42). Os demais estão em src/, tests/ e scripts/.
- **Revisão:** em disputa. O cético propõe Parcial e o juiz ainda não decidiu.

### F3634 · OPTIONS 500/503 em 8 rotas da origem e 4 do destino

- **Tipo:** Edge function
- **O que os docs afirmam:** OPTIONS respondeu 500/503 em oito rotas presentes na origem e quatro no destino; exige logs/runtime.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:313-313`
- **O que falta:** pasta supabase/functions/edge-function/index.ts ausente
- **Evidência:** pasta supabase/functions/edge-function/index.ts ausente| CONTESTADO pelo cético (NAO_VERIFICAVEL): O item é uma observação de runtime (preflight OPTIONS devolvendo 5xx em produção, nos projetos origem e destino). A pré-checagem procurou uma pasta 'edge-function' que não tem relação com o item. O snapshot não tem a lista de functions publicadas: contexto/supabase/edge-functions.md:3 diz 'Management API desabilitada'.
- **Revisão:** em disputa. O cético propõe Não verificável e o juiz ainda não decidiu.

### F3635 · PR #66 altera 20 entrypoints de Edge Functions e libs _shared

- **Tipo:** Edge function
- **O que os docs afirmam:** Merge do PR #66 (129 arquivos) alterou 20 supabase/functions/*/index.ts e bibliotecas compartilhadas de auth, integridade de webhook, CORS, rate limit e request ID.
- **Fontes:** `docs/execucao/RECONCILIACAO_GITHUB_SUPABASE_2026-08-31.md:27-33`
- **O que falta:** pasta supabase/functions/rate-limit/index.ts ausente
- **Evidência:** pasta supabase/functions/rate-limit/index.ts ausente| CONTESTADO pelo cético (IMPLEMENTADO): O merge do PR #66 existe (git log: c59a4f21a). As libs _shared existem e são importadas pelos entrypoints. Contagem de supabase/functions/*/index.ts que importam cada uma: cors.ts 167, request-id.ts 171, auth-client.ts 113, rate-limit.ts 61, internal-service-auth.ts 9, webhook-auth.ts 5, webhook-integrity.ts 3.
- **Revisão:** em disputa. O cético propõe Implementado e o juiz ainda não decidiu.

### F1682 · Remoção das 17 functions órfãs

- **Tipo:** Edge function
- **O que os docs afirmam:** Onda 4: remover 17 functions órfãs após observação.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:370`
- **O que falta:** Remover as pastas das 17 órfãs (ou ligar chamador/cron para as que devem viver, ex.: check-quote-expiration e process-scheduled-sends já têm cron em cron.md jobs 80 e 79 mas estão fora da allowlist).
- **Evidência:** As 17 órfãs de docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:285-306 continuam todas no repo (ls -d supabase/functions/{check-quote-expiration,send-quote-to-client,process-scheduled-sends,sequence-record-reply,analyze-pipeline-coverage,generate-loss-coaching,admin-conversion-trail,ai-copilot,generate-coaching-actions,predict-deal-velocity,ranking-api,new-device-alert,send-push-notification,winloss-webhook-replay-batch,elevenlabs-stt,get-client-ip,simulate-load} → 17 existem). git log --diff-filter=D em supabase/functions/*/index.ts só mostra migrate-helper, calibrate-win-probabilities e refresh-stage-baselines. Snapshot codigo/edge-functions.json hoje marca 31 functions orfa=true.
- **Revisão:** sem contestação cética concluída.

### F1700 · Status page pública do provedor de uptime

- **Tipo:** Integração externa
- **O que os docs afirmam:** Status page pública opcional gerada pelo provedor; link a registrar no runbook quando criado — marcado como pendente.
- **Fontes:** `docs/RUNBOOK.md:110-111`
- **O que falta:** Criar o monitor externo primeiro (F1697), ativar a status page no provedor e registrar o link em docs/RUNBOOK.md:119.
- **Evidência:** docs/RUNBOOK.md:118-119: 'Status page pública (opcional): o próprio provedor gera — link a registrar aqui quando criado: _pendente_.' Ausente: grep -rni 'status page\\|statuspage\\|status\.' docs/RUNBOOK.md → só essa linha; nenhum link de provedor em docs/ (grep -rni 'betteruptime.com\\|statuspage.io\\|uptimerobot.com\\|checklyhq.com' docs/ → 0). Depende de F1697 (monitor externo não criado).
- **Revisão:** sem contestação cética concluída.

### F1706 · Etapa 03 (Graphify, revisão 11/09): Perguntas e sucesso mensurável

- **Tipo:** Outro
- **O que os docs afirmam:** Classificação da revisão exaustiva para a etapa 3 do plano Graphify: PENDENTE.
- **Fontes:** `docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:137`
- **O que falta:** Criar docs/graphify/PERGUNTAS_AVALIACAO.md (ou JSON em tests/graphify/) com ≥20 perguntas, resposta de referência por inspeção independente, fonte (arquivo:linha) e métrica de tokens/tempo.
- **Evidência:** Aceite da etapa 03 (plano:87-92): ≥20 perguntas com respostas de referência, fontes e métricas. Ausente: grep -rln -i 'respostas de referência\\|perguntas de referência\\|20 perguntas' docs/ scripts/ → só docs/planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md:90 (o próprio plano). docs/graphify/ (ls: BASELINE_AST_SRC, EXECUCAO_LOTE_A–F, README, REVISAO_EXAUSTIVA, revisao-20260911/) não contém conjunto de avaliação; docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:137 classifica PENDENTE.
- **Revisão:** sem contestação cética concluída.

### F1742 · Etapa 39 (Graphify, revisão 11/09): Alertas calibrados

- **Tipo:** Outro
- **O que os docs afirmam:** Classificação da revisão exaustiva para a etapa 39 do plano Graphify: PENDENTE.
- **Fontes:** `docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:173`
- **O que falta:** Observar ≥3 PRs reais com o fluxo graphify, registrar falsos positivos, definir limiares por baseline com owner e exceções com expiração em docs/graphify/, e só então decidir required checks.
- **Evidência:** .github/workflows/graphify.yml:47-51 e pr-checks.yml:143-144 executam apenas `npm run graphify:test` e uma extração de fumaça — nenhum gate baseado em métricas do grafo, limiar, baseline ou política de exceção; ausente: grep -rli 'limiar\\|política de exceção' docs/graphify scripts/graphify → só REVISAO_EXAUSTIVA_PLANO_2026-09-11.md; docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:488 registra etapa 39 como NI.
- **Revisão:** sem contestação cética concluída.

### F1747 · Etapa 44 (Graphify, revisão 11/09): Qualidade e benefício

- **Tipo:** Outro
- **O que os docs afirmam:** Classificação da revisão exaustiva para a etapa 44 do plano Graphify: PENDENTE.
- **Fontes:** `docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:178`
- **O que falta:** Corpus de perguntas com gabarito independente, medição de acertos/omissões por categoria, tempo frio/quente e recursos, publicado em docs/graphify/ com hardware e versões.
- **Evidência:** ausente: grep -rli 'benchmark' docs/graphify → 0 resultados; grep -rli 'gabarito\\|tempo frio' docs/graphify scripts/graphify → 0; docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:492 etapa 44 NI. docs/graphify/BASELINE_AST_SRC_2026-09-11.md traz apenas contagens (nós/relações), não comparação com referências independentes.
- **Revisão:** sem contestação cética concluída.

### F1749 · Etapa 46 (Graphify, revisão 11/09): Piloto em PR real

- **Tipo:** Outro
- **O que os docs afirmam:** Classificação da revisão exaustiva para a etapa 46 do plano Graphify: PENDENTE.
- **Fontes:** `docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:180`
- **O que falta:** Escolher uma PR pequena, registrar em docs/graphify/PILOTO_<data>.md consulta→fontes→impacto→testes com SHA, e ter o mantenedor reproduzindo a consulta no mesmo SHA.
- **Evidência:** ausente: grep -rli 'piloto' docs/graphify → apenas REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:180 (que o declara pendente); nenhum caso de uso antes/depois com SHA reproduzido por mantenedor; A_planos_execucao.md:494 etapa 46 NI.
- **Revisão:** sem contestação cética concluída.

### F1757 · Alerta de teste chegando a humano em ≤ 15 min com agendador desligado em staging

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Prova de que o monitoramento externo funciona: alerta em ≤15 min com pg_cron desligado em staging.
- **Fontes:** `docs/postmortems/2026-08-30_cron_outage.md:90-91`
- **O que falta:** Criar heartbeat externo ao Supabase (ex.: workflow agendado que consulta cron.job_run_details e abre issue/notifica se não houver execução em 15 min), um ambiente staging ou simulação equivalente, e registrar o teste (data, tempo até o humano) no postmortem.
- **Evidência:** docs/postmortems/2026-08-30_cron_outage.md:90-91 lista o teste como critério de fechamento sem registro de execução; ausente: grep -rn -i 'staging' .github/workflows/*.yml .github/ENVIRONMENTS.md supabase/config.toml → 0 resultados (não existe ambiente staging); ausente: grep -rn -i 'heartbeat\\|healthchecks.io\\|betterstack\\|uptimerobot\\|cronitor' .github/workflows → 0 (nenhum monitor externo ao pg_cron); .github/workflows/cron-monitoring.yml:1-20 é só regressão Deno diária do cron-failure-alerter; ausente: grep -rn -i 'alerta de teste\\|agendador desligado' docs → só o postmortem.
- **Revisão:** sem contestação cética concluída.

### F1758 · Aplicação prévia em staging equivalente antes do canônico

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Ordem de reconciliação exige aplicar primeiro em staging equivalente e rodar testes de contrato/RLS/RPC/Edge.
- **Fontes:** `docs/execucao/RECONCILIACAO_GITHUB_SUPABASE_2026-08-31.md:169-179`
- **O que falta:** Provisionar staging Supabase (projeto separado ou `supabase start` efêmero no CI), aplicar supabase/migrations/ nele e rodar scripts/run-sql-tests.sh + testes Deno antes de DDL no canônico.
- **Evidência:** docs/execucao/RECONCILIACAO_GITHUB_SUPABASE_2026-08-31.md:169-179 exige 'aplicar primeiro em staging equivalente'; scripts/run-sql-tests.sh:5-20 só tem modos `static` e `remote` (banco real via SUPABASE_DB_URL); ausente: grep -rn -i 'staging' .github/workflows/*.yml .github/ENVIRONMENTS.md supabase/config.toml → 0; docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:155 'Replay em banco efêmero — NI'. Única referência é `.temp` do Supabase e AGENTS.md §7 que define o canônico como único banco do repo.
- **Revisão:** sem contestação cética concluída.

### F1775 · Divisão de src/components em lotes abaixo de 500 arquivos

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Ainda falta dividir src/components (1.259 arquivos) em lotes e executar baseline por domínio.
- **Fontes:** `docs/graphify/EXECUCAO_LOTE_A_2026-09-11.md:50`
- **O que falta:** Dividir src/components (cerca de 1.226 arquivos) em lotes de menos de 500 por domínio e rodar o baseline de cada um.
- **Evidência:** docs/graphify/EXECUCAO_LOTE_A_2026-09-11.md:50 registra a pendência; nenhum lote posterior a cobre (grep -n 'src/components' docs/graphify/EXECUCAO_LOTE_[B-F]*.md → 0 resultados). .github/workflows/graphify.yml:51 extrai só --scope src/lib/revenueForecast; .github/workflows/contexto.yml:159 roda 'graphify update . --force' no repo inteiro, sem divisão por domínio. .graphify-local/ não existe no checkout e está em .gitignore:54 — nenhum snapshot por domínio <500 arquivos versionado ou gerado.| cético: grep -rn "src/components" docs/graphify/ → 1 resultado só: a pendência em EXECUCAO_LOTE_A_2026-09-11.md:50. Os lotes B a F não tratam src/components; não há escopo por domínio em .graphifyignore nem em .github/workflows/graphify.yml (paths só nas linhas 5 e 14).

### F1784 · Etapa 058 (CI): Limpar caches órfãos e política de máx 5 caches Deno ativos

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Via github_delete_actions_cache_by_key após etapa 57.
- **Fontes:** `docs/execucao/PLANO_WORKFLOWS_GITHUB_ACTIONS_100_ETAPAS_2026-09-27.md:133`
- **O que falta:** Criar o workflow ou script de limpeza de caches órfãos com limite de 5 caches Deno.
- **Evidência:** github_list_actions_caches key='deno-Linux' em 2026-11-20: total_count 16 caches Deno ativos (~221-257 MB cada; 6 em refs/heads/main, 10 em refs/pull/*/merge), acima do máximo 5. Total geral de caches: 183. Nenhum workflow de limpeza: grep -rln 'cache delete\|actions-cache\|delete_actions_cache\|cache-cleanup' .github/workflows/ → 0 resultados.| cético: grep -rn -i "actions/caches\\|gh cache\\|delete.*cache" .github/workflows scripts → 0 resultados relevantes. A chave de cache Deno é única por hash do lockfile (edge-functions-bundle.yml:46-52, também cron-monitoring.yml:54 e pr-checks.yml:359), então o baixo número de caches Deno é incidental, sem política de limpeza.

### F1789 · Etapa 19 do plano: Criar baseline automatizado de presença Edge

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Comparar local, origem e destino via Management API/OPTIONS seguro. Saída esperada: manifest por ambiente. Gate: acesso RO.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:678-678`
- **O que falta:** Criar script (ex.: scripts/inventario/gerar-edges-deploy.mjs) que compara supabase/functions/* com a lista deployada (Management API GET /v1/projects/usyxfpqlsspldubptrdl/functions com token RO, ou allowlist de deploy.yml) e publica manifest por ambiente em inventario/estado/ ou docs/contexto; ligar ao contexto.yml/inventario-estado-semanal.yml.
- **Evidência:** Nenhum manifest de Edge por ambiente nem script/workflow de presença: grep -rn -i 'management api\|/v1/projects/.*/functions\|OPTIONS' scripts/ .github/workflows/ (fora de deploy.yml) → 0 resultados relevantes. Os inventários existentes só listam o repo: docs/contexto/codigo/edge-functions.json (chaves: total, verify_jwt_false, shared, edges, chamadas_sem_pasta — sem 'deploy/ambiente/allowlist') e inventario/estado/edges.json (chaves: gerado_em, total, sem_chamador_no_repo, edge_functions). A única 'presença' é a allowlist estática em .github/workflows/deploy.yml:144, mantida à mão; docs/DEPLOYMENT.md:71-73 manda confirmar por curl.| CONTESTADO pelo cético (PARCIAL): Existe baseline automatizado de presença Edge (repo × produção): scripts/inventario/gerar-banco.mjs:184-198 (compararEdges: GET /functions da Management API × pastas do repo, gerando publicadas, no_repo_sem_deploy e publica…
- **Revisão:** em disputa. O cético propõe Parcial e o juiz ainda não decidiu.

### F1795 · Etapa 39 (Graphify): Calibrar alertas antes de criar bloqueios

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Observar ≥3 PRs reais; gates por integridade/vazamento/reprodutibilidade.
- **Fontes:** `docs/planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md:353-358`
- **O que falta:** Observar ≥3 PRs com o fluxo, registrar limiares (baseline, owner, exceções com expiração) em docs/graphify/ e só então adicionar gates informativos em graphify.yml.
- **Evidência:** Nenhum limiar/política de exceção documentado para gates do grafo: `grep -rniE 'limiar\|threshold' docs/graphify scripts/graphify .github/workflows/graphify.yml` → só REVISAO_EXAUSTIVA:83 (crítica) e :173 ('39| Alertas calibrados \| PENDENTE'). .github/workflows/graphify.yml:50-51 só roda `npm run graphify:test` e extração smoke, sem gate por integridade/vazamento/reprodutibilidade nem observação de PRs.
- **Revisão:** sem contestação cética concluída.

### F1796 · Etapa 46 (Graphify): Pilotar em revisão real de mudança pequena

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** PR real de baixo risco com consulta→fontes→impacto→testes.
- **Fontes:** `docs/planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md:406-411`
- **O que falta:** Escolher uma PR pequena, rodar `graphify query`/`npm run graphify:impact` no SHA dela, registrar antes/depois, limitações e reprodução pelo mantenedor em docs/graphify/PILOTO_PR_<n>.md.
- **Evidência:** Caso de uso documentado de piloto em PR real: ausente. `grep -rnE 'pull/[0-9]+\|PR #[0-9]+' docs/graphify/*.md` → só PRs do próprio plano (#125, #131, #132) em REVISAO_EXAUSTIVA:7,19-20,120-124; REVISAO_EXAUSTIVA:180 '46| Piloto em PR real \| PENDENTE — Não existe caso concluído do fluxo consulta→fontes→impacto→testes'. Nenhum doc posterior em docs/graphify (últimos de 2026-09-11).
- **Revisão:** sem contestação cética concluída.

### F1801 · Etapa 98 do plano: Fazer canário com rollback automático

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Aplicar correções aprovadas em staging/canário, observar SLOs e tráfego real. Saída esperada: evidência de estabilidade. Gate: autorização de release.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:781-781`
- **O que falta:** Provisionar staging (docs/STAGING.md) ou usar Vercel preview + health check pós-deploy com `vercel rollback` automatizado em deploy.yml quando o health check (linhas 176-180) falhar.
- **Evidência:** Nenhum canário/staging com rollback automático: vercel.json só tem rewrites/headers; `grep -rliE 'can[áa]rio\|canary' .github vercel.json` → 0; `grep -rn 'staging' .github/workflows/*.yml` → 0; docs/STAGING.md é guia para criar um projeto que não existe ('Hoje existe um único projeto Supabase de produção'). Previews de PR da Vercel existem (docs/agentes/vercel-deploy.md:11-12) mas não há observação de SLO nem rollback automático; docs/DEPLOYMENT.md:21 publica main direto. STATUS_100_ETAPAS:263 🔒.
- **Revisão:** sem contestação cética concluída.

### F1802 · Etapa canônica 26/08 nº 100: Certificar ou rejeitar prontidão (go/no-go)

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Etapa canônica 100 (plano 26/08, matriz de status 30/08, estado 🔒): P0/P1 fechados, CI verde, reconciliação, restore, tráfego saudável; ata go/no-go e backlog residual.
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:265-265`
- **O que falta:** Após fechar restore drill e canário, redigir docs/execucao/GO_NO_GO_<data>.md com checklist P0/P1, CI, reconciliação e backlog residual.
- **Evidência:** Ata go/no-go ausente: `ls docs/execucao` → HARDENING_CANONICO, MIGRATION_RENAME_MAP, PLANO_WORKFLOWS, RECONCILIACAO, ROLLBACK_HARDENING, STATUS_100_ETAPAS, VALIDACAO_ADVERSARIAL, catchup-migrations-2026-10-20 (nenhum go-no-go*); `grep -rliE 'go[/ -]?no[- ]?go' docs` → só planos/status (STATUS_100_ETAPAS:265 pendente 🔒). Pré-requisitos também abertos (F1800 restore, F1801 canário).
- **Revisão:** sem contestação cética concluída.

### F1807 · Etapa canônica 26/08 nº 97: Submeter lote de remoção ao proprietário

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Etapa canônica 97 (plano 26/08, matriz de status 30/08, estado 🔶): evidência, impacto, rollback, backup por item; aprovação nominal.
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:262-262`
- **O que falta:** Montar docs/execucao/LOTE_REMOCAO_<data>.md por item (evidência de não uso via inventario/estado/banco.json `tabelas_orfas`, impacto, rollback, backup) e registrar aprovação nominal do proprietário.
- **Evidência:** Nenhum lote de remoção submetido com aprovação nominal: `grep -rniE 'aprova[çc][ãa]o nominal' docs` → só planos (STATUS_100_ETAPAS:262 🔶, HANDOFF, AUDITORIA); docs/DEAD_TABLES.md:14-17 define apenas critério de drop (30 dias de observação) e lista candidatas, sem evidência/impacto/rollback/backup por item nem aprovação; `ls docs/execucao` sem documento de lote de remoção.
- **Revisão:** sem contestação cética concluída.

### F1808 · Etapa canônica 26/08 nº 98: Canário com rollback automático

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Etapa canônica 98 (plano 26/08, matriz de status 30/08, estado 🔒): staging/canário; SLOs; tráfego real; evidência de estabilidade.
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:263-263`
- **O que falta:** Ver F1801: staging/canário com observação de SLO e rollback automático (Vercel rollback no health check falho).
- **Evidência:** Mesma evidência de F1801: `grep -rliE 'can[áa]rio\|canary' .github vercel.json docs/agentes` → 0; vercel.json só rewrites/headers; deploy.yml:168-180 publica direto e só faz health check sem rollback; docs/STAGING.md descreve projeto ainda inexistente; STATUS_100_ETAPAS:263 🔒.
- **Revisão:** sem contestação cética concluída.

### F1811 · Filtrar rollbacks de teste do alerta de baseline (PERF-02)

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Rollbacks gerados por quote-to-sale-stress.sql; ação: filtrar rollbacks de teste do alerta de baseline.
- **Fontes:** `docs/reports/BACKEND_DEEP_AUDIT_V2_2026-07-11.md:57-91`
- **O que falta:** Marcar execuções do stress (ex.: snapshot antes/depois ou janela ignorada em admin_get_rollback_rate_series) ou não rodar quote-to-sale-stress.sql no banco de produção; documentar no runbook.
- **Evidência:** Nenhum filtro de rollbacks de teste: função real `admin_capture_rollback_snapshot` (contexto/supabase/functions/public/admin_capture_rollback_snapshot__12ae32cb1ec02d01.sql:15-23) grava xact_rollback bruto de pg_stat_database (cron.md:17 job 13 `*/5`); painel src/components/admin/connections/DbRollbackRatePanel.tsx:22 `ROLLBACK_ALERT_THRESHOLD = 50` sem distinção de origem; `grep -niE 'rollback\|stress\|baseline' supabase/functions/wal-health-alert/index.ts` → 0. supabase/tests/quote-to-sale-stress.sql existe (linha 41 advisory lock). Fonte docs/reports/BACKEND_DEEP_AUDIT_V2_2026-07-11.md:57,91 mantém PERF-02 como 'Desejável'.
- **Revisão:** sem contestação cética concluída.

### F1813 · Handoff P019: Documentar e testar restauração em ambiente isolado

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Fila canônica do handoff (onda 2): Documentar e testar restauração em ambiente isolado. Todas as etapas começam pendentes; 0 de 100 executadas na data do handoff. Gate(s) conforme §13.
- **Fontes:** `docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:300-300`
- **O que falta:** Escrever docs/runbooks/restore.md com passo a passo e executar/registrar um restore real em projeto isolado (data, duração, tamanho, divergências).
- **Evidência:** Runbook de restauração ausente: `ls docs/runbooks` → access-denied, alertas-operacionais, bitrix24, cron-failures, deal-risk-digest, edge-retry, elevenlabs, email-transacional, n8n, on-call, race-arena, smoke-target-backend, twilio, wal-health, whatsapp-multichannel, winloss-webhooks (nenhum restore*). docs/DR_PLAN.md:79 apenas prescreve teste trimestral; `grep -rniE 'drill\|restaura[çc][ãa]o executad' docs` → 0 evidência de execução. O único teste é `pg_restore --list` em db-backup.yml:111-125 (valida formato, não restaura).
- **Revisão:** sem contestação cética concluída.

### F1817 · Handoff P095: Canário com parcela controlada de tráfego

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Fila canônica do handoff (onda 10): Canário com parcela controlada de tráfego. Todas as etapas começam pendentes; 0 de 100 executadas na data do handoff. Gate(s) conforme §13.
- **Fontes:** `docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:416-416`
- **O que falta:** Definir mecanismo de canário (ex.: Vercel preview com parcela de tráfego/feature flag por percentual de usuários), registrar baseline x canário (erros, latência) em docs/ e um workflow que promova só após comparação.
- **Evidência:** ausente: grep -rni 'canary\|canário\|canario' .github/ vercel.json package.json scripts/ → 0 resultados. vercel.json:1-30 contém apenas rewrites e headers de segurança (sem split de tráfego). A_planos_execucao.md:184 registra P095 = NI 'ausente'. Configuração de canário no painel Vercel não é verificável daqui.
- **Revisão:** sem contestação cética concluída.

### F1819 · Handoff P098: UAT com casos reais por módulo

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Fila canônica do handoff (onda 10): UAT com casos reais por módulo. Todas as etapas começam pendentes; 0 de 100 executadas na data do handoff. Gate(s) conforme §13.
- **Fontes:** `docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:419-419`
- **O que falta:** Criar docs/uat/<modulo>.md por módulo com casos reais, resultado (aprovado/parcial/adiado) e aceite nominal do responsável de negócio.
- **Evidência:** ausente: ls docs/uat/ → diretório inexistente; find docs -iname '_uat_' → 0 resultados. A_planos_execucao.md:187 registra P098 'UAT| NI \| ausente'. Handoff :419 mantém `[ ] P098`.
- **Revisão:** sem contestação cética concluída.

### F1821 · Handoff P100: Implantação gradual em produção com janela de estabilidade

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Fila canônica do handoff (onda 10): Implantação gradual em produção com janela de estabilidade. Todas as etapas começam pendentes; 0 de 100 executadas na data do handoff. Gate(s) conforme §13.
- **Fontes:** `docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:421-421`
- **O que falta:** Definir e documentar rollout gradual (percentual de tráfego/usuários via Vercel ou feature flag), janela de estabilidade e evidência de métricas dentro dos SLOs (depende de F1818).
- **Evidência:** O deploy de produção é automático e integral a cada merge em main (AGENTS.md §5.10; vercel.json sem regras de rollout); ausente: grep -rni 'canary\|gradual\|rollout\|traffic' .github/ vercel.json → 0 resultados; A_planos_execucao.md:189 P100 = NI 'ausente'; handoff :421 `[ ] P100`. Não há registro de janela de estabilidade nem métricas x SLO.
- **Revisão:** sem contestação cética concluída.

### F1824 · Implantação gradual com tráfego real

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** P100 NI.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:189`
- **O que falta:** Idem F1821: mecanismo de rollout gradual + registro de janela de estabilidade com métricas x SLO.
- **Evidência:** Mesmo item que F1821/F1832: A_planos_execucao.md:189 '100| Implantação gradual com tráfego real \| NI \| ausente'; ausente: grep -rni 'canary\|gradual\|rollout' .github/ vercel.json → 0 resultados; deploy Vercel é integral por merge (AGENTS.md §5.10).
- **Revisão:** sem contestação cética concluída.

### F1832 · Plano 30/08 etapa 100 (P100): Implantação gradual em produção com janela de estabilidade

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Etapa 100 do plano de 100 etapas (auditoria 30/08; = P100 do handoff): Métricas dentro dos SLOs, ausência de regressão e aceite final — critério de pronto.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:773-773`
- **O que falta:** Idem F1821.
- **Evidência:** Idem F1821: docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:773 define o critério (métricas dentro dos SLOs, janela de estabilidade); A_planos_execucao.md:189 P100 = NI; ausente: grep -rni 'canary\|gradual\|rollout' .github/ vercel.json → 0 resultados; SLOs sem alertas agendados (ver F1818).
- **Revisão:** sem contestação cética concluída.

### F1837 · Plano 30/08 etapa 95 (P095): Canário com parcela controlada de tráfego

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Etapa 95 do plano de 100 etapas (auditoria 30/08; = P095 do handoff): Comparação de erros, latência, autorização e métricas contra baseline.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:768-768`
- **O que falta:** Mecanismo de canário + comparação contra baseline registrada.
- **Evidência:** Idem F1817: ausente: grep -rni 'canary\|canário' .github/ vercel.json package.json scripts/ → 0 resultados; vercel.json só rewrites/headers; A_planos_execucao.md:184 P095 = NI 'ausente'.
- **Revisão:** sem contestação cética concluída.

### F1839 · Plano 30/08 etapa 98 (P098): UAT com casos reais por módulo

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Etapa 98 do plano de 100 etapas (auditoria 30/08; = P098 do handoff): Funcionalidades completas, parciais e adiadas registradas com aceite de negócio.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:771-771`
- **O que falta:** docs/uat/<modulo>.md com casos reais e aceite de negócio por módulo.
- **Evidência:** Idem F1819: ausente: ls docs/uat/ → inexistente; find docs -iname '_uat_' → 0 resultados; A_planos_execucao.md:187 P098 = NI.
- **Revisão:** sem contestação cética concluída.

### F1840 · Plano 30/08 etapa 99 (P099): Backup restaurável, rollback ensaiado e go/no-go

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Etapa 99 do plano de 100 etapas (auditoria 30/08; = P099 do handoff): Go/no-go assinado, sem pressupor que código mergeado está pronto.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:772-772`
- **O que falta:** Criar docs/runbooks/release.md com checklist go/no-go (backup restaurado em staging, rollback ensaiado, assinatura) e registrar uma ata datada em docs/execucao/; corrigir o secret SUPABASE_DB_URL do db-backup.yml para o projeto canônico antes de qualquer ensaio.
- **Evidência:** ausente: ls docs/runbooks/release* → 0 resultados (docs/runbooks/ tem 16 runbooks, nenhum de release). docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:188 ('\| 99| Backup restaurável e go/no-go \| NI \| ausente'). docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:264 (etapa 99 '🔒 Aguarda janela'). Restore nunca ensaiado: docs/SIZING.md:10 (db-backup.yml inoperante, secret aponta para outro projeto); .github/workflows/db-backup.yml:116-123 só faz pg_restore --list (valida dump, não restaura).
- **Revisão:** sem contestação cética concluída.

### F1841 · Publicação das 71 Edge Functions

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** A.8 #8 NI.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:366`
- **O que falta:** Decisão do dono: subir o plano Supabase (limite >100 functions) ou escolher quais das 71 entram na allowlist (deploy.yml:144) removendo outras; alternativamente remover do repo as functions sem chamador (edge-functions.json 'órfãs').
- **Evidência:** Repo: ls supabase/functions| grep -v _shared \| wc -l → 171 pastas. Allowlist ACTIVE em .github/workflows/deploy.yml:144 contém exatamente 100 nomes (contagem de separadores \n = 99) → 71 functions fora da allowlist não são deployadas. Snapshot do banco não confirma lista deployada: contexto/supabase/edge-functions.md:3 ('Management API desabilitada'). AGENTS.md §7: plano limita a 100 deployadas.
- **Revisão:** sem contestação cética concluída.

### F1842 · Revisão trimestral de workflows (P100 #100)

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Planejado, inexistente.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:72`
- **O que falta:** Criar .github/workflows/quarterly-review.yml (schedule cron trimestral) que abre issue com checklist de revisão dos 28 workflows (actions pinadas, secrets, runs falhando).
- **Evidência:** ausente: ls .github/workflows/quarterly-review.yml → inexistente; grep -rliE 'quarterly\|trimestral' .github/ scripts/ → 0 resultados. Lista de 28 workflows em .github/workflows/ (a11y-sweep … types-sync) não contém revisão periódica. docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:72 ('revisão trimestral (P100 #100)' em 'Workflows planejados inexistentes').
- **Revisão:** sem contestação cética concluída.

### F1843 · Rotinas de checklist semanal/mensal/trimestral (inclui teste PITR)

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** A.13 NI ×4.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:457`
- **O que falta:** Criar docs/execucao/checklists/ com registro datado por rotina (semanal/mensal/trimestral) e automatizar lembrete via workflow schedule; teste de PITR exige upgrade de plano (SIZING.md:11).
- **Evidência:** ausente: grep -rliE 'checklist (semanal\|mensal\|trimestral)\|rotina semanal\|execução do checklist' docs/execucao docs/postmortems docs/*.md → 0 resultados; grep -rliE 'restore\|PITR\|drill' docs/postmortems → 0 (único postmortem: docs/postmortems/2026-08-30_cron_outage.md). docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:457 ('Rotinas semanal/mensal/trimestral/tempo real| NI ×4 \| sem registro de execução (inclusive teste de PITR)'). PITR indisponível no plano: docs/SIZING.md:11 (PITR só em Pro→Team).
- **Revisão:** sem contestação cética concluída.

### F1847 · Stress tests executados em schema descartável (não poluir métricas)

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Recomenda excluir stress tests do ambiente compartilhado ou rodar em schema stress_test.* para não gerar rollbacks em prod.
- **Fontes:** `docs/reports/BACKEND_DEEP_AUDIT_2026-07-11.md:87-89`
- **O que falta:** Rodar o stress só em staging/branch Supabase ou criar schema stress_test com cópias das tabelas (migration) e apontar o SQL via SET search_path; ou remover quote-to-sale-stress.sql do tier remoto de pr-checks.yml:400 (deixar só sob workflow manual).
- **Evidência:** supabase/tests/quote-to-sale-stress.sql:4,36,124 ('Executa toda a suíte dentro de BEGIN/ROLLBACK para NÃO sujar produção' … BEGIN; … ROLLBACK;) — roda no schema public do banco alvo, não em schema isolado: grep -nE 'CREATE SCHEMA\|stress_test\|search_path' no arquivo → 0. Executado contra o banco remoto em CI: .github/workflows/pr-checks.yml:384 (SUPABASE_DB_URL: secrets) e :400 (scripts/run-sql-tests.sh all); scripts/run-sql-tests.sh:81-90 ('remote — quote-to-sale-stress.sql' via psql $SUPABASE_DB_URL). grep -niE 'stress' contexto/supabase/tables.md → 0 (sem schema stress_test no banco real). Recomendação em docs/reports/BACKEND_DEEP_AUDIT_2026-07-11.md:89 permanece sem artefato.
- **Revisão:** sem contestação cética concluída.

### F1850 · Teste de restore (DR drill)

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** DR afirma PITR mas SIZING indica plano Free; restore trimestral pendente.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:123`
- **O que falta:** Corrigir secret SUPABASE_DB_URL do db-backup.yml para o projeto canônico, restaurar o dump em projeto staging (docs/STAGING.md) e registrar RPO/RTO medidos em docs/execucao/DR_DRILL_<data>.md.
- **Evidência:** docs/DR_PLAN.md:79 ('deve ser realizado trimestralmente' — intenção, sem registro); docs/SIZING.md:10-11 (plano Free; db-backup.yml inoperante em 2026-10-18, secret aponta para outro projeto; PITR só em Pro→Team). .github/workflows/db-backup.yml:116-123 só valida o dump (pg_restore --list), não restaura. ausente: grep -rliE 'restore\|restaur.*backup\|PITR\|drill' docs/postmortems docs/execucao → nenhum registro de restore com RPO/RTO. docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:552 ('Sem restore testado, sem staging').
- **Revisão:** sem contestação cética concluída.

### F1851 · Teste de restore de backup documentado (trimestral no RUNBOOK)

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Doc aponta ausência de teste de restore no repo; ação: agendar teste trimestral no RUNBOOK.
- **Fontes:** `docs/auditoria/AUDITORIA_TECNICA_EXAUSTIVA_2026-09-02.md:120,125`
- **O que falta:** Adicionar ao docs/RUNBOOK.md seção 'Teste trimestral de restore' (procedimento: baixar artifact do db-backup.yml, pg_restore em staging, checagens de contagem) e registrar a primeira execução datada.
- **Evidência:** docs/RUNBOOK.md:61-73 (seção Rollback cobre só Vercel e migrations; grep -niE 'restore\|restaur\|PITR\|drill' docs/RUNBOOK.md → apenas 'Restaurar' de deploy Vercel, linha 66); grep -nE 'trimestr\|teste de restore' docs/RUNBOOK.md → 0 para backup (única menção trimestral é do monitor externo, linha 123). docs/DR_PLAN.md:79 só declara a intenção. ausente: registro de teste em docs/postmortems ou docs/execucao (grep → 0).
- **Revisão:** sem contestação cética concluída.

### F1852 · Teste semestral de acesso emergencial (recovery code)

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Exercitar login via recovery code 1x por semestre; primeira execução pendente de agendamento.
- **Fontes:** `docs/DR_PLAN.md:68-70`
- **O que falta:** Executar uma sessão supervisionada de login via recovery code e registrar em docs/postmortems/<data>_teste_acesso_emergencial.md (quem, quando, códigos regenerados).
- **Evidência:** docs/DR_PLAN.md:68-70 ('deve ser exercitado pelo menos 1x por semestre … primeira execução pendente de agendamento'). ausente: grep -rliE 'recovery code' docs/postmortems docs/execucao → 0 resultados; ls docs/postmortems → só 2026-08-30_cron_outage.md.
- **Revisão:** sem contestação cética concluída.

### F1853 · Teste trimestral de recuperação de desastres (Supabase PITR)

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Checklist: teste trimestral de integridade de recuperação via PITR.
- **Fontes:** `docs/auditoria_enterprise_v5.md:90`
- **O que falta:** Decisão de custo do dono: habilitar PITR (upgrade de plano) ou substituir o item por teste de restore do dump do db-backup.yml; depois registrar execução datada.
- **Evidência:** PITR não está disponível no plano atual: docs/SIZING.md:11 ('Pro → Team/Enterprise| PITR'), :10 (plano Free). docs/DR_PLAN.md:79 e docs/auditoria_enterprise_v5.md:90 só prescrevem o teste. ausente: grep -rliE 'PITR' docs/postmortems docs/execucao → 0 registros de execução; docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:457 ('inclusive teste de PITR' sem registro).
- **Revisão:** sem contestação cética concluída.

### F1854 · Teste trimestral de restauração de backup em staging

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Restaurar backup em staging trimestralmente para validar integridade.
- **Fontes:** `docs/DR_PLAN.md:77-79`
- **O que falta:** Provisionar projeto staging conforme docs/STAGING.md (custo: decisão do dono), restaurar o dump do db-backup.yml nele e registrar a primeira restauração datada.
- **Evidência:** Não há staging: docs/STAGING.md:3 ('Hoje existe um único projeto Supabase de produção (usyxfpqlsspldubptrdl)'); AGENTS.md §7 (nenhum outro Supabase é deste repo). docs/DR_PLAN.md:79 só prescreve o teste trimestral. ausente: registro de restauração (grep -rliE 'restaur\|restore' docs/execucao docs/postmortems → 0 relevantes).
- **Revisão:** sem contestação cética concluída.

### F3665 · Service/lib telemetry (3 afirmações nos docs)

- **Tipo:** Service/lib
- **O que os docs afirmam:** telemetry.ts existe em _shared/ e não é importado por nenhuma função.| withTelemetry está definido mas não é importado por nenhuma edge function; telemetria em external-db-bridge é ad-hoc. \| _shared/telemetry.ts declara handler(req) mas chama handler() sem argumentos; roadmap #12 pede corrigir e adotar em todas as funções.
- **Fontes:** `docs/estado/10_EDGE_FUNCTIONS.md:117-121`, `docs/reports/BACKEND_ANALYSIS_REPORT.md:725-727`, `docs/reports/BACKEND_ANALYSIS_REPORT.md:454-470`
- **O que falta:** arquivo telemetry ausente em src/
- **Evidência:** arquivo telemetry ausente em src/| CONTESTADO pelo cético (REMOVIDO_INTENCIONALMENTE): supabase/functions/_shared/telemetry.ts não existe. A remoção está registrada no commit 673985e0d (#215), corpo linha 11: 'Remove _shared/telemetry.ts (withTelemetry morto, redundante com withRequestId)'. grep -rn withTelemetry supabase/functions → 0. O padrão adotado é withRequestId: o lint local deu 171/171.
- **Revisão:** em disputa. O cético propõe Removido de propósito e o juiz ainda não decidiu.

### F3668 · src/utils/fuzzing.ts órfão (utilitário de teste)

- **Tipo:** Service/lib
- **O que os docs afirmam:** Candidato a limpeza listado na auditoria: src/utils/fuzzing.ts órfão (utilitário de teste); nenhuma exclusão autorizada sem aprovação nominal.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:602-624`
- **O que falta:** arquivo fuzzing ausente em src/
- **Evidência:** arquivo fuzzing ausente em src/| CONTESTADO pelo cético (REMOVIDO_INTENCIONALMENTE): src/utils/fuzzing.ts não existe. A remoção está registrada no commit cc80002f7 (#209, PR mergeada), corpo linha 10: 'Remove 8 módulos órfãos sem consumidor: utils/fuzzing (+teste)'.
- **Revisão:** em disputa. O cético propõe Removido de propósito e o juiz ainda não decidiu.

### F1906 · Particionamento de telemetria (marcado como futuro)

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** mig/20260712220049:2 registra particionamento de telemetria como futuro.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/F_banco_dados.md:269`
- **O que falta:** Particionamento RANGE por tempo das tabelas de telemetria não existe (continua marcado como futuro); se o volume justificar (>~10M linhas), criar migration de conversão para tabela particionada com RLS e manter os crons de purge.
- **Evidência:** supabase/migrations/20260712220049_acf458b7-….sql:1-4 declara particionamento como futuro e implementa purge diária. Banco real: tables/public/query_telemetry.md, race_overlay_telemetry.md, salesperson_performance_telemetry.md sem qualquer indicação de partição (grep -i partition → 0; tipo 'table' simples em tables.md:261,276,311). O que existe é retenção: cron.md:12 purge-telemetry-retention-daily (public.purge_telemetry_retention) e :14 enforce-telemetry-retention-daily; functions.md:156,304.
- **Revisão:** sem contestação cética concluída.

### F1936 · Diretório tests/graphify/ com fixtures sintéticas

- **Tipo:** Teste
- **O que os docs afirmam:** Local proposto para fixtures sintéticas e testes determinísticos sem dados pessoais.
- **Fontes:** `docs/planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md:56,138-143`
- **O que falta:** Criar tests/graphify/ com fixtures sintéticas (TS/TSX/Deno/SQL) e resultados esperados, e apontar scripts/graphify/*.test.mjs e `npm run graphify:test` para elas.
- **Evidência:** ausente: `ls tests/graphify` → "No such file or directory"; `grep -rn "tests/graphify" docs scripts` → só o plano (docs/planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md:56,142) e a auditoria registrando "`tests/graphify/` previsto não existe" (docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:470). Fixtures ficam inline em scripts/graphify/*.test.mjs (6 arquivos), sem diretório de corpus TS/TSX/Deno/SQL; scripts/graphify/fixtures também não existe.| CONTESTADO pelo cético (PARCIAL): O diretório tests/graphify/ não existe, mas existem testes offline determinísticos com fixtures sintéticas em outra pasta: scripts/graphify/catalog-adapter.test.mjs:6 (fixture()), docs-index.test.mjs:8-16 (mkdtempSync + arquivos sintéticos), extract-code-only.test.mjs:11-15, multigraph.test.mjs e static-contracts.test.mjs. Eles rodam em package.json:48 `graphify:test` e no CI em .github/w…
- **Revisão:** em disputa. O cético propõe Parcial e o juiz ainda não decidiu.

### F1938 · E2E completo em staging efêmero ou tenant descartável

- **Tipo:** Teste
- **O que os docs afirmam:** Execução E2E completa deve rodar em staging efêmero ou com fixture/tenant descartável, não contra produção.
- **Fontes:** `docs/execucao/HARDENING_CANONICO_2026-08-31.md:193-196`
- **O que falta:** Não existe ambiente isolado: o E2E roda contra produção, com limpeza de dados só na sub-suíte quote-to-sale.
- **Evidência:** ausente: `grep -rni staging .github/workflows/*.yml playwright*.ts docs/agentes/*.md` → 0 resultados em workflows/config (única menção é comentário em docs/agentes/replay-do-repo-261117.md:90). playwright.config.ts:26 baseURL localhost + secrets VITE_SUPABASE_URL do projeto canônico; quote-to-sale-e2e.yml:29-31 declara que suíte e invariantes "batem na MESMA base de produção" e pr-checks.yml:554-557 confirma que a suíte grava vendas reais no banco compartilhado. Nenhum Supabase branch/preview ou tenant descartável configurado.| cético: .github/workflows/pr-checks.yml:551 `VITE_SUPABASE_PROJECT_ID: ${{ steps.precheck.outputs.project_ref \|\| 'usyxfpqlsspldubptrdl' }}`, fallback para o projeto de produção. Nenhum workflow cria staging efêmero (`grep -n staging .github/workflows/pr-checks.yml .github/workflows/quote-to-sale-e2e.yml playwright.config.ts` → 0 resultados).

### F1943 · E2E/quote-to-sale/invariantes contra staging ou banco efêmero (hoje produção)

- **Tipo:** Teste
- **O que os docs afirmam:** pr-checks.yml:422-509 e quote-to-sale-e2e.yml:106,167-181 gravam e apagam vendas reais no banco oficial.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:89,156`
- **O que falta:** Banco de staging ou efêmero (`supabase start` no runner) e troca da URL/secrets nos jobs e2e de pr-checks.yml e quote-to-sale-e2e.yml.
- **Evidência:** Suítes continuam apontando para o projeto oficial: .github/workflows/pr-checks.yml:548-551 (VITE_SUPABASE_URL de secrets, fallback VITE_SUPABASE_PROJECT_ID 'usyxfpqlsspldubptrdl'), pr-checks.yml:554-556 comentário 'grava vendas reais no banco compartilhado'; .github/workflows/quote-to-sale-e2e.yml:30 e :60 ('o check bate em produção'), :171-176. ausente: grep -nE 'staging\|STAGING\|ephemeral\|efêmero\|supabase start\|supabase db' .github/workflows/pr-checks.yml .github/workflows/quote-to-sale-e2e.yml → 0 resultados.| cético: Os alvos continuam em produção: .github/workflows/pr-checks.yml:551 (fallback 'usyxfpqlsspldubptrdl'); :556 ('grava vendas reais no banco compartilhado'); .github/workflows/quote-to-sale-e2e.yml:30 e :60 ('o check bate em produção'). ausente: `grep -niE 'staging\|ephemeral\|efêmer\|supabase start' pr-checks.yml quote-to-sale-e2e.yml` → 0 resultados.

### F1944 · Edge functions e tests/ sem cobertura medida por nenhum runner

- **Tipo:** Teste
- **O que os docs afirmam:** Nenhum runner mede cobertura de supabase/functions ou tests/.
- **Fontes:** `docs/estado/12_INFRA_CI_TESTES.md:365`
- **O que falta:** `deno test --coverage` mais `deno coverage --lcov` no job deno-tests ou em scripts/deno-test-suite.mjs, e cobertura para tests/.
- **Evidência:** Cobertura só do Vitest sobre src/: vitest.config.ts:23-24 (include 'src/**/\*.{test,spec}.{ts,tsx}', exclude tests/e2e, tests/load) e :38 (coverage include 'src/**'); pr-checks.yml:253 `npx vitest run --coverage`, deploy.yml:88 `npm run test:coverage`. Testes Deno rodam sem cobertura: pr-checks.yml:367,370 (`node scripts/deno-test-suite.mjs --mode unit\|live`), cron-monitoring.yml:85 (`deno test --frozen …`). ausente: grep -rnE '\-\-coverage' .github/workflows/*.yml scripts/deno-test-suite.mjs filtrando vitest → 0 resultados para deno.| cético: ausente: `grep -rnE 'deno coverage\|coverage=' --include=*.yml --include=*.mjs --include=*.ts --include=*.json --include=*.sh .` → 0 resultados. Só o Vitest mede cobertura (package.json:20; pr-checks.yml:253; deploy.yml:88), restrita a src/** (vitest.config.ts:38). scripts/deno-test-suite.mjs:76-86 roda `deno test` sem --coverage.

### F1949 · Etapa 03 (Graphify): Definir 20 perguntas de negócio técnico e sucesso mensurável

- **Tipo:** Teste
- **O que os docs afirmam:** Conjunto de avaliação com respostas de referência independentes do grafo.
- **Fontes:** `docs/planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md:87-92`
- **O que falta:** Conjunto de ≥20 perguntas com resposta de referência, fonte e métrica (ex.: docs/graphify/avaliacao.md).
- **Evidência:** docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:137 — '\| 03| Perguntas e sucesso mensurável \| PENDENTE \| Há exemplos no plano, mas não conjunto de 20 perguntas com respostas independentes e métricas.' ausente: `ls tests/graphify` → não existe; grep -rliE 'perguntas' docs/graphify tools/graphify scripts/graphify → só a própria revisão. \| cético: `grep -rlniE '20 perguntas' docs` → só docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md (:137 PENDENTE) e docs/planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md (o plano). `ls tests/graphify` → não existe.

### F1953 · Etapa 42 (Graphify): Validar adaptador de catálogo em banco descartável

- **Tipo:** Teste
- **O que os docs afirmam:** Fixtures em PostgreSQL/Supabase local; testar roles, ACL, RLS, overloads, views, triggers, jobs.
- **Fontes:** `docs/planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md:376-381`
- **O que falta:** Fixture SQL de catálogo (roles, ACL, RLS, overloads, views, triggers, jobs) rodando em `supabase start`/Postgres descartável no CI e comparação automatizada com o catálogo coletado.
- **Evidência:** scripts/graphify/catalog-adapter.test.mjs:6-44 usa fixture JSON em memória (normalizeCatalog), sem PostgreSQL/Supabase local (grep -nE 'pg\|psql\|createClient\|DATABASE_URL' → 0 relevantes). docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:176 '\| 42| Banco descartável \| PENDENTE \| Nenhum coletor/fixture relacional implementado'. ausente: `ls tests/graphify` → não existe. \| CONTESTADO pelo cético (PARCIAL): Existe artefato correspondente, então não é NAO_IMPLEMENTADO. O adaptador de catálogo existe em scripts/graphify/catalog-adapter.mjs (:205 lê o catálogo de --input). Os testes estão em scripts/graphify/catalog-adapter.test.mjs:6-17: a fixture cobre roles, grants/defaultGrants (ACL), RLS enabled/forced, policies, triggers, views, functions, enums, extensions, buckets e jobs. :36-40 recusa projeto errado, sessão readOnly:false e linhas de negócio ('nenhuma escrita/sem dados pesso…
- **Revisão:** em disputa. O cético propõe Parcial e o juiz ainda não decidiu.

### F1955 · Etapa 44 (Graphify): Medir qualidade das respostas e benefício operacional

- **Tipo:** Teste
- **O que os docs afirmam:** Comparar respostas do grafo com referências; tempo frio/quente; tokens só com modelo.
- **Fontes:** `docs/planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md:390-395`
- **O que falta:** Benchmark reproduzível que compare o grafo ao gabarito, com tempo frio/quente e relatório versionado.
- **Evidência:** ausente: grep -rliE 'benchmark\|frio/quente\|tempo frio' scripts/graphify docs/graphify tools/graphify → 0 resultados. docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:178 '\| 44| Qualidade e benefício \| PENDENTE'. Depende da etapa 03 (F1949), também ausente. \| cético: `grep -rlniE 'tempo frio\|benchmark.*graphify\|graphify.*benchmark' docs scripts` → só docs/planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md (o plano). docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:178 marca PENDENTE. Depende do gabarito F1949, que também não existe.

### F3669 · Etapa 46: seed determinístico para conta E2E

- **Tipo:** Teste
- **O que os docs afirmam:** Hoje depende de dados reais.
- **Fontes:** `docs/estado/PLANO_CI_WORKFLOWS_2026-10-01.md:94`
- **O que falta:** arquivo de teste seed.sql ausente
- **Evidência:** arquivo de teste seed.sql ausente| CONTESTADO pelo cético (PARCIAL): A pré-checagem errou: supabase/seed.sql EXISTE (114 linhas). As linhas 1-4 dizem 'seed mínimo determinístico... UUIDs e timestamps fixos', e há admin de teste em :13-25. Mas o E2E não usa o seed: tests/e2e/global-setup.ts:15-20,35-45 exige E2E_TEST_EMAIL e E2E_TEST_PASSWORD contra VITE_SUPABASE_URL real. Nenhum workflow roda 'supabase db reset' ou seed: grep -rn 'seed\|db reset\|supabase start' .github/workflows → 0 fora de comentários e automation.
- **Revisão:** em disputa. O cético propõe Parcial e o juiz ainda não decidiu.

### F2021 · Simulação Graphify: Alias TS, import lazy e barrel → resolução correta ou pendência explícita

- **Tipo:** Teste
- **O que os docs afirmam:** Cenário de teste planejado antes do rollout; o doc afirma que é desenho de testes, não resultado executado.
- **Fontes:** `docs/planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md:456-480`
- **O que falta:** Criar teste em scripts/graphify/ (ex.: extract-code-only.test.mjs) com fixture usando `@/` alias, `import()` lazy e barrel index.ts, assertando resolução correta ou lacuna explícita no grafo.
- **Evidência:** ausente: `ls tests/graphify` → diretório inexistente; grep -rniE 'alias\|lazy\|barrel\|tsconfig._paths' scripts/graphify scripts/graphify-local.mjs scripts/graphify-local.unit.mjs → 0 resultados. Os 6 arquivos scripts/graphify/_.test.mjs (37 testes, passam) não exercitam resolução de alias/lazy/barrel. Cobertura análoga existe apenas no gerador de contexto (outra ferramenta): scripts/ci/inventario-rotas.unit.mjs:21-27 (lazy) e scripts/ci/ai-context-generator.unit.mjs ('barrel re-export não gera órfão'). Plano docs/planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md:462 declara o cenário como desenho, não executado.
- **Revisão:** sem contestação cética concluída.

### F2023 · Simulação Graphify: Cache de PR não confiável → não contaminar artefato da main

- **Tipo:** Teste
- **O que os docs afirmam:** Cenário de teste planejado antes do rollout; o doc afirma que é desenho de testes, não resultado executado.
- **Fontes:** `docs/planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md:456-480`
- **O que falta:** Cenário depende de pipeline de artefato por branch (etapa 37 do plano) que não existe; se for implementado, adicionar teste que rejeita promoção de artefato gerado em ref != main.
- **Evidência:** .github/workflows/graphify.yml:38-51: único cache é `actions/setup-node` com `cache: npm`; não há cache/artefato de grafo nem promoção para main (passo final :51 extrai smoke em .graphify-local/ci-smoke e descarta). grep -rniE 'cache' em scripts/graphify* → só `__pycache__` (graphify-local.mjs:40), `ls-files --cached` (:389) e fleet.lock (:1014). Nenhum teste em scripts/graphify/*.test.mjs ou scripts/graphify-local.unit.mjs cobre cache de PR vs main.
- **Revisão:** sem contestação cética concluída.

### F2030 · Simulação Graphify: HTML/prompt malicioso em rótulo/documento → nenhum script executado

- **Tipo:** Teste
- **O que os docs afirmam:** Cenário de teste planejado antes do rollout; o doc afirma que é desenho de testes, não resultado executado.
- **Fontes:** `docs/planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md:456-480`
- **O que falta:** Criar teste com nó/rótulo contendo `<script>` e instrução de prompt, assertando que graph.json/relatórios os tratam como texto inerte (escape) e que nenhum subprocesso é disparado.
- **Evidência:** ausente: grep -rniE 'HTML\|prompt\|<script\|sanitiz\|injec' scripts/graphify/*.test.mjs scripts/graphify-local.unit.mjs → só imports de sanitizeMetadata (graphify-utils.test.mjs:3,84), que redige chaves sensíveis, não HTML/prompt. docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:175 registra etapa 41 como PARCIAL: 'faltam ... casos de ... prompt/HTML'.
- **Revisão:** sem contestação cética concluída.

### F2033 · Simulação Graphify: Migration no ledger com definição divergente → achado sem reparo automático

- **Tipo:** Teste
- **O que os docs afirmam:** Cenário de teste planejado antes do rollout; o doc afirma que é desenho de testes, não resultado executado.
- **Fontes:** `docs/planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md:456-480`
- **O que falta:** Implementar comparação migration-arquivo vs supabase_migrations.schema_migrations (snapshot) emitindo achado sem reparo, com teste.
- **Evidência:** scripts/graphify/static-contracts.mjs:220-247 só parseia arquivos de supabase/migrations/ (versão repetida vira lacuna :241); não lê ledger (grep 'ledger\|schema_migrations\|supabase_migrations' em static-contracts.mjs reconcile-catalog.mjs → 0). scripts/graphify/reconcile-catalog.mjs e catalog-adapter.mjs:165-185 reconciliam referências de código vs catálogo (tabelas/funções), não definição de migration vs ledger. Nenhum teste em scripts/graphify/*.test.mjs cobre divergência de migration.
- **Revisão:** sem contestação cética concluída.

### F2038 · Simulação Graphify: Tabela vazia usada por rota dinâmica → não classificar como lixo

- **Tipo:** Teste
- **O que os docs afirmam:** Cenário de teste planejado antes do rollout; o doc afirma que é desenho de testes, não resultado executado.
- **Fontes:** `docs/planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md:456-480`
- **O que falta:** Se/quando houver classificação de objetos ociosos (etapa 28), adicionar teste com tabela sem linhas referenciada por rota dinâmica e assertar que não é marcada como lixo.
- **Evidência:** ausente: grep -rniE 'tabela vazia\|rota din\|lixo\|vazia\|rowCount\|rows\|empty' scripts/graphify scripts/graphify-local.unit.mjs → só catalog-adapter.mjs:69 (recusa linhas de negócio). Nenhuma heurística de 'tabela não usada/lixo' existe para ser testada; a única limitação registrada é textual em catalog-adapter.mjs:185 ('Ausência no catálogo observado não prova perda'). Plano :469 marca cenário como desenho (etapas 25, 28).
- **Revisão:** sem contestação cética concluída.

### F3670 · Teste telemetry-logic.test.ts (2 afirmações nos docs)

- **Tipo:** Teste
- **O que os docs afirmam:** tests/lib/telemetry-logic.test.ts, tests/components/TelemetryCharts.test.tsx, tests/pages/AdminTelemetriaPage.test.tsx, tests/lib/external-db-bridge-telemetry.test.ts e src/pages/admin/AdminTelemetriaPage.tsx não existem; página real é AdminTelemetria em /admin/telemetria. DIVERGENTE.| Spec de lógica pura (thresholds, severidade, offenders, formatação, CSV/PDF, buckets); doc afirma que NÃO existe no repo (verificado 2026-10-18).
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:95`, `docs/TELEMETRY_MODULE_DOCS.md:7-12,686-709`
- **O que falta:** Criar os testes da lógica pura de telemetria contra os arquivos reais (src/components/admin/telemetry/*, src/pages/AdminTelemetria.tsx), ou corrigir o doc que cita caminhos inexistentes.
- **Evidência:** arquivo de teste telemetry-logic.test.ts ausente| cético: ausente: find src tests e2e -iname '_telemetr_' → nenhum arquivo de teste (só componentes em src/components/admin/telemetry/* e a página src/pages/AdminTelemetria.tsx). git log --all -- tests/lib/telemetry-logic.test.ts → 0 commits, o arquivo nunca existiu. grep -rln 'classifySeverity' src tests → 0.

### F3671 · Teste tests/components/TelemetryCharts.test.tsx (38 testes)

- **Tipo:** Teste
- **O que os docs afirmam:** Spec do componente de gráficos; doc afirma que NÃO existe no repo.
- **Fontes:** `docs/TELEMETRY_MODULE_DOCS.md:7-12,686-700,729-747`
- **O que falta:** Criar o teste de TelemetryCharts.tsx cobrindo a renderização de 'Alertas ao Longo do Tempo'.
- **Evidência:** arquivo de teste TelemetryCharts.test.tsx ausente| cético: ausente: tests/components/TelemetryCharts.test.tsx não existe e git log --all → 0 commits. grep -rln 'TelemetryCharts' src tests --include=_.test._ → 0. O componente existe em src/components/admin/telemetry/TelemetryCharts.tsx (contém 'Alertas ao Longo do Tempo'), mas não tem teste.

### F3672 · Teste tests/lib/external-db-bridge-telemetry.test.ts (67 testes)

- **Tipo:** Teste
- **O que os docs afirmam:** Spec da edge function (emitTelemetry, classificação, cache, mapeamento); doc afirma que NÃO existe no repo.
- **Fontes:** `docs/TELEMETRY_MODULE_DOCS.md:7-12,686-700`
- **O que falta:** Criar tests/lib/external-db-bridge-telemetry.test.ts (ou equivalente em src/**, já que vitest.config.ts:23 só inclui src/**/*.{test,spec}.{ts,tsx}) cobrindo emitTelemetry/classificação/cache da edge external-db-bridge.
- **Evidência:** arquivo de teste external-db-bridge-telemetry.test.ts ausente| cético: ausente: git ls-files \| grep -i external-db-bridge-telemetry → 0 resultados (só existe supabase/functions/external-db-bridge/index.ts); a pasta tests/ tem apenas a11y, e2e, migrations e JSONs; o próprio docs/TELEMETRY_MODULE_DOCS.md:7-11 e :686-688 registra que o arquivo 'não existe no repo (verificado 2026-10-18)' e trata como backlog.

### F3673 · Teste tests/pages/AdminTelemetria.test.tsx (47 testes)

- **Tipo:** Teste
- **O que os docs afirmam:** Spec da página completa (UI, filtros, exportação); doc afirma que NÃO existe no repo.
- **Fontes:** `docs/TELEMETRY_MODULE_DOCS.md:7-12,686-700`
- **O que falta:** Criar teste da página AdminTelemetria (em src/**, pois vitest.config.ts:23 não inclui tests/) cobrindo UI, filtros e exportação.
- **Evidência:** arquivo de teste AdminTelemetria.test.tsx ausente| cético: ausente: git ls-files \| grep -i AdminTelemetria → só src/pages/AdminTelemetria.tsx (nenhum .test); grep de AdminTelemetria em arquivos _.test._/_.spec._ → 0 resultados; docs/TELEMETRY_MODULE_DOCS.md:7-11 confirma que tests/pages/AdminTelemetria.test.tsx não existe.

### F3674 · Teste useDemandForecast.test.tsx

- **Tipo:** Teste
- **O que os docs afirmam:** Doc lista o teste de hook `useDemandForecast.test.tsx` (previsão de demanda) entre os 17 testes.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:1548-1568`
- **O que falta:** Criar src/hooks/useDemandForecast.test.tsx.
- **Evidência:** arquivo de teste useDemandForecast.test.tsx ausente| cético: ausente: git ls-files \| grep -i useDemandForecast → só src/hooks/useDemandForecast.ts (sem .test); grep -rl useDemandForecast em _.test._/_.spec._ → 0 resultados. Doc de origem: docs/DOCUMENTACAO_SISTEMA.md:1552.

### F3675 · Teste useFunnelData.test.ts

- **Tipo:** Teste
- **O que os docs afirmam:** Doc lista o teste de hook `useFunnelData.test.ts` (dados do funil) entre os 17 testes.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:1548-1568`
- **O que falta:** Criar src/hooks/dashboard/useFunnelData.test.ts.
- **Evidência:** arquivo de teste useFunnelData.test.ts ausente| cético: ausente: git ls-files \| grep -i useFunnelData → só src/hooks/dashboard/useFunnelData.ts; nenhum teste o referencia. Doc: docs/DOCUMENTACAO_SISTEMA.md:1553.

### F3676 · Teste useGamificationData.test.tsx

- **Tipo:** Teste
- **O que os docs afirmam:** Doc lista o teste de hook `useGamificationData.test.tsx` (dados de gamificação) entre os 17 testes.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:1548-1568`
- **O que falta:** Criar src/hooks/gamification/useGamificationData.test.tsx.
- **Evidência:** arquivo de teste useGamificationData.test.tsx ausente| cético: ausente: git ls-files \| grep -i useGamificationData → só src/hooks/gamification/useGamificationData.ts; nenhum teste. Doc: docs/DOCUMENTACAO_SISTEMA.md:1554.

### F3678 · Teste useLeadScoring.test.ts

- **Tipo:** Teste
- **O que os docs afirmam:** Doc lista o teste de hook `useLeadScoring.test.ts` (pontuação de leads) entre os 17 testes.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:1548-1568`
- **O que falta:** Criar src/hooks/useLeadScoring.test.ts.
- **Evidência:** arquivo de teste useLeadScoring.test.ts ausente| cético: ausente: git ls-files \| grep -i useLeadScoring → src/hooks/useLeadScoring.ts e src/hooks/scoring/useLeadScoringMetrics.ts, nenhum .test; grep em _.test._ → 0 resultados. Doc: docs/DOCUMENTACAO_SISTEMA.md:1556.

### F3679 · Teste useNextBestAction.test.ts

- **Tipo:** Teste
- **O que os docs afirmam:** Doc lista o teste de hook `useNextBestAction.test.ts` (próxima melhor ação) entre os 17 testes.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:1548-1568`
- **O que falta:** Criar src/hooks/useNextBestAction.test.ts.
- **Evidência:** arquivo de teste useNextBestAction.test.ts ausente| cético: ausente: git ls-files \| grep -i useNextBestAction → só src/hooks/useNextBestAction.ts; nenhum teste. Doc: docs/DOCUMENTACAO_SISTEMA.md:1557.

### F3680 · Teste usePerformanceComparison.test.ts

- **Tipo:** Teste
- **O que os docs afirmam:** Doc lista o teste de hook `usePerformanceComparison.test.ts` (comparação de performance) entre os 17 testes.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:1548-1568`
- **O que falta:** Criar src/hooks/usePerformanceComparison.test.ts.
- **Evidência:** arquivo de teste usePerformanceComparison.test.ts ausente| cético: ausente: git ls-files \| grep -i usePerformanceComparison → só src/hooks/usePerformanceComparison.ts; nenhum teste. Doc: docs/DOCUMENTACAO_SISTEMA.md:1558.

### F3682 · Teste useProducts.test.ts

- **Tipo:** Teste
- **O que os docs afirmam:** Doc lista o teste de hook `useProducts.test.ts` (produtos) entre os 17 testes.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:1548-1568`
- **O que falta:** Criar src/hooks/useProducts.test.ts.
- **Evidência:** arquivo de teste useProducts.test.ts ausente| cético: ausente: git ls-files \| grep -i useProducts → só src/hooks/useProducts.ts; nenhum teste do hook (apenas mocks em testes de componentes). Doc: docs/DOCUMENTACAO_SISTEMA.md:1560.

### F3683 · Teste useReportData.test.ts

- **Tipo:** Teste
- **O que os docs afirmam:** Doc lista o teste de hook `useReportData.test.ts` (dados de relatórios) entre os 17 testes.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:1548-1568`
- **O que falta:** Criar src/hooks/useReportData.test.ts.
- **Evidência:** arquivo de teste useReportData.test.ts ausente| cético: ausente: git ls-files \| grep -i useReportData → só src/hooks/useReportData.ts; nenhum teste. Doc: docs/DOCUMENTACAO_SISTEMA.md:1561.

### F3684 · Teste useSalesAssistant.test.ts

- **Tipo:** Teste
- **O que os docs afirmam:** Doc lista o teste de hook `useSalesAssistant.test.ts` (assistente de vendas) entre os 17 testes.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:1548-1568`
- **O que falta:** Criar src/hooks/sales/useSalesAssistant.test.ts.
- **Evidência:** arquivo de teste useSalesAssistant.test.ts ausente| cético: ausente: git ls-files \| grep -i useSalesAssistant → só src/hooks/sales/useSalesAssistant.ts; nenhum teste. Doc: docs/DOCUMENTACAO_SISTEMA.md:1562.

### F3685 · Teste useSalesData.test.ts

- **Tipo:** Teste
- **O que os docs afirmam:** Doc lista o teste de hook `useSalesData.test.ts` (dados de vendas) entre os 17 testes.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:1548-1568`
- **O que falta:** Criar src/hooks/sales/useSalesData.test.ts.
- **Evidência:** arquivo de teste useSalesData.test.ts ausente| cético: ausente: git ls-files \| grep -i useSalesData → só src/hooks/sales/useSalesData.ts; nenhum teste. Doc: docs/DOCUMENTACAO_SISTEMA.md:1563.

### F3686 · Teste useSalesForecast.test.ts

- **Tipo:** Teste
- **O que os docs afirmam:** Doc lista o teste de hook `useSalesForecast.test.ts` (previsão de vendas) entre os 17 testes.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:1548-1568`
- **O que falta:** O próprio hook useSalesForecast não existe; doc de testes está desatualizado. Criar hook+teste ou remover a linha do doc.
- **Evidência:** arquivo de teste useSalesForecast.test.ts ausente| cético: ausente: git ls-files \| grep -i useSalesForecast → 0 resultados e grep -rn useSalesForecast src → 0 resultados. Nem o hook existe (ainda menos que o dito: não há o que testar). Doc: docs/DOCUMENTACAO_SISTEMA.md:1564.

### F3687 · Teste useSalespeople.test.ts

- **Tipo:** Teste
- **O que os docs afirmam:** Doc lista o teste de hook `useSalespeople.test.ts` (vendedores) entre os 17 testes.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:1548-1568`
- **O que falta:** Criar src/hooks/sales/useSalespeople.test.ts.
- **Evidência:** arquivo de teste useSalespeople.test.ts ausente| cético: ausente: git ls-files \| grep -i useSalespeople → src/hooks/sales/useSalespeople.ts, useSalespeopleList.ts, useSalespeopleMin.ts, nenhum .test. Doc: docs/DOCUMENTACAO_SISTEMA.md:1565.

### F3688 · Teste useSalespersonCoaching.test.ts

- **Tipo:** Teste
- **O que os docs afirmam:** Doc lista o teste de hook `useSalespersonCoaching.test.ts` (coaching) entre os 17 testes.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:1548-1568`
- **O que falta:** Criar src/hooks/sales/useSalespersonCoaching.test.ts.
- **Evidência:** arquivo de teste useSalespersonCoaching.test.ts ausente| cético: ausente: git ls-files \| grep -i useSalespersonCoaching → só src/hooks/sales/useSalespersonCoaching.ts; nenhum teste. Doc: docs/DOCUMENTACAO_SISTEMA.md:1566.

### F3689 · Teste useSuppliers.test.tsx

- **Tipo:** Teste
- **O que os docs afirmam:** Doc lista o teste de hook `useSuppliers.test.tsx` (fornecedores) entre os 17 testes.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:1548-1568`
- **O que falta:** Criar src/hooks/useSuppliers.test.tsx.
- **Evidência:** arquivo de teste useSuppliers.test.tsx ausente| cético: ausente: git ls-files \| grep -i useSuppliers → só src/hooks/useSuppliers.ts; nenhum teste. Doc: docs/DOCUMENTACAO_SISTEMA.md:1567.

### F3690 · Teste useTasks.test.ts

- **Tipo:** Teste
- **O que os docs afirmam:** Doc lista o teste de hook `useTasks.test.ts` (tarefas) entre os 17 testes.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:1548-1568`
- **O que falta:** Criar src/hooks/useTasks.test.ts.
- **Evidência:** arquivo de teste useTasks.test.ts ausente| cético: ausente: git ls-files \| grep -i useTasks → só src/hooks/useTasks.ts; o hook aparece apenas mockado em src/components/tasks/CreateTaskDialog.test.tsx (teste do componente, não do hook). Doc: docs/DOCUMENTACAO_SISTEMA.md:1568.

### F2069 · Testes para knownDeviceService.ts e clientService.ts

- **Tipo:** Teste
- **O que os docs afirmam:** A.12 P: sem teste.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:440`
- **O que falta:** Criar src/services/knownDeviceService.test.ts e src/services/clientService.test.ts (vitest, mock do cliente supabase) cobrindo os métodos exportados; incluir no coverage-ladder se forem módulos críticos.
- **Evidência:** ausente: ls src/services/knownDeviceService.test.ts src/services/clientService.test.ts → 0 resultados; grep -rl 'knownDeviceService\\|clientService' src --include='_.test._' → só src/components/security/KnownDevices.test.tsx, que faz vi.mock('@/services/knownDeviceService') na linha 9 (mocka o serviço, não o testa). clientService.ts é usado por src/hooks/crm/useClients.ts, src/pages/Clientes.tsx, Deduplication.tsx, ImportExport.tsx sem nenhum teste.
- **Revisão:** sem contestação cética concluída.

### F2075 · tests/graphify/ corpus sintético

- **Tipo:** Teste
- **O que os docs afirmam:** Etapa 10 P: fixtures dentro de *.test.mjs; diretório não existe.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:470`
- **O que falta:** Criar tests/graphify/ com corpus sintético (arquivos .ts/.md/.sql mínimos) e fazer scripts/graphify/*.test.mjs ler dali em vez de strings inline; ou registrar em docs/agentes/contexto-gerado.md que o corpus inline é a decisão final.
- **Evidência:** ausente: ls tests/graphify → 'No such file or directory'. Fixtures continuam embutidas nos 6 arquivos scripts/graphify/*.test.mjs (37 testes passam). Nenhum doc/commit registra decisão de não criar o diretório.
- **Revisão:** sem contestação cética concluída.

### F2100 · CI/CD para customizações

- **Tipo:** Workflow CI
- **O que os docs afirmam:** Falta CI/CD para customizações.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:213`
- **O que falta:** Definir o que é 'pacote de customização' no produto antes de qualquer pipeline; hoje não há artefato de código para ligar.
- **Evidência:** docs/GAPS_CLASSE_MUNDIAL.md:213 é item de wishlist ('Developer Platform'); `grep -rin customiza .github/workflows/` → 0 resultados; não existe pacote de customização nem pipeline correspondente em .github/workflows/ (27 arquivos listados).
- **Revisão:** sem contestação cética concluída.

### F2118 · Etapa 22: job actionlint em PRs que tocam .github/workflows/**

- **Tipo:** Workflow CI
- **O que os docs afirmam:** Lint de workflows.
- **Fontes:** `docs/estado/PLANO_CI_WORKFLOWS_2026-10-01.md:62`
- **O que falta:** Adicionar job (em pr-checks.yml ou workflow próprio) com actionlint (ex.: rhysd/actionlint pinado por SHA) disparado em pull_request com paths '.github/workflows/**'.
- **Evidência:** ausente: `grep -rn -i actionlint .github/ package.json scripts/` → 0 resultados. O que existe é scripts/ci/check-workflow-pins-resolvem.unit.mjs (pr-checks.yml:158), que valida pins de actions, não lint de sintaxe de workflow.
- **Revisão:** sem contestação cética concluída.

### F2120 · Etapa 38: unificar VITE_SUPABASE_PROJECT_ID em variável de repo (vars.)

- **Tipo:** Workflow CI
- **O que os docs afirmam:** Hoje secret num workflow e hardcoded em outro.
- **Fontes:** `docs/estado/PLANO_CI_WORKFLOWS_2026-10-01.md:82`
- **O que falta:** Criar a variável de repositório VITE_SUPABASE_PROJECT_ID (Settings → Variables) e substituir o fallback hardcoded de pr-checks.yml:551, o secret de quote-to-sale-e2e.yml:176 e o env de types-sync.yml:44 por `${{ vars.VITE_SUPABASE_PROJECT_ID }}`.
- **Evidência:** ausente: `grep -rn 'vars.VITE_SUPABASE_PROJECT_ID' .github/workflows/` → 0 resultados (vars. só em db-backup.yml:44-45,147 e pr-checks.yml:424 para outras variáveis). Hoje: pr-checks.yml:551 `steps.precheck.outputs.project_ref|\| 'usyxfpqlsspldubptrdl'` (hardcoded), quote-to-sale-e2e.yml:176 `steps.precheck.outputs.project_ref \|\| secrets.VITE_SUPABASE_PROJECT_ID` (secret), types-sync.yml:44 `PROJECT_REF: usyxfpqlsspldubptrdl` (hardcoded).
- **Revisão:** sem contestação cética concluída.

### F2127 · Etapa 89: job semanal medindo taxa de falha/flaky por workflow

- **Tipo:** Workflow CI
- **O que os docs afirmam:** Publicado no Summary.
- **Fontes:** `docs/estado/PLANO_CI_WORKFLOWS_2026-10-01.md:153`
- **O que falta:** Criar workflow semanal (schedule) com github-script que liste runs dos últimos 7 dias por workflow (actions.listWorkflowRunsForRepo), calcule taxa de failure e re-runs e publique tabela em $GITHUB_STEP_SUMMARY.
- **Evidência:** ausente: nenhum workflow agendado consulta a API de runs para medir taxa de falha por workflow — `grep -rn -i 'flaky\\|taxa de falha\\|failure rate' .github/workflows/` só retorna pr-checks.yml:249-275 (scripts/flaky-report.mjs, relatório de specs flaky do vitest por PR, não por workflow); `listWorkflowRunsForRepo` aparece apenas em inventario-estado-semanal.yml:134 e types-sync.yml:253 para aprovar runs action_required. Schedules existentes (codeql, contexto, cron-monitoring, db-backup, dependabot-automerge, inventario, migrations-drift, pr-review-sla, qa-exhaustive, types-sync) não medem falhas/flaky.
- **Revisão:** sem contestação cética concluída.

### F2138 · Heartbeat de cron fora do banco (GitHub Actions a cada 15 min)

- **Tipo:** Workflow CI
- **O que os docs afirmam:** Ação 2: workflow GitHub Actions verifica cron.job/health a cada 15 min; exige SUPABASE_DB_URL read-only como secret.
- **Fontes:** `docs/postmortems/2026-08-30_cron_outage.md:77`
- **O que falta:** Criar .github/workflows/cron-heartbeat.yml com schedule '*/15 * * * *' (ou o mínimo viável no GitHub), psql read-only via secret SUPABASE_DB_URL (com checagem do ref usyxfpqlsspldubptrdl como db-probe.yml:41) consultando cron.job_run_details dos últimos 20 min e falhando/alertando (ci-failure-alert ou N8N) quando não houver execução.
- **Evidência:** ausente: `grep -rn '\*/15' .github/workflows/*.yml` → 0 resultados; `ls .github/workflows/*heartbeat*` → inexistente. cron-monitoring.yml:16-21 é suíte Deno de regressão do cron-failure-alerter, diária (cron '0 6 * * *'), não consulta cron.job via SUPABASE_DB_URL. db-probe.yml só roda sob workflow_dispatch e sonda existência de objetos. O próprio postmortem registra o item como pendente (docs/postmortems/2026-08-30_cron_outage.md:77). O monitoramento existente é interno ao banco (edge function cron-failure-alerter na allowlist deploy.yml:144 + jobs pg_cron em …/contexto/supabase/cron.md), que é exatamente o que o heartbeat externo deveria cobrir quando o pg_cron parar.
- **Revisão:** sem contestação cética concluída.

### F2140 · Job CI `enterprise-quality` ignora 0028 para as 11 funções via allowlist em `scripts/ci-check-forbidden.sh`

- **Tipo:** Workflow CI
- **O que os docs afirmam:** ADR-008: o job enterprise-quality ignora o warning 0028 para as 11 funções via allowlist em scripts/ci-check-forbidden.sh.
- **Fontes:** `docs/decisions/ADR-008-anon-executable-security-definer.md:45-45`
- **O que falta:** A afirmação do ADR-008 (docs/decisions/ADR-008-anon-executable-security-definer.md:45) descreve um artefato que não existe. Ou corrigir o ADR (apontar para o mecanismo real de triagem do advisor 0028, se houver) ou criar a allowlist das 11 funções e um step em pr-checks.yml que a aplique.
- **Evidência:** scripts/ci-check-forbidden.sh:4 — FORBIDDEN_PATTERNS=("LGPDConsentBanner" "InstallPrompt" "UpdatePrompt" "LGPD"): o script é um grep de padrões proibidos no front, não tem allowlist de funções nem menção a 0028 (grep -rn "0028" scripts/ .github/ → 0 resultados). Job enterprise-quality não existe: .github/workflows/enterprise-quality.yml foi apagado no commit a24228771 ("consolida CI"); .github/workflows/pr-checks.yml:3 só menciona a consolidação. Nenhum workflow executa o script (grep ci-check-forbidden .github/workflows/*.yml → 0; scripts/automation.config.json:211-215 o classifica como 'legado sem chamador').
- **Revisão:** sem contestação cética concluída.

### F3698 · Relatório mensal de minutos de Actions (P100 #65)

- **Tipo:** Workflow CI
- **O que os docs afirmam:** Planejado, inexistente.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:72`
- **O que falta:** Workflow agendado (mensal) que consulte o uso de Actions e publique relatório.
- **Evidência:** .github/workflows/actions-usage-report.yml ausente| cético: ausente: grep -rln 'actions/usage\\|billing/actions\\|minutes_used\\|total_minutes' .github/workflows scripts → 0 resultados; nenhum dos 28 workflows em .github/workflows/ gera relatório de minutos (os crons listados por grep -n 'cron:' são codeql, contexto, cron-monitoring, db-backup, dependabot-automerge, inventario-estado-semanal, migrations-drift, pr-review-sla, qa-exhaustive, types-sync).

### F2164 · scripts/quality-gate.sh

- **Tipo:** Workflow CI
- **O que os docs afirmam:** Script quality-gate.sh: ESLint + tsgo + Vitest + Deno + load-test + E2E.
- **Fontes:** `docs/reports/QA_EXHAUSTIVE_2026-07-15.md:64-64`
- **O que falta:** O script citado em docs/reports/QA_EXHAUSTIVE_2026-07-15.md:64 não existe no repo; atualizar o doc para apontar `npm run ci`/pr-checks.yml ou recriar scripts/quality-gate.sh encadeando esses passos.
- **Evidência:** ausente: ls scripts/quality-gate.sh → 'No such file or directory'; grep -rln quality-gate scripts .github package.json → 0 resultados. O equivalente funcional hoje é o script npm `ci` (package.json) + jobs de pr-checks.yml (ESLint, tsc, Vitest, Deno, k6 smoke :444-458, e2e :460).
- **Revisão:** sem contestação cética concluída.

### F2173 · Workflow _notify.yml reutilizável

- **Tipo:** Workflow CI
- **O que os docs afirmam:** Planejado (P100 #42), inexistente.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:72,39`
- **O que falta:** Criar .github/workflows/_notify.yml com `on: workflow_call` (inputs: workflow, run_id; secret SLACK_CI_WEBHOOK_URL) e substituir os 4 blocos notify-failure por `uses: ./.github/workflows/_notify.yml`.
- **Evidência:** ausente: `ls .github/workflows/_notify.yml` → No such file; `grep -rn '_notify\\|workflow_call' .github/workflows/` → 0 resultados. A notificação está duplicada inline em 4 workflows (pr-checks.yml:724-752, cron-monitoring.yml:100-122, qa-exhaustive.yml:164-186, codeql.yml:52-74) e existe .github/workflows/ci-failure-alert.yml:1-25 (workflow_run → N8N_ALERT_WEBHOOK_URL, secret também ausente na listagem) — nenhum é reutilizável via workflow_call.
- **Revisão:** sem contestação cética concluída.

### F3700 · Workflow CI action.yml (2 afirmações nos docs)

- **Tipo:** Workflow CI
- **O que os docs afirmam:** checkout + node + npm ci repetido 12×.| Só 2 de 5 usos têm cache.
- **Fontes:** `docs/estado/PLANO_CI_WORKFLOWS_2026-10-01.md:130`, `docs/estado/PLANO_CI_WORKFLOWS_2026-10-01.md:132`
- **O que falta:** Criar .github/actions/setup-node-deps/action.yml e .github/actions/setup-deno/action.yml e usá-las nos workflows.
- **Evidência:** .github/workflows/action.yml ausente| cético: ausente: ls .github/ → CODEOWNERS, ENVIRONMENTS.md, ISSUE_TEMPLATE, dependabot.yml, pull_request_template.md, workflows (sem pasta actions/); grep -n 'uses: \./' .github/workflows/*.yml → 0 resultados; git log --all -- .github/actions → 0 commits (nunca existiu). Os workflows repetem setup-node/setup-deno inline (ex.: deploy.yml setup-node e denoland/setup-deno).

### F3706 · Workflow CI stale.yml (2 afirmações nos docs)

- **Tipo:** Workflow CI
- **O que os docs afirmam:** Marcar, não fechar.| Planejado, inexistente.
- **Fontes:** `docs/execucao/PLANO_WORKFLOWS_GITHUB_ACTIONS_100_ETAPAS_2026-09-27.md:179`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:72`
- **O que falta:** Criar .github/workflows/stale.yml (actions/stale, mensal, PRs com mais de 30 dias sem atividade, só marcar, sem fechar), conforme PLANO_WORKFLOWS...:179.
- **Evidência:** .github/workflows/stale.yml ausente| cético: Ausente: `git log --all --oneline -- .github/workflows/stale.yml` → 0 resultados. `grep -rln actions/stale .github` → 0 resultados. `grep -rn stale .github/workflows/*.yml` → 0 resultados. A doc docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:72 o registra como 'NÃO INICIADO'.

## Parcial (446)

### F1165 · Reset manual de circuito via `fn_admin_reset_circuit(name)`

- **Tipo:** Ação/botão
- **O que os docs afirmam:** ADR-004: reset manual via fn_admin_reset_circuit(name).
- **Fontes:** `docs/decisions/ADR-004-circuit-breaker-edge.md:24-24`
- **O que falta:** Adicionar botão 'Resetar circuito' em AdminPlatformSLOPage.tsx chamando supabase.rpc('fn_admin_reset_circuit', {_circuit_name, _reason}); fazer o edge _shared/circuit-breaker.ts consultar o último evento 'closed' manual em circuit_breaker_events antes de manter OPEN, senão o RPC só registra evento sem efeito.
- **Evidência:** RPC existe no banco real com checagem de admin: contexto/supabase/functions.md:171 e functions/public/fn_admin_reset_circuit__9c900851bc3e0d8b.sql:10-12 (has_role admin) — grant authenticated, service_role; tipo em src/integrations/supabase/types.ts:24184. Sem chamador: `grep -rn fn_admin_reset_circuit src/ supabase/functions/` → 0 resultados fora de types.ts; src/pages/admin/AdminPlatformSLOPage.tsx não tem Button/rpc/reset (grep → 0). O `resetCircuit` do front (src/hooks/circuitBreakerUtils.ts:183-193) só zera o Map em memória do navegador; supabase/functions/_shared/circuit-breaker.ts:63 apenas grava eventos e nunca lê circuit_breaker_events para fechar circuito. ADR-004:24 promete reset manual via RPC.
- **Revisão:** sem contestação cética concluída.

### F1167 · ~40 Edge Functions periódicas nunca agendadas

- **Tipo:** Agendamento (cron)
- **O que os docs afirmam:** Cerca de 40 funções escritas como jobs periódicos sem agendamento.
- **Fontes:** `docs/estado/ESTADO_ATUAL.md:129-130`
- **O que falta:** Incluir as 12 functions agendadas na allowlist ACTIVE (deploy.yml:144) trocando por functions mortas, ou desagendar os 12 jobs (cron.unschedule) e documentar; conferir net._http_response para 404 dessas chamadas.
- **Evidência:** Afirmação desatualizada: contexto/supabase/cron.md lista 45 jobs; 22 edge functions agendadas via public.trigger_internal_edge_job (ids 36-46, 48, 77-88), 2 via net.http_post direto (ids 21 deal-risk-digest, 26 email-bulk-retry) e 6 via funções SQL (campaign-health-alert, detect-client-churn-alerts, generate-urgent-client-tasks etc.). Porém 12 das agendadas estão FORA da allowlist ACTIVE de .github/workflows/deploy.yml:144: challenge-expiration-alerts, check-lead-sla, check-quote-expiration, check-v4-callback-alerts, process-call-recording-ingest, process-scheduled-sends, rotate-daily-challenges, scheduled-reports-runner, sdr-consecutive-alerts, send-alert-notifications, webvitals-regression-alert, winloss-webhook-health-monitor (cron.md ids 84,81,80,37,39,79,46,88,82,85,44,42). cron-runs.md:331-336,394-399 mostra 'succeeded 1 row' só porque net.http_post é assíncrono. docs/estado/ESTAD…
- **Revisão:** sem contestação cética concluída.

### F1172 · Migration *_reconcile_operational_edge_crons.sql recria jobs operacionais

- **Tipo:** Agendamento (cron)
- **O que os docs afirmam:** Recriar jobs com cron.schedule conforme migration de reconciliação dos crons operacionais.
- **Fontes:** `docs/runbooks/cron-failures.md:18-19`
- **O que falta:** Reaplicar em produção o bloco :101-117 (unschedule+schedule de deal-risk-digest-daily e email-bulk-retry-15min via trigger_internal_edge_job) e registrar nova migration com server_time.
- **Evidência:** Arquivo existe: supabase/migrations/20260910153000_reconcile_operational_edge_crons.sql (unschedule/schedule em :68-117 para 6 jobs). Em produção (contexto/supabase/cron.md) notify-v4-quote-status-every-5min (36), check-v4-callback-alerts-every-5min (37), cron-failure-alerter-10min (38) e process-call-recording-ingest-1min (39) batem com a migration (trigger_internal_edge_job). Divergência: deal-risk-digest-daily (21) e email-bulk-retry-15min (26) ainda rodam `net.http_post` direto com anon_key de _internal_secrets, não `trigger_internal_edge_job` prescrito em :101-117 — a migration não reflete o estado real desses 2 jobs. docs/runbooks/cron-failures.md:18-19 aponta para essa migration.
- **Revisão:** sem contestação cética concluída.

### F1174 · .env.example usa VITE_SUPABASE_PUBLISHABLE_KEY

- **Tipo:** Doc/config
- **O que os docs afirmam:** .env.example documenta VITE_SUPABASE_ANON_KEY, mas código lê VITE_SUPABASE_PUBLISHABLE_KEY.
- **Fontes:** `docs/auditoria/RELATORIO_FALHAS.md:57-60`
- **O que falta:** Adicionar ao .env.example (comentadas) VITE_APP_URL, VITE_CANONICAL_URL e VITE_SUPABASE_TEST_MODE com uma linha de propósito cada.
- **Evidência:** Afirmação atendida: .env.example:14 `VITE_SUPABASE_PUBLISHABLE_KEY` e :16 ANON_KEY só como alias comentado; src/integrations/supabase/env.ts:10-11 lê PUBLISHABLE_KEY com fallback ANON_KEY. Critério 'lista exatamente as variáveis lidas' falha: `grep -rhoE 'import.meta.env.VITE_[A-Z_]+' src/` retorna também VITE_APP_URL e VITE_CANONICAL_URL (src/config/external.ts:9,12) e VITE_SUPABASE_TEST_MODE (src/test/security/fn-cleanup-webhook-dedupe-privileges.test.ts:13), ausentes do .env.example.
- **Revisão:** sem contestação cética concluída.

### F1176 · .github/CODEOWNERS cobre * com @adm01-debug @promo-ops (promo-ops não existe)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Revisão recai só em adm01-debug; ver docs/DR_PLAN.md.
- **Fontes:** `docs/agentes/github-ci.md:39-40`
- **O que falta:** Criar a conta promo-ops e convidá-la como colaboradora (Write) ou remover @promo-ops do CODEOWNERS; documentar a decisão no DR_PLAN.md (hoje não menciona).
- **Evidência:** .github/CODEOWNERS:8 `* @adm01-debug @promo-ops` (também :16-22). GitHub API users/promo-ops → 404 (conta não existe). Comentário :5-7 remete a docs/DR_PLAN.md, mas `grep -n -i promo-ops docs/DR_PLAN.md` → 0 resultados. docs/agentes/github-ci.md:39-40 confirma que a revisão recai só em adm01-debug.
- **Revisão:** sem contestação cética concluída.

### F1177 · .github/CODEOWNERS com único owner adm01-debug (bus factor 1)

- **Tipo:** Doc/config
- **O que os docs afirmam:** CODEOWNERS atribui todo o repo a um único owner.
- **Fontes:** `docs/estado/12_INFRA_CI_TESTES.md:383`
- **O que falta:** Adicionar um segundo owner real (conta existente com acesso Write) ao CODEOWNERS e ao ruleset de code owner review.
- **Evidência:** .github/CODEOWNERS:8-33: único owner válido é @adm01-debug; @promo-ops retorna 404 na API do GitHub. Bus factor 1 persiste.
- **Revisão:** sem contestação cética concluída.

### F1178 · .github/workflows/README.md documenta 3 de 11 workflows

- **Tipo:** Doc/config
- **O que os docs afirmam:** O README dos workflows (linhas 5-12) descreve apenas 3 workflows dos 11 existentes.
- **Fontes:** `docs/estado/12_INFRA_CI_TESTES.md:55`
- **O que falta:** Adicionar ao README uma seção (propósito + gatilhos) para cada um dos 15 workflows listados.
- **Evidência:** .github/workflows/README.md documenta 12 workflows (pr-checks, cron-monitoring, edge-functions-bundle, edge-functions-request-id, quote-to-sale-e2e, qa-exhaustive, graphify, codeql, contexto, contexto-testes, inventario-estado-semanal, types-sync); `ls .github/workflows/*.yml` → 27 arquivos. 15 sem entrada: a11y-sweep, apply-migration, automation-local, ci-failure-alert, db-backup, db-probe, dependabot-automerge, dependabot-fix-lockfile, dependency-review, deploy, edge-functions-input-validation, main, migrations-drift, pr-review-sla, release-please.
- **Revisão:** sem contestação cética concluída.

### F1181 · .husky/post-commit e post-checkout do graphify avaliados

- **Tipo:** Doc/config
- **O que os docs afirmam:** Etapa 34 D: hooks instalados (PR #221) contra o README.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:484`
- **O que falta:** Registrar decisão (ADR ou seção em docs/graphify/README.md) aceitando ou removendo os hooks, alinhar README.md:75, e anotar teste de coexistência com Husky/worktrees.
- **Evidência:** Hooks existem: .husky/post-commit e .husky/post-checkout (instalados por `graphify hook install`, cabeçalho :2-4; _PINNED aponta para /home/ubuntu/.pyenv/... :78). Documentação operacional em docs/agentes/contexto-gerado.md:28 (rebuild em background, GRAPHIFY_SKIP_HOOK=1). Contradição não resolvida: docs/graphify/README.md:75 ainda proíbe 'hook automático'; docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:484 etapa 34 = D 'sem avaliação documentada'. Nenhum doc de decisão/teste de coexistência (duas worktrees, falha da ferramenta).
- **Revisão:** sem contestação cética concluída.

### F1184 · /dashboard declara canonical no domínio ligado à Vercel (CANONICAL_URL) (#439)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Falha de severidade baixa registrada pela validação adversarial, sem correção nesta rodada.
- **Fontes:** `docs/prod-readiness.md:1006`
- **O que falta:** Definir VITE_CANONICAL_URL=https://promo-champions-v2-1.vercel.app nas envs da Vercel (ou ligar o domínio promochampions.com.br ao projeto) e ajustar o default em external.ts:12.
- **Evidência:** src/config/external.ts:11-12 `CANONICAL_URL = VITE_CANONICAL_URL ?? 'https://promochampions.com.br'`; src/pages/Index.tsx:9,170 `<link rel="canonical" href={CANONICAL_URL + '/dashboard'}>`. docs/agentes/vercel-deploy.md:9 define produção = https://promo-champions-v2-1.vercel.app (promochampions.com.br não consta como ligado à Vercel). docs/prod-readiness.md:1012 registra #439 como falha pendente.
- **Revisão:** sem contestação cética concluída.

### F1185 · 15_PLANO_COBERTURA_MODULOS sem src/lib/schemas

- **Tipo:** Doc/config
- **O que os docs afirmam:** Meta de 90% para módulo removido (PR #209); LADDER_MODULES ainda o declara (update-coverage-baseline.mjs:26).
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:335`
- **O que falta:** Remover a linha 26 ('src/lib/schemas/') de scripts/update-coverage-baseline.mjs e regenerar coverage-ladder-baseline.json.
- **Evidência:** Doc já corrigido: docs/estado/15_PLANO_COBERTURA_MODULOS.md:48,60 marca src/lib/schemas/ como removido (PR #209) sem meta. Script não: scripts/update-coverage-baseline.mjs:26 ainda lista `'src/lib/schemas/'` em LADDER_MODULES; `ls src/lib/schemas` → não existe.
- **Revisão:** sem contestação cética concluída.

### F1190 · 7 edge functions leem VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY no servidor

- **Tipo:** Doc/config
- **O que os docs afirmam:** create-stagnant-tasks, cron-failure-alerter, forecast-narrative, process-race-event, race-commentary, receive-quote-sync, start-race-season (+ winloss-webhook-dispatcher) leem vars VITE_* via Deno.env.get, que tipicamente não existem no runtime Deno (undefined silencioso).
- **Fontes:** `docs/estado/10_EDGE_FUNCTIONS.md:198-206`
- **O que falta:** Trocar nos 7 arquivos de teste citados `Deno.env.get('VITE_SUPABASE_URL')!`/`VITE_SUPABASE_PUBLISHABLE_KEY!` por fallback `?? Deno.env.get('SUPABASE_URL')`/`SUPABASE_ANON_KEY` (padrão já usado em dead-letter-rbac.test.ts:6-7) e atualizar docs/estado/10_EDGE_FUNCTIONS.md §5.4 dizendo que os handlers não leem VITE_*.
- **Evidência:** Handlers limpos: grep -c 'VITE_' em supabase/functions/{create-stagnant-tasks,cron-failure-alerter,forecast-narrative,process-race-event,race-commentary,receive-quote-sync,start-race-season,winloss-webhook-dispatcher}/index.ts → 0 em todos; TEST_USER_ACCESS_TOKEN/TEST_FORECAST_ID em forecast-narrative/index.ts → 0; cron-failure-alerter, receive-quote-sync e winloss-webhook-dispatcher leem Deno.env.get("SUPABASE_URL"). Porém `grep -rn VITE_ supabase/functions` ainda retorna 16 ocorrências em 9 arquivos de teste: receive-quote-sync/index.test.ts:24-25, forecast-narrative/index.test.ts:10-11, start-race-season/index_test.ts:4-5, cron-failure-alerter/index.test.ts:19, race-commentary/index_test.ts:4-5, create-stagnant-tasks/index.test.ts:8-9, process-race-event/index_test.ts:4-5 (sem fallback, com `!`); só cron-failure-alerter/dead-letter-rbac.test.ts:6-7 e winloss-webhook-dispatcher/retry_…
- **Revisão:** sem contestação cética concluída.

### F1191 · 71 edge functions do repo publicadas (B1) — decisão de plano ou consolidação

- **Tipo:** Doc/config
- **O que os docs afirmam:** OPTIONS → 404 NOT_FOUND para 71 funções; 100 publicadas = limite do plano. Decisão de custo/arquitetura: subir plano ou despublicar/consolidar.
- **Fontes:** `docs/prod-readiness.md:1010`
- **O que falta:** Decisão do dono (custo/arquitetura): subir o plano ou consolidar. Mínimo: incluir na allowlist (deploy.yml:144) as 12 functions agendadas pelo pg_cron (ou desativar os jobs em cron.md:27,29,35,48 etc.) e as chamadas pelo front (push-subscribe, send-quote-to-client, workflow-executor, nlq-query, send-password-reset…), removendo 100-N obsoletas; registrar o inventário real via `supabase functions list --project-ref usyxfpqlsspldubptrdl`.
- **Evidência:** Allowlist de 100 functions em .github/workflows/deploy.yml:144 (ACTIVE=...). Cruzamento com o cron real (snapshot cron.md): 12 functions chamadas via trigger_internal_edge_job estão FORA da allowlist — check-v4-callback-alerts (cron.md:27), process-call-recording-ingest (cron.md:29, a cada minuto), rotate-daily-challenges (cron.md:35), send-alert-notifications (cron.md:48), challenge-expiration-alerts, check-lead-sla, check-quote-expiration, process-scheduled-sends, scheduled-reports-runner, sdr-consecutive-alerts, webvitals-regression-alert, winloss-webhook-health-monitor. Cruzamento com src/ (grep functions.invoke): 22 chamadas fora da allowlist, ex.: push-subscribe, send-quote-to-client, workflow-executor, nlq-query, report-builder-execute, twilio-click-to-call, summarize-call-recording, qbr-generator, sequence-enroll; pelo índice codigo/edge-functions.json (chamada_pelo_front) são 3…
- **Revisão:** sem contestação cética concluída.

### F1196 · Achado F: Vitest 1.6.1 com CVE crítica e dependabot.yml proíbe major do vitest

- **Tipo:** Doc/config
- **O que os docs afirmam:** GHSA-5xrq-8626-4rwp (CVSS 9.8) + vite/esbuild transitivos; npm audit --omit=dev não vê devDeps.
- **Fontes:** `docs/execucao/PLANO_WORKFLOWS_GITHUB_ACTIONS_100_ETAPAS_2026-09-27.md:24`
- **O que falta:** Em pr-checks.yml:218 adicionar um segundo comando `npm audit --audit-level=critical` (incluindo devDeps) ou remover `--omit=dev`; opcionalmente incluir `security-audit` no needs do ci-gate (pr-checks.yml:710).
- **Evidência:** Vitest atualizado: package.json:186 "vitest": "^5.1.0", :167 @vitest/coverage-v8 ^5.1.0, :184 vite ^8.3.8; package-lock.json resolve vitest 5.1.0, vite 8.3.8, esbuild 0.28.1 (CVE GHSA-5xrq-8626-4rwp afetava 1.6.x). .github/dependabot.yml não tem bloco `ignore`; grupo `testing` com padrões vitest*/@vitest/* (linhas 29-35). Porém .github/workflows/pr-checks.yml:218 continua `npm audit --omit=dev --audit-level=high` (devDeps fora do audit) e o job é intencionalmente informativo, fora do gate (pr-checks.yml:192-194, 708-709).
- **Revisão:** sem contestação cética concluída.

### F1197 · Achado G: Repositório público com allowed_actions: all e sem sha_pinning_required

- **Tipo:** Doc/config
- **O que os docs afirmam:** Comentário em pr-checks.yml:14-15 assume privado; actions sem pin por SHA.
- **Fontes:** `docs/execucao/PLANO_WORKFLOWS_GITHUB_ACTIONS_100_ETAPAS_2026-09-27.md:30`
- **O que falta:** Dono/admin: Settings → Actions → General: 'Allow select actions and reusable workflows' (allowed_actions=selected, listando actions/_, denoland/_, astral-sh/_, supabase/_, treosh/*) e habilitar 'Require actions to be pinned to a full-length commit SHA' (sha_pinning_required=true). Via MCP: github_set_actions_permissions + github_set_selected_actions.
- **Evidência:** No código: todos os 118 `uses:` de .github/workflows/*.yml estão pinados por SHA (grep de `uses:` sem `@<40 hex>` → 0 resultados; ex. deploy.yml:122 actions/checkout@3d3c42e5… # v7.0.1); pr-checks.yml:14-15 hoje é o bloco `permissions:` (o comentário 'repo privado' não existe mais). Nas configurações do repositório (API get_actions_permissions): {"enabled":true,"allowed_actions":"all","sha_pinning_required":false} — critério `sha_pinning_required=true e allowed_actions=selected` não atendido.
- **Revisão:** sem contestação cética concluída.

### F1198 · Achado H: Ruleset main-protection exige só 3 checks, strict=false, 0 aprovações

- **Tipo:** Doc/config
- **O que os docs afirmam:** Lint & Type Check, Unit Tests, Build Check são os únicos required; Edge Lint, Security Audit, Bundle, Request-Id, CodeQL não bloqueiam.
- **Fontes:** `docs/execucao/PLANO_WORKFLOWS_GITHUB_ACTIONS_100_ETAPAS_2026-09-27.md:31`
- **O que falta:** Dono: no ruleset 22148182 ativar strict (branch atualizada antes do merge) e decidir se bundle-size, deno-tests, sql-tests e CodeQL entram no `needs` do ci-gate (pr-checks.yml:710) ou como required checks; aprovações continuam 0 por decisão de fluxo solo (AGENTS.md §5.7).
- **Evidência:** Ruleset 22148182 'main-protection' (API get_ruleset, atualizado 2026-11-05): required_status_checks = ["CI Gate"] (não mais os 3 checks), strict_required_status_checks_policy=false, required_approving_review_count=0, require_code_owner_review=false, bypass_actors=[]. 'CI Gate' agrega lint-and-typecheck, test, build, instrucoes-agentes (pr-checks.yml:704-712); security-audit e edge-functions-lint ficam fora de propósito (pr-checks.yml:708-709), bundle-size, deno-tests, sql-tests, e2e e CodeQL também não bloqueiam.
- **Revisão:** sem contestação cética concluída.

### F1201 · Achado W: Docs de CI desatualizados (npm run health inexistente, bun vs npm, README de workflows)

- **Tipo:** Doc/config
- **O que os docs afirmam:** PR template pede npm run health; CLAUDE.md diz bun run; .github/workflows/README.md não lista gates reais.
- **Fontes:** `docs/execucao/PLANO_WORKFLOWS_GITHUB_ACTIONS_100_ETAPAS_2026-09-27.md:51`
- **O que falta:** Atualizar .github/workflows/README.md §pr-checks.yml listando os jobs reais e destacando que `CI Gate` (lint-and-typecheck, test, build, instrucoes-agentes) é o único check exigido pelo ruleset.
- **Evidência:** Corrigido: .github/pull_request_template.md:74 pede `npm run ci` (grep 'health' no template → 0); grep 'bun ' em CLAUDE.md/AGENTS.md → 0. .github/workflows/README.md:8-10 descreve pr-checks com 'Lint, TypeScript, secrets scan, testes + cobertura, Deno lint, E2E, build, Lighthouse e orçamento dos bundles', mas pr-checks.yml tem 18 jobs e o README não cita instrucoes-agentes (:68), migrations-gate (:165), security-audit (:195), sql-tests (:376), k6-smoke (:416), gen-types-drift (:670) nem o `ci-gate` (:704) que é o único required check do ruleset.
- **Revisão:** sem contestação cética concluída.

### F1202 · Achado X: coverage-baseline.json = 2,89% e lint:complexity tolera 126 warnings

- **Tipo:** Doc/config
- **O que os docs afirmam:** Ratchet de cobertura é cosmético; teto de complexidade alto.
- **Fontes:** `docs/execucao/PLANO_WORKFLOWS_GITHUB_ACTIONS_100_ETAPAS_2026-09-27.md:52`
- **O que falta:** Reduzir `--max-warnings` em package.json:28 conforme os warnings reais caírem (meta ≤100) com ratchet automático análogo a scripts/check-coverage-ratchet.mjs; subir a cobertura real antes de o baseline deixar de ser cosmético.
- **Evidência:** coverage-baseline.json: lines 4.64, branches 3.72, functions 3.4, statements 4.57 (medido 2026-09-28 com vitest v5; não é mais 2,89 mas continua piso cosmético). Ratchet existe e roda no CI: package.json:21-24 (coverage:ratchet/ladder/baseline:update), pr-checks.yml:283,288. package.json:28 `lint:complexity ... --max-warnings 131` — teto SUBIU de 126 para 131 (critério ≤100 não atendido); roda em pr-checks.yml:119 e qa-exhaustive.yml:48.
- **Revisão:** sem contestação cética concluída.

### F1203 · Achado Y: Environments Preview/Production sem protection rules; CODEOWNERS com um handle e sem review obrigatório

- **Tipo:** Doc/config
- **O que os docs afirmam:** require_code_owner_review=false.
- **Fontes:** `docs/execucao/PLANO_WORKFLOWS_GITHUB_ACTIONS_100_ETAPAS_2026-09-27.md:53`
- **O que falta:** Dono: Settings → Environments → Production: adicionar 'Required reviewers' e restringir a branch main (ou via MCP github_create_or_update_environment); criar a conta @promo-ops e convidá-la (CODEOWNERS:5-7); opcionalmente ativar require_code_owner_review no ruleset para .github/workflows e supabase/migrations.
- **Evidência:** API list_environments: 4 environments (copilot, pr-preview, Preview, Production) todos com protection_rules: [] e deployment_branch_policy: null; deploy.yml:119 usa `environment: production` e o cabeçalho (deploy.yml:9-11) promete approval gate que não está configurado. Ruleset 22148182: require_code_owner_review=false, required_approving_review_count=0. .github/CODEOWNERS agora tem dois handles (`* @adm01-debug @promo-ops`, linha 8; @promo-ops ainda 'a provisionar', linhas 5-7) e cobre /.github/workflows/ (:23) e /supabase/migrations/ (:18).
- **Revisão:** sem contestação cética concluída.

### F1208 · Ambiente de staging (config.staging.toml em uso)

- **Tipo:** Doc/config
- **O que os docs afirmam:** docs/STAGING.md:3,65-69: existe um único projeto Supabase; supabase/config.staging.toml não é usado.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:155`
- **O que falta:** Depende de F1207 (projeto de staging). Enquanto não existir, corrigir site_url/additional_redirect_urls em supabase/config.staging.toml:15-16 para o domínio real de staging ou marcar o arquivo como modelo não utilizado em docs/STAGING.md.
- **Evidência:** supabase/config.staging.toml existe (383 bytes; [api] port 54321, [db] port 54322, [auth] site_url/additional_redirect_urls linhas 15-16) mas aponta para `https://staging.salespro.com`, domínio placeholder sem relação com o Promo Champions; ausente: `grep -rn 'config.staging' .github/workflows package.json scripts/` → 0 resultados (nenhum workflow/script o usa). docs/STAGING.md:34-36 só o cita como 'base'; STAGING.md:3 confirma projeto único.
- **Revisão:** sem contestação cética concluída.

### F1211 · ARCHITECTURE: deploy real documentado (Vercel, Sentry)

- **Tipo:** Doc/config
- **O que os docs afirmam:** DIVERGENTE: diz Lovable Cloud/não Vercel/sem Sentry; @sentry/react em package.json; não há vercel.json.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:433`
- **O que falta:** Corrigir docs/ARCHITECTURE.md:123-124: 'Sentry integrado via @sentry/react em src/lib/errorTracking.ts, ativado só com VITE_SENTRY_DSN; sem Cloudflare'.
- **Evidência:** docs/ARCHITECTURE.md:4 'SPA React servida pela Vercel', :17 'Deploy| Vercel (projeto promo-champions-v2-1)', :117 'build Vite → Vercel'; vercel.json existe (rewrites SPA + headers de segurança). Porém ARCHITECTURE.md:123-124 afirma 'Não há Cloudflare ou Sentry configurados no repositório', enquanto package.json:103 tem @sentry/react ^10.75.3 e :157 @sentry/vite-plugin, e src/lib/errorTracking.ts:33-45 inicializa o Sentry quando VITE_SENTRY_DSN existe (.env.example:21-23).
- **Revisão:** sem contestação cética concluída.

### F1222 · Ausência de Cloudflare e Sentry no repositório

- **Tipo:** Doc/config
- **O que os docs afirmam:** ARCHITECTURE: não há Cloudflare ou Sentry configurados no repositório; versões anteriores citavam essa stack por engano.
- **Fontes:** `docs/ARCHITECTURE.md:123-125`
- **O que falta:** Corrigir docs/ARCHITECTURE.md:123-125 (Sentry integrado, opt-in por VITE_SENTRY_DSN/SENTRY_AUTH_TOKEN); se o DSN está configurado na Vercel é NÃO VERIFICADO.
- **Evidência:** Cloudflare: confirmado ausente (ls wrangler.toml _headers public/_headers → inexistentes; grep -rniE 'cloudflare\|wrangler' package.json src/ → 0). Sentry: a afirmação de docs/ARCHITECTURE.md:123-125 está desatualizada — package.json:103 "@sentry/react": "^10.75.3", package.json:157 "@sentry/vite-plugin"; src/lib/errorTracking.ts:33-60 initSentry() carrega o SDK por import() quando VITE_SENTRY_DSN existe; vite.config.ts:6,79-85 sentryVitePlugin ativo só com SENTRY_AUTH_TOKEN; 17 ocorrências de 'sentry' em package.json+src/.| cético: Cloudflare ausente: ls wrangler.toml _headers public/_headers → inexistentes; grep -rliE 'cloudflare\|wrangler' package.json src → 0. Sentry PRESENTE (contradiz docs/ARCHITECTURE.md:123-125): package.json:103 "@sentry/react", package.json:157 "@sentry/vite-plugin"; src/lib/errorTracking.ts:39 initSentry() chamado via initErrorTracking() em src/App.tsx:22,25;…

### F1229 · Baselines de typecheck strict reduzidos (882 frontend, 58 Deno)

- **Tipo:** Doc/config
- **O que os docs afirmam:** scripts/typecheck-baseline.json e deno-typecheck-baseline.json registram 882 e 58 erros.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:117`
- **O que falta:** Reduzir os 882 erros strict do frontend (baseline parada desde 2026-10-01) e corrigir o comentário em pr-checks.yml:321.
- **Evidência:** Frontend: scripts/typecheck-baseline.json total=882 (geradoEm 2026-10-01T23:41Z), mesmo valor nos 2 commits do arquivo (6c5285263, e74ff4208) — sem queda. Deno: scripts/deno-typecheck-baseline.json com 53 diagnostics (histórico 58→54→53 em 9839f288d→759fc36af→9717a5133) — em queda. CI compara: .github/workflows/pr-checks.yml:132-133 "Strict typecheck ratchet" (npm run typecheck:baseline → scripts/check-typecheck-baseline.mjs:19) e :326-327 node scripts/check-deno-types.mjs (BASELINE_PATH scripts/check-deno-types.mjs:24). Comentário pr-checks.yml:323 ainda diz "58 erros legados".| cético: scripts/typecheck-baseline.json total=882, geradoEm 2026-10-01T23:41:45Z, só 2 commits (6c5285263, e74ff4208) — sem queda. scripts/deno-typecheck-baseline.json em queda (58→53 segundo histórico). CI compara: .github/workflows/pr-checks.yml:128-133 (Strict typecheck ratchet) e :320-327 (Deno ratchet); co…

### F1234 · Buckets Storage report-snapshots e report-exports

- **Tipo:** Doc/config
- **O que os docs afirmam:** 5 buckets listados (avatars, call-recordings, quote-pdfs, report-exports, report-snapshots); objetos não enumerados.
- **Fontes:** `docs/estado/04_DOMINIO_ANALYTICS_BI.md:458-459`
- **O que falta:** Publicar scheduled-reports-runner (allowlist deploy.yml:144) ou desativar o cron; criar gravador para report-exports ou remover o bucket.
- **Evidência:** Buckets existem (storage.md: report-exports 50 MB; report-snapshots 20 MB). report-snapshots: gravado por supabase/functions/scheduled-reports-runner/index.ts:166-167 (.from("report-snapshots").upload) e lido por src/hooks/reporting/useScheduledReportRuns.ts:26 (usado em src/components/reporting/ScheduledReportRunsDrawer.tsx); cron.md job 88 scheduled-reports-runner-hourly (10 * * * *) chama trigger_internal_edge_job('scheduled-reports-runner') via net.http_post (functions/public/trigger_internal_edge_job__f02f045c8b4350ab.sql:62-63). PORÉM grep -c scheduled-reports-runner .github/workflows/deploy.yml → 0 (fora da allowlist) e inventario/estado/banco.json lista a function em no_repo_sem_deploy → nunca roda em produção; cron-runs.md:394-400 "succeeded 1 row" só prova o enfileiramento do HTTP. report-exports: nenhum gravador (grep report-exports src/ supabase/functions → só _shared/canoni…

### F1238 · bundle-stats e functions/graphify-out removidos

- **Tipo:** Doc/config
- **O que os docs afirmam:** Etapa 94 P: removidos; supabase/.temp/* ainda versionado (8 arquivos).
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:93`
- **O que falta:** git rm -r --cached supabase/.temp e adicionar supabase/.temp/ ao .gitignore.
- **Evidência:** bundle-stats/: removido em a24228771 (stats.html -4950, stats.json -281560) e ausente (git ls-files| grep bundle-stats → 0). functions/graphify-out: nunca existiu em supabase/functions (git log --all --diff-filter=D → 0); graphify-out/ raiz ignorado exceto GRAPH_REPORT.md e manifest.json (.gitignore:49-51). supabase/.temp/ AINDA versionado: git ls-files → 8 arquivos (gotrue-version, linked-project.json, pooler-url, postgres-version, project-ref, rest-version, storage-migration, storage-version), adicionados em b722848dd e nunca removidos; grep -i '.temp' .gitignore → 0. Conteúdo não sigiloso (ref usyxfpqlsspldubptrdl, org xkwxmfhdzgjzbkmbozcg). \| cético: bundle-stats removido em a24228771 (stats.html -4950, stats.json -281560). git log --all -- supabase/functions/graphify-out functions/graphify-out → 0 (nunca rastreado). supabase/.temp/ AINDA versionado: git ls-files → 8 arquivos (gotr…

### F1241 · C12 docs-verdade (reescrever 15 docs §6)

- **Tipo:** Doc/config
- **O que os docs afirmam:** LEDGER: A FAZER.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/LEDGER_EXECUCAO_2026-10-14.md:21`
- **O que falta:** Reescrever RELEASE_NOTES.md:71-77 e docs/HOTFIX.md:10,35 para Vercel; anotar CHANGELOG.md:166 (repo voltou a público); atualizar LEDGER linha 22 com estado real de C12.
- **Evidência:** Lista dos 15 docs em docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:317-337. Reescritos (notas 2026-10-18): CLAUDE.md virou só `@AGENTS.md`; docs/FEATURE_SUMMARY.md:70 e docs/DOCUMENTACAO_SISTEMA.md:182 corrigem SessionManager; docs/DEAD_TABLES.md:10-11,47 marca webauthn como VIVA; docs/SIZING.md:10 e docs/DR_PLAN.md:12 corrigem backup/PITR; docs/RUNBOOK.md:27, docs/ARCHITECTURE.md:17, docs/DEPLOYMENT.md:4-23 apontam Vercel; docs/runbooks/race-arena.md:6; docs/estado/15_PLANO_COBERTURA_MODULOS.md:48,60; docs/agentes/mapa-do-sistema.md:26 (ai-copilot órfã). Ainda divergentes: RELEASE_NOTES.md:73,76 ('Release = publish no Lovable'); CHANGELOG.md:166 ('Repositório tornado privado', repo é público — AGENTS.md:53); LEDGER_EXECUCAO_2026-10-14.md:22 segue 'A FAZER'.| cético: Confirmado: LEDGER_EXECUCAO_2026-10-14.md:22 segue 'C12 docs-verdade \| A FAZER'. RELEASE_NOTES.md:73 ('R…

### F1242 · Cache Graphify ignorado no .gitignore

- **Tipo:** Doc/config
- **O que os docs afirmam:** Cache do Graphify (graphify-out/ em scripts) também ignorado como defesa adicional.
- **Fontes:** `docs/graphify/EXECUCAO_LOTE_A_2026-09-11.md:25,43`
- **O que falta:** Adicionar padrão não ancorado no .gitignore (ex.: `**/graphify-out/*` com as exceções de GRAPH_REPORT.md/manifest.json na raiz).
- **Evidência:** .gitignore:49-51 (`/graphify-out/*` com exceções GRAPH_REPORT.md/manifest.json), :54 (`.graphify-local/`), :60 (`/.tools/graphify/local-state/`). `git check-ignore -v scripts/graphify/graphify-out/graph.json` → sem regra (não ignorado): o padrão é ancorado na raiz. O cache fora da raiz citado em docs/graphify/EXECUCAO_LOTE_A_2026-09-11.md:25 (`scripts/graphify/graphify-out/`) só está coberto por .graphifyignore:44 (ignore do Graphify, não do Git).| cético: Confirmado: .gitignore:49-51 usa `/graphify-out/*` ancorado na raiz; `git check-ignore -v scripts/graphify/graphify-out/graph.json` → rc=1 (não ignorado). docs/graphify/EXECUCAO_LOTE_A_2026-09-11.md:25 cita justamente o cache em `scripts/graphify/graphify-out/` e :43 promete 'cache Graphify também é ignorado'. Só .graphify-local/ (.gitignore:54) está coberto.

### F1243 · Canal de deploy unificado (Vercel vs Lovable)

- **Tipo:** Doc/config
- **O que os docs afirmam:** CLAUDE diz Vercel; RELEASE_NOTES diz publish no Lovable; não há vercel.json. DIVERGENTE.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:137`
- **O que falta:** Reescrever RELEASE_NOTES.md:71-77 e docs/HOTFIX.md:10,35 para Vercel + release-please.
- **Evidência:** vercel.json existe (rewrites+headers, linhas 1-40+). AGENTS.md:48,55,58; docs/DEPLOYMENT.md:4-6,13,18-23; docs/RUNBOOK.md:27; docs/ARCHITECTURE.md:17 apontam Vercel. Divergência remanescente: RELEASE_NOTES.md:73 ('Release = publish no Lovable. Não existe tag/artefato próprio') e :76 ('Publish no Lovable'), contrariando .github/workflows/release-please.yml:1-30 (tag v*._._ + deploy.yml).| cético: Confirmado: vercel.json existe; AGENTS.md e docs/RUNBOOK.md:27, docs/DEPLOYMENT.md:89 apontam Vercel; release-please.yml:1-30 cria tags. Divergência remanescente: RELEASE_NOTES.md:73,76 ('publish no Lovable') e, a mais, docs/HOTFIX.md:10 e :35 ('**Publish** no Lovable'). Docs não apontam para um único canal.

### F1244 · Catálogo docs/API.md das edge functions

- **Tipo:** Doc/config
- **O que os docs afirmam:** Reflete código, não publicação.
- **Fontes:** `docs/DEPLOYMENT.md:68,70-71`
- **O que falta:** Rodar `node scripts/gen-api-catalog.mjs`, comitar e pôr o passo no CI; marcar no catálogo o que está na allowlist ACTIVE deploy.yml:144.
- **Evidência:** docs/API.md existe (800 linhas), gerado por scripts/gen-api-catalog.mjs (API.md:3-4), seção '## Edge functions' em :25-27 declara 'Total: 169'. Repo tem 171 functions (`ls -d supabase/functions/*/` = 172 incl. _shared). Ausentes do catálogo: `grep -c '\`geocode-proxy\`' docs/API.md`→ 0; idem`health`, `webvitals-regression-alert`, `whatsapp-inbound-webhook`→ 0. Nenhum workflow/script npm regenera:`grep gen-api-catalog .github/workflows/*.yml package.json`→ 0. O catálogo não distingue allowlist de deploy (docs/DEPLOYMENT.md:70-72 avisa isso).| cético: Confirmado: docs/API.md:3-4 (gerado por scripts/gen-api-catalog.mjs) declara 'Total: 169 functions';`grep -c`de`geocode-proxy`, `health`, `webvitals-regression-alert`, `whatsapp-inbound-webhook`em docs/API.md → 0 cada, embora as 4 pastas existam em supabase/functions/.`grep -rn gen-api-catalog package.json .github/workflows/` → 0 (…

### F1247 · Chave _internal_secrets.functions_base_url gravada no banco

- **Tipo:** Doc/config
- **O que os docs afirmam:** trigger_internal_edge_job (20261002010000) e cron de churn (20260831163000) fazem RAISE se a chave faltar; repo declara que a chave não existe. ~11 jobs HTTP provavelmente falham. DIVERGENTE.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:180`
- **O que falta:** Incluir as 12 functions na allowlist ACTIVE de .github/workflows/deploy.yml:144 (ou desagendar os jobs 37,39,42,44,46,79,80,81,82,84,85,88) e conferir status 2xx em net._http_response.
- **Evidência:** A chave está presente (prova indireta): functions/public/trigger_internal_edge_job__f02f045c8b4350ab.sql:49-55 lê functions_base_url/anon_key/coaching_cron_secret de public._internal_secrets e faz RAISE se alguma for NULL. `grep -ci failed cron-runs.md` → 0, e os jobs registram 'succeeded'. Mas a parte 'jobs HTTP executam sem erro' não se cumpre: 12 alvos de trigger_internal_edge_job em cron.md (jobs 37,39,42,44,46,79,80,81,82,84,85,88) estão fora da allowlist ACTIVE de .github/workflows/deploy.yml:144 (100 nomes, conferidos um a um): check-v4-callback-alerts, process-call-recording-ingest, winloss-webhook-health-monitor, webvitals-regression-alert, rotate-daily-challenges, process-scheduled-sends, check-quote-expiration, check-lead-sla, sdr-consecutive-alerts, challenge-expiration-alerts, send-alert-notifications, scheduled-reports-runner. Em cron-runs.md:183-188 o job 37 aparece como …
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Implementado.

### F1248 · Chaves functions_base_url e anon_key em public._internal_secrets

- **Tipo:** Doc/config
- **O que os docs afirmam:** Os 10 jobs via trigger_internal_edge_job e 3 jobs SQL→HTTP leem _internal_secrets (functions_base_url, anon_key, coaching_cron_secret) e lançam internal_edge_job_secrets_missing se faltar chave. IDENTIDADE_BANCO_2026-09-13.md:93-97 registra que functions_base_url e anon_key não existem. Esses 13 jobs HTTP não fazem nada útil.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/F_banco_dados.md:144-147,291`
- **O que falta:** Deployar as 12 functions-alvo (allowlist em deploy.yml:144) ou desagendar os jobs; validar o status HTTP em net._http_response.
- **Evidência:** As chaves functions_base_url/anon_key/coaching_cron_secret estão presentes (prova indireta): trigger_internal_edge_job__f02f045c8b4350ab.sql:49-55 faria RAISE se faltassem. Os jobs 21 e 26 (cron.md, SQL→HTTP lendo _internal_secrets) e os que passam por trigger_internal_edge_job registram 'succeeded', com 0 'failed' em cron-runs.md. Porém 'jobs HTTP registram sucesso' só vale para o enfileiramento: 12 alvos estão fora da allowlist ACTIVE de .github/workflows/deploy.yml:144 (check-v4-callback-alerts, process-call-recording-ingest, winloss-webhook-health-monitor, webvitals-regression-alert, rotate-daily-challenges, process-scheduled-sends, check-quote-expiration, check-lead-sla, sdr-consecutive-alerts, challenge-expiration-alerts, send-alert-notifications, scheduled-reports-runner). Mesmo assim, o job 37 aparece como 'succeeded' em cron-runs.md:183-188. Os outros alvos estão na allowlist.
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Implementado.

### F1250 · Circuit breaker: threshold 5 falhas em 30s e timeout 8-10s

- **Tipo:** Doc/config
- **O que os docs afirmam:** ADR-004: threshold padrão 5 falhas consecutivas em 30s; timeout padrão da chamada 8-10s.
- **Fontes:** `docs/decisions/ADR-004-circuit-breaker-edge.md:16-17`
- **O que falta:** Implementar janela deslizante de 30s (descartar falhas antigas) e zerar o contador em caso de sucesso, ou corrigir docs/decisions/ADR-004-circuit-breaker-edge.md:16 para descrever o comportamento real.
- **Evidência:** supabase/functions/_shared/circuit-breaker.ts:25-31 define DEFAULTS { failureThreshold: 5, resetTimeout: 30_000, timeoutMs: 10_000 }; threshold e timeout conferem com o ADR-004:16-17. Mas não existe janela de 30s: o 30_000 é o resetTimeout (:12 'ms in OPEN before probing HALF_OPEN', usado em :104-106). As falhas acumulam sem janela de tempo (`c.failures += 1`, abre quando `c.failures >= cfg.failureThreshold`) e um sucesso só desconta 1 (`Math.max(0, c.failures - 1)`). Ou seja, não são nem 'consecutivas' nem 'em 30s', como diz o ADR-004:16.
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Implementado.

### F1251 · CLAUDE.md §3-5 cita 150 functions existentes, mas apresenta ai-copilot, check-quote-expiration e send-quote-to-client como vivas (órfãs)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Doc: os 150 nomes existem; migrate-helper corretamente descrito como removido; CLAUDE.md desatualizado quanto às 3 órfãs.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:318-318`
- **O que falta:** Incluir send-quote-to-client e check-quote-expiration na allowlist deploy.yml:144 (ou remover chamador/job) e corrigir mapa-do-sistema.md:14; decidir remover ai-copilot.
- **Evidência:** CLAUDE.md hoje é só `@AGENTS.md`; AGENTS.md:65 e docs/agentes/mapa-do-sistema.md:3,5,40 dizem 171 functions; mapa-do-sistema.md:26 marca `ai-copilot` como órfã (confere: edge-functions.json orfa:true, chamada_pelo_front [] — pasta supabase/functions/ai-copilot ainda existe). `send-quote-to-client` está ligada (edge-functions.json chamada_pelo_front src/components/quotes/QuoteCard.tsx). `check-quote-expiration` listada como viva em mapa-do-sistema.md:14 e agendada no banco (cron.md:43 job 80 via trigger_internal_edge_job), mas `grep -o check-quote-expiration .github/workflows/deploy.yml` → 0 (fora da allowlist ACTIVE :144) — cron chama function não deployada.| cético: Confirmado e agravado: docs/agentes/mapa-do-sistema.md:14 lista `check-quote-expiration` e `send-quote-to-client` como vivas e :26 marca ai-copilot como órfã. As duas primeiras estão FORA da allowlist ACTIVE .github/workflo…

### F1253 · CODEOWNERS com @promo-ops provisionado

- **Tipo:** Doc/config
- **O que os docs afirmam:** P017 P: .github/CODEOWNERS (@promo-ops a provisionar).
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:127`
- **O que falta:** Criar a conta/time @promo-ops com Write no repo ou remover o handle das linhas 8,16-18,21-22.
- **Evidência:** .github/CODEOWNERS:5-8 declara `@promo-ops` como 'conta a provisionar' e o usa em :8,16,17,18,21,22. API GitHub codeowners/errors (chamada nesta sessão) retorna 6 erros 'Unknown owner on line 8/16/17/18/21/22: make sure @promo-ops exists and has write access' — a conta/time não existe.| cético: Confirmado por chamada própria: `gh api repos/adm01-debug/Promo_Champions_V2.1/codeowners/errors` retorna 'Unknown owner on line 8/16/17/18/...: make sure @promo-ops exists and has write access'. .github/CODEOWNERS:5-7 declara '@promo-ops = conta ... a provisionar'; :8,16-18 usam o handle.

### F1255 · CODEOWNERS com times reais (@organizacao, @promo-ops)

- **Tipo:** Doc/config
- **O que os docs afirmam:** PARCIAL: verificar se os 2 novos são times reais.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:416`
- **O que falta:** Provisionar @promo-ops (ou time real) com Write; até lá remover os handles inválidos.
- **Evidência:** .github/CODEOWNERS: `@organizacao/time` aparece só no comentário :38 (exemplo); `@promo-ops` em :8,16-18,21-22. API codeowners/errors → 6× 'Unknown owner @promo-ops'. Único handle válido: @adm01-debug.| cético: Confirmado: API codeowners/errors (chamada nesta sessão) → 'Unknown owner' para @promo-ops nas linhas 8,16,17,18 (e 21,22). Único handle válido em .github/CODEOWNERS é @adm01-debug; não há time `@org/time` em regra ativa.

### F1257 · CODEOWNERS válido (owner @promo-ops inexistente)

- **Tipo:** Doc/config
- **O que os docs afirmam:** .github/CODEOWNERS:8,16-22 tem 6 erros "Unknown owner @promo-ops".
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:30,162`
- **O que falta:** Criar @promo-ops com acesso Write ou removê-lo das linhas 8, 16, 17, 18, 21 e 22; revalidar com GET codeowners/errors → errors: [].
- **Evidência:** .github/CODEOWNERS:1-39 existe, e as regras só com @adm01-debug são válidas; o comentário em :5-7 registra @promo-ops como conta a provisionar. `gh api repos/adm01-debug/Promo_Champions_V2.1/codeowners/errors` (executado nesta sessão) retorna 'Unknown owner' para @promo-ops nas linhas 8, 16, 17, 18, 21 e 22. O critério '0 erros' não é cumprido, mas o artefato existe, então não é NAO_IMPLEMENTADO.
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Não implementado.

### F1262 · config.staging.toml existe

- **Tipo:** Doc/config
- **O que os docs afirmam:** Doc afirma existência de supabase/config.staging.toml, mas staging com dados separados não evidenciado.
- **Fontes:** `docs/auditoria/AUDITORIA_TECNICA_EXAUSTIVA_2026-09-02.md:190,196`
- **O que falta:** Criar projeto Supabase de staging e referenciá-lo, ou remover o arquivo e as menções.
- **Evidência:** supabase/config.staging.toml existe (:1-20: api/db/studio/auth locais, site_url 'https://staging.salespro.com' placeholder). `grep -n 'project_id\\|usyxfpq' supabase/config.staging.toml` → 0 (não aponta para nenhum projeto Supabase); `grep -rn config.staging .github/workflows package.json scripts` → 0 (nada o usa). LEDGER_EXECUCAO_2026-10-14.md:28 lista 'staging' como bloqueado no dono.| cético: Confirmado: supabase/config.staging.toml existe (:1-20) só com portas locais e site_url placeholder 'https://staging.salespro.com' (:15); sem project_id. Nenhum workflow/script o referencia; LEDGER_EXECUCAO_2026-10-14.md:28 lista staging como bloqueado no dono.

### F1267 · Contagem de edge functions no repo (169 §1 vs 173 §4 vs 171 AGENTS.md)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Doc se contradiz na contagem de functions.
- **Fontes:** `docs/DEPLOYMENT.md:15,52-53`
- **O que falta:** Alinhar docs/DEPLOYMENT.md:15 e :52-53 para 171 (ou referenciar AGENTS.md); regenerar docs/API.md com node scripts/gen-api-catalog.mjs.
- **Evidência:** Contagem real: ls -d supabase/functions/*/| wc -l → 172 (171 excluindo _shared). AGENTS.md:65 diz 171 (correto). docs/DEPLOYMENT.md:15 diz 169; docs/DEPLOYMENT.md:52-53 diz 173; docs/API.md:27 diz 169. Allowlist de deploy tem exatamente 100 nomes (.github/workflows/deploy.yml:144, contagem via tr → 100). Lista real de functions deployadas indisponível no snapshot (contexto/supabase/edge-functions.md: 'Management API desabilitada').
- **Revisão:** sem contestação cética concluída.

### F1268 · Contagem de edge functions: 25 → 173 (AGENTS.md diz 171)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Resumo afirma 173 edge functions em 2026-10-18; §31 lista só 25; AGENTS.md diz 171 no repo e plano limita a 100 deployadas.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:992-1021,1715,1738-1740`
- **O que falta:** Corrigir docs/DOCUMENTACAO_SISTEMA.md:1715 e :1738-1740 para 171 no repo / 100 deployadas (allowlist deploy.yml:144); §31 (linhas 992-1021) lista só 25 — atualizar ou apontar para docs/API.md.
- **Evidência:** Diretórios reais: 171 functions em supabase/functions/ (172 incluindo _shared), não 173 como em docs/DOCUMENTACAO_SISTEMA.md:1715 e :1738-1740. Limite de 100 deployadas confirmado em .github/workflows/deploy.yml:140-144 (allowlist ACTIVE com 100 nomes). Lista de deployadas em produção não verificável no snapshot (contexto/supabase/edge-functions.md: Management API desabilitada).
- **Revisão:** sem contestação cética concluída.

### F1269 · Contagem: 173 Edge Functions no repo

- **Tipo:** Doc/config
- **O que os docs afirmam:** Afirma 173 edge functions Deno em supabase/functions/ (AGENTS.md diz 171). Plano limita a 100 deployadas.
- **Fontes:** `docs/FUNCIONALIDADES_COMPLETAS.md:13-13`
- **O que falta:** Corrigir docs/FUNCIONALIDADES_COMPLETAS.md:13 para 171 no repo; para a lista de deployadas, usar a allowlist deploy.yml:144 como fonte.
- **Evidência:** docs/FUNCIONALIDADES_COMPLETAS.md:13 afirma 173; contagem real ls supabase/functions (excl. _shared) → 171. Limite 100 deployadas confirmado por allowlist em .github/workflows/deploy.yml:144 (100 nomes). Snapshot não lista deployadas (contexto/supabase/edge-functions.md).
- **Revisão:** sem contestação cética concluída.

### F1270 · Contagem: 173 edge functions no repo (AGENTS.md diz 171), limite 100 deployadas

- **Tipo:** Doc/config
- **O que os docs afirmam:** Doc afirma 173 edge functions no repo com plano limitando a 100 deployadas; só 100 das 173 deployáveis.
- **Fontes:** `docs/FUNCIONALIDADES_SISTEMA.md:430-430; docs/FUNCIONALIDADES_SISTEMA.md:458-458; docs/FUNCIONALIDADES_SISTEMA.md:559-559`
- **O que falta:** Corrigir as 3 linhas para 171; conferir as 26 functions citadas no doc contra a allowlist deploy.yml:144 (não feito aqui por não estarem enumeradas no item).
- **Evidência:** docs/FUNCIONALIDADES_SISTEMA.md:430, :458, :559 afirmam 173; real = 171 (ls -d supabase/functions/*/ excluindo _shared). Allowlist ACTIVE em .github/workflows/deploy.yml:144 tem exatamente 100 functions (único mecanismo de deploy). Lista real no projeto usyxfpqlsspldubptrdl ausente do snapshot (contexto/supabase/edge-functions.md: 'Management API desabilitada: defina SUPABASE_PROJECT_REF e SUPABASE_ACCESS_TOKEN').
- **Revisão:** sem contestação cética concluída.

### F1272 · Contratos de API OpenAPI/Swagger

- **Tipo:** Doc/config
- **O que os docs afirmam:** Documentação de API com tipos estritos.
- **Fontes:** `docs/ENGINEERING_MANIFESTO.md:21`
- **O que falta:** Adicionar script 'docs:api' no package.json e passo em .github/workflows (ex.: contexto.yml) que regenere docs/API.md; se quiser OpenAPI real, gerar openapi.yaml a partir do PostgREST (/rest/v1/) ou do catálogo.
- **Evidência:** Não há OpenAPI/Swagger: ls openapi* → inexistente; grep -rniE 'openapi\|swagger' só em docs e vercel.json. Existe catálogo gerado: docs/API.md (800 linhas, cabeçalho :3-4 'gerado por scripts/gen-api-catalog.mjs') e scripts/gen-api-catalog.mjs:1-20 (lê supabase/functions, migrations, AppRoutes.tsx, config.toml). Catálogo desatualizado (docs/API.md:27 'Total: 169 functions' vs 171 no repo). ausente: grep -n 'gen-api\|api-catalog' package.json .github/workflows/*.yml → 0 resultados (não automatizado).
- **Revisão:** sem contestação cética concluída.

### F1273 · Convenção de branch hotfix/<slug> (conflita com claude/<tipo>-<slug> do AGENTS.md)

- **Tipo:** Doc/config
- **O que os docs afirmam:** HOTFIX.md prescreve hotfix/_; AGENTS.md prescreve claude/fix-_.
- **Fontes:** `docs/HOTFIX.md:7-11`
- **O que falta:** Atualizar docs/HOTFIX.md:9 e :32 para 'claude/fix-<slug>-<AAMMDD-HHMM>' (ou registrar em AGENTS.md §5.4 que hotfix/* é aceito).
- **Evidência:** docs/HOTFIX.md:9 'git checkout -b hotfix/<descricao-curta>' e :32 'PR hotfix/* → main'; AGENTS.md §5 item 4 prescreve 'claude/<tipo>-<slug>-<AAMMDD-HHMM>' e o cabeçalho de AGENTS.md declara que ele vence docs/ em caso de contradição (resolve operacionalmente, mas HOTFIX.md não foi atualizado). ausente: grep -n hotfix AGENTS.md docs/agentes/github-ci.md → 0 resultados.
- **Revisão:** sem contestação cética concluída.

### F1274 · Convenção: comentário descritivo em pt-BR no topo de cada migration

- **Tipo:** Doc/config
- **O que os docs afirmam:** Cada migration deve começar com comentário descritivo em pt-BR. Regra mecânica — NÃO verificada.
- **Fontes:** `docs/SCHEMA_CONVENTIONS.md:47`
- **O que falta:** Adicionar regra em scripts/check-migrations.mjs (só para arquivos novos via --base) exigindo que a primeira linha não vazia comece com '--'.
- **Evidência:** Regra em docs/SCHEMA_CONVENTIONS.md:47. De 700 migrations, 518 começam com comentário e 182 não (todas históricas, até 2026-05, ex.: supabase/migrations/20260323120713__.sql começa em 'CREATE TABLE public.query_telemetry'); todas as migrations 202610_/202611* começam com comentário (loop por primeira linha não vazia → 0 violações). Gate não verifica: scripts/check-migrations.mjs:4-17 só valida nome, versão única, não vazia, versão crescente, RLS em CREATE TABLE e literais proibidos.
- **Revisão:** sem contestação cética concluída.

### F1276 · Convenção: migrations idempotentes (IF NOT EXISTS, DROP IF EXISTS, ON CONFLICT DO NOTHING, guards)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Migrations devem ser idempotentes com IF NOT EXISTS, DROP ... IF EXISTS, ON CONFLICT DO NOTHING, to_regclass/EXCEPTION WHEN. Regra mecânica parcial — NÃO verificada.
- **Fontes:** `docs/SCHEMA_CONVENTIONS.md:49-50`
- **O que falta:** Nas próximas migrations usar DROP POLICY IF EXISTS antes de CREATE POLICY; adicionar aviso em scripts/check-migrations.mjs para CREATE POLICY/INDEX/TABLE sem guard em arquivos novos.
- **Evidência:** Regra em docs/SCHEMA_CONVENTIONS.md:49-50. CREATE TABLE sem IF NOT EXISTS em migrations 202609+ → 0 resultados. Porém CREATE POLICY sem guard (sem DROP POLICY IF EXISTS, sem DO $$/pg_policies) em migrations recentes: supabase/migrations/20261005170000_quote_items_owner_write_policy.sql:7 (3 policies), 20261013153000_integration_secret_refs.sql:39 (4), 20261027120100_edge_job_lock_lease.sql:25 (1), 20261112134500_rls_deny_all_daily_challenge_rotations_geocode_cache.sql:12 (2) — reaplicação falha com 'policy already exists'. scripts/check-migrations.mjs não valida idempotência (:4-17).
- **Revisão:** sem contestação cética concluída.

### F1277 · Corpo da PR com etapas, evidência, autorização, rollout e rollback (.github/pull_request_template.md)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Corpo da PR deve incluir etapas cobertas, problema/evidência, escopo, objetos alterados, autorização, risco, testes, evidência antes/depois, migration/lock, rollout/rollback, pendências.
- **Fontes:** `docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:130-144`
- **O que falta:** Adicionar ao template seções 'Autorização', 'Risco/Rollout/Rollback' e 'Pendências' se o plano de docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:130-144 ainda for desejado; caso contrário marcar o plano como superado.
- **Evidência:** .github/pull_request_template.md contém: Descrição (:1), Tipo de Mudança (:9-18), Checklist (:20-26), '## 🗄️ Evidência Pós-Aplicação' obrigatória para supabase/migrations/** e supabase/functions/** com bloco 'comando/consulta / saída literal / server_time: (SELECT now();)' (:28-47), Checklist de Segurança (:49-55), Como Testar (:69-74). Ausentes: seções de autorização, risco, rollout/rollback, migration/lock e pendências (grep -ni 'rollback\|rollout\|autoriza\|pendênc' no template → 0 resultados).
- **Revisão:** sem contestação cética concluída.

### F1280 · Critério de fechamento do postmortem (25 jobs ativos, zero ref antigo, falha <1%, alerta ≤15 min)

- **Tipo:** Doc/config
- **O que os docs afirmam:** NÃO INICIADO: 6 migrations contêm rapjswienfhkobhlamxb.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:369`
- **O que falta:** Registrar o fechamento no postmortem (docs/postmortems/) com as evidências do snapshot (45 jobs ativos, 0 ref antigo, 0 falhas/127, alerta ≤15 min) e atualizar C_estado_runbooks.md:369.
- **Evidência:** Snapshot prod: contexto/supabase/cron.md → 45 jobs, 45 ativos (≥25); ref antigo: grep -rl rapjswienfhkobhlamxb contexto/supabase/ → 0 resultados (zero no banco; os 6 arquivos em supabase/migrations/ são histórico: 20260512214007, 20260726202421, 20260726202545, 20260903000002, 20260913150000, 20261001160000); falhas: cron-runs.md 127 execuções 'succeeded', 0 'failed' em 7 dias (<1%); alerta: job 17 detect-stalled-cron-15min ('*/15 * * * _') e job 38 cron-failure-alerter-10min ('_/10') em cron.md. Critérios técnicos atendidos, mas o fechamento não foi registrado: docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:369 continua 'NÃO INICIADO' e grep -rni 'fechamento\|encerrad' docs/postmortems/ → 0 resultados.
- **Revisão:** sem contestação cética concluída.

### F1281 · CSP como header HTTP no hosting (hoje só meta tag em index.html)

- **Tipo:** Doc/config
- **O que os docs afirmam:** CSP vive em <meta http-equiv> no index.html; recomenda espelhar como header.
- **Fontes:** `docs/SECURITY_HEADERS.md:25`
- **O que falta:** Em vercel.json:23 expandir o valor do header para a mesma política de index.html:56 acrescida de frame-ancestors 'self'; confirmar com curl -I no domínio de produção.
- **Evidência:** Meta tag existe: index.html:56 '<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; ...">'. Header no hosting existe mas não espelha a política: vercel.json:22-23 '"key": "Content-Security-Policy", "value": "frame-ancestors 'self'"' (apenas frame-ancestors). Header servido em produção não verificável: curl -sI https://promo-champions-v2-1.vercel.app/ → 403 do proxy do agente.
- **Revisão:** sem contestação cética concluída.

### F1282 · D12: Lighthouse publica em temporary-public-storage e .lighthouserc.json define url e staticDistDir juntos

- **Tipo:** Doc/config
- **O que os docs afirmam:** Relatório público e config conflitante.
- **Fontes:** `docs/estado/PLANO_CI_WORKFLOWS_2026-10-01.md:21,100-101`
- **O que falta:** Em .lighthouserc.json remover 'url' (manter só staticDistDir) e trocar upload.target para 'filesystem' (ou remover upload, já que uploadArtifacts: true cobre).
- **Evidência:** .lighthouserc.json:4-5 ainda define 'url: ["http://localhost:5173"]' e 'staticDistDir: "./dist"' juntos; .lighthouserc.json:23-25 'upload.target: temporary-public-storage' (relatório público permanece). .github/workflows/pr-checks.yml:630-634 adicionou 'uploadArtifacts: true' (artifact no GitHub) e o job lighthouse foi retirado do notify-failure (:728-732). docs/estado/PLANO_CI_WORKFLOWS_2026-10-01.md:21 (D12) continua descrevendo o estado atual.
- **Revisão:** sem contestação cética concluída.

### F1283 · D8: ruleset main-protection com 3 required checks (Lint, Unit, Build), strict=false, 0 aprovações

- **Tipo:** Doc/config
- **O que os docs afirmam:** Ruleset 22148182 permite PR desatualizada entrar e quebrar main.
- **Fontes:** `docs/estado/PLANO_CI_WORKFLOWS_2026-10-01.md:17`
- **O que falta:** Decisão do dono: ativar strict_required_status_checks_policy=true no ruleset 22148182 (exige branch atualizada antes do merge) — custo: rebase a cada merge concorrente; atualizar o D8 no doc para refletir 'CI Gate'.
- **Evidência:** GET repos/adm01-debug/Promo_Champions_V2.1/rulesets/22148182 (2026-11-20): name 'main-protection', enforcement active, required_status_checks = [{context: 'CI Gate'}] (não mais 3 checks Lint/Unit/Build), strict_required_status_checks_policy=false, required_approving_review_count=0, require_code_owner_review=false, bypass_actors=[], updated_at 2026-11-06. Risco descrito em docs/estado/PLANO_CI_WORKFLOWS_2026-10-01.md:17 (PR desatualizada entrar) persiste porque strict=false.
- **Revisão:** sem contestação cética concluída.

### F1302 · Dependência de stack: React 18

- **Tipo:** Doc/config
- **O que os docs afirmam:** Tabela de stack técnico declara uso de React 18.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:133-157`
- **O que falta:** Atualizar docs/DOCUMENTACAO_SISTEMA.md:136 para 'React 19'.
- **Evidência:** React está instalado e em uso: package.json:133 `react ^19.3.1`, :135 `react-dom ^19.3.1` (lock 19.3.1); src/main.tsx:1 e src/App.tsx:1 `import React from 'react'`. Porém o major declarado na doc (docs/DOCUMENTACAO_SISTEMA.md:136 'React 18') diverge do real (19) desde d620c119e (2026-11-14, #398, grupo react-core).| cético: O critério exige a major declarada. docs/DOCUMENTACAO_SISTEMA.md:136 diz 'React 18', mas package.json:133 tem `react ^19.3.1` (lock 19.3.1) e :135 `react-dom ^19.3.1`. React existe e é usado, mas a major diverge.

### F1304 · Dependência de stack: React Router DOM v6

- **Tipo:** Doc/config
- **O que os docs afirmam:** Tabela de stack técnico declara uso de React Router DOM v6.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:133-157`
- **O que falta:** Atualizar docs/DOCUMENTACAO_SISTEMA.md:144 para 'React Router DOM v7'.
- **Evidência:** react-router-dom instalado e em uso: package.json:142 `react-router-dom ^7.18.5` (lock 7.18.5); import em 126 arquivos, ex. src/components/admin/AdminQuickLinks.tsx:27 e rotas em src/routes/AppRoutes.tsx. Porém o major declarado na doc (docs/DOCUMENTACAO_SISTEMA.md:144 'React Router DOM v6') diverge do real (v7).| cético: docs/DOCUMENTACAO_SISTEMA.md:144 diz 'React Router DOM v6', mas package.json:142 tem `react-router-dom ^7.18.5` (lock 7.18.5). Pelo critério da major declarada, a versão diverge.

### F1314 · Deploy das edge functions do escopo não verificado

- **Tipo:** Doc/config
- **O que os docs afirmam:** Acesso da auditoria foi só SELECT; existência de `supabase/functions/<nome>/index.ts` prova código, não deploy. Plano limita 100 funções deployadas.
- **Fontes:** `docs/estado/07_DOMINIO_WINLOSS_COMPETITIVE.md:366-369`
- **O que falta:** As 5 functions winloss-webhook-* (dispatcher, health-monitor, replay, replay-batch, timeline) estão fora de deploy.yml:144 e não rodam em produção pelo pipeline. Não consegui confirmar se houve deploy manual: falta acesso à Management API do projeto usyxfpqlsspldubptrdl.
- **Evidência:** Das 9 functions citadas em docs/estado/07_DOMINIO_WINLOSS_COMPETITIVE.md, 4 estão na allowlist ACTIVE (.github/workflows/deploy.yml:144): deal-probability, detect-winloss-at-risk, export-winloss-pdf, pricing-intelligence (também analyze-win-loss e mine-win-loss-patterns). Deploy real confirmado no log do run Deploy Pipeline 44617990881 (2026-11-19, success): 'Deployed Functions on project usyxfpqlsspldubptrdl: deal-probability / detect-winloss-at-risk / export-winloss-pdf / pricing-intelligence' (100 confirmações no total). FORA da allowlist (não deployadas pelo pipeline, apesar de existirem em supabase/functions/): winloss-webhook-dispatcher, winloss-webhook-health-monitor, winloss-webhook-replay, winloss-webhook-replay-batch, winloss-webhook-timeline (deploy.yml:144 não as lista). Snapshot do banco não cobre: contexto/supabase/edge-functions.md:3 'Management API desabilitada'; os MCPs…

### F1316 · Deploy frontend na Vercel (projeto `promo-champions-v2-1`); domínio Lovable legado não é produção

- **Tipo:** Doc/config
- **O que os docs afirmam:** ARCHITECTURE afirma deploy na Vercel (projeto promo-champions-v2-1), build Vite SPA estática; domínio Lovable legado não é produção (2026-10-18).
- **Fontes:** `docs/ARCHITECTURE.md:17-17`
- **O que falta:** Atualizar docs/decisions/ADR-009-session-storage-e-csp.md:81 e :98 para Vercel, já que os headers estão em vercel.json.
- **Evidência:** vercel.json:3-8 rewrites SPA para /index.html + headers de segurança (linhas 9-56); docs/agentes/vercel-deploy.md:7-13 (projeto promo-champions-v2-1, deploy automático Vercel↔GitHub); docs/DEPLOYMENT.md:3-7 e 19-24; status check do commit HEAD de main 90170947 via `gh api .../commits/main/status` → contexto 'Vercel' state=success 'Deployment has completed' target vercel.com/juca1/promo-champions-v2-1/KdcLcf13…; index.html sem 'lovable' (grep -i lovable index.html → 0). Porém docs/decisions/ADR-009-session-storage-e-csp.md:81 e :98 ainda citam 'hosting (Lovable Cloud)' como plataforma de headers.| cético: Confirmado: vercel.json:1-8 tem os rewrites de SPA; docs/ARCHITECTURE.md:17 diz Vercel; o status check Vercel do main atual (4dbfb77c68, via gh api .../commits/main/status) é success 'Deployment has completed'. O resíduo continua: docs/decisions/ADR-009-session-storage-e-csp.md:81 ('dep…

### F1319 · Deploy real das edge functions de IA

- **Tipo:** Doc/config
- **O que os docs afirmam:** Não verificado estado de deploy no projeto (exige Management API).
- **Fontes:** `docs/estado/06_DOMINIO_IA_COACHING.md:308`
- **O que falta:** Liberar vagas no limite de 100 e incluir na allowlist (deploy.yml:144) as functions de IA que o front chama (ai-copilot, nlq-query, semantic-search-universal, snapshot-forecast, compute-forecast-accuracy), ou remover os chamadores.
- **Evidência:** Allowlist deploy.yml:144 (100 functions) confrontada com as functions dos grupos 'Coaching' (docs/API.md:104-116) e 'IA / Forecast' (docs/API.md:158-188): 15 fora da allowlist → coaching-impact-summary, generate-loss-coaching, salesperson-coaching, ai-agent-orchestrator, ai-copilot, compute-forecast-accuracy, generate-revenue-forecast, nlq-query, predict-quota-attainment, purchase-intelligence-forecast, semantic-coverage, semantic-index-entity, semantic-reindex-batch, semantic-search-universal, snapshot-forecast. Inventário real via Management API (inventario/estado/banco.json, medido_em 2026-11-12): `edge_functions.publicadas` = 100 (linha 704) e `no_repo_sem_deploy` = 71 (linha 631) incluindo ai-copilot, nlq-query, generate-revenue-forecast, snapshot-forecast, semantic-search-universal; alerta `edge_limite_do_plano` '100 publicadas de 100 permitidas' (banco.json:98-101). As demais do …

### F1320 · Deploy real das edge functions do domínio analytics

- **Tipo:** Doc/config
- **O que os docs afirmam:** Não verificado se funções estão deployadas e em qual versão (functions_list exigia token sbp_).
- **Fontes:** `docs/estado/04_DOMINIO_ANALYTICS_BI.md:436-440`
- **O que falta:** Liberar vagas e incluir na allowlist as functions de analytics com chamador no front (generate-revenue-forecast, report-builder-execute, nlq-query), ou remover os chamadores e documentar em docs/API.md.
- **Evidência:** Functions do domínio analytics listadas em docs/estado/04_DOMINIO_ANALYTICS_BI.md:401-421 confrontadas com a allowlist deploy.yml:144: 11 fora → generate-revenue-forecast, snapshot-forecast, compute-forecast-accuracy, predict-quota-attainment, report-builder-execute, scheduled-report-trigger, scheduled-reports-runner, nlq-query, analyze-pipeline-coverage, recompute-stage-baselines, refresh-stage-baselines. Confirmado pelo inventário real (inventario/estado/banco.json, Management API, medido_em 2026-11-12): `no_repo_sem_deploy` (linha 631) contém generate-revenue-forecast, snapshot-forecast, nlq-query, predict-quota-attainment; `publicadas` (linha 704) traz versão/atualizada_em de cada uma das 100 ativas (ex.: revenue-forecast-ai v6 2026-10-05, revops-hub v6, pipeline-pulse-aggregator v6, demand-forecast v6, territory-optimization v6, report-embed-public v6).| cético: Confirmado com a al…

### F1324 · Diretório docs/auditoria/ criado com contrato de achado

- **Tipo:** Doc/config
- **O que os docs afirmam:** Etapa 6: definir contrato de achado (severidade, local, impacto, evidência) e criar diretório docs/auditoria/.
- **Fontes:** `docs/auditoria/00_PLANO_MESTRE_AUDITORIA.md:81`
- **O que falta:** Formalizar o contrato de achado (campos obrigatórios: severidade, local, impacto, evidência) em uma seção ou arquivo de docs/auditoria/. Depois, preencher o campo Evidência nos cerca de 120 achados de docs/auditoria/RELATORIO_FALHAS.md que não o têm, ou declarar no contrato que o Local (arquivo:linha) vale como evidência. Faltam também Impacto em 7 achados e Descrição em 11.
- **Evidência:** O diretório docs/auditoria/ existe (ls: 18 arquivos + funcionalidades-pendentes-2026-10-12). A etapa está em docs/auditoria/00_PLANO_MESTRE_AUDITORIA.md:81 ('Definir contrato de achado (severidade, local, impacto, evidência)'). Porém o contrato não está formalizado: o cabeçalho de docs/auditoria/RELATORIO_FALHAS.md:1-6 traz só a legenda de severidade e 'CWE/OWASP citados quando aplicável'. A busca `grep -rn -i 'contrato de achado' docs` só encontra o próprio plano (00_PLANO_MESTRE_AUDITORIA.md:81). Os achados também não seguem o contrato de forma uniforme. Contagem em RELATORIO_FALHAS.md: 129 '### ' (128 achados), 128 '- **Local', 121 '- **Impacto', 117 '- **Descrição', 54 '- **CWE' e apenas 8 '- **Evidência' (ex.: linhas 21, 75, 132). Exemplo: o achado de RELATORIO_FALHAS.md:23-27 tem Local, CWE, Descrição e Impacto, mas não tem Evidência. O exemplo 16-21 do veredito inicial é uma das …
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Implementado.

### F1327 · DOC-01: remover TEST_QUALITY_REPORT.md duplicado na raiz

- **Tipo:** Doc/config
- **O que os docs afirmam:** TEST_QUALITY_REPORT.md na raiz duplica docs/reports/TEST_QUALITY_REPORT.md; plano: manter só o de docs/reports.
- **Fontes:** `docs/reports/AUDIT_2026-07-13.md:47-59`
- **O que falta:** Mover TEST_QUALITY_REPORT.md para docs/reports/, atualizando os links, ou registrar em docs/reports/AUDIT_2026-07-13.md:47,59 que o canônico ficou na raiz.
- **Evidência:** Duplicidade resolvida, mas no sentido inverso ao plano: `find . -name 'TEST_QUALITY_REPORT*'` → só ./TEST_QUALITY_REPORT.md (raiz, medição 2026-09-02, linhas 1-5); docs/reports/ não tem TEST_QUALITY_REPORT.md (ls docs/reports). Commit a24228771 removeu docs/reports/TEST_QUALITY_REPORT.md (44 linhas) e manteve o da raiz; plano em docs/reports/AUDIT_2026-07-13.md:47 e :59 mandava remover o da raiz e manter em docs/reports/.| cético: git ls-files → só TEST_QUALITY_REPORT.md na raiz. `git show --stat a24228771` mostra 'docs/reports/TEST_QUALITY_REPORT.md \| 44 -', ou seja, removeu justamente a cópia que o plano mandava manter. O plano dizia o contrário: docs/reports/AUDIT_2026-07-13.md:47 (DOC-01) e :59 ('remover TEST_QUALITY_REPORT.md raiz; regenerar único em docs/reports/'). A duplicidade acabou, mas no local invertido.

### F1329 · docs/API.md gerado por gen-api-catalog.mjs com hash de deploy

- **Tipo:** Doc/config
- **O que os docs afirmam:** P013 P: docs/API.md gerado; falta hash/data de deploy por função.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:123`
- **O que falta:** Fazer scripts/gen-api-catalog.mjs ler inventario/estado/banco.json (edge_functions.publicadas[].versao/atualizada_em) e emitir versão e data por function (ou 'não publicada'); depois regerar docs/API.md.
- **Evidência:** scripts/gen-api-catalog.mjs existe (14 KB) e docs/API.md:1-4 declara ser gerado por ele; tabelas por function trazem Auth/Método/Payload/Resposta (docs/API.md:31-45) mas nenhuma coluna de hash ou data de deploy: `grep -n -i 'hash\|deployada em\|deploy:' docs/API.md` → 0; `grep -n -i 'hash\|sha\|date\|deploy' scripts/gen-api-catalog.mjs` só retorna regex de assinatura HMAC (linha 60), nada de versão/deploy. A informação de versão/data por function existe fora do catálogo, em inventario/estado/banco.json `edge_functions.publicadas[].versao/atualizada_em` (linha 704).| cético: docs/API.md:1-4 declara que é gerado por scripts/gen-api-catalog.mjs. `grep -n -i -E 'hash\|vers[aã]o\|atualizada\|deploy' docs/API.md` → 0 resultados. `grep -n -i -E 'hash\|banco.json\|versao\|deploy' scripts/gen-api-catalog.mjs` → 0 resultados. O catálogo não tem hash nem data de deploy por function.

### F1331 · docs/estado/README.md consolida docs

- **Tipo:** Doc/config
- **O que os docs afirmam:** P090 P.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:180`
- **O que falta:** Atualizar o cabeçalho de docs/estado/ESTADO_ATUAL.md:3-4 e docs/estado/README.md:3 (projeto usyxfpqlsspldubptrdl e nova medição) ou marcá-los como histórico de 2026-08-16.
- **Evidência:** docs/estado/README.md:1-30 existe e consolida os 14 lotes (tabela linhas 9-24) apontando para ESTADO_ATUAL.md; porém docs/estado/ESTADO_ATUAL.md:3-4 continua com 'Medição: 2026-08-16' e 'Banco de produção rapjswienfhkobhlamxb' — projeto diferente do oficial usyxfpqlsspldubptrdl (AGENTS.md §7) — e docs/estado/README.md:3 também fixa medição 2026-08-16; nenhum dos dois reflete o estado pós-migração (deploy Vercel 2026-10-18, allowlist de 100 functions, 700 migrations).| cético: docs/estado/README.md existe e consolida os lotes, mas docs/estado/README.md:3 ('Medição: **2026-08-16**') e docs/estado/ESTADO_ATUAL.md:3-4 ('Medição: **2026-08-16**. Banco de produção `rapjswienfhkobhlamxb`') estão desatualizados e apontam projeto diferente do oficial usyxfpqlsspldubptrdl (AGENTS.md §7).

### F1336 · Documentação única do frontend de produção (Vercel vs Lovable)

- **Tipo:** Doc/config
- **O que os docs afirmam:** CLAUDE.md §2 diz Vercel; docs/DEPLOYMENT.md:11-23 e deploy.yml mandam Publish no Lovable.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:172`
- **O que falta:** Remover a seção 'Discrepância conhecida' de docs/agentes/vercel-deploy.md:33-40 e corrigir docs/HOTFIX.md:10,34-35.
- **Evidência:** docs/DEPLOYMENT.md:3-7,11-16,19-24 → Vercel; .github/workflows/deploy.yml:24-26 e 170-176 → Vercel (corrigido no commit 893c3ca6e, PR #512, 16/11/2026); AGENTS.md:§6 → Vercel. Mas a documentação ainda não é única: docs/agentes/vercel-deploy.md:30-36 ('Discrepância conhecida') afirma que deploy.yml 'descreve o deploy do frontend como Lovable Cloud' — texto desatualizado após #512; e docs/HOTFIX.md:10,34-35 ainda manda 'Publish no Lovable'. Claim do auditor sobre ssoProtection/domínio custom na Vercel (G_infra_ci_integracoes.md:172-173) não verificável sem acesso ao painel Vercel.| cético: deploy.yml:24-25 e :170-176 já descrevem Vercel. Mas docs/agentes/vercel-deploy.md:33-40 ('Discrepância conhecida') ainda afirma que deploy.yml 'descreve o deploy do frontend como "Lovable Cloud"' (:35), o que já é falso, e docs/HOTFIX.md:10 e :34-35 ainda mandam publicar no Lovable. A documentação aind…

### F1339 · Drift de docs: AGENTS.md "privado", CLAUDE.md projeto errado, README.md repo antigo sem deploy, thresholds errados em CONTRIBUTING/CHANGELOG, SECURITY.md:113 e…

- **Tipo:** Doc/config
- **O que os docs afirmam:** Doc lista contradições: AGENTS.md:13 diz privado; CLAUDE.md aponta rapjswienfhkobhlamxb; README.md:15 repo antigo e sem deploy; CONTRIBUTING.md:44 e CHANGELOG.md:26 citam 70/60 vs 85/75; SECURITY.md:113 recomenda env não usada.
- **Fontes:** `docs/auditoria/AUDITORIA_TECNICA_EXAUSTIVA_2026-09-02.md:176,183`
- **O que falta:** Corrigir CONTRIBUTING.md:44 com os thresholds reais de vitest.config.ts:65-69; trocar SECURITY.md:134 por VITE_SUPABASE_PUBLISHABLE_KEY; adicionar seção Deploy (Vercel) no README.md; anotar CHANGELOG.md:214 como histórico.
- **Evidência:** Corrigidos: AGENTS.md:20 e :54 dizem 'repo **público**' (grep privado → 0); CLAUDE.md contém só '@AGENTS.md' e AGENTS.md:§7 aponta usyxfpqlsspldubptrdl (grep rapjswienfhkobhlamxb em AGENTS/CLAUDE/README/CONTRIBUTING/SECURITY/CHANGELOG → 0); README.md:15 clona adm01-debug/Promo_Champions_V2.1 (repo correto). Pendentes: README.md não tem seção de deploy (headings :5,38,51,62,84,117,123; único 'deploy' é link para DEPLOYMENT.md §3 em :34); CONTRIBUTING.md:44 diz '85% linhas / 75% branches' mas vitest.config.ts:65-70 fixa thresholds lines 2.5 / branches 2.5 / functions 2.0 / statements 2.5; CHANGELOG.md:214 ainda diz '70% lines, 60% branches' (entrada histórica); SECURITY.md:133-134 recomenda `VITE_SUPABASE_ANON_KEY` enquanto a variável primária é `VITE_SUPABASE_PUBLISHABLE_KEY` (src/integrations/supabase/env.ts:10; ANON_KEY só como fallback em env.ts:11).| cético: Corrigidos: `grep -n -i -…

### F1340 · Drift de funções/views/policies declaradas × vivas não medido

- **Tipo:** Doc/config
- **O que os docs afirmam:** Comparação repo×banco feita só para tabelas; 281 funções e 1.019 policies não comparadas com as 584 migrations.
- **Fontes:** `docs/estado/11_DADOS_BANCO.md:673-673`
- **O que falta:** Script (ex.: scripts/db-audit/check-catalog-drift.mjs) que extraia todos os CREATE FUNCTION/POLICY/VIEW de supabase/migrations/*.sql, consulte pg_proc/pg_policies/pg_views via SUPABASE_DB_URL e liste divergências nos dois sentidos; publicar o resultado no snapshot docs/contexto/supabase.
- **Evidência:** scripts/db-audit/gen-migration-probes.mjs:8-12 gera sondas de existência (function, policy, trigger, cron, índice) por migration; .github/workflows/db-probe.yml:3-19 roda essas sondas read-only, mas só para migrations com versão >= since_version (workflow_dispatch) e só existência, não corpo/definição. scripts/inventario/banco.sql:35-42,76-77 só conta policies/funções vivas. docs/estado/11_DADOS_BANCO.md:670 registra drift medido apenas para tabelas. ausente: grep -rln 'pg_policies\|pg_proc' scripts/ .github/workflows/ → só os 3 arquivos acima; nenhum compara o conjunto completo de CREATE FUNCTION/CREATE POLICY das 584 migrations com o catálogo vivo.
- **Revisão:** sem contestação cética concluída.

### F1342 · Env vars do frontend VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY com fallback público em env.ts (env vazia mata o boot)

- **Tipo:** Doc/config
- **O que os docs afirmam:** env.ts tem fallback, mas env vazia (não ausente) sobrescreve e o app morre (incidente 2026-10-12).
- **Fontes:** `docs/agentes/vercel-deploy.md:15`
- **O que falta:** Em env.ts tratar string vazia como ausente (ex.: `const v = import.meta.env.VITE_SUPABASE_URL?.trim(); export const SUPABASE_URL = v|\| 'https://usyxfpqlsspldubptrdl.supabase.co'`), ou confirmar no painel Vercel que nenhuma VITE_* está vazia.
- **Evidência:** src/integrations/supabase/env.ts:4-5 e 9-12 usam `??` (nullish) — string vazia NÃO cai no fallback, confirmando o risco descrito em docs/agentes/vercel-deploy.md:15 e docs/DEPLOYMENT.md:29-30. ausente: grep 'trim()\|==='\'' src/integrations/supabase/env.ts src/integrations/supabase/client.ts → 0 resultados. Painel Vercel não acessível nesta sessão (docs/agentes/vercel-deploy.md:18-21: MCP Vercel sem acesso ao projeto).
- **Revisão:** sem contestação cética concluída.

### F1347 · Estado de deploy das edge functions: deployed.txt vs 170 no repo; twilio-call-* fora do config.toml

- **Tipo:** Doc/config
- **O que os docs afirmam:** Doc aponta deployed.txt (10 nomes) sem procedência e twilio-call-status/twilio-call-twiml ausentes de supabase/config.toml (verify_jwt indeterminado).
- **Fontes:** `docs/auditoria/AUDITORIA_TECNICA_EXAUSTIVA_2026-09-02.md:288,502-509,588`
- **O que falta:** Decidir se twilio-call-status/twilio-call-twiml devem rodar em produção; se sim, incluir na allowlist ACTIVE de deploy.yml:144 (removendo outra para manter 100) e registrar em docs/DEPLOYMENT.md §4; confirmar com `supabase functions list --project-ref usyxfpqlsspldubptrdl`.
- **Evidência:** Resolvido: supabase/config.toml:79-83 declara [functions.twilio-call-status] e [functions.twilio-call-twiml] com verify_jwt = false. deployed.txt foi removido deliberadamente no commit a24228771 (2026-09-03, 'remove artefatos mortos', `deployed.txt| 10 -`). Lista de deploy hoje = allowlist ACTIVE em .github/workflows/deploy.yml:144 (100 functions). Pendente: grep 'twilio' na allowlist deploy.yml:144 → 0 resultados — twilio-call-status/twiml não são deployadas em produção; reconciliação com `supabase functions list` não verificável (sem acesso CLI/MCP ao projeto usyxfpqlsspldubptrdl).
- **Revisão:** sem contestação cética concluída.

### F1352 · Etapa 01 (Graphify): Fixar baseline e preservar o trabalho existente

- **Tipo:** Doc/config
- **O que os docs afirmam:** Registrar HEAD, origin/main, worktrees, versões e arquivos Graphify; baseline em docs/graphify/.
- **Fontes:** `docs/planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md:73-78`
- **O que falta:** Completar o baseline com origin/main, worktrees e versões das ferramentas, e adicionar script (ex.: scripts/graphify/baseline.mjs) que reproduza as contagens em clone limpo.
- **Evidência:** docs/graphify/BASELINE_AST_SRC_2026-09-11.md:1-20 registra commit 2dfd57b30bd7de9d73f950e1885e2357dc59d4c3, graphifyy 0.9.48, flags e contagens; docs/graphify/README.md:5-13 comandos reproduzíveis. ausente: grep -i 'origin/main\|worktree' docs/graphify/BASELINE_AST_SRC_2026-09-11.md docs/graphify/README.md → 0 resultados. docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:135 classifica Etapa 01 como PARCIAL: 'falta baseline automatizada e reproduzível em clone limpo'.
- **Revisão:** sem contestação cética concluída.

### F1357 · Etapa 02 (Graphify): Mapear domínios e inventariar a integração existente

- **Tipo:** Doc/config
- **O que os docs afirmam:** Particionar CRM, SDR, analytics, gamificação, IA, admin e infra por caminhos reais; inventário de integrações.
- **Fontes:** `docs/planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md:80-85`
- **O que falta:** Criar docs/graphify/MAPA_DOMINIOS.md classificando cada diretório de src/, supabase/functions e scripts em CRM/SDR/analytics/gamificação/IA/admin/infra com exclusões justificadas e inventário de integrações.
- **Evidência:** docs/graphify/README.md:16 seção 'Extração estrutural por domínio' (comando por escopo); docs/graphify/EXECUCAO_LOTE_A_2026-09-11.md:50 'Ainda falta dividir src/components em lotes... baseline por domínio'; docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:136 Etapa 02 = PARCIAL: 'falta classificação de cada entrada elegível, responsáveis e exclusões justificadas'. ausente: grep -i 'mapa de dom' docs/graphify/*.md → 0 resultados.
- **Revisão:** sem contestação cética concluída.

### F1363 · Etapa 030 (CI): Exigir 1 aprovação e dismiss_stale_reviews_on_push ou registrar decisão de manter 0

- **Tipo:** Doc/config
- **O que os docs afirmam:** Decisão de governança.
- **Fontes:** `docs/execucao/PLANO_WORKFLOWS_GITHUB_ACTIONS_100_ETAPAS_2026-09-27.md:99`
- **O que falta:** Registrar em docs/agentes/github-ci.md (seção do ruleset) a decisão explícita 'manter 0 aprovações porque o fluxo é 1 dono + agentes; CI Gate é o gate' — ou configurar 1 aprovação + dismiss_stale_reviews_on_push no ruleset.
- **Evidência:** Ruleset main-protection (API 20/11/2026) pull_request: required_approving_review_count=0, dismiss_stale_reviews_on_push=false. Decisão de manter 0 está implícita: docs/agentes/github-ci.md:24 registra '0 aprovações exigidas' e AGENTS.md §5.7 instrui 'Mergeie sem aprovação PR sua... pronta'; porém nenhum documento registra a decisão com o porquê conforme pedido em docs/execucao/PLANO_WORKFLOWS_GITHUB_ACTIONS_100_ETAPAS_2026-09-27.md:99.
- **Revisão:** sem contestação cética concluída.

### F1365 · Etapa 037 (CI): Pinar Python 3.12 em tools/graphify/.python-version e setup-uv

- **Tipo:** Doc/config
- **O que os docs afirmam:** python-version passado ao setup-uv.
- **Fontes:** `docs/execucao/PLANO_WORKFLOWS_GITHUB_ACTIONS_100_ETAPAS_2026-09-27.md:106`
- **O que falta:** Criar tools/graphify/.python-version com `3.12` para o pin valer também localmente (uv lê o arquivo); o pin no CI já existe.
- **Evidência:** .github/workflows/graphify.yml:44-46 (`astral-sh/setup-uv` com `python-version: "3.12"`); tools/graphify/pyproject.toml:5 (`requires-python = ">=3.10,<3.13"`); ausente: `ls tools/graphify/.python-version` → No such file (só pyproject.toml e uv.lock na pasta).
- **Revisão:** sem contestação cética concluída.

### F1373 · Etapa 066 (CI): Conta E2E dedicada e2e@promobrindes com role mínimo e rotação trimestral

- **Tipo:** Doc/config
- **O que os docs afirmam:** Documentar em docs/RUNBOOK.md.
- **Fontes:** `docs/execucao/PLANO_WORKFLOWS_GITHUB_ACTIONS_100_ETAPAS_2026-09-27.md:144`
- **O que falta:** Documentar em docs/RUNBOOK.md a conta E2E (e-mail, role mínimo, rotação trimestral) e confirmar no Auth/profiles o role do usuário E2E (consulta via MCP do projeto usyxfpqlsspldubptrdl).
- **Evidência:** Secrets `E2E_TEST_EMAIL`/`E2E_TEST_PASSWORD` existem no GitHub (github_list_actions_secrets, atualizados 2026-10-05/10-11) e são usados em .github/workflows/pr-checks.yml:495-496 e quote-to-sale-e2e.yml:82-83; docs/prod-readiness.md:895 registra run E2E verde com o usuário E2E. Rotação: docs/SECRETS_ROTATION.md:60 (`Pendente — mesma rotação`) e :110-112 (procedimento), sem periodicidade trimestral. ausente: `grep -n -i 'e2e@\\|rotação\\|conta e2e' docs/RUNBOOK.md` → 0 resultados. Role mínimo do usuário no Auth: não verificável (snapshot auth.md só traz agregados; nenhum MCP deste projeto Supabase disponível).
- **Revisão:** sem contestação cética concluída.

### F1375 · Etapa 073 (CI): Subir coverage-baseline.json para valor real e meta +5 pp/trimestre

- **Tipo:** Doc/config
- **O que os docs afirmam:** Hoje 2,89%.
- **Fontes:** `docs/execucao/PLANO_WORKFLOWS_GITHUB_ACTIONS_100_ETAPAS_2026-09-27.md:151`
- **O que falta:** Rodar `npm run coverage:baseline:update` para refletir a cobertura atual (897 testes vs 649 em 09/2026 segundo docs/prod-readiness.md Fechamento) e registrar a meta trimestral (+5 pp) em coverage-baseline.json/_comment ou scripts/check-coverage-ratchet.mjs.
- **Evidência:** coverage-baseline.json:3-6 (lines 4.64, branches 3.72, functions 3.4, statements 4.57, medido 2026-09-28 — acima dos 2,89% do plano); scripts/check-coverage-ratchet.mjs:6-7 (falha se cair >0.05pp) rodado em pr-checks.yml:283 (`npm run coverage:ratchet`); package.json:24 (`coverage:baseline:update`). ausente: `grep -rn -i '5 pp\\|trimestre' coverage-baseline.json scripts/check-coverage-ratchet.mjs` → 0 resultados (meta +5 pp/trimestre não existe).
- **Revisão:** sem contestação cética concluída.

### F1377 · Etapa 079 (CI): Decidir e documentar modelo de deploy de edge functions (workflow vs manual via MCP)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Decisão de negócio: deploy-functions.yml em push main ou manual com evidência.
- **Fontes:** `docs/execucao/PLANO_WORKFLOWS_GITHUB_ACTIONS_100_ETAPAS_2026-09-27.md:160`
- **O que falta:** Registrar a decisão (ADR ou seção em docs/DEPLOYMENT.md §4): workflow deploy.yml com allowlist em tag/dispatch OU manual via MCP com evidência; alinhar docs/DEPLOYMENT.md:54 ('sempre manual') com deploy.yml:144-148.
- **Evidência:** docs/DEPLOYMENT.md:15 e :50-57 registram 'Deploy **manual** via CLI' para edge functions (revisado 2026-10-18); porém .github/workflows/deploy.yml:131-154 faz `supabase functions deploy` da allowlist ACTIVE em tag/dispatch quando `SUPABASE_ACCESS_TOKEN` existe (secret existe desde 2026-09-28 — github_list_actions_secrets); docs/agentes/github-ci.md:60-66 descreve o deploy.yml como 'nunca atualizado' e tenta deploy 'se os secrets existirem'. Dois modelos coexistem sem decisão explícita; ausente: `grep -rli 'deploy-functions\\|modelo de deploy' docs/decisions docs/agentes` → 0 resultados.
- **Revisão:** sem contestação cética concluída.

### F1382 · Etapa 091 (CI): Trocar reviewers (deprecado) por assignees e remover label automated

- **Tipo:** Doc/config
- **O que os docs afirmam:** Trocar reviewers (deprecado) por assignees e remover label automated
- **Fontes:** `docs/execucao/PLANO_WORKFLOWS_GITHUB_ACTIONS_100_ETAPAS_2026-09-27.md:175`
- **O que falta:** Remover a linha `- "automated"` em .github/dependabot.yml:14.
- **Evidência:** .github/dependabot.yml:10-11 e :50-51 (`assignees: adm01-debug`); `grep -n reviewers .github/dependabot.yml` → 0 resultados (reviewers removido). Porém :14 ainda tem label `automated` no bloco npm.
- **Revisão:** sem contestação cética concluída.

### F1383 · Etapa 092 (CI): Auto-merge de patch/minor de devDeps via Dependabot nativo com regra no ruleset

- **Tipo:** Doc/config
- **O que os docs afirmam:** Não usar pull_request_target.
- **Fontes:** `docs/execucao/PLANO_WORKFLOWS_GITHUB_ACTIONS_100_ETAPAS_2026-09-27.md:176`
- **O que falta:** Restringir o auto-merge a update-type patch/minor de devDependencies (usar `dependabot/fetch-metadata` em dependabot-automerge.yml:27-34 e condicionar por `update-type`/`dependency-type`), ou documentar a decisão de automergear tudo.
- **Evidência:** Auto-merge ativo: repo `allow_auto_merge: true` (github_get_repo); .github/workflows/dependabot-automerge.yml:11-13 usa `pull_request` (não `pull_request_target`, como pedido) e :27-34 roda `gh pr merge --auto --squash` para TODA PR do dependabot[bot], sem filtro de patch/minor nem de devDependencies; :36-76 varredura diária. Ruleset main-protection não tem regra específica para Dependabot (github_get_branch_rules).
- **Revisão:** sem contestação cética concluída.

### F1385 · Etapa 096 (CI): Reescrever .github/workflows/README.md com tabela workflow × gatilho × gates × required × secrets × dono

- **Tipo:** Doc/config
- **O que os docs afirmam:** Reescrever .github/workflows/README.md com tabela workflow × gatilho × gates × required × secrets × dono
- **Fontes:** `docs/execucao/PLANO_WORKFLOWS_GITHUB_ACTIONS_100_ETAPAS_2026-09-27.md:183`
- **O que falta:** Reescrever .github/workflows/README.md como tabela workflow × gatilho × gates × required (CI Gate) × secrets × dono cobrindo os 28 workflows (docs/agentes/github-ci.md:50-80 já tem parte da informação).
- **Evidência:** .github/workflows/README.md:1-80 — formato por seções (`### workflow — descrição` + linha `Gatilhos:`), sem tabela; cobre 13 workflows enquanto `.github/workflows/` tem 28 .yml (faltam ex.: deploy.yml, apply-migration.yml, db-backup.yml, dependabot-automerge.yml, release-please.yml, main.yml); `grep -n -i 'required\\|secrets\\|dono' .github/workflows/README.md` → 0 linhas de conteúdo (só 'secrets scan' na :9).
- **Revisão:** sem contestação cética concluída.

### F1387 · Etapa 098 (CI): Alinhar CLAUDE.md §7 (bun → npm) e CONTRIBUTING.md; remover comentários "etapa X do plano" dos YAML

- **Tipo:** Doc/config
- **O que os docs afirmam:** Histórico vai para docs/.
- **Fontes:** `docs/execucao/PLANO_WORKFLOWS_GITHUB_ACTIONS_100_ETAPAS_2026-09-27.md:185`
- **O que falta:** Remover/reescrever o comentário 'Etapa 18' em .github/workflows/cron-monitoring.yml:39 (mover histórico para docs/).
- **Evidência:** CLAUDE.md contém só `@AGENTS.md`; `grep -rn 'bun run\\|bun install\\|bunx' CLAUDE.md AGENTS.md CONTRIBUTING.md` → 0 resultados; CONTRIBUTING.md:14,42-43 usa `npm run test`/`npm run test:e2e`. Porém .github/workflows/cron-monitoring.yml:39 ainda tem comentário `# Etapa 18: nunca executa em PRs de fork` (`grep -c -i etapa .github/workflows/*.yml` → só esse arquivo, 1 ocorrência).
- **Revisão:** sem contestação cética concluída.

### F1388 · Etapa 099 (CI): CODEOWNERS cobrindo .github/workflows/ e supabase/migrations/ com require_code_owner_review

- **Tipo:** Doc/config
- **O que os docs afirmam:** Bloqueia merge de agente sem revisão humana nesses paths.
- **Fontes:** `docs/execucao/PLANO_WORKFLOWS_GITHUB_ACTIONS_100_ETAPAS_2026-09-27.md:186`
- **O que falta:** Dono ativar `require_code_owner_review: true` (e ≥1 aprovação) no ruleset main-protection e provisionar a conta @promo-ops referida em CODEOWNERS:5-8.
- **Evidência:** .github/CODEOWNERS:16-22 cobre `/supabase/migrations/`, `/supabase/functions/` e `/.github/workflows/` (@adm01-debug @promo-ops; :5-7 nota que @promo-ops ainda precisa ser provisionado). GitHub API github_get_branch_rules main → `require_code_owner_review: false`, `required_approving_review_count: 0`.
- **Revisão:** sem contestação cética concluída.

### F1389 · Etapa 10 do plano: Criar scorecard de prontidão real

- **Tipo:** Doc/config
- **O que os docs afirmam:** Substituir “10/10” por gates objetivos deste documento. Saída esperada: painel baseline vermelho/amarelo/verde. Gate: nenhum.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:666-666`
- **O que falta:** Transformar docs/prod-readiness.md em scorecard com semáforo (vermelho/amarelo/verde) por gate e regenerá-lo por script (ex.: scripts/debt-report.mjs já agrega ratchets) para não ficar preso ao snapshot de 2026-11-13.
- **Evidência:** docs/prod-readiness.md:1-18 (auditoria 2026-11-12 com tabela Resumo área × total × OK × BLOQUEADO para workflows, rotas, edges, tabelas, integrações) e :1049-1062 (Fechamento com 9 itens OK/BLOQUEADO com prova) — substitui o '10/10' por gates objetivos; porém é snapshot binário OK/BLOQUEADO, sem painel vermelho/amarelo/verde (`grep -n -i 'vermelho\\|amarelo\\|verde\\|🔴\\|🟡\\|🟢' docs/prod-readiness.md` → 0 resultados) e sem regeneração automática; docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:128 marca a etapa 10 como 🔵 'embrião'.
- **Revisão:** sem contestação cética concluída.

### F1392 · Etapa 13 do plano: Registrar fingerprints dos projetos

- **Tipo:** Doc/config
- **O que os docs afirmam:** Project ref, região, versão Postgres/PostgREST, schemas e owners. Saída esperada: inventário canônico. Gate: nenhum.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:672-672`
- **O que falta:** Documento único de inventário (ref, região us-east-2, versões Postgres/PostgREST/GoTrue/Storage, schemas, owners) dos projetos, resolvendo a contradição de região.
- **Evidência:** Fingerprints existem dispersos: supabase/.temp/project-ref (usyxfpqlsspldubptrdl), supabase/.temp/postgres-version (17.6.1.155), rest-version (v14.15), gotrue-version (v2.195.0), storage-version (v1.69.0), pooler-url (aws-0-us-east-2); docs/estado/IDENTIDADE_BANCO_2026-09-13.md:11-15 identifica os 3 refs e papéis; docs/estado/11_DADOS_BANCO.md:5 PostgreSQL 17.6. Não há inventário canônico único; docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:30 marca etapa 13 como P e aponta região contraditória (sa-east-1 vs us-east-2 em VALIDACAO_SINCRONIA_GITHUB_SUPABASE_2026-09-10.md:7).| cético: Fingerprints existem dispersos: supabase/.temp/project-ref = usyxfpqlsspldubptrdl, postgres-version = 17.6.1.155, rest-version = v14.15, pooler-url host aws-0-us-east-2; docs/agentes/banco-e-mcp.md:7-13 tabela de identidade só com ref/URL/MCP, sem região/versões/schemas/owners. Nen…

### F1393 · Etapa 14 do plano: Reconciliar referências de projeto

- **Tipo:** Doc/config
- **O que os docs afirmam:** Resolver config.toml, .temp, index.html, envs, scripts e CI que hoje apontam para três refs. Saída esperada: matriz ambiente→ref. Gate: decisão de topologia.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:673-673`
- **O que falta:** Corrigir o default em scripts/verify-dispatcher-request-id.sh:18 e publicar a matriz ambiente (local/preview/produção/Vercel) → ref/URL/variáveis.
- **Evidência:** Referências reconciliadas para usyxf: supabase/config.toml:1, supabase/.temp/project-ref, index.html:45-46, src/integrations/supabase/env.ts:5, .github/workflows/deploy.yml:148 (grep de hosts .supabase.co em src/.github/config/index.html → só usyxfpqlsspldubptrdl, 5 ocorrências; rapjsw/saejq → 0 em src e .github). Pendente: scripts/verify-dispatcher-request-id.sh:18 ainda usa DEFAULT_BASE_URL='https://saejqkojleeaxzrslzfg.supabase.co/functions/v1' (ref do Lovable). Matriz ambiente→ref não existe: docs/agentes/banco-e-mcp.md:9-11 só lista o projeto único; .github/ENVIRONMENTS.md trata só do environment pr-preview.| cético: Refs reconciliadas em config/front/CI para usyxf, mas scripts/verify-dispatcher-request-id.sh:18 ainda tem DEFAULT_BASE_URL='https://saejqkojleeaxzrslzfg.supabase.co/functions/v1'. Matriz ambiente→ref ausente: docs/agentes/banco-e-mcp.md:7-13 lista só o projeto único, …

### F1396 · Etapa 17 do plano: Isolar toolchains Node/Bun/Deno

- **Tipo:** Doc/config
- **O que os docs afirmam:** Impedir que Deno altere node_modules do npm; fixar versões iguais às do CI. Saída esperada: setup reproduzível. Gate: nenhum.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:676-676`
- **O que falta:** Pinar a versão do Deno no repo e adicionar "nodeModulesDir": "none" em deno.json.
- **Evidência:** Node fixado e igual ao CI: .nvmrc = 22; package.json:188-190 engines node >=22.0.0; pr-checks.yml node-version '22' em 10 jobs (linhas 81,104,182,210,235,...). Bun removido (commit a24228771 2026-09-03: 'bun.lock/bun.lockb removidos e ignorados'; ls raiz → só deno.lock e package-lock.json). Deno: deno.json em formato Deno 2 com lint/fmt restritos a supabase/functions, mas versão só pinada nos workflows (deno-version: v2.9.x em 9 workflows, ex. pr-checks.yml:308), sem arquivo de versão no repo; ausente: grep nodeModulesDir deno.json → 0 resultados (nenhuma proteção explícita de node_modules).| cético: Node fixado: .nvmrc presente, package.json:188-190 engines node >=22.0.0. Sem bun.lock/bun.lockb na raiz (ls → só deno.lock e package-lock.json). deno.json (lido inteiro) só tem tasks/lint/fmt: sem nodeModulesDir e sem versão do Deno; ausente: ls -a \| grep dvmrc → 0.

### F1397 · Etapa 18 do plano: Escolher package manager canônico

- **Tipo:** Doc/config
- **O que os docs afirmam:** Validar plataformas e decidir package-lock ou Bun; não apagar locks ainda. Saída esperada: ADR e CI piloto. Gate: aprovação do lote de limpeza.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:677-677`
- **O que falta:** ADR-011 registrando npm + package-lock.json como canônico e a remoção do Bun.
- **Evidência:** Decisão tomada e aplicada: commit a24228771 (2026-09-03) 'lockfile único: package-lock.json; bun.lock/bun.lockb removidos e ignorados… CONTRIBUTING/CHANGELOG atualizados (npm canônico)'; AGENTS.md §6 'lockfile package-lock.json'; CI usa npm ci (.github/workflows/pr-checks.yml:109,215,240); ls raiz → sem bun.lock/bun.lockb. Ausente: ADR formal — ls docs/decisions → ADR-001..ADR-010, nenhum sobre package manager (grep -il 'package manager\|bun' docs/decisions → 0).| cético: Decisão aplicada: só package-lock.json na raiz, sem bun.lock (ls -a). ADR ausente: ls docs/decisions → ADR-001..ADR-010 (rbac, react-query, rls, circuit-breaker, idempotency, request-id, log-retention, anon-secdef, session-storage, service-layer, webauthn), nenhum sobre package manager.

### F1401 · Etapa 27 (Graphify): Avaliar enriquecimento semântico opcional

- **Tipo:** Doc/config
- **O que os docs afirmam:** Comparar com baseline AST; registrar provedor/custo/autorização antes de qualquer chamada externa.
- **Fontes:** `docs/planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md:265-270`
- **O que falta:** Registrar em docs/graphify/ a decisão formal (provedor/custo/autorização ou dispensa) e garantir AST-only técnico nos hooks.
- **Evidência:** Semântica permanece desabilitada por política: docs/graphify/README.md:75 ('Não use … modo semântico … sem a etapa correspondente'), docs/graphify/EXECUCAO_LOTE_A_2026-09-11.md:52, docs/agentes/contexto-gerado.md:21 ('graphify update . (AST-only, sem custo de API)'). Não há decisão final documentada: docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:161 etapa 27 PENDENTE 'falta decisão final documentada'; a skill vendor .claude/skills/graphify/SKILL.md:155-166 ainda descreve extração semântica via Gemini se GEMINI_API_KEY existir (sem bloqueio técnico).| cético: docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:161 etapa 27 PENDENTE 'falta decisão final documentada'. Semântica desligada só por orientação: docs/agentes/contexto-gerado.md:21 'graphify update . (AST-only, sem custo de API)'.

### F1402 · Etapa 28 (Graphify): Montar matriz de funcionalidades e ligações

- **Tipo:** Doc/config
- **O que os docs afirmam:** Requisito→rota→componente→hook→serviço→Edge/RPC→entidade→teste com estados.
- **Fontes:** `docs/planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md:272-277`
- **O que falta:** Matriz requisito→rota→componente→hook→serviço→Edge/RPC→entidade→teste com coluna de estado em docs/graphify/, ou declaração formal de que o índice substitui a etapa.
- **Evidência:** Em docs/graphify/ não há matriz: grep -ril 'matriz funcional\|matriz de funcionalidades' docs/graphify → só REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:162 (etapa 28 PENDENTE). Existe equivalente gerado fora do Graphify: branch contexto docs/contexto/codigo/rotas.json (urls, menu, arquivo, hooks, tabelas, edges), testes.json e inventario/estado/*.json (docs/agentes/contexto-gerado.md:8-13 'rotas → menu → hooks → tabelas, edges'), mas sem os estados exigidos ('referência comprovada', 'ligação não resolvida', 'teste ausente', 'runtime não verificado').| cético: docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:162 etapa 28 PENDENTE. O índice gerado (scratchpad contexto/docs/contexto/codigo/INDEX.md, rotas.json, testes.json) tem rota→hook→tabela→edge, mas grep -iE 'teste ausente\|não resolv' INDEX.md → 0, ou seja sem os estados exigidos.

### F1405 · Etapa 34 (Graphify): Avaliar interface MCP local e coexistência com Husky

- **Tipo:** Doc/config
- **O que os docs afirmam:** Verificar suporte MCP na versão pinada; hook opt-in respeitando core.hooksPath.
- **Fontes:** `docs/planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md:316-321`
- **O que falta:** Registrar decisão formal MCP (dispensado) e hook (adotado, opt-out) com teste de que falha do graphify não quebra os hooks Husky.
- **Evidência:** Hook: .husky/post-checkout:2-4 ('Installed by: graphify hook install') e .husky/post-commit instalados; Husky preservado (.husky/commit-msg, pre-commit presentes); opt-out via GRAPHIFY_SKIP_HOOK=1 (docs/agentes/contexto-gerado.md:28); .claude/settings.json:9,19 usam 'graphify hook-guard'. MCP: ausente — ls .mcp.json → não existe; nenhum servidor MCP graphify; nenhum endpoint público. Falta decisão formal: docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:168 etapa 34 PENDENTE; hook é opt-out e não opt-in como o plano pedia.| cético: .husky/post-commit:1-4 'Installed by: graphify hook install' (hook adotado, opt-out via GRAPHIFY_SKIP_HOOK=1 em docs/agentes/contexto-gerado.md:28); ausente: ls .mcp.json → não existe. docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:168 etapa 34 PENDENTE 'nem decisão formal separada'.

### F1409 · Etapa 48 (Graphify): Finalizar runbook, incidentes e rollback

- **Tipo:** Doc/config
- **O que os docs afirmam:** Bootstrap, atualização, consulta, autorização de catálogo, incidente de vazamento, rollback.
- **Fontes:** `docs/planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md:420-425`
- **O que falta:** Seções de incidente de vazamento, rollback de versão e ensaio de desinstalação preservando Husky, com evidência.
- **Evidência:** docs/graphify/README.md:14,73-81 documenta bootstrap (uv tool install graphifyy==0.9.48), limites (--allow-large-scope, --force) e bloqueio do catálogo. ausente: grep -iE 'runbook\|rollback\|incidente' docs/graphify → só REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:182 (etapa 48 PARCIAL: 'faltam ensaios de incidente, recuperação e restauração').| cético: docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:182 etapa 48 PARCIAL 'README documenta bootstrap/limites; faltam ensaios de incidente, recuperação e restauração'; grep -rliE 'rollback\|runbook' docs/graphify → só a própria REVISAO.

### F1412 · Etapa 57: .lighthouserc.json sem url e budgets calibrados

- **Tipo:** Doc/config
- **O que os docs afirmam:** Alinhar com #189.
- **Fontes:** `docs/estado/PLANO_CI_WORKFLOWS_2026-10-01.md:109`
- **O que falta:** Remover a chave url de .lighthouserc.json:4.
- **Evidência:** Budgets calibrados: .lighthouserc.json:10-19 (performance minScore 0.45, FCP 5500, LCP 8500 etc.) via PR #189 'budgets Lighthouse realistas' mergeada 2026-10-02. Pendente: .lighthouserc.json:4 ainda tem "url": ["http://localhost:5173"] junto com "staticDistDir": "./dist" (linha 5); upload.target segue 'temporary-public-storage' (linha 25, etapa 58).| cético: .lighthouserc.json:4 ainda tem "url": ["http://localhost:5173"] junto de "staticDistDir": "./dist" (linha 5); budgets calibrados nas linhas 10-19.

### F1414 · Etapa 67 do plano: Criar os três buckets faltantes

- **Tipo:** Doc/config
- **O que os docs afirmam:** Definir policies, limites, MIME, retenção e antivírus para call-recordings, quote-pdfs e report-snapshots. Saída esperada: testes por role. Gate: autorização Storage.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:741-741`
- **O que falta:** Testes de acesso por role para os 3 buckets, retenção ou expurgo dos objetos e decisão sobre antivírus.
- **Evidência:** Buckets existem no banco real (snapshot 2026-11-20 docs/contexto/supabase/storage.md): call-recordings (privado, 100 MB, MIME áudio/vídeo), quote-pdfs (privado, 20 MB, application/pdf), report-snapshots (privado, 20 MB, json/csv). Policies em storage.objects (policies.md:1028-1038): call-recordings SELECT/INSERT/DELETE por dono ou admin/manager; quote-pdfs INSERT/UPDATE service_role e SELECT/DELETE dono; report-snapshots só SELECT dono/admin. Testes existentes verificam limites/MIME: supabase/tests/canonical_post_migration_assertions.sql:152-172; tests/migrations/canonical_hardening_contract_test.ts:142-157 (texto da migration). Ausente: testes por role (grep -iE 'set role\|request.jwt' supabase/tests/*.sql com storage → 0 resultados); retenção e antivírus (grep -iE 'retention\|antiv\|clamav' em migrations/docs/DATA_RETENTION.md filtrando bucket → 0 resultados relevantes).| cético: Banc…

### F1417 · Etapa 91 do plano: Publicar manifesto de candidatos

- **Tipo:** Doc/config
- **O que os docs afirmam:** Listar hash, tamanho, owner, último uso e motivo para cada arquivo/objeto, sem deletar. Saída esperada: checklist aprovável. Gate: nenhum.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:774-774`
- **O que falta:** Adicionar hash sha256, owner e último uso por item; marcar bun.lock/bun.lockb/deno.lock como resolvidos; incluir supabase/.temp.
- **Evidência:** docs/auditoria/CANDIDATOS_DE_LIMPEZA_2026-08-26.md:9-15 lista 5 candidatos com colunas Item| Tamanho \| Evidência \| Classificação proposta \| Ação pendente (deno.lock, supabase/.temp/cli-latest, graphify-out/, supabase/functions/graphify-out/, bun.lockb). Faltam hash, owner e último uso exigidos pela etapa (AUDITORIA_EXAUSTIVA_2026-08-26:774). Itens já resolvidos sem atualizar o manifesto: bun.lockb removido em 50572ad83, bun.lock em a24228771, deno.lock versionado (git ls-files). \| cético: docs/auditoria/CANDIDATOS_DE_LIMPEZA_2026-08-26.md:8-14 tabela com colunas Item \| Tamanho \| Evidência \| Classificação proposta \| Ação pendente (5 itens) — sem hash, owner nem último uso. Itens desatualizados: bun.lockb (linha 14) não está mais versionado (git ls-files \| grep -E 'bun\|yarn' → 0; só deno.lock e package-lock.json).

### F1420 · Etapa 94 do plano: Limpar artefatos de tooling

- **Tipo:** Doc/config
- **O que os docs afirmam:** Tratar bundle-stats, supabase/.temp e manifests stale, preservando geração automatizada. Saída esperada: redução mensurada do Git. Gate: aprovação nominal de arquivos.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:777-777`
- **O que falta:** git rm -r --cached supabase/.temp + regra em .gitignore (ou decisão documentada) e registrar a redução no manifesto.
- **Evidência:** Commit a24228771 (2026-09-03, 'chore(config): consolida CI, lockfile único e remove artefatos mortos') removeu bundle-stats/stats.html (-4950), bundle-stats/stats.json (-281560), deployed.txt (-10), local.txt (-169), bun.lock (-3529): 291.036 deleções (redução mensurada); CHANGELOG.md:186. Porém supabase/.temp segue versionado: git ls-files → 8 arquivos (gotrue-version, linked-project.json, pooler-url, postgres-version, project-ref, rest-version, storage-migration, storage-version) e ausente: grep -n temp .gitignore → 0.| cético: bundle-stats/, deployed.txt, local.txt fora do Git (removidos em a24228771, conforme verificador). supabase/.temp segue versionado: git ls-files supabase/.temp → 8 arquivos (gotrue-version, linked-project.json, pooler-url, postgres-version, project-ref, rest-version, storage-migration, storage-version); ausente: grep -n temp .gitignore → 0.

### F1421 · Etapa 95 do plano: Normalizar locks e documentação histórica

- **Tipo:** Doc/config
- **O que os docs afirmam:** Manter lock canônico e mover alegações antigas para history com cabeçalho de validade. Saída esperada: onboarding/CI reproduzível. Gate: aprovação nominal.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:778-778`
- **O que falta:** Criar docs/history/ ou cabeçalho de validade/superseded nos docs de 08–09/2026 contraditos pelo estado atual.
- **Evidência:** Lock canônico feito: git ls-files mostra só package-lock.json e deno.lock; bun.lock removido em a24228771, bun.lockb em 50572ad83; CONTRIBUTING.md:9 ('npm ci canônico'), README.md:9, AGENTS.md §6 (lockfile package-lock.json). Documentação histórica NÃO normalizada: ausente: ls docs/history → No such file; find docs -type d -iname '_hist_' → 0; grep -rl 'Válido até\\|Validade:\\|Documento histórico' docs → só docs/agentes/branches-encerradas-261117.md. Docs antigos (docs/auditoria, docs/execucao de 08/2026) seguem sem cabeçalho de validade.| cético: Lock canônico: git ls-files → apenas package-lock.json e deno.lock. Documentação histórica não normalizada: ls docs/history → No such file or directory; docs/execucao/STATUS_100_ETAPAS_2026-08-30.md último commit 2026-08-31 sem cabeçalho de validade.

### F1423 · Etapa 98: .github/workflows/README.md sincronizado (edge-functions-input-validation do #195; CodeQL em PR) com check de sincronia

- **Tipo:** Doc/config
- **O que os docs afirmam:** README dos workflows alinhado ao estado real.
- **Fontes:** `docs/estado/PLANO_CI_WORKFLOWS_2026-10-01.md:170`
- **O que falta:** Documentar os 15 workflows faltantes (inclusive edge-functions-input-validation.yml), citar CodeQL em PR e criar check de sincronia ligado ao pr-checks.yml.
- **Evidência:** .github/workflows/README.md documenta 11 workflows (linhas 8-68: pr-checks, cron-monitoring, edge-functions-bundle, edge-functions-request-id, quote-to-sale-e2e, qa-exhaustive, graphify, codeql, contexto, contexto-testes, inventario-estado-semanal, types-sync) de 26 .yml existentes; 15 não documentados, incluindo edge-functions-input-validation.yml, deploy.yml, migrations-drift.yml, db-backup.yml, main.yml, release-please.yml (loop grep sobre ls .github/workflows/_.yml). README.md:47-48 descreve CodeQL sem citar que roda em PR (codeql.yml:11 on.pull_request). Check de sincronia: ausente: grep -rln 'workflows/README' scripts/ .github/workflows/_.yml .husky/ → 0.| cético: ls .github/workflows/*.yml → 27 arquivos; loop grep do nome no .github/workflows/README.md → 15 ausentes (a11y-sweep, apply-migration, automation-local, ci-failure-alert, db-backup, db-probe, dependabot-automerge, depend…

### F1424 · Etapa 99: npm run ci local espelhando required checks (deno lint, request-id, lockfile)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Hoje faltam deno lint, request-id e lockfile.
- **Fontes:** `docs/estado/PLANO_CI_WORKFLOWS_2026-10-01.md:171`
- **O que falta:** Incluir no script ci: deno lint (deno task lint:functions), lint de request-id e git diff --exit-code de package-lock.json/deno.lock.
- **Evidência:** package.json:58 "ci": "npm run lint && npm run typecheck && npm run security:secrets && npm run graphify:test && npm run test:coverage && npm run build && node scripts/check-bundle-budget.mjs" — sem deno lint, sem lint de request-id, sem checagem de lockfile. No CI esses passos existem: pr-checks.yml:290-319 (job 'Edge Functions Lint (deno)': git diff --exit-code deno.lock + deno lint) e .github/workflows/edge-functions-request-id.yml. deno.json:5 tem task lint:functions mas não é chamada pelo script ci.| cético: package.json:58 "ci": "npm run lint && npm run typecheck && npm run security:secrets && npm run graphify:test && npm run test:coverage && npm run build && node scripts/check-bundle-budget.mjs" — sem deno lint, request-id ou checagem de lockfile.

### F1425 · Etapa canônica 26/08 nº 10: Scorecard de prontidão real (substituir "10/10")

- **Tipo:** Doc/config
- **O que os docs afirmam:** Etapa canônica 10 (plano 26/08, matriz de status 30/08, estado 🔵): painel baseline vermelho/amarelo/verde; esta matriz é o embrião.
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:128-128`
- **O que falta:** Atualizar a matriz ou declará-la superseded por docs/prod-readiness.md e consolidar scorecard único com semáforo.
- **Evidência:** docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:115-262 traz matriz com estado por etapa (🔶/🔒/⬜/🔵) para as 100 etapas canônicas; linha 128 declara 'Esta matriz é o embrião do scorecard'. Última alteração do arquivo: git log -1 → 2026-08-31 (não atualizado desde). Scorecard mais recente e real por área: docs/prod-readiness.md (2026-11-12; git log → 2026-11-14) com tabela total/OK/BLOQUEADO para workflows (26/25/1), rotas (179/125/54), edge functions (171/98/73), tabelas (405/403/2), integrações (18/7/11). Não há painel vermelho/amarelo/verde consolidado nem atualização da matriz 1–100.| cético: docs/execucao/STATUS_100_ETAPAS_2026-08-30.md existe (matriz por etapa), último commit Mon Aug 31 2026 (git log -1); docs/prod-readiness.md existe como scorecard mais recente por área. Nenhum painel consolidado vermelho/amarelo/verde atualizado.

### F1427 · Etapa canônica 26/08 nº 13: Registrar fingerprints dos projetos

- **Tipo:** Doc/config
- **O que os docs afirmam:** Etapa canônica 13 (plano 26/08, matriz de status 30/08, estado 🔒): ref, região, Postgres/PostgREST, schemas, owners; inventário canônico.
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:136-136`
- **O que falta:** Seção 'Fingerprint' única em docs/agentes/banco-e-mcp.md com ref, região, Postgres 17.6.1.155, PostgREST v14.15, GoTrue, schemas expostos e owners.
- **Evidência:** Ref/URL/dashboard registrados em docs/agentes/banco-e-mcp.md:9-11 e IDENTIDADE_BANCO_2026-09-13.md §Veredito (3 refs com papel). Região só em docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:11 (sa-east-1); versão Postgres só em docs/agentes/replay-do-repo-261117.md:195 ('Produção roda 17.6'); PostgREST/schemas/owners: ausente: grep -rn -i 'PostgREST [0-9v]\\|região' docs/agentes/*.md docs/estado/IDENTIDADE_BANCO_2026-09-13.md → 0; snapshot project-config.md e edge-functions.md: '_Management API desabilitada_'. Não há inventário canônico único.| cético: Ref/URL em docs/agentes/banco-e-mcp.md:9-11. Fingerprints espalhados: supabase/.temp/postgres-version = 17.6.1.155 e supabase/.temp/rest-version = v14.15 (lidos), região só em STATUS_100_ETAPAS_2026-08-30.md:11; sem seção de inventário canônico (schemas, owners, PostgREST) em banco-e-mcp.md.

### F1428 · Etapa canônica 26/08 nº 14: Reconciliar referências de projeto (config.toml, .temp, index.html, envs, scripts, CI)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Etapa canônica 14 (plano 26/08, matriz de status 30/08, estado 🔶): matriz ambiente→ref; aguarda decisão de topologia.
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:137-137`
- **O que falta:** Corrigir scripts/verify-dispatcher-request-id.sh:18-22 para o ref canônico sem chave embutida e registrar matriz ambiente→ref.
- **Evidência:** Apontam ao ref canônico: supabase/config.toml:1, index.html:45-46, src/integrations/supabase/env.ts:5, .env.example:10-12, supabase/.temp/project-ref e linked-project.json, .github/workflows/deploy.yml, db-probe.yml, db-backup.yml (grep usyxfpqlsspldubptrdl). Divergência viva: scripts/verify-dispatcher-request-id.sh:18 DEFAULT_BASE_URL='https://saejqkojleeaxzrslzfg.supabase.co/functions/v1' (projeto do Lovable) e linha 22 com anon key desse projeto embutida. Referências a rapjswienfhkobhlamxb fora de docs são históricas/corretivas (supabase/migrations/20260903000002_fix_cron_project_ref.sql, scripts/inventario/gerar-banco.mjs:107 como comentário de guarda). Não existe 'matriz ambiente→ref' além de IDENTIDADE_BANCO §Veredito.| cético: scripts/verify-dispatcher-request-id.sh:18 DEFAULT_BASE_URL="https://saejqkojleeaxzrslzfg.supabase.co/functions/v1" e :22 ANON_KEY default com JWT ref saej…

### F1429 · Etapa canônica 26/08 nº 17: Isolar toolchains Node/Bun/Deno

- **Tipo:** Doc/config
- **O que os docs afirmam:** Etapa canônica 17 (plano 26/08, matriz de status 30/08, estado ⬜): Deno não altera node_modules; versões = CI; setup reproduzível.
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:140-140`
- **O que falta:** Alinhar automation-local.yml:35 a .nvmrc, fixar versão exata do Deno e documentar em CONTRIBUTING.md.
- **Evidência:** .nvmrc = 22; package.json:188-190 engines.node '>=22.0.0'; 17 workflows com node-version '22' e 3 com node-version-file .nvmrc (contexto.yml:132 etc.), mas .github/workflows/automation-local.yml:35 usa node-version '24' (divergente). Deno: 9 workflows com deno-version 'v2.9.x' (faixa, não pin exato); deno.json (lint/fmt/tasks) não fixa versão nem nodeModulesDir. Bun: ausente: grep -rn bun .github/workflows/*.yml → 0 (toolchain removida). Sem .tool-versions/.node-version.| cético: .github/workflows/automation-local.yml:35 node-version: '24' (diverge do .nvmrc 22); deno-version v2.9.x (faixa) em cron-monitoring.yml:49, dependabot-fix-lockfile.yml:35, deploy.yml:99.

### F1430 · Etapa canônica 26/08 nº 18: Escolher gerenciador de pacotes canônico

- **Tipo:** Doc/config
- **O que os docs afirmam:** Etapa canônica 18 (plano 26/08, matriz de status 30/08, estado ⬜): package-lock vs Bun; não apagar locks ainda; ADR e CI piloto.
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:141-141`
- **O que falta:** ADR registrando npm + package-lock.json como canônico (e deno.lock para Deno).
- **Evidência:** Único lock npm: git ls-files → package-lock.json (+ deno.lock para Deno); bun.lock removido em a24228771 (CHANGELOG.md:184), bun.lockb em 50572ad83; yarn.lock inexistente; CONTRIBUTING.md:9 e README.md:9/22 declaram npm/package-lock.json canônico; CI usa npm ci (pr-checks.yml:109,215,240...). ADR não existe: ls docs/decisions → ADR-001…010 (nenhum sobre gerenciador de pacotes); ausente: grep -rli 'package-lock\\|bun\\|gerenciador de pacotes' docs/decisions → 0.| cético: Lock único: git ls-files → package-lock.json (+ deno.lock). ADR ausente: ls docs/decisions → ADR-001…ADR-010 (11 arquivos), nenhum sobre gerenciador de pacotes.

### F1431 · Etapa canônica 26/08 nº 2: Congelar deploys destrutivos

- **Tipo:** Doc/config
- **O que os docs afirmam:** Etapa canônica 2 (plano 26/08, matriz de status 30/08, estado 🔶): migrations, deleções, grants, deploy não emergencial; saída: janela de mudança registrada.
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:120-120`
- **O que falta:** Documento de janela/congelamento em docs/execucao/ ou declarar a etapa superseded por AGENTS.md §5.8.
- **Evidência:** Não há registro de janela de mudança: grep -rn -i 'janela de mudança\\|congelamento\\|freeze' docs/estado docs/execucao docs/agentes AGENTS.md → só docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:120 (etapa pendente, 'Decisão do operador'). Existe governança substituta: ruleset main-protection ativo (rules pull_request, required_status_checks 'CI Gate', deletion, non_fast_forward; bypass_actors []) e AGENTS.md §5.8 (DDL/migration, CI, segredos, Dockerfile ficam para o dono).| cético: Sem registro de janela de mudança fora de STATUS_100_ETAPAS_2026-08-30.md:120; governança substituta em AGENTS.md §5.8 e ruleset main-protection ativo (gh api lido nesta sessão).

### F1432 · Etapa canônica 26/08 nº 3: Confirmar a função de cada projeto (ADR de topologia)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Etapa canônica 3 (plano 26/08, matriz de status 30/08, estado 🔶): origem=catálogo? destino=CRM? réplica?; saída: ADR de topologia.
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:121-121`
- **O que falta:** ADR de topologia formalizando IDENTIDADE_BANCO_2026-09-13 e destino do projeto rapjswienfhkobhlamxb.
- **Evidência:** ADR de topologia ausente: ls docs/decisions → ADR-001…010 (rbac, react-query, rls, circuit-breaker, idempotency, request-id, log-retention, anon-executable, session-storage, service-layer, webauthn); grep -rli topologia docs/decisions → 0. Decisão de fato documentada em docs/estado/IDENTIDADE_BANCO_2026-09-13.md §Veredito (usyxf = canônico; rapjs = antigo com functions ainda publicadas; saejq = Lovable) e AGENTS.md §7. docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:21 confirma estado 'P' e aponta a falta do ADR.| cético: ls docs/decisions → ADR-001…ADR-010, nenhum de topologia; ausente: grep -rli topologia docs/decisions → 0. Decisão de fato em docs/estado/IDENTIDADE_BANCO_2026-09-13.md:13.

### F1433 · Etapa canônica 26/08 nº 91: Publicar manifesto de candidatos a remoção

- **Tipo:** Doc/config
- **O que os docs afirmam:** Etapa canônica 91 (plano 26/08, matriz de status 30/08, estado ⬜): hash, tamanho, owner, último uso, motivo; sem deletar; checklist aprovável.
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:256-256`
- **O que falta:** Idem F1417 e versionar como docs/execucao/manifesto-candidatos-<data>.md.
- **Evidência:** ausente: find docs -iname 'manifesto-candidatos*' → 0. Equivalente parcial: docs/auditoria/CANDIDATOS_DE_LIMPEZA_2026-08-26.md:9-15 (5 itens com tamanho, evidência, classificação e ação pendente; sem hash, owner, último uso), não versionado em docs/execucao/. Itens já resolvidos sem atualizar o manifesto: bun.lock (a24228771), bun.lockb (50572ad83).| cético: ausente: find docs -iname '_manifesto_' → só docs/ENGINEERING_MANIFESTO.md (não relacionado). Equivalente parcial: docs/auditoria/CANDIDATOS_DE_LIMPEZA_2026-08-26.md:8-14 sem hash/owner/último uso.

### F1434 · Etapa canônica 26/08 nº 94: Limpar artefatos de tooling (bundle-stats, supabase/.temp, manifests stale)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Etapa canônica 94 (plano 26/08, matriz de status 30/08, estado 🔶): redução mensurada do Git.
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:259-259`
- **O que falta:** Remover supabase/.temp do índice + .gitignore (ou decisão documentada) e registrar a redução mensurada.
- **Evidência:** bundle-stats/, deployed.txt e local.txt fora do Git desde a24228771 (2026-09-03; 291.036 deleções; CHANGELOG.md:186; ls bundle-stats → No such file; git ls-files| grep deployed.txt → 0). supabase/.temp ainda versionado: git ls-files → supabase/.temp/{gotrue-version,linked-project.json,pooler-url,postgres-version,project-ref,rest-version,storage-migration,storage-version}; último commit que o tocou: b722848dd; ausente: grep -n temp .gitignore → 0. \| cético: git ls-files supabase/.temp → 8 arquivos ainda versionados; ausente: grep -n temp .gitignore → 0. bundle-stats/deployed.txt/local.txt já fora do Git.

### F1435 · Etapa canônica 26/08 nº 95: Normalizar locks e documentação histórica

- **Tipo:** Doc/config
- **O que os docs afirmam:** Etapa canônica 95 (plano 26/08, matriz de status 30/08, estado 🔶): lock canônico; alegações antigas → history com validade.
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:260-260`
- **O que falta:** Idem F1421.
- **Evidência:** Lock único: git ls-files → package-lock.json e deno.lock apenas; bun.lock/bun.lockb removidos (a24228771, 50572ad83); README.md:9, CONTRIBUTING.md:9, AGENTS.md §6. Docs históricas não marcadas: ls docs/history → inexistente; grep -rl 'Válido até\\|Validade:\\|Documento histórico\\|OBSOLETO' docs → só docs/agentes/branches-encerradas-261117.md; STATUS_100_ETAPAS_2026-08-30.md (último commit 2026-08-31) e auditorias de 08/2026 seguem sem cabeçalho de validade.| cético: git ls-files → só package-lock.json e deno.lock; ls docs/history → inexistente; docs de 08/2026 sem cabeçalho de validade.

### F1440 · Fingerprints dos projetos (região única)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Etapa 13 P: supabase/.temp/*-version; região contraditória (sa-east-1 vs us-east-2).
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:30`
- **O que falta:** Corrigir STATUS_100_ETAPAS_2026-08-30.md:11 para us-east-2, atualizar/regerar supabase/.temp/*-version (ou parar de versioná-los) e registrar fingerprints atuais (Postgres 17.12, região us-east-2, gotrue/rest) num único lugar canônico, ex.: docs/agentes/banco-e-mcp.md.
- **Evidência:** supabase/.temp/postgres-version:1 (17.6.1.155), supabase/.temp/project-ref:1 (usyxfpqlsspldubptrdl), supabase/.temp/pooler-url:1 (aws-0-us-east-2.pooler.supabase.com) — 8 arquivos rastreados (git ls-files supabase/.temp). Contradição de região persiste: docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:11 diz `sa-east-1`; docs/auditoria/VALIDACAO_SINCRONIA_GITHUB_SUPABASE_2026-09-10.md:7 e docs/agentes/replay-do-repo-261117.md:142 dizem `us-east-2`. Nenhum inventário canônico único de fingerprints.| cético: Confirmado: supabase/.temp/pooler-url:1 aponta aws-0-us-east-2; docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:11 ainda diz 'sa-east-1'; grep 'us-east-2\|sa-east-1' docs/agentes/banco-e-mcp.md → 0 (sem registro canônico). Evidência nova que reforça o PARCIAL: supabase/.temp/postgres-version:1 = 17.6.1.155, mas o snapshot do banco real (contexto/supabase/README.md:58) mostra Postgres 17.12…

### F1441 · Flags estritas do TypeScript (882 erros na baseline)

- **Tipo:** Doc/config
- **O que os docs afirmam:** tsconfig.strict.json + scripts/typecheck-baseline.json; nenhuma flag promovida para tsconfig.app.json.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:176`
- **O que falta:** Reduzir a baseline por domínio e promover ao menos uma flag zerada para tsconfig.app.json; corrigir comentário de tsconfig.strict.json:2-3.
- **Evidência:** tsconfig.strict.json:7-10 liga noUncheckedIndexedAccess/noUnusedLocals/noUnusedParameters; tsconfig.app.json:14-18 mantém as três como false (nenhuma promovida). scripts/typecheck-baseline.json:5 `total: 882`, geradoEm 2026-10-01. Gate existe: .github/workflows/pr-checks.yml:132-133 `npm run typecheck:baseline` → scripts/check-typecheck-baseline.mjs:19. Comentário obsoleto em tsconfig.strict.json:2-3 cita scripts/check-typecheck-strict.mjs e scripts/typecheck-strict-baseline.json, que não existem (ls → No such file).| cético: tsconfig.strict.json:8-10 liga as 3 flags; tsconfig.app.json:15-16,19 mantém noUnusedLocals/noUnusedParameters/noUncheckedIndexedAccess=false. scripts/typecheck-baseline.json:5 total 882, último commit e74ff4208 (2026-10-02) — baseline nunca reduzida. Gate existe (pr-checks.yml:132-133 → package.json:33). tsconfig.strict.json:2-3 cita scripts/check-typecheck-strict…

### F1449 · Grafo de conhecimento `graphify-out/` + GRAPH_REPORT.md

- **Tipo:** Doc/config
- **O que os docs afirmam:** ARCHITECTURE: graphify-out/ contém o grafo do codebase (GRAPH_REPORT.md); usar graphify query/path/explain e `graphify update .` após mudanças.
- **Fontes:** `docs/ARCHITECTURE.md:142-144`
- **O que falta:** Ajustar ARCHITECTURE.md:142-145 ('se graphify-out/graph.json existir; graphify update . gera') e regenerar GRAPH_REPORT.md a partir de main.
- **Evidência:** graphify-out/ existe com GRAPH_REPORT.md (210 KB) e manifest.json (674 KB) rastreados (git ls-files); graph.json ausente e ignorado (.gitignore:49-51). docs/ARCHITECTURE.md:142-144 afirma que graphify-out/ contém o grafo e manda usar `graphify query/path/explain` sem a ressalva 'se existir / graph.json não versionado' que AGENTS.md §8 e docs/agentes/contexto-gerado.md:20 fazem. GRAPH_REPORT.md:1 datado 2026-10-27 e :17 'Built from commit: 02a29b65', SHA inexistente no repo (git cat-file -t → Not a valid object name).| cético: docs/ARCHITECTURE.md:142-145 afirma que graphify-out/ contém o grafo, sem ressalva de que graph.json não é versionado; git ls-files graphify-out → só GRAPH_REPORT.md e manifest.json; .gitignore:49-51 ignora o resto. GRAPH_REPORT.md:17 'Built from commit: 02a29b65' → git cat-file -t → Not a valid object name.

### F1450 · GRAPH_REPORT.md amarrado a SHA real

- **Tipo:** Doc/config
- **O que os docs afirmam:** Etapa 30 P: diz commit a133634e inexistente.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:482`
- **O que falta:** Regenerar GRAPH_REPORT.md/manifest.json em main com 'Built from commit' = git rev-parse --short HEAD.
- **Evidência:** graphify-out/GRAPH_REPORT.md:17 'Built from commit: `02a29b65`'; `git cat-file -t 02a29b65` → Not a valid object name e `git log --all --format=%h| grep 02a29b65` → 0 (repo completo: shallow=false, 12.915 commits). a133634e (citado em A_planos_execucao.md:482) também inexistente. Título :1 'wt-sec-agentruns (2026-10-27)' indica worktree não mergeado. \| cético: graphify-out/GRAPH_REPORT.md:17 'Built from commit: 02a29b65' e :1 'wt-sec-agentruns (2026-10-27)'; git cat-file -t 02a29b65 e a133634e → Not a valid object name. Último commit do arquivo: 1e3a191b2 (2026-10-27), HEAD 2026-11-19.

### F1451 · graphify-out rastreado (saída gerada)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Candidato a limpeza listado na auditoria: graphify-out rastreado (saída gerada); nenhuma exclusão autorizada sem aprovação nominal.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:602-624`
- **O que falta:** Registrar a decisão no doc de candidatos de limpeza e regenerar os arquivos versionados a partir de main.
- **Evidência:** Política definida: .gitignore:49-51 ignora `/graphify-out/*` exceto GRAPH_REPORT.md e manifest.json; docs/agentes/contexto-gerado.md:20 e AGENTS.md §8 documentam (graph.json não versionado). Porém os 2 arquivos rastreados são saída gerada obsoleta: GRAPH_REPORT.md:17 aponta commit 02a29b65 inexistente e manifest.json guarda mtimes de outra máquina — o candidato da auditoria (AUDITORIA_EXAUSTIVA_2026-08-30…:602-624) continua sem decisão registrada.| cético: .gitignore:46-51 define a política (ignora /graphify-out/* exceto GRAPH_REPORT.md e manifest.json); docs/agentes/contexto-gerado.md:20 documenta. Mas os 2 arquivos rastreados estão obsoletos (GRAPH_REPORT.md:17 SHA inexistente) e docs/auditoria/CANDIDATOS_DE_LIMPEZA_2026-08-26.md:12 ainda marca graphify-out/ como 'autorizar exclusão'.

### F1452 · graphify-out/ e supabase/functions/graphify-out/ artefatos de análise

- **Tipo:** Doc/config
- **O que os docs afirmam:** Doc classifica os dois diretórios graphify-out como artefato de análise local a excluir após autorização (AGENTS.md atual diz não versionado).
- **Fontes:** `docs/auditoria/CANDIDATOS_DE_LIMPEZA_2026-08-26.md:12-13`
- **O que falta:** Atualizar CANDIDATOS_DE_LIMPEZA_2026-08-26.md:12-13 com o estado/política atuais.
- **Evidência:** supabase/functions/graphify-out/ não existe (ls → No such file; `git log --all -- supabase/functions/graphify-out` → vazio): metade resolvida. graphify-out/ raiz continua rastreado em 2 arquivos por decisão (.gitignore:49-51 `!/graphify-out/GRAPH_REPORT.md`, `!/graphify-out/manifest.json`; git ls-files graphify-out → 2). docs/auditoria/CANDIDATOS_DE_LIMPEZA_2026-08-26.md:12-13 não foi atualizado com essa decisão.| cético: git ls-files supabase/functions/graphify-out → vazio (resolvido); git ls-files graphify-out → 2 arquivos versionados por política (.gitignore:49-51). CANDIDATOS_DE_LIMPEZA_2026-08-26.md:12-13 não atualizado (ainda pede 'autorizar exclusão' dos dois).

### F1453 · Graphify: ADR local-first e modelo de ameaças

- **Tipo:** Doc/config
- **O que os docs afirmam:** Etapas 04/05 P.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:468-469`
- **O que falta:** Criar ADR em docs/decisions/ para Graphify local-first e documento formal de modelo de ameaças em docs/graphify/.
- **Evidência:** grep -rln graphify docs/decisions/ → 0 resultados (ADR-001..ADR-010 não tratam de Graphify). docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:138-139 registra etapas 04 (ADR local-first) e 05 (ameaças) como PARCIAL: 'ADR formal… não entregue', 'faltam política e testes abrangentes'. Controles práticos existem (.graphifyignore:4-5 exclui segredos; .github/workflows/graphify.yml).| cético: grep -rli graphify docs/decisions/ → 0 (ADR-001..010 sem Graphify). docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:138-139 marca etapas 04/05 PARCIAL ('ADR formal… não foram entregues'; 'faltam política e testes'). Controles práticos existem: .graphifyignore:4-17 exclui segredos.

### F1458 · Handoff P001: Congelamento temporário de releases até classificar P0/P1

- **Tipo:** Doc/config
- **O que os docs afirmam:** Fila canônica do handoff (onda 1): Congelamento temporário de releases até classificar P0/P1. Todas as etapas começam pendentes; 0 de 100 executadas na data do handoff. Gate(s) conforme §13.
- **Fontes:** `docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:277-277`
- **O que falta:** Versionar registro de congelamento (período, exceções, critério P0/P1) ou marcar P001 como descartado no handoff.
- **Evidência:** Nenhum registro de congelamento/exceções: `grep -rni congelamento docs/execucao docs/decisions` → só docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:279,323 ('Aguarda acesso Lovable'). Proteção de main existe via ruleset (gh api repos/adm01-debug/Promo_Champions_V2.1/rules/branches/main): pull_request obrigatório (0 aprovações), required_status_checks 'CI Gate', deletion e non_fast_forward bloqueados.| cético: grep -rli 'congelamento\|release freeze\|code freeze' docs .github → só auditorias e STATUS_100_ETAPAS (sem registro de congelamento/exceções). Proteção de main existe via ruleset (citado pelo verificador; não re-verificado por mim).

### F1459 · Handoff P011: Matriz canônica de ambientes (origem, destino, staging, produção)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Fila canônica do handoff (onda 2): Matriz canônica de ambientes (origem, destino, staging, produção). Todas as etapas começam pendentes; 0 de 100 executadas na data do handoff. Gate(s) conforme §13.
- **Fontes:** `docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:292-292`
- **O que falta:** Criar matriz única origem/produção/staging/preview com estado de cada um e corrigir DEPLOYMENT.md:15.
- **Evidência:** Ambientes documentados de forma dispersa: docs/DEPLOYMENT.md:9-17 (componentes de produção: Vercel, Supabase usyxfpqlsspldubptrdl, edges, pg_cron), .github/ENVIRONMENTS.md:1-30 (environment `pr-preview` sem secrets), docs/agentes/banco-e-mcp.md:7-14 (identidade do banco), README.md:31, supabase/config.toml:1 project_id. Não há matriz única origem/destino/staging/produção (`grep -rln -i 'matriz.*ambiente' docs/` → só auditorias/planos). Incoerência: docs/DEPLOYMENT.md:15 diz 'Edge Functions (169)' enquanto repo tem 171 e produção 100 (deploy.yml:144).| cético: Peças dispersas: docs/DEPLOYMENT.md:9-17, .github/ENVIRONMENTS.md, docs/agentes/banco-e-mcp.md, supabase/config.toml, e também supabase/config.staging.toml + docs/STAGING.md:34 (staging declarado mas 'NÃO INICIADO' segundo docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:155). Nenhuma matriz única (grep…

### F1460 · Handoff P013: Manifesto versionado de deploy (projeto, função, hash, verify_jwt, data)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Fila canônica do handoff (onda 2): Manifesto versionado de deploy (projeto, função, hash, verify_jwt, data). Todas as etapas começam pendentes; 0 de 100 executadas na data do handoff. Gate(s) conforme §13.
- **Fontes:** `docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:294-294`
- **O que falta:** Gerar manifesto versionado (função, hash, verify_jwt, data, projeto) no deploy.yml.
- **Evidência:** ausente: `ls supabase/deploy-manifest*` → 0; `ls .github/workflows/deploy-edge*.yml` → 0; `grep -n manifest .github/workflows/deploy.yml` → 0. O que existe: allowlist literal em .github/workflows/deploy.yml:144 (100 nomes, sem hash/verify_jwt/data) e inventário gerado inventario/estado/banco.json edge_functions.publicadas (slug, versao, status, verify_jwt, atualizada_em; scripts/inventario/gerar-banco.mjs:186-194), que é observação do destino, não manifesto de deploy.| cético: ls supabase/ → sem deploy-manifest*; ls .github/workflows \| grep deploy-edge → 0. Existe só a allowlist de nomes (deploy.yml:144) e o inventário observado (inventario/estado/banco.json, scripts/inventario/gerar-banco.mjs:191), sem hash de bundle nem data de deploy por função gerados pelo deploy.

### F1462 · Handoff P017: Catálogo de owner e criticidade de módulos, tabelas, funções, jobs, buckets e integrações

- **Tipo:** Doc/config
- **O que os docs afirmam:** Fila canônica do handoff (onda 2): Catálogo de owner e criticidade de módulos, tabelas, funções, jobs, buckets e integrações. Todas as etapas começam pendentes; 0 de 100 executadas na data do handoff. Gate(s) conforme §13.
- **Fontes:** `docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:298-298`
- **O que falta:** Provisionar/remover @promo-ops e adicionar owner+criticidade por ativo em docs/agentes/mapa-do-sistema.md.
- **Evidência:** .github/CODEOWNERS:8-28 define owners por caminho (src/, supabase/, .github/, docs/), mas :5-7 admite que `@promo-ops` é 'conta de serviço/segundo admin a provisionar' (handle inexistente). Nenhum catálogo de criticidade por tabela/função/job/bucket/integração: `grep -rln -i criticidade docs/` → só auditorias/handoff; docs/agentes/mapa-do-sistema.md não tem coluna owner/criticidade.| cético: .github/CODEOWNERS:5-8 usa @promo-ops descrito como 'conta… a provisionar'; nenhum catálogo de criticidade por tabela/função/job/bucket (grep criticidade docs → só auditorias/handoff).

### F1463 · Handoff P020: Gates de alteração formalizados (backup, dry-run, revisão SQL, autorização, rollback)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Fila canônica do handoff (onda 2): Gates de alteração formalizados (backup, dry-run, revisão SQL, autorização, rollback). Todas as etapas começam pendentes; 0 de 100 executadas na data do handoff. Gate(s) conforme §13.
- **Fontes:** `docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:301-301`
- **O que falta:** Adicionar ao template checkboxes de backup prévio, dry-run e plano de rollback para migrations.
- **Evidência:** .github/pull_request_template.md:24-29 checklist obrigatório (tsc, eslint, vitest, build); :31-47 'Evidência Pós-Aplicação' obrigatória para supabase/migrations/** e supabase/functions/** com comando, saída literal e `server_time`; :49-55 checklist de segurança (RLS). Autorização do dono para DDL em AGENTS.md §5.8; rollback documentado em docs/DEPLOYMENT.md §7 e docs/execucao/ROLLBACK_HARDENING_CANONICO_2026-08-31.md. Faltam no template itens explícitos de backup prévio, dry-run e plano de rollback (grep -i 'rollback\|backup\|dry' .github/pull_request_template.md → 0).| cético: grep -n -i 'rollback\|backup\|dry\|revers\|snapshot' .github/pull_request_template.md → 0 resultados (83 linhas); template tem evidência pós-aplicação com server_time mas não gates de backup, dry-run nem rollback.

### F1464 · Handoff P070: Comparar verify_jwt, código e deploy por função origem/destino

- **Tipo:** Doc/config
- **O que os docs afirmam:** Fila canônica do handoff (onda 7): Comparar verify_jwt, código e deploy por função origem/destino. Todas as etapas começam pendentes; 0 de 100 executadas na data do handoff. Gate(s) conforme §13.
- **Fontes:** `docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:376-376`
- **O que falta:** Comparação automatizada config.toml × produção (alerta de divergência), reconciliar as 71 divergências e atualizar 10_EDGE_FUNCTIONS.md:69.
- **Evidência:** Lado destino inventariado: inventario/estado/banco.json edge_functions.publicadas traz verify_jwt real — 79 de 100 com verify_jwt=false (scripts/inventario/gerar-banco.mjs:191). Lado código: supabase/config.toml declara 22 blocos `verify_jwt = false`; contexto codigo/edge-functions.json verify_jwt_false = 22 (coerente com o toml). Divergência 79 × 22 não é comparada por nenhum script (`grep -n 'config.toml' scripts/inventario/gerar-banco.mjs` → 0) e docs/estado/10_EDGE_FUNCTIONS.md:69 ainda diz que config.toml lista 3 funções.| cético: Recalculei: supabase/config.toml tem 22 `verify_jwt = false`; banco.json publicadas tem 79 com verify_jwt=false; 64 publicadas com false não constam do toml e 7 do toml não estão false em produção. Nenhum script compara (grep verify_jwt scripts/inventario/*.mjs → só gerar-banco.mjs:191, coleta). docs/estado/10_EDGE_FUNCTIONS.md:69 diz 'config.toml lista 3…

### F1466 · Handoff P089: Padronizar lockfile e artefatos gerados (bundle-stats, supabase/.temp, graphify-out)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Fila canônica do handoff (onda 9): Padronizar lockfile e artefatos gerados (bundle-stats, supabase/.temp, graphify-out). Todas as etapas começam pendentes; 0 de 100 executadas na data do handoff. Gate(s) conforme §13.
- **Fontes:** `docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:405-405`
- **O que falta:** Adicionar `supabase/.temp/` e `bundle-stats/` ao .gitignore e `git rm -r --cached supabase/.temp` (gate AUTH-DELETE do handoff).
- **Evidência:** Lockfile único OK: `git ls-files| grep -E 'package-lock\|bun.lock'` → só package-lock.json; bun.lock/bun.lockb ausentes do disco. graphify-out ignorado: .gitignore:49-51. PENDENTE: `git ls-files supabase/.temp` → 8 arquivos versionados (gotrue-version, linked-project.json, pooler-url, postgres-version, project-ref, rest-version, storage-migration, storage-version) e nenhuma regra no .gitignore; bundle-stats/ gerado por vite.config.ts:63,72 (visualizer) sem regra no .gitignore (`git check-ignore bundle-stats/stats.html` → nenhuma). Handoff P089 segue `- [ ]` (HANDOFF...2026-08-30.md:405).
- **Revisão:** sem contestação cética concluída.

### F1467 · Handoff P090: Consolidar README/docs/runbooks e arquivar relatórios históricos

- **Tipo:** Doc/config
- **O que os docs afirmam:** Fila canônica do handoff (onda 9): Consolidar README/docs/runbooks e arquivar relatórios históricos. Todas as etapas começam pendentes; 0 de 100 executadas na data do handoff. Gate(s) conforme §13.
- **Fontes:** `docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:406-406`
- **O que falta:** Criar docs/README.md (índice atual) e marcar/mover relatórios históricos (docs/auditoria, docs/execucao, docs/handoff, docs/planos) com cabeçalho 'HISTÓRICO' ou pasta docs/historico/.
- **Evidência:** README.md:34,87,99-105,119 linka docs/DEPLOYMENT.md, DATA_DICTIONARY, SECURITY_HARDENING, ADRs e style-guide; docs/RUNBOOK.md:3-16 é índice operacional com links válidos. PENDENTE: não existe índice geral (docs/README.md, docs/INDEX.md ausentes), nenhuma pasta de arquivo (docs/arquivo\|archive\|historico ausentes) e `grep -rlE '^>*\*(HISTÓRICO\|ARQUIVADO\|OBSOLETO)' docs` → 0 arquivos marcados; docs/ tem 40+ relatórios/auditorias de datas diferentes (docs/auditoria, docs/execucao, docs/handoff, docs/planos) sem marcação. Handoff P090 segue `- [ ]` (HANDOFF...2026-08-30.md:406).
- **Revisão:** sem contestação cética concluída.

### F1471 · Hosting via Lovable Cloud sem headers custom (doc desatualizado — deploy é Vercel)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Doc afirma que deploy é Lovable Cloud sem suporte a headers; propõe Cloudflare ou Nginx na VPS. DEPLOYMENT.md diz Vercel, que suporta vercel.json.
- **Fontes:** `docs/SECURITY_HEADERS.md:10-20`
- **O que falta:** Atualizar docs/SECURITY_HEADERS.md §1 para Vercel/vercel.json (remover Lovable/Cloudflare/Nginx como pré-requisito) e avaliar adicionar Permissions-Policy no vercel.json.
- **Evidência:** Host real é Vercel: docs/DEPLOYMENT.md:4-6,13,18-23; vercel.json:9-56 entrega headers (X-Content-Type-Options, X-Frame-Options, CSP frame-ancestors, Referrer-Policy, HSTS). PENDENTE: docs/SECURITY_HEADERS.md:5,10-20 ainda afirma 'Hosting (Lovable Cloud)' sem suporte a headers e propõe Cloudflare/Nginx na VPS; package.json:75 mantém `@lovable.dev/cloud-auth-js` como dependência (não é host). Permissions-Policy e CSP completa como header (recomendados em SECURITY_HEADERS.md:24-27) não estão no vercel.json.
- **Revisão:** sem contestação cética concluída.

### F1476 · Inventário de functions deployadas em usyxf vs allowlist de crons

- **Tipo:** Doc/config
- **O que os docs afirmam:** PARCIAL: 20260910153000 e 20261001160000 centralizam URL via _internal_secrets; publicação das functions NÃO VERIFICÁVEL.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:33`
- **O que falta:** Publicar as 12 functions chamadas por cron (liberando vagas no limite de 100 ou subindo plano) ou desativar os 12 jobs em cron.md (ids 37,39,42,44,46,78,79,80,81,82,83,84,85,88) que hoje disparam 404.
- **Evidência:** Backend existe: snapshot supabase/tables.md:7 `public._internal_secrets` (RLS sim, policy 'Deny all access'); supabase/functions/public/trigger_internal_edge_job__f02f045c8b4350ab.sql:1-45 (SECURITY DEFINER, allowlist de 24 slugs, lê functions_base_url/anon_key/coaching_cron_secret); migrations 20260910153000 e 20261001160000 presentes. Inventário de publicadas existe: inventario/estado/banco.json edge_functions.publicadas (100 slugs, 2026-11-12) = allowlist .github/workflows/deploy.yml:144 (0 divergências). FALHA do critério: cron.md:22-51 chama 22 functions e 12 NÃO estão publicadas nem na allowlist: challenge-expiration-alerts, check-lead-sla, check-quote-expiration, check-v4-callback-alerts, process-call-recording-ingest, process-scheduled-sends, rotate-daily-challenges, scheduled-reports-runner, sdr-consecutive-alerts, send-alert-notifications, webvitals-regression-alert, winloss-w…
- **Revisão:** sem contestação cética concluída.

### F1477 · Inventário estático inventario/estado/rotas.json com edge functions por rota

- **Tipo:** Doc/config
- **O que os docs afirmam:** A coluna de edge functions chamadas vem de inventario/estado/rotas.json (gerado), complementada por checagem adversarial.
- **Fontes:** `docs/prod-readiness.md:70`
- **O que falta:** Rodar `node scripts/inventario/gerar-rotas.mjs` e commitar rotas.json atualizado (ou aguardar o workflow semanal).
- **Evidência:** inventario/estado/rotas.json existe: resumo.urls = 179, paginas_distintas 173, cada URL tem campo `edges` (78 URLs com edges), `rpcs`, `tabelas`, `hooks`; gerado por scripts/inventario/gerar-rotas.mjs; docs/prod-readiness.md:70 cita a fonte. FALHA: `node scripts/inventario/gerar-rotas.mjs --check` → 'inventario/estado/rotas.json desatualizado: rode node scripts/inventario/gerar-rotas.mjs e commite' (regenerar muda o arquivo no HEAD atual). Regeneração automática semanal em .github/workflows/inventario-estado-semanal.yml:24,74,100.
- **Revisão:** sem contestação cética concluída.

### F1479 · Lighthouse performance 95+

- **Tipo:** Doc/config
- **O que os docs afirmam:** Meta de Performance Score 95+ (Lighthouse).
- **Fontes:** `docs/FEATURE_SUMMARY.md:105-105`
- **O que falta:** Subir `minScore` de performance em .lighthouserc.json (ou registrar relatório Lighthouse de produção) para a meta deixar de ser só declarativa.
- **Evidência:** Medição automatizada existe: .github/workflows/pr-checks.yml:598-634 job `lighthouse` (treosh/lighthouse-ci-action 12.6.2, configPath .lighthouserc.json, só em pull_request); .lighthouserc.json:11 `categories:performance: [error, {minScore: 0.45}]`. A meta 95+ (docs/FEATURE_SUMMARY.md:105) não é gate nem relatório versionado — o gate aceita 45.
- **Revisão:** sem contestação cética concluída.

### F1480 · Limite de 100 Edge Functions deployadas (plano Supabase)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Só 100 das 173 functions podem estar deployadas; as demais respondem 404.
- **Fontes:** `docs/FUNCIONALIDADES_COMPLETAS.md:652-655`
- **O que falta:** Decidir por function entre publicar (vaga/plano) ou remover a chamada no front das 35 functions não publicadas; lista completa via edge-functions.json × deploy.yml:144.
- **Evidência:** Limite confirmado: .github/workflows/deploy.yml:140-144 (allowlist ACTIVE com 100 slugs; comentário cita 402 function.max_count), inventario/estado/banco.json edge_functions.publicadas = 100 (2026-11-12) idêntico à allowlist; no_repo = 171, no_repo_sem_deploy = 71. FALHA do critério 'cada function invocada pelo frontend deve estar deployada': docs/contexto/codigo/edge-functions.json `chamada_pelo_front` → 119 functions, das quais 35 fora da allowlist/não publicadas (ex.: send-quote-to-client, send-password-reset, twilio-click-to-call, push-subscribe, nlq-query, report-builder-execute, workflow-executor, sequence-enroll, qbr-generator, transcribe-call-recording…).
- **Revisão:** sem contestação cética concluída.

### F1483 · Limites do wrapper: 10 MiB por arquivo, 200 MiB por escopo, confirmação acima de 500 arquivos

- **Tipo:** Doc/config
- **O que os docs afirmam:** Wrapper limita cada arquivo a 10 MiB, escopo a 200 MiB e exige --allow-large-scope acima de 500 arquivos.
- **Fontes:** `docs/graphify/README.md:24,75`
- **O que falta:** Adicionar testes em scripts/graphify/extract-code-only.test.mjs para arquivo > 10 MiB, escopo > 200 MiB e > 500 arquivos com/sem --allow-large-scope.
- **Evidência:** Constantes presentes: scripts/graphify/extract-code-only.mjs:24 `LARGE_SCOPE_LIMIT = 500`, :27 `MAX_FILE_BYTES = 10*1024*1024`, :28 `MAX_SCOPE_BYTES = 200*1024*1024`, :44 flag `--allow-large-scope`, :135 inspectSourceScope(maximumFileBytes/maximumTotalBytes), :139-140 falha acima de 500 arquivos sem a flag. FALHA 'testadas': `grep -nE 'allow-large-scope\|maximumFileBytes\|maximumTotalBytes\|LARGE' scripts/graphify/extract-code-only.test.mjs scripts/graphify/graphify-utils.test.mjs` → 0; os 11 testes de extract-code-only.test.mjs:59-153 cobrem symlinks, versão, segredos e snapshot, não limites.
- **Revisão:** sem contestação cética concluída.

### F1487 · Literais de status soltos substituídos por constantes

- **Tipo:** Doc/config
- **O que os docs afirmam:** 70 ocorrências de status === completed\|won\|lost\|pending fora de testes (doc ~35).
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:177`
- **O que falta:** Substituir as 66 comparações literais por SALE_STATUS/DEAL_STATUS/WIN_LOSS_OUTCOME (ou criar TASK_STATUS/QUOTE_STATUS) e adicionar regra lint (no-restricted-syntax) para impedir regressão.
- **Evidência:** Constantes existem: src/constants/index.ts:27-33 DEAL_STATUS, :35-43 SALE_STATUS, :47-50 WIN_LOSS_OUTCOME. FALHA: `grep -rnE "status\s*===\s*['\"](completed\|won\|lost\|pending)['\"]" src --include='*.ts' --include='*.tsx'| grep -v test` → 66 ocorrências fora de testes; uso de `DEAL_STATUS.\|SALE_STATUS.\|TASK_STATUS.\|QUOTE_STATUS.\|LEAD_STATUS.` em src (sem testes) → 5. Doc B_funcionalidades_docs.md:177 contava 70.
- **Revisão:** sem contestação cética concluída.

### F1488 · Lockfile único e packageManager fixado

- **Tipo:** Doc/config
- **O que os docs afirmam:** Três lockfiles (package-lock.json, bun.lock, bun.lockb); CI usa npm ci, scripts dev/build usam bunx vite; bun.lockb no .gitignore mas versionado.
- **Fontes:** `docs/auditoria/RELATORIO_FALHAS.md:333-336`
- **O que falta:** Adicionar `"packageManager": "npm@<versão>"` em package.json e remover scripts dev:bun/build:bun.
- **Evidência:** Lockfile único OK: `git ls-files| grep -E '^(package-lock.json\|bun.lock\|bun.lockb)$'` → só package-lock.json; bun.lock/bun.lockb não existem no disco. Scripts principais usam npm/vite: package.json `dev: vite --host`, `build: vite build`; CI usa `npm ci` (pr-checks.yml:112-122, lighthouse :619). FALHA: `grep -n packageManager package.json` → 0 (só `engines.node >=22.0.0` em :188-190); scripts `dev:bun`/`build:bun` ainda usam `bunx vite` (package.json scripts).
- **Revisão:** sem contestação cética concluída.

### F1492 · Manifesto completo de candidatos de limpeza

- **Tipo:** Doc/config
- **O que os docs afirmam:** Etapa 91 P: CANDIDATOS_DE_LIMPEZA com 5 itens.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:90`
- **O que falta:** Atualizar o manifesto com colunas hash (sha256) e owner por item, marcar os itens já resolvidos (bun.lockb removido, deno.lock versionado) e registrar decisão para graphify-out/ e supabase/.temp/cli-latest.
- **Evidência:** docs/auditoria/CANDIDATOS_DE_LIMPEZA_2026-08-26.md existe (32 linhas) com exatamente 5 itens (linhas 11-15: deno.lock, supabase/.temp/cli-latest, graphify-out/, supabase/functions/graphify-out/, bun.lockb). `grep -ni 'hash\|owner\|sha'` no arquivo → 0 resultados (só 'responsável' na linha 23, genérico). Manifesto desatualizado: bun.lockb já foi removido (commit a24228771; CHANGELOG.md:185) e deno.lock passou a ser versionado com gate de drift (.github/workflows/pr-checks.yml:310-314).
- **Revisão:** sem contestação cética concluída.

### F1496 · Matriz canônica de ambientes e staging real

- **Tipo:** Doc/config
- **O que os docs afirmam:** P011 P: IDENTIDADE_BANCO; docs/STAGING.md só guia.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:122`
- **O que falta:** Provisionar projeto Supabase de staging, registrar o ref em docs/STAGING.md e em um environment GitHub 'staging' (.github/ENVIRONMENTS.md), e adicionar job de deploy para staging em deploy.yml.
- **Evidência:** Matriz de ambientes existe: docs/estado/IDENTIDADE_BANCO_2026-09-13.md:11-15 (3 projetos: usyxf canônico, rapjs antigo, saejq Lovable). Staging: docs/STAGING.md é só guia com placeholder `<STAGING_PROJECT_REF>` (linhas 20,29) e passo 'Criar o projeto' (linha 8); supabase/config.staging.toml existe. `grep -rni STAGING .github/workflows/*.yml` → 0 resultados; nenhum ref de projeto de staging no repo.
- **Revisão:** sem contestação cética concluída.

### F1498 · Matriz mínima de verificações por tipo de mudança (frontend, Edge, SQL/RLS, migration de dados, dependência, performance, deploy)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Verificações mínimas: frontend (typecheck, lint, testes, build, smoke, a11y); Edge (deno check, contratos, auth negativa, CORS, timeout, idempotência); SQL/RLS (replay, pgTAP por persona, EXPLAIN); migração de dados (contagem, PK/hash, dry-run, backup/restore); dependência (npm audit, bundle); deploy (manifesto, canário, rollback).
- **Fontes:** `docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:256-269`
- **O que falta:** Documentar a matriz em docs/agentes/github-ci.md mapeando cada tipo de mudança aos jobs existentes; adicionar gate de rollback/canário no deploy.yml e dry-run de migração de dados (db-backup.yml como pré-requisito).
- **Evidência:** CI cobre boa parte por tipo: frontend lint (pr-checks.yml:112), complexidade (119), typecheck (122), prettier (127), baseline (133), testes+coverage ratchet/ladder (250-288), build (591), lighthouse (630), bundle budget (668), a11y em a11y-sweep.yml; Edge: deno lint (319), type-check ratchet (325), deno tests (366-369), bundle check (deploy.yml:101-104); SQL: sql-tests (399) com supabase/tests/*.sql (rls_test_suite.sql, canonical_role_simulation.sql); migrations gate (184, deploy.yml:106-113); dependência: npm audit em job não-required (192-218), dependency-review.yml; deploy: allowlist (deploy.yml:144) + health check (deploy.yml:187-197). Ausentes: canário/rollback automatizado (deploy.yml:177-184 só imprime instruções), dry-run/backup-restore como gate de migração de dados, pgTAP por persona (`grep -rl pgtap\|pg_prove supabase/tests` → 0), matriz formal documentada ligando tipo de mud…
- **Revisão:** sem contestação cética concluída.

### F1502 · Monitor de uptime do frontend na URL Vercel

- **Tipo:** Doc/config
- **O que os docs afirmam:** DIVERGENTE: monitora championgifts.lovable.app.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:345`
- **O que falta:** Cadastrar o monitor no provedor escolhido e registrar no RUNBOOK.md o provedor, o link da status page e o canal de alerta (substituir 'a cadastrar'/'pendente').
- **Evidência:** Documento corrigido: docs/RUNBOOK.md:109 lista 'Frontend (Vercel) https://promo-champions-v2-1.vercel.app/' e :48 marca championgifts.lovable.app como legado. Porém a seção continua prescritiva: RUNBOOK.md:103 'Usar tier gratuito de UptimeRobot, BetterStack ou Checkly', :105 'Monitores a cadastrar', :118 status page '_pendente_'. Existência real do monitor externo não é verificável no repo.
- **Revisão:** sem contestação cética concluída.

### F1504 · Nomenclatura de circuitos `<provider>:<operation>`

- **Tipo:** Doc/config
- **O que os docs afirmam:** ADR-004: nomes slack:quote-conversion, webhook:{id}, twilio:call-status.
- **Fontes:** `docs/decisions/ADR-004-circuit-breaker-edge.md:20-20`
- **O que falta:** Envolver a chamada externa em twilio-call-status/index.ts com withEdgeCircuitBreaker('twilio:call-status') (e opcionalmente winloss-webhook-dispatcher com `webhook:${id}`), ou corrigir o ADR-004 para citar 'twilio:calls'.
- **Evidência:** Nomenclatura aplicada em 2 dos 3 exemplos do ADR (docs/decisions/ADR-004-circuit-breaker-edge.md:20): 'slack:quote-conversion' em supabase/functions/notify-quote-conversion/index.ts:100 (withEdgeCircuitBreaker) e `webhook:${wh.id}` em supabase/functions/dispatch-webhook/index.ts:189. 'twilio:call-status' ausente: `grep -rn 'twilio:call-status' supabase/functions` → 0 resultados; supabase/functions/twilio-call-status/index.ts não usa circuit breaker (`grep -n circuit` → 0); twilio-click-to-call/index.ts:223 usa 'twilio:calls'. winloss-webhook-dispatcher/index.ts também sem circuit (grep → 0). Tabela circuit_breaker_events existe com RLS (contexto/supabase/tables/public/circuit_breaker_events.md:7).
- **Revisão:** sem contestação cética concluída.

### F1508 · npm run ci espelha os gates (format, complexity, typecheck baseline, deps, coverage ladder, check-migrations, deno)

- **Tipo:** Doc/config
- **O que os docs afirmam:** package.json:52 ci não inclui esses passos.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:71`
- **O que falta:** Ampliar scripts.ci em package.json para incluir format:check, lint:complexity, typecheck:baseline, deps:check, check:migrations, coverage:ratchet, coverage:ladder e test:deno (ou criar `ci:full`).
- **Evidência:** package.json:52 `ci` = lint, typecheck, security:secrets, graphify:test, test:coverage, build, check-bundle-budget. O gate pr-checks.yml roda ainda: lint:complexity (119), format:check (127), typecheck:baseline (133), deps:check (141), check-migrations (184), coverage:ratchet (283), coverage:ladder (288), deno lint (319), deno type-check (325), deno tests (366). Nenhum desses está em `npm run ci`.
- **Revisão:** sem contestação cética concluída.

### F1509 · npm run deps:check com 8 avisos preexistentes de dependências órfãs

- **Tipo:** Doc/config
- **O que os docs afirmam:** Doc: deps:check sai com sucesso mas emite 8 avisos.
- **Fontes:** `docs/auditoria/VALIDACAO_EXAUSTIVA_ONDA_0_2026-08-26.md:24`
- **O que falta:** Mover os helpers/tipos importados por hooks (winLossFiltersHelpers, PeriodFilter, embedHelpers, funnelReportHelpers, cohortHelpers, raceTrackHelpers, follow-up/types, briefingHelpers, criticalMomentsHelpers, conversationHelpers) de src/components para src/lib ou src/hooks, zerando os 14 avisos.
- **Evidência:** `npm run deps:check` no HEAD: 'x 14 dependency violations (0 errors, 14 warnings)' — todas regra hooks-not-to-ui (ex.: src/hooks/sales/useSalespeople.ts → src/components/vendedores/PeriodFilter.tsx; src/hooks/executive-briefing/*.ts → components/executive-briefing/briefingHelpers.ts). Gate roda em pr-checks.yml:141 mas warnings não falham. Avisos passaram de 8 (doc) para 14.
- **Revisão:** sem contestação cética concluída.

### F1510 · Observabilidade: runbooks/alertas-operacionais.md

- **Tipo:** Doc/config
- **O que os docs afirmam:** P096 P: slo_burn_rate.sql; alertas-operacionais.md; SLACK_CI_WEBHOOK_URL não criado.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:185`
- **O que falta:** Criar job pg_cron (*/15) chamando public.fn_check_slo_burn_rate() via migration; adicionar coluna owner por alerta/dashboard no runbook; criar o secret SLACK_CI_WEBHOOK_URL no GitHub.
- **Evidência:** docs/runbooks/alertas-operacionais.md existe (65 linhas) com envs, exportadores e links por integração. fn_check_slo_burn_rate existe no banco (contexto/supabase/functions.md:179,193) mas sem cron: `grep -i slo contexto/supabase/cron.md` → só detect_slow_queries_hourly; o próprio runbook :65 diz 'Agendamento (pg_cron) pendente'. Sem owner: `grep -i 'owner\|dashboard' alertas-operacionais.md` → 0 resultados. SLACK_CI_WEBHOOK_URL só referenciado em pr-checks.yml:739-752 (no-op se ausente); presença do secret não verificável (gh secret list → HTTP 403).
- **Revisão:** sem contestação cética concluída.

### F1511 · on-call: confirmação/rollback via Vercel (não Lovable)

- **Tipo:** Doc/config
- **O que os docs afirmam:** DIVERGENTE.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:330`
- **O que falta:** Atualizar docs/runbooks/on-call.md linhas 22,28,30,33,46 para URL https://promo-champions-v2-1.vercel.app e rollback via Vercel → Deployments → Promote/Redeploy (como RUNBOOK.md:64).
- **Evidência:** docs/runbooks/on-call.md continua com Lovable: :28 'reprodução manual em championgifts.lovable.app', :30 'frontend (Lovable)', :33 'rollback Lovable', :46 'Deploy/rollback frontend: painel Lovable → History', :22 'Admin Supabase/Lovable'. Já corrigido só em docs/RUNBOOK.md:22-27,64 (deploy/rollback via Vercel) — on-call diverge do RUNBOOK.
- **Revisão:** sem contestação cética concluída.

### F1515 · Padrão de branch fix/hermes-<id>-p001-p006-<slug> no handoff vs claude/<tipo>-<slug>-<AAMMDD-HHMM> no AGENTS.md

- **Tipo:** Doc/config
- **O que os docs afirmam:** Handoff exige branch no padrão do AGENTS.md com IDs das etapas (exemplo fix/hermes-<id>-p001-p006-conter-migrate-helper) e commit com --no-verify; AGENTS.md atual exige claude/<tipo>-<slug>-<AAMMDD-HHMM> e proíbe --no-verify.
- **Fontes:** `docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:115-128`
- **O que falta:** Anotar no handoff (§7, linhas 115-128) que a convenção foi substituída por AGENTS.md §5 e remover a instrução de `--no-verify`, ou mover o handoff para pasta/banner de histórico.
- **Evidência:** AGENTS.md:42-43 define convenção única (branch `claude/<tipo>-<slug>-<AAMMDD-HHMM>`, proíbe `--no-verify`) e AGENTS.md:3 diz que vence docs/. Hooks coerentes: .husky/commit-msg:1 (`npx --no -- commitlint --edit`), .husky/pre-commit:1 (`npx lint-staged`), commitlint.config.js:4-15 type-enum. Porém docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:118-128 ainda prescreve `fix/hermes-<id>-p001-p006-...` e `usar --no-verify conforme a regra do projeto`, sem marcação de superado/histórico (cabeçalho linhas 1-10 não anota).
- **Revisão:** sem contestação cética concluída.

### F1517 · Perfil graphify.local.json e estado .tools/graphify/local-state/

- **Tipo:** Doc/config
- **O que os docs afirmam:** Grafo local usa perfil específico e estado em .tools.
- **Fontes:** `docs/AUTOMACAO_LOCAL.md:39`
- **O que falta:** Alinhar graphify.local.json:7 (`state`) com `.tools/graphify/local-state/` ou adicionar `tools/graphify/.venv/` ao .gitignore; atualizar docs/AUTOMACAO_LOCAL.md:39 conforme a escolha.
- **Evidência:** graphify.local.json existe na raiz (23 linhas) e é lido por scripts/automation.mjs:977; .gitignore:60 ignora `/.tools/graphify/local-state/` como docs/AUTOMACAO_LOCAL.md:39 descreve. Porém graphify.local.json:7 aponta `"state": "tools/graphify/.venv/graphify-local-state"` (caminho diferente), que não é ignorado (`git check-ignore -v tools/graphify/.venv/graphify-local-state` → vazio; grep -i venv .gitignore → 0), enquanto scripts/graphify-local.mjs:880 exige `confined(root, config.state, { ignored: true })`.
- **Revisão:** sem contestação cética concluída.

### F1521 · Plano 30/08 etapa 11 (P011): Matriz canônica de ambientes (origem, destino, staging, produção)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Etapa 11 do plano de 100 etapas (auditoria 30/08; = P011 do handoff): Definir formalmente origem, destino, staging e produção, eliminando ambiguidade entre README, CLAUDE.md, config e MCPs.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:660-660`
- **O que falta:** Documento único (ex.: docs/agentes/ambientes.md) com matriz produção/staging/preview Vercel/pr-preview, refs, quem deploya e status (existe/não existe), referenciado em AGENTS.md §6-7.
- **Evidência:** AGENTS.md:62 define produção única `usyxfpqlsspldubptrdl` ("Nenhum outro Supabase ... é deste repo"); supabase/config.toml:1 project_id coerente; docs/estado/IDENTIDADE_BANCO_2026-09-13.md:1-6 prova reproduzível da identidade; docs/STAGING.md:3-5 é guia para staging que não existe; supabase/config.staging.toml:1-3 existe. Documento "matriz canônica de ambientes": `grep -rn -i "matriz canônica de ambientes\\|matriz de ambientes" docs AGENTS.md README.md` → só a etapa na auditoria e A_planos_execucao.md:122 (status P).
- **Revisão:** sem contestação cética concluída.

### F1522 · Plano 30/08 etapa 13 (P013): Manifesto versionado de deploy (projeto, função, hash, verify_jwt, data)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Etapa 13 do plano de 100 etapas (auditoria 30/08; = P013 do handoff): Criar manifesto versionado de deploy com rastreabilidade entre Git e Supabase.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:662-662`
- **O que falta:** Step em .github/workflows/deploy.yml que grave manifesto (função, sha do commit, verify_jwt de supabase/config.toml, data) em arquivo versionado, ou declarar banco.json como manifesto oficial e acrescentar o sha.
- **Evidência:** `ls supabase/deploy-manifest*` → 0; `grep -in manifest .github/workflows/deploy.yml` → 0; deploy.yml:144 usa allowlist ACTIVE em texto (só nomes). O mais próximo é inventario/estado/banco.json → edge_functions.publicadas (100 itens com slug, versao, status, verify_jwt, atualizada_em; gerado por scripts/inventario/gerar-banco.mjs:187-193 via Management API e versionado pelo workflow inventario-estado-semanal.yml), mas sem hash Git nem geração no momento do deploy.
- **Revisão:** sem contestação cética concluída.

### F1524 · Plano 30/08 etapa 17 (P017): Catálogo de owner e criticidade de módulos, tabelas, funções, jobs, buckets e integrações

- **Tipo:** Doc/config
- **O que os docs afirmam:** Etapa 17 do plano de 100 etapas (auditoria 30/08; = P017 do handoff): Atribuir owner e criticidade com SLA e contato de decisão.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:666-666`
- **O que falta:** Catálogo (ex.: docs/agentes/owners-criticidade.md) com owner, criticidade e SLA por módulo/tabela/cron/bucket/integração; provisionar @promo-ops e ativar code owner review no ruleset.
- **Evidência:** .github/CODEOWNERS:8-31 atribui owners por caminho, mas `@promo-ops` é "conta a provisionar" (linhas 5-7) e o ruleset da main tem require_code_owner_review=false. docs/agentes/mapa-do-sistema.md não traz owner/criticidade/SLA por ativo (`grep -n -i "owner\\|criticidade\\|SLA"` → só SLA de leads, linhas 12 e 46). Sem catálogo para tabelas, jobs, buckets e integrações.
- **Revisão:** sem contestação cética concluída.

### F1525 · Plano 30/08 etapa 20 (P020): Gates de alteração formalizados (backup, dry-run, revisão SQL, autorização, rollback)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Etapa 20 do plano de 100 etapas (auditoria 30/08; = P020 do handoff): Formalizar gates de alteração; checklist obrigatório por PR e release.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:669-669`
- **O que falta:** Adicionar ao template itens de backup prévio, dry-run (`supabase db push --dry-run`/plano) e plano de rollback referenciando docs/ROLLBACK.md.
- **Evidência:** .github/pull_request_template.md:26-50 tem checklist obrigatório (tsc, eslint, vitest, build) e seção "Evidência Pós-Aplicação" com server_time obrigatória para migrations/functions; :54-59 checklist de segurança (RLS). `grep -n -i "rollback\\|backup\\|dry-run" .github/pull_request_template.md` → 0. Gate automático em .github/workflows/pr-checks.yml:166 ("Migrations Gate") e :184 (Validate migrations); docs/ROLLBACK.md existe.
- **Revisão:** sem contestação cética concluída.

### F1526 · Plano 30/08 etapa 70 (P070): Comparar verify_jwt, código e deploy por função origem/destino

- **Tipo:** Doc/config
- **O que os docs afirmam:** Etapa 70 do plano de 100 etapas (auditoria 30/08; = P070 do handoff): Inventário implantado validado e deploy somente após autorização.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:734-734`
- **O que falta:** Em scripts/inventario/gerar-banco.mjs, comparar verify_jwt publicado × supabase/config.toml por função e emitir alerta `verify_jwt_divergente` em banco.json.alertas.
- **Evidência:** verify_jwt do destino é capturado em inventario/estado/banco.json (edge_functions.publicadas[].verify_jwt, via scripts/inventario/gerar-banco.mjs:191) e o do código em supabase/config.toml (23 entradas) / contexto/codigo/edge-functions.json (verify_jwt_false). Mas compararEdges (gerar-banco.mjs:185-196) só compara slugs, não verify_jwt; nenhum script cruza os dois (`grep -rln verify_jwt scripts .github/workflows` → só leitura em gerar-banco.mjs e gen-api-catalog.mjs). Deploy só após autorização: deploy.yml:119 `environment: production`. Comparação com "origem" Lovable não se aplica.
- **Revisão:** sem contestação cética concluída.

### F1528 · Plano 30/08 etapa 89 (P089): Padronizar lockfile e artefatos gerados (bundle-stats, supabase/.temp, graphify-out)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Etapa 89 do plano de 100 etapas (auditoria 30/08; = P089 do handoff): Lista de limpeza aprovada, sem exclusão por inferência.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:759-759`
- **O que falta:** Decidir e executar: `git rm -r --cached supabase/.temp` + regra `supabase/.temp/` no .gitignore (ou documentar que são mantidos de propósito); adicionar `bundle-stats/` ao .gitignore.
- **Evidência:** Lockfile único: só package-lock.json (bun.lockb/yarn.lock/pnpm-lock.yaml ausentes; README.md:19). graphify-out: .gitignore:49-51 ignora tudo exceto GRAPH_REPORT.md e manifest.json (intencional). bundle-stats/: diretório inexistente e sem regra no .gitignore. Problema: `git ls-files| grep supabase/.temp` → 8 arquivos versionados (gotrue-version, linked-project.json, pooler-url, postgres-version, project-ref, rest-version, storage-migration, storage-version) e `.temp` não consta no .gitignore (`grep -n ".temp" .gitignore` → 0). A_planos_execucao.md:30 usa esses arquivos como "fingerprint".
- **Revisão:** sem contestação cética concluída.

### F1529 · Plano 30/08 etapa 90 (P090): Consolidar README/docs/runbooks e arquivar relatórios históricos

- **Tipo:** Doc/config
- **O que os docs afirmam:** Etapa 90 do plano de 100 etapas (auditoria 30/08; = P090 do handoff): Fonte de verdade atual com data, ambiente e status explícitos.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:760-760`
- **O que falta:** Criar docs/README.md com índice (atual × histórico, data, ambiente) e inserir banner "HISTÓRICO — superado por ..." nos docs de docs/auditoria, docs/handoff e docs/execucao.
- **Evidência:** Fonte atual existe: README.md:1-123 (Quick Start, lockfile único, banco), AGENTS.md (aponta docs/agentes/* como canônico), docs/DOCUMENTACAO_SISTEMA.md:1-10 (revisado 2026-10-18), docs/estado/README.md (índice, mas de 2026-08-16). Faltam índice geral (docs/README.md, docs/INDEX.md inexistentes) e marcação de histórico: `grep -rln -i "hist[óo]rico\\|ARQUIVADO" docs/auditoria docs/handoff docs/execucao` (cabeçalhos) → 0 de 19+ arquivos; o handoff ainda contradiz AGENTS.md (F1515).
- **Revisão:** sem contestação cética concluída.

### F1536 · PR #254 TS 6→7 + vite-plugin-pwa 1→2 (decisão humana)

- **Tipo:** Doc/config
- **O que os docs afirmam:** PR #254 majors aguarda decisão.
- **Fontes:** `docs/auditoria/RELATORIO_FINAL.md:50`
- **O que falta:** Decisão pendente só para TypeScript 7 (revertido em #516): registrar em docs se/quando migrar; atualizar RELATORIO_FINAL.md:50.
- **Evidência:** PR #254: state=closed, merged_at=null (2026-10-31), superada por #347 (mergeada, commit b5797bd8b). vite-plugin-pwa ^2.0.0 em package.json:185. TypeScript: subiu para 7 em #347 e foi revertido deliberadamente para 5.9.3 pelo commit 80b3a0b80 "fix(deps): reverte typescript 7 para 5.9.3 e ajusta o ratchet (#516)" (package.json:182).
- **Revisão:** sem contestação cética concluída.

### F1541 · PR draft com trilha de auditoria e changelog

- **Tipo:** Doc/config
- **O que os docs afirmam:** Etapa 50: consolidar relatório final, changelog e abrir PR com trilha de auditoria.
- **Fontes:** `docs/auditoria/00_PLANO_MESTRE_AUDITORIA.md:135`
- **O que falta:** Adicionar no CHANGELOG.md entrada com as correções da auditoria (C1–C10, referência a RELATORIO_FINAL.md) e atualizar 00_PLANO_MESTRE_AUDITORIA.md:139-142 ('Estado atual') para refletir que as Fases 4–5 foram entregues no PR #350.
- **Evidência:** docs/auditoria/RELATORIO_FINAL.md existe (data 2026-10-31, escopo Fases 0–5, commit 7e7ca4342 via PR #350). CHANGELOG.md existe (release-please, v1.6.0 em CHANGELOG.md:3) mas não referencia a auditoria nem as correções dos CRÍTICOs: grep -n -i 'auditoria' CHANGELOG.md → só linha 17 (webhook) e 163 ('Auditoria 20 dimensões', PR #90 de 2026-09-03, outra auditoria). docs/auditoria/00_PLANO_MESTRE_AUDITORIA.md:142 ainda declara Fases 3–5 pendentes, contradizendo RELATORIO_FINAL.md:5.
- **Revisão:** sem contestação cética concluída.

### F1549 · Ratchet de `as unknown` (TYPE_DEBT/TECH_DEBT)

- **Tipo:** Doc/config
- **O que os docs afirmam:** 168 ocorrências em 127 arquivos do src (docs dizem 155/122 e 214); functions 22 (doc 20). DIVERGENTE.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:175`
- **O que falta:** Adicionar step em pr-checks.yml que rode scripts/debt-report.mjs (ou grep) e falhe se a contagem de 'as unknown' superar um baseline versionado; recontar e unificar os números em docs/TYPE_DEBT.md:35-38 e docs/TECH_DEBT.md:14 (hoje 168 src / 39 functions).
- **Evidência:** docs/TYPE_DEBT.md:33-38 baseline 155 ocorrências/122 arquivos; docs/TECH_DEBT.md:14 diz 214 em src + 20 em functions — docs divergem. Contagem atual: grep -rn 'as unknown' src → 168 ocorrências em 128 arquivos; supabase/functions → 39. Gate: eslint.config.js:68-74 no-restricted-syntax 'warn' para 'as unknown as' (vira bloqueio com --max-warnings 0, mas cada site legado tem eslint-disable). scripts/debt-report.mjs:194-195 conta os casts, mas não é chamado em CI (grep -rn 'debt-report\|debt:report' .github/workflows → 0; só package.json:59). Não há ratchet numérico (baseline que falhe se subir) para 'as unknown' em .github/workflows/pr-checks.yml (os ratchets de :118,:132,:282 são complexidade, strict typecheck e cobertura). src/lib/supabase/parseRows.ts existe e é usado (ex.: src/hooks/reporting/useCustomReports.ts).
- **Revisão:** sem contestação cética concluída.

### F1551 · README dos workflows cobre os 16

- **Tipo:** Doc/config
- **O que os docs afirmam:** .github/workflows/README.md documenta só 8 dos 16.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:57`
- **O que falta:** Adicionar ao .github/workflows/README.md uma seção por workflow faltante (gatilho, o que faz, secrets exigidos) para os 15 listados.
- **Evidência:** .github/workflows/README.md (80 linhas) documenta 12 workflows (seções em :8,:14,:20,:25,:30,:35,:41,:47,:52,:58,:63,:68). Existem 27 arquivos .yml em .github/workflows/. Não documentados (15): a11y-sweep.yml, apply-migration.yml, automation-local.yml, ci-failure-alert.yml, db-backup.yml, db-probe.yml, dependabot-automerge.yml, dependabot-fix-lockfile.yml, dependency-review.yml, deploy.yml, edge-functions-input-validation.yml, main.yml, migrations-drift.yml, pr-review-sla.yml, release-please.yml (grep do nome com e sem .yml no README → 0).
- **Revisão:** sem contestação cética concluída.

### F1553 · Referência 'CLAUDE.md §4' para lista de edge functions por domínio

- **Tipo:** Doc/config
- **O que os docs afirmam:** ARCHITECTURE diz que a lista completa de edge functions por domínio está em CLAUDE.md §4.
- **Fontes:** `docs/ARCHITECTURE.md:50-50`
- **O que falta:** Corrigir docs/ARCHITECTURE.md:50 para apontar a docs/agentes/mapa-do-sistema.md (ou AGENTS.md §6).
- **Evidência:** docs/ARCHITECTURE.md:50 'A lista completa de edge functions por domínio está em CLAUDE.md §4'. CLAUDE.md contém apenas '@AGENTS.md' (1 linha). AGENTS.md §4 (linha 29) é 'Comunicação'; a remissão correta é AGENTS.md §6 (linha 52) → docs/agentes/mapa-do-sistema.md, que existe. Referência desatualizada/quebrada.
- **Revisão:** sem contestação cética concluída.

### F1555 · Referências de projeto apontam para três refs (config.toml, .temp, index.html, envs, scripts, CI)

- **Tipo:** Doc/config
- **O que os docs afirmam:** config.toml, supabase/.temp, index.html, envs, scripts e CI apontam hoje para três project refs diferentes.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:673-673`
- **O que falta:** Trocar o DEFAULT_BASE_URL em scripts/verify-dispatcher-request-id.sh:18 para https://usyxfpqlsspldubptrdl.supabase.co/functions/v1.
- **Evidência:** Apontam para usyxfpqlsspldubptrdl: supabase/config.toml:1, supabase/.temp/project-ref, src/integrations/supabase/env.ts:5, index.html:45-46, .env.example:12, .github/workflows/deploy.yml:21,137, db-backup.yml:66-67, db-probe.yml:41-42 (guards que abortam se o ref for outro). Residual divergente: scripts/verify-dispatcher-request-id.sh:18 DEFAULT_BASE_URL="https://saejqkojleeaxzrslzfg.supabase.co/functions/v1" (ref de outro projeto). Nenhuma outra ocorrência: grep -rn saejqkojleeaxzrslzfg src supabase/config.toml .github index.html → 0.
- **Revisão:** sem contestação cética concluída.

### F1559 · Registro de progresso docs/execucao/STATUS_PLANO_100_ETAPAS.md com campos obrigatórios

- **Tipo:** Doc/config
- **O que os docs afirmam:** Na primeira PR de execução, criar docs/execucao/STATUS_PLANO_100_ETAPAS.md com ID P001–P100, Estado, Owner, Evidência, Autorização, PR/commit, Testes, Deploy, Rollback, Resultado.
- **Fontes:** `docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:146-165`
- **O que falta:** Criar docs/execucao/STATUS_PLANO_100_ETAPAS.md (ou renomear o existente) com uma linha P001–P100 e as 10 colunas: ID, Estado, Owner, Evidência, Autorização, PR/commit, Testes, Deploy, Rollback, Resultado.
- **Evidência:** docs/execucao/STATUS_PLANO_100_ETAPAS.md ausente (ls → No such file). Existe docs/execucao/STATUS_100_ETAPAS_2026-08-30.md com matriz diferente: colunas '\| Ref.| Achado \| Origem na fonte \| Status \| Evidência \|' (:66) e '\| Item \| Estado \| Evidência \|' (:19); não tem as 10 colunas obrigatórias de docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:152-163 (Owner, Autorização, PR/commit, Testes, Deploy, Rollback, Resultado ausentes: grep 'Owner\|Autorização\|Rollback' → 0 cabeçalhos de tabela).
- **Revisão:** sem contestação cética concluída.

### F1576 · Runbook cron-failures: bootstrap das 3 chaves de _internal_secrets

- **Tipo:** Doc/config
- **O que os docs afirmam:** DIVERGENTE/bloqueante.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:324`
- **O que falta:** Inserir `functions_base_url` e `anon_key` em public._internal_secrets via MCP db_query (valores públicos: URL do projeto e publishable key) e adicionar seção 'Bootstrap' em docs/runbooks/cron-failures.md com o INSERT (sem valor de segredo) e o `SELECT key FROM _internal_secrets` de verificação.
- **Evidência:** Runbook existe e cita as chaves: docs/runbooks/cron-failures.md:10-11,20 (`_internal_secrets.functions_base_url`, `coaching_cron_secret`), mas não documenta bootstrap/inserção (`grep -i bootstrap docs/runbooks/*.md` → 0; `grep -rl 'INSERT INTO public._internal_secrets' docs supabase/migrations scripts` → 0). Banco real: tabela public._internal_secrets existe com RLS e policy deny-all (snapshot tables/public/internal_secrets.md), porém stats.md:238 mostra apenas 1 linha → só uma chave presente (compatível com C_estado_runbooks.md:308 'só coaching_cron_secret'). As funções em produção dependem das 3 chaves: functions/public/trigger_internal_edge_job__f02f045c8b4350ab.sql:56 (`RAISE EXCEPTION 'internal_edge_job_secrets_missing'`), broadcast_sale_completed:40, trigger_campaign_health_alert:13.
- **Revisão:** sem contestação cética concluída.

### F1585 · Sandbox environments

- **Tipo:** Doc/config
- **O que os docs afirmam:** Falta ambiente sandbox.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:212`
- **O que falta:** Decisão do dono (custo/arquitetura): habilitar Supabase Branching persistente ou projeto staging separado e apontar o e2e (pr-checks.yml:462-480) para ele; documentar em docs/agentes/.
- **Evidência:** Não há sandbox para clientes/dev no repo. O environment `pr-preview` (.github/workflows/pr-checks.yml:469-472; .github/ENVIRONMENTS.md:3-9) existe só para restringir deployments de fork — 'não para injetar credenciais' — e o job e2e roda apenas em workflow_dispatch (pr-checks.yml:471), apontando para o Supabase de produção. Supabase Branching ('Supabase Preview') é citado como ativo em docs/agentes/achados-auditoria-261117.md:129-136 e replay-do-repo-261117.md:113, mas é configuração externa (painel Supabase), sem artefato no repo (`grep -n branch supabase/config.toml` → 0). GAPS_CLASSE_MUNDIAL.md:212 mantém como gap.
- **Revisão:** sem contestação cética concluída.

### F1588 · Script gerador do catálogo de API `scripts/gen-api-catalog.mjs`

- **Tipo:** Doc/config
- **O que os docs afirmam:** API.md afirma ser gerado automaticamente por `scripts/gen-api-catalog.mjs` a partir do código-fonte, atualizável com `node scripts/gen-api-catalog.mjs`.
- **Fontes:** `docs/API.md:1-4`
- **O que falta:** Rodar `node scripts/gen-api-catalog.mjs` e commitar docs/API.md (PR docs:), ou adicionar step no CI (pr-checks.yml) que falhe se o catálogo estiver desatualizado.
- **Evidência:** scripts/gen-api-catalog.mjs existe (14 KB; FN_DIR :17, OUT docs/API.md :21, 'Total: N functions' :222) e roda sem erro: `node scripts/gen-api-catalog.mjs` → 'docs/API.md gerado: 171 functions, 180 rotas, 380 RPCs'. Porém o docs/API.md commitado está defasado: API.md:27 'Total: 169 functions' vs 171 geradas (ls supabase/functions → 172 pastas incl. _shared); `git diff --stat docs/API.md` após regenerar → 775 inserções / 722 remoções (não é só data). Arquivo restaurado com git checkout após o teste.
- **Revisão:** sem contestação cética concluída.

### F1598 · Secrets de CI referenciados: E2E_TEST_EMAIL, VITE_SUPABASE_*, SUPABASE_URL, SUPABASE_ANON_KEY

- **Tipo:** Doc/config
- **O que os docs afirmam:** Workflows referenciam esses secrets; existência não verificável pela auditoria.
- **Fontes:** `docs/estado/12_INFRA_CI_TESTES.md:432-436`
- **O que falta:** SUPABASE_DB_PASSWORD é referenciado e não existe como Actions secret: confirmar se o job que o usa faz skip. Os secrets opcionais (SLACK/N8N/AWS) também não existem, então alertas e backup S3 nunca rodam. Corrigir docs/estado/12_INFRA_CI_TESTES.md:432-436, que cita SUPABASE_URL/SUPABASE_ANON_KEY, sem referência em workflow.
- **Evidência:** Actions secrets do repo (github_list_actions_secrets, 10 nomes): BACKUP_ENCRYPTION_KEY, E2E_TEST_EMAIL, E2E_TEST_PASSWORD, RESEND_API_KEY, SUPABASE_ACCESS_TOKEN, SUPABASE_DB_URL, SUPABASE_SERVICE_ROLE_KEY, VITE_SUPABASE_PROJECT_ID, VITE_SUPABASE_PUBLISHABLE_KEY, VITE_SUPABASE_URL. Referências nos workflows (`grep -rhoE 'secrets\.[A-Z0-9_]+' .github/workflows/*.yml`): VITE_SUPABASE_URL(9), VITE_SUPABASE_PUBLISHABLE_KEY(9), E2E_TEST_PASSWORD(7), E2E_TEST_EMAIL(7), SUPABASE_ACCESS_TOKEN(6), SUPABASE_DB_URL(5), SLACK_CI_WEBHOOK_URL(4), SUPABASE_SERVICE_ROLE_KEY(2), AWS_BACKUP_ACCESS_KEY_ID/SECRET_ACCESS_KEY(2), VITE_SUPABASE_PROJECT_ID(1), SUPABASE_DB_PASSWORD(1), N8N_ALERT_WEBHOOK_URL/SECRET(1), BACKUP_ENCRYPTION_KEY(1). `secrets.SUPABASE_URL` e `secrets.SUPABASE_ANON_KEY` → 0 referências nos workflows e não existem como secret (afirmação do doc desatualizada). Environments (github_list_en…

### F1602 · Segredo SUPABASE_ANON_KEY lido por 52 edge function(s)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Público por natureza. Doc extrai via grep de Deno.env.get; não verifica se o segredo está configurado no projeto.
- **Fontes:** `docs/estado/10_EDGE_FUNCTIONS.md:125-134`
- **O que falta:** Corrigir a contagem no doc (41 functions, 15 deployadas). Execução sem erro de env não comprovada.
- **Evidência:** `grep -rl "Deno.env.get(['\"]SUPABASE_ANON_KEY" supabase/functions --include=*.ts` → 41 arquivos (39 index.ts), não 52 como o doc afirma (docs/estado/10_EDGE_FUNCTIONS.md:125-134); ex.: supabase/functions/external-db-bridge/index.ts:123 `Deno.env.get('SUPABASE_ANON_KEY')!`. SUPABASE_ANON_KEY é injetada automaticamente pela plataforma Supabase em edge functions deployadas (não é secret manual). Execução sem erro de env não pôde ser testada: host usyxfpqlsspldubptrdl.supabase.co bloqueado pelo proxy (403) e sem MCP do projeto nesta sessão.| cético: `grep -rl SUPABASE_ANON_KEY supabase/functions --include=*.ts` → 42 arquivos em 41 pastas de function (fora _shared), não 52 como diz docs/estado/10_EDGE_FUNCTIONS.md:125-134. Dessas pastas, só 15 estão na allowlist ACTIVE de deploy.yml:144 (cruzamento com `grep -xf`); as outras 26 não rodam em produção. Ex.: external-db-bridge/index.ts:123 e e…

### F1607 · Site https://promo-champions-v2-1.vercel.app no ar com rewrite SPA

- **Tipo:** Doc/config
- **O que os docs afirmam:** GET / → 200; o rewrite responde 200 para qualquer caminho (SPA).
- **Fontes:** `docs/prod-readiness.md:892`
- **O que falta:** Confirmar ao vivo que GET / e GET /vendas retornam 200 com text/html.
- **Evidência:** vercel.json:3-8 `"rewrites": [{"source": "/(.*)", "destination": "/index.html"}]` (rewrite SPA presente). github_get_repo.homepage = https://promo-champions-v2-1.vercel.app. Último deploy Vercel em Production: deployment 7929795796 (sha 90170947, 2026-11-20T00:35:35Z) com status `success` 'Deployment has completed' (github_list_deployment_statuses). GET / e GET /vendas NÃO puderam ser executados: `curl https://promo-champions-v2-1.vercel.app/` → 'CONNECT tunnel failed, response 403' (proxy da sessão bloqueia o host) — verificação de 200 ao vivo ausente.| cético: vercel.json:3-8 tem o rewrite `/(.*)` → `/index.html`. github_get_repo.homepage = https://promo-champions-v2-1.vercel.app. GET ao vivo não executado porque o proxy da sessão bloqueia o host; não tenho evidência nova para mudar o veredito.

### F1608 · SLOs com Sentry DSN e monitor externo

- **Tipo:** Doc/config
- **O que os docs afirmam:** PARCIAL: Sentry opcional por VITE_SENTRY_DSN (errorTracking.ts:35-43); fn_check_slo_burn_rate sem cron.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:419`
- **O que falta:** Criar o job pg_cron `*/15 * * * *` → `SELECT public.fn_check_slo_burn_rate()`. Colocar `health` na allowlist de deploy.yml:144 (liberando uma vaga). Configurar VITE_SENTRY_DSN na Vercel. Cadastrar o monitor externo e registrar o link em docs/RUNBOOK.md:118.
- **Evidência:** Sentry opcional: src/lib/errorTracking.ts:42-43 retorna cedo sem VITE_SENTRY_DSN (DSN não comprovado — ver F1604). fn_check_slo_burn_rate existe no banco real (snapshot functions.md:179, plpgsql, SECURITY DEFINER, grant service_role, comentário 'Agendar via pg_cron a cada 15min') e fn_slo_burn_rate (functions.md:193), mas `grep -in 'slo\\|burn' cron.md` → só detect_slow_queries_hourly (cron.md:20); nenhum job pg_cron chama fn_check_slo_burn_rate nos 45 jobs. Monitor externo: docs/RUNBOOK.md:103,118 apenas recomenda UptimeRobot/BetterStack/Checkly ('link a registrar'); edge function `health` está na allowlist (deploy.yml:144) com verify_jwt=false (supabase/config.toml:86-89) e é checada só no pós-deploy (deploy.yml:177-179).| cético: fn_check_slo_burn_rate existe no banco real (snapshot functions.md:179, comentário 'Agendar via pg_cron a cada 15min'), mas nenhum dos 45 jobs chama a funçã…

### F1614 · supabase/config.toml declara apenas 3 funções com verify_jwt=false

- **Tipo:** Doc/config
- **O que os docs afirmam:** Arquivo de 10 linhas com project_id "rapjswienfhkobhlamxb" e verify_jwt=false para log-web-vitals, receive-quote-sync e email-unsubscribe; as demais ficam com verify_jwt=true por padrão.
- **Fontes:** `docs/estado/10_EDGE_FUNCTIONS.md:39-55`
- **O que falta:** Atualizar docs/estado/10_EDGE_FUNCTIONS.md:39-55 (22 funções sem JWT e project_id oficial).
- **Evidência:** As 3 entradas citadas existem: supabase/config.toml:35-36 [functions.log-web-vitals] verify_jwt=false, :41-42 [functions.receive-quote-sync], :56-57 [functions.email-unsubscribe]. Porém a afirmação 'apenas 3' e '10 linhas com project_id rapjswienfhkobhlamxb' está desatualizada: o arquivo tem 89 linhas (`wc -l`), project_id = usyxfpqlsspldubptrdl (:1) e 22 funções com `verify_jwt = false` (`grep -c`), incluindo campaign-health-alert, detect-client-churn-alerts, generate-urgent-client-tasks, notify-v4-quote-status, check-v4-callback-alerts, cron-failure-alerter, process-call-recording-ingest, edge-retry-threshold-alert, deal-risk-digest, email-bulk-retry, receive-quote-webhook, report-embed-public, inbound-email-webhook, bitrix24-oauth, whatsapp-inbound-webhook, multichannel-status-webhook, twilio-call-status, twilio-call-twiml, health (:3-89).| cético: `wc -l supabase/config.toml` → 89 l…

### F1615 · supabase/config.toml isenta JWT só de log-web-vitals, receive-quote-sync e email-unsubscribe

- **Tipo:** Doc/config
- **O que os docs afirmam:** Exatamente 3 exceções verify_jwt = false em config.toml (:9-10 para email-unsubscribe).
- **Fontes:** `docs/estado/03_DOMINIO_SDR_CADENCIAS.md:211-220`
- **O que falta:** Corrigir docs/estado/03_DOMINIO_SDR_CADENCIAS.md:211-220 para refletir as 22 isenções de supabase/config.toml, incluindo inbound-email-webhook:60 e multichannel-status-webhook:74.
- **Evidência:** supabase/config.toml:3-89 tem 23 blocos [functions.X] verify_jwt=false, não 3. As 3 citadas existem: log-web-vitals (config.toml:35-36), receive-quote-sync (:41-42), email-unsubscribe (:56-57); pastas supabase/functions/{log-web-vitals,receive-quote-sync,email-unsubscribe}/ existem e as 3 estão na allowlist ACTIVE (.github/workflows/deploy.yml:144). O doc docs/estado/03_DOMINIO_SDR_CADENCIAS.md:211-220 também afirma que inbound-email-webhook e multichannel-status-webhook não estão isentas, mas estão (config.toml:60-61 e :74-75).| cético: Confirmado com uma correção na contagem: supabase/config.toml:3-89 tem 22 blocos [functions.X] verify_jwt=false (campaign-health-alert:3, detect-client-churn-alerts:6, generate-urgent-client-tasks:9, notify-v4-quote-status:12, check-v4-callback-alerts:15, cron-failure-alerter:18, process-call-recording-ingest:21, edge-retry-threshold-alert:24, deal-risk…

### F1618 · Tabela de alertas → runbooks (wal-health-alert, winloss-webhook-health-monitor, cron-failure-alerter, edge-retry-threshold-alert)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Índice mapeia 4 alertas às suas functions e runbooks.
- **Fontes:** `docs/runbooks/alertas-operacionais.md:41-48`
- **O que falta:** Incluir winloss-webhook-health-monitor na allowlist de .github/workflows/deploy.yml:144, ou remover o cron 42 e a linha do runbook.
- **Evidência:** Tabela em docs/runbooks/alertas-operacionais.md:43-48 mapeia os 4 alertas; runbooks existem (docs/runbooks/wal-health.md, winloss-webhooks.md, cron-failures.md, edge-retry.md); functions existem (supabase/functions/{wal-health-alert,winloss-webhook-health-monitor,cron-failure-alerter,edge-retry-threshold-alert}/index.ts); crons existem (cron.md:28 job 38 cron-failure-alerter-10min, :30 job 40 edge-retry-threshold-alert-15min, :31 job 41 wal-health-alert-5min, :32 job 42 winloss-webhook-health-monitor-15min). Porém winloss-webhook-health-monitor NÃO está na allowlist ACTIVE (.github/workflows/deploy.yml:144 → grep = 0), logo o cron 42 chama function não deployada em produção; as outras 3 estão na allowlist.| cético: A tabela em docs/runbooks/alertas-operacionais.md:43-48 mapeia os 4 alertas, e os 4 runbooks existem (docs/runbooks/wal-health.md, winloss-webhooks.md, cron-failures.md, edge…

### F1619 · TELEMETRY_MODULE_DOCS: AdminTelemetriaPage e 4 testes

- **Tipo:** Doc/config
- **O que os docs afirmam:** Não existem.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:327`
- **O que falta:** Remover ou reescrever a seção 9 de docs/TELEMETRY_MODULE_DOCS.md (:690-760), ou criar os testes.
- **Evidência:** Arquivos citados não existem: ls tests/lib/telemetry-logic.test.ts tests/components/TelemetryCharts.test.tsx tests/pages/AdminTelemetriaPage.test.tsx tests/lib/external-db-bridge-telemetry.test.ts → 'No such file'; find src -iname '_AdminTelemetriaPage_' → 0. A página real é src/pages/AdminTelemetria.tsx, montada em src/routes/AppRoutes.tsx:1013-1016 (/admin/telemetria) e no menu src/components/layout/sidebar/sidebarMenuData.ts:363. O doc foi parcialmente corrigido: docs/TELEMETRY_MODULE_DOCS.md:6-11 declara que os testes não existem (revisado 2026-10-18), mas a seção 9 (:694-697, :704, :731, :753-754) ainda lista os 4 arquivos com contagens de testes como se existissem.| cético: git ls-files \| grep -i telemetr \| grep -iE 'test\|spec' → 0 resultados: os 4 testes não existem. A página real é src/pages/AdminTelemetria.tsx (rota em src/routes/AppRoutes.tsx:1013, menu em sidebarMenuData.t…

### F1622 · TEST_QUALITY_REPORT.md atualizado (medição de 2026-09-02)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Relatório na raiz desatualizado.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:119`
- **O que falta:** Regenerar TEST_QUALITY_REPORT.md com a medição atual, ou gerá-lo no CI a partir de coverage-baseline.json.
- **Evidência:** TEST_QUALITY_REPORT.md existe na raiz; :4 'Última medição: 2026-09-02'; git log → último commit 285350f7e 2026-09-02. Sem regeneração automática: grep TEST_QUALITY_REPORT em .github/workflows, scripts/, package.json → 0 resultados. Conteúdo desatualizado: :27 diz que vitest.config.ts instrumenta 'apenas 16 arquivos', mas vitest.config.ts:32-38 inclui 'src/**/_.{ts,tsx}' desde abc6c48a9 (2026-09-13); :14 '469 testes' vs docs/prod-readiness.md:1057 '897 testes'; :38 '172 diretórios' vs 171 (ls -d supabase/functions/_/| grep -v \_shared \| wc -l). \| cético: TEST_QUALITY_REPORT.md:4 diz 'Última medição: 2026-09-02'; o último commit do arquivo é 285350f7e (2026-09-02). :19 diz 'instrumenta apenas 16 arquivos', mas vitest.config.ts:32-38 hoje inclui 'src/**/*.{ts,tsx}' (whitelist abandonada). :39 fala em '172 diretórios'; hoje há 171 functions + _shared. Nada regenera o relatório (verificador…

### F1625 · TEST_QUALITY_REPORT.md na raiz honesto (2026-09-02)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Doc afirma que TEST_QUALITY_REPORT.md da raiz substitui e desmente versão fabricada anterior.
- **Fontes:** `docs/auditoria/AUDITORIA_TECNICA_EXAUSTIVA_2026-09-02.md:173`
- **O que falta:** Atualizar TEST_QUALITY_REPORT.md para o escopo de cobertura atual.
- **Evidência:** TEST_QUALITY_REPORT.md existe na raiz e :6 desmente a versão fabricada. Porém os números não são mais compatíveis com vitest.config.ts: o relatório (:25-33) descreve whitelist de 16 arquivos, enquanto vitest.config.ts:32-38 (comentário 'Etapa 31 ... a whitelist anterior (16 arquivos)') passou a incluir todo src/ com exclusões, e o número real vive em coverage-baseline.json (vitest.config.ts:36-37). Relatório parou em 2026-09-02 (git 285350f7e).| cético: O arquivo existe na raiz e desmente a versão fabricada (:6). Mas :19-33 descreve uma whitelist de 16 arquivos, incompatível com vitest.config.ts:32-38 atual (include src/**, número real em coverage-baseline.json).

### F1626 · Teto de complexidade --max-warnings coerente (130 vs regra 126)

- **Tipo:** Doc/config
- **O que os docs afirmam:** package.json:24 tem --max-warnings 130, mas a regra diz 126 e "o teto só desce".
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:116`
- **O que falta:** Reduzir os warnings para ≤126, baixar o --max-warnings em package.json:28 e alinhar docs/TECH_DEBT.md:10,21.
- **Evidência:** package.json:28 `lint:complexity` usa `--max-warnings 131` (subiu: doc G_infra_ci_integracoes.md:116 citava 130; docs/prod-readiness.md:1057 '130 avisos, teto 130'). Regra: docs/TECH_DEBT.md:10 'teto 126' e :21 'quebra CI acima de 126 warnings'; .github/workflows/pr-checks.yml:116 'o teto só desce' e :119 roda `npm run lint:complexity`. O `lint` padrão (package.json:27) é `--max-warnings 0`. Valor 131 > 126 → critério falha; lint:complexity não executado nesta sessão.| cético: package.json:28 lint:complexity usa `--max-warnings 131`, acima do 130 citado pelo doc. docs/TECH_DEBT.md:10 e :21 falam em 'teto 126'. pr-checks.yml:114-117 diz '126, calibrado em 2026-09... o teto só desce' e :119 roda o ratchet. 131 > 126: o critério falha.

### F1636 · Upgrade encadeado @testing-library/react@16 → React 19 → vitest 3 (fecha CVE)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Doc aponta React 18, react-router 6, vitest 1 com CVE, @testing-library/react 14 e .npmrc legacy-peer-deps=true mascarando; ação: PR de upgrade encadeado.
- **Fontes:** `docs/auditoria/AUDITORIA_TECNICA_EXAUSTIVA_2026-09-02.md:272,277,576`
- **O que falta:** Remover legacy-peer-deps=true de .npmrc:1 após validar que npm ci roda limpo.
- **Evidência:** Upgrade feito e além da meta: package.json:133 react ^19.3.1, :135 react-dom ^19.3.1, :142 react-router-dom ^7.18.5, :161 @testing-library/react ^16.3.3, :186 vitest ^5.1.0 (package-lock.json: react 19.3.1, vitest 5.1.0, RTL 16.3.3); commit ff257f275 2026-09-27 'upgrade vitest 1.x→5.x — remediar CVE-2026-47429'. Falta: .npmrc:1 ainda `legacy-peer-deps=true` (critério exige remoção).| cético: package.json:133 react ^19.3.1, :135 react-dom ^19.3.1, :161 @testing-library/react ^16.3.3, :186 vitest ^5.1.0. Mas .npmrc:1 ainda tem `legacy-peer-deps=true`, e o critério exige a remoção.

### F1638 · Variáveis VITE_SUPABASE_URL/VITE_SUPABASE_PUBLISHABLE_KEY para staging (.env.staging)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Frontend de staging configurado por env não commitado.
- **Fontes:** `docs/STAGING.md:38-49`
- **O que falta:** Adicionar .env.staging (ou .env.* com !.env.example) ao .gitignore e documentar o uso para staging em .env.example.
- **Evidência:** Vars reconhecidas: src/integrations/supabase/env.ts:4-5 (VITE_SUPABASE_URL) e :9-11 (VITE_SUPABASE_PUBLISHABLE_KEY/ANON_KEY) com default de produção. .env.example:12-14 documenta as vars, sem menção a staging. .gitignore:27-31 cobre .env, .env.local, .env.development.local, .env.test.local, .env.production.local — `.env.staging` (que docs/STAGING.md:40-47 manda criar e 'não commitar') NÃO está ignorado.| cético: env.ts:4-5 e :9-12 reconhecem VITE_SUPABASE_URL e PUBLISHABLE_KEY/ANON_KEY. .env.example:12-16 documenta as vars, sem falar de staging. .gitignore:26-31 não cobre .env.staging: git check-ignore -v .env.staging → rc=1 (não ignorado).

### F1639 · Variável de ambiente frontend VITE_SUPABASE_PROJECT_ID

- **Tipo:** Doc/config
- **O que os docs afirmam:** Doc lista `VITE_SUPABASE_PROJECT_ID` (ID do projeto) como variável de ambiente do frontend.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:1700-1706`
- **O que falta:** Corrigir docs/DOCUMENTACAO_SISTEMA.md:1700-1706 para classificá-la como variável de E2E/CI, não do frontend.
- **Evidência:** Frontend não lê a variável: grep -rn VITE_SUPABASE_PROJECT_ID src → 0 resultados; src/integrations/supabase/env.ts:4-12 só lê VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY/ANON_KEY; .env.example não a lista. Uso real só no E2E: tests/e2e/global-setup.ts:39 process.env.VITE_SUPABASE_PROJECT_ID, tests/e2e/README.md:32 e .github/workflows/quote-to-sale-e2e.yml:176 (derivada da URL, secret como fallback). docs/DOCUMENTACAO_SISTEMA.md:1706 a classifica como variável do frontend — incorreto. Vercel env não verificável na sessão.| cético: git grep VITE_SUPABASE_PROJECT_ID fora de docs/ → nenhum uso em src/ nem em .env.example. Só aparece em tooling de E2E/CI: tests/e2e/global-setup.ts:39, pr-checks.yml:551 (default usyxf), quote-to-sale-e2e.yml:176, scripts/e2e-precheck.mjs:45 e scripts/maintenance/lib.mjs:588. O frontend não lê a variável. Vercel env não foi verificado.

### F1644 · Versão coerente entre manifesto release-please (1.0.0) e RELEASE_NOTES.md (v2.1.0)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Manifesto em 1.0.0 enquanto RELEASE_NOTES.md diz v2.1.0; 0 tags.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:164`
- **O que falta:** Alinhar RELEASE_NOTES.md: renomear para histórico (ex.: docs/historico/RELEASE_NOTES_v2.1.0.md) ou apontar para CHANGELOG.md gerado pelo release-please; a numeração oficial hoje é 1.x.
- **Evidência:** .release-please-manifest.json → ".": "1.6.0"; package.json:205 version 1.6.0; CHANGELOG.md:3 [1.6.0] (2026-11-18); git tag → promo-champions-v2-v1.0.0 … promo-champions-v2-v1.6.0 (7 tags, resolve o '0 tags'); release-please-config.json package-name promo-champions-v2, workflow .github/workflows/release-please.yml:27. Porém RELEASE_NOTES.md:1 continua 'Release v2.1.0 — 2026-07-12', numeração divergente do manifesto; grep RELEASE_NOTES em package.json/.github/docs/agentes → 0 referências.
- **Revisão:** sem contestação cética concluída.

### F1646 · Versões Deno std centralizadas em _shared/deps.ts

- **Tipo:** Doc/config
- **O que os docs afirmam:** Funções importam deno.land/std em versões 0.168/0.190/0.224 inconsistentes; recomenda _shared/deps.ts com versões fixas.
- **Fontes:** `docs/reports/BACKEND_ANALYSIS_REPORT.md:612-626`
- **O que falta:** Centralização (_shared/deps.ts ou deno.json com imports) não feita; atualizar supabase/functions/README.md:123 para std@0.224.0 / Deno.serve.
- **Evidência:** ausente: ls supabase/functions/_shared/deps.ts supabase/functions/import_map.json supabase/functions/deno.json supabase/*.json → nenhum existe. Mas a inconsistência de versões foi resolvida: grep -rhoE 'deno.land/std@[0-9.]+' supabase/functions| sort \| uniq -c → 80× std@0.224.0 e 1× std@0.168.0, este só em supabase/functions/README.md:123 (texto desatualizado, nenhum .ts importa 0.168).
- **Revisão:** sem contestação cética concluída.

### F1655 · Zero TODO/FIXME nas functions; Math.random em 8 functions

- **Tipo:** Doc/config
- **O que os docs afirmam:** Doc: 0 TODO/FIXME; Math.random em 8 functions, só stress-test-contracts gera dado simulado; em auto-reassign-inactive produz sorteio em vez de round robin.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:21-21`
- **O que falta:** Implementar round robin real em auto-reassign-inactive/index.ts:256-259 (ponteiro persistido, ex.: último vendedor atribuído) e atualizar a contagem no doc.
- **Evidência:** TODO/FIXME: grep -rnE 'TODO\|FIXME' supabase/functions --include=*.ts → 2 falsos positivos (palavra 'TODOS' em report-embed-public/index.ts:9 e winloss-webhook-dispatcher/retry_delivery_before_sleep_test.ts:222) → 0 marcadores reais, confere. Math.random fora de testes: 6 handlers (auto-reassign-inactive, notify-v4-quote-status, predict-quota-attainment, rotate-daily-challenges, start-race-season, stress-test-contracts) + 3 helpers de retry (_shared/retry.ts, run-retry-tests/retry.ts, winloss-webhook-dispatcher/retry.ts) = 9, não 8. O defeito citado persiste: supabase/functions/auto-reassign-inactive/index.ts:256-259 case 'round_robin' faz sort(() => Math.random() - 0.5) (sorteio, não round robin) e a function está na allowlist (deploy.yml:144) e no cron (cron.md).
- **Revisão:** sem contestação cética concluída.

### F1662 · 172 edge functions do CLAUDE.md existem em supabase/functions/

- **Tipo:** Edge function
- **O que os docs afirmam:** Achado transversal: as 172 edge functions citadas no CLAUDE.md §4 existem todas em supabase/functions/, porém várias não têm chamador (src, cron ou outra function).
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:9`
- **O que falta:** Decidir destino das órfãs (remover pasta ou criar chamador); tirar customer-success-hub/customer-success-360 da allowlist se não forem usadas (libera slots do limite de 100).
- **Evidência:** CLAUDE.md hoje contém só '@AGENTS.md' — a lista §4 de 172 functions não existe mais (existia em 22cb7f625: 'CLAUDE.md:95 ## 4. Edge Functions (172 funções…)'); AGENTS.md §7 diz 171 e o repo tem 171 pastas. Chamadores: codigo/edge-functions.json marca 31 com orfa=true; cruzando com cron.md e functions SQL do snapshot sobram sem nenhum chamador (src, cron, SQL, outra edge) ao menos: ai-copilot, elevenlabs-stt, generate-loss-coaching, get-client-ip, ranking-api, simulate-load, winloss-webhook-replay-batch; e customer-success-hub e customer-success-360 estão na allowlist (deploy.yml:144) sem chamador no front/cron/SQL.
- **Revisão:** sem contestação cética concluída.

### F1663 · 24 Edge Functions sem chamador identificado no repositório

- **Tipo:** Edge function
- **O que os docs afirmam:** Análise estática: nenhum call site no repo; não descarta agendador externo.
- **Fontes:** `docs/estado/14_VERIFICACAO_DA_AUDITORIA.md:176-178`
- **O que falta:** Confirmar invocações reais em produção (logs das functions) e remover/arquivar as sem uso; corrigir scripts/ai-context/gerar.mjs para considerar cron.md ao marcar orfa.
- **Evidência:** Análise estática atual: codigo/edge-functions.json → 31 com orfa=true (índice não considera cron.md). Descontando as que aparecem em cron.md/functions SQL do snapshot (activity-goal-alerts, auto-reassign-inactive, challenge-expiration-alerts, check-lead-sla, check-quote-expiration, process-scheduled-sends, wal-health-alert, webvitals-regression-alert, winloss-webhook-health-monitor, notify-critical-pattern, process-race-event) e as chamadas por outra edge (admin-conversion-trail, analyze-pipeline-coverage, new-device-alert, sequence-record-reply, customer-success-360), restam ~15 sem chamador: ai-copilot, ai-agent-orchestrator, customer-success-hub, elevenlabs-stt, generate-loss-coaching, get-client-ip, lead-scoring, ranking-api, run-retry-tests, semantic-coverage, semantic-reindex-batch, semantic-search-universal, simulate-load, winloss-webhook-replay-batch, winloss-webhook-timeline (m…
- **Revisão:** sem contestação cética concluída.

### F1666 · Deno check: 7 erros de parser + 158 falhas de resolução npm sem deno install

- **Tipo:** Edge function
- **O que os docs afirmam:** Simulação da etapa 41 com Deno 2.9.5 sem deno install: 5 aprovados, 7 erros de parser, 158 falhas de resolução de dependência npm (ambientais).
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:499-499`
- **O que falta:** Corrigir os 53 diagnósticos listados em scripts/deno-typecheck-baseline.json e rodar `node scripts/check-deno-types.mjs --update-baseline` até a baseline ficar vazia; só então deno check é 171/171 sem exclusões.
- **Evidência:** Parser e resolução de imports resolvidos (ver F1665; deno.lock presente, deno.json:3 define task check; edge-functions-bundle.yml:55-61 faz deno install + drift check e run 44372663751 verde). Porém deno check NÃO passa 170/170: scripts/deno-typecheck-baseline.json registra 53 diagnósticos TS legados em 28 arquivos (aggregate-coaching-scorecard, ai-copilot, ai-email-composer, ... workflow-executor), aceitos pelo ratchet scripts/check-deno-types.mjs chamado em .github/workflows/pr-checks.yml:326 (comentário pr-checks.yml:321-324 admite erros legados). supabase/functions/import_map.json não existe (ls → No such file); o repo usa deno.json na raiz.
- **Revisão:** sem contestação cética concluída.

### F1667 · Deploy das 21 edge functions do domínio não verificado

- **Tipo:** Edge function
- **O que os docs afirmam:** Doc leu o código em supabase/functions/ mas não o painel de Functions; plano limita 100 deployadas de 171.
- **Fontes:** `docs/estado/03_DOMINIO_SDR_CADENCIAS.md:398-398`
- **O que falta:** Confirmar no painel/CLI (supabase functions list --project-ref usyxfpqlsspldubptrdl) e decidir para as 10 fora da allowlist: incluir na allowlist (liberando vaga das 100) ou remover cron/chamadas no front.
- **Evidência:** Lista real de functions deployadas (list_edge_functions no projeto usyxf) não acessível nesta sessão (nenhum MCP do projeto usyxf; curl a usyxfpqlsspldubptrdl.supabase.co bloqueado pelo proxy: CONNECT 403). Proxy de verdade = allowlist ACTIVE em .github/workflows/deploy.yml:144 (100 nomes). Das functions do domínio SDR citadas em docs/estado/03_DOMINIO_SDR_CADENCIAS.md que existem no repo (24 pastas), 10 estão FORA da allowlist: check-lead-sla, lead-scoring, process-scheduled-sends, schedule-optimal-send, sdr-consecutive-alerts, send-time-optimizer, sequence-ab-promote, sequence-enroll, sequence-record-reply, twilio-click-to-call. Três delas são alvo de cron real (snapshot supabase/cron.md jobs 79 process-scheduled-sends, 81 check-lead-sla, 82 sdr-consecutive-alerts) e quatro são invocadas pelo front (src/hooks/sequences/useEnrollContacts.ts, usePromoteWinners.ts, useSendTimeOptimizatio…
- **Revisão:** sem contestação cética concluída.

### F1668 · Deploy das Edge Functions bloqueado (85 com 404, 3 com 500, 1 com 503)

- **Tipo:** Edge function
- **O que os docs afirmam:** Inventário HTTP dos 170 entrypoints: 81 em 200, 85 ausentes (404), 3 em 500, 1 em 503; deploy bloqueado por 403 na Management API.
- **Fontes:** `docs/execucao/HARDENING_CANONICO_2026-08-31.md:111-123`
- **O que falta:** Reconciliar allowlist (deploy.yml:144) com as 22 chamadas do front e os 12 jobs de cron: incluir as functions (liberando vagas) ou remover chamadores/jobs; depois probe 200 em cada endpoint.
- **Evidência:** Mecanismo de deploy existe: .github/workflows/deploy.yml:130-153 (supabase functions deploy por allowlist ACTIVE de 100 nomes, linha 144; depende do secret SUPABASE_ACCESS_TOKEN — presença não verificável daqui). Mas functions usadas por UI/job continuam fora da allowlist (logo não deployadas → 404): 22 invocadas via supabase.functions.invoke em src/ (coaching-impact-summary, geocode-proxy, nlq-query, push-subscribe, qbr-generator, qbr-scheduler, renewal-automation, report-builder-execute, rotate-daily-challenges, salesperson-coaching, schedule-optimal-send, sdr-consecutive-alerts, send-quote-to-client, send-time-optimizer, sequence-ab-promote, sequence-enroll, snapshot-forecast, stress-test-contracts, summarize-call-recording, twilio-click-to-call, winloss-webhook-replay, workflow-executor; ex.: src/hooks/nlq/useNLQ.ts, src/components/quotes/QuoteCard.tsx, src/hooks/useWorkflows.ts) e …
- **Revisão:** sem contestação cética concluída.

### F3623 · Edge function activity-goal-alerts (8 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** Catálogo API.md lista a edge function `activity-goal-alerts` na categoria "Alertas / Monitoramento" com auth "nenhuma detectada no handler · verify_jwt", método "qualquer", payload "—" e resposta "JSON {success, checked, belowTarget, alerts, error}".| 243 linhas; chamador: só string em src/components/admin/BackendAutomationMonitor.tsx (sem invoke); verify_jwt true (default); tabelas tocadas (linhas em produção): email_logs(0). Classificação do doc: MORTO_OU_ABANDONADO (sem chamador). \| Doc classifica como PARCIAL. Chamador(es): FE components/admin/BackendAutomationMonitor.tsx:34. Desenhada para cron (cron-request-auth) mas sem cron.schedule; UI AdminSystemStatus.tsx:31 diz "15h diário" (fa…
- **Fontes:** `docs/API.md:34-34`, `docs/estado/10_EDGE_FUNCTIONS.md:309-309`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:38-38`, `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:269-275`, `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:309-311`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:267` e mais 4
- **O que falta:** supabase/functions/activity-goal-alerts/index.ts existe; está na allowlist de deploy (.github/workflows/deploy.yml:144); ÓRFÃ: nenhum chamador no front, em edges ou em SQL/cron (edge-functions.json)
- **Evidência:** supabase/functions/activity-goal-alerts/index.ts existe; está na allowlist de deploy (.github/workflows/deploy.yml:144); ÓRFÃ: nenhum chamador no front, em edges ou em SQL/cron (edge-functions.json)| CONTESTADO pelo cético (IMPLEMENTADO): A pré-checagem errou ao chamar a função de 'ÓRFÃ'. Há cron: cron.md:46 (job 83 activity-goal-alerts-daily, '0 18 * * *' UTC = 15h BRT, o que torna correta a UI '15h'), com runs succeeded em cron-runs.md:349-355. Ela está na allowlist deploy.yml:144. O handler autentica por cron secret ou admin/manager (index.ts:39-60), lê salespeople/activity_goals/activities (linhas 87-110), envia via Resend e grava email_logs (linhas 246-280).
- **Revisão:** em disputa. O cético propõe Implementado e o juiz ainda não decidiu.

### F3624 · Edge function admin-conversion-trail (7 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** admin-conversion-trail não tem referência produtiva estática no frontend; pode ser cron, webhook ou API externa (não autoriza remoção).| PARCIAL (14/24 ainda órfãs): admin-conversion-trail segue com 0 chamadores. \| 65 linhas; chamador: **nenhum**; verify_jwt true (default); tabelas tocadas (linhas em produção): nenhuma. Classificação do doc: MORTO_OU_ABANDONADO (sem chamador). \| Uma das 64/168 funções sem invocador literal em src/. Grupo: Aparentemente dormente (INFERIDO). Classificação por grupo deduzida do nome; pg_cron/config.toml não verificados. \| supabase/functions/admin-conversion-trail existe no repo (citada em src/: não); sonda OPTIONS em produção: OPTIONS → 404 NOT_FOUND (não p…
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:313-317`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:267`, `docs/estado/10_EDGE_FUNCTIONS.md:310-310`, `docs/estado/09_HOOKS_SERVICES.md:291-311`, `docs/prod-readiness.md:265`, `docs/API.md:226-226` e mais 1
- **O que falta:** Decidir entre remover a edge (o front já usa o RPC direto) ou publicá-la com um chamador.
- **Evidência:** supabase/functions/admin-conversion-trail/index.ts existe; FORA da allowlist de deploy (.github/workflows/deploy.yml:144) → não roda em produção; ÓRFÃ: nenhum chamador no front, em edges ou em SQL/cron (edge-functions.json)| cético: A edge function está fora da allowlist deploy.yml:144. grep admin-conversion-trail src → 0 e não há job em cron.md. O RPC public.fn_admin_conversion_trail existe no banco (functions/public/fn_admin_conversion_trail__9bc7c6684fc88064.sql) e é consumido direto por src/pages/admin/AdminQuoteConversionsPage.tsx, o que torna a edge redundante.

### F3625 · Edge function check-v4-callback-alerts (7 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** supabase/functions/check-v4-callback-alerts existe no repo (citada em src/: não); sonda OPTIONS em produção: OPTIONS → 404 NOT_FOUND (não publicada; limite de 100 funções do plano). Status no doc: BLOQUEADO.| check-v4-callback-alerts falha no Deno bundle: caractere de controle U+0001. \| check-v4-callback-alerts não tem referência produtiva estática no frontend; pode ser cron, webhook ou API externa (não autoriza remoção). \| 171 linhas; chamador: **nenhum**; verify_jwt true (default); tabelas tocadas (linhas em produção): v4_callback_alerts(0). Classificação do doc: MORTO_OU_ABANDONADO (sem chamador). \| Doc classifica como REAL. Chamador(es): cron */5min (mig 20260910153000:78). Depende d…
- **Fontes:** `docs/prod-readiness.md:294`, `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:249-261`, `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:313-317`, `docs/estado/10_EDGE_FUNCTIONS.md:340-340`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:69-69`, `docs/API.md:260-260` e mais 1
- **O que falta:** Falta incluir check-v4-callback-alerts na allowlist (liberando uma vaga) ou desagendar o job 37.
- **Evidência:** supabase/functions/check-v4-callback-alerts/index.ts existe; FORA da allowlist de deploy (.github/workflows/deploy.yml:144) → não roda em produção; ÓRFÃ: nenhum chamador no front, em edges ou em SQL/cron (edge-functions.json)| cético: A pré-checagem errou ao chamar a função de 'ÓRFÃ'. Há chamador: cron.md:27 (job 37, a cada 5 min via trigger_internal_edge_job), além de supabase/config.toml:15-16 (verify_jwt=false). Mas a função está FORA da allowlist deploy.yml:144, então o cron bate em function não publicada. O byte U+0001 citado pelo doc não existe mais: grep -cP '\x01' index.ts → 0.

### F3626 · Edge function cron-failure-alerter (9 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** Doc afirma 4 functions de alerta com Slack webhooks via SLACK_WEBHOOK_URL/SLACK_DIGEST_WEBHOOK_URL.| Exportador atual: cron-failure-alerter envia as métricas cron_failures e cron_failure_notifications. \| Function não deployada no projeto canônico em 2026-09-13. \| Catálogo API.md lista a edge function `cron-failure-alerter` na categoria "Alertas / Monitoramento" com auth "segredo interno (cron/service_role) · verify_jwt off", método "só POST", payload "query: since_minutes" e resposta "JSON {error, ok, failures, notified, admins}". \| Alerta de falhas de cron; usado para detectar 401 após rotação do coaching_cron_secret. \| 554 linhas; chamador: **nenhum**; verify_jwt true (default); tabel…
- **Fontes:** `docs/auditoria/AUDITORIA_TECNICA_EXAUSTIVA_2026-09-02.md:209`, `docs/runbooks/alertas-operacionais.md:26-27`, `docs/estado/IDENTIDADE_BANCO_2026-09-13.md:59-61`, `docs/API.md:36-36`, `docs/SECRETS_ROTATION.md:100-101`, `docs/estado/10_EDGE_FUNCTIONS.md:348-348` e mais 3
- **O que falta:** supabase/functions/cron-failure-alerter/index.ts existe; está na allowlist de deploy (.github/workflows/deploy.yml:144); ÓRFÃ: nenhum chamador no front, em edges ou em SQL/cron (edge-functions.json)
- **Evidência:** supabase/functions/cron-failure-alerter/index.ts existe; está na allowlist de deploy (.github/workflows/deploy.yml:144); ÓRFÃ: nenhum chamador no front, em edges ou em SQL/cron (edge-functions.json)| CONTESTADO pelo cético (IMPLEMENTADO): Está na allowlist deploy.yml:144 e tem cron: cron.md:28 (job 38, a cada 10 min), com runs succeeded em cron-runs.md:191-197. supabase/config.toml:18-19 traz verify_jwt=false. index.ts:46 autentica por isAuthorizedCronRequest. Usa os RPCs fn_admin_get_new_cron_failures (index.ts:78) e fn_admin_mark_cron_failure_alerted (index.ts:164), ambos presentes em functions/public/. Insere notifications (index.ts:149) e exporta a métrica cron_failures (index.ts:202-203). cron_failure_alerts tem ~1.6k linhas (stats.md:28).
- **Revisão:** em disputa. O cético propõe Implementado e o juiz ainda não decidiu.

### F1669 · Edge function health pública retorna {status, version, timestamp}

- **Tipo:** Edge function
- **O que os docs afirmam:** Function health com verify_jwt=false responde HTTP 200 com JSON {status:'ok', version, timestamp}.
- **Fontes:** `docs/RUNBOOK.md:102-104`
- **O que falta:** Adicionar 'health' à allowlist em deploy.yml:144 (liberando uma vaga das 100) ou deployar manualmente (`supabase functions deploy health --project-ref usyxfpqlsspldubptrdl`) e confirmar HTTP 200 com os 3 campos.
- **Evidência:** Function existe e devolve os 3 campos: supabase/functions/health/index.ts:17-23 ({status:'ok', version: APP_VERSION ?? 'dev', timestamp}); supabase/config.toml:88-89 [functions.health] verify_jwt = false. Porém 'health' NÃO está na allowlist ACTIVE de deploy (.github/workflows/deploy.yml:144 — único match é wal-health-alert), e o próprio pipeline admite: deploy.yml:185 "se a function 'health' ainda não foi deployada, isso é esperado". GET em produção não verificável daqui (curl → CONNECT tunnel failed 403 no proxy).
- **Revisão:** sem contestação cética concluída.

### F3628 · Edge function run-retry-tests (6 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** Catálogo API.md lista a edge function `run-retry-tests` na categoria "Ops / Outros" com auth "nenhuma detectada no handler · verify_jwt", método "qualquer", payload "event" e resposta "JSON {file, ran_at, total_duration_ms, total, error}".| Doc classifica como REAL. Chamador(es): FE hooks/useRetryTestRun.ts:26. Harness de teste exposto em produção (rota /retry-test-status); sem auth na função (comentário index.ts:10). \| Uma das 64/168 funções sem invocador literal em src/. Grupo: Aparentemente dormente (INFERIDO). Classificação por grupo deduzida do nome; pg_cron/config.toml não verificados. \| run-retry-tests sem auth e stress-test-contracts expostos em produção. \| 1994 linhas; chamador:…
- **Fontes:** `docs/API.md:238-238`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:163-163`, `docs/estado/09_HOOKS_SERVICES.md:291-311`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:132`, `docs/estado/10_EDGE_FUNCTIONS.md:432-432`, `docs/prod-readiness.md:387`
- **O que falta:** Decidir entre publicar a função com auth admin ou remover o hook e a rota /retry-test-status do bundle.
- **Evidência:** supabase/functions/run-retry-tests/index.ts existe; FORA da allowlist de deploy (.github/workflows/deploy.yml:144) → não roda em produção; ÓRFÃ: nenhum chamador no front, em edges ou em SQL/cron (edge-functions.json)| cético: A pré-checagem errou ao chamar a função de 'ÓRFÃ'. Há chamador: src/hooks/useRetryTestRun.ts:26 invoca 'run-retry-tests'. Mas a função está FORA da allowlist deploy.yml:144, então não roda em produção.

### F3629 · Edge function simulate-load (10 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** Catálogo API.md lista a edge function `simulate-load` na categoria "Ops / Outros" com auth "JWT do usuário · verify_jwt", método "qualquer", payload "total, targetUrl" e resposta "JSON {error, total, passed, failed, avgLatencyMs, maxLate…".| Doc classifica como ÓRFÃ. Chamador(es): nenhum. Ferramenta de carga; nenhum chamador (comentário admite). \| Uma das 64/168 funções sem invocador literal em src/. Grupo: Aparentemente dormente (INFERIDO). Classificação por grupo deduzida do nome; pg_cron/config.toml não verificados. \| simulate-load não tem referência produtiva estática no frontend; pode ser cron, webhook ou API externa (não autoriza remoção). \| PARCIAL (14/24 ainda órfãs): simulate-lo…
- **Fontes:** `docs/API.md:239-239`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:187-187`, `docs/estado/09_HOOKS_SERVICES.md:291-311`, `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:313-317`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:267`, `docs/runbooks/race-arena.md:4-8` e mais 4
- **O que falta:** Decidir entre remover a função ou exigir admin + allowlist de targetUrl e dar um chamador.
- **Evidência:** supabase/functions/simulate-load/index.ts existe; FORA da allowlist de deploy (.github/workflows/deploy.yml:144) → não roda em produção; ÓRFÃ: nenhum chamador no front, em edges ou em SQL/cron (edge-functions.json)| cético: Está FORA da allowlist deploy.yml:144. grep -rn simulate-load src supabase/functions (excluindo o próprio index) → 0. Não há job em cron.md.

### F3630 · Edge function stress-test-contracts (5 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** Catálogo API.md lista a edge function `stress-test-contracts` na categoria "Ops / Outros" com auth "nenhuma detectada no handler · verify_jwt", método "qualquer", payload "targetContract" e resposta "JSON {error}".| Doc classifica como STUB. Chamador(es): FE components/debug/WebhookSimulationPanel.tsx:43. Simulador: cenários sorteados com Math.random, exposto no painel WebhooksPage em produção. \| Aparece na lista de 104 invocadas; removida da contagem de 64. \| 74 linhas; chamador: FE src/components/debug/WebhookSimulationPanel.tsx; verify_jwt true (default); tabelas tocadas (linhas em produção): nenhuma. Classificação do doc: SUGERIDO_OU_INICIADO (esqueleto). \| supabase/functions/stress-…
- **Fontes:** `docs/API.md:240-240`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:190-190`, `docs/estado/09_HOOKS_SERVICES.md:308-309`, `docs/estado/10_EDGE_FUNCTIONS.md:458-458`, `docs/prod-readiness.md:414`
- **O que falta:** A função não está publicada e é simulação aleatória. Restringir a dev/admin ou remover.
- **Evidência:** supabase/functions/stress-test-contracts/index.ts existe; FORA da allowlist de deploy (.github/workflows/deploy.yml:144) → não roda em produção; chamada por: src/components/debug/WebhookSimulationPanel.tsx| cético: O chamador existe: src/components/debug/WebhookSimulationPanel.tsx:43. A função está FORA da allowlist deploy.yml:144. É stub: supabase/functions/stress-test-contracts/index.ts:104 sorteia o cenário com Math.random.

### F3631 · Edge function wal-health-alert (10 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** supabase/functions/wal-health-alert existe no repo (citada em src/: não); sonda OPTIONS em produção: OPTIONS → 200. Status no doc: OK.| Catálogo API.md lista a edge function `wal-health-alert` na categoria "Alertas / Monitoramento" com auth "nenhuma detectada no handler · verify_jwt", método "qualquer", payload "slice" e resposta "JSON {error, hint, ok}". \| Alerta quando WAL/replicação excede limites: max_slot_lag_bytes (64 MiB), long_running_tx (>0), wal_size_bytes (500 MiB). \| Doc classifica como REAL. Chamador(es): cron */5min (mig 20261001144000:77). Depende de _internal_secrets. SLACK_WEBHOOK_URL, WAL_MAX_SLOT_LAG_BYTES, WAL_SIZE_ALERT_BYTES. \| Alerta Slack de saúde do WAL via wal-h…
- **Fontes:** `docs/prod-readiness.md:423`, `docs/API.md:45-45`, `docs/runbooks/wal-health.md:1-11`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:199-199`, `docs/reports/BACKEND_DEEP_AUDIT_V2_2026-07-11.md:17-58`, `docs/SECURITY_HARDENING.md:157-166,216` e mais 4
- **O que falta:** supabase/functions/wal-health-alert/index.ts existe; está na allowlist de deploy (.github/workflows/deploy.yml:144); ÓRFÃ: nenhum chamador no front, em edges ou em SQL/cron (edge-functions.json)
- **Evidência:** supabase/functions/wal-health-alert/index.ts existe; está na allowlist de deploy (.github/workflows/deploy.yml:144); ÓRFÃ: nenhum chamador no front, em edges ou em SQL/cron (edge-functions.json)| CONTESTADO pelo cético (IMPLEMENTADO): Está na allowlist deploy.yml:144 e tem cron: cron.md:31 (job 41, a cada 5 min), com runs succeeded em cron-runs.md:218-224. A view public.v_platform_wal_health existe (views.md:1126) e é lida em index.ts:165. A auth é por cron secret (index.ts:129). Lê SLACK_WEBHOOK_URL e retorna 503 com hint se ele faltar (index.ts:102-117). Os defaults WAL_MAX_SLOT_LAG_BYTES/WAL_SIZE_ALERT_BYTES estão em index.ts:104-107.
- **Revisão:** em disputa. O cético propõe Implementado e o juiz ainda não decidiu.

### F1670 · Edge Functions: 169 locais com index.ts, 98 publicadas ACTIVE, 71 não publicadas, 74 verify_jwt=false / 24 true, config.toml declara 15

- **Tipo:** Edge function
- **O que os docs afirmam:** Doc inventaria deploy real: 98 functions ativas no destino, nenhuma remota ausente do repo, 71 locais não publicadas; classificação: 50 referenciadas no front, 4 em migration/automação, 5 só entre functions, 12 sem referência.
- **Fontes:** `docs/auditoria/VALIDACAO_SINCRONIA_GITHUB_SUPABASE_2026-09-10.md:133-151,204`
- **O que falta:** Reconciliar: para cada uma das 22 chamadas do front e 12 alvos de cron fora de deploy.yml:144, publicar ou remover a chamada; garantir que toda function pública (webhooks/cron) publicada tenha entrada em config.toml.
- **Evidência:** Repo hoje: 171 pastas com index.ts (ls supabase/functions/*/index.ts| wc -l); snapshot codigo/edge-functions.json total=171, verify_jwt_false=22, chamadas_sem_pasta=[]. supabase/config.toml declara 22 functions com verify_jwt=false (linhas 3-89, inclui health). Manifesto de publicação = allowlist ACTIVE com 100 nomes em .github/workflows/deploy.yml:144 (todas existem no repo). Reconciliação incompleta: 22 functions invocadas pelo front estão fora da allowlist (lista em F1668) e 12 alvos de cron idem. Contagens do destino (98 ACTIVE / 74 vs 24 verify_jwt) não verificáveis nesta sessão (sem MCP do usyxf; proxy bloqueia).
- **Revisão:** sem contestação cética concluída.

### F1671 · Etapa 10 do plano: publicar as 170 functions em usyxf

- **Tipo:** Edge function
- **O que os docs afirmam:** Functions do repo precisam ser deployadas no canônico.
- **Fontes:** `docs/estado/IDENTIDADE_BANCO_2026-09-13.md:94`
- **O que falta:** Decisão registrada para as 71 fora da allowlist (remover do repo ou trocar a vaga) e confirmação da lista publicada via `supabase functions list --project-ref usyxfpqlsspldubptrdl`.
- **Evidência:** Publicação em usyxf é feita por .github/workflows/deploy.yml:130-153 apenas para as 100 da allowlist (linha 144; comentário linhas 139-142 explica o limite 402 function.max_count). 71 functions do repo ficam fora por design, incluindo várias ainda chamadas (F1668). list_edge_functions no usyxf não acessível nesta sessão.
- **Revisão:** sem contestação cética concluída.

### F1673 · Etapa 43 do plano: Zerar as outras 33 falhas TypeScript

- **Tipo:** Edge function
- **O que os docs afirmam:** Corrigir por domínio, sem casts que escondam drift. Saída esperada: 169/169 deno check. Gate: nenhum DDL.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:711-711`
- **O que falta:** Corrigir os 53 diagnósticos da baseline por domínio e esvaziar scripts/deno-typecheck-baseline.json (`node scripts/check-deno-types.mjs --update-baseline`).
- **Evidência:** Não há 169/169 deno check limpo: scripts/deno-typecheck-baseline.json mantém 53 diagnósticos em 28 arquivos (ex.: supabase/functions/ai-copilot/index.ts TS2339, ai-email-composer TS2345/TS2769, external-db-bridge, workflow-executor, semantic-search...). O gate de PR é ratchet (scripts/check-deno-types.mjs:1-16; .github/workflows/pr-checks.yml:321-326) que só bloqueia erro novo. Progresso real: de 38 arquivos listados em AUDITORIA 26/08:291 para 28.
- **Revisão:** sem contestação cética concluída.

### F1674 · Etapa canônica 26/08 nº 43: Zerar as outras 33 falhas TypeScript Edge

- **Tipo:** Edge function
- **O que os docs afirmam:** Etapa canônica 43 (plano 26/08, matriz de status 30/08, estado ⬜): por domínio, sem casts; 169/169 (hoje 170) deno check; Lote 1.
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:183-183`
- **O que falta:** Zerar a baseline de scripts/deno-typecheck-baseline.json (28 arquivos).
- **Evidência:** Mesma evidência de F1673: scripts/deno-typecheck-baseline.json = 53 diagnósticos / 28 arquivos; pr-checks.yml:326 roda o ratchet, não deno check limpo. Workflow 'Edge Functions Lint (deno)' passou na main em 19/11 (run 44617891245) porque a baseline absorve os erros legados.
- **Revisão:** sem contestação cética concluída.

### F1675 · Handoff P062: Corrigir as 34 Edge Functions com typecheck quebrado

- **Tipo:** Edge function
- **O que os docs afirmam:** Fila canônica do handoff (onda 7): Corrigir as 34 Edge Functions com typecheck quebrado. Todas as etapas começam pendentes; 0 de 100 executadas na data do handoff. Gate(s) conforme §13.
- **Fontes:** `docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:368-368`
- **O que falta:** Corrigir os 28 arquivos da baseline e esvaziá-la.
- **Evidência:** deno.json:3 define `deno task check`; gate real em .github/workflows/pr-checks.yml:326 (scripts/check-deno-types.mjs) com baseline scripts/deno-typecheck-baseline.json de 53 erros em 28 functions — ou seja, 28 das 34 Edge Functions ainda têm typecheck quebrado (tolerado).
- **Revisão:** sem contestação cética concluída.

### F1676 · Handoff P1: 7 Edge Functions não compilam; 34 falham no typecheck; 4 jobs cron quebrados

- **Tipo:** Edge function
- **O que os docs afirmam:** 7 Edge Functions não compilam, outras 34 falham no typecheck; quatro jobs cron têm contratos quebrados; código chama 4 relações, 5 RPCs e 2 Edge Functions inexistentes.
- **Fontes:** `docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:79-81`
- **O que falta:** Esvaziar baseline de tipos; alinhar os 12 alvos de cron com a allowlist; nomear e checar as 4 relações/5 RPCs em um teste de contrato que rode no CI.
- **Evidência:** (a) 7 não compilam → resolvido (F1665/F1672). (b) 34 typecheck → 28 arquivos ainda na baseline (scripts/deno-typecheck-baseline.json). (c) Jobs cron: snapshot supabase/cron.md lista 45 jobs ativos e cron-runs.md (últimas 3 execuções/7 dias) só mostra status succeeded; porém 12 jobs disparam edge functions fora da allowlist de deploy (deploy.yml:144), ex.: jobs 37, 39, 44, 46, 79-82, 84, 85, 88 — net.http_post é assíncrono, o job 'sucede' mesmo com alvo 404. (d) 2 Edge Functions inexistentes (deal-health-scorer, smart-lead-router): grep -rn em src → 0 resultados; snapshot codigo/edge-functions.json chamadas_sem_pasta=[] (resolvido). Relações/RPCs inexistentes: handoff não nomeia; existe `npm run graphify:contracts` (package.json:52) mas não é gate de CI.
- **Revisão:** sem contestação cética concluída.

### F1678 · Limite de 100 functions deployadas; dezenas respondem 404

- **Tipo:** Edge function
- **O que os docs afirmam:** Plano limita a 100; repo tem ~173; functions chamadas pelo frontend podem não estar deployadas.
- **Fontes:** `docs/DEPLOYMENT.md:52-54,70-72`
- **O que falta:** Para cada uma das 22: incluir em deploy.yml:144 (trocando por function obsoleta) ou remover/desabilitar o chamador no front; depois probe HTTP 200.
- **Evidência:** Limite documentado em docs/DEPLOYMENT.md:52-54 e aplicado por allowlist em .github/workflows/deploy.yml:139-153 (100 nomes). grep functions.invoke em src/ → 81 functions distintas; 22 estão FORA da allowlist: coaching-impact-summary (src/hooks/coaching/useCoachingImpact.ts), geocode-proxy (src/components/map/ClientsMap.tsx), nlq-query (src/hooks/nlq/useNLQ.ts), push-subscribe (src/hooks/usePushNotifications.ts), qbr-generator (src/hooks/revenue/useRevenueIntelligenceHub.ts), qbr-scheduler e renewal-automation (src/components/customer-success/HelpdeskConnectorPanel.tsx), report-builder-execute (src/hooks/reporting/useReportExecution.ts), rotate-daily-challenges (src/components/gamification/DailyChallengesCard.tsx), salesperson-coaching (src/components/analytics/CoachingComparison.tsx), schedule-optimal-send, sdr-consecutive-alerts (src/components/sdr/TestSDRAlertButton.tsx), send-quote-t…
- **Revisão:** sem contestação cética concluída.

### F1679 · Plano 30/08 etapa 62 (P062): Corrigir as 34 Edge Functions com typecheck quebrado

- **Tipo:** Edge function
- **O que os docs afirmam:** Etapa 62 do plano de 100 etapas (auditoria 30/08; = P062 do handoff): deno check verde sem mascarar erros com exclusões globais.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:726-726`
- **O que falta:** Esvaziar a baseline (28 arquivos) para deno check verde sem baseline.
- **Evidência:** Idem F1675: scripts/deno-typecheck-baseline.json (53 diagnósticos/28 arquivos) é uma 'exclusão' por fingerprint aceita em .github/workflows/pr-checks.yml:326; deno.json:3 tem a task check mas ela não é o gate.
- **Revisão:** sem contestação cética concluída.

### F1680 · Presença de Edge Functions: 165 na origem, 85 no destino, 80 só na origem

- **Tipo:** Edge function
- **O que os docs afirmam:** Probes OPTIONS sobre 169 nomes locais: 165 presentes na origem, 85 no destino, 80 só na origem, 4 ausentes nos dois, 0 só no destino.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:297-305`
- **O que falta:** Documentar decisão para as 71 functions fora da allowlist e confirmar `supabase functions list` no usyxf contra deploy.yml:144.
- **Evidência:** Números de presença origem/destino são probe histórico (AUDITORIA 26/08:297-305) não reproduzível daqui (proxy bloqueia o host; sem MCP do usyxf). Critério 'manifest por ambiente': existe um único manifesto, a allowlist ACTIVE de 100 nomes em .github/workflows/deploy.yml:144 (sem manifesto por ambiente/decisão de topologia documentada para as 71 restantes; grep -i manifest em scripts/ e docs/DEPLOYMENT.md → nenhum manifesto de deploy). Correspondência do destino com o manifesto não verificável.
- **Revisão:** sem contestação cética concluída.

### F1681 · Publicar as ~170 edge functions em usyxf

- **Tipo:** Edge function
- **O que os docs afirmam:** Ação 4: publicar todas as functions do repo no projeto canônico (plano limita a 100).
- **Fontes:** `docs/postmortems/2026-08-30_cron_outage.md:79`
- **O que falta:** Registrar quais das 71 ficam de fora e por quê; publicar as que têm cron/chamador ou remover os chamadores.
- **Evidência:** Ação 4 do postmortem (docs/postmortems/2026-08-30_cron_outage.md:79) implementada só até o limite do plano: deploy.yml:130-153 publica 100 de 171 por allowlist (linha 144). Faltam 71 (ex.: health, check-v4-callback-alerts, process-call-recording-ingest, process-scheduled-sends, check-quote-expiration, check-lead-sla, scheduled-reports-runner, send-alert-notifications — todas alvo de cron em snapshot supabase/cron.md). Lista publicada real não verificável nesta sessão.
- **Revisão:** sem contestação cética concluída.

### F3636 · Função SQL/RPC fn_admin_cleanup_stale_logs (3 afirmações nos docs)

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** Ações admin de limpeza de logs e reset de circuit breaker sem consumidor.| ADR-007: admins podem disparar a limpeza manualmente via fn_admin_cleanup_stale_logs. \| API.md lista a function SQL `fn_admin_cleanup_stale_logs` com última definição em 20260711153757_a957a586-25a5-45a6-8ace-6f4e9f859d0f.sql, grants "authenticated" e uso no front "—".
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/F_banco_dados.md:89`, `docs/decisions/ADR-007-log-retention.md:16-16`, `docs/API.md:559-559`
- **O que falta:** Falta um botão em tela admin chamando o RPC; do contrário, remover.
- **Evidência:** função public.fn_admin_cleanup_stale_logs existe no banco real (functions.md); sem referência em código, cron, triggers ou outras funções (coluna de uso vazia)| cético: Existe no banco (functions.md:162, grant authenticated e service_role). grep -rn fn_admin_cleanup_stale_logs src supabase/functions → só src/integrations/supabase/types.ts. O cron 7 usa outra função, fn_cleanup_stale_logs (cron.md:11). Não há botão admin.

### F3637 · Função SQL/RPC fn_admin_wal_health (2 afirmações nos docs)

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** Endpoint admin que retorna JSON de saúde do WAL.| API.md lista a function SQL `fn_admin_wal_health` com última definição em 20260711134320_f46c46d9-295a-4e9e-a0da-ca57174d135d.sql, grants "authenticated, service_role" e uso no front "—".
- **Fontes:** `docs/SECURITY_HARDENING.md:150-155,67`, `docs/API.md:570-570`
- **O que falta:** Falta consumo real (tela admin ou a edge usar o RPC); do contrário, remover.
- **Evidência:** função public.fn_admin_wal_health existe no banco real (functions.md); sem referência em código, cron, triggers ou outras funções (coluna de uso vazia)| cético: Existe no banco (functions.md:173). A única menção fora de types.ts é um comentário em supabase/functions/wal-health-alert/index.ts:3-4. A edge lê a view direto (index.ts:165 .from('v_platform_wal_health')), não o RPC. Não há tela/hook em src.

### F3638 · Função SQL/RPC fn_list_cron_jobs (3 afirmações nos docs)

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** fn_list_cron_jobs sem consumidor.| API.md lista a function SQL `fn_list_cron_jobs` com última definição em 20260707114840_4586855c-9d65-4288-9eee-e06b1b311446.sql, grants "authenticated, service_role" e uso no front "—". \| No destino, fn_list_cron_jobs e o wrapper fn_admin_security_definer_exposure filtram por auth.uid/role e retornam vazio para service_role sem usuário.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/F_banco_dados.md:89`, `docs/API.md:582-582`, `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:529-529`
- **O que falta:** Falta uma tela admin em src consumindo fn_list_cron_jobs; do contrário, remover.
- **Evidência:** função public.fn_list_cron_jobs existe no banco real (functions.md); sem referência em código, cron, triggers ou outras funções (coluna de uso vazia)| cético: Existe no banco (functions.md:187). grep -rn fn_list_cron_jobs src supabase/functions → só types.ts.

### F3639 · Função SQL/RPC fn_test_mark_cron_failure (2 afirmações nos docs)

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** Alcançável por anon via GRANT explícito a anon; sem guarda interna (confirmado §3.4). Helper de teste em produção.| API.md lista a function SQL `fn_test_mark_cron_failure` com última definição em 20260712230906_1031d7dd-3d6d-4eca-9312-36fdb4432c9b.sql, grants "anon, authenticated, service_role" e uso no front "—".
- **Fontes:** `docs/estado/11_DADOS_BANCO.md:346-346`, `docs/API.md:590-590`
- **O que falta:** Falta remover o helper fn_test_* do banco de produção. O risco de anon já foi mitigado.
- **Evidência:** função public.fn_test_mark_cron_failure existe no banco real (functions.md); sem referência em código, cron, triggers ou outras funções (coluna de uso vazia)| cético: O grant a anon já foi revogado: functions.md:197 mostra EXECUTE só para service_role. Mas o helper de teste continua em produção, e seu único uso é em teste: supabase/functions/cron-failure-alerter/index.test.ts:239-260.

### F3640 · Função SQL/RPC mark_entity_for_reindex (2 afirmações nos docs)

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** Três RPCs utilitárias sem consumidor.| API.md lista a function SQL `mark_entity_for_reindex` com última definição em 20260417155732_08d9a90e-f30b-4744-8c96-8f455d1b5a03.sql, grants "authenticated" e uso no front "—".
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/F_banco_dados.md:89`, `docs/API.md:679-679`
- **O que falta:** Falta um chamador (código ou trigger); do contrário, fazer DROP.
- **Evidência:** função public.mark_entity_for_reindex existe no banco real (functions.md); sem referência em código, cron, triggers ou outras funções (coluna de uso vazia)| cético: Existe no banco (functions.md:284). grep -rn mark_entity_for_reindex src supabase/functions → só types.ts. Não há cron nem trigger.

### F3641 · RPC/função SQL `archive_old_data`

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** API.md lista a function SQL `archive_old_data` com última definição em 20260104170152_stored_procedures.sql, grants "—" e uso no front "—".
- **Fontes:** `docs/API.md:474-474`
- **O que falta:** Falta agendar ou dar um chamador a archive_old_data; do contrário, remover. Também é preciso revisar o grant a authenticated.
- **Evidência:** função public.archive_old_data existe no banco real (functions.md); sem referência em código, cron, triggers ou outras funções (coluna de uso vazia)| cético: Existe no banco (functions.md:83, grant authenticated e service_role, não 'nenhum' como diz o doc). grep -rn archive_old_data src supabase/functions → só types.ts. Não há job em cron.md.

### F3642 · RPC/função SQL `cleanup_old_records`

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** API.md lista a function SQL `cleanup_old_records` com última definição em 20260105000005_stored_procedures.sql, grants "—" e uso no front "—".
- **Fontes:** `docs/API.md:527-527`
- **O que falta:** Falta chamador real (cron, trigger, edge ou front). Hoje a função é código morto. Os grants reais (authenticated, service_role) também divergem do '—' do doc. Decidir entre agendar ou remover.
- **Evidência:** função public.cleanup_old_records existe no banco real (functions.md); sem referência em código, cron, triggers ou outras funções (coluna de uso vazia)| cético: A função existe no banco real: contexto/supabase/functions.md:131 (public.cleanup_old_records, plpgsql, SECURITY INVOKER, grants authenticated e service_role, coluna de uso vazia). O corpo está em functions/public/cleanup_old_records__12ae32cb1ec02d01.sql e faz DELETE em audit_log, user_2fa_log e security_events. Não há chamador: grep -rn cleanup_old_records src supabase/functions scripts → só src/integrations/supabase/types.ts:23961, que é tipo gerado. cron.md não traz job para ela; os jobs de limpeza são outros (cron.md:10-11: fn_cleanup_webhook_dedupe e fn_cleanup_stale_logs).

### F3643 · RPC/função SQL `fn_admin_reset_circuit`

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** API.md lista a function SQL `fn_admin_reset_circuit` com última definição em 20260711153757_a957a586-25a5-45a6-8ace-6f4e9f859d0f.sql, grants "authenticated" e uso no front "—".
- **Fontes:** `docs/API.md:568-568`
- **O que falta:** Nenhuma UI ou edge chama a RPC. Falta ligar o botão Reset (CircuitBreakerDashboard ou AdminSystemStatus) a supabase.rpc('fn_admin_reset_circuit'), ou remover a função.
- **Evidência:** função public.fn_admin_reset_circuit existe no banco real (functions.md); sem referência em código, cron, triggers ou outras funções (coluna de uso vazia)| cético: A função existe no banco real: functions.md:171 (fn_admin_reset_circuit(_circuit_name text, _reason text), SECURITY DEFINER, grants authenticated e service_role, uso vazio). grep -rn fn_admin_reset_circuit src supabase/functions scripts → só types.ts:24184. O painel src/components/debug/CircuitBreakerDashboard.tsx:8-9,34-41 reseta circuitos só no cliente (resetCircuit/resetAllCircuits) e não chama a RPC.

### F1686 · 3 SLOs (disponibilidade, frescor de dados derivados, sucesso quote-to-sale) — dependem de Sentry/uptime externos

- **Tipo:** Integração externa
- **O que os docs afirmam:** Revisão mensal de budget de erro; SLOs pendentes de observabilidade externa (etapas 26/27).
- **Fontes:** `docs/PROCESSOS.md:68-77`
- **O que falta:** Configurar VITE_SENTRY_DSN no painel Vercel, criar o monitor externo nos 3 endpoints do RUNBOOK.md:105-109 e deployar 'health'; registrar no RUNBOOK os links.
- **Evidência:** Parte in-app existe: rota /admin/platform-slo em src/routes/AppRoutes.tsx:997-1000 monta AdminPlatformSLOPage; src/hooks/admin/usePlatformSLO.ts:32 chama rpc fn_admin_platform_slo, que existe no banco (snapshot supabase/functions.md:169, SETOF v_platform_slo; view em views.md:1045). Observabilidade externa não evidenciada: Sentry só inicializa se VITE_SENTRY_DSN existir (src/lib/errorTracking.ts:42-43; .env.example:23 comentado; grep SENTRY em .github/workflows e vercel.json → 0) — valor na Vercel não verificável; monitor de uptime: docs/RUNBOOK.md:99-118 lista monitores 'a cadastrar' (UptimeRobot/BetterStack/Checkly) e o endpoint health não está na allowlist de deploy (F1669); grep -ri uptimerobot\|betterstack\|checkly em .github e src → 0.
- **Revisão:** sem contestação cética concluída.

### F1687 · Alerta via N8N após N falhas consecutivas (P100 #43)

- **Tipo:** Integração externa
- **O que os docs afirmam:** Planejado, inexistente.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:72,141`
- **O que falta:** Implementar contagem de falhas consecutivas (ex.: consultar runs anteriores via gh api antes do POST) se o requisito 'após N falhas' for mantido; confirmar secret N8N_ALERT_WEBHOOK_URL no repo e o fluxo WhatsApp no N8N.
- **Evidência:** .github/workflows/_notify.yml não existe (ls → No such file). Existe .github/workflows/ci-failure-alert.yml: dispara em workflow_run completed de 19 workflows (linhas 7-27), filtra conclusion=failure na main ou tag de release (linhas 66-81) e faz POST JSON ao webhook N8N (linhas 86-98) com secrets N8N_ALERT_WEBHOOK_URL/N8N_ALERT_WEBHOOK_SECRET; sem o secret apenas loga e sai 0 (linhas 82-85). Não há lógica de 'N falhas consecutivas' (grep -i consecutiv\|threshold\|count → 0): alerta a cada falha. Secret configurado e roteamento WhatsApp no N8N não verificáveis daqui.
- **Revisão:** sem contestação cética concluída.

### F1691 · Etapa 041 (CI): Criar SLACK_CI_WEBHOOK_URL ou webhook WhatsApp via Evolution/N8N (wpp2) para notify-failure

- **Tipo:** Integração externa
- **O que os docs afirmam:** Canal real de alerta de CI.
- **Fontes:** `docs/execucao/PLANO_WORKFLOWS_GITHUB_ACTIONS_100_ETAPAS_2026-09-27.md:113`
- **O que falta:** Criar o secret SLACK_CI_WEBHOOK_URL (ou N8N_ALERT_WEBHOOK_URL apontando para o fluxo wpp2 no N8N) em Settings → Secrets do repo adm01-debug/Promo_Champions_V2.1; sem ele nenhuma falha de CI gera mensagem real.
- **Evidência:** Job notify-failure existe: .github/workflows/pr-checks.yml:724-752 (lê secrets.SLACK_CI_WEBHOOK_URL, linha 739; se vazio só loga e `exit 0`, linhas 746-749); mesmo padrão em cron-monitoring.yml:100-122, qa-exhaustive.yml:164-186, codeql.yml:52-74. Alternativa WhatsApp/N8N: .github/workflows/ci-failure-alert.yml:46-84 (secret N8N_ALERT_WEBHOOK_URL, idem no-op sem secret). Lista real de secrets do repo (github_list_actions_secrets, 20/11/2026): 10 secrets — BACKUP_ENCRYPTION_KEY, E2E_TEST_EMAIL, E2E_TEST_PASSWORD, RESEND_API_KEY, SUPABASE_ACCESS_TOKEN, SUPABASE_DB_URL, SUPABASE_SERVICE_ROLE_KEY, VITE_SUPABASE_PROJECT_ID, VITE_SUPABASE_PUBLISHABLE_KEY, VITE_SUPABASE_URL — nenhum SLACK_CI_WEBHOOK_URL nem N8N_ALERT_WEBHOOK_URL. docs/SECRETS_ROTATION.md:63: 'Pendente — ainda não criado'. PR #582: check 'Notify on failure' rodou (SUCCESS) após falha de 'Edge Functions Tests (deno)', mas sem se…
- **Revisão:** sem contestação cética concluída.

### F1694 · Etapa 84: configurar SLACK_CI_WEBHOOK_URL ou notificação WhatsApp via Evolution/N8N

- **Tipo:** Integração externa
- **O que os docs afirmam:** Canal de alerta de CI.
- **Fontes:** `docs/estado/PLANO_CI_WORKFLOWS_2026-10-01.md:148`
- **O que falta:** Cadastrar SLACK_CI_WEBHOOK_URL ou N8N_ALERT_WEBHOOK_URL nos secrets do repo; o job já está pronto e passa a enviar sem alteração de código.
- **Evidência:** Mesmo artefato de F1691: .github/workflows/pr-checks.yml:724-752 (job notify-failure com secrets.SLACK_CI_WEBHOOK_URL, no-op se ausente); .github/workflows/ci-failure-alert.yml:46-84 (webhook N8N para WhatsApp/Slack, secret N8N_ALERT_WEBHOOK_URL). Secrets reais do repo (github_list_actions_secrets 20/11/2026): nenhum dos dois existe. docs/SECRETS_ROTATION.md:63 e 117-120: pendente.
- **Revisão:** sem contestação cética concluída.

### F1698 · Observabilidade externa (OpenTelemetry/Grafana/Sentry) em vez de console.log

- **Tipo:** Integração externa
- **O que os docs afirmam:** Telemetria só via console; recomenda integrar Datadog/Grafana Cloud/Sentry ou OpenTelemetry.
- **Fontes:** `docs/reports/BACKEND_ANALYSIS_REPORT.md:707-721`
- **O que falta:** Configurar METRICS_INGEST_URL/METRICS_INGEST_TOKEN nos secrets das Edge Functions (não verificável daqui) e VITE_SENTRY_DSN na Vercel; sem isso o exportador é no-op e a telemetria continua só em console/error_logs. Cobertura limitada a 2 functions — demais functions não exportam métricas.
- **Evidência:** O arquivo citado pelo doc não existe (ausente: ls supabase/functions/_shared/| grep telemetry → 0; só trace.ts). Existe exportador para sink externo: supabase/functions/_shared/metrics-exporter.ts:1-40 (POST JSON para METRICS_INGEST_URL/Better Stack/Grafana; retorna {exported:false, reason:'not_configured'} sem a env, linhas 38-40). Usado por 2 functions: cron-failure-alerter/index.ts (na allowlist deploy.yml:144) e winloss-webhook-health-monitor/index.ts (fora da allowlist). Front: @sentry/react em package.json:103, inicializado só com VITE_SENTRY_DSN (src/lib/errorTracking.ts:39-62). Ausente: OpenTelemetry/Datadog (grep -rni 'opentelemetry\\|otel\\|datadog' supabase/functions/_shared package.json → 0).
- **Revisão:** sem contestação cética concluída.

### F1699 · Sentry no front via VITE_SENTRY_DSN

- **Tipo:** Integração externa
- **O que os docs afirmam:** src/lib/errorTracking.ts:42 só liga o Sentry com VITE_SENTRY_DSN; a variável não existe no projeto Vercel → erros do front não são reportados (B12).
- **Fontes:** `docs/prod-readiness.md:873`
- **O que falta:** Dono criar projeto Sentry e definir VITE_SENTRY_DSN em Vercel → Settings → Environment Variables (Production); depois disparar um erro de teste e conferir no Sentry. Sem a env, erros do front vão só para a tabela error_logs.
- **Evidência:** Código pronto: src/lib/errorTracking.ts:39-62 (initSentry lê import.meta.env.VITE_SENTRY_DSN, linha 42; `if (!dsn) return;`; import dinâmico de @sentry/react e sdk.init), chamado em initErrorTracking (errorTracking.ts:195 `void initSentry()`), que App.tsx:22 importa. Dependência: package.json:103 '@sentry/react ^10.75.3', :157 '@sentry/vite-plugin'. .env.example:21-23 documenta a variável. Env na Vercel: docs/prod-readiness.md:873 — 'a variável não existe no projeto Vercel (lista de env via API em 2026-11-12)'; secrets do GitHub (listados 20/11) também não têm VITE_SENTRY_DSN. Painel Vercel inacessível daqui (docs/agentes/vercel-deploy.md:22).
- **Revisão:** sem contestação cética concluída.

### F1704 · Etapa 01 (Graphify, revisão 11/09): Baseline e preservação

- **Tipo:** Outro
- **O que os docs afirmam:** Classificação da revisão exaustiva para a etapa 1 do plano Graphify: PARCIAL.
- **Fontes:** `docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:135`
- **O que falta:** Script/job que regenere a baseline de `src/` em clone limpo e compare as contagens com docs/graphify/BASELINE_AST_SRC_2026-09-11.md (hoje só o smoke de revenueForecast roda no CI).
- **Evidência:** Aceite da etapa 01 (docs/planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md:73-78): baseline em docs/graphify/ com hashes e comandos; clone limpo reproduz contagens. Existe: docs/graphify/BASELINE_AST_SRC_2026-09-11.md:1-20 (commit 2dfd57b, comando, 2.035 arquivos, 9.349 nós, 38.217 relações) e docs/graphify/EXECUCAO_LOTE_A_2026-09-11.md:3-9 (base bd6a2b1, contagens). Falta automação: .github/workflows/graphify.yml:49 só extrai src/lib/revenueForecast (smoke), não reproduz a baseline de src/ inteiro; nenhum script de reprodução da baseline (ausente: grep -rn 'BASELINE\\|baseline' scripts/graphify/*.mjs → 0). Snapshot em .graphify-local/ não versionado.
- **Revisão:** sem contestação cética concluída.

### F1705 · Etapa 02 (Graphify, revisão 11/09): Domínios e inventário

- **Tipo:** Outro
- **O que os docs afirmam:** Classificação da revisão exaustiva para a etapa 2 do plano Graphify: PARCIAL.
- **Fontes:** `docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:136`
- **O que falta:** Documento em docs/graphify/ com a partição por domínio (caminhos reais), exclusões justificadas por arquivo/pasta e responsáveis.
- **Evidência:** Aceite da etapa 02 (plano:80-85): todo arquivo candidato pertence a um domínio ou tem exclusão justificada; mapa de entradas/responsáveis. Existe só contagem por diretório: docs/graphify/EXECUCAO_LOTE_A_2026-09-11.md:9 (2.037 arquivos em src/, 1.259 componentes, 494 hooks, 174 páginas, 611 migrations, 289 em functions/) e regras de exclusão em .graphifyignore:1-30. Ausente: mapa de domínios do Graphify (grep -rln 'domínio\\|dominio' docs/graphify/ → só menções genéricas; nenhum arquivo de partição CRM/SDR/analytics/gamificação/IA com caminhos reais e responsáveis).
- **Revisão:** sem contestação cética concluída.

### F1707 · Etapa 04 (Graphify, revisão 11/09): ADR local-first

- **Tipo:** Outro
- **O que os docs afirmam:** Classificação da revisão exaustiva para a etapa 4 do plano Graphify: PARCIAL.
- **Fontes:** `docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:138`
- **O que falta:** Escrever docs/decisions/ADR-011-graphify-local-first.md com alternativas, licença da versão pinada (0.9.70) e limites; README.md:14 ainda cita 0.9.48 enquanto pyproject.toml:7 e extract-code-only.mjs:23 usam 0.9.70 — alinhar.
- **Evidência:** Aceite da etapa 04 (plano:94-99): ADR em docs/decisions/ com alternativas e limites; nenhuma dependência no bundle React; CLI offline suportada. Runtime isolado existe: tools/graphify/pyproject.toml:7 ('graphifyy[sql]==0.9.70') + uv.lock; docs/graphify/README.md:1-20 descreve a abordagem local-first. ADR ausente: ls docs/decisions → ADR-001…ADR-010 (rbac, react-query, rls, circuit-breaker, idempotency, request-id, log-retention, security-definer, csp, service-layer, webauthn); grep -rln -i 'graphify\\|local-first' docs/decisions/ → 0.
- **Revisão:** sem contestação cética concluída.

### F1708 · Etapa 05 (Graphify, revisão 11/09): Ameaças e conteúdo

- **Tipo:** Outro
- **O que os docs afirmam:** Classificação da revisão exaustiva para a etapa 5 do plano Graphify: PARCIAL.
- **Fontes:** `docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:139`
- **O que falta:** Documento de política (leitura mínima, retenção, acesso, sanitização) em docs/graphify/ e testes abrangentes de exfiltração/prompt-injection; limites de CPU/memória no wrapper.
- **Evidência:** Aceite da etapa 05 (plano:101-106): política de leitura mínima/retenção/sanitização/limites; conteúdo sensível não alcança logs. Controles implementados: scripts/graphify/graphify-utils.mjs:5 (SECRET_PATTERNS), :44-50 redactSensitiveText, :53-64 sanitizeMetadata/sanitizeError, :67 findSecretSignals, :74-148 recusa de symlink em saída/staging/escopo; extract-code-only.mjs:26 (timeout 120s), limites MAX_FILE_BYTES/MAX_SCOPE_BYTES/LARGE_SCOPE_LIMIT (linha 181); docs/graphify/EXECUCAO_LOTE_F_P0_2026-09-11.md:7-14 lista correções de G-01/G-02. Ausente: documento de política/modelo de ameaças (grep -rln -i 'modelo de ameaças\\|threat' docs/graphify/ → 0); limites de CPU/memória não implementados (grep -n -i 'memory\\|cpu' scripts/graphify/*.mjs → 0).
- **Revisão:** sem contestação cética concluída.

### F1710 · Etapa 07 (Graphify, revisão 11/09): Wrapper e erros

- **Tipo:** Outro
- **O que os docs afirmam:** Classificação da revisão exaustiva para a etapa 7 do plano Graphify: PARCIAL.
- **Fontes:** `docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:141`
- **O que falta:** Códigos de saída distintos (ex.: 2 = configuração ausente, 3 = resultado parcial), testes para caminho com espaços e executável ausente, e comando de consulta documentado.
- **Evidência:** Aceite da etapa 07 (plano:117-122): entrada única em scripts/graphify/ validando versão, raiz real, limites e saída; códigos de erro distintos (falha / sem configuração / parcial); testes para caminho com espaços, executável ausente e argumento malicioso. Implementado: scripts/graphify/extract-code-only.mjs (versão exata :144-146, realpath :58,101-102,121, timeout :26,85-89, limites :181, staging :149-157, sem interpolação em shell — spawn com array :152). Testes: scripts/graphify/extract-code-only.test.mjs (10 casos: versão divergente, erro da CLI, mutação do escopo, symlink na saída, grafo vazio — fixtures em tmp :10-41). Lacunas: código de saída único (extract-code-only.mjs:190 `process.exitCode = 1`; ausente: grep -n 'exitCode = [2-9]' scripts/graphify/*.mjs → 0); sem CLI de consulta própria (só verify/impact/contracts via npm, package.json:48-55); ausente teste de caminho com espaç…
- **Revisão:** sem contestação cética concluída.

### F1711 · Etapa 08 (Graphify, revisão 11/09): Seleção e exclusões

- **Tipo:** Outro
- **O que os docs afirmam:** Classificação da revisão exaustiva para a etapa 8 do plano Graphify: PARCIAL.
- **Fontes:** `docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:142`
- **O que falta:** Testes em scripts/graphify/*.test.mjs com segredo sintético em .env.example, comentário SQL e arquivo não rastreado; decisão registrada sobre tokens.css (design token vs. segredo).
- **Evidência:** Aceite da etapa 08 (plano:124-129): segredo em .env.example/comentário SQL/arquivo não rastreado barrado; output nunca vira input; revisão de tokens.css. Existe: .graphifyignore:4-19 (.env, .env.*, *.pem, _.key, tokens.css, .npmrc, .netrc) e :21-30 (baselines/configs); wrapper recusa reutilizar --out e arquivos sensíveis (graphify-utils.mjs:74-91 assertSafeNewOutputPath; docs/graphify/README.md:16-20). Lacunas: tokens.css continua excluído sem revisão registrada (.graphifyignore:16; REVISAO:142 pede avaliação); nenhum teste com segredo sintético em .env.example ou comentário SQL (grep -n -i 'env.example\\|\.sql' scripts/graphify/_.test.mjs → 0); arquivos não rastreados não têm cenário.
- **Revisão:** sem contestação cética concluída.

### F1712 · Etapa 09 (Graphify, revisão 11/09): Isolamento e revisão

- **Tipo:** Outro
- **O que os docs afirmam:** Classificação da revisão exaustiva para a etapa 9 do plano Graphify: PARCIAL.
- **Fontes:** `docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:143`
- **O que falta:** Lock por destino de saída (arquivo .lock em .graphify-local/) e teste que executa duas worktrees em paralelo verificando que uma falha não corrompe a outra.
- **Evidência:** Aceite da etapa 09 (plano:131-136): raiz Git worktree-aware, SHA + digest de conteúdo, controle de concorrência por destino; duas branches simultâneas não se sobrescrevem. Implementado: scripts/graphify/extract-code-only.mjs:58 (`git rev-parse` com realpath), :71 (commit + worktreeDigest + clean), :137 digestFiles do escopo, :159-161 recusa se escopo/commit mudou durante a extração, :169-181 snapshot.json com commit, worktreeDigest, digest do escopo, versão do extrator e configurationDigest; staging por execução (:149, graphify-utils.mjs:105-110) e destino obrigatoriamente novo (:74-91). Ausente: lock/controle de concorrência explícito (grep -n -i 'lock\\|flock' scripts/graphify/extract-code-only.mjs → só `--locked` do uv) e teste de duas worktrees simultâneas (grep -n -i 'worktree' scripts/graphify/*.test.mjs → 0).
- **Revisão:** sem contestação cética concluída.

### F1713 · Etapa 10 (Graphify, revisão 11/09): Corpus sintético

- **Tipo:** Outro
- **O que os docs afirmam:** Classificação da revisão exaustiva para a etapa 10 do plano Graphify: PARCIAL.
- **Fontes:** `docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:144`
- **O que falta:** Criar tests/graphify/ com corpus persistente (TS/TSX com ciclos e overloads, imports Deno, SQL com schemas homônimos, docs) e resultados esperados versionados; testes de mutação por contrato.
- **Evidência:** Aceite da etapa 10 (plano:138-143): `tests/graphify/` com fixtures TS/TSX, Deno, SQL, docs, ciclos, overloads e nomes repetidos em schemas distintos, com resultados esperados revisados; cada contrato crítico com mutação detectada. Estado: tests/graphify/ não existe (ls tests → a11y, e2e, migrations, deno-live-tests.json, flaky-quarantine.json). Existem apenas fixtures efêmeras geradas em tmp dentro dos testes: scripts/graphify/extract-code-only.test.mjs:10-41 (createFixture com um `src/exemplo.ts` e binário graphify falso), graphify-utils.test.mjs:59-65,114 (grafos JSON inline), static-contracts.test.mjs, docs-index.test.mjs:15; total 6 arquivos de teste (37 casos). Nenhuma fixture SQL/Deno persistente (ausente: ls scripts/graphify/fixtures tests/graphify → inexistentes).
- **Revisão:** sem contestação cética concluída.

### F1714 · Etapa 11 (Graphify, revisão 11/09): Piloto AST frontend

- **Tipo:** Outro
- **O que os docs afirmam:** Classificação da revisão exaustiva para a etapa 11 do plano Graphify: PARCIAL.
- **Fontes:** `docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:145`
- **O que falta:** Wrapper emitir no snapshot.json a contagem de arquivos processados/ignorados/com erro de parser (denominador de cobertura) e tempo/CPU da extração; registrar relatório do piloto por domínio em docs/graphify/.
- **Evidência:** Aceite da etapa 11 (plano:147-152): piloto AST em domínio representativo, contagem de processados/ignorados/com erro, sem chamada de modelo; erros no denominador de cobertura. Existe: docs/graphify/BASELINE_AST_SRC_2026-09-11.md:1-25 (src/ inteiro com --code-only, 2.035 arquivos extraídos, 2 CSS não classificados, 9.349 nós, consulta de fumaça RevenueForecastV2) e extração real no CI de src/lib/revenueForecast (.github/workflows/graphify.yml:49). Lacuna: o wrapper não reporta arquivos com erro/ignorados nem cobertura (ausente: grep -n -i 'processed\\|ignorad\\|skipped\\|errors\\|cobertura\\|coverage' scripts/graphify/extract-code-only.mjs → 0; snapshot.json :169-181 só traz digest/contagens de nós e arestas); relatório de custo local não existe.
- **Revisão:** sem contestação cética concluída.

### F1715 · Etapa 12 (Graphify, revisão 11/09): Aliases e módulos

- **Tipo:** Outro
- **O que os docs afirmam:** Classificação da revisão exaustiva para a etapa 12 do plano Graphify: PARCIAL.
- **Fontes:** `docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:146`
- **O que falta:** Adaptador que aplique a resolução de aliases (já existente em gerar.mjs) aos nós do grafo Graphify; fixtures que provem que nomes iguais em módulos diferentes não se fundem e que alias aponta ao arquivo correto no multigraph.json.
- **Evidência:** Resolução de alias/baseUrl/lazy existe só no gerador de contexto: scripts/ai-context/gerar.mjs:113-146 (tsconfig paths, baseUrl, '@/'→src/), :427 (lazyTargets); teste scripts/ai-context/gerar.unit.mjs:243. No pipeline Graphify não há resolução: scripts/graphify/multigraph.mjs:30-41 só materializa import não resolvido como nó 'external_reference'; grep -i 'alias\|tsconfig' scripts/graphify/*.mjs → 0 resultados. Import dinâmico vira 'dynamic_reference' sem certeza (scripts/graphify/static-contracts.mjs:210-212) e 'dynamic_import' marca limitação (multigraph.mjs:118).
- **Revisão:** sem contestação cética concluída.

### F1716 · Etapa 13 (Graphify, revisão 11/09): Edge e Deno

- **Tipo:** Outro
- **O que os docs afirmam:** Classificação da revisão exaustiva para a etapa 13 do plano Graphify: PARCIAL.
- **Fontes:** `docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:147`
- **O que falta:** Cruzar a allowlist ACTIVE (deploy.yml:144) ou a Management API (secrets SUPABASE_PROJECT_REF/ACCESS_TOKEN no job banco de contexto.yml) com edge-functions.json para marcar 'existe no repo' × 'implantada'; subgrafo de imports Deno (origem/versão) a partir de deno.json e dos entrypoints.
- **Evidência:** edge-functions.json separa pasta existente, verify_jwt configurado, chamadores do front/SQL/cron, uso de _shared e órfãs: scripts/ai-context/gerar.mjs:588-597, :813. Inventário compara publicadas (Management API) × repo: scripts/inventario/gerar-banco.mjs:184-200 (no_repo_sem_deploy). Implantação observada NÃO está disponível: docs/contexto/supabase/edge-functions.md:3 'Management API desabilitada: defina SUPABASE_PROJECT_REF e SUPABASE_ACCESS_TOKEN'. A allowlist ACTIVE de .github/workflows/deploy.yml:144 não é lida por nenhum gerador (grep -i 'ACTIVE\|allowlist\|deploy.yml' scripts/ → 0). Imports Deno remotos/npm e deno.json não são modelados (grep -i 'deno.json\|import_map' scripts/ai-context/gerar.mjs scripts/graphify → 0). Extração é offline/AST (extract-code-only.mjs:152 --code-only).
- **Revisão:** sem contestação cética concluída.

### F1717 · Etapa 14 (Graphify, revisão 11/09): Histórico de migrations

- **Tipo:** Outro
- **O que os docs afirmam:** Classificação da revisão exaustiva para a etapa 14 do plano Graphify: PENDENTE.
- **Fontes:** `docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:148`
- **O que falta:** Em static-contracts.mjs, derivar estado previsto por objeto (ativo/removido/renomeado) com grau de completude e hash do arquivo; testes para CREATE→DROP, duas migrations da mesma versão e RENAME.
- **Evidência:** Adaptador de migrations existe: scripts/graphify/static-contracts.mjs:157-198 (eventos CREATE/ALTER/DROP por arquivo com versão e linha, policies, RLS, SQL dinâmico como lacuna), :240-242 (versões repetidas), sem executar SQL; testes scripts/graphify/static-contracts.test.mjs:19-62. gerar.mjs:481-489 trata RENAME de tabela/coluna e reconstrói estado previsto em banco.json (nota 'Reconstruído de migrations... visão do CÓDIGO', aviso '62 blocos com DDL dinâmico'). Falta: static-contracts gera só lista de eventos, não camada de 'estado previsto com grau de completude' (nenhum código resolve CREATE seguido de DROP); sem hash por arquivo nos eventos; sem teste 'CREATE+DROP não mantém objeto ativo' nem de versões duplicadas.
- **Revisão:** sem contestação cética concluída.

### F1718 · Etapa 15 (Graphify, revisão 11/09): Ligações intercamadas

- **Tipo:** Outro
- **O que os docs afirmam:** Classificação da revisão exaustiva para a etapa 15 do plano Graphify: PENDENTE.
- **Fontes:** `docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:149`
- **O que falta:** Adicionar operação (select/insert/update/delete/rpc), direção e confidence em extractCodeReferences (static-contracts.mjs:200-214) e fixture que distinga SELECT, escrita e execução RPC.
- **Evidência:** Extrator próprio existe: scripts/graphify/static-contracts.mjs:22-28 e :200-214 ('.from', '.rpc', 'functions.invoke', 'storage.from', '.channel' com schema e linha; chamadas não literais viram 'dynamic_reference'); teste static-contracts.test.mjs:5-17. Operação por tabela (select/insert/update/upsert/delete) só em scripts/regras_negocio/generate.py:1392-1395, com rótulo 'NÃO VERIFICADO' (docs/contexto/00-INDEX.md). Falta: as referências do static-contracts não registram operação (SELECT × escrita), direção nem confiança (objeto {kind,name,schema,line} em :207); nenhum fixture distingue SELECT, escrita e RPC no adaptador Graphify.
- **Revisão:** sem contestação cética concluída.

### F1719 · Etapa 16 (Graphify, revisão 11/09): Identidade e multirrelações

- **Tipo:** Outro
- **O que os docs afirmam:** Classificação da revisão exaustiva para a etapa 16 do plano Graphify: PARCIAL.
- **Fontes:** `docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:150`
- **O que falta:** Teste de serialização ida e volta do multigraph.json; qualificar ids por domínio/caminho/assinatura; fixture com overloads e schemas homônimos.
- **Evidência:** Adaptador multigrafo: scripts/graphify/multigraph.mjs:17-73 (relações múltiplas dirigidas, id de aresta por assinatura+ocorrência, schemaVersion 1), :101-107 recusa perda de relação; testes multigraph.test.mjs:5-16 (reads e writes coexistem) e :41-43. IDs de catálogo incluem assinatura: scripts/graphify/catalog-adapter.mjs:85. Falta: teste de ida e volta (serializar→ler→igual) ausente (grep -i 'ida e volta\|round' scripts/graphify → 0); id de nó é o nativo do Graphify sem qualificação por domínio/caminho (multigraph.mjs:18-19 copia node.id); sem fixture de overloads/schemas homônimos; docs/graphify/README.md:28-30 admite que a consulta nativa ainda pode colapsar relações.
- **Revisão:** sem contestação cética concluída.

### F1720 · Etapa 17 (Graphify, revisão 11/09): Proveniência e confiança

- **Tipo:** Outro
- **O que os docs afirmam:** Classificação da revisão exaustiva para a etapa 17 do plano Graphify: PARCIAL.
- **Fontes:** `docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:151`
- **O que falta:** Exigir em validateEdgeShape (graphify-utils.mjs:219-225) origem ou limitação explícita por aresta; registrar hash do arquivo-fonte na proveniência; teste de coerência dos totais.
- **Evidência:** Proveniência: snapshot.json com commit, worktreeDigest, digest do escopo, extractor/version, configurationDigest e createdAt (scripts/graphify/extract-code-only.mjs:168-184); arestas do multigraph levam sourceFile/sourceLocation/origin e confidence padrão 'AMBIGUOUS' (multigraph.mjs:57-62); impact-report.mjs:50 valida digest do multigraph; teste extract-code-only.test.mjs:59. Contadores calculados: docs/contexto/codigo/GRAPH_REPORT.md:10 ('98% EXTRACTED · 2% INFERRED'). Falta: graph.json com aresta sem confidence continua aceito (graphify-utils.mjs:224 só valida se definido) e nós sem source_file ficam com provenance null sem limitação declarada; não há hash por evidência nem teste que exija 'toda aresta tem origem ou limitação'.
- **Revisão:** sem contestação cética concluída.

### F1721 · Etapa 18 (Graphify, revisão 11/09): Publicação atômica

- **Tipo:** Outro
- **O que os docs afirmam:** Classificação da revisão exaustiva para a etapa 18 do plano Graphify: PARCIAL.
- **Fontes:** `docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:152`
- **O que falta:** Rotina de recuperação/limpeza de staging órfão com teste de interrupção; classificação de autoarestas legítimas; validação de integridade snapshot×multigraph também no graphify:verify.
- **Evidência:** Publicação atômica implementada: staging → validação (verify-output) → checagem de escopo/Git inalterados → rename (scripts/graphify/extract-code-only.mjs:149-186), staging removido no finally (:192); testes extract-code-only.test.mjs:107 ('não publica snapshot se o escopo muda'), :115 (symlink no staging), :142 (grafo vazio). Falta: diretórios .staging/run-* de execução interrompida nunca são limpos (removeStaging só trata o run atual, :99-106) e não há procedimento de recuperação documentado/testado; autoarestas não são classificadas (grep -i 'self\|autoaresta' scripts/graphify → 0); verify-output não confere digest do snapshot (só impact-report.mjs:50).
- **Revisão:** sem contestação cética concluída.

### F1722 · Etapa 19 (Graphify, revisão 11/09): Incremental

- **Tipo:** Outro
- **O que os docs afirmam:** Classificação da revisão exaustiva para a etapa 19 do plano Graphify: PENDENTE.
- **Fontes:** `docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:153`
- **O que falta:** Teste de equivalência incremental/integral com renome e remoção; alinhar README (proibição de --force) com contexto.yml:159 ou remover o flag; registrar política de fallback integral.
- **Evidência:** Wrapper recusa reuso de destino (scripts/graphify/graphify-utils.mjs:87; docs/graphify/README.md:73-75). Atualização incremental nativa é usada: .github/workflows/contexto.yml:137-144 (cache graphify-out/cache) e :159 ('graphify update . --force'); .claude/hooks/session-start.sh:66; .husky/post-commit (hook graphify). manifest.json versionado com ast_hash por arquivo (graphify-out/manifest.json). Falta: nenhum teste de equivalência incremental × integral após adicionar/editar/renomear/remover; README.md:75 proíbe '--force' enquanto contexto.yml:159 o usa; falhas não tratadas quanto a re-tentativa.
- **Revisão:** sem contestação cética concluída.

### F1723 · Etapa 20 (Graphify, revisão 11/09): Cobertura por domínio

- **Tipo:** Outro
- **O que os docs afirmam:** Classificação da revisão exaustiva para a etapa 20 do plano Graphify: PARCIAL.
- **Fontes:** `docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:154`
- **O que falta:** Gerar matriz de cobertura por domínio (arquivos/símbolos/relações, exclusões, não resolvidas) e registrar tempo/recursos da geração; unir snapshots por lote do wrapper.
- **Evidência:** Baseline estrutural publicada no HEAD: docs/contexto/codigo/GRAPH_REPORT.md:6 ('Unclassified: 30 file(s)'), :9 (21734 nós/66712 arestas), :14 ('Built from commit 90170947' = HEAD); grafo-graphify.json tem comunidade_por_arquivo, presente, commit_do_grafo; baseline.json 'por_pasta'; INDEX.md 'Números'. Falta: matriz explícita por domínio separando cobertura de arquivos, símbolos e relações, com exclusões e referências não resolvidas por domínio; consumo/tempo não registrados (só 'Token cost'); extração do wrapper por lote cobre apenas src/lib/revenueForecast (.github/workflows/graphify.yml:51) e não há união de snapshots .graphify-local.
- **Revisão:** sem contestação cética concluída.

### F1724 · Etapa 21 (Graphify, revisão 11/09): Identidade e leitura

- **Tipo:** Outro
- **O que os docs afirmam:** Classificação da revisão exaustiva para a etapa 21 do plano Graphify: BLOQUEADA.
- **Fontes:** `docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:155`
- **O que falta:** Checar identidade do projeto (ref usyxfpqlsspldubptrdl/host) no snapshot.py e abortar em divergência; produzir atestação RO verificável consumível por catalog-adapter/reconcile.
- **Evidência:** Coletor real somente leitura: scripts/supabase_snapshot/snapshot.py:951-953 (default_transaction_read_only=on, statement_timeout 90s, lock_timeout 5s), redação de segredos :350-368, Management API 403/404 tratado como opcional :983-984, erros registrados :138-141 → docs/contexto/supabase/errors.md; roda em .github/workflows/contexto.yml job banco com SNAPSHOT_DIR (:186). Falta: nenhuma validação de que o banco conectado é o projeto esperado (grep -i 'usyxfpq\|expected\|esperado' snapshot.py → 0; só current_database() em :432), portanto endpoint divergente não interrompe; no lado Graphify, catalog-adapter.mjs:146 fixa independentlyVerified=false e reconcile exige true (:165) — atestação RO verificável não implementada.
- **Revisão:** sem contestação cética concluída.

### F1725 · Etapa 22 (Graphify, revisão 11/09): Estrutura relacional

- **Tipo:** Outro
- **O que os docs afirmam:** Classificação da revisão exaustiva para a etapa 22 do plano Graphify: BLOQUEADA.
- **Fontes:** `docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:156`
- **O que falta:** Fixture SQL (banco descartável) com PK/FK/UNIQUE/CHECK/EXCLUDE e índices parcial/composto exercitando snapshot.py; conversor do snapshot.json real para o formato aceito por catalog-adapter.mjs.
- **Evidência:** Catálogo relacional real coletado: docs/contexto/supabase/tables/public/sales.md (colunas com tipo, nullable, default, identity/generated, comentário; RLS; policies; views), tables.md, indexes.md, relationships.md, grants.md; snapshot.py:453 (rls_enabled/forced). Normalizador Graphify: scripts/graphify/catalog-adapter.mjs:47-64 (colunas, constraints, índices, policies, grants, triggers) com teste catalog-adapter.test.mjs:19. Falta: nenhum banco sintético/fixture DDL cobrindo PK/FK/UNIQUE/CHECK/EXCLUDE e índice parcial/composto (grep -i 'CHECK\|EXCLUDE\|partial' scripts/supabase_snapshot/test_snapshot.py → 0; catalog-adapter.test usa JSON fixo); catalog-adapter não consome o snapshot real (formatos distintos, sem ponte).
- **Revisão:** sem contestação cética concluída.

### F1726 · Etapa 23 (Graphify, revisão 11/09): Segurança e objetos programáveis

- **Tipo:** Outro
- **O que os docs afirmam:** Classificação da revisão exaustiva para a etapa 23 do plano Graphify: BLOQUEADA.
- **Fontes:** `docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:157`
- **O que falta:** Fixture de permissões (PUBLIC/herança/default grants/restritiva/owner/bypass) e cálculo de privilégio efetivo; alimentar o adaptador de catálogo com o snapshot real.
- **Evidência:** Leitura real de segurança existe: snapshot.py:453 (rls_enabled/rls_forced), :554 (prosecdef), :597 (policies permissive/roles/cmd/using/check), :682-686 (default ACL), :693-696 (roles com bypass_rls e member_of), :814-818 (lint SECURITY DEFINER sem search_path) → policies.md, functions.md + functions/*.sql, roles.md, grants.md, triggers.md, views.md, types-enums.md. generate.py:1385-1395 cruza RLS por operação com o front e rotula 'NÃO VERIFICADO'. Falta: fixture cobrindo PUBLIC, herança, default grants, policy restritiva, owner e bypass RLS (nenhum teste DDL em test_snapshot.py); privilégios explícitos × efetivos não calculados; relações de autorização não entram no grafo Graphify (catalog-adapter sem fonte real).
- **Revisão:** sem contestação cética concluída.

### F1728 · Etapa 25 (Graphify, revisão 11/09): Reconciliação

- **Tipo:** Outro
- **O que os docs afirmam:** Classificação da revisão exaustiva para a etapa 25 do plano Graphify: BLOQUEADA.
- **Fontes:** `docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:159`
- **O que falta:** Matriz única objeto→(código, ledger, observado) com classificação intencional/perda/parcial/não verificável e comparação de assinatura/definição; destravar reconcile-catalog com atestação RO real.
- **Evidência:** Três camadas comparadas em partes: código × migrations/types em banco.json ('tabelas_usadas_no_codigo_sem_definicao', 'rpcs_usadas_no_codigo'; gerar.mjs:814) e scripts/regras_negocio/generate.py:1438-1449 ('tabela usada no código não existe', 'edge invocada mas não existe'); código × banco observado via --schema-snapshot (contexto.yml:291; generate.py:1815-1830 'quando o snapshot discordar, o snapshot vence'); banco × código em scripts/inventario/gerar-banco.mjs:224-230 (tabelas_orfas) e :184-200 (edges publicadas × repo). Reconciliador Graphify existe mas é inoperante: reconcile-catalog.mjs exige catalog.provenance.independentlyVerified=true (catalog-adapter.mjs:165) que nunca é produzido (:146 fixa false). Falta: classificação 'intencional/perda confirmada/parcial/não verificável' (grep -i 'intencional\|nao_verific' scripts → 0), comparação por assinatura/definição (reconcileStaticCon…
- **Revisão:** sem contestação cética concluída.

### F1729 · Etapa 26 (Graphify, revisão 11/09): Documentação rastreável

- **Tipo:** Outro
- **O que os docs afirmam:** Classificação da revisão exaustiva para a etapa 26 do plano Graphify: PENDENTE.
- **Fontes:** `docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:160`
- **O que falta:** Executar graphify:docs no contexto.yml (ou integrar em gerar.mjs) e publicar o índice; registrar autor/data (git log) por documento; ligar documentos a objetos/decisões além de arquivos.
- **Evidência:** Indexador implementado: scripts/graphify/docs-index.mjs:19-24 (classifica historico/proposta/decisao/operacional), :26-48 (links Markdown explícitos; 'ausente' como pendência, 'externo', 'fora_do_repositorio'), :68 (limitações declaradas); testes docs-index.test.mjs:20-43; script npm graphify:docs (package.json:55); README docs/graphify/README.md:64-71. Falta: não roda em nenhum workflow nem é consumido pelo gerador (grep 'graphify:docs\|docs-index' .github/workflows scripts/ai-context → 0); autor/data não são preservados; relações documento→objeto/decisão limitadas a links de arquivo.
- **Revisão:** sem contestação cética concluída.

### F1730 · Etapa 27 (Graphify, revisão 11/09): Semântica opcional

- **Tipo:** Outro
- **O que os docs afirmam:** Classificação da revisão exaustiva para a etapa 27 do plano Graphify: PENDENTE.
- **Fontes:** `docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:161`
- **O que falta:** Registrar ADR curto de decisão sobre o enriquecimento semântico (desabilitado por padrão; critérios para habilitar) e, se avaliado, fixture de documento com instruções maliciosas.
- **Evidência:** Semântica permanece desabilitada de fato: extração é --code-only (extract-code-only.mjs:152); docs/contexto/codigo/GRAPH_REPORT.md:11 'Token cost: 0 input · 0 output'; .claude/skills/graphify/SKILL.md:157 (sem chave de API; graphify não lê ANTHROPIC/OPENAI); docs/graphify/README.md:75 proíbe modo semântico sem a etapa; docs/graphify/EXECUCAO_LOTE_A_2026-09-11.md:52. Nenhum 'secrets.' no passo graphify de contexto.yml:153-160. Falta: decisão formal de dispensa/habilitação (provedor, dados, custo, retenção) não registrada (grep -i 'enriquecimento semântico' docs → só o plano e a revisão); sem teste de instrução maliciosa em documento.
- **Revisão:** sem contestação cética concluída.

### F1731 · Etapa 28 (Graphify, revisão 11/09): Matriz funcional

- **Tipo:** Outro
- **O que os docs afirmam:** Classificação da revisão exaustiva para a etapa 28 do plano Graphify: PENDENTE.
- **Fontes:** `docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:162`
- **O que falta:** Enriquecer rotas.json/modulos.json com requisito, estado por ligação (comprovada/não resolvida/teste ausente/runtime não verificado) e sinalização contextual de mock/flag/DEMO_MODE.
- **Evidência:** Matriz técnica gerada: docs/contexto/codigo/rotas.json ('urls' com caminho→componente→arquivo→hooks→tabelas/edges, 'menu', 'lazy'; gerar.mjs:809), hooks.json (tabelas, rpcs, edges, coberto_por_testes), testes.json ('sem_teste', 'cobertura_por_arquivo'), modulos.json, inventario/estado/rotas.json ('fora_do_menu', 'problemas'). Falta: coluna 'requisito/funcionalidade' (a matriz parte de rota, não de requisito); estados padronizados 'referência comprovada / ligação não resolvida / teste ausente / runtime não verificado' por linha; tratamento de mock/flag/DEMO_MODE com leitura de contexto (grep DEMO_MODE gerar.mjs → só filtro de segredo :799); estado observado da etapa 25 não é anexado.
- **Revisão:** sem contestação cética concluída.

### F1732 · Etapa 29 (Graphify, revisão 11/09): Backlog de achados

- **Tipo:** Outro
- **O que os docs afirmam:** Classificação da revisão exaustiva para a etapa 29 do plano Graphify: PENDENTE.
- **Fontes:** `docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:163`
- **O que falta:** Gerar/publicar backlog deduplicado a partir dos alertas (baseline.json, inventario/estado, lints.md) com hipótese × confirmado, reprodução, referência e responsável.
- **Evidência:** Achados gerados existem: baseline.json 'alertas' e 'todos' (gerar.mjs:788-799: edges_orfas, tabelas_sem_rls, componentes_orfaos, scripts_orfaos, possiveis_segredos_no_codigo), inventario/estado/banco.json 'alertas' (rls_sem_policy, historico_cron_sem_limpeza, dead_letters_pendentes), docs/contexto/supabase/lints.md, issues 'NÃO VERIFICADO' em generate.py:1436-1449. Falta: backlog deduplicado com hipótese, reprodução mínima, referência e responsável não foi produzido (nenhum documento no repo; grep -i 'backlog' docs/graphify → só plano/revisão); sem ordenação por evidência/impacto nem separação débito × regressão.
- **Revisão:** sem contestação cética concluída.

### F1734 · Etapa 31 (Graphify, revisão 11/09): CLI de consulta

- **Tipo:** Outro
- **O que os docs afirmam:** Classificação da revisão exaustiva para a etapa 31 do plano Graphify: PARCIAL.
- **Fontes:** `docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:165`
- **O que falta:** Wrapper npm para query/path/explain que confira 'Built from commit' × HEAD antes de responder (erro em PT); atualizar/automatizar o GRAPH_REPORT.md versionado ou parar de versioná-lo.
- **Evidência:** Consulta disponível e documentada em PT: AGENTS.md:72 e docs/agentes/contexto-gerado.md ('graphify query/path/explain', checagem de frescura por 'Built from commit'); recriação em clone limpo na nuvem via .claude/hooks/session-start.sh:45-70; impacto verifica frescura e recusa snapshot obsoleto com erro em PT (scripts/graphify/impact-report.mjs:23-31). Falta: query/path/explain usam a CLI nativa sem wrapper que exiba revisão/fonte ou recuse snapshot obsoleto (a checagem é manual); o graphify-out/GRAPH_REPORT.md versionado está obsoleto ('Built from commit 02a29b65' vs HEAD 90170947d), mostrando que a frescura não é garantida; mensagens da CLI nativa em inglês; sem exemplos testados no projeto.
- **Revisão:** sem contestação cética concluída.

### F1735 · Etapa 32 (Graphify, revisão 11/09): Impacto por diff

- **Tipo:** Outro
- **O que os docs afirmam:** Classificação da revisão exaustiva para a etapa 32 do plano Graphify: PENDENTE.
- **Fontes:** `docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:166`
- **O que falta:** Derivar ids alterados do 'git diff <base>...HEAD' (incluindo arquivos removidos/renomeados e .sql), mapear para testes sugeridos e expor como job informativo no graphify.yml.
- **Evidência:** Análise conservadora implementada: scripts/graphify/multigraph.mjs:109-139 (dependentes reversos: mudar B impacta A; relações dinâmicas/inferidas geram limitação), scripts/graphify/impact-report.mjs:39-41 (id desconhecido → recusa e exige suíte completa), :23-31 (snapshot obsoleto recusado), :50 (digest); testes multigraph.test.mjs:27-39; npm graphify:impact (package.json:51). Falta: não calcula símbolos alterados a partir de um diff/base Git (exige '--changed <ids>' manual), não trata renomes, exclusões e SQL, não sugere testes, e não está em nenhum workflow (grep graphify:impact .github → 0).
- **Revisão:** sem contestação cética concluída.

### F1737 · Etapa 34 (Graphify, revisão 11/09): MCP local e hook

- **Tipo:** Outro
- **O que os docs afirmam:** Classificação da revisão exaustiva para a etapa 34 do plano Graphify: PENDENTE.
- **Fontes:** `docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:168`
- **O que falta:** Registrar decisão MCP (dispensa ou adoção stdio RO); alinhar README com os hooks instalados; remover o caminho _PINNED fixo do post-commit; teste de duas worktrees e de falha da ferramenta sem quebrar o Husky.
- **Evidência:** Hooks existem e são tolerantes a falha: .husky/post-commit e .husky/post-checkout instalados por 'graphify hook install' (marcadores graphify-hook-start/end, GRAPHIFY_SKIP_HOOK=1, exit 0 em rebase/merge, linhas 20-33); .claude/settings.json PreToolUse 'hook-guard' sai com 0 se o binário não existir; backup .claude/settings.json.graphify-bak. Falta: decisão formal separada sobre servidor MCP local não registrada (grep -i 'MCP local' docs → só a revisão); docs/graphify/README.md:75 ainda diz 'não use hook automático', contradizendo os hooks instalados; .husky/post-commit traz caminho de máquina fixo (_PINNED='/home/ubuntu/.pyenv/versions/3.12.13/bin/python3.12'), não portátil; sem teste de duas worktrees/falha da ferramenta; desinstalação documentada apenas pelos marcadores.
- **Revisão:** sem contestação cética concluída.

### F1738 · Etapa 35 (Graphify, revisão 11/09): Visualização privada

- **Tipo:** Outro
- **O que os docs afirmam:** Classificação da revisão exaustiva para a etapa 35 do plano Graphify: PENDENTE.
- **Fontes:** `docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:169`
- **O que falta:** Documentar a decisão (fallback textual ou HTML privado agregado), e se HTML for mantido localmente, fixture com rótulos maliciosos provando escape e ausência de CDN/upload.
- **Evidência:** Fallback textual na prática: .github/workflows/contexto.yml:160 remove graphify-out/graph.html antes de publicar e publica só GRAPH_REPORT.md (:165); graph.html fica fora do Git por .gitignore:49. docs/graphify/BASELINE_AST_SRC_2026-09-11.md:39 adia a decisão ('A etapa 35 decidirá'). Falta: decisão registrada (HTML agregado × fallback textual), estratégia de agregação, verificação de escape/CDN e teste com HTML malicioso (grep -i 'graph.html\|visualiza' docs/graphify docs/agentes → nenhuma decisão); 'graphify update .' em .claude/hooks/session-start.sh:66 ainda gera graph.html localmente sem sanitização verificada.
- **Revisão:** sem contestação cética concluída.

### F1740 · Etapa 37 (Graphify, revisão 11/09): Caches e artefatos CI

- **Tipo:** Outro
- **O que os docs afirmam:** Classificação da revisão exaustiva para a etapa 37 do plano Graphify: PARCIAL.
- **Fontes:** `docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:171`
- **O que falta:** Chavear o cache do contexto.yml por versão do graphify + digest de tools/graphify/uv.lock (remover restore-key genérico `graphify-cache-`), validar/rejeitar cache incompatível antes de usar, escanear saídas (verify-output.mjs) antes do upload e regenerar graphify-out/GRAPH_REPORT.md a partir de um SHA existente na main.
- **Evidência:** .github/workflows/graphify.yml:23-51 (permissions contents:read, nenhum upload-artifact, saídas em .graphify-local ignoradas por .gitignore:49-54); .github/workflows/contexto.yml:137-144 cache actions/cache com restore-keys `graphify-cache-` (aceita qualquer cache anterior, sem chave por versão/configuração nem verificação de integridade); contexto.yml:170-175 upload-artifact `contexto-codigo` com retention-days 1; graphify-out/GRAPH_REPORT.md:17 'Built from commit 02a29b65' — `git cat-file -t 02a29b65` → 'Not a valid object name' (identificador de snapshot não ligado a commit real da main).
- **Revisão:** sem contestação cética concluída.

### F1741 · Etapa 38 (Graphify, revisão 11/09): Atualização pós-merge

- **Tipo:** Outro
- **O que os docs afirmam:** Classificação da revisão exaustiva para a etapa 38 do plano Graphify: PENDENTE.
- **Fontes:** `docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:172`
- **O que falta:** Gravar no índice publicado o SHA efetivamente mergeado e um estado de atualização (fresco/obsoleto) comparando com HEAD; definir política de expiração das fontes; corrigir ou parar de versionar graphify-out/GRAPH_REPORT.md com SHA inexistente.
- **Evidência:** .github/workflows/contexto.yml:28-31 (push em main) e :44-45 (schedule horário) executam `graphify update . --force` (contexto.yml:153-160) e publicam na branch contexto; concurrency group `contexto` com cancel-in-progress false (contexto.yml:57-59) serializa execuções; .husky/post-commit e .husky/post-checkout fazem rebuild local (docs/agentes/contexto-gerado.md:28). Porém o relatório versionado graphify-out/GRAPH_REPORT.md:17 aponta commit `02a29b65`, inexistente na história (`git cat-file -t` falha), e nada marca o estado como obsoleto; nenhuma política de expiração das fontes (grep -rn -i 'expira' docs/graphify scripts/graphify → só a revisão).
- **Revisão:** sem contestação cética concluída.

### F1743 · Etapa 40 (Graphify, revisão 11/09): Manutenção de versões

- **Tipo:** Outro
- **O que os docs afirmam:** Classificação da revisão exaustiva para a etapa 40 do plano Graphify: PENDENTE.
- **Fontes:** `docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:174`
- **O que falta:** Adicionar ecossistema `uv`/`pip` em .github/dependabot.yml para tools/graphify, documentar responsável/periodicidade/licença e um ensaio de atualização lado a lado + rollback (runtime, config, formato) em docs/graphify/.
- **Evidência:** Pinagem existe: tools/graphify/pyproject.toml + uv.lock com `uv sync --directory tools/graphify --locked` (graphify.yml:48, contexto.yml:158) e `assertExactGraphifyVersion` em scripts/graphify/graphify-utils.mjs (testado em graphify-utils.test.mjs:3). Falta rotina: .github/dependabot.yml só tem package-ecosystem npm (linha 4) e github-actions (linha 44), nenhum ecossistema uv/pip para tools/graphify; ausente: grep -rli 'changelog\\|licen' docs/graphify → 0 fora da revisão; nenhum teste de rollback/migração de formato.
- **Revisão:** sem contestação cética concluída.

### F1744 · Etapa 41 (Graphify, revisão 11/09): Cenários hostis

- **Tipo:** Outro
- **O que os docs afirmam:** Classificação da revisão exaustiva para a etapa 41 do plano Graphify: PARCIAL.
- **Fontes:** `docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:175`
- **O que falta:** Adicionar fixtures de arquivo acima de 10 MiB, encoding inválido, symlink cíclico, prompt injection e HTML malicioso em scripts/graphify/extract-code-only.test.mjs (e teste de que o modo semântico permanece desligado).
- **Evidência:** scripts/graphify/extract-code-only.test.mjs cobre symlink intermediário (:86), aninhado no escopo (:97), criado no staging (:115), raiz de saída simbólica (:124), mudança do escopo durante extração (:107), destino parcial (:134), redação de segredo (:142,:153); graphify-utils.test.mjs:8 path traversal e :72 findSecretSignals. Limites de 10 MiB/200 MiB existem (extract-code-only.mjs:27-28,135) mas sem teste; ausente: grep -n -i 'encoding inv\\|html\\|prompt\\|MiB' scripts/graphify/*.test.mjs → 0 resultados.
- **Revisão:** sem contestação cética concluída.

### F1745 · Etapa 42 (Graphify, revisão 11/09): Banco descartável

- **Tipo:** Outro
- **O que os docs afirmam:** Classificação da revisão exaustiva para a etapa 42 do plano Graphify: PENDENTE.
- **Fontes:** `docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:176`
- **O que falta:** Criar fixture relacional em Postgres descartável (supabase start ou container), coletor RO que gere o JSON bruto, e teste que compare DDL da fixture com o catálogo normalizado (roles, RLS, overloads, views, triggers, jobs, permissão negada).
- **Evidência:** scripts/graphify/catalog-adapter.mjs (normalização/recusa de rows/sanitização) e catalog-adapter.test.mjs (3 testes com fixtures JSON em memória); reconcile-catalog.mjs recusa catálogo não atestado; docs/graphify/README.md:79-81 'O coletor do catálogo canônico não está habilitado'. Nenhuma fixture em PostgreSQL/Supabase local, nenhuma comparação automatizada DDL×catálogo coletado (docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:490: 'fixture JSON, não banco real').
- **Revisão:** sem contestação cética concluída.

### F1746 · Etapa 43 (Graphify, revisão 11/09): Recuperação e concorrência

- **Tipo:** Outro
- **O que os docs afirmam:** Classificação da revisão exaustiva para a etapa 43 do plano Graphify: PENDENTE.
- **Fontes:** `docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:177`
- **O que falta:** Suíte de resiliência em scripts/graphify/: interrupção controlada da extração, corrupção de cache/graph.json, lock abandonado com recuperação auditável, execução concorrente em duas worktrees e comparação incremental×integral.
- **Evidência:** Só há peças isoladas: promoção atômica via staging com digest antes/depois (extract-code-only.test.mjs:107 'não publica snapshot se o escopo muda') e recusa de snapshot obsoleto em scripts/graphify/impact-report.mjs:30,51 (`--allow-stale`). Ausente: grep -n -i 'lock\\|interrup\\|corrup' scripts/graphify/*.test.mjs → 0 resultados; nenhuma suíte de duas worktrees/incremental×integral/downgrade (A_planos_execucao.md:491: NI).
- **Revisão:** sem contestação cética concluída.

### F1748 · Etapa 45 (Graphify, revisão 11/09): Não regressão e gates

- **Tipo:** Outro
- **O que os docs afirmam:** Classificação da revisão exaustiva para a etapa 45 do plano Graphify: PARCIAL.
- **Fontes:** `docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:179`
- **O que falta:** Registrar em docs/graphify/ a matriz lint/typecheck/test/build/deno com resultado por comando e falhas preexistentes vs introduzidas, e estender graphify.yml para mais de um domínio.
- **Evidência:** Gates reais rodam: .github/workflows/pr-checks.yml:143-144 (`npm run graphify:test`), package.json:58 script `ci` inclui graphify:test, graphify.yml:47-51 (testes + extração de fumaça em src/lib/revenueForecast), codeql.yml:9,15 cobre scripts/graphify/*.test.mjs; branch feat/hermes-graphify-fundacao encerrada/mergeada (docs/agentes/branches-encerradas-261117.md:101) com scripts presentes em main. Falta a saída da etapa: matriz de comandos×resultados×falhas preexistentes para a integração (ausente: grep -rli 'matriz de comandos' docs/graphify → 0) e E2E conforme ambiente.
- **Revisão:** sem contestação cética concluída.

### F1750 · Etapa 47 (Graphify, revisão 11/09): Expansão e cobertura

- **Tipo:** Outro
- **O que os docs afirmam:** Classificação da revisão exaustiva para a etapa 47 do plano Graphify: PENDENTE.
- **Fontes:** `docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:181`
- **O que falta:** Produzir a matriz domínio→fonte→cobertura→owner→estado de atualização em docs/graphify/ e marcar banco/Edge como 'não observado' até coleta RO com identidade.
- **Evidência:** Cobertura ampla existe via .github/workflows/contexto.yml:153-160 (`graphify update .` no repo inteiro, publicado na branch contexto) e docs/agentes/contexto-gerado.md:18-28; CI dedicado só cobre src/lib/revenueForecast (graphify.yml:6,51); bloqueios do catálogo registrados em docs/graphify/README.md:79-83. Ausente: grep -rli 'domínio→fonte\\|owner' docs/graphify → 0 (sem matriz domínio→fonte→cobertura→owner→estado).
- **Revisão:** sem contestação cética concluída.

### F1751 · Etapa 48 (Graphify, revisão 11/09): Runbook e rollback

- **Tipo:** Outro
- **O que os docs afirmam:** Classificação da revisão exaustiva para a etapa 48 do plano Graphify: PARCIAL.
- **Fontes:** `docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:182`
- **O que falta:** Runbook em docs/graphify/ com: incidente de vazamento (expurgo com autorização), falha de parser, volta à versão anterior (pyproject/uv.lock), desabilitar workflow vs apagar artefatos, e ensaio registrado de remoção/restauração.
- **Evidência:** docs/graphify/README.md:5-14 (bootstrap), :73-83 (limites e proibições) e docs/agentes/contexto-gerado.md:18-28 (frescura, hooks husky, GRAPHIFY_SKIP_HOOK=1) cobrem instalação/consulta. Ausente: grep -rli 'rollback\\|incidente' docs/graphify → só REVISAO_EXAUSTIVA; grep -rli 'volta à versão' docs/graphify → 0; nenhum ensaio documentado de remoção da integração preservando Husky/regras/dados nem de restauração.
- **Revisão:** sem contestação cética concluída.

### F1752 · Etapa 49 (Graphify, revisão 11/09): Handoff e treinamento

- **Tipo:** Outro
- **O que os docs afirmam:** Classificação da revisão exaustiva para a etapa 49 do plano Graphify: PENDENTE.
- **Fontes:** `docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:183`
- **O que falta:** Documento docs/graphify/HANDOFF.md com perguntas-exemplo do projeto, limites de confiança, tratamento de fonte velha, responsáveis, e registro de uma reprodução independente do bootstrap+consulta.
- **Evidência:** Instruções para agentes existem: .claude/skills/graphify/SKILL.md (gatilho /graphify, uso de query/path/explain) e docs/agentes/contexto-gerado.md:18-28 (comandos, frescura, limites de permissão); AGENTS.md §8 orienta `graphify query` antes de busca textual. Ausente: grep -rli 'handoff' docs/graphify → só REVISAO_EXAUSTIVA_PLANO_2026-09-11.md; sem exemplos por perfil (dev/Cline/Codex), responsáveis pela operação/triagem nem reprodução por outra pessoa registrada.
- **Revisão:** sem contestação cética concluída.

### F1753 · Etapa 50 (Graphify, revisão 11/09): Aceite e operação

- **Tipo:** Outro
- **O que os docs afirmam:** Classificação da revisão exaustiva para a etapa 50 do plano Graphify: PARCIAL.
- **Fontes:** `docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:184`
- **O que falta:** Relatório final com evidência de ≥3 PRs usando o fluxo e 7 dias de operação, backlog residual e riscos aceitos; corrigir o SHA do GRAPH_REPORT.md versionado.
- **Evidência:** Matriz das 50 etapas existe em docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:130-184 e reconciliação posterior em docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:461-499 (C 17 · P 19 · NI 13); pipeline em main (graphify.yml, contexto.yml, pr-checks.yml:143). Falta prova de operação real: ausente grep -rli 'sete dias\\|três PRs' docs/graphify → só declarações de pendência (REVISAO:184, LOTE_A:53); relatório versionado graphify-out/GRAPH_REPORT.md:17 aponta SHA inexistente (`git cat-file -t 02a29b65` falha).
- **Revisão:** sem contestação cética concluída.

### F1759 · Auditoria de dead code (ts-prune) e consolidação de edge functions

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Recomenda auditoria de funções não chamadas em 30 dias, ts-prune e consolidação de funções similares.
- **Fontes:** `docs/reports/BACKEND_ANALYSIS_REPORT.md:632-648`
- **O que falta:** Adicionar knip ou ts-prune ao package.json com script `dead:check` rodando em pr-checks.yml (ou documentar o uso de edge-functions.json órfãs como substituto), e decidir remoção/arquivo das 71 functions fora da allowlist.
- **Evidência:** ausente: grep -n -i 'ts-prune\\|knip' package.json .github/workflows scripts → 0 resultados; o que existe: package.json:36 `deps:check` (dependency-cruiser), :59 `debt:report` (scripts/debt-report.mjs:56 só eslint unused-disable-directives), e scripts/ai-context/gerar.mjs:431,597,788-796 que calcula componentes_orfaos/edges_orfas/scripts_orfaos publicados pela contexto.yml; consolidação de Edge: deploy por allowlist de 100 (.github/workflows/deploy.yml:140-150) mas 171 pastas permanecem em supabase/functions/. Fonte docs/reports/BACKEND_ANALYSIS_REPORT.md:644-648 é recomendação.
- **Revisão:** sem contestação cética concluída.

### F1761 · Circuit breaker com histórico persistido (circuit_breaker_events)

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** useCircuitBreaker/useCircuitBreakerHistory gravam eventos em circuit_breaker_events (RLS auth insert, admin read).
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:1318-1319,1042`
- **O que falta:** Decidir e alinhar: ou policy INSERT para `authenticated` (como o doc afirma) ou gravação via Edge/service_role, para que eventos de usuários não-admin não sejam perdidos; opcionalmente fazer useCircuitBreaker (hook React) chamar logCircuitEvent nas transições; corrigir docs/DOCUMENTACAO_SISTEMA.md:1042.
- **Evidência:** Máquina de estados: src/hooks/useCircuitBreaker.ts:21-130 (OPEN/HALF_OPEN/CLOSED) — mas esse hook NÃO grava evento (grep 'supabase\\|logCircuitEvent' no arquivo → 0); quem persiste é `withCircuitBreaker` em src/hooks/circuitBreakerUtils.ts:53-75,100-160 (insert fire-and-forget em circuit_breaker_events), usado por src/hooks/useRetryMutation.ts:7,180 (consumido por src/hooks/sales/useSalesData.ts). Leitura: useCircuitBreakerHistory.ts:22,55 montada em src/pages/SecurityDashboard.tsx:38-39 (rota AppRoutes.tsx:1048) e CircuitBreakerDashboard em AdminDashboard.tsx/Configuracoes.tsx. Banco real tables/public/circuit_breaker_events.md: RLS sim, INSERT exige `is_admin_or_manager(auth.uid())`, SELECT admin/manager, DELETE admin — diverge do doc ('RLS auth insert'): eventos de vendedores são rejeitados silenciosamente pelo catch (circuitBreakerUtils.ts:71-75); Edge: supabase/functions/_shared/ci…
- **Revisão:** sem contestação cética concluída.

### F1766 · Critério 10/10 do hardening: zero 404/500/503 e 24h sem falha de cron

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** O lote só é 10/10 com Edge publicadas, zero 404/500/503 nos jobs ativos, zero falha SQL de cron em 24h, smoke por role e tráfego real sem regressão.
- **Fontes:** `docs/execucao/HARDENING_CANONICO_2026-08-31.md:207-221`
- **O que falta:** Publicar (ou desagendar) as 12 functions chamadas por cron que estão fora da allowlist; conferir net._http_response em 24h (zero 404/500/503); fazer smoke por role e observar tráfego real. Hoje o critério 10/10 não é atingido.
- **Evidência:** Falhas SQL de cron: snapshot cron-runs.md (últimas 3 execuções por job, 7 dias) → grep -i failed → 0 resultados; ex.: job 38 cron-failure-alerter-10min succeeded 2026-11-20 02:10/02:00/01:50 (cron-runs.md:191-197). Porém 12 das 22 edge functions chamadas por cron.md via trigger_internal_edge_job estão FORA da allowlist ACTIVE de .github/workflows/deploy.yml:144 (challenge-expiration-alerts, check-lead-sla, check-quote-expiration, check-v4-callback-alerts, process-call-recording-ingest, process-scheduled-sends, rotate-daily-challenges, scheduled-reports-runner, sdr-consecutive-alerts, send-alert-notifications, webvitals-regression-alert, winloss-webhook-health-monitor) — pela premissa da allowlist, esses jobs apontam para functions não publicadas (404). net._http_response não está no snapshot (só citado em stats.md), logo 'zero 404/500/503' não é verificável aqui. Smoke por role e tráfeg…

### F1771 · Deploy de edge functions não é automático — verificação por curl e deploy manual via CLI

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Deploy de functions não é garantido pelo deploy do frontend; cada function alterada deve ser confirmada com curl (DEPLOYMENT.md §4) e deployada manualmente se necessário.
- **Fontes:** `docs/RUNBOOK.md:38-42`
- **O que falta:** Deploy de edge functions não dispara a cada merge nem nas tags reais de release (só por dispatch); migrations seguem manuais por falta de SUPABASE_DB_PASSWORD.
- **Evidência:** Existe workflow com passo de deploy de functions: .github/workflows/deploy.yml:131-152 (supabase functions deploy por allowlist de 100), mas só roda em push de tag v*/dispatch (deploy.yml:31-41), exige environment 'production' com aprovador (linhas 9-11,119) e sai com exit 0 se o secret SUPABASE_ACCESS_TOKEN estiver vazio (linhas 135-139) — existência do secret não é verificável daqui. Não há deploy de functions no merge em main. docs/DEPLOYMENT.md:50-73 (§4) descreve o deploy manual via CLI e a confirmação por curl de health (linhas 71-73); docs/RUNBOOK.md:38-42 idem. Nenhum workflow chamado *deploy*functions* (ls .github/workflows). 'Functions alteradas respondem em produção' não testado (sem rede para o host).| cético: .github/workflows/deploy.yml:31-40: os únicos gatilhos são workflow_dispatch e push de tag 'v*'. As tags reais do release-please são 'promo-champions-v2-v1.10.1' etc. …

### F1780 · Etapa 005 (CI): Disparar manualmente Cron Monitoring, X-Request-Id e Bundle após fase 0

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Registrar os 3 runs verdes.
- **Fontes:** `docs/execucao/PLANO_WORKFLOWS_GITHUB_ACTIONS_100_ETAPAS_2026-09-27.md:68`
- **O que falta:** Adicionar workflow_dispatch ao bundle e ao request-id, corrigir o cron-monitoring e registrar 3 runs verdes.
- **Evidência:** workflow_dispatch existe só em .github/workflows/cron-monitoring.yml:21; .github/workflows/edge-functions-request-id.yml:3-14 e .github/workflows/edge-functions-bundle.yml:3-13 têm apenas push/pull_request (grep workflow_dispatch → 0 nesses dois). Runs reais (github_list_runs_for_workflow): cron-monitoring #330-334 verdes, mas eventos schedule/push (nenhum workflow_dispatch); request-id #927-929 e bundle #956-958 com conclusão action_required (PR #579 do release-please), não há registro de '3 runs verdes disparados manualmente' em docs/execucao.| cético: Reforça o veredito: .github/workflows/edge-functions-bundle.yml:3-21 e edge-functions-request-id.yml:3-23 têm só gatilhos push/pull_request, sem workflow_dispatch, então nem dá para dispará-los manualmente como a etapa pede. cron-monitoring.yml:21 tem workflow_dispatch, mas o verificador registrou 3 runs manuais com failure.

### F1782 · Etapa 022 (CI): Fechar alertas Dependabot #1, #2, #4, #7, #8

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Esperado 0 abertos após etapa 21.
- **Fontes:** `docs/execucao/PLANO_WORKFLOWS_GITHUB_ACTIONS_100_ETAPAS_2026-09-27.md:88`
- **O que falta:** Resolver o alerta Dependabot #62.
- **Evidência:** github_list_dependabot_alerts state=open em 2026-11-20 retorna 1 alerta: #62 minimatch 10.2.6 (GHSA-g3hv-75wg-m249, medium, transitivo dev, criado 2026-11-04). Os alertas #1, #2, #4, #7, #8 citados não aparecem como abertos (fechados). Critério '0 alertas abertos' não atendido por 1 alerta novo.| cético: Sem evidência nova: o verificador encontrou 1 alerta aberto (#62 minimatch), então o critério '0 alertas abertos' não é atendido, embora #1/#2/#4/#7/#8 estejam fechados.

### F1783 · Etapa 043 (CI): Alerta de N falhas consecutivas em schedules via N8N

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Poll github_list_runs_for_workflow a cada 6h.
- **Fontes:** `docs/execucao/PLANO_WORKFLOWS_GITHUB_ACTIONS_100_ETAPAS_2026-09-27.md:115`
- **O que falta:** Acesso à instância N8N para conferir o fluxo de poll. No repo: o alerta existente está inerte sem N8N_ALERT_WEBHOOK_URL e não conta falhas consecutivas.
- **Evidência:** Lado repo: .github/workflows/ci-failure-alert.yml:8-10,46-104 dispara em workflow_run com falha na main e faz POST para secrets.N8N_ALERT_WEBHOOK_URL (pula se vazio, linhas 83-84) — é alerta por evento de falha única, não 'N falhas consecutivas em schedules' nem polling de github_list_runs_for_workflow a cada 6h (grep -i 'consecutiv\|schedule' ci-failure-alert.yml → 0). O fluxo N8N em si (serviço externo) e a existência do secret não são verificáveis daqui; grep -ril n8n em .github/scripts → só ci-failure-alert.yml.| cético: Correção factual: existe artefato no repo. .github/workflows/ci-failure-alert.yml:1-40 avisa o N8N a cada falha na main dos workflows agendados (Cron Monitoring, QA Exhaustive Weekly, DB Backup etc.). Porém o secret N8N_ALERT_WEBHOOK_URL não existe entre os 12 do repo (github_list_actions_secrets), então ci-failure-alert.yml:83-84 sempre sai sem alertar. Não há cont…

### F1790 · Etapa 2 do plano: Congelar deploys destrutivos

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Suspender migrations, deleções, alteração de grants e deploy não emergencial nos dois projetos. Saída esperada: janela de mudança registrada. Gate: autorização operacional.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:658-658`
- **O que falta:** Registrar formalmente a janela de mudança (documento em docs/execucao/ com período, escopo congelado e autorização) e, se desejado, bloquear o job de migrations/deploy em deploy.yml durante a janela (ex.: variável de repositório FREEZE=1 checada antes de `supabase db push`).
- **Evidência:** Branch protection existe: ruleset `main-protection` ativo (gh api repos/adm01-debug/Promo_Champions_V2.1/rulesets → id 22148182, enforcement active, target branch) e docs/agentes/github-ci.md:23-24 (4 status checks + ruleset). Janela de mudança/congelamento de deploys destrutivos: ausente — docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:120 marca 🔶 'Decisão do operador'; `grep -rniE 'janela de mudan\|congel\|freeze' docs .github` → só menções em planos/status (AUDITORIA_EXAUSTIVA_2026-08-26:658, STATUS:120,279,323). deploy.yml:130-160 continua aplicando `supabase db push` e deploy de edges a cada tag, sem gate de janela.
- **Revisão:** sem contestação cética concluída.

### F1791 · Etapa 20 (Graphify): Estabelecer cobertura e escala por domínio

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Executar todos os domínios por lotes e juntar snapshots compatíveis.
- **Fontes:** `docs/planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md:212-217`
- **O que falta:** Gerar matriz por domínio (módulos de modulos.json × arquivos cobertos/excluídos/refs não resolvidas) a partir de grafo-graphify.json no scripts/ai-context/gerar.mjs e publicar em contexto/codigo/.
- **Evidência:** Grafo AST do repositório inteiro é gerado automaticamente: .github/workflows/contexto.yml:153-165 (`graphify update . --force`, copia GRAPH_REPORT.md) → contexto/codigo/GRAPH_REPORT.md ('21734 nodes · 66712 edges', 'Built from commit 90170947', 'Unclassified: 30 file(s)') e grafo-graphify.json. Matriz de cobertura por domínio (arquivos, símbolos, relações verificáveis, exclusões e referências não resolvidas por domínio) não existe: `grep -rniE 'matriz de cobertura' docs scripts` → 0; docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:154 '20| Cobertura por domínio \| PARCIAL'; graphify.yml:51 só extrai `src/lib/revenueForecast` como smoke.
- **Revisão:** sem contestação cética concluída.

### F1792 · Etapa 20 do plano: Criar baseline de tráfego e erros

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Mapear rotas, RPCs, relações, funções e jobs realmente usados por 30–90 dias. Saída esperada: inventário de consumidores. Gate: retenção/logs disponíveis.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:679-679`
- **O que falta:** Coletar uso real por 30–90 dias (pg_stat_statements/edge logs/cron.job_run_details) e versionar inventário de consumidores por rota/RPC/função/job em inventario/estado/ (novo gerador em scripts/inventario/).
- **Evidência:** Inventário versionado existe mas é estático/curto prazo: inventario/estado/banco.json (chaves alertas, cron, edge_functions, tabelas com `uso_no_codigo`, medido_em 2026-11-12) gerado por scripts/inventario/gerar-banco.mjs (README inventario/estado/README.md: cron 'falhas e taxa em 24 h/7 d'); rotas.json/edges.json mapeiam consumidores por import estático. Baseline de tráfego real 30–90 dias: ausente — fontes de telemetria quase vazias no banco real (stats.md:127 query_telemetry 0 linhas; stats.md:23 error_logs 3 linhas); `grep -rliE 'invent[áa]rio de consumidores' docs scripts` → 0 (só planos). STATUS_100_ETAPAS:143 🔒.
- **Revisão:** sem contestação cética concluída.

### F1793 · Etapa 25 (Graphify): Comparar código, migrations e catálogo observado

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Matriz código × ledger × catálogo com classificação de diferença.
- **Fontes:** `docs/planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md:249-254`
- **O que falta:** Alimentar reconcile-catalog.mjs com o snapshot real (contexto/docs/contexto/supabase/snapshot.json ou banco.json) como catálogo observado atestado e publicar a matriz (objeto, evidência, classificação intencional/perda/parcial/não verificável).
- **Evidência:** Script existe: scripts/graphify/reconcile-catalog.mjs:1-33 (lê --contracts/--catalog, chama reconcileStaticContracts de scripts/graphify/catalog-adapter.mjs:164, grava em .graphify-local/) e npm `graphify:reconcile` (package.json:54). Porém docs/graphify/README.md: 'O normalizador local marca todo catálogo como não verificado e a reconciliação o recusa até um coletor RO confiável produzir atestação verificável'; REVISAO_EXAUSTIVA:159 '25| Reconciliação \| BLOQUEADA'. Nenhuma matriz código × ledger × catálogo versionada; o snapshot real do banco (contexto/supabase) não é consumido pelo reconciliador.
- **Revisão:** sem contestação cética concluída.

### F1794 · Etapa 30 (Graphify): Gerar relatório coerente e auditável

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Visão por domínio, cobertura, limitações, evidências e estado de cada fonte.
- **Fontes:** `docs/planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md:286-291`
- **O que falta:** Acrescentar ao INDEX.md/GRAPH_REPORT uma seção calculada de cobertura e limitações por domínio (arquivos fora do grafo, relações INFERRED por módulo, fontes indisponíveis em destaque).
- **Evidência:** Gerador automático com totais calculados em PT-BR existe: scripts/ai-context/gerar.mjs → contexto/codigo/INDEX.md ('GERADO AUTOMATICAMENTE', 'Commit-base: 90170947…', tabela Números) e indice.py → contexto/00-INDEX.md (coluna 'Estado' por fonte, HEAD fixado), publicados por contexto.yml a cada push/10 min (runs 'Contexto para agentes de IA' success em 2026-11-20). GRAPH_REPORT.md traz 'Unclassified: 30 file(s)' e 'Built from commit'. Falta a visão do plano Graphify por domínio com cobertura/limitações/exclusões do grafo; REVISAO_EXAUSTIVA:164 '30| Relatório auditável \| PARCIAL — gerador por snapshot/fonte e cobertura ausente'.
- **Revisão:** sem contestação cética concluída.

### F1797 · Etapa 50 (Graphify): Auditar as 50 etapas e comprovar operação real

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Reconciliar commits/PRs/CI/artefatos; ≥3 PRs e 7 dias de operação.
- **Fontes:** `docs/planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md:434-439`
- **O que falta:** Produzir relatório final em docs/graphify/ reconciliando commits/PRs/CI (ex.: contexto.yml, graphify.yml) com as 50 etapas, evidências reproduzíveis e riscos aceitos.
- **Evidência:** Existe matriz das 50 etapas: docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:9 ('25 etapas parciais, 20 pendentes e 5 com validação do banco bloqueada') e :129 '## 5. Matriz completa das 50 etapas'. Mas o próprio doc (:184) registra '50| Aceite e operação \| PARCIAL — faltam fechamento obrigatório, merge, três PRs e sete dias de uso real'; não há relatório final posterior (ls docs/graphify → últimos arquivos de 2026-09-11). A operação real existe parcialmente via contexto.yml (graphify update em cada push), mas sem reconciliação commits/PRs/CI documentada.
- **Revisão:** sem contestação cética concluída.

### F1799 · Etapa 79 do plano: Criar SLOs e tracing ponta a ponta

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** request_id de browser→Edge→PostgREST/provider, métricas RED e alertas acionáveis. Saída esperada: dashboards e runbook. Gate: infraestrutura.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:756-756`
- **O que falta:** Criar job pg_cron (*/15) chamando fn_check_slo_burn_rate + migration comentada; escrever docs/runbooks/slo.md com thresholds/resposta; expor métricas RED (taxa/erros/duração) no /admin/platform-slo.
- **Evidência:** Tracing: supabase/functions/_shared/request-id.ts:89 `withRequestId` (X-Request-Id em resposta + log estruturado), adotado em 171 index.ts (`grep -rl 'withRequestId(' supabase/functions --include=index.ts| wc -l`); browser gera o header em src/lib/edgeFetch.ts:20; lint CI .github/workflows/edge-functions-request-id.yml:53-57. SLO: função `public.fn_check_slo_burn_rate` existe no banco real (contexto/supabase/functions.md:179) e rota /admin/platform-slo (src/routes/AppRoutes.tsx:997). Faltas: nenhum cron agenda o burn-rate (`grep -n slo cron.md` → 0; docs/runbooks/alertas-operacionais.md:66 'Agendamento (pg_cron) pendente'); não há runbook/dashboard RED documentado (ls docs/runbooks → sem slo*); propagação até PostgREST/provider não evidenciada.
- **Revisão:** sem contestação cética concluída.

### F1800 · Etapa 80 do plano: Testar backup e restauração

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** PITR, Storage, secrets, migrations e restore drill isolado. Saída esperada: RPO/RTO medidos. Gate: ambiente/custo.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:757-757`
- **O que falta:** Executar restore do artifact em projeto Supabase descartável, medir RPO/RTO e registrar em docs/runbooks/restore.md; confirmar PITR no dashboard; adicionar backup de Storage e inventário de secrets (nomes).
- **Evidência:** Backup: .github/workflows/db-backup.yml:19 (cron diário 03:00 UTC), :47-70 gate que falha sem secret ou com projeto errado, :81-125 pg_dump + validação `pg_restore --list`, :127-151 artifact + S3; run agendado 'DB Backup (off-site)' success em 2026-11-20 03:03 (gh run list main) — logo o backup efetivo roda (docs/DR_PLAN.md:8-11 de 18/10 dizia inoperante, está defasado). PITR: docs/DR_PLAN.md:12-15 'não contratado/evidenciado'. Restore drill com RPO/RTO medidos: ausente — DR_PLAN.md:79 só prescreve teste trimestral; `grep -rniE 'drill\|RPO' docs/runbooks docs/execucao` → 0 registros; ls docs/runbooks → sem restore*/backup*. Backup de Storage/secrets: nenhum workflow (`ls .github/workflows| grep -i backup` → só db-backup.yml).
- **Revisão:** sem contestação cética concluída.

### F1803 · Etapa canônica 26/08 nº 19: Baseline automatizado de presença Edge (local × origem × destino)

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Etapa canônica 19 (plano 26/08, matriz de status 30/08, estado 🔒): manifest por ambiente.
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:142-142`
- **O que falta:** Passar SUPABASE_ACCESS_TOKEN ao job supabase/ do contexto.yml para gerar edge-functions.md do destino a cada coleta; registrar formalmente que a origem está fora de alcance ou obter acesso para o terceiro eixo.
- **Evidência:** Manifest automático local × destino existe: inventario/estado/banco.json chave `edge_functions` {publicadas (slug, status, versao, atualizada_em), no_repo, no_repo_sem_deploy, publicadas_sem_codigo_no_repo}, medido_em 2026-11-12, gerado por scripts/inventario/gerar-banco.mjs via GET /functions (inventario/estado/README.md) e agendado em .github/workflows/inventario-estado-semanal.yml:24 (segunda 10:23 UTC, PR automática); inventario/estado/edges.json (gerado_em 2026-11-12) lista chamadores; allowlist das 100 ativas em deploy.yml:144. Faltas: ambiente 'origem' (Lovable) sem manifest (STATUS_100_ETAPAS:279 'Aguarda acesso Lovable'); snapshot contexto/supabase/edge-functions.md diz 'Management API desabilitada: defina SUPABASE_PROJECT_REF e SUPABASE_ACCESS_TOKEN' (contexto.yml não gera lista de deployadas); nenhum arquivo deployed.txt no repo.
- **Revisão:** sem contestação cética concluída.

### F1804 · Etapa canônica 26/08 nº 20: Baseline de tráfego e erros (rotas, RPCs, relações, funções, jobs 30–90 dias)

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Etapa canônica 20 (plano 26/08, matriz de status 30/08, estado 🔒): inventário de consumidores.
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:143-143`
- **O que falta:** Ligar o produtor de query_telemetry/error_logs (hoje vazios) ou coletar pg_stat_statements + cron.job_run_details por 30–90 dias e versionar inventário de consumidores em inventario/estado/.
- **Evidência:** Tabelas de telemetria existem no banco real com RLS: contexto/supabase/tables.md:154 error_logs (RLS sim, 4 policies), :261 query_telemetry (RLS sim, 3), :379 web_vitals_samples (RLS sim, 1). Volume: stats.md:18 web_vitals_samples ~15.8k linhas; stats.md:23 error_logs 3 linhas; stats.md:127 query_telemetry 0 linhas — não há base de 30–90 dias para rotas/RPCs/funções. Inventário de consumidores versionado só estático (inventario/estado/banco.json `uso_no_codigo`, cron 24h/7d). STATUS_100_ETAPAS:143 🔒.
- **Revisão:** sem contestação cética concluída.

### F1805 · Etapa canônica 26/08 nº 79: SLOs e tracing ponta a ponta (request_id browser→Edge→PostgREST) + alertas

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Etapa canônica 79 (plano 26/08, matriz de status 30/08, estado 🔒): métricas RED; thresholds, destino e resposta; dashboards, alertas e runbook.
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:234-234`
- **O que falta:** Agendar fn_check_slo_burn_rate no pg_cron; incluir webvitals-regression-alert na allowlist (liberando vaga) ou desativar o job 44; criar docs/runbooks/slo.md com thresholds, destino e resposta.
- **Evidência:** withRequestId: supabase/functions/_shared/request-id.ts:89, usado em 171 index.ts; browser envia X-Request-Id (src/lib/edgeFetch.ts:20; src/hooks/useQuotes.ts:338); lint CI edge-functions-request-id.yml:53-57. log-web-vitals: supabase/functions/log-web-vitals/index.ts:3 usa withRequestId, está na allowlist (deploy.yml:144) e é chamada por src/lib/webVitals.ts. Alertas: `fn_check_slo_burn_rate` existe no banco (functions.md:179, comentário 'Agendar via pg_cron a cada 15min') mas sem job (cron.md sem 'slo'; runbooks/alertas-operacionais.md:66 'Agendamento pendente'); cron job 44 `webvitals-regression-alert-daily` (cron.md:33) chama edge `webvitals-regression-alert` que está FORA da allowlist (`grep -c webvitals-regression-alert deploy.yml` → 0) → alerta não roda em produção. docs/runbooks/slo* ausente.
- **Revisão:** sem contestação cética concluída.

### F1806 · Etapa canônica 26/08 nº 80: Testar backup e restauração (PITR, Storage, secrets, migrations)

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Etapa canônica 80 (plano 26/08, matriz de status 30/08, estado 🔒): restore drill isolado; RPO/RTO medidos.
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:235-235`
- **O que falta:** Restaurar o artifact mais recente em projeto Supabase descartável, cronometrar (RTO) e medir defasagem (RPO), registrando em docs/runbooks/restore.md.
- **Evidência:** Backup testado quanto à restaurabilidade: .github/workflows/db-backup.yml:111-125 (`pg_restore --list` do dump antes de publicar) com run agendado success 2026-11-20 03:03 em main (gh run list). Restore drill isolado e RPO/RTO: ausentes — `ls docs/runbooks` sem restore*; docs/DR_PLAN.md:79 só prescreve teste trimestral; DR_PLAN.md:12-15 PITR não evidenciado; STATUS_100_ETAPAS:235 🔒 'Aguarda ambiente'.
- **Revisão:** sem contestação cética concluída.

### F1814 · Handoff P091: Executar somente limpezas nominais aprovadas

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Fila canônica do handoff (onda 10): Executar somente limpezas nominais aprovadas. Todas as etapas começam pendentes; 0 de 100 executadas na data do handoff. Gate(s) conforme §13.
- **Fontes:** `docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:412-412`
- **O que falta:** Registrar em docs/execucao/ (ou no corpo das PRs de DDL) a aprovação nominal do proprietário por item removido, ligando às PRs #540/#552/#582 e às candidatas de docs/DEAD_TABLES.md.
- **Evidência:** Limpezas foram executadas via PRs mergeadas (git log main: #582 'dropa policies permissive de sales/activities', #552 'remove policy morta', #540 'remove do ledger as 241 versoes de migration sem arquivo local'), mas não há registro de aprovação nominal do proprietário: `grep -rniE 'aprova[çc][ãa]o nominal\|APROVADO' docs/execucao docs/DEAD_TABLES.md docs/DATA_RETENTION.md` → 0 fora dos planos; AGENTS.md §5.7 permite merge sem aprovação para escopo comum e §5.8 exige dono só para DDL. Reviews das PRs no GitHub não verificadas nesta sessão.
- **Revisão:** sem contestação cética concluída.

### F1815 · Handoff P093: Entregar correções em PRs pequenos por risco/domínio

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Fila canônica do handoff (onda 10): Entregar correções em PRs pequenos por risco/domínio. Todas as etapas começam pendentes; 0 de 100 executadas na data do handoff. Gate(s) conforme §13.
- **Fontes:** `docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:414-414`
- **O que falta:** Adicionar ao template seção obrigatória 'Rollback / reversão' (passos de reversão do front, da migration e da edge function) e checkbox 'migration reversível'; o processo 'PRs pequenos por risco/domínio' já está em AGENTS.md §5.
- **Evidência:** .github/pull_request_template.md:1-83 existe (checklists tsc/eslint/vitest, Evidência Pós-Aplicação com server_time em :28-47, segurança, performance, a11y) e AGENTS.md §5.6 exige o template; porém grep -i 'rollback' .github/pull_request_template.md → 0 resultados; 'migration reversível' também ausente. docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:414 mantém `[ ] P093` pendente.
- **Revisão:** sem contestação cética concluída.

### F1816 · Handoff P094: Clone de staging e ensaio de migrations, reconciliação e deploy

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Fila canônica do handoff (onda 10): Clone de staging e ensaio de migrations, reconciliação e deploy. Todas as etapas começam pendentes; 0 de 100 executadas na data do handoff. Gate(s) conforme §13.
- **Fontes:** `docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:415-415`
- **O que falta:** Criar o projeto/branch Supabase de staging, adicionar workflow (ex.: .github/workflows/staging-dry-run.yml) que aplique migrations + deploy de functions no staging e publique relatório de dry-run; registrar o ensaio em docs/.
- **Evidência:** docs/STAGING.md:1-30 é só um guia de provisionamento e afirma em :3 'Hoje existe um único projeto Supabase de produção'; supabase/config.staging.toml:1-20 existe com placeholders (site_url staging.salespro.com). grep -rli staging .github/workflows/ → 0 resultados; nenhum workflow de dry-run. docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:183 registra P094 = NI ('Criar staging'). Supabase Branching citado só em docs/agentes/replay-do-repo-261117.md:113, sem branch/workflow no repo.
- **Revisão:** sem contestação cética concluída.

### F1818 · Handoff P096: Observabilidade e SLOs para frontend, Edge, banco, jobs e integrações

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Fila canônica do handoff (onda 10): Observabilidade e SLOs para frontend, Edge, banco, jobs e integrações. Todas as etapas começam pendentes; 0 de 100 executadas na data do handoff. Gate(s) conforme §13.
- **Fontes:** `docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:417-417`
- **O que falta:** Criar docs/runbooks/slo.md com SLOs por camada (front, Edge, banco, jobs, integrações) e owner; agendar `cron.schedule` para public.fn_check_slo_burn_rate(); configurar destino externo dos alertas (SLACK_CI_WEBHOOK_URL / Sentry DSN) e registrar evidência.
- **Evidência:** Existe: supabase/functions/log-web-vitals/index.ts:61-62,113 (insere em web_vitals_samples; na allowlist .github/workflows/deploy.yml:144; tabela com RLS e ~15.8k linhas em snapshot supabase/stats.md:18); src/pages/admin/AdminPlatformSLOPage.tsx + src/hooks/admin/usePlatformSLO.ts:32 (rpc fn_admin_platform_slo, snapshot functions.md:169); supabase/functions/cron-failure-alerter/index.ts:78,149 (rpc fn_admin_get_new_cron_failures → notifications) na allowlist e cron job 38 '_/10' (snapshot cron.md:28, runs 'succeeded' em cron-runs.md:191+); tabela error_logs com RLS (tables.md:154) alimentada por src/lib/errorTracking.ts:100. Falta: find docs -iname '*slo*' → 0 (não há docs/runbooks/slo_); fn_check_slo_burn_rate existe (functions.md:179) mas grep 'slo' snapshot cron.md → só detect_slow_queries, sem cron do burn-rate; docs/runbooks/alertas-operacionais.md:66 'Agendamento (pg_cron) pendent…
- **Revisão:** sem contestação cética concluída.

### F1820 · Handoff P099: Backup restaurável, rollback ensaiado e go/no-go

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Fila canônica do handoff (onda 10): Backup restaurável, rollback ensaiado e go/no-go. Todas as etapas começam pendentes; 0 de 100 executadas na data do handoff. Gate(s) conforme §13.
- **Fontes:** `docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:420-420`
- **O que falta:** Corrigir o secret do db-backup e registrar run verde; executar restore real em ambiente isolado e documentar (RPO/RTO medidos); ensaiar rollback e registrar; criar ata go/no-go em docs/runbooks/release.md.
- **Evidência:** Backup: .github/workflows/db-backup.yml:19 cron diário '0 3 * * *', :81 pg_dump, :111-126 valida o dump com openssl + `pg_restore --list` (prova de dump restaurável, não de restore executado); porém docs/DR_PLAN.md:8-11 declara o workflow 'inoperante' (secret SUPABASE_DB_URL aponta para outro projeto) e :12 PITR 'não contratado/evidenciado'. Rollback: docs/ROLLBACK.md:1-25 e docs/execucao/ROLLBACK_HARDENING_CANONICO_2026-08-31.md são procedimentos, sem ensaio registrado. Go/no-go: find docs -iname '_go-no-go_\|_release_' → 0; A_planos_execucao.md:188 P099 = NI.
- **Revisão:** sem contestação cética concluída.

### F1833 · Plano 30/08 etapa 19 (P019): Documentar e testar restauração em ambiente isolado

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Etapa 19 do plano de 100 etapas (auditoria 30/08; = P019 do handoff): Documentar e testar restore em ambiente isolado; RPO, RTO e evidência de restore utilizável.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:668-668`
- **O que falta:** Executar restore real em projeto/branch isolado, medir RPO/RTO e registrar em docs/runbooks/restore.md com saída literal e server_time; corrigir secret SUPABASE_DB_URL do db-backup.
- **Evidência:** Documentação: docs/DR_PLAN.md existe (RTO 4h em :35; PITR 'não contratado/evidenciado' em :12; :79 prevê teste de restauração trimestral em staging — intenção, não evidência); .github/workflows/db-backup.yml:111-126 valida o dump via `pg_restore --list` (integridade, não restore em ambiente isolado) e DR_PLAN.md:8-11 declara o workflow 'inoperante' por secret errado. ausente: find docs -iname '_restore_' → 0 (sem docs/runbooks/restore*.md). A_planos_execucao.md:129 P019 = P 'Execução de restore'.
- **Revisão:** sem contestação cética concluída.

### F1835 · Plano 30/08 etapa 93 (P093): Entregar correções em PRs pequenos por risco/domínio

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Etapa 93 do plano de 100 etapas (auditoria 30/08; = P093 do handoff): Revisão, testes, migration reversível e rollback por PR.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:766-766`
- **O que falta:** Seção 'Rollback / migration reversível' no template de PR.
- **Evidência:** Idem F1815: .github/pull_request_template.md:1-83 existe e é exigido por AGENTS.md §5.6, mas grep -i 'rollback\|revers' .github/pull_request_template.md → 0 resultados; AUDITORIA_EXAUSTIVA_2026-08-30...md:766 exige 'migration reversível e rollback próprios por PR'.
- **Revisão:** sem contestação cética concluída.

### F1836 · Plano 30/08 etapa 94 (P094): Clone de staging e ensaio de migrations, reconciliação e deploy

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Etapa 94 do plano de 100 etapas (auditoria 30/08; = P094 do handoff): Relatório de dry-run sem modificar origem ou produção.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:767-767`
- **O que falta:** Provisionar staging e workflow de dry-run com relatório.
- **Evidência:** Idem F1816: docs/STAGING.md:3 'Hoje existe um único projeto Supabase de produção'; supabase/config.staging.toml:1-20 com placeholders; grep -rli staging .github/workflows/ → 0; A_planos_execucao.md:183 P094 = NI.
- **Revisão:** sem contestação cética concluída.

### F1838 · Plano 30/08 etapa 96 (P096): Observabilidade e SLOs para frontend, Edge, banco, jobs e integrações

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Etapa 96 do plano de 100 etapas (auditoria 30/08; = P096 do handoff): Dashboards e alertas acionáveis com owner.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:769-769`
- **O que falta:** docs/runbooks/slo.md com owners; cron.schedule de fn_check_slo_burn_rate(); destino externo de alertas configurado.
- **Evidência:** Idem F1818: log-web-vitals, AdminPlatformSLOPage/fn_admin_platform_slo, cron-failure-alerter (cron job 38, snapshot cron.md:28) e error_logs existem e estão ligados; faltam docs/runbooks/slo* (find → 0), cron para fn_check_slo_burn_rate (snapshot cron.md sem entrada; docs/runbooks/alertas-operacionais.md:66 'Agendamento (pg_cron) pendente') e owner por alerta ('dashboards e alertas acionáveis com owner', AUDITORIA...:769).
- **Revisão:** sem contestação cética concluída.

### F1845 · SLO burn rate e request-id (ADR-006)

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Etapa 79 P: ADR-006, edge-functions-request-id.yml, 20261002000100_slo_burn_rate.sql.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:80`
- **O que falta:** Agendar via db_query no MCP: cron.schedule('slo-burn-rate-15min','*/15 * * * *','SELECT public.fn_check_slo_burn_rate()') + arquivo em supabase/migrations/; expor o resultado (security_events critical) no painel admin ou em alerta Slack.
- **Evidência:** Request-id OK: docs/decisions/ADR-006-request-id-strategy.md:4 ('Status: Aceito'); .github/workflows/edge-functions-request-id.yml:52-56 (lint scripts/lint-request-id.ts + fuzz request-id-fuzz_test.ts); grep -rl 'request-id' supabase/functions/*/index.ts → 171/171. SLO burn-rate só no banco, sem agendamento nem consumidor: contexto/supabase/functions.md:179 (fn_check_slo_burn_rate existe, comentário 'Agendar via pg_cron a cada 15min'), coluna cron vazia; grep -niE 'slo\|burn' contexto/supabase/cron.md → só detect_slow_queries_hourly (nenhum job chama fn_check_slo_burn_rate); supabase/migrations/20261002000100_slo_burn_rate.sql:255 só agenda detect_slow_queries; grep -rn 'burn_rate\|fn_check_slo_burn_rate' src supabase/functions scripts → só types.ts gerado. contexto/supabase/stats.md:128 security_events = 0 linhas.
- **Revisão:** sem contestação cética concluída.

### F1848 · supabase start local falha por chave duplicada em supabase_migrations.schema_migrations

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Doc: replay local do schema para no primeiro grupo duplicado; validação de schema local inválida.
- **Fontes:** `docs/auditoria/RECONCILIACAO_MIGRATIONS_2026-08-26.md:55-57`
- **O que falta:** Adicionar job em pr-checks.yml que roda `supabase start`/`supabase db reset` (CLI + Docker) para provar replay das 700 migrations; executar uma vez e registrar o resultado no doc de reconciliação.
- **Evidência:** Causa do bug eliminada no repo: node scripts/check-migrations.mjs → 'Gate de migrations OK: 700 arquivos, 700 versões únicas'; scripts/check-migrations.mjs:71-85 (Map de versões, erro 'versão duplicada'); grupos citados em docs/auditoria/RECONCILIACAO_MIGRATIONS_2026-08-26.md:50-53 foram renumerados (20260104143930_audit_trail.sql / 20260104143931_webhooks_system.sql; 20260104170152_additional_indexes.sql / 20260104170153_stored_procedures.sql; 20260530000001/2/3_*.sql); gate em .github/workflows/pr-checks.yml:187-189. Porém o critério ('supabase db reset/start conclui') não é exercitado: grep -rn 'supabase db reset\|supabase start' .github/workflows → 0 (só 'db push --linked' em deploy.yml:167); docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:70 ('Job migrations apply cleanly (supabase db reset)| NÃO INICIADO'); CLI supabase não instalada neste ambiente (w…
- **Revisão:** sem contestação cética concluída.

### F1849 · Telemetria de retries, cron monitors e threshold alerts

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Observabilidade 9.5/10: telemetria de retries, circuit breaker, monitores de cron e alertas de threshold.
- **Fontes:** `docs/reports/AUDIT_2026-07-13.md:17-17`
- **O que falta:** Adotar withRetry({telemetry}) nas functions que fazem chamadas externas (hoje 6/171) e confirmar via SELECT count(*) FROM edge_retry_events após 24h; sem linhas, o threshold-alert nunca dispara nada.
- **Evidência:** Infra existe e roda: contexto/supabase/tables.md:142 (edge_retry_events RLS sim) e :76 (circuit_breaker_events RLS sim); supabase/functions/_shared/retry.ts:20,72 (insert em edge_retry_events, fire-and-forget); contexto/supabase/cron.md jobs 17 detect-stalled-cron-15min, 38 cron-failure-alerter-10min, 40 edge-retry-threshold-alert-15min (ativos); contexto/supabase/cron-runs.md:128-135 e :209-216 (succeeded em 20/11/2026); 'edge-retry-threshold-alert' e 'cron-failure-alerter' na allowlist deploy.yml:144; supabase/functions/edge-retry-threshold-alert/index.ts:18,68. Porém telemetria vazia: contexto/supabase/stats.md:274 (edge_retry_events = 0 linhas), :184 (circuit_breaker_events = 0), :128 (security_events = 0); grep -rl 'retry.ts' supabase/functions/*/index.ts → apenas 6 functions usam o helper com telemetria.
- **Revisão:** sem contestação cética concluída.

### F1857 · Triagem semanal de PRs / revisão mensal de dependências

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** NÃO VERIFICÁVEL.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:420`
- **O que falta:** Criar workflow mensal (schedule) que abre issue 'Revisão de dependências <mês>' listando PRs major do Dependabot pendentes, e registrar decisões; opcionalmente cooldown/ignore de major em .github/dependabot.yml.
- **Evidência:** Triagem de PRs: estado vivo OK (ver F1856: 1 PR aberta, #579 de 19/11; pr-review-sla.yml:10,26). Revisão mensal de dependências: não existe ritual mensal; o que há é Dependabot semanal — .github/dependabot.yml:7,47 ('interval: weekly'), :18,55 (groups), :9,49 (open-pull-requests-limit 10/5) — e .github/workflows/dependabot-automerge.yml:15 (cron diário 11:30 UTC). ausente: grep -rliE 'revisão mensal\|revisao mensal' docs/execucao → 0 registros; docs/PROCESSOS.md:97 exige 'revisão mensal de dependências com PRs major explicitamente decididas'. G_infra_ci_integracoes.md:69 ('Dependabot: cooldown, ignore de major, grupo catch-all| NÃO INICIADO').
- **Revisão:** sem contestação cética concluída.

### F3644 · Rota /admin/platform-slo (6 afirmações nos docs)

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Monitoramento pós-deploy de SLOs.| Doc afirma rotas admin de SLO e telemetria existem; SLOs formais não auditáveis no repo. \| Rota admin para SLO de email e webhooks. \| API.md declara a rota `/admin/platform-slo` renderizando o componente AdminPlatformSLOPage com acesso "admin". \| Rota registrada em AppRoutes.tsx com acesso "admin", GET em produção 200. Status no doc: OK \| Rota /admin/platform-slo (AppRoutes.tsx:278) renderiza src/pages/admin/AdminPlatformSLOPage.tsx; role: admin. Classificação do doc: IMPLEMENTADO_PARCIAL. Evidência: link src/components/admin/AdminQuickLinks.tsx:62 · sb=1 useQuery=1 mut=0 (árvore 4 arq.) · somente leitura — nenhuma mutação/persistência na árvore
- **Fontes:** `docs/DEPLOYMENT.md:106`, `docs/auditoria/AUDITORIA_TECNICA_EXAUSTIVA_2026-09-02.md:228,235`, `docs/runbooks/email-transacional.md:40`, `docs/API.md:437-437`, `docs/prod-readiness.md:87`, `docs/estado/01_FRONTEND_ROTAS.md:196-196`
- **O que falta:** rota /admin/platform-slo → src/pages/admin/AdminPlatformSLOPage.tsx (AppRoutes.tsx); sem entrada no menu (sidebarMenuData.ts) → só acessível por URL
- **Evidência:** rota /admin/platform-slo → src/pages/admin/AdminPlatformSLOPage.tsx (AppRoutes.tsx); sem entrada no menu (sidebarMenuData.ts) → só acessível por URL| CONTESTADO pelo cético (IMPLEMENTADO): Rota: src/routes/AppRoutes.tsx:996-1003 (/admin/platform-slo dentro de <Admin>). Navegação: o menu leva a /admin (sidebarMenuData.ts:354); AdminDashboard (rota em AppRoutes.tsx:956-962) monta <AdminQuickLinks/> (src/pages/AdminDashboard.tsx:28,156), que tem o link em src/components/admin/AdminQuickLinks.tsx:61-66. Dado real: src/hooks/admin/usePlatformSLO.ts:28-36 chama supabase.rpc('fn_admin_platform_slo') e lança o erro; a RPC existe no banco (functions.md:169, retorna SETOF v_platform_slo) e a view também (views.md:1045). Estados: erro em AdminPlatformSLOPage.tsx:128-134, loading com Skeleton e vazio com badge 'Sem dados'. A tela é só leitura por natureza: um painel de SLO não tem formulário.
- **Revisão:** em disputa. O cético propõe Implementado e o juiz ainda não decidiu.

### F3645 · Rota /admin/retry-test-status (3 afirmações nos docs)

- **Tipo:** Rota/tela
- **O que os docs afirmam:** API.md declara a rota `/admin/retry-test-status` renderizando o componente RetryTestStatusPage com acesso "admin".| Rota /admin/retry-test-status (AppRoutes.tsx:290) renderiza src/pages/RetryTestStatusPage.tsx; role: admin. Classificação do doc: IMPLEMENTADO_TOTAL. Evidência: link src/pages/RetryTestStatusPage.tsx:138 · sb=1 useQuery=1 mut=1 (árvore 8 arq.) \| Rota registrada em AppRoutes.tsx com acesso "admin", GET em produção 200, chamando as edge functions run-retry-tests. Status no doc: BLOQUEADO: edge run-retry-tests indisponível
- **Fontes:** `docs/API.md:449-449`, `docs/estado/01_FRONTEND_ROTAS.md:208-208`, `docs/prod-readiness.md:95`
- **O que falta:** Publicar run-retry-tests (entrar na allowlist de deploy.yml:144, o que exige tirar outra por causa do limite de 100) e criar link de navegação para a página.
- **Evidência:** rota /admin/retry-test-status → src/pages/RetryTestStatusPage.tsx (AppRoutes.tsx); sem entrada no menu (sidebarMenuData.ts) → só acessível por URL| cético: Rota em AppRoutes.tsx:1092-1099 (/admin/retry-test-status dentro de <Admin>). A ação principal é src/hooks/useRetryTestRun.ts:25-30, que faz supabase.functions.invoke('run-retry-tests'). A pasta supabase/functions/run-retry-tests existe, mas a função NÃO está na allowlist ACTIVE: grep -o 'run-retry-tests' .github/workflows/deploy.yml → 0. Logo não roda em produção. Não há link de navegação: RetryTestStatusPage.tsx:138 é só <link rel=canonical>, e não há entrada em sidebarMenuData.ts nem em AdminQuickLinks.

### F1860 · CORS wildcard em 100% das edge functions por ALLOWED_ORIGINS ausente

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** Todas as functions testadas retornam Access-Control-Allow-Origin: * porque ALLOWED_ORIGINS nunca foi configurada; ~155 functions ainda usam corsHeaders estático em vez de getCorsHeaders().
- **Fontes:** `docs/execucao/VALIDACAO_ADVERSARIAL_E_CORRECOES_2026-09-02.md:96-101`
- **O que falta:** Confirmar no painel Supabase (Edge Functions → Secrets) que ALLOWED_ORIGINS está definida com os domínios de produção e testar com curl -H 'Origin: https://evil.test' um OPTIONS em uma function deployada; decidir se report-embed-public mantém '*' por ser embed público (documentar) e remover o export estático corsHeaders de cors.ts:112 quando nenhum caminho server-to-server depender dele.
- **Evidência:** Correção estrutural feita: supabase/functions/_shared/cors.ts:7-10,24-31,62 (sem ALLOWED_ORIGINS cai em DEFAULT_ALLOWED_ORIGINS — Vercel, promobrindes, localhost — 'Nunca mais _'); :86-108 getCorsHeaders(req) ecoa origem casada + Vary: Origin. Adoção: grep -rl getCorsHeaders supabase/functions/_/index.ts → 167/171; grep import estático de corsHeaders → 0. Pendências: corsHeaders estático com '*' ainda exportado em cors.ts:112-115; supabase/functions/report-embed-public/index.ts:141-180,324 responde 'Access-Control-Allow-Origin: *' em erros (função pública de embed); 4 functions sem getCorsHeaders (check-quote-expiration, report-embed-public, twilio-call-status, twilio-call-twiml — server-to-server/TwiML). ALLOWED_ORIGINS em produção é secret do painel Supabase (docs/RUNBOOK.md:47-49) — NÃO VERIFICÁVEL daqui; resposta ao vivo não testada.
- **Revisão:** sem contestação cética concluída.

### F1861 · Credenciais do smoke nunca impressas no relatório

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** Credenciais vêm só de env e não aparecem no relatório.
- **Fontes:** `docs/runbooks/smoke-target-backend.md:33`
- **O que falta:** Mascarar o e-mail em scripts/smoke-target-backend.ts:118 (ex.: 'login bem-sucedido' sem o endereço, ou e***@dominio) para a afirmação do runbook ficar verdadeira.
- **Evidência:** Senha e anon key nunca impressas: scripts/smoke-target-backend.ts:25-28 (lidas só de process.env), :201-207 (erro lista apenas o NOME da variável ausente), :211 (imprime só a URL), :239-241 (resumo numérico); grep -nE 'console\.(log\|error)' com PASSWORD\|ANON → 0. Porém o e-mail de login (parte da credencial) vai para o relatório: scripts/smoke-target-backend.ts:118 (message: `login bem-sucedido para ${EMAIL}`) impresso via record()→console.log(formatLine(r)) em :45-48. docs/runbooks/smoke-target-backend.md:33 afirma 'nunca são impressas'.
- **Revisão:** sem contestação cética concluída.

### F1862 · Etapa 05 (Graphify): Modelar ameaças e classificação de conteúdo

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** Política de leitura mínima, retenção, sanitização e limites de CPU/memória/tempo.
- **Fontes:** `docs/planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md:101-106`
- **O que falta:** Escrever docs/graphify/POLITICA_AMEACAS_E_CONTEUDO.md (classificação de conteúdo, retenção, limites de recursos, regra 'docs/descrições do banco são dados não confiáveis') e testes em scripts/graphify/*.test.mjs cobrindo segredo em SQL/comentário/HTML gerado.
- **Evidência:** docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:139 ('\| 05| Ameaças e conteúdo \| PARCIAL \| Scanner e restrições básicas existem … faltam política e testes abrangentes'). Mecanismos pontuais existem: scripts/graphify/graphify-utils.mjs:17 (SENSITIVE_PATH), scripts/graphify/catalog-adapter.mjs:9,34 (SENSITIVE_META_KEY, redactSensitiveText). ausente: grep -niE 'política\|ameaça\|threat\|sanitiz' docs/graphify/README.md → 0; grep -rniE 'ameaça\|threat\|classificação de conteúdo' docs/graphify/*.md → só a linha da revisão; nenhum documento de política de leitura mínima/retenção/limites de CPU-memória-tempo.
- **Revisão:** sem contestação cética concluída.

### F1863 · Etapa 08 (Graphify): Fortalecer seleção e exclusão de arquivos

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** Revisar .graphifyignore/.gitignore; avaliar tokens.css; segredo sintético em .env.example barrado.
- **Fontes:** `docs/planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md:124-129`
- **O que falta:** Adicionar testes em scripts/graphify/graphify-utils.test.mjs para segredo em comentário SQL e arquivo não rastreado; documentar a decisão sobre tokens.css em docs/graphify/README.md.
- **Evidência:** Regras existem: .graphifyignore:5-6 (.env, .env._); scripts/graphify/graphify-utils.mjs:17 (SENSITIVE_PATH para .env_, pem, key, p12…); docs/graphify/EXECUCAO_LOTE_A_2026-09-11.md:20 (segredo sintético em .env.example barrado no fixture). Faltam cenários: docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:142 ('\| 08| Seleção e exclusões \| PARCIAL \| … faltam cenários de conteúdo/arquivos não rastreados e revisão de tokens.css'); grep -nE 'env\|ignore\|exclu' scripts/graphify/graphify-utils.test.mjs → 0 testes de exclusão por conteúdo (segredo em comentário SQL / arquivo não rastreado); grep -rn 'tokens.css' docs/graphify → 0.
- **Revisão:** sem contestação cética concluída.

### F1864 · Etapa 21 (Graphify): Validar identidade, acesso e sessão de leitura ao Supabase

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** Validar projeto usyxfpqlsspldubptrdl, transação read-only e timeouts; 403 interrompe coleta.
- **Fontes:** `docs/planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md:221-226`
- **O que falta:** Ligar snapshot.py ao catalog-adapter (gerar identity{projectRef, readOnly:true} verificado por SELECT current_setting('transaction_read_only') e comparação com ref esperado), fazer 403 em endpoint obrigatório abortar a coleta, e atualizar a REVISAO (etapa 21) com a evidência sanitizada.
- **Evidência:** Adaptador valida identidade/RO: scripts/graphify/catalog-adapter.mjs:35 (lança se identity.projectRef ≠ esperado), testes catalog-adapter.test.mjs:38-40 (projeto divergente, readOnly:false e linhas de negócio são recusados). Coletor RO existe fora do graphify: scripts/supabase_snapshot/snapshot.py:10,951-952 (SET default_transaction_read_only=on, statement_timeout 90s), :323-327 (redact), usado em .github/workflows/contexto.yml:178,233. Lacunas: snapshot.py:984 trata 403/404 como opcional e segue ('if optional and e.code in (403, 404)'), não interrompe; grep 'usyxfpqlsspldubptrdl' scripts/supabase_snapshot/snapshot.py → 0 (sem checagem do ref esperado no coletor); docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:155 ('\| 21| Identidade e leitura \| BLOQUEADA \| MCP retorna 401'); docs/graphify/README.md:47 (reconciliação recusa catálogo 'até um coletor RO confiável produzir atestação…
- **Revisão:** sem contestação cética concluída.

### F1865 · Etapa 23 (Graphify): Coletar segurança e objetos programáveis

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** RLS, policies, roles, ACL, funções, SECURITY DEFINER, triggers, views, enums com sanitização.
- **Fontes:** `docs/planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md:235-240`
- **O que falta:** Criar ponte snapshot.py/inventario -> JSON de entrada do catalog-adapter (schemaVersion 1, provenance.independentlyVerified=true, digest) e fixture de teste cobrindo PUBLIC, herança de role, default grants e policies permissiva/restritiva em scripts/graphify/catalog-adapter.test.mjs.
- **Evidência:** Coleta real no banco existe em scripts/supabase_snapshot/snapshot.py:554 (prosecdef), :598 (pg_policies), :608 (pg_enum), :665-686 (aclexplode/pg_default_acl), :696-697 (pg_roles/membership), :773 (pg_trigger). Normalizador do catálogo em scripts/graphify/catalog-adapter.mjs:53 (rls enabled/forced), :60 (policies permissive/roles/using/check), :61-62 (grants/defaultGrants), :63 (triggers), :85 (securityDefiner/searchPath/grants), :112-115 (roles). Contratos estáticos: scripts/graphify/static-contracts.mjs:13-16,170-192 registram POLICY/RLS e expõem GRANT/REVOKE como lacuna (teste ok 36). Porém catalog-adapter exige --input JSON com provenance.independentlyVerified (catalog-adapter.mjs:165,192) e nenhum coletor produz esse formato a partir do snapshot.py; catalog-adapter.test.mjs tem 3 testes (52 linhas) sem fixture de PUBLIC, herança, default grants ou policy restritiva.
- **Revisão:** sem contestação cética concluída.

### F1869 · Padrão X-Cron-Secret (PRs #84/#85/#126) publicado

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** _internal_secrets, trigger_* e X-Cron-Secret são o desenho certo mas nunca foram publicados.
- **Fontes:** `docs/postmortems/2026-08-30_cron_outage.md:62-63`
- **O que falta:** Incluir as 12 functions na allowlist ACTIVE (deploy.yml:144) ou desagendar os jobs correspondentes em cron.md; confirmar com net._http_response que esses jobs recebem 200.
- **Evidência:** Publicado em produção: public._internal_secrets (snapshot tables.md:7, RLS sim), public.trigger_internal_edge_job (functions.md:367; corpo em functions/public/trigger_internal_edge_job__f02f045c8b4350ab.sql:62-68 envia X-Cron-Secret), 23 jobs pg_cron ativos chamam a função (cron.md:26-51) e 29 functions validam o header (_shared/cron-job-auth.ts:12-27). Lacuna: 12 dos 24 alvos da allowlist SQL (sql:16-42) estão fora da allowlist ACTIVE de .github/workflows/deploy.yml:144 — check-v4-callback-alerts, process-call-recording-ingest, winloss-webhook-health-monitor, webvitals-regression-alert, process-scheduled-sends, check-quote-expiration, check-lead-sla, sdr-consecutive-alerts, challenge-expiration-alerts, send-alert-notifications, scheduled-reports-runner, rotate-daily-challenges. O 'succeeded' em cron-runs.md (ex.: linhas 331,394) registra só o enfileiramento do net.http_post ('1 row'), …
- **Revisão:** sem contestação cética concluída.

### F1871 · Segredo de cron migrado para Vault e _internal_secrets versionada

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** NÃO INICIADO (ampliado): toda a malha de crons depende de _internal_secrets, sem CREATE TABLE.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:260`
- **O que falta:** Migrar coaching_cron_secret/anon_key/functions_base_url para vault.secrets (ou documentar a decisão de não usar Vault) e REVOKE ALL ON public._internal_secrets FROM anon, authenticated em migration nova.
- **Evidência:** _internal_secrets está versionada: supabase/migrations/20260715184427_8e4ec70a-caf2-4a8d-9042-e26e29fa3a54.sql:9 e supabase/migrations/20261117070000_reconcilia_objetos_orfaos_producao.sql:19 (CREATE TABLE IF NOT EXISTS public._internal_secrets) — a afirmação 'sem CREATE TABLE' está desatualizada. Vault não foi adotado: snapshot vault.md = '_nenhum_'; grep -rn 'vault\.' supabase/migrations → 0 resultados; supabase/functions/generate-coaching-actions/index.ts:49-65 lê coaching_cron_secret de _internal_secrets. Observação: tables/public/internal_secrets.md Grants concede DELETE/INSERT/SELECT/UPDATE a anon e authenticated, mitigado só pela policy USING false.
- **Revisão:** sem contestação cética concluída.

### F1873 · Validação de input com _shared/validation.ts nas 122 functions da allowlist

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** scripts/input-validation-lint-allowlist.txt: 122 de 172 functions gravam no banco sem _shared/validation.ts.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:118`
- **O que falta:** Migrar as 120 functions da allowlist para _shared/validation.ts (ou webhook-validator.ts) por lotes e remover as entradas em scripts/input-validation-lint-allowlist.txt; priorizar as 100 da allowlist ACTIVE de deploy.yml:144.
- **Evidência:** Lint existe e roda em CI: scripts/lint-input-validation.ts:1-20 (regras: escrita sem _shared/validation.ts falha; allowlist congelada; entrada stale falha), .github/workflows/edge-functions-input-validation.yml:54 ('deno run --frozen --allow-read scripts/lint-input-validation.ts'). Validador: supabase/functions/_shared/validation.ts existe; 24 de 172 pastas importam '_shared/validation.ts' (grep -rl). Allowlist ainda tem 120 entradas não comentadas (grep -vc '^#' scripts/input-validation-lint-allowlist.txt) — encolheu de 122 para 120. deno indisponível neste ambiente para executar o lint localmente.
- **Revisão:** sem contestação cética concluída.

### F1882 · Circuit breaker compartilhado withEdgeCircuitBreaker em apenas 5 handlers

- **Tipo:** Service/lib
- **O que os docs afirmam:** O circuito compartilhado withEdgeCircuitBreaker aparece em somente 5 handlers principais, longe de política uniforme de resiliência.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:70-71`
- **O que falta:** Definir lista de handlers críticos com chamadas externas (Resend, OpenAI, Twilio, Helpdesk, Bitrix) e aplicar withEdgeCircuitBreaker neles; documentar a contagem alvo em docs/agentes/mapa-do-sistema.md.
- **Evidência:** Helper existe: supabase/functions/_shared/circuit-breaker.ts:95 export async function withEdgeCircuitBreaker, :153 getEdgeCircuitState, :158 resetEdgeCircuit. Usado em 12 de 172 handlers (grep -rl withEdgeCircuitBreaker supabase/functions/*/index.ts): bitrix24-oauth, bitrix24-sync, deal-risk-digest, dispatch-webhook, edge-retry-threshold-alert, elevenlabs-stt, elevenlabs-tts, elevenlabs-voice, notify-quote-conversion, twilio-click-to-call, wal-health-alert, webvitals-regression-alert — mais que os 5 citados, mas sem política uniforme (ex.: send-transactional-email, enrich-lead, helpdesk-sync, sales-assistant-chat na allowlist deploy.yml:144 não o usam).
- **Revisão:** sem contestação cética concluída.

### F3646 · Comando npm run graphify:reconcile (reconcile-catalog.mjs)

- **Tipo:** Service/lib
- **O que os docs afirmam:** Reconcilia contratos estáticos com catálogo normalizado; recusa catálogo não atestado por coletor RO confiável; ausência vira pendência.
- **Fontes:** `docs/graphify/README.md:55-61`
- **O que falta:** scripts/graphify/reconcile-catalog.mjs existe mas nenhum import encontrado (grep)
- **Evidência:** scripts/graphify/reconcile-catalog.mjs existe mas nenhum import encontrado (grep)| CONTESTADO pelo cético (IMPLEMENTADO): O script existe e tem alias: package.json:54 (graphify:reconcile → scripts/graphify/reconcile-catalog.mjs). A recusa de catálogo não atestado está em scripts/graphify/catalog-adapter.mjs:164-166: exige schemaVersion 1, provenance.independentlyVerified === true e digest íntegro; senão lança 'Reconciliação exige catálogo íntegro e verificado por coletor RO confiável'. Isso é testado em catalog-adapter.test.mjs:45 (assert.throws). A suíte roda no gate de PR (pr-checks.yml:144, npm run graphify:test); a rodada local deu 37/37 pass. O 'nenhum import' da pré-checagem não vale para CLI: reconcile-catalog.mjs:7 importa catalog-adapter.
- **Revisão:** em disputa. O cético propõe Implementado e o juiz ainda não decidiu.

### F3647 · Dispatcher scripts/automation.mjs + perfil scripts/automation.config.json

- **Tipo:** Service/lib
- **O que os docs afirmam:** Dispatcher liga suites, motor de manutenção e adaptador de grafo; perfil versionado define aliases e registro de scripts.
- **Fontes:** `docs/AUTOMACAO_LOCAL.md:3`
- **O que falta:** scripts/automation.mjs existe mas nenhum import encontrado (grep)
- **Evidência:** scripts/automation.mjs existe mas nenhum import encontrado (grep)| CONTESTADO pelo cético (IMPLEMENTADO): scripts/automation.mjs (1045 linhas) e scripts/automation.config.json (875 linhas) existem. Aliases em package.json:60-68 (automation:doctor/test/check/heal/nightly/graph...). O CI roda o comando em .github/workflows/automation-local.yml:37 (node scripts/automation.mjs doctor --static) e :45 (test). A execução local de 'node scripts/automation.mjs doctor --static' retornou {"ok":true,"status":"healthy",...,"issues":[]} com exit 0.
- **Revisão:** em disputa. O cético propõe Implementado e o juiz ainda não decidiu.

### F1885 · Etapa 09 (Graphify): Isolar snapshots por worktree e revisão

- **Tipo:** Service/lib
- **O que os docs afirmam:** Raiz Git sem presumir .git diretório; caches segregados; SHA + digest do conteúdo; controle de concorrência.
- **Fontes:** `docs/planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md:131-136`
- **O que falta:** Segregar saída por revisão (ex.: .graphify-local/<sha>/ ou graphify-out/<branch>/) em extract-code-only.mjs:124 e graphify-local.mjs ctx.graph (:889), e adicionar teste em graphify-local.unit.mjs com duas branches gerando snapshots sem sobrescrita.
- **Evidência:** Raiz via git rev-parse --show-toplevel sem presumir .git diretório (scripts/graphify/extract-code-only.mjs:55-59; scripts/graphify-local.mjs:870). Fingerprint = pin+config+HEAD+hash dos arquivos+metadados (graphify-local.mjs:432-442); snapshot.json grava commit, worktreeDigest, digest do escopo (extract-code-only.mjs:168-184). Concorrência: running.lock local e fleet.lock global (graphify-local.mjs:900,1003,1013-1016; flock :1072-1130) com testes graphify-local.unit.mjs:265,280,360,416. Lacuna: state/output são fixos por checkout (graphify.local.json: state tools/graphify/.venv/graphify-local-state, output graphify-out) e extract-code-only usa --out .graphify-local/<basename> (extract-code-only.mjs:124) sem SHA/branch no caminho — trocar de branch no mesmo worktree sobrescreve graphify-out/graph.json; nenhum teste com duas branches simultâneas.
- **Revisão:** sem contestação cética concluída.

### F1886 · Etapa 12 (Graphify): Resolver aliases, lazy imports e fronteiras de módulos

- **Tipo:** Service/lib
- **O que os docs afirmam:** Respeitar tsconfig/vite, reexports, barrels e imports lazy; classificar caminhos calculados.
- **Fontes:** `docs/planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md:154-159`
- **O que falta:** Criar scripts/graphify/resolve-imports.mjs que leia tsconfig.json paths/vite alias e resolva '@/…' e barrels para arquivo real, anotando confidence EXTRACTED; manter dynamic imports como AMBIGUOUS; testes de alias e import dinâmico.
- **Evidência:** Classificação de incerteza existe: importações não resolvidas viram external_reference (scripts/graphify/multigraph.mjs:30-41; graphify-utils.mjs:20,227-231) e dynamic_import/não-EXTRACTED entram em 'limitations' do impacto (multigraph.mjs:118,137). Resolução de alias ausente: grep -rn 'tsconfig\|paths\|alias\|@/' scripts/graphify/*.mjs scripts/graphify-local.mjs → 0 resultados (só realpath); nenhum tratamento de barrels/reexports além de aceitar relação re_exports (graphify-utils.mjs:20).
- **Revisão:** sem contestação cética concluída.

### F1887 · Etapa 13 (Graphify): Mapear Edge Functions e dependências Deno

- **Tipo:** Service/lib
- **O que os docs afirmam:** Ler entrypoints, _shared, imports remotos/npm e config Deno; separar arquivo, handler, função configurada e implantação.
- **Fontes:** `docs/planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md:161-166`
- **O que falta:** Adicionar ao static-contracts.mjs (ou novo scripts/graphify/edge-functions.mjs) nós separados para pasta, handler (index.ts com Deno.serve), config (supabase/config.toml verify_jwt) e implantação (allowlist deploy.yml:144), mais arestas de import de _shared e remotos; teste que pasta fora da allowlist não é contada como implantada.
- **Evidência:** scripts/graphify/static-contracts.mjs:218-220 varre src/, supabase/functions e supabase/migrations e :25 extrai referências literais '.functions.invoke("x")' (teste ok 34). Não lê imports de _shared, imports remotos/npm nem deno.json; não distingue arquivo/handler/configurada/implantada: grep 'ACTIVE\|deploy.yml\|allowlist' scripts/graphify/*.mjs → 0 resultados; .graphify-local/ não existe no checkout (ls → ausente). O índice paralelo docs/contexto/codigo/edge-functions.json (scripts/ai-context/gerar.mjs) lista total 171, verify_jwt_false e chamadores, mas também sem cruzar a allowlist de deploy.yml:144.
- **Revisão:** sem contestação cética concluída.

### F1888 · Etapa 17 (Graphify): Anexar proveniência e confiança verificáveis

- **Tipo:** Service/lib
- **O que os docs afirmam:** Arquivo/linha, hash, extrator/versão, instante e classes EXTRACTED/INFERRED/AMBIGUOUS.
- **Fontes:** `docs/planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md:191-196`
- **O que falta:** Em validateMultiGraphDocument (multigraph.mjs:101) exigir provenance.sourceFile ou confidence !== 'EXTRACTED' para cada aresta, registrar hash do arquivo-fonte na proveniência e cobrir com teste em multigraph.test.mjs.
- **Evidência:** Proveniência por aresta/nó em scripts/graphify/multigraph.mjs:22-26,57-63 (sourceFile, sourceLocation, origin) e confidence com default 'AMBIGUOUS' (:57); níveis EXTRACTED/INFERRED/AMBIGUOUS validados em graphify-utils.mjs:21,224; snapshot.json com extractor nome/versão, createdAt, digests de fonte/config/multigrafo (extract-code-only.mjs:168-184). Lacuna: campos de proveniência podem ser null sem registrar limitação (multigraph.mjs:59-62), validateEdgeShape só checa confidence quando presente (graphify-utils.mjs:224), e não há hash por aresta/arquivo-fonte — critério 'toda aresta tem origem ou limitação' não é imposto.
- **Revisão:** sem contestação cética concluída.

### F1889 · Etapa 19 (Graphify): Validar cache e atualização incremental

- **Tipo:** Service/lib
- **O que os docs afirmam:** Chave inclui conteúdo, config, versão do extrator e esquema; renome/exclusão tratados.
- **Fontes:** `docs/planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md:205-210`
- **O que falta:** Implementar modo 'graphify update' no wrapper (graphify-local.mjs generate) reaproveitando graphify-out/manifest.json (ast_hash por arquivo) e adicionar teste em graphify-local.unit.mjs comparando grafo incremental e integral após add/edit/rename/remove.
- **Evidência:** Chave de cache inclui conteúdo (hash por arquivo via git ls-files, scripts/graphify-local.mjs:389,432-442), configHash, HEAD, pin do extrator e metadados (tsconfig, package.json, wrappers em graphify.local.json metadata); status 'current' evita regenerar (graphify-local.mjs:1004-1008) e renome/exclusão são capturados porque a lista vem do git. Porém não há atualização incremental: só 'extract' integral (graphify-local.mjs:708; extract-code-only.mjs:152); grep "'update'" scripts/graphify-local.mjs scripts/graphify/*.mjs → 0 resultados; nenhum teste de equivalência incremental × integral após add/edit/rename/remove.
- **Revisão:** sem contestação cética concluída.

### F1890 · Etapa 22 (Graphify): Coletar estrutura relacional completa

- **Tipo:** Service/lib
- **O que os docs afirmam:** Schemas, tabelas, colunas, tipos, defaults, constraints e índices sem ler linhas.
- **Fontes:** `docs/planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md:228-233`
- **O que falta:** Ligar o snapshot de scripts/supabase_snapshot ao fluxo Graphify (reconcile-catalog.mjs aceita só catálogo atestado) ou implementar o coletor RO previsto na etapa 22; criar fixture sintética cobrindo PK/FK/UNIQUE/CHECK/EXCLUDE e índices parciais/compostos (ausente: grep EXCLUDE scripts/graphify → 0).
- **Evidência:** Na stack Graphify não há coletor de catálogo: scripts/graphify/catalog-adapter.mjs:192,205 só normaliza um JSON exportado via --input (não conecta ao banco); docs/graphify/README.md:68-70 declara que o coletor canônico não está habilitado; docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:476 marca etapas 22-24 como P. Existe coletor fora do Graphify: scripts/supabase_snapshot/snapshot.py:741 (information_schema.columns), :799-806 (pg_constraint/contype), :862-875 (pg_index), executado por .github/workflows/contexto.yml:178 e gerando tables/, indexes.md, relationships.md do snapshot; nenhum script em scripts/graphify/ consome esse snapshot (grep contexto\|supabase_snapshot scripts/graphify/*.mjs → 0).
- **Revisão:** sem contestação cética concluída.

### F1891 · Etapa 24 (Graphify): Coletar extensões, storage e automações

- **Tipo:** Service/lib
- **O que os docs afirmam:** Extensões, buckets, jobs/cron com redação de segredos; sem executar jobs.
- **Fontes:** `docs/planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md:242-247`
- **O que falta:** Integrar o inventário de snapshot.py ao multigrafo/reconciliação Graphify e codificar os três estados distintos (extensão ausente, permissão negada, job desativado) com teste; hoje o Graphify só tem contratos estáticos (static-contracts.mjs).
- **Evidência:** Sem coletor operacional no Graphify (scripts/graphify/ não lê pg_extension, storage.buckets ou cron.job; README docs/graphify/README.md:70 adia storage/jobs). Coleta equivalente existe no pipeline contexto: scripts/supabase_snapshot/snapshot.py:834,911 (pg_extension), :750 (storage.buckets), :757-764 e :1010 (vault/redação de secret), produzindo extensions.md, storage.md, cron.md e cron-runs.md no snapshot (/…/contexto/supabase/). cron.md tem coluna 'ativo' (ex.: cron.md:26-49), mas não há distinção codificada entre 'extensão ausente' e 'permissão negada' no Graphify.
- **Revisão:** sem contestação cética concluída.

### F1892 · Etapa 31 (Graphify): Expor comandos de consulta reproduzíveis

- **Tipo:** Service/lib
- **O que os docs afirmam:** Scripts de projeto para query/path/explain/validate usando comandos confirmados da versão pinada.
- **Fontes:** `docs/planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md:295-300`
- **O que falta:** Expor npm scripts graphify:query/graphify:path/graphify:explain (hoje só 'npm run automation:graph -- query …', não documentado em docs/graphify/README.md) e registrar exemplos testados em PT-BR conforme a saída prevista na etapa 31.
- **Evidência:** package.json:48-55 define graphify:test/verify/impact/contracts/catalog/reconcile/docs — nenhum graphify:query/path/explain. Consulta existe via scripts/graphify-local.mjs:349 (ações query/path/explain), exposta por package.json:65 'automation:graph' → scripts/automation.config.json:14 ("graph": node scripts/graphify-local.mjs); frescura tratada em graphify-local.mjs:699-706 (status current/stale por fingerprint) e :1001-1016 (regenera antes de consultar quando stale); relatório JSON com runtime/fingerprint em :1068. 23 testes em scripts/graphify-local.unit.mjs.
- **Revisão:** sem contestação cética concluída.

### F1893 · Etapa 54: script compartilhado scripts/ci/check-e2e-env.sh

- **Tipo:** Service/lib
- **O que os docs afirmam:** Substitui lógica duplicada de configuração parcial.
- **Fontes:** `docs/estado/PLANO_CI_WORKFLOWS_2026-10-01.md:106`
- **O que falta:** Extrair a contagem/validação dos 4 secrets (passos 'Validar configuração E2E') para um script compartilhado (scripts/ci/check-e2e-env.sh ou dentro de e2e-precheck.mjs) e chamá-lo nos dois workflows.
- **Evidência:** ausente: ls scripts/ci/check-e2e-env.sh → No such file. Substituto parcial: scripts/e2e-precheck.mjs:1-19 (valida credenciais E2E), chamado por .github/workflows/pr-checks.yml:529 e quote-to-sale-e2e.yml:154. A lógica de 'configuração parcial' continua duplicada inline nos dois workflows: pr-checks.yml:490-513 e quote-to-sale-e2e.yml:94,119-136.
- **Revisão:** sem contestação cética concluída.

### F1895 · Graphify resolve aliases e imports lazy (5.595 endpoints)

- **Tipo:** Service/lib
- **O que os docs afirmam:** Etapa 12 P.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:471`
- **O que falta:** Resolver aliases '@/…' (tsconfig paths) e imports lazy (src/routes/lazyPages.ts) para nós locais no multigrafo, com teste em multigraph.test.mjs demonstrando a redução dos 5.595 endpoints.
- **Evidência:** docs/graphify/BASELINE_AST_SRC_2026-09-11.md:15,38 registra 5.595 imports sem nó local não materializados. Nenhuma resolução de alias/lazy no código: grep 'alias\|lazy\|tsconfig\|paths' scripts/graphify/*.mjs → 0. scripts/graphify/multigraph.mjs:29-40 apenas materializa endpoints não resolvidos como nós 'external_reference' (não os liga ao nó local real).
- **Revisão:** sem contestação cética concluída.

### F1896 · graphify update incremental incompatível com snapshots externos (etapa 19 parcial)

- **Tipo:** Service/lib
- **O que os docs afirmam:** A CLI pinada grava cache na origem e exige --force após remoções; integração usa só extração integral.
- **Fontes:** `docs/graphify/EXECUCAO_LOTE_D_2026-09-11.md:20-22`
- **O que falta:** Implementar/validar modo incremental no wrapper (graphify-local.mjs) com teste de equivalência incremental×integral para add/edit/rename/remove, ou documentar que o hook upstream é o único caminho incremental.
- **Evidência:** Wrapper do projeto só faz extração integral: scripts/graphify-local.mjs:708-716 executa 'extract … --code-only --no-cluster' em staging; scripts/graphify/extract-code-only.mjs:151-153 idem; nenhum uso de 'graphify update' nos wrappers. Incremental existe apenas no hook upstream .husky/post-commit (graphify.watch._rebuild_code(changed_paths=…, force=…) com GRAPHIFY_FORCE=1 quando há deleção), fora do contrato de snapshot/staging do projeto. docs/graphify/EXECUCAO_LOTE_D_2026-09-11.md:20-22 mantém etapa 19 parcial; sem teste de equivalência (grep incremental scripts/graphify → 0).
- **Revisão:** sem contestação cética concluída.

### F1897 · Graphify: cache incremental (graphify update)

- **Tipo:** Service/lib
- **O que os docs afirmam:** Etapa 19 NI: bloqueado.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:474`
- **O que falta:** Decidir e implementar o caminho incremental (ver F1896); hoje o cache incremental do hook e o snapshot integral do wrapper são dois mundos sem equivalência testada.
- **Evidência:** Mesma evidência de F1896: wrappers do projeto só executam 'extract' integral (scripts/graphify-local.mjs:708-716; scripts/graphify/extract-code-only.mjs:151-153); cache incremental só via hook upstream em .husky/post-commit (_rebuild_code com changed_paths) sem integração ao staging/snapshot.json; docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:474 marca etapa 19 como NI/bloqueado.
- **Revisão:** sem contestação cética concluída.

### F1898 · Handoff P068: Timeout, circuit breaker, idempotência e request ID por criticidade

- **Tipo:** Service/lib
- **O que os docs afirmam:** Fila canônica do handoff (onda 7): Timeout, circuit breaker, idempotência e request ID por criticidade. Todas as etapas começam pendentes; 0 de 100 executadas na data do handoff. Gate(s) conforme §13.
- **Fontes:** `docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:374-374`
- **O que falta:** Aplicar os quatro padrões nos handlers críticos restantes (ex.: send-transactional-email sem timeout/circuit breaker; dispatch-webhook sem fetchWithTimeout) e criar helper compartilhado de idempotência em _shared/ com testes de falha de provedor.
- **Evidência:** Helpers existem: supabase/functions/_shared/fetch-with-timeout.ts:11 fetchWithTimeout; _shared/circuit-breaker.ts:95 withEdgeCircuitBreaker; _shared/request-id.ts:89 withRequestId. Adoção: withRequestId em 171/171 index.ts; fetchWithTimeout em 55; withEdgeCircuitBreaker em 12. Idempotência não tem helper compartilhado (grep -i idempot supabase/functions/_shared/*.ts sem _test → 0); notify-quote-conversion/index.ts trata idempotência inline; send-transactional-email/index.ts usa só withRequestId (sem timeout nem circuit breaker); dispatch-webhook/index.ts usa circuit breaker + requestId sem fetchWithTimeout.
- **Revisão:** sem contestação cética concluída.

### F1901 · Plano 30/08 etapa 68 (P068): Timeout, circuit breaker, idempotência e request ID por criticidade

- **Tipo:** Service/lib
- **O que os docs afirmam:** Etapa 68 do plano de 100 etapas (auditoria 30/08; = P068 do handoff): Padrões compartilhados e testes de falha de provedores.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:732-732`
- **O que falta:** Completar os quatro padrões nos handlers críticos restantes e criar helper de idempotência em _shared/ com testes de falha de provedor; registrar a classificação de criticidade das functions.
- **Evidência:** Mesma base de F1898: helpers em supabase/functions/_shared/fetch-with-timeout.ts:11, circuit-breaker.ts:95, request-id.ts:89; adoção withRequestId 171/171 index.ts, fetchWithTimeout 55, withEdgeCircuitBreaker 12; sem helper compartilhado de idempotência (grep -i idempot _shared/_.ts sem \_test → 0); send-transactional-email/index.ts só withRequestId; dispatch-webhook/index.ts sem fetchWithTimeout. Testes de falha de provedor existem só para circuit breaker/retry (\_shared/__test.ts, winloss-webhook-dispatcher/retry_*_test.ts), não por 'criticidade' declarada.
- **Revisão:** sem contestação cética concluída.

### F3648 · Script scripts/check-migrations.mjs com --base origin/main

- **Tipo:** Service/lib
- **O que os docs afirmam:** Validador local de migrations (npm run check:migrations) que confere versões/nomes contra a base.
- **Fontes:** `docs/execucao/MIGRATION_RENAME_MAP.md:179-184`
- **O que falta:** scripts/check-migrations.mjs existe mas nenhum import encontrado (grep)
- **Evidência:** scripts/check-migrations.mjs existe mas nenhum import encontrado (grep)| CONTESTADO pelo cético (IMPLEMENTADO): scripts/check-migrations.mjs:98-99 lê --base. Alias em package.json:49 (check:migrations). Roda no gate de PR em pr-checks.yml:187 (node scripts/check-migrations.mjs --base "origin/${{ github.base_ref }}") e no deploy em deploy.yml:106-109. A execução local de 'node scripts/check-migrations.mjs --base origin/main' deu 'Gate de migrations OK: 700 arquivos, 700 versões únicas, diff contra origin/main verificado' (exit 0).
- **Revisão:** em disputa. O cético propõe Implementado e o juiz ainda não decidiu.

### F3649 · Script scripts/debt-report.mjs gera o quadro de débito técnico

- **Tipo:** Service/lib
- **O que os docs afirmam:** Quadro gerado por `node scripts/debt-report.mjs` (2026-10-01); `--quick` pula o eslint.
- **Fontes:** `docs/TECH_DEBT.md:3-4`
- **O que falta:** scripts/debt-report.mjs existe mas nenhum import encontrado (grep)
- **Evidência:** scripts/debt-report.mjs existe mas nenhum import encontrado (grep)| CONTESTADO pelo cético (IMPLEMENTADO): scripts/debt-report.mjs:16,24 aceita --quick (QUICK = argv.includes('--quick')); a linha 167 imprime 'não medido (--quick)'. Alias em package.json:59 (debt:report). A execução local de 'node scripts/debt-report.mjs --quick' imprimiu o quadro com cobertura, eslint-disable, 'as unknown as', request-id, edge functions e bundle budget.
- **Revisão:** em disputa. O cético propõe Implementado e o juiz ainda não decidiu.

### F3650 · Scripts de coverage/typecheck ratchet (check-coverage-ladder, check-coverage-ratchet, check-typecheck-baseline, update-*-baseline, ci/lint-ratchet, ci/typechec…

- **Tipo:** Service/lib
- **O que os docs afirmam:** Ratchets de qualidade; alguns só em package.json, outros em contexto-testes.yml.
- **Fontes:** `docs/AUTOMACAO_LOCAL.md:52-53,58,68,72,129-130`
- **O que falta:** scripts/ci/lint-ratchet.mjs e scripts/ci/typecheck-ratchet.mjs não têm referência em package.json nem chamador em workflow. Também falta corrigir docs/AUTOMACAO_LOCAL.md:68,71, que aponta contexto-testes.yml sem que isso ocorra.
- **Evidência:** scripts/check-coverage-ladder.mjs existe mas nenhum import encontrado (grep)| cético: Os 7 arquivos existem. Cinco têm alias em package.json: :21 coverage:ratchet, :22 coverage:ladder, :24 coverage:baseline:update, :33 typecheck:baseline, :34 typecheck:baseline:update. Os de coverage e typecheck rodam no CI (pr-checks.yml:133, 283, 288; types-sync.yml:184). Já scripts/ci/lint-ratchet.mjs e scripts/ci/typecheck-ratchet.mjs não aparecem em package.json nem em nenhum workflow: grep -rn 'lint-ratchet\|typecheck-ratchet' .github package.json → 0. O doc diz que rodam em contexto-testes.yml (docs/AUTOMACAO_LOCAL.md:68,71), o que é falso: contexto-testes.yml:69-77 só roda *.unit.mjs. Só aparecem como legado manual em automation.config.json:275,299. O próprio cabeçalho de lint-ratchet.mjs:2-6 diz que ele serve a um verificador externo (zapp-verify).

### F3651 · scripts/check-bundle-budget.mjs com tetos gzip por chunk, só no cron semanal

- **Tipo:** Service/lib
- **O que os docs afirmam:** Budgets definidos nas linhas 19-41; chamado apenas por qa-exhaustive.yml:82.
- **Fontes:** `docs/estado/12_INFRA_CI_TESTES.md:294,385`
- **O que falta:** scripts/check-bundle-budget.mjs existe mas nenhum import encontrado (grep)
- **Evidência:** scripts/check-bundle-budget.mjs existe mas nenhum import encontrado (grep)| CONTESTADO pelo cético (IMPLEMENTADO): Os budgets em KB gzip por chunk estão em scripts/check-bundle-budget.mjs:17-41 (BUDGETS_KB). O doc está desatualizado: o script NÃO roda só no cron semanal. Ele roda em toda PR em pr-checks.yml:666-668 ('Enforce per-chunk bundle budget'; o comentário em :662-665 registra a mudança), no semanal qa-exhaustive.yml:97 e no 'npm run ci' (package.json:58).
- **Revisão:** em disputa. O cético propõe Implementado e o juiz ainda não decidiu.

### F3652 · scripts/check-data-layer.mjs e check-domain-boundaries.mjs (só package.json)

- **Tipo:** Service/lib
- **O que os docs afirmam:** Checks arquiteturais sem chamador em workflow.
- **Fontes:** `docs/AUTOMACAO_LOCAL.md:54,56`
- **O que falta:** Os checks arquiteturais não rodam em nenhum workflow nem hook. Falta um step em pr-checks.yml, ou decidir removê-los.
- **Evidência:** scripts/check-data-layer.mjs existe mas nenhum import encontrado (grep)| cético: Os dois existem e têm alias em package.json:37-38 (check:data-layer, check:domain-boundaries). Não há chamador: grep -rn 'data-layer\|domain-boundaries' .github .husky → 0, e o lint-staged (package.json:191+) só roda eslint e prettier. Em automation.config.json:163-166 e :179-182 constam como legacy com triggers ['manual'] e a nota 'O dispatcher não executa esta operação'.

### F1903 · scripts/ci-check-forbidden.sh sem chamador

- **Tipo:** Service/lib
- **O que os docs afirmam:** Apesar do prefixo ci-, nenhum workflow ou script invoca.
- **Fontes:** `docs/estado/12_INFRA_CI_TESTES.md:300`
- **O que falta:** Decidir: remover scripts/ci-check-forbidden.sh (código morto) ou ligá-lo a um step do pr-checks.yml; atualizar docs/estado/12_INFRA_CI_TESTES.md.
- **Evidência:** Script ainda existe: scripts/ci-check-forbidden.sh:1-20 (grep de padrões LGPD/InstallPrompt). Sem chamador: grep ci-check-forbidden em .github/, package.json, scripts/_.mjs, scripts/_.sh, .husky → 0 resultados. Status 'removido' declarado em docs/estado/12_INFRA_CI_TESTES.md:300 não corresponde ao HEAD (arquivo presente).
- **Revisão:** sem contestação cética concluída.

### F3655 · scripts/prod-health-check.ts sem chamador

- **Tipo:** Service/lib
- **O que os docs afirmam:** Health check de produção não invocado por nenhum workflow.
- **Fontes:** `docs/estado/12_INFRA_CI_TESTES.md:305`
- **O que falta:** Nenhum workflow ou smoke pós-deploy o invoca. A lógica está incompleta (RLS assumido, storage não verificado, sem exit code). Reescrever e agendar, ou remover.
- **Evidência:** scripts/prod-health-check.ts existe mas nenhum import encontrado (grep)| cético: scripts/prod-health-check.ts existe e não tem chamador: não aparece em package.json nem em .github (grep → 0). Em automation.config.json:626-630 consta como 'Legado sem chamador literal'. O conteúdo também é stub: :10 'rls: true, // Assume true'; storage nunca é checado e fica false; :19 auth = !!authData, sempre true; o catch em :29-31 só faz console.error, sem exit code. Por isso o script sempre imprime 'Some systems reported issues' e nunca falha.

### F3656 · Seeds scripts/seed-*.ts para dados de teste

- **Tipo:** Service/lib
- **O que os docs afirmam:** Preferir seeds do repo em vez de copiar PII de produção.
- **Fontes:** `docs/STAGING.md:61-63`
- **O que falta:** Faltam alias, documentação de uso e execução verificada contra um projeto Supabase de teste. Hoje só rodam manualmente com segredo.
- **Evidência:** scripts/seed-fake-data.ts existe mas nenhum import encontrado (grep)| cético: Os 6 scripts/seed-*.ts existem e usam requireSupabaseAdminEnv + createClient com service_role (por exemplo, seed-race-cars.ts:9-13). Não há alias em package.json (grep seed- → 0) nem workflow que os rode. Em automation.config.json:690-735 todos constam como 'Legado sem chamador literal'. A execução contra um projeto Supabase não pôde ser verificada: exige a service_role, e rodar em produção seria destrutivo.

### F3657 · Service/lib docs-index (3 afirmações nos docs)

- **Tipo:** Service/lib
- **O que os docs afirmam:** Índice documental de links Markdown explícitos classificando propostas, decisões, históricos e operacionais.| Links/títulos/referências de Markdown e ADRs; históricos vs atuais vs propostas. \| Índice versionado por esquema com documento, digest, classificação, origem e linha de cada link; recusa symlink no diretório documental.
- **Fontes:** `docs/graphify/README.md:63-71`, `docs/planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md:258-263`, `docs/graphify/EXECUCAO_LOTE_E_2026-09-11.md:5-9`
- **O que falta:** scripts/graphify/docs-index.mjs existe mas nenhum import encontrado (grep)
- **Evidência:** scripts/graphify/docs-index.mjs existe mas nenhum import encontrado (grep)| CONTESTADO pelo cético (IMPLEMENTADO): Alias em package.json:55 (graphify:docs). A recusa de symlink está em scripts/graphify/docs-index.mjs:12. A classificação e o digest por documento estão em :57, a linha de cada link em :61, e o link quebrado vira pendência 'ausente' em :90. Testes em docs-index.test.mjs:20 (indexação), :32 (recusa symlink) e :38 (symlink externo), rodando no gate de PR (pr-checks.yml:144); a rodada local deu 37/37 pass.
- **Revisão:** em disputa. O cético propõe Implementado e o juiz ainda não decidiu.

### F3658 · Service/lib extract-code-only (8 afirmações nos docs)

- **Tipo:** Service/lib
- **O que os docs afirmam:** Correção de G-03: wrapper recusa versão 0.9.480 para requisito 0.9.48.| Escopo com um único arquivo regular identificado corretamente. \| Entrada única em scripts/graphify/ validando versão, raiz, configuração, limites e saída; códigos de erro distintos. \| extract-code-only.mjs:119 compara versão com includes. \| Destino com manifest.json sem graph.json era aceito; sem lock, promoção atômica ou SHA/hash de config. \| Só limiar de quantidade de arquivos; --max-workers sem teto; falhas usam código 1. \| Cada --out deve ser novo; atualização incremental da CLI grava cache na origem, então o wrapper recusa reuso até a etapa 19. \| Extração AST somente código por escopo (--scope, --max-workers)…
- **Fontes:** `docs/graphify/EXECUCAO_LOTE_B_2026-09-11.md:20`, `docs/graphify/EXECUCAO_LOTE_D_2026-09-11.md:7,15`, `docs/planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md:117-122`, `docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:53-59`, `docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:69-77`, `docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:79-85` e mais 2
- **O que falta:** Faltam códigos de saída distintos por tipo de erro e limite de tempo documentado e testado. Os testes de caminho com espaços e de executável ausente não foram localizados em extract-code-only.test.mjs.
- **Evidência:** scripts/graphify/extract-code-only.mjs existe mas nenhum import encontrado (grep)| cético: O CI roda o script em graphify.yml:51 (--scope ... --max-workers 1). Já implementado: teto de workers MAX_WORKERS=8 (:25,134), limites de bytes (:27-28), runtime só em tools/graphify/.venv (:75-76), recusa de scope fora do repo e de symlink (:118-122), staging + renameSync atômico (:149,185), limpeza do staging no finally (:192) e versão exata via assertExactGraphifyVersion (:146, teste em :134). Falha: todo erro sai com o mesmo código (:190, process.exitCode = 1; fail() em :30 só faz throw), embora o critério exija códigos distintos. Também não há limite de tempo (timeout) visível.

### F3659 · Service/lib graphify-utils (3 afirmações nos docs)

- **Tipo:** Service/lib
- **O que os docs afirmam:** IDs qualificados por domínio/caminho/assinatura; multigrafo preserva várias relações e direção.| graphify-utils.mjs:31-83 aprova {nodes:[],edges:[]} e aresta com target vazio; aresta sem relation/proveniência passa. \| Correção de G-04: grafo vazio não é publicado.
- **Fontes:** `docs/planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md:184-189`, `docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:61-67`, `docs/graphify/EXECUCAO_LOTE_B_2026-09-11.md:21`
- **O que falta:** scripts/graphify/graphify-utils.mjs existe mas nenhum import encontrado (grep)
- **Evidência:** scripts/graphify/graphify-utils.mjs existe mas nenhum import encontrado (grep)| CONTESTADO pelo cético (IMPLEMENTADO): scripts/graphify/graphify-utils.mjs:206 rejeita grafo vazio, :212 nó sem id, :213 id duplicado, :220-221 source ou target vazio e :223 aresta sem relação. Testes em graphify-utils.test.mjs:114 ('recusa grafo vazio, endpoints vazios, relações ausentes e confiança inválida') e :24. O multigrafo preserva várias relações dirigidas (multigraph.test.mjs:5,41). Os demais scripts importam o módulo (extract-code-only, verify-output.mjs:6, reconcile-catalog.mjs:6). A suíte rodou local com 37/37 pass e roda em pr-checks.yml:144.
- **Revisão:** em disputa. O cético propõe Implementado e o juiz ainda não decidiu.

### F3660 · Service/lib impact-report (5 afirmações nos docs)

- **Tipo:** Service/lib
- **O que os docs afirmam:** Adaptador local de impacto reverso por nó (--graph multigraph.json --changed <id>), recusando snapshot de outro estado Git/digest divergente salvo --allow-stale.| Base de comparação, símbolos alterados e dependentes reversos. \| Só extract-code-only, verify-output e graphify-utils existiam; sem multigrafo, parser de migrations, coletor, reconciliador ou impacto por diff. \| Etapa 32 P: só --changed <id>. \| Controle de frescor do snapshot e flag de exceção explícita.
- **Fontes:** `docs/graphify/README.md:32-38`, `docs/planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md:302-307`, `docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:87-93`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:483`, `docs/graphify/EXECUCAO_LOTE_F_P0_2026-09-11.md:10`
- **O que falta:** Falta entrada por diff git (--base/--diff) e teste do próprio CLI, cobrindo a recusa padrão de snapshot obsoleto e a flag --allow-stale.
- **Evidência:** scripts/graphify/impact-report.mjs existe mas nenhum import encontrado (grep)| cético: Alias em package.json:51 (graphify:impact). O script scripts/graphify/impact-report.mjs recusa snapshot obsoleto (:23-31) salvo com --allow-stale (:50) e confere o digest do multigraph (:49). A entrada, porém, é só --changed <id> (:35-36): não há entrada por diff. O próprio doc lista isso como pendência ('Etapa 32 P'). Não existe teste do impact-report: grep 'allow-stale' scripts/graphify/*.test.mjs → 0. Só findPotentialImpact é testado (multigraph.test.mjs:27).

### F3661 · Service/lib lint-request-id (2 afirmações nos docs)

- **Tipo:** Service/lib
- **O que os docs afirmam:** Allowlist de arquivos para o lint de withRequestId.| Padrão obrigatório; coberto por edge-functions-request-id.yml.
- **Fontes:** `docs/estado/12_INFRA_CI_TESTES.md:293`, `docs/DEPLOYMENT.md:65-66`
- **O que falta:** scripts/lint-request-id.ts existe mas nenhum import encontrado (grep)
- **Evidência:** scripts/lint-request-id.ts existe mas nenhum import encontrado (grep)| CONTESTADO pelo cético (IMPLEMENTADO): scripts/lint-request-id.ts:22,26 lê scripts/request-id-lint-allowlist.txt, que está vazio de propósito (linha 9: 'allowlist is intentionally empty'). O CI roda o lint em edge-functions-request-id.yml:54 (deno run scripts/lint-request-id.ts) e o fuzz em :57. A execução local deu '✓ 171/171 edge functions use withRequestId / allowlisted (legacy): 0 / no drift'.
- **Revisão:** em disputa. O cético propõe Implementado e o juiz ainda não decidiu.

### F3662 · Service/lib simulate-migrations-via-mcp (2 afirmações nos docs)

- **Tipo:** Service/lib
- **O que os docs afirmam:** Script reproduzível que executa as migrations do lote de hardening numa única transação com rollback forçado por exceção sentinela.| Mantidos manuais; nenhum workflow/package.json os invoca.
- **Fontes:** `docs/execucao/HARDENING_CANONICO_2026-08-31.md:14-44`, `docs/AUTOMACAO_LOCAL.md:59,74-75,79,81,85-87,106,110-111,117,126,131`
- **O que falta:** Ferramenta só manual, sem alias nem workflow. Falta a decisão registrada de ativar (alias e documentação) ou remover. A execução contra o banco não foi verificada.
- **Evidência:** scripts/db/simulate-migrations-via-mcp.ts existe mas nenhum import encontrado (grep)| cético: scripts/db/simulate-migrations-via-mcp.ts implementa a sentinela de rollback (:37-39, RAISE EXCEPTION com marcador UUID), a transação via supabase_db_transaction (:54) e a verificação do marcador (:65-67). 'deno check' local passou. A segunda afirmação do doc se confirma: não há alias em package.json nem workflow (grep simulate-migrations .github package.json → 0); automation.config.json:362-366 marca 'Legado sem chamador literal'. A execução real exige o endpoint MCP por env, que não estava disponível.

### F3663 · Service/lib smoke-target-backend (2 afirmações nos docs)

- **Tipo:** Service/lib
- **O que os docs afirmam:** Smoke de backend e relatório de dívida técnica.| package.json:29 define smoke:target → scripts/smoke-target-backend.ts; nenhum workflow roda smoke:target; importa scripts/smokeTargetHelpers.ts, testado em src/test/smoke-target-helpers.test.ts.
- **Fontes:** `docs/AUTOMACAO_LOCAL.md:79,125`, `docs/estado/12_INFRA_CI_TESTES.md:296-297`
- **O que falta:** Falta executar smoke:target em algum workflow, por exemplo um smoke pós-deploy em deploy.yml.
- **Evidência:** scripts/smoke-target-backend.ts existe mas nenhum import encontrado (grep)| cético: package.json:46 define smoke:target como 'tsx scripts/smoke-target-backend.ts'. scripts/smokeTargetHelpers.ts e src/test/smoke-target-helpers.test.ts existem, assim como scripts/debt-report.mjs (package.json:59). Nenhum workflow roda smoke:target: grep -rn 'smoke:target\|smoke-target' .github → 0. automation.config.json:738-742 o marca como legado manual.

### F3664 · Service/lib static-contracts (5 afirmações nos docs)

- **Tipo:** Service/lib
- **O que os docs afirmam:** Parser SQL não modela esses comandos ainda; comentários e strings não viram DDL.| Catálogo estático de chamadas Supabase literais no código e eventos DDL previstos nas migrations, sem ler o banco. \| Extrair DDL, versões duplicadas, renomes e drops; SQL dinâmico como lacuna. \| Mapear .from, .rpc, functions.invoke, subscriptions e storage com schema, direção e arquivo/linha. \| A.14 C: etapas 14,16,26,31.
- **Fontes:** `docs/graphify/EXECUCAO_LOTE_F_P0_2026-09-11.md:12`, `docs/graphify/README.md:40-45`, `docs/planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md:168-173`, `docs/planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md:175-180`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:463`
- **O que falta:** Faltam a direção das chamadas (SELECT vs insert/update/delete/upsert, com fixtures que as distinguam) e o schema por referência. RENAME não é modelado no parser SQL.
- **Evidência:** scripts/graphify/static-contracts.mjs existe mas nenhum import encontrado (grep)| cético: Alias em package.json:52 (graphify:contracts). scripts/graphify/static-contracts.mjs:23-27 extrai .from, .rpc, functions.invoke, storage.from e .channel; :11,13 extraem CREATE/ALTER/DROP e POLICY; :190-195 registram lacunas de SQL dinâmico e construtos não modelados; :241 registra versões repetidas; :210 registra dynamic_reference. Testes em static-contracts.test.mjs:5,19,34,55. Falta direção leitura/escrita: grep -i 'insert\|upsert\|.update\|.delete\|select\|direction' → 0, e só há 'operation' do DDL em :183. RENAME não é modelado: grep RENAME → 0.

### F3666 · Service/lib update-coverage-baseline (2 afirmações nos docs)

- **Tipo:** Service/lib
- **O que os docs afirmam:** Novos módulos entram editando LADDER_MODULES e regenerando o baseline.| Comando regenera baseline (global e por módulo) a partir da cobertura medida, truncada em 0,1pp.
- **Fontes:** `docs/estado/15_PLANO_COBERTURA_MODULOS.md:28-29`, `docs/estado/15_PLANO_COBERTURA_MODULOS.md:32-35`
- **O que falta:** scripts/update-coverage-baseline.mjs existe mas nenhum import encontrado (grep)
- **Evidência:** scripts/update-coverage-baseline.mjs existe mas nenhum import encontrado (grep)| CONTESTADO pelo cético (IMPLEMENTADO): Em scripts/update-coverage-baseline.mjs:24-35, LADDER_MODULES tem 10 prefixos (o doc fala em 9: um superconjunto). O piso por módulo é truncado em 0,1pp (:86-87, Math.floor(measured*10)/10) e o global é regenerado em :42-45. Alias em package.json:24 (coverage:baseline:update). A verificação do piso roda no CI (pr-checks.yml:288, coverage:ladder).
- **Revisão:** em disputa. O cético propõe Implementado e o juiz ainda não decidiu.

### F3667 · Service/lib verify-output (2 afirmações nos docs)

- **Tipo:** Service/lib
- **O que os docs afirmam:** Validar IDs/endpoints/contadores antes de promover; publicar manifesto+grafo como unidade.| Valida graph.json: endpoints ausentes, relações imports/imports_from/dynamic_import/re_exports externas como aviso, demais como erro; padrões de segredo.
- **Fontes:** `docs/planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md:198-203`, `docs/graphify/README.md:21,28`
- **O que falta:** scripts/graphify/verify-output.mjs existe mas nenhum import encontrado (grep)
- **Evidência:** scripts/graphify/verify-output.mjs existe mas nenhum import encontrado (grep)| CONTESTADO pelo cético (IMPLEMENTADO): Alias em package.json:50 (graphify:verify). scripts/graphify/verify-output.mjs:20-23 recusa segredo, inclusive após decodificar JSON; :25 valida via validateGraphDocument. graphify-utils.mjs:20 define imports/imports_from/dynamic_import/re_exports como aviso e :227-231 dá erro para endpoint ausente nas demais relações. Staging e promoção atômica em extract-code-only.mjs:149,185, com limpeza no finally em :192. Testes em extract-code-only.test.mjs:153 (segredo) e :134, e graphify-utils.test.mjs:24,55; a rodada deu 37/37 pass. .gitignore:54 ignora .graphify-local/.
- **Revisão:** em disputa. O cético propõe Implementado e o juiz ainda não decidiu.

### F1909 · 100% dos testes críticos passando (unit, integration, E2E)

- **Tipo:** Teste
- **O que os docs afirmam:** Checklist afirma 100% dos testes críticos passando nas três camadas.
- **Fontes:** `docs/reports/AUDIT_REPORT.md:48-48`
- **O que falta:** Corrigir process-race-event/index_test.ts (ou a function) para o tier live voltar a verde; fazer o job E2E executar em push na main (hoje só workflow_dispatch) ou registrar que E2E é opt-in.
- **Evidência:** Último run do pr-checks.yml na main (run 44646906324, HEAD 90170947d, 20/11/2026): 'Unit Tests' success; 'Edge Functions Tests (deno)' failure — tier unit '84 ok / 0 falhas', tier live falhou em supabase/functions/process-race-event/index_test.ts ('OPTIONS returns CORS' AssertionError); 'E2E Tests' skipped (pr-checks.yml:471 if: github.event_name == 'workflow_dispatch' — E2E não roda em push na main). Afirmação de 100% em três camadas não se sustenta no HEAD.
- **Revisão:** sem contestação cética concluída.

### F1910 · 13 testes Deno puros de contrato/autorização

- **Tipo:** Teste
- **O que os docs afirmam:** 13 testes Deno de contrato/autorização aprovados localmente.
- **Fontes:** `docs/execucao/HARDENING_CANONICO_2026-08-31.md:185`
- **O que falta:** Incluir tests/migrations/*_contract_test.ts em um runner (deno-test-suite.mjs ou step dedicado no pr-checks.yml).
- **Evidência:** Arquivos de contrato: supabase/functions/_shared/{canonical-hardening,edge-runtime-regressions,operational-cron-auth,privileged-churn-auth,race-leaderboard-status}_contract_test.ts (5) rodam via scripts/deno-test-suite.mjs (pr-checks.yml:367) e qa-exhaustive.yml:81; tests/migrations/{authz_hardening,canonical_hardening,race_leaderboard_status}_contract_test.ts (3) não têm runner: grep 'tests/migrations' .github/workflows/*.yml package.json scripts/deno-test-suite.mjs → 0. A contagem '13 testes' (docs/execucao/HARDENING_CANONICO_2026-08-31.md:185) é de casos, não de arquivos, e não foi reproduzida.
- **Revisão:** sem contestação cética concluída.

### F1916 · 51 specs Playwright triadas + flaky-quarantine.json

- **Tipo:** Teste
- **O que os docs afirmam:** P083 P.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:174`
- **O que falta:** Triagem das 51 specs Playwright e um smoke verde comprovado; a quarentena está vazia e serve ao Vitest.
- **Evidência:** tests/e2e tem 48 specs (não 51) + tests/a11y/axe-sweep.spec.ts. tests/flaky-quarantine.json existe mas está vazio (`"specs": []`, linha 3) e é consumido só pelo vitest (pr-checks.yml:262-268 → scripts/flaky-report.mjs), não pelo Playwright. "Smoke verde comprovado": job `e2e` de pr-checks.yml:471 `if: github.event_name == 'workflow_dispatch'` → skipped na run de main 44646906324 e na run dispatch 44207386269 (job 134476861097 skipped). Único E2E verde verificado: suíte quote-to-sale (run 43603690837, job 132476371896 success, 2026-11-14).| cético: tests/flaky-quarantine.json:3 `"specs": []`. O campo _doc (linha 2) mostra que a quarentena é para ids do Vitest (test-results/vitest.json), não para specs Playwright. Não há nenhuma triagem das '51 specs' registrada.

### F1917 · 58 erros de tipo legados em 29 functions (deno-typecheck-baseline.json)

- **Tipo:** Teste
- **O que os docs afirmam:** Doc: baseline de typecheck Deno com 58 erros; não impedem runtime; getClaims existe em auth-js 2.69.1 via pin supabase-js@2.49.4.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:283-283`
- **O que falta:** Zerar a baseline de tipos Deno e corrigir o comentário desatualizado em pr-checks.yml:322.
- **Evidência:** scripts/deno-typecheck-baseline.json existe: 53 diagnósticos em 27 functions (contagem via python sobre `diagnostics`), abaixo dos 58/29 da doc. Ratchet ativo: scripts/check-deno-types.mjs:39 (`deno check`), pr-checks.yml:325-326; step "Deno type-check (supabase/functions, ratchet)" success na run de main 44646906324 (job 135994763452). Pin supabase-js@2.49.4 confirmado em supabase/functions/_shared/auth-client.ts:14. Comentários desatualizados: pr-checks.yml:322 e check-deno-types.mjs:5-6 ainda dizem "58 erros em 31 arquivos".| cético: scripts/deno-typecheck-baseline.json: 53 diagnósticos em 28 arquivos (contados por script). .github/workflows/pr-checks.yml:322 ainda diz '58 erros legados em 31 arquivos'. pr-checks.yml:325-326 roda o gate por ratchet (check-deno-types.mjs).

### F1919 · axe cobre 10 de 174 rotas com regras suprimidas

- **Tipo:** Teste
- **O que os docs afirmam:** O sweep axe cobre somente 10 de 174 rotas; rotas autenticadas são puladas e regras color-contrast/svg-img-alt são parcialmente suprimidas.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:270-270`
- **O que falta:** Ampliar o sweep para as cerca de 170 rotas, injetar sessão no CI para cobrir as rotas autenticadas e remover ou justificar as supressões color-contrast/svg-img-alt.
- **Evidência:** tests/a11y/routes.ts:20-98 lista 10 rotas (2 públicas, 8 `requiresAuth: true`); src/routes/AppRoutes.tsx tem 180 ocorrências de `path=`. axe-sweep.spec.ts:85-91 pula rotas autenticadas quando `LOVABLE_BROWSER_AUTH_STATUS !== 'injected'`; a11y-sweep.yml:46-66 não injeta sessão → em CI só /auth e /404 são avaliadas. Supressões persistem: routes.ts:47,54,75,82 (`color-contrast`,`svg-img-alt`), :61,68,89,96 (`color-contrast`). `npx playwright test -c playwright.a11y.config.ts --list` → 10 tests. Workflow a11y-sweep.yml verde (run 44578380553, 2026-11-19).| cético: tests/a11y/routes.ts tem 12 entradas `path:`. tests/a11y/axe-sweep.spec.ts:5 só ativa as rotas autenticadas com LOVABLE_BROWSER_AUTH_STATUS==='injected', e nenhum workflow define essa variável (`grep -rn LOVABLE_BROWSER_AUTH_STATUS .github/workflows` → 0 resultados).

### F1920 · Bundle Edge integral: 122/170 aprovadas, 14 falhas de import e 34 só de tipo

- **Tipo:** Teste
- **O que os docs afirmam:** Doc: bundle de 170 functions: 14 falham por import, 34 por tipo, não atribuídas ao commit.
- **Fontes:** `docs/auditoria/VALIDACAO_EXAUSTIVA_ONDA_1_2026-08-27.md:16`
- **O que falta:** As falhas de import zeraram, mas 21 entrypoints ainda falham no deno check por tipo. O critério 'bundle/deno check de todas as functions passa' não foi atingido.
- **Evidência:** Gate existe: .github/workflows/edge-functions-bundle.yml:63-68 roda scripts/bundle-edge-functions.ts (`deno check` por index.ts). Última run em main (push) 44372663751, 2026-11-18, conclusion success → 0 falhas de import. Porém falhas só de tipo são apenas warning (bundle-edge-functions.ts:37-39,160-171,215) e seguem existindo: 53 diagnósticos em 27 functions em scripts/deno-typecheck-baseline.json.| cético: scripts/bundle-edge-functions.ts:215-221: falhas só de tipo são impressas como 'do NOT block this CI step', então o verde do workflow não quer dizer que todas as functions passam no deno check. Log da última run em main (45895841055, 26/11/2026): '✅ 154 passed ❌ 0 import failure(s) ⚠️ 21 typecheck-only failure(s) (total 175)'.

### F1921 · Carga k6: scripts/load/k6-smoke.js (auth health + OPTIONS de log-web-vitals, get-client-ip, ranking-api, ai-copilot; p95<2.5s, falhas<5%, checks>95%)

- **Tipo:** Teste
- **O que os docs afirmam:** Smoke de carga com K6_BASE_URL, K6_VUS, K6_DURATION.
- **Fontes:** `docs/testes/suites-ci.md:52-59`
- **O que falta:** Alinhar doc e script sobre as functions-alvo e definir K6_TARGET_BASE_URL para o smoke rodar de fato no CI.
- **Evidência:** scripts/load/k6-smoke.js existe; thresholds batem com a doc: :41 `p(95)<2500`, :43 `http_req_failed rate<0.05`, :46 `checks rate>0.95`; env K6_BASE_URL/K6_VUS/K6_DURATION :20,:37-38; `npm run test:load` (package.json:44). Alvos DIVERGEM da doc (docs/testes/suites-ci.md:58): script :27-32 ataca log-web-vitals, send-multichannel-message, send-transactional-email, detect-client-churn-alerts — get-client-ip, ranking-api e ai-copilot não estão no script. Em CI (pr-checks.yml:416-458) só executa com var `K6_TARGET_BASE_URL`; GitHub Actions variables = 0 (API `list_actions_variables` → total_count 0) → job "k6 Load Smoke" passa sem rodar k6 (run 44646906324 job 135994763451, step 1s).| cético: scripts/load/k6-smoke.js:27-32 tem EDGE_FUNCTIONS = log-web-vitals, send-multichannel-message, send-transactional-email, detect-client-churn-alerts. docs/testes/suites-ci.md:56-57 cita get-client-ip, ran…

### F1926 · Cobertura dos fluxos P0/P1 (authz e persistência)

- **Tipo:** Teste
- **O que os docs afirmam:** P081 P: piso 3,99%.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:172`
- **O que falta:** Rodar no CI os contratos de authz e persistência em tests/migrations; hoje nenhum job os executa.
- **Evidência:** Testes de authz/persistência existem: tests/e2e/rls-scope-salesperson.spec.ts, rls-authorization-edge-cases.spec.ts, sales-markup-rls-salesperson.spec.ts, security-definer-rpc-access.spec.ts, quote-to-sale-forbidden.spec.ts, quote-to-sale-api-forbidden.spec.ts; SQL: supabase/tests/rls_test_suite.sql:1-25, canonical_role_simulation.sql, role_helpers_matrix_assertions.sql; 33 arquivos *.test.ts(x) em src mencionam rls/authz/forbidden. Tier remoto SQL executou em CI (job 135994763469 log: "[sql-tests] remote — rls_test_suite.sql", "canonical_role_simulation.sql", success). Porém os specs E2E de RLS só rodam no job `e2e` que é dispatch-only (pr-checks.yml:471) e ficou skipped nas runs 44646906324 e 44207386269.| cético: Existem tests/migrations/authz_hardening_contract_test.ts, canonical_hardening_contract_test.ts e race_leaderboard_status_contract_test.ts. deno.json:4 define a task `test:m…

### F1932 · Deno check por Edge Function: 124 aprovadas, 45 reprovadas

- **Tipo:** Teste
- **O que os docs afirmam:** Deno check por entrypoint das 169 Edge Functions: 124 passam e 45 falham.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:94-94`
- **O que falta:** 21 entrypoints ainda reprovam no deno check; o critério '169/169' não foi atingido.
- **Evidência:** Critério exige 169/169 passando; hoje 27 functions ainda têm erros de tipo (53 diagnósticos em scripts/deno-typecheck-baseline.json; ex.: `supabase/functions/ai-copilot/index.ts| TS2339`), aceitos por ratchet (check-deno-types.mjs; pr-checks.yml:325-326 verde). Progresso: de 45 reprovadas para 27. Resolução de imports 100% ok (edge-functions-bundle.yml run 44372663751 success em main, 2026-11-18). \| cético: Run 45895841055: 154 entrypoints passam, 21 falham só por tipo (total 175). scripts/deno-typecheck-baseline.json: 53 diagnósticos em 28 arquivos.

### F1934 · deno-tests live com service role válida

- **Tipo:** Teste
- **O que os docs afirmam:** pr-checks.yml:320-321: testes live pulados por "Invalid API key".
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:38,166`
- **O que falta:** Corrigir os 2 testes live que falham e a credencial do receive-quote-sync, e tornar o job bloqueante.
- **Evidência:** Secret SUPABASE_SERVICE_ROLE_KEY existe (API list_actions_secrets, atualizado 2026-10-05) e é injetado em pr-checks.yml:346. Tier live executa (scripts/deno-test-suite.mjs:165-196; manifesto tests/deno-live-tests.json 9 suites), mas na run de main 44646906324 (2026-11-20) o job "Edge Functions Tests (deno)" (135994763375) FALHOU no step "Deno live suite": log "live: supabase/functions/process-race-event/index_test.ts FALHOU", "race-commentary/index_test.ts FALHOU", "receive-quote-sync/index.test.ts pulada — credencial inválida/ausente (Invalid API key / env)", resumo "6 ok / 2 falhas / 1 puladas por credencial".| cético: Log da run 44646906324 conferido: '##[error]live: supabase/functions/process-race-event/index_test.ts FALHOU', 'race-commentary/index_test.ts FALHOU', 'receive-quote-sync/index.test.ts pulada — credencial inválida/ausente (Invalid API key / env)' e 'live: 6 ok / 2 falha…

### F1939 · E2E do PR #131 falhou (20 falhas, 101 aprovações)

- **Tipo:** Teste
- **O que os docs afirmam:** Job E2E com timeouts de locator.fill e navegação; causa-raiz não diagnosticada.
- **Fontes:** `docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:122`
- **O que falta:** É um snapshot histórico de CI, não uma funcionalidade verificável.
- **Evidência:** Critério "E2E verde em main" não demonstrável: job `e2e` de pr-checks.yml:460-471 roda só em `workflow_dispatch`; na run de main 44646906324 (push, 2026-11-20) o job "E2E Tests" (135998002812) foi skipped; na última run dispatch 44207386269 (2026-11-18) também skipped (job 134476861097). Não há run E2E completa recente verde — só a suíte quote-to-sale (run 43603690837 success, 2026-11-14). A causa-raiz das 20 falhas do PR #131 segue sem diagnóstico no repo (docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:122).| cético: O item registra o resultado de uma run de uma PR já mergeada. .github/workflows/pr-checks.yml:471 restringe o E2E a workflow_dispatch, então não existe 'E2E em main' contínuo a aferir; a lacuna real está coberta em F1915/F1938.

### F1941 · E2E novos para cada CRÍTICO/ALTO sem cobertura

- **Tipo:** Teste
- **O que os docs afirmam:** Etapa 36: escrever E2E faltantes como prova de existência de cada falha CRÍTICA/ALTA.
- **Fontes:** `docs/auditoria/00_PLANO_MESTRE_AUDITORIA.md:117`
- **O que falta:** Specs E2E para roleta, prompt e o fluxo funcional de cadência, mais uma matriz que ligue cada um dos 10 CRÍTICOS de docs/auditoria/RELATORIO_FALHAS.md ao spec que o cobre.
- **Evidência:** Specs E2E existem (52 em tests/e2e: 23 quote-to-sale-_.spec.ts, tests/e2e/rls-authorization-edge-cases.spec.ts, tests/e2e/rls-scope-salesperson.spec.ts, tests/e2e/security-definer-rpc-access.spec.ts, tests/e2e/sales-markup-rls-salesperson.spec.ts) e rodam em .github/workflows/pr-checks.yml:558 e .github/workflows/quote-to-sale-e2e.yml:182. Porém docs/auditoria/RELATORIO_FALHAS.md:758 registra 10 CRÍTICOS/33 ALTOS e não há rastreabilidade crítico→spec; faltam specs para itens listados como ausentes: roleta (grep -liE 'roleta\|roulette\|wheel' tests/e2e/_.spec.ts → 0), prompt (grep -liE 'prompt' tests/e2e/*.spec.ts → 0); cadência só smoke de página (tests/e2e/pages-automation-ai.spec.ts:57,67 loadPage('/cadencias')).| cético: Reproduzido: `grep -liE 'roleta\|roulette\|wheel\|spin' tests/e2e/*.ts` → 0 resultados; `grep -liE 'prompt' tests/e2e/*.ts` → 0 resultados. Cadência aparece só em te…

### F1942 · E2E para cada CRÍTICO/ALTO (cadência, CSV, roleta, prompt)

- **Tipo:** Teste
- **O que os docs afirmam:** A.4 #36 P.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:239`
- **O que falta:** Specs para roleta, prompt e cadência funcional (criar, inscrever, avançar) em tests/e2e/.
- **Evidência:** tests/e2e/rls-authorization-edge-cases.spec.ts e tests/e2e/rls-scope-salesperson.spec.ts existem; CSV coberto em tests/e2e/revenue-forecast-v2.spec.ts:159-163 ('export CSV baixa arquivo…', botão /Exportar CSV/); cadência apenas smoke de rota (tests/e2e/pages-automation-ai.spec.ts:57,67); roleta e prompt sem spec (grep -liE 'roleta\|roulette\|wheel\|prompt' tests/e2e/_.spec.ts → 0). Fonte declara 'parcial' em docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:239.| cético: Reproduzido: CSV coberto só em tests/e2e/revenue-forecast-v2.spec.ts (único arquivo com 'csv'). Roleta e prompt sem spec (grep → 0). Cadência só como smoke de página (pages-automation-ai.spec.ts). Os arquivos rls-_.spec.ts existem.

### F1945 · Escada de cobertura services 40%

- **Tipo:** Teste
- **O que os docs afirmam:** services em 20,65% contra meta de 40%.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:291`
- **O que falta:** Testes em src/services/ até ≥40% de linhas e subir o piso com `npm run coverage:baseline:update`.
- **Evidência:** Escada existe e roda no CI: coverage-ladder-baseline.json ('src/services/': lines 13.5), scripts/check-coverage-ladder.mjs:61-74, .github/workflows/pr-checks.yml:288 `npm run coverage:ladder`. Meta de 40% em docs/estado/15_PLANO_COBERTURA_MODULOS.md:49 ('src/services/ → 40% → 60%'); histórico de queda em :58 (18,7% → 16,5%); piso atual 13.5% < 20,65% declarado e muito abaixo de 40%.| cético: coverage-ladder-baseline.json: 'src/services/' lines 13.5, abaixo dos 40% da meta (docs/estado/15_PLANO_COBERTURA_MODULOS.md:49). O histórico em :58 registra queda de 18,7% para 16,5%, e o piso atual é ainda menor. A escada roda no CI (pr-checks.yml:288).

### F1948 · Etapa 007 (CI): Validar credenciais E2E com node scripts/e2e-precheck.mjs em workflow_dispatch

- **Tipo:** Teste
- **O que os docs afirmam:** Anexar run verde ao PR da fase.
- **Fontes:** `docs/execucao/PLANO_WORKFLOWS_GITHUB_ACTIONS_100_ETAPAS_2026-09-27.md:70`
- **O que falta:** Validar os secrets E2E e anexar um run verde via workflow_dispatch.
- **Evidência:** Script existe e está integrado: scripts/e2e-precheck.mjs:1-16 (contrato exit 0/1/3), :23 lê E2E_TEST_EMAIL, :73,82 exit 3; chamado em .github/workflows/pr-checks.yml:529 (job e2e, com `workflow_dispatch` em pr-checks.yml:12) e .github/workflows/quote-to-sale-e2e.yml:154. 'Run verde' não confirmado: docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:237 registra credenciais E2E 'Inválidas desde ≥09-28'.| cético: O script existe e é chamado no job e2e de pr-checks.yml, que aceita workflow_dispatch (pr-checks.yml:12). O run verde não está comprovado: docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:237 registra credenciais inválidas. Não encontrei evidência nova.

### F1951 · Etapa 10 (Graphify): Construir corpus sintético de referência

- **Tipo:** Teste
- **O que os docs afirmam:** Fixtures TS/TSX, Deno, SQL, docs, ciclos, referências ausentes, overloads e nomes repetidos.
- **Fontes:** `docs/planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md:138-143`
- **O que falta:** Corpus versionado (TS/TSX, Deno, SQL, docs, ciclos, ausentes, overloads, homônimos) com resultados esperados e teste de mutação por contrato.
- **Evidência:** Há fixtures efêmeras nos testes de scripts/graphify/*.test.mjs (39 testes; scripts/graphify/extract-code-only.test.mjs:11 mkdtemp, :59-92; scripts/graphify/catalog-adapter.test.mjs:6 fixture JSON) rodando via package.json:48 `graphify:test` e .github/workflows/graphify.yml:50. Não existe tests/graphify/ (`ls tests/graphify` → não existe) nem corpus persistente TS/TSX/Deno/SQL com ciclos, overloads e schemas homônimos — docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:144 'PARCIAL'.| cético: Só há fixtures pontuais e efêmeras: scripts/graphify/docs-index.test.mjs:13-16, extract-code-only.test.mjs:15, static-contracts.test.mjs:20 (SQL inline). `ls tests/graphify` → não existe. Não há corpus persistente com ciclos, overloads ou nomes homônimos (REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:144 PARCIAL).

### F1952 · Etapa 41 (Graphify): Exercitar cenários hostis de arquivos e conteúdo

- **Tipo:** Teste
- **O que os docs afirmam:** Segredo sintético, arquivo enorme, encoding inválido, symlink, path traversal, prompt injection, HTML malicioso.
- **Fontes:** `docs/planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md:369-374`
- **O que falta:** Casos de encoding inválido, prompt injection e HTML malicioso. Não falta ligar graphify-local.unit.mjs ao CI: já roda via automation-local.yml:45.
- **Evidência:** Cobertos: symlink (scripts/graphify/extract-code-only.test.mjs:86; scripts/graphify-local.unit.mjs:182,459), path traversal (scripts/graphify/graphify-utils.test.mjs:5), segredo sintético/redação (graphify-utils.test.mjs:70,76,81), arquivo >512MB/FIFO (graphify-local.unit.mjs:459). Não cobertos: encoding inválido, prompt injection, HTML malicioso (grep -niE 'encoding\|injection\|html' scripts/graphify/*.test.mjs scripts/graphify-local.unit.mjs → 0). scripts/graphify-local.unit.mjs não tem runner (grep -rn 'graphify-local.unit' package.json .github/workflows → 0). docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:175 'PARCIAL'.| cético: O veredito se mantém, mas a evidência inicial erra num ponto: scripts/graphify-local.unit.mjs RODA no CI. Ele está em scripts/automation.config.json:8 (testSuites), é executado por scripts/automation.mjs:640-645 (`node --test`) e chamado em .github/work…

### F1954 · Etapa 43 (Graphify): Testar recuperação, concorrência e equivalência

- **Tipo:** Teste
- **O que os docs afirmam:** Interromper extração, corromper cache, duas worktrees, downgrade compatível.
- **Fontes:** `docs/planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md:383-388`
- **O que falta:** Casos de cache corrompido, duas worktrees (equivalência) e downgrade compatível. Não falta ligar o arquivo ao CI.
- **Evidência:** Testes de lock/concorrência/snapshot existem em scripts/graphify-local.unit.mjs:212 ('grafo vazio ou inválido não substitui snapshot anterior'), :222, :265 ('trava local impede concorrência e recupera apenas dono comprovadamente morto'), :280, :291, :360 — mas o arquivo não é executado por nenhum script/workflow (grep -rn 'graphify-local.unit' package.json .github/workflows scripts/*.mjs → 0). Sem suíte de interrupção da extração, corrupção de cache, duas worktrees e downgrade (docs/graphify/REVISAO_EXAUSTIVA_PLANO_2026-09-11.md:177 'PENDENTE').| cético: O veredito se mantém, mas a evidência inicial erra num ponto: scripts/graphify-local.unit.mjs É executado no CI (scripts/automation.config.json:8 → scripts/automation.mjs:640-645 → .github/workflows/automation-local.yml:45). Ele já cobre: interrupção por timeout sem grafo parcial (:291), grafo inválido não substitui o snapshot anterior …

### F1959 · Etapa 83 do plano: Medir cobertura real

- **Tipo:** Teste
- **O que os docs afirmam:** Incluir todo src elegível, separar generated/UI trivial e elevar progressivamente até 85% significativo. Saída esperada: relatório não-curado. Gate: política de qualidade.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:763-763`
- **O que falta:** `all: true` (ou equivalente) para todo src elegível, publicar o relatório como artifact e subir os pisos rumo a 85%.
- **Evidência:** Escopo real configurado: vitest.config.ts:38 include 'src/**/*.{ts,tsx}', :39-57 exclusões justificadas (types.ts gerado, components/ui, exporters), :27 reporters json/json-summary/html; CI mede em pr-checks.yml:253 e aplica ratchet (:283) e escada (:288). Porém vitest.config.ts:31 `all: false` conta só arquivos importados por testes; coverage-baseline.json: lines 4.64%, branches 3.72%; thresholds vitest.config.ts:65-70 = 2.5/2.5/2.0/2.5 — longe de '85% significativo'.| cético: vitest.config.ts:31 `all: false`: só conta arquivos importados por testes, então o relatório é curado. Pisos baixos em coverage-baseline.json (lines 4.64, branches 3.72). O relatório de cobertura não é publicado: os upload-artifact de pr-checks.yml são só flaky-report (:274), sql-coverage-matrix (:406) e playwright-report (:564).

### F1960 · Etapa 86 do plano: Automatizar testes Edge

- **Tipo:** Teste
- **O que os docs afirmam:** Testes por 169 entrypoints, contratos, auth negativa, CORS, SSRF, webhooks e service-role. Saída esperada: cobertura por função. Gate: ambiente isolado.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:766-766`
- **O que falta:** Testes para as ~140 functions sem cobertura (prioridade: allowlist de deploy.yml:144) e `deno test --coverage` com relatório por função.
- **Evidência:** 93 arquivos _\_test.ts/_.test.ts em supabase/functions, distribuídos em 32 de 172 pastas (find …| cut -d/ -f3 \| sort -u \| wc -l); rodam no CI em .github/workflows/pr-checks.yml:367,370 via scripts/deno-test-suite.mjs (tiers unit/live, manifesto tests/deno-live-tests.json). Sem 'cobertura por função': nenhum `deno test --coverage` (grep '\-\-coverage' em workflows/scripts → só vitest); ~140 functions sem teste. \| cético: Reproduzido: 93 arquivos de teste em 32 das 172 pastas de supabase/functions (find \| cut \| sort -u). Rodam via pr-checks.yml:367,370. Não há cobertura por função (`grep 'deno coverage'` → 0).

### F1961 · Etapa 90 do plano: Executar carga e caos controlados

- **Tipo:** Teste
- **O que os docs afirmam:** Rate limits, retries, DLQ, providers fora, DB lento e concorrência, nunca em produção sem janela. Saída esperada: relatório e capacidade. Gate: ambiente/custo.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:770-770`
- **O que falta:** Ambiente isolado para carga (K6_TARGET_BASE_URL), deploy das 3 functions ou remoção dos chamadores, e relatório de carga/caos versionado.
- **Evidência:** Functions de carga/caos existem no repo: supabase/functions/simulate-load (126 linhas), supabase/functions/stress-test-contracts (135), supabase/functions/run-retry-tests (2030, com fuzz_test.ts), chamadas por src/components/debug/WebhookSimulationPanel.tsx e src/hooks/useRetryTestRun.ts — mas NENHUMA está na allowlist ACTIVE de .github/workflows/deploy.yml:144 (checagem programática: simulate-load False, stress-test-contracts False, run-retry-tests False), logo não rodam em produção. Smoke de carga k6 existe (scripts/load/k6-smoke.js) mas pr-checks.yml:413,455 só executa se var K6_TARGET_BASE_URL estiver definida ('smoke de carga documentado, não executado'). Sem relatório de capacidade versionado.| cético: Parse de deploy.yml:144 (ACTIVE separado por \n): simulate-load, stress-test-contracts e run-retry-tests não constam (só execute-workflow aparece no filtro), então não rodam em prod…

### F1962 · Etapa 99 do plano: Executar smoke ponta a ponta em produção

- **Tipo:** Teste
- **O que os docs afirmam:** Login, quote→sale, pedido, webhook, gamificação, relatórios e jobs sem fabricar dados. Saída esperada: evidência assinada e sem PII. Gate: janela/tráfego autorizado.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:782-782`
- **O que falta:** Deploy da function health (ou outro alvo) com falha real em HTTP≠200, e um job de smoke read-only pós-deploy com evidência sem PII.
- **Evidência:** Pós-deploy só checa `health`: .github/workflows/deploy.yml:177-185 (curl https://usyxfpqlsspldubptrdl.supabase.co/functions/v1/health; HTTP≠200 vira apenas ::warning::) e a function `health` NÃO está na allowlist ACTIVE (deploy.yml:144; checagem programática health False) — o smoke bate numa function não deployada. tests/e2e/smoke.spec.ts tem 2 testes triviais (:4 home, :11 redirect auth). scripts/smoke-target-backend.ts:2-13 é smoke de backend de DESTINO pós-migração (TARGET_* env), não agendado para produção (package.json:46 `smoke:target`, sem workflow). Sem smoke de quote→sale/pedido/webhook/gamificação/relatórios/jobs em produção nem evidência assinada.| cético: .github/workflows/deploy.yml:177-185: o health check só emite ::warning:: em HTTP≠200. supabase/functions/health/index.ts existe, mas 'health' não está em ACTIVE (deploy.yml:144, parse → ausente). Não há smoke de quote→sale…

### F1964 · Etapa canônica 26/08 nº 83: Medir cobertura real (elevar até 85% significativo)

- **Tipo:** Teste
- **O que os docs afirmam:** Etapa canônica 83 (plano 26/08, matriz de status 30/08, estado ⬜): todo src elegível; separar generated/UI trivial; relatório não-curado.
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:243-243`
- **O que falta:** Relatório não-curado (todo src elegível), upload como artifact e plano de subida dos pisos.
- **Evidência:** Cobertura configurada e medida: vitest.config.ts:25-70 (provider v8, include src/**, exclusões para gerado/UI trivial em :39-57, thresholds 2.5/2.5/2.0/2.5), pr-checks.yml:253 `--coverage`, ratchet (:283, coverage-baseline.json lines 4.64%) e escada (:288, coverage-ladder-baseline.json). Falta o 'relatório não-curado': vitest.config.ts:31 `all: false` (só arquivos importados) e nenhum upload do relatório de cobertura do Vitest como artifact (grep 'coverage' pr-checks.yml → só sql-coverage-matrix em :402-407). Distante de 85%.| cético: A cobertura é medida (vitest.config.ts:27 reporters; :38 include; :65 thresholds; pr-checks.yml:253), mas vitest.config.ts:31 tem `all: false`, então o relatório é curado. O coverage/ não é publicado como artifact (pr-checks.yml só sobe :274, :406, :564). Os pisos ficam em 4.64% (coverage-baseline.json), longe de 85%.

### F1965 · Etapa canônica 26/08 nº 86: Automatizar testes Edge por entrypoint

- **Tipo:** Teste
- **O que os docs afirmam:** Etapa canônica 86 (plano 26/08, matriz de status 30/08, estado 🔒): contratos, auth negativa, CORS, SSRF, webhooks, service-role; cobertura por função.
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:246-246`
- **O que falta:** Cobertura por entrypoint: 145 funções sem nenhum *_test.ts (ex.: behavioral-analysis, ai-copilot, send-quote-to-client só 1); criar teste de contrato/auth negativa por função ou um teste varredor que exija withRequestId + checagem de método + auth em todas; corrigir a suíte live (race-commentary CORS) para o job deno-tests voltar a ficar verde.
- **Evidência:** 83 arquivos _\_test.ts em supabase/functions cobrindo apenas 26 das 171 funções (find supabase/functions -name '__test.ts'| awk -F/ '{print $3}' \| sort -u → 27 entradas incl. _shared); suíte roda no CI em .github/workflows/pr-checks.yml:335-370 (job deno-tests, tiers unit/live via scripts/deno-test-suite.mjs:1-22); contratos transversais existem: _shared/cors_lint_test.ts:1-16 (CORS), _shared/webhook-auth_test.ts, _shared/internal-service-auth_test.ts, _shared/operational-cron-auth_contract_test.ts (service-role/auth), simulate-load/index.ts:8-18 (SSRF por regex, sem teste próprio). Última run na main (gh run 44646906324): 'Deno unit suite' ✓, 'Deno live suite' ✗ (race-commentary/index_test.ts OPTIONS CORS FALHOU).
- **Revisão:** sem contestação cética concluída.

### F1966 · Etapa canônica 26/08 nº 90: Executar carga e caos controlados

- **Tipo:** Teste
- **O que os docs afirmam:** Etapa canônica 90 (plano 26/08, matriz de status 30/08, estado 🔒): rate limits, retries, DLQ, providers fora, DB lento, concorrência; relatório e capacidade.
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:250-250`
- **O que falta:** Definir var K6_TARGET_BASE_URL (Settings > Variables) para o smoke k6 executar de fato; cenários de caos (providers fora, DB lento, DLQ, retries) inexistentes; relatório de carga/capacidade versionado; ou incluir stress-test-contracts na allowlist/remover o painel que a chama.
- **Evidência:** supabase/functions/simulate-load/index.ts:20-50 e supabase/functions/stress-test-contracts/index.ts:12-50 existem no repo, mas NENHUMA das duas está na allowlist ACTIVE de .github/workflows/deploy.yml:144 (grep -cx simulate-load → 0; stress-test-contracts → 0); stress-test-contracts é invocada pela UI em src/components/debug/WebhookSimulationPanel.tsx:43 (montado em src/pages/WebhooksPage.tsx:266) → chamada a função não deployada; simulate-load sem chamador (comentário em index.ts:24-26). Carga real: scripts/load/k6-smoke.js + job k6-smoke em pr-checks.yml:416-458 que sai com exit 0 quando K6_TARGET_BASE_URL está vazio (runs recentes duram 5-9s = pulado). Nenhum relatório de capacidade/caos versionado (ls docs/reports| grep -i load/carga/caos → só STRESS_TEST_REPORT.md, sem números). tests/load removido no commit 0be0c2e69.
- **Revisão:** sem contestação cética concluída.

### F1967 · Etapa canônica 26/08 nº 99: Smoke ponta a ponta em produção sem fabricar dados

- **Tipo:** Teste
- **O que os docs afirmam:** Etapa canônica 99 (plano 26/08, matriz de status 30/08, estado 🔒): login, quote→sale, pedido, webhook, gamificação, relatórios, jobs; evidência assinada sem PII.
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:264-264`
- **O que falta:** Smoke ponta a ponta sem dados fictícios (login→quote→sale→pedido→webhook→gamificação→relatórios→jobs) com evidência assinada; corrigir smoke.spec.ts (título errado); remover mocks do smoke mobile ou classificá-lo como unitário; configurar secrets E2E e habilitar o job e2e em PR/push.
- **Evidência:** tests/e2e/smoke.spec.ts:1-16 só verifica título (/vite/i — divergente de index.html:8 'PROMO CHAMPIONS - Plataforma de Gestão de Vendas') e redirect /dashboard→/auth; tests/e2e/mobile-auth-smoke.spec.ts:20-40 usa MOCK_USER/MOCK_SESSION e page.route (dados fictícios); fluxo quote→sale/webhook/gamificação/jobs só em tests/e2e/quote-to-sale-*.spec.ts que grava vendas reais (comentário pr-checks.yml:552-555); scripts/smoke-target-backend.ts:4,56-80,100-133 cobre conectividade/login/RLS/dados sem fabricar registros. Job e2e só roda em workflow_dispatch (pr-checks.yml:471) e nas runs recentes aparece como '-' (pulado) em gh run 44646906324 e 43970155448.
- **Revisão:** sem contestação cética concluída.

### F1971 · Fuzz das Edge de escrita

- **Tipo:** Teste
- **O que os docs afirmam:** A.4 #38 P: _shared/fuzz_test.ts, request-id-fuzz_test.ts.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:241`
- **O que falta:** Fuzz contra os handlers reais das Edge de escrita deployadas (ex.: dispatch-webhook, send-multichannel-message, receive-quote-sync, inbound-email-webhook, execute-workflow) com payloads maliciosos via Request; hoje só 3 schemas são fuzzados e 2 deles pertencem a funções fora de produção.
- **Evidência:** supabase/functions/_shared/fuzz_test.ts:38,60,77 — 3 Deno.test fuzzando apenas os schemas Zod WebhookContracts.leadScoring/workflowExecution/aiCopilot via validateWebhookPayload in-process (não chama handlers HTTP); _shared/request-id-fuzz_test.ts:64-211 fuzz do middleware withRequestId; run-retry-tests/fuzz_test.ts:1-30 fuzz de dispatchOne com fetch mockado. Schemas usados por lead-scoring/index.ts:42, execute-workflow/index.ts:56, ai-copilot/index.ts:49 — lead-scoring e ai-copilot NÃO estão na allowlist deploy.yml:144 (grep -cx → 0). Rodam no tier unit do CI (pr-checks.yml:367).
- **Revisão:** sem contestação cética concluída.

### F1972 · Fuzz de contrato em Edge Functions de escrita

- **Tipo:** Teste
- **O que os docs afirmam:** Etapa 38: testar Edge Functions de escrita com payloads maliciosos.
- **Fontes:** `docs/auditoria/00_PLANO_MESTRE_AUDITORIA.md:119`
- **O que falta:** Ampliar fuzz para todas as Edge de escrita em produção (allowlist deploy.yml:144) exercitando o handler HTTP com payloads maliciosos (tipos errados, strings gigantes, injeção), não só os schemas Zod compartilhados.
- **Evidência:** Mesmos artefatos de F1971: supabase/functions/_shared/fuzz_test.ts:38-95 (3 contratos), run-retry-tests/fuzz_test.ts, lead-scoring/lead-scoring_test.ts:9-34 (payload inválido/campos faltando), dispatch-webhook/authz_test.ts:10-26 (JWT/role), dispatch-webhook/index.ts:117-138 (validação manual com 400). Diretório tests/edge/ inexistente (ls tests → a11y, deno-live-tests.json, e2e, flaky-quarantine.json, migrations). Executados pelo job deno-tests (pr-checks.yml:367), unit ✓ na run 44646906324.
- **Revisão:** sem contestação cética concluída.

### F1973 · Fuzz tests em _shared (fuzz_test.ts, request-id-fuzz) e testes paramétricos run-retry-tests

- **Tipo:** Teste
- **O que os docs afirmam:** Doc afirma fuzz tests em _shared/fuzz_test.ts e request-id-fuzz, testes paramétricos de retry em run-retry-tests/ (57 KB) e 12 contract tests.
- **Fontes:** `docs/auditoria/AUDITORIA_TECNICA_EXAUSTIVA_2026-09-02.md:363`
- **O que falta:** Suíte Deno completa verde na main: corrigir as 2 falhas do tier live (race-commentary OPTIONS CORS e a segunda suite listada no log do job 135994763375); os arquivos declarados existem e o tier unit passa.
- **Evidência:** Arquivos existem: supabase/functions/_shared/fuzz_test.ts (3 testes, l.38/60/77), _shared/request-id-fuzz_test.ts (10 testes, l.64-211), supabase/functions/run-retry-tests/ (88K: retry_test.ts 43KB, retry_parametric_test.ts 13KB, contract_test.ts, fuzz_test.ts, 64 Deno.test). Contract tests: 15 arquivos *contract*test* (12 em supabase/functions + 3 em tests/migrations). 'deno test passa': deno não está instalado neste ambiente (which deno → vazio); evidência indireta: step 'Deno unit suite (self-contained)' ✓ em gh run 44646906324 e 44617891245 (main), mas step 'Deno live suite' ✗ na run 44646906324 (race-commentary/index_test.ts FALHOU, 2 falhas live).
- **Revisão:** sem contestação cética concluída.

### F1974 · Fuzzing em Lead Scoring, Webhook Dispatcher, AI Copilot e Behavioral Analysis

- **Tipo:** Teste
- **O que os docs afirmam:** Testes de integração e fuzzing (1000+ variações de inputs maliciosos) nos 4 módulos.
- **Fontes:** `docs/reports/STRESS_TEST_REPORT.md:4-6`
- **O que falta:** Testes para behavioral-analysis (nenhum) e validação Zod do payload nela e em dispatch-webhook; fuzz de payload (não só authz) em dispatch-webhook; 2 dos 4 módulos (lead-scoring, ai-copilot) não estão deployados, então o fuzz não protege produção.
- **Evidência:** Lead Scoring: supabase/functions/lead-scoring/lead-scoring_test.ts:9-34 (3 testes de contrato) + _shared/fuzz_test.ts:38 — porém lead-scoring NÃO está na allowlist deploy.yml:144 (não roda em produção). Webhook Dispatcher: dispatch-webhook/authz_test.ts:10-26 (2 testes de autorização, sem fuzz de payload) e validação manual em dispatch-webhook/index.ts:117-138 (não Zod); run-retry-tests/fuzz_test.ts fuzz do retry (função run-retry-tests fora da allowlist). AI Copilot: _shared/fuzz_test.ts:77 fuzz do schema; ai-copilot fora da allowlist. Behavioral Analysis: supabase/functions/behavioral-analysis/ só index.ts (nenhum teste); index.ts:60-61 faz `(await req.json()) as AnalysisRequest` sem Zod, única checagem é text.length<100 (l.63). '1000+ variações' não existe: generateMalformedData gera ~7+5·campos cenários por schema (fuzz_test.ts:9-36). docs/reports/STRESS_TEST_REPORT.md:1-24 não cita…
- **Revisão:** sem contestação cética concluída.

### F1975 · Gates locais: ESLint 0 warnings, tsc, detector de credencial, Vitest 516/2 skip, cobertura 99,93%, build, budget

- **Tipo:** Teste
- **O que os docs afirmam:** Doc registra todos os gates locais passando após regenerar tipos.
- **Fontes:** `docs/auditoria/VALIDACAO_SINCRONIA_GITHUB_SUPABASE_2026-09-10.md:23-31`
- **O que falta:** Atualizar docs/auditoria/VALIDACAO_SINCRONIA_GITHUB_SUPABASE_2026-09-10.md:23-31 (cobertura 99,93% é inválida — real ~4,6%; 516 testes → 985); rodar `npm run ci` completo (build + budget) para evidência local integral.
- **Evidência:** Gates existem e estão encadeados: package.json ci (lint --max-warnings 0, typecheck, security:secrets, graphify:test, test:coverage, build, scripts/check-bundle-budget.mjs [4031 bytes]); vitest.config.ts:28-78 coverage sobre src/**. Rodados nesta sessão: typecheck exit 0, lint:complexity exit 0 (131 warnings), vitest 983 passed/2 skipped exit 0, npm audit 0 vulns (scratchpad/gates.log). Números do doc estão defasados/irreais: Vitest hoje tem 985 testes (não 516) e a cobertura 99,93% era medida sobre whitelist de 16 arquivos (vitest.config.ts:35-41 explica); baseline real é lines 4,64% (coverage-baseline.json). build e bundle-budget não executados localmente nesta sessão (passaram na run da main 44617891245: Build Check ✓; Bundle Size Check pulado).
- **Revisão:** sem contestação cética concluída.

### F1978 · Handoff P063: Corrigir os 28 testes Deno falhos

- **Tipo:** Teste
- **O que os docs afirmam:** Fila canônica do handoff (onda 7): Corrigir os 28 testes Deno falhos. Todas as etapas começam pendentes; 0 de 100 executadas na data do handoff. Gate(s) conforme §13.
- **Fontes:** `docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:369-369`
- **O que falta:** Corrigir as 2 suites live que falham (race-commentary CORS e a segunda do log) e a credencial que pula receive-quote-sync; 'deno test verde' na main hoje é falso para o tier live.
- **Evidência:** Suíte Deno integrada ao CI (pr-checks.yml:335-370; scripts/deno-test-suite.mjs tiers unit/live; manifesto tests/deno-live-tests.json). Tier unit ✓ nas runs da main 44617891245 e 44646906324; tier live ✗ na run mais recente da main 44646906324 (job 135994763375: 'live: 6 ok / 2 falhas / 1 puladas por credencial' — race-commentary/index_test.ts 'OPTIONS CORS' FALHOU, AssertionError) e receive-quote-sync/index.test.ts pulada por credencial inválida (run 44617891245). deno não instalado localmente para contagem exata de falhas.
- **Revisão:** sem contestação cética concluída.

### F1979 · Handoff P081: Elevar cobertura unitária nos fluxos P0/P1

- **Tipo:** Teste
- **O que os docs afirmam:** Fila canônica do handoff (onda 9): Elevar cobertura unitária nos fluxos P0/P1. Todas as etapas começam pendentes; 0 de 100 executadas na data do handoff. Gate(s) conforme §13.
- **Fontes:** `docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:397-397`
- **O que falta:** Definir quais fluxos são P0/P1 (quote→sale, auth, RLS, webhooks) e pisos específicos na escada; elevar cobertura (src/lib/race 0%, src/services 13,5%); publicar relatório de cobertura dos fluxos P0/P1.
- **Evidência:** Infra de ratchet existe: vitest.config.ts:28-78 (coverage sobre src/** com thresholds piso 2,5%/2,0%), coverage-baseline.json (lines 4,64 / branches 3,72 / functions 3,4 / statements 4,57), coverage-ladder-baseline.json com pisos por módulo (src/lib/validators 100, src/lib/bi 27,9, src/services 13,5, src/hooks/reports 82,7, src/lib/race 0), job test em pr-checks.yml:282-289 roda coverage:ratchet e coverage:ladder; 144 arquivos de teste em src. Cobertura global ~4,6% e módulos P0 como src/lib/race/ em 0% (coverage-ladder-baseline.json) — fluxos P0/P1 não têm meta nem relatório próprio.
- **Revisão:** sem contestação cética concluída.

### F1980 · Handoff P083: Triar 483 testes Playwright e estabilizar smoke crítico

- **Tipo:** Teste
- **O que os docs afirmam:** Fila canônica do handoff (onda 9): Triar 483 testes Playwright e estabilizar smoke crítico. Todas as etapas começam pendentes; 0 de 100 executadas na data do handoff. Gate(s) conforme §13.
- **Fontes:** `docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:399-399`
- **O que falta:** Smoke crítico rodando e verde no CI: configurar secrets E2E (environment pr-preview), mudar o `if` do job e2e para rodar em PR/push ao menos com um subconjunto crítico, incluir no ci-gate; corrigir smoke.spec.ts; não há evidência de triagem dos ~480 testes (quarentena vazia e nenhum relatório).
- **Evidência:** 477 chamadas test( em tests/e2e/_.spec.ts (49 specs); playwright.config.ts:43-80 define projetos quote-to-sale/chromium-desktop/page-smoke/mobile-_; tests/flaky-quarantine.json 'specs: []' (nada quarentenado); job e2e em .github/workflows/pr-checks.yml:460-566 só executa com `if: github.event_name == 'workflow_dispatch'` (l.471) e não está no needs do ci-gate (l.711); nas runs da main 44646906324/44617891245 'E2E Tests' aparece como '-' (pulado) e nas runs workflow_dispatch 43970155448 também '-' (0s). tests/e2e/smoke.spec.ts:8 espera título /vite/i ≠ index.html:8.
- **Revisão:** sem contestação cética concluída.

### F1981 · Handoff P097: Testes de carga, concorrência e degradação

- **Tipo:** Teste
- **O que os docs afirmam:** Fila canônica do handoff (onda 10): Testes de carga, concorrência e degradação. Todas as etapas começam pendentes; 0 de 100 executadas na data do handoff. Gate(s) conforme §13.
- **Fontes:** `docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:418-418`
- **O que falta:** Executar k6 de verdade (definir K6_TARGET_BASE_URL) e versionar o relatório (p95, taxa de erro, capacidade); cenários de degradação (provider fora, DB lento) inexistentes.
- **Evidência:** Idem F1966: supabase/functions/simulate-load/index.ts existe mas fora da allowlist deploy.yml:144 e sem chamador (index.ts:24-26); tests/load/ não existe (removido no commit 0be0c2e69, substituído por scripts/load/k6-smoke.js:1-15); job k6-smoke (pr-checks.yml:416-458) pula com exit 0 sem K6_TARGET_BASE_URL (runs da main duram 5-9s); nenhum relatório de carga versionado (docs/reports só tem STRESS_TEST_REPORT.md sem métricas). Concorrência coberta pontualmente por tests/e2e/quote-to-sale-concurrent*.spec.ts (não executam no CI, F1980).
- **Revisão:** sem contestação cética concluída.

### F1983 · Infra de testes: src/test/setup.ts e test-utils.tsx (Vitest + Testing Library)

- **Tipo:** Teste
- **O que os docs afirmam:** Setup global do Vitest e utilitários de teste.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:1570-1577`
- **O que falta:** Atualizar docs/DOCUMENTACAO_SISTEMA.md:1577 removendo test-utils.tsx (ou recriar um render-with-providers se os testes precisarem); setup.ts está íntegro e ligado.
- **Evidência:** src/test/setup.ts existe (1548 bytes; jest-dom, mock de @supabase/supabase-js, ResizeObserver/matchMedia, cleanup) e vitest.config.ts:13 `setupFiles: ['./src/test/setup.ts']`; src/test/test-utils.tsx NÃO existe (ls → No such file) — foi removido no commit 8a18a1263 (2026-03-05 'Refactor test assets cleanup', -41 linhas); docs/DOCUMENTACAO_SISTEMA.md:1573-1577 ainda o lista e docs/estado/14_VERIFICACAO_DA_AUDITORIA.md:141 afirma erroneamente 'nunca existiu'. Nenhum substituto (find src -iname '_test-utils_' → 0).
- **Revisão:** sem contestação cética concluída.

### F1985 · Job E2E required (skips por !HAS_AUTH em pages-*.spec.ts)

- **Tipo:** Teste
- **O que os docs afirmam:** 172 skips por !HAS_AUTH em tests/e2e/pages-*.spec.ts; rodam só no job E2E, não required (última run da PR #240 cancelada antes do merge).
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:82`
- **O que falta:** Tornar o job e2e executável em PR (remover restrição workflow_dispatch ou adicionar gatilho), configurar VITE_SUPABASE_URL/PUBLISHABLE_KEY/E2E_TEST_EMAIL/E2E_TEST_PASSWORD no environment pr-preview e incluir e2e no ci-gate para os testes autenticados executarem.
- **Evidência:** tests/e2e/helpers/auth.ts:32 define HAS_AUTH; 182 ocorrências de HAS_AUTH em tests/e2e/pages-_.spec.ts (grep -c por arquivo: 29/17/27/13/13/21/16/4/32/10); job e2e em .github/workflows/pr-checks.yml:460-566 restrito a `if: github.event_name == 'workflow_dispatch'` (l.471), environment pr-preview, e NÃO consta em ci-gate.needs (l.711: lint-and-typecheck, test, build, instrucoes-agentes); nas runs recentes (44646906324, 43970155448) 'E2E Tests' = pulado. Projeto page-smoke roda pages-_.spec.ts (playwright.config.ts:67-70) só quando o job executa.
- **Revisão:** sem contestação cética concluída.

### F1986 · k6 smoke executa no CI

- **Tipo:** Teste
- **O que os docs afirmam:** Etapa 90 P: scripts/load/k6-smoke.js pulado sem K6_TARGET_BASE_URL.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:89`
- **O que falta:** Definir a variável K6_TARGET_BASE_URL em Settings > Variables (ou disparar workflow_dispatch com alvo) para o smoke executar; hoje o job passa sem rodar k6.
- **Evidência:** scripts/load/k6-smoke.js:1-30 (alvo real, thresholds) e npm run test:load; job k6-smoke em .github/workflows/pr-checks.yml:416-458 instala k6 v1.8.1 e em l.444-456 faz `exit 0` com ::warning:: quando K6_BASE_URL (vars.K6_TARGET_BASE_URL) está vazio; runs da main 44646906324 (5s) e 44617891245 (9s) indicam pulo — tempo insuficiente para rodar carga. Variável do repo não consultável (gh variable list → HTTP 403 via proxy).
- **Revisão:** sem contestação cética concluída.

### F1996 · Plano 30/08 etapa 63 (P063): Corrigir os 28 testes Deno falhos

- **Tipo:** Teste
- **O que os docs afirmam:** Etapa 63 do plano de 100 etapas (auditoria 30/08; = P063 do handoff): Suíte determinística com mocks explícitos, separando ambiente de defeito real.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:727-727`
- **O que falta:** Corrigir os 2 testes de CORS OPTIONS (process-race-event/index_test.ts e race-commentary/index_test.ts) que reprovam o job `Edge Functions Tests (deno)` em main; atualizar o handoff marcando P063.
- **Evidência:** 93 arquivos _\_test.ts/_.test.ts em supabase/functions; suíte integrada ao CI em dois tiers via scripts/deno-test-suite.mjs:1-20 (unit self-contained reprova; live pula sem secrets) e .github/workflows/pr-checks.yml:367,370 (job `Edge Functions Tests (deno)`); tests/deno-live-tests.json com 9 suítes live. Porém o job está VERMELHO no último push em main (run 44646906324, 20/11 00:34): `process-race-event: OPTIONS returns CORS ... FAILED` e `race-commentary: OPTIONS CORS ... FAILED` (supabase/functions/process-race-event/index_test.ts, race-commentary/index_test.ts); run anterior 44617891245 verde. Handoff ainda marca `[ ] P063` (docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:369). Deno não instalado neste ambiente — não reproduzido localmente.
- **Revisão:** sem contestação cética concluída.

### F1997 · Plano 30/08 etapa 81 (P081): Elevar cobertura unitária nos fluxos P0/P1

- **Tipo:** Teste
- **O que os docs afirmam:** Etapa 81 do plano de 100 etapas (auditoria 30/08; = P081 do handoff): Testes de autorização, cálculo, persistência e falha externa.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:751-751`
- **O que falta:** Listar os fluxos P0/P1 (autorização, cálculo, persistência, falha externa) com os arquivos correspondentes, adicioná-los como prefixos em coverage-ladder-baseline.json e subir pisos (ex.: src/lib/race/ está em 0%).
- **Evidência:** Infra existe: ratchet global (scripts/check-coverage-ratchet.mjs, pr-checks.yml:283) e escada por módulo (coverage-ladder-baseline.json com 9 prefixos; pr-checks.yml:288). Cobertura real medida localmente: lines 8,73% (baseline 4,64%). Não há definição nem relatório de cobertura dos "fluxos P0/P1": `grep -rn 'P0/P1' docs` só retorna o plano/handoff e docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:172 (`\| 81| Cobertura dos fluxos P0/P1 \| P \| piso global 3,99%`); coverage-ladder-baseline.json tem `src/lib/race/: 0`; handoff `[ ] P081` (HANDOFF_CLINE...:397).
- **Revisão:** sem contestação cética concluída.

### F1998 · Plano 30/08 etapa 83 (P083): Triar 483 testes Playwright e estabilizar smoke crítico

- **Tipo:** Teste
- **O que os docs afirmam:** Etapa 83 do plano de 100 etapas (auditoria 30/08; = P083 do handoff): Smoke verde e backlog nominal para skips/falhas.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:753-753`
- **O que falta:** Executar a suíte E2E geral (ao menos o projeto page-smoke) automaticamente em PR/push, não só por dispatch manual (pr-checks.yml:471), e registrar backlog nominal dos 224 skips condicionais.
- **Evidência:** `npx playwright test --list` em HEAD: `Total: 530 tests in 48 files` (não mais 483/46). Smoke crítico quote→sale tem workflow próprio .github/workflows/quote-to-sale-e2e.yml:182 (`--project=quote-to-sale --workers=1`) com 3 últimos runs `success` (43603690837, 43435802928, 43427530170). Porém a suíte E2E geral (chromium-desktop, page-smoke, mobile) só roda por `workflow_dispatch` (pr-checks.yml:471 `if: github.event_name == 'workflow_dispatch'`) e aparece `skipped` nos runs de main 44646906324 e 44617891245; 224 ocorrências de `test.skip(` em tests/e2e; handoff `[ ] P083` (HANDOFF_CLINE...:399).
- **Revisão:** sem contestação cética concluída.

### F1999 · Plano 30/08 etapa 97 (P097): Testes de carga, concorrência e degradação

- **Tipo:** Teste
- **O que os docs afirmam:** Etapa 97 do plano de 100 etapas (auditoria 30/08; = P097 do handoff): Limites conhecidos para filas, RLS, Realtime, storage e APIs externas.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:770-770`
- **O que falta:** Definir a variável K6_TARGET_BASE_URL no repositório (Settings > Variables) para o job k6 executar de fato; versionar relatório de carga; cobrir concorrência/RLS/Realtime/storage ou remover simulate-load (não deployada, sem chamador).
- **Evidência:** Existe scripts/load/k6-smoke.js (thresholds p95/erro; k6-smoke.js:1-30) e package.json:46 `test:load: k6 run scripts/load/k6-smoke.js`; job `k6 Load Smoke` em pr-checks.yml:416-458, mas no run 44617891245 o passo registrou `::warning::K6_TARGET_BASE_URL não definido — smoke de carga documentado, não executado` (exit 0 sem rodar). `ls tests/load` → não existe; `ls scripts/load-test*` → não existe; supabase/functions/simulate-load/index.ts existe mas `grep -w simulate-load .github/workflows/deploy.yml` → 0 (fora da allowlist, não deployada) e sem chamador em src (index.ts:24-26 admite 'Nenhum chamador existe no repo'). Nenhum relatório de carga versionado; handoff `[ ] P097` (HANDOFF_CLINE...:418). Testes de concorrência/RLS/Realtime/storage: ausentes.
- **Revisão:** sem contestação cética concluída.

### F2000 · Playwright anônimo: 34 passam, 3 autenticados pulam

- **Tipo:** Teste
- **O que os docs afirmam:** Suíte Playwright anônima tem 37 testes: 34 passaram e 3 autenticados foram pulados.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:90-90`
- **O que falta:** Rodar o job `E2E Tests` do pr-checks.yml (projetos chromium-desktop/page-smoke/mobile) automaticamente em PRs internas com as credenciais, para que os testes autenticados executem em vez de ficarem skipped.
- **Evidência:** tests/e2e/global-setup.ts:35-56 autentica com E2E_TEST_EMAIL/E2E_TEST_PASSWORD e persiste sessão; tests/e2e/helpers/auth.ts:32-38 `HAS_AUTH` + `skipReason()`; specs usam `test.skip(!HAS_AUTH, skipReason())` (224 ocorrências). No CI, pr-checks.yml:493-513 injeta os secrets (environment pr-preview) e falha se configuração parcial, mas o job e2e só roda com `workflow_dispatch` (pr-checks.yml:471) — `skipped` nos runs de main. Só quote-to-sale-e2e.yml:82-83,182 executa autenticado automaticamente (runs verdes).
- **Revisão:** sem contestação cética concluída.

### F2009 · Script de simulação de carga (load testing)

- **Tipo:** Teste
- **O que os docs afirmam:** Script de Load Testing disponível para stress preventivo.
- **Fontes:** `docs/reports/AUDIT_REPORT.md:52-52`
- **O que falta:** Definir K6_TARGET_BASE_URL (Settings > Variables) para o job k6 rodar de verdade em CI, ou documentar execução manual; decidir destino de supabase/functions/simulate-load (não deployada, sem chamador).
- **Evidência:** Script existe: scripts/load/k6-smoke.js (thresholds, alvo auth health + OPTIONS de edge functions; :1-30) e package.json:46 `test:load: k6 run scripts/load/k6-smoke.js`; job `k6 Load Smoke` em pr-checks.yml:416-458. Porém o job nunca executa k6: log do run 44617891245 → `##[warning]K6_TARGET_BASE_URL não definido — smoke de carga documentado, não executado`. `scripts/load-test*` e `tests/load` não existem (fachadas antigas removidas, k6-smoke.js:1-4); supabase/functions/simulate-load existe no repo mas fora da allowlist deploy.yml:144 (grep → 0) e sem chamador em src. k6 não instalado localmente — não executado aqui.
- **Revisão:** sem contestação cética concluída.

### F2013 · Script npm run lint:complexity com teto 130 avisos

- **Tipo:** Teste
- **O que os docs afirmam:** Fechamento: lint:complexity 130 avisos, teto 130 (TECH_DEBT.md diz teto 126 — divergência).
- **Fontes:** `docs/prod-readiness.md:1044`
- **O que falta:** Reconciliar o teto: atualizar docs/TECH_DEBT.md:10,21 e docs/prod-readiness.md:1057 para 131 (ou reduzir avisos e baixar `--max-warnings` em package.json:26); registrar a regra de que o teto só desce.
- **Evidência:** package.json:26 `lint:complexity ... --max-warnings 131` (não 130 nem 126); execução local: `✖ 131 problems (0 errors, 131 warnings)` exit 0 — exatamente no teto; gate em pr-checks.yml:119 e qa-exhaustive.yml:48. Docs divergem entre si e do código: docs/TECH_DEBT.md:10,21 diz teto 126 (meta -25/trimestre), docs/prod-readiness.md:1057 diz 130 avisos/teto 130. O teto subiu de 126→130→131 em vez de a dívida cair.
- **Revisão:** sem contestação cética concluída.

### F2018 · Script scripts/inventario/gerar-rotas.mjs --check (inventário de rotas em dia)

- **Tipo:** Teste
- **O que os docs afirmam:** O script confere que inventario/estado/rotas.json está em dia, sem imports quebrados nem rota sem arquivo (0 problemas).
- **Fontes:** `docs/prod-readiness.md:30`
- **O que falta:** Rodar `node scripts/inventario/gerar-rotas.mjs` e commitar inventario/estado/rotas.json; opcionalmente adicionar `--check` a pr-checks.yml para o inventário não envelhecer entre as execuções semanais.
- **Evidência:** scripts/inventario/gerar-rotas.mjs:322-329 implementa `--check` (compara bytes com inventario/estado/rotas.json, exit 1 se diferente). Execução em main (HEAD 19/11): `inventario/estado/rotas.json desatualizado: rode node scripts/inventario/gerar-rotas.mjs` → exit 1. Regeneração: `179 URLs, 173 paginas, 169 itens de menu, 821 hooks, 0 problemas` (commitado tem hooks_distintos 789, arquivos_lidos 3; diff 718+/91-). Último commit do JSON: ef8074050 (04/11); AppRoutes.tsx mudou depois (89aacaff8 e seguintes). Nenhum workflow roda `--check` (grep `gerar-rotas` em .github/workflows → só inventario-estado-semanal.yml:74, que regenera semanalmente). scripts/ci/inventario-rotas.unit.mjs:170-175 passa porque compara só a estrutura de URLs, não hooks.
- **Revisão:** sem contestação cética concluída.

### F2019 · Scripts ci/*.unit.mjs de contexto (ai-context-generator, contexto-indice, contexto-publicacao, inventario-banco, inventario-mudou, inventario-rotas, regras-neg…

- **Tipo:** Teste
- **O que os docs afirmam:** Suites unit chamadas por contexto-testes.yml.
- **Fontes:** `docs/AUTOMACAO_LOCAL.md:61-73`
- **O que falta:** Atualizar a asserção em scripts/ci/contexto-indice.unit.mjs:30 para aceitar o sufixo `(coleta YYYY-MM-DD HH:MM UTC)` (ex.: `/\\| ok ·d+ min atrás \(coleta /`). A suíte está vermelha em main; o workflow não é required check (contexto-testes.yml:4).
- **Evidência:** Os 9 arquivos existem em scripts/ci/ (ai-context-generator, contexto-indice, contexto-publicacao, inventario-banco, inventario-mudou, inventario-rotas, regras-negocio, supabase-snapshot, types-sync .unit.mjs) e .github/workflows/contexto-testes.yml:67-77 executa todos com `node --test` (gatilho pull_request/push em main por paths, :8-33). Execução local em main: `# tests 122 / pass 121 / fail 1` → scripts/ci/contexto-indice.unit.mjs:28-31 falha: regex `/\\| ok ·d+ min atrás \\|/` não casa com a saída `ok · 0 min atrás (coleta 2026-11-20 12:02 UTC)` gerada por scripts/regras_negocio/indice.py:206-207 (sufixo introduzido em 25f595037 PR #566, 17/11; o teste não foi atualizado desde ef8074050, 04/11).
- **Revisão:** sem contestação cética concluída.

### F2022 · Simulação Graphify: Arquivo renomeado ou excluído → nenhuma referência residual após atualização

- **Tipo:** Teste
- **O que os docs afirmam:** Cenário de teste planejado antes do rollout; o doc afirma que é desenho de testes, não resultado executado.
- **Fontes:** `docs/planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md:456-480`
- **O que falta:** Adicionar caso em scripts/graphify-local.unit.mjs: gerar grafo, remover/renomear arquivo, `ensure` e assertar que o nó antigo não existe no graph.json; incluir a suíte no CI (ver F2037).
- **Evidência:** Sem teste do cenário: grep -rniE 'renome\|rename\|exclu\|removid\|residual\|deleted' nos testes Graphify → só usos de fs.rename (scripts/graphify-local.unit.mjs:439-441). Mecanismo existe sem teste: .husky/post-commit (bloco graphify-hook) força rebuild completo quando há deleções (`git diff --diff-filter=D` → GRAPHIFY_FORCE=1, comentário 'Arquivos removidos/renomeados precisam de rebuild forcado'); scripts/graphify-local.unit.mjs:172-181 cobre só arquivo NOVO tornando snapshot stale, não remoção/renomeação.
- **Revisão:** sem contestação cética concluída.

### F2025 · Simulação Graphify: Credencial sintética em exemplo/documento → bloqueio de artefato e de envio externo

- **Tipo:** Teste
- **O que os docs afirmam:** Cenário de teste planejado antes do rollout; o doc afirma que é desenho de testes, não resultado executado.
- **Fontes:** `docs/planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md:456-480`
- **O que falta:** Incluir scripts/graphify-local.unit.mjs no `graphify:test`/CI e adicionar varredura de segredo em docs-index.mjs com teste.
- **Evidência:** Bloqueio de artefato testado e no CI: scripts/graphify/extract-code-only.test.mjs:142-150 (erro sensível redigido `[REDACTED]`, nada publicado) e :153-160 (verify-output.mjs detecta `sbp_` após decodificar JSON e falha sem imprimir); scripts/graphify/graphify-utils.test.mjs:70-86 (findSecretSignals/redactSensitiveText/sanitizeMetadata); scripts/graphify/catalog-adapter.test.mjs:20-27 (gaps e Authorization redigidos). Rodam via `graphify:test` (package.json:48) em pr-checks.yml:144 e graphify.yml:50. Bloqueio de envio externo só em scripts/graphify-local.unit.mjs:310-320 (`offline:false` recusado) e :378-384 (segredo do processo pai não chega ao extrator) — suíte não executada por nenhum workflow/npm script (grep 'graphify-local' em .github package.json → só graphify.yml:51 que roda extract-code-only). 'Documento': scripts/graphify/docs-index.mjs não tem detecção de segredo (grep 'sens\|…
- **Revisão:** sem contestação cética concluída.

### F2026 · Simulação Graphify: Cron contém URL/segredo sensível → redação antes de persistir; nunca executar

- **Tipo:** Teste
- **O que os docs afirmam:** Cenário de teste planejado antes do rollout; o doc afirma que é desenho de testes, não resultado executado.
- **Fontes:** `docs/planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md:456-480`
- **O que falta:** Adicionar caso em catalog-adapter.test.mjs com job cujo command contenha URL com token/service_role e assertar `[REDACTED]` no catálogo normalizado.
- **Evidência:** Redação existe: scripts/graphify/catalog-adapter.mjs:127-129 `command: safeText(job.command)` → :33-35 safeText usa redactSensitiveText (graphify-utils.mjs:44). Mas nenhum teste cobre cron com URL/segredo: scripts/graphify/catalog-adapter.test.mjs:15 usa job com `command: 'select cron_job()'` (sem segredo) e não asserta redação do command. 'Nunca executar': adaptador só normaliza JSON (catalog-adapter.mjs:205), sem caminho de execução. Snapshot real de crons (contexto/supabase/cron.md) não é consumido por scripts/graphify.
- **Revisão:** sem contestação cética concluída.

### F2027 · Simulação Graphify: Duas funções homônimas em schemas diferentes → IDs e assinaturas distintos

- **Tipo:** Teste
- **O que os docs afirmam:** Cenário de teste planejado antes do rollout; o doc afirma que é desenho de testes, não resultado executado.
- **Fontes:** `docs/planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md:456-480`
- **O que falta:** Adicionar ao fixture de catalog-adapter.test.mjs duas funções `sync_score` em `public` e `private` e assertar IDs distintos sem erro de duplicata.
- **Evidência:** IDs incluem schema+nome+assinatura: scripts/graphify/catalog-adapter.mjs:83-85 `objectId('function', `${schema}.${name}.${signature}`)`, duplicata lança erro em :27-28; teste scripts/graphify/catalog-adapter.test.mjs:26 asserta `function:public.sync_score.uuid`, mas a fixture tem uma única função (:12) — o cenário 'duas homônimas em schemas diferentes' não é exercitado.
- **Revisão:** sem contestação cética concluída.

### F2028 · Simulação Graphify: Duas worktrees e dois merges simultâneos → saídas isoladas; promoção por SHA

- **Tipo:** Teste
- **O que os docs afirmam:** Cenário de teste planejado antes do rollout; o doc afirma que é desenho de testes, não resultado executado.
- **Fontes:** `docs/planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md:456-480`
- **O que falta:** Incluir graphify-local.unit.mjs no CI e, se houver pipeline de artefato, testar promoção por SHA alvo com dois merges simultâneos.
- **Evidência:** Isolamento local testado em scripts/graphify-local.unit.mjs:265-278 (trava local, dono morto), :280 (lease global/flock), :222-229 (mudança de fonte impede promoção), :416-458 (descritor bloqueia troca concorrente) e scripts/graphify/extract-code-only.test.mjs:107-113 (escopo mutado → não publica, no CI). 'Promoção ordenada por SHA' não existe: .github/workflows/graphify.yml:31-51 não promove artefato algum; scripts/graphify-local.unit.mjs não roda em nenhum workflow (grep 'graphify-local' em .github → só graphify.yml:51, outro script).
- **Revisão:** sem contestação cética concluída.

### F2029 · Simulação Graphify: Falha de parser no meio do lote → cobertura parcial explícita; cache não marca sucesso

- **Tipo:** Teste
- **O que os docs afirmam:** Cenário de teste planejado antes do rollout; o doc afirma que é desenho de testes, não resultado executado.
- **Fontes:** `docs/planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md:456-480`
- **O que falta:** Decidir se falha de parser deve produzir relatório de cobertura parcial (hoje: aborta tudo) e cobrir com teste; incluir graphify-local.unit.mjs no CI.
- **Evidência:** 'Cache não marca sucesso' coberto: scripts/graphify/extract-code-only.test.mjs:142-150 (GRAPHIFY_FIXTURE_ERROR → status ≠ 0, saída não criada; no CI via graphify:test) e scripts/graphify-local.unit.mjs:212-220 (grafo inválido não substitui snapshot anterior), :291-309 (timeout não deixa grafo parcial). 'Cobertura parcial explícita' por falha de parser no meio do lote não é testada: grep -rniE 'parser\|parcial\|cobertura' nos testes → só 'destino incompleto' (:134), 'corpus parcial' (graphify-local.unit:243) e timeout; o wrapper falha fechado (extract-code-only.mjs:92-94) em vez de publicar cobertura parcial.
- **Revisão:** sem contestação cética concluída.

### F2031 · Simulação Graphify: Instalação do hook com Husky presente → sem sobrescrita; CLI funciona sem hook

- **Tipo:** Teste
- **O que os docs afirmam:** Cenário de teste planejado antes do rollout; o doc afirma que é desenho de testes, não resultado executado.
- **Fontes:** `docs/planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md:456-480`
- **O que falta:** Teste que executa `graphify hook install` em fixture com .husky e asserta preservação do conteúdo pré-existente; decidir se o hook em .husky/post-commit deve permanecer versionado (contraria README.md:75).
- **Evidência:** Hook convive com Husky sem sobrescrita: .husky/post-commit:2-4 bloco `graphify-hook-start ... Installed by: graphify hook install` dentro do hook Husky existente (demais hooks .husky/pre-commit, commit-msg, post-checkout intactos). CLI sem hook: .github/workflows/graphify.yml:35 `HUSKY: 0` e :49-51 rodam a CLI; scripts/graphify-local.mjs:216,372,700,730 usam `core.hooksPath=/dev/null`. Nenhum teste automatizado do cenário (grep 'husky\|hook' nos testes → só nó fictício 'hook' em multigraph.test.mjs:29-36). Observação: .husky/post-commit tem `_PINNED='/home/ubuntu/.pyenv/versions/3.12.13/bin/python3.12'` (caminho de uma máquina específica) e docs/graphify/README.md:75 diz para não usar hook automático sem a etapa do plano.
- **Revisão:** sem contestação cética concluída.

### F2032 · Simulação Graphify: MCP aponta para outro banco ou retorna 403 → coleta bloqueada, sem fallback

- **Tipo:** Teste
- **O que os docs afirmam:** Cenário de teste planejado antes do rollout; o doc afirma que é desenho de testes, não resultado executado.
- **Fontes:** `docs/planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md:456-480`
- **O que falta:** Quando existir coletor RO (etapa 21), testar resposta 403/erro de conexão → coleta bloqueada sem fallback.
- **Evidência:** 'Outro banco' coberto: scripts/graphify/catalog-adapter.test.mjs:37-41 recusa projectRef divergente, sessão não read-only e linhas (catalog-adapter.mjs:69-70), no CI via graphify:test. '403 do MCP' não é testável: não existe coletor MCP em scripts/graphify (grep -rniE '403\|MCP\|project_ref' → 0); docs/graphify/README.md:47 confirma que o adaptador só aceita exportação de metadados produzida fora da CLI.
- **Revisão:** sem contestação cética concluída.

### F2034 · Simulação Graphify: Modelo/API indisponível → perfil AST continua independente

- **Tipo:** Teste
- **O que os docs afirmam:** Cenário de teste planejado antes do rollout; o doc afirma que é desenho de testes, não resultado executado.
- **Fontes:** `docs/planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md:456-480`
- **O que falta:** Adicionar asserção explícita (ex.: ambiente sem rede e sem variáveis de API) em extract-code-only.test.mjs de que a extração conclui; incluir graphify-local.unit.mjs no CI.
- **Evidência:** Perfil AST é independente de modelo por construção: scripts/graphify/extract-code-only.mjs:152 chama `extract ... --code-only --no-cluster`; scripts/graphify-local.mjs:711 `--no-cluster`, :717 `cluster-only --no-label --no-viz`, :791 sandbox `unshare user+net`; graphify-local.unit.mjs:310-320 recusa `offline:false`. Nenhuma chave de LLM é lida (grep 'llm\|anthropic\|openai\|semant' em scripts/graphify* → 0). Não há teste que simule API indisponível e asserte sucesso do perfil AST; graphify-local.unit.mjs não roda no CI.
- **Revisão:** sem contestação cética concluída.

### F2035 · Simulação Graphify: Relatório antigo com grafo ausente → aviso, sem inventar resposta

- **Tipo:** Teste
- **O que os docs afirmam:** Cenário de teste planejado antes do rollout; o doc afirma que é desenho de testes, não resultado executado.
- **Fontes:** `docs/planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md:456-480`
- **O que falta:** Incluir `scripts/graphify-local.unit.mjs` no script graphify:test (ou novo passo em graphify.yml/pr-checks.yml).
- **Evidência:** scripts/graphify-local.unit.mjs:128-131 `status` sem grafo → `missing_graph`; :148-160 query/path/explain verificam freshness antes de responder (regeneram em vez de usar grafo velho); :172-181 snapshot `stale`. Suíte passa localmente (26/26) mas não é executada por nenhum workflow nem npm script (package.json:48 `graphify:test` cobre só scripts/graphify/*.test.mjs; grep 'graphify-local' em .github → só graphify.yml:51 com outro script).
- **Revisão:** sem contestação cética concluída.

### F2037 · Simulação Graphify: SHA igual com arquivo local alterado → snapshot identificado como modificado

- **Tipo:** Teste
- **O que os docs afirmam:** Cenário de teste planejado antes do rollout; o doc afirma que é desenho de testes, não resultado executado.
- **Fontes:** `docs/planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md:456-480`
- **O que falta:** Adicionar `scripts/graphify-local.unit.mjs` ao `graphify:test` ou a um passo de graphify.yml.
- **Evidência:** Cenário coberto por scripts/graphify-local.unit.mjs:148-160 (altera src/value.ts sem commit → query reflete v2), :162-170 (hash igual não re-extrai) e :172-181 (arquivo novo → `stale`); fingerprint por conteúdo em graphify-local.mjs:386-401 (`ls-files` + hash). Suíte passa (26/26) mas não roda no CI: package.json:48 `graphify:test` só inclui scripts/graphify/*.test.mjs; grep 'graphify-local.unit' em .github package.json → 0.
- **Revisão:** sem contestação cética concluída.

### F2040 · Smoke de produção (smoke-target-backend, prod-health-check)

- **Tipo:** Teste
- **O que os docs afirmam:** Etapa 99 P: scripts/smoke-target-backend.ts, runbook, scripts/prod-health-check.ts.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:98`
- **O que falta:** Job pós-deploy que rode `npm run smoke:target` com secrets TARGET_* e registre o resultado; reescrever scripts/prod-health-check.ts com createClient(process.env) e checagem real de storage, ou removê-lo.
- **Evidência:** scripts/smoke-target-backend.ts:1-60 (4 fases, exit 1 em falha) e docs/runbooks/smoke-target-backend.md:19-22 existem; package.json:46 `smoke:target`. Nenhum workflow chama o script: grep -rn 'smoke-target-backend\|smoke:target' .github/workflows/ → 0 resultados (docs/estado/12_INFRA_CI_TESTES.md:296 e G_infra_ci_integracoes.md:126 confirmam). scripts/prod-health-check.ts não roda: `npx tsx scripts/prod-health-check.ts` → TypeError em src/integrations/supabase/env.ts:5 (import.meta.env indefinido fora do Vite); além disso `storage:false` (linha 8) nunca é atualizado, logo o 'SYSTEM 10/10' (linha 24) é inalcançável; não há script npm para ele. Nenhum registro de execução assinada encontrado nos docs.| cético: Confirmado: scripts/smoke-target-backend.ts e docs/runbooks/smoke-target-backend.md existem; package.json:46 `smoke:target`. Nenhum workflow chama o script: `grep -rn 'smoke-target\…

### F2041 · Smoke Playwright de 16 rotas (runtime)

- **Tipo:** Teste
- **O que os docs afirmam:** 16 rotas públicas + protegidas testadas em modo signed_out validando redirect seguro.
- **Fontes:** `docs/reports/QA_ONDA_L_FINAL.md:15-39`
- **O que falta:** Fazer o job e2e (page-smoke) rodar de fato em PR interna ou por agendamento.
- **Evidência:** A rodada de 16 rotas foi manual no ambiente Lovable (docs/reports/QA_ONDA_L_FINAL.md:40-55, `LOVABLE_BROWSER_AUTH_STATUS=signed_out`); não existe spec com essas 16 rotas: tests/e2e/smoke.spec.ts tem só 2 testes (linhas 4 e 11). O repo cobre rotas via projeto `page-smoke` (playwright.config.ts:67-69, testMatch pages-_.spec.ts; tests/e2e/pages-navigation.spec.ts:34-36 valida redirect anônimo → /auth em 36 rotas). Porém esse projeto só roda no job `e2e` com `if: github.event_name == 'workflow_dispatch'` (.github/workflows/pr-checks.yml:470) e, nos últimos 40 runs do pr-checks (gh run list), o job `E2E Tests` nunca executou (run 44207386269 por dispatch: todos os jobs skipped exceto detect-changes/k6/CI Gate).| cético: Confirmado: tests/e2e/smoke.spec.ts tem só 2 `test(`; a cobertura de rotas fica no projeto page-smoke (playwright.config.ts:66-70, testMatch pages-_.spec.ts, 10 arquivos test…

### F2043 · sql-tests remoto com secret correto e cobertura ampliada

- **Tipo:** Teste
- **O que os docs afirmam:** pr-checks.yml:327-351 e scripts/run-sql-tests.sh:60-68 pulam porque o secret aponta ao ref errado; cobertura 45 de 406 tabelas.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:37,107`
- **O que falta:** Ampliar supabase/tests/*.sql para as tabelas críticas sem cobertura e definir um piso mínimo na matriz de cobertura.
- **Evidência:** Secret já funciona: job `sql-tests` (.github/workflows/pr-checks.yml:376-400, scripts/run-sql-tests.sh:50-98) executou de fato no run 44617891245 (main, 2026-11-19): log mostra `[sql-tests] remote — rls_test_suite.sql`, `canonical_post_migration_assertions.sql`, `canonical_role_simulation.sql`, `quote-to-sale-stress.sql` (NOTICE seq_before=46733 → seq_after=46783, duplicates=0) e `[sql-tests] ok`. Cobertura NÃO ampliada: `node scripts/sql-coverage-matrix.mjs` → 415 tabelas public, 46 tocadas, 369 sem referência (CI emite ::warning:: idêntico). Ref do banco no secret não verificável (mascarado); run-sql-tests.sh:53 só documenta usyxfpqlsspldubptrdl.| cético: Log do run 44617891245, job 'SQL Suites (static + remote)': `[sql-tests] ok`, então o job remoto roda e passa. A cobertura não foi ampliada (46 de 415 tabelas, segundo o verificador; não contestado).

### F2046 · Suíte de testes: fuzzing + Deno tests + Playwright E2E

- **Tipo:** Teste
- **O que os docs afirmam:** Testes 9/10: fuzzing, testes Deno de edge functions e E2E Playwright abrangentes.
- **Fontes:** `docs/reports/AUDIT_2026-07-13.md:18-18`
- **O que falta:** Rodar chromium-desktop, page-smoke e mobile em CI e fazer os 5 testes FORBIDDEN de quote-to-sale executarem.
- **Evidência:** Fuzz e Deno: existem e rodam no CI (pr-checks.yml:367-370; log run 44617891245 `unit: 84 ok / 0 falhas`, `live: 8 ok / 0 falhas / 1 puladas`). Playwright: 48 specs + playwright.config.ts; só o projeto quote-to-sale roda em PR (quote-to-sale-e2e.yml:4,106,182; run 43603690837 em 2026-11-14: 27 passed / 5 skipped). O job `e2e` geral (chromium-desktop, page-smoke, mobile) é `workflow_dispatch`-only (pr-checks.yml:470) e não executou em nenhum dos últimos 40 runs.| cético: Fuzz e Deno rodam no CI (run 44617891245). No Playwright, só o projeto quote-to-sale roda em PR (.github/workflows/quote-to-sale-e2e.yml:182), e nele os 5 testes FORBIDDEN se pulam em todo run (run 45888694315 de 26/11: `5 skipped`, `27 passed`). chromium-desktop, page-smoke e mobile ficam só no job gated por workflow_dispatch (pr-checks.yml:470, :558), que saiu skipped no run 44948678480.

### F2048 · Suite Deno completa: 573 testes, 28 falhando por legado/integração sem ambiente

- **Tipo:** Teste
- **O que os docs afirmam:** Doc: 545/573 testes Deno aprovados; 28 falham por dependência de ambiente.
- **Fontes:** `docs/auditoria/VALIDACAO_EXAUSTIVA_ONDA_0_2026-08-26.md:17`
- **O que falta:** Trocar o `return` silencioso por `ignore`/skip explícito do Deno, ou por falha, em index.test.ts:306 e :335. Alinhar o secret SUPABASE_SERVICE_ROLE_KEY do CI com o da edge function de produção, para que os 2 testes E2E executem de verdade.
- **Evidência:** A partição unit/live existe: scripts/deno-test-suite.mjs:5-18 e tests/deno-live-tests.json:9-11 (cron-failure-alerter/index.test.ts está no manifesto live, com requer_service_role). Mas supabase/functions/cron-failure-alerter/index.test.ts:306-308 e :335-337 tratam o 401 com console.warn seguido de `return`, sem ignore/t.skip, e por isso o teste conta como aprovado. Confirmado no log do run 44686390684 (20/11/2026): 2 linhas 'E2E skip: cron-failure-alerter retornou 401 …' e depois `ok| 16 passed \| 0 failed`. `grep -rn 'console.warn(.*skip' supabase/functions --include='*test.ts'` → só essas 2 linhas.
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Implementado.

### F2049 · Suíte Deno integrada de cron condicionada a credenciais do workflow

- **Tipo:** Teste
- **O que os docs afirmam:** Suíte Deno integrada de cron aprovada em typecheck; execução viva depende de credenciais isoladas do workflow.
- **Fontes:** `docs/execucao/HARDENING_CANONICO_2026-08-31.md:186-187`
- **O que falta:** Alinhar o secret SUPABASE_SERVICE_ROLE_KEY e fazer o 401 reprovar o teste ou marcá-lo como ignore explícito.
- **Evidência:** Suíte roda de verdade com credenciais: .github/workflows/cron-monitoring.yml:17-21 (schedule diário), :83-89 (deno test com SUPABASE_SERVICE_ROLE_KEY); run 44686390684 (2026-11-20): 'SERVICE_ROLE presente — rodando suite completa', testes fn_cron_* e guard-rails `ok`, `16 passed| 0 failed`. Porém os 2 testes E2E HTTP se auto-pulam com `return` e ficam verdes: supabase/functions/cron-failure-alerter/index.test.ts:306-308 e :335-337; log: 'E2E skip: cron-failure-alerter retornou 401 — SUPABASE_SERVICE_ROLE_KEY do CI diverge do ambiente da edge function'. Também no tier live do pr-checks (manifesto requer_service_role). \| cético: Confirmado: no run 44686390684, os 2 testes E2E logaram 'E2E skip: … retornou 401' e o resumo saiu `ok \| 16 passed \| 0 failed`. O auto-skip silencioso está em supabase/functions/cron-failure-alerter/index.test.ts:306-308 e :335-337.

### F2050 · Suíte Deno recursiva: 543 aprovados, 26 falhas por fixtures/credenciais

- **Tipo:** Teste
- **O que os docs afirmam:** Após correções, suíte Deno recursiva tem 26 falhas que dependem de fixtures/credenciais/Deno.serve no import; não foram mascaradas.
- **Fontes:** `docs/execucao/RECONCILIACAO_GITHUB_SUPABASE_2026-08-31.md:102-123`
- **O que falta:** Substituir os 2 `return` (index.test.ts:308 e :337) por skip/ignore explícito ou por falha, e corrigir o secret de service_role usado no CI.
- **Evidência:** O isolamento por tier está documentado: scripts/deno-test-suite.mjs:5-18 e tests/deno-live-tests.json:2 (`_doc`), com 9 suites e o motivo de cada uma. Porém a afirmação 'não foram mascaradas' falha em supabase/functions/cron-failure-alerter/index.test.ts:306-308 e :335-337: o 401 vira `return` depois do console.warn e o teste conta como aprovado. Log do run 44686390684: 2x 'E2E skip … 401' e `16 passed| 0 failed`.
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Implementado.

### F2052 · Suíte E2E Playwright do fluxo crítico executada

- **Tipo:** Teste
- **O que os docs afirmam:** Etapa 35: rodar playwright do fluxo quote→sale e registrar gaps.
- **Fontes:** `docs/auditoria/00_PLANO_MESTRE_AUDITORIA.md:116`
- **O que falta:** Criar uma segunda conta E2E sem privilégio de ownership, ou um seed via service_role no CI, para que os 5 cenários FORBIDDEN executem em vez de pular.
- **Evidência:** A infraestrutura existe: 23 arquivos tests/e2e/quote-to-sale*.spec.ts e o workflow .github/workflows/quote-to-sale-e2e.yml:3-23 (pull_request com filtro de paths, mais workflow_dispatch). Mas o critério 'executam (não skip) em CI autenticado' não é atendido. O log do run 45888694315 (26/11/2026) mostra 5 testes pulados (`-`): quote-to-sale-api-forbidden.spec.ts:75, quote-to-sale-error-payload-ui.spec.ts:114, quote-to-sale-forbidden.spec.ts:76, quote-to-sale-seq-no-advance.spec.ts:88 e quote-to-sale-validations.spec.ts:162, com resumo `5 skipped / 27 passed`. O próprio veredito inicial registra 27 passed / 5 skipped no run 43603690837. Os skips vêm de tests/e2e/quote-to-sale-api-forbidden.spec.ts:56,95, quote-to-sale-forbidden.spec.ts:57,86, quote-to-sale-error-payload-ui.spec.ts:132,151, quote-to-sale-seq-no-advance.spec.ts:101,114 e quote-to-sale-validations.spec.ts:174: a sessão E2E t…
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Implementado.

### F2053 · Suite E2E Playwright em tests/e2e/

- **Tipo:** Teste
- **O que os docs afirmam:** Testes end-to-end com Playwright.
- **Fontes:** `docs/FEATURE_SUMMARY.md:94-94`
- **O que falta:** Rodar chromium-desktop, page-smoke e mobile em CI, via PR interna ou agendamento.
- **Evidência:** 48 specs em tests/e2e/, playwright.config.ts (testDir tests/e2e, 5 projetos), package.json:25 `test:e2e`. Em CI só o projeto quote-to-sale executa (quote-to-sale-e2e.yml, run 43603690837 success). Os projetos chromium-desktop, page-smoke e mobile-* (22 specs restantes) estão no job `e2e` de pr-checks.yml:460-558 gated por `if: github.event_name == 'workflow_dispatch'` (:470) e nunca executaram nos últimos 40 runs (inclusive o dispatch 44207386269, em que `E2E Tests=skipped`).| cético: Confirmado: pr-checks.yml:470 `if: github.event_name == 'workflow_dispatch'`, e o job E2E Tests saiu skipped até no dispatch 44948678480 (21/11). O único Playwright em PR é quote-to-sale (quote-to-sale-e2e.yml:182), com 5 skips em todo run (run 45888694315).

### F2054 · Suíte E2E total de 483 testes dependente de env ausente no CI

- **Tipo:** Teste
- **O que os docs afirmam:** 483 testes em 46 arquivos; caminhos autenticados dependem de variáveis de ambiente ausentes no CI e são pulados.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:91-91`
- **O que falta:** Executar o job e2e com as credenciais existentes e eliminar os 5 skips de FORBIDDEN com uma conta sem privilégio.
- **Evidência:** Credenciais estão definidas: pr-checks.yml:495-496,525-526,552-553 e quote-to-sale-e2e.yml:82-83,124-125 usam secrets E2E_TEST_EMAIL/E2E_TEST_PASSWORD; o precheck passou e os testes autenticados de quote-to-sale rodaram (run 43603690837: 27 passed / 5 skipped). Mas 40 dos 48 specs têm `test.skip(...)` condicional (ex.: rls-authorization-edge-cases.spec.ts:42, sales-markup-rls-salesperson.spec.ts:53,81) e só rodam no job `e2e` (pr-checks.yml:470, workflow_dispatch-only), que nunca executou. Contagem atual: 256 `test(` em 48 arquivos (não 483/46).| cético: Confirmado: o job e2e completo nunca executou (pr-checks.yml:470; run 44948678480 com E2E Tests skipped). Mesmo com as credenciais E2E válidas no quote-to-sale, 5 testes autenticados de FORBIDDEN são pulados em todo run (run 45888694315: `5 skipped`).

### F2064 · Testes de autorização não se auto-pulam

- **Tipo:** Teste
- **O que os docs afirmam:** 8 testes de autorização se auto-pulam; credenciais de CI inválidas desligam suítes live.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:139`
- **O que falta:** Criar um secret de conta E2E sem privilégio (ou seed por service_role) e transformar esses skips em falha no CI; rodar o job e2e chromium-desktop.
- **Evidência:** Os testes de autorização continuam se auto-pulando: tests/e2e/rls-authorization-edge-cases.spec.ts:42 `test.skip(!HAS, ...)` (HAS = VITE_SUPABASE_URL && PUBLISHABLE_KEY, :14-16), security-definer-rpc-access.spec.ts:70 `test.skip(!HAS_PG|\| !HAS_HTTP)`, sales-markup-rls-salesperson.spec.ts:53,81 (skipReason em helpers/auth.ts:34-36). Esses specs pertencem ao projeto chromium-desktop, que só roda no job `e2e` de pr-checks.yml:470 (`workflow_dispatch` apenas) — nunca executado nos últimos 40 runs. Secrets E2E existem no repo (quote-to-sale autenticou com sucesso no run 43603690837), mas se a conta E2E é 'sem privilégio' não é verificável (segredo). \| cético: Confirmado e reforçado. Além dos specs chromium-desktop que nunca rodam (pr-checks.yml:470), os testes de autorização que rodam em CI se pulam em todo run: no run 45888694315 (26/11) os 5 cenários FORBIDDEN de quote-to-sale saem `-` (…

### F2065 · Testes Deno completos: 545 aprovados e 28 reprovados

- **Tipo:** Teste
- **O que os docs afirmam:** Testes Deno completos reprovados (545 ok / 28 falhas); testes compartilhados 95 ok / 1 falha.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:84-85`
- **O que falta:** Corrigir ou mover para quarentena as 2 suites live que reprovam em main (process-race-event/index_test.ts e race-commentary/index_test.ts — asserção 'OPTIONS returns CORS' contra a função deployada), para o job deno-tests voltar a verde; receive-quote-sync/index.test.ts é pulada por credencial inválida/ausente no secret do repo.
- **Evidência:** Suíte Deno existe e roda em CI: .github/workflows/pr-checks.yml:335-370 (job deno-tests → node scripts/deno-test-suite.mjs --mode unit/live); scripts/deno-test-suite.mjs:1-24 (tiers unit/live); tests/deno-live-tests.json (manifesto live). Resultado real do último run em main (gh run 44646906324, 20/11/2026, job 'Edge Functions Tests (deno)'): 'unit: 84 ok / 0 falhas'; 'live: 6 ok / 2 falhas / 1 puladas por credencial' — falhas em supabase/functions/process-race-event/index_test.ts e supabase/functions/race-commentary/index_test.ts (teste 'OPTIONS returns CORS' FAILED contra a edge deployada), job concluído com failure. Execução local (npx deno 2.9.0): 24 ok / 60 falhas, todas as 60 por 'unsuccessful tunnel' ao baixar https://deno.land/std@0.224.0 (proxy), não por asserção. A contagem '545/28' é snapshot de 30/08 e não vale mais.
- **Revisão:** sem contestação cética concluída.

### F2066 · Testes Deno por function (90 arquivos/31 dirs)

- **Tipo:** Teste
- **O que os docs afirmam:** Etapa 86 P; job deno-tests.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:85`
- **O que falta:** Cobertura por function continua parcial: ~140 das 171 pastas em supabase/functions/ não têm nenhum *_test.ts; o job deno-tests ainda termina em failure por 2 suites live (ver F2065).
- **Evidência:** find supabase/functions -name '_\_test.ts' -o -name '_.test.ts' → 93 arquivos em 32 diretórios (inclui _shared); 171 pastas de functions. Job deno-tests em .github/workflows/pr-checks.yml:335-370 executa toda a suíte via scripts/deno-test-suite.mjs; tier unit = 84 suites ok no run 44646906324 (main, 20/11/2026). Suíte está integrada ao CI, mas apenas ~31 functions têm teste próprio.
- **Revisão:** sem contestação cética concluída.

### F2073 · tests/e2e/global-setup.ts grava session.json e faz return silencioso sem credenciais

- **Tipo:** Teste
- **O que os docs afirmam:** global-setup.ts:62-73 escreve tests/e2e/.auth/session.json; linhas 41-49 fazem console.warn e return (não falham) quando faltam E2E_TEST_EMAIL/PASSWORD/URL/ANON/PROJECT_ID.
- **Fontes:** `docs/estado/12_INFRA_CI_TESTES.md:83-84`
- **O que falta:** Em tests/e2e/global-setup.ts:41-49, lançar erro quando process.env.CI estiver definido e as credenciais faltarem (manter warn+return só em execução local), para o gate não depender apenas do passo shell do pr-checks.yml.
- **Evidência:** Comportamento descrito continua: tests/e2e/global-setup.ts:41-49 — se faltar E2E_TEST_EMAIL/PASSWORD/VITE_SUPABASE_URL/PUBLISHABLE_KEY/PROJECT_ID faz console.warn e `return` (não lança); :62-73 grava tests/e2e/.auth/session.json. Mitigação existe só no workflow: .github/workflows/pr-checks.yml:500-515 reprova (exit 1) com secrets parciais e pula com ::warning:: quando nenhum existe; :518-540 roda scripts/e2e-precheck.mjs e reprova credencial inválida.
- **Revisão:** sem contestação cética concluída.

### F2086 · 14 vulnerabilidades npm sanadas

- **Tipo:** Workflow CI
- **O que os docs afirmam:** P086 P: npm audit fora dos obrigatórios.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:176`
- **O que falta:** npm audit não está limpo em devDependencies (6 moderadas em glob/minimatch via vite-plugin-pwa e eslint); aguardar bump upstream ou aplicar overrides em package.json; o job npm audit continua fora dos required checks do ruleset.
- **Evidência:** npm audit --omit=dev --audit-level=high (mesmo comando de .github/workflows/pr-checks.yml:217-218, job 'npm audit' fora dos required checks conforme comentário :192-195) → 'found 0 vulnerabilities', EXIT=0. npm audit completo (com devDependencies) → '6 moderate severity vulnerabilities' (glob 9.0.0-14.0.1 e minimatch 7.0.0-11.0.0 via workbox-build/vite-plugin-pwa e eslint/@eslint/config-array), EXIT=1; fix exige vite-plugin-pwa@1.1.0 (downgrade breaking).
- **Revisão:** sem contestação cética concluída.

### F3691 · actionlint, zizmor, dependency-review e CodeQL para actions

- **Tipo:** Workflow CI
- **O que os docs afirmam:** Nenhum existe.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:59`
- **O que falta:** Workflow com actionlint; workflow que rode zizmor; incluir 'actions' nas linguagens do CodeQL (codeql.yml:41).
- **Evidência:** .github/workflows/dependency-review.yml:8-9,32-34 (dependency-review-action em pull_request para main, fail-on-severity high); .github/workflows/codeql.yml:16-17 (schedule '23 4 * * 1') mas codeql.yml:41 'languages: javascript-typescript' (sem 'actions'). actionlint ausente: grep -rln actionlint .github/workflows → 0 resultados. zizmor só em comentários de supressão (contexto.yml:310, inventario-estado-semanal.yml:43, types-sync.yml:143), nenhum workflow o executa.
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Não implementado.

### F2093 · Baseline Deno typecheck zerada (58 diagnósticos)

- **Tipo:** Workflow CI
- **O que os docs afirmam:** Etapa 43 P.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:47`
- **O que falta:** Corrigir os 53 diagnósticos TS listados em scripts/deno-typecheck-baseline.json (ai-copilot, lead-scoring, predictive-scoring-explain, process-race-event etc.) e rodar `node scripts/check-deno-types.mjs --update-baseline` até ficar [].
- **Evidência:** scripts/deno-typecheck-baseline.json: `diagnostics.length` = 53 (node -e) — baseline não está vazia (caiu de 58 para 53). Gate ratchet em pr-checks.yml:325-326.
- **Revisão:** sem contestação cética concluída.

### F2094 · Branch protection clássica da main: 4 status checks, strict, sem force-push/deleção

- **Tipo:** Workflow CI
- **O que os docs afirmam:** Exige Lint & Type Check, Unit Tests, Build Check, Edge Functions Lint (deno); strict:true; allow_force_pushes:false; allow_deletions:false; enforce_admins:false.
- **Fontes:** `docs/agentes/github-ci.md:18-23`
- **O que falta:** Alinhar: ativar 'Require branches to be up to date' (strict) na branch protection clássica ou corrigir docs/agentes/github-ci.md:21 para `strict: false`.
- **Evidência:** GET /repos/adm01-debug/Promo_Champions_V2.1/branches/main/protection (via MCP GitHub): contexts = ['Lint & Type Check','Unit Tests','Build Check','Edge Functions Lint (deno)'] ✓; allow_force_pushes=false ✓; allow_deletions=false ✓; enforce_admins=false ✓; MAS `required_status_checks.strict` = false, enquanto docs/agentes/github-ci.md:21 afirma `strict: true`. Ruleset 22148182: CI Gate, strict false, deletion+non_fast_forward.
- **Revisão:** sem contestação cética concluída.

### F2095 · Bundle budget 2.423 KiB gzip em 414 chunks aprovado

- **Tipo:** Workflow CI
- **O que os docs afirmam:** Bundle budget aprovado (2.423,0 KiB gzip em 414 chunks), mas chunks grandes como App e WinLoss não têm budget próprio.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:86-94`
- **O que falta:** Adicionar budgets por chunk de página (App, WinLoss e demais grandes) em BUDGETS_KB ou um teto genérico para chunks untracked em scripts/check-bundle-budget.mjs.
- **Evidência:** Gate existe: pr-checks.yml:660 (ANALYZE_BUNDLE=1 npm run build) e :668 (node scripts/check-bundle-budget.mjs). Porém scripts/check-bundle-budget.mjs:18-42 só define budget para chunks `vendor-*` e `__entry__`; chunks sem bucket caem em `bucketFor` → null e são marcados '⚪ untracked' (linhas 89-91) sem nunca reprovar. Nenhuma entrada para App/WinLoss (grep WinLoss em scripts/check-bundle-budget.mjs e vite.config.ts → 0).
- **Revisão:** sem contestação cética concluída.

### F2096 · Bundler do CI classifica erros TypeScript das Edges como warning

- **Tipo:** Workflow CI
- **O que os docs afirmam:** O bundler atual classifica erros TypeScript como warning e só falha por import; o CI pode aceitar as 38 quebras.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:293-293`
- **O que falta:** Zerar scripts/deno-typecheck-baseline.json e fazer check-deno-types.mjs falhar em qualquer diagnóstico (ou tratar failureKind 'typecheck' como falha em bundle-edge-functions.ts:157-174).
- **Evidência:** scripts/bundle-edge-functions.ts:36-39 e 83-94: `classifyFailure` devolve 'typecheck' para erros TS e só 'import' falha o CI (:157-174, legenda 't' = typecheck-only warning). Mitigação parcial: pr-checks.yml:325-326 roda scripts/check-deno-types.mjs, que reprova apenas diagnóstico FORA da baseline (53 erros tolerados, scripts/check-deno-types.mjs:118-151).
- **Revisão:** sem contestação cética concluída.

### F2097 · Canal de alerta de falha de CI (SLACK_CI_WEBHOOK_URL / N8N)

- **Tipo:** Workflow CI
- **O que os docs afirmam:** SLACK_CI_WEBHOOK_URL não existe; 5 workflows vermelhos todo dia sem aviso.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:139`
- **O que falta:** Criar o secret N8N_ALERT_WEBHOOK_URL (e opcionalmente N8N_ALERT_WEBHOOK_SECRET / SLACK_CI_WEBHOOK_URL) em Settings → Secrets do repo; sem ele nenhuma falha gera notificação.
- **Evidência:** Workflows existem: .github/workflows/ci-failure-alert.yml:8-39 (workflow_run em 19 workflows, branch main/tags) e :52-104 (POST para N8N_ALERT_WEBHOOK_URL); codeql.yml:61 e cron-monitoring.yml:109 usam SLACK_CI_WEBHOOK_URL. Porém a lista de secrets do repo (GitHub API, 10 secrets) NÃO contém N8N_ALERT_WEBHOOK_URL nem SLACK_CI_WEBHOOK_URL → step cai em 'não configurado — pulando alerta' (ci-failure-alert.yml:83-84; codeql.yml:68-69).
- **Revisão:** sem contestação cética concluída.

### F2098 · check-deno-types bloqueia qualquer erro

- **Tipo:** Workflow CI
- **O que os docs afirmam:** Etapa 44 P: ratchet (pr-checks.yml:276-277) bloqueia só erro novo.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:48`
- **O que falta:** Baseline vazia (corrigir os 53 erros) — a partir daí o ratchet equivale a bloquear qualquer erro.
- **Evidência:** scripts/check-deno-types.mjs:118-157: compara fingerprints com a baseline e só `process.exit(1)` quando há diagnóstico FORA dela (:141-151); 53 erros legados passam (scripts/deno-typecheck-baseline.json). Invocado em pr-checks.yml:325-326.
- **Revisão:** sem contestação cética concluída.

### F2099 · check:data-layer e check:domain-boundaries no CI

- **Tipo:** Workflow CI
- **O que os docs afirmam:** package.json:33-34 e scripts/baselines/*.txt (134 e 70 entradas); nenhum workflow chama.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:125`
- **O que falta:** Adicionar steps `npm run check:data-layer` e `npm run check:domain-boundaries` no job lint-and-typecheck de .github/workflows/pr-checks.yml.
- **Evidência:** Scripts existem: package.json `check:data-layer` → scripts/check-data-layer.mjs e `check:domain-boundaries` → scripts/check-domain-boundaries.mjs; scripts/baselines/ existe. `grep -rn 'check:data-layer\\|check:domain-boundaries\\|check-data-layer\\|check-domain-boundaries' .github/workflows/ .husky/` → 0 resultados: nenhum workflow nem hook chama.
- **Revisão:** sem contestação cética concluída.

### F3692 · CI principal reprovado/bloqueado antes dos steps

- **Tipo:** Workflow CI
- **O que os docs afirmam:** Execuções recentes do CI encerradas antes dos steps por orçamento/infraestrutura; E2E histórico 92 falharam, 382 pularam, 9 passaram.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:88-89`
- **O que falta:** E2E crítico executando (e verde) em main/PR de forma automática; hoje o job e2e só roda por workflow_dispatch (pr-checks.yml:468) e não há evidência de E2E verde na main.
- **Evidência:** O bloqueio 'antes dos steps' não se reproduz hoje: pr-checks.yml:8-12 roda em push:main e 'gh run list -w pr-checks.yml -b main -e push -L 5' → 5 execuções 'success' (46170328166 de 2026-11-28, 46166643535, 45915846195, 45912631645, 45904886856). Porém o E2E não roda automaticamente: job e2e em pr-checks.yml:460-468 tem "if: github.event_name == 'workflow_dispatch'" (nem em PR nem em push:main), e quote-to-sale-e2e.yml:3-5 só dispara em pull_request com paths.
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Não implementado.

### F2102 · Convenção: nunca editar migration histórica já aplicada

- **Tipo:** Workflow CI
- **O que os docs afirmam:** Correções vão em arquivo novo; migration aplicada não é editada. Regra mecânica — NÃO verificada.
- **Fontes:** `docs/SCHEMA_CONVENTIONS.md:51`
- **O que falta:** Regra em scripts/check-migrations.mjs (modo --base) que falhe quando `git diff --diff-filter=M` toque arquivo existente em supabase/migrations/, e ligar o modo --base no pr-checks.
- **Evidência:** Convenção documentada em docs/SCHEMA_CONVENTIONS.md:51, mas violada na prática e sem guard: `git log --diff-filter=M -- supabase/migrations/` mostra cf25752e7 (2026-11-17, +13 linhas em 20260715184427_…sql, versão que consta como aplicada em contexto/supabase/migrations.md), af22304fa (2026-10-18) editando 20260522130044, e 3 commits (2dd0eff12, 18aadd0f5, 8999bdec9) editando 20261014000002 — todas aplicadas. scripts/check-migrations.mjs:10-23 só valida ARQUIVOS NOVOS com --base; não reprova modificação de migration existente.
- **Revisão:** sem contestação cética concluída.

### F2103 · corsHeaders centralizado com lint que quebra build se duplicado

- **Tipo:** Workflow CI
- **O que os docs afirmam:** Constraint enforça corsHeaders centralizado em _shared/cors.ts; lint quebra build se duplicado.
- **Fontes:** `docs/reports/BACKEND_DEEP_AUDIT_2026-07-11.md:156-158`
- **O que falta:** Criar script em scripts/ci/ que falhe quando index.ts define corsHeaders fora de _shared, ligar em pr-checks.yml e migrar as 134 funções para `import { corsHeaders } from '../_shared/cors.ts'`.
- **Evidência:** supabase/functions/_shared/cors.ts existe (4625 bytes), mas 134 edge functions definem `const corsHeaders =` próprio (grep -rln em supabase/functions/*/index.ts, ex.: personal-assistant-stream, semantic-search, analyze-conversation). Nenhum lint/teste: `grep -rln corsHeaders scripts/ tests/ supabase/tests/ .github/workflows/` → só scripts/ai-context/cenarios.mjs (gerador de contexto, não gate). A afirmação 'lint quebra build se duplicado' (docs/reports/BACKEND_DEEP_AUDIT_2026-07-11.md:156-158) não tem artefato.
- **Revisão:** sem contestação cética concluída.

### F2105 · D7: runs de push:main cancelados por grupo de concorrência

- **Tipo:** Workflow CI
- **O que os docs afirmam:** concurrency sem github.sha descarta run pendente anterior.
- **Fontes:** `docs/estado/PLANO_CI_WORKFLOWS_2026-10-01.md:16,124`
- **O que falta:** Nesses 6 workflows, usar group com github.sha em push (ex.: `${{ github.event_name == 'push' && github.sha|\| github.ref }}`).
- **Evidência:** main.yml:27-29 já usa `group: ci-main-${{ github.sha }}` (D7 corrigido ali). Porém pr-checks.yml:21-23 (`group: ${{ github.workflow }}-${{ github.ref }}`, cancel-in-progress só em PR) e edge-functions-bundle.yml:29, edge-functions-request-id.yml:29, edge-functions-input-validation.yml:29, migrations-drift.yml:33, graphify.yml:27 mantêm group por ref em push:main — o GitHub só guarda 1 run pendente por grupo, cenário descrito em docs/estado/PLANO_CI_WORKFLOWS_2026-10-01.md:16.
- **Revisão:** sem contestação cética concluída.

### F2106 · debt:report, graphify:* e a11y:report no CI

- **Tipo:** Workflow CI
- **O que os docs afirmam:** package.json:37,46-53: scripts nunca chamados pelo CI.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:127`
- **O que falta:** Workflow agendado (schedule) que rode `npm run debt:report` e `npm run a11y:report` e publique via actions/upload-artifact.
- **Evidência:** graphify:test roda em pr-checks.yml:144 e graphify.yml:50 ✓; a11y-sweep.yml:57-60 roda axe sweep (equivalente a a11y:sweep) em PRs de UI ✓. `grep -rn 'debt:report\\|debt-report\\|a11y:report' .github/workflows/` → 0 resultados: debt:report (package.json → scripts/debt-report.mjs) nunca roda em CI e não há workflow agendado publicando artefato.
- **Revisão:** sem contestação cética concluída.

### F2108 · Erros strict zerados (882 front, 58 Deno)

- **Tipo:** Workflow CI
- **O que os docs afirmam:** 882 erros strict no front e 58 no Deno.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:292`
- **O que falta:** Reduzir as duas baselines a zero (882 erros strict no front por arquivo em byFileAndCode; 53 no Deno) e então promover as flags strict para tsconfig.app.json.
- **Evidência:** scripts/typecheck-baseline.json: `total: 882` (geradoEm 2026-10-01, tsconfig.strict.json) — não zerado; scripts/deno-typecheck-baseline.json: 53 diagnósticos. Gates ratchet em pr-checks.yml:133 (typecheck:baseline) e :326 (check-deno-types).
- **Revisão:** sem contestação cética concluída.

### F2113 · Etapa 042 (CI): Workflow reutilizável .github/workflows/_notify.yml (workflow_call)

- **Tipo:** Workflow CI
- **O que os docs afirmam:** Chamado por cron-monitoring, qa-exhaustive e codeql em if: failure().
- **Fontes:** `docs/execucao/PLANO_WORKFLOWS_GITHUB_ACTIONS_100_ETAPAS_2026-09-27.md:114`
- **O que falta:** Extrair .github/workflows/_notify.yml (workflow_call) e chamar nos 3 workflows; criar o secret SLACK_CI_WEBHOOK_URL (ou apontar para N8N_ALERT_WEBHOOK_URL) para a notificação disparar de fato.
- **Evidência:** `ls .github/workflows/_*` → 0; `grep -rln workflow_call .github/workflows/` → 0: _notify.yml não existe. A notificação existe inline e duplicada nos 3 workflows: cron-monitoring.yml:100-105, qa-exhaustive.yml:164-169, codeql.yml:52-57 (job notify-failure, if: failure()), todos dependentes de SLACK_CI_WEBHOOK_URL, que não está na lista de secrets do repo (GitHub API) → pulam.
- **Revisão:** sem contestação cética concluída.

### F2115 · Etapa 062 (CI): setup-node com cache-dependency-path e node-version-file .nvmrc

- **Tipo:** Workflow CI
- **O que os docs afirmam:** Criar .nvmrc = 22.
- **Fontes:** `docs/execucao/PLANO_WORKFLOWS_GITHUB_ACTIONS_100_ETAPAS_2026-09-27.md:137`
- **O que falta:** Trocar node-version: '22' por node-version-file: '.nvmrc' nos steps de setup-node de pr-checks.yml, deploy.yml, main.yml, graphify.yml, qa-exhaustive.yml, quote-to-sale-e2e.yml, a11y-sweep.yml (e decidir automation-local.yml, que usa Node 24); adicionar cache-dependency-path nos steps que têm cache: npm sem ele (main.yml:46, quote-to-sale-e2e.yml, a11y-sweep.yml, types-sync.yml:170).
- **Evidência:** .nvmrc existe e está versionado com `22` (`git ls-files .nvmrc`; `cat .nvmrc` → 22). node-version-file: '.nvmrc' usado só em .github/workflows/contexto.yml:132, contexto-testes.yml:62, inventario-estado-semanal.yml:57, types-sync.yml:66 e :169. Os demais 20+ steps de setup-node continuam com node-version: '22' hardcoded (pr-checks.yml:81,104,182,210,235,394,483,583,614,652; deploy.yml:74; main.yml:45; graphify.yml:41; qa-exhaustive.yml:30; quote-to-sale-e2e.yml:48,73,114; a11y-sweep.yml:39) e automation-local.yml:35 usa '24'. cache-dependency-path: package-lock.json presente em 10 steps (graphify.yml:43, deploy.yml:76, pr-checks.yml:106,212,237,485,585,616,654, qa-exhaustive.yml:32).
- **Revisão:** sem contestação cética concluída.

### F3693 · Etapa 082 (CI): Workflow migrations-check.yml validando versão crescente e cabeçalho

- **Tipo:** Workflow CI
- **O que os docs afirmam:** Sem aplicar nada.
- **Fontes:** `docs/execucao/PLANO_WORKFLOWS_GITHUB_ACTIONS_100_ETAPAS_2026-09-27.md:163`
- **O que falta:** Validação de cabeçalho/comentário descritivo obrigatório nas migrations novas em scripts/check-migrations.mjs.
- **Evidência:** Sem arquivo migrations-check.yml, mas o gate existe como job: .github/workflows/pr-checks.yml:165-190 (migrations-gate roda 'node scripts/check-migrations.mjs --base origin/<base_ref>' em PR); scripts/check-migrations.mjs:4-16 valida nome, versões únicas, não-vazia, versão estritamente crescente em arquivo novo (linhas 10-12), RLS em CREATE TABLE e literais proibidos. Também em deploy.yml:106-111. Cabeçalho descritivo não é validado: grep -n -i 'cabe\\|header\\|coment' scripts/check-migrations.mjs → só a regra de migration vazia (linhas 8, 92).
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Não implementado.

### F3694 · Etapa 085 (CI): Workflow de rollback workflow_dispatch com function_name + git_sha

- **Tipo:** Workflow CI
- **O que os docs afirmam:** Só se etapa 79 = a.
- **Fontes:** `docs/execucao/PLANO_WORKFLOWS_GITHUB_ACTIONS_100_ETAPAS_2026-09-27.md:166`
- **O que falta:** Input function_name para redeploy de uma única function numa SHA anterior; confirmar secret SUPABASE_ACCESS_TOKEN no environment production (NÃO VERIFICADO: 'gh secret list -e production' → HTTP 403 do proxy).
- **Evidência:** rollback-function.yml ausente (ls .github/workflows → não existe). Rollback possível via .github/workflows/deploy.yml:32-37 (workflow_dispatch com input 'ref' = branch/tag/SHA) + deploy.yml:124-125 (checkout da ref) + loop de deploy da allowlist (deploy.yml:144-150) — redeploya TODAS as 100 functions, sem input function_name; e o step sai com exit 0 se SUPABASE_ACCESS_TOKEN faltar (deploy.yml:135-138).
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Não implementado.

### F2116 · Etapa 086 (CI): Smoke pós-deploy com scripts/smoke-target-backend.ts via workflow_run

- **Tipo:** Workflow CI
- **O que os docs afirmam:** Falha com alerta (etapa 41).
- **Fontes:** `docs/execucao/PLANO_WORKFLOWS_GITHUB_ACTIONS_100_ETAPAS_2026-09-27.md:167`
- **O que falta:** Criar workflow com `on: workflow_run: workflows: ['Deploy Pipeline'] types: [completed]` que rode `npm run smoke:target` com TARGET_SUPABASE_URL/ANON_KEY/SMOKE_EMAIL/PASSWORD como secrets e falhe/alerte (via ci-failure-alert ou N8N) quando o smoke reprovar.
- **Evidência:** Script existe: scripts/smoke-target-backend.ts:1-14 (4 fases: conectividade, login, RLS, dados; exit 1 em falha) e package.json:46 `smoke:target`. Nenhum workflow o chama: `grep -rn smoke-target-backend .github/` → 0 resultados. O único workflow_run do repo é ci-failure-alert.yml:9 (alerta N8N), não smoke. deploy.yml:177-186 faz só um curl na function `health` que nunca falha (::warning::).
- **Revisão:** sem contestação cética concluída.

### F2121 · Etapa 44 do plano: Tornar check de tipos bloqueante no CI

- **Tipo:** Workflow CI
- **O que os docs afirmam:** Falhar por qualquer erro TS, sintaxe, import não versionado ou byte de controle. Saída esperada: teste negativo do workflow. Gate: nenhum.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:712-712`
- **O que falta:** Incluir edge-functions-lint no needs do ci-gate (ou mover o step check-deno-types para lint-and-typecheck) para o deno check reprovar merge; zerar a baseline de 58 erros legados; registrar um teste negativo (PR com erro TS proposital reprovada) como evidência.
- **Evidência:** tsc bloqueante: pr-checks.yml:122 `npm run typecheck` no job lint-and-typecheck, que está no needs do ci-gate (pr-checks.yml:711). Deno: pr-checks.yml:329-331 roda `node scripts/check-deno-types.mjs` (ratchet por fingerprint, falha fechado — scripts/check-deno-types.mjs:3-16, baseline de 58 erros legados em scripts/deno-typecheck-baseline.json) dentro do job edge-functions-lint, que é declaradamente informativo e FORA do ci-gate (pr-checks.yml:708-711). Não há teste negativo do workflow: `grep -rn -i 'teste negativo\\|negative' .github/` → 0 resultados.
- **Revisão:** sem contestação cética concluída.

### F2122 · Etapa 59: security-audit fora dos required checks, abrir issue automática quando falhar em main

- **Tipo:** Workflow CI
- **O que os docs afirmam:** Observabilidade de audit.
- **Fontes:** `docs/estado/PLANO_CI_WORKFLOWS_2026-10-01.md:111`
- **O que falta:** Adicionar step (github-script) no job security-audit com `if: failure() && github.event_name == 'push'` que abra/atualize issue com label security-audit, no padrão de types-sync.yml:119-135, ou fazer o ci-failure-alert abrir issue além do webhook.
- **Evidência:** security-audit fora dos required checks: pr-checks.yml:192-194 (comentário) e :704-711 (ci-gate não depende dele); job roda `npm audit --omit=dev --audit-level=high` (pr-checks.yml:217-218) também em push:main (pr-checks.yml:9-10). Issue automática: ausente — `grep -rn 'issues.create' .github/workflows/` só retorna types-sync.yml:135,207 (alerta de types). O que existe para falha em main é ci-failure-alert.yml:9-37 (workflow_run de 'PR Checks' em main) que faz POST para webhook N8N (`curl … $N8N_ALERT_WEBHOOK_URL`) e sai verde sem o secret.
- **Revisão:** sem contestação cética concluída.

### F2123 · Etapa 71: node-version-file: .nvmrc em vez de 22 hardcoded

- **Tipo:** Workflow CI
- **O que os docs afirmam:** .nvmrc existe com 22.
- **Fontes:** `docs/estado/PLANO_CI_WORKFLOWS_2026-10-01.md:131`
- **O que falta:** Substituir node-version: '22' por node-version-file: '.nvmrc' nos 19 steps listados (pr-checks, deploy, main, graphify, qa-exhaustive, quote-to-sale-e2e, a11y-sweep) e alinhar automation-local.yml.
- **Evidência:** .nvmrc = 22 versionado. node-version-file: '.nvmrc' em contexto.yml:132, contexto-testes.yml:62, inventario-estado-semanal.yml:57, types-sync.yml:66,169. node-version: '22' hardcoded permanece em pr-checks.yml (10 steps: 81,104,182,210,235,394,483,583,614,652), deploy.yml:74, main.yml:45, graphify.yml:41, qa-exhaustive.yml:30, quote-to-sale-e2e.yml:48,73,114, a11y-sweep.yml:39; automation-local.yml:35 usa '24'.
- **Revisão:** sem contestação cética concluída.

### F2125 · Etapa 84 do plano: Executar E2E autenticado no CI

- **Tipo:** Workflow CI
- **O que os docs afirmam:** Contas/fixtures isoladas, secrets protegidos e cleanup; falhar quando auth não estiver configurada. Saída esperada: fluxos críticos não pulados. Gate: ambiente de teste.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:764-764`
- **O que falta:** Ligar o job e2e de pr-checks.yml a pull_request internas (não só workflow_dispatch) ou agendá-lo; fazer ausência total de secrets reprovar em push:main (hoje só warning); isolar fixtures em projeto/conta de teste em vez do banco de produção compartilhado.
- **Evidência:** E2E autenticado roda em CI para a suíte quote-to-sale: quote-to-sale-e2e.yml:3-24 (pull_request por paths) job e2e-quote-to-sale (:99-184) com environment pr-preview, secrets E2E_TEST_EMAIL/PASSWORD (:124-125), config parcial → exit 1 (:136-137), credencial inválida → exit 1 (:163), `npx playwright test --project=quote-to-sale --workers=1` (:182); run real 43603690837 (14/11/2026) com step 'Playwright — quote-to-sale specs=success'. Cleanup: tests/e2e/quote-to-sale-cleanup-contract.spec.ts; login em tests/e2e/global-setup.ts (playwright.config.ts:13). Porém o job e2e de pr-checks.yml (projects chromium-desktop, page-smoke, mobile — core-flows, pipeline-flows, pages-*.spec) só roda em `workflow_dispatch` (pr-checks.yml:471) e saiu 'skipped' no último push:main (run 44646906324); ausência total de secrets vira skip verde (pr-checks.yml:510-512), não falha; a suíte usa o projeto de produçã…
- **Revisão:** sem contestação cética concluída.

### F2126 · Etapa 87 do plano: Endurecer supply chain

- **Tipo:** Workflow CI
- **O que os docs afirmam:** Resolver 15 vulnerabilidades, pin Deno/npm, SBOM, Dependabot e gitleaks em pre-receive/CI. Saída esperada: zero crítica/alta sem aceite. Gate: upgrades avaliados.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:767-767`
- **O que falta:** Adicionar gitleaks (action pinada) em pr-checks ou workflow próprio; gerar SBOM (ex.: anchore/sbom-action) no deploy/release; tornar security-audit bloqueante ou registrar aceite formal das vulnerabilidades remanescentes; documentar o resultado atual do npm audit.
- **Evidência:** Existe: .github/dependabot.yml:1-30 (npm semanal, grupos, labels); dependency-review.yml:1-12 (bloqueia dependência nova alta/crítica em PR); codeql.yml (push/PR main + cron semanal :17); npm audit --audit-level=high em pr-checks.yml:217-218 (job informativo, fora do ci-gate :708-711); actions pinadas por SHA em todos os workflows; Deno pinado v2.9.x (pr-checks.yml:308); verificação própria de segredos scripts/security/check-no-committed-service-role.ts via `npm run security:secrets` (pr-checks.yml:135). Ausente: `grep -rn -i 'gitleaks\\|sbom\\|cyclonedx\\|syft' .github/workflows/*.yml package.json` → 0 resultados; `ls .gitleaks.toml` → não existe. 'Zero crítica/alta sem aceite' não é verificável no repo (depende do advisory DB em tempo de execução).
- **Revisão:** sem contestação cética concluída.

### F3695 · Etapa 93: auto-merge de patch/minor do Dependabot (dependabot/fetch-metadata)

- **Tipo:** Workflow CI
- **O que os docs afirmam:** Quando required checks passarem.
- **Fontes:** `docs/estado/PLANO_CI_WORKFLOWS_2026-10-01.md:161`
- **O que falta:** Adicionar dependabot/fetch-metadata e restringir o auto-merge a update-type patch/minor (hoje habilita também em major).
- **Evidência:** .github/workflows/dependabot-automerge.yml:27,34 (pull_request do dependabot[bot] → 'gh pr merge --auto --squash') e cron diário '30 11 * * *' (linha 15) com merge --auto (linha 66). Não usa dependabot/fetch-metadata nem filtra patch/minor: grep 'fetch-metadata\\|update-type\\|semver' no workflow → 0 resultados; .github/dependabot.yml também não tem ignore/update-types de major (grep 'update-types\\|ignore\\|major' → 0).
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Não implementado.

### F3696 · Etapa 96: workflow de deploy das Edge Functions em push:main com Environment production e aprovação manual

- **Tipo:** Workflow CI
- **O que os docs afirmam:** supabase functions deploy só das alteradas; hoje deploy é manual.
- **Fontes:** `docs/estado/PLANO_CI_WORKFLOWS_2026-10-01.md:168`
- **O que falta:** Gatilho push:main com deploy só das functions alteradas (ou decisão documentada de manter manual); confirmar SUPABASE_ACCESS_TOKEN e required reviewers no environment production (NÃO VERIFICADO: API de environments → HTTP 403 do proxy).
- **Evidência:** .github/workflows/deploy.yml:119 'environment: production' e deploy.yml:148 'supabase functions deploy "$FN" --yes --project-ref usyxfpqlsspldubptrdl' por allowlist. Gatilho é workflow_dispatch/tag v* (deploy.yml:31-41), não push:main; deploya as 100 da allowlist, não só as alteradas; exit 0 sem SUPABASE_ACCESS_TOKEN (deploy.yml:135-138); required reviewers dependem de config do GitHub (comentário deploy.yml:9-11).
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Não implementado.

### F2128 · Etapa 97: smoke test pós-deploy (health das funções críticas e URL do Lovable)

- **Tipo:** Workflow CI
- **O que os docs afirmam:** Após o merge.
- **Fontes:** `docs/estado/PLANO_CI_WORKFLOWS_2026-10-01.md:169`
- **O que falta:** Incluir `health` na allowlist (liberando vaga das 100) ou apontar o curl para function ativa; fazer o step falhar/alertar em não-200; adicionar job pós-merge (main.yml ou workflow_run do Deploy) que teste as functions críticas e a URL pública do frontend; aposentar ou reescrever scripts/prod-health-check.ts.
- **Evidência:** deploy.yml:177-186 tem step 'Post-deploy health check' com curl em https://usyxfpqlsspldubptrdl.supabase.co/functions/v1/health, mas: nunca falha (não-200 vira ::warning::, :185); a function `health` (supabase/functions/health/index.ts) NÃO está na allowlist ACTIVE de deploy.yml:144 nem aparece no snapshot de produção (grep em …/contexto/supabase/edge-functions.md → 0 resultados), logo o endpoint não existe em produção; deploy.yml dispara só por workflow_dispatch/tag (deploy.yml:31-40), não pós-merge; main.yml (post-merge, :20-22) não chama health nem URL do frontend; URL Vercel/Lovable não é testada em nenhum workflow (`grep -rn -i 'vercel.app\\|lovable' .github/workflows/` → 0). scripts/prod-health-check.ts importa src/integrations/supabase/client (código de browser), checa só DB/auth e não é chamado por workflow (`grep -rn prod-health-check .github/` → 0).
- **Revisão:** sem contestação cética concluída.

### F2130 · Etapa canônica 26/08 nº 84: Executar E2E autenticado no CI

- **Tipo:** Workflow CI
- **O que os docs afirmam:** Etapa canônica 84 (plano 26/08, matriz de status 30/08, estado 🔒): contas/fixtures isoladas; falhar quando auth não configurada; segredos protegidos; limpeza das fixtures.
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:244-244`
- **O que falta:** Habilitar o job e2e de pr-checks.yml em pull_request internas; reprovar quando nenhum secret estiver configurado em push:main; usar conta/projeto de teste isolado para as fixtures.
- **Evidência:** Mesmo achado de F2125: quote-to-sale-e2e.yml:99-184 roda Playwright autenticado em PRs internas (run 43603690837 verde com step Playwright executado), config parcial/inválida reprova (:136-137,:163), cleanup em tests/e2e/quote-to-sale-cleanup-contract.spec.ts. Mas o job e2e de pr-checks.yml (demais specs em tests/e2e/) só roda em workflow_dispatch (pr-checks.yml:471) e ficou 'skipped' no último push:main (run 44646906324); ausência total de secrets gera skip verde (pr-checks.yml:510-512); fixtures não isoladas — grava no banco de produção compartilhado (pr-checks.yml:554-557).
- **Revisão:** sem contestação cética concluída.

### F2131 · Etapa canônica 26/08 nº 89: Definir orçamentos de desempenho (chunks, LCP/INP/CLS, consultas, memória, PWA)

- **Tipo:** Workflow CI
- **O que os docs afirmam:** Etapa canônica 89 (plano 26/08, matriz de status 30/08, estado ⬜): gate de regressão; Lote 1 — não é "criar npm run ci".
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:249-249`
- **O que falta:** Incluir bundle-size (e lighthouse, se estabilizado) no needs do ci-gate para virar gate de regressão; adicionar asserção de INP (lighthouse) e orçamentos para consultas/memória/PWA (ex.: limite de precache do workbox e de queries por rota) com check versionado.
- **Evidência:** Budgets versionados existem: .lighthouserc.json:10-21 (performance ≥0.45, FCP ≤5500ms, LCP ≤8500ms, CLS ≤0.1 como error; TBT/interactive como warn — sem INP) rodado em pr-checks.yml:598-634 (job lighthouse); scripts/check-bundle-budget.mjs:18-41 (teto gzip por chunk) rodado em pr-checks.yml:665 (job bundle-size) e qa-exhaustive.yml:96-97; vite.config.ts:132 chunkSizeWarningLimit 800. Porém lighthouse e bundle-size NÃO estão no needs do ci-gate (pr-checks.yml:711: lint-and-typecheck, test, build, instrucoes-agentes), logo não bloqueiam merge; ambos saíram 'skipped' em push:main (run 44646906324). Não há orçamento de consultas (SQL), memória ou PWA: `grep -rn -i 'budget' vite.config.ts` → 0; VitePWA configurado (vite.config.ts:12-17) sem limite medido.
- **Revisão:** sem contestação cética concluída.

### F2134 · Handoff P014: Fingerprint não secreto do projeto em pipelines e comandos

- **Tipo:** Workflow CI
- **O que os docs afirmam:** Fila canônica do handoff (onda 2): Fingerprint não secreto do projeto em pipelines e comandos. Todas as etapas começam pendentes; 0 de 100 executadas na data do handoff. Gate(s) conforme §13.
- **Fontes:** `docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:295-295`
- **O que falta:** Adicionar checagem de ref (hostname contém usyxfpqlsspldubptrdl) em scripts/lib/requireSupabaseAdminEnv.ts e nos workflows apply-migration.yml e contexto.yml antes de executar psql/snapshot; centralizar o ref numa variável de repo (ver F2120).
- **Evidência:** Fingerprint do projeto verificado em alguns pontos: db-backup.yml:64-68 e db-probe.yml:39-43 abortam se SUPABASE_DB_URL não contiver usyxfpqlsspldubptrdl; scripts/e2e-precheck.mjs:49 deriva project_ref da URL e exporta para pr-checks.yml:551 e quote-to-sale-e2e.yml:176; types-sync.yml:44 PROJECT_REF fixo. Não verificado: scripts/lib/requireSupabaseAdminEnv.ts:1-58 exige SUPABASE_URL HTTPS + CONFIRM_SUPABASE_ADMIN_WRITE, mas não compara o ref do projeto (grep 'usyxfpqlsspldubptrdl' no arquivo → 0); apply-migration.yml:40,75-89 e contexto.yml:221-227 usam SUPABASE_DB_URL sem checar o ref (grep do ref nesses arquivos → 0); deploy.yml e migrations-drift.yml usam --project-ref fixo (deploy.yml:148,166; migrations-drift.yml:67) sem validar o secret contra ele.
- **Revisão:** sem contestação cética concluída.

### F2135 · Handoff P082: Corrigir configuração de ambiente do workflow E2E/CI

- **Tipo:** Workflow CI
- **O que os docs afirmam:** Fila canônica do handoff (onda 9): Corrigir configuração de ambiente do workflow E2E/CI. Todas as etapas começam pendentes; 0 de 100 executadas na data do handoff. Gate(s) conforme §13.
- **Fontes:** `docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:398-398`
- **O que falta:** Definir ambiente de teste (projeto/branch Supabase ou conta isolada com cleanup garantido) e apontar os secrets de E2E para ele; habilitar o job e2e de pr-checks em pull_request.
- **Evidência:** Configuração de ambiente corrigida: environment pr-preview declarado em pr-checks.yml:472 e quote-to-sale-e2e.yml:66,107; .github/ENVIRONMENTS.md:3-41 fixa que pr-preview nunca recebe secrets e que os de E2E ficam no repositório; precheck de credenciais (scripts/e2e-precheck.mjs:1-20) com exit 1 em credencial inválida; E2E quote-to-sale verde em CI (run 43603690837, step Playwright executado). Mas o 'env de teste' é o projeto de produção usyxfpqlsspldubptrdl (pr-checks.yml:551; comentário em :554-557 sobre vendas reais no banco compartilhado), não um ambiente de teste separado, e o job e2e geral de pr-checks só roda manualmente (:471).
- **Revisão:** sem contestação cética concluída.

### F2137 · Handoff P087: Eliminar ciclos de chunks e impor orçamento a App e WinLoss

- **Tipo:** Workflow CI
- **O que os docs afirmam:** Fila canônica do handoff (onda 9): Eliminar ciclos de chunks e impor orçamento a App e WinLoss. Todas as etapas começam pendentes; 0 de 100 executadas na data do handoff. Gate(s) conforme §13.
- **Fontes:** `docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:403-403`
- **O que falta:** Adicionar bucket/budget para o chunk da rota WinLoss (e demais chunks de rota) em scripts/check-bundle-budget.mjs; incluir bundle-size no needs do ci-gate para o orçamento bloquear merge.
- **Evidência:** Ciclos: .dependency-cruiser.cjs:15-25 regra no-circular severity error, executada por `npm run deps:check` (package.json:36) em pr-checks.yml:141 (job lint-and-typecheck, no ci-gate); vite.config.ts:160-162 e scripts/check-bundle-budget.mjs:36-39 documentam a fusão React/Radix/catch-all em `vendor` para eliminar o ciclo de tela branca. Orçamento: entry do App tem budget `__entry__: 90` KB (check-bundle-budget.mjs:41, detecção em :67-68), mas WinLoss não tem budget — `grep -n -i winloss vite.config.ts scripts/check-bundle-budget.mjs` → 0 resultados; chunks sem bucket ficam 'n/a' e nunca falham (check-bundle-budget.mjs:76-95). O job bundle-size (pr-checks.yml:636-666) não está no needs do ci-gate (:711) e saiu 'skipped' em push:main (run 44646906324).
- **Revisão:** sem contestação cética concluída.

### F2146 · Notificação de falha de CI (notify-failure com SLACK_CI_WEBHOOK_URL)

- **Tipo:** Workflow CI
- **O que os docs afirmam:** notify-failure em pr-checks.yml:674-702, codeql.yml:44-66, cron-monitoring.yml:105-127, qa-exhaustive.yml:164-186 não tem efeito: secret SLACK_CI_WEBHOOK_URL não existe. db-backup, release-please, dependabot e pr-review-sla nem têm o job.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:39`
- **O que falta:** Criar o secret N8N_ALERT_WEBHOOK_URL (ou SLACK_CI_WEBHOOK_URL) em Settings → Secrets → Actions e disparar ci-failure-alert.yml por workflow_dispatch para confirmar a mensagem real.
- **Evidência:** Jobs existem: .github/workflows/pr-checks.yml:724-752, codeql.yml:52-74, cron-monitoring.yml:100-122, qa-exhaustive.yml:164-186 (todos `if [ -z "$SLACK_CI_WEBHOOK_URL" ]; then ... exit 0`). Além disso .github/workflows/ci-failure-alert.yml:8-40 cobre via workflow_run os 19 workflows (inclui DB Backup, Release Please, PR Review SLA, Dependabot Auto-merge) com N8N_ALERT_WEBHOOK_URL. Porém a lista real de Actions secrets do repo (API, 10 nomes: BACKUP_ENCRYPTION_KEY, E2E_TEST_EMAIL, E2E_TEST_PASSWORD, RESEND_API_KEY, SUPABASE_ACCESS_TOKEN, SUPABASE_DB_URL, SUPABASE_SERVICE_ROLE_KEY, VITE_SUPABASE_PROJECT_ID, VITE_SUPABASE_PUBLISHABLE_KEY, VITE_SUPABASE_URL) NÃO contém SLACK_CI_WEBHOOK_URL nem N8N_ALERT_WEBHOOK_URL. Run 44646906324 (main falhou) job 'Notify on failure' rodou e saiu verde sem enviar nada. Não existe .github/workflows/_notify.yml.
- **Revisão:** sem contestação cética concluída.

### F2147 · Notificação de falha de CI via Slack (if: failure())

- **Tipo:** Workflow CI
- **O que os docs afirmam:** Doc aponta que crons semanais falham em silêncio; ação: step final curl no Slack webhook em if: failure().
- **Fontes:** `docs/auditoria/AUDITORIA_TECNICA_EXAUSTIVA_2026-09-02.md:138,143,217,575`
- **O que falta:** Configurar o secret do webhook (N8N_ALERT_WEBHOOK_URL ou SLACK_CI_WEBHOOK_URL); sem ele crons continuam falhando em silêncio exceto pelo e-mail nativo do GitHub.
- **Evidência:** Steps `if: failure()` existem nos workflows agendados: cron-monitoring.yml:100-122, qa-exhaustive.yml:164-186, codeql.yml:52-74, e ci-failure-alert.yml:8-40 cobre os demais (db-backup, migrations-drift, pr-review-sla...) por workflow_run em main. Secret SLACK_CI_WEBHOOK_URL / SLACK_WEBHOOK_URL / N8N_ALERT_WEBHOOK_URL ausente da lista real de Actions secrets (API), então o curl nunca executa (pr-checks.yml:746-749 exit 0).
- **Revisão:** sem contestação cética concluída.

### F2151 · persist-credentials: false e permissions: {} nos workflows

- **Tipo:** Workflow CI
- **O que os docs afirmam:** actions: write em vários workflows.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:60`
- **O que falta:** Adicionar `persist-credentials: false` nos checkouts de pr-checks.yml, deploy.yml, codeql.yml, main.yml etc.; trocar `actions: write` por escopo mínimo (ou justificar cancel-in-progress) nos 6 workflows; avaliar `permissions: {}` top-level com permissões por job.
- **Evidência:** Todos os 27 workflows declaram `permissions:` top-level (grep ^permissions: → 27/27), maioria `contents: read`. Porém `actions: write` permanece em pr-checks.yml:16, cron-monitoring.yml:25, edge-functions-bundle.yml:25, quote-to-sale-e2e.yml:27, inventario-estado-semanal.yml, types-sync.yml (6 arquivos); `contents: write` em dependabot-automerge.yml:19, dependabot-fix-lockfile.yml:16, release-please.yml:14. `persist-credentials: false` só em 6 workflows (automation-local, contexto-testes, contexto ×5, dependency-review, inventario-estado-semanal, types-sync ×2); pr-checks.yml tem 15 checkouts e nenhum persist-credentials: false; nenhum workflow usa `permissions: {}`.
- **Revisão:** sem contestação cética concluída.

### F3697 · Pipeline deploy-db com approval e revogação de DDL manual

- **Tipo:** Workflow CI
- **O que os docs afirmam:** Ação 8: workflow deploy-db com environment approval; revogar DDL manual (etapas 13, 16).
- **Fontes:** `docs/postmortems/2026-08-30_cron_outage.md:43-45,83`
- **O que falta:** Docs proibindo DDL manual (hoje AGENTS.md:64 a prescreve — decisão de negócio do dono) e pipeline como caminho único; approval em apply-migration.yml; secrets e required reviewers NÃO VERIFICADOS (API → 403).
- **Evidência:** Sem deploy-db.yml, mas deploy.yml:119 (environment production) + deploy.yml:157-167 ('supabase db push --linked', exit 0 sem SUPABASE_ACCESS_TOKEN/SUPABASE_DB_PASSWORD); apply-migration.yml:14-15,84 (workflow_dispatch aplicando via psql, sem environment de aprovação: grep environment apply-migration.yml → 0). A revogação de DDL manual não existe: AGENTS.md:64 prescreve o oposto ('Migrations: DDL direto com db_query no MCP').
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Não implementado.

### F2152 · Plano 30/08 etapa 14 (P014): Fingerprint não secreto do projeto em pipelines e comandos

- **Tipo:** Workflow CI
- **O que os docs afirmam:** Etapa 14 do plano de 100 etapas (auditoria 30/08; = P014 do handoff): Adicionar fingerprint não secreto do projeto (ref) às pipelines e comandos operacionais; proteção contra execução no projeto errado.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:663-663`
- **O que falta:** Adicionar guard de ref em apply-migration.yml (mesmo `case` de db-backup.yml:64-68) e em requireSupabaseAdminEnv.ts (SUPABASE_URL deve conter usyxfpqlsspldubptrdl, com override explícito para local).
- **Evidência:** Fingerprint existe em parte dos pipelines: .github/workflows/db-backup.yml:64-68 (case _usyxfpqlsspldubptrdl_ senão exit 1), db-probe.yml:41-42 (idem), deploy.yml:148,166 (--project-ref fixo), types-sync.yml:44 PROJECT_REF, pr-checks.yml:551 project_ref derivado por scripts/e2e-precheck.mjs:47-49, scripts/inventario/gerar-banco.mjs:34 PROJETO_OFICIAL. Lacunas: apply-migration.yml (aplica DDL em produção via SUPABASE_DB_URL, linhas 40,75,84,89) não valida o ref da URL; scripts/lib/requireSupabaseAdminEnv.ts:49-57 valida só HTTPS + confirmação, sem checar project ref (grep usyxfpqlsspldubptrdl scripts/lib → 0).
- **Revisão:** sem contestação cética concluída.

### F2157 · pre-commit com typecheck/testes

- **Tipo:** Workflow CI
- **O que os docs afirmam:** L368 NI: .husky/pre-commit = npx lint-staged.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:293`
- **O que falta:** Adicionar `npm run typecheck` (e opcionalmente `vitest related --run`) ao .husky/pre-commit ou criar .husky/pre-push com typecheck; hoje tipos quebrados só são barrados no CI.
- **Evidência:** .husky/pre-commit:1 = "npx lint-staged" (só eslint --fix/prettier/eslint --max-warnings 0 nos arquivos staged, package.json lint-staged); .husky/commit-msg = commitlint; não existe .husky/pre-push; nenhum hook roda `tsc --noEmit` ou `vitest` (grep typecheck\|vitest .husky/pre-commit → 0). post-commit/post-checkout em .husky/ são da automação local, não typecheck.
- **Revisão:** sem contestação cética concluída.

### F2160 · Ratchet as unknown não piora (168 vs 155)

- **Tipo:** Workflow CI
- **O que os docs afirmam:** Ratchet piorou.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:292`
- **O que falta:** Criar gate em CI (ex.: baseline em scripts/ e step em pr-checks.yml que falhe se a contagem de `as unknown as` em src/ superar o baseline) e reduzir de 161 para <=155.
- **Evidência:** Contagem real no HEAD: grep -rn 'as unknown as' src → 161 ocorrências (+32 em supabase/functions), acima do piso 155 citado. Não existe ratchet: scripts/debt-report.mjs:194-201 apenas reporta o número ('teto: 0'), não falha; debt:report não roda em nenhum workflow (grep debt-report .github/workflows → 0).
- **Revisão:** sem contestação cética concluída.

### F2162 · Script `verify-dispatcher-request-id.sh` valida propagação em CI

- **Tipo:** Workflow CI
- **O que os docs afirmam:** ADR-006: script verify-dispatcher-request-id.sh valida propagação do request id em CI.
- **Fontes:** `docs/decisions/ADR-006-request-id-strategy.md:23-23`
- **O que falta:** Ou corrigir o ADR-006:23 (o que roda em CI é o lint estático edge-functions-request-id.yml) ou adicionar um step que execute o script contra https://usyxfpqlsspldubptrdl.supabase.co/functions/v1 e corrigir o DEFAULT_BASE_URL/anon key do projeto errado.
- **Evidência:** Script existe: scripts/verify-dispatcher-request-id.sh:1-60 (curl + jq comparando X-Request-Id header x body). Nenhum workflow o executa: grep verify-dispatcher-request-id .github/ package.json → 0; scripts/automation.config.json:802-803 o lista como execução manual. Agravante: DEFAULT_BASE_URL (linha 18) aponta para projeto saejqkojleeaxzrslzfg.supabase.co, que NÃO é o banco oficial usyxfpqlsspldubptrdl (AGENTS.md §7), com anon key desse outro projeto embutida (linha 22). A validação de request-id que roda em CI é outra: .github/workflows/edge-functions-request-id.yml (scripts/lint-request-id.ts, estático).
- **Revisão:** sem contestação cética concluída.

### F2165 · Secret SLACK_CI_WEBHOOK_URL para job notify-failure (pr-checks, cron-monitoring, qa-exhaustive, codeql) — não criado

- **Tipo:** Workflow CI
- **O que os docs afirmam:** Jobs notify-failure dependem de secret ainda não criado.
- **Fontes:** `docs/SECRETS_ROTATION.md:63,117-122`
- **O que falta:** Criar o secret SLACK_CI_WEBHOOK_URL em Settings → Secrets and variables → Actions (receita em docs/SECRETS_ROTATION.md:117-122) e validar com workflow_dispatch induzindo falha. Sem ele os 4 jobs notify-failure só logam e saem verdes — nenhuma notificação Slack é enviada.
- **Evidência:** Jobs notify-failure existem nos 4 workflows: .github/workflows/pr-checks.yml:724-752 (needs lint-and-typecheck…bundle-size, if: failure(), curl para $SLACK_CI_WEBHOOK_URL), .github/workflows/cron-monitoring.yml:100-122, .github/workflows/qa-exhaustive.yml:164-186, .github/workflows/codeql.yml:52-74. Todos tratam ausência do secret como no-op (pr-checks.yml:746-748 'SLACK_CI_WEBHOOK_URL não configurado — pulando notificação Slack.'; exit 0). Secret NÃO existe: listagem de Actions secrets do repo adm01-debug/Promo_Champions_V2.1 (API GitHub, 20/11/2026) retorna 10 nomes (BACKUP_ENCRYPTION_KEY, E2E_TEST_EMAIL, E2E_TEST_PASSWORD, RESEND_API_KEY, SUPABASE_ACCESS_TOKEN, SUPABASE_DB_URL, SUPABASE_SERVICE_ROLE_KEY, VITE_SUPABASE_PROJECT_ID, VITE_SUPABASE_PUBLISHABLE_KEY, VITE_SUPABASE_URL) — SLACK_CI_WEBHOOK_URL ausente. Run cron-monitoring 44686390684 (20/11/2026): job 'Notify on failure' skip…
- **Revisão:** sem contestação cética concluída.

### F2168 · smoke:target em workflow de CI

- **Tipo:** Workflow CI
- **O que os docs afirmam:** OK: package.json:42, scripts/smokeTargetHelpers.ts, src/test/smoke-target-helpers.test.ts existem; não está em workflow.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:336`
- **O que falta:** Adicionar step `npm run smoke:target` em um workflow (ex.: .github/workflows/qa-exhaustive.yml ou deploy.yml pós-deploy), com os secrets/URL que scripts/smoke-target-backend.ts exige; hoje só roda manualmente.
- **Evidência:** Script existe: package.json:46 "smoke:target": "tsx scripts/smoke-target-backend.ts"; scripts/smoke-target-backend.ts:23 importa ./smokeTargetHelpers; scripts/smokeTargetHelpers.ts e src/test/smoke-target-helpers.test.ts existem (ls OK). Não está em nenhum workflow: `grep -rn 'smoke-target\\|smoke:target' .github/` → 0 resultados (único chamador fora de package.json é scripts/automation.config.json:746, automação local).
- **Revisão:** sem contestação cética concluída.

### F2170 · Teto de complexidade não sobe (126→130)

- **Tipo:** Workflow CI
- **O que os docs afirmam:** Teto subiu contrariando regra só desce.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:292`
- **O que falta:** Reduzir violações de complexity/max-lines (131 → ≤126) e baixar `--max-warnings` em package.json:28 para 126; corrigir o comentário em pr-checks.yml:114 que ainda cita 126.
- **Evidência:** Ratchet existe e roda por PR (pr-checks.yml:118-119, qa-exhaustive.yml:47-48), mas o teto subiu duas vezes, contrariando a regra 'só desce' escrita no próprio workflow (pr-checks.yml:114-117, 'teto (126, calibrado em 2026-09)'): package.json:28 `--max-warnings 131`. Histórico git de package.json: 693f38a7b (2026-09-07) 126 → e7ffbe832 (2026-10-02, #219) 130 → 80b3a0b80 (2026-11-16, #516) 131. Execução local `npm run lint:complexity` em HEAD: '✖ 131 problems (0 errors, 131 warnings)', exit 0 — código está exatamente no teto.
- **Revisão:** sem contestação cética concluída.

### F3699 · Workflow bundle diário (P100 #52)

- **Tipo:** Workflow CI
- **O que os docs afirmam:** Planejado, inexistente.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:72`
- **O que falta:** Agendamento diário da checagem de bundle (ou decisão registrada de que semanal + por PR basta).
- **Evidência:** bundle-daily.yml ausente; verificação de bundle existe em pr-checks.yml:636-641 (job bundle-size, só "if: github.event_name == 'pull_request'") e em qa-exhaustive.yml:11 (cron semanal '0 3 * * 1') com 'node scripts/check-bundle-budget.mjs' (linha 97). Por PR e semanal, não diário.
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Não implementado.

### F3701 · Workflow CI dependabot.yml (4 afirmações nos docs)

- **Tipo:** Workflow CI
- **O que os docs afirmam:** Doc afirma 11 workflows em .github/workflows, Dependabot semanal (npm + actions) e CodeQL semanal.| Etapa 40 P. \| Etapa canônica 87 (plano 26/08, matriz de status 30/08, estado ⬜): zero crítica/alta sem aceite. \| Etapa 87 P: npm audit fora dos checks obrigatórios; dependabot.yml; actions por SHA.
- **Fontes:** `docs/auditoria/AUDITORIA_TECNICA_EXAUSTIVA_2026-09-02.md:30`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:489`, `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:247-247`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:86`
- **O que falta:** Ecossistema pip no dependabot.yml (há Python em scripts/regras_negocio/), gitleaks (.gitleaks.toml + workflow) e geração de SBOM no CI.
- **Evidência:** .github/dependabot.yml existe: npm weekly (linhas 4,7) e github-actions weekly (linhas 44,47); .github/workflows/codeql.yml:16-17 schedule semanal. Contagem atual: 28 workflows em .github/workflows (não 11). Faltam: ecossistema pip/uv (dependabot.yml só npm e github-actions, embora existam scripts/regras_negocio/*.py); gitleaks (ls .gitleaks.toml → ausente; grep -rlni gitleaks .github/workflows → 0); SBOM (grep -rlni sbom .github/workflows → 0).
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Não implementado.

### F3702 · Workflow CI deploy-functions.yml (2 afirmações nos docs)

- **Tipo:** Workflow CI
- **O que os docs afirmam:** Merge ≠ produção; PR template exige evidência manual pós-aplicação.| Path filter supabase/functions/**, concurrency sem cancel, changed-files.
- **Fontes:** `docs/execucao/PLANO_WORKFLOWS_GITHUB_ACTIONS_100_ETAPAS_2026-09-27.md:37`, `docs/execucao/PLANO_WORKFLOWS_GITHUB_ACTIONS_100_ETAPAS_2026-09-27.md:161`
- **O que falta:** Falta o gatilho push em main com path filter supabase/functions/**. Falta deployar só as funções alteradas (changed-files). Sem SUPABASE_ACCESS_TOKEN, o step sai com exit 0 e o run fica verde sem deploy (deploy.yml:135-139). NÃO VERIFICADO se o secret existe e se houve run com deploy real: exige a API e os secrets do GitHub.
- **Evidência:** deploy-functions.yml nunca existiu: `git log --all -- .github/workflows/deploy-functions.yml` → 0 resultados. Mas o deploy de edge functions existe em .github/workflows/deploy.yml. Gatilho só por workflow_dispatch ou tag v* (:31-41). Concurrency deploy-production com cancel-in-progress: false (:46-48). O job roda em environment: production (:119). O step 'Deploy das edge functions' faz `supabase functions deploy` por allowlist ACTIVE (:131-152). Sem o token, o step sai com `exit 0` (:135-139). apply-migration.yml existe, por workflow_dispatch e com concurrency sem cancel (:14-32). Não há path filter nem changed-files: `grep -n 'branches\\|paths' deploy.yml` e `grep -rn changed-files .github/workflows/` → 0 resultados.
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Não implementado.

## Não verificável (36)

### F1169 · Agendador externo (GitHub Actions, n8n, Zapier) não verificado

- **Tipo:** Agendamento (cron)
- **O que os docs afirmam:** Só cron.job e migrations foram checados; n_tup_ins=0 nas tabelas de destino indica que, se existe, não produz efeito.
- **Fontes:** `docs/estado/03_DOMINIO_SDR_CADENCIAS.md:404-404`
- **O que falta:** Painel do N8N/Zapier do dono (sem acesso): confirmar que nenhum fluxo externo chama functions/v1 do domínio; sem isso só o lado GitHub está descartado.
- **Evidência:** Lado GitHub verificado: `grep -ln 'functions/v1\\|supabase functions invoke' .github/workflows/*.yml` → só deploy.yml:179 (health check pós-deploy, não agendador); 10 workflows com schedule (codeql, contexto, cron-monitoring, db-backup, dependabot-automerge, inventario-estado-semanal, migrations-drift, pr-review-sla, qa-exhaustive, types-sync) e nenhum chama edge function do domínio SDR. N8N aparece só em .github/workflows/ci-failure-alert.yml:46-54 (webhook de alerta de CI). As functions do domínio hoje são agendadas por pg_cron (cron.md ids 77 sequence-runner, 78 process-cadence-tasks, 81 check-lead-sla, 82 sdr-consecutive-alerts).
- **Revisão:** sem contestação cética concluída.

### F1195 · Acesso a logs de edge functions e Postgres (Management API / Logs Explorer)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Sem conector Supabase para este projeto; endpoint logs.all removido (410) e o novo responde tabela inexistente (B3). Contornado via net._http_response e cron.job_run_details.
- **Fontes:** `docs/prod-readiness.md:897`
- **O que falta:** Faltou um token da Management API/conector MCP oficial do projeto usyxf (ou acesso ao Logs Explorer) para rodar `select count(*) from logs where source='function_edge_logs'`; configurar SUPABASE_PROJECT_REF/SUPABASE_ACCESS_TOKEN no gerador do snapshot para preencher edge-functions.md.
- **Evidência:** Nesta sessão não há conector Supabase do projeto usyxfpqlsspldubptrdl com acesso a logs: o MCP 'SUPABASE - GESTÃO DE CLIENTES' aponta para https://pgxfvjmuubtbowutlide.supabase.co (get_project_url), outro projeto; o gateway ZAPP (db_query) não expõe function_edge_logs. Snapshot supabase/edge-functions.md:3: 'Management API desabilitada: defina SUPABASE_PROJECT_REF e SUPABASE_ACCESS_TOKEN'. docs/prod-readiness.md:897: 'sem conector Supabase para este projeto; token recusado'. Contorno existe: snapshot supabase/cron-runs.md (cron.job_run_details).
- **Revisão:** sem contestação cética concluída.

### F1206 · ALERT_FROM_EMAIL configurado em prod

- **Tipo:** Doc/config
- **O que os docs afirmam:** NÃO VERIFICÁVEL: fallback onboarding@resend.dev só entrega para conta Resend.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:322`
- **O que falta:** Faltou acesso a `supabase secrets list --project-ref usyxfpqlsspldubptrdl` (ou Dashboard → Edge Functions → Secrets) para confirmar ALERT_FROM_EMAIL; validar com um envio real do cron-failure-alerter e checar email_logs.
- **Evidência:** Código: supabase/functions/_shared/alert-escalation.ts:33 `Deno.env.get("ALERT_FROM_EMAIL") ?? "Alertas <onboarding@resend.dev>"` com comentário :11-13 avisando que o fallback só entrega para a conta Resend. O valor é secret de Edge Function do projeto usyxf: não está nos snapshots (grep ALERT_FROM_EMAIL em contexto/supabase/*.md → 0, vault.md não o lista) nem é visível nesta sessão (MCP Supabase disponível aponta para outro projeto). RESEND_API_KEY existe como secret do GitHub Actions (API), mas isso não prova a configuração do remetente no Supabase.
- **Revisão:** sem contestação cética concluída.

### F1209 · App Lovable championgifts.lovable.app desativado/redirecionado

- **Tipo:** Doc/config
- **O que os docs afirmam:** NÃO VERIFICÁVEL: compilado para saejqkojleeaxzrslzfg.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:311`
- **O que falta:** Faltou acesso HTTP externo/painel Lovable: o dono precisa abrir https://championgifts.lovable.app e confirmar desativação ou redirect para https://promochampions.com.br no painel do Lovable.
- **Evidência:** Serviço externo: `curl -sI https://championgifts.lovable.app` → 403 do proxy da sessão ('no rule or network setting allows this host'). No repo: grep 'lovable.app' em src/ só aparece no teste que garante ausência (src/config/dominio-publico.test.ts:19); nenhuma referência a saejqkojleeaxzrslzfg em src/. Observação: src/integrations/lovable/index.ts:3-5 (@lovable.dev/cloud-auth-js) ainda é usado por src/hooks/auth/useAuthForm.ts:9,183 para OAuth Google.
- **Revisão:** sem contestação cética concluída.

### F1223 · Backup diário gerenciado Supabase (depende do plano)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Free = sem backup gerenciado; Pro = 7d. Tier vigente deve ser confirmado.
- **Fontes:** `docs/DR_PLAN.md:5-7`
- **O que falta:** Token da Management API ou acesso ao Dashboard (Database → Backups) para confirmar tier e backups; decisão de custo do dono.
- **Evidência:** Exige Dashboard Supabase/Management API (plano e lista de backups), sem acesso aqui; o snapshot não traz essa seção (grep -ic pitr …/supabase/project-config.md → 0). Última leitura registrada no repo: docs/agentes/replay-do-repo-261117.md:139-150 — GET /database/backups → backups:[], pitr_enabled:false, walg_enabled:true; GET /organizations/xkwxmfhdzgjzbkmbozcg → plan "free". Backup próprio: .github/workflows/db-backup.yml (pg_dump diário 03:00 UTC, artifact 7 dias) com run 44665111215 (2026-11-20) verde em todos os passos reais ("pg_dump → artifact", "Validar restauração" success; S3 skipped), o que contradiz docs/DR_PLAN.md:8-12 ("inoperante").| cético: Snapshot não traz plano/backups: …/contexto/docs/contexto/supabase/project-config.md:3 "_Management API desabilitada._". Exige Dashboard Supabase/Management API. Última leitura registrada: docs/agentes/replay-do-repo-261117.md:139-150 …

### F1224 · Backup do banco oficial: PITR desligado, backups vazios, walg_enabled true, plano free

- **Tipo:** Doc/config
- **O que os docs afirmam:** GET /v1/projects/usyxfpqlsspldubptrdl/database/backups retorna backups:[]; organização xkwxmfhdzgjzbkmbozcg plan=free. Ligar backup = decisão de custo do dono.
- **Fontes:** `docs/agentes/replay-do-repo-261117.md:137-160`
- **O que falta:** Acesso à Management API (GET /v1/projects/usyxfpqlsspldubptrdl/database/backups e organização) para confirmar PITR/backups; ligar backup gerenciado é decisão de custo do dono.
- **Evidência:** Exige Management API/Dashboard (sem token aqui). Estado registrado em docs/agentes/replay-do-repo-261117.md:139-158: backups:[], pitr_enabled:false, walg_enabled:true, organização xkwxmfhdzgjzbkmbozcg plan=free (coincide com supabase/.temp/linked-project.json organization_id). Mitigação existente: .github/workflows/db-backup.yml, run 44665111215 (2026-11-20) com pg_dump + validação de restauração success e upload S3 skipped (sem credenciais AWS).| cético: Mesmo bloqueio: project-config.md:3 do snapshot "Management API desabilitada"; estado só registrado em docs/agentes/replay-do-repo-261117.md:137-160. Mitigação no repo: .github/workflows/db-backup.yml (pg_dump diário).

### F1338 · Domínio legado championgifts.lovable.app responde bundle antigo (não é produção)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Domínio antigo ainda ativo com bundle desatualizado.
- **Fontes:** `docs/agentes/vercel-deploy.md:10`
- **O que falta:** Acesso ao domínio e ao painel Lovable para confirmar se responde e, se sim, desligar o projeto ou redirecionar para promo-champions-v2-1.vercel.app.
- **Evidência:** `curl -sS --max-time 20 https://championgifts.lovable.app` → 'CONNECT tunnel failed, response 403' (proxy de saída do ambiente bloqueia o host; HTTP 000). Não há artefato no repo que controle esse domínio (serviço de terceiros Lovable). Docs afirmam que ainda responde bundle antigo: docs/agentes/vercel-deploy.md:10, docs/DEPLOYMENT.md:6-7, docs/DR_PLAN.md:53-54.| cético: Nenhum artefato do repo controla o domínio championgifts.lovable.app: ele aparece só em docs (docs/agentes/vercel-deploy.md:10, docs/DEPLOYMENT.md:6, docs/DR_PLAN.md:53-54). Verificar se ainda responde exige acesso de rede ao host e ao painel Lovable, que é serviço de terceiro.

### F1350 · Etapa 006 (CI): Rotacionar VITE_SUPABASE_PUBLISHABLE_KEY e E2E_TEST_PASSWORD

- **Tipo:** Doc/config
- **O que os docs afirmam:** Atualizar secrets para valores atuais do projeto usyxfpqlsspldubptrdl.
- **Fontes:** `docs/execucao/PLANO_WORKFLOWS_GITHUB_ACTIONS_100_ETAPAS_2026-09-27.md:69`
- **O que falta:** Rodar pr-checks.yml via workflow_dispatch (ou PR que toque src/) e confirmar que o step `node scripts/e2e-precheck.mjs` passa com os secrets atuais.
- **Evidência:** API actions/secrets: VITE_SUPABASE_PUBLISHABLE_KEY updated_at 2026-10-05, E2E_TEST_PASSWORD updated_at 2026-10-11 — ambos atualizados após o plano (27/09), indício de rotação. Valores não legíveis. Critério 'Precheck E2E passa' não comprovável: job 'E2E Tests' (pr-checks.yml:496-529, scripts/e2e-precheck.mjs:23-24) ficou `skipped` nos 15 runs mais recentes de pr-checks.yml (ex.: 44643738622, 44598903424, 44365849118).
- **Revisão:** sem contestação cética concluída.

### F1437 · Execução das 170+ Edge Functions não verificável por logs (só inferida por linhas)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Doc não teve acesso aos logs de invocação; execução inferida pela presença de linhas nas tabelas de destino.
- **Fontes:** `docs/estado/02_DOMINIO_CRM_PIPELINE.md:233-236`
- **O que falta:** Acesso a logs (query_logs/Management API) do projeto usyxfpqlsspldubptrdl.
- **Evidência:** Logs de invocação das edge functions de usyxfpqlsspldubptrdl não acessíveis nesta sessão: os 3 conectores Supabase disponíveis apontam a outros projetos (get_project_url → pgxfvjmuubtbowutlide e doufsxqlfjyuvxuezpln; ping ZAPP → tnnnlkbymytvtqngbbqh); gateway MCP do banco oficial não está entre as ferramentas. Snapshot supabase/edge-functions.md: '_Management API desabilitada: defina SUPABASE_PROJECT_REF e SUPABASE_ACCESS_TOKEN._'; docs/prod-readiness.md (2026-11-12) registra 'falta de acesso de leitura a logs do Supabase'. Repo: 171 pastas em supabase/functions/, 100 na allowlist ACTIVE de deploy.yml:144.| cético: Snapshot supabase/edge-functions.md: '_Management API desabilitada: defina SUPABASE_PROJECT_REF e SUPABASE_ACCESS_TOKEN._'; nenhuma tabela de log de invocação no snapshot (grep -i 'edge_function\|function_log\|invocation' tables.md → só public.winloss_webhook_replay_invocatio…

### F1445 · Frontend promo-champions-v2-1.vercel.app (main) quebrado: VITE_SUPABASE_URL is not set

- **Tipo:** Doc/config
- **O que os docs afirmam:** Env não configurado no Vercel.
- **Fontes:** `docs/estado/IDENTIDADE_BANCO_2026-09-13.md:77,102-104`
- **O que falta:** Confirmar no painel Vercel (projeto promo-champions-v2-1) que VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY estão preenchidas ou ausentes (nunca vazias) e abrir a URL de produção conferindo chamadas a usyxfpqlsspldubptrdl.supabase.co.
- **Evidência:** Painel Vercel inacessível nesta sessão; `curl https://promo-champions-v2-1.vercel.app/` → http 000 (proxy 403 connect_rejected). No código o cenário 'VITE_SUPABASE_URL is not set' não existe mais: src/integrations/supabase/env.ts:4-5 tem fallback público. docs/agentes/vercel-deploy.md:15 e docs/DEPLOYMENT.md (revisado 2026-10-18) registram incidente de 2026-10-12 com env vazia e exigem envs preenchidas; docs/estado/IDENTIDADE_BANCO_2026-09-13.md:77 é snapshot anterior a essas correções.| cético: Sem acesso ao painel/URL da Vercel nesta sessão. Código: grep -rn 'is not set' src → 0 resultados (a mensagem do incidente não existe mais); env.ts:4-5 tem fallback, mas usa `??` — env vazia no painel ainda quebra o boot (docs/agentes/vercel-deploy.md:15), então o estado real depende só da configuração da Vercel.

### F1447 · Gateway MCP `supabase-promo-champions-v2-mcp.adm01.workers.dev` (conector `SUPABASE_PROMO_CHAMPIONS_-_V2_MCP` morto)

- **Tipo:** Doc/config
- **O que os docs afirmam:** ARCHITECTURE: gateway MCP rotulado 'LOVABLE CLOUD' aponta para usyxfpqlsspldubptrdl; o conector SUPABASE_PROMO_CHAMPIONS_-_V2_MCP está morto.
- **Fontes:** `docs/ARCHITECTURE.md:113-113`
- **O que falta:** Acessar o health endpoint de supabase-promo-champions-v2-mcp.adm01.workers.dev (liberar host ou conectar o gateway como MCP) e atualizar os rótulos em banco-e-mcp.md:18 e ARCHITECTURE.md:113.
- **Evidência:** `curl https://supabase-promo-champions-v2-mcp.adm01.workers.dev/health` → bloqueado pelo proxy (403 connect_rejected). Nenhum conector desta sessão corresponde aos rótulos de docs/agentes/banco-e-mcp.md:16 ('MCP - SUPABASE LOVABLE CLOUD…' / 'SUPABASE_PROMO_CHAMPIONS_-_V2_MCP'): os disponíveis são SUPABASE_-_ZAPP_WEB_V2_-_MCP (ping → project https://tnnnlkbymytvtqngbbqh.supabase.co, outro banco), SUPABASE_-_GEST_O_DE_CLIENTES e SUPABASE_-_GEST_O_DE_PRODUTOS_-_PROMO_GIFTS_V4. docs/ARCHITECTURE.md:113 repete o rótulo antigo.| cético: Nenhum conector desta sessão tem o rótulo citado em docs/agentes/banco-e-mcp.md:18 ('MCP - SUPABASE LOVABLE CLOUD - PROMO CHAMPIONS V2'); docs/ARCHITECTURE.md:113 repete o rótulo. O próprio doc (:18) manda conferir pelo health endpoint do gateway, que não é alcançável daqui.

### F1448 · Gatilhos de upgrade Supabase (DB > 4 GB, invocações > 500k/mês, egress > 80 GB)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Sinais práticos para subir de plano; revisar trimestralmente.
- **Fontes:** `docs/SIZING.md:6-19`
- **O que falta:** Ler Supabase Dashboard → Usage (invocações e egress do mês) e registrar a revisão trimestral em docs/SIZING.md ou ADR.
- **Evidência:** Gatilhos documentados em docs/SIZING.md:6-19 (DB > 4 GB, invocações > 500k/mês, egress > 80 GB). Único gatilho mensurável offline: snapshot supabase/stats.md:9 tamanho do banco 251.3 MB (abaixo de 4 GB). Invocações de edge e egress só existem no dashboard Supabase Usage (não acessível). grep -rln 'SIZING\|upgrade' docs/decisions/ → 0 resultados (nenhuma decisão registrada; ADR-001..010 não tratam de plano).| cético: docs/SIZING.md:15-19 lista os gatilhos e manda 'verificar no dashboard'. Único mensurável offline: contexto/supabase/stats.md (tamanho 251.3 MB < 4 GB). Invocações/egress só no dashboard Usage. grep -rli 'sizing\|upgrade' docs/decisions → 0 (nenhuma revisão registrada).

### F1500 · METRICS_INGEST_URL configurado

- **Tipo:** Doc/config
- **O que os docs afirmam:** NÃO VERIFICÁVEL: ausente = no-op silencioso.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:323`
- **O que falta:** Conferir no Dashboard Supabase → Edge Functions → Secrets se METRICS_INGEST_URL/METRICS_INGEST_TOKEN existem; sem eles, o export de métricas nunca ocorre.
- **Evidência:** Secret do Edge Runtime do Supabase (não visível no repo nem no snapshot): `grep -ni 'METRICS' contexto/supabase/project-config.md contexto/supabase/vault.md` → 0 resultados. Código: supabase/functions/_shared/metrics-exporter.ts:38 lê Deno.env.get('METRICS_INGEST_URL') e é no-op sem a env (linha 32); chamador cron-failure-alerter/index.ts:201 está na allowlist (deploy.yml:144). docs/runbooks/alertas-operacionais.md:23 documenta.
- **Revisão:** sem contestação cética concluída.

### F1503 · Node da Vercel alinhado ao .nvmrc (24.x vs 22)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Produção roda em versão diferente da testada no CI.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:175`
- **O que falta:** Fixar engines.node em '22.x' no package.json (a Vercel respeita) ou ajustar Node para 22.x em Vercel → Settings → General → Node.js Version, e registrar em docs/agentes/vercel-deploy.md.
- **Evidência:** Versão de Node da Vercel é configuração do painel (sem acesso). No repo: .nvmrc = 22; package.json:188-190 engines.node '>=22.0.0' (a Vercel escolhe a maior versão que satisfaz a faixa, o que permite 24.x); vercel.json sem configuração de Node; docs/agentes/vercel-deploy.md não cita versão de Node (`grep -ni node` → 0 resultados). Divergência registrada em docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:175.
- **Revisão:** sem contestação cética concluída.

### F1519 · PITR (Point-in-Time Recovery) no Supabase

- **Tipo:** Doc/config
- **O que os docs afirmam:** Não contratado/evidenciado; exige plano Pro+.
- **Fontes:** `docs/DR_PLAN.md:12-15,29-30`
- **O que falta:** Dono confirmar no dashboard Supabase (projeto usyxfpqlsspldubptrdl → Database → Backups) se PITR está ativo e registrar data/evidência em docs/DR_PLAN.md §1.
- **Evidência:** Exige painel Supabase (Backups → PITR) ou Management API, indisponíveis nesta sessão (MCPs Supabase listados são de outros projetos; gh/curl não alcançam o dashboard). docs/DR_PLAN.md:12-13 declara "não contratado/evidenciado (2026-10-18)"; snapshot contexto/supabase/project-config.md sem menção a PITR (grep -i pitr → 0); .github/workflows/db-backup.yml sem PITR (grep → 0).
- **Revisão:** sem contestação cética concluída.

### F1571 · Rollback de edge function via supabase functions deploy do commit anterior

- **Tipo:** Doc/config
- **O que os docs afirmam:** Redeploy manual via CLI a partir do histórico git.
- **Fontes:** `docs/ROLLBACK.md:19-25`
- **O que falta:** Acesso ao token do Supabase CLI para testar; no doc, acrescentar `--project-ref usyxfpqlsspldubptrdl` e a observação de que a function precisa estar na allowlist de .github/workflows/deploy.yml:144.
- **Evidência:** Procedimento documentado em docs/ROLLBACK.md:19-25 (`supabase functions deploy <nome-da-funcao>`). Executabilidade exige Supabase CLI autenticada (SUPABASE_ACCESS_TOKEN) no projeto usyxfpqlsspldubptrdl — .github/workflows/deploy.yml:20-21 informa que o deploy exige esse secret; não tenho o token nesta sessão. O doc também não cita `--project-ref` nem a allowlist ACTIVE de deploy.yml:144 (function fora dela não é redeployada pelo pipeline).
- **Revisão:** sem contestação cética concluída.

### F1572 · Rollback de frontend via painel Lovable/Vercel (Redeploy/Promote)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Reverter deploy anterior pelo painel.
- **Fontes:** `docs/ROLLBACK.md:5-9`
- **O que falta:** Acesso ao painel Vercel (vercel.com/juca1/promo-champions-v2-1) para confirmar Redeploy; atualizar docs/ROLLBACK.md:5-7 removendo 'Lovable'.
- **Evidência:** Doc: docs/ROLLBACK.md:5-9 ('painel do Lovable/Vercel', Redeploy/Promote). Histórico de deployments existe no espelho GitHub (`gh api repos/adm01-debug/Promo_Champions_V2.1/deployments` → production 2026-11-20T11:33Z sha 9017094, Preview 2026-11-20T01:09Z, Production 2026-11-20T00:35Z), mas a ação 'Redeploy/Promote' é do painel Vercel, não acessível: docs/agentes/vercel-deploy.md:20-22 registra que o MCP Vercel não lê este projeto. Doc ainda cita Lovable (desatualizado).
- **Revisão:** sem contestação cética concluída.

### F1573 · Rollback rápido do frontend pela Vercel (<2 min)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Rollback via Vercel → Deployments do projeto promo-champions-v2-1 → restaurar versão anterior.
- **Fontes:** `docs/RUNBOOK.md:63-68`
- **O que falta:** Acesso ao painel Vercel para confirmar 'Instant Rollback' no projeto promo-champions-v2-1.
- **Evidência:** Nome do projeto no RUNBOOK bate com a fonte oficial: docs/RUNBOOK.md:63-66 (`promo-champions-v2-1`) = docs/agentes/vercel-deploy.md:8-9 e .github/workflows/deploy.yml:28. Deployments de produção registrados no GitHub (gh api …/deployments → environment production, 2026-11-20). O painel Vercel (restaurar versão, <2 min) não é acessível nesta sessão (vercel-deploy.md:20-22).
- **Revisão:** sem contestação cética concluída.

### F1599 · Secrets de IA/voz/SMS configurados (LOVABLE_API_KEY, ELEVENLABS_API_KEY, TWILIO_*)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Functions de IA dependem desses secrets; sem eles respondem erro/503.
- **Fontes:** `docs/FUNCIONALIDADES_COMPLETAS.md:722-724`
- **O que falta:** Listar os secrets do projeto usyxfpqlsspldubptrdl (painel Supabase → Edge Functions → Secrets) e invocar elevenlabs-tts/semantic-search verificando 200. Observar que as functions Twilio não estão deployadas.
- **Evidência:** Código lê os secrets: LOVABLE_API_KEY em 46 arquivos (ex.: supabase/functions/personal-assistant-stream/index.ts, semantic-search/index.ts), ELEVENLABS_API_KEY em 3 (elevenlabs-tts/index.ts, elevenlabs-voice/index.ts), TWILIO_AUTH_TOKEN em 4 (twilio-call-status, twilio-call-twiml), TWILIO_ACCOUNT_SID → 0 (`grep -rl`). Essas functions estão na allowlist ACTIVE de .github/workflows/deploy.yml:144 (personal-assistant-stream, semantic-search, elevenlabs-tts, elevenlabs-voice). Snapshot vault.md: '_nenhum_' (vault não guarda esses segredos). A existência dos secrets no painel de Edge Functions do projeto usyxfpqlsspldubptrdl não pôde ser listada: nenhum conector MCP desta sessão aponta para esse projeto (SUPABASE - GESTÃO DE CLIENTES = pgxfvjmuubtbowutlide; demais são outros projetos) e `curl https://usyxfpqlsspldubptrdl.supabase.co/functions/v1/health` → CONNECT tunnel failed 403 (proxy blo…

### F1600 · Secrets RESEND_API_KEY, BULK_EMAIL_FROM e credenciais Twilio/Meta via Deno.env.get

- **Tipo:** Doc/config
- **O que os docs afirmam:** Lidos em email-bulk-send/index.ts:88 e check-lead-sla/index.ts:27; vault não acessível ao doc.
- **Fontes:** `docs/estado/03_DOMINIO_SDR_CADENCIAS.md:402-402`
- **O que falta:** Confirmar RESEND_API_KEY e BULK_EMAIL_FROM nos secrets de Edge Functions do projeto usyxfpqlsspldubptrdl. check-lead-sla não roda em produção.
- **Evidência:** Leituras confirmadas: supabase/functions/email-bulk-send/index.ts:90 `Deno.env.get('BULK_EMAIL_FROM')` (doc cita :88, deslocou 2 linhas); supabase/functions/check-lead-sla/index.ts:32 `Deno.env.get('RESEND_API_KEY')` (doc cita :27 — nessa linha hoje está SUPABASE_URL); supabase/functions/_shared/alert-escalation.ts:119 `Deno.env.get("RESEND_API_KEY")`. check-lead-sla NÃO está na allowlist ACTIVE (.github/workflows/deploy.yml:144, `grep -c check-lead-sla deploy.yml` → 0) → não roda em produção; email-bulk-send está. RESEND_API_KEY existe como Actions secret do GitHub (github_list_actions_secrets, criado 2026-11-11), mas isso não prova configuração nas Edge Functions. vault.md: '_nenhum_'. Sem conector MCP para o projeto usyxfpqlsspldubptrdl nesta sessão.| cético: supabase/functions/email-bulk-send/index.ts:90 `Deno.env.get('BULK_EMAIL_FROM')`; supabase/functions/check-lead-sla/index.ts:3…

### F1604 · Sentry do front: VITE_SENTRY_DSN definida na Vercel (B12)

- **Tipo:** Doc/config
- **O que os docs afirmam:** src/lib/errorTracking.ts:42 exige VITE_SENTRY_DSN; não existe na Vercel.
- **Fontes:** `docs/prod-readiness.md:1020`
- **O que falta:** Confirmar VITE_SENTRY_DSN em Production no painel da Vercel e a chegada de eventos ao Sentry.
- **Evidência:** src/lib/errorTracking.ts:42-43 `const dsn = import.meta.env.VITE_SENTRY_DSN ...; if (!dsn) return;` (Sentry só inicia com a env); .env.example:21-23 comenta `# VITE_SENTRY_DSN=`; vite.config.ts:79-83 plugin de source maps só com SENTRY_AUTH_TOKEN; @sentry/react ^10.75.3 em package.json:103. Nenhum workflow define VITE_SENTRY_DSN (`grep -rn VITE_SENTRY_DSN .github` → 0). Env da Vercel não acessível nesta sessão (sem MCP Vercel) e bundle de produção não baixável: `curl https://promo-champions-v2-1.vercel.app/` → CONNECT tunnel failed 403 (proxy).| cético: src/lib/errorTracking.ts:42-43 só inicia o Sentry com VITE_SENTRY_DSN. Nenhum workflow define a variável (`grep -rn VITE_SENTRY_DSN .github` → 0). O env da Vercel não é acessível nesta sessão.

### F1617 · Supply chain das Actions (allowed_actions, sha_pinning_required)

- **Tipo:** Doc/config
- **O que os docs afirmam:** allowed_actions=all, sha_pinning_required=false.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:58`
- **O que falta:** Acesso à API de permissions do repositório (Settings → Actions → General) para confirmar allowed_actions restrito e sha_pinning_required=true; os workflows já cumprem o pin por SHA.
- **Evidência:** gh api repos/adm01-debug/Promo_Champions_V2.1/actions/permissions e /permissions/selected-actions → HTTP 403 'Access to this GitHub Actions path is not permitted through this proxy'. Evidência parcial no repo: todos os 118 `uses:` em .github/workflows/_.yml estão pinados por SHA (ex.: deploy.yml:67,72,97; grep '@[0-9a-f]{40}' = 118, sem pin = 0). Fonte: docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:58.| CONTESTADO pelo cético (PARCIAL): O item É verificável. Via MCP GITHUB - MCP - FOREVER, github_get_actions_permissions(adm01-debug/Promo_Champions_V2.1) retorna {"enabled":true,"allowed_actions":"all","sha_pinning_required":false}: as duas proteções do repositório estão desligadas. No código, o pin por SHA já é cumprido na prática: em .github/workflows/_.yml há 118 linhas `uses:` com @<sha de 40 caracteres> e 0 sem pin (grep). Ou seja, há pin de fato nos a…
- **Revisão:** em disputa. O cético propõe Parcial e o juiz ainda não decidiu.

### F1635 · Upgrade de plano Supabase (172 fns > 100)

- **Tipo:** Doc/config
- **O que os docs afirmam:** LEDGER bloqueado no dono.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/LEDGER_EXECUCAO_2026-10-14.md:26`
- **O que falta:** O dono confirmar o plano no Supabase Dashboard → Billing.
- **Evidência:** Plano/billing do Supabase só é visível no painel (não acessível na sessão). Evidência de que o limite ainda vigora no código: .github/workflows/deploy.yml:140-143 ('plano limita a 100 functions ... 402 function.max_count na 101ª') e allowlist de exatamente 100 (:144); 171 functions no repo → 71 fora de produção. LEDGER_EXECUCAO_2026-10-14.md:26 registra 'bloqueado no dono'.| cético: O plano do Supabase só aparece no painel de Billing, sem acesso nesta sessão. O código ainda assume o limite: deploy.yml:140-143 (comentário 'plano limita a 100... 402 na 101ª') e allowlist de exatamente 100 (:144); o run 44727693642 deployou exatamente 100.

### F1642 · Vercel acessível ao usuário final (domínio custom / SSO protection)

- **Tipo:** Doc/config
- **O que os docs afirmam:** ssoProtection: all_except_custom_domains e nenhum domínio custom: URL de produção exige login na Vercel.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:173`
- **O que falta:** Confirmar no painel vercel.com/juca1/promo-champions-v2-1 → Settings → Deployment Protection se está desligado para produção, ou configurar domínio custom; registrar em docs/agentes/vercel-deploy.md.
- **Evidência:** Exige API/painel da Vercel. docs/agentes/vercel-deploy.md:9 ainda lista como domínio de produção https://promo-champions-v2-1.vercel.app (sem domínio custom); vercel-deploy.md:20-22 registra que o MCP Vercel não lê este projeto; curl -I em promo-champions-v2-1.vercel.app bloqueado pelo proxy (403). grep -rniE 'ssoProtection\|deployment protection\|domínio custom' docs/ (fora da auditoria 2026-10-12) → 0 resultados: nenhum doc registra a resolução.
- **Revisão:** sem contestação cética concluída.

### F1657 · 100 edge functions deployadas × 171 no repo, 0 só em produção

- **Tipo:** Edge function
- **O que os docs afirmam:** Todas as deployadas existem no repo; o teto do plano é 100.
- **Fontes:** `docs/agentes/achados-auditoria-261117.md:121`
- **O que falta:** Rodar o snapshot com SUPABASE_ACCESS_TOKEN (ou supabase functions list --project-ref usyxfpqlsspldubptrdl) e comparar com a allowlist; a afirmação de docs/agentes/achados-auditoria-261117.md:121 depende disso.
- **Evidência:** Verificado no repo: allowlist ACTIVE em .github/workflows/deploy.yml:144 tem exatamente 100 nomes e todos têm pasta (loop [ -d supabase/functions/$FN ] → 0 ausentes); find supabase/functions -mindepth 1 -maxdepth 1 -type d ! -name _shared → 171. Não verificado: lista real da Management API — snapshot /contexto/supabase/edge-functions.md diz 'Management API desabilitada: defina SUPABASE_PROJECT_REF e SUPABASE_ACCESS_TOKEN'; o MCP Supabase disponível aponta para outro projeto (pgxfvjmuubtbowutlide), não usyxfpqlsspldubptrdl.
- **Revisão:** sem contestação cética concluída.

### F1688 · Conector MCP Vercel com acesso ao projeto juca1/promo-champions-v2-1 (B5)

- **Tipo:** Integração externa
- **O que os docs afirmam:** MCP Vercel volta vazio/404 para o projeto (docs/agentes/vercel-deploy.md:21); contornado com token da API colado no chat, que deve ser revogado.
- **Fontes:** `docs/prod-readiness.md:1014`
- **O que falta:** Dono: revogar o token colado no chat (Vercel → Settings → Tokens) e reconfigurar o conector MCP Vercel com token que tenha acesso ao projeto promo-champions-v2-1; depois `list_projects` deve listar o projeto.
- **Evidência:** Nesta sessão não há nenhum conector Vercel (nenhuma tool mcp__Vercel__* na lista de ferramentas disponíveis), então não é possível testar list_projects/get_project. docs/agentes/vercel-deploy.md:21-24 continua registrando que o MCP Vercel não lista o projeto (team_QyN41X0q8hrqhW80AwokbFLv) e docs/prod-readiness.md:1022 (B5) registra o contorno com token colado e a pendência de revogação. Revogação do token só é verificável no painel Vercel.
- **Revisão:** sem contestação cética concluída.

### F1693 · Etapa 11 do plano: Reparar o conector SQL somente leitura do destino

- **Tipo:** Integração externa
- **O que os docs afirmam:** Provisionar exec_sql seguro ou token Management API de leitura, sem função genérica gravável. Saída esperada: SELECT de catálogo aprovado. Gate: autorização de infraestrutura.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:670-670`
- **O que falta:** Acesso ao gateway (host bloqueado pelo proxy) ou ao token do Worker para executar `SELECT now()` e provar o conector RO funcionando sem 401; confirmar que o token do gateway foi renovado conforme B8.
- **Evidência:** Gateway documentado em docs/agentes/banco-e-mcp.md:12,17 e docs/estado/IDENTIDADE_BANCO_2026-09-13.md:17-20. Último estado registrado: docs/prod-readiness.md:1024 (B8) — 'supabase_db_query → ERRO: Management API 401: Invalid access token (reconfirmado 2026-11-13 14:29 UTC)', contornado com token do dono fora do gateway. Função exec_sql não existe no banco real (ausente: grep -i exec_sql …/supabase/functions.md → 0 resultados). Tentativa daqui: curl https://supabase-promo-champions-v2-mcp.adm01.workers.dev/health → 'CONNECT tunnel failed, response 403' (proxy da sessão bloqueia o host). Nenhum conector MCP desta sessão aponta para usyxfpqlsspldubptrdl (ZAPP_WEB_V2, GESTÃO DE CLIENTES e PROMO GIFTS V4 são outros projetos).
- **Revisão:** sem contestação cética concluída.

### F1695 · Gateway MCP /health retorna project usyxf e 90 tools

- **Tipo:** Integração externa
- **O que os docs afirmam:** curl supabase-promo-champions-v2-mcp.adm01.workers.dev/health → {"ok":true,"project":"https://usyxfpqlsspldubptrdl.supabase.co","tools":90}.
- **Fontes:** `docs/estado/IDENTIDADE_BANCO_2026-09-13.md:17-20`
- **O que falta:** Executar o GET /health de um ambiente com saída para *.workers.dev (ou liberar o host no ambiente) e conferir `project` e `tools`.
- **Evidência:** Afirmação registrada em docs/estado/IDENTIDADE_BANCO_2026-09-13.md:17-20 (saída `{"ok":true,"service":"supabase-mcp-gateway","project":"https://usyxfpqlsspldubptrdl.supabase.co","tools":90}`) e reconfirmada em docs/prod-readiness.md:882 ('/health → project usyxf…'). Reprodução nesta sessão: `curl -sS https://supabase-promo-champions-v2-mcp.adm01.workers.dev/health` → 'curl: (56) CONNECT tunnel failed, response 403' (host fora da allowlist do proxy da sessão).
- **Revisão:** sem contestação cética concluída.

### F1696 · Gateway MCP supabase-promo-champions-v2-mcp.adm01.workers.dev com token válido

- **Tipo:** Integração externa
- **O que os docs afirmam:** O gateway existe (/health responde o projeto) mas toda tool devolvia "Management API 401: Invalid access token" (B8); contornado com token salvo pelo dono; token colado no chat deve ser revogado.
- **Fontes:** `docs/prod-readiness.md:881`
- **O que falta:** Chamar db_query via gateway e obter 200/201 com server_time (host liberado ou conector do projeto ativo); confirmar no painel Supabase (Account → Access Tokens) que o token colado no chat em 13/11 foi revogado e que o Worker recebeu token novo.
- **Evidência:** docs/prod-readiness.md:1024 (B8): toda tool do gateway devolvia 'Management API 401: Invalid access token' (reconfirmado 2026-11-13 14:29 UTC); contorno = token da Management API salvo pelo dono no ambiente da sessão (POST /v1/projects/usyxfpqlsspldubptrdl/database/query → 201). docs/prod-readiness.md:1047,1065 listam 'B8 (token do gateway)' e 'revogar o token colado no chat' como decisões pendentes do dono. docs/agentes/banco-e-mcp.md:17: conector SUPABASE_PROMO_CHAMPIONS_-_V2_MCP responde 401. Host do gateway bloqueado pelo proxy desta sessão (403 no CONNECT) e nenhum conector MCP ativo aponta para usyxf.
- **Revisão:** sem contestação cética concluída.

### F1697 · Monitor externo de uptime (UptimeRobot/BetterStack/Checkly) cadastrado para 3 endpoints

- **Tipo:** Integração externa
- **O que os docs afirmam:** Cadastrar monitores a cada 60s para o frontend Vercel, /auth/v1/health e /functions/v1/health com alerta por canal independente após 2 falhas.
- **Fontes:** `docs/RUNBOOK.md:91-113`
- **O que falta:** (1) Evidência externa: conta no provedor com os 3 monitores ativos (nenhum registro no repo). (2) Pré-requisito no repo: adicionar `health` à allowlist ACTIVE em .github/workflows/deploy.yml:144 (exige liberar 1 vaga das 100) — hoje o terceiro endpoint do RUNBOOK (/functions/v1/health) não existe em produção.
- **Evidência:** Só documentação: docs/RUNBOOK.md:102-119 ('Monitores a cadastrar', 3 URLs, alertas após 2 falhas) e docs/PROCESSOS.md:75-77 ('depende de observabilidade externa (Sentry, uptime) que exige criar contas de terceiros' — ainda não criadas). Ausente: grep -rni 'uptimerobot\\|betterstack\\|checkly' em .github/ scripts/ src/ → só comentário em supabase/functions/health/index.ts:3-7. Lacuna verificável no repo: a function `health` existe (supabase/functions/health/index.ts:1-30, verify_jwt=false em supabase/config.toml:88-89) mas NÃO está na allowlist ACTIVE de .github/workflows/deploy.yml:144 (grep 'health' na linha → 0) e em produção responde 404: log do job 'Deploy → production' (run 44727693642, 2026-11-20 11:36:55 UTC): `{"code":"NOT_FOUND","message":"Requested function was not found"}` → 'Health check retornou HTTP 404'.
- **Revisão:** sem contestação cética concluída.

### F1702 · Uptime externo (RUNBOOK → Monitoramento Externo de Uptime)

- **Tipo:** Integração externa
- **O que os docs afirmam:** Monitor externo documentado no RUNBOOK; PROCESSOS diz que depende de contas de terceiros ainda não criadas.
- **Fontes:** `docs/DEPLOYMENT.md:108`
- **O que falta:** Acesso à conta do provedor de uptime (não existe registro de que foi criada) para confirmar monitores e alertas; e publicar a function `health` (allowlist deploy.yml:144) antes de cadastrar o terceiro monitor.
- **Evidência:** docs/DEPLOYMENT.md:108 aponta para docs/RUNBOOK.md 'Monitoramento Externo de Uptime' (RUNBOOK.md:98-125: monitores 'a cadastrar', status page '_pendente_'). docs/PROCESSOS.md:75-77: 'depende de observabilidade externa (Sentry, uptime — etapas 26/27) que exige criar contas de terceiros'. Nenhum artefato de configuração de provedor no repo (grep -rni 'uptimerobot\\|betterstack\\|checkly' .github scripts → 0). Endpoint /functions/v1/health da tabela do RUNBOOK responde 404 em produção (log deploy 20/11/2026 11:36:55: 'Requested function was not found'; `health` fora da allowlist deploy.yml:144).
- **Revisão:** sem contestação cética concluída.

### F1785 · Etapa 065 (CI): Relatório mensal de minutos de Actions via N8N → planilha

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** github_get_workflow_usage; meta −40%.
- **Fontes:** `docs/execucao/PLANO_WORKFLOWS_GITHUB_ACTIONS_100_ETAPAS_2026-09-27.md:140`
- **O que falta:** Acesso ao N8N/planilha do dono para confirmar se o relatório mensal existe.
- **Evidência:** Nenhum artefato no repo: grep -ril n8n .github scripts → só ci-failure-alert.yml (alerta de falha, não relatório de minutos); grep -rn 'get_workflow_usage\|workflow_usage' .github scripts → 0 resultados. O relatório mensal viveria no N8N e numa planilha externa, aos quais não tenho acesso.| cético: grep -rn -i "workflow_usage" .github scripts → 0 resultados; nenhum workflow coleta minutos de Actions. O fluxo seria do lado N8N/planilha, fora do repo.

### F1855 · Teste trimestral do monitor externo

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Pausar deploy/bloquear domínio trimestralmente e confirmar alerta externo em <5 min.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:350`, `docs/RUNBOOK.md:115-118`
- **O que falta:** Faltou acesso ao painel do provedor de uptime. Para tornar verificável: registrar em docs/RUNBOOK.md o provedor, URL da status page e data/resultado do teste; incluir 'health' na allowlist ou trocar a URL monitorada.
- **Evidência:** Monitor externo é serviço de terceiros sem configuração no repo: docs/RUNBOOK.md:99-124 descreve monitores a cadastrar (UptimeRobot/BetterStack/Checkly) e :117-119 ('Status page … _pendente_'); :123-124 prescreve o teste trimestral. Nenhum registro de teste: docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:350 ('Teste trimestral do monitor externo| NÃO VERIFICÁVEL \| sem registro'); grep -rniE 'uptimerobot\|betterstack\|checkly' .github/workflows scripts src → 0. Agravante: o endpoint que o RUNBOOK:112 manda monitorar (functions/v1/health) não está na allowlist deploy.yml:144 (pasta supabase/functions/health existe; 'health' isolado → 0 na lista ACTIVE).
- **Revisão:** sem contestação cética concluída.

### F1858 · Uptime monitoring externo nos 2 domínios + log-web-vitals

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Doc aponta ausência de monitoramento de uptime externo; ação: UptimeRobot/Better Stack.
- **Fontes:** `docs/auditoria/AUDITORIA_TECNICA_EXAUSTIVA_2026-09-02.md:215,221`
- **O que falta:** Faltou acesso ao painel de uptime. Registrar no RUNBOOK o provedor usado, link da status page e data de configuração; adicionar check em /functions/v1/log-web-vitals; incluir 'health' na allowlist (deploy.yml:144) ou apontar o monitor para uma function deployada.
- **Evidência:** Documentação existe: docs/RUNBOOK.md:99-124 (seção 'Monitoramento Externo de Uptime': UptimeRobot/BetterStack/Checkly, tabela de 3 URLs — frontend Vercel, auth/v1/health, functions/v1/health — alertas <5 min). Configuração real no provedor não é verificável pelo repo: grep -rniE 'uptimerobot\|better ?stack\|checkly' .github/workflows scripts src → 0; RUNBOOK.md:117-119 status page '_pendente_'. Observações: RUNBOOK não cita check em log-web-vitals (pedido da auditoria AUDITORIA_TECNICA_EXAUSTIVA_2026-09-02.md:221); a function 'health' (RUNBOOK:112) está fora da allowlist deploy.yml:144, logo esse monitor retornaria 404.
- **Revisão:** sem contestação cética concluída.

### F1940 · E2E isolado com mocks: 4 specs/fixtures Playwright desatualizados (login mock vs rate limiter, chave de sessão, reset modal, heading Win/Loss)

- **Tipo:** Teste
- **O que os docs afirmam:** Doc: 6/10 specs aprovados; 4 falhas por fixtures desatualizadas.
- **Fontes:** `docs/auditoria/VALIDACAO_EXAUSTIVA_ONDA_0_2026-08-26.md:20,69`
- **O que falta:** Rodar `npx playwright test --project=chromium-desktop` com E2E_TEST_EMAIL e E2E_TEST_PASSWORD válidos e anexar o relatório.
- **Evidência:** Os 4 specs existem e foram ajustados após o doc (git log: commit f145194c9 2026-08-27 'fix: corrigir acessibilidade e isolamento dos testes' alterou tests/e2e/auth-navigation.spec.ts (129 linhas) e src/components/auth/AuthFormCard.tsx). Alinhamento estático confirmado: heading Win/Loss — tests/e2e/win-loss-analysis.spec.ts:78 (/Win\/Loss Analysis/) vs src/pages/WinLossAnalysisPage.tsx:32 (h1 'Win/Loss Analysis'); reset — tests/e2e/reset-password-hibp.spec.ts:84 ('Atualizar Senha') vs src/pages/ResetPassword.tsx:160; login — tests/e2e/auth-navigation.spec.ts:76-79 vs src/components/auth/AuthFormCard.tsx:257,276,356; rate limiter — src/hooks/useLoginRateLimiter.ts:41 rpc get_login_lockout_status coberto pelo mock genérico tests/e2e/auth-navigation.spec.ts:66 ('**/rest/v1/**'); chave de sessão — tests/e2e/global-setup.ts:68 `sb-${projectId}-auth-token` (padrão supabase-js). Rodam no CI via…

### F2092 · actionlint aprovado nos workflows

- **Tipo:** Workflow CI
- **O que os docs afirmam:** Workflows do GitHub Actions têm sintaxe válida segundo actionlint.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:92-92`
- **O que falta:** Rodar actionlint localmente (ou adicionar step `rhysd/actionlint` em pr-checks.yml) para transformar a afirmação em gate verificável.
- **Evidência:** actionlint não está instalado no sandbox e o download do binário (gh release download / script oficial) foi bloqueado pela política de execução; `grep -rn actionlint .github/ package.json scripts/` → 0 resultados (nenhum step de CI roda actionlint). Checagens indiretas OK: 118 `uses:` pinados por SHA (grep inverso → 0) e scripts/ci/check-workflow-pins-resolvem.mjs roda em pr-checks.yml:150.
- **Revisão:** sem contestação cética concluída.
