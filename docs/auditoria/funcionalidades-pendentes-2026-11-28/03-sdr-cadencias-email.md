# SDR, cadências, sequências e e-mail

[Voltar ao índice](README.md)

108 itens não implementados, parciais ou não verificáveis neste domínio.

## Não implementado (37)

### F2427 · Account-Based Engagement (orquestração multi-contato por conta)

- **Tipo:** Componente
- **O que os docs afirmam:** Falta orquestrar vários contatos da mesma conta em uma campanha.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:44`
- **O que falta:** criar modelo de múltiplos contatos por conta e regra de pausa cruzada entre eles ao detectar resposta de qualquer contato — hoje o auto-pause só vale por inscrição individual.
- **Evidência:** ausente: grep -rln "client_contacts" src/ → 0 resultados. AccountBasedEngagement.tsx (rota /engagement/abm) só mostra score agregado/leaderboard (useTopAccounts), sem inscrição multi-contato. useAutoPause.ts:36-52 pausa um único sequence_enrollment por vez (matched_enrollment_id singular), não todos os contatos da conta.
- **Revisão:** sem contestação cética concluída.

### F2428 · Account-based marketing (campanhas por conta)

- **Tipo:** Componente
- **O que os docs afirmam:** Falta campanhas direcionadas por conta.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:82`
- **O que falta:** adicionar segmentação de público por conta nas campanhas de sequences — hoje só existe inscrição individual.
- **Evidência:** ausente: grep por 'account_id'/'account.based' em src/components/sequences/SequenceBuilder.tsx e hooks de sequences → 0 resultados; inscrição em sequences é por sale_id/prospect individual (useProspectCadenceMutations.ts:10-14), não por conta.
- **Revisão:** sem contestação cética concluída.

### F2431 · G5 Configuração de domínio de envio SPF/DKIM em /admin/conexoes

- **Tipo:** Componente
- **O que os docs afirmam:** Não verificado; sem isso envio cai em spam.
- **Fontes:** `docs/benchmark/RAMPER_2026-07.md:166`
- **O que falta:** criar UI em /admin/conexoes para configurar/verificar domínio de envio via DNS — nada existe hoje.
- **Evidência:** ausente: grep -irn "spf\|dkim\|dmarc\|sending_domain" src/ supabase/functions/ → 0 resultados. AdminConexoesPage.tsx (rota /admin/conexoes) não contém menção a SPF/DKIM.
- **Revisão:** sem contestação cética concluída.

### F2433 · Guia SPF/DKIM/DMARC e warm-up

- **Tipo:** Componente
- **O que os docs afirmam:** Sem SPF/DKIM/DMARC guiado, warm-up, limite diário por remetente.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:189`
- **O que falta:** não existe nenhuma UI ou lógica de deliverability no repo.
- **Evidência:** ausente: grep -irn "spf\|dkim\|dmarc\|warm.up" src/ supabase/functions/ → 0 resultados relevantes a deliverability/warm-up/limite diário.
- **Revisão:** sem contestação cética concluída.

### F2434 · Limites de alerta SDR configuráveis (sdr_performance_settings)

- **Tipo:** Componente
- **O que os docs afirmam:** sdr_performance_settings não tem leitor.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:65`
- **O que falta:** criar UI que grave em sdr_performance_settings e alterar a function de alertas SDR para ler esses limites em vez de constantes fixas.
- **Evidência:** Tabela sdr_performance_settings existe no banco (só referenciada em src/integrations/supabase/types.ts:17457, gerado do schema real); ausente: grep -rln "sdr_performance_settings" src/ supabase/functions/ (fora de types.ts) → 0 resultados — nenhuma UI grava e nenhuma function lê.
- **Revisão:** sem contestação cética concluída.

### F2437 · Setup guiado de domínio de envio (SPF/DKIM)

- **Tipo:** Componente
- **O que os docs afirmam:** Gap: sem UI de setup de domínio.
- **Fontes:** `docs/benchmark/RAMPER_2026-07.md:71`
- **O que falta:** criar tela de verificação de DNS SPF/DKIM/DMARC em /admin/conexoes e tabela sending_domains — nada existe hoje.
- **Evidência:** ausente: grep -irn "spf\|dkim\|dmarc\|sending_domain" src/ supabase/functions/ → 0 resultados; /admin/conexoes não tem tela de verificação de DNS para domínio de envio.
- **Revisão:** sem contestação cética concluída.

### F2438 · Setup guiado de SPF/DKIM/DMARC

