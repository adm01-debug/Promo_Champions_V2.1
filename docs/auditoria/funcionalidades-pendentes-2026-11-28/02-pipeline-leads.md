# Pipeline, leads, scoring e roteamento

[Voltar ao índice](README.md)

79 itens não implementados, parciais ou não verificáveis neste domínio.

## Não implementado (42)

### F2358 · Transferência de leads em massa na UI

- **Tipo:** Ação/botão
- **O que os docs afirmam:** RPC existe com 0 usos na UI.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:170`
- **O que falta:** Criar RPC (p_client_ids uuid[] / p_sale_ids, p_to_salesperson_id) gravando lead_routing_log + modal de seleção múltipla em /portfolio ou /lead-routing
- **Evidência:** ausente: grep -n -i "transfer" contexto/supabase/functions.md → 0 resultados (nenhuma RPC de transferência em massa no banco real; as únicas RPCs de reatribuição são unitárias: route_unassigned_client_portfolio p_client_id uuid functions.md:328 e reassign_inactive_client_portfolio p_portfolio_id uuid functions.md:306); grep -rn -i "transferir\|bulk_transfer\|transfer_leads\|bulk_reassign" src/ supabase/migrations → 0 resultados; grep -rn -i "massa\|bulk\|transfer" src/components/lead-routing src/pages/LeadRoutingPage.tsx src/components/portfolio → 0. A afirmação do doc "RPC existe" não se confirma no snapshot.
- **Revisão:** sem contestação cética concluída.

### F3737 · Componente morto SLAIndicator.tsx (0 importadores)

- **Tipo:** Componente
- **O que os docs afirmam:** src/components/pipeline/SLAIndicator.tsx não é importado por nenhum arquivo em src/ (grep -rl excluindo o próprio). Substituído por SLACountdown.tsx (vivo, usado em DealCard.tsx) — refactor abandonado.
- **Fontes:** `docs/estado/02_DOMINIO_CRM_PIPELINE.md:133-133`
- **O que falta:** componente SLAIndicator ausente (componentes.json e src/)
- **Evidência:** componente SLAIndicator ausente (componentes.json e src/)| CONTESTADO pelo cético (REMOVIDO_INTENCIONALMENTE): O arquivo foi apagado de propósito no commit 89aacaff8 (PR #285, 18/10/2026), cujo título é "chore(ui): remove código morto — arquivos inalcançáveis e exports sem consumidor". O stat do commit lista 'src/components/pipeline/SLAIndicator.tsx \| 68 ----'. ausente: grep -rl SLAIndicator src → 0 resultados. O substituto vivo SLACountdown.tsx está em src/components/pipeline/.
- **Revisão:** em disputa. O cético propõe Removido de propósito e o juiz ainda não decidiu.

### F3738 · Componente/tela AIEmailWriter (2 afirmações nos docs)

- **Tipo:** Componente
- **O que os docs afirmam:** src/components/pipeline/AIEmailWriter.tsx não é importado por nenhum arquivo em src/ (grep -rl excluindo o próprio). Convive com sales/AIEmailDialog.tsx e email/AIEmailComposerButton (vivos).| Apêndice A lista 7 módulo(s) de pipeline não alcançados pelo grafo determinístico a partir de src/main.tsx.
- **Fontes:** `docs/estado/02_DOMINIO_CRM_PIPELINE.md:137-137`, `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:851-851`
- **O que falta:** componente AIEmailWriter ausente (componentes.json e src/)
- **Evidência:** componente AIEmailWriter ausente (componentes.json e src/)| CONTESTADO pelo cético (REMOVIDO_INTENCIONALMENTE): O commit 89aacaff8 (PR #285, remoção de código morto inalcançável a partir de main.tsx) apagou AIEmailWriter.tsx (166 linhas), DealAutoSummary.tsx, ExplainableWinProbability.tsx, QuickActions.tsx e SLAIndicator.tsx. ausente: grep -rl AIEmailWriter src → 0 resultados. DealTimeline.tsx e dealTimelineConstants.tsx, também listados no Apêndice A, voltaram ao código e hoje são usados: src/components/pipeline/DealCard.tsx:37 (import) e :485 (<DealTimeline deal={deal} />).
- **Revisão:** em disputa. O cético propõe Removido de propósito e o juiz ainda não decidiu.

### F3739 · Componente/tela ExplainableWinProbability (3 afirmações nos docs)

- **Tipo:** Componente
- **O que os docs afirmam:** NÃO INICIADO (14/14): ExplainableWinProbability existe com 0 importadores.| src/components/pipeline/ExplainableWinProbability.tsx não é importado por nenhum arquivo em src/ (grep -rl excluindo o próprio). Sem importadores. \| Doc: não aparecem em nenhuma tela.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:90`, `docs/estado/02_DOMINIO_CRM_PIPELINE.md:135-135`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/D_frontend.md:118-118`
- **O que falta:** componente ExplainableWinProbability ausente (componentes.json e src/)
- **Evidência:** componente ExplainableWinProbability ausente (componentes.json e src/)| CONTESTADO pelo cético (REMOVIDO_INTENCIONALMENTE): ExplainableWinProbability.tsx (176 linhas) foi apagado no commit 89aacaff8 (PR #285, "remove código morto — arquivos inalcançáveis"). ausente: grep -rl ExplainableWinProbability src → 0 resultados.
- **Revisão:** em disputa. O cético propõe Removido de propósito e o juiz ainda não decidiu.

### F3740 · Filtros filter_state, filter_role, cargo/produto da UI de regras sem mapeamento para sales/clients

- **Tipo:** Componente
- **O que os docs afirmam:** Doc: filtros expostos na UI de regras de roteamento não têm mapeamento para colunas atuais e não devem ser fingidos como implementados.
- **Fontes:** `docs/auditoria/CONTRATO_ROTEAMENTO_LEADS_2026-08-26.md:98`
- **O que falta:** componente LeadRoutingRules ausente (componentes.json e src/)
- **Evidência:** componente LeadRoutingRules ausente (componentes.json e src/)| CONTESTADO pelo cético (PARCIAL): O artefato existe, com outro nome. As colunas filter_state, filter_role, filter_job_titles e filter_products existem no banco real (tables/public/lead_routing_rules.md:24,27,32,33). A tela mostra filter_state: src/pages/LeadRoutingPage.tsx:154-155 (Badge 'UF:') e src/components/lead-routing/RoutingRulesPanel.tsx:58. A tela está na rota /lead-routing (AppRoutes.tsx:541-544). Mas a RPC auto_assign_lead só aplica filter_min_value e filter_source (functions/public/auto_assign_lead__0b6752e84136f64e.sql:56-57). filter_state, filter_role, cargos e produtos são ignorados.
- **Revisão:** em disputa. O cético propõe Parcial e o juiz ainda não decidiu.

### F2364 · Lead magnets com tracking (ebooks, webinars)

- **Tipo:** Componente
- **O que os docs afirmam:** Falta lead magnets com tracking.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:91`
- **O que falta:** Tabela lead_magnets/downloads com RLS, formulário gated e registro de download/lead
- **Evidência:** ausente: ls contexto/supabase/tables/public| grep -i "landing\|magnet\|web_form" → 0 resultados (sem tabela landing_pages/lead_magnets no banco real); grep -rn -i "lead_magnet\|leadMagnet\|landing_pages\|ebook" src/ supabase/functions (excluindo types.ts) → 0 resultados; único 'webinar' é placeholder de texto em src/pages/FollowUpInteligente.tsx:450.
- **Revisão:** sem contestação cética concluída.

### F3741 · Agendamento (cron) detect-stuck-deals (4 afirmações nos docs)

- **Tipo:** Agendamento (cron)
- **O que os docs afirmam:** detect-stuck-deals grava deal_velocity_alerts mas não está em cron.schedule.| Função periódica sem entrada em cron.job. \| detect-stuck-deals é edge batch sem cron e sem auth de cron; roda só por invoke manual no front. \| PARCIAL (operacional): refresh-stage-baselines upsert e detect-stuck-deals existem mas não agendados; detect-client-churn-alerts agendado.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:35`, `docs/estado/ESTADO_ATUAL.md:129-130`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/F_banco_dados.md:166`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:91`
- **O que falta:** nenhum job em pg_cron para "detect-stuck-deals" (cron.md, 45 jobs)
- **Evidência:** nenhum job em pg_cron para "detect-stuck-deals" (cron.md, 45 jobs)| CONTESTADO pelo cético (PARCIAL): A edge detect-stuck-deals existe e está na allowlist ACTIVE (.github/workflows/deploy.yml:144). Ela é chamada pela UI: src/hooks/deal-intelligence/useStageVelocity.ts:151 (useDetectStuckDeals), usado em components/deal-intelligence/velocity/StuckDealsPanel.tsx:21 e StageVelocityCard.tsx:25. Não há agendamento: grep -i stuck no cron.md → 0 jobs, e o nome não está no allowlist de trigger_internal_edge_job. A tabela deal_velocity_alerts tem 0 linhas (stats.md:192).
- **Revisão:** em disputa. O cético propõe Parcial e o juiz ainda não decidiu.

### F3742 · Agendamento (cron) lead-scoring (3 afirmações nos docs)

- **Tipo:** Agendamento (cron)
- **O que os docs afirmam:** lead-scoring é edge batch sem cron e sem auth de cron; não tem invoke nenhum (nunca roda).| NÃO INICIADO: lead-scoring sem cron; lê deal_stage_history (index.ts:71). \| NÃO INICIADO: nenhuma migration agenda lead-scoring (grep cron.schedule/trigger_internal_edge_job = 0); só GH cron-monitoring.yml roda testes.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/F_banco_dados.md:167`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:104`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:97`
- **O que falta:** Colocar lead-scoring na allowlist de deploy, criar cron.schedule com auth de cron e incluir o nome no allowlist de trigger_internal_edge_job.
- **Evidência:** nenhum job em pg_cron para "lead-scoring" (cron.md, 45 jobs)| cético: Não existe agendamento: grep lead-scoring no cron.md → 0 jobs. A edge supabase/functions/lead-scoring/index.ts existe, mas está FORA da allowlist (.github/workflows/deploy.yml:144), então não roda em produção. Correção à pré-checagem: a função não é órfã. Ela é chamada por src/hooks/useLeadScoring.ts:111 e :268, mas falha (404) e o hook cai no cálculo local.

### F3743 · Detecção automática de deals em risco

