# Funcionalidades planejadas e não executadas — Auditoria exaustiva (2026-10-12)

> **Base:** `main` @ `6f6b94a` (2026-10-11), com 644 migrations, 172 edge functions, 175 rotas, cerca de 2.000 arquivos de frontend, 16 workflows de CI e 55 docs na raiz de `docs/`.
> **Método:** sete varreduras independentes (anexos A a G). Cada uma levantou o que foi **prometido** (planos, docs de funcionalidades, docs de estado, ADRs, runbooks, CLAUDE.md, comentários e schema) e conferiu **no código**: rota, componente, hook, edge function, migration, cron e workflow. Os achados críticos foram reconferidos à mão na consolidação (lista ao final da §1).
> **Limites (leia antes de agir):**
> - **O banco de produção `usyxfpqlsspldubptrdl` não foi consultado.** O conector MCP do projeto não estava disponível na sessão. Tudo o que depende de estado vivo (chaves em `_internal_secrets`, crons ativos, quais functions estão deployadas, quais migrations foram aplicadas) aparece como **NÃO VERIFICADO**.
> - "Sem cron" significa que **nenhuma migration agenda o job**. Um cron criado à mão direto no banco não aparece aqui.
> - O GitHub e a Vercel foram consultados só para leitura (runs, secrets por nome, ruleset, visibilidade). Os valores de secrets não foram lidos.
> - Lint, vitest e tsc **não** foram reexecutados nesta auditoria. Os números de cobertura e baseline vêm dos arquivos versionados.

Legenda de estado:
- **NÃO INICIADO:** nada no código.
- **PARCIAL:** existe uma parte, mas o fluxo não fecha de ponta a ponta.
- **DIVERGENTE:** o doc ou a tela diz que está pronto e o código mostra que não está.
- **NÃO VERIFICADO:** depende do estado do banco ou de um painel.

---

## Sumário

