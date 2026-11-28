# Win-Loss e inteligência competitiva

[Voltar ao índice](README.md)

39 itens não implementados, parciais ou não verificáveis neste domínio.

## Não implementado (4)

### F3975 · Agendamento do edge winloss-webhook-dispatcher

- **Tipo:** Agendamento (cron)
- **O que os docs afirmam:** winloss-webhook-dispatcher importa isAuthorizedCronRequest/X-Cron-Secret mas não tem cron.schedule nem entrada na allowlist de trigger_internal_edge_job (mig/20261002010000:27-38). O dispatch de webhooks win/loss só acontece por chamada interna.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/F_banco_dados.md:163`
- **O que falta:** Criar cron.schedule via trigger_internal_edge_job, incluir 'winloss-webhook-dispatcher' na allowlist dessa função e na allowlist ACTIVE de deploy.yml:144, e confirmar execução bem-sucedida em cron-runs.
- **Evidência:** nenhum job em pg_cron para "winloss-webhook-dispatcher" (cron.md, 45 jobs)| cético: Não há agendamento. cron.md tem um único job winloss (cron.md:32, job 42, que é do health-monitor). A allowlist de trigger_internal_edge_job (functions/public/trigger_internal_edge_job__f02f045c8b4350ab.sql:14-24) inclui 'winloss-webhook-health-monitor', não o dispatcher. Busca 'winloss-webhook-dispatcher' no snapshot do banco: só aparece em functions.md e snapshot.json, nenhum cron ou trigger. A function também não está na allowlist ACTIVE (.github/workflows/deploy.yml:144: 0 ocorrências).

### F3977 · Execução automática do edge batch winloss-webhook-replay-batch

- **Tipo:** Agendamento (cron)
- **O que os docs afirmam:** winloss-webhook-replay-batch é edge batch sem cron e sem auth de cron; não tem invoke nenhum (nunca roda).
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/F_banco_dados.md:167`
- **O que falta:** Agendar via cron/trigger_internal_edge_job com auth de cron, publicar (deploy.yml:144) e ter evidência de execução; ou remover.
- **Evidência:** nenhum job em pg_cron para "winloss-webhook-replay-batch" (cron.md, 45 jobs)| cético: Não há execução automática. cron.md não tem job para replay-batch (o único winloss é o job 42 do health-monitor, cron.md:32). A allowlist de trigger_internal_edge_job (sql:14-24) não inclui a função. Busca 'winloss-webhook-replay-batch' em src/ e supabase/functions (fora da própria pasta): 0 resultados. Também está fora da allowlist ACTIVE (deploy.yml:144: 0 ocorrências).

### F3163 · Produtor de eventos para webhooks de win-loss

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Dispatcher sem produtor real; só replay e teste.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:237`
- **O que falta:** Criar produtor: trigger AFTER INSERT em win_loss_analyses (ou chamada em analyze-win-loss) via trigger_internal_edge_job → winloss-webhook-dispatcher, e incluir o dispatcher na allowlist deploy.yml:144.
- **Evidência:** Únicos chamadores de winloss-webhook-dispatcher: supabase/functions/winloss-webhook-replay/index.ts, supabase/functions/run-retry-tests/index.ts, scripts/verify-dispatcher-request-id.sh e src/pages/RetryTestStatusPage.tsx (texto). ausente: grep -rn 'winloss_webhook\\|outbox' supabase/functions/analyze-win-loss supabase/functions/mine-win-loss-patterns → 0 resultados; triggers.md não tem trigger em win_loss_analyses; dispatcher fora da allowlist deploy.yml:144.
- **Revisão:** sem contestação cética concluída.

### F3177 · Produtor de eventos para winloss-webhook-dispatcher (trigger/outbox em win_loss_analyses)

- **Tipo:** Trigger
- **O que os docs afirmam:** NÃO INICIADO: dispatcher só chamado por replay/run-retry-tests.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:188`
- **O que falta:** Criar trigger/outbox AFTER INSERT em win_loss_analyses chamando trigger_internal_edge_job('winloss-webhook-dispatcher') com o evento, migration comentada em supabase/migrations/, e deployar o dispatcher.
- **Evidência:** ausente: grep -n 'win_loss_analyses' triggers.md → 0 resultados; ausente: grep -rn 'winloss_webhook\\|outbox' supabase/functions/analyze-win-loss supabase/functions/mine-win-loss-patterns → 0 resultados. Dispatcher só chamado por winloss-webhook-replay/index.ts e run-retry-tests/index.ts; dispatcher fora da allowlist deploy.yml:144.
- **Revisão:** sem contestação cética concluída.

## Parcial (35)

### F3135 · Botão Exportar PDF Win/Loss (export-winloss-pdf)

- **Tipo:** Ação/botão
- **O que os docs afirmam:** `WinLossIntelligence.tsx:281` / `ExportPdfButton.tsx:18` invoca `export-winloss-pdf`; sem tabela de log, uso real não verificável.
- **Fontes:** `docs/estado/07_DOMINIO_WINLOSS_COMPETITIVE.md:167`
- **O que falta:** Gerar PDF de verdade em export-winloss-pdf (ex.: pdf-lib) com contentType application/pdf e liberar 'application/pdf' no bucket winloss-reports; no ExportPdfButton tratar o campo 'inline' (download do conteúdo) em vez do toast falso 'em fila'.
- **Evidência:** src/components/win-loss/ExportPdfButton.tsx:18-28 invoca 'export-winloss-pdf' (na allowlist deploy.yml:144) e é montado em src/pages/WinLossIntelligence.tsx:471. Porém a função NÃO gera PDF: supabase/functions/export-winloss-pdf/index.ts:69-70 ('emit Markdown for now') e :97-98 faz upload de Blob 'text/markdown'; o toast diz 'Relatório PDF gerado' (ExportPdfButton.tsx:26). Se o upload falhar, a função devolve o markdown em 'inline' (index.ts:115) mas o botão ignora esse campo e mostra 'Relatório em fila' (ExportPdfButton.tsx:28) sem existir fila.
- **Revisão:** sem contestação cética concluída.

### F3137 · Criar tarefa a partir de insight (InsightCreateTaskModal)

- **Tipo:** Ação/botão
- **O que os docs afirmam:** `InsightCreateTaskModal.tsx` + `useInsightTaskCreation.ts` insere em `tasks`; 600 tasks, nenhuma com `source_insight_id`.
- **Fontes:** `docs/estado/07_DOMINIO_WINLOSS_COMPETITIVE.md:158`
- **O que falta:** Em mine-win-loss-patterns trocar o delete total de win_loss_insights por upsert/arquivamento (ex.: coluna archived_at) para preservar source_insight_id; confirmar o segredo LOVABLE_API_KEY (ou outro provedor) para que insights sejam gerados.
- **Evidência:** Fluxo existe: src/components/win-loss/ActionableInsightsPanel.tsx:231 monta InsightCreateTaskModal, que chama useInsightTaskCreation (InsightCreateTaskModal.tsx:46,69); src/hooks/win-loss/useInsightTaskCreation.ts:45,56 insere em tasks com source_insight_id. Coluna existe (tables/public/tasks.md:33) com FK 'REFERENCES win_loss_insights(id) ON DELETE SET NULL' (tasks.md:49). Mas supabase/functions/mine-win-loss-patterns/index.ts:313-316 apaga TODOS os win_loss_insights a cada 'Rodar análise' → o vínculo source_insight_id das tasks vira NULL na execução seguinte. Além disso win_loss_insights tem ~0 linhas (stats.md:118) porque os insights dependem de LOVABLE_API_KEY (mine-win-loss-patterns/index.ts:153), então hoje não há insight para virar tarefa.
- **Revisão:** sem contestação cética concluída.