- **Tipo:** Agendamento (cron)
- **O que os docs afirmam:** Edge detect-at-risk-deals (Service) marca deals em risco; AtRiskDealsPanel + useAtRiskDeals exibem.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:1007,261-263`
- **O que falta:** nenhum job em pg_cron para "detect-at-risk-deals" (cron.md, 45 jobs)
- **Evidência:** nenhum job em pg_cron para "detect-at-risk-deals" (cron.md, 45 jobs)| CONTESTADO pelo cético (PARCIAL): A edge detect-at-risk-deals existe e está na allowlist (.github/workflows/deploy.yml:144). É chamada sob demanda em src/hooks/deal-intelligence/useAtRiskDeals.ts:179 (useAnalyzeAtRiskDeal). O AtRiskDealsPanel está montado em src/pages/Pipeline.tsx:3, :114 e :144. Não há cron: grep at-risk no cron.md → 0 jobs.
- **Revisão:** em disputa. O cético propõe Parcial e o juiz ainda não decidiu.

### F2368 · Regra para carteira inactive após reatribuição

- **Tipo:** Doc/config
- **O que os docs afirmam:** ONDA_0 bloq. 3 NI.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:396`
- **O que falta:** Decisão de negócio + implementação na RPC (ex.: status → 'reassigned'/'active' ou coluna reassigned_count/cooldown) e ajuste do filtro em auto-reassign-inactive
- **Evidência:** RPC reassign_inactive_client_portfolio no banco real (functions/public/reassign_inactive_client_portfolio__44c2342520a40fa4.sql:32 exige status='inactive'; :64-68 UPDATE só salesperson_id, assigned_at, updated_at — status permanece 'inactive' após reatribuição; :70 grava lead_routing_log); supabase/functions/auto-reassign-inactive/index.ts:148-160 seleciona status='inactive' e updated_at < cutoff, logo a carteira reatribuída volta a ser elegível após o cutoff; nenhuma regra de pós-reatribuição (mudar status, cooldown explícito, limite de reatribuições) codificada — grep -n "status: 'active'\|status:"active\"\|update(" supabase/functions/auto-reassign-inactive/index.ts → 0. Cron auto-reassign-inactive-daily existe (cron.md:49).
- **Revisão:** sem contestação cética concluída.

### F2369 · Regra Top Performer Premium com filter_min_value

- **Tipo:** Doc/config
- **O que os docs afirmam:** ROTEAMENTO NI.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:408`
- **O que falta:** Inserir a regra 'Top Performer Premium' com filter_min_value=50000 via db_query (MCP) e/ou criar formulário de CRUD de regras em /lead-routing
- **Evidência:** Coluna existe: lead_routing_rules.filter_min_value numeric (tables/public/lead_routing_rules.md:25; RLS sim, 2 policies :59-76), mas a tabela tem 0 linhas em produção (stats.md:288) — a regra seed 'Top Performer Premium' (supabase/migrations/20260416181656_6c621378-b2d7-42d5-a6d9-0fff5c1e78bd.sql:60, sem filter_min_value) não está no banco real. UI só lê e liga/desliga regras: src/hooks/useLeadRoutingEngine.ts:33 (select) e :57-66 (update is_active); src/components/lead-routing/RoutingRulesPanel.tsx:55-56 e src/pages/LeadRoutingPage.tsx:149-151 apenas exibem filter_min_value; grep -n "insert\|Nova regra" useLeadRoutingEngine.ts RoutingRulesPanel.tsx LeadRoutingPage.tsx → 0 (sem formulário de criação/edição).
- **Revisão:** sem contestação cética concluída.

### F3744 · Comitê de compra: 2 edge functions + 6 componentes sem dado

- **Tipo:** Edge function
- **O que os docs afirmam:** deal_committee_coverage, committee_coverage_history, committee_extraction_runs, buying_committee_members = 0/0/0/0.
- **Fontes:** `docs/estado/02_DOMINIO_CRM_PIPELINE.md:75-75`
- **O que falta:** pasta supabase/functions/deal-intelligence/index.ts ausente
- **Evidência:** pasta supabase/functions/deal-intelligence/index.ts ausente| CONTESTADO pelo cético (PARCIAL): Os artefatos existem sob outros nomes. Componentes em src/components/deal-intelligence/committee/ (5 arquivos), montados: CommitteeInsightsPanel e RelationshipHealthGraph em src/pages/DealIntelligence.tsx (rota /deal-intelligence, AppRoutes.tsx:703); BuyingCommitteeCard em src/pages/AccountDetail.tsx. As 4 tabelas existem com RLS (tables.md:41,95,96,123). Edges: extract-committee-from-call está na allowlist e é chamada em useCommitteeCoverage.ts:163; calculate-committee-coverage existe no repo, mas está FORA da allowlist e é chamada em useDealStakeholders.ts:108 e :126. As 4 tabelas têm 0 linhas (stats.md:260,268,344,358).
- **Revisão:** em disputa. O cético propõe Parcial e o juiz ainda não decidiu.

### F3749 · Edge function refresh-stage-baselines (7 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** Chamada por useStageBaselines.ts; idem.| 103 linhas; chamador: FE src/hooks/deal-intelligence/useStageBaselines.ts; verify_jwt true (default); tabelas tocadas (linhas em produção): stage_velocity_baselines(0). Classificação do doc: PARCIAL. \| NÃO INICIADO: refresh-stage-baselines ainda lê deal_stage_history (vazia). \| Baselines de velocidade por estágio. UI: src/pages/DealIntelligence.tsx:103 → StageBaselinesPanel.tsx. Hook/Service: useStageBaselines.ts:21,35 / useStageVelocity.ts:73,105. Tabela/Function: stage_velocity_baselines. Linhas no banco: 0. O que falta: Edge refresh-stage-baselines nunca gravou \| Catálogo API.md lista a edge function `refresh-stage-baselines` na categoria "CRM …
- **Fontes:** `docs/estado/04_DOMINIO_ANALYTICS_BI.md:420`, `docs/estado/10_EDGE_FUNCTIONS.md:424-424`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:22`, `docs/estado/02_DOMINIO_CRM_PIPELINE.md:78-78`, `docs/API.md:80-80`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:155-155` e mais 1
- **O que falta:** pasta supabase/functions/refresh-stage-baselines/index.ts ausente
- **Evidência:** pasta supabase/functions/refresh-stage-baselines/index.ts ausente| CONTESTADO pelo cético (REMOVIDO_INTENCIONALMENTE): A pasta foi apagada no commit 9717a5133 (PR #284, "fix(bi): unificar fontes canônicas de baselines..."). O código registra a decisão em src/hooks/deal-intelligence/useStageBaselines.ts:39-40: 'Função canônica: recompute-stage-baselines (refresh-stage-baselines foi removida — seu upsert falhava silenciosamente...)'. As chamadas atuais vão para recompute-stage-baselines (useStageBaselines.ts:41-42, useStageVelocity.ts:131-132).
- **Revisão:** em disputa. O cético propõe Removido de propósito e o juiz ainda não decidiu.

### F3750 · Edge Functions invocadas dinamicamente e inexistentes: deal-health-scorer e smart-lead-router

- **Tipo:** Edge function
- **O que os docs afirmam:** Doc: código invoca deal-health-scorer e smart-lead-router que não existem em supabase/functions.
- **Fontes:** `docs/auditoria/MATRIZ_FORENSE_BANCOS_E_CONTRATOS_2026-08-26.md:287`
- **O que falta:** pasta supabase/functions/deal-health-scorer/index.ts ausente
- **Evidência:** pasta supabase/functions/deal-health-scorer/index.ts ausente| CONTESTADO pelo cético (REMOVIDO_INTENCIONALMENTE): O critério 'ou invocações removidas' está atendido. O commit a7796fca0 (PR #245) trocou 'deal-health-scorer' por 'calculate-deal-health' e 'smart-lead-router' por 'dialer-queue-builder'. Estado atual: src/hooks/pipeline-pulse/useQuickAction.ts:16 e :21, e as duas substitutas estão na allowlist de deploy.yml:144. ausente: grep -rn 'deal-health-scorer\\|smart-lead-router' src supabase/functions → 0 resultados.
- **Revisão:** em disputa. O cético propõe Removido de propósito e o juiz ainda não decidiu.

### F3754 · Mapeamento filter_state/filter_role

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** ROTEAMENTO NI.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:409`
- **O que falta:** Implementar o mapeamento de filter_state e filter_role (UF do cliente, cargo do contato) na RPC de roteamento.
- **Evidência:** função "filter_state" ausente do banco real (functions.md)| cético: Correção à pré-checagem: filter_state e filter_role não são funções, são colunas de lead_routing_rules (tables/public/lead_routing_rules.md:24,27). O mapeamento delas para colunas de sales/clients não existe em lugar nenhum: auto_assign_lead__0b6752e84136f64e.sql:56-57 só filtra min_value e source. Fora de types.ts, o código só lê esses campos para exibição (LeadRoutingPage.tsx:154, RoutingRulesPanel.tsx:58).

### F3757 · Hook órfão useAccountActivities

