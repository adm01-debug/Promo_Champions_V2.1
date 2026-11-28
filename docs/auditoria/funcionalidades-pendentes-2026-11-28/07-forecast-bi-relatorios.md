# Forecast, BI e relatórios

[Voltar ao índice](README.md)

117 itens não implementados, parciais ou não verificáveis neste domínio.

## Não implementado (30)

### F0548 · Projeções manuais de demanda

- **Tipo:** Ação/botão
- **O que os docs afirmam:** Usuário pode inserir projeções manualmente.
- **Fontes:** `docs/FUNCIONALIDADES_COMPLETAS.md:280-280`
- **O que falta:** Criar formulário de projeção manual em DemandForecastDashboard.tsx com insert em demand_forecasts (origem 'manual').
- **Evidência:** Nenhum formulário/insert manual: src/hooks/useDemandForecast.ts:49 só invoke('demand-forecast', {action:'generate-forecasts'}); :78 select em demand_forecasts; o upsert em :135 é em inventory_levels (estoque), não projeção. ausente: grep -rn "manual_projections" src supabase → 0 resultados; grep "insert\\|upsert\\|manual" em src/components/analytics/DemandForecastDashboard.tsx → 0. Banco real: tables/public/demand_forecasts.md:19-28 sem coluna de origem/manual; stats.md:270 demand_forecasts 0 linhas. Rota /previsao-demanda (AppRoutes.tsx:688) só exibe previsões geradas pela edge function.| cético: Confirmado: src/pages/PrevisaoDemanda.tsx:1-3 só monta DemandForecastDashboard. grep -n 'Input\|<form\|onSubmit\|mutate' em src/components/analytics/DemandForecastDashboard.tsx → 0 resultados. Os únicos arquivos com demand_forecasts são src/hooks/useDemandForecast.ts e supabase/functions/deman…

### F3331 · Agendamento (cron) compute-forecast-accuracy (3 afirmações nos docs)

- **Tipo:** Agendamento (cron)
- **O que os docs afirmam:** NÃO INICIADO: grep cron.schedule/trigger_internal_edge_job para compute-forecast-accuracy = 0.| Uma das 64/168 funções sem invocador literal em src/. Grupo: Cron / alertas agendados (INFERIDO). Classificação por grupo deduzida do nome; pg_cron/config.toml não verificados. \| compute-forecast-accuracy é edge batch sem cron e sem auth de cron; roda só por invoke manual no front.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:143`, `docs/estado/09_HOOKS_SERVICES.md:291-311`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/F_banco_dados.md:166`
- **O que falta:** Criar o job pg_cron (trigger_internal_edge_job) com auth de cron, colocar compute-forecast-accuracy na allowlist e ter evidência de execução.
- **Evidência:** nenhum job em pg_cron para "compute-forecast-accuracy" (cron.md, 45 jobs)| cético: Ausente: grep 'compute-forecast-accuracy' em cron.md (45 jobs) → 0 resultados; nenhum workflow .github com schedule para ela. O único chamador é manual, src/hooks/revenue-intelligence/useForecastAccuracy.ts:137. A function também está fora da allowlist ACTIVE de deploy.yml:144, então nem o invoke manual roda em produção.

### F3332 · Agendamento (cron) generate-executive-briefing (2 afirmações nos docs)

- **Tipo:** Agendamento (cron)
- **O que os docs afirmam:** NÃO INICIADO: grep cron.schedule/trigger_internal_edge_job para generate-executive-briefing = 0.| Criar cron diário para briefing executivo.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:143`, `docs/estado/04_DOMINIO_ANALYTICS_BI.md:496-498`
- **O que falta:** Criar o cron diário em pg_cron para generate-executive-briefing e verificar que executive_briefings recebe uma linha por dia.
- **Evidência:** nenhum job em pg_cron para "generate-executive-briefing" (cron.md, 45 jobs)| cético: Ausente: grep 'executive-briefing' em cron.md → 0 resultados; nenhum workflow agendado. A function está na allowlist (deploy.yml:144), mas só é chamada manualmente por src/hooks/executive-briefing/useGenerateBriefing.ts:14.

### F3334 · Agendamento (cron) snapshot-forecast (5 afirmações nos docs)

- **Tipo:** Agendamento (cron)
- **O que os docs afirmam:** Criar cron mensal para snapshot e cálculo de precisão.| NÃO INICIADO: grep cron.schedule/trigger_internal_edge_job para snapshot-forecast = 0. \| Doc: só botões useForecastAccuracy.ts:118,137; painel de acurácia sem série temporal. \| snapshot-forecast é edge batch sem cron e sem auth de cron; roda só por invoke manual no front. Sem série histórica para medir acurácia. \| snapshot-forecast só chamado por useForecastAccuracy; sem cron.
- **Fontes:** `docs/estado/04_DOMINIO_ANALYTICS_BI.md:496-498`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:128`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:143`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:247-247`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/F_banco_dados.md:166,172`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:91`
- **O que falta:** Criar o cron mensal (snapshot-forecast e compute-forecast-accuracy) com auth de cron, colocar as duas na allowlist e ter evidência de linhas em forecast_snapshots.
- **Evidência:** nenhum job em pg_cron para "snapshot-forecast" (cron.md, 45 jobs)| cético: Ausente: grep 'snapshot-forecast\|forecast' em cron.md → 0 jobs. Os únicos chamadores são botões manuais em src/hooks/revenue-intelligence/useForecastAccuracy.ts:118,137. snapshot-forecast e compute-forecast-accuracy estão fora da allowlist de deploy.yml:144.

### F3335 · calibrate-win-probability agendado (deal_probability_scores)

- **Tipo:** Agendamento (cron)
- **O que os docs afirmam:** PARCIAL: deal_probability_scores só inserida por calibrate-win-probability:182; deal-probability não grava; nenhum cron.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:79`
- **O que falta:** Criar o cron para calibrate-win-probability e colocá-la na allowlist de deploy, para que deal_probability_scores seja gravada periodicamente.
- **Evidência:** nenhum job em pg_cron para "calibrate-win-probability" (cron.md, 45 jobs)| cético: Ausente: grep 'calibrate-win' em cron.md → 0 resultados. O único chamador é manual, src/hooks/revenue/useWinProbabilityCalibration.ts:115. calibrate-win-probability está fora da allowlist de deploy.yml:144.

### F3337 · Execução automática do edge batch recompute-stage-baselines

- **Tipo:** Agendamento (cron)
- **O que os docs afirmam:** recompute-stage-baselines é edge batch sem cron e sem auth de cron; roda só por invoke manual no front.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/F_banco_dados.md:166`
- **O que falta:** Criar o cron com auth de cron para recompute-stage-baselines e colocá-la na allowlist de deploy.
- **Evidência:** nenhum job em pg_cron para "recompute-stage-baselines" (cron.md, 45 jobs)| cético: Ausente: grep 'stage-baselines' em cron.md → 0 resultados. Os chamadores são manuais: src/hooks/deal-intelligence/useStageVelocity.ts:132 e useStageBaselines.ts:42. recompute-stage-baselines está fora da allowlist de deploy.yml:144.

### F3355 · Attribution multi-touch (first/last/linear/U-shape)

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** Falta atribuição multi-touch.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:90`
- **O que falta:** Tabela de touchpoints, modelos first/last/linear/U-shape, hook e UI.
- **Evidência:** função "touch" ausente do banco real (functions.md)| cético: ausente: grep -rniE 'attribution\|touchpoint\|multi.?touch' src supabase/functions supabase/migrations → só ClientsMap.tsx:417 (atribuição de mapa) e WorkflowsPage.tsx:338 (hideAttribution); nenhuma tabela lead_touchpoints/attribution em tables.md.

### F3365 · Revenue recognition (ASC 606)

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** Falta reconhecimento de receita.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:110`
- **O que falta:** Tabela de cronograma de receita, regras ASC 606, hook e UI.
- **Evidência:** função "recognition" ausente do banco real (functions.md)| cético: ausente: grep -rniE 'revenue_schedule\|asc ?606\|revenue.?recognition\|reconhecimento de receita' src supabase → 0; nenhuma tabela revenue_schedules em tables.md.

### F3373 · Hook órfão useUpdateScheduledReport