### F3138 · Replay em lote de webhooks Win/Loss (botão em /admin/webhooks-dead-letters)

- **Tipo:** Ação/botão
- **O que os docs afirmam:** winloss-webhook-replay-batch tem 0 chamadores; só operação manual no runbook.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:110`
- **O que falta:** Incluir winloss-webhook-replay (e replay-batch, se for mantida) na allowlist deploy.yml:144 (exige liberar vaga entre as 100); decidir se o botão em lote passa a usar replay-batch ou remover a função órfã.
- **Evidência:** A página /admin/webhooks-dead-letters existe (AppRoutes.tsx:1061-1064; src/pages/admin/WebhooksDeadLettersAdmin.tsx) e tem reprocessamento em lote (WebhookDeadLetterPanel.tsx:273,297 requestBulkReplay → BulkReplayConfirmDialog/AsyncReplayQueueDialog), mas ele chama 'winloss-webhook-replay' em chunks no cliente (src/hooks/win-loss/useWebhookDeadLetters.ts:94-98), não 'winloss-webhook-replay-batch'. ausente: grep -rn "winloss-webhook-replay-batch" src → 0 resultados (só auto-referência em supabase/functions/winloss-webhook-replay-batch/). Nem replay nem replay-batch estão na allowlist: deploy.yml:144 (allowlist ACTIVE contém só 'detect-winloss-at-risk' e 'export-winloss-pdf' entre os winloss-_; grep -o 'winloss[a-z-]_' → 2 resultados).
- **Revisão:** sem contestação cética concluída.

### F3139 · Replay individual de webhook (winloss-webhook-replay)

- **Tipo:** Ação/botão
- **O que os docs afirmam:** `WebhookReplayHistory.tsx` + `useWebhookReplayPersistence.ts` → `winloss-webhook-replay` (445 l) / `winloss_webhook_replay_audit` (0).
- **Fontes:** `docs/estado/07_DOMINIO_WINLOSS_COMPETITIVE.md:180`
- **O que falta:** Adicionar winloss-webhook-replay à allowlist em .github/workflows/deploy.yml:144 e confirmar gravação em winloss_webhook_replay_audit após um replay real.
- **Evidência:** ausente: grep -rln "WebhookReplayHistory" src supabase → 0 resultados (componente citado não existe). Replay individual existe via src/hooks/win-loss/useWebhookDeliveries.ts:50 e useWebhookDeadLetters.ts:96 (botão WebhookDeadLetterPanel.tsx:443 onReplay([d.id])) invocando 'winloss-webhook-replay', que NÃO está na allowlist (deploy.yml:144: só 'detect-winloss-at-risk' e 'export-winloss-pdf' entre os winloss-*) → em produção a chamada falha. useWebhookReplayPersistence.ts:11-51 só guarda seleção em localStorage (usado em WebhookDeliveriesDrawer.tsx:65), não auditoria. Tabela de auditoria existe com RLS (tables.md:407 winloss_webhook_replay_audit) mas ~0 linhas (stats.md:173).
- **Revisão:** sem contestação cética concluída.

### F3140 · Ameaças competitivas de preço com competitor_price = median*0.85

- **Tipo:** Componente
- **O que os docs afirmam:** `pricing-intelligence/index.ts:228-236` fabrica preço do concorrente como 85% da mediana; `competitors_pricing` (0 linhas) não é lida.
- **Fontes:** `docs/estado/07_DOMINIO_WINLOSS_COMPETITIVE.md:222`
- **O que falta:** Criar tela/form (ou importação) para cadastrar preços de concorrentes em competitors_pricing, com policy de INSERT/UPDATE para gestor/admin.
- **Evidência:** A fabricação 'median*0.85' foi removida: supabase/functions/pricing-intelligence/index.ts:286-320 agora lê competitors_pricing (product_id, price, competitors_registry(name)) e monta competitor_threats com o preço real; exibido em src/components/pricing/CompetitorRadarCard.tsx via PricingIntelligenceHub.tsx:138; função na allowlist deploy.yml:144 (commit 0f677dc9e #208 'pricing real'). Porém competitors_pricing tem ~0 linhas (stats.md:263) e não há nenhum caminho de escrita: grep -rn "competitors_pricing" src supabase/functions (exceto types.ts) → só a leitura em pricing-intelligence/index.ts:288; a tabela tem 1 policy, só SELECT (tables/public/competitors_pricing.md:48-52). Radar fica sempre vazio.
- **Revisão:** sem contestação cética concluída.

### F3141 · Comparação de temporadas (useSeasonComparison)

- **Tipo:** Componente
- **O que os docs afirmam:** `WinLossIntelligence.tsx:427` via `useSeasonComparison.ts` (puro) sobre win_loss_analyses.
- **Fontes:** `docs/estado/07_DOMINIO_WINLOSS_COMPETITIVE.md:162`
- **O que falta:** Gravar a data de fechamento em win_loss_analyses (ex.: closed_at = sales.closed_at, já usado em analyze-win-loss/index.ts:235) e usar essa coluna em useSeasonComparison no lugar de analyzed_at.
- **Evidência:** Montado: SeasonComparisonPanel em src/pages/WinLossIntelligence.tsx:401 usa useSeasonComparison (src/hooks/win-loss/useSeasonComparison.ts:46). Mas o hook separa trimestre atual/anterior por r.analyzed_at (useSeasonComparison.ts:55-56), e analyzed_at é a data da execução da análise, não do fechamento: supabase/functions/analyze-win-loss/index.ts:230 'const analyzedAt = new Date().toISOString()' gravado em :262 para todos os deals. Resultado: todos os deals reanalisados caem no trimestre da última execução e o 'trimestre anterior' fica vazio/distorcido.
- **Revisão:** sem contestação cética concluída.

### F3142 · Dead-letter queue de webhooks (useWebhookDeadLetters, useDeadLetterErrorGroups)

- **Tipo:** Componente
- **O que os docs afirmam:** `WinLossIntelligence.tsx:442` sobre `winloss_webhook_dead_letters` (0).
- **Fontes:** `docs/estado/07_DOMINIO_WINLOSS_COMPETITIVE.md:178`
- **O que falta:** Colocar winloss-webhook-dispatcher e winloss-webhook-replay na allowlist (deploy.yml:144) e criar o produtor de eventos (ver F3158) para que falhas reais cheguem à DLQ.
- **Evidência:** UI existe: WebhookDeadLetterPanel montado em src/pages/WinLossIntelligence.tsx:420 e em WebhooksDeadLettersAdmin; useWebhookDeadLetters.ts:63 e useDeadLetterErrorGroups.ts:46 leem winloss_webhook_dead_letters (RLS sim, tables.md:404; policies só admin SELECT/UPDATE). Mas quem popula a DLQ é winloss-webhook-dispatcher, e nem ele nem winloss-webhook-replay estão na allowlist (deploy.yml:144: só 'detect-winloss-at-risk' e 'export-winloss-pdf' entre os winloss-*); a tabela tem ~0 linhas (stats.md:235). Replay a partir da DLQ (useWebhookDeadLetters.ts:96) falha em produção.
- **Revisão:** sem contestação cética concluída.

### F3143 · Heatmap de coorte e histograma de ciclo (useWinLossCohort)

- **Tipo:** Componente
- **O que os docs afirmam:** `WinLossIntelligence.tsx:20,22` via `useWinLossCohort.ts` sobre `sales` (954, 461 ganhos).
- **Fontes:** `docs/estado/07_DOMINIO_WINLOSS_COMPETITIVE.md:163`
- **O que falta:** Usar a data de fechamento (sales.closed_at, gravada em win_loss_analyses ou buscada junto com created_at) em useWinLossCohort.ts:53 no lugar de analyzed_at.
- **Evidência:** Montados: WinLossCohortHeatmap (WinLossIntelligence.tsx:318) e CycleTimeHistogram (:300). Histograma usa cycle_days calculado de sales.closed_at (analyze-win-loss/index.ts:235) — ok. O heatmap de coorte (src/hooks/win-loss/useWinLossCohort.ts:33-34) busca sales.created_at, mas o eixo 'mês de fechamento' usa r.analyzed_at (useWinLossCohort.ts:53), que é a data da execução da análise (analyze-win-loss/index.ts:230,262), não do fechamento: todas as células colapsam no mês da última execução.
- **Revisão:** sem contestação cética concluída.

### F3146 · Painel de saúde de webhooks (useWebhookDeliveryStats)

- **Tipo:** Componente
- **O que os docs afirmam:** `WinLossIntelligence.tsx:437` + `useWebhookDeliveryStats.ts` ligado a `winloss-webhook-health-monitor` / `winloss_webhook_deliveries` (0).
- **Fontes:** `docs/estado/07_DOMINIO_WINLOSS_COMPETITIVE.md:177`
- **O que falta:** Adicionar winloss-webhook-health-monitor e winloss-webhook-dispatcher à allowlist em deploy.yml:144 e ligar um produtor de eventos para gerar entregas reais.
- **Evidência:** WebhookHealthPanel montado em src/pages/WinLossIntelligence.tsx:415; src/hooks/win-loss/useWebhookDeliveryStats.ts:84 lê winloss_webhook_deliveries (RLS só admin, tables/public/winloss_webhook_deliveries.md:53-60; ~1 linha em stats.md:76). O cron 42 'winloss-webhook-health-monitor-15min' existe (cron.md:32) e roda 'succeeded' (cron-runs.md:227-233), mas isso só enfileira net.http_post via trigger_internal_edge_job; a função winloss-webhook-health-monitor NÃO está na allowlist (deploy.yml:144: só 'detect-winloss-at-risk' e 'export-winloss-pdf' entre os winloss-*), logo não roda em produção. Entregas não são produzidas (dispatcher fora da allowlist e sem produtor, ver F3158).
- **Revisão:** sem contestação cética concluída.

### F3147 · Tendência de sentimento (useSentimentTrend) sobre call_recordings

- **Tipo:** Componente
- **O que os docs afirmam:** `WinLossIntelligence.tsx:424` via `useSentimentTrend.ts:49-51` lê `call_recordings` (0 linhas) → gráfico vazio.
- **Fontes:** `docs/estado/07_DOMINIO_WINLOSS_COMPETITIVE.md:160`
- **O que falta:** Trocar a fonte em useSentimentTrend.ts para call_insights.sentiment_score (join por recording_id → call_recordings.sale_id) e tratar o error do Supabase em vez de ignorá-lo.
- **Evidência:** SentimentTrendChart montado em src/pages/WinLossIntelligence.tsx:392. src/hooks/win-loss/useSentimentTrend.ts:52-54 faz select de 'recorded_at, sentiment_score, sale_id' em call_recordings e filtra sentiment_score not null, mas a coluna sentiment_score NÃO existe em call_recordings no banco real (tables/public/call_recordings.md: colunas incluem só 'sentiment' text, linha 49). O hook descarta o erro (useSentimentTrend.ts:33 só desestrutura data) e retorna [] → gráfico sempre vazio. O score real fica em call_insights.sentiment_score (supabase/functions/analyze-call/index.ts:114-116). call_recordings ~0 linhas (stats.md:96).
- **Revisão:** sem contestação cética concluída.

### F3148 · Teste A/B de script (useScriptABTest) — sales.script_variant nunca populada

- **Tipo:** Componente
- **O que os docs afirmam:** `WinLossIntelligence.tsx:406` via `useScriptABTest.ts:55-56` lê `sales.script_variant`; 0 linhas não-nulas.
- **Fontes:** `docs/estado/07_DOMINIO_WINLOSS_COMPETITIVE.md:164`
- **O que falta:** Criar o ponto de gravação de script_variant (ex.: ao aplicar script/cadência no deal, ou campo no formulário de venda) para que o A/B tenha amostras.
- **Evidência:** ScriptABPanel montado em src/pages/WinLossIntelligence.tsx:361; src/hooks/win-loss/useScriptABTest.ts:59-62 lê sales.script_variant (coluna existe, tables/public/sales.md:34). Mas nenhum fluxo grava a coluna: grep -rn "script_variant" src supabase/functions (exceto types.ts) → só leituras em useScriptABTest.ts/ScriptABPanel.tsx e factory de teste src/test/factories.ts:75. Painel sempre sem dados.
- **Revisão:** sem contestação cética concluída.

### F3149 · UI de assinaturas de webhook (useWebhookSubscriptions)

- **Tipo:** Componente
- **O que os docs afirmam:** `WinLossIntelligence.tsx:438` + `useWebhookSubscriptions.ts` sobre `winloss_webhook_subscriptions` (0 linhas).
- **Fontes:** `docs/estado/07_DOMINIO_WINLOSS_COMPETITIVE.md:176`
- **O que falta:** Deployar winloss-webhook-dispatcher (allowlist deploy.yml:144) e criar o produtor de eventos win/loss para que assinaturas cadastradas recebam entregas.
- **Evidência:** WebhookSubscriptionsPanel montado em src/pages/WinLossIntelligence.tsx:416; botão 'criar' (WebhookSubscriptionsPanel.tsx:127) → src/hooks/win-loss/useWebhookSubscriptions.ts:36-42 insere em winloss_webhook_subscriptions (RLS sim, policy 'admin manage webhooks' ALL para admin, tables/public/winloss_webhook_subscriptions.md:60-68); remover em :182. O cadastro é gravado de verdade, porém a assinatura não tem efeito: o dispatcher (winloss-webhook-dispatcher) não está na allowlist (deploy.yml:144) e não há produtor de eventos (ver F3158).
- **Revisão:** sem contestação cética concluída.

### F3151 · Win/Loss: webhooks com dead letter, replay e timeline

- **Tipo:** Componente
- **O que os docs afirmam:** Timeline de webhooks na UI.
- **Fontes:** `docs/benchmark/RAMPER_2026-07.md:180`
- **O que falta:** Adicionar winloss-webhook-replay e winloss-webhook-timeline (e dispatcher) à allowlist em deploy.yml:144, liberando vagas entre as 100.
- **Evidência:** UI existe: DLQ (WebhookDeadLetterPanel, WinLossIntelligence.tsx:420), replay (useWebhookDeadLetters.ts:96, useWebhookDeliveries.ts:50) e timeline (/admin/webhooks-timeline, AppRoutes.tsx:1069-1072; src/hooks/win-loss/useWebhookTimeline.ts:56,72 invoca 'winloss-webhook-timeline'). Tabelas existem com RLS (tables.md:403-409). Mas winloss-webhook-replay e winloss-webhook-timeline NÃO estão na allowlist (deploy.yml:144: só 'detect-winloss-at-risk' e 'export-winloss-pdf' entre os winloss-*) → replay e timeline falham em produção; DLQ ~0 linhas (stats.md:235).
- **Revisão:** sem contestação cética concluída.

### F3976 · Edge function notify-critical-pattern sem functions.invoke literal no front

- **Tipo:** Agendamento (cron)
- **O que os docs afirmam:** Uma das 64/168 funções sem invocador literal em src/. Grupo: Cron / alertas agendados (INFERIDO). Classificação por grupo deduzida do nome; pg_cron/config.toml não verificados.
- **Fontes:** `docs/estado/09_HOOKS_SERVICES.md:291-311`
- **O que falta:** Publicar a function (incluir na allowlist de deploy.yml:144), definir a URL das functions (ou usar o mecanismo interno de invocação), enviar autenticação no http_post e registrar a falha em vez de engoli-la.
- **Evidência:** Não há cron, mas há invocador no banco real: o trigger trg_notify_critical_winloss AFTER INSERT em public.win_loss_patterns (triggers.md:385) executa private.notify_critical_winloss_pattern. O corpo dessa função (functions/private/notify_critical_winloss_pattern__12ae32cb1ec02d01.sql:12-22) faz net.http_post para fn_url\|\|'/notify-critical-pattern', só quando confidence > 0.85. Esse fio está quebrado em três pontos: (1) fn_url = current_setting('app.functions_url', true), e grep em supabase/migrations e no snapshot só encontra a própria função (20260420210849...sql:66), ou seja, a URL não está definida em nenhum lugar visível; (2) não envia Authorization e engole qualquer erro (linhas 24-26); (3) supabase/functions/notify-critical-pattern/index.ts existe, mas está fora da allowlist ACTIVE (deploy.yml:144 → 0 ocorrências), então não roda em produção.
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Não implementado.

### F3154 · Doc .lovable/memory/features/winloss-webhook-observability.md descreve o subsistema

- **Tipo:** Doc/config
- **O que os docs afirmam:** Documento próprio do subsistema de webhooks Win/Loss (7 tabelas + 6 functions).
- **Fontes:** `docs/estado/13_INTEGRACOES.md:77`
- **O que falta:** Atualizar o doc informando que as funções winloss-webhook-* estão fora da allowlist (ou incluí-las em deploy.yml:144).
- **Evidência:** Arquivo existe: .lovable/memory/features/winloss-webhook-observability.md (29 linhas). As 7 tabelas citadas existem com RLS no banco (tables.md:402-409). Mas as funções descritas como 'pipeline completo' — winloss-webhook-dispatcher, -replay, -replay-batch, -health-monitor, -timeline — existem só no repo (supabase/functions/) e NENHUMA está na allowlist (deploy.yml:144: só 'detect-winloss-at-risk' e 'export-winloss-pdf' entre os winloss-*), então o subsistema documentado não roda em produção; o doc não registra isso.
- **Revisão:** sem contestação cética concluída.

### F3155 · winloss-webhooks: produtor de eventos para o fluxo descrito

- **Tipo:** Doc/config
- **O que os docs afirmam:** PARCIAL: monitor agendado; replay-batch sem chamador; dispatcher sem produtor.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:338`
- **O que falta:** Criar produtor (trigger em sales ao mudar para ganho/perdido ou chamada em analyze-win-loss) que invoque winloss-webhook-dispatcher, e deployar dispatcher + health-monitor (allowlist deploy.yml:144).
- **Evidência:** docs/runbooks/winloss-webhooks.md existe e descreve diagnóstico/mitigação. Monitor agendado: cron 42 (cron.md:32) chama trigger_internal_edge_job('winloss-webhook-health-monitor'), mas a função não está na allowlist (deploy.yml:144). Dispatcher sem produtor: chamadores de 'winloss-webhook-dispatcher' são só supabase/functions/winloss-webhook-replay/index.ts:349, scripts/verify-dispatcher-request-id.sh:20 e menção em src/pages/RetryTestStatusPage.tsx:157; nenhum trigger em sales/win_loss_analyses (triggers.md:385 só trg_notify_critical_winloss em win_loss_patterns, que não chama o dispatcher). replay-batch: grep em src → 0 chamadores.
- **Revisão:** sem contestação cética concluída.