1. [Veredito em uma página](#1-veredito-em-uma-página)
2. [Números consolidados](#2-números-consolidados)
3. [Top 25 por impacto no negócio](#3-top-25-por-impacto-no-negócio)
4. [Mapa por domínio — tudo o que não foi executado](#4-mapa-por-domínio)
5. [Causas-raiz transversais](#5-causas-raiz-transversais)
6. [Documentos que afirmam o que o código não faz](#6-documentos-que-afirmam-o-que-o-código-não-faz)
7. [Plano de fechamento sugerido (ondas)](#7-plano-de-fechamento-sugerido)
8. [Anexos detalhados (A–G)](#8-anexos)

---

## 1. Veredito em uma página

O sistema tem **muito código pronto e pouca coisa ligada de ponta a ponta**. O padrão que se repete em todas as camadas é este: a peça existe (tela, edge function, tabela), mas **falta o fio que conecta** (cron, chamador, envio real, dado real). O resultado são telas que **parecem funcionar e não funcionam**.

1. **A automação de backend está parada ou não existe.** Vários casos se somam:
   - Os jobs agendados que chamam edge functions dependem de duas chaves (`functions_base_url`, `anon_key` em `_internal_secrets`) que nenhuma migration cria. O próprio repo registra que elas não existiam em 13/09.
   - Cadências, sequências, envio em horário ótimo, expiração de cotação, SLA de lead, alertas de SDR, relatórios agendados, QBR, renovação e snapshots de forecast **não têm agendamento nenhum**.
   - A tela `AdminSystemStatus` mostra horários de execução que não existem.
2. **Várias ações de venda dizem que fizeram e não fizeram:**
   - O "Enviar" da cotação só muda o status.
   - O WhatsApp em /vendas grava "enviado" sem enviar.
   - O "Enviar agora" do e-mail com IA só mostra um aviso na tela.
   - O e-mail em massa e o alerta de churn por e-mail dependem de uma função de banco que não existe.
   - O push nunca é entregue.
   - A pesquisa de CSAT não é enviada.
   - Os relatórios agendados não chegam a ninguém.
3. **Telas gerenciais mostram números inventados ou errados:**
   - O BI Closer e o BI SDR usam componentes de fachada.
   - O velocímetro do dashboard usa número aleatório.
   - O dashboard SDR e a página `/inteligencia` são maquete.
   - As metas são inventadas ("fechado × 1,2 ou R$ 50 mil").
   - O "+15,5%" de crescimento está fixo no banco.
   - O ranking competitivo põe todos em 1º.
   - O forecast conta venda ganha como pipeline aberto.
   - A acurácia de forecast mostra "0,0% Excelente" com a tabela vazia.
4. **A base operacional não tem rede de segurança:**
   - O backup falha todos os dias.
   - Não existe staging, e testes e previews gravam no banco de produção.
   - O repositório está **público** e contém dados pessoais.
   - Há 172 functions para um limite de 100 deployadas, sem lista do que está no ar.
   - Não está definido qual é o frontend de produção (Vercel ou Lovable).
5. **Integrações estão pela metade:**
   - Bitrix24 sem renovação de token e sem agendamento.
   - WhatsApp sem a Evolution citada no CLAUDE.md e sem receber as respostas dos clientes.
   - N8N nunca é chamado pelo CRM.
   - Helpdesk joga todos os tickets na primeira conta.
   - Webhooks de saída sem nenhum evento real.
6. **Compliance e segurança:**
   - Gravação de ligação sem checar consentimento.
   - LGPD existe só no banco, sem tela.
   - Tokens de Twilio, Meta, Bitrix e N8N guardados em texto puro.
   - Ponte para banco externo sem checagem de papel.
   - Registro de tentativas de login morto por regressão.

**Reconferido à mão na consolidação:** todos os itens abaixo se confirmaram.
- `QuoteCard.tsx:113-120`: o "Enviar" só muda o status.
- `useWhatsApp.ts:11`: comentário "simulated", insere `status: 'sent'`.
- `bi/index.tsx:17-40`: os stubs.
- `Speedometer.tsx:288`: o `Math.random`.
- `useFeatureFlags.ts:71-75`: o papel é ignorado.
- `enrich-lead/index.ts:35-47`: sempre 503.
- `inbound-email-webhook/index.ts:159`: a RPC movida para `private` na migration `20260619143950`.
- `login_attempts`: o insert foi revogado em `20260831130000:116-128`, enquanto `useSecurityMonitoring.ts:58` ainda insere.
- `useQuickAction.ts:15,20`: chama functions inexistentes.
- A visibilidade `public` do repositório (API do GitHub, 2026-10-12).

---

## 2. Números consolidados

| Fatia (anexo) | Universo analisado | Não executado / parcial / divergente | Destaques numéricos |
|---|---|---|---|
| **A — Planos de execução** | 15 documentos de plano e execução, **552 itens** (dois planos de 100 etapas, plano mestre de 50, RELATORIO_FALHAS, handoff, reconciliações, validações, plano graphify) | **202 P + 160 NI + 4 D** (186 C = 34%) | Os dois planos de 100 etapas estão em **11% e 17%** de conclusão |
| **B — Docs de funcionalidades** | FUNCIONALIDADES_*, GAPS_CLASSE_MUNDIAL, FEATURE_SUMMARY, benchmark Ramper, ADRs, LGPD, TECH/TYPE_DEBT | **118 itens**: 52 P, 35 NI, 31 D (cerca de 62 completos) | 19 rotas citadas em docs não existem |
| **C — Docs de estado e runbooks** | `docs/estado/*`, runbooks, postmortem, RLS_MATRIX, SEC-08, ARCHITECTURE, API | **304 itens**: 117 NI, 56 P, 40 D, 29 não verificáveis (54 resolvidos) | 20 de 20 rotas seguem sem link; 14 edge functions sem chamador |
| **D — Frontend** | 2.022 arquivos e 175 rotas | 38 telas com dado fixo ou fictício; cerca de 55 botões mortos em 30 telas; 16 ações que só mostram toast; 16 grupos de feature órfãos; 14 rotas sem link; 5 links quebrados | **148 arquivos mortos (cerca de 19 mil linhas)**; 264 exports nunca importados |
| **E — Edge functions** | 172 functions | 23 PARCIAL, 15 ÓRFÃ, 5 QUEBRADA, 2 STUB, 3 mistas (124 REAL) | 46 dependem de `LOVABLE_API_KEY`; 2 invocações para functions inexistentes; 6 pares duplicados vivos |
| **F — Banco** | 400 tabelas, 345 funções, 30 crons | **36 tabelas abandonadas**; **90 funções nunca chamadas**; cerca de 20 jobs sem cron; 98 colunas fantasma | 146 tabelas sem `updated_at`; 77 colunas de dinheiro fora de `NUMERIC(15,2)` |
| **G — Infra, CI, testes e integrações** | 16 workflows, 48 specs E2E, 11 integrações, deploy | 5 workflows vermelhos todos os dias; backup 100% falhando; 0 releases; deploy.yml nunca rodou | Cobertura de **3,99%** de linhas; 142 de 172 functions sem teste; 45 de 406 tabelas com teste SQL |

---

## 3. Top 25 por impacto no negócio

Ordenado pelo efeito sobre **receita, confiança no número e risco**.

Esforço estimado:
- **P**: até 1 dia.
- **M**: 2 a 5 dias.
- **G**: mais de 1 semana.

| # | Problema (efeito no negócio) | Estado | Evidência principal | O que falta | Esforço | Anexos |
|---|---|---|---|---|---|---|
| 1 | **Toda automação agendada que chama edge function pode estar parada.** Isso inclui o alerta de falha de cron, o broadcast de venda, o retry de e-mail, a ingestão de gravações e o callback V4 | DIVERGENTE / NÃO VERIFICADO | `trigger_internal_edge_job` (mig `20261002010000:14-70`) lê `_internal_secrets.functions_base_url`/`anon_key` e lança `*_secrets_missing`; nenhuma migration grava as chaves; `IDENTIDADE_BANCO_2026-09-13.md:93-97` registra que estão ausentes | Gravar as chaves no banco oficial e conferir `cron.job_run_details` | P | C, E, F, G |
| 2 | **Cadências e sequências não andam sozinhas.** A prospecção SDR depende de alguém clicar | NÃO INICIADO (cron) + QUEBRADO | `sequence-runner`, `process-cadence-tasks` e `process-scheduled-sends` sem `cron.schedule`; `process-cadence-tasks` só roda no `useEffect` de `Cadencias.tsx:69-73`; um contato `contact_type='lead'` consulta a tabela `leads`, que não existe, e aborta o lote (`sequence-runner/index.ts:280,366`) | Cron; mapear "lead" para `sales`/`clients`; religar o reply | M | B, E, F |
| 3 | **A pausa automática da cadência quando o cliente responde ou o e-mail volta está quebrada**, e a promoção do vencedor A/B também | QUEBRADO | `auto_pause_enrollment` e `auto_promote_sequence_winners` foram movidas para o schema `private` (mig `20260619143950`), mas são chamadas via `.rpc()` em `inbound-email-webhook/index.ts:159` e `sequence-ab-promote/index.ts:42`; `sequence-record-reply` não tem chamador | Wrapper `public` com grant para `service_role`, ou ajustar a chamada | P | E, F |
| 4 | **A cotação não chega ao cliente pelo sistema e nunca expira** | DIVERGENTE | "Enviar" em `QuoteCard.tsx:113-120` só faz `onUpdateStatus('sent')`; `send-quote-to-client` não tem chamador; `check-quote-expiration` e `check_quote_expirations` nunca foram agendadas | Ligar o botão à edge e agendar a expiração | M | D, E, F |
| 5 | **Mensagens que fingem ter sido enviadas.** O vendedor acha que o cliente recebeu | DIVERGENTE | WhatsApp em `/vendas` (`useWhatsApp.ts:11`, "simulated"); "Enviar agora" do e-mail IA (`AIEmailDialog.tsx:108`, só toast); Client 360 (follow-up, oportunidade, lembrete e sync ERP só com toast) | Ligar a `send-multichannel-message` / `send-transactional-email`, ou desabilitar com aviso honesto | M | D |
| 6 | **E-mail em massa e alerta de churn por e-mail nunca saem** | QUEBRADO | A RPC `enqueue_email` não existe em migration nem em `types.ts` (`email-bulk-send/index.ts:128,148`; `email-bulk-retry/index.ts:193`; `send-churn-alert-email/index.ts:117-129`); o retry está agendado a cada 15 min contra uma RPC inexistente | Trocar por `send-transactional-email` (Resend) ou criar a fila | M | E, F, G |
| 7 | **Painéis gerenciais com números inventados.** Decisão de diretoria tomada sobre dado falso | DIVERGENTE | Stubs no BI Closer/SDR (`components/bi/index.tsx:17-40`); velocímetro com `Math.random` (`Speedometer.tsx:288`); metas inventadas em `revenue-intelligence/index.ts:58` (`max(fechado×1,2; 50.000)`), `revops-hub/index.ts:113` e `analyze-pipeline-coverage`; `growth_rate` fixo em 15.5 (mig `20260524194411:48`); dashboard SDR e `/inteligencia` como maquete | Ler `sales_goals`/`salespeople.monthly_goal`; remover stubs e mocks ou trocar por estado vazio honesto | G | C, D, E, F |
| 8 | **Os KPIs de receita estão errados na raiz** | NÃO INICIADO | `mv_competitive_ranking` só conta `status='completed'`, então todos ficam em 1º (mig `20260517113746:9`); `revenue_forecast_view` conta `won` como pipeline e zera cenários com NULL (mig `20260715184427:23`); `deal_stage_history` está vazia e alimenta 10 hooks e 6 functions (funil, tempo de fechamento, SLA, baselines); acurácia mostra "MAPE 0,0% Excelente" sem dados (`useForecastAccuracy.ts:81-104`) | Corrigir views e MVs, popular o histórico de estágio por trigger, tratar o caso vazio | G | C, F |
| 9 | **Não existe backup que funcione** e o DR nunca foi testado | DIVERGENTE | `db-backup.yml` com 6 de 6 runs falhando (secret aponta para outro project ref e para host IPv6); upload off-site comentado (`db-backup.yml:74-80`); DR afirma PITR, mas o SIZING indica plano Free; restore trimestral "pendente" | Secret com pooler IPv4 do projeto oficial, off-site criptografado, teste de restore | M | G |
| 10 | **Repositório público com dados pessoais e artefatos de produção** | DIVERGENTE | API do GitHub: `visibility: public` (o `CHANGELOG.md:6` diz que foi tornado privado); nomes e e-mails reais em `scripts/seed-real-people.ts`; relatórios Playwright e HAR com dados de produção como artifact por 30 dias; quando o backup funcionar, o dump do banco também fica baixável | Tornar privado; limpar a PII; não publicar dump como artifact | P | G |
| 11 | **Testes e previews gravam no banco de produção; não há staging** | NÃO INICIADO | E2E, quote-to-sale e invariantes gravam vendas reais (`pr-checks.yml:422-509`, `quote-to-sale-e2e.yml`); `env.ts:4-12` cai no default de produção sem env; `docs/STAGING.md` contradiz | Projeto de staging ou banco efêmero no CI; env de Preview na Vercel | G | G |
| 12 | **Deploy às cegas.** 172 functions para um limite de 100, sem manifesto; `deploy.yml` nunca rodou e, se rodasse, faria `db push`, que é proibido; frontend de produção indefinido | DIVERGENTE | `deploy.yml:122-144`; release-please falha em todo push (0 tags); Vercel com SSO e sem domínio custom, Node 24 contra 22 no CI; docs mandam "Publish" no Lovable; sem `vercel.json` (sem rewrites de SPA nem headers de segurança) | Manifesto das 100 functions; decidir Vercel ou Lovable; `vercel.json`; corrigir o pipeline | M | B, E, G |
| 13 | **Todo o pilar de IA depende do gateway da Lovable** (46 functions) | NÃO VERIFICADO | `_shared/ai-gateway.ts:4-9`; o projeto saiu do Lovable Cloud; sem `LOVABLE_API_KEY`, coaching, forecast narrativo, NBA, copiloto, transcrição e busca semântica param ou devolvem vazio | Confirmar o secret no projeto oficial ou apontar `LOVABLE_AI_GATEWAY_URL` para outro gateway | P (checar) / M (migrar) | E |
| 14 | **Alertas e rotinas "agendadas" que só rodam no botão "testar"**, com tela mostrando horários falsos | DIVERGENTE | `check-lead-sla`, `sdr-consecutive-alerts`, `activity-goal-alerts`, `challenge-expiration-alerts`, `send-alert-notifications`, `auto-reassign-inactive`, `bitrix24-sync`, `helpdesk-sync`, `scheduled-reports-runner`, `qbr-scheduler`, `renewal-automation`, `snapshot-forecast`, `rotate-daily-challenges`; `AdminSystemStatus.tsx:29-36` mostra "8h diário", "Horário" | `cron.schedule` para cada uma (depende do item 1) e corrigir a tela | M | B, E, F |
| 15 | **WhatsApp e multicanal não fecham o ciclo** | DIVERGENTE | A Evolution API citada no CLAUDE.md §5 não existe no código; MessageBird aparece na UI, mas o envio responde `provider_not_supported` (`send-multichannel-message/index.ts:306`); respostas recebidas não são ingeridas; callbacks Twilio de tenant falham na assinatura; não há retry | Decidir o provedor (Evolution `wpp2` já roda na VPS), ingerir inbound e reprocessar falhas | G | B, G |
| 16 | **Bitrix24 não sincroniza sozinho** | DIVERGENTE | Callback OAuth sem `verify_jwt=false` no `config.toml` (tende a dar 401); sem refresh automático de token (expira em cerca de 1h; `bitrix24-sync/index.ts:78-99`); sem cron; tokens em texto puro | `config.toml`, refresh, cron, vault | M | B, G |
| 17 | **Compliance LGPD só no papel** | NÃO INICIADO | Gravação Twilio sem checar consentimento (`twilio-call-twiml/index.ts:122`); `data_subject_requests`, `anonymize_data_subject`, `has_active_consent` e `is_email_opted_out` sem nenhum chamador; WhatsApp/SMS sem opt-out | Checar consentimento antes de gravar e enviar; fila de titular no admin | M | B, F |
| 18 | **Credenciais e acessos frouxos** | PARCIAL | Tokens Twilio e Meta em texto puro legíveis por qualquer manager (mig `20260417112931:19-21`); `external-db-bridge` sem checagem de papel e com `rpc` livre (`index.ts:233-238,278-288`); WebAuthn aceita RP ID vindo do cliente; `run-retry-tests` sem auth e `stress-test-contracts` expostos em produção | Vault/`secret_refs`, checagem de papel, allowlist, restringir as ferramentas de teste | M | E, G |
| 19 | **Registro de tentativas de login morto** (perde detecção de força bruta) | DIVERGENTE | Insert revogado em `20260831130000:116-128`; `useSecurityMonitoring.ts:58` ainda insere direto | Usar a RPC de pré-login criada na mesma migration | P | C |
| 20 | **Botões do Pipeline Pulse que sempre falham** e baseline de velocidade quebrada com toast de sucesso | QUEBRADO | `useQuickAction.ts:15,20` chama `deal-health-scorer` e `smart-lead-router`, que não existem; `refresh-stage-baselines` faz upsert sem constraint compatível (`index.ts:117-121`), e a UI mostra "Baselines atualizadas" | Apontar para `calculate-deal-health`; unificar com `recompute-stage-baselines` | P | E |
| 21 | **Funcionalidades prontas e escondidas.** Investimento parado | PARCIAL | Gravação de chamadas (upload, transcrição, diarização) só em `ConversationalIntelligence.tsx`, sem rota; 17 componentes de deal health, comitê de compra e velocity nunca montados; painéis de segurança (bloqueio de IP, rate limit, reautenticação, dispositivos, RoleManager) sem uso; login com passkey não aparece em `Auth.tsx` | Rotear e montar, ou remover | M | D, G |
| 22 | **Números diferentes para a mesma coisa** | PARCIAL | Duas calibrações de win-probability na mesma tela; dois forecasts (`generate-revenue-forecast` e `revenue-forecast-ai`); dois motores de workflow; dois de cadência; duas extrações de stakeholders; quatro definições de "deal em risco" | Escolher uma fonte por métrica | G | E |
| 23 | **CNPJ alfanumérico (2026) rejeitado** e assinatura digital sem provedor | NÃO INICIADO | `brDocuments.ts:110`; envio e confirmação de assinatura bloqueados (`useDigitalSignatures.ts:123-146`) | Validador novo; contratar provedor de assinatura | P / M | D |
| 24 | **Gamificação depende do navegador** | PARCIAL | `process-race-event` só é chamada pela UI ao criar venda (venda do Bitrix, V4 ou import não pontua); diff de placar sempre vazio (`process-race-event/index.ts:61-90`); desafios não giram; roleta e XP desligados (mig `20260814190000`); matchmaking fora do restore | Trigger SQL em `sales`; cron diário; reativar | M | C, E, F |
| 25 | **A CI não protege e ninguém fica sabendo quando quebra** | PARCIAL | 5 workflows vermelhos todo dia (release-please, db-backup, cron-monitoring, dependabot-automerge, pr-review-sla); `SLACK_CI_WEBHOOK_URL` não existe; o CI Gate cobre 3 jobs e aceita job cancelado; credenciais de CI inválidas desligam suítes live; 8 testes de autorização se auto-pulam; cobertura de 3,99% | Canal de alerta (N8N para WhatsApp), gate completo, conta E2E sem privilégio | M | G |

### 3.1 Itens de alto impacto que vêm dos planos não executados (Anexo A)

Estes itens não aparecem nas fatias B a G porque nasceram em auditorias e planos anteriores que ficaram sem execução. A tabela usa os mesmos critérios de esforço do top 25.

| # | Problema (efeito no negócio) | Estado | Evidência principal | O que falta | Esforço |
|---|---|---|---|---|---|
| A1 | **Cálculo de comissão errado:** ignora faixa e categoria, a regra global sobrepõe a específica, gera comissão duplicada e paga o SDR em dobro | NÃO INICIADO | `private.handle_sale_commissions` (mig `20260619145322:138-197`) sem redefinição posterior; RELATORIO_FALHAS L684/690/695/733 | Reescrever a regra com testes de mesa usando casos reais da folha de comissão | M |
| A2 | **Nenhuma rotação de credencial foi executada**, e a service_role antiga está no histórico Git de um repositório **público** | NÃO INICIADO | `docs/SECRETS_ROTATION.md:128`; STATUS §3.2 | Rotacionar as chaves do projeto antigo e do oficial e registrar | P |
| A3 | **Relatórios agendados sem filtro de dono e export win-loss sem escopo:** um usuário pode receber dado de vendas de outro | NÃO INICIADO / PARCIAL | `scheduled-reports-runner/index.ts:37-50`; `export-winloss-pdf/index.ts:22` | Aplicar o escopo do dono e do papel no runner e no export | P |
| A4 | **PDFs de orçamento em bucket público:** as propostas comerciais ficam acessíveis por URL | NÃO INICIADO | `receive-quote-webhook/index.ts:253` (`getPublicUrl`) | Bucket privado e URL assinada com expiração | P |
| A5 | **Prompt injection nos assistentes de IA** (chat de vendas, copiloto, orquestrador) | NÃO INICIADO / PARCIAL | `sales-assistant-chat/index.ts:372-375`; `ai-copilot/index.ts:192-202` | Separar instrução de dado, fazer allowlist de ferramentas e confirmar ações | M |
| A6 | **Gamificação manipulável:** power-ups inseríveis pelo cliente, dupla coleta, XP gravado pelo front, roleta anuncia prêmio sem conceder | NÃO INICIADO | mig `20260418104126:72-74`; `collect-race-powerup/index.ts:109-112`; mig `20260830000001:137-145` | Mover as regras para o servidor com idempotência | M |
| A7 | **CS-360 usa `orders.user_id` como `account_id`**, o que mostra o cliente errado no painel | NÃO INICIADO | `customer-success-360/index.ts:73-76` | Corrigir o join | P |
| A8 | **Sessão exposta a XSS:** CORS cai para `*`, a sessão fica em `localStorage` e a CSP tem `unsafe-eval` | PARCIAL | `_shared/cors.ts:7`; `client.ts:11`; `index.html:56` | Allowlist de origem, headers no host e remoção de `unsafe-eval` | M |
| A9 | **Ledger de produção não reconciliado:** o próximo `db push` pode reaplicar ou falhar, e não há replay em banco limpo | NÃO INICIADO | `MIGRATION_RENAME_MAP` §4-9; `20260903000002` nunca aplicada (IDENTIDADE §3) | Reconciliar `schema_migrations` e fazer replay num banco efêmero | M |

> Um achado do Anexo A (policies de webhooks que decidem admin por `raw_user_meta_data`) foi **rebaixado para NÃO VERIFICADO** na consolidação. A migration `20260416180740` recria `public.webhooks` sem `IF NOT EXISTS`, o que indica que a de janeiro não foi aplicada. Confirmar em `pg_policies`.

---

## 4. Mapa por domínio

Lista do que **não foi executado** ou **está parcial**, agrupada por área do negócio. O detalhe linha a linha está nos anexos indicados.

### 4.1 Pipeline, contas e negócios (CRM core)
- **Pipeline Pulse:** 2 de 4 ações rápidas chamam functions inexistentes. [E §4]
- **Velocidade por estágio:** `refresh-stage-baselines` está quebrada e duplica `recompute-stage-baselines`; `deal_stage_history` vazia alimenta funil, tempo de fechamento e SLA. [C, E §2.2]
- **Deal health, comitê de compra e velocity:** 17 componentes construídos e nunca montados; `predict-deal-velocity` sem tela. [D]
- **Regras de território:** o seletor de vendedor consulta `auth_users_view`, que não existe (`FollowUpTerritoryRules.tsx:61,83`); o mapa de territórios não tem editor de polígonos. [B, D]
- **Transferência de leads em massa**, gerenciador de filtros salvos, editor de campos customizados, lixeira de soft delete (as RPCs existem e têm 0 usos na UI), histórico de campos (`entity_versions` sem leitor). [B]
- **Ainda não iniciados (gaps "classe mundial"):** @mentions (componente pronto com 0 consumidores), threads, deal rooms, co-selling com split de comissão, custom objects, validation rules, CPQ e regras de preço, multimoeda, i18n e app mobile/offline. [B]
- **Constante de pipeline divergente:** `DEFAULT_PIPELINE_ID` diverge entre repo e produção. [C]
- **Roteamento de leads:** o sorteio é feito no cliente; o "round robin" de `auto-reassign-inactive` é na verdade sorteio (`index.ts:250`). [C, E]

### 4.2 Cotações, pedidos e vendas
- **Envio da cotação ao cliente:** botão falso e edge órfã. **Expiração:** nunca agendada. [D, E, F]
- **Assinatura digital:** sem provedor. [D]
- **CNPJ alfanumérico:** não suportado. [D]
- **Vendas importadas (Bitrix/V4/import):** não disparam gamificação nem broadcast (o broadcast depende do item 1 do top 25). [E]
- **Comissões:** o split de comissão do SDR existe só como coluna sem uso; o dinheiro aparece em 4 precisões diferentes na cadeia venda → pedido → comissão. [F]
- **Links quebrados no app:** `/meus-pedidos` (só existe a página de detalhe), `/vendas/:id` e `/contas/:id` (2 componentes). [D]

### 4.3 SDR, cadências, sequências e e-mail
- **Motor de cadência e sequência sem cron** (`sequence-runner`, `process-cadence-tasks`) e envio em horário ótimo que nunca dispara (`process-scheduled-sends` órfã). [B, E, F]
- **Pausa automática por resposta ou bounce quebrada** (RPC em `private`); `sequence-record-reply` órfã, então as respostas não contam no teste A/B. [E, F]
- **Auto-inscrição em cadência:** só manual (`EnrollmentRulesDialog`), sem gatilho por evento. [B, E]
- **Fila de aprovação e templates de cadência:** mock, não persistem (`ApprovalQueue` com `MOCK_PENDING`, `CadenceTemplateManager`). [C, D]
- **Rastreamento de e-mail:** não existe pixel de abertura nem de clique; `email_tracking_events` não tem produtor, então engagement score e send-time optimizer rodam sem dado. [B]
- **Deliverability (benchmark Ramper):** sem SPF/DKIM/DMARC guiado, sem warm-up, sem limite diário por remetente, sem opt-out em WhatsApp/SMS. [B]
- **Inbound:** sem landing pages, formulários ou coletor de visitantes (`website_visitor_logs` sem produtor). [B]
- **Enriquecimento de lead:** stub, sempre 503. [B, E]
- **SLA de lead, reatribuição e alertas de SDR:** sem cron. [B, E, F]
- **E-mail em massa e retry:** quebrados (`enqueue_email`). Transacional sem retry; sem webhook de eventos de entrega do Resend; sem UI de remetente e domínio. [E, G]

### 4.4 WhatsApp e multicanal
- **Evolution API:** não existe integração no código. [B, G]
- **MessageBird:** oferecido na UI, mas não suportado no envio. [G]
- **Respostas recebidas:** não são ingeridas, só os status. [G]
- **Callbacks Twilio por tenant:** falham na assinatura; não há StatusCallback no envio. [G]
- **Falhas de envio:** sem retry ou reenfileiramento. [G]
- **WhatsApp em /vendas:** simulado. [D]

### 4.5 Voz e dialer
- **Gravação:** sem checar consentimento (LGPD). [B]
- **Chamadas de entrada:** não existem. **Callback de status:** sem reconciliação. **Validação de credencial:** `verified_at` nunca é gravado. [G]
- **`elevenlabs-stt`:** órfã e não deployada. A transcrição usa outro provedor, então há duas rotas para a mesma coisa. [E, G]
- **Power dialer:** sequencial, sem discagem paralela. [B]
- **Upload, transcrição e diarização de gravação:** sem rota na UI. [D]

### 4.6 IA e coaching
- **Gateway de IA:** 46 functions dependem do gateway da Lovable (`LOVABLE_API_KEY`). [E]
- **Functions órfãs:** `ai-copilot` (o copiloto real da UI é `personal-assistant-stream`), `generate-loss-coaching` (sem checagem de papel), `generate-coaching-actions` (duplica `extract-coaching-actions`) e `analyze-pipeline-coverage`. [E]
- **`coaching-intelligence`:** o score de receita satura em R$ 50 mil para qualquer vendedor. [E]
- **Integrações Zoom, Meet e Teams:** não iniciadas. **Agentes de IA autônomos:** só com aprovação humana (parcial). **Painel "Meu Coach IA":** parcial. [B]
- **Indexação semântica:** falha em silêncio (`useIndexEntity.ts:9-16` ignora o erro); a cobertura da busca universal fica em 0. [C]

### 4.7 Forecast, BI e relatórios
- **BI Closer e BI SDR:** stubs. **Velocímetro:** aleatório. **`/inteligencia`:** maquete. **Dashboard SDR:** fictício. [D]
- **Metas inventadas** em 4 functions; **"+15,5%" fixo**; **ranking com todos em 1º**; **forecast contando `won` como pipeline**. [C, E, F]
- **Snapshot e acurácia de forecast:** sem cron, e "MAPE 0%" aparece com a tabela vazia. As colunas de cenário pessimista, realista e otimista de `forecast_snapshots` existem só no papel. [C, F]
- **Relatórios agendados:** não rodam no horário e, quando rodam, não entregam aos `recipients`, só geram arquivo no storage. [E]
- **`export-winloss-pdf`:** gera Markdown, não PDF. [E]
- **Inspeção de pipeline auditável:** `pipeline_inspections` sem produtor. **Conectores Power BI, Tableau e Looker:** não iniciados. **Dashboard drag-and-drop:** parcial. [B]
- **Rotas citadas no doc de reporting que não existem:** `/relatorios/builder`, `/relatorios/funnel`, `/scheduled-reports` e `/dashboard-personalizado`. [B, D]

### 4.8 Gamificação (Race Arena, desafios, ranking)
- **Corrida:**
  - A pontuação só é disparada pela UI.
  - O diff de placar sai sempre vazio.
  - Faltam carros para 10 de 18 vendedores.
  - O matchmaking está fora do restore. [C, E, F]
- **Desafios diários:** não giram sozinhos, e `challenge-expiration-alerts` não tem cron. **Roleta e XP:** desligados. **`settle_performance_bets`:** nunca roda. [E, F]
- **`ranking-api` (API pública):** órfã e quebrada; consulta `team_members`, que não existe. [E]
- **Componentes sem uso:** 15 componentes de gamificação construídos e nunca montados; `ArenaAITips` sorteia o alerta com `Math.random`. [C, D]

### 4.9 Win-Loss e inteligência competitiva
- **Webhooks de win-loss:** o dispatcher não tem nenhum produtor de eventos reais; só é chamado por replay e teste. **`winloss-webhook-replay-batch`:** órfã. [E, G]
- **`notify-critical-pattern`:** o trigger está quebrado (GUC indefinido, sem Authorization) e o HTML é montado sem escape. [E]
- **Insights fixos:** win-loss, objeções e e-mail mostram insights fixos; o Price Guard mostra "3 incidentes críticos" fictícios; os gráficos de elasticidade e desconto são montados sem props. [C, D]

### 4.10 Customer Success
- **CSAT/CES:** grava a pesquisa como enviada e não envia nada. [E]
- **Renovação, expansão, QBR e onboarding de clientes:** só por botão. O onboarding (`/onboarding-tracking`) é estado local com clientes fictícios. [B, D, E]
- **Uso do produto:** `product_usage_events` sem produtor. [B]
- **Risco de churn:** o painel em `/analytics` mostra sempre clientes de exemplo, e os fatores de churn estão fixos. [D]
- **Dois hubs paralelos:** `customer-success-360` e `customer-success-hub` se sobrepõem. [E]
- **Helpdesk:** todos os tickets vão para a "primeira conta"; só busca 50; sem cron; sem config. [G]

### 4.11 Integrações e plataforma
- **Bitrix24:** OAuth, refresh e cron (ver top 25 #16).
- **N8N:** nunca é chamado pelo CRM; a api_key fica em texto puro; o teste de conexão não valida a chave. [G]
- **Webhooks de saída genéricos:** só disparam `test.ping`. [G]
- **Push:** sem assinatura VAPID nem criptografia, então nunca é entregue; `new-device-alert`, o único chamador, é órfã. [E, G]
- **Ponte para banco externo (`external-db-bridge`):** sem checagem de papel e sem consumidor funcional. [G]
- **Não iniciados:** API pública com OpenAPI e SDK, analytics de uso da API, sync de Gmail/Outlook e calendário, Slack/Teams de negócio, marketplace, Zapier e ERP. [B]

### 4.12 Segurança, acesso e LGPD
- **Papéis:**
  - A feature flag ignora o papel (`useFeatureFlags.ts:71-75`).
  - O menu não filtra por papel.
  - 14 rotas, a maioria de admin, só abrem digitando a URL. [C, D]
- **Login e sessão:**
  - O MFA por SMS gera o código e não envia.
  - O gerenciador de sessões citado nos docs não existe.
  - O registro de tentativas de login está morto.
  - O login com passkey não aparece na tela de login. [B, C, G]
- **Controle de acesso no banco:**
  - Os helpers de RLS têm EXECUTE concedido a anon (mig `20261005140000:13-16`) e não há teste com `SET ROLE anon` no CI.
  - 9 tabelas têm RLS sem nenhuma policy.
  - Há policy `USING(true)` em `leads`, tabela que não existe. [C, F]
- **SEC-08 (`service_role`):** 90 de 172 functions ainda usam a chave crua; não há gate de CI. [C]
- **Headers e CSP:** sem headers HTTP de segurança (HSTS, frame-ancestors) e CSP com `'unsafe-eval'` (`index.html:56`); ações do ADR-009 não executadas. [B]
- **LGPD:** fica só no banco, sem UI de titular, consentimento ou anonimização; o LGPD.md cita a migration com nome errado. [B, F]
- **Risco de apagar o que está em uso:** o DEAD_TABLES.md marca `webauthn_*` para drop, mas passkeys foram reativadas (ADR-010). [B]

### 4.13 Dados e banco
- **Schema abandonado:** 36 tabelas e 90 funções. Inclui 2FA e sessão próprios, framework de experimentos A/B, stored procedures da v1 sobre a tabela `deals` que nunca existiu e 5 `fn_test_*` em produção. [F]
- **Repo não reconstrói o banco:**
  - Há migrations sobre tabelas inexistentes (`deals`, `notes`, `users`, `leads`).
  - 4 tabelas foram criadas fora do repo (`_internal_secrets`, `geo_*`, `plan_rollback_ddl`).
  - 24 tabelas divergem entre `types.ts` e migrations. [F]
- **Rastro de migrations:** `schema_migrations` não reflete o que foi aplicado (DDL via `db_query`), e há evidência de migrations pós-agosto não aplicadas em produção (`20260913150000:10-17`). [C, G]
- **Convenções de schema descumpridas:** 146 tabelas sem `updated_at`, 37 com a coluna e sem trigger, 77 colunas de dinheiro fora de `NUMERIC(15,2)`. [F]
- **Colunas sem uso:** 87 colunas em tabelas vivas (multimoeda e recorrência em `quotes`, MQL em `activities`) e 98 "colunas fantasma" declaradas num `CREATE TABLE IF NOT EXISTS` que não fez nada. [F]
- **Índices sem uso:** 497 índices sem uso não foram tratados. [C]

### 4.14 Infraestrutura, CI, testes e deploy
Ver o top 25 itens 9 a 12 e 25. Detalhe completo no anexo G:
- **Workflows quebrados:** cada workflow com falha tem a causa identificada.
- **Gates e planos de CI:** gates que não bloqueiam e itens dos planos P100/PCI não feitos.
- **Testes:** suítes auto-puladas e escada de cobertura (services em 20,65% contra a meta de 40%).
- **Ratchets e tipagem:** o teto de complexidade subiu de 126 para 130, contrariando a regra "só desce"; 882 erros strict no front e 58 no Deno; o ratchet de `as unknown` piorou (168 contra 155 documentados).
- **Scripts sem uso:** scripts do package.json que nunca rodam no CI.

### 4.15 Código morto e órfão (frontend)
- **148 arquivos sem ligação** a partir de `main.tsx` (cerca de 19 mil linhas) e **264 exports nunca importados**. [D]
- **Componentes duplicados:** `components/atoms/badge.tsx` e `input.tsx` são idênticos aos de `ui/`. [A]
- **Página órfã:** `RaceArena.tsx` (re-export legado). [D]

---

## 5. Causas-raiz transversais

Quase todos os 25 itens do top derivam de **seis causas**. Atacar a causa resolve vários itens de uma vez.

| Causa-raiz | Itens do top 25 que destrava | Evidência |
|---|---|---|
| **R1. Faltam as chaves `functions_base_url` e `anon_key` em `_internal_secrets`, e falta agendamento** | 1, 2, 4, 6, 14, 24 | `trigger_internal_edge_job` (mig `20261002010000`); cerca de 20 functions com auth de cron e sem `cron.schedule` |
| **R2. Telas construídas "de fora para dentro":** UI e mock primeiro, com a ligação ao backend deixada para depois | 5, 7, 21, 23 | 38 telas com mock, 16 ações que só mostram toast, cerca de 55 botões mortos |
| **R3. Mudanças de schema sem atualizar os chamadores** (renomes, `private`, tabelas que nunca existiram) | 3, 6, 8, 19, 20 | `auto_pause_enrollment` em `private`; `enqueue_email`, `leads`, `team_members`, `auth_users_view` inexistentes; insert de `login_attempts` revogado |
| **R4. Um único ambiente (produção) para tudo, e DDL aplicada fora do pipeline** | 9, 11, 12, e o rastro de migrations | Sem staging; `schema_migrations` incompleta; `deploy.yml` nunca rodou |
| **R5. Credenciais e segredos sem cofre** | 10, 13, 16, 18 | Tokens em jsonb em texto puro; secrets de CI inválidos ou apontando para outro projeto |
| **R6. Docs escritas como "pronto" antes de estar pronto** | todos | Ver §6; elas induzem decisões e auditorias erradas |

---

## 6. Documentos que afirmam o que o código não faz

| Documento | Afirmação | Realidade | Anexo |
|---|---|---|---|
| `CLAUDE.md` §5 | WhatsApp "via Evolution" | Twilio, Meta Cloud e Z-API; nenhuma Evolution | B, G |
| `CLAUDE.md` §2 e §6 | Export com `xlsx`/`pdf-lib`; diretórios `copilot/`, `crm/` e `scoring/` | `exceljs`/`jspdf`; os diretórios não existem | B |
| `CLAUDE.md` §3.1 e §3.2 | `send-quote-to-client`, `check-quote-expiration` e `ai-copilot` como peças vivas | São órfãs | E |
| `docs/FUNCIONALIDADES_COMPLETAS.md` e `FUNCIONALIDADES_SISTEMA.md` | "Nenhuma funcionalidade fantasma"; 19 rotas | As 19 rotas não existem; há dezenas de fantasmas (§3) | B |
| `docs/FEATURE_SUMMARY.md` / `DOCUMENTACAO_SISTEMA.md` | MFA por SMS, SessionManager, papel "Sales Ops", "100% strict" | Não envia SMS; os arquivos não existem; o enum tem 3 papéis; há 882 erros strict | B |
| `docs/REPORTING_BI_COMPLETE.md` | Relatórios com "cron diário"; rotas do builder | Sem cron; as rotas não existem | B |
| `docs/TELEMETRY_MODULE_DOCS.md` | 4 arquivos de teste e `AdminTelemetriaPage` | Não existem | B, C |
| `docs/DEAD_TABLES.md` | `webauthn_*` mortas ("edge retorna 503") | Passkeys reativadas: **risco de dropar tabela em uso** | B |
| `docs/SIZING.md` / `DR_PLAN.md` | O backup "já roda"; "PITR habilitado" | O backup falha 100%; não há evidência de PITR | G |
| `docs/DEPLOYMENT.md`, `RUNBOOK.md`, `ARCHITECTURE.md`, on-call | Deploy e rollback via Lovable (`championgifts.lovable.app`) | O CLAUDE.md diz Vercel; a Vercel publica `main` | C, G |
| `docs/SECURITY_HARDENING.md` | Nenhuma SECURITY DEFINER executável por anon desde 11/07 | Medidas 30 em 16/08; nova concessão em `20261005140000` | C |
| `docs/runbooks/race-arena.md` | "10/10 production-ready"; outro `project-ref` | Diff de eventos quebrado; ref errado | C |
| `components/admin/AdminSystemStatus.tsx` | Horários de jobs ("8h diário", "Horário") | Os jobs não estão agendados | B, E |
| `CHANGELOG.md:6` | O repositório foi tornado privado | Está público | G |
| `docs/estado/15_PLANO_COBERTURA_MODULOS.md` | Meta de 90% para `src/lib/schemas` | O módulo foi removido (PR #209) | G |

---

## 7. Plano de fechamento sugerido

Ordem pensada para **destravar receita primeiro e limpar depois**. Cada onda depende da anterior.

**Onda 0: destravar e proteger (1 a 2 dias)**
1. Conferir no banco oficial e gravar `functions_base_url` e `anon_key` em `_internal_secrets`; validar com `cron.job_run_details`. (R1)
2. Tornar o repositório privado, limpar `scripts/seed-real-people.ts` e rotacionar as credenciais que já vazaram no histórico. (top 25 #10, A2)
3. Corrigir o secret do backup (pooler IPv4 de `usyxfpqlsspldubptrdl`) e tirar o dump de artifact público. (#9)
4. Criar o canal de alerta de CI (N8N para WhatsApp) para as falhas pararem de passar em silêncio. (#25)
5. Confirmar `LOVABLE_API_KEY` no projeto oficial (ou o gateway alternativo). (#13)

**Onda 1: fazer a venda andar sozinha (1 a 2 semanas)**
1. Crons de `sequence-runner`, `process-cadence-tasks`, `process-scheduled-sends`, `check-quote-expiration`, `check-lead-sla` e alertas de SDR, mais a correção da tela `AdminSystemStatus`. (#2, #4, #14)
2. Wrapper das RPCs `auto_pause_enrollment` e `auto_promote_sequence_winners`, mais a ligação de `sequence-record-reply`. (#3)
3. Botão "Enviar" da cotação ligado a `send-quote-to-client`; WhatsApp e e-mail IA ligados aos envios reais. (#4, #5)
4. Trocar `enqueue_email` por Resend. (#6)
5. Corrigir o registro de tentativas de login e os botões do Pipeline Pulse. (#19, #20)
6. Corrigir o cálculo de comissão, o escopo dos relatórios agendados e o bucket público de PDFs de orçamento. (A1, A3, A4)

**Onda 2: número confiável (2 a 3 semanas)**
1. Metas lidas de `sales_goals`; remover stubs e mocks de BI e dashboard (ou estado vazio honesto). (#7)
2. Corrigir `mv_competitive_ranking` e `revenue_forecast_view`; popular `deal_stage_history`; tratar a acurácia sem dados. (#8)
3. Uma fonte por métrica: calibração, forecast, stage baselines, deal em risco. (#22)

**Onda 3: integrações, compliance e base (3 a 4 semanas)**
1. WhatsApp com Evolution `wpp2` e ingestão de respostas; Bitrix24 com refresh e cron. (#15, #16)
2. Consentimento antes de gravar e enviar; fila LGPD no admin. (#17)
3. Credenciais em vault; travas no `external-db-bridge`. (#18)
4. Staging ou banco efêmero; manifesto das 100 functions; decisão Vercel ou Lovable; `vercel.json`. (#11, #12)

**Onda 4: limpeza (contínua)**
1. Remover as 17 functions órfãs, os 148 arquivos mortos, as 36 tabelas e as 90 funções abandonadas, depois do período de observação.
2. Reescrever os docs da §6 para refletir o real.

---

## 8. Anexos

Cada anexo traz a tabela linha a linha (item | fonte | estado | evidência `arquivo:linha` | o que falta) e o seu próprio top 15 ou 20.

| Anexo | Conteúdo |
|---|---|
| [A — Planos e execução](./A_planos_execucao.md) | Planos de 100 etapas (26/08 e 30/08), handoff, reconciliações GitHub×Supabase, validações das ondas, plano graphify, auditoria enterprise v5 |
| [B — Docs de funcionalidades × código](./B_funcionalidades_docs.md) | FUNCIONALIDADES_*, GAPS_CLASSE_MUNDIAL, FEATURE_SUMMARY, benchmark Ramper, ADRs, LGPD, retenção, a11y, débito técnico e de tipos |
| [C — Docs de estado, runbooks e postmortem](./C_estado_runbooks.md) | `docs/estado/01–14`, ESTADO_ATUAL, IDENTIDADE_BANCO, runbooks, RLS_MATRIX, SEC-08, SECURITY_HARDENING, ARCHITECTURE, API |
| [D — Frontend](./D_frontend.md) | Mocks, botões mortos, ações falsas, rotas sem link, links quebrados, órfãos, código morto, top 20 |
| [E — Edge functions](./E_edge_functions.md) | As 172 functions com chamador, estado, secrets e o que falta; stubs, quebradas, órfãs, duplicatas |
| [F — Banco de dados](./F_banco_dados.md) | Tabelas e funções sem uso, crons, convenções, colunas fantasma, divergência `types.ts` × migrations |
| [G — Infra, CI, testes e integrações](./G_infra_ci_integracoes.md) | Workflows, gates, testes pulados, cobertura, scripts, Twilio, ElevenLabs, Bitrix24, WhatsApp, e-mail, N8N, WebAuthn, push, helpdesk, staging, DR, deploy |

> **Como manter este documento vivo:** a cada item fechado, marque-o no anexo com a PR que o resolveu. Ao reauditar, repita as mesmas buscas descritas no cabeçalho de cada anexo e compare as contagens da §2.
