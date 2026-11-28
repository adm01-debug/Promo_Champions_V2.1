# Customer Success e pós-venda

[Voltar ao índice](README.md)

43 itens não implementados, parciais ou não verificáveis neste domínio.

## Não implementado (7)

### F0083 · Whitespace analysis (cross-sell por conta)

- **Tipo:** Componente
- **O que os docs afirmam:** Falta análise de oportunidades de cross-sell por conta.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:81`
- **O que falta:** Criar matriz conta × produto/categoria (via sale_items/sales × products) com lacunas destacadas, hook próprio e aba no CustomerSuccess360Hub.
- **Evidência:** Nenhuma matriz conta × produto: grep -rn -i 'whitespace' src/ supabase/functions → apenas classes CSS (whitespace-nowrap) em reporting/sales; grep -rln -i 'cross.sell' src/ → só rótulo em src/components/customer-success/cs360Helpers.ts:43 (EXPANSION_TYPE_LABEL) e simuladores. O mais próximo é src/hooks/useProductRecommendations.ts:15-70 (recomendação produto→produto por co-compra em sales, usado em PricingIntelligenceHub.tsx:12), que não é por conta nem destaca lacunas.| cético: grep -rln -i 'white.space\|whitespace_\|nunca comprou\|não comprou\|cross.sell\|crossSell\|cross_sell' src supabase/functions → só texto/rótulos (ScenarioSimulator.tsx, HelpdeskConnectorPanel.tsx:235, cs360Helpers.ts, useSalespersonCoaching.ts:156, coaching-intelligence/index.ts:112). Os candidatos mais próximos não são matriz conta × produto: Client360AffinityCard.tsx é só pizza de 'Mix de Categorias' do que fo…

### F3219 · Agendamento (cron) expansion-detector (3 afirmações nos docs)

- **Tipo:** Agendamento (cron)
- **O que os docs afirmam:** NÃO INICIADO: expansion-detector só com 1 chamador manual em src/; 0 em migrations.| expansion-detector só roda por botão em HelpdeskConnectorPanel. \| expansion-detector é edge batch sem cron e sem auth de cron; roda só por invoke manual no front.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:202`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:118`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/F_banco_dados.md:166`
- **O que falta:** Criar job pg_cron (ex.: trigger_internal_edge_job('expansion-detector')) com auth de cron no handler, ou registrar decisão de manter manual.
- **Evidência:** nenhum job em pg_cron para "expansion-detector" (cron.md, 45 jobs)| cético: cron.md (45 jobs) sem expansion-detector: grep -niE expansion cron.md → 0; grep em supabase/migrations, .github/workflows (exceto allowlist deploy.yml:144) e functions/*.sql do banco → 0. Único gatilho: botão em src/components/customer-success/HelpdeskConnectorPanel.tsx:124 (invoke manual). A function está na allowlist (deploy.yml:144), então roda, mas só manualmente.

### F3220 · Agendamento (cron) helpdesk-sync (3 afirmações nos docs)

- **Tipo:** Agendamento (cron)
- **O que os docs afirmam:** helpdesk-sync importa isAuthorizedCronRequest/X-Cron-Secret mas não tem cron.schedule nem entrada na allowlist de trigger_internal_edge_job (mig/20261002010000:27-38). Sync de helpdesk só manual.| NÃO INICIADO: helpdesk-sync só com 1 chamador manual em src/; 0 em migrations. \| helpdesk-sync sem cron.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/F_banco_dados.md:160`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:202`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:128`
- **O que falta:** Agendar helpdesk-sync em pg_cron (direto ou via trigger_internal_edge_job com helpdesk-sync na allowlist da função) e comprovar execução em cron-runs.
- **Evidência:** nenhum job em pg_cron para "helpdesk-sync" (cron.md, 45 jobs)| cético: cron.md sem helpdesk-sync (grep -niE helpdesk cron.md → 0); nenhuma ocorrência em migrations/workflows/funções SQL do banco. Handler já aceita cron: supabase/functions/helpdesk-sync/index.ts:6 importa isAuthorizedCronRequest e :86 usa; está na allowlist deploy.yml:144. Chamador só manual: HelpdeskConnectorPanel.tsx:44.

### F3221 · Agendamento (cron) qbr-scheduler (5 afirmações nos docs)

- **Tipo:** Agendamento (cron)
- **O que os docs afirmam:** NÃO INICIADO: qbr-scheduler só com 1 chamador manual em src/; 0 em migrations.| qbr-scheduler sem cron. \| qbr-scheduler é edge batch sem cron e sem auth de cron; roda só por invoke manual no front. \| qbr-generator e QBRGeneratorPanel existem; qbr-scheduler sem cron, disparado por botão em HelpdeskConnectorPanel. \| Função periódica sem entrada em cron.job.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:202`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:128`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/F_banco_dados.md:166`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:90`, `docs/estado/ESTADO_ATUAL.md:129-130`
- **O que falta:** Incluir qbr-scheduler na allowlist (deploy.yml:144), adicionar auth de cron no handler e criar job pg_cron.
- **Evidência:** nenhum job em pg_cron para "qbr-scheduler" (cron.md, 45 jobs)| cético: cron.md sem qbr-scheduler (grep -niE qbr cron.md → 0). Além disso a function está FORA da allowlist de deploy (.github/workflows/deploy.yml:144, grep -cx qbr-scheduler → 0), logo nem o botão manual (HelpdeskConnectorPanel.tsx:101) funciona em produção. Handler exige JWT admin/manager (qbr-scheduler/index.ts:20-43), sem caminho de auth de cron.

### F3222 · Agendamento (cron) renewal-automation (5 afirmações nos docs)

- **Tipo:** Agendamento (cron)
- **O que os docs afirmam:** Doc: lógica completa (REAL) mas só rodam à mão por botões.| NÃO INICIADO: renewal-automation só com 1 chamador manual em src/; 0 em migrations. \| renewal-automation sem cron. \| renewal-automation é edge batch sem cron e sem auth de cron; roda só por invoke manual no front. \| renewal-automation só roda por botão em HelpdeskConnectorPanel.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:249-249`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:202`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:128`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/F_banco_dados.md:166`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:118`
- **O que falta:** Publicar renewal-automation (allowlist deploy.yml:144), adicionar auth de cron e agendar em pg_cron, ou documentar decisão de manter manual.
- **Evidência:** nenhum job em pg_cron para "renewal-automation" (cron.md, 45 jobs)| cético: cron.md sem renewal-automation (grep -niE renewal cron.md → 0); nenhuma ocorrência em migrations/workflows. Function FORA da allowlist deploy.yml:144 (grep -cx renewal-automation → 0); único chamador é botão HelpdeskConnectorPanel.tsx:61. Nenhum doc registra decisão de manter manual (grep em docs/agentes → 0).

### F3223 · Cron de CS para csat-ces-trigger

- **Tipo:** Agendamento (cron)
- **O que os docs afirmam:** NÃO INICIADO: csat-ces-trigger só com 1 chamador manual em src/; 0 em migrations.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:202`
- **O que falta:** Job pg_cron para disparo periódico de pesquisas CSAT/CES (ou decisão documentada de manter disparo manual por conta).
- **Evidência:** nenhum job em pg_cron para "csat-ces-trigger" (cron.md, 45 jobs)| cético: cron.md sem csat-ces-trigger (grep -niE csat cron.md → 0); ausente em migrations/workflows/funções SQL. Function está na allowlist (deploy.yml:144) e é chamada só manualmente por src/components/customer-success/SurveyTriggerDialog.tsx:55.

### F3224 · Cron de CS para qbr-generator

- **Tipo:** Agendamento (cron)
- **O que os docs afirmam:** NÃO INICIADO: qbr-generator só com 1 chamador manual em src/; 0 em migrations.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:202`
- **O que falta:** Publicar qbr-generator (allowlist) e criar job pg_cron, ou decidir manter manual.
- **Evidência:** nenhum job em pg_cron para "qbr-generator" (cron.md, 45 jobs)| cético: cron.md sem qbr-generator (grep -niE qbr cron.md → 0). Function FORA da allowlist deploy.yml:144 (grep -cx qbr-generator → 0); único chamador manual src/hooks/revenue/useRevenueIntelligenceHub.ts:201.

## Parcial (35)

### F0077 · CSAT/CES surveys (existe só NPS)

- **Tipo:** Componente
- **O que os docs afirmam:** Existe apenas NPS; faltam CSAT/CES.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:100`
- **O que falta:** Enviar a pesquisa de fato (chamar send-transactional-email/send-multichannel-message, que estão na allowlist, a partir de csat-ces-trigger/index.ts:74); criar rota pública de resposta que grave score/responded_at; deixar escolher a conta no SurveyTriggerDialog.
- **Evidência:** Já existe CSAT/CES além do NPS (doc GAPS_CLASSE_MUNDIAL.md:100 desatualizado), mas sem envio real. Banco: tables/public/csat_ces_surveys.md (RLS sim, 2 policies cs_sv_select/cs_sv_modify), stats.md:79 ~110 linhas. Edge: supabase/functions/csat-ces-trigger/index.ts:73-86 apenas insere linha com sent_at=now() — nenhum fetch a e-mail/WhatsApp; função na allowlist (.github/workflows/deploy.yml:144). UI: src/components/customer-success/SurveyTriggerDialog.tsx:55 invoca 'csat-ces-trigger'; montado em CS360Tabs.tsx:415-421 (aba surveys) dentro de CustomerSuccess360Hub.tsx:391 → rota /customer-success-360 (AppRoutes.tsx:791, menu sidebarMenuData.ts:308). Respostas listadas em CS360Tabs.tsx:423-440 a partir de customer-success-360/index.ts:61.| cético: Confirmado: supabase/functions/csat-ces-trigger/index.ts:74-86 só faz insert em csat_ces_surveys com sent_at=now() e responded_at preenchido quan…

### F0078 · Expansion playbooks (upsell/cross-sell)

- **Tipo:** Componente
- **O que os docs afirmam:** Falta playbooks de expansão.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:99`
- **O que falta:** Tela/CRUD de expansion_playbooks; cron do expansion-detector; geração de tasks a partir das expansion_opportunities.
- **Evidência:** Backend existe, UI de playbook não. Banco: tables/public/expansion_playbooks.md (RLS sim, 2 policies; colunas trigger_type/trigger_config/expansion_type) com 0 linhas (stats.md:412); expansion_opportunities ~10 linhas (stats.md:80). Edge expansion-detector (na allowlist deploy.yml:144): index.ts:100-106 lê playbooks ativos, :120-135 cruza accounts × product_usage_summary, :188-193 insere expansion_opportunities; com 0 playbooks retorna sem fazer nada (:107-114). Disparo manual: src/components/customer-success/HelpdeskConnectorPanel.tsx:124; exibição: CS360Tabs.tsx:378-383 (aba Expansion). Faltas: grep -rn 'expansion_playbooks' src/ (fora types.ts) → 0 resultados (nenhum CRUD/tela para criar playbook); grep -i expansion em contexto/supabase/cron.md → 0 (sem agendamento); nenhuma ligação playbook → tarefas (tasks).| cético: Confirmado: grep -rn 'expansion_playbooks' src (fora types.ts) → …

### F0081 · Painel de risco de churn em /analytics com dados reais

- **Tipo:** Componente
- **O que os docs afirmam:** Mostra clientes de exemplo; fatores fixos.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:245`
- **O que falta:** Passar predições reais ao ChurnPredictionPanel em Analytics.tsx e remover DEFAULT_PREDICTIONS (ChurnPredictionPanel.tsx:48-90), com estado vazio honesto.
- **Evidência:** Afirmação confirmada para a aba 'Risco Churn': src/components/analytics/ChurnPredictionPanel.tsx:48-90 define DEFAULT_PREDICTIONS fictícias ('Tech Solutions LTDA', 'Inovação Digital SA', 'Global Services ME') com fatores fixos; :233-239 `const predictions = externalPredictions|\| DEFAULT_PREDICTIONS`; src/pages/Analytics.tsx:113 monta <ChurnPredictionPanel> sem props → sempre dados de exemplo. A aba 'Churn' (Analytics.tsx:106 → ChurnPrediction.tsx:59 → useChurnPrediction.ts:24-28) lê clients reais, mas o score é heurístico sobre updated_at (:40-45). \| cético: Confirmado: src/components/analytics/ChurnPredictionPanel.tsx:48-51 DEFAULT_PREDICTIONS ('Tech Solutions LTDA'...), :239 `externalPredictions \|\| DEFAULT_PREDICTIONS`; src/pages/Analytics.tsx:113 ('churn-risk': ChurnPredictionPanel) é renderizado em :210-214 como `<Component />` sem props → sempre dados fictícios. A aba 'churn' (…

### F0086 · CSAT/CES enviada de fato

- **Tipo:** Edge function
- **O que os docs afirmam:** Grava pesquisa como enviada e não envia nada.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:242`
- **O que falta:** Disparar envio real (e-mail/WhatsApp) com link de resposta após o insert, e criar endpoint/página pública que grave score/responded_at.
- **Evidência:** Afirmação confirmada: supabase/functions/csat-ces-trigger/index.ts:73-86 faz apenas insert em csat_ces_surveys com sent_at=new Date() e responded_at quando score vem no body; não há nenhuma chamada a provedor (grep -n 'fetch\|send-transactional-email\|send-multichannel\|resend\|whatsapp' supabase/functions/csat-ces-trigger/index.ts → 0). Chamador: src/components/customer-success/SurveyTriggerDialog.tsx:55; toast 'registrado' (:64) em vez de 'enviado'.| cético: Confirmado: supabase/functions/csat-ces-trigger/index.ts:74-96 só insere uma linha e devolve {survey}. Não há fetch nem chamada a send-transactional-email/send-multichannel-message no arquivo.

### F3225 · Edge function customer-success-360 (13 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** Quatro edge functions de CS: visão 360, hub, automação de renovação e detector de expansão.| customer-success-360 devolve até centenas de contas, tickets, renovações, pesquisas e pedidos; assume orders.user_id = account_id. \| 360 agrega 9 tabelas (accounts, csat_ces_surveys, expansion_opportunities, onboarding_journeys, orders, product_usage_summary, qbr_schedule, renewals, support_tickets); hub lê accounts + account_activities. Ambas somente-leitura, ambas ✅. \| L415 C: customer-success-360/index.ts:17-25; pipeline-pulse-aggregator/index.ts:62-77. \| Hub sem verificação de identidade; service role retorna agregados financeiros/PII. \| customer-success-360/index.ts:73-76 usa orders.user_id…
- **Fontes:** `docs/agentes/mapa-do-sistema.md:18,62`, `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:180-182`, `docs/estado/10_EDGE_FUNCTIONS.md:266-277`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:260`, `docs/auditoria/RELATORIO_FALHAS.md:415-419`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:153` e mais 7
- **O que falta:** Propagar .error das 9 consultas em customer-success-360/index.ts:65-72 (hoje engolido); decidir consolidar com customer-success-hub.
- **Evidência:** supabase/functions/customer-success-360/index.ts existe; está na allowlist de deploy (.github/workflows/deploy.yml:144); ÓRFÃ: nenhum chamador no front, em edges ou em SQL/cron (edge-functions.json)| cético: A pré-checagem errou ao chamá-la ÓRFÃ: chamador real src/hooks/customer-success/useCustomerSuccess360.ts:139-143 (functions.invoke('customer-success-360')), usado em src/components/customer-success/CustomerSuccess360Hub.tsx:13,29, montado por src/pages/CustomerSuccess360.tsx:9, rota /customer-success-360 em src/routes/AppRoutes.tsx:791-795 (Manager), menu sidebarMenuData.ts:308; na allowlist deploy.yml:144. Claims dos docs já corrigidos: checagem de papel is_admin_or_manager com 401/403 (customer-success-360/index.ts:15-40; RPC existe no banco functions.md:261); join orders→quotes→sales→accounts em vez de orders.user_id (index.ts:73-79). Tabelas (accounts, support_tickets, renewals,…

### F3226 · Edge function customer-success-hub (5 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** Catálogo API.md lista a edge function `customer-success-hub` na categoria "Customer Success" com auth "nenhuma detectada no handler · verify_jwt", método "qualquer", payload "—" e resposta "JSON {accounts, error}".| 150 linhas; chamador: FE src/hooks/useCustomerSuccess.ts; verify_jwt true (default); tabelas tocadas (linhas em produção): account_activities(360), accounts(100). Classificação do doc: IMPLEMENTADO_TOTAL. \| Doc classifica como REAL. Chamador(es): FE hooks/useCustomerSuccess.ts:46. Sobreposição com customer-success-360. \| supabase/functions/customer-success-hub existe no repo (citada em src/: sim); sonda OPTIONS em produção: OPTIONS → 200. Status no doc: OK. \| Uma das 64/168 f…
- **Fontes:** `docs/API.md:123-123`, `docs/estado/10_EDGE_FUNCTIONS.md:351-351`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:80-80`, `docs/prod-readiness.md:305`, `docs/estado/09_HOOKS_SERVICES.md:291-311`
- **O que falta:** Checar .error em customer-success-hub/index.ts:70; adicionar estado de erro em CustomerSuccessHub.tsx; decidir consolidar com customer-success-360.
- **Evidência:** supabase/functions/customer-success-hub/index.ts existe; está na allowlist de deploy (.github/workflows/deploy.yml:144); ÓRFÃ: nenhum chamador no front, em edges ou em SQL/cron (edge-functions.json)| cético: Não é ÓRFÃ: src/hooks/useCustomerSuccess.ts:39-50 invoca 'customer-success-hub', consumido em src/components/customer-success/CustomerSuccessHub.tsx:20,97, montado em src/pages/CustomerSuccessHub.tsx:9, rota /customer-success (AppRoutes.tsx:763-766), menu sidebarMenuData.ts:307; na allowlist deploy.yml:144; auth admin/manager com 401/403 (customer-success-hub/index.ts:43-67); accounts e account_activities com RLS (tables.md). Lacunas reais: edge engole erro da consulta de accounts (index.ts:70-79: `const { data: accounts }` sem .error, devolve {accounts:[]}) e a UI não trata erro (CustomerSuccessHub.tsx:97 só lê isLoading; sem isError → falha/403 vira painel vazio).

### F0087 · Edge function health publicada e iniciando

- **Tipo:** Edge function
- **O que os docs afirmam:** supabase/functions/health existe no repo (citada em src/: sim); sonda OPTIONS em produção: OPTIONS → 404 NOT_FOUND (não publicada; limite de 100 funções do plano). Status no doc: BLOQUEADO.
- **Fontes:** `docs/prod-readiness.md:345`
- **O que falta:** Liberar uma vaga e incluir 'health' na allowlist de deploy.yml:144; tornar o smoke test bloqueante.
- **Evidência:** supabase/functions/health/index.ts:1-30 existe (retorna {status:'ok',version,timestamp}, sem auth/banco). Não está na allowlist ACTIVE: .github/workflows/deploy.yml:144 expandida contém só 'calculate-deal-health' e 'wal-health-alert', não 'health' → não roda em produção; docs/prod-readiness.md:345 registra OPTIONS → 404 NOT_FOUND. Chamador em src/: grep -rn "functions/v1/health\|invoke('health'" src/ → 0; o único consumidor é o smoke test deploy.yml:177-186, que tolera falha com ::warning.| cético: supabase/functions/health/index.ts existe. 'health' não está na allowlist: a lista ACTIVE extraída de .github/workflows/deploy.yml:144 (100 nomes) com grep -x health → 0. docs/prod-readiness.md:345 registra OPTIONS → 404 NOT_FOUND (BLOQUEADO). O smoke test deploy.yml:177-185 só emite ::warning. Não há chamador em src/.

### F3227 · Edge function qbr-generator (5 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** Catálogo API.md lista a edge function `qbr-generator` na categoria "Customer Success" com auth "Bearer manual · verify_jwt", método "qualquer", payload "period_start, period_end, period_label, salesperson_id" e resposta "JSON {error}".| 142 linhas; chamador: FE src/hooks/revenue/useRevenueIntelligenceHub.ts; verify_jwt true (default); tabelas tocadas (linhas em produção): qbr_reports(0). Classificação do doc: PARCIAL. \| Doc classifica como REAL. Chamador(es): FE hooks/revenue/useRevenueIntelligenceHub.ts:201. LOVABLE_API_KEY. \| supabase/functions/qbr-generator existe no repo (citada em src/: sim); sonda OPTIONS em produção: OPTIONS → 404 NOT_FOUND (não publicada; limite de 100 funções do …
- **Fontes:** `docs/API.md:125-125`, `docs/estado/10_EDGE_FUNCTIONS.md:417-417`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:148-148`, `docs/prod-readiness.md:373`, `docs/estado/07_DOMINIO_WINLOSS_COMPETITIVE.md:254`
- **O que falta:** Incluir qbr-generator na allowlist de deploy (exige tirar outra das 100) e verificar gravação em qbr_reports.
- **Evidência:** supabase/functions/qbr-generator/index.ts existe; FORA da allowlist de deploy (.github/workflows/deploy.yml:144) → não roda em produção; chamada por: src/hooks/revenue/useRevenueIntelligenceHub.ts| cético: supabase/functions/qbr-generator/index.ts existe, usa LOVABLE_API_KEY (:72); chamador real src/hooks/revenue/useRevenueIntelligenceHub.ts:201 via QBRGeneratorPanel montado em src/components/revenue-intelligence/RevenueIntelligenceHub.tsx:254. Porém FORA da allowlist .github/workflows/deploy.yml:144 (grep -cx qbr-generator → 0) → não publicada; qbr_reports existe com RLS (tables.md) mas recebe 0 linhas.

### F3228 · Edge function qbr-scheduler (6 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** `CS360Tabs.tsx:495` → `qbr-scheduler` → `qbr_schedule` (20); sem cron.| Catálogo API.md lista a edge function `qbr-scheduler` na categoria "Customer Success" com auth "nenhuma detectada no handler · verify_jwt", método "qualquer", payload "action" e resposta "JSON {ok, schedules_updated, upcoming_qbrs, events_create…". \| 155 linhas; chamador: FE src/components/customer-success/HelpdeskConnectorPanel.tsx; verify_jwt true (default); tabelas tocadas (linhas em produção): agenda_events(0), notifications(6). Classificação do doc: IMPLEMENTADO_TOTAL. \| Doc classifica como REAL. Chamador(es): FE components/customer-success/HelpdeskConnectorPanel.tsx:101. Só manual. \| supabase/functions/qbr-sche…
- **Fontes:** `docs/estado/07_DOMINIO_WINLOSS_COMPETITIVE.md:253`, `docs/API.md:126-126`, `docs/estado/10_EDGE_FUNCTIONS.md:418-418`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:149-149`, `docs/prod-readiness.md:374`, `docs/prod-readiness.md:980`
- **O que falta:** Publicar qbr-scheduler (allowlist) e agendar via pg_cron com auth de cron.
- **Evidência:** supabase/functions/qbr-scheduler/index.ts existe; FORA da allowlist de deploy (.github/workflows/deploy.yml:144) → não roda em produção; chamada por: src/components/customer-success/HelpdeskConnectorPanel.tsx| cético: supabase/functions/qbr-scheduler/index.ts existe (auth admin/manager :20-43; chama RPC schedule_next_qbrs, presente no banco functions.md:329); chamador src/components/customer-success/HelpdeskConnectorPanel.tsx:101, montado em CS360Tabs.tsx:504 → rota /customer-success-360. FORA da allowlist deploy.yml:144 (grep -cx qbr-scheduler → 0) → 404 em produção; sem cron (cron.md).

### F3229 · Edge function renewal-automation (5 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** `CS360Tabs.tsx:495` (`HelpdeskConnectorPanel`) → `renewal-automation` → `renewals` (100), `tasks`, `notifications`; `client_renewals` 0; sem cron, só manual.| Catálogo API.md lista a edge function `renewal-automation` na categoria "Alertas / Monitoramento" com auth "nenhuma detectada no handler · verify_jwt", método "qualquer", payload "—" e resposta "JSON {ok, risk_updated, renewals_inspected, tasks_created…". \| 145 linhas; chamador: FE src/components/customer-success/HelpdeskConnectorPanel.tsx; verify_jwt true (default); tabelas tocadas (linhas em produção): notifications(6), tasks(600). Classificação do doc: IMPLEMENTADO_TOTAL. \| Doc classifica como REAL. Chamador(es): FE components/cu…
- **Fontes:** `docs/estado/07_DOMINIO_WINLOSS_COMPETITIVE.md:251`, `docs/API.md:42-42`, `docs/estado/10_EDGE_FUNCTIONS.md:425-425`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:156-156`, `docs/prod-readiness.md:380`
- **O que falta:** Publicar renewal-automation (allowlist) e agendar via pg_cron.
- **Evidência:** supabase/functions/renewal-automation/index.ts existe; FORA da allowlist de deploy (.github/workflows/deploy.yml:144) → não roda em produção; chamada por: src/components/customer-success/HelpdeskConnectorPanel.tsx| cético: supabase/functions/renewal-automation/index.ts existe; chamador HelpdeskConnectorPanel.tsx:61 (montado em CS360Tabs.tsx:504). FORA da allowlist deploy.yml:144 (grep -cx renewal-automation → 0) → não roda em produção; sem cron (cron.md). renewals/tasks/notifications/client_renewals existem com RLS (tables.md).

### F3230 · Função SQL/RPC compute_customer_health_v2 (2 afirmações nos docs)

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** Health score v2 de cliente movido para private e sem chamador.| API.md lista a function SQL `compute_customer_health_v2` com última definição em 20260416232618_f6dcab79-5212-4086-b46f-7ff5f3532a80.sql, grants "—" e uso no front "—".
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/F_banco_dados.md:86`, `docs/API.md:532-532`
- **O que falta:** Chamador real (cron, edge ou RPC pública) ou remoção como código morto.
- **Evidência:** função private.compute_customer_health_v2 existe no banco real (functions.md); sem referência em código, cron, triggers ou outras funções (coluna de uso vazia)| cético: private.compute_customer_health_v2 existe no banco (functions.md:40; grants authenticated, service_role; corpo em functions/private/compute_customer_health_v2__f309707cfa73d7ed.sql lê accounts, support_tickets, nps_surveys, csat_ces_surveys, product_usage_summary, renewals — todas existem). Sem chamador: grep -rn compute_customer_health_v2 src supabase/functions (exceto types.ts) → 0; ausente em cron.md, triggers.md e corpos de outras funções.

### F3231 · RPC/função SQL `update_client_score`

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** API.md lista a function SQL `update_client_score` com última definição em 20260105000005_stored_procedures.sql, grants "—" e uso no front "—".
- **Fontes:** `docs/API.md:774-774`
- **O que falta:** Função falharia em runtime (tabela deals e coluna clients.health_score inexistentes); reescrever sobre sales/accounts ou dropar.
- **Evidência:** função public.update_client_score existe no banco real (functions.md); sem referência em código, cron, triggers ou outras funções (coluna de uso vazia)| cético: public.update_client_score existe no banco (functions.md:377), mas é código morto E quebrado: corpo (functions/public/update_client_score__ea901c15aa2995f9.sql:17,24-25) lê FROM deals e faz UPDATE clients SET health_score; ausente: grep -c deals tables.md → 0 (não há tabela/view public.deals) e grep -c '`health_score`' tables/public/clients.md → 0. Nenhum chamador: grep -rn update_client_score src supabase/functions → 0; ausente em cron/triggers.

### F0089 · Conector de helpdesk (helpdesk-sync → cs_tickets)

- **Tipo:** Integração externa
- **O que os docs afirmam:** `CS360Tabs.tsx:495` → `helpdesk-sync` → `cs_tickets` (0); nunca sincronizou.
- **Fontes:** `docs/estado/07_DOMINIO_WINLOSS_COMPETITIVE.md:255`
- **O que falta:** Corrigir o upsert: criar constraint UNIQUE (source, external_id) não parcial ou trocar por insert/update explícito, e propagar upsertError (helpdesk-sync/index.ts:164) em vez de responder ok:true. Mapear ticket → conta real; agendar o sync; decidir o destino de cs_tickets.
- **Evidência:** Fio existe mas o destino do doc está errado e a sincronização é frágil. Chamador: src/components/customer-success/HelpdeskConnectorPanel.tsx:44 invoke('helpdesk-sync'), montado em CS360Tabs.tsx:503-504 (aba integrations). Edge na allowlist (deploy.yml:144), publicada (prod-readiness.md:346). supabase/functions/helpdesk-sync/index.ts:162-164 faz upsert em support_tickets (onConflict source,external_id), NÃO em cs_tickets; cs_tickets tem 0 linhas (stats.md:264) e só é lida em src/pages/ClientHealthScore.tsx:501; support_tickets tem ~150 linhas (stats.md:72, RLS sim, 4 policies). Limitações no código: :142-147 vincula todos os tickets à 'primeira conta' quando account_id não vem; :18,:35,:54 per_page=50; :126-137 credenciais por env global; grep -i helpdesk contexto/supabase/cron.md → 0 (sem cron).| cético: Está ainda menos implementado do que dito. supabase/functions/helpdesk-sync/index.t…

### F0090 · Helpdesk: config e webhook de entrada (HelpdeskConnectorPanel)

- **Tipo:** Integração externa
- **O que os docs afirmam:** Sem cron, sem config e sem webhook.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:144`
- **O que falta:** Tabela de config por tenant com RLS + formulário; edge helpdesk-webhook na allowlist; renewal-automation/qbr-scheduler na allowlist ou remoção dos botões.
- **Evidência:** src/components/customer-success/HelpdeskConnectorPanel.tsx existe e está montado (CS360Tabs.tsx:8,503-504), mas é só painel de botões: :35-39 estados locais, :44/:61/:83/:101/:124 invokes (helpdesk-sync, renewal-automation, onboarding-launcher, qbr-scheduler, expansion-detector) — nenhum .from()/persistência de configuração (grep 'from(\|config\|localStorage' → 0). Webhook de entrada inexistente: ls supabase/functions| grep -i 'helpdesk\|zendesk\|intercom\|freshdesk\|ticket' → só helpdesk-sync. Sem cron (cron.md). Agravante: renewal-automation e qbr-scheduler invocados pelo painel NÃO estão na allowlist (deploy.yml:144) → esses botões falham em produção. \| cético: Confirmado: HelpdeskConnectorPanel só tem botões de invoke, sem persistir configuração. Webhook de entrada inexistente: ls supabase/functions \| grep -i 'helpdesk\|zendesk\|intercom\|freshdesk\|ticket\|support\|webhook' → só …

### F0091 · Integração com helpdesk (helpdesk-sync) com credencial por tenant e sync agendado

- **Tipo:** Integração externa
- **O que os docs afirmam:** helpdesk-sync suporta Zendesk/Intercom/Freshdesk via env; sync manual.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:119`
- **O que falta:** Credenciais por tenant (tabela/Vault com RLS); cron.schedule chamando helpdesk-sync com X-Cron-Secret; corrigir o upsert.
- **Evidência:** Afirmação confirmada: supabase/functions/helpdesk-sync/index.ts:126-137 lê credenciais exclusivamente de Deno.env (ZENDESK__, INTERCOM_ACCESS_TOKEN, FRESHDESK__) — não há tabela/coluna de credencial por tenant (grep -rn 'helpdesk' contexto/supabase/tables.md → 0 tabelas de integração); autorização :84-118 aceita cron (X-Cron-Secret via _internal_secrets) ou admin/manager, mas grep -i helpdesk contexto/supabase/cron.md → 0 → nenhum job agendado; disparo só manual (HelpdeskConnectorPanel.tsx:44).| cético: Confirmado: helpdesk-sync/index.ts:126-137 lê credenciais só de Deno.env (global, não por tenant); grep -i helpdesk em contexto/supabase/cron.md, webhooks.md e triggers.md → 0, sem agendamento. Agravante: mesmo quando roda, o upsert falha em silêncio (ver F0089: índice parcial em support_tickets.md:52 vs onConflict em index.ts:163, erro engolido em :164).

### F0092 · Integração externa: Freshdesk (helpdesk-sync)

- **Tipo:** Integração externa
- **O que os docs afirmam:** 1 função publicada e iniciando. Chamada real ao provedor não exercida (B4).
- **Fontes:** `docs/prod-readiness.md:861`
- **O que falta:** Confirmar FRESHDESK_DOMAIN/FRESHDESK_API_KEY nos secrets; corrigir upsert e vínculo de conta (:142-147); agendar.
- **Evidência:** Código: supabase/functions/helpdesk-sync/index.ts:52-70 (fetchFreshdesk: GET /api/v2/tickets?per_page=50 com Basic auth de FRESHDESK_API_KEY), :136-139 (exige FRESHDESK_DOMAIN e FRESHDESK_API_KEY). Publicada: allowlist deploy.yml:144 e prod-readiness.md:346 (OPTIONS 200). Limites estruturais: todos os tickets vão para a 'primeira conta' (:142-147), 50 por chamada, sem cron (cron.md). Segredo configurado e chamada real ao Freshdesk: não verificáveis sem painel/logs (vault.md sem menção).| cético: Código Freshdesk em helpdesk-sync/index.ts:52-70,136-139; função na allowlist (posição 66) e OPTIONS 200 (prod-readiness.md:346). Mesmo com segredo válido, os tickets buscados não persistem: upsert onConflict 'source,external_id' (index.ts:161-163) sem constraint compatível no banco (só o índice parcial em tables/public/support_tickets.md:52), com erro engolido em :164. Segredo e chamada real: n…

### F0093 · Integração externa: Intercom (helpdesk-sync)

- **Tipo:** Integração externa
- **O que os docs afirmam:** 1 função publicada e iniciando. Chamada real ao provedor não exercida (B4).
- **Fontes:** `docs/prod-readiness.md:862`
- **O que falta:** Confirmar INTERCOM_ACCESS_TOKEN nos secrets; corrigir upsert e vínculo de conta; agendar.
- **Evidência:** Código: supabase/functions/helpdesk-sync/index.ts:33-50 (fetchIntercom: GET api.intercom.io/conversations?per_page=50 com Bearer INTERCOM_ACCESS_TOKEN), :132-134. Publicada: allowlist deploy.yml:144, prod-readiness.md:346 OPTIONS 200. Mesmos limites estruturais de F0092 (primeira conta :142-147, 50 itens, sem cron). Segredo e chamada real ao provedor: não verificáveis aqui.| cético: Código Intercom em helpdesk-sync/index.ts:33-50,132-134; função na allowlist e OPTIONS 200 (prod-readiness.md:346). Mesma falha de persistência: upsert em index.ts:161-163 incompatível com o índice parcial (support_tickets.md:52) e erro engolido em :164. Segredo e chamada real: não verificáveis.

### F0094 · Integração externa: Zendesk (helpdesk-sync)

- **Tipo:** Integração externa
- **O que os docs afirmam:** 1 função publicada e iniciando. Chamada real ao provedor não exercida (B4).
- **Fontes:** `docs/prod-readiness.md:863`
- **O que falta:** Confirmar ZENDESK_DOMAIN/EMAIL/API_TOKEN nos secrets; corrigir upsert e vínculo de conta; agendar.
- **Evidência:** Código: supabase/functions/helpdesk-sync/index.ts:16-31 (fetchZendesk: GET {domain}.zendesk.com/api/v2/tickets/recent.json?per_page=50 com Basic email/token), :126-131 (exige ZENDESK_DOMAIN, ZENDESK_EMAIL, ZENDESK_API_TOKEN). Publicada: allowlist deploy.yml:144, prod-readiness.md:346 OPTIONS 200. Mesmos limites estruturais (primeira conta :142-147, 50 itens, sem cron). Segredos e chamada real: não verificáveis aqui.| cético: Código Zendesk em helpdesk-sync/index.ts:16-31,126-131; função na allowlist e OPTIONS 200 (prod-readiness.md:346). Mesma falha de persistência: upsert em index.ts:161-163 incompatível com o índice parcial (support_tickets.md:52) e erro engolido em :164. Segredos e chamada real: não verificáveis.

### F0095 · Product usage tracking integrado

- **Tipo:** Integração externa
- **O que os docs afirmam:** Falta dados de uso de produto no CRM.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:97`
- **O que falta:** Ingestão de eventos em product_usage_events e recálculo de product_usage_summary (job/trigger), exibidos na tela do cliente.
- **Evidência:** Afirmação confirmada: tabelas existem com RLS (tables/public/product_usage.md 1 policy, product_usage_events.md 2 policies, product_usage_summary.md 2 policies) mas product_usage e product_usage_events têm 0 linhas (stats.md:387,302); product_usage_summary ~100 linhas (stats.md:114) sem produtor. Leitores: supabase/functions/customer-success-360/index.ts:58, expansion-detector/index.ts:124, src/pages/ClientHealthScore.tsx:449. Produtores: grep -rn 'product_usage' src/ supabase/functions (insert/upsert) → 0; grep -i product_usage em cron.md/triggers.md/functions.md → 0.| cético: Confirmado: só existem leitores. grep -rn product_usage src supabase/functions → src/pages/ClientHealthScore.tsx:449, customer-success-360/index.ts:58, expansion-detector/index.ts:124. No banco, a única função que cita o assunto é private.compute_customer_health_v2 (:41, SELECT adoption_score), também só leitura.…

### F0097 · Ticket/Support integration (Zendesk, Intercom, Freshdesk)

- **Tipo:** Integração externa
- **O que os docs afirmam:** Falta integração com helpdesk.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:95`
- **O que falta:** Corrigir persistência e vínculo conta/cliente no helpdesk-sync, agendar o sync e exibir tickets no Client360View.
- **Evidência:** Afirmação 'falta integração' está parcialmente desatualizada: existe helpdesk-sync (Zendesk/Intercom/Freshdesk, index.ts:16-70) publicada e os tickets aparecem em src/components/customer-success/CS360Tabs.tsx:236-247 (aba tickets) a partir de customer-success-360/index.ts:56 (support_tickets, ~150 linhas). Mas não são 'visíveis no cliente' de forma correta: helpdesk-sync/index.ts:142-147 vincula todos à primeira conta; sem cron (cron.md), sem webhook, sem config por tenant; tela de cliente (Client360View.tsx) não mostra tickets.| cético: Os tickets aparecem na aba de CS360 a partir de support_tickets (customer-success-360/index.ts), mas o caminho de entrada do helpdesk não grava nada: o upsert em helpdesk-sync/index.ts:161-163 (onConflict source,external_id) não casa com nenhuma constraint, pois só existe o índice parcial uniq_support_tickets_external (tables/public/support_tickets.md:5…

### F0099 · Customer Success com entrega (csat-ces-trigger envia pesquisa; renewal/qbr/expansion agendados)

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Doc top-13: CSAT/CES nunca é coletado de fato e renovações dependem de clique.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:355-355`
- **O que falta:** 1) csat-ces-trigger precisa enviar a pesquisa de verdade ao contact_email (ex.: send-transactional-email, que está na allowlist) e ter endpoint de resposta que grave score/responded_at. 2) Colocar renewal-automation e qbr-scheduler na allowlist (deploy.yml:144) e aceitar chamada interna (service_role). 3) Criar jobs pg_cron via trigger_internal_edge_job para renewal-automation, qbr-scheduler e expansion-detector, com migration.
- **Evidência:** csat-ces-trigger só grava linha em csat_ces_surveys, não envia nada ao contato: supabase/functions/csat-ces-trigger/index.ts:76-89 (insert) — nenhum import/chamada de send-transactional-email/send-multichannel-message no arquivo. Chamada apenas manual: src/components/customer-success/SurveyTriggerDialog.tsx:55 (montado em CS360Tabs.tsx:421). renewal-automation e qbr-scheduler NÃO estão na allowlist (.github/workflows/deploy.yml:144 → grep 0 resultados para ambos); expansion-detector está na allowlist mas sem cron. Nenhum job em cron.md para renewal/qbr/expansion/csat (grep → 0). Únicos chamadores: HelpdeskConnectorPanel.tsx:61,101,124 (botões). Tabelas csat_ces_surveys, renewals, qbr_schedule existem com RLS (tables/public/*.md:7). Reivindicação de incompletude do doc confirmada.| cético: Confirmado. Allowlist (deploy.yml:144, parse do ACTIVE com 100 nomes): csat-ces-trigger=1 e expansi…

### F0100 · Nenhum cron agenda edge functions de CS/Win-Loss/Deal Intelligence

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** `detect-client-churn-alerts`, `renewal-automation`, `qbr-scheduler`, `csat-ces-trigger`, `expansion-detector`, `winloss-webhook-health-monitor`, `deal-risk-digest`, `account-engagement-aggregator` só rodam por clique manual.
- **Fontes:** `docs/estado/07_DOMINIO_WINLOSS_COMPETITIVE.md:326-329`
- **O que falta:** Crons para renewal-automation, qbr-scheduler, csat-ces-trigger (se fizer sentido), expansion-detector e account-engagement-aggregator. renewal-automation, qbr-scheduler e winloss-webhook-health-monitor precisam entrar na allowlist (deploy.yml:144); se winloss-webhook-health-monitor não entrar, o job 42 deve ser removido. As functions precisam aceitar chamada interna em vez de JWT admin.
- **Evidência:** Afirmação do doc está parcialmente desatualizada. Crons existentes no banco real (cron.md): job 21 deal-risk-digest-daily `0 11 * * *` (cron.md:22, execuções succeeded em cron-runs.md:137-143); job 30 detect-client-churn-alerts-hourly (cron.md:25, cron-runs.md:164-170); job 42 winloss-webhook-health-monitor-15min (cron.md:32, cron-runs.md:227-233). Porém winloss-webhook-health-monitor NÃO está na allowlist (deploy.yml:144 → 0 resultados), logo o cron chama função fora do conjunto deployado. Sem cron: renewal-automation, qbr-scheduler, csat-ces-trigger, expansion-detector, account-engagement-aggregator (grep em cron.md → 0). account-engagement-aggregator só é chamada por src/hooks/engagement/useAccountEngagement.ts:94; renewal/qbr/expansion só por HelpdeskConnectorPanel.tsx:61,101,124; renewal-automation e qbr-scheduler também fora da allowlist.| cético: Confirmado. Crons que existem: jo…

### F0101 · Onboarding de novos clientes disparado no fechamento (onboarding-launcher)

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** onboarding-launcher só chamado por HelpdeskConnectorPanel; existe /onboarding-tracking.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:120`
- **O que falta:** Disparo automático no fechamento: trigger em sales quando status vira 'completed' chamando onboarding-launcher, ou cron com action auto_launch_new_accounts via trigger_internal_edge_job; a function precisa aceitar chamada interna. Reescrever OnboardingTracking.tsx para ler e gravar onboarding_journeys e onboarding_steps em vez dos dados fictícios.
- **Evidência:** onboarding-launcher existe e está na allowlist (deploy.yml:144); cria onboarding_journeys/onboarding_steps (supabase/functions/onboarding-launcher/index.ts:150-190) e tem modo auto_launch_new_accounts (index.ts:80-120), mas nenhum disparo automático: único chamador é src/components/customer-success/HelpdeskConnectorPanel.tsx:83 (botão). Nenhum trigger de sales invoca onboarding (triggers.md:258-269 lista 12 triggers em public.sales, nenhum de onboarding; grep 'onboarding' em triggers.md só acha updated_at em linhas 192-193); nenhum cron (grep 'onboarding' em cron.md → 0). Rota /onboarding-tracking registrada (src/routes/AppRoutes.tsx:925-926, menu sidebarMenuData.ts:305) mas a página usa estado local hardcoded 'Empresa Alpha'/'Corp Beta' (src/pages/OnboardingTracking.tsx:31-70, comentário 'Local state — can be migrated to DB later'), sem ler onboarding_journeys. Banco: onboarding_journe…

### F0102 · Onboarding workflows para novos clientes

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Falta workflow de onboarding de cliente.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:98`
- **O que falta:** Template ou workflow de onboarding disparado ao ganhar o deal: novo trigger_type (ex.: deal_won) mais ação 'launch_onboarding' em execute-workflow chamando onboarding-launcher; ou ligar o trigger de sales 'completed' direto ao onboarding-launcher.
- **Evidência:** Tabela automation_workflows existe com RLS (tables/public/automation_workflows.md:7, 2 policies, 7 linhas em stats.md:105), mas o CHECK de trigger_type só aceita deal_created, stage_changed, activity_logged, scheduled, manual, no_activity_days, proposal_opened, price_clicked (automation_workflows.md constraint automation_workflows_trigger_type_check) — não há gatilho de 'deal ganho'. Nenhum template/ação de onboarding na UI de automação: grep -rliE onboarding src/components/automation src/components/workflows supabase/functions/execute-workflow → 0 resultados. O único 'workflow' de onboarding é o TEMPLATES hardcoded em supabase/functions/onboarding-launcher/index.ts:17-45, acionado manualmente (ver F0101).| cético: Confirmado e complementado. O CHECK de trigger_type em automation_workflows (tables/public/automation_workflows.md:40) não tem gatilho de deal ganho. grep onboarding em src/c…

### F0103 · QBR scheduling automatizado

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Falta agendamento automático de QBR com cliente.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:101`
- **O que falta:** Colocar qbr-scheduler na allowlist, aceitar chamada interna, criar job pg_cron semanal com migration e criar UI ou hook para cadastrar qbr_schedule por conta.
- **Evidência:** Backend existe: supabase/functions/qbr-scheduler/index.ts:53 chama RPC schedule_next_qbrs (existe no banco: functions.md:329), lê qbr_schedule (tabela com RLS, ~20 linhas; tables/public/qbr_schedule.md:7, stats.md:98) e insere eventos em agenda_events (index.ts:174-178) + notifications. Porém: qbr-scheduler NÃO está na allowlist ACTIVE (deploy.yml:144 → grep 0), não roda em produção; nenhum cron (grep qbr em cron.md → 0); único chamador é botão manual src/components/customer-success/HelpdeskConnectorPanel.tsx:101; exige JWT admin/manager (index.ts:23-44), incompatível com cron interno. Artefato esperado 'calendar_events' não existe no banco (ls tables/public → ausente); o sistema usa agenda_events.| cético: Confirmado. qbr-scheduler não está na allowlist (deploy.yml:144 → 0), então não roda em produção. Nenhum cron de qbr (grep em cron.md → 0). O único chamador é o botão em src/componen…

### F0104 · Rastreamento de uso do produto (product_usage_events)

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** product_usage_events não tem produtor.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:117`
- **O que falta:** Produtor que grave eventos em product_usage_events (edge function ou trigger) e agregação periódica em product_usage_summary (pg_cron), ou decidir pela remoção das tabelas e dos leitores.
- **Evidência:** Tabela product_usage_events existe no banco com RLS (tables/public/product_usage_events.md:7; colunas account_id, feature_key, event_type, occurred_at, metadata em linhas 19-25) mas tem 0 linhas (stats.md:302) e nenhum produtor: grep -rn product_usage_events src supabase/functions → só src/integrations/supabase/types.ts:13039 (tipos gerados). Consumidores leem product_usage_summary (tabela, não view; ~100 linhas sem produtor): supabase/functions/expansion-detector/index.ts:124 e customer-success-360/index.ts:124. Confirma 'não tem produtor'.| cético: Confirmado. grep 'product_usage_events\|product_usage_summary' em src e supabase/functions (sem types.ts) só acha leitores: customer-success-360/index.ts:58 e expansion-detector/index.ts:124 (product_usage_summary). No banco, o único uso em função SQL também é leitura: private.compute_customer_health_v2 (functions/private/compute_customer_h…

### F0105 · Reatribuição automática preserva status inactive da carteira

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Doc: reatribuição mantém status inactive; decisão de negócio pendente sobre reativar.
- **Fontes:** `docs/auditoria/CONTRATO_ROTEAMENTO_LEADS_2026-08-26.md:105`
- **O que falta:** Dono decide se mantém inactive ou reativa a carteira. Depois: registrar a decisão no doc ou alterar o UPDATE da RPC para status='active' com migration, e tratar a re-elegibilidade da carteira após o cooldown.
- **Evidência:** Comportamento 'preserva inactive' está implementado no banco real: public.reassign_inactive_client_portfolio (functions/public/reassign_inactive_client_portfolio__44c2342520a40fa4.sql:32 exige status='inactive'; UPDATE em linhas 65-69 altera só salesperson_id, assigned_at, updated_at — status não muda). Chamada por supabase/functions/auto-reassign-inactive/index.ts (seleciona .eq('status','inactive') em :160), agendado por cron job 86 auto-reassign-inactive-daily `0 9 * * *` (cron.md) e na allowlist. client_portfolio.status tem CHECK active/nurturing/at_risk/inactive/churned (tables/public/client_portfolio.md:46). Porém a decisão de negócio não está registrada: grep -rniE 'volta(r)? a .?active\|permanece inativ\|reativar a carteira' docs (excluindo as fontes) → 0 resultados; docs/auditoria/CONTRATO_ROTEAMENTO_LEADS_2026-08-26.md:105 ainda marca como pendente.| cético: Confirmado. A RPC …

### F0107 · Renewal management (alertas e automações)

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Falta gestão de renovação.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:96`
- **O que falta:** Colocar renewal-automation na allowlist com cron diário e aceite de service_role. Criar UI ou hook para cadastrar renovações. Unificar ou descartar client_renewals.
- **Evidência:** Existe base: tabela renewals com RLS e ~100 linhas (tables/public/renewals.md:7, stats.md:62), RPC public.detect_renewal_risks no banco (functions.md:150; corpo marca at_risk/churned por renewal_date e health_status), edge renewal-automation cria tasks e notifications por buckets 90/60/30/7 dias (supabase/functions/renewal-automation/index.ts:55-153) e CS360 lista renovações (customer-success-360/index.ts:57). Faltam fios: renewal-automation NÃO está na allowlist (deploy.yml:144 → 0 resultados) e sem cron (grep renewal em cron.md → 0), chamada só por botão HelpdeskConnectorPanel.tsx:61; nenhum writer de renewals em src/supabase (grep from('renewals') → apenas leituras: customer-success-360:57, renewal-automation:65); client_renewals tem 0 linhas (stats.md:355) e só é lida em src/pages/ClientHealthScore.tsx:360. Artefatos esperados 'contracts' e 'renewal_alerts' não existem no banco (ls …

### F3232 · Customer Health Score robusto

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Existe parcial em /client-health; falta health score robusto.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:94`
- **O que falta:** Gravar o score (tabela ou coluna, com cron chamando compute_customer_health_v2), fazer a página ler esse valor e ligar venda a cliente por id em vez de nome. Rota /client-health inexistente (a tela real é /health-score).
- **Evidência:** A funcionalidade existe com outro nome, /health-score: src/routes/AppRoutes.tsx:761 (ClientHealthScore, src/routes/lazyPages.ts:183) e menu 'Health Score' em src/components/layout/sidebar/sidebarMenuData.ts:306. src/pages/ClientHealthScore.tsx:86-138 calcula um score de 4 fatores (receita, recência, frequência, win rate) a partir de clients e sales reais, mas só no navegador e casando venda por nome (:91 s.client_name === client.name). Não grava nada: grep insert\|upsert\|rpc( na página → 0. A tabela client_health_scores não existe no banco (grep em tables.md → 0). A função private.compute_customer_health_v2 existe (functions.md:40), mas ninguém a chama (grep em src e supabase/functions → 0) e não há cron para ela (cron.md).
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Não implementado.

### F3233 · Rota /admin/alertas-churn (4 afirmações nos docs)

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Rota registrada em AppRoutes.tsx com acesso "admin_ou_gestor", GET em produção 200, chamando as edge functions detect-client-churn-alerts, send-churn-alert-email. Status no doc: OK| Rota /admin/alertas-churn (AppRoutes.tsx:173) renderiza src/pages/AdminAlertasChurn.tsx; role: admin ou manager. Classificação do doc: MORTO_OU_ABANDONADO. Evidência: SEM link/menu em todo src/ · sb=1 useQuery=1 mut=1 (árvore 10 arq.) \| API.md declara a rota `/admin/alertas-churn` renderizando o componente AdminAlertasChurn com acesso "admin ou gestor". \| NÃO INICIADO (20/20): rota /admin/alertas-churn existe mas sem link/menu; só mapas de título/prefetch.
- **Fontes:** `docs/prod-readiness.md:81`, `docs/estado/01_FRONTEND_ROTAS.md:102-102`, `docs/API.md:343-343`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:52`
- **O que falta:** Item de menu/AdminQuickLinks apontando para /admin/alertas-churn.
- **Evidência:** rota /admin/alertas-churn → src/pages/AdminAlertasChurn.tsx (AppRoutes.tsx); sem entrada no menu (sidebarMenuData.ts) → só acessível por URL| cético: Rota em src/routes/AppRoutes.tsx:482-487 (Manager → AdminAlertasChurn; os números 173/174 dos docs estão desatualizados). Página real: lê/grava churn_alert_settings e client_churn_alerts_state (AdminAlertasChurn.tsx:72,105,119; tabelas com RLS em tables.md), invoca detect-client-churn-alerts (:134) e send-churn-alert-email (:156), ambas na allowlist deploy.yml:144; cron detect-client-churn-alerts-hourly (cron.md:25). Mas nenhuma entrada de navegação: grep -rn alertas-churn src → só AppRoutes.tsx:482,490 e o link interno AdminAlertasChurn.tsx:206; sidebarMenuData.ts → 0.

### F3234 · Rota /admin/alertas-churn/historico (3 afirmações nos docs)

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Rota registrada em AppRoutes.tsx com acesso "admin_ou_gestor", GET em produção 200. Status no doc: OK| Rota /admin/alertas-churn/historico (AppRoutes.tsx:174) renderiza src/pages/AdminHistoricoAlertasChurn.tsx; role: admin ou manager. Classificação do doc: IMPLEMENTADO_PARCIAL. Evidência: link src/pages/AdminAlertasChurn.tsx:186 · sb=2 useQuery=2 mut=0 (árvore 11 arq.) · somente leitura — nenhuma mutação/persistência na árvore \| API.md declara a rota `/admin/alertas-churn/historico` renderizando o componente AdminHistoricoAlertasChurn com acesso "admin ou gestor".
- **Fontes:** `docs/prod-readiness.md:82`, `docs/estado/01_FRONTEND_ROTAS.md:103-103`, `docs/API.md:344-344`
- **O que falta:** Entrada de navegação para a página-mãe /admin/alertas-churn no menu.
- **Evidência:** rota /admin/alertas-churn/historico → src/pages/AdminHistoricoAlertasChurn.tsx (AppRoutes.tsx); sem entrada no menu (sidebarMenuData.ts) → só acessível por URL| cético: Rota em src/routes/AppRoutes.tsx:490-495 (Manager → AdminHistoricoAlertasChurn), lê salespeople e notifications (AdminHistoricoAlertasChurn.tsx:130,149) e exporta CSV (:226). Único link é a partir de AdminAlertasChurn.tsx:206, página que por sua vez não tem entrada no menu (sidebarMenuData.ts → 0 ocorrências de alertas-churn); fica alcançável só por URL.

### F3235 · Enum expansion_type valores upsell/cross_sell usados

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Valores upsell e cross_sell sem ocorrência no código.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/F_banco_dados.md:224`
- **O que falta:** Tela ou seed para criar expansion_playbooks com upsell/cross_sell e cron do expansion-detector; sem playbooks, a classificação nunca é gerada.
- **Evidência:** O enum public.expansion_type (upsell, cross_sell, expansion) existe e é usado em expansion_opportunities.type e expansion_playbooks.expansion_type (types-enums.md:12; default 'upsell' em tables/public/expansion_playbooks.md:25). expansion-detector grava type: pb.expansion_type (supabase/functions/expansion-detector/index.ts:176) e está na allowlist (deploy.yml:144, item 57). A UI dá nome aos valores (src/components/customer-success/cs360Helpers.ts:42-43) e chama a function por botão (HelpdeskConnectorPanel.tsx:124). Porém expansion_playbooks tem 0 linhas (stats.md:412), o front não grava playbooks (grep expansion_playbooks em src fora de types.ts → 0) e não há cron do detector (cron.md → 0).
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Não implementado.

### F3236 · Enum onboarding_status valor not_started usado

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Valor not_started sem ocorrência no código.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/F_banco_dados.md:223`
- **O que falta:** Fazer o onboarding-launcher criar a jornada como not_started (ou registrar que not_started é só o default do banco). Hoje nenhum fluxo do código produz esse estado.
- **Evidência:** O enum public.onboarding_status tem not_started (types-enums.md:18) e onboarding_journeys.status usa default 'not_started' no banco (tables/public/onboarding_journeys.md:22). A UI exibe 'Não iniciado' (src/components/customer-success/cs360Helpers.ts:35). Mas o único criador de jornadas, onboarding-launcher (na allowlist, deploy.yml:144 item 75), grava status 'in_progress' (supabase/functions/onboarding-launcher/index.ts:150-153). Fora de types.ts e cs360Helpers, nenhum código usa not_started (grep → 0).
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Não implementado.

### F3237 · Enum qbr_frequency valores biannual/annual usados

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Valores biannual e annual sem ocorrência no código.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/F_banco_dados.md:225`
- **O que falta:** Tela para escolher frequência semestral/anual em qbr_schedule e incluir qbr-scheduler na allowlist de deploy (ou cron que chame schedule_next_qbrs).
- **Evidência:** O enum public.qbr_frequency (monthly, quarterly, biannual, annual) existe (types-enums.md:19). A função public.schedule_next_qbrs trata biannual como 180 dias e o resto (annual) como 365 (functions/public/schedule_next_qbrs__12ae32cb1ec02d01.sql:14-18) e é chamada por supabase/functions/qbr-scheduler/index.ts:53. Porém qbr-scheduler está fora da allowlist ACTIVE (deploy.yml:144 → 0), então o botão em HelpdeskConnectorPanel.tsx:101 chama uma function que não roda em produção. A UI só mostra o texto das frequências (HelpdeskConnectorPanel.tsx:309-312) e não tem formulário que grave qbr_schedule (grep qbr_schedule em src fora de types.ts → 0).
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Não implementado.

### F0109 · Testes de Customer Success (0/12)

- **Tipo:** Teste
- **O que os docs afirmam:** Diretório sem teste.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:104`
- **O que falta:** Testes Vitest para cs360Helpers.ts, useCustomerSuccess360.ts, useFilteredCS360Data.ts e um render test de CS360Summary ou CustomerSuccessHub em src/components/customer-success/*.test.tsx.
- **Evidência:** Nenhum teste unitário no diretório: find src/components/customer-success src/hooks/customer-success -name '_.test._' → 0 resultados (12 arquivos em src/components/customer-success sem par de teste; src/hooks/customer-success/useCustomerSuccess360.ts e useFilteredCS360Data.ts sem teste). Existe cobertura e2e de smoke: tests/e2e/pages-customer-success.spec.ts (20 test(), ex.: linhas 16-27 'carrega página sem crash'/'title da página correto') e teste indireto de hook relacionado em src/hooks/bi/useChurnOverdueBySeller.test.tsx. Afirmação '0/12' do doc segue verdadeira para unit tests.| cético: Confirmado. src/components/customer-success tem 12 arquivos (CS360Cohorts, CS360Filters, CS360OrdersDialog, CS360Summary, CS360Tabs, CS360Trends, ChurnRiskDetailDialog, CustomerSuccess360Hub, CustomerSuccessHub, HelpdeskConnectorPanel, SurveyTriggerDialog, cs360Helpers) e nenhum _.test._. A busca por…

## Não verificável (1)

### F0085 · Segredo ZENDESK__, FRESHDESK__, INTERCOM_ACCESS_TOKEN lido por 1 (helpdesk-sync) edge function(s)

- **Tipo:** Doc/config
- **O que os docs afirmam:** 5 segredos de helpdesk numa função só. Doc extrai via grep de Deno.env.get; não verifica se o segredo está configurado no projeto.
- **Fontes:** `docs/estado/10_EDGE_FUNCTIONS.md:125-142`
- **O que falta:** Acesso ao painel Supabase → Edge Functions → Secrets do projeto usyxfpqlsspldubptrdl e aos logs da função para confirmar as 6 variáveis.
- **Evidência:** Lado código confirmado: supabase/functions/helpdesk-sync/index.ts:126-128 (ZENDESK_DOMAIN, ZENDESK_EMAIL, ZENDESK_API_TOKEN), :132 (INTERCOM_ACCESS_TOKEN), :136-137 (FRESHDESK_DOMAIN, FRESHDESK_API_KEY) — 6 variáveis, só nesta função (grep -rn Deno.env.get ZENDESK_\|FRESHDESK_\|INTERCOM_ACCESS_TOKEN supabase/functions → apenas helpdesk-sync). Função na allowlist (deploy.yml:144) e publicada (docs/prod-readiness.md:346 OPTIONS 200). Snapshot contexto/supabase/vault.md não cita zendesk/freshdesk/intercom.| cético: Leitura confirmada só em supabase/functions/helpdesk-sync/index.ts:126-128,132,136-137 (grep Deno.env.get ZENDESK_\|FRESHDESK_\|INTERCOM_ACCESS → só esse arquivo). helpdesk-sync está na allowlist (posição 66). Os segredos das Edge Functions não aparecem no snapshot (vault.md é o Vault do Postgres, não os secrets das funções).