- **Tipo:** Componente
- **O que os docs afirmam:** Nada de spf/dkim/dmarc no repo.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:52`
- **O que falta:** criar tela em /admin/conexoes que oriente/valide registros SPF/DKIM/DMARC — recurso inexistente no repo.
- **Evidência:** ausente: grep -irn "spf\|dkim\|dmarc" src/ supabase/functions/ → 0 resultados (mesma busca cobre este item, idêntico ao F2431/F2433/F2437), confirmando a afirmação do doc B_funcionalidades_docs.md:52.
- **Revisão:** sem contestação cética concluída.

### F2441 · UI de remetente e domínio de e-mail

- **Tipo:** Componente
- **O que os docs afirmam:** Sem UI de remetente e domínio.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:193`
- **O que falta:** Criar tela (ex. em /admin/conexoes) para cadastro/verificação de remetente e domínio de e-mail.
- **Evidência:** ausente: `grep -rni 'remetente.*domínio\|sender.*domain' src` → 0 resultados relevantes. Único campo de remetente é `email_from` em src/pages/AdminAlertasChurn.tsx:333-339, específico de churn, não um cadastro geral de remetente/domínio. src/pages/admin/AdminConexoesPage.tsx e src/components/admin/connections/*.tsx não têm SPF/DKIM/DMARC/sender/domain (só `Bitrix24Tab.tsx:36`, domínio do Bitrix24).
- **Revisão:** sem contestação cética concluída.

### F2444 · Video messages (Loom-style) para prospects

- **Tipo:** Componente
- **O que os docs afirmam:** Falta mensagens de vídeo.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:140`
- **O que falta:** Gravação/upload de vídeo com link rastreável, tabela `video_messages`, UI de composição e storage.
- **Evidência:** ausente: `grep -rni 'video_messages\|video-message\|loom' src supabase` → 0 resultados. Nenhuma tabela `video_messages` nos snapshots de banco.
- **Revisão:** sem contestação cética concluída.

### F2445 · W2.2 Setup guiado SPF/DKIM/DMARC em /admin/conexoes com verificação automática

- **Tipo:** Componente
- **O que os docs afirmam:** Fecha G5.
- **Fontes:** `docs/benchmark/RAMPER_2026-07.md:197`
- **O que falta:** Construir em /admin/conexoes fluxo guiado que consulte a API do Resend (Domains) e mostre status DNS/SPF/DKIM/DMARC automaticamente.
- **Evidência:** ausente: src/pages/admin/AdminConexoesPage.tsx e src/components/admin/connections/*.tsx não têm verificação automática de SPF/DKIM/DMARC (`grep -i 'SPF\|DKIM\|DMARC'` → 0). Única menção é manual, no runbook (docs/runbooks/email-transacional.md:42,48: "Resend → Domains — status de verificação DKIM/SPF").
- **Revisão:** sem contestação cética concluída.

### F3775 · Agendamento (cron) email-engagement-scorer (2 afirmações nos docs)

- **Tipo:** Agendamento (cron)
- **O que os docs afirmam:** NÃO INICIADO: nenhuma migration agenda email-engagement-scorer (grep cron.schedule/trigger_internal_edge_job = 0); só GH cron-monitoring.yml roda testes.| email-engagement-scorer é edge batch sem cron e sem auth de cron; roda só por invoke manual no front.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:97`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/F_banco_dados.md:166`
- **O que falta:** Falta o cron.schedule, via trigger_internal_edge_job, para email-engagement-scorer, com auth de cron no handler e evidência em cron-runs.
- **Evidência:** nenhum job em pg_cron para "email-engagement-scorer" (cron.md, 45 jobs)| cético: Não há job para email-engagement-scorer em cron.md (45 jobs, ids 1-88). A function está na allowlist (deploy.yml:144), mas só é chamada pelo front: src/hooks/engagement/useEmailEngagementScore.ts e src/hooks/useEmailMetrics.ts. inbound-email-webhook/index.ts:32 apenas a cita em comentário. Ausente: grep 'email-engagement-scorer' supabase/migrations → 0 resultados.

### F3776 · Cron pg_cron para auto-enroll-cadence via trigger_internal_edge_job

- **Tipo:** Agendamento (cron)
- **O que os docs afirmam:** NÃO INICIADO: nenhuma migration agenda auto-enroll-cadence (grep cron.schedule/trigger_internal_edge_job = 0); só GH cron-monitoring.yml roda testes.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:97`
- **O que falta:** Falta o cron pg_cron para auto-enroll-cadence via trigger_internal_edge_job. Isso pode ser dispensável se os triggers SQL de matrícula forem o caminho oficial; essa decisão não está registrada.
- **Evidência:** nenhum job em pg_cron para "auto-enroll-cadence" (cron.md, 45 jobs)| cético: Não há job auto-enroll-cadence em cron.md. A function está na allowlist (deploy.yml:144), mas só é chamada manualmente por src/components/cadences/EnrollmentRulesDialog.tsx. Existe matrícula automática por trigger SQL, fora da edge: trg_auto_enroll_on_sale (triggers.md:280) e trg_auto_enroll_quote_cadence (triggers.md:228).

### F3777 · Cron pg_cron para engagement-score-recompute via trigger_internal_edge_job

- **Tipo:** Agendamento (cron)
- **O que os docs afirmam:** NÃO INICIADO: nenhuma migration agenda engagement-score-recompute (grep cron.schedule/trigger_internal_edge_job = 0); só GH cron-monitoring.yml roda testes.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:97`
- **O que falta:** Falta o cron.schedule para engagement-score-recompute; hoje só existe o disparo manual e o trigger por sinal.
- **Evidência:** nenhum job em pg_cron para "engagement-score-recompute" (cron.md, 45 jobs)| cético: Não há job engagement-score-recompute em cron.md. A edge está na allowlist e só é chamada pelo botão (useEngagementScore.ts:107-110). O recálculo automático é feito pelo trigger trg_recompute_engagement_on_signal em contact_send_time_profile (triggers.md:111), e não por cron.

### F3778 · Cron pg_cron para send-time-optimizer via trigger_internal_edge_job

- **Tipo:** Agendamento (cron)
- **O que os docs afirmam:** NÃO INICIADO: nenhuma migration agenda send-time-optimizer (grep cron.schedule/trigger_internal_edge_job = 0); só GH cron-monitoring.yml roda testes.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:97`
- **O que falta:** Falta incluir send-time-optimizer na allowlist e criar o cron.schedule via trigger_internal_edge_job.
- **Evidência:** nenhum job em pg_cron para "send-time-optimizer" (cron.md, 45 jobs)| cético: Não há job send-time-optimizer em cron.md. A function também está fora da allowlist ACTIVE (deploy.yml:144; grep -cx 'send-time-optimizer' → 0), então não roda em produção.

### F3795 · Claim/idempotência persistente para email-bulk-retry (sent_at)

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** Doc: duas execuções ainda podem alcançar o mesmo rascunho antes de sent_at; criar claim persistente após reconciliação.
- **Fontes:** `docs/auditoria/EXECUCAO_ONDA_0_2026-08-26.md:67`
- **O que falta:** Falta um claim atômico (coluna claimed_at, ou RPC com FOR UPDATE SKIP LOCKED) antes do envio em email-bulk-retry.
- **Evidência:** função "retry" ausente do banco real (functions.md)| cético: Não há claim persistente. supabase/functions/email-bulk-retry/index.ts:93-105 lê os rascunhos com .is('sent_at', null) sem reservá-los. O envio acontece em :189-196, e só depois :198-207 grava sent_at. Não há UPDATE ... WHERE claimed_at IS NULL RETURNING nem RPC de claim. Ausente: grep -n 'claim' supabase/functions/email-bulk-retry/index.ts → 0 resultados.

### F3806 · Hook duplicado useSendTimeProfile definido em 2+ arquivos

- **Tipo:** Hook
- **O que os docs afirmam:** Definições: engagement/ e sequences/ useSendTimeOptimization.ts. sequences/ vence (SendTimeBadge.tsx:4).
- **Fontes:** `docs/estado/09_HOOKS_SERVICES.md:425`
- **O que falta:** hook useSendTimeProfile ausente (hooks.json e arquivos src/)
- **Evidência:** hook useSendTimeProfile ausente (hooks.json e arquivos src/)
- **Revisão:** sem contestação cética concluída.

### F3807 · Hook órfão useDeleteStepVariants

- **Tipo:** Hook
- **O que os docs afirmam:** Exportado em `src/hooks/sequences/useStepVariants.ts` com zero referência em src/, tests/ e scripts/, inclusive dentro do próprio arquivo (critério rg -w).
- **Fontes:** `docs/estado/09_HOOKS_SERVICES.md:180`
- **O que falta:** hook useDeleteStepVariants ausente (hooks.json e arquivos src/)
- **Evidência:** hook useDeleteStepVariants ausente (hooks.json e arquivos src/)
- **Revisão:** sem contestação cética concluída.

### F3808 · Hook órfão useEnrollmentExecutions

- **Tipo:** Hook
- **O que os docs afirmam:** Exportado em `src/hooks/sequences/useSequenceEnrollments.ts` com zero referência em src/, tests/ e scripts/, inclusive dentro do próprio arquivo (critério rg -w).
- **Fontes:** `docs/estado/09_HOOKS_SERVICES.md:182`
- **O que falta:** hook useEnrollmentExecutions ausente (hooks.json e arquivos src/)
- **Evidência:** hook useEnrollmentExecutions ausente (hooks.json e arquivos src/)
- **Revisão:** sem contestação cética concluída.

### F3809 · Hook órfão useLogEmailEvent

- **Tipo:** Hook
- **O que os docs afirmam:** Exportado em `src/hooks/useEmailTracking.ts` com zero referência em src/, tests/ e scripts/, inclusive dentro do próprio arquivo (critério rg -w).
- **Fontes:** `docs/estado/09_HOOKS_SERVICES.md:192`
- **O que falta:** hook useLogEmailEvent ausente (hooks.json e arquivos src/)
- **Evidência:** hook useLogEmailEvent ausente (hooks.json e arquivos src/)
- **Revisão:** sem contestação cética concluída.

### F2466 · Gmail/Outlook 2-way sync nativo

- **Tipo:** Integração externa
- **O que os docs afirmam:** Falta sync bidirecional de e-mail (não só tracking).
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:52`
- **O que falta:** Tudo: OAuth Google/Microsoft, edge functions de sync, armazenamento de tokens de e-mail, leitura/envio sincronizado. Nenhum artefato correspondente existe no repo.
- **Evidência:** ls supabase/functions| grep -iE 'gmail\|outlook' → 0 resultados (nenhuma function gmail-sync/outlook-sync existe). 'channel_credentials' existe (src/hooks/multichannel/useChannelCredentials.ts) mas é só para canais de WhatsApp/multichannel (Twilio/Meta/Z-API/Evolution), não e-mail — confirmado em supabase/migrations/20261013153000_integration_secret_refs.sql:3.
- **Revisão:** sem contestação cética concluída.

### F2480 · Aquecimento de caixa (warm-up)

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** warm-up ausente.
- **Fontes:** `docs/benchmark/RAMPER_2026-07.md:72`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:53`
- **O que falta:** Tudo — nenhuma rampa automática de volume de envio por remetente existe no código.
- **Evidência:** grep -rli "warm.up\|warmup" src/ supabase/ → 0 resultados em todo o repositório.
- **Revisão:** sem contestação cética concluída.

### F2496 · Lead nurturing workflows por comportamento

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Falta nutrição baseada em comportamento.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:88`
- **O que falta:** Criar o gatilho evento→workflow (ex.: email_tracking_events ou website_visitor_logs chamando automaticamente um workflow) e a tabela automation_workflows com regra de enrollment em cadência.
- **Evidência:** execute-workflow (index.ts:30-60) só é invocado por ação manual autenticada (useAutomationWorkflows.ts:205), sem disparo por evento. workflow-executor (useWorkflows.ts:136) nem está na allowlist ACTIVE. Nenhuma edge function chama execute-workflow/workflow-executor automaticamente a partir de um evento de comportamento (abertura, clique, visita).
- **Revisão:** sem contestação cética concluída.

### F2503 · Retry de e-mail transacional

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Transacional sem retry.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:140`
- **O que falta:** Implementar retry com backoff dentro/ao redor de send-transactional-email para falhas de envio único/transacional.
- **Evidência:** send-transactional-email/index.ts não tem lógica de retry/backoff (grep sem resultado); falha só retorna erro ao chamador. Existe retry com backoff (decideRetry, _shared/retry-policy.ts) mas apenas para RASCUNHOS EM LOTE (email-bulk-retry/index.ts, cron email-bulk-retry-15min) — fluxo diferente do transacional citado.
- **Revisão:** sem contestação cética concluída.

### F2507 · W3.2 Fluxos de nutrição declarativos sobre workflow-executor com saved_filters

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Nutrição segmentada por saved_filters.
- **Fontes:** `docs/benchmark/RAMPER_2026-07.md:203`
- **O que falta:** Toda a integração entre saved_filters e workflow-executor para nutrição declarativa — nada construído, condizente com status 'planejado'.
- **Evidência:** Mesma verificação de F2494/F2496: 'saved_filters' não aparece em workflow-executor/index.ts nem execute-workflow/index.ts; workflow-executor nem está na allowlist ACTIVE.
- **Revisão:** sem contestação cética concluída.

### F3813 · /playbooks: Playbooks.tsx usa usePlaybooks() só para isLoading

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Playbooks.tsx:9 usa usePlaybooks() apenas para isLoading; conteúdo em components/playbooks/PlaybooksManager.
- **Fontes:** `docs/estado/01_FRONTEND_ROTAS.md:321-321`
- **O que falta:** rota /playbooks: não existe em src/routes/AppRoutes.tsx (rotas.json)
- **Evidência:** rota /playbooks: não existe em src/routes/AppRoutes.tsx (rotas.json)
- **Revisão:** sem contestação cética concluída.

### F3814 · Componente/tela FollowUpAudit (10 afirmações nos docs)

- **Tipo:** Rota/tela
- **O que os docs afirmam:** JÁ RESOLVIDO: FollowUpAudit.tsx:79-105 consulta só follow_up_audit_view.| JÁ RESOLVIDO. \| Etapa 63: FollowUpAudit.tsx:236. \| Auditoria de follow-up. UI: src/pages/FollowUpAudit.tsx / useFollowUpData.ts:108. Hook/Service: view follow_up_audit_view. Tabela/Function: follow_up_audit_logs. Linhas no banco: 0. O que falta: View existe, tabela-base vazia \| Leads inventados "Mariana Oliveira" e "Ricardo Santos"; :121 return [...mockLogs, ...(data \|\| [])] sempre mistura falso com real. \| Leads fictícios somados aos reais em tela. \| Remover mistura/fallback silencioso e exibir erro/estado vazio honestos. Saída esperada: testes sucesso, vazio e falha. Gate: nenhum DDL se view existir. \| Etapa…
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:17`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:61`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:15`, `docs/estado/02_DOMINIO_CRM_PIPELINE.md:69-69`, `docs/estado/01_FRONTEND_ROTAS.md:342-342`, `docs/estado/ESTADO_ATUAL.md:158` e mais 4
- **O que falta:** rota /FollowUpAudit não existe em src/routes/AppRoutes.tsx (rotas.json)
- **Evidência:** rota /FollowUpAudit não existe em src/routes/AppRoutes.tsx (rotas.json)
- **Revisão:** sem contestação cética concluída.

### F3819 · Rota /sdr (7 afirmações nos docs)

- **Tipo:** Rota/tela
- **O que os docs afirmam:** API.md declara a rota `/sdr` renderizando o componente SDRDashboard com acesso "autenticado".| Rota /sdr é uma das 8 cobertas por tests/e2e/pages-critical-routes.spec.ts. \| Dashboard específico para SDR. \| Dashboard SDR com métricas de ligações, e-mails, reuniões agendadas, volume vs resultados, taxa de conexão/agendamento e progresso de metas de atividades. \| Rota registrada em AppRoutes.tsx com acesso "autenticado", GET em produção 200, chamando as edge functions dialer-queue-builder, enrich-lead, twilio-click-to-call. Status no doc: BLOQUEADO: edge twilio-click-to-call indisponível \| Rota /sdr (AppRoutes.tsx:113) renderiza src/pages/SDRDashboard.tsx; sem role explícito (só autenticaç…
- **Fontes:** `docs/API.md:290-290`, `docs/testes/suites-ci.md:102-104`, `docs/FUNCIONALIDADES_COMPLETAS.md:56-56`, `docs/FUNCIONALIDADES_SISTEMA.md:54-59; docs/FUNCIONALIDADES_SISTEMA.md:474-474`, `docs/DOCUMENTACAO_SISTEMA.md:564-567`, `docs/prod-readiness.md:233` e mais 2
- **O que falta:** rota /sdr não existe em src/routes/AppRoutes.tsx (rotas.json)
- **Evidência:** rota /sdr não existe em src/routes/AppRoutes.tsx (rotas.json)
- **Revisão:** sem contestação cética concluída.

### F2509 · W2.3 Painel de deliverability por sequência

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Entregues/abertos/clicados/bounces/descadastros por sequência.
- **Fontes:** `docs/benchmark/RAMPER_2026-07.md:198`
- **O que falta:** Construir o painel consolidado por sequência usando email_tracking_events + email_opt_outs; hoje só existe um dashboard de e-mail genérico.
- **Evidência:** Não há componente/página com as 5 métricas (entregues/abertos/clicados/bounces/descadastros) agregadas POR SEQUÊNCIA. 'deliverability/entregabilidade' não aparece em src/; useEmailMetrics.ts (só usado em EmailMetricsDashboard.tsx) e useEmailTracking.ts não agregam por sequence_id.
- **Revisão:** sem contestação cética concluída.

### F3820 · Placeholder cadence_id em migration 20260508124844

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** cadence_id placeholder (mig/20260508124844:19).
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/F_banco_dados.md:269`
- **O que falta:** tabela/view "cadence_id" ausente do banco real (tables.md, views.md)
- **Evidência:** tabela/view "cadence_id" ausente do banco real (tables.md, views.md)
- **Revisão:** sem contestação cética concluída.

### F3821 · Tabela auth_users_view (6 afirmações nos docs)

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** NÃO INICIADO: FollowUpTerritoryRules.tsx:61,83; nenhuma migration cria a view.| Doc: 4 relações usadas em .from() sem definição em types.ts nem migrations. \| Doc: `db.from('auth_users_view')` — a view não existe em types.ts nem em migrations; select de vendedor fica vazio ou dá erro. \| FollowUpTerritoryRules consulta auth_users_view, ausente dos tipos gerados e das migrations. \| Relação literal auth_users_view chamada em FollowUpTerritoryRules, mas ausente nos bancos origem e destino. \| `src/components/settings/FollowUpTerritoryRules.tsx:82` (`db.from('auth_users_view').select('id, display_name')`) e `:60` (join `salesperson:auth_users_view(display_name)`); view não existe nas 432 de pu…
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:237`, `docs/auditoria/MATRIZ_FORENSE_BANCOS_E_CONTRATOS_2026-08-26.md:282-284`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/D_frontend.md:20-20`, `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:238-238`, `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:212-219`, `docs/estado/09_HOOKS_SERVICES.md:264-273`
- **O que falta:** tabela/view "auth_users_view" ausente do banco real (tables.md, views.md)
- **Evidência:** tabela/view "auth_users_view" ausente do banco real (tables.md, views.md)
- **Revisão:** sem contestação cética concluída.

### F3823 · Templates por step de cadência

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Cada passo tem template de mensagem.
- **Fontes:** `docs/FUNCIONALIDADES_COMPLETAS.md:185-185`
- **O que falta:** coluna template ausente em tables/public/cadence_steps.md (tabela existe)
- **Evidência:** coluna template ausente em tables/public/cadence_steps.md (tabela existe)
- **Revisão:** sem contestação cética concluída.

### F3824 · Tipos de step de cadência: email, call, task, linkedin, whatsapp

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Cinco tipos de passo.
- **Fontes:** `docs/FUNCIONALIDADES_COMPLETAS.md:184-184`
- **O que falta:** coluna type ausente em tables/public/cadence_steps.md (tabela existe)
- **Evidência:** coluna type ausente em tables/public/cadence_steps.md (tabela existe)
- **Revisão:** sem contestação cética concluída.

### F2515 · Smoke test E2E do motor de sequências (W1.1)

- **Tipo:** Teste
- **O que os docs afirmam:** Nenhum teste em tests/ cita sequence-runner, sequence_enrollments ou SequenceBuilder.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:47`
- **O que falta:** Teste E2E (Playwright em tests/e2e/ ou Deno integrado) que cria uma sequence, inscreve em sequence_enrollments, invoca sequence-runner e confirma linhas em sequence_step_executions e outbound_messages.
- **Evidência:** grep -rl 'sequence-runner\|sequence_enrollments\|SequenceBuilder' tests/ → 0 resultados. Em todo o repo, só 3 arquivos citam esses termos em teste: supabase/functions/sequence-runner/integrity_test.ts, send-multichannel-message/authz_test.ts e _shared/cors_lint_test.ts — nenhum é E2E. integrity_test.ts (119 linhas) apenas lê o texto-fonte de index.ts via Deno.readTextFile e faz asserções sobre trechos de código, sem criar sequência, inscrever contato, rodar o runner nem consultar sequence_enrollments/outbound_messages reais. Tabelas sequence_enrollments e outbound_messages existem no banco real (tables/public/sequence_enrollments.md, outbound_messages.md) mas nenhum teste as exercita ponta a ponta.| cético: Ausente: grep -rliE 'sequence-runner\|sequence_enrollments\|SequenceBuilder\|sequence_step_executions\|outbound_messages' tests e2e supabase/tests → 0 arquivos de teste (só aparecem …

### F2518 · W1.1 Smoke test end-to-end do motor de cadência em produção

- **Tipo:** Teste
- **O que os docs afirmam:** Criar sequência → inscrever → rodar sequence-runner → confirmar sequence_step_executions e outbound_messages.
- **Fontes:** `docs/benchmark/RAMPER_2026-07.md:190`
- **O que falta:** Executar e documentar o smoke test de produção (criar sequência, inscrever, rodar sequence-runner) e confirmar linhas reais em sequence_step_executions e outbound_messages. Hoje as duas estão vazias.
- **Evidência:** grep -rln 'sequence_step_executions' scripts/ supabase/ src/ tests/ só retorna migrations, supabase/schema.sql, src/integrations/supabase/types.ts e código de runtime (sequence-runner/index.ts, webhooks de inbound) — nenhum arquivo de teste/script de smoke test. Não existe script algum (CI, scripts/, docs/) que crie sequência → inscreva → rode sequence-runner → confirme registros reais em sequence_step_executions e outbound_messages em produção.| cético: Não existe script nem teste de smoke: grep em tests, e2e, supabase/tests e scripts por sequence_step_executions/outbound_messages → 0 arquivos de teste. Evidência nova do banco real: stats.md:225 mostra public.sequence_step_executions com 0 linhas e stats.md:152 mostra public.outbound_messages com 0 linhas. Ou seja, nenhuma execução controlada deixou registro em produção, mesmo com o cron sequence-runner-5min ativo (cron.md:40).

### F2519 · Auto-enroll: seed de regra padrão em cadence_enrollment_rules e log

- **Tipo:** Trigger
- **O que os docs afirmam:** NÃO INICIADO: trigger ativo, cadence_enrollment_rules vazia, sem log; nenhuma migration pós-auditoria toca a tabela.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:103`
- **O que falta:** Migration semeando uma regra padrão em cadence_enrollment_rules. Log persistente (tabela ou evento) do caso sem regra, tanto em private.auto_enroll_in_cadence quanto em auto-enroll-cadence/index.ts.
- **Evidência:** Tabela cadence_enrollment_rules existe no banco real, com RLS (2 policies, tables/public/cadence_enrollment_rules.md) mas 0 linhas (stats.md:247 → 'public.cadence_enrollment_rules| 0 \| 32.0 KB \| ...'). grep -rn 'INSERT INTO.*cadence_enrollment_rules' supabase/migrations/ → 0 resultados; todas as migrations que tocam a tabela (20260416, 20260511, 20260513, 20260708) são de antes da auditoria (30/08/2026), nenhuma posterior. O caminho de uso existe (find_matching_cadence_rule RPC + supabase/functions/auto-enroll-cadence/index.ts:84-95, na allowlist ACTIVE de .github/workflows/deploy.yml:144), mas quando nenhuma regra casa (noMatchIds) o código só devolve reason: "no_match" na resposta JSON (index.ts:150) — não grava em nenhuma tabela/log persistente, e não há console.log/console.error nesse caminho (só no catch de erro, linha 164). \| cético: O trigger está ativo: triggers.md:280 (sales…

### F3825 · Função de trigger `trg_process_email_tracking_event`

- **Tipo:** Trigger
- **O que os docs afirmam:** API.md lista a function SQL `trg_process_email_tracking_event` com última definição em 20260513192524_0d483376-feda-4a3b-8407-4904a6a0b6d1.sql, grants "—" e uso no front "—".
- **Fontes:** `docs/API.md:755-755`
- **O que falta:** trigger trg_process_email_tracking_event ausente (triggers.md)
- **Evidência:** trigger trg_process_email_tracking_event ausente (triggers.md)
- **Revisão:** sem contestação cética concluída.

### F3826 · Função de trigger `trg_recompute_engagement`

- **Tipo:** Trigger
- **O que os docs afirmam:** API.md lista a function SQL `trg_recompute_engagement` com última definição em 20260417105640_f90fe72d-ce4d-4999-9ab0-239b02795e32.sql, grants "—" e uso no front "—".
- **Fontes:** `docs/API.md:756-756`
- **O que falta:** trigger trg_recompute_engagement ausente (triggers.md)
- **Evidência:** trigger trg_recompute_engagement ausente (triggers.md)
- **Revisão:** sem contestação cética concluída.

## Parcial (70)

### F2425 · Salvar limite de rejeição do SDR (SDRAlertHistory)

- **Tipo:** Ação/botão
- **O que os docs afirmam:** Doc: "salvar" só mostra toast e não persiste.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/D_frontend.md:52-52`
- **O que falta:** mover o limite para uma tabela/config real (ex. notification_preferences, já usada para o 'Limiar' de dias no mesmo componente) para persistir entre dispositivos e ser lido por function de alerta no backend, em vez de localStorage por navegador.
- **Evidência:** src/components/sdr/SDRAlertHistory.tsx:188-199 — 'Salvar limite de rejeição' já não é só toast: grava em localStorage.setItem('sdr_rejection_threshold',...) (linha 191). Mas é persistência só no navegador: SDRDashboard.tsx:179-189 lê o mesmo localStorage só para um toast client-side; ausente: grep -rln "sdr_rejection_threshold" supabase/functions/ → 0 resultados — nenhuma function de alerta no backend lê esse limite.
- **Revisão:** sem contestação cética concluída.

### F3772 · [SDR] Engajamento — score de contato (IMPLEMENTADO_PARCIAL)

- **Tipo:** Componente
- **O que os docs afirmam:** Engajamento — score de contato. UI: src/components/engagement/EngagementScoreCard.tsx. Hook: useEngagementScore.ts:50,95,102. Edge/Tabela: engagement-score-recompute (42 l), rpc recompute_engagement_score / contact_engagement_score. Linhas no banco: 0 (ins 0). Quem dispara: usuário. O que falta: RPC e edge existem; nunca executados. Sem cron
- **Fontes:** `docs/estado/03_DOMINIO_SDR_CADENCIAS.md:283-283`
- **O que falta:** Não há cron de recálculo: grep engagement cron.md → 0. As tabelas estão vazias (stats.md:89 contact_engagement_score = 0), então a feature nunca rodou em produção. O card descrito no doc não existe mais.
- **Evidência:** O card EngagementScoreCard foi apagado no commit 89aacaff8 (#285, git show --stat: src/components/engagement/EngagementScoreCard.tsx -128). O score continua por outro caminho. src/hooks/engagement/useEngagementScore.ts:49-61 lê contact_engagement_score e engagement_score_history. EngagementBadgeForContact.tsx:14 usa o hook; o badge é montado em SequenceEnrollmentsDrawer.tsx:54, que SequencesPage.tsx:38,125 importa. useRecomputeContactEngagement (useEngagementScore.ts:103-110) invoca engagement-score-recompute, que está na allowlist (deploy.yml:144). Esse hook é usado em EngagementLeaderboardWidget.tsx:19, importado em AnalyticsModule.tsx:9. RPC recompute_engagement_score existe (functions.md:307). contact_engagement_score tem RLS (tables.md:103). Trigger trg_recompute_engagement_on_signal existe (triggers.md:111).
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Não implementado.

### F2426 · [SDR] Enriquecimento de lead (IMPLEMENTADO_PARCIAL)

- **Tipo:** Componente
- **O que os docs afirmam:** Enriquecimento de lead. UI: —. Hook: useLeadEnrichment.ts:10. Edge/Tabela: enrich-lead (142 l). Linhas no banco: —. Quem dispara: usuário (botão). O que falta: Implementada; sem tabela de destino verificável com dado
- **Fontes:** `docs/estado/03_DOMINIO_SDR_CADENCIAS.md:291-291`
- **O que falta:** integrar provedor de enriquecimento validado em enrich-lead/index.ts e definir tabela(s) de destino reais; hoje a function está propositalmente desativada (503) e nenhuma linha é gravada em produção.
- **Evidência:** Fio completo existe: RecentProspects.tsx usa useLeadEnrichment (src/hooks/sdr/useLeadEnrichment.ts:18-47) que invoca 'enrich-lead' (allowlist ACTIVE, deploy.yml:144). Porém supabase/functions/enrich-lead/index.ts:35-48 retorna sempre 503 'enrichment_provider_not_configured' e não grava nada, por decisão deliberada (comentário linhas 35-39: versão anterior inventava dados e corrompia indicadores); commit 996c70197 'fix(enrichment): bloquear dados simulados (#128)'.
- **Revisão:** sem contestação cética concluída.

### F2429 · Email marketing campaigns (newsletters, drip)

- **Tipo:** Componente
- **O que os docs afirmam:** Falta campanhas de e-mail marketing.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:85`
- **O que falta:** adicionar agendamento e conceito de campanha para base segmentada; hoje é disparo imediato ad-hoc, não newsletter/drip com opt-out dedicado.
- **Evidência:** Existe envio em massa: useBulkComposer.ts chama 'email-composer-bulk' e 'email-bulk-send' (ambas allowlist ACTIVE, deploy.yml:144), grava em email_bulk_jobs (RLS=sim, tables.md:144) e email_bulk_drafts; UI em /engagement/bulk-composer (BulkComposer.tsx) com métricas de enviados/falhas (useBulkComposer.ts:163-180). Mas não há agendamento: ausente: grep "schedule" em useBulkComposer.ts → 0 resultados; envio é imediato para sale_ids escolhidos manualmente, não newsletter/drip recorrente para uma base.
- **Revisão:** sem contestação cética concluída.

### F3774 · UI de remetente/domínio de e-mail

- **Tipo:** Componente
- **O que os docs afirmam:** Sem UI de remetente/domínio.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:140`
- **O que falta:** Falta uma tela geral de remetente e de domínio, com verificação de domínio (DNS/SPF/DKIM). O remetente das campanhas depende da env ou do campo do alerta de churn.
- **Evidência:** Só existe campo de remetente na tela de alertas de churn. src/pages/AdminAlertasChurn.tsx:333-340 tem o campo 'Remetente (From)' (email_from), e a rota está em AppRoutes.tsx:485. Quem consome é send-churn-alert-email/index.ts:93-99. Como fallback do envio em massa, email-bulk-send/index.ts:90-96 e email-bulk-retry/index.ts:141-147 usam a env BULK_EMAIL_FROM ou churn_alert_settings.email_from. AdminAlertasChurn.tsx:327-329 manda configurar o domínio fora do app. Ausente: grep -rn 'SenderDomain\|sender_domain\|email_domain' src → 0.
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Não implementado.

### F2442 · UI para sdr-consecutive-alerts: configuração de thresholds pelo gestor

- **Tipo:** Componente
- **O que os docs afirmam:** Falta configuração de thresholds pelo gestor.
- **Fontes:** `docs/FUNCIONALIDADES_SEM_UI.md:99`
- **O que falta:** Publicar `sdr-consecutive-alerts` na allowlist ACTIVE e configurar RESEND_API_KEY nas Edge Function Secrets para o cron ter efeito real.
- **Evidência:** UI real existe: src/components/sdr/SDRAlertHistory.tsx:42-83 lê/grava `notification_preferences.consecutive_days_threshold`, mesma coluna lida por supabase/functions/sdr-consecutive-alerts/index.ts:389-398; montada em src/pages/SDRDashboard.tsx:620 e src/pages/Notificacoes.tsx:339. Porém `sdr-consecutive-alerts` NÃO está na allowlist ACTIVE de .github/workflows/deploy.yml:144, confirmado por docs/prod-readiness.md:1018 (B1) como função não publicada — não roda em produção mesmo com cron ativo (cron 82, cron.md:45, é fire-and-forget).
- **Revisão:** sem contestação cética concluída.

### F3779 · Envio no horário ótimo: process-scheduled-sends agendado

- **Tipo:** Agendamento (cron)
- **O que os docs afirmam:** schedule-optimal-send grava scheduled_sends; process-scheduled-sends consome a fila mas não tem cron nem chamador. DIVERGENTE.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:50`
- **O que falta:** Falta incluir process-scheduled-sends e schedule-optimal-send no deploy (allowlist). Hoje nenhum item de scheduled_sends é despachado. O 'succeeded' do cron só indica que o net.http_post foi enfileirado.
- **Evidência:** O cron existe: cron.md:42 tem o job 79 process-scheduled-sends-15min, '*/15', rodando trigger_internal_edge_job('process-scheduled-sends'). cron-runs.md:313 registra execuções. Porém process-scheduled-sends e schedule-optimal-send estão fora da allowlist de 100 (deploy.yml:144; grep -cw nas 100 entradas → 0 para os dois). Por isso o POST cai numa function não publicada. scheduled_sends tem 0 linhas (stats.md:224).
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Não implementado.

