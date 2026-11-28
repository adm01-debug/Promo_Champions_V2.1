# Integrações e plataforma

[Voltar ao índice](README.md)

118 itens não implementados, parciais ou não verificáveis neste domínio.

## Não implementado (33)

### F3708 · Nodes Trigger / Condition / Action no builder

- **Tipo:** Componente
- **O que os docs afirmam:** Três tipos de nó.
- **Fontes:** `docs/FUNCIONALIDADES_COMPLETAS.md:399-399`
- **O que falta:** componente TriggerNode ausente (componentes.json e src/)
- **Evidência:** componente TriggerNode ausente (componentes.json e src/)| CONTESTADO pelo cético (PARCIAL): O builder existe e usa @xyflow/react, montado na rota /workflows: src/pages/WorkflowsPage.tsx:4-17 e :331, src/routes/AppRoutes.tsx:549-552, src/routes/lazyPages.ts:143. Os três tipos Trigger/Condição/Ação existem só como itens de paleta (WorkflowsPage.tsx:49-58). Todo nó é criado com type:'default' (WorkflowsPage.tsx:63 e :134) e a posição usa Math.random (:135). Não há componentes TriggerNode/ConditionNode/ActionNode nem nodeTypes: grep -rniE 'TriggerNode\|ConditionNode\|ActionNode\|nodeTypes' src → 0 resultados. Efeito colateral: supabase/functions/workflow-executor/index.ts:125 e :136 testam next.type === 'condition'/'action', tipos que o builder nunca grava.
- **Revisão:** em disputa. O cético propõe Parcial e o juiz ainda não decidiu.

### F3709 · Quote Sync audit panel em /admin

- **Tipo:** Componente
- **O que os docs afirmam:** Auditoria de sync de orçamentos.
- **Fontes:** `docs/FUNCIONALIDADES_COMPLETAS.md:582-582`
- **O que falta:** componente QuoteSyncAudit ausente (componentes.json e src/)
- **Evidência:** componente QuoteSyncAudit ausente (componentes.json e src/)| CONTESTADO pelo cético (PARCIAL): Existe painel de auditoria com outro nome: src/components/admin/QuoteSyncLogsPanel.tsx:10-23 lê public.quote_sync_logs (no banco com RLS: tables.md:269) e está montado em /admin (src/pages/AdminDashboard.tsx:22 e :182; rota em AppRoutes.tsx:957). Há ainda /admin/quote-sync-inbound (AppRoutes.tsx:981-985) → AdminQuoteSyncInboundPage.tsx:64, que lê quote_sync_inbound_log (RLS sim, tables.md:268). Essa tabela é gravada por receive-quote-sync/index.ts:79, que está na allowlist. Porém quem grava quote_sync_logs é receive-quote-webhook/index.ts:153,300,323, e essa function está FORA da allowlist (.github/workflows/deploy.yml:144).
- **Revisão:** em disputa. O cético propõe Parcial e o juiz ainda não decidiu.

### F3710 · Migration 20261013170000_bitrix24_sync_cron aplicada

- **Tipo:** Agendamento (cron)
- **O que os docs afirmam:** Cron de sincronização Bitrix24 aplicado (run 39440104249).
- **Fontes:** `docs/execucao/catchup-migrations-2026-10-20/README.md:170`
- **O que falta:** nenhum job em pg_cron para "20261013170000_bitrix24_sync_cron" (cron.md, 45 jobs)
- **Evidência:** nenhum job em pg_cron para "20261013170000_bitrix24_sync_cron" (cron.md, 45 jobs)| CONTESTADO pelo cético (IMPLEMENTADO): O arquivo existe: supabase/migrations/20261013170000_bitrix24_sync_cron.sql:92-95 (cron.schedule 'bitrix24-sync-hourly'). A versão consta no ledger real (contexto/supabase/migrations.md:657). O job 48 está ativo, '17 * * * *', e chama trigger_internal_edge_job('bitrix24-sync') (cron.md:37). A allowlist interna da função inclui 'bitrix24-sync' (functions/public/trigger_internal_edge_job__f02f045c8b4350ab.sql:42). Houve execuções succeeded em 20/11 (cron-runs.md:274-276), e bitrix24-sync está na allowlist de deploy (deploy.yml:144). A pré-checagem procurou o nome da migration em vez do jobname.
- **Revisão:** em disputa. O cético propõe Implementado e o juiz ainda não decidiu.

### F3711 · P1 origem: job process-webhook-outbox inativo e nunca executado

- **Tipo:** Agendamento (cron)
- **O que os docs afirmam:** Doc: job pg_cron process-webhook-outbox (202) inativo; eventos válidos da outbox não são processados.
- **Fontes:** `docs/auditoria/MATRIZ_FORENSE_BANCOS_E_CONTRATOS_2026-08-26.md:183,193-195`
- **O que falta:** nenhum job em pg_cron para "process-webhook-outbox" (cron.md, 45 jobs)
- **Evidência:** nenhum job em pg_cron para "process-webhook-outbox" (cron.md, 45 jobs)| CONTESTADO pelo cético (NAO_APLICAVEL): A afirmação vem da matriz forense sobre o banco de 'origem', um catálogo de fornecedores/estoque com 137 jobs (docs/auditoria/MATRIZ_FORENSE_BANCOS_E_CONTRATOS_2026-08-26.md:4,13-14,192-195). Não é sobre o banco deste repo, que tem 51 linhas em cron.md e nenhum job outbox: grep -n outbox cron.md tables.md functions.md triggers.md → 0. Não existe supabase/functions/process-webhook-outbox nem webhook_outbox: grep -rln 'webhook_outbox\|process-webhook-outbox' supabase src → 0.
- **Revisão:** em disputa. O cético propõe Não aplicável e o juiz ainda não decidiu.

### F2189 · API pública com OpenAPI e SDK

- **Tipo:** Doc/config
- **O que os docs afirmam:** Não iniciado.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:255`
- **O que falta:** Publicar openapi.json das edge functions públicas (ex.: ranking-api) e gerar SDK a partir dele.
- **Evidência:** ausente: `find . -iname 'openapi*' -not -path './node_modules/*'` → 0 resultados; `grep -n -i 'openapi\|sdk' docs/API.md` só linha 9 (menção à OpenAPI gerada pelo PostgREST do Supabase, não spec própria). Nenhum SDK no repo.
- **Revisão:** sem contestação cética concluída.

### F2200 · docs/API.md com chave de idempotência de cada edge function pública

- **Tipo:** Doc/config
- **O que os docs afirmam:** Recomenda documentar em docs/API.md a chave de idempotência esperada por edge function pública.
- **Fontes:** `docs/reports/BACKEND_DEEP_AUDIT_2026-07-11.md:127-127`
- **O que falta:** Adicionar em docs/API.md coluna/seção 'Chave de idempotência' por edge function pública (header ou campo do body esperado).
- **Evidência:** docs/API.md existe (800 linhas) mas `grep -i -c 'idempotency-key\|chave de idempot' docs/API.md` → 0; única ocorrência de 'idempot' é o campo de resposta de notify-quote-conversion (:73) e um nome de migration (:773). Não há seção de chave de idempotência por function.
- **Revisão:** sem contestação cética concluída.

### F3715 · S-07 Webhooks com autenticação de origem insuficiente e escrita com service role

- **Tipo:** Edge function
- **O que os docs afirmam:** Doc: endpoints de callback sem assinatura/timestamp/dedupe/RBAC suficientes antes do deploy.
- **Fontes:** `docs/auditoria/SIMULACAO_CENARIOS_ONDA_0_2026-08-26.md:32`
- **O que falta:** pasta supabase/functions/twilio-call/index.ts ausente
- **Evidência:** pasta supabase/functions/twilio-call/index.ts ausente| CONTESTADO pelo cético (PARCIAL): A pré-checagem procurou uma pasta 'twilio-call' que não existe, mas há twilio-call-status, twilio-call-twiml e twilio-click-to-call. O hardening existe em supabase/functions/_shared/webhook-auth.ts: timingSafeEqual :49, verifyHmacSha256Signature :98, isFreshUnixTimestamp :111, verifyResendSvixSignature :124, verifyTwilioSignature :177, verifyMetaSignature :219, verifySendGridSignature :298. Os webhooks publicados o usam: inbound-email-webhook/index.ts:202 (com dedupe por provider,message_id em :320) e multichannel-status-webhook/index.ts:128 (com dedupe webhook_inbound_dedupe em :164-181). twilio-call-status/index.ts:121 verifica a assinatura e :162 faz dedupe. Porém twilio-call-*, whatsapp-inbound-webhook e receive-quote-webhook estão fora da allowlist. Os writes continuam com service role (createC…
- **Revisão:** em disputa. O cético propõe Parcial e o juiz ainda não decidiu.

### F3716 · Webhook de entrada Bitrix24

- **Tipo:** Edge function
- **O que os docs afirmam:** Sem webhook de entrada.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:138`
- **O que falta:** Edge function de webhook de entrada Bitrix24 (eventos ONCRM*), com validação de application_token e atualização do CRM.
- **Evidência:** pasta supabase/functions/bitrix24-webhook/index.ts ausente| cético: ausente: ls supabase/functions \| grep -i bitrix → só bitrix24-oauth e bitrix24-sync. grep -rniE 'ONCRM\|event.bind\|application_token\|webhook' supabase/functions/bitrix24-*/index.ts → 0 resultados. A sincronização é só de saída/pull, por cron (cron.md:37).

### F3717 · RPC transacional unindo mudança de status, engajamento e dedupe (exactly-once)

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** Doc aponta ausência de RPC que una na mesma transação status + record_engagement_signal + dedupe.
- **Fontes:** `docs/auditoria/CONTENCAO_INTEGRIDADE_WEBHOOKS_2026-08-26.md:21-23`
- **O que falta:** Criar uma RPC única e transacional (status + record_engagement_signal + marca de dedupe) e trocar as chamadas separadas nos webhooks por ela.
- **Evidência:** função "dedupe" ausente do banco real (functions.md)| cético: Os webhooks ainda fazem operações separadas: multichannel-status-webhook/index.ts:181 (reserva dedupe), com compensação manual em :164-174 e rpc record_engagement_signal separada em :248-249. inbound-email-webhook/index.ts:86,179,288,335,372 chama várias RPCs separadas. No banco real só existem record_engagement_signal e auto_pause_enrollment isoladas (functions/public/record_engagement_signal__7795eee600e34da9.sql). A fonte confirma a lacuna: docs/auditoria/CONTENCAO_INTEGRIDADE_WEBHOOKS_2026-08-26.md:21-23.

### F3718 · Hook órfão useCircuitBreakerNames