### F3156 · Deal risk scoring com sinais explicáveis

- **Tipo:** Edge function
- **O que os docs afirmam:** Falta risk score por deal com sinais (sem reunião há X dias, single-threaded, sem decisor).
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:65`
- **O que falta:** Adicionar em calculate-deal-health os fatores 'single-threaded' (nº de contatos/stakeholders do deal) e 'sem decisor' (comitê/decision maker de extract-committee-from-call ou extract-deal-stakeholders); remover ou passar a usar deal_risk_signals.
- **Evidência:** Existe score de risco por deal com fatores explicáveis: supabase/functions/calculate-deal-health/index.ts:148-235 monta factors (dias sem atividade, dias no estágio, momentos críticos, menções a concorrentes, sem próximo passo) e persiste em deal_health_scores (~900 linhas, stats.md:34; colunas factors/positive_factors/negative_factors, RLS sim tables.md:125) com histórico deal_health_history (~900, stats.md:52); exibido em DealHealthCard/DealHealthFactorsList (CriticalDealsTable.tsx:197). Função na allowlist (deploy.yml:144). Faltam os sinais citados 'single-threaded' e 'sem decisor': grep -n -iE "stakeholder\|decisor\|decision\|single" supabase/functions/calculate-deal-health/index.ts → 0 resultados. Tabela deal_risk_signals existe mas sem escritor (grep -rn "deal_risk_signals" src supabase/functions fora de types.ts → 0) e ~0 linhas (stats.md:191); 'deal_risk_scores' não existe no ba…
- **Revisão:** sem contestação cética concluída.

### F3978 · Edge function notify-critical-pattern (6 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** 55 linhas; chamador: **nenhum**; verify_jwt true (default); tabelas tocadas (linhas em produção): nenhuma. Classificação do doc: MORTO_OU_ABANDONADO (sem chamador).| PARCIAL (14/24 ainda órfãs): notify-critical-pattern segue com 0 chamadores. \| Catálogo API.md lista a edge function `notify-critical-pattern` na categoria "Ops / Outros" com auth "nenhuma detectada no handler · verify_jwt", método "qualquer", payload "name, confidence, pattern_id" e resposta "JSON {ok}". \| Função existe; só referenciada pela migração 20260420210849…sql:69 via trigger duplamente quebrado. 0 execuções. \| Doc classifica como QUEBRADA. Chamador(es): trigger win_loss_patterns (mig 20260420210849:54-90). Trigger …
- **Fontes:** `docs/estado/10_EDGE_FUNCTIONS.md:399-399`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:267`, `docs/API.md:237-237`, `docs/estado/07_DOMINIO_WINLOSS_COMPETITIVE.md:188`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:130-130`, `docs/prod-readiness.md:355`
- **O que falta:** Publicar a function (allowlist deploy.yml:144), corrigir o trigger (URL via _internal_secrets + X-Cron-Secret, sem engolir erro) e escapar o HTML do e-mail; ou remover.
- **Evidência:** supabase/functions/notify-critical-pattern/index.ts existe; FORA da allowlist de deploy (.github/workflows/deploy.yml:144) → não roda em produção; ÓRFÃ: nenhum chamador no front, em edges ou em SQL/cron (edge-functions.json)| cético: O veredito PARCIAL se mantém, mas a pré-checagem errou ao dizer que não há chamador em SQL. O handler existe (supabase/functions/notify-critical-pattern/index.ts:12, Deno.serve), e o trigger trg_notify_critical_winloss em win_loss_patterns (triggers.md:385) aponta para ela (notify_critical_winloss_pattern.sql:16). Só que o trigger depende do GUC app.functions_url, que não está definido, não manda Authorization e engole erros (sql:12-26). A function está fora da allowlist de deploy (deploy.yml:144: 0 ocorrências), então não roda em produção.

### F3979 · Edge function winloss-webhook-dispatcher (15 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** PARCIAL (14/24 ainda órfãs): winloss-webhook-dispatcher segue com 0 chamadores.| Doc classifica como REAL. Chamador(es): FN run-retry-tests/index.ts:3,153, winloss-webhook-replay/index.ts:348. Lê _internal_secrets. \| Mantêm service_role por idempotência. \| Portão: esquema https, allowlist de host, rate limit; run-retry-tests/retry.ts exige fetchFn injetado. \| Catálogo API.md lista a edge function `winloss-webhook-dispatcher` na categoria "CRM / Pipeline" com auth "nenhuma detectada no handler · verify_jwt", método "qualquer", payload "__request_id, event, __target_subscription_id, __replay_of" e resposta "JSON". \| Dispatcher de webhooks Win/Loss com retry, DLQ e métricas; 0 assinantes, …
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:267`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:202-202`, `docs/SEC-08_SERVICE_ROLE_AUDIT.md:29`, `docs/agentes/branches-encerradas-261117.md:166,173-178`, `docs/API.md:82-82`, `docs/estado/13_INTEGRACOES.md:77` e mais 9
- **O que falta:** Publicar dispatcher e replay (deploy.yml:144), dar uma entrada real ao fluxo (trigger/cron/evento de win-loss) com autenticação interna e ter assinantes reais em winloss_webhook_subscriptions.
- **Evidência:** supabase/functions/winloss-webhook-dispatcher/index.ts existe; FORA da allowlist de deploy (.github/workflows/deploy.yml:144) → não roda em produção; chamada por: winloss-webhook-replay| cético: A pasta supabase/functions/winloss-webhook-dispatcher existe. O único chamador real é supabase/functions/winloss-webhook-replay/index.ts:349; run-retry-tests/index.ts:4,182 só referencia o arquivo de teste. Busca em src/: só um texto em RetryTestStatusPage.tsx:157, nenhum invoke. Não tem cron e não está na allowlist de trigger_internal_edge_job (sql:14-24). A function está fora da allowlist ACTIVE (deploy.yml:144: 0 ocorrências), e o próprio chamador (replay) também.

### F3980 · Edge function winloss-webhook-health-monitor (9 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** Doc classifica como REAL. Chamador(es): cron _/15min (mig 20261001144000:86). ADMIN_NOTIFICATION_EMAIL, ALERT__, RESEND_API_KEY, METRICS_INGEST_*, _internal_secrets.| Catálogo API.md lista a edge function `winloss-webhook-health-monitor` na categoria "CRM / Pipeline" com auth "nenhuma detectada no handler · verify_jwt", método "qualquer", payload "—" e resposta "JSON {checked, fired, suppressed, error}". \| Monitora entregas e alerta por kind consecutive_failures (≥5), high_retry_rate (>50% com ≥10 em 30min), attempts_exhausted (3 tentativas), com supressão suppress_minutes (60). \| 608 linhas; chamador: **nenhum**; verify_jwt true (default); tabelas tocadas (linhas em produção): winloss_we…
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:203-203`, `docs/API.md:83-83`, `docs/estado/13_INTEGRACOES.md:77`, `docs/runbooks/winloss-webhooks.md:1-13`, `docs/estado/10_EDGE_FUNCTIONS.md:470-470`, `docs/prod-readiness.md:428` e mais 4
- **O que falta:** Incluir 'winloss-webhook-health-monitor' na allowlist ACTIVE de deploy.yml:144 e confirmar a resposta 200 da edge (net._http_response) e linhas em winloss_webhook_alerts/métricas.
- **Evidência:** supabase/functions/winloss-webhook-health-monitor/index.ts existe; FORA da allowlist de deploy (.github/workflows/deploy.yml:144) → não roda em produção; ÓRFÃ: nenhum chamador no front, em edges ou em SQL/cron (edge-functions.json)| cético: O veredito PARCIAL se mantém, mas a evidência da pré-checagem está errada: a function tem cron. cron.md:32 mostra o job 42 'winloss-webhook-health-monitor-15min' (*/15) chamando trigger_internal_edge_job('winloss-webhook-health-monitor'), que está na allowlist dessa função (sql:24). cron-runs.md:227-233 registra execuções 'succeeded', mas isso só significa que a requisição foi enfileirada. A function está fora da allowlist ACTIVE (deploy.yml:144: 0 ocorrências), então o cron chama um endpoint não publicado.