### F2450 · Runbook de e-mail sem SendGrid (provedor é Resend)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Runbook cita SendGrid, que não é usado.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:140`
- **O que falta:** Reescrever o runbook removendo SendGrid como provedor de envio (mantendo só se for de fato verificação de assinatura inbound, com essa distinção clara).
- **Evidência:** docs/runbooks/email-transacional.md:1,18,30,33,46,54 ainda cita SendGrid como provedor lado a lado com Resend. Código só envia via Resend: `grep api.resend.com supabase/functions` → 6 arquivos; `grep api.sendgrid.com` → 0. SendGrid só aparece em verificação de assinatura de webhook inbound (_shared/webhook-auth.ts).
- **Revisão:** sem contestação cética concluída.

### F2452 · Secret de edge RESEND_API_KEY

- **Tipo:** Doc/config
- **O que os docs afirmam:** Doc lista o secret `RESEND_API_KEY` — API Key do Resend (emails) — como configurado nas Edge Functions.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:1687-1698`
- **O que falta:** Dono cadastrar RESEND_API_KEY em Supabase → Edge Functions → Secrets.
- **Evidência:** Código lê `Deno.env.get("RESEND_API_KEY")` em 11+ edge functions (ex. access-denied-alerts/index.ts:13). docs/prod-readiness.md:1019 (B2, validação 2026-11-13) registra que o segredo está AUSENTE das Edge Function Secrets do Supabase ("existe só como secret do GitHub Actions, criado em 2026-11-11"), provado por OPTIONS→500 em access-denied-alerts/broadcast-sale-notification (docs/prod-readiness.md:262,286). stats.md:195 mostra `email_logs` com 0 linhas em produção (snapshot 2026-11-20).
- **Revisão:** sem contestação cética concluída.

### F2453 · Secret RESEND_API_KEY configurado nas Edge Functions (B2)

- **Tipo:** Doc/config
- **O que os docs afirmam:** access-denied-alerts/index.ts:14 e broadcast-sale-notification/index.ts:10 fazem throw new Error("RESEND_API_KEY is not configured") no topo do módulo → 500 WORKER_ERROR; segredo existe só no GitHub Actions (2026-11-11). Causa NÃO VERIFICADA por log.
- **Fontes:** `docs/prod-readiness.md:1011`
- **O que falta:** Configurar RESEND_API_KEY nas Edge Function Secrets; depois reenviar e-mail de teste e confirmar entrega via Resend.
- **Evidência:** Confirmado: access-denied-alerts/index.ts:13-14 e broadcast-sale-notification/index.ts:9-10 fazem throw no topo do módulo se RESEND_API_KEY ausente. docs/prod-readiness.md:262,286 registram teste real (OPTIONS→500 WORKER_ERROR) em produção; :1019 atribui a causa ao segredo ausente nas Edge Functions (só existe no GitHub Actions).
- **Revisão:** sem contestação cética concluída.

### F2454 · Segredo RESEND_API_KEY lido por 9 edge function(s)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Envio de e-mail. Doc extrai via grep de Deno.env.get; não verifica se o segredo está configurado no projeto.
- **Fontes:** `docs/estado/10_EDGE_FUNCTIONS.md:125-136`
- **O que falta:** Configurar o segredo em produção (mesma ação de F2452/F2453).
- **Evidência:** `grep -rln RESEND_API_KEY supabase/functions` retorna 11 arquivos de função, próximo da contagem "9" do doc. O segredo está confirmadamente ausente das Edge Function Secrets em produção (docs/prod-readiness.md:1019), então as funções com leitura no topo do módulo quebram (500) e as demais falham funcionalmente ao enviar.
- **Revisão:** sem contestação cética concluída.

### F3782 · Edge function inbound-email-webhook (23 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** Doc aponta ausência de dedupe persistente (webhook-integrity.ts:4-5) e propõe plugar inbound-email-webhook e twilio-call-status em webhook_inbound_dedupe (chave MessageSid).| O config local marca inbound-email-webhook sem JWT (verify_jwt=false). \| Mantêm service_role por não haver sessão de usuário. \| Email — webhook de entrada (bounce/reply). UI: —. Hook: —. Edge/Tabela: inbound-email-webhook (151 l). Linhas no banco: 0. Quem dispara: provedor externo. O que falta: Não está em config.toml → Resend/SendGrid receberiam 401 \| inbound-email-webhook/index.ts:159 chama auto_pause_enrollment, movida para private (mig/20260619143950) sem recriação em public; config.toml não expõe private, então…
- **Fontes:** `docs/auditoria/AUDITORIA_TECNICA_EXAUSTIVA_2026-09-02.md:157,166,576`, `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:190-190`, `docs/SEC-08_SERVICE_ROLE_AUDIT.md:31`, `docs/estado/03_DOMINIO_SDR_CADENCIAS.md:281-281`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/F_banco_dados.md:97,294`, `docs/benchmark/RAMPER_2026-07.md:68` e mais 17
- **O que falta:** Não dá para verificar se o webhook está cadastrado no painel Resend/SendGrid nem se RESEND_WEBHOOK_SECRET está configurado. inbound_reply_events e email_tracking_events têm 0 linhas (stats.md:150,108). Não invoca sequence-record-reply (ela foi replicada inline em index.ts:372-395).
- **Evidência:** supabase/functions/inbound-email-webhook/index.ts existe; está na allowlist de deploy (.github/workflows/deploy.yml:144); ÓRFÃ: nenhum chamador no front, em edges ou em SQL/cron (edge-functions.json)| cético: Várias afirmações do doc estão desatualizadas. A function está na allowlist (deploy.yml:144) e tem verify_jwt=false em config.toml:60-61. A assinatura Svix/Resend e SendGrid é verificada em _shared/webhook-auth.ts:362-401 (RESEND_WEBHOOK_SECRET em :390) e chamada em inbound-email-webhook/index.ts:202-209. public.auto_pause_enrollment existe no banco (functions.md:94, grant service_role), então a chamada em index.ts:372 não falha. Tem dedupe por upsert onConflict provider,message_id (index.ts:322-340). Ser "órfã" é esperado num webhook externo.