- **Tipo:** Hook
- **O que os docs afirmam:** Exportado em `src/hooks/abm/useAccounts.ts` com zero referência em src/, tests/ e scripts/, inclusive dentro do próprio arquivo (critério rg -w).
- **Fontes:** `docs/estado/09_HOOKS_SERVICES.md:166`
- **O que falta:** hook useAccountActivities ausente (hooks.json e arquivos src/)
- **Evidência:** hook useAccountActivities ausente (hooks.json e arquivos src/)| CONTESTADO pelo cético (REMOVIDO_INTENCIONALMENTE): Removido no commit 9e4b2231a (PR #217), cujo primeiro item é "chore: remover código morto catalogado pela auditoria (hooks órfãos...)". O diff tem '-export const useAccountActivities' em src/hooks/abm/useAccounts.ts. ausente: grep -rn useAccountActivities src tests scripts → 0 resultados.
- **Revisão:** em disputa. O cético propõe Removido de propósito e o juiz ainda não decidiu.

### F3758 · Hook órfão useDealVelocityBatch

- **Tipo:** Hook
- **O que os docs afirmam:** Exportado em `src/hooks/deal-intelligence/useDealVelocity.ts` com zero referência em src/, tests/ e scripts/, inclusive dentro do próprio arquivo (critério rg -w).
- **Fontes:** `docs/estado/09_HOOKS_SERVICES.md:178`
- **O que falta:** hook useDealVelocityBatch ausente (hooks.json e arquivos src/)
- **Evidência:** hook useDealVelocityBatch ausente (hooks.json e arquivos src/)| CONTESTADO pelo cético (REMOVIDO_INTENCIONALMENTE): Removido no commit 9e4b2231a (PR #217, remoção de hooks órfãos catalogados pela auditoria). O diff tem '-export const useDealVelocityBatch' em src/hooks/deal-intelligence/useDealVelocity.ts. ausente: grep -rn useDealVelocityBatch src → 0 resultados.
- **Revisão:** em disputa. O cético propõe Removido de propósito e o juiz ainda não decidiu.

### F3759 · Hook órfão useStageBaselinesAll

- **Tipo:** Hook
- **O que os docs afirmam:** Exportado em `src/hooks/deal-intelligence/useStageVelocity.ts` com zero referência em src/, tests/ e scripts/, inclusive dentro do próprio arquivo (critério rg -w).
- **Fontes:** `docs/estado/09_HOOKS_SERVICES.md:207`
- **O que falta:** hook useStageBaselinesAll ausente (hooks.json e arquivos src/)
- **Evidência:** hook useStageBaselinesAll ausente (hooks.json e arquivos src/)| CONTESTADO pelo cético (REMOVIDO_INTENCIONALMENTE): Removido no commit 9e4b2231a (PR #217, remoção de hooks órfãos). O diff tem '-export const useStageBaselinesAll' em src/hooks/deal-intelligence/useStageVelocity.ts. ausente: grep -rn useStageBaselinesAll src → 0 resultados.
- **Revisão:** em disputa. O cético propõe Removido de propósito e o juiz ainda não decidiu.

### F3760 · Hook useAutoAssignLead (2 afirmações nos docs)

- **Tipo:** Hook
- **O que os docs afirmam:** /lead-routing apenas administra regras; useAutoAssignLead não é consumido e não há trigger/chamada ativa da RPC de auto-atribuição.| Exportado em `src/hooks/useLeadRoutingEngine.ts` com zero referência em src/, tests/ e scripts/, inclusive dentro do próprio arquivo (critério rg -w).
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:246-246`, `docs/estado/09_HOOKS_SERVICES.md:168`
- **O que falta:** hook useAutoAssignLead ausente (hooks.json e arquivos src/)
- **Evidência:** hook useAutoAssignLead ausente (hooks.json e arquivos src/)| CONTESTADO pelo cético (REMOVIDO_INTENCIONALMENTE): Removido no commit 9e4b2231a (PR #217, remoção de hooks órfãos). O diff tem '-export function useAutoAssignLead()' em src/hooks/useLeadRoutingEngine.ts. ausente: grep -rn useAutoAssignLead src → 0 resultados. O critério aceita 'símbolo removido'.
- **Revisão:** em disputa. O cético propõe Removido de propósito e o juiz ainda não decidiu.

### F3761 · Hook useDeals.ts

- **Tipo:** Hook
- **O que os docs afirmam:** Doc lista o hook `useDeals.ts` — gestão de deals.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:263`
- **O que falta:** Nada a construir: corrigir docs/DOCUMENTACAO_SISTEMA.md, que cita um hook inexistente.
- **Evidência:** hook useDeals ausente (hooks.json e arquivos src/)| cético: ausente: find src -name 'useDeals*' → 0 resultados. O arquivo src/hooks/useDeals.ts foi apagado no commit 06484329b ('Add quote detail export'), cuja mensagem não registra remoção deliberada. Só a documentação ainda o lista (docs/DOCUMENTACAO_SISTEMA.md:263,1111). A gestão de deals hoje está em src/hooks/usePipeline.ts.

### F3762 · Hook useDragAndDrop.ts

- **Tipo:** Hook
- **O que os docs afirmam:** Doc lista o hook `useDragAndDrop.ts` — drag & drop.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:263`
- **O que falta:** hook useDragAndDrop ausente (hooks.json e arquivos src/)
- **Evidência:** hook useDragAndDrop ausente (hooks.json e arquivos src/)| CONTESTADO pelo cético (REMOVIDO_INTENCIONALMENTE): src/hooks/useDragAndDrop.ts (166 linhas) foi apagado no commit 018359428 'Clean up orphan components and hooks'. ausente: find src -name 'useDragAndDrop*' → 0 resultados. O drag and drop vive em useMoveDeal (src/hooks/usePipeline.ts:142).
- **Revisão:** em disputa. O cético propõe Removido de propósito e o juiz ainda não decidiu.

### F2375 · Base de empresas / captura no LinkedIn

- **Tipo:** Integração externa
- **O que os docs afirmam:** linkedin só como tipo de atividade; nenhum fornecedor externo.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:57`
- **O que falta:** Integrar fornecedor real de base de empresas/LinkedIn.
- **Evidência:** linkedin só aparece como valor de tipo de atividade/canal (TemplateManager.tsx:124); nenhuma API/OAuth/scraper externo.
- **Revisão:** sem contestação cética concluída.

### F2376 · Buying signals (intent data, news triggers)

- **Tipo:** Integração externa
- **O que os docs afirmam:** Falta sinais de intenção de compra.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:126`
- **O que falta:** Criar fonte externa de intent/news; nada existe hoje.
- **Evidência:** ausente: grep 'buying_signal\|intent_data\|news_trigger' em src/,supabase/ → 0 resultados reais (só falso positivo em IntentTracker, análise de conversa interna).
- **Revisão:** sem contestação cética concluída.

### F2377 · Email finder/verifier integrado

- **Tipo:** Integração externa
- **O que os docs afirmam:** Falta localizador/verificador de e-mail.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:129`
- **O que falta:** Criar integração com provedor de verificação de e-mail.
- **Evidência:** ausente: não existe supabase/functions/verify-email nem qualquer finder/verifier de e-mail; functions de e-mail existentes são só envio/composição.
- **Revisão:** sem contestação cética concluída.

### F2378 · Extensão/integração LinkedIn para captura

- **Tipo:** Integração externa
- **O que os docs afirmam:** Gap: linkedin existe só como canal/atividade em TemplateManager.tsx e tipos de atividade.
- **Fontes:** `docs/benchmark/RAMPER_2026-07.md:35`
- **O que falta:** Construir extensão/integração de captura real do LinkedIn.
- **Evidência:** TemplateManager.tsx:124 — linkedin é só <SelectItem value="linkedin"> num seletor de canal.
- **Revisão:** sem contestação cética concluída.

### F2379 · G6 Base de empresas / captura LinkedIn via fornecedor externo

- **Tipo:** Integração externa
- **O que os docs afirmam:** Substituível por importação + enrich-lead; custo recorrente e LGPD.
- **Fontes:** `docs/benchmark/RAMPER_2026-07.md:167`
- **O que falta:** Configurar fornecedor real de enriquecimento; endpoint existe mas desabilitado.
- **Evidência:** supabase/functions/enrich-lead/index.ts:33-45 sempre retorna 503 'enrichment_provider_not_configured' por design (comentário no código confirma remoção de mock anterior). Chamado por useLeadEnrichment.ts, sempre falha.
- **Revisão:** sem contestação cética concluída.

### F2380 · LinkedIn Sales Navigator (enriquecimento + InMail)

- **Tipo:** Integração externa
- **O que os docs afirmam:** Falta integração com LinkedIn Sales Navigator.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:54`
- **O que falta:** Integração paga com LinkedIn Sales Navigator, inexistente.
- **Evidência:** ausente: nenhuma referência a Sales Navigator/InMail/OAuth LinkedIn em src/ ou supabase/functions/.
- **Revisão:** sem contestação cética concluída.

### F2381 · People intelligence (job changes)

- **Tipo:** Integração externa
- **O que os docs afirmam:** Falta monitoramento de mudanças de cargo.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:127`
- **O que falta:** Fornecedor de people intelligence + tabela de eventos de carreira, inexistente.
- **Evidência:** ausente: grep 'contact_changes\|job_change\|people.intelligence' → nenhum artefato correspondente.
- **Revisão:** sem contestação cética concluída.

### F2382 · Phone validation automática

- **Tipo:** Integração externa
- **O que os docs afirmam:** Falta validação automática de telefone.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:130`
- **O que falta:** Criar edge function com Twilio Lookup API.
- **Evidência:** ausente: não existe supabase/functions/twilio-lookup; as functions Twilio existentes são de voz (call-status, call-twiml, click-to-call), não de validação de número.
- **Revisão:** sem contestação cética concluída.

### F2383 · W3.3 Enriquecimento em escala via fornecedor externo

- **Tipo:** Integração externa
- **O que os docs afirmam:** Avaliação de custo e LGPD (G6).
- **Fontes:** `docs/benchmark/RAMPER_2026-07.md:204`
- **O que falta:** Fornecedor real + fluxo em lote, ambos inexistentes.
- **Evidência:** Mesmo artefato de F2379 (enrich-lead sempre 503); useLeadEnrichment.ts processa só um lead por vez, sem processamento em lote.
- **Revisão:** sem contestação cética concluída.

### F2384 · Atribuição multi-touch e lead magnets

- **Tipo:** Outro
- **O que os docs afirmam:** attribution/first_touch/u_shape ausentes.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:61`
- **O que falta:** Implementar modelo de atribuição multi-touch, inexistente.
- **Evidência:** Únicos hits de 'attribution' são falsos positivos: ClientsMap.tsx:417 (copyright de mapa) e WorkflowsPage.tsx:338 (hideAttribution do React Flow).
- **Revisão:** sem contestação cética concluída.

### F2386 · Coletor de visitantes do site (website_visitor_logs)

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** website_visitor_logs só em types.ts; não há script de coleta.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:59`
- **O que falta:** Script de coleta + endpoint público com consentimento, inexistente.
- **Evidência:** website_visitor_logs só em types.ts/migrations; ausente: nenhum script de coleta ou endpoint público em src/ ou supabase/functions/.
- **Revisão:** sem contestação cética concluída.

### F2388 · G7 Coletor de visitantes do site

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** website_visitor_logs vazia; precisa script + endpoint público com consentimento.
- **Fontes:** `docs/benchmark/RAMPER_2026-07.md:168`
- **O que falta:** Idem F2386.
- **Evidência:** Mesma evidência de F2386 — tabela só no schema, sem coletor.
- **Revisão:** sem contestação cética concluída.

### F2398 · Forms builder com lead routing automático

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Falta construtor de formulários com roteamento.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:87`
- **O que falta:** Tabelas forms/form_submissions, builder, rota pública, edge function que cria lead e aplica lead_routing_rules.
- **Evidência:** ausente: ls tables/public| grep -iE '^form\|landing\|submission\|captcha\|web_form\|lead_form' → só lead_routing_log.md e lead_routing_rules.md; grep -rli 'form_submissions\|landing_pages\|public_form\|web_forms\|captcha\|turnstile' src/ supabase/functions/ → 0 resultados; AppRoutes.tsx só tem rotas públicas de auth (l.217) e report-embed (l.221). lead_routing_rules existe (tables/public/lead_routing_rules.md:7-9, RLS 2 policies) e é usada por src/hooks/useLeadRoutingEngine.ts, mas sem formulário.
- **Revisão:** sem contestação cética concluída.

### F2399 · Formulários públicos de captura

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Gap.
- **Fontes:** `docs/benchmark/RAMPER_2026-07.md:80`
- **O que falta:** Rota pública com formulário, tabela de submissões com policy anon de INSERT e criação de lead.
- **Evidência:** ausente: grep -rli 'form_submissions\|lead_capture\|public_form\|web_forms' src/ supabase/ → 0 resultados; nenhuma tabela forms/form_submissions em tables.md; AppRoutes.tsx:217-221 únicas rotas sem auth são login/recovery e /report-embed.
- **Revisão:** sem contestação cética concluída.

### F2400 · G4 Rotas públicas de forms/landing com RLS anon e anti-spam

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Superfície pública nova em app 100% autenticado; exige revisão de segurança.
- **Fontes:** `docs/benchmark/RAMPER_2026-07.md:165`
- **O que falta:** Rota pública, tabela de submissões com policy anon INSERT restrita, grant anon mínimo e anti-spam (captcha/rate limit).
- **Evidência:** ausente: nenhuma tabela forms/form_submissions (tables.md); grep -i captcha/turnstile/hcaptcha em src/ supabase/functions/ → 0; policies.md com INSERT para anon: só error_logs (l.366) e sms_verification_codes deny (l.841) — nenhuma de submissões; AppRoutes.tsx sem rota /f/ ou /lp/.
- **Revisão:** sem contestação cética concluída.

### F2401 · Landing pages builder

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Falta construtor de landing pages para captura.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:86`
- **O que falta:** Tabela landing_pages, builder, rota pública de renderização e submissão gerando lead.
- **Evidência:** ausente: ls tables/public| grep -i landing → 0; grep -rli 'landing_pages\|landing' src/ supabase/functions/ → 0 resultados; grep -i landing src/routes/AppRoutes.tsx → 0.
- **Revisão:** sem contestação cética concluída.

### F3765 · Rota /inactivity-triggers (2 afirmações nos docs)

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Existe /inactivity-triggers mas é básica.| Falta página de regras de inatividade (existe /inactivity-triggers mas é básica).
- **Fontes:** `docs/FUNCIONALIDADES_SEM_UI.md:102`
- **O que falta:** rota /inactivity-triggers não existe em src/routes/AppRoutes.tsx (rotas.json)
- **Evidência:** rota /inactivity-triggers não existe em src/routes/AppRoutes.tsx (rotas.json)| CONTESTADO pelo cético (PARCIAL): A rota existe com outra URL: /gatilhos-inatividade (src/routes/AppRoutes.tsx:929-934, guard Manager, página InactivityTriggers). Está no menu (src/components/layout/sidebar/sidebarMenuData.ts:334). Porém a página renderiza a constante fixa INACTIVITY_RULES (src/pages/InactivityTriggers.tsx:10 e :156), e não as regras de stage_inactivity_rules lidas no hook (useInactiveDeals.ts:97-102). Ela também não lê nem grava portfolio_settings.inactivity_threshold_days, que é o que a edge auto-reassign-inactive consome (supabase/functions/auto-reassign-inactive/index.ts:92 e :121-122).
- **Revisão:** em disputa. O cético propõe Parcial e o juiz ainda não decidiu.

### F2403 · UI useStagnantTasks: inbox dedicada "Deals Esquecidos" com bulk actions

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Falta inbox dedicada "Deals Esquecidos" com bulk actions para useStagnantTasks (UI atual: 1 import).
- **Fontes:** `docs/FUNCIONALIDADES_SEM_UI.md:65`
- **O que falta:** Página/inbox 'Deals Esquecidos' listando tarefas follow_up de deals estagnados com seleção múltipla e ações em lote (concluir/reatribuir/adiar), rota + menu, estados loading/erro/vazio.
- **Evidência:** useStagnantTasks continua com 1 único importador: grep -rn useStagnantTasks src/ → apenas src/pages/Tarefas.tsx:5 (botão 'Gerar Tarefas de Follow-up', l.51-60); ausente: grep -rni 'deals esquecidos\|forgotten deals' src/ → 0 resultados; nenhuma rota/inbox dedicada em AppRoutes.tsx.
- **Revisão:** sem contestação cética concluída.

### F2404 · W3.1 Construtor de formulário público + landing page com roteamento

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Submissão cria lead reaproveitando lead_routing_rules (G4); revisão de segurança anon.
- **Fontes:** `docs/benchmark/RAMPER_2026-07.md:202`
- **O que falta:** Construtor de formulário/landing, rota pública, tabela de submissões com policy anon INSERT + anti-spam e edge function que cria o lead e chama o roteamento (lead_routing_rules/auto_assign_lead).
- **Evidência:** ausente: nenhuma tabela forms/landing_pages em tables.md (ls tables/public| grep -iE '^form\|landing' → 0); grep -rli 'form_submissions\|landing_pages\|public_form\|web_forms' src/ supabase/functions/ → 0 resultados; AppRoutes.tsx:217-221 sem rota pública de form/landing. Só a peça de roteamento existe: lead_routing_rules (tables/public/lead_routing_rules.md:7-9, RLS) + src/hooks/useLeadRoutingEngine.ts e RPC auto_assign_lead (functions.md:92), sem formulário que a acione. Doc RAMPER_2026-07.md:202 declara planejado.
- **Revisão:** sem contestação cética concluída.

### F3766 · Base de empresas/contatos para gerar listas

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Gap: nenhuma tabela de company database.
- **Fontes:** `docs/benchmark/RAMPER_2026-07.md:34`
- **O que falta:** Uma base de empresas e contatos pesquisável (tabela com RLS, hook e tela) para montar listas.
- **Evidência:** tabela/view "company_database" ausente do banco real (tables.md, views.md)| cético: ausente: grep company_database em tables.md e views.md → 0 resultados. A tabela mais próxima, public.enriched_company_intelligence (cache firmográfico), tem 0 linhas (stats.md:365). Fora de types.ts, só é referenciada em supabase/functions/enrich-lead/contract_test.ts e não tem UI de busca nem de montagem de listas. Não há rota de prospecção ou lista em AppRoutes.tsx.

### F2412 · Teste de automações em massa (50+ leads simultâneos)

- **Tipo:** Teste
- **O que os docs afirmam:** Gatilhos em massa com 50+ leads simultâneos operando sem gargalos.
- **Fontes:** `docs/reports/STRESS_TEST_REPORT.md:10-10`
- **O que falta:** Teste executável de carga/concorrência que crie 50+ leads e dispare automações (ex.: k6/Playwright/SQL) com asserts de gargalo.
- **Evidência:** docs/reports/STRESS_TEST_REPORT.md:10 afirma '50+ leads simultâneos' mas não há artefato: grep -rli 'stress\|load test\|k6\|artillery' tests/ supabase/tests/ scripts/ → scripts/load/k6-smoke.js (só GET auth/v1/health e OPTIONS preflight em edge functions, l.52-70; vus default 5), supabase/tests/quote-to-sale-stress.sql (orçamentos→venda, não leads) e tests/migrations/authz_hardening_contract_test.ts (regex); grep -rni '50.*leads\|leads.*50' tests/ supabase/tests/ scripts/ → 0 resultados.
- **Revisão:** sem contestação cética concluída.

## Parcial (37)

### F2347 · Botão "Rotear leads pendentes" do Pipeline Pulse invoca smart-lead-router inexistente

- **Tipo:** Ação/botão
- **O que os docs afirmam:** Doc: useQuickAction.ts:21 (fn smart-lead-router), botão QuickActionsPanel.tsx:23-26; sempre falha; não há function de roteamento de leads.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:312-312`
- **O que falta:** Ligar o botão a roteamento real (ex.: RPC route_unassigned_client_portfolio em lote para client_portfolio sem vendedor, ou useLeadRoutingEngine) ou renomear rótulo/descrição para 'Reconstruir fila de discagem' em QuickActionsPanel.tsx:22-26
- **Evidência:** src/hooks/pipeline-pulse/useQuickAction.ts:20-23 agora aponta 'route-pending-leads' → fn 'dialer-queue-builder' (existe em supabase/functions/dialer-queue-builder/index.ts e está na allowlist deploy.yml:144), :44-56 busca a dialer_queue mais recente e envia {queue_id}; botão em QuickActionsPanel.tsx:22-26 rotulado 'Rotear leads pendentes — Distribui leads na fila para closers'. Porém dialer-queue-builder/index.ts:57-67 só pega sales do próprio owner da fila (`.eq('salesperson_id', ownerScope)`) e :110-127 regrava dialer_queue_items priorizados — reconstrói fila de discagem, não roteia/distribui leads entre vendedores. grep -rn "smart-lead-router" src/ supabase/ → 0 resultados.
- **Revisão:** sem contestação cética concluída.

### F2351 · Quick action route-pending-leads referencia Edge Function smart-lead-router ausente

- **Tipo:** Ação/botão
- **O que os docs afirmam:** Doc: quick action route-pending-leads invoca smart-lead-router que não existe no repositório.
- **Fontes:** `docs/auditoria/CONTRATO_ROTEAMENTO_LEADS_2026-08-26.md:99`
- **O que falta:** Mesmo de F2347: trocar o alvo por roteamento real (route_unassigned_client_portfolio em lote / useLeadRoutingEngine) ou ajustar rótulo e descrição do botão
- **Evidência:** src/hooks/pipeline-pulse/useQuickAction.ts:20-23,44-56: 'route-pending-leads' não referencia mais smart-lead-router (grep -rn "smart-lead-router" src/ supabase/ → 0); invoca 'dialer-queue-builder' (existe e está na allowlist deploy.yml:144) com queue_id da fila mais recente. Mas supabase/functions/dialer-queue-builder/index.ts:57-67,110-127 só reprioriza sales do dono da fila em dialer_queue_items — não é roteamento de leads pendentes para closers como o rótulo em QuickActionsPanel.tsx:22-26 promete.
- **Revisão:** sem contestação cética concluída.

### F2352 · Quick action smart-lead-router aponta para Edge Function inexistente

- **Tipo:** Ação/botão
- **O que os docs afirmam:** Quick action aponta para a Edge Function smart-lead-router, inexistente no repo.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:231-234`
- **O que falta:** Mesmo de F2347/F2351: alvo de roteamento real ou renomear a ação
- **Evidência:** Nenhuma quick action aponta mais para smart-lead-router: grep -rn "smart-lead-router\|smart_lead_router" src/ supabase/ → 0 resultados; ls supabase/functions/smart-lead-router → não existe. A action 'route-pending-leads' em src/hooks/pipeline-pulse/useQuickAction.ts:20-23 chama 'dialer-queue-builder' (deployada, allowlist deploy.yml:144), porém a function (supabase/functions/dialer-queue-builder/index.ts:57-67) só reconstrói a fila de discagem do próprio owner — não roteia leads, divergindo do rótulo 'Rotear leads pendentes' (QuickActionsPanel.tsx:22-26).
- **Revisão:** sem contestação cética concluída.

### F2354 · SDRCommandBar: botão "Log Call"

- **Tipo:** Ação/botão
- **O que os docs afirmam:** Doc: botão sem `onClick`.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/D_frontend.md:51-51`
- **O que falta:** Abrir dialog de nova atividade com type='call' (ou navigate('/atividades?novo=call') tratado pela página) persistindo em activities
- **Evidência:** src/components/sdr/SDRCommandBar.tsx:34-37: botão 'Log Call' tem onClick={() => navigate('/atividades')} — só navega para a página genérica de atividades, sem abrir formulário pré-preenchido (type=call) nem gravar em activities. Montado em src/components/sdr/SDRDashboard.tsx:40-41,215 → rota /sdr src/routes/AppRoutes.tsx:256.
- **Revisão:** sem contestação cética concluída.

### F2355 · SDRCommandBar: botão "Log Email"

- **Tipo:** Ação/botão
- **O que os docs afirmam:** Doc: botão sem `onClick`.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/D_frontend.md:51-51`
- **O que falta:** Abrir dialog de nova atividade com type='email' persistindo em activities
- **Evidência:** src/components/sdr/SDRCommandBar.tsx:44-47: botão 'Log Email' com onClick={() => navigate('/atividades')} — apenas navegação genérica, não registra e-mail nem abre formulário com tipo pré-definido. Montado em SDRDashboard.tsx:215 → /sdr (AppRoutes.tsx:256).
- **Revisão:** sem contestação cética concluída.

### F2356 · SDRCommandBar: botão "Log Social"

- **Tipo:** Ação/botão
- **O que os docs afirmam:** Doc: botão sem `onClick`.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/D_frontend.md:51-51`
- **O que falta:** Abrir dialog de nova atividade com type='social' persistindo em activities
- **Evidência:** src/components/sdr/SDRCommandBar.tsx:54-57: botão 'Log Social' com onClick={() => navigate('/atividades')} — navegação genérica, sem registro de atividade social. Montado em SDRDashboard.tsx:215 → /sdr (AppRoutes.tsx:256).
- **Revisão:** sem contestação cética concluída.

### F2357 · SDRCommandBar: botão "Novo Lead"

- **Tipo:** Ação/botão
- **O que os docs afirmam:** Doc: botão sem `onClick`.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/D_frontend.md:51-51`
- **O que falta:** Abrir o dialog de criação de venda/lead (ex.: navigate('/vendas?novo=1') ou estado compartilhado) em vez de só navegar
- **Evidência:** src/components/sdr/SDRCommandBar.tsx:22-25: botão 'Novo Lead' com onClick={() => navigate('/vendas')} — leva à lista de vendas, não abre o formulário de novo lead. Montado em SDRDashboard.tsx:215 → /sdr (AppRoutes.tsx:256).
- **Revisão:** sem contestação cética concluída.

### F2361 · Estágios configuráveis do pipeline

- **Tipo:** Componente
- **O que os docs afirmam:** Estágios Lead → Qualificação → Proposta → Negociação → Fechamento configuráveis.
- **Fontes:** `docs/FUNCIONALIDADES_SISTEMA.md:73-73; docs/FEATURE_SUMMARY.md:110-111`
- **O que falta:** Tela admin de CRUD de pipelines/pipeline_stages (insert/update/delete via useMultiplePipelines) e migrar o pipeline padrão para ler estágios da tabela
- **Evidência:** Fonte editável existe no banco: public.pipeline_stages (tables.md:239, RLS sim, 6 policies incl. pipeline_stages_insert/update/delete_admin_manager em tables/public/pipeline_stages.md:59-99; 7 linhas stats.md:153) e public.pipelines (tables.md:240); src/hooks/useMultiplePipelines.ts:48-54 lê pipeline_stages e PipelineBoard.tsx:75-84,116 usa dynamicStages para pipelines não-padrão. Porém o pipeline padrão usa lista hardcoded PIPELINE_STAGES (src/hooks/usePipeline.ts:20-40; PipelineBoard.tsx:107-108) e não há UI de edição: grep -rn "pipeline_stages" src/components src/pages → 0 resultados; nenhum insert/update em pipeline_stages em src/.
- **Revisão:** sem contestação cética concluída.

### F2363 · Landing pages/formulários inbound (website_visitor_logs)

- **Tipo:** Componente
- **O que os docs afirmam:** Sem landing pages, formulários ou coletor; website_visitor_logs sem produtor.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:190`
- **O que falta:** Coletor (edge function pública/script de site) gravando em website_visitor_logs + formulário inbound que crie lead/cliente
- **Evidência:** Tabela existe no banco real: public.website_visitor_logs (tables.md:390; RLS sim, 1 policy só de leitura 'Admins e Managers podem ver logs de visitantes' em tables/public/website_visitor_logs.md), 0 linhas (stats.md:335). Nenhum produtor: grep -rn "website_visitor_logs" src/ supabase/functions (excluindo types.ts) → 0 resultados; grep -rln -i "visitor" supabase/functions src/hooks src/pages → só texto em src/components/intelligence/StrategicRecommendations.tsx:22. Sem landing page ou formulário inbound.
- **Revisão:** sem contestação cética concluída.

### F2365 · UI useLeadAssignment: modal de transferência em massa com preview de carga

- **Tipo:** Componente
- **O que os docs afirmam:** Falta modal de transferência em massa com preview de carga para useLeadAssignment (UI atual: 2 imports).
- **Fontes:** `docs/FUNCIONALIDADES_SEM_UI.md:64`
- **O que falta:** Componente BulkTransferDialog em /lead-routing importando useLeadAssignment (preview de carga por vendedor) e chamando uma RPC de transferência em lote (ver F2358), com estados loading/erro/vazio
- **Evidência:** src/hooks/useLeadAssignment.ts:42-70 existe mas só lista salespeople ativos e calcula round-robin/weighted em memória (assignLeadRoundRobin) — nenhuma escrita; consumido por src/components/lead-routing/CapacityDashboard.tsx, RoutingPerformanceCard.tsx, RoutingHistoryPanel.tsx e src/pages/LeadRoutingPage.tsx (rota /lead-routing AppRoutes.tsx:541). Modal de transferência em massa com preview de carga não existe: grep -rn -i "massa\|bulk\|transfer" src/components/lead-routing src/pages/LeadRoutingPage.tsx → 0 resultados.
- **Revisão:** sem contestação cética concluída.

### F2367 · Estágios do pipeline: Lead, Qualificado, Proposta, Negociação, Fechado

- **Tipo:** Doc/config
- **O que os docs afirmam:** Doc fixa 5 estágios do pipeline Kanban.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:243-251`
- **O que falta:** Atualizar docs/DOCUMENTACAO_SISTEMA.md:243-251 para refletir os 7 estágios/rótulos reais (ou alinhar rótulos da constante ao doc)
- **Evidência:** Constante PIPELINE_STAGES em src/hooks/usePipeline.ts:20-40 define 7 estágios: lead 'Ativação (SDR)', qualified 'Qualificado', proposal 'Proposta', negotiation 'Negociação', won 'Venda Concluída', lost 'Perdido', closed 'Arquivado'; renderizados por PipelineBoard.tsx:107-108 (currentStages → colunas) via PipelineColumn.tsx. Os 5 estágios do doc existem como ids (lead/qualified/proposal/negotiation/won), mas rótulos 'Lead' e 'Fechado' não correspondem e há 2 colunas extras; tabela pipeline_stages (7 linhas, stats.md:153) cobre pipelines não-padrão.
- **Revisão:** sem contestação cética concluída.

### F2370 · Runbook deal-risk-digest com nomes de log reais (slack_circuit_open etc.)

- **Tipo:** Doc/config
- **O que os docs afirmam:** DIVERGENTE: função emite slack_circuit_open, slack_retry_exhausted, slack_fallback_failed; slack_post_failed/deal_risk_query_failed não existem.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:326`
- **O que falta:** Atualizar o runbook para os nomes de log reais e remover os inexistentes.
- **Evidência:** docs/runbooks/deal-risk-digest.md:10,18,22 cita slack_post_failed e deal_risk_query_failed. Código real (supabase/functions/deal-risk-digest/index.ts:68,72,76) loga slack_circuit_open, slack_retry_exhausted, slack_fallback_failed — nenhum bate com o runbook.
- **Revisão:** sem contestação cética concluída.

### F3745 · Edge function check-lead-sla (9 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** Das 24 órfãs, check-lead-sla só é disparada por BackendAutomationMonitor/useStartAgentRun.| Relatório lista check-lead-sla entre as funções sem qualquer verificação de autenticação; roadmap #8 pede proteger as ~20 funções. \| Catálogo API.md lista a edge function `check-lead-sla` na categoria "Leads / Roteamento" com auth "nenhuma detectada no handler · verify_jwt", método "qualquer", payload "criticalHours, notifyEmail" e resposta "JSON". \| Doc lista a edge function `check-lead-sla` (#7) — verificação de SLA de leads. Auth: Service. \| 171 linhas; chamador: só string em src/components/admin/BackendAutomationMonitor.tsx (sem invoke); verify_jwt true (default); tabelas tocadas (linhas em pr…
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:267`, `docs/reports/BACKEND_ANALYSIS_REPORT.md:139-139`, `docs/API.md:206-206`, `docs/FUNCIONALIDADES_COMPLETAS.md:160-160`, `docs/FUNCIONALIDADES_SISTEMA.md:514-514`, `docs/DOCUMENTACAO_SISTEMA.md:992-1021` e mais 5
- **O que falta:** Colocar check-lead-sla na allowlist de deploy para o cron de 15 min passar a executar de fato; validar auth do handler.
- **Evidência:** supabase/functions/check-lead-sla/index.ts existe; FORA da allowlist de deploy (.github/workflows/deploy.yml:144) → não roda em produção; ÓRFÃ: nenhum chamador no front, em edges ou em SQL/cron (edge-functions.json)| cético: supabase/functions/check-lead-sla/index.ts existe, mas está FORA da allowlist (.github/workflows/deploy.yml:144). Correção à pré-checagem: a função não é órfã. Existe o job pg_cron 81 check-lead-sla-15min (cron.md:44), que chama trigger_internal_edge_job('check-lead-sla'), e o nome está no allowlist dessa função (functions/public/trigger_internal_edge_job__f02f045c8b4350ab.sql:31). As execuções aparecem como 'succeeded' (cron-runs.md:331-337), mas isso só confirma o enfileiramento do http_post: a function não está publicada. Também é citada em src/components/admin/BackendAutomationMonitor.tsx:43.

### F3746 · Edge function deal-risk-digest (10 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** Envia resumo diário de negócios parados/em risco via SLACK_WEBHOOK_URL; digest vazio é por design.| supabase/functions/deal-risk-digest existe no repo (citada em src/: não); sonda OPTIONS em produção: OPTIONS → 200. Status no doc: OK. \| POST falho → log slack_post_failed + texto com link do runbook; query falha → 500 + deal_risk_query_failed. \| Digest de notificações de deals em risco usa a constante HEALTH_THRESHOLD (50) sobre health_score. \| Catálogo API.md lista a edge function `deal-risk-digest` na categoria "CRM / Pipeline" com auth "segredo interno (cron/service_role) · verify_jwt off", método "só POST", payload "—" e resposta "JSON {error, ok}". \| 247 linhas; chamador: **nenhum**…
- **Fontes:** `docs/runbooks/deal-risk-digest.md:1-4,13,29`, `docs/prod-readiness.md:307`, `docs/runbooks/deal-risk-digest.md:8-11`, `docs/DEAL_RISK_CRITERIA.md:8-9,20`, `docs/API.md:65-65`, `docs/estado/10_EDGE_FUNCTIONS.md:353-353` e mais 4
- **O que falta:** Ajustar o job 21 para enviar X-Cron-Secret (coaching_cron_secret) ou usar trigger_internal_edge_job. Confirmar no painel que SLACK_DIGEST_WEBHOOK_URL está configurado (não verificável daqui).
- **Evidência:** supabase/functions/deal-risk-digest/index.ts existe; está na allowlist de deploy (.github/workflows/deploy.yml:144); ÓRFÃ: nenhum chamador no front, em edges ou em SQL/cron (edge-functions.json)| cético: A edge existe e está na allowlist. Correção à pré-checagem: a função não é órfã. Existe o job 21 deal-risk-digest-daily '0 11 * * *' (cron.md:22), com execuções 'succeeded' (cron-runs.md:137-143). Porém o cron só envia os headers Content-Type e apikey (anon), e o handler exige isAuthorizedCronRequest (supabase/functions/deal-risk-digest/index.ts:105-117), que aceita apenas Authorization service_role ou X-Cron-Secret (_shared/cron-request-auth.ts:15-20). Resultado: cada execução recebe 401 'unauthorized'. Além disso, o env lido é SLACK_DIGEST_WEBHOOK_URL (index.ts:34), não SLACK_WEBHOOK_URL.

### F3747 · Edge function extract-deal-stakeholders (6 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** Doc classifica como REAL. Chamador(es): FE hooks/deal-intelligence/useDealStakeholders.ts:142. DUPLICATA parcial de extract-committee-from-call.| supabase/functions/extract-deal-stakeholders existe no repo (citada em src/: sim); sonda OPTIONS em produção: OPTIONS → 404 NOT_FOUND (não publicada; limite de 100 funções do plano). Status no doc: BLOQUEADO. \| Catálogo API.md lista a edge function `extract-deal-stakeholders` na categoria "CRM / Pipeline" com auth "JWT do usuário · verify_jwt", método "qualquer", payload "recording_id, sale_id, manual_text" e resposta "JSON {error, success}". \| 278 linhas; chamador: FE src/hooks/deal-intelligence/useDealStakeholders.ts; verify_jwt true (default)…
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:111-111`, `docs/prod-readiness.md:336`, `docs/API.md:71-71`, `docs/estado/10_EDGE_FUNCTIONS.md:382-382`, `docs/estado/09_HOOKS_SERVICES.md:291-311`, `docs/estado/07_DOMINIO_WINLOSS_COMPETITIVE.md:277`
- **O que falta:** Colocar extract-deal-stakeholders na allowlist de deploy (ou consolidar com extract-committee-from-call, que está deployada).
- **Evidência:** supabase/functions/extract-deal-stakeholders/index.ts existe; FORA da allowlist de deploy (.github/workflows/deploy.yml:144) → não roda em produção; chamada por: src/hooks/deal-intelligence/useDealStakeholders.ts| cético: supabase/functions/extract-deal-stakeholders/index.ts existe e é chamada por src/hooks/deal-intelligence/useDealStakeholders.ts:142. Está FORA da allowlist (.github/workflows/deploy.yml:144), então dá 404 em produção. A tabela public.deal_stakeholders tem cerca de 600 linhas (stats.md:46).

### F3748 · Edge function lead-scoring (15 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** NÃO INICIADO: lead-scoring ainda lê deal_stage_history (vazia).| LeadScoreExplainCard.tsx:38 e DealCard.tsx via useLeadScoreExplanation.ts, useExplainBatch.ts:15. Edge function predictive-scoring-explain; Lovable Gateway (index.ts:90,102). Sem persistência. \| Score de leads calculado pela function lead-scoring. \| Falta score por conta distinto do lead scoring. \| Catálogo API.md lista a edge function `lead-scoring` na categoria "Leads / Roteamento" com auth "nenhuma detectada no handler · verify_jwt", método "qualquer", payload "dealIds, contrato:leadScoring" e resposta "JSON {error}". \| Doc lista a edge function `lead-scoring` (#14) — pontuação de leads. Auth: JWT. \| 267 linhas; chamad…
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:22`, `docs/estado/06_DOMINIO_IA_COACHING.md:257`, `docs/FUNCIONALIDADES_COMPLETAS.md:148-148`, `docs/GAPS_CLASSE_MUNDIAL.md:79`, `docs/API.md:209-209`, `docs/DOCUMENTACAO_SISTEMA.md:992-1021` e mais 9
- **O que falta:** Colocar lead-scoring na allowlist de deploy; falta também o score por conta (account_scores).
- **Evidência:** supabase/functions/lead-scoring/index.ts existe; FORA da allowlist de deploy (.github/workflows/deploy.yml:144) → não roda em produção; ÓRFÃ: nenhum chamador no front, em edges ou em SQL/cron (edge-functions.json)| cético: supabase/functions/lead-scoring/index.ts existe, mas está FORA da allowlist (.github/workflows/deploy.yml:144). Correção à pré-checagem: há chamador, src/hooks/useLeadScoring.ts:111 (batch de dealIds) e :268, usado pelo PipelineBoard.tsx e pelos componentes lead-scoring/*. Sem deploy, o hook sempre cai no fallback local (useLeadScoring.ts:115 só usa o resultado se !edgeError). A edge lê deal_stage_history (index.ts:71), tabela que hoje tem cerca de 1,3 mil linhas (stats.md:41), então a afirmação de que está 'vazia' está desatualizada.

### F2371 · IA Predictive Scoring: score de fechamento e análise comportamental

- **Tipo:** Edge function
- **O que os docs afirmam:** Score de fechamento e análise comportamental por IA.
- **Fontes:** `docs/reports/AUDIT_REPORT.md:12-12`
- **O que falta:** Adicionar lead-scoring à allowlist; hoje lead_scores não é populada em produção.
- **Evidência:** deal-probability e behavioral-analysis (deployadas, chamadas pelo front) funcionam. Mas lead_scores só é escrita por lead-scoring (supabase/functions/lead-scoring/index.ts:214-216), que NÃO está na allowlist ACTIVE (deploy.yml:144); useLeadScoring.ts:118 engole o erro silenciosamente.
- **Revisão:** sem contestação cética concluída.

### F3751 · Função SQL/RPC auto_assign_lead (5 afirmações nos docs)

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** Regras consideram valor, estado geográfico e fonte do lead.| Tornar auto_assign_lead consumido e round-robin transacional, sem localStorage/N+1. Saída esperada: teste concorrente multiusuário. Gate: autorização RPC/trigger. \| Função SQL que atribui lead automaticamente conforme regras. \| Doc: auto_assign_lead bloqueia venda, atualiza salesperson_id apenas se nulo, cria no máximo uma lead_assignments; chamador useAutoAssignLead (MATRIZ aponta hook sem importador produtivo). \| API.md lista a function SQL `auto_assign_lead` com última definição em 20260830000002_harden_lead_routing.sql, grants "authenticated, service_role" e uso no front "1 arquivo(s)".
- **Fontes:** `docs/FUNCIONALIDADES_COMPLETAS.md:154-154`, `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:728-728`, `docs/FUNCIONALIDADES_COMPLETAS.md:155-155`, `docs/auditoria/CONTRATO_ROTEAMENTO_LEADS_2026-08-26.md:21,30`, `docs/API.md:481-481`
- **O que falta:** Ligar a RPC a um chamador (trigger em sales, cron ou UI), aplicar filter_state, e criar o teste concorrente multiusuário.
- **Evidência:** função public.auto_assign_lead existe no banco real (functions.md); sem referência em código, cron, triggers ou outras funções (coluna de uso vazia)| cético: public.auto_assign_lead existe no banco real (functions.md:92, grants authenticated e service_role). Não tem chamador: a única menção no código é um comentário em src/hooks/useLeadAssignment.ts:13. Nenhuma trigger ou cron a chama. A regra só considera valor e fonte (auto_assign_lead__0b6752e84136f64e.sql:56-57), ignorando o estado geográfico. O hook useAutoAssignLead foi removido no commit 9e4b2231a.

### F3752 · Função SQL/RPC calculate_deal_health (3 afirmações nos docs)

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** Deal Health Score determinístico via RPC.| Lado SQL de saúde do deal sem chamador (mig/20260416195725:69). \| API.md lista a function SQL `calculate_deal_health` com última definição em 20260416195725_4d7ca4a9-1812-4b95-83ca-d216d7fc129c.sql, grants "—" e uso no front "1 arquivo(s)".
- **Fontes:** `docs/FUNCIONALIDADES_SISTEMA.md:572-572`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/F_banco_dados.md:86`, `docs/API.md:505-505`
- **O que falta:** Ter um chamador real (.rpc ou cron), ou registrar formalmente a substituição pela edge calculate-deal-health.
- **Evidência:** função public.calculate_deal_health existe no banco real (functions.md); sem referência em código, cron, triggers ou outras funções (coluna de uso vazia)| cético: public.calculate_deal_health existe no banco (functions.md:109). A única referência em src é a lista de src/test/activities-soft-delete-functions.test.ts:23. ausente: grep -rn "rpc('calculate_deal_health'" src → 0 resultados. Sem chamada em cron.md, triggers.md ou outras funções.

### F3753 · Função SQL/RPC calculate_deal_risk_score (2 afirmações nos docs)

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** Score de risco de deal movido para private sem chamador.| API.md lista a function SQL `calculate_deal_risk_score` com última definição em 20260513194322_de774cc9-8b6f-4814-9c4e-3f80fbffaadb.sql, grants "—" e uso no front "—".
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/F_banco_dados.md:86`, `docs/API.md:508-508`
- **O que falta:** Ter um chamador (trigger, cron ou função viva), ou dropar a função se for legado.
- **Evidência:** função private.calculate_deal_risk_score existe no banco real (functions.md); sem referência em código, cron, triggers ou outras funções (coluna de uso vazia)| cético: private.calculate_deal_risk_score existe no banco (functions.md:35). ausente: grep -rnw calculate_deal_risk_score src supabase/functions → 0 resultados, e nenhuma outra função, trigger ou cron no snapshot a referencia.

### F3755 · RPC/função SQL `calculate_deal_health_score`

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** API.md lista a function SQL `calculate_deal_health_score` com última definição em 20260104181000_stored_procedures_additional.sql, grants "—" e uso no front "—".
- **Fontes:** `docs/API.md:506-506`
- **O que falta:** Ter um chamador real, ou dropar a função duplicada (há também calculate_deal_health e a edge calculate-deal-health).
- **Evidência:** função public.calculate_deal_health_score existe no banco real (functions.md); sem referência em código, cron, triggers ou outras funções (coluna de uso vazia)| cético: public.calculate_deal_health_score(p_deal_id uuid) existe no banco (functions.md:110). ausente: grep -rnw calculate_deal_health_score src supabase/functions → 0 resultados, e não há referência em cron.md, triggers.md ou em outras funções.

### F3756 · RPC/função SQL `update_lead_score`

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** API.md lista a function SQL `update_lead_score` com última definição em 20260104170152_stored_procedures.sql, grants "—" e uso no front "—".
- **Fontes:** `docs/API.md:776-776`
- **O que falta:** Ter um chamador real, ou dropar a função.
- **Evidência:** função public.update_lead_score existe no banco real (functions.md); sem referência em código, cron, triggers ou outras funções (coluna de uso vazia)| cético: public.update_lead_score(client_id uuid) existe no banco (functions.md:379). A menção em supabase/functions/ai-agent-orchestrator/index.ts:82 e :292 é só o nome de uma tool, que faz update direto em leads, e não chama a RPC; essa edge, aliás, não está na allowlist. Não há chamada em src, cron ou trigger.

### F3763 · Hook usePipeline (7 afirmações nos docs)

- **Tipo:** Hook
- **O que os docs afirmam:** Falha de severidade baixa registrada pela validação adversarial, sem correção nesta rodada.| 7 estágios com rótulos, cores e probabilidades (10/25/50/75/100/0/0) hardcoded apesar de pipeline_stages ter 7 linhas. \| usePipeline.ts:88 useMoveDeal persiste mudança de estágio em sales.status. \| Doc lista o hook `usePipeline.ts` — pipeline kanban. \| PARCIAL: usePipeline.ts:22-42 fixo; stage_probabilities duplica fonte. \| PipelineBoard drag-and-drop faz update({status}) sem regra de transição nem dados obrigatórios; confete antes da confirmação. \| usePipeline select('*') sem filtro; salespersonId opcional ausente por padrão.
- **Fontes:** `docs/prod-readiness.md:1006`, `docs/estado/02_DOMINIO_CRM_PIPELINE.md:182-183`, `docs/estado/02_DOMINIO_CRM_PIPELINE.md:31-31`, `docs/DOCUMENTACAO_SISTEMA.md:263`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:89`, `docs/auditoria/RELATORIO_FALHAS.md:635-638` e mais 1
- **O que falta:** Ler os estágios e probabilidades de pipeline_stages e paginar a query de sales para mais de 1000 linhas.
- **Evidência:** arquivo src/hooks/usePipeline.ts existe mas hook não consta em hooks.json (não exportado/indexado)| cético: O hook existe, é exportado e é consumido por src/pages/Pipeline.tsx, PipelineBoard.tsx, DealCard.tsx e outros, então a evidência da pré-checagem estava errada, mas o veredito se mantém. Os 7 estágios e as probabilidades estão fixos em PIPELINE_STAGES (src/hooks/usePipeline.ts:22-59), embora public.pipeline_stages exista (tables.md:239). usePipelineDeals não pagina nem usa range (usePipeline.ts:107-117), o que trunca em 1000 linhas. useMoveDeal já usa a RPC transition_sale_status com optimistic locking (usePipeline.ts:158-165).

### F3764 · Hook usePlaybookMutations (2 afirmações nos docs)

- **Tipo:** Hook
- **O que os docs afirmam:** usePlaybookMutations.ts:27 sem completed_by; agora salespeople.id do logado (#470).| Falha de severidade baixa registrada pela validação adversarial, sem correção nesta rodada.
- **Fontes:** `docs/prod-readiness.md:973`, `docs/prod-readiness.md:1006`
- **O que falta:** Conferir as linhas afetadas no delete (.select() ou count) e avisar quando a etapa pertence a outro usuário.
- **Evidência:** arquivo src/hooks/playbooks/usePlaybookMutations.ts existe mas hook não consta em hooks.json (não exportado/indexado)| cético: A correção do PR #470 está no main: completed_by vem de get_current_salesperson_id (src/hooks/playbooks/usePlaybookMutations.ts:27-37). Mas o delete (usePlaybookMutations.ts:20-25) não filtra por autor nem confere linhas afetadas. A policy de DELETE exige completed_by = get_current_salesperson_id() ou admin (tables/public/playbook_progress.md:70-77). Por isso, ao desmarcar a etapa de outro vendedor, a operação apaga 0 linhas sem erro e a UI mostra como concluída.

### F2372 · Real-time Pipeline: sincronização entre múltiplos usuários

- **Tipo:** Hook
- **O que os docs afirmam:** Sincronização automática do pipeline entre múltiplos usuários em tempo real.
- **Fontes:** `docs/reports/AUDIT_REPORT.md:14-14`
- **O que falta:** Assinar postgres_changes no pipeline invalidando ['pipeline-deals'].
- **Evidência:** sales está em supabase_realtime, mas usePipeline.ts não assina postgres_changes. useSalesRealtime.ts (único listener de 'sales' com invalidação) só é montado em src/pages/Index.tsx e invalida ['sales'], nunca ['pipeline-deals'].
- **Revisão:** sem contestação cética concluída.

### F2387 · Detecção de deals estagnados (5+ dias)

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Identificação de deals parados há 5+ dias sem atividade.
- **Fontes:** `docs/FUNCIONALIDADES_SISTEMA.md:79-79; docs/FUNCIONALIDADES_SISTEMA.md:330-331`
- **O que falta:** Agendar via pg_cron e corrigir doc do threshold (14d, não 5d).
- **Evidência:** create-stagnant-tasks (allowlist ACTIVE) + useStagnantTasks.ts + Tarefas.tsx funcionam, mas threshold default real é 14 dias (index.ts:51-58), não '5+' como a doc, e é mutation manual — ausente qualquer entrada 'stagnant' em cron.md (sem agendamento automático).
- **Revisão:** sem contestação cética concluída.

### F2389 · Handoff formal MQL → SQL

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Falta handoff formal de MQL para SQL.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:89`
- **O que falta:** Usar a tabela mql_qualifications para dados BANT estruturados em vez de jsonb solto; adotar rótulos MQL/SQL explícitos.
- **Evidência:** MQLQualificationForm.tsx existe e é montado (SDRDashboard.tsx:614,392); atualiza sales.status/closer_id e insere notificação 'lead_handoff' (linhas 75-112) — handoff funciona. Mas não usa status explícitos MQL/SQL (só lead/qualified) e a tabela mql_qualifications existe no banco (types.ts:10930) mas está órfã: nenhum código lê/escreve nela.
- **Revisão:** sem contestação cética concluída.

### F2390 · Monitor de SLA de leads (LeadSLAMonitor + check-lead-sla)

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** LeadSLAMonitor exibe SLA; edge check-lead-sla verifica SLA de leads (Service).
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:631,1007`
- **O que falta:** Adicionar à allowlist e conectar o componente ao resultado da edge function.
- **Evidência:** check-lead-sla existe e tem cron ativo a cada 15min (cron.md:44, cron-runs.md 'succeeded'), mas está AUSENTE da allowlist ACTIVE (deploy.yml:144) — o 'succeeded' mede só a chamada SQL, não a function HTTP. LeadSLAMonitor.tsx não chama check-lead-sla; consulta sales/activities/app_config diretamente (linhas 23,32,42).
- **Revisão:** sem contestação cética concluída.

### F2391 · Pontuação de leads (lead-scoring + lead_scores)

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Edge lead-scoring (JWT) + useLeadScoring + tabela lead_scores (RLS own or admin).
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:1011,299,1063`
- **O que falta:** Adicionar lead-scoring à allowlist; sem isso lead_scores nunca é populada em produção.
- **Evidência:** Fio completo no código: rota /lead-scoring → LeadScoringDashboard → useLeadScoring → edge lead-scoring (upsert em lead_scores, index.ts:214-219). Porém lead-scoring está AUSENTE da allowlist ACTIVE (deploy.yml:144); useLeadScoring.ts:118 mascara o erro com fallback silencioso.
- **Revisão:** sem contestação cética concluída.

### F2393 · Roteamento automático de leads (/lead-routing)

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Superior: /lead-routing, lead_routing_rules, lead_routing_log.
- **Fontes:** `docs/benchmark/RAMPER_2026-07.md:41`
- **O que falta:** Invocar auto_assign_lead via trigger de INSERT em sales ou edge function na criação do lead.
- **Evidência:** Rota /lead-routing com UI de regras/histórico existe, mas a RPC auto_assign_lead (que aplicaria as regras na criação do lead) está órfã: ausente — nenhuma chamada rpc('auto_assign_lead') em src/ ou supabase/, sem trigger em sales, sem entrada em cron.md.
- **Revisão:** sem contestação cética concluída.

### F2395 · Tarefas geradas automaticamente para deals estagnados aparecem em /tarefas

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Integração entre create-stagnant-tasks e a fila de tarefas.
- **Fontes:** `docs/FUNCIONALIDADES_COMPLETAS.md:193-193`
- **O que falta:** Geração só ocorre por clique manual em /tarefas (não há pg_cron nem outro chamador para create-stagnant-tasks); origem da tarefa identificável apenas por task_type='follow_up' + prefixo 'Follow-up:' no título (tasks não tem coluna de origem/automation). Para ser 'automática': criar job pg_cron chamando a function e marcar origem (ex.: coluna source).
- **Evidência:** supabase/functions/create-stagnant-tasks/index.ts:128-141 insere em tasks {title:'Follow-up: <cliente>', task_type:'follow_up', sale_id, due_date:hoje}; .github/workflows/deploy.yml:144 contém create-stagnant-tasks na allowlist ACTIVE; src/hooks/useStagnantTasks.ts:19 invoca a function e invalida ['tasks']; src/pages/Tarefas.tsx:5,14,51,68 monta botão 'Gerar Tarefas de Follow-up' e <TaskQueue/>; src/components/tasks/TaskQueue.tsx:77 usa useTodayTasks; src/hooks/tasks/useTaskQueries.ts:53-58 lê tasks com due_date=hoje; AppRoutes.tsx:287 rota /tarefas; sidebarMenuData.ts:131 menu; tabela tasks com RLS (tables/public/tasks.md:7). Sem agendamento: grep -i stagnant cron.md → 0 resultados; único chamador é o hook da UI.
- **Revisão:** sem contestação cética concluída.

### F2396 · W2.4 Coletor de visitantes com consentimento

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Alimenta website_visitor_logs (G7).
- **Fontes:** `docs/benchmark/RAMPER_2026-07.md:199`
- **O que falta:** Não existe script coletor nem endpoint/edge function que grave em website_visitor_logs, nem fluxo de consentimento no site; policy só de SELECT (nenhum INSERT anon/service). Criar edge function pública de coleta com consentimento + snippet JS e policy/grant de INSERT.
- **Evidência:** Tabela existe no banco real: tables/public/website_visitor_logs.md:7-9 (RLS sim, 1 policy SELECT admin/manager, colunas ip_address, company_name, domain, legal_basis, consent_record_id, retention_expires_at); migrations 20261001150100_lgpd_consent_and_anonymization.sql:158-166 e 20261018190000_lgpd_fixes_consent_anonymize.sql:445-464 só adicionam base legal/anonimização. Nenhum escritor: grep website_visitor_logs em src/ e supabase/functions/ (exceto types.ts) → 0 resultados; grep -i visitor em scripts/ public/ → 0; cron.md → 0; no banco só fn_apply_data_retention e anonymize_data_subject referenciam a tabela.
- **Revisão:** sem contestação cética concluída.

### F2397 · Website visitor identification (de-anonymization)

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Falta identificação de visitantes do site.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:128`
- **O que falta:** Script de coleta no site, resolução IP→empresa (provedor externo) e UI de leitura; hoje só o schema existe.
- **Evidência:** Tabela website_visitor_logs existe com colunas company_name/domain/ip_address (tables/public/website_visitor_logs.md:19-29), mas nenhum código popula ou resolve empresa: grep -rn website_visitor_logs src/ supabase/functions/ (fora types.ts) → 0; grep -i 'de-anonym\|deanonym\|visitor' src/ supabase/functions/ → 0 resultados. Doc fonte GAPS_CLASSE_MUNDIAL.md:128 declara pendente.
- **Revisão:** sem contestação cética concluída.

### F2405 · Migration 20260903000001_enable_rls_leads excluída deliberadamente

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** Migration que abriria a tabela leads para qualquer usuário logado ficou de fora do catch-up de propósito.
- **Fontes:** `docs/execucao/catchup-migrations-2026-10-20/README.md:180-181`
- **O que falta:** Remover ou reescrever o arquivo 20260903000001_enable_rls_leads.sql (referencia tabela inexistente e policy aberta) e limpar/justificar a versão 20260903000001 registrada com 0 statements em supabase_migrations.schema_migrations.
- **Evidência:** Decisão registrada em docs/execucao/catchup-migrations-2026-10-20/README.md:30 (ficou de fora de propósito). Porém o arquivo segue inalterado com policy permissiva: supabase/migrations/20260903000001_enable_rls_leads.sql:5-10 (USING true / WITH CHECK true TO authenticated). E a versão ESTÁ no ledger do banco real: migrations.md:609 '20260903000001| enable_rls_leads \| 0 statements' (snapshot migrations/20260903000001_...sql: 'sem statements registrados'). Agravante: tabela public.leads não existe no banco (grep '[public.leads' tables.md → 0; grep 'TABLE.*leads' supabase/schema.sql → 0) — leads vivem em sales (lints.md:598-603 policies 'Closers can view leads').
- **Revisão:** sem contestação cética concluída.

### F2410 · Cenários simulados de roteamento em PostgreSQL 15 isolado (idempotência, concorrência, negação anon)

- **Tipo:** Teste
- **O que os docs afirmam:** Doc lista 8 cenários verificados localmente (repetição manual, troca sem transferência, auto_assign repetido, CAS, concorrência, negação anon).
- **Fontes:** `docs/auditoria/CONTRATO_ROTEAMENTO_LEADS_2026-08-26.md:35-46`
- **O que falta:** Suíte SQL (pgTAP ou asserts em supabase/tests/) reproduzindo idempotência, CAS, concorrência e negação anon das RPCs de roteamento, ligada ao job sql-tests.
- **Evidência:** Os 8 cenários (CONTRATO_ROTEAMENTO_LEADS_2026-08-26.md:37-46) foram 'simulados localmente' e não há suíte correspondente: ls supabase/tests/ → canonical_post_migration_assertions.sql, canonical_role_simulation.sql, db01_default_acl_assertions.sql, quote-to-sale-stress.sql, rls_test_suite.sql, role_helpers_matrix_assertions.sql — nenhum exercita route_unassigned_client_portfolio/auto_assign_lead (grep → 0 nesses arquivos; canonical_post_migration_assertions.sql:23-80 só checa privilégios anon de outras tabelas/RPCs); tests/migrations/canonical_hardening_contract_test.ts:25 só faz regex no texto da migration; src/hooks/useLeadRouting.test.tsx:11,39-93 é unit test com supabase mockado (vi.mock), sem concorrência/idempotência de banco.
- **Revisão:** sem contestação cética concluída.

### F2411 · E2E isolados para UI de roteamento/portfólio, passkeys e estados de pedidos (vazio/erro/detalhe)

- **Tipo:** Teste
- **O que os docs afirmam:** Doc: faltam E2E isolados para roteamento/portfólio, passkeys e estados vazio/erro/detalhe de pedidos.
- **Fontes:** `docs/auditoria/VALIDACAO_EXAUSTIVA_ONDA_0_2026-08-26.md:59`
- **O que falta:** Specs isolados (page.route mocks) para UI de roteamento/portfólio, fluxo de passkeys e estados vazio/erro/detalhe de pedidos.
- **Evidência:** Roteamento: tests/e2e/pages-admin-config.spec.ts:190-197 só smoke 'carrega página /lead-routing' (h1 visível), exige sessão real (test.skip(!HAS_AUTH), helpers/auth.ts:32) — não isolado por mocks. Pedidos: pages-reports-hubs.spec.ts:284-288 só smoke de /acompanhamento-pedidos, sem estados vazio/erro/detalhe. Passkeys: ausente — grep -rli 'passkey\|webauthn' tests/e2e/ → 0 resultados. Nenhum spec lead-routing*/portfolio*/orders* (ls tests/e2e).
- **Revisão:** sem contestação cética concluída.

### F3769 · Função de trigger `trigger_recalculate_deal_health`

- **Tipo:** Trigger
- **O que os docs afirmam:** API.md lista a function SQL `trigger_recalculate_deal_health` com última definição em 20260513192406_ef2d75ae-77a0-44d8-be60-b4f1a6aba82b.sql, grants "—" e uso no front "—".
- **Fontes:** `docs/API.md:762-762`
- **O que falta:** Migration corrigindo private.trigger_recalculate_deal_health para usar computed_at (ou outro marcador de score desatualizado) em vez de calculated_at; hoje o trigger está anexado mas quebra quando há sale_id.
- **Evidência:** Função existe em private (functions.md:64) e é executada por dois triggers enabled: tr_critical_moment_health em call_critical_moments (triggers.md:58) e tr_competitor_mention_health em competitor_mentions (triggers.md:104); ambas as tabelas têm recording_id (call_critical_moments.md:20, competitor_mentions.md:20). Porém o corpo faz `UPDATE public.deal_health_scores SET calculated_at = now() - interval '1 day'` (functions/private/trigger_recalculate_deal_health__12ae32cb1ec02d01.sql:16-18) e deal_health_scores não tem calculated_at: `grep -n calculated_at tables/public/deal_health_scores.md` → 0 resultados (colunas reais computed_at :26 e updated_at :34). Quando a gravação tem sale_id e existe score, o trigger falha em runtime e aborta o INSERT/UPDATE nas tabelas de origem. Também está em private, não em public como o doc (API.md:762) afirma.
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Não implementado.