### F3981 · Edge function winloss-webhook-replay (7 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** Doc classifica como REAL. Chamador(es): FE hooks/win-loss/useAsyncReplayQueue.ts:62, useWebhookDeadLetters.ts:96 (+1); FN winloss-webhook-replay-batch:172. Só SUPABASE_*.| Superior. \| Catálogo API.md lista a edge function `winloss-webhook-replay` na categoria "CRM / Pipeline" com auth "JWT do usuário · verify_jwt", método "qualquer", payload "requestId, userId, userEmail, source, summary, durationMs, ids" e resposta "JSON". \| Replay de dead-letters de webhooks Win/Loss. \| 725 linhas; chamador: FE src/hooks/win-loss/useAsyncReplayQueue.ts +2; verify_jwt true (default); tabelas tocadas (linhas em produção): winloss_webhook_dead_letters(0), winloss_webhook_replay_audit(0), winloss_webhook_r…
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:204-204`, `docs/benchmark/RAMPER_2026-07.md:145`, `docs/API.md:84-84`, `docs/estado/13_INTEGRACOES.md:77`, `docs/estado/10_EDGE_FUNCTIONS.md:471-471`, `docs/prod-readiness.md:429` e mais 1
- **O que falta:** Incluir winloss-webhook-replay (e o dispatcher que ela chama) na allowlist de deploy.yml:144.
- **Evidência:** supabase/functions/winloss-webhook-replay/index.ts existe; FORA da allowlist de deploy (.github/workflows/deploy.yml:144) → não roda em produção; chamada por: src/hooks/win-loss/useAsyncReplayQueue.ts, src/hooks/win-loss/useWebhookDeadLetters.ts, src/hooks/win-loss/useWebhookDeliveries.ts| cético: Existem chamadores reais no front: src/hooks/win-loss/useAsyncReplayQueue.ts:62, useWebhookDeadLetters.ts:96 e useWebhookDeliveries.ts:50, todos com supabase.functions.invoke('winloss-webhook-replay'). As tabelas winloss_webhook_dead_letters, replay_audit e replay_invocations existem no banco real com RLS (tables.md:404,407,408). Mas a function está fora da allowlist ACTIVE (deploy.yml:144: 0 ocorrências), então o invoke falha em produção.

### F3982 · Edge function winloss-webhook-replay-batch (11 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** PARCIAL (14/24 ainda órfãs): winloss-webhook-replay-batch segue com 0 chamadores.| Doc classifica como ÓRFÃ. Chamador(es): nenhum. Nenhum chamador. \| Catálogo API.md lista a edge function `winloss-webhook-replay-batch` na categoria "CRM / Pipeline" com auth "Bearer manual · verify_jwt", método "só POST", payload "dead_letter_ids, delivery_ids, chunk_size, stop_on_error" e resposta "JSON". \| Replay em lote de dead-letters. \| 430 linhas; chamador: **nenhum**; verify_jwt true (default); tabelas tocadas (linhas em produção): nenhuma. Classificação do doc: MORTO_OU_ABANDONADO (sem chamador). \| supabase/functions/winloss-webhook-replay-batch existe no repo (citada em src/: não); sonda OPTIONS…
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:267`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:205-205`, `docs/API.md:85-85`, `docs/estado/13_INTEGRACOES.md:77`, `docs/estado/10_EDGE_FUNCTIONS.md:472-472`, `docs/prod-readiness.md:430` e mais 5
- **O que falta:** Ligar à UI/cron, publicar (deploy.yml:144); ou remover.
- **Evidência:** supabase/functions/winloss-webhook-replay-batch/index.ts existe; FORA da allowlist de deploy (.github/workflows/deploy.yml:144) → não roda em produção; ÓRFÃ: nenhum chamador no front, em edges ou em SQL/cron (edge-functions.json)| cético: A pasta supabase/functions/winloss-webhook-replay-batch existe, mas a busca 'winloss-webhook-replay-batch' em src/ e supabase/functions (fora da própria pasta) dá 0 resultados. A fila assíncrona do front (useAsyncReplayQueue.ts:62) chama 'winloss-webhook-replay', não o batch. Não tem cron (cron.md) e está fora da allowlist (deploy.yml:144: 0 ocorrências).

### F3983 · Edge function winloss-webhook-timeline (6 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** Doc classifica como REAL. Chamador(es): FE hooks/win-loss/useWebhookTimeline.ts:72. Só SUPABASE_*.| Catálogo API.md lista a edge function `winloss-webhook-timeline` na categoria "CRM / Pipeline" com auth "JWT do usuário · verify_jwt", método "GET", payload "query: limit, requestId, subscriptionId, since" e resposta "JSON". \| Linha do tempo de entregas de webhooks Win/Loss. \| 298 linhas; chamador: FE src/hooks/win-loss/useWebhookTimeline.ts; verify_jwt true (default); tabelas tocadas (linhas em produção): user_roles(3), winloss_webhook_alerts(0), winloss_webhook_dead_letters(0). Classificação do doc: IMPLEMENTADO_TOTAL. \| supabase/functions/winloss-webhook-timeline existe no repo (citada …
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:206-206`, `docs/API.md:86-86`, `docs/estado/13_INTEGRACOES.md:77`, `docs/estado/10_EDGE_FUNCTIONS.md:473-473`, `docs/prod-readiness.md:431`, `docs/estado/09_HOOKS_SERVICES.md:291-311`
- **O que falta:** Incluir 'winloss-webhook-timeline' na allowlist de deploy.yml:144 (e dar link de menu para /admin/webhooks-timeline).
- **Evidência:** supabase/functions/winloss-webhook-timeline/index.ts existe; FORA da allowlist de deploy (.github/workflows/deploy.yml:144) → não roda em produção; ÓRFÃ: nenhum chamador no front, em edges ou em SQL/cron (edge-functions.json)| cético: O veredito PARCIAL se mantém, mas a pré-checagem errou ao chamar a function de órfã. Há chamador real: src/hooks/win-loss/useWebhookTimeline.ts:71-74 faz supabase.functions.invoke('winloss-webhook-timeline'). Esse hook é usado em src/pages/admin/WebhookTimelinePage.tsx, montada na rota /admin/webhooks-timeline (AppRoutes.tsx:1069-1072). O handler aceita GET e POST (index.ts:2,87,103). O motivo do PARCIAL é outro: a function está fora da allowlist ACTIVE (deploy.yml:144: 0 ocorrências), então não roda em produção.