### F3783 · Edge function process-scheduled-sends (9 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** PARCIAL (14/24 ainda órfãs): process-scheduled-sends segue com 0 chamadores.| 60 linhas; chamador: **nenhum**; verify_jwt true (default); tabelas tocadas (linhas em produção): scheduled_sends(0). Classificação do doc: MORTO_OU_ABANDONADO (sem chamador). \| Envios agendados. UI: src/components/engagement/SendTime/ScheduledSendsPanel.tsx. Hook: —. Edge/Tabela: process-scheduled-sends (60 l) / scheduled_sends. Linhas no banco: 0 (ins 0). Quem dispara: NINGUÉM. O que falta: Fila sem consumidor. Função implementada, 0 chamadores, 0 cron \| Catálogo API.md lista a edge function `process-scheduled-sends` na categoria "Cadências / Workflows" com auth "segredo interno (cron/service_role) · verify_jw…
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:267`, `docs/estado/10_EDGE_FUNCTIONS.md:414-414`, `docs/estado/03_DOMINIO_SDR_CADENCIAS.md:270-270`, `docs/API.md:95-95`, `docs/estado/03_DOMINIO_SDR_CADENCIAS.md:199-199`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:145-145` e mais 3
- **O que falta:** Falta incluir process-scheduled-sends na allowlist de deploy (ou removê-la e desligar o cron 79). Hoje o cron dispara a cada 15 min para uma function não publicada.
- **Evidência:** supabase/functions/process-scheduled-sends/index.ts existe; FORA da allowlist de deploy (.github/workflows/deploy.yml:144) → não roda em produção; ÓRFÃ: nenhum chamador no front, em edges ou em SQL/cron (edge-functions.json)| cético: A pré-checagem errou ao dizer "sem chamador em SQL/cron": existe o cron 79 process-scheduled-sends-15min (cron.md:42). O veredito PARCIAL se mantém porque a function está fora da allowlist (deploy.yml:144; grep -cx 'process-scheduled-sends' → 0), então não roda em produção. scheduled_sends tem 0 linhas (stats.md:224).

### F3784 · Edge function schedule-optimal-send (4 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** Catálogo API.md lista a edge function `schedule-optimal-send` na categoria "Cadências / Workflows" com auth "JWT do usuário · verify_jwt", método "qualquer", payload "sale_id, channel, payload, force_now" e resposta "JSON {error, id, scheduled_for}".| supabase/functions/schedule-optimal-send implementada (não é stub). Quem dispara: src/hooks/engagement/useSendTimeOptimization.ts:79. Sem cron. \| 85 linhas; chamador: FE src/hooks/engagement/useSendTimeOptimization.ts +1; verify_jwt true (default); tabelas tocadas (linhas em produção): scheduled_sends(0). Classificação do doc: PARCIAL. \| supabase/functions/schedule-optimal-send existe no repo (citada em src/: sim); sonda OPTIONS em produção:…
- **Fontes:** `docs/API.md:96-96`, `docs/estado/03_DOMINIO_SDR_CADENCIAS.md:200-200`, `docs/estado/10_EDGE_FUNCTIONS.md:435-435`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:166-166`, `docs/prod-readiness.md:390`
- **O que falta:** Falta deployar a function (fora da allowlist de 100); o botão do front recebe 404 em produção.
- **Evidência:** supabase/functions/schedule-optimal-send/index.ts existe; FORA da allowlist de deploy (.github/workflows/deploy.yml:144) → não roda em produção; chamada por: src/hooks/sequences/useSendTimeOptimization.ts| cético: supabase/functions/schedule-optimal-send/index.ts existe e é chamada por src/hooks/sequences/useSendTimeOptimization.ts. O hook é usado em BulkComposerWizard.tsx:30 e ScheduledSendsPanel.tsx:10. Mas está fora da allowlist (deploy.yml:144; grep -cx → 0). scheduled_sends tem 0 linhas (stats.md:224).

### F3785 · Edge function sdr-consecutive-alerts (5 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** Catálogo API.md lista a edge function `sdr-consecutive-alerts` na categoria "Alertas / Monitoramento" com auth "nenhuma detectada no handler · verify_jwt", método "qualquer", payload "—" e resposta "JSON {success, message, error}".| Doc lista a edge function `sdr-consecutive-alerts` (#21) — alertas consecutivos SDR. Auth: Service. \| 480 linhas; chamador: FE src/components/sdr/TestSDRAlertButton.tsx; verify_jwt true (default); tabelas tocadas (linhas em produção): email_logs(0), sdr_alert_history(0). Classificação do doc: PARCIAL. \| supabase/functions/sdr-consecutive-alerts existe no repo (citada em src/: sim); sonda OPTIONS em produção: OPTIONS → 404 NOT_FOUND (não publicada; limite de 10…
- **Fontes:** `docs/API.md:43-43`, `docs/FUNCIONALIDADES_COMPLETAS.md:686-686`, `docs/FUNCIONALIDADES_SISTEMA.md:529-529; docs/FUNCIONALIDADES_SISTEMA.md:335-335`, `docs/FUNCIONALIDADES_SEM_UI.md:99`, `docs/DOCUMENTACAO_SISTEMA.md:992-1021`, `docs/estado/10_EDGE_FUNCTIONS.md:438-438` e mais 3
- **O que falta:** Falta deployar sdr-consecutive-alerts. Hoje o cron 82 e o botão de teste chamam uma function não publicada.
- **Evidência:** supabase/functions/sdr-consecutive-alerts/index.ts existe; FORA da allowlist de deploy (.github/workflows/deploy.yml:144) → não roda em produção; chamada por: src/components/sdr/TestSDRAlertButton.tsx| cético: Existe o cron 82 sdr-consecutive-alerts-daily, `0 11 * * *` (cron.md:45), além do botão src/components/sdr/TestSDRAlertButton.tsx. Mas a function está fora da allowlist (deploy.yml:144; grep -cx → 0). sdr_alert_history tem 0 linhas (stats.md:394).

### F3786 · Edge function send-time-optimizer (7 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** Catálogo API.md lista a edge function `send-time-optimizer` na categoria "Cadências / Workflows" com auth "Bearer manual · verify_jwt", método "qualquer", payload "sale_ids, recompute_all" e resposta "JSON {error}".| supabase/functions/send-time-optimizer implementada (não é stub). Quem dispara: src/hooks/engagement/useSendTimeOptimization.ts:53. Sem cron. \| 146 linhas; chamador: FE src/hooks/engagement/useSendTimeOptimization.ts; verify_jwt true (default); tabelas tocadas (linhas em produção): send_time_profiles(0). Classificação do doc: PARCIAL. \| Doc classifica como REAL. Chamador(es): FE hooks/engagement/useSendTimeOptimization.ts:36. Só SUPABASE_*. \| supabase/functions/send-time-opt…
- **Fontes:** `docs/API.md:97-97`, `docs/estado/03_DOMINIO_SDR_CADENCIAS.md:201-201`, `docs/estado/10_EDGE_FUNCTIONS.md:450-450`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:181-181`, `docs/prod-readiness.md:405`, `docs/benchmark/RAMPER_2026-07.md:54` e mais 1
- **O que falta:** Falta deployar a function (fora da allowlist) e criar um cron de recálculo.
- **Evidência:** supabase/functions/send-time-optimizer/index.ts existe; FORA da allowlist de deploy (.github/workflows/deploy.yml:144) → não roda em produção; chamada por: src/hooks/engagement/useSendTimeOptimization.ts| cético: supabase/functions/send-time-optimizer/index.ts existe e é chamada por src/hooks/engagement/useSendTimeOptimization.ts. Está fora da allowlist (deploy.yml:144; grep -cx → 0). Não tem cron (cron.md). send_time_profiles tem 0 linhas (stats.md:398).

### F3787 · Edge function sequence-ab-promote (6 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** Catálogo API.md lista a edge function `sequence-ab-promote` na categoria "Cadências / Workflows" com auth "JWT do usuário · verify_jwt", método "qualquer", payload "—" e resposta "JSON {error, ok}".| supabase/functions/sequence-ab-promote implementada (não é stub). Quem dispara: src/hooks/sequences/usePromoteWinners.ts:9 (botão). Sem cron. \| Doc classifica como REAL. Chamador(es): FE hooks/sequences/usePromoteWinners.ts:9. Wrapper de RPC. \| 58 linhas; chamador: FE src/hooks/sequences/usePromoteWinners.ts; verify_jwt true (default); tabelas tocadas (linhas em produção): nenhuma. Classificação do doc: SUGERIDO_OU_INICIADO (esqueleto). \| supabase/functions/sequence-ab-promote existe no repo…
- **Fontes:** `docs/API.md:98-98`, `docs/estado/03_DOMINIO_SDR_CADENCIAS.md:192-192`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:183-183`, `docs/estado/10_EDGE_FUNCTIONS.md:451-451`, `docs/prod-readiness.md:407`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/F_banco_dados.md:97,294`
- **O que falta:** Falta deployar sequence-ab-promote.
- **Evidência:** supabase/functions/sequence-ab-promote/index.ts existe; FORA da allowlist de deploy (.github/workflows/deploy.yml:144) → não roda em produção; chamada por: src/hooks/sequences/usePromoteWinners.ts| cético: A afirmação do doc de que a "RPC falha por estar em private" está superada: public.auto_promote_sequence_winners existe (functions.md:95, grant authenticated, service_role). Mesmo assim, sequence-ab-promote está fora da allowlist (deploy.yml:144; grep -cx → 0) e o chamador src/hooks/sequences/usePromoteWinners.ts recebe 404 em produção.

