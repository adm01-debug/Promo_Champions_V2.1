# CRM core (clientes, contas, portfólio, agenda)

[Voltar ao índice](README.md)

76 itens não implementados, parciais ou não verificáveis neste domínio.

## Não implementado (35)

### F0017 · @mentions com consumidor

- **Tipo:** Componente
- **O que os docs afirmam:** Componente de @mentions pronto com 0 consumidores.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:171`
- **O que falta:** Componente de @mentions com autocomplete, persistência e notificação em comentários/chat.
- **Evidência:** ausente: `grep -rn -i "MentionInput\\|useMentions\\|@mention\\|MentionsTextarea" src` → 0 resultados; `find src -iname '*mention*'` só retorna src/components/conversational/CompetitorMentionsCard.tsx e hooks de menções a concorrentes (outro conceito); componentes.json/hooks.json sem entrada com 'mention' além de competitor. O componente de @mentions citado em docs/auditoria/.../README.md:171 não existe mais no HEAD.| cético: Confirmado: `grep -rln -i mention src supabase/functions \| grep -v -i competitor` → só arquivos de competitor_mentions/critical moments (RecordingSummaryDrawer.tsx:15,118, FeatureComparison.tsx:24); tables.md:99 só competitor_mentions.

### F0020 · Account plans templates

- **Tipo:** Componente
- **O que os docs afirmam:** Falta templates de planejamento estratégico de conta.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:80`
- **O que falta:** Templates de plano de conta (tabela com RLS) e ação de criar plano a partir de template.
- **Evidência:** ausente: `grep -rn -i template src/hooks/abm src/components/abm src/pages/AccountBasedSelling.tsx` → 0 resultados; tables.md sem 'plan_template' (só public.account_plans, 16 colunas em tables/public/account_plans.md:16-33, nenhuma de template). Existe apenas edição livre do plano (useAccounts.ts:64-131).| cético: Confirmado: `grep -n -i template tables.md` → só cadence_alert_templates, follow_up_templates, message_templates, whatsapp_template_versions (:46,168,209,394), nenhum de plano de conta.

### F0021 · Business card scanner (OCR → contato)

- **Tipo:** Componente
- **O que os docs afirmam:** Falta scanner de cartão de visita.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:117`
- **O que falta:** Tudo: captura, OCR (edge) e criação de contato.
- **Evidência:** ausente: `grep -rln -i "\bocr\b\\|business.card\\|cartão de visita\\|tesseract" src supabase/functions` → 0 resultados; nenhuma edge function com 'ocr' em supabase/functions/.| cético: Confirmado: `ls supabase/functions \| grep -iE "ocr\|card\|scan\|vision\|image"` → 0 relevantes; `grep -rln -i "tesseract\\|business.card\\|cartão de visita" src supabase/functions` → 0.

### F0023 · Check-in geolocalizado em visitas

- **Tipo:** Componente
- **O que os docs afirmam:** Falta check-in com geolocalização.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:119`
- **O que falta:** Colunas de coordenadas em activities e captura via navigator.geolocation no registro de visita.
- **Evidência:** ausente: `grep -n -i "latitude\\|longitude\\|geo\\|location" tables/public/activities.md` → 0 resultados (tabela activities sem coordenadas); `grep -rn -i "geolocation\\|check-in\\|checkin" src` só retorna DailyCheckinModal (race/gamificação) e MoodTrackerWidget; latitude existe apenas no cadastro do cliente (src/components/clients/CreateClientDialog.tsx:204), não na atividade de visita.| cético: Confirmado: `grep -rn -i "geolocation\\|getCurrentPosition" src` → 0 resultados; tables/public/activities.md sem latitude/longitude.

### F3178 · Comentários em thread, deal rooms, vídeo e documentos colaborativos

- **Tipo:** Componente
- **O que os docs afirmam:** Não há threads (parent_comment_id), deal rooms, vídeo (loom/vidyard) nem docs colaborativos.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:25`
- **O que falta:** Tabela de comentários com parent_comment_id + RLS, UI de thread, deal rooms, integração de vídeo e docs colaborativos — nada existe.
- **Evidência:** componente ThreadedComment ausente (componentes.json e src/)| cético: ausente: grep -rnw -e ThreadedComment -e parent_comment_id -e deal_room src supabase/functions → 0 resultados; grep -niE 'deal.?room\|vidyard\|loom' src → 0; banco real: tables/public/feed_comments.md e win_loss_insight_comments.md sem coluna parent/reply/thread (grep '^\| (parent\|reply\|thread)' → 0); tables.md sem deal_room (grep → 0).

### F3179 · Componente/tela ActivityGoalCard (5 afirmações nos docs)

- **Tipo:** Componente
- **O que os docs afirmam:** ActivityGoalCard (activities/ActivityGoalCard.tsx): glass progress section, staggered activity animations.| Doc lista o componente `ActivityGoalCard.tsx` — card de meta de atividade. \| NÃO INICIADO (14/14): ActivityGoalCard existe com 0 importadores. \| src/components/activities/ActivityGoalCard.tsx não é importado por nenhum arquivo em src/ (grep -rl excluindo o próprio). Sem importadores. \| Apêndice A lista 1 módulo(s) de activities não alcançados pelo grafo determinístico a partir de src/main.tsx.
- **Fontes:** `docs/DESIGN_SYSTEM.md:1109`, `docs/DOCUMENTACAO_SISTEMA.md:351-358`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:90`, `docs/estado/02_DOMINIO_CRM_PIPELINE.md:138-138`, `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:819-819`
- **O que falta:** componente ActivityGoalCard ausente (componentes.json e src/)
- **Evidência:** componente ActivityGoalCard ausente (componentes.json e src/)| CONTESTADO pelo cético (REMOVIDO_INTENCIONALMENTE): src/components/activities/ActivityGoalCard.tsx removido no commit 89aacaff8 (2026-10-18) 'chore(ui): remove código morto — arquivos inalcançáveis e exports sem consumidor (#285)' (git show --stat: ActivityGoalCard.tsx \| 435 ----). grep -rnw ActivityGoalCard src → 0. Critério do item aceita 'Arquivo apagado'.
- **Revisão:** em disputa. O cético propõe Removido de propósito e o juiz ainda não decidiu.

### F3180 · Componente/tela DealAutoSummary (2 afirmações nos docs)