- **Tipo:** Hook
- **O que os docs afirmam:** Exportado em `src/hooks/useCircuitBreakerHistory.ts` com zero referência em src/, tests/ e scripts/, inclusive dentro do próprio arquivo (critério rg -w).
- **Fontes:** `docs/estado/09_HOOKS_SERVICES.md:171`
- **O que falta:** hook useCircuitBreakerNames ausente (hooks.json e arquivos src/)
- **Evidência:** hook useCircuitBreakerNames ausente (hooks.json e arquivos src/)| CONTESTADO pelo cético (REMOVIDO_INTENCIONALMENTE): O commit 9e4b2231a (#217, em main) 'chore: remover código morto catalogado pela auditoria (hooks órfãos...)' apagou '-export function useCircuitBreakerNames(days = 30)' de src/hooks/useCircuitBreakerHistory.ts (git show 9e4b2231a -- src/hooks/useCircuitBreakerHistory.ts). Hoje o arquivo só exporta useCircuitBreakerHistory (:17) e useCircuitBreakerStats (:47). grep -rnw useCircuitBreakerNames src tests scripts → 0. O critério aceita 'ou símbolo removido'.
- **Revisão:** em disputa. O cético propõe Removido de propósito e o juiz ainda não decidiu.

### F3719 · Hook órfão useCircuitBreakerTrends

- **Tipo:** Hook
- **O que os docs afirmam:** Exportado em `src/hooks/useCircuitBreakerHistory.ts` com zero referência em src/, tests/ e scripts/, inclusive dentro do próprio arquivo (critério rg -w).
- **Fontes:** `docs/estado/09_HOOKS_SERVICES.md:172`
- **O que falta:** hook useCircuitBreakerTrends ausente (hooks.json e arquivos src/)
- **Evidência:** hook useCircuitBreakerTrends ausente (hooks.json e arquivos src/)| CONTESTADO pelo cético (REMOVIDO_INTENCIONALMENTE): O commit 9e4b2231a (#217) apagou '-export function useCircuitBreakerTrends(days = 7, circuitFilter?)' de src/hooks/useCircuitBreakerHistory.ts, com a mensagem 'remover código morto ... hooks órfãos'. grep -rnw useCircuitBreakerTrends src tests scripts → 0. O arquivo atual exporta só :17 e :47.
- **Revisão:** em disputa. O cético propõe Removido de propósito e o juiz ainda não decidiu.

### F3720 · Hook órfão useDeleteOldCircuitBreakerEvents

- **Tipo:** Hook
- **O que os docs afirmam:** Exportado em `src/hooks/useCircuitBreakerHistory.ts:82` com zero referência em src/, tests/ e scripts/, inclusive dentro do próprio arquivo (critério rg -w).
- **Fontes:** `docs/estado/09_HOOKS_SERVICES.md:179`
- **O que falta:** hook useDeleteOldCircuitBreakerEvents ausente (hooks.json e arquivos src/)
- **Evidência:** hook useDeleteOldCircuitBreakerEvents ausente (hooks.json e arquivos src/)| CONTESTADO pelo cético (REMOVIDO_INTENCIONALMENTE): O commit 9e4b2231a (#217) apagou '-export function useDeleteOldCircuitBreakerEvents()' de src/hooks/useCircuitBreakerHistory.ts, com a mensagem 'remover código morto ... hooks órfãos'. grep -rnw useDeleteOldCircuitBreakerEvents src tests scripts → 0.
- **Revisão:** em disputa. O cético propõe Removido de propósito e o juiz ainda não decidiu.

### F3721 · Hook órfão useLogCircuitBreakerEvent

- **Tipo:** Hook
- **O que os docs afirmam:** Exportado em `src/hooks/useCircuitBreakerHistory.ts` com zero referência em src/, tests/ e scripts/, inclusive dentro do próprio arquivo (critério rg -w).
- **Fontes:** `docs/estado/09_HOOKS_SERVICES.md:191`
- **O que falta:** hook useLogCircuitBreakerEvent ausente (hooks.json e arquivos src/)
- **Evidência:** hook useLogCircuitBreakerEvent ausente (hooks.json e arquivos src/)| CONTESTADO pelo cético (REMOVIDO_INTENCIONALMENTE): O commit 9e4b2231a (#217) apagou '-export function useLogCircuitBreakerEvent()' de src/hooks/useCircuitBreakerHistory.ts, com a mensagem 'remover código morto ... hooks órfãos'. grep -rnw useLogCircuitBreakerEvent src tests scripts → 0.
- **Revisão:** em disputa. O cético propõe Removido de propósito e o juiz ainda não decidiu.

### F3722 · Hook órfão useWorkflow

- **Tipo:** Hook
- **O que os docs afirmam:** Exportado em `src/hooks/useWorkflows.ts` com zero referência em src/, tests/ e scripts/, inclusive dentro do próprio arquivo (critério rg -w).
- **Fontes:** `docs/estado/09_HOOKS_SERVICES.md:213`
- **O que falta:** hook useWorkflow ausente (hooks.json e arquivos src/)
- **Evidência:** hook useWorkflow ausente (hooks.json e arquivos src/)| CONTESTADO pelo cético (REMOVIDO_INTENCIONALMENTE): O commit 9e4b2231a (#217) apagou '-export const useWorkflow = (id: string \| undefined) =>' de src/hooks/useWorkflows.ts (git show 9e4b2231a -- src/hooks/useWorkflows.ts). Hoje o arquivo exporta useWorkflows :39, useWorkflowExecutions :54, useSaveWorkflow :72, useDeleteWorkflow :112 e useExecuteWorkflow :126. grep -rnw useWorkflow src tests scripts → 0.
- **Revisão:** em disputa. O cético propõe Removido de propósito e o juiz ainda não decidiu.

### F2245 · GraphQL API

- **Tipo:** Integração externa
- **O que os docs afirmam:** Falta API GraphQL.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:209`
- **O que falta:** Habilitar pg_graphql no projeto, expor/documentar o endpoint /graphql/v1 e ter ao menos um consumidor ou doc de uso.
- **Evidência:** Snapshot supabase/extensions.md lista 9 extensões (pg_cron, pg_net, pg_stat_statements, pg_trgm, pgcrypto, plpgsql, supabase_vault, uuid-ossp, vector) — pg_graphql ausente. grep -rniE 'graphql' src supabase/functions → só src/integrations/supabase/types.ts (tipo gerado), nenhum cliente/endpoint/doc. grants.md:1357-1361 mostra apenas os schemas graphql/graphql_public padrão do Supabase.
- **Revisão:** sem contestação cética concluída.

### F2258 · Integrações ERP (SAP, Oracle, TOTVS)

- **Tipo:** Integração externa
- **O que os docs afirmam:** Falta integração com ERPs.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:58`
- **O que falta:** Tudo: conector ERP, credenciais, mapeamento, cron e UI.
- **Evidência:** ausente: ls supabase/functions| grep -i erp → 0; grep -rniE 'totvs\|\bsap\b\|oracle' src supabase/functions → só rótulos de UI: src/components/settings/ApiIntegrationSettings.tsx:107 (placeholder 'Ex: Sistema ERP, Bitrix24...'), src/pages/Orcamentos.tsx:387 (Label 'ID Externo (ERP/Ref)'), src/components/purchase-intelligence/PurchasePredictionCard.tsx:122 (string descritiva). Nenhum conector, function ou tabela de ERP. \| cético: ausente: ls supabase/functions \| grep -iE 'erp\|omie\|bling\|totvs\|sap' → 0; grep -iE 'erp\|omie\|bling\|totvs' tables.md (snapshot) → 0 tabelas. Só rótulos de UI citados pelo verificador.

### F2260 · Marketplace, Zapier e ERP

- **Tipo:** Integração externa
- **O que os docs afirmam:** Não iniciados.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:255`
- **O que falta:** Tudo: marketplace, Zapier/Make e ERP.
- **Evidência:** ausente: grep -rniE 'zapier\|make\.com' src supabase → 0; grep -rni marketplace src --include=_.ts --include=_.tsx → 0; ls supabase/functions| grep -i erp → 0. Confirma 'não iniciados' (docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:255). \| cético: ausente: grep -rliE 'zapier\|make\.com\|integromat\|sales.?navigator' src supabase → 0 (só docs/GAPS_CLASSE_MUNDIAL.md); ls supabase/functions \| grep -iE 'erp\|zapier\|marketplace' → 0.

### F2261 · Marketplace, Zapier/Make, ERP, LinkedIn Sales Navigator

- **Tipo:** Integração externa
- **O que os docs afirmam:** zapier/make.com/totvs/sap_ = 0.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:128`
- **O que falta:** Tudo: nenhum dos conectores existe.
- **Evidência:** ausente: grep -rniE 'zapier\|make\.com\|sales navigator\|totvs\|sap_' src supabase scripts → 0; 'linkedin' aparece apenas como valor de enum de canal (src/types/index.ts:45,134), sem integração. Nenhum conector funcional.| cético: ausente: grep -rliE 'zapier\|make\.com\|integromat\|sales.?navigator' src supabase → 0; ls supabase/functions \| grep -iE 'erp\|linkedin\|zapier' → 0; nenhuma tabela correspondente em tables.md.

### F2270 · Sync bidirecional Gmail/Outlook e calendário

- **Tipo:** Integração externa
- **O que os docs afirmam:** gmail/outlook/google calendar/text/calendar = 0.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:126`
- **O que falta:** Tudo: OAuth Google/Microsoft, sync de e-mail/eventos, tabelas e UI.
- **Evidência:** ausente: grep -rniE 'gmail\|outlook\|googleapis.com/calendar\|graph\.microsoft\|google_calendar\|text/calendar' src supabase/functions → 0; ls supabase/functions| grep -iE 'gmail\|outlook\|calendar\|google' → 0. Nenhum OAuth Google/Microsoft nem sync de eventos. \| cético: ausente: grep -rliE 'gmail\|outlook\|google ?calendar\|googleapis\|graph\.microsoft\|BEGIN:VCALENDAR' src supabase/functions → só src/index.css (import de Google Fonts). Existe inbound-email-webhook genérico (sem OAuth Gmail/Outlook), não é sync bidirecional.

### F2274 · Sync Gmail/Outlook e calendário

- **Tipo:** Integração externa
- **O que os docs afirmam:** Não iniciado.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:255`
- **O que falta:** Tudo: OAuth e sync de e-mail/calendário.
- **Evidência:** ausente: grep -rniE 'gmail\|outlook\|googleapis.com/calendar\|graph\.microsoft\|google_calendar' src supabase/functions → 0; nenhuma pasta em supabase/functions com gmail/outlook/calendar. Confirma 'não iniciado' (README.md:255 da auditoria 2026-10-12).| cético: ausente: grep -rliE 'gmail\|outlook\|google ?calendar\|googleapis\|graph\.microsoft' src supabase/functions → só src/index.css (Google Fonts); nenhuma pasta gmail/outlook/calendar em supabase/functions.

### F2275 · Zapier/Make native app

- **Tipo:** Integração externa
- **O que os docs afirmam:** Falta app nativo Zapier/Make.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:59`
- **O que falta:** App Zapier/Make publicado usando api_tokens/webhooks e eventos de negócio reais.
- **Evidência:** ausente: grep -rniE 'zapier\|make\.com' src supabase scripts → 0. Pré-requisitos existem: rota /webhooks (src/routes/AppRoutes.tsx:517-520, WebhooksPage.tsx), dispatch-webhook na allowlist (deploy.yml:144) porém só dispara test.ping (src/hooks/useWebhooks.ts:173-176), tabelas api_tokens e webhooks com RLS (tables.md:25,389). Nenhum app Zapier/Make nem manifesto.| cético: ausente: grep -rliE 'zapier\|make\.com\|integromat' src supabase → 0; nenhum manifesto de app. dispatch-webhook está na allowlist (deploy.yml:144=1) mas é só pré-requisito.

### F2278 · SDKs oficiais (JS, Python, Ruby)

- **Tipo:** Outro
- **O que os docs afirmam:** Falta SDKs.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:211`
- **O que falta:** Tudo: SDKs JS/Python/Ruby e publicação.
- **Evidência:** ausente: find . -path ./node_modules -prune -o -iname '_sdk_' -print → 0; ls packages sdk sdks → inexistentes; package.json não publica pacote cliente. Nenhum SDK JS/Python/Ruby no repo.| cético: ausente: find . (sem node_modules/.git) -iname '_sdk_' -o -iname '*.gemspec' -o -iname setup.py → 0 (único pyproject.toml é tools/graphify, ferramenta interna); package.json:3 "private": true.

### F2280 · Analytics de uso da API

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Não iniciado.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:255`
- **O que falta:** Criar tabela api_request_logs (RLS) gravada pelas edges que validam token, e tela/hook de métricas por token/endpoint; incluir ranking-api na allowlist se o token for usado.
- **Evidência:** ausente: grep -rniE 'api_request_logs\|api_usage\|api_analytics' src supabase scripts → 0 resultados; contexto/supabase/tables.md não lista tabela api_request_logs/api_usage (grep → 0). Único rastro: coluna usage_count incrementada em validate_api_token (contexto/supabase/functions/public/validate_api_token__969d36e50afbbc55.sql:16), chamada só por supabase/functions/ranking-api/index.ts, que NÃO está na allowlist ACTIVE (.github/workflows/deploy.yml:144). api_tokens=0 linhas (stats.md:241).
- **Revisão:** sem contestação cética concluída.

### F2290 · Reprocesso de falhas do sync Bitrix24

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Sem reprocesso.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:138`
- **O que falta:** Criar ação 'retry-failed' em bitrix24-sync que releia bitrix24_sync_logs com erro e reprocesse, e botão em BitrixSyncHistory chamando-a.
- **Evidência:** supabase/functions/bitrix24-sync/index.ts só aceita ações sync-* (l.1054-1066: sync-companies-from-bitrix, sync-companies-to-bitrix, sync-deals-from-bitrix, sync-deals-to-bitrix, sync-all); grep -ni 'retry\|reprocess' no index.ts → só comentário de lock (l.999). src/components/bitrix/BitrixSyncHistory.tsx: grep -i 'button\|mutate\|retry\|reprocess' → 0; src/hooks/useBitrix24.ts:131-134 só dispara sync com action. Nenhum cron de reprocesso (cron.md:37 só bitrix24-sync-hourly).
- **Revisão:** sem contestação cética concluída.

### F2296 · API analytics dashboard

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Falta dashboard de uso da API.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:214`
- **O que falta:** Criar api_request_logs (RLS), gravar por token/endpoint nas edges que validam token e montar página/aba com chamadas por token e endpoint.
- **Evidência:** Nenhuma rota/componente de analytics de API: grep -rniE 'api_request_logs\|api_usage\|api_analytics\|ApiUsage' src → 0 (só src/hooks/useApiTokens.ts e types.ts por 'api_tokens'). src/components/settings/ApiIntegrationSettings.tsx:195-198 exibe apenas 'Usos: usage_count' e 'Último uso' por token. Tabela api_request_logs ausente em contexto/supabase/tables.md (grep → 0); api_tokens=0 linhas (stats.md:241).
- **Revisão:** sem contestação cética concluída.

### F3725 · Rota /admin-telemetria (2 afirmações nos docs)

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Existe parcialmente em /admin-telemetria.| Falta painel de monitoramento detalhado (existe parcialmente em /admin-telemetria).
- **Fontes:** `docs/FUNCIONALIDADES_SEM_UI.md:105`
- **O que falta:** rota /admin-telemetria não existe em src/routes/AppRoutes.tsx (rotas.json)
- **Evidência:** rota /admin-telemetria não existe em src/routes/AppRoutes.tsx (rotas.json)| CONTESTADO pelo cético (PARCIAL): A rota existe como /admin/telemetria (sem hífen): src/routes/AppRoutes.tsx:1013-1016 → AdminTelemetria (lazyPages.ts:288). Ela tem entrada no menu (sidebarMenuData.ts:363) e link em AdminQuickLinks.tsx:38. A página lê query_telemetry (AdminTelemetria.tsx:99,117; tabela com RLS em tables.md:261). Porém não exibe métricas do external-db-bridge: grep -n 'external\|bridge' src/pages/AdminTelemetria.tsx → 0. A function só é chamada por ExternalDBSettings.tsx:27, que fica em /admin e /admin/conexoes.
- **Revisão:** em disputa. O cético propõe Parcial e o juiz ainda não decidiu.

### F3731 · src/pages/Webhooks.tsx não existe (caminho errado corrigido em errata)

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Aparece apenas no texto de errata como caminho errado; arquivo inexistente.
- **Fontes:** `docs/estado/14_VERIFICACAO_DA_AUDITORIA.md:66-69`
- **O que falta:** componente Webhooks ausente (componentes.json e src/)
- **Evidência:** componente Webhooks ausente (componentes.json e src/)| CONTESTADO pelo cético (NAO_APLICAVEL): O item é uma errata de caminho na documentação, não uma funcionalidade: docs/estado/07_DOMINIO_WINLOSS_COMPETITIVE.md:187 registra 'corrigido na Fase D; constava src/pages/Webhooks.tsx, arquivo que não existe'. O arquivo real src/pages/WebhooksPage.tsx existe; src/pages/Webhooks.tsx não (ls → No such file).
- **Revisão:** em disputa. O cético propõe Não aplicável e o juiz ainda não decidiu.

### F3733 · Colunas dedupe_bucket e request_id preservadas

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Colunas dedupe_bucket/request_id (idempotência de webhooks), 11 índices, bucket winloss-reports e novas RPCs devem permanecer durante contenção.
- **Fontes:** `docs/execucao/ROLLBACK_HARDENING_CANONICO_2026-08-31.md:51-56`
- **O que falta:** tabela/view "dedupe_bucket" ausente do banco real (tables.md, views.md)
- **Evidência:** tabela/view "dedupe_bucket" ausente do banco real (tables.md, views.md)| CONTESTADO pelo cético (IMPLEMENTADO): As colunas estão preservadas no banco real e são escritas. campaign_health_alerts.dedupe_bucket existe (tables/public/campaign_health_alerts.md:28) com índice único parcial (:48), criado em supabase/migrations/20260827000001_harden_webhooks_portfolio_and_idempotency.sql:9-14. Quem grava é campaign-health-alert/index.ts:230-234 (onConflict 'job_id,alert_type,dedupe_bucket'), que está na allowlist. prize_wheel_spins.request_id existe (tables/public/prize_wheel_spins.md:26) com índice único (:43), gravado via RPC spin_prize_wheel com p_request_id (src/hooks/gamification/usePrizeWheel.ts:78). O bucket winloss-reports existe (storage.md:12). A pré-checagem procurou 'dedupe_bucket' como tabela.
- **Revisão:** em disputa. O cético propõe Implementado e o juiz ainda não decidiu.

### F3734 · Enum integration_health_status valor degraded usado

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Valor degraded sem ocorrência no código (mig/20260425134635:5).
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/F_banco_dados.md:226`
- **O que falta:** tabela/view "integration_health_status" ausente do banco real (tables.md, views.md)
- **Evidência:** tabela/view "integration_health_status" ausente do banco real (tables.md, views.md)| CONTESTADO pelo cético (PARCIAL): O enum existe no banco real com o valor: types-enums.md:14 'public.integration_health_status \| enum \| success, failure, degraded, pending', usado em integration_health_checks.status (tables/public/integration_health_checks.md:21). Mas o único gravador, test-integration-connection/index.ts:149, só emite 'success' \| 'failure' e está fora da allowlist: grep -rn degraded nessa function, em useIntegrationConnections.ts e em components/admin/connections → 0. A pré-checagem procurou o enum como tabela.
- **Revisão:** em disputa. O cético propõe Parcial e o juiz ainda não decidiu.

### F3735 · Fila de callbacks para o V4 (notificações de status de quote e criação de pedido)

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** CRM mantém fila de notificações para o Promo Gifts V4 sobre mudanças de status de quotes e criação de pedidos.
- **Fontes:** `docs/RUNBOOK.md:164-166`
- **O que falta:** tabela/view "v4_callback_queue" ausente do banco real (tables.md, views.md)
- **Evidência:** tabela/view "v4_callback_queue" ausente do banco real (tables.md, views.md)| CONTESTADO pelo cético (PARCIAL): A fila existe com outro nome: public.v4_callback_dead_letters, com RLS sim e realtime (tables.md:376). O trigger trg_enqueue_v4_callback, AFTER UPDATE OF status ON quotes (triggers.md:231), roda enqueue_v4_callback, que insere 'quote_status_changed' (functions/public/enqueue_v4_callback__12ae32cb1ec02d01.sql:20-35). O consumidor é notify-v4-quote-status/index.ts:101,121,178, que está na allowlist, via cron 36 a cada 5 min (cron.md:26). Porém não há enfileiramento na criação de pedido: os triggers de orders (triggers.md:194-197) são só auditoria e log. O cron 37 chama check-v4-callback-alerts, que está fora da allowlist (grep -cx → 0).
- **Revisão:** em disputa. O cético propõe Parcial e o juiz ainda não decidiu.

### F2311 · Teste da #476 cobre a ligação no index.ts (resolução de salespeople.id) em execute-workflow

- **Tipo:** Teste
- **O que os docs afirmam:** Falha de severidade baixa registrada pela validação adversarial, sem correção nesta rodada.
- **Fontes:** `docs/prod-readiness.md:1006`
- **O que falta:** Criar um teste que exercite execute-workflow/index.ts:113-116 (resolução login → salespeople.id). Exige extrair essa resolução para uma função testável.
- **Evidência:** Único teste em execute-workflow é contracts_test.ts, sem 'salespeople' nem 'login' (grep -> 0 resultados). O ponto real de resolução está em index.ts:113-116 (comentário 'FK salesperson_id → salespeople.id') sem teste associado. docs/prod-readiness.md:1006 já registra isso como falha de severidade baixa 'sem correção nesta rodada' — doc e código concordam.| cético: Correção na evidência do verificador: além de execute-workflow/contracts_test.ts, existe src/hooks/automation/executeWorkflowActions.test.ts:11,25,39, que testa actions.ts. Mas esse teste recebe o salespeople.id já pronto ('grava o salespeople.id recebido') e não exercita a resolução login → salespeople.id de execute-workflow/index.ts:113-116. Nenhum teste importa index.ts: grep -rln salespeople supabase/functions/execute-workflow/*_test.ts → 0. docs/prod-readiness.md:1011 lista a falha como 'sem correção nesta rodada'.

### F3736 · P1 origem: trg_dispatch_webhook_kit_share chama dispatch_quote_webhook_event() em kit_share_tokens lendo 7 campos inexistentes

- **Tipo:** Trigger
- **O que os docs afirmam:** Doc: rotina lê quote_number, client_id, client_company, subtotal, total, discount_percent, valid_until inexistentes, captura erro e retorna sucesso; outbox não recebe evento.
- **Fontes:** `docs/auditoria/MATRIZ_FORENSE_BANCOS_E_CONTRATOS_2026-08-26.md:182,188-189`
- **O que falta:** trigger trg_dispatch_webhook_kit_share ausente (triggers.md)
- **Evidência:** trigger trg_dispatch_webhook_kit_share ausente (triggers.md)| CONTESTADO pelo cético (NAO_APLICAVEL): O achado é do banco de 'origem' (catálogo/fornecedores) da matriz forense (docs/auditoria/MATRIZ_FORENSE_BANCOS_E_CONTRATOS_2026-08-26.md:4,13-14,182,188-189), não do banco deste repo. No banco real: grep -n 'kit_share\|dispatch_quote_webhook\|webhook_outbox' tables.md functions.md triggers.md → 0. No repo: grep -rn 'kit_share_tokens\|dispatch_quote_webhook_event' supabase/migrations src supabase/functions → 0.
- **Revisão:** em disputa. O cético propõe Não aplicável e o juiz ainda não decidiu.

### F2313 · Catálogo API.md regenerado em CI (geocode-proxy, health, webvitals-regression-alert)

- **Tipo:** Workflow CI
- **O que os docs afirmam:** DIVERGENTE: faltam geocode-proxy, health, webvitals-regression-alert; fn_test_* com anon; audit_trigger_func superado.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:426`
- **O que falta:** Adicionar job de CI que rode gen-api-catalog.mjs e falhe em drift de docs/API.md; regenerar o catálogo incluindo geocode-proxy, health e webvitals-regression-alert.
- **Evidência:** scripts/gen-api-catalog.mjs existe mas não é chamado por nenhum workflow (grep -rln "gen-api-catalog" . --include=*.yml -> 0 resultados); aparece só em scripts/automation.config.json como "manual" e em docs/AUTOMACAO_LOCAL.md:84 ('Sem chamador literal; manter manual'). Confirma a divergência: geocode-proxy, health e webvitals-regression-alert de fato ausentes de docs/API.md (grep -> 0 resultados).| CONTESTADO pelo cético (PARCIAL): Existem artefatos, então NAO_IMPLEMENTADO subestima. scripts/gen-api-catalog.mjs existe (cabeçalho :1-11), e docs/API.md:3-4 declara que é gerado por ele. O que falta é o fio: não há chamador automático. grep -rln "gen-api-catalog\|API.md" .github/workflows → 0 resultados. Fora docs/graphify, o único uso é scripts/automation.config.json:410-411 como 'manual', e package.json não tem script para ele. O drift é real: supabase/functions/geocode-proxy, health e we…
- **Revisão:** em disputa. O cético propõe Parcial e o juiz ainda não decidiu.

## Parcial (71)

### F2180 · API Tokens — geração para integrações externas

- **Tipo:** Ação/botão
- **O que os docs afirmam:** Gerar tokens de API.
- **Fontes:** `docs/FUNCIONALIDADES_COMPLETAS.md:599-601`
- **O que falta:** Armazenar hash (sha256) em api_tokens e mostrar o token só na criação; incluir ranking-api na allowlist de deploy.yml:144 (ou outra function aceitar o token) para que algum endpoint em produção aceite o token.
- **Evidência:** UI: src/components/settings/ApiIntegrationSettings.tsx:95-115 'Gerar Novo Token', montado em src/pages/Configuracoes.tsx:297 (rota /configuracoes AppRoutes.tsx:953). Hook src/hooks/useApiTokens.ts:29 rpc('generate_api_token') e :39-41 insert token em claro. Banco: tables/public/api_tokens.md:20 coluna `token text` (sem coluna hash), RLS sim 2 policies (:7-9); functions/public/validate_api_token__969d36e50afbbc55.sql compara `t.token = p_token` (texto puro). Token fica visível a qualquer momento (ApiIntegrationSettings.tsx:162-184 toggle olho + copiar), não 'exibido uma vez'. Única validação: supabase/functions/ranking-api/index.ts:22, mas `grep -c ranking-api .github/workflows/deploy.yml` → 0 (fora da allowlist ACTIVE, linha 144).
- **Revisão:** sem contestação cética concluída.

### F2184 · Aba N8N em /admin/conexoes

- **Tipo:** Componente
- **O que os docs afirmam:** Página /admin/conexoes tem aba N8N para cadastrar/testar a conexão.
- **Fontes:** `docs/runbooks/n8n.md:6,20,26,33`
- **O que falta:** Adicionar 'test-integration-connection' à allowlist ACTIVE em .github/workflows/deploy.yml:144 (liberando vaga) ou apontar o teste para function deployada; opcionalmente botão testar dentro da própria N8nTab.
- **Evidência:** src/pages/admin/AdminConexoesPage.tsx:106 TabsTrigger 'n8n' e :116-117 monta N8nTab; src/components/admin/connections/N8nTab.tsx:22-31 grava via useCreateConnection kind 'n8n' em integration_connections (src/hooks/admin/useIntegrationConnections.ts:66; tabela RLS sim, 1 policy). N8nTab não tem botão testar (só 'Plus'/criar, :75); o teste existe em ConnectionsOverviewTable.tsx:154 → useTestConnection (useIntegrationConnections.ts:128 invoke 'test-integration-connection'), mas `grep -c test-integration-connection .github/workflows/deploy.yml` → 0: function fora da allowlist, não roda em produção.
- **Revisão:** sem contestação cética concluída.

### F2185 · Analytics de uso da API

- **Tipo:** Componente
- **O que os docs afirmam:** Só existe api_tokens; não há métrica de uso.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:132`
- **O que falta:** Criar tabela api_usage (token_id, endpoint, status, created_at) com RLS, registrar em validate_api_token/ranking-api e montar painel de uso por token/período.
- **Evidência:** Só contador por token: tables/public/api_tokens.md:25-26 colunas last_used_at/usage_count, incrementadas em functions/public/validate_api_token__969d36e50afbbc55.sql (UPDATE usage_count+1); exibidas em src/components/settings/ApiIntegrationSettings.tsx:195-199 ('Usos:'). Ausente: `ls tables/public| grep -i api_usage` → 0; `grep -rn api_usage src supabase/functions` → 0 resultados. Sem série temporal, sem dashboard de requests.
- **Revisão:** sem contestação cética concluída.

### F2190 · API pública documentada (api_tokens, docs/API.md)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Parcial.
- **Fontes:** `docs/benchmark/RAMPER_2026-07.md:133`
- **O que falta:** Deployar ranking-api (allowlist deploy.yml:144) e documentar em docs/API.md os endpoints autenticados por api_tokens com exemplos de request.
- **Evidência:** api_tokens existe com RLS (tables/public/api_tokens.md:7-9). docs/API.md tem 800 linhas e lista funções (ex.: :154 ranking-api), mas só ranking-api aceita api_tokens (supabase/functions/ranking-api/index.ts:22 validate_api_token) e ela está fora da allowlist (`grep -c ranking-api .github/workflows/deploy.yml` → 0), logo nenhum endpoint documentado funciona com token em produção.
- **Revisão:** sem contestação cética concluída.

### F2191 · API pública documentada (OpenAPI/SDK)

- **Tipo:** Doc/config
- **O que os docs afirmam:** docs/API.md e ApiIntegrationSettings; validate_api_token só em ranking-api; sem OpenAPI nem SDK.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:131`
- **O que falta:** Spec OpenAPI + SDK, ou mais endpoints autenticados por api_tokens e deployados.
- **Evidência:** docs/API.md existe (800 linhas); src/components/settings/ApiIntegrationSettings.tsx montado em Configuracoes.tsx:297; validate_api_token existe no banco (functions/public/validate_api_token__969d36e50afbbc55.sql) e é chamada só por supabase/functions/ranking-api/index.ts:22 (`grep -rn validate_api_token supabase/functions` → 1 function). Sem OpenAPI nem SDK (find openapi* → 0). ranking-api fora da allowlist deploy.yml:144.
- **Revisão:** sem contestação cética concluída.

### F2196 · Bucket report-exports (privado) existente nos dois ambientes

- **Tipo:** Doc/config
- **O que os docs afirmam:** Bucket report-exports existe em origem e destino, público=não, 0 objetos; 14 policies de storage iguais.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:446-456`
- **O que falta:** Identificar/implementar consumidor real (ex.: export de relatórios gravando em report-exports) ou registrar descontinuação e remover o bucket.
- **Evidência:** Bucket existe: supabase/storage.md:10 `report-exports` público=não, 50 MB; policies supabase/policies.md:1039-1040 (report_owners_can_read/write_exports por pasta). Consumidor literal: `grep -rn report-exports src supabase/functions` → só supabase/functions/_shared/canonical-hardening_contract_test.ts (teste de contrato), nenhum código de produção grava/lê o bucket; nenhuma decisão de descontinuação documentada encontrada.
- **Revisão:** sem contestação cética concluída.

### F2202 · G10 Completar documentação da API pública

- **Tipo:** Doc/config
- **O que os docs afirmam:** docs/API.md parcial.
- **Fontes:** `docs/benchmark/RAMPER_2026-07.md:171`
- **O que falta:** Documentar quais endpoints aceitam api_tokens, como obter o token e exemplos; deployar ranking-api.
- **Evidência:** docs/API.md documenta funções (800 linhas, ex.: :154 ranking-api, :198 test-integration-connection) mas quase todas como 'Bearer manual · verify_jwt' (JWT), não api_tokens; única function com api_tokens é ranking-api (supabase/functions/ranking-api/index.ts:22), fora da allowlist deploy.yml:144.
- **Revisão:** sem contestação cética concluída.

### F2203 · Handoff P030: Reconciliar contratos de dados e storage (privacidade, owner-folder, URLs públicas)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Fila canônica do handoff (onda 3): Reconciliar contratos de dados e storage (privacidade, owner-folder, URLs públicas). Todas as etapas começam pendentes; 0 de 100 executadas na data do handoff. Gate(s) conforme §13.
- **Fontes:** `docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:316-316`
- **O que falta:** Trocar getPublicUrl por createSignedUrl em receive-quote-webhook/index.ts:285 (ou remover a function obsoleta) e registrar o contrato de storage (privacidade/owner-folder) em docs.
- **Evidência:** Contrato violado: supabase/functions/receive-quote-webhook/index.ts:285 `storage.from("quote-pdfs").getPublicUrl(pdfPath)` em bucket privado (storage.md:9 público=não) — URL pública inútil/incoerente; a function não está na allowlist deploy.yml:144 (ativa é receive-quote-sync, que não usa storage: grep getPublicUrl → 0). export-winloss-pdf usa createSignedUrl (index.ts:104), coerente. Owner-folder nas policies: policies.md:1027-1040. Nenhum doc registra reconciliação concluída.
- **Revisão:** sem contestação cética concluída.

### F2204 · Plano 30/08 etapa 30 (P030): Reconciliar contratos de dados e storage (privacidade, owner-folder, URLs públicas)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Etapa 30 do plano de 100 etapas (auditoria 30/08; = P030 do handoff): Plano de migração/correção por bucket e fluxo.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:682-682`
- **O que falta:** Trocar getPublicUrl por createSignedUrl em receive-quote-webhook/index.ts:285 (e decidir se a function entra na allowlist); revisar owner-folder nas policies de storage dos demais buckets privados.
- **Evidência:** storage.md (snapshot real) mostra quote-pdfs como bucket PRIVADO ("não" público). Apesar disso, supabase/functions/receive-quote-webhook/index.ts:285-287 chama `supabase.storage.from("quote-pdfs").getPublicUrl(pdfPath)` e grava esse valor em `quotes.pdf_url` — URL pública gerada para um bucket privado, exatamente o contrato quebrado que a etapa 30 do plano queria reconciliar. export-winloss-pdf (bucket winloss-reports, também privado) não apresenta o mesmo padrão (grep sem ocorrência de getPublicUrl nesse arquivo).| cético: Confirmado: storage.md (snapshot) linha do bucket quote-pdfs = público 'não'; supabase/functions/receive-quote-webhook/index.ts:285 usa getPublicUrl(pdfPath) nesse bucket privado (único getPublicUrl em supabase/functions; src sem ocorrência). export-winloss-pdf/index.ts:88-104 está correto (bucket privado winloss-reports, contentType text/markdown compatível com o mi…

### F2205 · REST API documentada (OpenAPI/Swagger)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Falta API REST com OpenAPI.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:208`
- **O que falta:** Publicar openapi.yaml real e colocar ranking-api (único endpoint que valida api_tokens) na allowlist de deploy; hoje os tokens gerados na UI não autenticam nada em produção.
- **Evidência:** docs/API.md existe (800 linhas, gerado por scripts/gen-api-catalog.mjs) mas é um catálogo Markdown, não uma spec OpenAPI/Swagger — nenhum arquivo openapi.yaml/swagger.* no repo (find/grep sem resultado). Tabela `api_tokens` existe (supabase/migrations/20260330135126_...sql:3) e há UI (src/hooks/useApiTokens.ts) para gerar tokens, mas nenhuma edge function em supabase/functions/*/index.ts lê `api_tokens` para autenticar requisições (grep sem ocorrência) — os tokens não protegem nenhum endpoint.| cético: Correção da evidência inicial: existe consumidor de api_tokens — supabase/functions/ranking-api/index.ts:22 chama rpc('validate_api_token') e grava api_token_id (linhas 297/356); a função public.validate_api_token existe no banco real (functions.md:390) e a tabela public.api_tokens existe com RLS (tables.md:25). Porém ranking-api NÃO está na allowlist ACTIVE (deploy.yml:144), logo nenhum …

### F2206 · Runbooks de integrações (bitrix24, twilio, elevenlabs, email, whatsapp)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Etapa 69 P: docs/runbooks/*; falta matriz configured/degraded com health.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:71`
- **O que falta:** Matriz configured/degraded em cada runbook e um health check de integrações efetivamente deployado (health/test-integration-connection fora da allowlist).
- **Evidência:** Os 5 arquivos existem: docs/runbooks/bitrix24.md, twilio.md, elevenlabs.md, email-transacional.md, whatsapp-multichannel.md. Nenhum deles (exceto uma menção avulsa em elevenlabs.md:11 sobre health retornar 404) traz matriz configured/degraded com health check, conforme grep -niE "health\|configur\|degraded" por arquivo.| cético: Os 5 runbooks existem (docs/runbooks/bitrix24.md 47 linhas, twilio.md 53, elevenlabs.md 50, email-transacional.md 55, whatsapp-multichannel.md 52); bitrix24.md sem nenhuma ocorrência de health/configured/degraded. A parte 'health check' também falha no código: as functions de checagem de integração supabase/functions/health e supabase/functions/test-integration-connection NÃO estão na allowlist ACTIVE (deploy.yml:144), e elevenlabs.md:11 registra 'health retorna 404 em produção'.

### F2207 · Secret ADMIN_NOTIFICATION_EMAIL (destinatário de alertas internos)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Destinatário padrão de alertas internos.
- **Fontes:** `docs/runbooks/email-transacional.md:20`
- **O que falta:** send-alert-notifications não lê o secret nem está deployada; os 2 leitores diretos estão fora da allowlist; só a escalação compartilhada usa o secret em produção, e apenas como fallback.
- **Evidência:** `ADMIN_NOTIFICATION_EMAIL` é lido em supabase/functions/notify-critical-pattern/index.ts:19 e supabase/functions/winloss-webhook-health-monitor/index.ts:229 (escalação), mas NÃO em supabase/functions/send-alert-notifications/index.ts — essa function usa `notification_preferences.email` (linha 335) e `body.recipientEmail` (linhas 312-318), sem qualquer `Deno.env.get('ADMIN_NOTIFICATION_EMAIL')` (grep sem ocorrência no arquivo).| cético: Leitores diretos: notify-critical-pattern/index.ts:19 e winloss-webhook-health-monitor/index.ts:229 — ambas FORA da allowlist ACTIVE (deploy.yml:144), embora winloss-webhook-health-monitor tenha cron (cron.md:32), que dispara uma function não deployada. Leitor indireto em produção: _shared/alert-escalation.ts:120 usa ADMIN_NOTIFICATION_EMAIL como fallback de ALERT_ESCALATION_EMAIL, importado por functions deployadas (cron-failure-alerter, wal-health-alert…

### F2219 · verify_jwt=false somente em log-web-vitals, receive-quote-sync, email-unsubscribe e migrate-helper

- **Tipo:** Doc/config
- **O que os docs afirmam:** Em supabase/config.toml, apenas log-web-vitals, receive-quote-sync, email-unsubscribe e migrate-helper estão com verify_jwt=false.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:184-184`
- **O que falta:** Revisão formal das 22 functions públicas com proteção alternativa (HMAC/rate limit) documentada e atualização da auditoria.
- **Evidência:** supabase/config.toml tem hoje 22 functions com `verify_jwt = false` (grep -c), não as 4 citadas pela auditoria de 2026-08-26 (log-web-vitals, receive-quote-sync, email-unsubscribe, migrate-helper). `migrate-helper` foi de fato removida (supabase/config.toml:85, comentário "migrate-helper removido: edge function aposentada no V2"), mas as outras 18 (campaign-health-alert, detect-client-churn-alerts, generate-urgent-client-tasks, notify-v4-quote-status, check-v4-callback-alerts, cron-failure-alerter, process-call-recording-ingest, edge-retry-threshold-alert, deal-risk-digest, email-bulk-retry, receive-quote-webhook, report-embed-public, inbound-email-webhook, bitrix24-oauth, whatsapp-inbound-webhook, multichannel-status-webhook, twilio-call-status, twilio-call-twiml, health) não estavam na lista do doc de 2026-08-26 — a maioria tem comentário de justificativa de proteção alternativa no pr…

### F2220 · Webhooks externos com verify_jwt=false (6/7; get-client-ip ausente)

- **Tipo:** Doc/config
- **O que os docs afirmam:** JÁ RESOLVIDO (6/7): receive-quote-webhook, inbound-email-webhook, multichannel-status-webhook, twilio-call-status, twilio-call-twiml, report-embed-public declarados.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:255`
- **O que falta:** Colocar as 3 webhooks na allowlist (ou corrigir a afirmação '6/7').
- **Evidência:** supabase/config.toml confirma verify_jwt=false para as 6 webhooks citadas (receive-quote-webhook, inbound-email-webhook, multichannel-status-webhook, twilio-call-status, twilio-call-twiml, report-embed-public) e get-client-ip de fato não tem entrada (fica com verify_jwt=true padrão), batendo com "6/7; get-client-ip ausente". Porém, cruzando com a allowlist ACTIVE de produção (.github/workflows/deploy.yml:144, parseada via Python), apenas inbound-email-webhook, multichannel-status-webhook, report-embed-public e receive-quote-sync estão de fato deployadas; receive-quote-webhook, twilio-call-status, twilio-call-twiml e get-client-ip NÃO estão na allowlist e por isso não rodam em produção (AGENTS.md §6: função fora da allowlist não roda mesmo existindo no repo).| cético: config.toml:46/79/82 configuram receive-quote-webhook, twilio-call-status e twilio-call-twiml com verify_jwt=false, mas a…

### F3712 · Edge function push-subscribe (8 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** Catálogo API.md lista a edge function `push-subscribe` na categoria "Multichannel / Push" com auth "JWT do usuário · verify_jwt", método "qualquer", payload "Deno, user_id, action" e resposta "JSON".| Doc lista a edge function `push-subscribe` (#17) — inscrição em push notifications. Auth: JWT. \| 93 linhas; chamador: FE src/hooks/usePushNotifications.ts; verify_jwt true (default); tabelas tocadas (linhas em produção): push_subscriptions(0). Classificação do doc: PARCIAL. \| Doc classifica como REAL. Chamador(es): FE hooks/usePushNotifications.ts:58,136 (+1). VAPID_PUBLIC_KEY. \| push-subscribe/index.ts:32 lê VAPID_PUBLIC_KEY; push_subscriptions = 0. \| Funções de push ativas; falta centro …
- **Fontes:** `docs/API.md:218-218`, `docs/FUNCIONALIDADES_COMPLETAS.md:507-507`, `docs/FUNCIONALIDADES_SISTEMA.md:524-524; docs/FEATURE_SUMMARY.md:79-79`, `docs/DOCUMENTACAO_SISTEMA.md:992-1021`, `docs/estado/10_EDGE_FUNCTIONS.md:416-416`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:147-147` e mais 4
- **O que falta:** Publicar push-subscribe e send-push-notification (estão fora da allowlist de deploy.yml:144). Falta ainda o centro de preferências de push.
- **Evidência:** supabase/functions/push-subscribe/index.ts existe; FORA da allowlist de deploy (.github/workflows/deploy.yml:144) → não roda em produção; chamada por: src/hooks/usePushNotifications.ts| cético: supabase/functions/push-subscribe/index.ts existe e é chamada em src/hooks/usePushNotifications.ts:58,136,187. A tabela public.push_subscriptions existe com RLS e 8 policies (tables.md:258). A crítica de segurança dos docs já foi corrigida: index.ts:74 usa getUserClient e :89 rejeita user_id diferente do JWT. Mas push-subscribe está FORA da allowlist (grep -cx push-subscribe da lista em deploy.yml:144 → 0), e send-push-notification também.

### F3713 · Edge function test-integration-connection (6 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** Catálogo API.md lista a edge function `test-integration-connection` na categoria "Integrações" com auth "Bearer manual · verify_jwt", método "qualquer", payload "—" e resposta "SSE/stream {error, ok}".| 164 linhas; chamador: FE src/hooks/admin/useIntegrationConnections.ts; verify_jwt true (default); tabelas tocadas (linhas em produção): integration_health_checks(0). Classificação do doc: PARCIAL. \| Doc classifica como REAL. Chamador(es): FE hooks/admin/useIntegrationConnections.ts:130. EXTERNAL_SUPABASE_ANON_KEY. \| Testa a conexão n8n via healthz com header X-N8N-API-KEY; fallback env N8N_API_KEY. \| supabase/functions/test-integration-connection existe no repo (citada em src/: sim); sond…
- **Fontes:** `docs/API.md:198-198`, `docs/estado/10_EDGE_FUNCTIONS.md:461-461`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:193-193`, `docs/runbooks/n8n.md:8-10,21`, `docs/prod-readiness.md:417`, `docs/FAQ_TROUBLESHOOTING.md:51`
- **O que falta:** Publicar test-integration-connection (fora da allowlist de deploy.yml:144). Sem isso, o botão de teste de conexão em /admin/conexoes falha em produção.
- **Evidência:** supabase/functions/test-integration-connection/index.ts existe; FORA da allowlist de deploy (.github/workflows/deploy.yml:144) → não roda em produção; chamada por: src/hooks/admin/useIntegrationConnections.ts| cético: A function existe, e src/hooks/admin/useIntegrationConnections.ts:128 a chama. As tabelas integration_health_checks e integration_connections existem com RLS (tables.md:183-184). Mas test-integration-connection está FORA da allowlist (deploy.yml:144; grep -cx → 0). Ela só grava status 'success'\|'failure' (test-integration-connection/index.ts:149).

### F3714 · Edge function workflow-executor (10 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** 182 linhas; chamador: FE src/hooks/useWorkflows.ts; verify_jwt true (default); tabelas tocadas (linhas em produção): workflow_executions(0), workflows(0). Classificação do doc: PARCIAL.| Executa workflows definidos no builder. \| Doc classifica como REAL. Chamador(es): FE hooks/useWorkflows.ts:136. DUPLICATA conceitual de execute-workflow (workflows/workflow_executions). \| supabase/functions/workflow-executor existe no repo (citada em src/: sim); sonda OPTIONS em produção: OPTIONS → 404 NOT_FOUND (não publicada; limite de 100 funções do plano). Status no doc: BLOQUEADO. \| Executar ações reais, callbacks assinados, retries/DLQ e estados truthful. Saída esperada: E2E de sucesso/falha/retry.…
- **Fontes:** `docs/estado/10_EDGE_FUNCTIONS.md:474-474`, `docs/FUNCIONALIDADES_COMPLETAS.md:401-401`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:207-207`, `docs/prod-readiness.md:432`, `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:742-742`, `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:218-218` e mais 4
- **O que falta:** Publicar a function ou unificar com execute-workflow, executar ações reais com status fiel, e ter retry/DLQ e um gatilho real (cron ou evento).
- **Evidência:** supabase/functions/workflow-executor/index.ts existe; FORA da allowlist de deploy (.github/workflows/deploy.yml:144) → não roda em produção; chamada por: src/hooks/useWorkflows.ts| cético: Fora da allowlist (deploy.yml:144; grep -cx workflow-executor → 0), chamada só por src/hooks/useWorkflows.ts:136. As ações continuam simuladas: workflow-executor/index.ts:136-143 grava 'Ação ... executada (simulado)' com status 'ok', e :156 marca a execução como 'success'. Os nós vindos do builder têm type 'default' (WorkflowsPage.tsx:134), então as ramificações condition/action (:125,:136) nunca disparam. Há um motor duplicado, execute-workflow, que está na allowlist.

### F3723 · Hook useReplayAudit usa chunkedIn

- **Tipo:** Hook
- **O que os docs afirmam:** Listado entre os 29 call-sites blindados que usam o helper chunkedIn (.in('id', chunk)).
- **Fontes:** `docs/reports/FRONTEND_IN_AUDIT.md:31-31`
- **O que falta:** arquivo src/hooks/win-loss/useReplayAudit.ts existe mas hook não consta em hooks.json (não exportado/indexado)
- **Evidência:** arquivo src/hooks/win-loss/useReplayAudit.ts existe mas hook não consta em hooks.json (não exportado/indexado)| CONTESTADO pelo cético (IMPLEMENTADO): src/hooks/win-loss/useReplayAudit.ts:3 importa chunkedIn de '@/lib/supabase/chunkedIn' (o arquivo existe). useLatestReplayAuditByDeadLetters (:50) usa chunkedIn em :57 e a única chamada .in('dead_letter_id', chunk) em :63. Os hooks são consumidos em src/components/win-loss/WebhookDeadLetterPanel.tsx:38, ReplayAuditTrail.tsx:9 e ReplayStatusByIdPanel.tsx:26. A pré-checagem só notou a ausência no hooks.json, o que não é critério.
- **Revisão:** em disputa. O cético propõe Implementado e o juiz ainda não decidiu.

### F3724 · Hook useV4Callbacks usa chunkedIn

- **Tipo:** Hook
- **O que os docs afirmam:** Listado entre os 29 call-sites blindados que usam o helper chunkedIn (.in('id', chunk)).
- **Fontes:** `docs/reports/FRONTEND_IN_AUDIT.md:30-30`
- **O que falta:** arquivo src/hooks/admin/useV4Callbacks.ts existe mas hook não consta em hooks.json (não exportado/indexado)
- **Evidência:** arquivo src/hooks/admin/useV4Callbacks.ts existe mas hook não consta em hooks.json (não exportado/indexado)| CONTESTADO pelo cético (IMPLEMENTADO): src/hooks/admin/useV4Callbacks.ts:5 importa chunkedIn. As três chamadas .in('id', chunk) ficam dentro de chunkedIn em :127/:133, :148/:158 e :173/:182, e não há .in fora disso. O hook é consumido em src/pages/admin/AdminV4CallbacksPage.tsx:59.
- **Revisão:** em disputa. O cético propõe Implementado e o juiz ainda não decidiu.

### F2227 · B7 integrações meio (PR #270)

- **Tipo:** Integração externa
- **O que os docs afirmam:** LEDGER: EM VOO, PR #270 OPEN fix/hermes-908909-integracoes-meio.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/LEDGER_EXECUCAO_2026-10-14.md:16`
- **O que falta:** Deployar whatsapp-inbound-webhook e send-push-notification; concluir o OAuth Bitrix24 em produção (gravar tokens).
- **Evidência:** PR #270 (`fix/hermes-908909-integracoes-meio`) já está MERGED (merged_at 2026-10-14T12:24:52Z, merge_commit e65414999cb23bb79c56eb5e05ca4d07ee6917df) — não mais "OPEN" como o LEDGER de 2026-10-14 registrava. A PR adicionou bitrix24-oauth verify_jwt=false + refresh automático em bitrix24-sync (cron bitrix24-sync-hourly confirmado em cron.md:37), `whatsapp-inbound-webhook` e VAPID real em `send-push-notification`. Checando a allowlist ACTIVE (.github/workflows/deploy.yml:144): bitrix24-sync/bitrix24-oauth estão deployadas, mas `whatsapp-inbound-webhook` e `send-push-notification` (as duas functions novas da PR) NÃO estão na allowlist — não rodam em produção apesar do merge.| cético: Merge confirmado localmente: e65414999 'fix(db): integrações pela metade — Bitrix24 refresh/cron, WhatsApp Evolution, alerta N8N e VAPID (#270)'. whatsapp-inbound-webhook e send-push-notification FORA da allow…

### F2230 · bitrix24-oauth sem state/PKCE

- **Tipo:** Integração externa
- **O que os docs afirmam:** bitrix24-oauth não implementa state/PKCE no fluxo OAuth.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:186-186`
- **O que falta:** A afirmação 'sem state' está desatualizada (state assinado existe). Falta PKCE (code_challenge/code_verifier) no authorize/callback — observação: o OAuth do Bitrix24 é confidential-client com client_secret; PKCE é opcional nesse fluxo. Também não há proteção anti-replay do nonce (oauth-state.ts:6-7).
- **Evidência:** State: implementado — supabase/functions/_shared/oauth-state.ts:47-56 (createSignedOAuthState HMAC-SHA256 + nonce + TTL) e :62-80 (verifySignedOAuthState); usado em bitrix24-oauth/index.ts:78-84 (authorize) e :97-103 (callback rejeita state inválido/expirado com 401). PKCE: ausente — grep -rnE 'code_challenge\|code_verifier\|pkce' supabase/functions/bitrix24-oauth supabase/functions/_shared/oauth-state.ts → 0 resultados.
- **Revisão:** sem contestação cética concluída.

### F2231 · Circuit breaker em Twilio/ElevenLabs/Bitrix24 pronto no PR mas não deployado

- **Tipo:** Integração externa
- **O que os docs afirmam:** Mudanças de circuit breaker nas integrações Twilio/ElevenLabs/Bitrix24 estão no código mas sem efeito em produção por bloqueio de deploy.
- **Fontes:** `docs/execucao/VALIDACAO_ADVERSARIAL_E_CORRECOES_2026-09-02.md:102-107`
- **O que falta:** Twilio (3 functions) e elevenlabs-stt não são deployadas pelo workflow — o circuit breaker delas não roda em produção. Confirmar versão deployada das 4 restantes exige Management API/dashboard.
- **Evidência:** Código existe: supabase/functions/_shared/circuit-breaker.ts; uso em bitrix24-oauth/index.ts:125-147 e :250-271, bitrix24-sync/index.ts:7-9, twilio-click-to-call/index.ts:222, elevenlabs-tts/index.ts:86, elevenlabs-voice/index.ts:66, elevenlabs-stt. Deploy: bitrix24-oauth, bitrix24-sync, elevenlabs-tts, elevenlabs-voice estão na allowlist (.github/workflows/deploy.yml:144); twilio-click-to-call, twilio-call-status, twilio-call-twiml e elevenlabs-stt estão FORA da allowlist. Versão deployada vs HEAD não verificável (snapshot supabase/edge-functions.md: 'Management API desabilitada').
- **Revisão:** sem contestação cética concluída.

### F2232 · Coluna bitrix_id em icp_data (integração Bitrix24)

- **Tipo:** Integração externa
- **O que os docs afirmam:** Integração do ICP com Bitrix24 via bitrix_id.
- **Fontes:** `docs/FUNCIONALIDADES_SISTEMA.md:286-286`
- **O que falta:** Concluir o OAuth em produção (secrets BITRIX24_* + autorizar em /bitrix24) para que a sync realmente preencha bitrix_id; hoje a coluna existe mas o preenchimento não está exercido.
- **Evidência:** Coluna existe: snapshot tables/public/icp_data.md:26 (bitrix_id text), :47 idx_icp_data_bitrix_id, :51 ux_icp_data_bitrix_id (unique); RLS habilitado com 4 policies. Código popula: supabase/functions/bitrix24-sync/index.ts:365 e :416 (bitrix_id: company.ID), :381 e :434 upsert onConflict 'bitrix_id', :709 claim pending em bitrix_id. Em produção: portfolio_settings 0 linhas (stats.md:154) → sem token OAuth → sync não consegue chamar o Bitrix (bitrix24-sync/index.ts:198-200 'No valid access token').
- **Revisão:** sem contestação cética concluída.

### F2233 · Consumidor funcional do external-db-bridge (ExternalDBSettings)

- **Tipo:** Integração externa
- **O que os docs afirmam:** Allowlist de 10 tabelas, JWT e ExternalDBSettings.tsx existem, mas nenhum consumidor funcional.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:145`
- **O que falta:** Um sistema externo real consumindo a bridge (ou registrar que ela é só utilitário admin). Não há evidência de consumo além do botão de teste na tela admin.
- **Evidência:** Bridge existe e está na allowlist: supabase/functions/external-db-bridge/index.ts:81-93 (ALLOWED_TABLES com 10 tabelas), :115-143 (exige Authorization, auth.getUser e is_admin_or_manager); deploy.yml:144 inclui external-db-bridge. Único chamador no repo: src/components/admin/ExternalDBSettings.tsx:27 (invoke para teste), montado em src/components/admin/connections/SupabaseConnectionsTab.tsx e src/pages/AdminDashboard.tsx. grep -rn 'external-db-bridge' src supabase/functions fora da própria function → só ExternalDBSettings.tsx. Nenhum consumidor externo é verificável do repo.
- **Revisão:** sem contestação cética concluída.

### F2235 · CRM chama o N8N (hoje só grava integration_connections e testa /healthz)

- **Tipo:** Integração externa
- **O que os docs afirmam:** N8nTab.tsx grava em integration_connections; test-integration-connection chama /healthz; o CRM nunca dispara workflow N8N.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:141`
- **O que falta:** Nenhum evento de negócio faz POST a workflow N8N — afirmação do doc confirmada. Falta um emissor (ex.: em venda/cotação) lendo integration_connections kind='n8n' e disparando o webhook; e deployar test-integration-connection.
- **Evidência:** src/components/admin/connections/N8nTab.tsx:22-23 usa useCreateConnection/useIntegrationConnections('n8n') (grava integration_connections via src/hooks/admin/useIntegrationConnections.ts:32-112). supabase/functions/test-integration-connection/index.ts:31-40 probeN8n só faz GET {base_url}/healthz. Único edge que toca integration_connections: test-integration-connection (edge-functions.json). grep -rniE 'n8n' supabase/functions → só test-integration-connection. test-integration-connection está FORA da allowlist (deploy.yml:144). integration_connections: 0 linhas (stats.md:284).
- **Revisão:** sem contestação cética concluída.

### F2236 · E-mail de alerta (Resend) para deals estagnados 5+ dias

- **Tipo:** Integração externa
- **O que os docs afirmam:** Alertas críticos via e-mail Resend para deals estagnados.
- **Fontes:** `docs/FUNCIONALIDADES_SISTEMA.md:330-331; docs/FUNCIONALIDADES_SISTEMA.md:442-442; docs/FEATURE_SUMMARY.md:80-80`
- **O que falta:** Adicionar send-alert-notifications à allowlist/deployar (liberando vaga das 100) e confirmar RESEND_API_KEY; sem isso o cron de 5 min bate em function inexistente e email_logs permanece vazio. Ajustar doc: limiar é configurável, default 14 dias.
- **Evidência:** supabase/functions/send-alert-notifications/index.ts:1,18-20 usa Resend; :88-111 detecta deals estagnados por pref.stagnant_threshold_days (default do banco = 14, não 5: tables/public/notification_preferences.md:26); :232 grava email_logs. Cron existe: cron.md:48 job 85 send-alert-notifications-5min (*/5). Mas a function está FORA da allowlist ACTIVE (deploy.yml:144) e prod-readiness.md:857 lista-a como indisponível; email_logs tem 0 linhas (stats.md:195). Chamador UI: src/components/notifications/NotificationPreferenceCard.tsx:66.
- **Revisão:** sem contestação cética concluída.

### F2237 · Edge Function bitrix24-oauth (OAuth2)

- **Tipo:** Integração externa
- **O que os docs afirmam:** Fluxo OAuth2 com Bitrix24.
- **Fontes:** `docs/FUNCIONALIDADES_COMPLETAS.md:490-490`
- **O que falta:** OAuth nunca concluído em produção (sem token gravado). Dono precisa configurar BITRIX24_DOMAIN/CLIENT_ID/CLIENT_SECRET/STATE_SECRET e autorizar via /bitrix24. A tabela esperada 'bitrix24_tokens' não existe por design (usa portfolio_settings).
- **Evidência:** Function existe e está na allowlist (deploy.yml:144). Fluxo: authorize (bitrix24-oauth/index.ts:65-89), callback grava tokens (:157-178) em portfolio_settings (não há tabela bitrix24_tokens: grep tables.md → 0), refresh (:226-307) chamado por bitrix24-sync/index.ts:135-169 antes de expirar. Em produção portfolio_settings tem 0 linhas (stats.md:154) → nenhum token persistido; secrets não verificáveis.
- **Revisão:** sem contestação cética concluída.

### F2240 · Etapa 69 do plano: Reconciliar integrações externas

- **Tipo:** Integração externa
- **O que os docs afirmam:** Bitrix24, Twilio, ElevenLabs, e-mail e webhooks com secret inventory e health checks. Saída esperada: matriz configured/degraded/disabled. Gate: credenciais/custo.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:743-743`
- **O que falta:** Deployar test-integration-connection; produzir a matriz configured/degraded/disabled (UI ou doc gerado a partir de integration_health_checks + inventário de secrets); hoje só existe tabela/UI de testes manuais sem dados.
- **Evidência:** Infra de health check existe: supabase/functions/test-integration-connection/index.ts:154-172 (probes database/bitrix24/n8n/mcp/webhook gravando integration_health_checks) e UI src/components/admin/connections/ConnectionsOverviewTable.tsx:121 (badge success/destructive). Mas a function está FORA da allowlist (deploy.yml:144); integration_health_checks 0 linhas (stats.md:371); grep -rn 'degraded' src → 0 resultados — não há matriz configured/degraded/disabled. docs/prod-readiness.md:856-870 traz matriz OK/BLOQUEADO (documento, não artefato). Twilio e elevenlabs-stt fora da allowlist.
- **Revisão:** sem contestação cética concluída.

### F2241 · Etapa canônica 26/08 nº 69: Reconciliar integrações externas (Bitrix24, Twilio, ElevenLabs, e-mail, webhooks)

- **Tipo:** Integração externa
- **O que os docs afirmam:** Etapa canônica 69 (plano 26/08, matriz de status 30/08, estado 🔒): secret inventory, health checks; matriz configured/degraded/disabled.
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:219-219`
- **O que falta:** Mesmo gap de F2240: deployar test-integration-connection, popular integration_connections e gerar matriz configured/degraded/disabled com health check periódico (não há cron para health checks em cron.md).
- **Evidência:** Tabelas existem com RLS: tables/public/integration_health_checks.md (RLS sim, 2 policies), integration_connections.md (RLS sim, 1 policy); ambas com 0 linhas (stats.md:284,371). Health check real depende de test-integration-connection (index.ts:154-172), FORA da allowlist (deploy.yml:144); prod-readiness.md:869 confirma 'indisponível test-integration-connection'. Sem estado 'degraded' no código (grep src → 0).
- **Revisão:** sem contestação cética concluída.

### F2242 · Eventos de negócio emitem webhooks de saída (dispatch-webhook)

- **Tipo:** Integração externa
- **O que os docs afirmam:** Só dispara test.ping (src/hooks/useWebhooks.ts:170-180); nenhum evento de negócio emite webhook.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:147`
- **O que falta:** Emissor de eventos de negócio (ex.: sale.created/quote.created) chamando dispatch-webhook — via trigger+pg_net ou nas functions de venda/cotação. Afirmação do doc confirmada.
- **Evidência:** supabase/functions/dispatch-webhook/index.ts:124-185 aceita event_type genérico e filtra webhooks por events (:154); está na allowlist. Único chamador: src/hooks/useWebhooks.ts:170-180 (useTestWebhook, event_type 'test.ping'). grep -rn 'dispatch-webhook' src supabase/functions (fora da própria pasta) → só useWebhooks.ts:173; triggers.md em webhooks: só updated_at/audit; nenhuma função SQL chama dispatch-webhook. webhook_deliveries 0 linhas (stats.md:333). Observação: existe sistema separado winloss-webhook-dispatcher (winloss_webhook_deliveries 1 linha).
- **Revisão:** sem contestação cética concluída.

### F2246 · Handoff P080: Concluir ou manter desabilitadas assinatura digital, WebAuthn e provedores incompletos

- **Tipo:** Integração externa
- **O que os docs afirmam:** Fila canônica do handoff (onda 8): Concluir ou manter desabilitadas assinatura digital, WebAuthn e provedores incompletos. Todas as etapas começam pendentes; 0 de 100 executadas na data do handoff. Gate(s) conforme §13.
- **Fontes:** `docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:391-391`
- **O que falta:** Decidir e executar P080: assinatura digital segue habilitada na UI sem provedor real (só CRUD interno); elevenlabs-stt existe no repo sem deploy nem chamador — remover ou deployar; registrar a decisão no handoff.
- **Evidência:** Assinatura digital: rota /assinatura-digital montada sob Manager (src/routes/AppRoutes.tsx:408-414), src/hooks/useDigitalSignatures.ts:51,76,152 lê/grava tabela digital_signatures (existe, RLS 4 policies, 0 linhas — stats.md:271); nenhum provedor externo de assinatura (grep invoke no hook → 0). WebAuthn: function webauthn na allowlist, UI PasskeySettings montada em src/pages/Configuracoes.tsx:13,278; webauthn_credentials 0 linhas. ElevenLabs: elevenlabs-stt órfã (edge-functions.json orfa:true) e fora da allowlist. Handoff HANDOFF_CLINE...2026-08-30.md:391 ainda com checkbox aberto.
- **Revisão:** sem contestação cética concluída.

### F2247 · Integração Bitrix24

- **Tipo:** Integração externa
- **O que os docs afirmam:** Doc cita Bitrix24 como integração existente.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:51`
- **O que falta:** Credenciais BITRIX24_* em Edge Functions → Secrets e autorização OAuth concluída em produção; depois validar uma sync bem-sucedida em bitrix24_sync_logs (status/erro das ~720 linhas atuais não consta no snapshot).
- **Evidência:** bitrix24-oauth e bitrix24-sync existem e estão na allowlist (deploy.yml:144); sync completa (1183 linhas) com lock try_edge_job_lock (bitrix24-sync/index.ts:1005-1012; functions.md:368), paginação (:237-258), logs em bitrix24_sync_logs (:91-100). Operação: portfolio_settings 0 linhas (stats.md:154) → sem token OAuth; secrets não verificáveis; prod-readiness.md:860 registra falha 'Bitrix24 credentials not configured'.
- **Revisão:** sem contestação cética concluída.

### F2248 · Integração Bitrix24 (oauth + sync)

- **Tipo:** Integração externa
- **O que os docs afirmam:** Bitrix24 integrado por bitrix24-oauth e bitrix24-sync, com cron de sync.
- **Fontes:** `docs/agentes/mapa-do-sistema.md:78`
- **O que falta:** Só a parte operacional: secrets BITRIX24_* e OAuth concluído; o cron está batendo de hora em hora numa function que falha sem credenciais/token.
- **Evidência:** Functions na allowlist (deploy.yml:144); cron.md:37 job 48 bitrix24-sync-hourly '17 * * * *' ativo via trigger_internal_edge_job (cron-runs.md:270-276 succeeded = requisição pg_net enfileirada); lock edge_job_locks via RPC try_edge_job_lock/release_edge_job_lock (bitrix24-sync/index.ts:1005-1012, :1171; functions.md:323,368); icp_data.bitrix_id (icp_data.md:26,51); sales.external_deal_id + ux_sales_source_external_deal (sales.md:63,179). Credenciais não verificáveis; portfolio_settings 0 linhas → sem token.
- **Revisão:** sem contestação cética concluída.

### F2249 · Integração Bitrix24: bitrix24-oauth + bitrix24-sync

- **Tipo:** Integração externa
- **O que os docs afirmam:** ARCHITECTURE: Bitrix24 via bitrix24-oauth e bitrix24-sync; tela /bitrix24.
- **Fontes:** `docs/ARCHITECTURE.md:110-110`
- **O que falta:** Concluir OAuth em produção (tela mostrará 'conectado' só com token em portfolio_settings); opcional: link no menu lateral. Doc cita 'tabela bitrix24_* (tokens/config)' que não existe — tokens ficam em portfolio_settings.
- **Evidência:** Rota /bitrix24 sob Manager (src/routes/AppRoutes.tsx:937-940); src/pages/Bitrix24.tsx:26,45 usa useBitrix24 (status real via invoke bitrix24-oauth — useBitrix24.ts:46; logs via bitrix24_sync_logs :67-71; sync via invoke bitrix24-sync :134-135; authorize :85-109). Sem entrada no menu lateral (grep -n 'bitrix' src/components/layout/sidebar/sidebarMenuData.ts → 0); acesso só por src/components/admin/AdminQuickLinks.tsx:46 e /admin/conexoes (Bitrix24Tab.tsx:15). Não há tabela bitrix24_* de tokens (usa portfolio_settings, 0 linhas em prod).
- **Revisão:** sem contestação cética concluída.

### F2250 · Integração Bitrix24: bitrix24-oauth + bitrix24-sync + bitrix24_sync_logs

- **Tipo:** Integração externa
- **O que os docs afirmam:** Sincronização de empresas e deals com Bitrix24, OAuth e logs de sync.
- **Fontes:** `docs/FUNCIONALIDADES_SISTEMA.md:441-441; docs/FUNCIONALIDADES_SISTEMA.md:511-512`
- **O que falta:** Confirmar secrets e OAuth em produção; inspecionar status/error_message das linhas de bitrix24_sync_logs (provável série de erros do cron horário sem credenciais).
- **Evidência:** bitrix24-oauth/index.ts e bitrix24-sync/index.ts existem, na allowlist; bitrix24_sync_logs existe com RLS (1 policy SELECT is_admin_or_manager — tables/public/bitrix24_sync_logs.md) e ~720 linhas (stats.md:51), gravadas por bitrix24-sync/index.ts:91-100; UI de conexão: src/pages/Bitrix24.tsx + src/components/admin/connections/Bitrix24Tab.tsx:10-15. Secrets não verificáveis; portfolio_settings 0 linhas → sem token.
- **Revisão:** sem contestação cética concluída.

### F2251 · Integração externa: Bitrix24 (CRM)

- **Tipo:** Integração externa
- **O que os docs afirmam:** 2 funções (bitrix24-oauth, bitrix24-sync) publicadas e iniciando. B18: job bitrix24-sync-hourly falha com "Bitrix24 credentials not configured". Chamada real ao provedor não exercida (B4).
- **Fontes:** `docs/prod-readiness.md:860`
- **O que falta:** Secrets BITRIX24_* configurados + OAuth autorizado + uma sync com status success em bitrix24_sync_logs. Até lá o cron horário gera apenas falhas.
- **Evidência:** cron.md:37 job 48 bitrix24-sync-hourly ativo; functions bitrix24-oauth/bitrix24-sync na allowlist (deploy.yml:144); OPTIONS tratado (oauth:51-53, sync:925-927). Sem token em produção (portfolio_settings 0 linhas, stats.md:154); doc prod-readiness.md:860 registra 'Bitrix24 credentials not configured' (B18) e chamada real não exercida (B4). Resposta OPTIONS e logs de chamada real não verificáveis desta sessão.
- **Revisão:** sem contestação cética concluída.

### F2252 · Integração externa: Slack

- **Tipo:** Integração externa
- **O que os docs afirmam:** 5 funções usam SLACK_WEBHOOK_URL; 4/5 publicadas; webvitals-regression-alert indisponível. B18: 72× 503 "SLACK_WEBHOOK_URL not configured". Chamada real ao provedor não exercida (B4).
- **Fontes:** `docs/prod-readiness.md:858`
- **O que falta:** Deployar webvitals-regression-alert (ou remover o cron 44) e confirmar SLACK_WEBHOOK_URL em Edge Functions → Secrets; não há evidência de post bem-sucedido ao Slack.
- **Evidência:** Functions que leem SLACK_WEBHOOK_URL: wal-health-alert, notify-quote-conversion, webvitals-regression-alert, edge-retry-threshold-alert (grep -rl; 4, não 5 — a 5ª do doc provavelmente é _shared/alert-escalation.ts com SLACK_ALERT_WEBHOOK_URL). webvitals-regression-alert está FORA da allowlist (deploy.yml:144) mas tem cron diário ativo (cron.md:33 job 44 '15 11 * * *', cron-runs.md:236-241) — bate em function não deployada. Secret não verificável (vault.md vazio).
- **Revisão:** sem contestação cética concluída.

### F2253 · Integração externa: Supabase externo (external-db-bridge)

- **Tipo:** Integração externa
- **O que os docs afirmam:** 2 funções; 1/2 publicadas; test-integration-connection indisponível. Chamada real ao provedor não exercida (B4).
- **Fontes:** `docs/prod-readiness.md:869`
- **O que falta:** Deployar test-integration-connection; configurar EXTERNAL_SUPABASE_URL/EXTERNAL_SUPABASE_ANON_KEY; registrar ao menos uma conexão em integration_connections e um health check bem-sucedido.
- **Evidência:** external-db-bridge na allowlist (deploy.yml:144), index.ts:81-93 allowlist de 10 tabelas e :115-143 auth JWT + is_admin_or_manager. test-integration-connection FORA da allowlist (confirma prod-readiness.md:869). public.integration_connections existe com RLS (1 policy) e 0 linhas (stats.md:284); integration_health_checks 0 linhas (stats.md:371). Secrets EXTERNAL_SUPABASE_URL/ANON_KEY não verificáveis; chamada real não registrada (query_telemetry/integration_logs 0 linhas, stats.md:85).
- **Revisão:** sem contestação cética concluída.

### F2254 · Integração GIFT STORE

- **Tipo:** Integração externa
- **O que os docs afirmam:** Doc cita GIFT STORE como integração existente.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:51`
- **O que falta:** Incluir receive-quote-webhook na allowlist deploy.yml:144 (ou registrar que foi substituída por receive-quote-sync); confirmar no painel os secrets EXTERNAL_SUPABASE_* e QUOTE_SYNC_API_KEY.
- **Evidência:** docs/FUNCIONALIDADES_COMPLETAS.md:495-498 define GIFT STORE = receive-quote-webhook + external-db-bridge. supabase/functions/receive-quote-webhook/index.ts:155 grava source 'gift_store' e chama RPC sync_quote_from_webhook (existe no banco: snapshot supabase/functions.md:348, grant service_role) — mas receive-quote-webhook NÃO está na allowlist ACTIVE (.github/workflows/deploy.yml:144 → 0 ocorrências). external-db-bridge está na allowlist; index.ts:196-197 lê EXTERNAL_SUPABASE_URL/EXTERNAL_SUPABASE_ANON_KEY; UI src/components/admin/ExternalDBSettings.tsx:27 invoca a edge, montada em src/pages/AdminDashboard.tsx:172 e SupabaseConnectionsTab.tsx:43 (rota /admin via AppRoutes.tsx:960). Caminho ativo de cotações hoje é receive-quote-sync (allowlist) com ramo promogifts (index.ts:275-297 HMAC). Valores dos secrets EXTERNAL_* não verificáveis (snapshot vault.md: _nenhum_).| cético: Confirmado:…

### F2256 · Integração Lovable AI Gateway embeddings (text-embedding-004)

- **Tipo:** Integração externa
- **O que os docs afirmam:** https://ai.gateway.lovable.dev/v1/embeddings usado em semantic-index-entity/index.ts:70,73 e semantic-search-universal/index.ts:25 com google/text-embedding-004.
- **Fontes:** `docs/estado/06_DOMINIO_IA_COACHING.md:28,37`
- **O que falta:** Deployar semantic-index-entity/semantic-reindex-batch/semantic-search-universal (liberando vagas na allowlist) ou redirecionar hooks; agendar reindexação.
- **Evidência:** supabase/functions/semantic-index-entity/index.ts:127-141 (generateEmbedding → LOVABLE_AI_EMBEDDINGS_URL, model google/text-embedding-004) e semantic-search-universal/index.ts:23-26 (fetch .../v1/embeddings). Tabela public.semantic_index existe com RLS e embedding vector(768) (snapshot tables.md:325; tables/public/semantic_index.md). UI: src/hooks/semantic/useSemanticSearch.ts:26 invoca 'semantic-search-universal' e useIndexEntity.ts:11 invoca 'semantic-index-entity' (usados em CommandPalette.tsx, SmartSearch.tsx). Porém nenhuma das duas está na allowlist ACTIVE (deploy.yml:144 → 0 para ambas; só 'semantic-search' e 'visual-search' estão). visual-search/index.ts:218,226 também usa embeddings e está deployada.| cético: Confirmado e reforçado: as únicas functions que gravam semantic_index são semantic-index-entity e semantic-reindex-batch (grep -rln semantic_index supabase/functions) e ne…

### F2257 · Integração V4/PromoGifts (receive-quote-sync HMAC, receive-quote-webhook, notify-v4-quote-status, check-v4-callback-alerts)

- **Tipo:** Integração externa
- **O que os docs afirmam:** Funciona, mas é testada contra produção e o teste live é pulado por credencial inválida.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:146`
- **O que falta:** Deployar check-v4-callback-alerts e receive-quote-webhook; credencial no CI para o tier live de receive-quote-sync.
- **Evidência:** Edges existem: receive-quote-sync/index.ts:131-148 (HMAC QUOTE_SYNC_WEBHOOK_SECRET, ramo v4) e :275-297 (promogifts); notify-v4-quote-status, check-v4-callback-alerts (index.ts + alerts.ts), receive-quote-webhook. Allowlist deploy.yml:144: receive-quote-sync e notify-v4-quote-status SIM; receive-quote-webhook e check-v4-callback-alerts NÃO (0 ocorrências). Cron real: cron.md:26-27 jobs 36/37 a cada 5 min chamam notify-v4-quote-status e check-v4-callback-alerts via trigger_internal_edge_job (allowlist SQL inclui ambos, functions/public/trigger_internal_edge_job*.sql:16-17); cron-runs.md:173-187 'succeeded 1 row' prova só o enfileiramento SQL. Tabelas com RLS: quote_sync_inbound_log, quote_sync_logs, v4_callback_* (tables.md:268-269,374-377). UI: src/hooks/admin/useV4Callbacks.ts:51-204 lê v4_callback_dead_letters/metrics; páginas AdminV4CallbacksPage e AdminQuoteSyncInboundPage. Teste li…

### F2259 · Integrações externas declaradas (Twilio, ElevenLabs, Bitrix24, Resend/SendGrid, WhatsApp/Meta, gateway IA Lovable, helpdesk-sync)

- **Tipo:** Integração externa
- **O que os docs afirmam:** Doc lista integrações ativas: Twilio, ElevenLabs, Bitrix24, Resend/SendGrid, WhatsApp/Meta multichannel, IA via ai.gateway.lovable.dev (Gemini), Freshdesk/Zendesk/Intercom via helpdesk-sync.
- **Fontes:** `docs/auditoria/AUDITORIA_TECNICA_EXAUSTIVA_2026-09-02.md:28`
- **O que falta:** Deployar twilio-* e whatsapp-inbound-webhook (ou ocultar UI); cron para helpdesk-sync; corrigir doc sobre SendGrid.
- **Evidência:** Existem com chamada real e secret via Deno.env.get: helpdesk-sync/index.ts:126-137 (ZENDESK__, INTERCOM_ACCESS_TOKEN, FRESHDESK__; allowlist SIM; UI HelpdeskConnectorPanel em CS360Tabs.tsx; sem cron: grep helpdesk cron.md → 0); twilio-click-to-call/index.ts:160-161,226 (api.twilio.com, creds do banco) + twilio-call-status/twiml:112-113 (TWILIO_AUTH_TOKEN) — as 3 twilio-* NÃO estão na allowlist (deploy.yml:144 → 0) embora src/hooks/dialer/useClickToCall.ts as invoque; elevenlabs-tts/index.ts:62 (ELEVENLABS_API_KEY; tts/voice allowlist SIM, elevenlabs-stt NÃO); send-transactional-email/index.ts:234,273 (RESEND_API_KEY, api.resend.com; allowlist SIM); send-multichannel-message/index.ts:128 (graph.facebook.com v20, meta_cloud :350) e :151-153 (EVOLUTION_*; allowlist SIM; whatsapp-inbound-webhook NÃO); bitrix24-oauth/sync allowlist SIM; gateway Lovable _shared/ai-gateway.ts:6. SendGrid: ause…

### F2262 · N8N chamado pelo CRM com api_key protegida

- **Tipo:** Integração externa
- **O que os docs afirmam:** N8N nunca é chamado; api_key em texto puro; teste de conexão não valida a chave.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:251`
- **O que falta:** Chave em Vault; chamada real do CRM ao N8N; validação autenticada; deploy de test-integration-connection.
- **Evidência:** src/components/admin/connections/N8nTab.tsx:23-30 grava kind 'n8n' com config { base_url, api_key } em texto puro na tabela integration_connections (coluna config jsonb, snapshot tables/public/integration_connections.md:22; RLS sim, 1 policy). supabase/functions/test-integration-connection/index.ts:33-35 lê cfg.api_key e chama `${baseUrl}/healthz` (healthz não exige key → não valida a chave). Único uso de n8n em edges: grep -rn n8n supabase/functions → só test-integration-connection; a function NÃO está na allowlist (deploy.yml:144 → 0), então até o teste de conexão não roda em produção. Vault: snapshot vault.md '_nenhum_' → chave fora do vault. Confirma as 3 reivindicações da doc.| cético: Confirmado: única chamada a n8n é o teste de conexão, src/hooks/admin/useIntegrationConnections.ts:128-129 invoke('test-integration-connection'), function fora da allowlist deploy.yml:144 (0). Demais…

### F2264 · Plano 30/08 etapa 80 (P080): Concluir ou manter desabilitadas assinatura digital, WebAuthn e provedores incompletos

- **Tipo:** Integração externa
- **O que os docs afirmam:** Etapa 80 do plano de 100 etapas (auditoria 30/08; = P080 do handoff): UI sem promessa de sucesso para serviço indisponível.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:747-747`
- **O que falta:** Fechar P080: tratar Twilio click-to-call (deployar ou ocultar), marcar o checklist e alinhar FUNCIONALIDADES_COMPLETAS.md:500-503 sobre elevenlabs-stt.
- **Evidência:** Plano P080 segue aberto: docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:391 '- [ ] P080'. Assinatura digital: src/hooks/useDigitalSignatures.ts:123-147 sendForSignature/updateSignerStatus lançam DIGITAL_SIGNATURE_INTEGRATION_MESSAGE e exibem toast 'indisponível' (UI sem promessa falsa — ok); tabela digital_signatures existe com RLS (tables.md:137); rota /assinatura-digital AppRoutes.tsx:408. WebAuthn: function webauthn na allowlist, tabela webauthn_challenges (tables.md:380), PasskeySettings.tsx existe, mas grep loginWithPasskey src/pages/Auth.tsx → 0 (sem login por passkey). ElevenLabs: elevenlabs-tts/voice allowlisted (index.ts:62-70 trata chave ausente), elevenlabs-stt fora da allowlist. Doc FUNCIONALIDADES_COMPLETAS.md:500-503 ainda lista stt como ativa.| cético: Correção parcial da evidência do verificador: WebAuthn ESTÁ ligado no login — src/pages/Auth.tsx:5,8 …

### F2265 · QUOTE_SYNC_WEBHOOK_SECRET / QUOTE_SYNC_API_KEY

- **Tipo:** Integração externa
- **O que os docs afirmam:** Webhooks de sincronização de cotações.
- **Fontes:** `docs/SECRETS_ROTATION.md:35`
- **O que falta:** QUOTE_SYNC_API_KEY não é consumida por nenhuma function deployada: incluir receive-quote-webhook na allowlist ACTIVE de .github/workflows/deploy.yml:144 (respeitando o limite de 100) ou aposentar a chave e corrigir docs/SECRETS_ROTATION.md:35.
- **Evidência:** QUOTE_SYNC_WEBHOOK_SECRET: lida em supabase/functions/receive-quote-sync/index.ts:131-136 (401 se ausente), function presente na allowlist ACTIVE (.github/workflows/deploy.yml:144 contém 'receive-quote-sync'); grava em quote_sync_inbound_log/webhook_inbound_dedupe/quotes (index.ts:79,106,219), tabelas existentes com RLS no banco real (tables.md:268,386). QUOTE_SYNC_API_KEY: lida só em supabase/functions/receive-quote-webhook/index.ts:9,95-97 (grep -rn QUOTE_SYNC_API_KEY supabase/functions → só esse arquivo), e receive-quote-webhook NÃO está na allowlist (deploy.yml:144 → 0 ocorrências), logo não roda em produção. docs/SECRETS_ROTATION.md:35 declara as duas como secrets de produção.
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Implementado.

### F2266 · Resend — alertas críticos transacionais por e-mail

- **Tipo:** Integração externa
- **O que os docs afirmam:** E-mails transacionais via Resend.
- **Fontes:** `docs/FUNCIONALIDADES_COMPLETAS.md:510-512`
- **O que falta:** Deployar send-alert-notifications e send-password-reset (ou migrar para send-transactional-email); confirmar RESEND_API_KEY e envio real nos logs.
- **Evidência:** Resend integrado: supabase/functions/send-transactional-email/index.ts:234,273 (RESEND_API_KEY, POST https://api.resend.com/emails; allowlist SIM; chamada por src/hooks/email/useComposeEmail.ts, send-churn-alert-email, sequence-runner); 13 functions leem RESEND_API_KEY; activity-goal-alerts (allowlist) e _shared/alert-escalation.ts também usam api.resend.com. Porém as functions citadas como artefato — send-alert-notifications/index.ts:18-20,374 e send-password-reset/index.ts:29 — NÃO estão na allowlist (deploy.yml:144 → 0). RPC enqueue_email não existe no banco (grep snapshot functions.md → 0), confirmando G_infra_ci_integracoes.md:146 (bulk/alertas devolvem email_infra_missing). Secret configurado e log de envio real: não verificáveis sem painel.| cético: Confirmado e reforçado: UI chama functions de e-mail não deployadas — src/components/notifications/NotificationPreferenceCard.tsx:66…

### F2267 · Slack/Teams de negócio

- **Tipo:** Integração externa
- **O que os docs afirmam:** Não iniciado.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:255`
- **O que falta:** Integração Teams; outros eventos de negócio (deal ganho, meta); confirmar SLACK_WEBHOOK_URL configurado.
- **Evidência:** Slack de negócio existe só como código órfão: supabase/functions/notify-quote-conversion/index.ts:2,63,265-268 posta conversão quote→sale no SLACK_WEBHOOK_URL (allowlist SIM), mas nenhum chamador: grep -rn notify-quote-conversion supabase/functions supabase/migrations snapshot functions/public/*.sql src → 0 fora da própria pasta. Slack restante é ops (wal-health-alert:102, deal-risk-digest; cron.md:22,31). Teams: grep -rniE 'webhook\.office\|TEAMS_WEBHOOK' src supabase → 0.| cético: Correção da evidência: notify-quote-conversion TEM chamador real — src/hooks/useQuotes.ts:320-343 dispatchConversionNotification invoke('notify-quote-conversion'), chamado em :381 e :394 dentro de useConvertQuoteToSale, usado em src/components/quotes/QuoteDetailDialog.tsx:38, montado em src/pages/Orcamentos.tsx:673. Function na allowlist (deploy.yml:144=1) e posta no Slack se SLACK_WEBHOOK_URL existir (notif…

### F2268 · Slack/Teams notifications + commands

- **Tipo:** Integração externa
- **O que os docs afirmam:** Falta notificações e comandos via Slack/Teams.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:55`
- **O que falta:** Slash commands Slack (edge com verificação de assinatura) e webhook/app Teams.
- **Evidência:** Notificações Slack existem só para ops: wal-health-alert/index.ts:102-114 e deal-risk-digest (SLACK_WEBHOOK_URL), ambas na allowlist e com cron (cron.md:22 job 21, :31 job 41); notify-quote-conversion (negócio) sem chamador. Comandos: grep -rniE 'slack.*command\|slash' supabase/functions src → 0. Teams: 0. Functions slack-notify/teams-notify ausentes (ls supabase/functions| grep -iE 'slack\|teams' → 0). \| cético: Notificações Slack existem (ops: wal-health-alert, deal-risk-digest com cron; negócio: notify-quote-conversion chamada por src/hooks/useQuotes.ts:336, allowlist=1). Comandos: ausente (grep slash/command → 0); Teams ausente; slack-notify/teams-notify ausentes (ls supabase/functions \| grep -iE 'slack\|teams' → 0).

### F2269 · Slack/Teams: notificações de negócio e comandos

- **Tipo:** Integração externa
- **O que os docs afirmam:** Slack só envia webhooks de alerta de ops (wal-health-alert, deal-risk-digest); sem comandos nem Teams.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:127`
- **O que falta:** Slash commands e canal Teams; ampliar eventos de negócio.
- **Evidência:** Confirma a doc: Slack só em alertas ops — supabase/functions/wal-health-alert/index.ts:13,102 e deal-risk-digest/index.ts (SLACK_WEBHOOK_URL), além de cron-failure-alerter, edge-retry-threshold-alert, webvitals-regression-alert, winloss-webhook-health-monitor e _shared/alert-escalation.ts. Único Slack de negócio (notify-quote-conversion/index.ts:265-268) não tem chamador (grep → 0). Sem slash commands (grep 'slash\|slack.*command' → 0) e sem Teams (grep 'webhook.office' → 0).| cético: Mesmo quadro de F2268: notificação de negócio Slack existe via notify-quote-conversion (src/hooks/useQuotes.ts:336,381,394 → QuoteDetailDialog.tsx:38 → Orcamentos.tsx:673; allowlist=1) — o verificador errou ao dizer 'sem chamador'. Comandos Slack e Teams continuam ausentes.

### F2271 · Sync Bitrix24 de Companies, Deals e Custom Fields

- **Tipo:** Integração externa
- **O que os docs afirmam:** Entidades sincronizadas.
- **Fontes:** `docs/FUNCIONALIDADES_COMPLETAS.md:492-492`
- **O que falta:** Descoberta/sync genérico de custom fields (crm.company.fields/crm.deal.fields) gravando em custom fields.
- **Evidência:** supabase/functions/bitrix24-sync/index.ts:307 crm.company.list → clients (:351,:401) e icp_data.bitrix_id (:365,:381,:416,:434); :460 crm.deal.list → sales (:524-620) com stageMapping (:469-578); ações :1054-1066 (sync-companies/deals from/to, sync-all). Custom fields: apenas UF_CRM fixos hardcoded (:23-24 UF_CRM_1590780873288/1631795570468, :54-55,:313-314 UF_CRM_CAPITAL_SOCIAL/NUM_COLABORADORES) mapeados para icp_data; sem crm.*.fields (grep '\.fields\|userfield' → 0) nem escrita em custom_fields. Allowlist SIM; cron.md:37 job 48 bitrix24-sync-hourly.| cético: Confirmado: supabase/functions/bitrix24-sync/index.ts:23-24,54-55,313-314,366-370 só mapeia 4 campos UF_CRM fixos; grep -nE '\.fields\|userfield\|custom_field' bitrix24-sync/index.ts → 0.

### F2276 · Gap "classe mundial" já existente: Webhooks com DLQ/replay

- **Tipo:** Outro
- **O que os docs afirmam:** Doc afirma que o gap "Webhooks com DLQ/replay" de GAPS_CLASSE_MUNDIAL já existe no código.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:208`
- **O que falta:** Deployar winloss-webhook-replay/replay-batch/dispatcher/health-monitor; DLQ/retry no dispatch-webhook genérico; confirmar V4_CALLBACK_URL/API key.
- **Evidência:** DLQ/replay existem só para Win/Loss: tabelas winloss_webhook_dead_letters/deliveries/alerts com RLS (tables.md:403-405); functions winloss-webhook-dispatcher, -replay, -replay-batch, -timeline, -health-monitor no repo; UI rotas /admin/webhooks-dead-letters e /admin/webhooks-timeline (AppRoutes.tsx:1061-1069), src/hooks/win-loss/useWebhookDeadLetters.ts:63,96 e useAsyncReplayQueue.ts:62 invocam 'winloss-webhook-replay'. Porém nenhuma winloss-webhook-* está na allowlist (deploy.yml:144 → 0), inclusive health-monitor chamado pelo cron 42 (cron.md:32); dispatcher só é acionado por replay/testes/RetryTestStatusPage.tsx (grep → nenhum evento de negócio). Webhooks genéricos (dispatch-webhook, allowlist) não têm DLQ/replay: grep 'retry\|dead_letter\|attempts' dispatch-webhook/index.ts → 0; useWebhooks.ts:173-176 só test.ping.| cético: Correção (mais implementado que o verificador disse, mas não…

### F2277 · Gap "classe mundial" já existente: Workflow builder visual

- **Tipo:** Outro
- **O que os docs afirmam:** Doc afirma que o gap "Workflow builder visual" de GAPS_CLASSE_MUNDIAL já existe no código.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:208`
- **O que falta:** Apontar useWorkflows.ts:136 para function deployada ou deployar workflow-executor; unificar builders.
- **Evidência:** Builder visual existe: src/pages/WorkflowsPage.tsx:4-17 usa ReactFlow de @xyflow/react (package.json:112), rota /workflows (AppRoutes.tsx:549-552), menu sidebarMenuData.ts:367; hook src/hooks/useWorkflows.ts:44-116 lê/grava tabelas workflows e workflow_executions (RLS sim, tables.md:410,412). Porém a execução invoca 'workflow-executor' (useWorkflows.ts:136) que NÃO está na allowlist (deploy.yml:144 → 0; a allowlist tem 'execute-workflow', usado só por useAutomationWorkflows.ts para /workflow-builder, página AutomationBuilder.tsx:89-96 sem canvas). /automacoes (Automacoes.tsx:16 → WorkflowBuilder.tsx) é formulário de regras workflow_rules, não visual.| cético: Confirmado: único canvas visual é src/pages/WorkflowsPage.tsx (grep @xyflow/react em src → só ele), rota /workflows AppRoutes.tsx:549; execução em src/hooks/useWorkflows.ts:135-136 invoke('workflow-executor'), pasta existe mas fora…

### F2282 · Executor das regras de workflow_rules (/automacoes)

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Regras gravadas em workflow_rules por /automacoes nunca executam: nenhuma função/cron lê a tabela (só o CREATE TABLE em 20260317184958). B9: decidir construir executor ou retirar a tela.
- **Fontes:** `docs/prod-readiness.md:124`
- **O que falta:** Decidir B9: criar edge function/cron que leia workflow_rules ativas e execute ações com log de execução, ou remover a rota/menu /automacoes.
- **Evidência:** UI existe: src/pages/Automacoes.tsx:1 monta WorkflowBuilder; src/hooks/useWorkflowRules.ts:123,153,185,208 faz CRUD em workflow_rules; rota /automacoes em AppRoutes.tsx:346 e menu sidebarMenuData.ts:120. Executor ausente: grep -rln workflow_rules supabase/functions → 0; contexto/supabase/cron.md e functions/*.sql → só trigger set_updated_at (triggers.md:391). execute-workflow lê automation_workflows, não workflow_rules (supabase/functions/execute-workflow/index.ts:73). docs/prod-readiness.md:1025,1047 registra B9 como decisão pendente, sem remoção.
- **Revisão:** sem contestação cética concluída.

### F2286 · Monitoramento em tempo real de Circuit Breakers e Dead Letter Queues

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Checklist: monitoramento real-time de breakers e DLQ.
- **Fontes:** `docs/auditoria_enterprise_v5.md:91`
- **O que falta:** Adicionar check-v4-callback-alerts e winloss-webhook-health-monitor à allowlist (ou retirar os crons 37/42) e criar alerta Slack para transições de circuit_breaker_events.
- **Evidência:** Dashboard roteado: src/components/debug/CircuitBreakerDashboard.tsx importado em src/pages/AdminDashboard.tsx:18,171 (rota /admin AppRoutes.tsx:957-960) e Configuracoes.tsx:7,350; lê circuit_breaker_events (src/hooks/useCircuitBreakerHistory.ts:22,55; tabela RLS sim/3 policies). Alerta de retry: edge-retry-threshold-alert lê edge_retry_events (index.ts:130) e posta Slack (index.ts:27,193), na allowlist (deploy.yml:144), cron job 40 */15 (cron.md:30, cron-runs.md 'succeeded'). Faltas: nenhuma function alerta sobre circuit_breaker_events (grep -rln circuit_breaker_events supabase/functions → só _shared/circuit-breaker.ts, o gravador); alertas de DLQ check-v4-callback-alerts (cron job 37, cron.md:27) e winloss-webhook-health-monitor (job 42, cron.md:32) NÃO estão na allowlist ACTIVE (grep -c check-v4-callback-alerts deploy.yml → 0), logo os crons chamam funções não deployadas.
- **Revisão:** sem contestação cética concluída.

### F2287 · Observabilidade de webhooks com dead letters e replay

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Afirma dead letters e replay de webhooks.
- **Fontes:** `docs/benchmark/RAMPER_2026-07.md:13`
- **O que falta:** Incluir winloss-webhook-dispatcher, -replay e -timeline na allowlist (há limite de 100) e ligar o dispatcher a um gatilho real (cron ou trigger em win_loss_analyses).
- **Evidência:** Tabela winloss_webhook_dead_letters existe (RLS sim, 2 policies — tables/public/winloss_webhook_dead_letters.md:7-9); UI roteada: /admin/webhooks-dead-letters e /admin/webhooks-timeline (AppRoutes.tsx:1061-1075), hook lê a tabela (src/hooks/win-loss/useWebhookDeadLetters.ts:63). Porém replay invoca 'winloss-webhook-replay' (useWebhookDeadLetters.ts:96) e timeline invoca 'winloss-webhook-timeline' (src/hooks/win-loss/useWebhookTimeline.ts:71-72), e nem essas nem winloss-webhook-dispatcher (gravador das dead letters, index.ts:60) estão na allowlist ACTIVE (deploy.yml:144: só analyze-win-loss, detect-winloss-at-risk, export-winloss-pdf, mine-win-loss-patterns). Dispatcher não tem gatilho em produção (grep winloss-webhook em contexto/supabase/functions → só trigger_internal_edge_job, que lista apenas health-monitor; triggers.md só set_updated_at/audit). 0 dead letters (stats.md:235).
- **Revisão:** sem contestação cética concluída.

### F2291 · Retry logic do dispatch-webhook

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Reenvio em falha.
- **Fontes:** `docs/FUNCIONALIDADES_COMPLETAS.md:411-411`
- **O que falta:** Implementar tentativas com backoff exponencial (ex.: 3 tentativas) ou fila de reentrega lendo webhook_deliveries com success=false.
- **Evidência:** supabase/functions/dispatch-webhook/index.ts faz uma única tentativa por webhook (l.166-217: fetchWithTrace dentro de withEdgeCircuitBreaker, sem loop/backoff) e grava webhook_deliveries com success/response_status (l.221-230,254) e failure_count (l.232-246). Não há reenvio: grep -n 'retry\|backoff' em dispatch-webhook/index.ts → 0. Circuit breaker (failureThreshold 5, l.207) não é retry.
- **Revisão:** sem contestação cética concluída.

### F2293 · Webhooks de saída (/webhooks, dispatch-webhook, webhook_deliveries)

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Paridade.
- **Fontes:** `docs/benchmark/RAMPER_2026-07.md:130`
- **O que falta:** Disparar dispatch-webhook a partir de eventos de negócio (ver F2294) para que entregas reais sejam gravadas.
- **Evidência:** Rota /webhooks registrada (src/routes/AppRoutes.tsx:517-521, guard Manager) e no menu (sidebarMenuData.ts:370); dispatch-webhook na allowlist (deploy.yml:144) e grava webhook_deliveries (index.ts:254); tabelas com RLS (tables/public/webhooks.md e webhook_deliveries.md:7-9). Mas o único chamador é useTestWebhook com event_type 'test.ping' (src/hooks/useWebhooks.ts:173-177) e produção tem webhooks=0 e webhook_deliveries=0 (stats.md:333-334).
- **Revisão:** sem contestação cética concluída.

### F2294 · Webhooks de saída disparam eventos reais

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Só disparam test.ping.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:252`
- **O que falta:** Criar gatilhos (trigger pg_net ou chamadas nas edges de venda/cotação) que invoquem dispatch-webhook com eventos como sale.created, quote.won.
- **Evidência:** Confirmado: único invocador de dispatch-webhook é src/hooks/useWebhooks.ts:173-177 com event_type 'test.ping'; grep -rn dispatch-webhook src supabase/functions supabase/migrations (fora da própria pasta) → só esse; contexto/supabase/functions/*.sql, triggers.md, cron.md, webhooks.md → 0 chamadas. Função e tabela existem (dispatch-webhook/index.ts:149-154 filtra webhooks por events).
- **Revisão:** sem contestação cética concluída.

### F2295 · Webhooks robustos com retry e DLQ (existe básico)

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Existe webhook básico; falta retry e DLQ.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:210`
- **O que falta:** Adicionar retry/backoff e dead letter ao dispatch-webhook (ou reutilizar retry.ts do dispatcher) e deployar winloss-webhook-dispatcher/replay.
- **Evidência:** Webhook genérico: dispatch-webhook sem retry/backoff (index.ts:166-217) e sem DLQ (grava só webhook_deliveries, l.254). Retry+DLQ existem apenas no trilho win/loss: winloss-webhook-dispatcher/index.ts:3 (retry.ts, attempts l.66) grava winloss_webhook_dead_letters (l.60), replay em winloss-webhook-replay — mas nenhuma dessas 3 functions está na allowlist ACTIVE (deploy.yml:144) nem tem gatilho em produção.
- **Revisão:** sem contestação cética concluída.

### F3726 · Rota /admin/conexoes (9 afirmações nos docs)

- **Tipo:** Rota/tela
- **O que os docs afirmam:** API.md declara a rota `/admin/conexoes` renderizando o componente AdminConexoesPage com acesso "admin".| Hoje só Bitrix24/GIFT STORE; falta marketplace de apps. \| Superior: integration_health_checks. \| Roadmap Q4 prevê marketplace com 20+ integrações. \| Rota /admin/conexoes incluída no sweep de acessibilidade autenticado. \| Rota registrada em AppRoutes.tsx com acesso "admin", GET em produção 200, chamando as edge functions bitrix24-oauth, bitrix24-sync, dispatch-webhook, edge-retry-threshold-alert, external-db-bridge, test-integration-connection. Status no doc: BLOQUEADO: edge test-integration-connection indisponível \| Rota /admin/conexoes (AppRoutes.tsx:274) renderiza src/pages/admin/…
- **Fontes:** `docs/API.md:433-433`, `docs/GAPS_CLASSE_MUNDIAL.md:51`, `docs/benchmark/RAMPER_2026-07.md:132`, `docs/GAPS_CLASSE_MUNDIAL.md:239`, `docs/reports/QA_ONDA_L_FINAL.md:124-124`, `docs/prod-readiness.md:85` e mais 3
- **O que falta:** Publicar test-integration-connection (fora da allowlist de deploy.yml:144). O marketplace de integrações não existe.
- **Evidência:** rota /admin/conexoes → src/pages/admin/AdminConexoesPage.tsx (AppRoutes.tsx); sem entrada no menu (sidebarMenuData.ts) → só acessível por URL| cético: O motivo da pré-checagem está errado: a página tem navegação, pelo menu 'Admin' (sidebarMenuData.ts:354) → /admin (AppRoutes.tsx:957, AdminDashboard.tsx:156 monta AdminQuickLinks) → link em AdminQuickLinks.tsx:39. A rota tem guarda Admin (AppRoutes.tsx:965-968). Continua PARCIAL porque o teste de conexão chama test-integration-connection (useIntegrationConnections.ts:128), que está FORA da allowlist de deploy.yml:144. O marketplace com 20+ integrações não existe.

### F3727 · Rota /admin/v4-callbacks (4 afirmações nos docs)

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Rota admin /admin/v4-callbacks exibe KPIs, banner de status e dead letters da fila V4.| Rota registrada em AppRoutes.tsx com acesso "admin", GET em produção 200, chamando as edge functions notify-v4-quote-status. Status no doc: OK \| Rota /admin/v4-callbacks (AppRoutes.tsx:275) renderiza src/pages/admin/AdminV4CallbacksPage.tsx; role: admin. Classificação do doc: IMPLEMENTADO_TOTAL. Evidência: link src/components/admin/AdminQuickLinks.tsx:40 · sb=3 useQuery=2 mut=3 (árvore 18 arq.) \| API.md declara a rota `/admin/v4-callbacks` renderizando o componente AdminV4CallbacksPage com acesso "admin".
- **Fontes:** `docs/RUNBOOK.md:177`, `docs/prod-readiness.md:100`, `docs/estado/01_FRONTEND_ROTAS.md:193-193`, `docs/API.md:434-434`
- **O que falta:** Estado de erro para as queries da lista, dos KPIs e dos alertas em AdminV4CallbacksPage.tsx. O cron 37 chama check-v4-callback-alerts, que está fora da allowlist.
- **Evidência:** rota /admin/v4-callbacks → src/pages/admin/AdminV4CallbacksPage.tsx (AppRoutes.tsx); sem entrada no menu (sidebarMenuData.ts) → só acessível por URL| cético: O motivo da pré-checagem está errado: há navegação por menu Admin (sidebarMenuData.ts:354) → AdminQuickLinks.tsx:40, montado em AdminDashboard.tsx:156. A rota tem guarda Admin (AppRoutes.tsx:973-976). Os dados são reais: useV4Callbacks.ts:51,76,131,204 leem v4_callback_dead_letters (RLS sim, tables.md:376), e :230 chama notify-v4-quote-status, que está na allowlist e tem cron 36 (cron.md:26). A página tem estados de loading (AdminV4CallbacksPage.tsx:286) e vazio (:296-302), mas nenhum estado de erro: grep -n isError src/pages/admin/AdminV4CallbacksPage.tsx → 0.

### F3728 · Rota /admin/webhooks-dead-letters (4 afirmações nos docs)

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Lista inbound/webhooks que falharam após N tentativas com replay quando aplicável.| Rota /admin/webhooks-dead-letters (AppRoutes.tsx:286) renderiza src/pages/admin/WebhooksDeadLettersAdmin.tsx; role: admin. Classificação do doc: IMPLEMENTADO_TOTAL. Evidência: link src/components/admin/AdminQuickLinks.tsx:123 · sb=9 useQuery=9 mut=4 (árvore 28 arq.) \| Rota registrada em AppRoutes.tsx com acesso "admin", GET em produção 200, chamando as edge functions winloss-webhook-replay. Status no doc: BLOQUEADO: edge winloss-webhook-replay indisponível \| API.md declara a rota `/admin/webhooks-dead-letters` renderizando o componente WebhooksDeadLettersAdmin com acesso "admin".
- **Fontes:** `docs/runbooks/email-transacional.md:41`, `docs/estado/01_FRONTEND_ROTAS.md:204-204`, `docs/prod-readiness.md:104`, `docs/API.md:445-445`
- **O que falta:** Publicar winloss-webhook-replay (fora da allowlist de deploy.yml:144). Sem isso o botão de replay falha em produção.
- **Evidência:** rota /admin/webhooks-dead-letters → src/pages/admin/WebhooksDeadLettersAdmin.tsx (AppRoutes.tsx); sem entrada no menu (sidebarMenuData.ts) → só acessível por URL| cético: O motivo da pré-checagem está errado: há link em AdminQuickLinks.tsx:123, acessível pelo menu Admin (sidebarMenuData.ts:354 → AdminDashboard.tsx:156). A rota tem guarda Admin (AppRoutes.tsx:1061-1064). Continua PARCIAL porque o replay passa por WebhookDeadLetterPanel → useWebhookDeadLetters.ts:96 e useAsyncReplayQueue.ts:62, que chamam winloss-webhook-replay, FORA da allowlist (deploy.yml:144).

### F3729 · Rota /admin/webhooks-timeline (5 afirmações nos docs)

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Rota admin que lista entregas de webhook recebidas/falhas.| Rota /admin/webhooks-timeline (AppRoutes.tsx:287) renderiza src/pages/admin/WebhookTimelinePage.tsx; role: admin. Classificação do doc: IMPLEMENTADO_PARCIAL. Evidência: link src/components/admin/AdminQuickLinks.tsx:56 · sb=1 useQuery=1 mut=0 (árvore 9 arq.) · somente leitura — nenhuma mutação/persistência na árvore \| Status de entrega depende do webhook registrado; timeline admin mostra eventos. \| Rota registrada em AppRoutes.tsx com acesso "admin", GET em produção 200, chamando as edge functions winloss-webhook-timeline. Status no doc: BLOQUEADO: edge winloss-webhook-timeline indisponível \| API.md declara a rota `/admin/webhook…
- **Fontes:** `docs/runbooks/n8n.md:37-38`, `docs/estado/01_FRONTEND_ROTAS.md:205-205`, `docs/FAQ_TROUBLESHOOTING.md:20`, `docs/prod-readiness.md:105`, `docs/API.md:446-446`
- **O que falta:** Publicar winloss-webhook-timeline (fora da allowlist de deploy.yml:144). Sem isso a timeline não carrega dados em produção.
- **Evidência:** rota /admin/webhooks-timeline → src/pages/admin/WebhookTimelinePage.tsx (AppRoutes.tsx); sem entrada no menu (sidebarMenuData.ts) → só acessível por URL| cético: O motivo da pré-checagem está errado: há link em AdminQuickLinks.tsx:56, acessível pelo menu Admin (sidebarMenuData.ts:354). A rota tem guarda Admin (AppRoutes.tsx:1069-1072). Continua PARCIAL porque toda a leitura da página passa por useWebhookTimeline.ts:56,72 → winloss-webhook-timeline, FORA da allowlist (deploy.yml:144). A página é somente leitura.

### F3730 · Rota /bitrix24 (3 afirmações nos docs)

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Rota registrada em AppRoutes.tsx com acesso "admin_ou_gestor", GET em produção 200, chamando as edge functions bitrix24-oauth, bitrix24-sync. Status no doc: OK| Rota /bitrix24 (AppRoutes.tsx:260) renderiza src/pages/Bitrix24.tsx; role: admin ou manager. Classificação do doc: IMPLEMENTADO_TOTAL. Evidência: link src/components/admin/AdminQuickLinks.tsx:46 · sb=1 useQuery=1 mut=1 (árvore 10 arq.) \| API.md declara a rota `/bitrix24` renderizando o componente Bitrix24 com acesso "admin ou gestor".
- **Fontes:** `docs/FUNCIONALIDADES_COMPLETAS.md:488-488`, `docs/DOCUMENTACAO_SISTEMA.md:869-872`, `docs/prod-readiness.md:130`, `docs/estado/01_FRONTEND_ROTAS.md:182-182`, `docs/API.md:423-423`
- **O que falta:** Expor o erro real do status (sem fallback silencioso para 'desconectado') e criar uma entrada de navegação para o gestor.
- **Evidência:** rota /bitrix24 → src/pages/Bitrix24.tsx (AppRoutes.tsx); sem entrada no menu (sidebarMenuData.ts) → só acessível por URL| cético: O motivo da pré-checagem está errado: há links em AdminQuickLinks.tsx:46 e em connections/Bitrix24Tab.tsx:96. A rota tem guarda Manager (AppRoutes.tsx:937-940). useBitrix24.ts:46 e :133 chamam bitrix24-oauth e bitrix24-sync, ambas na allowlist; bitrix24_sync_logs tem RLS (tables.md:38); o cron 48 está ativo. Continua PARCIAL porque useBitrix24.ts:48-52 engole o erro do bitrix24-oauth e retorna {connected:false}, mostrando 'desconectado' em vez de erro. Bitrix24.tsx não trata estado de erro (grep isError → 0). O gestor tem acesso pela rota, mas não tem navegação: os links ficam em /admin, que é só para admin.

### F2298 · Etapa 47 do plano: Projetar autenticação dos endpoints externos

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** JWT, HMAC/provider signature, state/PKCE, anti-replay e rate limit por rota. Saída esperada: threat model e testes negativos. Gate: mudança de config/deploy.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:715-715`
- **O que falta:** Escrever o threat model (STRIDE por endpoint externo) em docs/ e vinculá-lo aos testes negativos existentes.
- **Evidência:** Mecanismos existem: supabase/functions/_shared/webhook-auth.ts (anti-replay isFreshUnixTimestamp l.111-119), oauth-state.ts (state HMAC-SHA256 l.1,31-38), rate-limit.ts usado em 62 index.ts (grep -rln), supabase/config.toml com 22 'verify_jwt = false' de 23; testes negativos em _shared/webhook-auth_test.ts, webhook-auth_twilio_any_test.ts, webhook-integrity_test.ts, oauth-state_test.ts, cron-request-auth_test.ts, internal-service-auth_test.ts. Saída 'threat model' ausente: docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:51 registra 'Threat model (ausente: procurei threat model/STRIDE em docs/)'; grep -rli 'threat model\|modelo de ameaça' docs → só menções nos planos, nenhum documento.
- **Revisão:** sem contestação cética concluída.

### F2299 · external-db-bridge checa papel para escrita

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** Sem checagem de papel para escrita (index.ts:278-288).
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:145`
- **O que falta:** Adicionar has_role(_user_id,'admin') antes do bloco insert/update/delete (l.319) se a regra de negócio for escrita só para admin; senão, atualizar o doc para 'admin ou gestor'.
- **Evidência:** supabase/functions/external-db-bridge/index.ts:142-158 exige is_admin_or_manager para TODAS as operações (inclui insert/update/delete em l.319-334) — a lacuna 'sem checagem de papel' do doc já foi fechada, mas o critério 'escrita exige papel admin' não é atendido estritamente: gestor (manager) também pode escrever; não há checagem adicional para operações de escrita (grep -n 'has_role\|admin' → só l.141-153). Function na allowlist (deploy.yml:144).
- **Revisão:** sem contestação cética concluída.

### F2304 · Tokens Bitrix24 criptografados

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** bitrix24-oauth grava access_token em texto plano nas settings.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:130`
- **O que falta:** Migrar bitrix24_access_token/bitrix24_refresh_token para Supabase Vault (ou pgcrypto) e trocar o upsert/select direto por função SECURITY DEFINER que decripta só para o chamador autorizado.
- **Evidência:** supabase/functions/bitrix24-oauth/index.ts:159-172 e :283-290: access_token/refresh_token do Bitrix24 são gravados em texto plano em portfolio_settings.setting_value (upsert direto, sem pgcrypto/vault). bitrix24-sync/index.ts:116-122 lê setting_value em texto puro. Ausente: grep -rn "pgcrypto\|vault\." supabase/functions/bitrix24-oauth supabase/migrations| grep -i bitrix -> 0 resultados. \| CONTESTADO pelo cético (NAO_IMPLEMENTADO): A criptografia não existe em nenhum artefato. Não é um fio faltando, então PARCIAL superestima. (1) supabase/functions/bitrix24-oauth/index.ts:156-167 faz upsert de tokens.access_token e tokens.refresh_token direto em portfolio_settings.setting_value. (2) No banco real, setting_value é text puro (contexto/supabase/tables/public/portfolio_settings.md, coluna 3). A tabela só tem os triggers set_updated_at e update_portfolio_settings_updated_at (contexto/supaba…
- **Revisão:** em disputa. O cético propõe Não implementado e o juiz ainda não decidiu.

### F2305 · Validação robusta de entrada em todas as edge functions

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** Todas as funções Edge possuem camadas de validação e sanitização reforçada nos pontos de entrada.
- **Fontes:** `docs/reports/STRESS_TEST_REPORT.md:6-14`
- **O que falta:** Aplicar validação de schema no body das ~80 edge functions restantes que fazem req.json() sem validar.
- **Evidência:** grep -rln "req.json()" supabase/functions --include=index.ts| wc -l -> 110 funções leem body. Só ~18 usam alguma validação de schema: 7 importam zod (_shared/webhook-validator.ts, contracts.ts) e 11 importam _shared/validation.ts (semantic-search/index.ts, next-best-action/index.ts, etc). docs/reports/STRESS_TEST_REPORT.md:6 afirma 'Todas as funções Edge' possuem validação robusta, mas cobertura real é ~16% das que recebem body. \| cético: Contagem refeita: grep -rlE "req\.json\(\)\|request\.json\(\)" --include=index.ts supabase/functions → 110 functions leem body. Só 30 importam zod, _shared/validation.ts ou _shared/webhook-validator.ts (grep -rlE com esses imports → 30). O verificador contou ~18; a cobertura real é ~27%, não 16%, mas continua longe de 'todas' (docs/reports/STRESS_TEST_REPORT.md:6). Os helpers existem: supabase/functions/_shared/validation.ts e _shared/webhook-validato…

### F2306 · Verificação criptográfica de assinatura de provedores (Twilio, Meta/Evolution, Resend/Svix, SendGrid)

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** Padrão 'assinatura do provedor': verificação criptográfica no handler para webhooks Twilio, Meta/Evolution, Resend/Svix e SendGrid.
- **Fontes:** `docs/API.md:20-21`
- **O que falta:** Publicar twilio-call-status e twilio-call-twiml (abrindo vaga na allowlist de deploy.yml:144). Confirmar no painel os secrets de assinatura (Twilio, Svix, SendGrid, Meta).
- **Evidência:** Helper criptográfico completo existe: _shared/webhook-auth.ts:124 (Svix/Resend), :219 (Meta), :177-219 (Twilio HMAC), :298 (SendGrid ECDSA), usado por inbound-email-webhook e multichannel-status-webhook; receive-quote-sync/index.ts:35-150 tem HMAC próprio; twilio-call-status/index.ts:118-130 e twilio-call-twiml/index.ts:120-130 chamam verifyTwilioSignatureAny. Porém twilio-call-status e twilio-call-twiml NÃO estão na allowlist ACTIVE de .github/workflows/deploy.yml:144, e docs/prod-readiness.md:419-420 confirma 404 'NOT_FOUND' em produção para ambas (limite de 100 functions do plano) — a verificação Twilio de voz nunca executa em produção.| cético: Confirmado. twilio-call-status/index.ts:3 e :121-131 verifica com verifyTwilioSignatureAny e responde 401, mas twilio-call-status e twilio-call-twiml não estão no ACTIVE de .github/workflows/deploy.yml:144. Pela allowlist, só inbound-email-we…

### F3732 · Helper padrão requireAuth para edge functions

- **Tipo:** Service/lib
- **O que os docs afirmam:** Recomenda helper requireAuth(req) que valida Bearer token via supabase.auth.getUser e retorna 401, adotado por todas as edge functions.
- **Fontes:** `docs/reports/BACKEND_ANALYSIS_REPORT.md:146-157`
- **O que falta:** Adotar o helper (ou cron/internal-service-auth, quando cabível) nas cerca de 58 functions que ainda não usam getUserClient.
- **Evidência:** tests/e2e/helpers/auth.ts existe mas nenhum import encontrado (grep)| cético: A pré-checagem citou o artefato errado (tests/e2e/helpers/auth.ts). O helper real é getUserClient, em supabase/functions/_shared/auth-client.ts:34. Ele exige Bearer (:36-38), valida o token com client.auth.getUser (:55) e lança UnauthorizedError (:23, :58). Não está adotado por todas as functions: grep -rl getUserClient supabase/functions/*/index.ts \| wc -l → 113 de 171 pastas.

### F2308 · Retry em triggerRaceEvent, dispatch-webhook e winloss-webhook-dispatcher

- **Tipo:** Service/lib
- **O que os docs afirmam:** triggerRaceEvent (fire-and-forget), dispatch-webhook e winloss-webhook-dispatcher implementam retry.
- **Fontes:** `docs/reports/BACKEND_DEEP_AUDIT_2026-07-11.md:121-123`
- **O que falta:** Adicionar retry com backoff em dispatch-webhook e em triggerRaceEvent. Publicar winloss-webhook-dispatcher na allowlist de deploy.yml:144.
- **Evidência:** Só winloss-webhook-dispatcher tem retry real: retry.ts:4-5 define MAX_ATTEMPTS=3 com testes dedicados. dispatch-webhook/index.ts:1-273 NÃO tem retry: cada webhook é chamado uma única vez dentro de withEdgeCircuitBreaker (L180-199) e em falha só incrementa failure_count (L228-234) — grep "retry\|backoff" dispatch-webhook/index.ts -> 0 resultados. O artefato real de triggerRaceEvent é src/hooks/race/useRaceTrigger.ts:1-11 (não src/lib/race/triggerRaceEvent* como esperado) e é fire-and-forget puro: supabase.functions.invoke(...).catch(e => console.warn(...)), sem retry. Além disso winloss-webhook-dispatcher NÃO está na allowlist ACTIVE de deploy.yml:144 (só winloss-at-risk/winloss-pdf aparecem) — a única implementação real de retry não roda em produção.| cético: Confirmado. Só winloss-webhook-dispatcher/retry.ts:4 (MAX_ATTEMPTS=3), :81 (backoffDelay exponencial com jitter) e :125 (loop) tê…

## Não verificável (14)

### F2188 · ALERT_FROM_EMAIL como remetente; default onboarding@resend.dev só entrega à conta Resend

- **Tipo:** Doc/config
- **O que os docs afirmam:** Sem ALERT_FROM_EMAIL o código usa 'Alertas <onboarding@resend.dev>', que falha 403 para terceiros; obrigatório em produção.
- **Fontes:** `docs/runbooks/alertas-operacionais.md:13-17`
- **O que falta:** Confirmar no painel Supabase (Edge Functions → Secrets) ou via `supabase secrets list` que ALERT_FROM_EMAIL está definido com remetente do domínio verificado no Resend.
- **Evidência:** Código confirmado: supabase/functions/_shared/alert-escalation.ts:33 `Deno.env.get("ALERT_FROM_EMAIL") ?? "Alertas <onboarding@resend.dev>"`, comentário :11; docs/runbooks/alertas-operacionais.md:13-17 declara obrigatório. O secret em produção não aparece no snapshot (vault.md sem ALERT_FROM_EMAIL) e secrets de Edge Functions não estão acessíveis.
- **Revisão:** sem contestação cética concluída.

### F2199 · Credenciais Bitrix24 configuradas para o job bitrix24-sync-hourly (6× 500) — B18

- **Tipo:** Doc/config
- **O que os docs afirmam:** Job bitrix24-sync-hourly falha com "Bitrix24 credentials not configured".
- **Fontes:** `docs/prod-readiness.md:1026`
- **O que falta:** Rodar `SELECT status, error_message, created_at FROM bitrix24_sync_logs ORDER BY created_at DESC LIMIT 5` no banco oficial e confirmar os secrets BITRIX24_* no painel Supabase.
- **Evidência:** Cron existe: supabase/cron.md:37 job 48 `bitrix24-sync-hourly` `17 * * * *` → trigger_internal_edge_job('bitrix24-sync'); cron-runs.md:274-276 'succeeded 1 row' (só prova disparo do pg_cron, não o retorno da edge). bitrix24-sync na allowlist deploy.yml:144; credenciais são env BITRIX24_DOMAIN/CLIENT_ID/CLIENT_SECRET (supabase/functions/bitrix24-sync/index.ts:16-18) e o erro em :934. bitrix24_sync_logs ~720 linhas (stats.md:51) mas o snapshot não traz status das linhas; secrets de Edge Functions inacessíveis.
- **Revisão:** sem contestação cética concluída.

### F2208 · Secret de edge BITRIX24_CLIENT_ID

- **Tipo:** Doc/config
- **O que os docs afirmam:** Doc lista o secret `BITRIX24_CLIENT_ID` — Client ID do Bitrix24 — como configurado nas Edge Functions.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:1687-1698`
- **O que falta:** Listagem de Edge Function Secrets do projeto usyxfpqlsspldubptrdl (Management API/painel), indisponível nesta sessão.
- **Evidência:** `BITRIX24_CLIENT_ID` é lido em supabase/functions/bitrix24-oauth/index.ts:23 e supabase/functions/bitrix24-sync/index.ts:17; ambas as functions estão na allowlist ACTIVE de produção (.github/workflows/deploy.yml:144).| cético: Leitura confirmada em bitrix24-oauth/index.ts:22-24 e bitrix24-sync/index.ts:16-18 (ambas na allowlist). vault.md = '_nenhum_' e edge-functions.md/project-config.md do snapshot dizem 'Management API desabilitada' — o snapshot não lista Edge Function secrets. Indício indireto: portfolio_settings tem 0 linhas vivas (stats.md:154), ou seja, nenhum token OAuth persistido, mas isso não distingue secret ausente de OAuth nunca concluído.

### F2209 · Secret de edge BITRIX24_CLIENT_SECRET

- **Tipo:** Doc/config
- **O que os docs afirmam:** Doc lista o secret `BITRIX24_CLIENT_SECRET` — Client Secret do Bitrix24 — como configurado nas Edge Functions.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:1687-1698`
- **O que falta:** Listagem de Edge Function Secrets do projeto oficial, sem acesso nesta sessão.
- **Evidência:** `BITRIX24_CLIENT_SECRET` é lido em supabase/functions/bitrix24-oauth/index.ts:24 e supabase/functions/bitrix24-sync/index.ts:18; ambas na allowlist ACTIVE (.github/workflows/deploy.yml:144).| cético: bitrix24-oauth/index.ts:24 e bitrix24-sync/index.ts:18 leem o secret; snapshot sem listagem de secrets (vault.md '_nenhum_'; edge-functions.md 'Management API desabilitada').

### F2210 · Secret de edge BITRIX24_DOMAIN

- **Tipo:** Doc/config
- **O que os docs afirmam:** Doc lista o secret `BITRIX24_DOMAIN` — Domínio do Bitrix24 — como configurado nas Edge Functions.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:1687-1698`
- **O que falta:** Listagem de secrets ou leitura de bitrix24_sync_logs.status/error_message no banco oficial, sem acesso nesta sessão.
- **Evidência:** `BITRIX24_DOMAIN` é lido em supabase/functions/bitrix24-oauth/index.ts:22 e supabase/functions/bitrix24-sync/index.ts:16; ambas na allowlist ACTIVE (.github/workflows/deploy.yml:144). cron.md (snapshot real) linha 37 mostra o job `bitrix24-sync-hourly` disparando via pg_cron e cron-runs.md mostra 3 execuções "succeeded" em 2026-11-20 (00h/01h/02h17), mas essas execuções são apenas o disparo assíncrono (`trigger_internal_edge_job`), não prova de que a chamada HTTP real ao Bitrix24 teve sucesso.| cético: bitrix24-oauth/index.ts:22 e bitrix24-sync/index.ts:16 leem o secret; cron bitrix24-sync-hourly (cron.md:37) só registra o disparo (cron-runs.md:270-276, 0.01-0.07s). bitrix24_sync_logs ~720 linhas (stats.md:51), mas o catch em bitrix24-sync/index.ts:1113-1128 grava log de erro também quando faltam credenciais (linha 934), então o volume de logs não prova o secret.

### F2211 · Secret SLACK_WEBHOOK_URL configurado (72× 503 "SLACK_WEBHOOK_URL not configured") — B18

- **Tipo:** Doc/config
- **O que os docs afirmam:** Edges de alerta Slack retornam 503 por falta do segredo.
- **Fontes:** `docs/prod-readiness.md:1026`
- **O que falta:** Consulta a net._http_response/logs e à lista de secrets do projeto oficial; nenhuma ferramenta da sessão alcança esse projeto.
- **Evidência:** Código confirma o mecanismo descrito: supabase/functions/wal-health-alert/index.ts:110-116 e supabase/functions/webvitals-regression-alert/index.ts:227-233 retornam 503 com a mensagem literal "SLACK_WEBHOOK_URL not configured" quando o secret ausente — exatamente o padrão citado em docs/prod-readiness.md:1026. errors.md do snapshot de banco está vazio ("nenhum") e não há tabela net._http_response disponível nos snapshots coletados nem MCP apontando para o projeto oficial usyxfpqlsspldubptrdl.| cético: Mensagem 503 confirmada em wal-health-alert/index.ts:110-116 (na allowlist) e webvitals-regression-alert/index.ts:227-233 (FORA da allowlist ACTIVE, deploy.yml:144). net._http_response não consta no snapshot; errors.md vazio.

### F2214 · Segredo BITRIX24_CLIENT_ID/SECRET/DOMAIN lido por 2 edge function(s)

- **Tipo:** Doc/config
- **O que os docs afirmam:** OAuth Bitrix24. Doc extrai via grep de Deno.env.get; não verifica se o segredo está configurado no projeto.
- **Fontes:** `docs/estado/10_EDGE_FUNCTIONS.md:125-139`
- **O que falta:** Listagem de secrets e logs de execução (bitrix24_sync_logs.error_message) do projeto oficial.
- **Evidência:** Confirmado: exatamente 2 edge functions leem BITRIX24_CLIENT_ID/SECRET/DOMAIN — bitrix24-oauth/index.ts:22-24 e bitrix24-sync/index.ts:16-18 (grep -rln sobre supabase/functions/*/index.ts), batendo com a contagem do doc.| cético: Exatamente 2 leitores (bitrix24-oauth/index.ts:22-24, bitrix24-sync/index.ts:16-18), ambos deployados. 'Executa sem erro' não comprovável: portfolio_settings tem 0 linhas (stats.md:154), e bitrix24-sync lança 'No valid access token available' sem token (index.ts:200), o que sugere falha de execução, mas sem acesso aos logs/secrets não é possível atribuir a causa ao secret.

### F2215 · Segredo EXTERNAL_SUPABASE_URL/ANON_KEY lido por 2 edge function(s)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Ponte para banco externo. Doc extrai via grep de Deno.env.get; não verifica se o segredo está configurado no projeto.
- **Fontes:** `docs/estado/10_EDGE_FUNCTIONS.md:125-143`
- **O que falta:** Listagem de secrets do projeto oficial; na prática só external-db-bridge usa o secret em produção.
- **Evidência:** Confirmado: exatamente 2 edge functions leem EXTERNAL_SUPABASE_URL/EXTERNAL_SUPABASE_ANON_KEY — supabase/functions/external-db-bridge/index.ts e supabase/functions/test-integration-connection/index.ts. `external-db-bridge` está na allowlist ACTIVE (.github/workflows/deploy.yml:144); `test-integration-connection` NÃO está (não roda em produção).| cético: grep -rln 'EXTERNAL_SUPABASE_URL\|EXTERNAL_SUPABASE_ANON_KEY' supabase/functions → external-db-bridge (na allowlist) e test-integration-connection (FORA da allowlist, deploy.yml:144).

### F2216 · Segredo QUOTE_SYNC_WEBHOOK_SECRET, PROMOGIFTS_WEBHOOK_SECRET, QUOTE_SYNC_API_KEY lido por 3 edge function(s)

- **Tipo:** Doc/config
- **O que os docs afirmam:** HMAC/API key de webhook. Doc extrai via grep de Deno.env.get; não verifica se o segredo está configurado no projeto.
- **Fontes:** `docs/estado/10_EDGE_FUNCTIONS.md:125-140`
- **O que falta:** Listagem de secrets do projeto oficial; contagem do doc (3) defasada; QUOTE_SYNC_API_KEY só é lido por function não deployada.
- **Evidência:** Encontrados apenas 2 arquivos (não 3) lendo esses segredos: supabase/functions/receive-quote-sync/index.ts (QUOTE_SYNC_WEBHOOK_SECRET:131 e PROMOGIFTS_WEBHOOK_SECRET:275) e supabase/functions/receive-quote-webhook/index.ts (QUOTE_SYNC_API_KEY:9). Ambas estão na allowlist, exceto receive-quote-webhook que NÃO está na ACTIVE (.github/workflows/deploy.yml:144 não contém "receive-quote-webhook").| cético: grep -rln 'QUOTE_SYNC_WEBHOOK_SECRET\|PROMOGIFTS_WEBHOOK_SECRET\|QUOTE_SYNC_API_KEY' supabase/functions → 2 arquivos (receive-quote-sync na allowlist; receive-quote-webhook FORA), não 3.

### F2217 · Segredo SLACK_WEBHOOK_URL / SLACK_DIGEST_WEBHOOK_URL lido por 3 edge function(s)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Alertas. Doc extrai via grep de Deno.env.get; não verifica se o segredo está configurado no projeto.
- **Fontes:** `docs/estado/10_EDGE_FUNCTIONS.md:125-137`
- **O que falta:** Listagem de secrets do projeto oficial; contagem do doc (3) defasada.
- **Evidência:** Encontradas 5 edge functions (não 3) lendo SLACK_WEBHOOK_URL/SLACK_DIGEST_WEBHOOK_URL: deal-risk-digest, edge-retry-threshold-alert, notify-quote-conversion, wal-health-alert, webvitals-regression-alert (grep -rln em supabase/functions/*/index.ts).| cético: grep -rln 'SLACK_WEBHOOK_URL\|SLACK_DIGEST_WEBHOOK_URL' supabase/functions → 5 functions (wal-health-alert, deal-risk-digest, notify-quote-conversion, edge-retry-threshold-alert na allowlist; webvitals-regression-alert FORA) + _shared/alert-escalation.ts.

### F2218 · Segredo V4_CALLBACK_API_KEY, V4_CALLBACK_URL lido por 1 edge function(s)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Callback V4. Doc extrai via grep de Deno.env.get; não verifica se o segredo está configurado no projeto.
- **Fontes:** `docs/estado/10_EDGE_FUNCTIONS.md:125-141`
- **O que falta:** Listagem de secrets e logs (evento v4_callback_disabled) do projeto oficial.
- **Evidência:** Confirmado: exatamente 1 edge function lê V4_CALLBACK_API_KEY e V4_CALLBACK_URL — supabase/functions/notify-v4-quote-status/index.ts:8-9, na allowlist ACTIVE (.github/workflows/deploy.yml:144), batendo com a contagem do doc.| cético: 1 leitor: notify-v4-quote-status/index.ts:8-9 (deployada, cron.md:26). Sem acesso a secrets/logs; v4_callback_dead_letters tem 2 linhas (stats.md:101), o que não comprova sucesso nem falha do callback.

### F2226 · Auto-sync N8N do grafo graphify em até 15 min

- **Tipo:** Integração externa
- **O que os docs afirmam:** Divergência entre HEAD e "Built from commit" é corrigida por automação N8N.
- **Fontes:** `docs/agentes/contexto-gerado.md:23`
- **O que falta:** Confirmar o funcionamento (e o SLA de 15 min) exige acesso ao painel/dashboard da instância N8N, que não está disponível nesta sessão nem documentado como arquivo versionado no repo.
- **Evidência:** `.github/workflows/graphify.yml` existe mas é um workflow de CI para 'Graphify Foundation' (src/lib/revenueForecast, tools/graphify) sem qualquer menção a N8N (grep -rn "n8n" nesse arquivo e em docs/agentes/contexto-gerado.md sem resultado). A automação "auto-sync N8N" descrita em docs/agentes/contexto-gerado.md:23 roda numa instância externa de N8N, fora do repositório.| CONTESTADO pelo cético (PARCIAL): O resultado observável falha no repo: graphify-out/GRAPH_REPORT.md é versionado (git ls-files graphify-out → GRAPH_REPORT.md, manifest.json; git check-ignore sem saída) e diz 'Built from commit: 02a29b65' (linha 17), enquanto HEAD = 90170947d (20/11/2026). 02a29b65 nem existe no histórico (git log 02a29b65 → unknown revision; repo não é shallow), e o último commit que tocou o arquivo é 1e3a191b2 de 27/10/2026, cerca de 24 dias antes do HEAD. Nenhum artefato N8N de sync do grafo no repo…
- **Revisão:** em disputa. O cético propõe Parcial e o juiz ainda não decidiu.

### F2234 · Credenciais Evolution/N8N/VAPID configuradas

- **Tipo:** Integração externa
- **O que os docs afirmam:** LEDGER bloqueado no dono.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/LEDGER_EXECUCAO_2026-10-14.md:26`
- **O que falta:** Verificar presença dos secrets em Supabase → Edge Functions → Secrets (acesso de painel que não tenho). Indício: prod-readiness.md:866 marca push-subscribe/send-push-notification (VAPID) como indisponíveis.
- **Evidência:** Código lê as envs: Deno.env.get('EVOLUTION_API_KEY'\|'EVOLUTION_API_URL'\|'EVOLUTION_INSTANCE'), 'VAPID_PUBLIC_KEY'/'VAPID_PRIVATE_KEY'/'VAPID_SUBJECT' (grep em supabase/functions) e 'N8N_API_KEY' (supabase/functions/test-integration-connection/index.ts:34). Snapshot supabase/vault.md: '_nenhum_'. Doc LEDGER_EXECUCAO_2026-10-14.md:26 lista como bloqueado no dono.
- **Revisão:** sem contestação cética concluída.

### F2244 · Gateway MCP de SQL supabase-promo-champions-v2-mcp.adm01.workers.dev com health endpoint

- **Tipo:** Integração externa
- **O que os docs afirmam:** Gateway Cloudflare Worker para db_query; rótulo "LOVABLE CLOUD" mas aponta para o banco oficial.
- **Fontes:** `docs/agentes/banco-e-mcp.md:12,15-17`
- **O que falta:** Rodar o GET /health do gateway de um ambiente com saída para adm01.workers.dev (ou pelo conector MCP correto) e confirmar project=usyxfpqlsspldubptrdl.
- **Evidência:** curl https://supabase-promo-champions-v2-mcp.adm01.workers.dev/health → 'CONNECT tunnel failed, response 403' (proxy da sessão bloqueia o host). Doc docs/agentes/banco-e-mcp.md:12-17 e prova histórica docs/estado/IDENTIDADE_BANCO_2026-09-13.md:20-21 ({"ok":true,"project":"https://usyxfpqlsspldubptrdl.supabase.co"}). O conector MCP disponível nesta sessão ('SUPABASE - ZAPP WEB V2') é outro projeto, não serve de prova.
- **Revisão:** sem contestação cética concluída.