### F3788 · Edge function sequence-enroll (7 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** Catálogo API.md lista a edge function `sequence-enroll` na categoria "Cadências / Workflows" com auth "JWT do usuário · verify_jwt", método "qualquer", payload "sequence_id, contacts" e resposta "JSON {error, ok, enrolled, skipped_duplicates}".| supabase/functions/sequence-enroll implementada (não é stub). Quem dispara: src/hooks/sequences/useEnrollContacts.ts:14 (ação do usuário). Sem cron. \| 110 linhas; chamador: FE src/hooks/sequences/useEnrollContacts.ts; verify_jwt true (default); tabelas tocadas (linhas em produção): sequence_enrollments(0). Classificação do doc: PARCIAL. \| Doc classifica como REAL. Chamador(es): FE hooks/sequences/useEnrollContacts.ts:14. Aceita contact_type "lead"…
- **Fontes:** `docs/API.md:99-99`, `docs/estado/03_DOMINIO_SDR_CADENCIAS.md:190-190`, `docs/estado/10_EDGE_FUNCTIONS.md:452-452`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:184-184`, `docs/prod-readiness.md:408`, `docs/agentes/mapa-do-sistema.md:48` e mais 1
- **O que falta:** Falta deployar sequence-enroll; a matrícula pela UI não funciona em produção.
- **Evidência:** supabase/functions/sequence-enroll/index.ts existe; FORA da allowlist de deploy (.github/workflows/deploy.yml:144) → não roda em produção; chamada por: src/hooks/sequences/useEnrollContacts.ts| cético: supabase/functions/sequence-enroll/index.ts existe e é chamada por src/hooks/sequences/useEnrollContacts.ts. Está fora da allowlist (deploy.yml:144; grep -cx → 0). sequence_enrollments tem 0 linhas (stats.md:162).

### F3789 · Edge function sequence-record-reply (14 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** PARCIAL (14/24 ainda órfãs): sequence-record-reply segue com 0 chamadores.| Sequências — registro de resposta. UI: —. Hook: —. Edge/Tabela: sequence-record-reply (100 l). Linhas no banco: 0. Quem dispara: NINGUÉM. O que falta: Função órfã: 0 chamadores em src/ e em migrations \| Catálogo API.md lista a edge function `sequence-record-reply` na categoria "Cadências / Workflows" com auth "JWT do usuário · verify_jwt", método "qualquer", payload "—" e resposta "JSON {error, ok}". \| supabase/functions/sequence-record-reply implementada (não é stub). Quem dispara: NINGUÉM — 0 referências em src/, 0 em migrations. Sem cron. \| 100 linhas; chamador: **nenhum**; verify_jwt true (default); tabelas t…
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:267`, `docs/estado/03_DOMINIO_SDR_CADENCIAS.md:268-268`, `docs/API.md:100-100`, `docs/estado/03_DOMINIO_SDR_CADENCIAS.md:191-191`, `docs/estado/10_EDGE_FUNCTIONS.md:453-453`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:185-185` e mais 8
- **O que falta:** Falta decidir entre remover a function (a lógica já vive no inbound-email-webhook) ou deployá-la e ligá-la. Hoje é código morto.
- **Evidência:** supabase/functions/sequence-record-reply/index.ts existe; FORA da allowlist de deploy (.github/workflows/deploy.yml:144) → não roda em produção; ÓRFÃ: nenhum chamador no front, em edges ou em SQL/cron (edge-functions.json)| cético: A function está fora da allowlist (deploy.yml:144; grep -cx → 0) e não tem chamador em src/ nem em cron.md. O próprio inbound-email-webhook/index.ts:72-75 registra que ela "não está deployada" e replica a lógica inline: sinal de reply em :86 e :316-327, pausa e replied_at em :372-395.

### F3790 · Edge function whatsapp-inbound-webhook (2 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** supabase/functions/whatsapp-inbound-webhook existe no repo (citada em src/: não); sonda OPTIONS em produção: OPTIONS → 404 NOT_FOUND (não publicada; limite de 100 funções do plano). Status no doc: BLOQUEADO.| Webhook de entrada WhatsApp via Evolution API.
- **Fontes:** `docs/prod-readiness.md:426`, `docs/FEATURE_SUMMARY.md:90-92`
- **O que falta:** Falta deployá-la e cadastrar a URL na Evolution API (painel externo, não verificável).
- **Evidência:** supabase/functions/whatsapp-inbound-webhook/index.ts existe; FORA da allowlist de deploy (.github/workflows/deploy.yml:144) → não roda em produção; ÓRFÃ: nenhum chamador no front, em edges ou em SQL/cron (edge-functions.json)| cético: supabase/functions/whatsapp-inbound-webhook/index.ts existe e tem verify_jwt=false com segredo próprio (config.toml:69-71). Mas está fora da allowlist (deploy.yml:144; grep -cx → 0), então não roda em produção.

### F3791 · Jobs administrativos de e-mail e alerta exigem service role interna ou papel admin

- **Tipo:** Edge function
- **O que os docs afirmam:** Doc: jobs administrativos exigem service role interna ou papel administrativo real; cron legado com token anônimo não deve ser reenviado antes da troca de credencial.
- **Fontes:** `docs/auditoria/EXECUCAO_ONDA_0_2026-08-26.md:18`
- **O que falta:** O critério exige cron.job sem token anônimo, e ele não é cumprido. Falta migrar o job 26 para trigger_internal_edge_job('email-bulk-retry') ou mandar o X-Cron-Secret.
- **Evidência:** As functions rejeitam chamadas sem permissão. email-bulk-retry/index.ts:58-88 aceita isAuthorizedCronRequest, que passa com Authorization service_role (internal-service-auth.ts:44-48) ou X-Cron-Secret (cron-request-auth.ts:11-22). Fora isso, exige admin/gestor e devolve 401/403. send-churn-alert-email/index.ts:24-30 e :66-76 exige is_admin_or_manager. Porém o cron legado 26 email-bulk-retry-15min (cron.md:23) ainda manda só o header 'apikey' anon, sem Authorization e sem X-Cron-Secret, e pelo código cai em 401. Os 'succeeded' em cron-runs.md:146-151 só refletem o net.http_post enfileirado.
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Não implementado.

### F3792 · Pixel de abertura de e-mail

- **Tipo:** Edge function
- **O que os docs afirmam:** Gap: nenhum produtor de evento de abertura.
- **Fontes:** `docs/benchmark/RAMPER_2026-07.md:66`
- **O que falta:** Não há function de pixel próprio, que é o critério. A abertura depende do open tracking ativo no Resend e do webhook cadastrado (não verificável). email_tracking_events tem 0 linhas (stats.md:108).
- **Evidência:** Existe produtor de evento de abertura pelo webhook do provedor. _shared/webhook-integrity.ts:86 normaliza 'open'. inbound-email-webhook/index.ts:35 mapeia open para 'opened'. :118-175 (recordEmailTelemetry, chamada em :263) grava email_tracking_events e chama record_engagement_signal (:179). A function está na allowlist. Ausente: ls supabase/functions| grep -i pixel → 0.
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Não implementado.

### F3793 · Rastreio de clique (link wrapping/redirect)

- **Tipo:** Edge function
- **O que os docs afirmam:** Gap: nenhum redirecionador implementado.
- **Fontes:** `docs/benchmark/RAMPER_2026-07.md:67`
- **O que falta:** Não há redirecionador próprio nem reescrita de links no envio, que é o critério. O clique depende do click tracking do Resend e do webhook cadastrado (não verificável). email_tracking_events tem 0 linhas.
- **Evidência:** O clique é registrado pelo webhook do provedor. webhook-integrity.ts:85 normaliza 'click'. inbound-email-webhook/index.ts:35 mapeia click para 'clicked'. :96-103 (extractClickLink) e :157-175 gravam email_tracking_events com o link no metadata. Ausente: ls supabase/functions| grep -iE 'redirect\|click' → só twilio-click-to-call, sem relação.
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Não implementado.

### F3794 · Webhook de eventos de entrega do Resend

- **Tipo:** Edge function
- **O que os docs afirmam:** Sem webhook de eventos de entrega do Resend.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:193`
- **O que falta:** delivered não tem status próprio nem atualiza um registro de entrega. Possível bug: o opt-out de bounce usa event.fromEmail (index.ts:334-336), que para Resend vem de data.from, o remetente (webhook-integrity.ts:126), e não de recipientEmail. O cadastro do webhook no painel do Resend não é verificável. inbound_reply_events tem 0 linhas (stats.md:150).
- **Evidência:** O webhook do Resend existe com o nome inbound-email-webhook, na allowlist e com verify_jwt=false (config.toml:60-61). A assinatura é validada com RESEND_WEBHOOK_SECRET (_shared/webhook-auth.ts:390). parseResendEvent fica em webhook-integrity.ts:116-133. Eventos não telemétricos (bounce, complaint, 'other' como delivered) são gravados em inbound_reply_events (index.ts:306-320), e bounce/complaint viram opt-out (:331-344). 'delivered' cai em 'other' (webhook-integrity.ts:92).
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Não implementado.

### F2460 · 'Conversão Final' do relatório de cadências não fica sempre 0% (RPC conta só status completed) (#449)

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** Falha de severidade baixa registrada pela validação adversarial, sem correção nesta rodada.
- **Fontes:** `docs/prod-readiness.md:1006`
- **O que falta:** Alterar a CTE `conversions` para `s.status = ANY (ARRAY['completed','won','closed'])` e republicar a migration.
- **Evidência:** Confirmado no corpo real da função (functions/public/get_cadence_metrics__dce14589fc8d94bc.sql): CTE `conversions` filtra só `s.status = 'completed'`. src/constants/index.ts:69 mostra `WON_SALE_STATUSES = ['completed','won','closed']` — a RPC ignora 'won' e 'closed'. Índice dedicado `idx_sales_created_at_won` (tables/public/sales.md) indica que 'won' é usado de fato em produção. docs/prod-readiness.md:1006 confirma: severidade baixa, sem correção nesta rodada.
- **Revisão:** sem contestação cética concluída.

### F3796 · E-mail em massa e alerta de churn por e-mail (RPC enqueue_email)

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** Doc top-7: email-bulk-send, email-bulk-retry, send-churn-alert-email chamam enqueue_email inexistente; campanhas e alertas não saem.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:224-224, 349-349`
- **O que falta:** O critério pede que os e-mails saiam de fato (log), e não há prova disso: email_bulk_drafts tem 0 linhas (stats.md:97), e a chave do Resend não é verificável. O cron 26 de retry usa a apikey anon (cron.md:23) e cai em 401 (ver F3791).
- **Evidência:** O enqueue_email foi substituído pelo envio via Resend. _shared/transactional-email-sender.ts:1-5 diz 'Substitui a RPC enqueue_email'. email-bulk-send/index.ts:125, email-bulk-retry/index.ts:189 e send-churn-alert-email/index.ts:121 chamam sendTransactionalEmail, que vai para send-transactional-email. As quatro functions estão na allowlist (deploy.yml:144). O front chama email-bulk-send em src/hooks/engagement/useBulkComposer.ts:171. grep -rn 'rpc(.enqueue_email' supabase/functions → 0.
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Não implementado.

### F3797 · Função SQL/RPC assign_cadence_variant (2 afirmações nos docs)

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** Atribuição de variante A/B de cadência movida para private sem chamador.| API.md lista a function SQL `assign_cadence_variant` com última definição em 20260416195006_fefd2801-b414-41e2-842c-1914a9fdb276.sql, grants "—" e uso no front "—".
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/F_banco_dados.md:87`, `docs/API.md:475-475`
- **O que falta:** Nenhum chamador ao matricular contato em cadência com A/B; é código morto. Falta ligá-la ou removê-la.
- **Evidência:** função private.assign_cadence_variant existe no banco real (functions.md); sem referência em código, cron, triggers ou outras funções (coluna de uso vazia)| cético: private.assign_cadence_variant existe no banco (functions.md:22). Ausente: grep -rn 'assign_cadence_variant' src supabase/functions → 0 resultados. Também não é referenciada por triggers nem por outras funções (a coluna de uso em functions.md:22 está vazia). cadence_ab_assignments tem 0 linhas (stats.md:179).

### F3799 · RPC/função SQL `bulk_update_deal_stages`

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** API.md lista a function SQL `bulk_update_deal_stages` com última definição em 20260104181000_stored_procedures_additional.sql, grants "—" e uso no front "—".
- **Fontes:** `docs/API.md:501-501`
- **O que falta:** Nenhum chamador real; é código morto. Falta ligá-lo à ação em massa do pipeline ou removê-lo.
- **Evidência:** função public.bulk_update_deal_stages existe no banco real (functions.md); sem referência em código, cron, triggers ou outras funções (coluna de uso vazia)| cético: public.bulk_update_deal_stages existe no banco (functions.md:104). Ausente: grep -rn 'bulk_update_deal_stages' src supabase/functions → só src/integrations/supabase/types.ts:23855, que é tipo gerado. Não tem chamador em código, cron ou trigger.

### F3800 · RPC/função SQL `get_bulk_job_summary`

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** API.md lista a function SQL `get_bulk_job_summary` com última definição em 20260417172401_58a897ab-98e9-45fb-a275-94c9112b6be4.sql, grants "authenticated" e uso no front "—".
- **Fontes:** `docs/API.md:601-601`
- **O que falta:** Nenhum chamador (por exemplo em src/pages/BulkComposer.tsx ou useBulkComposer); é código morto.
- **Evidência:** função public.get_bulk_job_summary existe no banco real (functions.md); sem referência em código, cron, triggers ou outras funções (coluna de uso vazia)| cético: public.get_bulk_job_summary existe no banco (functions.md:210, grant authenticated). Ausente: grep -rn 'get_bulk_job_summary' src supabase/functions → só src/integrations/supabase/types.ts:24406, que é tipo gerado. Não tem chamador.

### F3801 · Editar estratégia/score mínimo da fila do dialer reprocessa os itens enfileirados (#435)

- **Tipo:** Hook
- **O que os docs afirmam:** Falha de severidade baixa registrada pela validação adversarial, sem correção nesta rodada.
- **Fontes:** `docs/prod-readiness.md:1006`
- **O que falta:** Ao salvar a estratégia ou o score mínimo, falta disparar o rebuild automático (dialer-queue-builder) ou avisar que os itens enfileirados ficaram desatualizados.
- **Evidência:** O hook existe com outro nome, src/hooks/dialer/usePowerDialer.ts. Em useUpdateQueue (:102-137), editar só faz UPDATE em dialer_queues (:111-118) e invalida o cache, sem chamar dialer-queue-builder. QueueBuilderDialog.tsx:53-59 chama só update.mutateAsync. Não há trigger de rebuild em dialer_queues: triggers.md:133-134 só tem os de updated_at. O rebuild existe apenas manualmente, por useRebuildQueue (usePowerDialer.ts:167-175, invoca dialer-queue-builder, que está na allowlist) e pelo botão em src/pages/PowerDialer.tsx:44,133.
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Não implementado.

### F3802 · engagement/useSendTimeOptimization.ts é cópia morta integral de sequences/

- **Tipo:** Hook
- **O que os docs afirmam:** 4 nomes idênticos nos dois arquivos; UI importa consistentemente de sequences/.
- **Fontes:** `docs/estado/09_HOOKS_SERVICES.md:432-434`
- **O que falta:** arquivo src/hooks/engagement/useSendTimeOptimization.ts existe mas hook não consta em hooks.json (não exportado/indexado)
- **Evidência:** arquivo src/hooks/engagement/useSendTimeOptimization.ts existe mas hook não consta em hooks.json (não exportado/indexado)
- **Revisão:** sem contestação cética concluída.

### F3803 · get_account_engagement_summary() lido por useAccountEngagement.ts:67 (tela ABM)

- **Tipo:** Hook
- **O que os docs afirmam:** Leitura de engajamento de conta na tela ABM via RPC.
- **Fontes:** `docs/agentes/veredicto-branches-vivas-261117.md:52`
- **O que falta:** arquivo src/hooks/engagement/useAccountEngagement.ts existe mas hook não consta em hooks.json (não exportado/indexado)
- **Evidência:** arquivo src/hooks/engagement/useAccountEngagement.ts existe mas hook não consta em hooks.json (não exportado/indexado)
- **Revisão:** sem contestação cética concluída.