- **Tipo:** Componente
- **O que os docs afirmam:** NÃO INICIADO (14/14): DealAutoSummary existe com 0 importadores.| src/components/pipeline/DealAutoSummary.tsx não é importado por nenhum arquivo em src/ (grep -rl excluindo o próprio). Convive com DealSummaryCard.tsx (vivo).
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:90`, `docs/estado/02_DOMINIO_CRM_PIPELINE.md:136-136`
- **O que falta:** componente DealAutoSummary ausente (componentes.json e src/)
- **Evidência:** componente DealAutoSummary ausente (componentes.json e src/)| CONTESTADO pelo cético (REMOVIDO_INTENCIONALMENTE): src/components/pipeline/DealAutoSummary.tsx apagado no commit 89aacaff8 (#285, remoção de código morto); grep -rnw DealAutoSummary src → 0; DealSummaryCard.tsx segue vivo em src/components/pipeline/. Critério: 'Arquivo apagado ou importado por rota real'.
- **Revisão:** em disputa. O cético propõe Removido de propósito e o juiz ainda não decidiu.

### F3181 · Componente/tela EmptyStateClients (2 afirmações nos docs)

- **Tipo:** Componente
- **O que os docs afirmam:** Doc lista o componente `EmptyStateClients.tsx` — estado vazio personalizado de clientes.| Apêndice A lista 2 módulo(s) de shared não alcançados pelo grafo determinístico a partir de src/main.tsx.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:290-297`, `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:863-863`
- **O que falta:** componente EmptyStateClients ausente (componentes.json e src/)
- **Evidência:** componente EmptyStateClients ausente (componentes.json e src/)| CONTESTADO pelo cético (REMOVIDO_INTENCIONALMENTE): src/components/shared/EmptyStateClients.tsx apagado no commit 89aacaff8 (#285, 'arquivos inalcançáveis'); grep -rnw EmptyStateClients src → 0; src/components/shared/ hoje tem EmptyState.tsx genérico.
- **Revisão:** em disputa. O cético propõe Removido de propósito e o juiz ainda não decidiu.

### F3182 · Componente/tela GoalTracker (2 afirmações nos docs)

- **Tipo:** Componente
- **O que os docs afirmam:** Apêndice A lista 1 módulo(s) de goals não alcançados pelo grafo determinístico a partir de src/main.tsx.| Doc lista o componente `GoalTracker.tsx` — tracker visual de progresso.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:847-847`, `docs/DOCUMENTACAO_SISTEMA.md:423-431`
- **O que falta:** componente GoalTracker ausente (componentes.json e src/)
- **Evidência:** componente GoalTracker ausente (componentes.json e src/)| CONTESTADO pelo cético (REMOVIDO_INTENCIONALMENTE): src/components/goals/GoalTracker.tsx apagado no commit 89aacaff8 (#285, remoção de código morto); grep -rnw GoalTracker src → 0. Critério aceita 'decisão nominal ... deprecar'.
- **Revisão:** em disputa. O cético propõe Removido de propósito e o juiz ainda não decidiu.

### F3183 · Componente/tela MemberList (3 afirmações nos docs)

- **Tipo:** Componente
- **O que os docs afirmam:** Lista de membros com gestão.| Doc lista o componente `MemberList.tsx` — lista de membros. \| Apêndice A lista 1 módulo(s) de teams não alcançados pelo grafo determinístico a partir de src/main.tsx.
- **Fontes:** `docs/FUNCIONALIDADES_SISTEMA.md:253-253`, `docs/DOCUMENTACAO_SISTEMA.md:894-899`, `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:867-867`
- **O que falta:** componente MemberList ausente (componentes.json e src/)
- **Evidência:** componente MemberList ausente (componentes.json e src/)| CONTESTADO pelo cético (REMOVIDO_INTENCIONALMENTE): src/components/teams/MemberList.tsx apagado no commit 89aacaff8 (#285, 'arquivos inalcançáveis a partir de main.tsx'); grep -rnw MemberList src → 0; src/components/teams/ restante: CloserSelector, CreateTeamDialog, EditTeamDialog, TeamCard.
- **Revisão:** em disputa. O cético propõe Removido de propósito e o juiz ainda não decidiu.

### F3184 · Componente/tela MentionInput (4 afirmações nos docs)

- **Tipo:** Componente
- **O que os docs afirmam:** MentionInput existe com 0 consumidores; falta plugar no detalhe de deal/cliente e notificar.| NÃO INICIADO (14/14): MentionInput existe com 0 importadores. \| src/components/collaboration/MentionInput.tsx não é importado por nenhum arquivo em src/ (grep -rl excluindo o próprio). Sem importadores. \| Apêndice A lista 1 módulo(s) de collaboration não alcançados pelo grafo determinístico a partir de src/main.tsx.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:137`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:24`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:90`, `docs/estado/02_DOMINIO_CRM_PIPELINE.md:144-144`, `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:829-829`
- **O que falta:** componente MentionInput ausente (componentes.json e src/)
- **Evidência:** componente MentionInput ausente (componentes.json e src/)| CONTESTADO pelo cético (REMOVIDO_INTENCIONALMENTE): src/components/collaboration/MentionInput.tsx apagado no commit 89aacaff8 (#285, remoção de código morto); grep -rnw MentionInput src → 0; src/components/collaboration/ só tem TeamActivityFeed.tsx.
- **Revisão:** em disputa. O cético propõe Removido de propósito e o juiz ainda não decidiu.

### F3185 · Componente/tela QuickActions (2 afirmações nos docs)

- **Tipo:** Componente
- **O que os docs afirmam:** NÃO INICIADO (14/14): QuickActions existe com 0 importadores.| src/components/pipeline/QuickActions.tsx não é importado por nenhum arquivo em src/ (grep -rl excluindo o próprio). Substituído por QuickActionsMenu.tsx (vivo em DealCard.tsx) — refactor abandonado.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:90`, `docs/estado/02_DOMINIO_CRM_PIPELINE.md:134-134`
- **O que falta:** componente QuickActions ausente (componentes.json e src/)
- **Evidência:** componente QuickActions ausente (componentes.json e src/)| CONTESTADO pelo cético (REMOVIDO_INTENCIONALMENTE): src/components/pipeline/QuickActions.tsx apagado no commit 89aacaff8 (#285); grep -rnw QuickActions src → 0; substituto vivo src/components/pipeline/QuickActionsMenu.tsx.
- **Revisão:** em disputa. O cético propõe Removido de propósito e o juiz ainda não decidiu.

### F3186 · Componente/tela TaskCard (5 afirmações nos docs)

- **Tipo:** Componente
- **O que os docs afirmam:** NÃO INICIADO (14/14): TaskCard existe com 0 importadores.| src/components/tasks/TaskCard.tsx não é importado por nenhum arquivo em src/ (grep -rl excluindo o próprio). Substituído por DraggableTaskCard.tsx (vivo) — refactor abandonado. \| Doc lista o componente `TaskCard.tsx` — card de tarefa. \| Apêndice A lista 2 módulo(s) de tasks não alcançados pelo grafo determinístico a partir de src/main.tsx. \| tasks/TaskCard.tsx: glass + card-elevated, hover-lift, gradient-text client, type icons, complete button transitions.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:90`, `docs/estado/02_DOMINIO_CRM_PIPELINE.md:139-139`, `docs/DOCUMENTACAO_SISTEMA.md:399-408`, `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:865-865`, `docs/DESIGN_SYSTEM.md:724,1130`
- **O que falta:** componente TaskCard ausente (componentes.json e src/)
- **Evidência:** componente TaskCard ausente (componentes.json e src/)| CONTESTADO pelo cético (REMOVIDO_INTENCIONALMENTE): src/components/tasks/TaskCard.tsx apagado no commit 89aacaff8 (#285); grep -rnw TaskCard src → 0; substituto vivo src/components/tasks/DraggableTaskCard.tsx.
- **Revisão:** em disputa. O cético propõe Removido de propósito e o juiz ainda não decidiu.

### F3187 · Componente/tela TaskListAdvanced (3 afirmações nos docs)

- **Tipo:** Componente
- **O que os docs afirmam:** NÃO INICIADO (14/14): TaskListAdvanced existe com 0 importadores.| src/components/tasks/TaskListAdvanced.tsx não é importado por nenhum arquivo em src/ (grep -rl excluindo o próprio). Substituído por TaskQueue.tsx (vivo) — refactor abandonado. \| Doc lista o componente `TaskListAdvanced.tsx` — lista avançada de tarefas.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:90`, `docs/estado/02_DOMINIO_CRM_PIPELINE.md:140-140`, `docs/DOCUMENTACAO_SISTEMA.md:399-408`
- **O que falta:** componente TaskListAdvanced ausente (componentes.json e src/)
- **Evidência:** componente TaskListAdvanced ausente (componentes.json e src/)| CONTESTADO pelo cético (REMOVIDO_INTENCIONALMENTE): src/components/tasks/TaskListAdvanced.tsx apagado no commit 89aacaff8 (#285); grep -rnw TaskListAdvanced src → 0; substituto vivo src/components/tasks/TaskQueue.tsx.
- **Revisão:** em disputa. O cético propõe Removido de propósito e o juiz ainda não decidiu.

### F0028 · Editor de polígonos do mapa de territórios

- **Tipo:** Componente
- **O que os docs afirmam:** Mapa de territórios não tem editor de polígonos.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:169`
- **O que falta:** coluna geometry/geojson em territories com RLS, lib de mapa com desenho de polígono, editor que grava e rota/menu.
- **Evidência:** tables/public/territories.md colunas 1-7 (id, name, current_owner_id, total_revenue, total_deals, conquered_at, updated_at) — sem geometria/polígono. `grep -rniE "polygon\|leaflet\|mapbox\|geojson\|geometry" src/` → só componentes de race/ e src/components/map/ClientsMap.tsx (`grep -niE "polygon\|territor\|draw" ClientsMap.tsx` → 0). src/components/territories/TerritoriesBoard.tsx:7 é board gamificado (Crown/Swords), sem mapa.| cético: Confirmado: `grep -rln 'polygon\|Polygon' src --include=*.tsx` → só src/components/race/* e vendedores/podium/HexFrame.tsx (decoração SVG); tabela territories sem coluna de geometria (tables/public/territories.md colunas 1-7).

### F0033 · Route optimization para vendedores externos

- **Tipo:** Componente
- **O que os docs afirmam:** Falta otimização de rotas.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:120`
- **O que falta:** modelo de visitas do dia com RLS, integração de roteirização e tela para vendedor externo.
- **Evidência:** `grep -rniE "route.?optim\|optimi[sz]e.?route\|otimiza.{0,10}rota\|visit.?plan\|roteiriz" src/ supabase/functions` → 0; src/components/territory-optimization/ (`grep -rniE "visit\|rota\|route"` → 0) trata de balanceamento de território, não de rota de visitas.| cético: `grep -rniE 'route.?optim\|otimiza.{0,10}rota\|roteiriz' src supabase/functions` → 0 resultados.

### F0034 · Threaded comments em registros

- **Tipo:** Componente
- **O que os docs afirmam:** Falta comentários em thread.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:138`
- **O que falta:** parent_id em tabela de comentários, RLS, hook e UI aninhada.
- **Evidência:** tables/public/feed_comments.md colunas 1-5 (id, feed_item_id, salesperson_id, content, created_at) — sem parent_id; `grep -iE parent feed_comments.md win_loss_insight_comments.md` → 0; `ls tables/public| grep -i comment` → só feed_comments e win_loss_insight_comments. UI de comentários: src/components/competitive/VictoryFeedItem.tsx via src/hooks/useVictoryFeed.ts, lista plana. \| cético: `grep -l 'parent_id\|reply_to\|parent_comment' tables/public/*.md` → só churn_alert_settings, competitor_mentions, inbound_reply_events (nenhuma de comentários); feed_comments.md e win_loss_insight_comments.md sem 'parent'.

### F0035 · Threads de comentários

- **Tipo:** Componente
- **O que os docs afirmam:** Não iniciado (gap classe mundial).
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:171`
- **O que falta:** idem F0034.
- **Evidência:** Mesmo artefato de F0034: nenhuma tabela de comentários com parent_id (feed_comments.md colunas 1-5; win_loss_insight_comments sem parent); `grep -rniE "parent_comment\|reply_to\|replyTo" src/hooks src/components/collaboration` → 0 (os únicos hits de "thread" são is_single_threaded em useRevenueIntelligenceHub.ts:86 e singleThreadedCount em useCommitteeCoverage.ts:105, sem relação).| cético: Mesma evidência de F0034: nenhuma tabela de comentários com parent_id no snapshot; nenhuma UI de threads.

### F3188 · calculate-committee-coverage agendado e extract-committee gravando

- **Tipo:** Agendamento (cron)
- **O que os docs afirmam:** PARCIAL: 2 chamadores em src/; sem cron.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:205`
- **O que falta:** nenhum job em pg_cron para "calculate-committee-coverage" (cron.md, 45 jobs)
- **Evidência:** nenhum job em pg_cron para "calculate-committee-coverage" (cron.md, 45 jobs)| CONTESTADO pelo cético (PARCIAL): Existem artefatos: supabase/functions/calculate-committee-coverage/ (pasta existe) chamada por src/hooks/deal-intelligence/useDealStakeholders.ts:108,126 e useCommitteeCoverage.ts:194; extract-committee-from-call está na allowlist (.github/workflows/deploy.yml:144) e grava em deal_stakeholders/committee_extraction_runs (supabase/functions/extract-committee-from-call/index.ts:224,231,238; ambas tabelas com RLS em tables.md:96,131). Porém calculate-committee-coverage está FORA da allowlist deploy.yml:144 (não roda em produção) e cron.md não tem job 'committee' (grep → 0).
- **Revisão:** em disputa. O cético propõe Parcial e o juiz ainda não decidiu.

### F3189 · Tarefas automáticas para deals estagnados

- **Tipo:** Agendamento (cron)
- **O que os docs afirmam:** Edge create-stagnant-tasks (Service) cria tarefas para deals estagnados; useStagnantTasks exibe.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:1004,414`
- **O que falta:** nenhum job em pg_cron para "create-stagnant-tasks" (cron.md, 45 jobs)
- **Evidência:** nenhum job em pg_cron para "create-stagnant-tasks" (cron.md, 45 jobs)| CONTESTADO pelo cético (PARCIAL): supabase/functions/create-stagnant-tasks está na allowlist (deploy.yml:144) e insere em tasks (index.ts:104,141; public.tasks RLS sim, tables.md:357); disparada pelo front: src/hooks/useStagnantTasks.ts:19 invoke, botão em src/pages/Tarefas.tsx:5,14,51 (rota /tarefas AppRoutes.tsx:287, menu sidebarMenuData.ts:131). Sem agendamento: cron.md grep 'stagnant' → 0.
- **Revisão:** em disputa. O cético propõe Parcial e o juiz ainda não decidiu.

### F3192 · RPC get_activity_stats agregando no banco

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** getActivityStats carrega todas as activities em memória; recomenda RPC SQL get_activity_stats(p_salesperson_id) com agregação.
- **Fontes:** `docs/reports/BACKEND_ANALYSIS_REPORT.md:373-413`
- **O que falta:** Criar RPC public.get_activity_stats(p_salesperson_id) (SECURITY INVOKER) e trocar useActivityStats para supabase.rpc.
- **Evidência:** função "get_activity_stats" ausente do banco real (functions.md)| cético: ausente: grep get_activity_stats functions.md → 0; src/services/activityService.ts foi apagado (commit fb05a5709); o cálculo equivalente atual src/hooks/activities/useActivities.ts:52-66 (useActivityStats) ainda faz .from('activities').select('*') e agrega em memória.

### F0046 · Validation rules

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** Não iniciado.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:171`
- **O que falta:** tabela de regras com RLS, aplicação em trigger/form e UI admin.
- **Evidência:** `grep -rniE "validation_rule\|validationRule\|ValidationRule" src/ supabase/` → 0; `ls tables/public| grep -i valid` → 0; funções validate_* no banco (validate_api_token, validate_mood_value, validate_race_event, validate_session, is_valid_status_transition) são checagens fixas, não regras configuráveis. docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:171 lista como não iniciado. \| cético: `grep -rli validation_rule <snapshot>/supabase` → 0; B_funcionalidades_docs.md:27 'NÃO INICIADO'.

### F3194 · Hook órfão useICPDataByClientId

- **Tipo:** Hook
- **O que os docs afirmam:** Exportado em `src/hooks/useICPData.ts` com zero referência em src/, tests/ e scripts/, inclusive dentro do próprio arquivo (critério rg -w).
- **Fontes:** `docs/estado/09_HOOKS_SERVICES.md:186`
- **O que falta:** hook useICPDataByClientId ausente (hooks.json e arquivos src/)
- **Evidência:** hook useICPDataByClientId ausente (hooks.json e arquivos src/)| CONTESTADO pelo cético (REMOVIDO_INTENCIONALMENTE): git show 9e4b2231a -- src/hooks/useICPData.ts: '-export function useICPDataByClientId(...)'; commit 9e4b2231a (#217) 'chore: remover código morto catalogado pela auditoria (hooks órfãos...)'. grep -rnw useICPDataByClientId src → 0. Critério aceita 'símbolo removido'.
- **Revisão:** em disputa. O cético propõe Removido de propósito e o juiz ainda não decidiu.

### F3195 · Hook órfão useUpdateAgendaEvent

- **Tipo:** Hook
- **O que os docs afirmam:** Exportado em `src/hooks/calendar/useAgendaEvents.ts` com zero referência em src/, tests/ e scripts/, inclusive dentro do próprio arquivo (critério rg -w).
- **Fontes:** `docs/estado/09_HOOKS_SERVICES.md:208`
- **O que falta:** hook useUpdateAgendaEvent ausente (hooks.json e arquivos src/)
- **Evidência:** hook useUpdateAgendaEvent ausente (hooks.json e arquivos src/)| CONTESTADO pelo cético (REMOVIDO_INTENCIONALMENTE): git show 9e4b2231a -- src/hooks/calendar/useAgendaEvents.ts: '-export const useUpdateAgendaEvent = () => {'; commit #217 'remover código morto catalogado pela auditoria (hooks órfãos)'. grep -rnw useUpdateAgendaEvent src → 0.
- **Revisão:** em disputa. O cético propõe Removido de propósito e o juiz ainda não decidiu.

### F3198 · Hook useGoals (3 afirmações nos docs)

- **Tipo:** Hook
- **O que os docs afirmam:** Backend/hook pronto para goals genéricos; UI atual: 5 imports (parcial).| Doc lista o hook `useGoals.ts` — metas. \| Exportado em `src/hooks/sales/useGoals.ts` com zero referência em src/, tests/ e scripts/, inclusive dentro do próprio arquivo (critério rg -w).
- **Fontes:** `docs/FUNCIONALIDADES_SEM_UI.md:76`, `docs/DOCUMENTACAO_SISTEMA.md:437`, `docs/estado/09_HOOKS_SERVICES.md:184`
- **O que falta:** hook useGoals ausente (hooks.json e arquivos src/)
- **Evidência:** hook useGoals ausente (hooks.json e arquivos src/)| CONTESTADO pelo cético (REMOVIDO_INTENCIONALMENTE): src/hooks/sales/useGoals.ts apagado no commit 9e4b2231a (#217) 'remover código morto catalogado pela auditoria (hooks órfãos...)' (git show --stat: src/hooks/sales/useGoals.ts \| 13 -); grep -rnw useGoals src → 0. Critério aceita 'símbolo removido'.
- **Revisão:** em disputa. O cético propõe Removido de propósito e o juiz ainda não decidiu.

### F0051 · Calendar sync bidirecional (Google/Outlook/iCloud)

- **Tipo:** Integração externa
- **O que os docs afirmam:** Falta sync bidirecional de calendário.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:53`
- **O que falta:** Edge function de sync com OAuth Google/Microsoft/iCloud, tabela de tokens e mapeamento de eventos externos com RLS, cron de sincronização e UI de conexão.
- **Evidência:** ausente: grep -rniE 'calendar[-_ ]?sync\|google[-_]?calendar\|outlook\|icloud\|caldav' src supabase/functions → 0 resultados reais (únicos hits são 'LeaderGapIndicator', falso positivo); ls supabase/functions| grep -iE 'calendar\|google\|outlook' → 0; tables.md grep 'calendar' → 0 (agenda local é public.agenda_events, sem coluna de provedor externo). \| cético: Confirmado. ausente: grep -rniE 'calendar[-_ ]?sync\|googleapis.com/calendar\|graph.microsoft\|caldav\|\.ics\b\|text/calendar' src supabase/functions → 0 resultados; ls supabase/functions \| grep -iE 'remind\|agenda\|calendar\|meeting\|event' → só process-race-event (não é calendário). tables.md não tem tabela de calendário externo; agenda é local (agenda_events, 0 linhas em stats.md:121).

### F0052 · Document collaboration (Google Docs/Office embed)

- **Tipo:** Integração externa
- **O que os docs afirmam:** Falta embed de documentos colaborativos.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:139`
- **O que falta:** Componente de embed de Google Docs/Office, vínculo documento↔registro em tabela com RLS e autenticação com o provedor.
- **Evidência:** ausente: grep -rniE 'docs\.google\|office\.com\|onedrive\|document[-_]?collab' src supabase/functions → 0; grep -rniE '<iframe' src --include=*.tsx → 0.| cético: Confirmado. ausente: grep -rniE 'docs\.google\|officeapps\|onedrive' src supabase/functions → 0. Correção menor: existe 1 iframe em src/components/reporting/embedHelpers.ts:35, mas ele gera HTML para embutir relatório do CRM fora do sistema, não para embutir documento colaborativo externo no registro.

### F0055 · Custom objects, validation rules, custom apps e app builder

- **Tipo:** Outro
- **O que os docs afirmam:** Plataforma de custom objects/validation rules/app builder; ausente.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:27`
- **O que falta:** Tabelas custom_objects, registros e validation_rules com RLS, motor de validação e UI de construtor.
- **Evidência:** ausente: grep -rniE 'custom_object\|validation_rule\|app[-_]?builder' src supabase → 0; tables.md grep 'custom_object\|validation_rule' → 0. Existe apenas campos customizados de vendedor (public.team_custom_fields, public.salesperson_custom_field_values; src/components/settings/CustomFieldsManager.tsx), que não é plataforma de objetos/regras.| cético: Confirmado. ausente: grep -rniE 'custom_objects?\b\|validation_rules?\b\|app[-_ ]?builder' src supabase → 0 resultados. Só existem campos customizados de vendedor (team_custom_fields), que não são objetos nem regras de validação.

### F3201 · /calendario: Calendario.tsx é wrapper de calendar/ActivityCalendar (não confirmado manualmente)

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Probe de 2 níveis não achou supabase/useQuery; doc não confirmou manualmente.
- **Fontes:** `docs/estado/01_FRONTEND_ROTAS.md:320-320`
- **O que falta:** rota /calendario: não existe em src/routes/AppRoutes.tsx (rotas.json)
- **Evidência:** rota /calendario: não existe em src/routes/AppRoutes.tsx (rotas.json)| CONTESTADO pelo cético (IMPLEMENTADO): Rota existe: src/routes/AppRoutes.tsx:270 `<Route path="/calendario" element={<Calendario />} />`; menu sidebarMenuData.ts:130,214,299; src/pages/Calendario.tsx:1,17 monta ActivityCalendar; src/components/calendar/ActivityCalendar.tsx:15,96-97 usa useTasks(salesperson.id) (src/hooks/tasks/useTaskQueries.ts:27 .from('tasks')) e useUpdateTask no drop (:119-130) persistindo due_date; public.tasks com RLS (tables.md:357).
- **Revisão:** em disputa. O cético propõe Implementado e o juiz ainda não decidiu.

### F0063 · Deal rooms

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Não iniciado.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:171`
- **O que falta:** Tabela deal_rooms (com membros e arquivos) com RLS, rota e componente.
- **Evidência:** ausente: grep -rniE 'deal[-_ ]?room\|war[-_ ]?room\|dealroom\|deal[-_ ]?space' src supabase → 0; tables.md grep 'deal_room' → 0.| cético: Confirmado. ausente: grep -rniE 'deal[-_ ]?room\|dealroom' src supabase → 0 resultados.

### F3204 · Rota /vendedor/:id (4 afirmações nos docs)

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Links por template literal /vendedor/${id} em Vendedores.tsx:212, RankingGridItem.tsx:82, CoachingIntelligenceHub.tsx:149, VictoryFeedPage.tsx:109,167.| Dashboard individual por vendedor com métricas e progresso pessoal. \| API.md declara a rota `/vendedor/:id` renderizando o componente VendedorDashboard com acesso "autenticado". \| Rota registrada em AppRoutes.tsx com acesso "autenticado", GET em produção 200, chamando as edge functions next-best-action, personal-assistant-stream. Status no doc: OK
- **Fontes:** `docs/estado/01_FRONTEND_ROTAS.md:274-274`, `docs/FUNCIONALIDADES_COMPLETAS.md:70-72`, `docs/API.md:293-293`, `docs/DOCUMENTACAO_SISTEMA.md:1662`, `docs/prod-readiness.md:246`
- **O que falta:** rota /vendedor/:id não existe em src/routes/AppRoutes.tsx (rotas.json)
- **Evidência:** rota /vendedor/:id não existe em src/routes/AppRoutes.tsx (rotas.json)| CONTESTADO pelo cético (IMPLEMENTADO): Rota existe: src/routes/AppRoutes.tsx:259 `<Route path="/vendedor/:id" element={<VendedorDashboard />} />`; links: Vendedores.tsx:210, RankingGridItem.tsx:82, CoachingIntelligenceHub.tsx:225, VictoryFeedPage.tsx:115,170, VictoryFeedItem.tsx:143; src/pages/VendedorDashboard.tsx:219-221 useParams id → useVendedorData filtrando salespeople/sales_goals/sales por id (:57-95), loading (SkeletonTransition :297-299) e erro 'Vendedor não encontrado' (:277-282); next-best-action e personal-assistant-stream na allowlist deploy.yml:144.
- **Revisão:** em disputa. O cético propõe Implementado e o juiz ainda não decidiu.

### F3205 · Rota /vendedor/:id → VendedorDashboard.tsx (IMPLEMENTADO_TOTAL)

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Rota /vendedor/:id (AppRoutes.tsx:116) renderiza src/pages/VendedorDashboard.tsx; sem role explícito (só autenticação global). Classificação do doc: IMPLEMENTADO_TOTAL. Evidência: link src/pages/Vendedores.tsx:212 (template literal /vendedor/$id) · sb=10 useQuery=8 mut=4 (árvore 33 arq.)
- **Fontes:** `docs/estado/01_FRONTEND_ROTAS.md:52-52`
- **O que falta:** rota /vendedor não existe em src/routes/AppRoutes.tsx (rotas.json)
- **Evidência:** rota /vendedor não existe em src/routes/AppRoutes.tsx (rotas.json)| CONTESTADO pelo cético (IMPLEMENTADO): src/routes/AppRoutes.tsx:259 registra /vendedor/:id → VendedorDashboard; link src/pages/Vendedores.tsx:210 `to={`/vendedor/${sp.id}`}` (menu Vendedores sidebarMenuData.ts:101); VendedorDashboard.tsx:54-95 useQuery com leituras reais de salespeople, sales_goals, sales (todas com RLS: tables.md:299,302,305); estados loading/erro em :277-299.
- **Revisão:** em disputa. O cético propõe Implementado e o juiz ainda não decidiu.

### F3206 · activityService.getRecentActivities com select específico e paginação por cursor

- **Tipo:** Service/lib
- **O que os docs afirmam:** getRecentActivities usa select(*) e limit 100 hardcoded; recomenda campos específicos + cursor (.lt created_at).
- **Fontes:** `docs/reports/BACKEND_ANALYSIS_REPORT.md:417-436`
- **O que falta:** arquivo activityService ausente em src/
- **Evidência:** arquivo activityService ausente em src/| CONTESTADO pelo cético (REMOVIDO_INTENCIONALMENTE): src/services/activityService.ts apagado no commit fb05a5709 (2026-05-31) 'refactor: remove 44 orphaned barrel/utility files — Delete src/services/activityService.ts and leaguesService.ts (0 consumers each)'. Sucessor src/hooks/activities/useActivities.ts (useRecentActivities, bloco :33-42 do trecho) ainda usa select('*') + limit sem cursor.
- **Revisão:** em disputa. O cético propõe Removido de propósito e o juiz ainda não decidiu.

### F3207 · Helper órfão tasks

- **Tipo:** Service/lib
- **O que os docs afirmam:** tasks: helper de tarefas; arquivo de lógica pura nunca importado (ou quase).
- **Fontes:** `docs/FUNCIONALIDADES_SEM_UI.md:121`
- **O que falta:** Nenhum helper 'tasks' órfão existe; a entrada em docs/FUNCIONALIDADES_SEM_UI.md:121 está desatualizada/incorreta.
- **Evidência:** arquivo tasks ausente em src/| cético: ausente: find src -iname 'tasks.ts*' → 0; git log --all --name-only \| grep -E '(lib\|utils\|helpers)/.*task' → 0 (nunca existiu helper de tarefas no histórico); src/hooks/tasks/index.ts é barrel usado por src/hooks/useTasks.ts:6, não órfão.

### F3217 · Testes cobrem o caminho de erro do RPC get_current_salesperson_id (#469, #473)

- **Tipo:** Teste
- **O que os docs afirmam:** Falha de severidade baixa registrada pela validação adversarial, sem correção nesta rodada.
- **Fontes:** `docs/prod-readiness.md:1006`
- **O que falta:** Faltam casos de teste em que o RPC get_current_salesperson_id responde { data: null, error: {...} }, nos dois arquivos, conferindo que a mutação falha e não grava nada.
- **Evidência:** Os arquivos de teste existem com extensão .tsx (src/hooks/useNPSSurveys.test.tsx, src/hooks/tasks/useTaskMutations.test.tsx), mas nenhum caso tem o RPC falhando, que é o critério do item. Em useNPSSurveys.test.tsx:28 o mock sempre responde { data: 'sp-logado', error: null }, e grep 'error' no arquivo → só :9, :27 e :28, todos sem erro. Em useTaskMutations.test.tsx:16 o mock também sempre responde error: null; o caso :76 testa data null (vendedor sem cadastro), não erro do RPC. A pendência segue registrada em docs/prod-readiness.md:1012 (#473).
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Não implementado.

## Parcial (40)

### F0011 · Componente AddMemberButton

- **Tipo:** Ação/botão
- **O que os docs afirmam:** Adição de novos membros ao time.
- **Fontes:** `docs/FUNCIONALIDADES_SISTEMA.md:254-254`
- **O que falta:** AddMemberButton e tabela team_members não existem; adicionar membro só dentro de Create/EditTeamDialog (team_closers).
- **Evidência:** ausente: `find src -iname 'AddMemberButton*'` → 0 resultados; `find src -iname 'MemberList*'` → 0; tabela team_members não existe no banco (tables.md só tem race_team_members, teams, team_closers). Funcionalidade equivalente existe: src/components/teams/CloserSelector.tsx usado em EditTeamDialog.tsx:28,208 e CreateTeamDialog.tsx:68-81 (closer_ids, exige 2 closers) → src/hooks/useTeams.ts:93 (.from('team_closers').insert) e :142 (delete ao editar); rota /times em AppRoutes.tsx:891-894; team_closers RLS sim (tables/public/team_closers.md:7). O único 'addMember' do repo é de squads (src/components/admin/task-console/SquadManager.tsx:211, useSquads.ts:77), outro domínio.| cético: Confirmado: `ls src/components/teams/` → só CloserSelector, CreateTeamDialog, EditTeamDialog, TeamCard (sem AddMemberButton); `grep team_members tables.md` → só race_team_members (:282). Equivalente via CloserSelec…

### F0016 · Rota /importar-exportar — CSV, XLSX, JSON

- **Tipo:** Ação/botão
- **O que os docs afirmam:** Importação e exportação em 3 formatos.
- **Fontes:** `docs/FUNCIONALIDADES_COMPLETAS.md:514-516`
- **O que falta:** Import/export XLSX (pode reutilizar exceljs/excelExporter.ts) e JSON em src/pages/ImportExport.tsx, ou corrigir o doc para CSV/TSV.
- **Evidência:** Rota /importar-exportar em src/routes/AppRoutes.tsx:149,917-920 e menu sidebarMenuData.ts:304; src/pages/ImportExport.tsx:116 (clientService.importClients → src/services/clientService.ts:136 .from('clients').insert) e :136-168 (export gera Blob CSV); porém só CSV/TSV: ImportExport.tsx:178,189,226-234 (accept='.csv,.tsv,.txt'); ausente: `grep -rn -i "xlsx\\|sheetjs" src/pages/ImportExport.tsx package.json` → 0 resultados; nenhum parser JSON na página.| cético: Confirmado só CSV/TSV: src/pages/ImportExport.tsx:234 (accept='.csv,.tsv,.txt') e :136-172 (export gera Blob text/csv). Nuance: o repo tem dependência exceljs (package.json:119) e src/lib/excelExporter.ts, mas só usado em src/pages/SDRDashboard.tsx:45, não em ImportExport.tsx.

### F0019 · ABM: whitespace/cross-sell e campanhas ABM

- **Tipo:** Componente
- **O que os docs afirmam:** ABM tem hierarquia (parent_account_id) e account_plans em /abm; falta análise de whitespace e campanhas ABM.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:23`
- **O que falta:** Visão de whitespace/cross-sell por conta e CRUD de campanhas ABM (tabela com RLS + UI); além disso a tela de planos (/abm) não está no menu.
- **Evidência:** Hierarquia e planos existem: src/hooks/abm/useAccounts.ts:15 (parent_account_id), :64-131 (useAccountPlan/useUpdateAccountPlan em account_plans); banco tables/public/accounts.md:21,50 (parent_account_id + FK) e tables.md:12 (account_plans, RLS sim); rota /engagement/abm (AppRoutes.tsx:335). Ausente: `grep -rn -i "whitespace\\|cross.sell\\|abm_campaign\\|account_campaign\\|campanha" src/hooks/abm src/components/abm src/pages/AccountBasedSelling.tsx` → 0 resultados; tables.md sem tabela de campanha ABM/whitespace (só campaign_health_alerts, de marketing).| cético: Confirmado ausência de whitespace/campanha ABM (`grep -rn -i "cross.sell\\|crossSell\\|cross_sell" src` → só textos em ScenarioSimulator/CustomerSuccess, nada em abm). Agravante: account_plans/parent_account_id são editados em src/pages/AccountBasedSelling.tsx:70,784, montada só em AppRoutes.tsx:379 (/abm), fora do menu (sidebar…

### F0022 · Buying Committee mapping (org chart com champions/blockers)

- **Tipo:** Componente
- **O que os docs afirmam:** Falta mapa visual do comitê de compra.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:66`
- **O que falta:** Visualização hierárquica (org chart) do comitê na tela do cliente/conta; hoje só listas com papéis por deal e por conta ABM.
- **Evidência:** Existe mapa de comitê: src/components/revenue-intelligence/BuyingCommitteeMap.tsx:33-37 (roleConfig champion/decision_maker/blocker...), importado em RevenueIntelligenceHub.tsx:24 e AIForecastPanel.tsx:4 → rota /revenue-intelligence (AppRoutes.tsx:356); dados reais em src/hooks/revenue/useRevenueIntelligenceHub.ts:96-137 (.from('buying_committee_members') select/insert/update) e deal_stakeholders em src/hooks/pipeline/useDealCardContext.ts:31; banco tables.md:40-41 (buying_committee, buying_committee_members) e :131 (deal_stakeholders), RLS sim. Porém: tabela client_contacts não existe no banco (`grep client_contacts tables.md` → 0); o mapa é por deal/revenue hub, não um org chart no cliente (`grep -rln "OrgChart\\|org-chart\\|organigrama" src` → 0).| cético: Mantém PARCIAL, mas o mapeamento não é só por deal: account_contacts tem buying_role/influence_level/seniority (tables/public/acc…

### F0027 · Editor de campos customizados

- **Tipo:** Componente
- **O que os docs afirmam:** RPCs existem sem UI.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:170`
- **O que falta:** Editor de valores por vendedor (hook com upsert em salesperson_custom_field_values + inputs no perfil/admin do vendedor) ou deploy de ranking-api (incluir na allowlist) com chamador.
- **Evidência:** Definição de campos existe: src/components/settings/CustomFieldsManager.tsx (select/insert/toggle em team_custom_fields) montado em src/pages/Configuracoes.tsx:19,301. Valores por vendedor só têm leitura: `grep -rn salesperson_custom_field_values src` (excl. types.ts) → 1 resultado, src/hooks/sales/useSalespersonCustomFields.ts:31 (select); src/components/salespeople/CustomFieldsDisplay.tsx:1-45 só renderiza Badge, sem Input/onChange. Único gravador é supabase/functions/ranking-api/index.ts:333-340 (upsert), e ranking-api está fora da allowlist (allowlist em .github/workflows/deploy.yml:144 só contém notify-ranking-position) e sem chamador em src (`grep -rn ranking-api src` → 0). Doc docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:20 também registra PARCIAL ('Só existe leitura').
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Implementado.

### F0029 · Etapa canônica 26/08 nº 56: Consertar contratos do frontend (auth_users_view, orders→profiles)

- **Tipo:** Componente
- **O que os docs afirmam:** Etapa canônica 56 (plano 26/08, matriz de status 30/08, estado 🔒): regenerar tipos; remover casts; testes de Configurações e histórico.
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:201-201`
- **O que falta:** criar auth_users_view ou trocar a consulta, resolver join orders→profiles, remover os dois casts e adicionar testes.
- **Evidência:** auth_users_view não existe no banco (`grep -rl auth_users_view <snapshot>/supabase` → 0) nem em src/integrations/supabase/types.ts (0), mas src/components/settings/FollowUpTerritoryRules.tsx:29 mantém o cast `supabase as unknown as SupabaseClient` e :61,:83 consultam auth_users_view (montado em src/pages/Configuracoes.tsx:54 → falha em runtime). orders→profiles: src/hooks/orders/usePurchaseHistory.ts:54 cast e :60 `profiles:user_id(display_name)` sem FK orders→profiles no banco (tables/public/orders.md:41-45 só clients/quotes/salespeople); usado em src/components/purchase-intelligence/ClientPurchaseHistory.tsx:29-45. follow_up_territory_rules já está em types.ts:8853 (comentário de :26-27 defasado). Testes de Configurações: `ls src/pages/*Configuracoes*.test.* src/components/settings/*.test.*` → 0.| cético: Confirmado: src/components/settings/FollowUpTerritoryRules.tsx:26-29 cast `supab…

### F0030 · Gerenciador de filtros salvos

- **Tipo:** Componente
- **O que os docs afirmam:** RPCs existem e têm 0 usos na UI.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:170`
- **O que falta:** Diálogo de gestão (renomear e marcar padrão via updateFilter) e compartilhamento de filtros (coluna + policy RLS + UI).
- **Evidência:** src/components/filters/SavedFiltersBar.tsx:22 desestrutura só saveFilter e deleteFilter (:29, :62); a mutação updateFilter de src/hooks/useSavedFilters.ts:85 (exportada em :131) não tem consumidor (`grep -rn updateFilter src` → só o hook e homônimos sem relação em ReportFilterBuilder/SDRAdvancedFilters). Sem renomear/definir padrão na UI e sem compartilhamento. Doc B_funcionalidades_docs.md:19 marca PARCIAL 'sem tela de gestão' (renomear/excluir/compartilhar).
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Implementado.

### F0031 · Leitor de histórico de campos (entity_versions)

- **Tipo:** Componente
- **O que os docs afirmam:** entity_versions sem leitor.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:170`
- **O que falta:** triggers de versionamento nas tabelas alvo, hook leitor e componente de histórico montado no detalhe do registro.
- **Evidência:** Tabela existe: tables/public/entity_versions.md:7 RLS habilitado. Função public.create_version existe (functions/public/create_version__12ae32cb1ec02d01.sql) mas `grep -c create_version <snapshot>/supabase/triggers.md` → 0: nenhum trigger a usa em produção. Leitor: `grep -rn "entity_versions" src/ supabase/functions` (excl. types.ts) → 0.| cético: Confirmado: entity_versions existe (tables/public/entity_versions.md) e create_version existe (functions/public/create_version__12ae32cb1ec02d01.sql), mas `grep -c create_version triggers.md` → 0 e `grep -n entity_versions triggers.md` → 0; `grep -rln 'entity_versions\|create_version' src supabase/functions` (excl. types.ts) → 0. Só backend, sem leitor nem gravador ativo.

### F0032 · Lixeira de soft delete na UI

- **Tipo:** Componente
- **O que os docs afirmam:** soft_delete_record/restore_deleted_record/get_deleted_records existem com 0 usos na UI.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:170`
- **O que falta:** página admin de lixeira usando get_deleted_records/restore_deleted_record, rota em AppRoutes.tsx e entrada no menu.
- **Evidência:** RPCs existem no banco: functions/public/soft_delete_record__8331f556074113fc.sql (SECURITY DEFINER, exige is_admin_or_manager), restore_deleted_record__7911d22e4eb4f5ac.sql, get_deleted_records__d2d5dcce3eec004b.sql. `grep -rn "soft_delete_record\\|restore_deleted_record\\|get_deleted_records" src/` (excl. types.ts) → 0; `grep -rn Lixeira src/` → 0.| cético: Confirmado: RPCs no banco (functions/public/get_deleted_records__d2d5dcce3eec004b.sql, restore_deleted_record__7911d22e4eb4f5ac.sql, soft_delete_record__8331f556074113fc.sql); `grep -rniE 'get_deleted_records\|restore_deleted\|lixeira' src/pages src/routes` → 0 (só ícones Trash2).

### F0036 · UI de histórico de campos (entity_versions)

- **Tipo:** Componente
- **O que os docs afirmam:** entity_versions é escrita por trigger e não tem leitor; falta UI de histórico por campo.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:29`
- **O que falta:** triggers BEFORE UPDATE com create_version, hook useEntityVersions e UI de diff por campo.
- **Evidência:** entity_versions existe (tables/public/entity_versions.md:7 RLS sim) e create_version existe (functions/public/create_version__12ae32cb1ec02d01.sql: INSERT em entity_versions com row_to_json(OLD)), porém `grep -c create_version triggers.md` → 0 — a afirmação "escrita por trigger" não vale no banco real (só em supabase/migrations/20250102000003_versioning.sql, histórico). Leitor em src: `grep -rn entity_versions src/` (excl. types.ts) → 0.| cético: Confirmado: `grep -c create_version triggers.md` → 0 (afirmação 'escrita por trigger' não vale em produção); leitor ausente (`grep -rln entity_versions src` excl. types.ts → 0). Tabela e função existem.

### F0037 · UI para activity-goal-alerts: configuração de horário/canal de envio

- **Tipo:** Componente
- **O que os docs afirmam:** Falta configuração de horário/canal de envio.
- **Fontes:** `docs/FUNCIONALIDADES_SEM_UI.md:100`
- **O que falta:** configuração persistida (horário/canal/destinatários) com RLS, seção em Configurações e função/cron lendo essa config.
- **Evidência:** Função existe (supabase/functions/activity-goal-alerts/index.ts), está na allowlist (.github/workflows/deploy.yml:144) e tem cron 83 `activity-goal-alerts-daily` `0 18 * * *` (cron.md). Horário fixo no cron e canal fixo e-mail: index.ts:196-204 lê só `notification_preferences.email` (primeiro ativo), texto hardcoded "às 15h" em :211,:239 (diverge do cron 18h UTC). UI de configuração: `grep -rniE "goal.?alert\|alerta.{0,10}meta" src/components/settings src/pages/Configuracoes.tsx` → 0; src/components/admin/BackendAutomationMonitor.tsx:34 só monitora.| cético: Confirmado: activity-goal-alerts na allowlist (deploy.yml:144) e cron 83 `0 18 * * *` (cron.md:46) com horário fixo; nenhuma UI de configuração de horário/canal encontrada.

### F0038 · UI useTerritories: mapa interativo com edição de polígonos

- **Tipo:** Componente
- **O que os docs afirmam:** Falta mapa interativo com edição de polígonos para useTerritories (UI atual: 1 import).
- **Fontes:** `docs/FUNCIONALIDADES_SEM_UI.md:66`
- **O que falta:** mapa interativo com edição de polígonos + coluna de geometria; entrada no menu.
- **Evidência:** src/hooks/useTerritories.ts é importado só por src/components/territories/TerritoriesBoard.tsx; montado em src/pages/Territorios.tsx:2,27; rota /territorios em src/routes/AppRoutes.tsx:898; loading (TerritoriesBoard.tsx:21 skeleton) e vazio (:53) presentes. Sem entrada no menu (`grep "'/territorios'" sidebarMenuData.ts` → 0). Mapa/polígonos ausentes: `grep -niE "polygon\|leaflet\|map" TerritoriesBoard.tsx` → só ícone MapPin; tabela territories sem geometria (territories.md colunas 1-7).| cético: Confirmado: rota /territorios em src/routes/AppRoutes.tsx:898; sem entrada em src/components/layout/sidebar/sidebarMenuData.ts (grep territorios → 0); sem mapa/polígono (grep polygon em src → só race/ e podium).

### F0041 · Camada CRM core: pipeline Kanban, stage conversion, SLA de leads, cotações, cadências, comissões/premiações, território, CS

- **Tipo:** Doc/config
- **O que os docs afirmam:** ARCHITECTURE descreve a camada 'Operação de venda' com pipeline Kanban, stage conversion, SLA de leads, cotações, cadências automáticas, comissões/premiações, roteamento de território e Customer Success.
- **Fontes:** `docs/ARCHITECTURE.md:41-43`
- **O que falta:** incluir check-lead-sla na allowlist ou remover o cron 81; consumir auto_assign_lead no roteamento.
- **Evidência:** Rotas: AppRoutes.tsx:267 /pipeline, :533 /sla-tracking, :406 /orcamentos, :282 /cadencias, :431 /comissoes, :450 /admin/premiacoes, :541 /lead-routing, :763 /customer-success; páginas sem mock (`grep -ciE "mock\|Math.random\|TODO"` → 0 em Pipeline, SLATrackingPage, LeadRoutingPage, Comissoes, Cadencias, AdminPremiacoes). Ligados: analyze-stage-conversion na allowlist (deploy.yml:144) e chamado por src/hooks/deal-intelligence/useStageConversion.ts:68; process-cadence-tasks na allowlist, cron 78 (*/5) e src/pages/Cadencias.tsx:75; customer-success-360 invocado em src/hooks/customer-success/useCustomerSuccess360.ts:141; usePipeline.ts:158 move estágio via rpc; comissões src/hooks/useCommissionRules.ts:27. Furos: check-lead-sla existe no repo (supabase/functions/check-lead-sla/index.ts) mas FORA da allowlist (`grep check-lead-sla deploy.yml` → 0) enquanto cron 81 a invoca a cada 15 min (cro…

### F0043 · Comparativo: CRM Core completo

- **Tipo:** Doc/config
- **O que os docs afirmam:** Tabela comparativa marca CRM Core como ✅ completo.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:250`
- **O que falta:** Edição completa e exclusão (soft delete deleted_at/deleted_by) de vendas/deals na UI.
- **Evidência:** Clientes têm CRUD completo (src/services/clientService.ts insert/update/soft delete) e atividades também (src/hooks/activities/useActivities.ts:498-510 useDeleteActivity soft delete, usado em src/components/activities/ActivityItemRow.tsx:58,88; docs/soft-delete.md:19 está defasado nesse ponto). Mas vendas/deals não: src/services/salesService.ts:163-247 só lê e insere (único write em :247 insert); updates de sales em src são pontuais (estágio/atribuição em src/components/pipeline/QuickActionsMenu.tsx:114-115, MQL em src/components/sdr/MQLQualificationForm.tsx:78-79); grep de .delete( após from('sales') em src → 0; docs/soft-delete.md:17-18 confirma 'sales (não há delete no frontend)'. A afirmação de docs/GAPS_CLASSE_MUNDIAL.md:250 (CRM Core ✅) não se sustenta pelo critério de CRUD completo.
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Implementado.

### F3190 · Edge function auto-reassign-inactive (10 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** auto-reassign-inactive reatribui portfólios de clientes sem guarda de autorização.| Catálogo API.md lista a edge function `auto-reassign-inactive` na categoria "Leads / Roteamento" com auth "segredo interno (cron/service_role) · verify_jwt", método "só POST", payload "—" e resposta "JSON". \| Doc classifica como PARCIAL. Chamador(es): FE components/admin/BackendAutomationMonitor.tsx:59. Sem cron (UI diz "6h diário", AdminSystemStatus.tsx:33). Estratégia "round_robin" é shuffle Math.random (index.ts:250), não rodízio. \| Doc: job aceita só POST autenticado com service_role, limita a 20 RPCs paralelas e usa a RPC atômica; repo não tem agendamento que a invoque. \| Das 24 órfãs, auto-reassign-…
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:172-172`, `docs/API.md:204-204`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:55-55`, `docs/auditoria/CONTRATO_ROTEAMENTO_LEADS_2026-08-26.md:23,106`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:267`, `docs/estado/10_EDGE_FUNCTIONS.md:326-326` e mais 7
- **O que falta:** Implementar round robin determinístico no servidor (index.ts:256-259) em vez de shuffle Math.random.
- **Evidência:** supabase/functions/auto-reassign-inactive/index.ts existe; está na allowlist de deploy (.github/workflows/deploy.yml:144); ÓRFÃ: nenhum chamador no front, em edges ou em SQL/cron (edge-functions.json)| cético: Correção da evidência inicial: NÃO é órfã — cron.md:49 job 86 'auto-reassign-inactive-daily' `0 9 * * *` `SELECT public.trigger_internal_edge_job('auto-reassign-inactive')`, com execuções succeeded em 17-19/11 (cron-runs.md:376-382); function na allowlist deploy.yml:144; guarda de auth isAuthorizedCronJob (supabase/functions/auto-reassign-inactive/index.ts:4,62-66) e só POST (index.ts:58). Segue PARCIAL porque a estratégia 'round_robin' (default) é sorteio: index.ts:256-259 `rankedSalespeople.sort(() => Math.random() - 0.5)`.

### F3191 · Edge function geocode-proxy (3 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** Doc classifica como REAL. Chamador(es): FE components/map/ClientsMap.tsx:96. Nominatim + geocode_cache.| Três functions não deployadas aparecem como erro no console do usuário. \| supabase/functions/geocode-proxy existe no repo (citada em src/: sim); sonda OPTIONS em produção: OPTIONS → 404 NOT_FOUND (não publicada; limite de 100 funções do plano). Status no doc: BLOQUEADO.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:118-118`, `docs/agentes/veredicto-branches-vivas-261117.md:122-124`, `docs/prod-readiness.md:343`
- **O que falta:** Colocar geocode-proxy na allowlist de deploy (trocando outra function, limite de 100) para o mapa geocodificar em produção.
- **Evidência:** supabase/functions/geocode-proxy/index.ts existe; FORA da allowlist de deploy (.github/workflows/deploy.yml:144) → não roda em produção; chamada por: src/components/map/ClientsMap.tsx| cético: supabase/functions/geocode-proxy/ existe; chamada em src/components/map/ClientsMap.tsx:96 (montado por src/pages/MapaClientes.tsx); geocode_cache existe com RLS (tables.md:177); mas geocode-proxy NÃO está na allowlist .github/workflows/deploy.yml:144 (conferido nas 100 entradas) → 404 em produção.

### F3193 · Criar tarefa com responsável padrão = vendedor logado (useTaskMutations/CreateTaskDialog)

- **Tipo:** Hook
- **O que os docs afirmam:** useTaskMutations.ts:27 e CreateTaskDialog.tsx: vendedor não criava tarefa sem escolher responsável; agora padrão = logado e vendedor vê só a si (#469).
- **Fontes:** `docs/prod-readiness.md:972`
- **O que falta:** arquivo src/hooks/tasks/useTaskMutations.ts existe mas hook não consta em hooks.json (não exportado/indexado)
- **Evidência:** arquivo src/hooks/tasks/useTaskMutations.ts existe mas hook não consta em hooks.json (não exportado/indexado)| CONTESTADO pelo cético (IMPLEMENTADO): src/hooks/tasks/useTaskMutations.ts:26-35 — sem salesperson_id usa supabase.rpc('get_current_salesperson_id'); src/components/tasks/CreateTaskDialog.tsx:90-96 — não-admin só vê o próprio vendedor no seletor; commit f2155e8e9 'fix: tarefa sem responsável passa a ficar com o vendedor logado (#469)' em main; policy INSERT de tasks no banco real exige salesperson_id = get_current_salesperson_id() OR is_admin_or_manager (tables/public/tasks.md:80-88), coerente; função existe (functions.md:218). Dialog montado em TaskQueue.tsx, QuickActionsMenu.tsx, KanbanClientes.tsx.
- **Revisão:** em disputa. O cético propõe Implementado e o juiz ainda não decidiu.

### F3197 · Hook useFollowUpData (5 afirmações nos docs)

- **Tipo:** Hook
- **O que os docs afirmam:** NÃO INICIADO: useFollowUpData.ts:86-107 fórmula fixa.| select('_') sem .limit()/range; useFollowUpLeads carrega todas as sales abertas + tasks + activities. \| L645 NI: useFollowUpData.ts:14-17. \| select('_').maybeSingle() sem .eq() → PGRST116 ou linha arbitrária. \| healthScore = clamp(100 - daysInactive*5 + score/10); não lê deal_health_scores (900 linhas).
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:88`, `docs/auditoria/RELATORIO_FALHAS.md:624-628`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:308`, `docs/auditoria/RELATORIO_FALHAS.md:645-648`, `docs/estado/02_DOMINIO_CRM_PIPELINE.md:179-181`
- **O que falta:** Ler deal_health_scores em vez da fórmula fixa; paginar/agregar no servidor (limit/range ou RPC); garantir linha única em follow_up_settings.
- **Evidência:** arquivo src/hooks/follow-up/useFollowUpData.ts existe mas hook não consta em hooks.json (não exportado/indexado)| cético: Evidência inicial ('não consta em hooks.json') é irrelevante; o PARCIAL se sustenta por: src/hooks/follow-up/useFollowUpData.ts:87-90 healthScore = clamp(100 - daysInactive*5 + score/10) (fórmula fixa, não lê deal_health_scores — grep deal_health no arquivo → 0); queries sem limit/range em :28-36 (sales), :39-42 (tasks), :55-59 (activities); :14-17 follow_up_settings select('*').maybeSingle() sem filtro (policy SELECT true, tables/public/follow_up_settings.md:56-63). Hook montado em src/pages/FollowUpInteligente.tsx e settings/FollowUpSettings.tsx.

### F3199 · Hook useStagnantTasks (2 afirmações nos docs)

- **Tipo:** Hook
- **O que os docs afirmam:** Doc lista o hook `useStagnantTasks.ts` — tarefas estagnadas.| Backend/hook pronto para tarefas geradas por deals parados; UI atual: 1 import.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:414`, `docs/FUNCIONALIDADES_SEM_UI.md:65`
- **O que falta:** arquivo src/hooks/useStagnantTasks.ts existe mas hook não consta em hooks.json (não exportado/indexado)
- **Evidência:** arquivo src/hooks/useStagnantTasks.ts existe mas hook não consta em hooks.json (não exportado/indexado)| CONTESTADO pelo cético (IMPLEMENTADO): src/hooks/useStagnantTasks.ts:13-48 exporta useCreateStagnantTasks (invoke 'create-stagnant-tasks' :19, invalida ['tasks'], toasts de sucesso/erro); consumido em src/pages/Tarefas.tsx:5,14,51 (rota /tarefas AppRoutes.tsx:287, menu sidebarMenuData.ts:131); edge create-stagnant-tasks na allowlist deploy.yml:144 e insere em public.tasks (index.ts:141; RLS sim tables.md:357).
- **Revisão:** em disputa. O cético propõe Implementado e o juiz ainda não decidiu.

### F0048 · Listagens com filtro explícito de owner

- **Tipo:** Hook
- **O que os docs afirmam:** L612 P: depende de RLS.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:277`
- **O que falta:** decisão do dono se filtro explícito é requisito; se sim, .eq por owner nas listagens principais.
- **Evidência:** Listagens principais sem filtro explícito de owner: src/services/clientService.ts:39,53 (só deleted_at), src/hooks/usePipeline.ts:114 filtra salesperson_id apenas quando filters.salespersonId é informado, src/hooks/useQuotes.ts / src/hooks/suppliers/useSupplierQueries.ts / src/hooks/useProducts.ts (`grep salesperson_id\|owner_id\|user_id` → 0 em consultas de lista). Só tasks filtra por padrão (src/hooks/tasks/useTaskQueries.ts:35,62). Isolamento depende de RLS: tables/public/clients.md policy SELECT `id IN (client_portfolio do vendedor) OR is_admin_or_manager`. Doc docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:277 (L612) mantém 'P: depende de RLS'.| cético: Sem evidência nova; listagens dependem de RLS (A_planos_execucao.md:277 'P: depende de RLS').

### F3200 · useSupplierQueries e useActivities escopados

- **Tipo:** Hook
- **O que os docs afirmam:** useSupplierQueries e useActivities select('*') sem filtro de owner/team.
- **Fontes:** `docs/auditoria/RELATORIO_FALHAS.md:612-616`
- **O que falta:** arquivo src/hooks/suppliers/useSupplierQueries.ts existe mas hook não consta em hooks.json (não exportado/indexado)
- **Evidência:** arquivo src/hooks/suppliers/useSupplierQueries.ts existe mas hook não consta em hooks.json (não exportado/indexado)| CONTESTADO pelo cético (IMPLEMENTADO): Critério 'Queries escopadas ou RLS estrita verificada' atendido pela RLS do banco real: suppliers SELECT só is_admin_or_manager (tables/public/suppliers.md:79-86), supplier_products (supplier_products.md:60-67) e supplier_risk_assessments (:52-59) idem; activities SELECT = salesperson_id = get_current_salesperson_id() OR admin (activities.md:89-96). Hooks: src/hooks/suppliers/useSupplierQueries.ts:10-11,26,43; src/hooks/activities/useActivities.ts (useActivities com limit 1000 e eq salesperson_id opcional).
- **Revisão:** em disputa. O cético propõe Implementado e o juiz ainda não decidiu.

### F0053 · Geocoding de endereços de clientes via nominatim.openstreetmap.org → edge function com cache

- **Tipo:** Integração externa
- **O que os docs afirmam:** Doc aponta ClientsMap.tsx:98 envia endereços reais a Nominatim público (LGPD, sem SLA, exige User-Agent); ação: mover geocoding para edge function com cache.
- **Fontes:** `docs/auditoria/AUDITORIA_TECNICA_EXAUSTIVA_2026-09-02.md:195,201,351`
- **O que falta:** Incluir geocode-proxy na allowlist de .github/workflows/deploy.yml:144, deployar e confirmar uma linha gravada em geocode_cache.
- **Evidência:** Front não chama Nominatim: src/components/map/ClientsMap.tsx:88-96 invoca supabase.functions.invoke('geocode-proxy'); grep -rn nominatim src → 0. Edge supabase/functions/geocode-proxy/index.ts:26 (NOMINATIM_URL), :124 e :156 (cache em geocode_cache), :143 (User-Agent 'PromoChampions-geocode-proxy/1.0'), :95 (getUserClient, autenticada). PORÉM 'geocode-proxy' não está na allowlist ACTIVE de .github/workflows/deploy.yml:144 (grep geocode deploy.yml → 0) → não roda em produção; public.geocode_cache tem 0 linhas (contexto/supabase/stats.md:369).| cético: Confirmado. Front não chama Nominatim: src/components/map/ClientsMap.tsx:88-89,96 usa supabase.functions.invoke('geocode-proxy'). Edge tem cache e User-Agent: supabase/functions/geocode-proxy/index.ts:26,124,142-143,156. Mas 'geocode-proxy' não está na allowlist ACTIVE (grep -o 'geocode-proxy' .github/workflows/deploy.yml → 0; activity-goal…

### F0054 · Integração externa: Nominatim / OpenStreetMap (geocode-proxy)

- **Tipo:** Integração externa
- **O que os docs afirmam:** 1 função (geocode-proxy) não publicada (0/1); /mapa-clientes depende dela. Chamada real ao provedor não exercida (B4).
- **Fontes:** `docs/prod-readiness.md:870`
- **O que falta:** Deployar geocode-proxy (allowlist deploy.yml:144), validar OPTIONS 200/204 e uma chamada real com linha em geocode_cache.
- **Evidência:** Edge existe (supabase/functions/geocode-proxy/index.ts, 178 linhas, OPTIONS+POST, verify_jwt true — contexto/codigo/edge-functions.json:3236-3250) e tabela public.geocode_cache existe com RLS deny-all para anon/authenticated e grants só service_role (contexto/supabase/tables/public/geocode_cache.md; policies.md:416; grants.md:544). Não publicada: ausente na allowlist deploy.yml:144. Sem segredo necessário (env: [] em edge-functions.json). Chamada real ao provedor não exercida: geocode_cache 0 linhas (stats.md:369). /mapa-clientes depende dela (ClientsMap.tsx:96).| cético: Confirmado. Edge supabase/functions/geocode-proxy/index.ts existe (Nominatim em :26, :142-143). Tabela public.geocode_cache existe com RLS (tables.md:177), 0 linhas (stats.md:369), ou seja, nenhuma chamada real ao provedor registrada. Fora da allowlist deploy.yml:144 (grep → 0).

### F0058 · Alertas de metas de atividade

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Edge activity-goal-alerts (JWT) alerta sobre metas de atividade.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:999`
- **O que falta:** 1) Cadastrar um e-mail ativo em /relatorios-email (tabela notification_preferences). 2) Confirmar o segredo RESEND_API_KEY nas Edge Functions (não verificável aqui). 3) Depois disso, confirmar uma linha em email_logs com function_name='activity-goal-alerts'. Opcional: notificação dentro do app para gestor e vendedor, que hoje não existe.
- **Evidência:** O código e o agendamento estão completos. A função supabase/functions/activity-goal-alerts/index.ts lê salespeople (:85-89), activity_goals (:99) e activities (:110-111), monta a alertList, envia e-mail via Resend (:245-266) e grava em email_logs (:270-280). Ela está na allowlist ACTIVE (.github/workflows/deploy.yml:144). O cron 83 'activity-goal-alerts-daily' roda 0 18 * * * via trigger_internal_edge_job (supabase/cron.md:46); as execuções de 17 a 19/11 deram succeeded (cron-runs.md:349-355), mas a mensagem '1 row' só prova que a chamada HTTP foi agendada. activity_goals existe com RLS e tem 9 linhas (tables.md:19; stats.md:120). Porém o único canal de saída é um e-mail ao admin, e ele só sai se houver RESEND_API_KEY E uma linha ativa em notification_preferences (index.ts:196-206); sem isso a função só registra 'no_admin_email_configured' (:288). No banco real, notification_preferences…
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Implementado.

### F0059 · Fila/integração automation_runs com tráfego (39 linhas, último 2026-08-15 13:32:45)

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Uma das 7 (de 36) tabelas de fila/integração que já receberam registro; último em 2026-08-15 13:32:45.
- **Fontes:** `docs/estado/11_DADOS_BANCO.md:555-555`
- **O que falta:** Cron ou trigger que invoque execute-workflow nos eventos de automation_workflows, para que o fluxo seja contínuo.
- **Evidência:** Tabela public.automation_runs existe, RLS com 2 policies (contexto/supabase/tables/public/automation_runs.md), ~40 linhas (stats.md:104; doc dizia 39 em 15/08). Quem insere: supabase/functions/execute-workflow/index.ts:91,165 (na allowlist deploy.yml:144). Chamador único é o front sob ação manual: src/hooks/automation/useAutomationWorkflows.ts:205. ausente: grep 'execute-workflow' em contexto/supabase/cron.md e triggers.md → 0 (nenhum agendamento ou trigger dispara workflows automaticamente).| cético: Confirmado. public.automation_runs tem ~40 linhas (stats.md:104), contra 39 em 15/08, o que indica fluxo quase parado. Nenhum agendamento ou trigger SQL grava ou dispara: grep -rln 'automation_runs\|execute-workflow' em contexto/supabase/functions, cron.md, triggers.md e webhooks.md → 0. Quem insere: supabase/functions/execute-workflow/index.ts, automation-suggestions e behavioral-analysis…

### F0061 · Lembretes configuráveis de eventos

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Lembretes para eventos da agenda.
- **Fontes:** `docs/FUNCIONALIDADES_COMPLETAS.md:114-114`
- **O que falta:** Campo configurável no formulário da Agenda e cron/edge que notifique em start_at - reminder_minutes_before.
- **Evidência:** Coluna existe: public.agenda_events.reminder_minutes_before integer default 15 (contexto/supabase/tables/public/agenda_events.md:30); tipada em src/hooks/calendar/useAgendaEvents.ts:21,34. Mas a UI não expõe o campo (grep reminder_minutes_before src/pages/Agenda.tsx → 0; Agenda.tsx:53-61 só usa 'reminder' como tipo de evento) e nenhum processo dispara: grep -iE 'remind\|lembre' contexto/supabase/cron.md → 0; ls supabase/functions| grep -iE 'remind\|lembre' → 0; único uso é qbr-scheduler/agenda-event.ts:22 gravando 1440 fixo. \| cético: Confirmado. A coluna existe: agenda_events.reminder_minutes_before (tables/public/agenda_events.md:30). Ela só é usada em src/hooks/calendar/useAgendaEvents.ts e supabase/functions/qbr-scheduler/agenda-event.ts (grep -rln 'reminder_minutes\|reminder_at\|remind_at' src supabase/functions). Nenhum processo dispara: grep -i 'remind' cron.md → 0; nenhuma edge…

### F0062 · Onboarding workflows para novos vendedores

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Falta workflow de onboarding de vendedor.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:198`
- **O que falta:** Persistir progresso e dismiss por usuário, etapas configuráveis pelo gestor e tour guiado.
- **Evidência:** Existe checklist: src/hooks/useOnboardingChecklist.ts:19-45 deriva 4 etapas (perfil, primeiro lead, primeira venda, meta) de dados reais em salespeople/sales/sales_goals; src/components/onboarding/OnboardingChecklist.tsx montado em src/pages/Index.tsx:189 com barra de progresso (OnboardingChecklist.tsx:79). Faltas: dismiss em useState local (OnboardingChecklist.tsx:14, não persiste), sem tour/etapas configuráveis; tabelas onboarding_journeys/onboarding_steps são de onboarding de contas (CS), alimentadas por onboarding-launcher (supabase/functions/onboarding-launcher/index.ts:49,97,151,174), não de vendedores.| cético: Confirmado. OnboardingChecklist está montado em src/pages/Index.tsx:5,189. O dismiss fica só em useState local (src/components/onboarding/OnboardingChecklist.tsx:14,17), sem persistir. Não há tour: grep 'react-joyride\|driver.js\|shepherd\|OnboardingTour' src package.json …

### F3202 · Rota /abm (7 afirmações nos docs)

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Hierarquia de contas Strategic/Enterprise/Mid-Market/SMB.| Doc: menu aponta para `/engagement/abm`; `/abm` ficou sem nenhum link (página duplicada). \| NÃO INICIADO (20/20): rota /abm existe mas sem link/menu; só mapas de título/prefetch. \| Rota registrada em AppRoutes.tsx com acesso "autenticado", GET em produção 200. Status no doc: OK \| Rota /abm (AppRoutes.tsx:155) renderiza src/pages/AccountBasedSelling.tsx; sem role explícito (só autenticação global). Classificação do doc: MORTO_OU_ABANDONADO. Evidência: SEM link/menu em todo src/ · sb=1 useQuery=1 mut=1 (árvore 12 arq.) \| API.md declara a rota `/abm` renderizando o componente AccountBasedSelling com acesso "autenticado". \| Account…
- **Fontes:** `docs/FUNCIONALIDADES_SISTEMA.md:576-578`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/D_frontend.md:24-24`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:52`, `docs/prod-readiness.md:76`, `docs/estado/01_FRONTEND_ROTAS.md:86-86`, `docs/API.md:327-327` e mais 1
- **O que falta:** Remover /abm (duplicada) ou redirecionar para /engagement/abm; hoje só acessível por URL.
- **Evidência:** rota /abm → src/pages/AccountBasedSelling.tsx (AppRoutes.tsx); sem entrada no menu (sidebarMenuData.ts) → só acessível por URL| cético: src/routes/AppRoutes.tsx:379 `/abm` → AccountBasedSelling (useAccounts, src/pages/AccountBasedSelling.tsx:60,112; accounts com RLS, tables.md:13); nenhum link: grep "'/abm'" em src → só AppRoutes.tsx:379; menu aponta para /engagement/abm (sidebarMenuData.ts:118,193), que é outra página.

### F3203 · Rota /territorios (6 afirmações nos docs)

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Territórios geográficos.| Rota /territorios (AppRoutes.tsx:253) renderiza src/pages/Territorios.tsx; sem role explícito (só autenticação global). Classificação do doc: MORTO_OU_ABANDONADO. Evidência: SEM link/menu em todo src/ · sb=1 useQuery=1 mut=0 (árvore 9 arq.) \| API.md declara a rota `/territorios` renderizando o componente Territorios com acesso "autenticado". \| Rota registrada em AppRoutes.tsx com acesso "autenticado", GET em produção 200. Status no doc: OK \| TerritoriesBoard.tsx:13 via useTerritories.ts:33,53 sobre sales_territories (8) e territory_history (0); tabela territories (18) não é lida. \| NÃO INICIADO (20/20): rota /territorios existe mas sem link/menu; só mapas de tí…
- **Fontes:** `docs/FUNCIONALIDADES_COMPLETAS.md:441-443`, `docs/estado/01_FRONTEND_ROTAS.md:175-175`, `docs/API.md:416-416`, `docs/prod-readiness.md:239`, `docs/estado/04_DOMINIO_ANALYTICS_BI.md:222`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:52`
- **O que falta:** Entrada de menu/link para /territorios (ou remoção) e unificar territories vs sales_territories.
- **Evidência:** rota /territorios → src/pages/Territorios.tsx (AppRoutes.tsx); sem entrada no menu (sidebarMenuData.ts) → só acessível por URL| cético: src/routes/AppRoutes.tsx:898 `/territorios` → Territorios (src/pages/Territorios.tsx:2,27 TerritoriesBoard); dados reais via src/hooks/useTerritories.ts:33 (sales_territories) e :55 (territory_history); sem link/menu: grep "'/territorios'" em src → só AppRoutes.tsx:898 e RouteTracker.tsx:36 (mapa de título); sidebarMenuData.ts só tem /territory-optimization (:282). Tabela public.territories (tables.md:361) não é lida.

### F0064 · UI useGoals: página unificada de metas (hoje espalhada)

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Falta página unificada de metas (hoje espalhada) para useGoals (UI atual: 5 imports (parcial)).
- **Fontes:** `docs/FUNCIONALIDADES_SEM_UI.md:76`
- **O que falta:** Página única que junte as metas com estados de erro e vazio; ou corrigir a doc, já que useGoals não existe.
- **Evidência:** Hook 'useGoals' não existe: grep -rn 'export function useGoals(' src → 0 (ls src/hooks: useMicroGoals, useProgressiveGoals, useActivityGoals, useGoalsDashboard, useNextGoal). Página /metas existe (AppRoutes.tsx:882-885, sidebarMenuData.ts:102) usando useGoalsDashboard com skeleton de loading (src/pages/Metas.tsx:30,55-57), mas sem estado de erro (grep isError Metas.tsx → 0); metas de atividade seguem em rota separada /metas-atividades (AppRoutes.tsx:889; menu :327).| cético: Confirmado. ausente: grep -rnE '\buseGoals\b' src → 0. A página /metas existe (AppRoutes.tsx:882; sidebarMenuData.ts:102), mas sem estado de erro (grep 'isError\|error' src/pages/Metas.tsx → 0). As metas de atividade ficam em rota separada /metas-atividades (AppRoutes.tsx:889; sidebarMenuData.ts:327).

### F0066 · Definição única de deal em risco

- **Tipo:** Service/lib
- **O que os docs afirmam:** Quatro definições de "deal em risco".
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:136`
- **O que falta:** Módulo canônico de deal em risco consumido por useInactiveDeals, detect-stuck-deals, detect-at-risk-deals e calculate-deal-health.
- **Evidência:** Seguem definições distintas de deal em risco: (1) src/hooks/useInactiveDeals.ts:99-109,181-185 por mild/moderate/critical_days de regras de inatividade; (2) supabase/functions/detect-stuck-deals/index.ts:23 'stuck' se horas >= p75; (3) supabase/functions/detect-at-risk-deals/index.ts:215 riskLevel 'high' se hoursSinceLastActivity > 72; (4) supabase/functions/calculate-deal-health/index.ts:48-49 'at_risk' se score >= 25, senão 'critical'. O contrato compartilhado existente (src/lib/winloss/riskSeverity.ts:1-12 → _shared/winloss-contract.ts) cobre só severidade de padrões win/loss. ausente: grep -rn 'isDealAtRisk\|computeDealRisk\|getDealRisk' src → 0.| cético: Confirmado. Não há módulo compartilhado: ls supabase/functions/_shared \| grep -iE 'risk\|health\|stuck' → só campaign-health.ts (campanhas); ls src/lib \| grep -iE 'risk\|health\|stuck' → 0; grep -rlnE 'dealRisk\|deal-risk' src/li…

### F0067 · Mapas Leaflet + react-leaflet (clusters de clientes)

- **Tipo:** Service/lib
- **O que os docs afirmam:** Mapas de clientes com Leaflet e clusters.
- **Fontes:** `docs/agentes/mapa-do-sistema.md:91`
- **O que falta:** Deployar geocode-proxy.
- **Evidência:** Dependências em package.json:127-128,139 (leaflet, leaflet.markercluster, react-leaflet) e tipos :108-109. src/components/map/ClientsMap.tsx lê clients reais com lat/lng (:200-203) e usa L.markerClusterGroup (:125-129); montado em src/pages/MapaClientes.tsx → rota /mapa-clientes (AppRoutes.tsx:269) e menu (sidebarMenuData.ts:129,213,298). Geocodificação de clientes sem lat/lng chama 'geocode-proxy' (ClientsMap.tsx:96,209-223), que NÃO está na allowlist ACTIVE (deploy.yml:144) → em produção novos clientes não ganham marcador.| cético: Confirmado. package.json:108-109,127-128,139 tem leaflet, markercluster e react-leaflet. Rota /mapa-clientes em AppRoutes.tsx:269 e menu em sidebarMenuData.ts:129. ClientsMap lê clients reais com lat/lng (ClientsMap.tsx:197-207). A geocodificação dos clientes sem coordenada (:209-223) depende de geocode-proxy, que está fora da allowlist deploy.yml:144.

### F3209 · Account hierarchy (matriz/filiais)

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Falta hierarquia de contas.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:77`
- **O que falta:** Falta um campo para escolher a conta-mãe na criação e edição da conta (useAccounts.ts e AccountBasedSelling.tsx) e uma visão em árvore de matriz e filiais. A tela /abm também precisa de link no menu. A tabela clients continua sem coluna de matriz.
- **Evidência:** A hierarquia está em accounts (ABM), não em clients: coluna tables/public/accounts.md:21 (parent_account_id), FK em :50 e índice em :82. Em clients não existe coluna de matriz (grep parent tables/public/clients.md → 0 resultados). No front, o tipo está em src/hooks/abm/useAccounts.ts:15 e o único uso na tela é o selo 'Subsidiária' em src/pages/AccountBasedSelling.tsx:434-437. Nenhum formulário grava o campo: grep -rn parent_account_id src supabase/functions, fora types.ts → só useAccounts.ts:15, AccountBasedSelling.tsx:434 e o teste. A tela fica na rota /abm (src/routes/AppRoutes.tsx:379), mas o menu aponta para /engagement/abm (sidebarMenuData.ts:118,193), que monta AccountBasedEngagement (AppRoutes.tsx:335-336).
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Não implementado.

### F3210 · Custom fields para vendedores

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Campos personalizados.
- **Fontes:** `docs/FUNCIONALIDADES_COMPLETAS.md:429-429`
- **O que falta:** Falta uma tela, ou um caminho que rode em produção, para preencher o valor do campo de cada vendedor. Hoje dá para definir o campo, mas não para preencher: a única escrita está em ranking-api, que não está deployada.
- **Evidência:** As tabelas existem com outros nomes e têm RLS: tables.md:359 (public.team_custom_fields) e tables.md:309 (public.salesperson_custom_field_values). A definição dos campos funciona: src/components/settings/CustomFieldsManager.tsx:53,67,89 faz select, insert e update, e o componente está montado em src/pages/Configuracoes.tsx:301 (rota /configuracoes, AppRoutes.tsx:953). Os valores só são lidos, em src/hooks/sales/useSalespersonCustomFields.ts:22,31. A única gravação de valores está em supabase/functions/ranking-api/index.ts:324-334, e ranking-api não está na allowlist ACTIVE de .github/workflows/deploy.yml:144, que só tem notify-ranking-position.
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Não implementado.

### F3211 · Disputas e métricas por território

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Registro de disputas e métricas territoriais.
- **Fontes:** `docs/FUNCIONALIDADES_COMPLETAS.md:444-444`
- **O que falta:** Falta alimentar sales_territories, incluindo is_contested e as métricas, e corrigir sync_territory_ownership (coluna name → territory_name). Também falta criar o registro de disputas: hoje existe só o selo, sem dado que o acenda.
- **Evidência:** A tela existe: rota /territorios (AppRoutes.tsx:898), que lê sales_territories e territory_history em src/hooks/useTerritories.ts:33 e :55 e mostra o selo 'Disputado' em src/components/territories/TerritoriesBoard.tsx:138-144. A tabela sales_territories tem RLS (tables.md:304), coluna territory_name (sales_territories.md:20) e is_contested (:26). Mas nada grava em sales_territories: não há insert nem update em src ou supabase/functions (só leituras em useTerritories.ts:33 e territory-optimization/index.ts:131), e grep -rl is_contested functions/ → 0 resultados. Os gatilhos de venda escrevem em public.territories (triggers.md:272-273,292; private/update_territory_conquests:37). A função sync_territory_ownership busca 'FROM public.sales_territories WHERE name' (sync_territory_ownership__12ae32cb1ec02d01.sql:34), mas essa coluna não existe, e o erro é engolido por 'EXCEPTION WHEN OTHERS TH…
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Não implementado.

### F0068 · Etapa 62 do plano: Persistir onboarding

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Modelar ownership, etapas e auditoria ou remover a promessa da rota. Saída esperada: reload/multiusuário preserva estado. Gate: autorização de modelo DB.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:736-736`
- **O que falta:** Ligar a página a onboarding_journeys e onboarding_steps, remover os dados fictícios e tratar loading, erro e vazio; ou remover a rota.
- **Evidência:** Rota /onboarding-tracking (AppRoutes.tsx:925-926) e menu 'Onboarding' (sidebarMenuData.ts:305) existem, mas src/pages/OnboardingTracking.tsx:42-69 inicializa useState com dados fictícios ('Empresa Alpha', 'Corp Beta') e milestones fixos; grep 'from(\|rpc(\|invoke' OnboardingTracking.tsx → 0 → nada persiste (reload perde estado). Tabelas public.onboarding_journeys (~100 linhas) e onboarding_steps (0 linhas) existem com RLS (policies.md:520-523; stats.md:69,381) mas a página não as usa.| cético: Confirmado. src/pages/OnboardingTracking.tsx:41-68 parte de dados fictícios ('Empresa Alpha', 'Corp Beta') em useState. grep 'from(\|rpc(\|invoke\|useQuery' OnboardingTracking.tsx → 0, ou seja, nada persiste. A rota está montada (AppRoutes.tsx:926).

### F3212 · Multi-contact per account com roles

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Falta múltiplos contatos por conta com papéis (Decisor, Influenciador, Champion, Bloqueador).
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:78`
- **O que falta:** Falta um caminho no menu até a edição de contatos e papéis: ligar /abm no sidebarMenuData.ts ou pôr a edição em AccountDetail/BuyingCommitteeCard. Os contatos pertencem a accounts (ABM), não a clients.
- **Evidência:** Os contatos com papel existem por conta ABM: public.account_contacts tem RLS (tables.md:11), coluna buying_role com CHECK decision_maker/champion/influencer/blocker/user/technical (account_contacts.md:26,44) e FK para accounts (:43). O cadastro funciona em src/hooks/abm/useAccounts.ts:260-261 (insert), :288-289 (update) e :311 (delete), com os rótulos Decisor/Champion/Influenciador/Bloqueador em src/pages/AccountBasedSelling.tsx:86-93. Essa tela só abre pela rota /abm (AppRoutes.tsx:379), que não tem link no menu (sidebarMenuData.ts:118,193 apontam para /engagement/abm). A tela que está no menu, AccountDetail (AccountDetail.tsx:101 → BuyingCommitteeCard), só mostra os papéis: grep insert/update/onClick em BuyingCommitteeCard.tsx → 0 resultados. Não existe tabela de contatos por cliente: grep client_contacts tables.md → 0 resultados.
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Não implementado.

### F3213 · Status ativo/inativo e fonte do cliente no Portfólio

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Campos de status e fonte por cliente.
- **Fontes:** `docs/FUNCIONALIDADES_COMPLETAS.md:109-109`
- **O que falta:** Falta exibir, filtrar e editar a fonte (client_portfolio.source ou lead_source) na tabela do Portfólio (PortfolioTableRow.tsx, Portfolio.tsx). O status já está completo.
- **Evidência:** Status e fonte ficam em public.client_portfolio, que tem RLS (tables.md:79): status em client_portfolio.md:23, source em :27, is_active em :30 e lead_source em :31. O status está completo: alternância em src/components/portfolio/PortfolioTable.tsx:120-125, pela RPC update_client_portfolio_status (functions.md:376; src/hooks/crm/useClientPortfolio.ts:67), e filtro em src/pages/Portfolio.tsx:33. Rota /portfolio em AppRoutes.tsx:272, menu em sidebarMenuData.ts:300. A fonte não aparece na tela: grep source src/components/portfolio src/pages/Portfolio.tsx → só AssignClientDialog.tsx:53 (grava 'manual' fixo).
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Não implementado.

### F0069 · Dívida: testes para callFeedbackService.ts, knownDeviceService.ts e novas funções de clientService.ts

- **Tipo:** Teste
- **O que os docs afirmam:** PR #209 adicionou esses serviços sem testes (+91 linhas); meta: voltar src/services/ a ≥18,7%.
- **Fontes:** `docs/estado/15_PLANO_COBERTURA_MODULOS.md:56,60-61`
- **O que falta:** src/services/knownDeviceService.test.ts e src/services/clientService.test.ts.
- **Evidência:** src/services/callFeedbackService.test.ts existe. knownDeviceService sem teste próprio: find -iname '*knownDevice*test*' → só src/components/security/KnownDevices.test.tsx, que faz vi.mock('@/services/knownDeviceService') (linha 9) — não testa o serviço. clientService: find -iname '*clientService*test*' → 0; grep -rln clientService src/**/_.test._ → 0.| cético: Confirmado. find src -iname '_knownDevice_' -o -iname '_clientService_' -o -iname '_callFeedback_' \| grep test → só src/services/callFeedbackService.test.ts e src/components/security/KnownDevices.test.tsx (este mocka o serviço). grep -rln 'knownDeviceService\|clientService' em src e tests, só em arquivos de teste → só KnownDevices.test.tsx.

### F0072 · Testes de componentes CRM core (pipeline 0/23, clients 0/20, deal-intelligence 0/47, activities 0/21, tasks 0/9, orders 0/4, quotes 0/2)

- **Tipo:** Teste
- **O que os docs afirmam:** Diretórios sem nenhum teste.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:97`
- **O que falta:** Ao menos um teste em src/components/orders e src/components/quotes.
- **Evidência:** find src/components/<dir> -name '_.test._': pipeline=3 (18 arquivos), clients=1 (19), deal-intelligence=1 (47), activities=2 (21), tasks=1 (7), orders=0 (4), quotes=0 (2). CI executa 'npx vitest run --coverage' em .github/workflows/pr-checks.yml:253. Doc dizia 0 em todos; hoje só orders e quotes seguem sem teste.| cético: Confirmado com find (testes/tsx): pipeline 3/18, clients 1/18, deal-intelligence 1/41, activities 2/19, tasks 1/7, orders 0/3, quotes 0/2. Nenhum teste importa esses dois diretórios: grep -rln 'components/orders\|components/quotes' src tests em arquivos de teste → 0. O vitest roda src/**/_.test._ (vitest.config:23).

## Não verificável (1)

### F0044 · DEFAULT_PIPELINE_ID igual em repo e produção

- **Tipo:** Doc/config
- **O que os docs afirmam:** DEFAULT_PIPELINE_ID diverge entre repo e produção.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:172`
- **O que falta:** SELECT id, name, is_default FROM pipelines no banco oficial e comparar com PipelineBoard.tsx:57.
- **Evidência:** Repo: src/components/pipeline/PipelineBoard.tsx:57 `DEFAULT_PIPELINE_ID = '00000000-0000-0000-0000-000000000001'`; seed histórico em supabase/migrations/20260416104458_a8fc916a-0907-4aa4-92a7-42a4bf4ed461.sql:59 cria pipeline 'Vendas' com esse id. O snapshot traz só schema (tables/public/pipelines.md), não dados; o MCP Supabase disponível nesta sessão aponta para https://pgxfvjmuubtbowutlide.supabase.co (não é o projeto oficial usyxfpqlsspldubptrdl). Doc docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:172 afirma divergência.| cético: Constante em src/components/pipeline/PipelineBoard.tsx:57 e literal duplicado em src/hooks/useMultiplePipelines.ts:100; snapshot traz só schema (`grep -rn 00000000-0000-0000-0000-000000000001 <snapshot>/supabase` → 0). Sem acesso a dados do banco oficial.