### F3157 · Win/Loss: scoring auditável de risco e forecast com bandas ±σ

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** Módulo com scoring auditável e forecast com bandas.
- **Fontes:** `docs/benchmark/RAMPER_2026-07.md:180`
- **O que falta:** Persistir o score de risco win/loss (tabela com sale_id, score, reasons, computed_at e RLS) e salvar snapshots do forecast com limites inferior/superior para auditoria.
- **Evidência:** Bandas exibidas: ScenarioForecastChart montado em src/pages/WinLossIntelligence.tsx:370 com bandas OLS ±σ/IC (src/hooks/win-loss/useWinLossScenarios.ts:242-262), mas calculadas no cliente a cada render, sem persistência. Risco win/loss: AtRiskDealsFromPatterns (WinLossIntelligence.tsx:411) → useAtRiskFromPatterns.ts:73,85 invoca detect-winloss-at-risk (na allowlist), que só lê win_loss_patterns e sales (detect-winloss-at-risk/index.ts:52,57) e não grava nada → sem histórico auditável. ausente: grep -n -E "insert\|upsert" supabase/functions/detect-winloss-at-risk/index.ts → 0 resultados. forecast_snapshots (tables/public/forecast_snapshots.md) não tem colunas de banda/σ.
- **Revisão:** sem contestação cética concluída.