- **Tipo:** Hook
- **O que os docs afirmam:** Exportado em `src/hooks/reporting/useScheduledReports.ts` com zero referência em src/, tests/ e scripts/, inclusive dentro do próprio arquivo (critério rg -w).
- **Fontes:** `docs/estado/09_HOOKS_SERVICES.md:210`
- **O que falta:** hook useUpdateScheduledReport ausente (hooks.json e arquivos src/)
- **Evidência:** hook useUpdateScheduledReport ausente (hooks.json e arquivos src/)| CONTESTADO pelo cético (REMOVIDO_INTENCIONALMENTE): ausente: grep -rnw useUpdateScheduledReport src tests scripts → 0 resultados; src/hooks/reporting/useScheduledReports.ts exporta só useScheduledReports(:13), useCreateScheduledReport(:41), useDeleteScheduledReport(:70), useToggleScheduledReport(:85). Commit 9e4b2231a (#217) 'chore: remover código morto catalogado pela auditoria (hooks órfãos...)' apaga '-export function useUpdateScheduledReport()' desse arquivo.
- **Revisão:** em disputa. O cético propõe Removido de propósito e o juiz ainda não decidiu.

### F3376 · Hook useRevenueIntelligence não alcançado

- **Tipo:** Hook
- **O que os docs afirmam:** O grafo de imports a partir de src/main.tsx não alcança: src/hooks/revenue/useRevenueIntelligence.ts. Candidatos a validação, não lixo.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:257-258`
- **O que falta:** hook useRevenueIntelligence ausente (hooks.json e arquivos src/)
- **Evidência:** hook useRevenueIntelligence ausente (hooks.json e arquivos src/)| CONTESTADO pelo cético (REMOVIDO_INTENCIONALMENTE): ausente: ls src/hooks/revenue/ → só useQuotaAttainment, useQuotaAttainmentPredictor, useRevenueHistory, useRevenueIntelligenceHub, useWinProbabilityCalibration; git show 9e4b2231a --name-status → 'D src/hooks/revenue/useRevenueIntelligence.ts' no commit 'remover código morto catalogado pela auditoria (hooks órfãos...)' (#217).
- **Revisão:** em disputa. O cético propõe Removido de propósito e o juiz ainda não decidiu.

### F0584 · Conectores BI (Tableau, PowerBI, Looker)

- **Tipo:** Integração externa
- **O que os docs afirmam:** Falta conectores para ferramentas de BI externas.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:57`
- **O que falta:** Endpoint read-only estável (view/RPC/export CSV ou OData) autenticado por api_tokens, documentado em docs/API.md e testado em Power BI/Tableau/Looker.
- **Evidência:** ausente: `grep -rni 'powerbi\\|tableau\\|looker' src supabase scripts .github docs/API.md` → 0 resultados. docs/API.md só documenta PostgREST (:9) e edge functions; não há endpoint/conector para ferramentas de BI. Tabela api_tokens existe mas vazia (contexto/supabase/stats.md:241, 0 linhas) e sem documentação de uso por BI externo.| cético: `grep -rniE 'powerbi\|power bi\|tableau\|looker\|odata' src supabase docs/API.md scripts .github` → só falsos positivos (toDataURL, VendasMacroData, oData). api_tokens só é usado por ranking-api (fora da allowlist deploy.yml:144) e src/hooks/useApiTokens.ts (tela ApiIntegrationSettings.tsx:17,36) — API de ranking, não conector de BI; api_tokens com 0 linhas (stats.md:241).

### F0585 · Conectores de BI (Tableau/PowerBI/Looker)

- **Tipo:** Integração externa
- **O que os docs afirmam:** powerbi/tableau/looker = 0.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:93`
- **O que falta:** Mesmo de F0584.
- **Evidência:** ausente: `grep -rni 'powerbi\\|tableau\\|looker' src supabase scripts .github docs/API.md` → 0 resultados (mesma constatação de docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:93).| cético: Mesmo grep de F0584 → 0 artefatos de conector/export para BI externo.

### F0586 · Conectores Power BI/Tableau/Looker

- **Tipo:** Integração externa
- **O que os docs afirmam:** Não iniciados.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:223`
- **O que falta:** Mesmo de F0584.
- **Evidência:** ausente: `grep -rni 'powerbi\\|tableau\\|looker' src supabase scripts .github docs/API.md` → 0 resultados; docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:223 ('não iniciados') segue válido.| cético: Mesmo grep de F0584 → 0 artefatos de conector Power BI/Tableau/Looker.

### F0588 · Painel de observabilidade consumindo v_quote_to_sale_invariants com alerta all_ok=false

- **Tipo:** Integração externa
- **O que os docs afirmam:** P4: consumir a view em Grafana/Metabase com alerta.
- **Fontes:** `docs/reports/QUOTE_TO_SALE_QA_REPORT.md:132-132`
- **O que falta:** Cron/edge que alerte quando all_ok=false e/ou painel externo apontando para a view (externo não verificável pelo repo).
- **Evidência:** A view existe no banco real: contexto/supabase/views.md:1221 (public.v_quote_to_sale_invariants) com coluna all_ok (:1268). Mas nada a consome: `grep -rn 'all_ok\\|v_quote_to_sale_invariants' src supabase/functions scripts .github` → só src/integrations/supabase/types.ts; `grep -rni 'grafana\\|metabase'` → apenas comentários do sink de métricas (supabase/functions/_shared/metrics-exporter.ts:4-8, cron-failure-alerter/index.ts:200) e download do k6 (pr-checks.yml:431), nenhum painel/alerta sobre a view; cron.md sem job de invariantes. Doc: docs/reports/QUOTE_TO_SALE_QA_REPORT.md:132 (P4 planejado).| cético: `grep -rln 'v_quote_to_sale_invariants' src supabase/functions supabase/tests scripts .github e2e tests` → só src/integrations/supabase/types.ts; `grep quote_to_sale_invariants` em cron.md/functions.md/webhooks.md e functions/*.sql → 0. A view existe (views.md:1221) mas nenhum painel …

### F0607 · Dashboard de qualidade de dados

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Dashboard de data quality; ausente.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:31`
- **O que falta:** Tudo: view/RPC de completude e duplicidade (clients/sales/leads), hook, página e rota/menu.
- **Evidência:** ausente: `grep -rln -iE 'data.?quality\|qualidade de dados' src` → só src/components/competitive/ImprovementPlan.tsx (outro contexto); `grep -i quality contexto/supabase/tables.md contexto/supabase/views.md` → 0; nenhuma rota em src/routes/AppRoutes.tsx.| CONTESTADO pelo cético (PARCIAL): Existe painel de duplicidade, que o critério ('métricas de completude/duplicidade') aceita: rota /deduplicacao src/routes/AppRoutes.tsx:909-912 → src/pages/Deduplication.tsx:28 useDeduplicationScan (src/hooks/crm/useDeduplicationScan.ts:52 lê clients reais), com mescla real via clientService.mergeClients (:30-41); no menu em sidebarMenuData.ts:303. Completude não existe: `grep -rln -iE 'completeness\|completude\|DataQuality\|data_quality' src` → 0.
- **Revisão:** em disputa. O cético propõe Parcial e o juiz ainda não decidiu.

### F3384 · Rota /dashboard-custom (4 afirmações nos docs)

- **Tipo:** Rota/tela
- **O que os docs afirmam:** API.md declara a rota `/dashboard-custom` renderizando o componente DashboardCustom com acesso "autenticado".| Dashboard com layout customizável e persistido por usuário. \| Rota registrada em AppRoutes.tsx com acesso "autenticado", GET em produção 200, chamando as edge functions next-best-action, report-builder-execute. Status no doc: BLOQUEADO: edge report-builder-execute indisponível \| Rota /dashboard-custom (AppRoutes.tsx:115) renderiza src/pages/DashboardCustom.tsx; sem role explícito (só autenticação global). Classificação do doc: IMPLEMENTADO_TOTAL. Evidência: menu (sidebarMenuData.ts) · sb=1 useQuery=1 mut=1 (árvore 11 arq.)
- **Fontes:** `docs/API.md:292-292`, `docs/FUNCIONALIDADES_COMPLETAS.md:74-76`, `docs/prod-readiness.md:150`, `docs/estado/01_FRONTEND_ROTAS.md:51-51`
- **O que falta:** rota /dashboard-custom não existe em src/routes/AppRoutes.tsx (rotas.json)
- **Evidência:** rota /dashboard-custom não existe em src/routes/AppRoutes.tsx (rotas.json)| CONTESTADO pelo cético (PARCIAL): Rota EXISTE: AppRoutes.tsx:258 <Route path="/dashboard-custom" element={<DashboardCustom/>}/> dentro de ProtectedRoute (:241); menu sidebarMenuData.ts:157,230,288. Layout persistido em dashboard_layouts (src/hooks/dashboard/useDashboardLayout.ts:194 select, :220 upsert; tabela com RLS sim). next-best-action está na allowlist deploy.yml:144. Porém CustomReportWidget (CustomizableDashboard.tsx:35) → useReportExecution.ts:33 invoca 'report-builder-execute', ausente da allowlist ACTIVE de deploy.yml:144.
- **Revisão:** em disputa. O cético propõe Parcial e o juiz ainda não decidiu.

### F3385 · Rota /dashboard-personalizado

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Não existe.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:224`
- **O que falta:** Rota /dashboard-personalizado não existe; doc deve apontar /dashboard-custom ou criar redirect.
- **Evidência:** rota /dashboard-personalizado não existe em src/routes/AppRoutes.tsx (rotas.json)| cético: ausente: grep -rn "dashboard-personalizado" src → 0 resultados (nem rota nem redirect). Equivalente real é /dashboard-custom (AppRoutes.tsx:258).

### F3386 · Rota /dashboard/visao-geral (2 afirmações nos docs)

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Rota registrada em AppRoutes.tsx com acesso "autenticado", GET em produção 200. Status no doc: OK| Rota /dashboard/visao-geral testada no smoke Playwright (HTTP 200, 0 erros reais).
- **Fontes:** `docs/prod-readiness.md:75`, `docs/reports/QA_ONDA_L_FINAL.md:46-46`
- **O que falta:** rota /dashboard/visao-geral não existe em src/routes/AppRoutes.tsx (rotas.json)
- **Evidência:** rota /dashboard/visao-geral não existe em src/routes/AppRoutes.tsx (rotas.json)| CONTESTADO pelo cético (IMPLEMENTADO): AppRoutes.tsx:249-250 '/' → <Navigate to="/dashboard/visao-geral"/>; :253 <Route path="/dashboard/:section" element={<Index/>}/> dentro de ProtectedRoute (:241); src/pages/Index.tsx:114,135 aceita section==='visao-geral'; menu sidebarMenuData.ts:246 'Visão Geral' url '/dashboard/visao-geral'; CommandPalette.tsx:138.
- **Revisão:** em disputa. O cético propõe Implementado e o juiz ainda não decidiu.

### F3391 · Rota /relatorios/builder

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Citada no doc de reporting; não existe.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:224`
- **O que falta:** Rota /relatorios/builder não existe; atualizar doc para /relatorios-custom ou criar redirect.
- **Evidência:** rota /relatorios/builder não existe em src/routes/AppRoutes.tsx (rotas.json)| cético: ausente: grep -rn "relatorios/builder" src → 0 resultados. Builder real é /relatorios-custom (AppRoutes.tsx:666).

### F3392 · Rota /relatorios/funnel

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Não existe.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:224`
- **O que falta:** Rota /relatorios/funnel não existe; atualizar doc para /relatorios/funil ou criar redirect.
- **Evidência:** rota /relatorios/funnel não existe em src/routes/AppRoutes.tsx (rotas.json)| cético: ausente: grep -rn "relatorios/funnel" src → 0 resultados. Rota real é /relatorios/funil (AppRoutes.tsx:735; menu sidebarMenuData.ts:269).

### F3395 · Rota /scheduled-reports (2 afirmações nos docs)

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Não existe.| Existe /scheduled-reports; falta robustez.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:224`, `docs/GAPS_CLASSE_MUNDIAL.md:176`
- **O que falta:** rota /scheduled-reports não existe em src/routes/AppRoutes.tsx (rotas.json)
- **Evidência:** rota /scheduled-reports não existe em src/routes/AppRoutes.tsx (rotas.json)| CONTESTADO pelo cético (PARCIAL): /scheduled-reports não existe, mas a funcionalidade existe sob /relatorios-agendados: AppRoutes.tsx:659 <Manager><ScheduledReports/></Manager> (src/pages/ScheduledReports.tsx), menu sidebarMenuData.ts:290; tabelas scheduled_reports e scheduled_report_runs com RLS sim; cron.md:51 job 88 'scheduled-reports-runner-hourly' chama trigger_internal_edge_job('scheduled-reports-runner'). Porém scheduled-reports-runner NÃO está na allowlist deploy.yml:144 (o 'succeeded' em cron-runs.md:394-400 só indica o SQL disparado, não a edge).
- **Revisão:** em disputa. O cético propõe Parcial e o juiz ainda não decidiu.

### F0608 · Subscription management (MRR/ARR)

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Falta gestão de assinaturas e MRR/ARR.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:111`
- **O que falta:** Tabela subscriptions com RLS/updated_at, cálculo de MRR/ARR, página com rota e menu (e corrigir o rótulo 'ARR' que mostra total_revenue).
- **Evidência:** ausente: tabela `subscriptions` não existe (`grep -E '\\|[public\.subscriptions\]' contexto/supabase/tables.md` → 0; só push_subscriptions e winloss_webhook_subscriptions); `grep -rln -E '\bMRR\b\|\bARR\b' src` → apenas rótulos (src/pages/Orcamentos.tsx:323 opção 'SaaS / Recorrente (MRR)'; CustomerSuccessHub.tsx:287 texto 'ARR:'), sem cálculo nem relatório. \| cético: Confirmado: não há tabela de assinaturas (tables.md só tem push_subscriptions, winloss_webhook_subscriptions, renewals e client_renewals; renewals é renovação de contrato, sem MRR). `grep -rln -iE '\bmrr\b\|recurring_revenue' src supabase/functions` → só src/pages/Orcamentos.tsx (rótulo). Em src/components/customer-success/CustomerSuccessHub.tsx:287-289 o rótulo 'ARR' exibe total_revenue, sem cálculo de recorrência.

### F3396 · Helper órfão biGestorHelpers

- **Tipo:** Service/lib
- **O que os docs afirmam:** biGestorHelpers: funções para BI Gestor não utilizadas; arquivo de lógica pura nunca importado (ou quase).
- **Fontes:** `docs/FUNCIONALIDADES_SEM_UI.md:114`
- **O que falta:** arquivo biGestorHelpers ausente em src/
- **Evidência:** arquivo biGestorHelpers ausente em src/| CONTESTADO pelo cético (REMOVIDO_INTENCIONALMENTE): ausente: find src -iname '_biGestorHelpers_' → 0. Commit cd2f4af73 apaga somente src/hooks/biGestorHelpers.ts (140 linhas) e biVendedorHelpers.ts — remoção deliberada dos helpers listados como 'não utilizadas' em docs/FUNCIONALIDADES_SEM_UI.md:114.
- **Revisão:** em disputa. O cético propõe Removido de propósito e o juiz ainda não decidiu.

### F3397 · Helper órfão biVendedorHelpers

- **Tipo:** Service/lib
- **O que os docs afirmam:** biVendedorHelpers: funções para BI Vendedor não utilizadas; arquivo de lógica pura nunca importado (ou quase).
- **Fontes:** `docs/FUNCIONALIDADES_SEM_UI.md:115`
- **O que falta:** arquivo biVendedorHelpers ausente em src/
- **Evidência:** arquivo biVendedorHelpers ausente em src/| CONTESTADO pelo cético (REMOVIDO_INTENCIONALMENTE): ausente: find src -iname '_biVendedorHelpers_' → 0. Commit cd2f4af73 apaga somente src/hooks/biGestorHelpers.ts e src/hooks/biVendedorHelpers.ts (102 linhas) — remoção deliberada do órfão listado em docs/FUNCIONALIDADES_SEM_UI.md:115.
- **Revisão:** em disputa. O cético propõe Removido de propósito e o juiz ainda não decidiu.

### F3399 · Utilitário src/utils/gamificationExport.ts

- **Tipo:** Service/lib
- **O que os docs afirmam:** Doc lista o utilitário `gamificationExport.ts` — exportação de dados de gamificação.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:1525-1532`
- **O que falta:** arquivo gamificationExport ausente em src/
- **Evidência:** arquivo gamificationExport ausente em src/| CONTESTADO pelo cético (REMOVIDO_INTENCIONALMENTE): ausente: find src -iname '_gamificationExport_' → 0; grep GamificationExport src → 0. Commit c2a66d92b 'Refactored codebase cleanup' (5 arquivos, 992 deleções, 0 adições) apaga src/utils/gamificationExport.ts junto com GamificationExportButton.tsx. Doc docs/DOCUMENTACAO_SISTEMA.md:1530 está desatualizado.
- **Revisão:** em disputa. O cético propõe Removido de propósito e o juiz ainda não decidiu.

### F3400 · Utilitário src/utils/performanceExport.ts

- **Tipo:** Service/lib
- **O que os docs afirmam:** Doc lista o utilitário `performanceExport.ts` — exportação de dados de performance.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:1525-1532`
- **O que falta:** arquivo performanceExport ausente em src/
- **Evidência:** arquivo performanceExport ausente em src/| CONTESTADO pelo cético (REMOVIDO_INTENCIONALMENTE): ausente: find src -iname '_performanceExport_' → 0. Commit 42fbf7472 (14 arquivos, 1779 deleções, 0 adições — limpeza pura) apaga src/utils/performanceExport.ts. Doc docs/DOCUMENTACAO_SISTEMA.md:1531 desatualizado.
- **Revisão:** em disputa. O cético propõe Removido de propósito e o juiz ainda não decidiu.

### F3401 · Cenários de forecast (forecast_snapshots.pessimistic_value, realistic_value, optimistic_value, actual_realized_value, horizon_days)

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Colunas declaradas num segundo CREATE TABLE IF NOT EXISTS divergente (mig/20260511191606:2) que virou no-op; não existem em types.ts. Feature de cenário "implementada" só no papel.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/F_banco_dados.md:242,249,299`
- **O que falta:** ALTER TABLE forecast_snapshots ADD COLUMN para os 5 campos, regenerar types.ts e publicar snapshot-forecast gravando os cenários.
- **Evidência:** coluna pessimistic_value ausente em tables/public/forecast_snapshots.md (tabela existe)| cético: tables/public/forecast_snapshots.md (seção Colunas) lista só 13 colunas: id, period_start, period_end, owner_id, segment, forecast_amount, forecast_deals, weighted_amount, commit_amount, best_case_amount, source, snapshot_at, created_at — nenhuma de pessimistic_value/realistic_value/optimistic_value/actual_realized_value/horizon_days; ausente: grep -rln pessimistic_value tables/public → 0. Além disso snapshot-forecast está fora da allowlist deploy.yml:144.

### F3402 · Migration 20261013152000_fix_kpis_auditoria_top25 aplicada com backfill de 1.344 linhas

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Correção de KPIs de auditoria top25 aplicada; preencheu 1.344 linhas de histórico marcadas is_backfilled.
- **Fontes:** `docs/execucao/catchup-migrations-2026-10-20/README.md:168`
- **O que falta:** tabela/view "is_backfilled" ausente do banco real (tables.md, views.md)
- **Evidência:** tabela/view "is_backfilled" ausente do banco real (tables.md, views.md)| CONTESTADO pelo cético (IMPLEMENTADO): Arquivo supabase/migrations/20261013152000_fix_kpis_auditoria_top25.sql existe (:322 'ADD COLUMN IF NOT EXISTS is_backfilled', :325,:338 INSERT ... is_backfilled); versão no ledger supabase/migrations.md:655; coluna existe no banco real: tables/public/deal_stage_history.md:24 '\| 6 \| is_backfilled \| boolean \| não \| false \|' (RLS sim, :7). A pré-checagem procurou 'is_backfilled' como tabela, erro.
- **Revisão:** em disputa. O cético propõe Implementado e o juiz ainda não decidiu.

### F0619 · Dívida: teste para useMonthlySalesBenchmark.ts

- **Tipo:** Teste
- **O que os docs afirmam:** Hook adicionado pela PR #209 sem teste (+19 linhas).
- **Fontes:** `docs/estado/15_PLANO_COBERTURA_MODULOS.md:57,61`
- **O que falta:** Criar src/hooks/reports/useMonthlySalesBenchmark.test.tsx (mock de supabase.rpc('get_monthly_sales_benchmark'): sucesso, erro, data null).
- **Evidência:** Hook existe: src/hooks/reports/useMonthlySalesBenchmark.ts:8-19 (19 linhas, useQuery sobre RPC get_monthly_sales_benchmark), usado por src/pages/HistoricalBenchmark.tsx. Teste ausente: `find src tests -name '*useMonthlySalesBenchmark*'` → só o hook; `grep -rln useMonthlySalesBenchmark src tests` → src/hooks/reports/useMonthlySalesBenchmark.ts e src/pages/HistoricalBenchmark.tsx (nenhum _.test._). Dívida registrada em docs/estado/15_PLANO_COBERTURA_MODULOS.md:57.| cético: Hook existe (src/hooks/reports/useMonthlySalesBenchmark.ts), usado por src/pages/HistoricalBenchmark.tsx (rota /benchmarking em src/routes/AppRoutes.tsx:760). Teste ausente: `grep -rln useMonthlySalesBenchmark src tests e2e supabase` → só o hook e a página; `ls src/hooks/reports` → nenhum useMonthlySalesBenchmark.test.*.

### F0623 · Teste de useMonthlySalesBenchmark

- **Tipo:** Teste
- **O que os docs afirmam:** A.12 P: sem arquivo de teste.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:441`
- **O que falta:** Criar src/hooks/reports/useMonthlySalesBenchmark.test.tsx cobrindo sucesso/erro/null da RPC get_monthly_sales_benchmark.
- **Evidência:** Mesmo artefato de F0619: src/hooks/reports/useMonthlySalesBenchmark.ts:8-19 existe; nenhum arquivo de teste — `find src tests -name '*useMonthlySalesBenchmark*'` retorna só o hook; `ls src/hooks/reports/` = salesReportHelpers(.test).ts, useMarkupMinSamplePreference(.test).tsx, useMonthlySalesBenchmark.ts, useSalesReport.ts. Pendência registrada em docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:441.| cético: Mesmo artefato de F0619: `grep -rln useMonthlySalesBenchmark src tests e2e supabase` → src/hooks/reports/useMonthlySalesBenchmark.ts e src/pages/HistoricalBenchmark.tsx apenas; nenhum arquivo de teste.

## Parcial (87)

### F0539 · Ação "Gerenciar Widgets → Relatório Customizado → Adicionar"

- **Tipo:** Ação/botão
- **O que os docs afirmam:** Fluxo de UI em /dashboard-custom: botão Gerenciar Widgets, opção Relatório Customizado, botão Adicionar, depois salvar layout.
- **Fontes:** `docs/REPORTING_BI_COMPLETE.md:60-64`
- **O que falta:** Incluir report-builder-execute na allowlist ACTIVE de .github/workflows/deploy.yml:144 (respeitando o teto de 100) ou mover a execução para uma function deployada.
- **Evidência:** UI confere: src/components/dashboard/CustomizableDashboard.tsx:105 'Gerenciar Widgets', :151 'Adicionar', :205 abre editor quando custom_report, :223 saveLayout.mutate, :284 'Salvar Layout'; src/hooks/dashboard/useDashboardLayout.ts:107-108 custom_report/'Relatório Customizado', :220 upsert em dashboard_layouts. Mas o widget executa via src/components/dashboard/widgets/CustomReportWidget.tsx:22-26 → src/hooks/reporting/useReportExecution.ts:33 supabase.functions.invoke('report-builder-execute'), e essa function está fora da allowlist ACTIVE: sed -n 144p .github/workflows/deploy.yml| sed 's/\n/\n/g' \| grep -c report-builder → 0 (existe só em supabase/functions/report-builder-execute). Em produção o widget adicionado cai em erro.
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Implementado.

### F0540 · AdminComercial: botões "Filtrar" e "Exportar"

- **Tipo:** Ação/botão
- **O que os docs afirmam:** Doc: botões sem ação.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/D_frontend.md:137-137`
- **O que falta:** Dar handler aos botões Filtrar (filtros aplicados à query do histórico) e Exportar (CSV/XLSX via src/lib/excelExporter.ts) em AdminComercial.tsx:717-730.
- **Evidência:** src/pages/admin/AdminComercial.tsx:717-731: dois <Button> com rótulos "Filtrar" (:722) e "Exportar" (:729) sem onClick nem handler; rota existe em src/routes/AppRoutes.tsx:1021 (/admin/comercial). Pendência do doc confirmada.| cético: Confirmado: src/pages/admin/AdminComercial.tsx:717-723 <Button> "Filtrar" e :724-730 <Button> "Exportar", nenhum dos dois com onClick ou handler. A rota /admin/comercial existe (AppRoutes.tsx:1021).

### F0542 · Botão Export Dossiê PDF

- **Tipo:** Ação/botão
- **O que os docs afirmam:** ExportDossierButton via useBIDossierExport.ts → dossierPdfGenerator.ts; exporta incluindo blocos mockados.
- **Fontes:** `docs/estado/04_DOMINIO_ANALYTICS_BI.md:178`
- **O que falta:** Calcular a métrica do cliente em useClientVsIndustry.ts:39 e remover o fallback :46-75. Preencher recency e lastOrders em useClientBI.ts:43,48. Trocar ou rotular as recomendações estáticas de industryRecommendations.ts antes de colocá-las no PDF.
- **Evidência:** Fio existe: src/pages/BusinessIntelligencePage.tsx:17,101 monta ExportDossierButton; src/hooks/bi/useBIDossierExport.ts:19-28 chama generateDossierPDF com comparisonData/trendsData; rota /ferramentas/bi AppRoutes.tsx:719. src/lib/bi/mockData.ts removido (git ls-tree HEAD → ausente; importadores → 0). Porém o PDF ainda recebe valores cravados: src/hooks/bi/useClientVsIndustry.ts:39 `client: 85, // Mock` e :47-73 bloco fixo (85/12.4/4.2/92 com insights textuais fixos); src/hooks/bi/useClientBI.ts:43 `recency: 0`, :48 `lastOrders: []`.| cético: Confirmado e com mais dado fixo do que o apontado. src/hooks/bi/useBIDossierExport.ts:17-26 passa bi.customer360, comparisonData e bi.expertCurated para generateDossierPDF. Valores cravados que entram no PDF: src/hooks/bi/useClientVsIndustry.ts:39 `client: 85, // Mock` e :46-75 com 4 métricas e insights fixos; src/hooks/bi/useClientBI.ts:43 `recency…

### F0543 · Botão Snapshot de forecast (snapshot-forecast)

- **Tipo:** Ação/botão
- **O que os docs afirmam:** Botão em ForecastAccuracySummary.tsx:45 via useSnapshotForecast (:124) invoca snapshot-forecast; forecast_snapshots tem 6 linhas de seed manual (created_at idêntico), sem cron.
- **Fontes:** `docs/estado/04_DOMINIO_ANALYTICS_BI.md:126`
- **O que falta:** Colocar snapshot-forecast na allowlist de deploy.yml:144 (ou mover a lógica para uma function deployada) e, se o forecast precisar ser periódico, criar job pg_cron.
- **Evidência:** Botão: src/components/revenue-intelligence/forecast/ForecastAccuracySummary.tsx:45-49 → snapshot.mutate; hook src/hooks/revenue-intelligence/useForecastAccuracy.ts:118 invoke('snapshot-forecast'); pasta supabase/functions/snapshot-forecast/index.ts existe (:94 insere em forecast_snapshots). Montado em RevenueIntelligenceHub.tsx:192 (aba forecast-accuracy), rota /revenue-intelligence AppRoutes.tsx:356. MAS fora da allowlist: grep -cx snapshot-forecast na lista ACTIVE de .github/workflows/deploy.yml:144 → 0; docs/agentes/veredicto-branches-vivas-261117.md:71-75 lista snapshot-forecast entre as functions que retornam 404 em prod. Sem cron: cron.md só tem capture-rollback-snapshot (:17-18). Banco: forecast_snapshots 6 linhas (stats.md:91), RLS sim 3 policies.| cético: Confirmado: snapshot-forecast está fora da allowlist ACTIVE (.github/workflows/deploy.yml:144: grep -cx snapshot-forecast → …

### F0545 · Botões/comandos sem handler real em PricingIntelligenceHub

- **Tipo:** Ação/botão
- **O que os docs afirmam:** A auditoria confirmou botões/comandos visíveis sem handler real no módulo PricingIntelligenceHub.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:234-234`
- **O que falta:** Dar ação real ou ocultar/marcar 'em breve' os 4 botões em PricingHeader.tsx:60, PricingHealthBanner.tsx:68, ProductRecommenderCard.tsx:99 e TopDiscountersCard.tsx:101.
- **Evidência:** Montado via src/pages/PricingIntelligenceHub.tsx:16 → src/components/pricing/PricingIntelligenceHub.tsx. Quatro botões visíveis sem onClick/handler: src/components/pricing/PricingHeader.tsx:60-66 (ícone Zap), PricingHealthBanner.tsx:68-70 "EXPORTAR AUDITORIA", ProductRecommenderCard.tsx:99-104 "Exportar Sugestões de Tabela de Preço", TopDiscountersCard.tsx:101-106 "Ver Ranking Completo de Erosão". Com handler: MarginAlertsCard.tsx (1/1), RevenueLeakageCard.tsx:148-153 Link para /vendas?markup=critical.| cético: Confirmado, com os 4 botões sem onClick montados no hub: src/components/pricing/PricingHeader.tsx:60-66 (ícone Zap), PricingHealthBanner.tsx:68-70 'EXPORTAR AUDITORIA', ProductRecommenderCard.tsx:99-104 'Exportar Sugestões de Tabela de Preço', TopDiscountersCard.tsx:101-106 'Ver Ranking Completo de Erosão'. Todos são renderizados em src/components/pricing/PricingIntelligenceHub.t…

### F0546 · Botões/comandos sem handler real em StrategicRecommendations

- **Tipo:** Ação/botão
- **O que os docs afirmam:** A auditoria confirmou botões/comandos visíveis sem handler real no módulo StrategicRecommendations.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:234-234`
- **O que falta:** Remover ou marcar 'em breve' os cards fixos de StrategicRecommendations.tsx:8-27/44-70.
- **Evidência:** src/components/intelligence/StrategicRecommendations.tsx: único <Button> :118-121 tem handler real navigate('/atividades'); recomendações vêm de useLatestBriefing (:31-34, dado real) com estado vazio (:81-86). Porém :8-26 `intelligenceFeatures` é array hardcoded ("Market Signals", "Lead Enrichment", "Visitor ID", badges Enterprise/AI Powered/Real-time) renderizado em :44-72 como cards de features inexistentes no sistema. Montado em IntelligenceCockpit.tsx:348 → src/pages/Intelligence.tsx:17 → rota /inteligencia AppRoutes.tsx:716.| cético: Confirmado: src/components/intelligence/StrategicRecommendations.tsx:118-121 é o único <Button>, com navigate('/atividades') (rota em AppRoutes.tsx:281), e as recomendações vêm de useLatestBriefing (executive_briefings). Porém :8-27 intelligenceFeatures é um array fixo ('Market Signals', 'Lead Enrichment', 'Visitor ID', com badges Enterprise/AI Powered…

### F0549 · Quick Actions (Pulse)

- **Tipo:** Ação/botão
- **O que os docs afirmam:** QuickActionsPanel.tsx:8 via useQuickAction.ts:19 invoca edge functions reais (recompute health, revenue-forecast-ai).
- **Fontes:** `docs/estado/04_DOMINIO_ANALYTICS_BI.md:144`
- **O que falta:** Colocar generate-revenue-forecast na allowlist de deploy.yml:144 ou apontar useQuickAction.ts:26 para uma function deployada que escreva revenue_forecasts.
- **Evidência:** src/components/pipeline-pulse/QuickActionsPanel.tsx:17-35 define 4 ações; :43 useQuickAction. src/hooks/pipeline-pulse/useQuickAction.ts:15-33 mapeia para calculate-deal-health, dialer-queue-builder, generate-revenue-forecast, analyze-conversation; :58 supabase.functions.invoke. Montado em RevenueIntelligenceHub.tsx:189 (aba 'comando'), rota /revenue-intelligence AppRoutes.tsx:356. Allowlist deploy.yml:144: calculate-deal-health=1, dialer-queue-builder=1, analyze-conversation=1, generate-revenue-forecast=0 (pasta existe, não deployada; também listada em docs/agentes/veredicto-branches-vivas-261117.md:120). A ação 'refresh-forecast' falha em produção.| cético: Confirmado: src/hooks/pipeline-pulse/useQuickAction.ts:23-29 'refresh-forecast' → fn 'generate-revenue-forecast', que está fora da allowlist (.github/workflows/deploy.yml:144: grep -cx generate-revenue-forecast → 0). As outras 3 aç…

### F0550 · Rota /relatorios — exportação PDF/CSV/Excel

- **Tipo:** Ação/botão
- **O que os docs afirmam:** Relatórios gerais com botões de exportação em 3 formatos.
- **Fontes:** `docs/FUNCIONALIDADES_COMPLETAS.md:294-294`
- **O que falta:** Adicionar exportação PDF e Excel em Relatorios.tsx ou corrigir o doc para 'só CSV'.
- **Evidência:** Rota: src/routes/AppRoutes.tsx:615 /relatorios → src/pages/Relatorios.tsx. reportsData :34-43 lista 3 relatórios, todos `formato: 'CSV'`; único botão "Baixar" :284-300 chama downloadSalesReport/downloadClientsReport/downloadProductsReport (src/utils/reportDownload.ts:119-120,147-148 → text/csv). ausente: grep -i "pdf\\|excel\\|jspdf\\|exceljs" nos imports de Relatorios.tsx → 0 resultados. jspdf (package.json:125) e exceljs (:119) existem mas não são usados nesta rota.| cético: Confirmado: src/pages/Relatorios.tsx:35-40 os 3 relatórios têm formato 'CSV'. O único botão de download (:287-294) chama downloadSalesReport/downloadClientsReport/downloadProductsReport (CSV). Os imports (:1-31) não trazem jspdf nem excelExporter, e src/components/reports/ReportCharts.tsx não tem export.

### F3314 · Closing time analysis

- **Tipo:** Componente
- **O que os docs afirmam:** Análise de tempo de fechamento.
- **Fontes:** `docs/FEATURE_SUMMARY.md:30-30`
- **O que falta:** Trocar o fallback fixo de ClosingTimeChart.tsx:47-53 por estado vazio; calcular ciclo created_at→fechamento das vendas ganhas.
- **Evidência:** Existe como src/components/analytics/ClosingTimeChart.tsx:40, aba 'closing' em src/pages/Analytics.tsx:62,104 e rota /analytics/closing-time (src/routes/AppRoutes.tsx:575). Hook src/hooks/useClosingTime.ts:14-17 lê deal_stage_history (RLS sim). Mas ClosingTimeChart.tsx:47-53 devolve dados fixos inventados (Qualificação 5d/45 deals, Proposta 8d/32...) quando a consulta vem vazia, e o cálculo é média por estágio entered_at→exited_at, não created_at→closed_at de vendas ganhas.
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Não implementado.

### F3326 · Componente/tela DemandForecast (2 afirmações nos docs)

- **Tipo:** Componente
- **O que os docs afirmam:** Doc lista o componente `DemandForecast.tsx` — previsão de demanda.| DemandForecast.tsx:14 inline sobre demand_forecasts (0) com empty-state correto (:47-51).
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:617-644`, `docs/estado/04_DOMINIO_ANALYTICS_BI.md:204`
- **O que falta:** Adicionar /previsao-demanda ao menu em sidebarMenuData.ts; confirmar exibição com demand_forecasts populada (doc cita 0 linhas).
- **Evidência:** DemandForecast.tsx removido em 89aacaff8 (#285), mas a tela existe como src/components/analytics/DemandForecastDashboard.tsx:40 (useDemandForecast; estado vazio :237); src/hooks/useDemandForecast.ts:49 invoca demand-forecast (na allowlist deploy.yml:144) e :78 lê demand_forecasts (RLS sim, tables/public/demand_forecasts.md:7); montado em src/pages/PrevisaoDemanda.tsx:18, rota /previsao-demanda (AppRoutes.tsx:688). Sem menu: grep -n 'previsao' src/components/layout/sidebar/sidebarMenuData.ts → 0 resultados (só Breadcrumbs.tsx:71 e useMobileNavigation.ts:34).
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Não implementado.

### F0554 · Custom Reports/execução/cross-object/embed/tokens/email/Progressive Goals em uso

- **Tipo:** Componente
- **O que os docs afirmam:** PARCIAL (operacional): código presente; uso só via DB.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:145`
- **O que falta:** Deployar report-builder-execute (allowlist deploy.yml:144) e confirmar por query que há linhas em custom_reports e progressive_goals.
- **Evidência:** Código integrado: rotas AppRoutes.tsx:666 /relatorios-custom e :668 /relatorios-custom/:id, :222 /embed/report/:token; EmbedTokenManagerDialog montado em src/components/reporting/ReportBuilder.tsx; ProgressiveGoals montado em src/pages/ArenaCompetitiva.tsx; hooks src/hooks/reporting/useCustomReports.ts, useReportEmbedTokens.ts, src/hooks/useProgressiveGoals.ts:43,57 (progressive_goals). Banco real (stats.md): custom_reports 0 linhas (:265), report_embed_tokens 0 (:218), report_executions 0 (:314), report_schedules 0 (:315), progressive_goals 0 (:303); RLS sim em todas (tables.md:110,256,293-295). report-builder-execute fora da allowlist (docs/agentes/veredicto-branches-vivas-261117.md:72). Critério 'linhas reais em prod' não atendido.| cético: Confirmado: stats.md:265 custom_reports 0, :218 report_embed_tokens 0, :303 progressive_goals 0. report-builder-execute fora da allowlist (.githu…

### F0555 · DADO FICTÍCIO: src/lib/bi/mockData.ts:1-29 — MOCK_CLIENT_STATS e getMockIndustryTrends/getMockSeasonality

- **Tipo:** Componente
- **O que os docs afirmam:** LTV R$125.000, ticket R$2.450, produtos "MacBook Pro M3", "Dell XPS 15", "Monitor LG 34\" Curved", "Cadeira Herman Miller" e sazonalidade por Math.sin/Math.cos.
- **Fontes:** `docs/estado/01_FRONTEND_ROTAS.md:337-337`
- **O que falta:** Tirar os valores fixos de useClientVsIndustry.ts:39,46-75 e trocar ou rotular as recomendações estáticas de industryRecommendations.ts mostradas em /ferramentas/bi.
- **Evidência:** src/lib/bi/mockData.ts não existe em HEAD (git ls-tree HEAD src/lib/bi/mockData.ts → vazio; único commit no histórico é a criação d1016c625). ausente: grep -rn "mockData\\|MOCK_CLIENT_STATS\\|getMockIndustryTrends\\|getMockSeasonality" src → 0 resultados. Mas /ferramentas/bi (AppRoutes.tsx:719 → BusinessIntelligencePage.tsx:32 useClientVsIndustry) ainda exibe valores fixos: src/hooks/bi/useClientVsIndustry.ts:39 `client: 85, // Mock` e :47-73 fallback fixo. Segunda metade do critério ('só dados reais') não atendida.| cético: O arquivo foi removido de propósito no commit cc80002f7 ('Remove 8 módulos órfãos sem consumidor: ... bi/mockData'; diff: src/lib/bi/mockData.ts \| 30 --). grep -rn 'MOCK_CLIENT_STATS\|getMockIndustryTrends\|getMockSeasonality\|bi/mockData' src → 0 resultados. Mas /ferramentas/bi ainda mostra dado fixo: src/hooks/bi/useClientVsIndustry.ts:39 `client: 85, // Mock` e …

### F0556 · DADO FICTÍCIO: useClientBI.ts:27,39,40,45 ticket médio/recência/últimos pedidos caem no mock

- **Tipo:** Componente
- **O que os docs afirmam:** KPIs de cliente usam MOCK_CLIENT_STATS como fallback.
- **Fontes:** `docs/estado/01_FRONTEND_ROTAS.md:340-340`
- **O que falta:** Calcular recency e lastOrders a partir de sales em useClientBI.ts:43,48 e derivar confidence em :54.
- **Evidência:** src/hooks/bi/useClientBI.ts sem fallback para mock: :14-15 rpc get_client_top_products / get_client_seasonality (existem no banco real: functions.md:216-217); ltv :32-35, avgTicket :36-42 e orderCount :44-47 calculados de dados reais. Porém :43 `recency: 0` e :48 `lastOrders: []` continuam cravados (recência e últimos pedidos nunca refletem dados); :54 `confidence: 90` fixo.| cético: Confirmado: src/hooks/bi/useClientBI.ts não tem fallback para mock (ltv :32-35 e avgTicket :36-42 vêm de RPC real). Porém :43 `recency: 0`, :48 `lastOrders: []` e :54 `confidence: 90` são fixos, e orderCount :44-47 soma quotes_count (orçamentos, não pedidos).

### F0557 · DADO FICTÍCIO: useClientVsIndustry.ts:39 client: 85, // Mock

- **Tipo:** Componente
- **O que os docs afirmam:** Benchmark "cliente vs setor" com lado do cliente cravado em 85.
- **Fontes:** `docs/estado/01_FRONTEND_ROTAS.md:341-341`
- **O que falta:** Calcular o valor do cliente a partir de sales em useClientVsIndustry.ts:39 e retornar [] em vez do bloco fixo :46-75.
- **Evidência:** Defeito ainda presente: src/hooks/bi/useClientVsIndustry.ts:39 `client: 85, // Mock client value for now as we don't have a specific client metric RPC yet` aplicado a todo benchmark real retornado por get_industry_benchmark_stats (:27-31; função existe, functions.md:227); :47-73 fallback com 4 métricas inteiramente fixas (85/72, 12.4/10.8, 4.2/3.5, 92/88) e insights textuais fixos. Consumido por BusinessIntelligencePage.tsx:32 (/ferramentas/bi) e pelo dossiê PDF.| cético: Confirmado: src/hooks/bi/useClientVsIndustry.ts:39 `client: 85, // Mock client value for now ...` e :46-75 fallback com 4 métricas e insights fixos.

### F0560 · Dashboard drag-and-drop

- **Tipo:** Componente
- **O que os docs afirmam:** Parcial.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:223`
- **O que falta:** Reaproveitar o padrão de DashboardLayoutEditor.tsx (@dnd-kit/sortable) em CustomizableDashboard.tsx, atualizando x/y/w/h antes do saveLayout.
- **Evidência:** Persistência existe (src/hooks/dashboard/useDashboardLayout.ts:220 upsert dashboard_layouts; tables.md:116 RLS sim), mas não há drag-and-drop: src/components/dashboard/CustomizableDashboard.tsx:21 importa só ícones; ausente: grep -n "dnd-kit\\|react-grid-layout\\|onDragEnd\\|draggable\\|GridLayout" src/components/dashboard/CustomizableDashboard.tsx → 0 resultados; widgets só adicionados/ocultados (Switch :135) com posição fixa `y: currentLayout.length` (:195-200). @dnd-kit está em package.json:71-73 mas não é usado aqui. Banco: dashboard_layouts 0 linhas (stats.md:361). docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:223 'parcial' continua válido.| cético: Mantido. A fonte B (docs/auditoria/funcionalidades-pendentes-2026-10-12/B*.md:89) restringe o item ao 'Dashboard builder' (CustomizableDashboard.tsx sem @dnd-kit), e isso se confirma (handleAddWidget :195-200 com posição…

### F0561 · DashboardNLQWidget funcional (nlq-query compila)

- **Tipo:** Componente
- **O que os docs afirmam:** JÁ RESOLVIDO.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:130`
- **O que falta:** Colocar nlq-query na allowlist de deploy.yml:144 e confirmar o deploy.
- **Evidência:** Widget montado: src/components/nlq/DashboardNLQWidget.tsx → src/components/dashboard/modules/AnalyticsModule.tsx:1,15 → src/pages/Index.tsx:62-64. Hook src/hooks/nlq/useNLQ.ts:53 invoke('nlq-query'); pasta supabase/functions/nlq-query/index.ts existe (699 linhas, codigo/edge-functions.json). MAS fora da allowlist: grep -cx nlq-query na lista ACTIVE (deploy.yml:144) → 0; docs/agentes/veredicto-branches-vivas-261117.md:71 lista nlq-query entre as functions que devolvem 404 em produção. 'Compila' no repo, mas não responde em prod.| cético: Confirmado: nlq-query fora da allowlist ACTIVE (.github/workflows/deploy.yml:144: grep -cx nlq-query → 0). O widget chama invoke('nlq-query') (src/hooks/nlq/useNLQ.ts:53) e falha em produção.

### F0562 · Deal Health / Risk Signals

- **Tipo:** Componente
- **O que os docs afirmam:** Aba deal-health via useRevenueIntelligence.ts:35,61 lê deal_health_scores (900) e deal_risk_signals (0).
- **Fontes:** `docs/estado/04_DOMINIO_ANALYTICS_BI.md:138`
- **O que falta:** Criar produtor de deal_risk_signals (ex.: calculate-deal-health ou detect-at-risk-deals, ambas na allowlist) e exibir os sinais no DealHealthHub.
- **Evidência:** Aba: src/components/revenue-intelligence/RevenueIntelligenceHub.tsx:162 TabsTrigger 'deal-health', :202-203 DealHealthHub; src/hooks/deal-intelligence/useDealHealth.ts:54,99 deal_health_scores, :120 deal_health_history (banco: deal_health_scores ~900 linhas stats.md:34, RLS sim 4 policies). Risk signals: deal_risk_signals 0 linhas (stats.md:191), RLS sim 3 policies (policies.md:305-307); ausente: grep -rln deal_risk_signals src (fora types.ts) → 0; grep -rl deal_risk_signals supabase/functions → 0; snapshot functions/*.sql → 0 — tabela sem produtor e sem leitor. src/hooks/revenue/useRevenueIntelligence.ts citado no doc não existe (find → 0). Cron deal-risk-digest-daily (cron.md:22) chama deal-risk-digest que lê deal_health_scores (index.ts:130), não gera sinais.| cético: Confirmado: grep -rln deal_risk_signals src supabase/functions (fora de types.ts) → 0 resultados; nos SQL do snapshot…

### F0563 · Etapa canônica 26/08 nº 65: Completar BI, SDR e pricing (fontes/provenance ou modo demo)

- **Tipo:** Componente
- **O que os docs afirmam:** Etapa canônica 65 (plano 26/08, matriz de status 30/08, estado 🔶): cada card informa fonte e timestamp.
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:215-215`
- **O que falta:** Rodapé padrão fonte + timestamp em src/components/bi/BIMetricCard.tsx, src/components/pricing/PricingKpiCard.tsx (e demais cards de pricing) e nos outros cards do SDR, alimentado por calculated_at/updated_at dos hooks.
- **Evidência:** Existe artefato parcial: src/components/sdr/LeadScoreBreakdown.tsx:66 lê calculated_at de lead_scores e :159-161 exibe 'Score calculado em dd/MM/yyyy às HH:mm pelo motor de lead-scoring' (fonte + timestamp). Em BI e pricing não há: grep -rlniE 'freshness\|DataSource\|LastUpdated\|Fonte:\|provenance\|calculated_at\|generated_at\|updated_at' src/components/bi src/components/pricing → 0 resultados. Modo demo: grep -rln 'isDemo\|demoMode\|DEMO_MODE' src → 0.
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Não implementado.

### F0564 · Painel de sinais de risco com resolução manual

- **Tipo:** Componente
- **O que os docs afirmam:** Painel de sinais de risco com ação de resolver manualmente.
- **Fontes:** `docs/FUNCIONALIDADES_SISTEMA.md:574-574`
- **O que falta:** Hook com mutation update({resolved_at, resolved_by}) sobre deal_risk_signals, painel com botão 'Resolver' montado (ex.: aba em RevenueIntelligenceHub.tsx) e produtor dos sinais (edge/cron).
- **Evidência:** Tabela existe no banco real com RLS (3 policies, incl. 'Owners resolve own signals' UPDATE) e colunas resolved_at/resolved_by: contexto/supabase/tables/public/deal_risk_signals.md:7-9,21-22. Porém nenhum consumidor: `grep -rn deal_risk_signals src supabase/functions` → só src/integrations/supabase/types.ts; codigo/banco.json 'deal_risk_signals' → usada_no_front 0, usada_em_edges [], nao_usada true. A página /revenue-intelligence (AppRoutes.tsx:356-359 → RevenueIntelligenceHub.tsx:156-175) não tem aba nem painel de sinais de risco; `grep -rn 'resolved_at' src| grep update` só acha approval_workflows, v4_callbacks, SLA (useSLATracking.ts:112). \| cético: Confirmado: tabela com resolved_at/resolved_by e RLS (contexto/supabase/tables/public/deal_risk_signals.md:7-9,27-28). `grep -rn deal_risk_signals src supabase/functions \| grep -v types.ts` → 0 resultados (os hits de 'risk_signals' em an…

### F3330 · Pipeline health metrics

- **Tipo:** Componente
- **O que os docs afirmam:** Métricas de saúde do pipeline em Analytics.
- **Fontes:** `docs/FEATURE_SUMMARY.md:28-28`
- **O que falta:** Se o critério 'aba do Analytics' valer, adicionar PipelineHealthScore como aba em src/pages/Analytics.tsx; hoje só aparece na tela de Pipeline.
- **Evidência:** Existe como src/components/pipeline/PipelineHealthScore.tsx:14, montado em src/pages/Pipeline.tsx:59 e src/components/pipeline/PipelineBoard.tsx:362; src/hooks/pipeline/usePipelineHealthScore.ts:9 lê revenue_forecast_view (sobre sales). Não está no Analytics: TAB_CONTENT de src/pages/Analytics.tsx:98-117 não tem PipelineHealth; ls src/components/analytics| grep -i health → só ClientHealthPanel.tsx.
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Não implementado.

### F0566 · Progressive Goals

- **Tipo:** Componente
- **O que os docs afirmam:** components/goals/* via useProgressiveGoals.ts:43 sobre progressive_goals (0).
- **Fontes:** `docs/estado/04_DOMINIO_ANALYTICS_BI.md:217`
- **O que falta:** Produtor das metas progressivas (trigger/cron chamando increment_goal_progress ou UI de criação); hoje a seção em /arena fica sempre vazia.
- **Evidência:** Hook src/hooks/useProgressiveGoals.ts:43,57 lê progressive_goals; componente src/components/competitive/ProgressiveGoals.tsx:8 usa o hook e está montado em src/pages/ArenaCompetitiva.tsx:329 (rota /arena, AppRoutes.tsx:807). Tabela existe com RLS/3 policies (contexto/supabase/tables/public/progressive_goals.md:7-9). Mas ninguém popula: contexto/supabase/stats.md:303 → 0 linhas; a única função que escreve é public.increment_goal_progress (contexto/supabase/functions/public/increment_goal_progress__1f7d7a062a40e6c8.sql) e `grep -rn increment_goal_progress src supabase/functions triggers.md cron.md` → só types.ts (sem chamador); ProgressiveGoals.tsx não tem insert/criação (`grep insert\|upsert\|Criar` → 0).| cético: Confirmado: src/hooks/useProgressiveGoals.ts:37-63 só faz SELECT (nenhum insert/update/rpc); `grep -rn 'progressive_goals\|increment_goal_progress' src supabase/functions` (sem…

### F0567 · Próximo passo: estado vazio honesto em lugar de mascaramento de zero

- **Tipo:** Componente
- **O que os docs afirmam:** Planejado: trocar "MAPE 0,0% Excelente" por empty state.
- **Fontes:** `docs/estado/ESTADO_ATUAL.md:305-306`
- **O que falta:** Colocar snapshot-forecast e compute-forecast-accuracy na allowlist de .github/workflows/deploy.yml:144 (ou agendar via pg_cron) e propagar isError de useForecastSummary com estado de erro em ForecastAccuracySummary.tsx.
- **Evidência:** O estado vazio existe: src/components/revenue-intelligence/forecast/ForecastAccuracySummary.tsx:57-69 ('Nenhuma amostra de precisão ainda' quando sample_size===0) e o MAPE só aparece com amostra (:71-77); sample_size = rows.length em src/hooks/revenue-intelligence/useForecastAccuracy.ts:105. Porém a saída que o empty state indica (:64-67, botões Snapshot/Calcular :42-54) invoca 'snapshot-forecast' (useForecastAccuracy.ts:118) e 'compute-forecast-accuracy' (useForecastAccuracy.ts:136), ambas fora da allowlist ACTIVE (.github/workflows/deploy.yml:144 → 0 ocorrências de cada) e sem cron (grep -n forecast contexto/supabase/cron.md → 0). forecast_accuracy tem 0 linhas (contexto/supabase/stats.md:279), então o vazio é permanente em produção. useForecastSummary (useForecastAccuracy.ts:73-78) expõe só isLoading, sem isError: erro de query aparece como 'Nenhuma amostra'.
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Implementado.

### F0569 · S-18 Dashboard mistura amostras e dados reais — separar modo demo

- **Tipo:** Componente
- **O que os docs afirmam:** Doc: fontes de analytics misturam dados de amostra com reais; separar demo de produção.
- **Fontes:** `docs/auditoria/SIMULACAO_CENARIOS_ONDA_0_2026-08-26.md:43`
- **O que falta:** Remover/condicionar DEFAULT_PREDICTIONS, o 'client: 85 // Mock' de useClientVsIndustry e os staticAlerts de IntelligenceAlerts; criar flag demo explícita se o modo demo for desejado.
- **Evidência:** Não existe flag/modo demo: `grep -rn 'VITE_DEMO\\|DEMO_MODE\\|isDemoMode\\|demo_mode' src .env.example` → 0; `ls scripts| grep -i demo` → 0. Mocks seguem misturados ao dado real em telas de produção: src/components/analytics/ChurnPredictionPanel.tsx:48-56 DEFAULT_PREDICTIONS ('Tech Solutions LTDA', risco 87) e :239 `externalPredictions \|\| DEFAULT_PREDICTIONS`, montado sem props em src/pages/Analytics.tsx:113,214 (rota /analytics, AppRoutes.tsx:559); src/hooks/bi/useClientVsIndustry.ts:39,49 `client: 85 // Mock` + array fixo de fallback, consumido por ClientVsIndustryComparison em src/pages/BusinessIntelligencePage.tsx; src/components/dashboard/modules/IntelligenceAlerts.tsx:25-32 staticAlerts fictícios, montado em PurchaseIntelligenceHub.tsx:152 (rota AppRoutes.tsx:701). Parte já saneada: ABC (#446/#568), Speedometer sem Math.random (`grep Math.random src/components/dashboard/Speedome…

### F0571 · UI useClosingTime: dashboard com benchmarks e alertas

- **Tipo:** Componente
- **O que os docs afirmam:** Falta dashboard com benchmarks e alertas para useClosingTime (UI atual: componente isolado).
- **Fontes:** `docs/FUNCIONALIDADES_SEM_UI.md:28`
- **O que falta:** Derivar benchmarks/alerta do retorno de useClosingTime, remover textos fixos (ClosingTimePage.tsx:12-17, :96-99) e tratar isError.
- **Evidência:** Página src/pages/ClosingTimePage.tsx existe, importa useClosingTime (:7,10) e ClosingTimeChart (:2) e está montada em /analytics/closing-time (AppRoutes.tsx:575-581, Manager). ClosingTimeChart.tsx:41,47,82-89 tem loading (Skeleton) e vazio (data.length===0); hook lê deal_stage_history (useClosingTime.ts:15). Porém os 'benchmarks' são array fixo com status hardcoded (ClosingTimePage.tsx:12-17: SDR 2d success, Qualificação 5d warning, Negociação 10d error) e o 'Alerta de Gargalo' é texto fixo ('Negociação está levando 40% a mais…', :88-100) sem derivar do dado; não há estado de erro na página.| cético: Confirmado e agravado: src/pages/ClosingTimePage.tsx:10 chama useClosingTime() e descarta o retorno; :12-17 benchmarks com status fixo; :96-99 'Alerta de Gargalo' com texto fixo ('Negociação ... 40% a mais'). Rota /analytics/closing-time sem entrada no menu (`grep closing-time sidebarMenuDa…

### F0572 · UI useDealVelocity: visão histórica + comparativo entre vendedores

- **Tipo:** Componente
- **O que os docs afirmam:** Falta visão histórica + comparativo entre vendedores para useDealVelocity (UI atual: widget único).
- **Fontes:** `docs/FUNCIONALIDADES_SEM_UI.md:29`
- **O que falta:** Passar o timeframe ao DealVelocityChart, calcular totalChange (período atual contra o anterior) e/ou uma série histórica por mês em useDealAnalyticsVelocity.ts, e opcionalmente criar entrada de menu para /analytics/deal-velocity.
- **Evidência:** O comparativo entre vendedores existe com loading/erro/vazio: src/pages/DealVelocityPage.tsx:20-35 e :89-118, na rota /analytics/deal-velocity (src/routes/AppRoutes.tsx:583). A visão histórica, porém, não está ligada: o seletor de período (DealVelocityPage.tsx:19, :64-78) só alimenta o comparativo; o gráfico principal é <DealVelocityChart /> sem props (DealVelocityPage.tsx:83) e chama useDealVelocity(salespersonId) com o timeframe padrão (src/components/analytics/DealVelocityChart.tsx:55). O hook não calcula série temporal nem variação: totalChange está declarado em src/hooks/deal-intelligence/useDealAnalyticsVelocity.ts:17 mas não aparece no retorno (:185-194), então o indicador histórico em DealVelocityChart.tsx:109-112,158 nunca é exibido (grep -rn totalChange src → só a interface e o chart). A rota não está no menu: grep deal-velocity src/components/layout/sidebar/sidebarMenuData.ts…
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Implementado.

### F0573 · Uma calibração de win-probability por tela

- **Tipo:** Componente
- **O que os docs afirmam:** Duas calibrações de win-probability na mesma tela.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:136`
- **O que falta:** Colocar calibrate-win-probability na allowlist (ou cron) para a calibração única ter dado.
- **Evidência:** Hoje há uma única calibração na tela: RevenueIntelligenceHub.tsx:29-31,169,233 monta só WinProbabilityCalibrationPanel (`grep -rn Calibrat src --include=*.tsx -l` fora da pasta calibration → só o Hub); a duplicata foi removida — `ls supabase/functions| grep -i calib` → só calibrate-win-probability; docs/agentes/mapa-do-sistema.md:42 registra remoção de calibrate-win-probabilities em 2026-11-07; useWinProbabilityCalibrator não existe. Porém a fonte única invoca 'calibrate-win-probability' (src/hooks/revenue/useWinProbabilityCalibration.ts:114-116) que NÃO está na allowlist (`grep calibrate` em deploy.yml:144 → 0), e as tabelas lidas (:53 win_probability_calibrations, :87 deal_probability_scores) têm 0 linhas (contexto/supabase/stats.md:234,269). \| cético: Confirmado: só WinProbabilityCalibrationPanel na tela (RevenueIntelligenceHub.tsx:170,232-234); a fonte invoca calibrate-win-probabil…

### F0574 · Widget custom_report no Dashboard Builder (/dashboard-custom)

- **Tipo:** Componente
- **O que os docs afirmam:** Widget "Relatório Customizado" disponível no dashboard customizável, selecionando um relatório do builder e ajustando altura.
- **Fontes:** `docs/REPORTING_BI_COMPLETE.md:19,46,60-64`
- **O que falta:** Colocar report-builder-execute na allowlist ACTIVE de .github/workflows/deploy.yml:144 (liberando uma vaga no limite de 100) e confirmar a execução real do relatório no widget.
- **Evidência:** Catálogo, editor e persistência existem: rota /dashboard-custom (src/routes/AppRoutes.tsx:258), tipo 'custom_report' em src/hooks/dashboard/useDashboardLayout.ts:107-108, persistência em dashboard_layouts (:194,:220), report_id e altura passados em src/components/dashboard/CustomizableDashboard.tsx:56-60, altura aplicada em src/components/dashboard/widgets/CustomReportWidget.tsx:86. O conteúdo, porém, vem de useReportExecution (CustomReportWidget.tsx:21-25), que chama supabase.functions.invoke('report-builder-execute') (src/hooks/reporting/useReportExecution.ts:33). Essa function existe em supabase/functions/report-builder-execute, mas está fora da allowlist ACTIVE (.github/workflows/deploy.yml:144 → 0 ocorrências). Em produção o widget cai em ReportPreview com execError (CustomReportWidget.tsx:87-91) e não renderiza o relatório.
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Implementado.

### F3333 · Agendamento (cron) scheduled-report-trigger (2 afirmações nos docs)

- **Tipo:** Agendamento (cron)
- **O que os docs afirmam:** scheduled-report-trigger é edge batch sem cron e sem auth de cron; roda só por invoke manual no front.| NÃO INICIADO: scheduled-reports-runner só chamado por scheduled-report-trigger, ambos sem cron.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/F_banco_dados.md:166`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:144`
- **O que falta:** Incluir scheduled-reports-runner (e o trigger, se ainda útil) na allowlist de deploy.yml:144 e confirmar respostas 200 em net._http_response e linhas em scheduled_report_runs.
- **Evidência:** Cron real para o runner: job 88 'scheduled-reports-runner-hourly' `10 * * * *` → trigger_internal_edge_job('scheduled-reports-runner') (cron.md:51), runs 'succeeded' em 20/11 (cron-runs.md:394-400, só prova o enfileiramento pg_net). Runner tem auth de cron (supabase/functions/scheduled-reports-runner/index.ts:4,207). Mas scheduled-reports-runner e scheduled-report-trigger estão fora da allowlist ACTIVE de .github/workflows/deploy.yml:144 (grep → 0), e o trigger não tem cron (só chamado por src/hooks/reporting/useTriggerScheduledReport.ts:10).
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Não implementado.

### F3339 · Rota /relatorios-agendados — entrega agendada por e-mail

- **Tipo:** Agendamento (cron)
- **O que os docs afirmam:** Relatórios enviados por e-mail em agenda.
- **Fontes:** `docs/FUNCIONALIDADES_COMPLETAS.md:298-298`
- **O que falta:** Implementar envio por e-mail aos recipients no runner (ex.: via send-transactional-email, que está na allowlist) e colocar scheduled-reports-runner na allowlist de deploy.yml:144.
- **Evidência:** Rota /relatorios-agendados (AppRoutes.tsx:659) e menu (sidebarMenuData.ts:290); scheduled_reports RLS sim (tables/public/scheduled_reports.md:7); cron 88 existe (cron.md:51). Mas o runner está fora da allowlist deploy.yml:144 e não envia e-mail: grep -ci 'resend\|send-transactional\|sendEmail\|mail' supabase/functions/scheduled-reports-runner/index.ts → 0; ele só gera arquivo, faz upload em 'report-snapshots' (:166-167) e grava scheduled_report_runs; recipients é lido (:233) e não usado.
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Não implementado.

### F3340 · Scheduled Reports: configuração de cron por agendamento

- **Tipo:** Agendamento (cron)
- **O que os docs afirmam:** Scheduled Reports robusto com expressão cron por agendamento.
- **Fontes:** `docs/REPORTING_BI_COMPLETE.md:17`
- **O que falta:** Colocar o runner na allowlist de deploy para rodar em produção; coluna cron_expression só se o negócio exigir agenda além de diário/semanal/mensal.
- **Evidência:** Agendamento por relatório existe sem cron_expression: colunas frequency/hour_of_day/day_of_week/day_of_month/next_run_at (tables/public/scheduled_reports.md:23-31, CHECK frequency daily\|weekly\|monthly :43); trigger trg_compute_next_run → compute_scheduled_report_next_run (triggers.md:314); UI define os campos em src/components/reporting/ScheduledReportFormDialog.tsx:42,84-87; runner filtra next_run_at (scheduled-reports-runner/index.ts:237) via cron 88 (cron.md:51). Porém runner fora da allowlist deploy.yml:144 e não há expressão cron livre (grep cron_expression scheduled_reports.md → 0).
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Não implementado.

### F0576 · Bucket report-snapshots usado pelo código e ausente no destino

- **Tipo:** Doc/config
- **O que os docs afirmam:** O código usa o bucket report-snapshots (snapshots de relatórios agendados), que não existe no destino.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:512-512`
- **O que falta:** Incluir scheduled-reports-runner na allowlist, definir retenção e testar upload/leitura por role.
- **Evidência:** A afirmação 'bucket ausente' não vale para o banco real: contexto/supabase/storage.md:11 lista report-snapshots (privado, 20 MB, MIME application/json,text/csv) e policies.md:1038 tem policy SELECT 'owner can read own report snapshots'. Código usa o bucket: src/hooks/reporting/useScheduledReportRuns.ts:26 (createSignedUrl) e supabase/functions/scheduled-reports-runner/index.ts:166 (upload). Porém o único escritor, scheduled-reports-runner, NÃO está na allowlist (`grep -i 'sched\|report' deploy.yml:144` → só report-embed-public), embora o cron job 88 'scheduled-reports-runner-hourly' exista (cron.md:51) e rode 'succeeded' (cron-runs.md:394-400 — sucesso do SELECT, não da função). Não há policy INSERT/retenção visível para o bucket.| cético: Confirmado: bucket existe no banco real (contexto/supabase/storage.md:11, privado 20 MB, application/json/text/csv) com policy SELECT (policies.md:10…

### F3341 · Edge function analyze-pipeline-coverage (11 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** NÃO INICIADO: grep em src/ = 0 (só comentário em 20261001220000:7).| analyze-pipeline-coverage usa meta inventada. \| Doc: sem chamador no front. \| Doc classifica como ÓRFÃ+PARCIAL. Chamador(es): nenhum. Sem chamador. Quota inventada max(fechado×1,2; R$50.000) em vez de sales_goals/salespeople.monthly_goal. LOVABLE_API_KEY. \| analyze-pipeline-coverage (229 linhas) sem chamador em src/, migrations ou cron; pipeline_coverage_snapshots 0. \| supabase/functions/analyze-pipeline-coverage existe no repo (citada em src/: não); sonda OPTIONS em produção: OPTIONS → 404 NOT_FOUND (não publicada; limite de 100 funções do plano). Status no doc: BLOQUEADO. \| Uma das 64/168 funções sem invocador liter…
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:131`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:121`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/D_frontend.md:125-125`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:48-48`, `docs/estado/04_DOMINIO_ANALYTICS_BI.md:237`, `docs/prod-readiness.md:274` e mais 5
- **O que falta:** Dar um chamador (UI ou cron), colocar na allowlist de deploy e popular pipeline_coverage_snapshots; ou registrar a decisão de remover.
- **Evidência:** supabase/functions/analyze-pipeline-coverage/index.ts existe; FORA da allowlist de deploy (.github/workflows/deploy.yml:144) → não roda em produção; ÓRFÃ: nenhum chamador no front, em edges ou em SQL/cron (edge-functions.json)| cético: supabase/functions/analyze-pipeline-coverage/index.ts existe e já lê a meta real de sales_goals (:117-121), então a reclamação de 'quota inventada' está desatualizada. Usa LOVABLE_API_KEY de forma opcional (:202-203). Está fora da allowlist de deploy.yml:144. Não tem chamador: grep 'analyze-pipeline-coverage' em src/, cron.md e functions.md (corpo) → 0 chamadores; a única menção é um comentário em predict-quota-attainment/index.ts:166.

### F3343 · Edge function calibrate-win-probability (11 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** NÃO INICIADO: ambos existem.| Doc: duas probabilidades calibradas diferentes para o mesmo deal; WinProbabilityCalibratorPanel e WinProbabilityCalibrationPanel na mesma tela. \| Catálogo API.md lista a edge function `calibrate-win-probability` na categoria "Ops / Outros" com auth "JWT do usuário (RLS) + papel admin/gestor · verify_jwt", método "só POST", payload "lookback_days, min_sample" e resposta "JSON {error, ok, calibrations_written, deal_scores_writte…". \| 180 linhas; chamador: FE src/hooks/revenue/useWinProbabilityCalibration.ts; verify_jwt true (default); tabelas tocadas (linhas em produção): deal_probability_scores(0), win_probability_calibrations(0). Classificação do doc: PARCIAL…
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:262`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:324-324`, `docs/API.md:232-232`, `docs/estado/10_EDGE_FUNCTIONS.md:335-335`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:64-64`, `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:283-283` e mais 5
- **O que falta:** Incluir na allowlist de deploy.yml:144 (ou consolidar com o par duplicado) para rodar em produção; tabelas win_probability_calibrations/deal_probability_scores seguem sem produtor.
- **Evidência:** supabase/functions/calibrate-win-probability/index.ts existe; FORA da allowlist de deploy (.github/workflows/deploy.yml:144) → não roda em produção; chamada por: src/hooks/revenue/useWinProbabilityCalibration.ts| cético: supabase/functions/calibrate-win-probability/index.ts existe; ausente da allowlist ACTIVE em .github/workflows/deploy.yml:144 (grep calibrate na linha 144 → 0); chamador src/hooks/revenue/useWinProbabilityCalibration.ts. Byte U+0001 citado nos docs já não existe (grep -cP '\x01' index.ts → 0).

### F3344 · Edge function compute-forecast-accuracy (6 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** Falta roll-up IA do forecast com explicação de variância.| Catálogo API.md lista a edge function `compute-forecast-accuracy` na categoria "IA / Forecast" com auth "JWT do usuário · verify_jwt", método "qualquer", payload "—" e resposta "JSON {error}". \| Chamada por useForecastAccuracy.ts:150 via botão; nunca produziu linha em forecast_accuracy. \| 167 linhas; chamador: FE src/hooks/revenue-intelligence/useForecastAccuracy.ts; verify_jwt true (default); tabelas tocadas (linhas em produção): forecast_accuracy(0), forecast_confidence_scores(0). Classificação do doc: PARCIAL. \| supabase/functions/compute-forecast-accuracy existe no repo (citada em src/: sim); sonda OPTIONS em produção: OPTION…
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:64`, `docs/API.md:166-166`, `docs/estado/04_DOMINIO_ANALYTICS_BI.md:404`, `docs/estado/10_EDGE_FUNCTIONS.md:345-345`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:74-74`, `docs/prod-readiness.md:299` e mais 1
- **O que falta:** Deploy (allowlist deploy.yml:144), agendamento via pg_cron e roll-up com explicação de variância.
- **Evidência:** supabase/functions/compute-forecast-accuracy/index.ts existe; FORA da allowlist de deploy (.github/workflows/deploy.yml:144) → não roda em produção; chamada por: src/hooks/revenue-intelligence/useForecastAccuracy.ts| cético: supabase/functions/compute-forecast-accuracy/index.ts existe; fora da allowlist deploy.yml:144; chamador src/hooks/revenue-intelligence/useForecastAccuracy.ts; nenhum cron em cron.md (grep forecast cron.md → 0).

### F3345 · Edge function generate-revenue-forecast (9 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** NÃO INICIADO.| Doc: AIForecastPanel × RevenueForecastHub/PredictiveRevenueForecast/quick action; dois forecasts com números diferentes. \| Catálogo API.md lista a edge function `generate-revenue-forecast` na categoria "IA / Forecast" com auth "Bearer manual · verify_jwt", método "qualquer", payload "period_type, period_start, owner_id" e resposta "JSON {error}". \| Chamada por useRevenueForecast.ts:109 (revenue-intelligence); manual; produziu 3 linhas. \| 281 linhas; chamador: FE src/hooks/revenue-intelligence/useRevenueForecast.ts; verify_jwt true (default); tabelas tocadas (linhas em produção): forecast_deal_contributions(0), revenue_forecasts(3). Classificação do doc: IMPLEMENTADO_TOTAL.…
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:266`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:329-329`, `docs/API.md:169-169`, `docs/estado/04_DOMINIO_ANALYTICS_BI.md:402`, `docs/estado/10_EDGE_FUNCTIONS.md:387-387`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:116-116` e mais 3
- **O que falta:** Deploy ou consolidação com revenue-forecast-ai em um forecast canônico.
- **Evidência:** supabase/functions/generate-revenue-forecast/index.ts existe; FORA da allowlist de deploy (.github/workflows/deploy.yml:144) → não roda em produção; chamada por: src/hooks/revenue-intelligence/useRevenueForecast.ts| cético: supabase/functions/generate-revenue-forecast/index.ts existe; fora da allowlist deploy.yml:144 (revenue-forecast-ai, a duplicata, está na allowlist); chamador src/hooks/revenue-intelligence/useRevenueForecast.ts.

### F3346 · Edge function predict-quota-attainment (8 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** Catálogo API.md lista a edge function `predict-quota-attainment` na categoria "IA / Forecast" com auth "nenhuma detectada no handler · verify_jwt", método "qualquer", payload "quota, p50, salespersonName, prob, risk, forecastId, period, salesperson_id" e resposta "JSON {predictions_count, error}".| 370 linhas; chamador: FE src/hooks/revenue/useQuotaAttainment.ts; verify_jwt true (default); tabelas tocadas (linhas em produção): quota_attainment_actions(0), quota_attainment_alerts(0), quota_attainment_forecasts(0). Classificação do doc: PARCIAL. \| Doc classifica como REAL. Chamador(es): FE hooks/revenue/useQuotaAttainment.ts:123. Monte Carlo com Math.random legítimo (index.ts:18-31); lê mont…
- **Fontes:** `docs/API.md:173-173`, `docs/estado/10_EDGE_FUNCTIONS.md:407-407`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:138-138`, `docs/prod-readiness.md:363`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:121`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:24` e mais 2
- **O que falta:** Deploy (allowlist deploy.yml:144) e popular quota_attainment_* em produção.
- **Evidência:** supabase/functions/predict-quota-attainment/index.ts existe; FORA da allowlist de deploy (.github/workflows/deploy.yml:144) → não roda em produção; chamada por: src/hooks/revenue/useQuotaAttainment.ts| cético: supabase/functions/predict-quota-attainment/index.ts existe (index.ts:165 agora comenta meta vigente por mês em vez de salespeople.monthly_goal); fora da allowlist deploy.yml:144; chamador src/hooks/revenue/useQuotaAttainment.ts.

### F3347 · Edge function purchase-intelligence-forecast (5 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** Catálogo API.md lista a edge function `purchase-intelligence-forecast` na categoria "IA / Forecast" com auth "JWT do usuário (RLS) · verify_jwt", método "qualquer", payload "—" e resposta "JSON {error, ai_prediction, ai_error}".| supabase/functions/purchase-intelligence-forecast existe no repo (citada em src/: sim); sonda OPTIONS em produção: OPTIONS → 404 NOT_FOUND (não publicada; limite de 100 funções do plano). Status no doc: BLOQUEADO. \| `PurchasePredictionCard.tsx` via `usePurchaseIntelligence.ts:70` → `purchase-intelligence-forecast` (`index.ts:43-44` chama as 2 RPCs). \| 170 linhas; chamador: FE src/hooks/purchase-intelligence/usePurchaseIntelligence.ts; verify_jwt true (default); t…
- **Fontes:** `docs/API.md:177-177`, `docs/prod-readiness.md:371`, `docs/estado/07_DOMINIO_WINLOSS_COMPETITIVE.md:235`, `docs/estado/10_EDGE_FUNCTIONS.md:415-415`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:146-146`
- **O que falta:** Deploy (allowlist deploy.yml:144) para o PurchasePredictionCard receber previsão real.
- **Evidência:** supabase/functions/purchase-intelligence-forecast/index.ts existe; FORA da allowlist de deploy (.github/workflows/deploy.yml:144) → não roda em produção; chamada por: src/hooks/purchase-intelligence/usePurchaseIntelligence.ts| cético: supabase/functions/purchase-intelligence-forecast/index.ts existe; fora da allowlist deploy.yml:144; chamador src/hooks/purchase-intelligence/usePurchaseIntelligence.ts.

### F3348 · Edge function recompute-stage-baselines (10 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** refresh-stage-baselines faz upsert sem constraint compatível (index.ts:117-121) e a UI mostra "Baselines atualizadas"; duplica recompute-stage-baselines.| Chamada por useStageVelocity.ts; stage_velocity_baselines 0. \| 78 linhas; chamador: FE src/hooks/deal-intelligence/useStageVelocity.ts; verify_jwt true (default); tabelas tocadas (linhas em produção): stage_velocity_baselines(0). Classificação do doc: PARCIAL. \| supabase/functions/recompute-stage-baselines existe no repo (citada em src/: sim); sonda OPTIONS em produção: OPTIONS → 404 NOT_FOUND (não publicada; limite de 100 funções do plano). Status no doc: BLOQUEADO. \| Ambas escrevem em stage_velocity_baselines (0 linhas); recompute lê…
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:134`, `docs/estado/04_DOMINIO_ANALYTICS_BI.md:419`, `docs/estado/10_EDGE_FUNCTIONS.md:423-423`, `docs/prod-readiness.md:379`, `docs/estado/10_EDGE_FUNCTIONS.md:255-264`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:263` e mais 4
- **O que falta:** Deploy (allowlist deploy.yml:144) para popular stage_velocity_baselines.
- **Evidência:** supabase/functions/recompute-stage-baselines/index.ts existe; FORA da allowlist de deploy (.github/workflows/deploy.yml:144) → não roda em produção; chamada por: src/hooks/deal-intelligence/useStageBaselines.ts, src/hooks/deal-intelligence/useStageVelocity.ts| cético: supabase/functions/recompute-stage-baselines/index.ts existe; refresh-stage-baselines não existe mais em supabase/functions (ls → 0); fora da allowlist deploy.yml:144; chamadores src/hooks/deal-intelligence/useStageVelocity.ts e useStageBaselines.ts.

### F3349 · Edge function report-builder-execute (9 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** Relatórios cruzados entre sales, accounts, salespeople e clients no builder/execução.| Catálogo API.md lista a edge function `report-builder-execute` na categoria "Reports / Export" com auth "JWT do usuário · verify_jwt", método "qualquer", payload "report_id, override_config, page, page_size" e resposta "JSON {error, ok, rows, total, is_cross, viz_type}". \| Execução autenticada de relatórios customizados com allowlist de entidades e validação de operadores. \| 269 linhas; chamador: FE src/hooks/reporting/useReportExecution.ts; verify_jwt true (default); tabelas tocadas (linhas em produção): custom_reports(0). Classificação do doc: PARCIAL. \| supabase/functions/report-builder-execute exis…
- **Fontes:** `docs/REPORTING_BI_COMPLETE.md:15`, `docs/API.md:247-247`, `docs/REPORTING_BI_COMPLETE.md:30`, `docs/estado/10_EDGE_FUNCTIONS.md:426-426`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:157-157`, `docs/prod-readiness.md:381` e mais 4
- **O que falta:** Deploy (allowlist deploy.yml:144) e agregações reais (sum/avg) por grupo; gravar report_executions.
- **Evidência:** supabase/functions/report-builder-execute/index.ts existe; FORA da allowlist de deploy (.github/workflows/deploy.yml:144) → não roda em produção; chamada por: src/hooks/reporting/useReportExecution.ts| cético: supabase/functions/report-builder-execute/index.ts existe; fora da allowlist deploy.yml:144; group_by só conta: index.ts:241-243 (_count), sem soma/média de colunas numéricas; chamador src/hooks/reporting/useReportExecution.ts.

### F3350 · Edge function scheduled-report-trigger (6 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** Catálogo API.md lista a edge function `scheduled-report-trigger` na categoria "Reports / Export" com auth "JWT do usuário · verify_jwt", método "qualquer", payload "schedule_id" e resposta "JSON {error, ok}".| Chamada por useTriggerScheduledReport.ts:9 (manual); invoca scheduled-reports-runner em index.ts:58. \| Dispara manualmente um schedule de relatório. \| Doc classifica como REAL. Chamador(es): FE hooks/reporting/useTriggerScheduledReport.ts:10. Disparo manual do runner. \| 76 linhas; chamador: FE src/hooks/reporting/useTriggerScheduledReport.ts; verify_jwt true (default); tabelas tocadas (linhas em produção): scheduled_reports(0). Classificação do doc: SUGERIDO_OU_INICIADO (esqueleto)…
- **Fontes:** `docs/API.md:250-250`, `docs/estado/04_DOMINIO_ANALYTICS_BI.md:410-411`, `docs/REPORTING_BI_COMPLETE.md:32`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:167-167`, `docs/estado/10_EDGE_FUNCTIONS.md:436-436`, `docs/prod-readiness.md:391`
- **O que falta:** Deploy do trigger e do runner (allowlist deploy.yml:144).
- **Evidência:** supabase/functions/scheduled-report-trigger/index.ts existe; FORA da allowlist de deploy (.github/workflows/deploy.yml:144) → não roda em produção; chamada por: src/hooks/reporting/useTriggerScheduledReport.ts| cético: supabase/functions/scheduled-report-trigger/index.ts existe; fora da allowlist deploy.yml:144; chamador src/hooks/reporting/useTriggerScheduledReport.ts; invoca scheduled-reports-runner, também fora da allowlist.

### F3351 · Edge function scheduled-reports-runner (13 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** Catálogo API.md lista a edge function `scheduled-reports-runner` na categoria "Reports / Export" com auth "nenhuma detectada no handler · verify_jwt", método "qualquer", payload "schedule_id" e resposta "JSON {ok, error}".| Executa schedules pendentes de relatórios agendados. \| Doc classifica como PARCIAL. Chamador(es): FN scheduled-report-trigger/index.ts:52. Sem cron (só via trigger manual). `recipients` lido e nunca usado: gera CSV/JSON no storage, não entrega a ninguém (index.ts:15,64-71,136). \| supabase/functions/scheduled-reports-runner existe no repo (citada em src/: não); sonda OPTIONS em produção: OPTIONS → 404 NOT_FOUND (não publicada; limite de 100 funções do plano). Status no …
- **Fontes:** `docs/API.md:251-251`, `docs/REPORTING_BI_COMPLETE.md:31`, `docs/estado/10_EDGE_FUNCTIONS.md:437-437`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:168-168`, `docs/prod-readiness.md:392`, `docs/estado/04_DOMINIO_ANALYTICS_BI.md:411` e mais 8
- **O que falta:** Deploy (allowlist deploy.yml:144) e entrega aos recipients (e-mail); filtro por dono do agendamento.
- **Evidência:** supabase/functions/scheduled-reports-runner/index.ts existe; FORA da allowlist de deploy (.github/workflows/deploy.yml:144) → não roda em produção; chamada por: scheduled-report-trigger| cético: Correção da pré-checagem: há cron real — cron.md:51 job 88 scheduled-reports-runner-hourly ('10 * * * *', trigger_internal_edge_job), cron-runs.md:394-400 'succeeded' (pg_net assíncrono). Mas a function está fora da allowlist deploy.yml:144 → a chamada cai em 404. recipients só é selecionado (index.ts:16,233), sem envio.

### F3352 · Edge function snapshot-forecast (4 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** Catálogo API.md lista a edge function `snapshot-forecast` na categoria "IA / Forecast" com auth "JWT do usuário · verify_jwt", método "qualquer", payload "period_start, period_end, source" e resposta "JSON {error, inserted}".| 117 linhas; chamador: FE src/hooks/revenue-intelligence/useForecastAccuracy.ts; verify_jwt true (default); tabelas tocadas (linhas em produção): forecast_snapshots(6). Classificação do doc: IMPLEMENTADO_TOTAL. \| Doc classifica como PARCIAL. Chamador(es): FE hooks/revenue-intelligence/useForecastAccuracy.ts:118. Só manual; sem cron de snapshot → compute-forecast-accuracy não tem série. \| supabase/functions/snapshot-forecast existe no repo (citada em src/: sim); sonda…
- **Fontes:** `docs/API.md:186-186`, `docs/estado/10_EDGE_FUNCTIONS.md:456-456`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:188-188`, `docs/prod-readiness.md:412`
- **O que falta:** Deploy (allowlist deploy.yml:144) e cron de snapshot periódico.
- **Evidência:** supabase/functions/snapshot-forecast/index.ts existe; FORA da allowlist de deploy (.github/workflows/deploy.yml:144) → não roda em produção; chamada por: src/hooks/revenue-intelligence/useForecastAccuracy.ts| cético: supabase/functions/snapshot-forecast/index.ts existe; fora da allowlist deploy.yml:144; chamador manual src/hooks/revenue-intelligence/useForecastAccuracy.ts; sem cron (grep snapshot cron.md → 0).

### F3353 · Edge function webvitals-regression-alert (2 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** supabase/functions/webvitals-regression-alert existe no repo (citada em src/: não); sonda OPTIONS em produção: OPTIONS → 404 NOT_FOUND (não publicada; limite de 100 funções do plano). Status no doc: BLOQUEADO.| Doc classifica como REAL. Chamador(es): cron diário 11:15 UTC (mig 20261002010000:82). Depende de _internal_secrets + SLACK_WEBHOOK_URL; WEBVITALS_*.
- **Fontes:** `docs/prod-readiness.md:425`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:201-201`
- **O que falta:** Incluir webvitals-regression-alert na allowlist deploy.yml:144 (ou desligar o cron 44).
- **Evidência:** supabase/functions/webvitals-regression-alert/index.ts existe; FORA da allowlist de deploy (.github/workflows/deploy.yml:144) → não roda em produção; ÓRFÃ: nenhum chamador no front, em edges ou em SQL/cron (edge-functions.json)| cético: Correção: NÃO é órfã — cron.md:33 job 44 webvitals-regression-alert-daily ('15 11 * * *') via trigger_internal_edge_job; cron-runs.md:236-242 'succeeded'. Porém a function está fora da allowlist deploy.yml:144 → cron dispara contra function não publicada (404).

### F3358 · Função get_stage_probability conectada

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** Probabilidade por estágio sem chamador (mig/20261001220000:51).
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/F_banco_dados.md:86`
- **O que falta:** Chamador para a RPC (ou removê-la, já que a view lê stage_probabilities direto).
- **Evidência:** função public.get_stage_probability existe no banco real (functions.md); sem referência em código, cron, triggers ou outras funções (coluna de uso vazia)| cético: functions.md:237 public.get_stage_probability existe, uso '—'; ausente: grep -rn get_stage_probability src supabase/functions → 0. A tabela stage_probabilities é usada diretamente por revenue_forecast_view (views.md:633).

### F3359 · Função SQL/RPC aggregate_sales_stats (2 afirmações nos docs)

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** API.md lista a function SQL `aggregate_sales_stats` com última definição em 20260105000005_stored_procedures.sql, grants "—" e uso no front "—".| RPCs expostas no destino e ausentes de types.ts: aggregate_sales_stats, bulk_update_deal_stages, calculate_deal_health_score, calculate_deal_probability, calculate_team_performance, generate_sales_forecast, update_client_score, update_lead_score.
- **Fontes:** `docs/API.md:470-470`, `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:502-504`
- **O que falta:** Chamador no front/edge ou remoção.
- **Evidência:** função public.aggregate_sales_stats existe no banco real (functions.md); sem referência em código, cron, triggers ou outras funções (coluna de uso vazia)| cético: functions.md:78 public.aggregate_sales_stats existe; ausente: grep -rn aggregate_sales_stats src supabase/functions → 0.

### F3360 · Função SQL/RPC compute_cohort_retention (4 afirmações nos docs)

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** Tabela sem produtor; heatmap calcula no cliente (useCohortRetention); RPC não chamada no src. DIVERGENTE.| Retenção por coorte movida para private (mig/20260619144542) sem chamador. \| A RPC compute_cohort_retention existe no banco mas a página de cohort calcula client-side; RPC sem chamador (2026-10-18). \| API.md lista a function SQL `compute_cohort_retention` com última definição em 20260416234424_66fbe1df-5677-4a6c-bea6-daf700e06009.sql, grants "authenticated" e uso no front "—".
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:88`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/F_banco_dados.md:86,37`, `docs/REPORTING_BI_COMPLETE.md:16`, `docs/API.md:531-531`
- **O que falta:** Cohort calculado no cliente; RPC sem chamador e fora do schema exposto.
- **Evidência:** função private.compute_cohort_retention existe no banco real (functions.md); sem referência em código, cron, triggers ou outras funções (coluna de uso vazia)| cético: functions.md:39 private.compute_cohort_retention (public não existe); ausente: grep -rn compute_cohort_retention src supabase/functions → 0; tabela cohort_analyses existe com RLS (tables/public/cohort_analyses.md:7).

### F3361 · Função SQL/RPC get_embedded_report_by_token (2 afirmações nos docs)

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** RPC de embed v1 morta; o app usa report_embed_tokens.| API.md lista a function SQL `get_embedded_report_by_token` com última definição em 20260416234424_66fbe1df-5677-4a6c-bea6-daf700e06009.sql, grants "anon, authenticated" e uso no front "—".
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/F_banco_dados.md:86,36`, `docs/API.md:615-615`
- **O que falta:** RPC v1 morta; remover ou religar.
- **Evidência:** função public.get_embedded_report_by_token existe no banco real (functions.md); sem referência em código, cron, triggers ou outras funções (coluna de uso vazia)| cético: functions.md:223 public.get_embedded_report_by_token existe; ausente: grep -rn get_embedded_report_by_token src supabase/functions → 0; embed real usa report_embed_tokens (tables.md:293) via report-embed-public (na allowlist deploy.yml:144).

### F3362 · Função SQL/RPC get_historical_benchmark (2 afirmações nos docs)

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** Benchmark histórico sem chamador.| API.md lista a function SQL `get_historical_benchmark` com última definição em 20260512184319_c82514dd-ce87-4dce-8921-916ef258a7a5.sql, grants "—" e uso no front "—".
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/F_banco_dados.md:86`, `docs/API.md:618-618`
- **O que falta:** Chamador (hook/UI) ou remoção.
- **Evidência:** função public.get_historical_benchmark existe no banco real (functions.md); sem referência em código, cron, triggers ou outras funções (coluna de uso vazia)| cético: functions.md:226 public.get_historical_benchmark existe; ausente: grep -rn get_historical_benchmark src supabase/functions → 0.

### F3366 · RPC/função SQL `calculate_team_performance`

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** API.md lista a function SQL `calculate_team_performance` com última definição em 20260104181000_stored_procedures_additional.sql, grants "—" e uso no front "—".
- **Fontes:** `docs/API.md:512-512`
- **O que falta:** Chamador ou remoção.
- **Evidência:** função public.calculate_team_performance existe no banco real (functions.md); sem referência em código, cron, triggers ou outras funções (coluna de uso vazia)| cético: functions.md:114 public.calculate_team_performance existe; ausente: grep -rn calculate_team_performance src supabase/functions → 0.

### F3367 · RPC/função SQL `generate_sales_forecast`

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** API.md lista a function SQL `generate_sales_forecast` com última definição em 20260104181000_stored_procedures_additional.sql, grants "—" e uso no front "—".
- **Fontes:** `docs/API.md:596-596`
- **O que falta:** Chamador ou remoção.
- **Evidência:** função public.generate_sales_forecast existe no banco real (functions.md); sem referência em código, cron, triggers ou outras funções (coluna de uso vazia)| cético: functions.md:204 public.generate_sales_forecast existe; ausente: grep -rn generate_sales_forecast src supabase/functions → 0.

### F3368 · Views e RPCs filtram sales.status = completed (inexistente) → ranking rank=1 e revops-hub zerado

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** Raiz de dado: filtro por valor que não existe zera win rate, ciclo e receita.
- **Fontes:** `docs/estado/ESTADO_ATUAL.md:170-172`
- **O que falta:** Canonizar o trio ganho (completed/won/closed) em get_dashboard_kpis, reconcile_forecast_accuracy e coaching_impact_metrics.
- **Evidência:** Corrigido nos alvos citados: mv_competitive_ranking (views.md:398+) usa status = ANY('completed','won','closed'); supabase/functions/revops-hub/index.ts:69-72 usa isWonSaleStatus/isOpenSaleStatus (_shared/sale-statuses.ts:26), revops-hub na allowlist de .github/workflows/deploy.yml:144. Mas no banco real ainda há filtro só por 'completed': functions/public/get_dashboard_kpis__cd5a80693c4cfb93.sql:20 (chamada por src/hooks/dashboard/useDashboardKPIs.ts:35), functions/public/reconcile_forecast_accuracy__463d4ab7f988f47f.sql:14, view coaching_impact_metrics (views.md:126+, FILTER sa.status='completed').
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Não implementado.

### F0583 · Etapa canônica 26/08 nº 73: Eliminar N+1 e agregações no cliente (ranking, vendedores, KPIs)

- **Tipo:** Hook
- **O que os docs afirmam:** Etapa canônica 73 (plano 26/08, matriz de status 30/08, estado ⬜): queries/RPCs indexáveis; orçamento de queries por tela.
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:228-228`
- **O que falta:** Mover agregação do ranking de vendedores para RPC/view, eliminar `.map(async` nos hooks citados e definir orçamento de queries por tela.
- **Evidência:** Agregações já no servidor: ranking competitivo via view competitive_ranking sobre mv_competitive_ranking (contexto/supabase/views.md:206-213) refrescada por trigger trg_refresh_ranking_on_sale (functions.md:361) e lida em src/hooks/useCompetitiveRanking.ts:33; KPIs via RPC get_dashboard_kpis (src/hooks/dashboard/useDashboardKPIs.ts:35; functions.md:220). Ainda no cliente: ranking de vendedores em src/hooks/sales/useSalespeople.ts:84-112 (3 selects em salespeople/sales_goals/sales + reduce por vendedor na página /vendedores, src/pages/Vendedores.tsx:6); 5 hooks com padrão `.map(async` (N+1): useAutoAwardBonuses, useLeadRouting, useCompetitorsRegistry, useCadenceChannelStats, useCadenceReport. Não existe 'orçamento de queries por tela' (`grep -rni 'orçamento de queries\\|query budget' src scripts .github` → 0). Doc: docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:228 (⬜).| cético: Sem evidê…

### F3374 · Hook useDealAnalyticsVelocity usa chunkedIn

- **Tipo:** Hook
- **O que os docs afirmam:** Listado entre os 29 call-sites blindados que usam o helper chunkedIn (.in('id', chunk)).
- **Fontes:** `docs/reports/FRONTEND_IN_AUDIT.md:28-28`
- **O que falta:** arquivo src/hooks/deal-intelligence/useDealAnalyticsVelocity.ts existe mas hook não consta em hooks.json (não exportado/indexado)
- **Evidência:** arquivo src/hooks/deal-intelligence/useDealAnalyticsVelocity.ts existe mas hook não consta em hooks.json (não exportado/indexado)| CONTESTADO pelo cético (IMPLEMENTADO): src/hooks/deal-intelligence/useDealAnalyticsVelocity.ts:4 importa chunkedIn de '@/lib/supabase/chunkedIn'; :115-123 a única chamada .in('sale_id', chunk) roda dentro de chunkedIn({parallel:true}). Hook consumido em src/components/analytics/DealVelocityChart.tsx:4 e src/pages/DealVelocityPage.tsx. O motivo mecânico ('não consta em hooks.json') não é critério do item.
- **Revisão:** em disputa. O cético propõe Implementado e o juiz ainda não decidiu.

### F3375 · Hook useReportData (2 afirmações nos docs)

- **Tipo:** Hook
- **O que os docs afirmam:** Doc lista o hook `useReportData.ts` — dados de relatórios.| `src/hooks/useReportData.ts` consumidos internamente por useReportMetrics, único símbolo importado em `src/pages/Relatorios.tsx:10`.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:656-657`, `docs/estado/09_HOOKS_SERVICES.md:144-150`
- **O que falta:** arquivo src/hooks/useReportData.ts existe mas hook não consta em hooks.json (não exportado/indexado)
- **Evidência:** arquivo src/hooks/useReportData.ts existe mas hook não consta em hooks.json (não exportado/indexado)| CONTESTADO pelo cético (IMPLEMENTADO): src/hooks/useReportData.ts:42 (useSales) e :119 (useReportMetrics) exportados; lê sales(:47), daily_metrics(:76), category_metrics(:105) com throw em erro (:60). src/pages/Relatorios.tsx:19 importa useReportMetrics e usa em :52 (doc citava :10, linha real :19). Rota /relatorios em AppRoutes.tsx:~615 sob <Manager>, menu sidebarMenuData.ts:104. Tabelas sales/daily_metrics/category_metrics existem com 'RLS habilitado \| sim' (tables/public/*.md:7).
- **Revisão:** em disputa. O cético propõe Implementado e o juiz ainda não decidiu.

### F3377 · hooks/revenue/useQuotaAttainmentPredictor.ts: .in('forecast_id') com cardinalidade aceita por design

- **Tipo:** Hook
- **O que os docs afirmam:** P0 residual #: .in('forecast_id') com array forecastIds sem cap explícito; decisão: aceitar e adicionar comentário de tolerância.
- **Fontes:** `docs/reports/FRONTEND_IN_AUDIT.md:58-58`
- **O que falta:** Adicionar o comentário-âncora '// chunked-in-safe: <razão>' acima de useQuotaAttainmentPredictor.ts:91 (decisão registrada 'aceitar e adicionar comentário') ou usar chunkedIn.
- **Evidência:** arquivo src/hooks/revenue/useQuotaAttainmentPredictor.ts existe mas hook não consta em hooks.json (não exportado/indexado)| cético: src/hooks/revenue/useQuotaAttainmentPredictor.ts:88-91 faz .in('forecast_id', forecastIds) sem chunkedIn e sem comentário '// chunked-in-safe:' na linha anterior (:90 é '.select('*')'). O guard src/lib/supabase/all-in-calls.test.ts passa só porque 'forecast_id' não está em HIGH_CARD_COLUMNS (:10-21), não por tolerância documentada. (Motivo mecânico 'não consta em hooks.json' era irrelevante; veredito se mantém por outro motivo.)

### F0587 · Edge function report-embed-public sem functions.invoke literal no front

- **Tipo:** Integração externa
- **O que os docs afirmam:** Uma das 64/168 funções sem invocador literal em src/. Grupo: Webhook de entrada (INFERIDO). Classificação por grupo deduzida do nome; pg_cron/config.toml não verificados.
- **Fontes:** `docs/estado/09_HOOKS_SERVICES.md:291-311`
- **O que falta:** Emitir um token real e comprovar chamada externa (log de invocação ou last_used em report_embed_tokens).
- **Evidência:** Função existe (supabase/functions/report-embed-public/index.ts), está na allowlist (deploy.yml:144) e com verify_jwt=false (config.toml:51-52). Chamador no front sem functions.invoke literal: src/hooks/reporting/useEmbeddedReportPreview.ts:5 (fetch em /functions/v1/report-embed-public), usado por src/pages/EmbedReportPage.tsx, rota /embed/report/:token (AppRoutes.tsx:222; lazyPages.ts:174). Tokens geridos por src/hooks/reporting/useReportEmbedTokens.ts:15-83. Porém report_embed_tokens tem 0 linhas (contexto/supabase/stats.md:218) → nenhum embed emitido; logs de invocação indisponíveis (contexto/supabase/edge-functions.md: Management API desabilitada).| cético: Fio completo confirmado: chamador por fetch em src/hooks/reporting/useEmbeddedReportPreview.ts:5,17-19; rota pública /embed/report/:token (AppRoutes.tsx:222); emissão de tokens montada em ReportBuilder.tsx:40,269 (EmbedTokenManage…

### F0589 · Scheduled Reports: envio de e-mail do relatório

- **Tipo:** Integração externa
- **O que os docs afirmam:** Relatórios agendados são enviados por e-mail aos destinatários configurados.
- **Fontes:** `docs/REPORTING_BI_COMPLETE.md:17`
- **O que falta:** Envio por provedor de e-mail (ex.: send-transactional-email, já na allowlist) para cada recipient com signed URL; incluir scheduled-reports-runner (e scheduled-report-trigger) na allowlist deploy.yml:144.
- **Evidência:** supabase/functions/scheduled-reports-runner/index.ts:16,233 lê `recipients` mas nunca envia: `grep -n -iE 'resend\|smtp\|email\|send-transactional' supabase/functions/scheduled-reports-runner/index.ts` → 0 resultados; o único destino é storage (index.ts:165-170). UI coleta e-mails (src/components/reporting/ScheduledReportFormDialog.tsx:47-62) e coluna existe no banco (contexto/supabase/tables/public/scheduled_reports.md:27 `recipients text[]`). Runner fora da allowlist (.github/workflows/deploy.yml:144 → grep 0).| cético: Confirmado: supabase/functions/scheduled-reports-runner/index.ts:16,233 só lê `recipients`; `grep -n -iE 'resend\|smtp\|email\|invoke\|fetch' supabase/functions/scheduled-reports-runner/index.ts` → só a linha 233 (select). Runner fora da allowlist: .github/workflows/deploy.yml:144 não contém scheduled-reports-runner. O outro caminho, supabase/functions/scheduled-report…

### F0594 · Gap "classe mundial" já existente: NLQ

- **Tipo:** Outro
- **O que os docs afirmam:** Doc afirma que o gap "NLQ" de GAPS_CLASSE_MUNDIAL já existe no código.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:208`
- **O que falta:** Incluir nlq-query na allowlist de deploy.yml:144 (liberando vaga) e confirmar o deploy.
- **Evidência:** Rota /perguntar src/routes/AppRoutes.tsx:948 → src/pages/AskAnything.tsx; menu sidebarMenuData.ts:162,265; src/hooks/nlq/useNLQ.ts:53 invoca `nlq-query`; pasta supabase/functions/nlq-query existe, mas `grep -c nlq-query .github/workflows/deploy.yml` → 0 (fora da allowlist ACTIVE linha 144) → em produção a chamada falha (toast de erro useNLQ.ts:19-36).| cético: Confirmado: src/pages/AskAnything.tsx:8 usa useNLQ; src/hooks/nlq/useNLQ.ts:53 invoke('nlq-query'); deploy.yml:144 não contém nlq-query. Não há rota alternativa: `grep -rn "invoke('(nlq\|natural\|ask\|ai-query\|text-to-sql)" src` → só useNLQ.ts:53; `ls supabase/functions \| grep -iE 'nlq\|ask\|natural'` → só nlq-query.

### F0596 · Gap "classe mundial" já existente: Report builder com joins

- **Tipo:** Outro
- **O que os docs afirmam:** Doc afirma que o gap "Report builder com joins" de GAPS_CLASSE_MUNDIAL já existe no código.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:208`
- **O que falta:** Deployar report-builder-execute (allowlist) e validar a execução real de um relatório cross.
- **Evidência:** UI de joins existe: src/components/reporting/ReportBuilder.tsx:21,180-182 CrossObjectJoinPanel; src/hooks/reporting/reportBuilderHelpers.ts:161-208 JOIN_MAP/buildCrossEntityFields; backend suporta entity 'cross' em supabase/functions/report-builder-execute/index.ts:36-49,134-150. Porém src/hooks/reporting/useReportExecution.ts:33 invoca report-builder-execute e `grep -c report-builder-execute .github/workflows/deploy.yml` → 0 (fora da allowlist) → execução falha em produção; custom_reports 0 linhas (contexto/supabase/stats.md:265).| cético: Confirmado: a execução depende de report-builder-execute, que está fora da allowlist (deploy.yml:144 não contém o nome). A validação de joins existe em supabase/functions/report-builder-execute/index.ts:176-189.

### F0597 · Domínio dormente: Relatórios agendados / embed (8 tabelas zeradas)

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Agrupamento funcional com 8 tabelas todas com 0 linhas; indica módulo construído e nunca usado.
- **Fontes:** `docs/estado/11_DADOS_BANCO.md:221-234`
- **O que falta:** Deployar report-builder-execute e scheduled-reports-runner, pôr /relatorios-custom no menu e gerar uso real.
- **Evidência:** Dormência confirmada no banco real: scheduled_reports 0, report_embed_tokens 0, embedded_report_tokens 0, custom_reports 0, report_executions 0, report_schedules 0, cohort_analyses 0, scheduled_report_runs 0 linhas (contexto/supabase/stats.md:196,218,223,265,314,315,357,392). UI existe (/relatorios-custom AppRoutes.tsx:666; /relatorios-agendados :659) mas report-builder-execute e scheduled-reports-runner estão fora da allowlist (deploy.yml:144 → grep 0); cron 88 scheduled-reports-runner-hourly roda (cron.md:51; cron-runs.md:394-399) chamando function não deployada. /relatorios-custom sem entrada no menu (`grep relatorios-custom src/components/layout/sidebar/sidebarMenuData.ts` → 0).| cético: Confirmado: as tabelas do grupo existem no banco (contexto/supabase/tables/public/{scheduled_reports,report_executions,report_schedules,embedded_report_tokens,custom_reports,scheduled_report_runs}.m…

### F0598 · Etapa 64 do plano: Corrigir Usage Analytics

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Coletar eventos reais de página/login com privacidade e retenção; remover aleatoriedade. Saída esperada: métricas rastreáveis. Gate: modelo de telemetria/LGPD.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:738-738`
- **O que falta:** Policy ou RPC de leitura agregada para admin/manager, job de retenção/LGPD e coleta de eventos de login.
- **Evidência:** Aleatoriedade removida: `grep -n Math.random src/pages/UsageAnalytics.tsx src/hooks/admin/useUsageAnalytics.ts` → 0. Coleta real: src/components/analytics/RouteTracker.tsx → src/lib/analytics.ts:92 insert em page_analytics; leitura src/hooks/admin/useUsageAnalytics.ts:25; tabela com ~180 linhas e RLS (contexto/supabase/stats.md:42; policies.md:536-538); rota /usage-analytics AppRoutes.tsx:1029-1032 sob <Admin>, menu sidebarMenuData.ts:368. Faltas: policies de page_analytics são só 'own' (policies.md:536-538, sem policy admin/manager) → o admin vê apenas as próprias linhas; nenhum cron de retenção cita page_analytics (`grep page_analytics contexto/supabase/cron.md` → 0).| cético: Confirmado: src/hooks/admin/useUsageAnalytics.ts:25 lê page_analytics; nenhum Math.random em UsageAnalytics.tsx ou no hook. contexto/supabase/tables/public/page_analytics.md: as 3 policies são todas 'own' (inser…

### F0600 · QBR automático

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Falta geração automática de Quarterly Business Review.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:70`
- **O que falta:** Cron trimestral chamando qbr-scheduler/qbr-generator, deploy das duas functions e envio aos destinatários.
- **Evidência:** Artefatos existem mas nada é automático: supabase/functions/qbr-generator/index.ts:124-126 insere qbr_reports só quando invocada manualmente (src/hooks/revenue/useRevenueIntelligenceHub.ts:201); supabase/functions/qbr-scheduler/index.ts:53 rpc schedule_next_qbrs invocada por botão (src/components/customer-success/HelpdeskConnectorPanel.tsx:101). `grep -c -E 'qbr-generator\|qbr-scheduler' .github/workflows/deploy.yml` → 0 (fora da allowlist); `grep -i qbr contexto/supabase/cron.md` → 0 (sem cron); qbr_reports 0 linhas (stats.md:304). scheduled-reports-runner não gera QBR.| cético: Confirmado: qbr-generator é invocado manualmente (src/hooks/revenue/useRevenueIntelligenceHub.ts:201); deploy.yml:144 não contém qbr-generator nem qbr-scheduler; `grep -i qbr contexto/supabase/cron.md` → 0. As tabelas qbr_reports e qbr_schedule existem no banco (tables/public/qbr_reports.md, qbr_schedule.md).

### F0601 · Relatórios agendados entregues aos recipients e export-winloss-pdf em PDF real

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Doc top-14: scheduled-reports-runner não entrega e sem cron; export-winloss-pdf gera Markdown.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:356-356`
- **O que falta:** Envio de e-mail no runner + allowlist; PDF real em export-winloss-pdf.
- **Evidência:** Pendência confirmada: runner não entrega aos recipients (grep email/resend em supabase/functions/scheduled-reports-runner/index.ts → 0; só upload :165-170) e está fora da allowlist (deploy.yml:144 → grep 0) — cron existe hoje (contexto/supabase/cron.md:51 job 88, doc desatualizado nesse ponto). export-winloss-pdf (na allowlist) gera Markdown: supabase/functions/export-winloss-pdf/index.ts:70 'emit Markdown for now', :97-98 upload text/markdown, :114 format:'markdown'.| cético: Confirmado: supabase/functions/export-winloss-pdf/index.ts:70 'emit Markdown for now', :97-98 upload em text/markdown, :114 format 'markdown'. O runner não envia e-mail e está fora de deploy.yml:144. O cron 88 existe (cron.md:51).

### F0602 · Scheduled Reports: snapshot do resultado por execução

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Cada execução de relatório agendado gera snapshot do resultado armazenado em runs.
- **Fontes:** `docs/REPORTING_BI_COMPLETE.md:17`
- **O que falta:** Deployar scheduled-reports-runner e verificar uma execução real (linha em scheduled_report_runs + objeto no bucket report-snapshots).
- **Evidência:** Código completo: runner grava arquivo no bucket report-snapshots (supabase/functions/scheduled-reports-runner/index.ts:165-170; bucket existe contexto/supabase/storage.md:11) e registra file_path/rows_count/status em scheduled_report_runs (:172-180; RLS policies.md:788); UI de histórico ScheduledReportRunsDrawer montada em src/pages/ScheduledReports.tsx:19,152 com signed URL (src/hooks/reporting/useScheduledReportRuns.ts:11,26-27). Porém scheduled-reports-runner está fora da allowlist (deploy.yml:144 → grep 0) → não roda em produção; scheduled_report_runs 0 linhas (stats.md:392).| cético: Confirmado: a coluna file_path existe em scheduled_report_runs (contexto/supabase/tables/public/scheduled_report_runs.md, coluna 7; RLS sim, 1 policy), mas o runner está fora de deploy.yml:144, então não gera snapshot em produção.

### F0603 · Cross-object reports com joins

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Falta relatórios cruzando objetos.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:178`
- **O que falta:** Deployar report-builder-execute.
- **Evidência:** Relatório cross configurável existe na UI (src/components/reporting/ReportBuilder.tsx:180-182 CrossObjectJoinPanel; src/hooks/reporting/reportBuilderHelpers.ts:163-175 base sales/activities/leads + joins accounts/salespeople/clients/sales) e no backend (supabase/functions/report-builder-execute/index.ts:134-150; report-embed-public/index.ts:205-219). Execução depende de report-builder-execute, fora da allowlist (deploy.yml:144 → grep 0).| cético: Confirmado: os joins são validados em supabase/functions/report-builder-execute/index.ts:176-189, mas a function está fora de deploy.yml:144. Já report-embed-public (na allowlist) aceita joins via joinTargets (report-embed-public/index.ts:253-255), só no embed.

### F0604 · Custom report builder sem código

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Falta report builder sem código.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:175`
- **O que falta:** UI de agrupamento, deploy de report-builder-execute e item de menu.
- **Evidência:** Builder sem código existe: src/pages/CustomReports.tsx:10 → src/components/reporting/ReportBuilder.tsx (ReportFieldPicker, ReportFilterBuilder, ReportPreview); salva em custom_reports via src/hooks/reporting/useCustomReports.ts (RLS policies.md:266-267). Faltas: agrupamento sem UI (`grep -rn -E 'group_by\|groupBy' src/components/reporting/*.tsx` → 0, apesar do tipo em reportBuilderHelpers.ts); execução via report-builder-execute fora da allowlist (deploy.yml:144); sem entrada no menu (grep relatorios-custom sidebarMenuData.ts → 0); custom_reports 0 linhas (stats.md:265).| cético: Confirmado: `grep -rn -E 'group_by\|groupBy\|aggregat' src/components/reporting/*.tsx` → 0; report-builder-execute fora de deploy.yml:144. Correção pontual: /relatorios-custom não está no menu, mas tem entrada pelo link 'Abrir builder' em src/components/dashboard/widgets/CustomReportWidget.tsx:37 (montado em Cu…

### F0605 · Custom Report Types com joins arbitrários

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Falta tipos de relatório customizados.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:151`
- **O que falta:** Deploy de report-builder-execute; joins arbitrários exigem ampliar JOIN_MAP.
- **Evidência:** Joins existem mas não são arbitrários: JOIN_MAP fixo em src/hooks/reporting/reportBuilderHelpers.ts:175 e supabase/functions/report-builder-execute/index.ts:36-49 (3 bases, até 3 joins — :147); UI em ReportBuilder.tsx:180-182. report-builder-execute fora da allowlist (deploy.yml:144 → grep 0).| cético: Confirmado: os joins são restritos a joinTargets/JOIN_MAP fixos (report-builder-execute/index.ts:176-189) e a function está fora de deploy.yml:144.

### F0606 · Dashboard builder drag-and-drop (existe básico)

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Existe básico; falta builder completo.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:174`
- **O que falta:** Reordenação drag-and-drop no CustomizableDashboard persistida em dashboard_layouts (reaproveitar o padrão de DashboardLayoutEditor.tsx).
- **Evidência:** Básico existe: /dashboard-custom src/routes/AppRoutes.tsx:258 → src/pages/DashboardCustom.tsx:1 → src/components/dashboard/CustomizableDashboard.tsx (widgets ligados/desligados onToggleWidget :175; persistência em dashboard_layouts src/hooks/dashboard/useDashboardLayout.ts:194,220; RLS 1 policy, 0 linhas stats.md:361); menu sidebarMenuData.ts:157,230,288. Sem drag-and-drop/reordenação: `grep -n -iE 'drag\|dnd\|sortable\|reorder' src/components/dashboard/CustomizableDashboard.tsx` → 0. Tabelas esperadas dashboard_widgets/user_dashboards não existem (grep contexto/supabase/tables.md → 0).| cético: Mantido, com uma ressalva: drag-and-drop persistido existe, mas só no dashboard de Win/Loss. src/components/win-loss/DashboardLayoutEditor.tsx:15,33 (useSortable), :73-75 grava via useUserDashboardLayout → src/hooks/win-loss/useUserDashboardLayout.ts:52,80 tabela user_winloss_preferences (RLS si…

### F3378 · Rota /analytics/abc (4 afirmações nos docs)

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Rota registrada em AppRoutes.tsx com acesso "admin_ou_gestor", GET em produção 200. Status no doc: OK| Rota /analytics/abc (AppRoutes.tsx:187) renderiza src/pages/ABCAnalysisPage.tsx; role: admin ou manager. Classificação do doc: IMPLEMENTADO_PARCIAL. Evidência: link src/components/analytics/ABCAnalysis.tsx:110 · sb=1 useQuery=1 mut=0 (árvore 8 arq.) · somente leitura — nenhuma mutação/persistência na árvore \| Doc lista /analytics/abc entre os itens de FUNCIONALIDADES_SEM_UI resolvidos com página ou consumidor real. \| API.md declara a rota `/analytics/abc` renderizando o componente ABCAnalysisPage com acesso "admin ou gestor".
- **Fontes:** `docs/prod-readiness.md:109`, `docs/estado/01_FRONTEND_ROTAS.md:113-113`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:206`, `docs/API.md:354-354`
- **O que falta:** Estado de erro e estado vazio em src/components/analytics/ABCAnalysis.tsx (página só trata loading).
- **Evidência:** rota /analytics/abc → src/pages/ABCAnalysisPage.tsx (AppRoutes.tsx); sem entrada no menu (sidebarMenuData.ts) → só acessível por URL| cético: Rota AppRoutes.tsx:567 sob <Manager> (=ProtectedRoute requireAdminOrManager, AppRoutes.tsx:202-204). Há navegação: menu '/analytics' (sidebarMenuData.ts:103) → aba 'abc' (Analytics.tsx:71,103) → botão 'Ver Completo' navigate('/analytics/abc') (ABCAnalysis.tsx:107) — logo o motivo mecânico 'só por URL' é falso. Dado real: useABCAnalysis lê sales/clients (src/hooks/bi/useABCAnalysis.ts:126,129). Porém ABCAnalysis.tsx:27 desestrutura só {data,isLoading}: sem estado de erro e sem estado vazio explícito (só toast em exportação :55-56).

### F3379 · Rota /analytics/closing-time (4 afirmações nos docs)

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Rota registrada em AppRoutes.tsx com acesso "admin_ou_gestor", GET em produção 200. Status no doc: OK| Rota /analytics/closing-time (AppRoutes.tsx:188) renderiza src/pages/ClosingTimePage.tsx; role: admin ou manager. Classificação do doc: IMPLEMENTADO_PARCIAL. Evidência: link src/components/analytics/ClosingTimeChart.tsx:108 · sb=1 useQuery=1 mut=0 (árvore 8 arq.) · somente leitura — nenhuma mutação/persistência na árvore \| Doc lista /analytics/closing-time entre os itens de FUNCIONALIDADES_SEM_UI resolvidos com página ou consumidor real. \| API.md declara a rota `/analytics/closing-time` renderizando o componente ClosingTimePage com acesso "admin ou gestor".
- **Fontes:** `docs/prod-readiness.md:110`, `docs/estado/01_FRONTEND_ROTAS.md:114-114`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:206`, `docs/API.md:355-355`
- **O que falta:** Trocar benchmarks/status e 'Alerta de Gargalo' fixos de ClosingTimePage.tsx:12-17,94-99 por cálculo do useClosingTime ou remover.
- **Evidência:** rota /analytics/closing-time → src/pages/ClosingTimePage.tsx (AppRoutes.tsx); sem entrada no menu (sidebarMenuData.ts) → só acessível por URL| cético: Rota AppRoutes.tsx:575 sob <Manager>; navegação existe via /analytics aba 'closing' (Analytics.tsx:62,104) → ClosingTimeChart.tsx:112 navigate. Mas src/pages/ClosingTimePage.tsx:12-17 tem 'Benchmarks da Indústria' fixos com status fixo (Negociação=error) e :94-99 texto fixo 'Negociação está levando 40% a mais que a média histórica' — dado fictício no caminho principal.

### F3380 · Rota /analytics/deal-velocity (4 afirmações nos docs)

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Rota registrada em AppRoutes.tsx com acesso "admin_ou_gestor", GET em produção 200. Status no doc: BLOQUEADO: 'Comparativo entre Vendedores' fictício (`DealVelocityPage.tsx:91-96`) — correção em #438| Rota /analytics/deal-velocity (AppRoutes.tsx:189) renderiza src/pages/DealVelocityPage.tsx; role: admin ou manager. Classificação do doc: IMPLEMENTADO_PARCIAL. Evidência: link src/components/analytics/DealVelocityChart.tsx:91 · sb=1 useQuery=1 mut=0 (árvore 8 arq.) · somente leitura — nenhuma mutação/persistência na árvore \| Doc lista /analytics/deal-velocity entre os itens de FUNCIONALIDADES_SEM_UI resolvidos com página ou consumidor real. \| API.md declara a rota `/analytics/deal-velocity` …
- **Fontes:** `docs/prod-readiness.md:111`, `docs/estado/01_FRONTEND_ROTAS.md:115-115`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:206`, `docs/API.md:356-356`
- **O que falta:** rota /analytics/deal-velocity → src/pages/DealVelocityPage.tsx (AppRoutes.tsx); sem entrada no menu (sidebarMenuData.ts) → só acessível por URL
- **Evidência:** rota /analytics/deal-velocity → src/pages/DealVelocityPage.tsx (AppRoutes.tsx); sem entrada no menu (sidebarMenuData.ts) → só acessível por URL| CONTESTADO pelo cético (IMPLEMENTADO): Rota AppRoutes.tsx:583 sob <Manager>. Navegação: menu /analytics (sidebarMenuData.ts:103) → aba 'velocity' (Analytics.tsx:60,100) → DealVelocityChart.tsx:125 navigate('/analytics/deal-velocity'). Comparativo fictício corrigido (commit 3c77d1d82 #438): DealVelocityPage.tsx:20-29 usa useDealVelocity + useSalespeopleMin reais; estados loading/erro/vazio em :97-112 ('Sem deals ganhos no período'). Hook usa deal_stage_history via chunkedIn (useDealAnalyticsVelocity.ts:115-123).
- **Revisão:** em disputa. O cético propõe Implementado e o juiz ainda não decidiu.

### F3381 · Rota /analytics/evolution (5 afirmações nos docs)

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Rota registrada em AppRoutes.tsx com acesso "admin_ou_gestor", GET em produção 200. Status no doc: BLOQUEADO: 'Líderes de Crescimento' com vendedores fictícios (`EvolutionCurvesPage.tsx:75-78,102`) — correção em #438| Rota /analytics/evolution (AppRoutes.tsx:190) renderiza src/pages/EvolutionCurvesPage.tsx; role: admin ou manager. Classificação do doc: IMPLEMENTADO_PARCIAL. Evidência: link src/components/competitive/EvolutionChart.tsx:61 · sb=1 useQuery=1 mut=0 (árvore 6 arq.) · somente leitura — nenhuma mutação/persistência na árvore \| A rota /analytics/evolution está entre as 26 classificadas como parciais: existe ligação estática, mas a auditoria não a considera pronta (dados mock, açõe…
- **Fontes:** `docs/prod-readiness.md:113`, `docs/estado/01_FRONTEND_ROTAS.md:116-116`, `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:203-205`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:206`, `docs/API.md:357-357`
- **O que falta:** rota /analytics/evolution → src/pages/EvolutionCurvesPage.tsx (AppRoutes.tsx); sem entrada no menu (sidebarMenuData.ts) → só acessível por URL
- **Evidência:** rota /analytics/evolution → src/pages/EvolutionCurvesPage.tsx (AppRoutes.tsx); sem entrada no menu (sidebarMenuData.ts) → só acessível por URL| CONTESTADO pelo cético (IMPLEMENTADO): Rota AppRoutes.tsx:591 sob <Manager>. Navegação: menu '/arena' (sidebarMenuData.ts:82) → ArenaCompetitiva.tsx:378-379 monta EvolutionChart → EvolutionChart.tsx:72 navigate('/analytics/evolution'). Líderes fictícios corrigidos (#438, 3c77d1d82): EvolutionCurvesPage.tsx:14-25 deriva líderes de useEvolutionCurves (src/hooks/useEvolutionCurves.ts:24 salespeople, :40 sales); estados loading/isError/vazio em EvolutionCurvesPage.tsx:76-91.
- **Revisão:** em disputa. O cético propõe Implementado e o juiz ainda não decidiu.

### F3382 · Rota /analytics/objections (4 afirmações nos docs)

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Rota registrada em AppRoutes.tsx com acesso "admin_ou_gestor", GET em produção 200. Status no doc: OK| Rota /analytics/objections (AppRoutes.tsx:191) renderiza src/pages/ObjectionsLibraryPage.tsx; role: admin ou manager. Classificação do doc: IMPLEMENTADO_TOTAL. Evidência: link src/components/analytics/ObjectionsLibrary.tsx:224 · sb=1 useQuery=1 mut=1 (árvore 13 arq.) \| Doc lista /analytics/objections entre os itens de FUNCIONALIDADES_SEM_UI resolvidos com página ou consumidor real. \| API.md declara a rota `/analytics/objections` renderizando o componente ObjectionsLibraryPage com acesso "admin ou gestor".
- **Fontes:** `docs/prod-readiness.md:114`, `docs/estado/01_FRONTEND_ROTAS.md:117-117`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:206`, `docs/API.md:358-358`
- **O que falta:** Substituir os cards 'Objeções Críticas' e 'Impacto em Conversão' (ObjectionsLibraryPage.tsx:52-85) por dados reais ou removê-los.
- **Evidência:** rota /analytics/objections → src/pages/ObjectionsLibraryPage.tsx (AppRoutes.tsx); sem entrada no menu (sidebarMenuData.ts) → só acessível por URL| cético: Rota AppRoutes.tsx:599 sob <Manager>; navegação existe via /analytics aba 'objections' (Analytics.tsx:70,102) → ObjectionsLibrary.tsx:224. Mas src/pages/ObjectionsLibraryPage.tsx:52-85 exibe insights fixos/fictícios: 'Preço — Responsável por 45% das perdas no último mês', 'Aumento de 12% em menções ao Player X', 'taxa de conversão 18% superior'.

### F3383 · Rota /bi-vendedor (6 afirmações nos docs)

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Superior.| Dashboard BI por papel: vendedor. \| Doc declara a rota `/bi-vendedor` servida pela página `BIVendedor.tsx` (acesso: Todos). Métricas individuais: performance, pipeline individual, atividades, streaks, conquistas. \| Rota /bi-vendedor (AppRoutes.tsx:194) renderiza src/pages/BIVendedor.tsx; sem role explícito (só autenticação global). Classificação do doc: MORTO_OU_ABANDONADO. Evidência: SEM link/menu em todo src/ · sb=2 useQuery=3 mut=0 (árvore 17 arq.) \| API.md declara a rota `/bi-vendedor` renderizando o componente BIVendedor com acesso "autenticado". \| NÃO INICIADO (20/20): rota /bi-vendedor existe mas sem link/menu; só mapas de título/prefetch.
- **Fontes:** `docs/benchmark/RAMPER_2026-07.md:105`, `docs/FUNCIONALIDADES_COMPLETAS.md:269-271`, `docs/DOCUMENTACAO_SISTEMA.md:515-522`, `docs/prod-readiness.md:129`, `docs/estado/01_FRONTEND_ROTAS.md:120-120`, `docs/API.md:361-361` e mais 1
- **O que falta:** Entrada de menu/link para /bi-vendedor em sidebarMenuData.ts (ou remover a rota).
- **Evidência:** rota /bi-vendedor → src/pages/BIVendedor.tsx (AppRoutes.tsx); sem entrada no menu (sidebarMenuData.ts) → só acessível por URL| cético: Rota AppRoutes.tsx:622 (só autenticação global). Nenhum link: grep '/bi-vendedor' em src retorna só NavLink.tsx:17 (mapa de prefetch) e Breadcrumbs.tsx:86 (rótulo); menu tem /bi-sdr (sidebarMenuData.ts:155), /bi-closer (:228), /bi-gestor (:264), mas não /bi-vendedor.

### F3387 · Rota /previsao-demanda (6 afirmações nos docs)

- **Tipo:** Rota/tela
- **O que os docs afirmam:** DemandForecastDashboard via useDemandForecast.ts:49,78 → demand-forecast; demand_forecasts 0, inventory_levels 17, stock_movements 478; sem cron.| Rota registrada em AppRoutes.tsx com acesso "admin_ou_gestor", GET em produção 200, chamando as edge functions demand-forecast. Status no doc: OK \| Rota /previsao-demanda (AppRoutes.tsx:207) renderiza src/pages/PrevisaoDemanda.tsx; role: admin ou manager. Classificação do doc: MORTO_OU_ABANDONADO. Evidência: SEM link/menu em todo src/ · sb=1 useQuery=1 mut=1 (árvore 10 arq.) \| Previsão de demanda por IA. \| API.md declara a rota `/previsao-demanda` renderizando o componente PrevisaoDemanda com acesso "admin ou gestor". \| NÃO INICIADO (20/20): …
- **Fontes:** `docs/estado/04_DOMINIO_ANALYTICS_BI.md:205`, `docs/DOCUMENTACAO_SISTEMA.md:804-807`, `docs/prod-readiness.md:205`, `docs/estado/01_FRONTEND_ROTAS.md:133-133`, `docs/FUNCIONALIDADES_COMPLETAS.md:277-279`, `docs/API.md:374-374` e mais 1
- **O que falta:** Item de menu/link para /previsao-demanda e cron que gere demand_forecasts periodicamente.
- **Evidência:** rota /previsao-demanda → src/pages/PrevisaoDemanda.tsx (AppRoutes.tsx); sem entrada no menu (sidebarMenuData.ts) → só acessível por URL| cético: Rota AppRoutes.tsx:688 sob <Manager>; demand-forecast está na allowlist deploy.yml:144 e é chamada em src/hooks/useDemandForecast.ts:49; demand_forecasts existe com RLS. Mas nenhum link/menu: grep '/previsao-demanda' em src só acha useMobileNavigation.ts:34 (mapa de título); e ausente: grep -i demand cron.md → 0 jobs (sem agendamento).

### F3388 · Rota /relatorio-atividades (6 afirmações nos docs)

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Relatório de atividades.| Doc declara a rota `/relatorio-atividades` servida pela página `RelatorioAtividades.tsx` (acesso: Admin/Manager). Relatório de atividades. \| Rota /relatorio-atividades (AppRoutes.tsx:198) renderiza src/pages/RelatorioAtividades.tsx; role: admin ou manager. Classificação do doc: MORTO_OU_ABANDONADO. Evidência: SEM link/menu em todo src/ · sb=1 useQuery=1 mut=0 (árvore 18 arq.) \| Doc: sem link em nenhum lugar. \| API.md declara a rota `/relatorio-atividades` renderizando o componente RelatorioAtividades com acesso "admin ou gestor". \| NÃO INICIADO (20/20): rota /relatorio-atividades existe mas sem link/menu; só mapas de título/prefetch.
- **Fontes:** `docs/FUNCIONALIDADES_COMPLETAS.md:295-295`, `docs/DOCUMENTACAO_SISTEMA.md:387-389`, `docs/prod-readiness.md:216`, `docs/estado/01_FRONTEND_ROTAS.md:124-124`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/D_frontend.md:138-138`, `docs/API.md:365-365` e mais 1
- **O que falta:** Link/menu para /relatorio-atividades (sidebarMenuData.ts) ou remoção da rota.
- **Evidência:** rota /relatorio-atividades → src/pages/RelatorioAtividades.tsx (AppRoutes.tsx); sem entrada no menu (sidebarMenuData.ts) → só acessível por URL| cético: Rota AppRoutes.tsx:634 sob <Manager>; ausente: grep -rn "'/relatorio-atividades" src (fora AppRoutes/lazyPages/test) → 0 resultados; não há entrada em sidebarMenuData.ts.

### F3389 · Rota /relatorios-custom (7 afirmações nos docs)

- **Tipo:** Rota/tela
- **O que os docs afirmam:** AppRoutes.tsx:203-204 apontam para o mesmo componente; doc não verificou se divergem em comportamento.| Construtor de relatórios customizados que permite escolher entidade, colunas, filtros, agrupamento e tipo de visualização; rota /relatorios-custom em CustomReports.tsx. \| Doc: aponta para `/relatorios/builder`, inexistente; rota real é `/relatorios-custom`. \| Rota registrada em AppRoutes.tsx com acesso "autenticado", GET em produção 200, chamando as edge functions report-builder-execute. Status no doc: BLOQUEADO: edge report-builder-execute indisponível \| Rota /relatorios-custom (AppRoutes.tsx:203) renderiza src/pages/CustomReports.tsx; sem role explícito (só autenticação global). Clas…
- **Fontes:** `docs/estado/01_FRONTEND_ROTAS.md:399-399`, `docs/REPORTING_BI_COMPLETE.md:14,41`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/D_frontend.md:136-136`, `docs/prod-readiness.md:219`, `docs/estado/01_FRONTEND_ROTAS.md:129-129`, `docs/API.md:370-370` e mais 1
- **O que falta:** Publicar report-builder-execute (allowlist deploy.yml:144); corrigir doc que cita /relatorios/builder.
- **Evidência:** rota /relatorios-custom → src/pages/CustomReports.tsx (AppRoutes.tsx); sem entrada no menu (sidebarMenuData.ts) → só acessível por URL| cético: Rotas AppRoutes.tsx:666 e :667-670 (/relatorios-custom/:id), ambas CustomReports; CustomReports.tsx:20,24,28 usa useParams().id (edição vs lista). Navegação via widget CustomReportWidget.tsx:37 'Abrir builder' em /dashboard-custom (menu :157). Mas execução usa useReportExecution.ts:33 → 'report-builder-execute', ausente da allowlist deploy.yml:144. /relatorios/builder inexistente (doc divergente).

### F3390 · Rota /relatorios-executivos (4 afirmações nos docs)

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Relatórios executivos.| Rota registrada em AppRoutes.tsx com acesso "admin_ou_gestor", GET em produção 200. Status no doc: OK \| Rota /relatorios-executivos (AppRoutes.tsx:201) renderiza src/pages/RelatoriosExecutivos.tsx; role: admin ou manager. Classificação do doc: IMPLEMENTADO_PARCIAL. Evidência: link src/components/intelligence/IntelligenceCommandBar.tsx:30 · sb=1 useQuery=1 mut=0 (árvore 7 arq.) · somente leitura — nenhuma mutação/persistência na árvore \| API.md declara a rota `/relatorios-executivos` renderizando o componente RelatoriosExecutivos com acesso "admin ou gestor".
- **Fontes:** `docs/FUNCIONALIDADES_COMPLETAS.md:297-297`, `docs/prod-readiness.md:222`, `docs/estado/01_FRONTEND_ROTAS.md:127-127`, `docs/API.md:368-368`
- **O que falta:** Entrada no menu e estado de erro em RelatoriosExecutivos.tsx.
- **Evidência:** rota /relatorios-executivos → src/pages/RelatoriosExecutivos.tsx (AppRoutes.tsx); sem entrada no menu (sidebarMenuData.ts) → só acessível por URL| cético: Rota AppRoutes.tsx:651 sob <Manager>; link existe em IntelligenceCommandBar.tsx:30 (montado via IntelligenceCockpit.tsx:23 ← IntelligenceModule.tsx:60 ← Index.tsx:73), sem item no sidebarMenuData.ts. Dados reais (RelatoriosExecutivos.tsx:78-88 useQuery supabase), mas só trata isLoading (:301); sem estado de erro; QBRStoryGenerator.tsx:30 usa heurística fixa 'Simplistic logic'.

### F3393 · Rota /relatorios/vendas (4 afirmações nos docs)

- **Tipo:** Rota/tela
- **O que os docs afirmam:** SalesReportPage + components/reports/sales/* via useSalesReport.ts:44 sobre view sales_with_markup (954); usa isWonSaleStatus.| Rota registrada em AppRoutes.tsx com acesso "autenticado", GET em produção 200. Status no doc: OK \| Rota /relatorios/vendas (AppRoutes.tsx:216) renderiza src/pages/SalesReportPage.tsx; role: autenticado (explícito). Classificação do doc: IMPLEMENTADO_PARCIAL. Evidência: link src/pages/SalesReportPage.tsx:87 · sb=1 useQuery=1 mut=0 (árvore 22 arq.) · somente leitura — nenhuma mutação/persistência na árvore \| API.md declara a rota `/relatorios/vendas` renderizando o componente SalesReportPage com acesso "autenticado".
- **Fontes:** `docs/estado/04_DOMINIO_ANALYTICS_BI.md:160`, `docs/prod-readiness.md:225`, `docs/estado/01_FRONTEND_ROTAS.md:142-142`, `docs/API.md:383-383`
- **O que falta:** Link/menu para /relatorios/vendas.
- **Evidência:** rota /relatorios/vendas → src/pages/SalesReportPage.tsx (AppRoutes.tsx); sem entrada no menu (sidebarMenuData.ts) → só acessível por URL| cético: Rota AppRoutes.tsx:727; dados reais de view sales_with_markup (useSalesReport.ts:51,58; views.md:679). Nenhum link: grep '/relatorios/vendas' em src só acha AppRoutes e SalesReportPage.tsx:92 (<link rel=canonical>); sem entrada no sidebarMenuData.ts.

### F3394 · Rota /revenue-intelligence (4 afirmações nos docs)

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Rota /revenue-intelligence (AppRoutes.tsx:152) renderiza src/pages/RevenueIntelligence.tsx; role: admin ou manager. Classificação do doc: IMPLEMENTADO_TOTAL. Evidência: menu (sidebarMenuData.ts) · sb=1 useQuery=1 mut=1 (árvore 6 arq.)| Revenue Intelligence com Deal Health Score, forecast 30/60/90 e painel de sinais de risco; acesso Manager. \| API.md declara a rota `/revenue-intelligence` renderizando o componente RevenueIntelligence com acesso "admin ou gestor". \| Rota registrada em AppRoutes.tsx com acesso "admin_ou_gestor", GET em produção 200, chamando as edge functions analyze-conversation, analyze-win-loss, calculate-deal-health, calibrate-win-probability, compute-forecast-accuracy, …
- **Fontes:** `docs/estado/01_FRONTEND_ROTAS.md:83-83`, `docs/FUNCIONALIDADES_SISTEMA.md:570-574`, `docs/API.md:324-324`, `docs/prod-readiness.md:229`
- **O que falta:** Publicar as 6 edges ausentes (ou remover chamadas) e incluir /revenue-intelligence no sidebarMenuData.ts.
- **Evidência:** rota /revenue-intelligence → src/pages/RevenueIntelligence.tsx (AppRoutes.tsx); sem entrada no menu (sidebarMenuData.ts) → só acessível por URL| cético: Rota AppRoutes.tsx:356 sob <Manager>; links em CommandPalette.tsx:178, IntelligenceCockpit.tsx:292, IntelligenceCommandBar.tsx:22 (sem item no sidebar). PipelineStrategicReview corrigido (#442, 2ed73dc88). Mas edges chamadas na árvore estão fora da allowlist deploy.yml:144: qbr-generator (useRevenueIntelligenceHub.ts:201), snapshot-forecast (useForecastAccuracy.ts:118), compute-forecast-accuracy (useForecastAccuracy.ts:137), generate-revenue-forecast (useRevenueForecast.ts:112), predict-quota-attainment (useQuotaAttainment.ts:124), calibrate-win-probability (useWinProbabilityCalibration.ts:115).

### F0609 · UI useABCAnalysis: página dedicada com curvas A/B/C, exportação e ações em massa

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Falta página dedicada com curvas A/B/C, exportação e ações em massa para useABCAnalysis (UI atual: aba dentro de Analytics).
- **Fontes:** `docs/FUNCIONALIDADES_SEM_UI.md:27`
- **O que falta:** Ações em massa e estado de erro.
- **Evidência:** Página dedicada existe: /analytics/abc src/routes/AppRoutes.tsx:567-570 → src/pages/ABCAnalysisPage.tsx → src/components/analytics/ABCAnalysis.tsx:4,27 (useABCAnalysis lê sales/clients: src/hooks/bi/useABCAnalysis.ts:126,129), loading :37, exportação CSV :53-68. Faltas: ações em massa ausentes (`grep -n -iE 'bulk\|massa\|selecionad' src/components/analytics/ABCAnalysis.tsx` → 0), sem estado de erro (só isLoading :27), sem entrada no menu (`grep analytics/abc sidebarMenuData.ts` → 0).| cético: Confirmado: `grep -n -iE 'bulk\|massa\|selecionad\|checkbox\|isError'` em src/components/analytics/ABCAnalysis.tsx → 0. Ressalva: a página dedicada é acessível pelo botão em ABCAnalysis.tsx:107 dentro de /analytics (src/pages/Analytics.tsx:8), embora não esteja no menu.

### F0610 · UI useEvolutionCurves: página comparativa com seleção de métricas

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Falta página comparativa com seleção de métricas para useEvolutionCurves (UI atual: componente solto).
- **Fontes:** `docs/FUNCIONALIDADES_SEM_UI.md:30`
- **O que falta:** Seletor de métricas comparáveis.
- **Evidência:** Página existe: /analytics/evolution src/routes/AppRoutes.tsx:591-594 → src/pages/EvolutionCurvesPage.tsx:7,14-15 (useEvolutionCurves lê salespeople/sales: src/hooks/useEvolutionCurves.ts:24,40) com estados loading/erro/vazio :76-89. Sem seleção de métricas: `grep -n -iE 'metric\|métrica\|select' src/pages/EvolutionCurvesPage.tsx` → 0; sem entrada no menu (`grep analytics/evolution sidebarMenuData.ts` → 0).| cético: Confirmado: src/components/competitive/EvolutionChart.tsx:36-37,43,101 só permite escolher período e vendedores, não métricas; montado em src/pages/EvolutionCurvesPage.tsx:61. Acesso pelo botão em EvolutionChart.tsx:72 (/analytics/evolution), sem menu.

### F0611 · `get_embedded_report_by_token` executável por anon (relatórios embed)

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** ADR-008: get_embedded_report_by_token acessível a anon para relatórios embed via token opaco.
- **Fontes:** `docs/decisions/ADR-008-anon-executable-security-definer.md:17-17`
- **O que falta:** Conceder EXECUTE a anon e usar a RPC, ou remover a função e a tabela embedded_report_tokens órfãs e corrigir ADR-008/API.md.
- **Evidência:** Função existe e valida token ativo, expiração e relatório (contexto/supabase/functions/public/get_embedded_report_by_token__7fa04b66783abb8f.sql, SECURITY DEFINER, search_path=public), mas o banco real NÃO concede EXECUTE a anon: contexto/supabase/functions.md:223 coluna 'EXECUTE (roles API)' = authenticated, service_role — contradiz docs/decisions/ADR-008 e API.md. Sem chamador no código (functions.md:223 código '—'; `grep -rn get_embedded_report_by_token src` → só types.ts:24536). A rota /embed usa outro modelo: report_embed_tokens via report-embed-public (index.ts:157-161). embedded_report_tokens 0 linhas (stats.md:196).| cético: Confirmado: no banco real, a coluna EXECUTE da função é 'authenticated, service_role' (contexto/supabase/functions.md:223), sem anon e sem chamador ('—'). A migration supabase/migrations/20260711134320_f46c46d9-295a-4e9e-a0da-ca57174d135d.sql:48-52 previa gr…

### F0612 · Allowlist de entidades + validação regex de campos/operadores nas edge functions de BI

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** Edge functions de relatório usam allowlist de entidades e regex para validar campos e operadores, evitando injeção.
- **Fontes:** `docs/REPORTING_BI_COMPLETE.md:69`
- **O que falta:** Rejeitar com 400 os campos e operadores inválidos e deployar report-builder-execute.
- **Evidência:** Allowlist/regex presentes nas duas functions: supabase/functions/report-embed-public/index.ts:16-19 (SAFE_FIELD, SAFE_PREFIXED, ALLOWED_ENTITIES, ALLOWED_OPS), :222-227 entidade fora da lista → 400; supabase/functions/report-builder-execute/index.ts:26-34,51-52 e 400 para entidade (:156-161). Porém campo/operador inválidos são ignorados silenciosamente (`continue`) e não rejeitados com 400 (embed :250-252,262-263; builder :176-178,189); report-builder-execute está fora da allowlist de deploy (deploy.yml:144 → grep 0).| cético: Confirmado: o critério exige erro 400 para campo/operador, mas são descartados com `continue` em supabase/functions/report-embed-public/index.ts:250-252,262-263 e supabase/functions/report-builder-execute/index.ts:176-178,189. report-builder-execute está fora de deploy.yml:144.

### F0614 · C10 dedupe-metricas (#22)

- **Tipo:** Service/lib
- **O que os docs afirmam:** LEDGER: A FAZER; sobrepõe #264/#265.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/LEDGER_EXECUCAO_2026-10-14.md:19`
- **O que falta:** Uma fonte por métrica: unificar forecast em revenue-forecast-ai (remover generate-revenue-forecast e chamadas em src/hooks/revenue-intelligence/useRevenueForecast.ts:111 e src/hooks/pipeline-pulse/useQuickAction.ts:27); unificar workflow em execute-workflow (remover chamada src/hooks/useWorkflows.ts:136); escolher entre extract-deal-stakeholders e extract-committee-from-call; consolidar definição de deal em risco; atualizar LEDGER_EXECUCAO_2026-10-14.md:20.
- **Evidência:** Item #22 'Números diferentes para a mesma coisa' (docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:136) listava: 2 calibrações de win-probability, 2 forecasts, 2 motores de workflow, 2 de cadência, 2 extrações de stakeholders, 4 definições de deal em risco. Parcialmente resolvido: `calibrate-win-probabilities` e `refresh-stage-baselines` removidos (docs/agentes/mapa-do-sistema.md:42; ausente: `ls supabase/functions| grep -E 'calibrate-win-probabilities\|refresh-stage-baselines'` → 0; só resta src/hooks/revenue/useWinProbabilityCalibration.ts). Ainda duplicados e com chamadores no front: forecast — src/hooks/forecast/useRevenueForecast.ts:57 invoca `revenue-forecast-ai` e src/hooks/revenue-intelligence/useRevenueForecast.ts:111 invoca `generate-revenue-forecast` (só `revenue-forecast-ai` está na allowlist .github/workflows/deploy.yml:144; `generate-revenue-forecast` não roda…

### F3403 · Tipos de meta: revenue, deals, calls, meetings, emails

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Doc fixa tipos de meta suportados.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:433`
- **O que falta:** Falta um campo goal_type único, com enum ou CHECK, aceitando os 5 tipos (revenue, deals, calls, meetings, emails), e uma tela que crie meta de cada tipo. Hoje a receita fica em sales_goals.goal_amount. progressive_goals é texto livre, sem emails, e não tem tela que crie meta. calls, meetings e emails só existem como metas de atividade (activity_goals). Não há meta editável de deals. Os hooks useGoals.ts e useGoalsDashboard.ts citados na doc não existem.
- **Evidência:** A tabela sales_goals não tem goal_type. As colunas são id, salesperson_id, month, goal_amount e created_at (snapshot tables/public/sales_goals.md:20-24), então ela guarda só meta de receita. Os tipos aparecem espalhados: progressive_goals.goal_type é text NOT NULL, default 'revenue', sem CHECK, só UNIQUE, com RLS (tables/public/progressive_goals.md:7, 21, 38). Os rótulos ficam em src/hooks/useProgressiveGoals.ts:17-22 e cobrem só revenue, deals, calls e meetings, sem emails. O hook só lê (select em src/hooks/useProgressiveGoals.ts:42-46). activity_goals tem calls_goal, emails_goal e meetings_goal, com RLS (tables/public/activity_goals.md:7, 21-23). A rota /metas existe (src/routes/AppRoutes.tsx:882-887) e /metas-atividades também (AppRoutes.tsx:889). Os hooks que a doc cita (docs/DOCUMENTACAO_SISTEMA.md:433-437) não existem: ls src/hooks/useGoals.ts src/hooks/useGoalsDashboard.ts → arqu…
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Não implementado.

### F0624 · Testes de BI/relatórios (bi 0/30, analytics 0/54, dashboard 0/66, reports 0/13)

- **Tipo:** Teste
- **O que os docs afirmam:** Diretórios sem nenhum teste.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:102`
- **O que falta:** Ao menos um teste unitário em src/components/bi/ e um em src/components/dashboard/; atualizar docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:102 (analytics e reports já têm testes).
- **Evidência:** Contagem por diretório (find _.test._/_.spec._): src/components/bi → 30 arquivos, 0 testes; src/components/dashboard → 57 arquivos, 0 testes; src/components/analytics → 53 arquivos, 3 testes (ABCMatrixShift.test.ts, ABCActionableAutomations.test.ts, ABCAnalysis.test.tsx); src/components/reports → 14 arquivos, 1 teste (EmailReportConfig.test.tsx:1-12, render real com supabase mockado). Nenhum teste em tests/ ou src/pages/_.test.tsx cobre components/bi ou components/dashboard (grep → só src/pages/DealVelocityPage.test.tsx e Index.test.tsx, que não importam esses diretórios).| cético: find por *.test.*/_.spec.*: src/components/bi 30 arquivos/0 testes; src/components/dashboard 57/0; src/components/analytics 53/3 (ABCMatrixShift.test.ts, ABCActionableAutomations.test.ts, ABCAnalysis.test.tsx); src/components/reports 14/1 (EmailReportConfig.test.tsx). Único teste que referencia components/das…