### F3804 · Hook cadences/useCadenceMutations.ts

- **Tipo:** Hook
- **O que os docs afirmam:** Doc lista o hook `cadences/useCadenceMutations.ts` — mutations CRUD de cadências.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:378-384,1125-1132`
- **O que falta:** arquivo src/hooks/cadences/useCadenceMutations.ts existe mas hook não consta em hooks.json (não exportado/indexado)
- **Evidência:** arquivo src/hooks/cadences/useCadenceMutations.ts existe mas hook não consta em hooks.json (não exportado/indexado)
- **Revisão:** sem contestação cética concluída.

### F3805 · Hook cadences/useCadenceTaskMutations.ts

- **Tipo:** Hook
- **O que os docs afirmam:** Doc lista o hook `cadences/useCadenceTaskMutations.ts` — mutations de tarefas de cadência.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:378-384,1125-1132`
- **O que falta:** arquivo src/hooks/cadences/useCadenceTaskMutations.ts existe mas hook não consta em hooks.json (não exportado/indexado)
- **Evidência:** arquivo src/hooks/cadences/useCadenceTaskMutations.ts existe mas hook não consta em hooks.json (não exportado/indexado)
- **Revisão:** sem contestação cética concluída.

### F3810 · Hook useBulkQuoteCadenceMutations usa chunkedIn

- **Tipo:** Hook
- **O que os docs afirmam:** Listado entre os 29 call-sites blindados que usam o helper chunkedIn (.in('id', chunk)).
- **Fontes:** `docs/reports/FRONTEND_IN_AUDIT.md:29-29`
- **O que falta:** arquivo src/hooks/cadences/useBulkQuoteCadenceMutations.ts existe mas hook não consta em hooks.json (não exportado/indexado)
- **Evidência:** arquivo src/hooks/cadences/useBulkQuoteCadenceMutations.ts existe mas hook não consta em hooks.json (não exportado/indexado)
- **Revisão:** sem contestação cética concluída.

### F3811 · Hook useCadenceQueries (2 afirmações nos docs)

- **Tipo:** Hook
- **O que os docs afirmam:** Doc lista o hook `cadences/useCadenceQueries.ts` — queries de cadências.| Listado entre os 29 call-sites blindados que usam o helper chunkedIn (.in('id', chunk)).
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:378-384,1125-1132`, `docs/reports/FRONTEND_IN_AUDIT.md:32-32`
- **O que falta:** arquivo src/hooks/cadences/useCadenceQueries.ts existe mas hook não consta em hooks.json (não exportado/indexado)
- **Evidência:** arquivo src/hooks/cadences/useCadenceQueries.ts existe mas hook não consta em hooks.json (não exportado/indexado)
- **Revisão:** sem contestação cética concluída.

### F3812 · Hook useProspectCadenceMutations (2 afirmações nos docs)

- **Tipo:** Hook
- **O que os docs afirmam:** Doc lista o hook `cadences/useProspectCadenceMutations.ts` — mutations de prospects em cadências.| L630 P: backend toBusinessDate; front data local (:19).
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:378-384,1125-1132`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:306`
- **O que falta:** arquivo src/hooks/cadences/useProspectCadenceMutations.ts existe mas hook não consta em hooks.json (não exportado/indexado)
- **Evidência:** arquivo src/hooks/cadences/useProspectCadenceMutations.ts existe mas hook não consta em hooks.json (não exportado/indexado)
- **Revisão:** sem contestação cética concluída.

### F2461 · E-mail transacional: send-transactional-email + email-bulk-send

- **Tipo:** Integração externa
- **O que os docs afirmam:** ARCHITECTURE: e-mail transacional via send-transactional-email e email-bulk-send.
- **Fontes:** `docs/ARCHITECTURE.md:111-111`
- **O que falta:** Configurar RESEND_API_KEY (e confirmar BULK_EMAIL_FROM) nas Edge Function Secrets; sem isso o envio real fica bloqueado.
- **Evidência:** Arquitetura deployada: send-transactional-email e email-bulk-send na allowlist ACTIVE (deploy.yml:144); email-bulk-send delega via _shared/transactional-email-sender.ts:15-18. Porém send-transactional-email/index.ts:233-240 retorna 503 `email_provider_not_configured` sem RESEND_API_KEY/BULK_EMAIL_FROM, e docs/prod-readiness.md:1019 (B2) confirma o segredo ausente em produção. `email_logs` com 0 linhas no snapshot de 2026-11-20 (stats.md:195) — nenhum envio registrado.
- **Revisão:** sem contestação cética concluída.

### F2462 · E-mails transacionais via Resend

- **Tipo:** Integração externa
- **O que os docs afirmam:** RESEND_API_KEY configurado para envio de e-mails (reset de senha, alertas).
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:1696,1019`
- **O que falta:** Adicionar `send-password-reset` à allowlist ACTIVE e configurar RESEND_API_KEY nas Edge Function Secrets.
- **Evidência:** send-password-reset/index.ts:29 lê RESEND_API_KEY e é chamada de src/components/security/PasswordResetApproval.tsx:84, mas `send-password-reset` NÃO está na allowlist ACTIVE (deploy.yml:144) — não publicada, chamada do front recebe 404. Sem INSERT em `email_logs` nesse arquivo. `email_logs` com 0 linhas em produção (stats.md:195).
- **Revisão:** sem contestação cética concluída.

### F2464 · Edge function inbound-email-webhook sem functions.invoke literal no front

- **Tipo:** Integração externa
- **O que os docs afirmam:** Uma das 64/168 funções sem invocador literal em src/. Grupo: Webhook de entrada (INFERIDO). Classificação por grupo deduzida do nome; pg_cron/config.toml não verificados.
- **Fontes:** `docs/estado/09_HOOKS_SERVICES.md:291-311`
- **O que falta:** Configurar no painel do provedor de e-mail (Resend/outro) para efetivamente chamar essa function; hoje está deployada mas em produção nunca recebeu uma chamada externa real (0 linhas nas tabelas de dedupe/tracking).
- **Evidência:** grep -rn "inbound-email-webhook" src/ → 0 resultados (confirma: nenhum invoke literal no front, é webhook real). Function está deployada: .github/workflows/deploy.yml:144 lista 'inbound-email-webhook' no array ACTIVE. Mas nunca recebeu chamada externa real: docs/contexto/supabase/stats.md:47 webhook_inbound_dedupe=0 linhas; stats.md:108 email_tracking_events=0 linhas.
- **Revisão:** sem contestação cética concluída.

### F2465 · Edge function sequence-record-reply sem functions.invoke literal no front

- **Tipo:** Integração externa
- **O que os docs afirmam:** Uma das 64/168 funções sem invocador literal em src/. Grupo: Webhook de entrada (INFERIDO). Classificação por grupo deduzida do nome; pg_cron/config.toml não verificados.
- **Fontes:** `docs/estado/09_HOOKS_SERVICES.md:291-311`
- **O que falta:** Function existe no repo (supabase/functions/sequence-record-reply/index.ts) mas está fora da allowlist de deploy — não roda em produção. Precisa liberar vaga no limite de 100 functions e adicioná-la à allowlist (deploy.yml:144) para funcionar.
- **Evidência:** grep -rn "sequence-record-reply" src/ → 0 resultados. A própria function inbound-email-webhook/index.ts:72-74 documenta: "a function sequence-record-reply, que faria isso, não está deployada (teto de 100 functions do plano)". Confirmado: 'sequence-record-reply' NÃO consta no array ACTIVE de .github/workflows/deploy.yml:144.
- **Revisão:** sem contestação cética concluída.

### F2469 · inbound-email-webhook v5 registra clique/abertura; falta ligar tracking na Resend

- **Tipo:** Integração externa
- **O que os docs afirmam:** Function na versão 5 com registro de email.clicked/email.opened; falta configurar tracking de clique do domínio e assinatura dos eventos no painel da Resend.
- **Fontes:** `docs/agentes/veredicto-branches-vivas-261117.md:134-136`
- **O que falta:** Configuração manual no painel da Resend (tracking de clique + assinatura de eventos email.clicked/email.opened) — ação fora do alcance do MCP/API, por isso fica para o dono (regra 8 do AGENTS.md).
- **Evidência:** Código trata os eventos: inbound-email-webhook/index.ts:35 `TRACKING_EVENT_TYPE = { open: 'opened', click: 'clicked' }`, linhas 125,157,164 processam e gravam em email_tracking_events. Porém nenhum evento real chegou: stats.md:108 email_tracking_events=0 linhas. docs/agentes/veredicto-branches-vivas-261117.md:134-136 confirma: falta ligar no painel da Resend o tracking de clique do domínio e a assinatura dos eventos — "não há MCP nem API pública para isso".
- **Revisão:** sem contestação cética concluída.

### F2470 · Integração de e-mail com log automático de provedores

- **Tipo:** Integração externa
- **O que os docs afirmam:** Existe email tracking mas sem log automático vindo de provedores de e-mail.
- **Fontes:** `docs/FEATURE_SUMMARY.md:93-93`
- **O que falta:** Mesmo gap do F2469/F2472: ligar o webhook real no painel do provedor (Resend). Código pronto, mas 0 chamadas reais já recebidas.
- **Evidência:** Mecanismo de ingestão de webhook de provedor EXISTE no código (inbound-email-webhook trata email.opened/email.clicked e respostas, grava em email_tracking_events), contradizendo a frase literal "sem log automático"/"sem webhook de ingestão" do doc. Mas nunca foi exercido em produção: stats.md:195 email_logs=0; stats.md:47 webhook_inbound_dedupe=0; stats.md:108 email_tracking_events=0.
- **Revisão:** sem contestação cética concluída.

### F2471 · Integração e-mail transacional (send-transactional-email, email-bulk-send)

- **Tipo:** Integração externa
- **O que os docs afirmam:** E-mail transacional e envio em massa via provedor (Resend).
- **Fontes:** `docs/agentes/mapa-do-sistema.md:79`
- **O que falta:** Confirmar RESEND_API_KEY configurado e exercitar um envio real — hoje a UI/edge function estão prontas mas nenhuma linha em email_logs/email_bulk_jobs/email_bulk_drafts comprova envio real.
- **Evidência:** Integração ponta a ponta existe: src/hooks/engagement/useBulkComposer.ts:171 invoca 'email-bulk-send'; src/hooks/email/useComposeEmail.ts e src/components/sales/AIEmailDialog.tsx chamam send-transactional-email; ambas deployadas (deploy.yml:144, ambas ATIVA). Porém o critério do próprio item exige "envio real registrado em logs", e isso não existe: stats.md:195 email_logs=0; stats.md:275 email_bulk_jobs=0; stats.md:97 email_bulk_drafts=0.
- **Revisão:** sem contestação cética concluída.

### F2472 · Integração externa: Resend (e-mail)

- **Tipo:** Integração externa
- **O que os docs afirmam:** 11 funções leem RESEND_API_KEY; 2/11 publicadas e iniciando; indisponíveis access-denied-alerts, broadcast-sale-notification, check-lead-sla, new-device-alert, notify-critical-pattern, sdr-consecutive-alerts, send-alert-notifications, send-password-reset, winloss-webhook-health-monitor. Chamada real ao provedor não exercida (B4).
- **Fontes:** `docs/prod-readiness.md:857`
- **O que falta:** Publicar as 7 functions restantes (liberar vagas no limite de 100 na allowlist) e comprovar uma chamada real ao provedor — hoje nenhuma foi registrada.
- **Evidência:** Confirmado parcial, mas números do doc (prod-readiness.md:857) estão desatualizados: diz "2/11 publicadas", mas hoje (deploy.yml:144) estão ATIVA: access-denied-alerts, activity-goal-alerts, broadcast-sale-notification, send-transactional-email (4/11); permanecem FORA: check-lead-sla, new-device-alert, notify-critical-pattern, sdr-consecutive-alerts, send-alert-notifications, send-password-reset, winloss-webhook-health-monitor (7/11). "Chamada real não exercida" confirmado: email_logs=0 (stats.md:195).
- **Revisão:** sem contestação cética concluída.

### F2475 · Resend: RESEND_API_KEY lido em 10 pontos das Edge Functions

- **Tipo:** Integração externa
- **O que os docs afirmam:** Provedor real de e-mail; código completo mas sem evidência de envio; depende também de BULK_EMAIL_FROM.
- **Fontes:** `docs/estado/13_INTEGRACOES.md:68`
- **O que falta:** Mesmo do F2471/F2472 — comprovar envio real; código e secrets estão prontos mas sem evidência de uso em produção.
- **Evidência:** RESEND_API_KEY lido em 11 index.ts (contagem próxima de "10 pontos"); BULK_EMAIL_FROM lido em email-bulk-send/index.ts, email-bulk-retry/index.ts e send-transactional-email/index.ts (3 pontos, confirmando a dependência citada). Mesma lacuna de evidência de envio real do F2471/F2472: email_logs=0 (stats.md:195).
- **Revisão:** sem contestação cética concluída.