### F3158 · Eventos reais disparam webhooks Win/Loss (dispatcher, replay, timeline, health-monitor, DLQ)

- **Tipo:** Integração externa
- **O que os docs afirmam:** Dispatcher só é chamado por replay, teste e RetryTestStatusPage.tsx; nenhum evento real dispara.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:148`
- **O que falta:** Criar o produtor real (trigger em sales no fechamento ganho/perdido ou chamada no fim de analyze-win-loss) e deployar winloss-webhook-dispatcher (allowlist deploy.yml:144); validar com entrega real em winloss_webhook_deliveries.
- **Evidência:** winloss-webhook-dispatcher existe (supabase/functions/winloss-webhook-dispatcher/index.ts) mas: (1) não está na allowlist (deploy.yml:144: só 'detect-winloss-at-risk' e 'export-winloss-pdf' entre os winloss-*); (2) nenhum evento real o dispara — chamadores só supabase/functions/winloss-webhook-replay/index.ts:349, scripts/verify-dispatcher-request-id.sh:20 e run-retry-tests/index.ts:182 (testes); src/pages/RetryTestStatusPage.tsx:157 só exibe o nome do arquivo de teste (rota /admin/retry-test-status, AppRoutes.tsx:1093-1096). Sem trigger/webhook de banco para win/loss (triggers.md:385, webhooks.md sem winloss). winloss_webhook_deliveries ~1 linha (stats.md:76).
- **Revisão:** sem contestação cética concluída.

### F3162 · Domínio dormente: Win/Loss + webhooks de win-loss (12 tabelas zeradas)

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Agrupamento funcional com 12 tabelas todas com 0 linhas; indica módulo construído e nunca usado.
- **Fontes:** `docs/estado/11_DADOS_BANCO.md:221-227`
- **O que falta:** Deployar (incluir na allowlist deploy.yml:144) winloss-webhook-dispatcher/replay/health-monitor e calibrate-win-probability, ou remover o cron 42 e os painéis; criar produtor de eventos (ver F3177) para as tabelas de webhook receberem dados reais.
- **Evidência:** UI acessível: /win-loss-intelligence (AppRoutes.tsx:705, menu sidebarMenuData.ts:278) monta painéis de webhooks (WinLossIntelligence.tsx:413-420). Afirmação '12 tabelas zeradas' desatualizada: stats.md mostra win_loss_analyses ~500, win_loss_patterns 4, winloss_webhook_subscriptions 1, winloss_webhook_deliveries 1. Mas win_loss_insights, win_probability_calibrations, winloss_webhook_dead_letters, winloss_webhook_alerts seguem 0. Edges winloss-webhook-dispatcher, -replay, -replay-batch, -health-monitor, -timeline e calibrate-win-probability existem em supabase/functions/ mas NÃO estão na allowlist deploy.yml:144; cron.md:32 chama winloss-webhook-health-monitor (não deployada).
- **Revisão:** sem contestação cética concluída.

### F3164 · Painel Win/Loss Intelligence → Webhooks

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Tela que mostra assinaturas degradadas.
- **Fontes:** `docs/runbooks/winloss-webhooks.md:17`
- **O que falta:** Incluir winloss-webhook-replay (e dispatcher) na allowlist deploy.yml:144 para os botões de replay funcionarem; sem produtor (F3177) o painel só mostra a assinatura de teste.
- **Evidência:** Rota /win-loss-intelligence (AppRoutes.tsx:705) monta WebhookHealthPanel (assinaturas degradadas, src/components/win-loss/WebhookHealthPanel.tsx:121,234-241), WebhookSubscriptionsPanel e WebhookDeadLetterPanel (WinLossIntelligence.tsx:413-420); hooks leem tabelas reais (useWebhookSubscriptions.ts:23, useWebhookDeliveries.ts:30, useWebhookDeadLetters.ts:63). Mas o replay chama winloss-webhook-replay (useWebhookDeliveries.ts:50, useWebhookDeadLetters.ts:96), que não está na allowlist deploy.yml:144; o diretório é src/components/win-loss (não winloss).
- **Revisão:** sem contestação cética concluída.

### F3989 · Rota /admin/webhooks-alert-history (4 afirmações nos docs)

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Rota /admin/webhooks-alert-history (AppRoutes.tsx:288) renderiza src/pages/admin/WebhookAlertHistoryPage.tsx; role: admin. Classificação do doc: MORTO_OU_ABANDONADO. Evidência: SEM link/menu em todo src/ · sb=3 useQuery=3 mut=1 (árvore 10 arq.)| NÃO INICIADO (20/20): rota /admin/webhooks-alert-history existe mas sem link/menu; só mapas de título/prefetch. \| Rota registrada em AppRoutes.tsx com acesso "admin", GET em produção 200. Status no doc: OK \| API.md declara a rota `/admin/webhooks-alert-history` renderizando o componente WebhookAlertHistoryPage com acesso "admin".
- **Fontes:** `docs/estado/01_FRONTEND_ROTAS.md:206-206`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:52`, `docs/prod-readiness.md:102`, `docs/API.md:447-447`
- **O que falta:** Entrada no menu/AdminQuickLinks e publicação do winloss-webhook-health-monitor para a tabela receber alertas.
- **Evidência:** rota /admin/webhooks-alert-history → src/pages/admin/WebhookAlertHistoryPage.tsx (AppRoutes.tsx); sem entrada no menu (sidebarMenuData.ts) → só acessível por URL| cético: A rota está registrada com guarda Admin (src/routes/AppRoutes.tsx:1077-1082 → WebhookAlertHistoryPage). Os dados vêm de winloss_webhook_alerts (src/hooks/win-loss/useWebhookAlertHistory.ts:131), tabela com RLS (tables.md:403). Mas não há menu nem link: grep -rn 'webhooks-alert' src fora de AppRoutes.tsx → 0 resultados, e sidebarMenuData.ts só tem /webhooks (:370). Além disso, a tabela só é alimentada pelo health-monitor, que não está publicado (deploy.yml:144).