### F2479 · Alertas SDR com som e notificação

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** useSDRAlertNotifications + useSDRAlertSoundSettings notificam SDR; edge sdr-consecutive-alerts gera alertas consecutivos.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:583,1017`
- **O que falta:** Publicar sdr-consecutive-alerts na allowlist de deploy (liberar vaga no limite de 100 functions). Hoje o cron dispara a cada 24h mas a function não existe em produção, então nenhum alerta é gravado (0 linhas em sdr_alert_history).
- **Evidência:** Front 100% real: src/hooks/useSDRAlertNotifications.ts (escuta INSERT em 'sdr_alert_history' via realtime, linhas 33-39) e useSDRAlertSoundSettings.ts usados em src/components/sdr/SDRDashboard.tsx, LayoutRealtimeEffects.tsx, src/pages/Notificacoes.tsx, SoundSettingsTabs.tsx. Cron real existe: cron.md id 82 'sdr-consecutive-alerts-daily' (0 11 * * *), com execuções 'succeeded' recentes em cron-runs.md (19/18/17-11-2026). MAS 'sdr-consecutive-alerts' está FORA da allowlist de produção (.github/workflows/deploy.yml:144). sdr_alert_history=0 linhas (stats.md:394) confirma que nenhum alerta real jamais foi gravado.
- **Revisão:** sem contestação cética concluída.

### F2481 · Auto-enroll em cadência por evento ou cron

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** auto-enroll-cadence só disparado por EnrollmentRulesDialog; sem cron nem trigger.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:67`
- **O que falta:** A edge function em si só dispara por clique manual (sem cron). O trigger de banco paralelo existe mas não tem efeito porque a tabela de regras está vazia — falta o dono cadastrar regras via EnrollmentRulesDialog.
- **Evidência:** src/components/cadences/EnrollmentRulesDialog.tsx:104 é o único caller de `supabase.functions.invoke('auto-enroll-cadence')` (grep -rn confirma, nenhuma outra ocorrência em src/). Nenhum cron chama essa edge function (ausente de cron.md e da allowlist de `trigger_internal_edge_job`). Existe, à parte, um trigger de banco (trg_auto_enroll_on_sale → private.auto_enroll_in_cadence, triggers.md:280) que replica lógica similar em SQL puro sem passar pela edge function, mas está dormente: cadence_enrollment_rules=0 linhas (stats.md:247).
- **Revisão:** sem contestação cética concluída.

### F2482 · Auto-inscrição em cadência por evento

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Só manual (EnrollmentRulesDialog), sem gatilho por evento.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:186`
- **O que falta:** A afirmação "sem gatilho" é factualmente incorreta (gatilho existe); o gap real é configuração de negócio ausente: 0 regras em cadence_enrollment_rules e 0 cadências ativas em cadences.
- **Evidência:** A claim do README ("sem gatilho por evento") está desatualizada: EXISTE gatilho por evento no banco desde maio/2026 — triggers.md:228 `trg_auto_enroll_quote_cadence` (AFTER INSERT/UPDATE em quotes) e triggers.md:280 `trg_auto_enroll_on_sale` (AFTER INSERT/UPDATE em sales), introduzidos em supabase/migrations/20260511185728_8146716e-...sql. Porém ambos estão dormentes: cadence_enrollment_rules=0 linhas e cadences=0 linhas (stats.md:247,138) — nenhuma regra/cadência cadastrada para o trigger casar.
- **Revisão:** sem contestação cética concluída.

### F2483 · AUTOMAÇÃO DORMENTE: auto-enroll-cadence + trigger com cadence_enrollment_rules vazia

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Trigger dispara a cada venda, SELECT em tabela de 0 linhas, retorna NEW silenciosamente; prospect_cadences ins=0.
- **Fontes:** `docs/estado/03_DOMINIO_SDR_CADENCIAS.md:359-359`
- **O que falta:** O dono precisa cadastrar ao menos uma regra ativa em cadence_enrollment_rules (via EnrollmentRulesDialog.tsx) para o trigger passar a inserir em prospect_cadences.
- **Evidência:** Confirmado com evidência exata: função de trigger private.auto_enroll_in_cadence() faz SELECT em public.cadence_enrollment_rules (0 linhas, stats.md:247), não encontra `matching_rule.id`, e `RETURN NEW` sem inserir — exatamente como descrito. prospect_cadences=0 linhas (stats.md:93) confirma "ins=0".
- **Revisão:** sem contestação cética concluída.

### F2484 · AUTOMAÇÃO DORMENTE: check-lead-sla: SLA nunca verificado automaticamente

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Só roda por clique em BackendAutomationMonitor.tsx:68; sla_policies apagadas, sla_violations=0; AdminSystemStatus.tsx:24 exibe "Configurável".
- **Fontes:** `docs/estado/03_DOMINIO_SDR_CADENCIAS.md:353-353`
- **O que falta:** Publicar check-lead-sla na allowlist de deploy (liberar vaga no limite de 100). O cron dispara a cada 15min mas a function não existe em produção, por isso sla_violations continua em 0.
- **Evidência:** Claim parcialmente desatualizada: hoje EXISTE cron (cron.md id 81 'check-lead-sla-15min', */15min), criado em supabase/migrations/20261013120000_agenda_crons_maquina_vendas.sql e corrigido em 20261112224500_fix_agenda_crons_maquina_vendas.sql (comentário explícito nesta migration: "o plano limita a 100 Edge Functions publicadas. Vários destes jobs chamam funções que podem NÃO estar publicadas; nesse caso a chamada responde 404"). 'check-lead-sla' está FORA da allowlist de deploy (.github/workflows/deploy.yml:144). sla_violations=0 linhas (stats.md:166) confirma que nenhuma violação real foi detectada; cron_failure_alerts tem ~1,6k linhas (stats.md:28), consistente com falhas registradas.
- **Revisão:** sem contestação cética concluída.

### F2485 · AUTOMAÇÃO DORMENTE: engagement-score-recompute / email-engagement-scorer / send-time-optimizer sem recálculo periódico

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Dependem de execução recorrente; nenhum tem cron; tabelas de destino 0.
- **Fontes:** `docs/estado/03_DOMINIO_SDR_CADENCIAS.md:365-365`
- **O que falta:** Criar cron (ou trigger) para recálculo periódico; hoje depende de clique manual via UI e nenhuma tabela de destino tem dados reais.
- **Evidência:** Confirmado: nenhuma entrada em cron.md para engagement-score-recompute, email-engagement-scorer ou send-time-optimizer. Todas as 3 só disparam por ação manual (useMutation): useEngagementScore.ts:107, useEmailEngagementScore.ts:78, useSendTimeOptimization.ts:36. Tabelas de destino com 0 linhas: contact_engagement_score (stats.md:89), email_engagement_scores (stats.md:194), send_time_profiles (stats.md:398), contact_send_time_profile (stats.md:90), engagement_score_history (stats.md:109), email_engagement_score_history (stats.md:364).
- **Revisão:** sem contestação cética concluída.

### F2486 · AUTOMAÇÃO DORMENTE: lead-scoring sem cron: score envelhece

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Lead criado hoje não tem score até alguém abrir /lead-scoring.
- **Fontes:** `docs/estado/03_DOMINIO_SDR_CADENCIAS.md:367-367`
- **O que falta:** Criar cron de recálculo periódico; hoje o score de um lead novo só é calculado quando alguém abre a tela /lead-scoring.
- **Evidência:** Confirmado: sem entrada de cron para 'lead-scoring' em cron.md. Rota real existe (/lead-scoring em AppRoutes.tsx e item em sidebarMenuData.ts) e dispara a function via src/hooks/useLeadScoring.ts quando a tela é aberta. lead_scores tem ~900 linhas (stats.md:32) — dado existe, mas só é atualizado quando alguém visita a tela, sem recálculo periódico automático.
- **Revisão:** sem contestação cética concluída.

### F2488 · AUTOMAÇÃO DORMENTE: process-scheduled-sends: fila scheduled_sends sem consumidor

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Varre scheduled_sends WHERE status='pending'; 0 chamadores, 0 cron; schedule-optimal-send grava nessa fila → ficaria pending para sempre.
- **Fontes:** `docs/estado/03_DOMINIO_SDR_CADENCIAS.md:351-351`
- **O que falta:** Publicar ambas as functions (schedule-optimal-send e process-scheduled-sends) na allowlist de deploy; hoje nenhuma das duas roda em produção apesar do cron existir.
- **Evidência:** Claim parcialmente desatualizada: EXISTE cron (cron.md id 79 'process-scheduled-sends-15min', */15min), mas 'process-scheduled-sends' está FORA da allowlist (deploy.yml:144). O produtor da fila, 'schedule-optimal-send' (chamado por src/hooks/sequences/useSendTimeOptimization.ts), também está FORA da allowlist. scheduled_sends=0 linhas (stats.md:224) confirma que a fila está vazia e sem consumo real — nem produtor nem consumidor estão deployados em produção.
- **Revisão:** sem contestação cética concluída.

### F2489 · AUTOMAÇÃO DORMENTE: sequence-record-reply órfã: resposta de prospect nunca pausa a sequência

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** 100 linhas, zero chamadores fora dela mesma.
- **Fontes:** `docs/estado/03_DOMINIO_SDR_CADENCIAS.md:363-363`
- **O que falta:** Remover o código morto supabase/functions/sequence-record-reply/index.ts (ou religar algum chamador real) — a funcionalidade de negócio já está coberta por outro caminho, então o gap real é limpeza de código morto, não ausência de automação.
- **Evidência:** supabase/functions/sequence-record-reply/index.ts tem 101 linhas e nenhum chamador fora dela mesma (grep -rn "sequence-record-reply" src/ supabase/ → só o próprio arquivo e 2 comentários). A função NÃO está na allowlist ACTIVE de produção (.github/workflows/deploy.yml:144). Mas a funcionalidade que ela deveria prover (pausar sequence_enrollments ao detectar resposta) foi reimplementada diretamente dentro de supabase/functions/inbound-email-webhook/index.ts:71-77 (comentário explícito: "a function sequence-record-reply, que faria isso, não está deployada (teto de 100 functions do plano)") e :363-382, que chama a RPC auto_pause_enrollment quando há enrollment casado via match_reply_to_enrollment (migration supabase/migrations/20261117200000_fix_match_reply_to_enrollment_sales_email.sql, função confirmada no snapshot do banco). inbound-email-webhook ESTÁ na allowlist ACTIVE.
- **Revisão:** sem contestação cética concluída.

### F2490 · AUTOMAÇÃO DORMENTE: sequence-runner só roda por clique (SequencesPage.tsx:70,110)

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Sem cron uma sequência de 7 dias exige clique diário em "Executar runner".
- **Fontes:** `docs/estado/03_DOMINIO_SDR_CADENCIAS.md:355-355`
- **O que falta:** Nada quanto ao agendamento (já corrigido em 12/11). Falta confirmar volume real: sequence_enrollments está zerada na última medição de linhas disponível (banco.json, medido 2026-11-12T14:07Z, antes do cron existir), e a inscrição depende de sequence-enroll, que NÃO está na allowlist ACTIVE — hoje não há como inscrever prospects em produção (ver F2495).
- **Evidência:** src/pages/SequencesPage.tsx:97 ainda tem o botão "Executar agora" para disparo manual. Porém supabase/migrations/20261112224500_fix_agenda_crons_maquina_vendas.sql (2026-11-12 22:45 UTC) criou o cron 'sequence-runner-5min' (*/5 * * * *) via trigger_internal_edge_job('sequence-runner'), confirmado ativo em cron.md (job 77) e com execuções 'succeeded' em cron-runs.md (2026-11-20). sequence-runner está na allowlist ACTIVE.
- **Revisão:** sem contestação cética concluída.

### F2491 · Checagem de opt-out/consentimento antes de enviar WhatsApp/e-mail

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Nenhum ponto consulta supressão/unsubscribe/consentimento antes de disparar; outcome 'unsubscribed' em activities não é consultado.
- **Fontes:** `docs/auditoria/RELATORIO_FALHAS.md:618-622`
- **O que falta:** Para purpose='transactional' o filtro é pulado por desenho (aceitável, mas documentar); o sinal activities.outcome='unsubscribed' continua não consultado (redundante hoje, mas um ponto de risco se algum fluxo só grava em activities).
- **Evidência:** O sub-claim específico é verdadeiro: activities.outcome='unsubscribed' de fato nunca é consultado (grep sem resultado). Mas a checagem de opt-out existe por outro mecanismo: send-transactional-email/index.ts:108-130 chama filterOptedOut (_shared/unsubscribe.ts:117-145, consulta email_opt_outs) e retorna 409 em :266-267; email-bulk-send/index.ts:3,76 usa o mesmo filtro; send-multichannel-message/index.ts:290-304 chama RPC is_recipient_opted_out (que chama is_email_opted_out) e bloqueia com 409. process-cadence-tasks:54-76 não envia mensagem diretamente, não se aplica ao envio.
- **Revisão:** sem contestação cética concluída.

### F2492 · Domínio dormente: Cadences / sequências de prospecção (22 tabelas zeradas)

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Agrupamento funcional com 22 tabelas todas com 0 linhas; indica módulo construído e nunca usado.
- **Fontes:** `docs/estado/11_DADOS_BANCO.md:221-226`
- **O que falta:** Confirmar contagem pós-fix (após 2026-11-12 22:45 UTC) — não verificável nesta sessão (sem acesso de leitura ao banco de produção, só snapshot de schema). sequence-enroll (necessário para popular sequence_enrollments) não está na allowlist ACTIVE, mantendo ao menos esse ramo sem entrada de dados.
- **Evidência:** UI acessível (SequencesPage, Cadencias.tsx, EnrollmentRulesDialog.tsx) chamando edge functions reais. A medição mais recente disponível (inventario/estado/banco.json, medido 2026-11-12T14:07:03Z, mais atual que docs/estado/11_DADOS_BANCO.md de 2026-08-16) ainda mostra 0 linhas em cadences, cadence_steps, cadence_tasks, prospect_cadences, sequences, sequence_steps, sequence_enrollments e sequence_step_executions. Essa medição é ~8h ANTES da migration 20261112224500 que corrigiu os crons.
- **Revisão:** sem contestação cética concluída.

### F2493 · Domínio dormente: E-mail / mensageria outbound (11 tabelas zeradas)

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Agrupamento funcional com 11 tabelas todas com 0 linhas; indica módulo construído e nunca usado.
- **Fontes:** `docs/estado/11_DADOS_BANCO.md:221-230`
- **O que falta:** Mesma limitação de F2492: sem contagem de linhas pós-fix disponível nesta sessão. docs/estado/11_DADOS_BANCO.md (fonte citada) é de 2026-08-16, bem mais antigo que o HEAD.
- **Evidência:** banco.json (medido 2026-11-12T14:07:03Z) mostra 0 linhas em email_logs, email_bulk_jobs, email_tracking_events, outbound_messages, scheduled_sends e whatsapp_conversations. As edge functions (email-bulk-send, email-bulk-retry, send-transactional-email, send-multichannel-message, inbound-email-webhook) estão na allowlist ACTIVE e têm cron (email-bulk-retry-15min id 26; process-scheduled-sends-15min id 79, criado em 12/11). UI acessível via /sequences, /engagement/bulk-composer.
- **Revisão:** sem contestação cética concluída.

### F2494 · E-mail marketing / nutrição drip por segmento

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Existem email-bulk-send, /engagement/bulk-composer e /workflow-builder; falta drip por segmento (saved_filters).
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:60`
- **O que falta:** Nenhum componente usa saved_filters como público de campanha drip automática; falta ligar o filtro salvo a um gatilho de envio segmentado e recorrente.
- **Evidência:** email-bulk-send, /engagement/bulk-composer (AppRoutes.tsx:322-325) e /workflow-builder existem e ativos. Busca por 'saved_filters' em execute-workflow/index.ts e workflow-executor/index.ts não retorna nenhum resultado — não há integração entre saved_filters (useSavedFilters.ts) e disparo de e-mail/drip.
- **Revisão:** sem contestação cética concluída.

### F2495 · G1 Motor de prospecção nunca exercido em produção

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Paridade teórica; risco de falha silenciosa, envio duplicado, credencial não validada.
- **Fontes:** `docs/benchmark/RAMPER_2026-07.md:162`
- **O que falta:** Adicionar 'sequence-enroll' à allowlist ACTIVE (ou substituir a função chamada) para destravar inscrição real de prospects; sem isso as contagens continuam em zero.
- **Evidência:** channel_credentials, sequence_enrollments e sequence_step_executions com 0 linhas na medição mais recente (banco.json, 2026-11-12T14:07Z). sequence-runner está na allowlist ACTIVE e tem cron desde 12/11, mas sequence-enroll NÃO está na allowlist ACTIVE (deploy.yml:144) e é o único caminho de inscrição usado pela UI (useEnrollContacts.ts:14); em produção essa chamada 404. Mesmo com runner agendado, não há como popular sequence_enrollments pela via oficial.
- **Revisão:** sem contestação cética concluída.

### F2497 · lead_scores: 900 linhas calculadas em apenas 2 dias distintos (12/jul e 13/ago)

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** min=2026-07-12 21:39, max=2026-08-13 20:29, 900 sale_id distintos, count(distinct day)=2 → lead-scoring rodou em batch 2× por clique manual.
- **Fontes:** `docs/estado/03_DOMINIO_SDR_CADENCIAS.md:167-173`
- **O que falta:** Agendar lead-scoring via pg_cron + trigger_internal_edge_job (incluir na allowlist interna e em deploy.yml) para recálculo periódico; hoje depende 100% de clique manual.
- **Evidência:** Nenhum job de cron para lead-scoring em cron.md; a function também NÃO está na allowlist ACTIVE. useLeadScoring.ts:111,268 só invoca por clique da UI. lead_scores tem 900 linhas na medição mais recente (banco.json, 2026-11-12), inalterado quanto aos 2 dias distintos originalmente achados.
- **Revisão:** sem contestação cética concluída.

### F2501 · Reativação automática de leads frios

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Leads frios reativados automaticamente.
- **Fontes:** `docs/FUNCIONALIDADES_COMPLETAS.md:214-214`
- **O que falta:** Criar o processo agendado que reative leads frios sem depender do clique do admin — hoje a funcionalidade existe, mas é manual, não automática como a doc declara.
- **Evidência:** A reativação em FollowUpInteligente.tsx é ação MANUAL: admin seleciona o lead e confirma (~linha 304 "Apenas administradores podem reativar leads Classe A"), sem agendamento. Não existe cron/edge que reative leads frios automaticamente; auto-reassign-inactive (que tem cron) trata de reatribuição de carteira por vendedor inativo, não de reativação de leads frios.
- **Revisão:** sem contestação cética concluída.

### F2504 · Seed MOCK-CAD-0001..0012 removido de produção

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Migration mig/20260420172633:17-72 aplicou dados de teste (cadências/cotações) em produção.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/F_banco_dados.md:259`
- **O que falta:** Não verificável nesta sessão se as linhas MOCK-CAD-% ainda existem em produção (sem acesso de leitura ao banco oficial, só snapshot de schema); mas o critério "seed fora das migrations" não foi atendido — a migration com o seed continua versionada normalmente.
- **Evidência:** supabase/migrations/20260420172633_4c398898-55dd-4a98-becc-7910b412644e.sql:17-72 ainda está em supabase/migrations/ com o seed MOCK-CAD-0001..0012 embutido. Não há migration posterior de limpeza (grep -rl "DELETE.*MOCK-CAD" → 0 resultados).
- **Revisão:** sem contestação cética concluída.

### F3815 · Rota /admin/supressao-emails (4 afirmações nos docs)

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Rota registrada em AppRoutes.tsx com acesso "admin_ou_gestor", GET em produção 200, chamando as edge functions email-bulk-retry. Status no doc: OK| Rota /admin/supressao-emails (AppRoutes.tsx:175) renderiza src/pages/AdminSupressaoEmails.tsx; role: admin ou manager. Classificação do doc: MORTO_OU_ABANDONADO. Evidência: SEM link/menu em todo src/ · sb=8 useQuery=7 mut=2 (árvore 30 arq.) \| API.md declara a rota `/admin/supressao-emails` renderizando o componente AdminSupressaoEmails com acesso "admin ou gestor". \| NÃO INICIADO (20/20): rota /admin/supressao-emails existe mas sem link/menu; só mapas de título/prefetch.
- **Fontes:** `docs/prod-readiness.md:97`, `docs/estado/01_FRONTEND_ROTAS.md:104-104`, `docs/API.md:345-345`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:52`
- **O que falta:** rota /admin/supressao-emails → src/pages/AdminSupressaoEmails.tsx (AppRoutes.tsx); sem entrada no menu (sidebarMenuData.ts) → só acessível por URL
- **Evidência:** rota /admin/supressao-emails → src/pages/AdminSupressaoEmails.tsx (AppRoutes.tsx); sem entrada no menu (sidebarMenuData.ts) → só acessível por URL
- **Revisão:** sem contestação cética concluída.

### F3816 · Rota /analytics/emails (7 afirmações nos docs)

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Doc lista /analytics/emails entre os itens de FUNCIONALIDADES_SEM_UI resolvidos com página ou consumidor real.| NÃO INICIADO (20/20): rota /analytics/emails existe mas sem link/menu; só mapas de título/prefetch. \| EmailMetricsDashboard.tsx:44 via useEmailMetrics.ts:72,79 sobre email_logs e email_tracking_events (0/0); página renderiza zeros. \| Doc: "Perguntas no assunto geram aberturas 40% maiores" fixo; rota /analytics/emails sem link. \| Rota registrada em AppRoutes.tsx com acesso "admin_ou_gestor", GET em produção 200. Status no doc: OK \| Rota /analytics/emails (AppRoutes.tsx:200) renderiza src/pages/EmailAnalyticsPage.tsx; role: admin ou manager. Classificação do doc: MORTO_OU_ABANDO…
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:206`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:52`, `docs/estado/04_DOMINIO_ANALYTICS_BI.md:202`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/D_frontend.md:121-121`, `docs/prod-readiness.md:112`, `docs/estado/01_FRONTEND_ROTAS.md:126-126` e mais 1
- **O que falta:** rota /analytics/emails → src/pages/EmailAnalyticsPage.tsx (AppRoutes.tsx); sem entrada no menu (sidebarMenuData.ts) → só acessível por URL
- **Evidência:** rota /analytics/emails → src/pages/EmailAnalyticsPage.tsx (AppRoutes.tsx); sem entrada no menu (sidebarMenuData.ts) → só acessível por URL
- **Revisão:** sem contestação cética concluída.

### F3817 · Rota /follow-up (6 afirmações nos docs)

- **Tipo:** Rota/tela
- **O que os docs afirmam:** NÃO INICIADO: MenuItem não referencia.| Única entrada: src/components/semantic/semanticSearchHelpers.ts:30; não está em nenhum menu. /follow-up/audit depende de chegar antes em /follow-up (FollowUpHeader.tsx:50). \| Rota /follow-up (AppRoutes.tsx:138) renderiza src/pages/FollowUpInteligente.tsx; sem role explícito (só autenticação global). Classificação do doc: IMPLEMENTADO_TOTAL. Evidência: link src/components/semantic/semanticSearchHelpers.ts:30 (deep-link da busca semântica) — não está em nenhum menu · sb=3 useQuery=3 mut=2 (árvore 23 arq.) \| Follow-up inteligente por temperatura do lead. \| Rota registrada em AppRoutes.tsx com acesso "autenticado", GET em produção 200. Status no doc: O…
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:55`, `docs/estado/01_FRONTEND_ROTAS.md:271-272`, `docs/estado/01_FRONTEND_ROTAS.md:69-69`, `docs/FUNCIONALIDADES_COMPLETAS.md:211-213`, `docs/prod-readiness.md:170`, `docs/API.md:310-310`
- **O que falta:** rota /follow-up → src/pages/FollowUpInteligente.tsx (AppRoutes.tsx); sem entrada no menu (sidebarMenuData.ts) → só acessível por URL
- **Evidência:** rota /follow-up → src/pages/FollowUpInteligente.tsx (AppRoutes.tsx); sem entrada no menu (sidebarMenuData.ts) → só acessível por URL
- **Revisão:** sem contestação cética concluída.

### F3818 · Rota /follow-up/audit (4 afirmações nos docs)

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Rota /follow-up/audit (AppRoutes.tsx:139) renderiza src/pages/FollowUpAudit.tsx; role: admin ou manager. Classificação do doc: IMPLEMENTADO_PARCIAL. Evidência: link src/components/follow-up/FollowUpHeader.tsx:50 · sb=1 useQuery=1 mut=1 (árvore 9 arq.) · DADO FICTÍCIO FollowUpAudit.tsx:77-99 mockLogs fixos ("Mariana Oliveira","Ricardo Santos"), concatenados ao real em :121| Rota registrada em AppRoutes.tsx com acesso "admin_ou_gestor", GET em produção 200. Status no doc: OK \| A rota /follow-up/audit está entre as 26 classificadas como parciais: existe ligação estática, mas a auditoria não a considera pronta (dados mock, ações sem efeito ou contrato quebrado). \| API.md declara a rota `/foll…
- **Fontes:** `docs/estado/01_FRONTEND_ROTAS.md:70-70`, `docs/prod-readiness.md:171`, `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:203-205`, `docs/API.md:311-311`
- **O que falta:** rota /follow-up/audit → src/pages/FollowUpAudit.tsx (AppRoutes.tsx); sem entrada no menu (sidebarMenuData.ts) → só acessível por URL
- **Evidência:** rota /follow-up/audit → src/pages/FollowUpAudit.tsx (AppRoutes.tsx); sem entrada no menu (sidebarMenuData.ts) → só acessível por URL
- **Revisão:** sem contestação cética concluída.

### F2511 · Opt-out de e-mail checado no envio (is_email_opted_out)

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** O edge de email não chama is_email_opted_out (mig/20260726200015:56).
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/F_banco_dados.md:91`
- **O que falta:** Para purpose='transactional' o filtro é pulado por desenho (documentar a exceção). Fora isso, o bloqueio já existe, só não pela RPC citada e sim por um helper equivalente.
- **Evidência:** Literalmente, send-transactional-email e email-bulk-send não chamam a RPC is_email_opted_out pelo nome — mas usam filterOptedOut (_shared/unsubscribe.ts:117-145), que consulta a mesma tabela email_opt_outs que a RPC consulta. send-transactional-email/index.ts:108-119 aplica esse filtro para purpose!='transactional' e retorna 409 em :266-267; email-bulk-send/index.ts:3,76 idem.
- **Revisão:** sem contestação cética concluída.

### F2517 · Testes de cadências/multicanal (cadences 0/22, sequences 0/20, multichannel 0/11, engagement 0/21; hooks 0/30)

- **Tipo:** Teste
- **O que os docs afirmam:** Diretórios sem nenhum teste.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:98`
- **O que falta:** Ao menos um teste em src/components/multichannel/ e em src/components/engagement/; testes para os hooks de src/hooks/sequences/, src/hooks/engagement/ e src/hooks/multichannel/.
- **Evidência:** src/components/cadences/ agora tem EnrollCadenceDialog.test.tsx e ContactRulesDialog.test.tsx; src/components/sequences/ tem sendTimeHelpers.test.ts — ambos diretórios passam no critério 'ao menos um teste'. Porém src/components/multichannel/ (11 arquivos: ChannelChart.tsx, MultichannelDashboard.tsx etc.) e src/components/engagement/ (18 arquivos) continuam com 0 arquivos _.test._ (find src/components/multichannel -iname '_.test._' → 0 resultados; idem engagement). Hooks do domínio seguem majoritariamente sem teste: src/hooks/cadences (18 hooks, 2 testados: useCadenceChannelStats.test.ts, useCadenceReport.test.tsx), src/hooks/sequences (9 hooks, 0 testados), src/hooks/multichannel (2 hooks, 0 testados no próprio diretório — só existe src/hooks/useMultichannel.test.tsx fora da pasta), src/hooks/engagement (6 hooks, 0 testados).| cético: find -iname '_.test._' por diretório: src/component…

## Não verificável (1)

### F2455 · SMTP custom Resend com domínio promobrindes.com.br verificado

- **Tipo:** Doc/config
- **O que os docs afirmam:** SMTP próprio em vez do compartilhado; SPF/DKIM.
- **Fontes:** `docs/AUTH_CONFIG.md:44-47`
- **O que falta:** Acesso ao painel Supabase (Authentication → SMTP Settings) para confirmar se o SMTP custom com domínio verificado está ativo.
- **Evidência:** Exige inspecionar Project Settings → Authentication → SMTP Settings no painel do Supabase, fora do repositório e do snapshot de contexto fornecido (que cobre tabelas/views/functions/cron, não configuração de Auth/SMTP). docs/AUTH_CONFIG.md:42-47 é checklist de "valor recomendado", não confirmação de estado atual.
- **Revisão:** sem contestação cética concluída.