### F3990 · Rota /admin/webhooks-alert-settings (4 afirmações nos docs)

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Rota /admin/webhooks-alert-settings (AppRoutes.tsx:289) renderiza src/pages/admin/WebhookAlertSettingsPage.tsx; role: admin. Classificação do doc: MORTO_OU_ABANDONADO. Evidência: SEM link/menu em todo src/ · sb=1 useQuery=1 mut=1 (árvore 9 arq.)| NÃO INICIADO (20/20): rota /admin/webhooks-alert-settings existe mas sem link/menu; só mapas de título/prefetch. \| Rota registrada em AppRoutes.tsx com acesso "admin", GET em produção 200. Status no doc: OK \| API.md declara a rota `/admin/webhooks-alert-settings` renderizando o componente WebhookAlertSettingsPage com acesso "admin".
- **Fontes:** `docs/estado/01_FRONTEND_ROTAS.md:207-207`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:52`, `docs/prod-readiness.md:103`, `docs/API.md:448-448`
- **O que falta:** Entrada no menu/AdminQuickLinks e publicação do winloss-webhook-health-monitor.
- **Evidência:** rota /admin/webhooks-alert-settings → src/pages/admin/WebhookAlertSettingsPage.tsx (AppRoutes.tsx); sem entrada no menu (sidebarMenuData.ts) → só acessível por URL| cético: A rota está registrada com guarda Admin (AppRoutes.tsx:1084-1090 → WebhookAlertSettingsPage). Os dados vêm de winloss_alert_settings (src/hooks/win-loss/useWebhookAlertSettings.ts:47,74), e a tabela existe no banco (tables/public/winloss_alert_settings.md). Mas não há menu nem link: grep -rn 'webhooks-alert' src fora de AppRoutes.tsx → 0 resultados, e sidebarMenuData.ts não tem a URL. As configurações também só valem se o health-monitor rodar, e ele não está publicado (deploy.yml:144).

### F3165 · UI useWinLossAnalysis: página dedicada com motivos categorizados e drill-down por vendedor/produto

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Falta página dedicada com motivos categorizados e drill-down por vendedor/produto para useWinLossAnalysis (UI atual: 2 imports).
- **Fontes:** `docs/FUNCIONALIDADES_SEM_UI.md:32`
- **O que falta:** Substituir os cards 'Estratégia de Defesa' e 'Projeção de Melhoria' (WinLossAnalysisPage.tsx:66-108) por dados calculados; ligar handlers de exportar/filtros; adicionar estado de erro e vazio em WinLossAnalysis.tsx.
- **Evidência:** Página dedicada existe: src/pages/WinLossAnalysisPage.tsx montada em /analytics/win-loss (AppRoutes.tsx:607-610, menu sidebarMenuData.ts:279); usa WinLossAnalysis (components/analytics/WinLossAnalysis.tsx:14) com useWinLossAnalysis lendo deal_outcomes (~500 linhas, stats.md:50), motivos top e drill-down WinLossDrillDown por vendedor/produto (WinLossAnalysis.tsx:76-80). Problemas: texto fictício fixo em WinLossAnalysisPage.tsx:78-107 ('70% das vitórias', 'Player Y (30%)', '68%'); botões 'Exportar Dados' e 'Filtros Avançados' sem onClick (WinLossAnalysisPage.tsx:39-53); sem estado de erro (WinLossAnalysis.tsx:36 retorna null).
- **Revisão:** sem contestação cética concluída.

### F3166 · Win/Loss core, Purchase Intelligence, CS 360, Portfólio, Deal Health e Stakeholders com fio completo e dado real

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Módulos declarados completos com dado real.
- **Fontes:** `docs/estado/ESTADO_ATUAL.md:251-252`
- **O que falta:** Remover hardcode de WinLossAnalysisPage.tsx:66-108; deployar calibrate-win-probability e webhooks de win-loss; auditar CS 360/Purchase/Portfólio/Stakeholders individualmente (não verificado item a item aqui).
- **Evidência:** Rotas existem: /win-loss-intelligence (AppRoutes.tsx:705), /analytics/win-loss (:607), PurchaseIntelligence (:701), /customer-success-360 (:791), /portfolio (:272); tabelas populadas: deal_health_scores ~900, deal_stakeholders ~600, client_portfolio ~100, win_loss_analyses ~500 (stats.md). Mas Win/Loss core tem dado fictício hardcoded (WinLossAnalysisPage.tsx:78-107), win_loss_insights e win_probability_calibrations com 0 linhas e calibrate-win-probability / webhooks fora da allowlist deploy.yml:144.
- **Revisão:** sem contestação cética concluída.

### F3167 · PR #530: SSRF e rate-limit de webhook reescritos (23/23 casos adversariais)

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** Allowlist/blocklist de host e rate-limit reescritos de forma segura, testados.
- **Fontes:** `docs/agentes/branches-encerradas-261117.md:65`
- **O que falta:** Versionar os 23 casos como teste SQL em supabase/tests (pgTAP) e/ou Deno; incluir winloss-webhook-dispatcher na allowlist para o portão valer em produção.
- **Evidência:** Commit 007a6c454 (#530) alterou supabase/functions/winloss-webhook-dispatcher/index.ts (portão https + is_webhook_host_allowed + check_webhook_rate_limit em :326-361) e criou supabase/migrations/20261117050000_webhook_ssrf_e_rate_limit.sql; funções existem no banco real (functions/public/is_webhook_host_allowed__c566051b12d385cf.sql:24-27 bloqueia localhost/.internal/metadata; check_webhook_rate_limit__88fb0c893ca174f2.sql). Os 23 casos adversariais foram rodados manualmente em BEGIN/ROLLBACK (mensagem do commit), não versionados: ausente: grep -rln 'is_webhook_host_allowed' supabase/tests tests src → só src/integrations/supabase/types.ts. Dispatcher fora da allowlist deploy.yml:144.
- **Revisão:** sem contestação cética concluída.

### F3168 · scripts/verify-dispatcher-request-id.sh sem chamador

- **Tipo:** Service/lib
- **O que os docs afirmam:** Verificador de request-id do dispatcher sem invocador.
- **Fontes:** `docs/estado/12_INFRA_CI_TESTES.md:306`
- **O que falta:** Remover o script (candidato a morto, docs/estado/12_INFRA_CI_TESTES.md:306) ou corrigir DEFAULT_BASE_URL para usyxfpqlsspldubptrdl, tirar o JWT hardcoded e ligar a um workflow.
- **Evidência:** scripts/verify-dispatcher-request-id.sh existe; único registro é manual em scripts/automation.config.json:802-806 ('sem chamador literal'); nenhum workflow/package.json o chama (grep -rn 'verify-dispatcher-request-id' .github package.json → 0). Aponta para projeto errado saejqkojleeaxzrslzfg com JWT anon de fallback (script:18,22) e para dispatcher não deployado.
- **Revisão:** sem contestação cética concluída.

### F3175 · Testes de Win-Loss/competitive (componentes 0/65 e 0/33; hooks 0/54)

- **Tipo:** Teste
- **O que os docs afirmam:** Só lib/winloss tem teste (5/6).
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:101`
- **O que falta:** Criar ao menos um teste em src/components/win-loss (ex.: WebhookHealthPanel, ActionableInsightsPanel) e ampliar hooks/win-loss.
- **Evidência:** Testes por diretório: src/components/win-loss 0 testes/60 .tsx (find src/components/win-loss -name '_.test._' → 0); src/components/competitive 3 (FeatureComparison, LeagueSystem, BattleArena .test.tsx)/33; src/hooks/win-loss 1 (useWinLossAggregations.test.ts)/54; src/lib/winloss 5. O diretório real é win-loss, não winloss.
- **Revisão:** sem contestação cética concluída.

### F3176 · notify-critical-pattern trigger funcional e HTML escapado

- **Tipo:** Trigger
- **O que os docs afirmam:** Trigger quebrado (GUC indefinido, sem Authorization); HTML sem escape.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:238`
- **O que falta:** Reescrever a função do trigger para PERFORM public.trigger_internal_edge_job('notify-critical-pattern', payload); escapar HTML em index.ts:28-42; incluir notify-critical-pattern na allowlist deploy.yml:144.
- **Evidência:** Trigger trg_notify_critical_winloss existe (triggers.md:385), mas a função real private.notify_critical_winloss_pattern (functions/private/notify_critical_winloss_pattern__12ae32cb1ec02d01.sql) ainda usa current_setting('app.functions_url') e net.http_post sem Authorization — não usa trigger_internal_edge_job. Edge notify-critical-pattern interpola sem escape: supabase/functions/notify-critical-pattern/index.ts:30-31,41 (${body.name}, ${body.pattern_id}). notify-critical-pattern fora da allowlist deploy.yml:144.
- **Revisão:** sem contestação cética concluída.
