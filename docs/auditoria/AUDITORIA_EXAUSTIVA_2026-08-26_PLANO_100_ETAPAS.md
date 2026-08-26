# Auditoria exaustiva do Promo Champions V2.1 e plano de 100 etapas

**Data da coleta:** 26 de agosto de 2026
**Commit-base:** 0d52e9ea4
**Branch da auditoria:** audit/hermes-h770179-analise-100-etapas
**Projetos Supabase informados:** origem rapjswienfhkobhlamxb; destino usyxfpqlsspldubptrdl
**Natureza do trabalho:** auditoria somente leitura e criação deste documento

> **Errata de evidência viva:** a reconciliação mais recente está em
> [MATRIZ_FORENSE_BANCOS_E_CONTRATOS_2026-08-26.md](MATRIZ_FORENSE_BANCOS_E_CONTRATOS_2026-08-26.md).
> O MCP de destino falhou para todas as leituras de catálogo e os dois URLs MCP
> fornecidos eram idênticos. Qualquer afirmação anterior baseada em snapshot,
> OpenAPI ou tipos deve ser tratada como evidência histórica, não como prova do
> estado vivo atual do destino. A matriz também corrige a cobertura de índices:
> há 25 FKs sem índice com colunas na liderança.

## Veredito executivo

O sistema tem uma superfície funcional muito ampla e o frontend compila, gera build e permite navegação anônima básica. Isso explica a percepção de que ele está quase pronto. Entretanto, **o estado atual não atende à definição de pronto do próprio projeto: ligado em produção, com tráfego real, contratos íntegros e evidência operacional**.

Há quatro classes de bloqueadores:

- **Segurança crítica:** uma chave service_role ativa está versionada em 12 scripts; a Edge Function temporária migrate-helper permanece acessível na origem e pode devolver credenciais administrativas; o login WebAuthn não verifica a assinatura criptográfica; e o destino concede EXECUTE a anon em 30 rotinas SECURITY DEFINER, 11 delas também sem search_path fixado.
- **Integridade funcional:** 45 de 169 Edge Functions não passam na verificação atual; sete nem sequer têm sintaxe válida; contratos de tabelas, colunas, RPCs e status divergem; há fluxos que persistem dados fabricados ou registram simulação como sucesso.
- **Divergência de ambientes:** origem e destino têm sobreposição nominal de apenas 23 entre 587 relações da origem e de 11 entre 976 nomes de função/RPC. As superfícies aparentam representar domínios ou estágios diferentes. Isso é bloqueador de reconciliação, não autorização para apagar objetos.
- **Qualidade ilusória:** typecheck e build passam, mas lint, testes unitários, cobertura e auditoria de dependências falham; o E2E autenticado é majoritariamente pulado no CI; documentos históricos que declaram 10/10, 97,6% ou produção não refletem o commit auditado.

**Decisão recomendada:** congelar mudanças de schema e deploys destrutivos, conter os P0, restaurar um canal SQL somente leitura no destino, estabelecer qual ambiente é canônico e executar o plano de 100 etapas deste documento. Nenhuma tabela, coluna, constraint, índice, policy, função, trigger, view, enum, extensão, privilégio, job, migration ou arquivo candidato a limpeza foi apagado ou alterado.

## Limites e honestidade da auditoria

Esta é uma auditoria máxima dentro dos acessos disponíveis, não uma alegação de onisciência:

- O banco origem pôde ser inspecionado profundamente por SQL com papel somente leitura e BYPASSRLS para inventário.
- O gateway SQL/MCP do destino falhou porque a infraestrutura não dispõe da função interna exec_sql e do token da Management API. Foram verificáveis apenas a superfície PostgREST/OpenAPI, leituras REST autorizadas, Storage, presença aproximada de dados e alguns objetos de auditoria já expostos.
- O OpenAPI não revela de forma completa índices, constraints, RLS/policies, triggers, grants/default ACLs, extensões, publicações, cron/jobs ou o ledger de migrations do destino. Esses grupos estão marcados como **não verificáveis**, nunca como inexistentes.
- Os dois links MCP fornecidos para origem e destino são idênticos, o que cria ambiguidade de roteamento.
- Não havia credenciais de usuário de teste para fluxos autenticados. Não foram criados usuários, pedidos, vendas, quotes ou qualquer dado para “testar”.
- Probes OPTIONS e GET foram usados somente para presença/contrato; nenhum endpoint mutável foi chamado. Na migrate-helper foi validado somente ping; a ação credentials não foi chamada.
- Análise estática não detecta consumidores externos, SQL dinâmico, chamadas manuais, webhooks de terceiros ou jobs registrados apenas no runtime. Um item “sem referência” é candidato a validação, não lixo.
- Tabela vazia não é tabela inútil. O sistema está em criação e a própria origem comprova tabelas vazias que recebem scans ou são partições futuras.

## Escala e método

Foram lidos README.md, AGENTS.md e a documentação em docs antes das inspeções. A análise combinou:

- inventário Git e histórico;
- mapeamento semântico e AST com Graphify;
- busca estrutural de imports, rotas, chamadas Supabase, RPCs e Edge Functions;
- TypeScript, ESLint, dependency-cruiser, Vite, Vitest, Playwright e actionlint;
- Deno check/lint por entrypoint das Edge Functions;
- npm audit e gitleaks, com triagem manual e sem reproduzir segredos;
- probes HTTP não mutáveis nos dois projetos;
- catálogos PostgreSQL, pg_stat, pg_policy, pg_proc, pg_trigger, pg_cron, privilégios e ledger de migrations na origem;
- OpenAPI/REST/Storage e view de auditoria SECURITY DEFINER no destino;
- confronto entre código, tipos gerados, migrations locais, origem e destino.

### Escala do repositório

| Métrica | Resultado |
|---|---:|
| Arquivos versionados | 3.109 |
| Arquivos TypeScript/TSX em src | 2.020 |
| Linhas TypeScript/TSX em src | 297.654 |
| Rotas declaradas | 174 |
| Edge Functions locais | 169 |
| Migrations locais | 592 |
| Arquivos de teste | 149 |
| Módulos no grafo de dependências | 2.017 |
| Dependências no grafo de módulos | 8.302 |

### Mapa Graphify

O mapa final contém 13.995 nós, 38.299 arestas e 1.290 comunidades. Os principais “god nodes” são cn(), Card, CardContent, Badge, Button, o cliente supabase, CardHeader, CardTitle, Skeleton e Input. Não foram encontrados ciclos de import.

O grafo também evidenciou uma conexão importante: a documentação de prontidão/10 de 10 forma comunidades próximas a documentos que admitem módulos dormentes, autenticação E2E ausente e contratos incompletos. Isso não é apenas inconsistência editorial; incentiva decisões de deploy baseadas em evidência antiga.

Há limitações no próprio grafo: 6.055 arestas referenciam endpoints ausentes, existe um self-loop e há milhares de nós isolados. As conclusões críticas deste relatório foram revalidadas diretamente no código ou no runtime e não dependem exclusivamente do grafo.

## Placar de verificações

| Verificação | Resultado | Leitura |
|---|---|---|
| npm run typecheck | aprovado | Tipos do frontend compilam |
| npm run build | aprovado | 7.345 módulos; dist aproximado de 11 MiB |
| npm run lint | reprovado | 5 erros e 19 avisos |
| dependency-cruiser | sem erro estrutural | 8 avisos de módulos com zero entrada |
| Vitest | reprovado | 42 arquivos: 3 falharam, 38 passaram, 1 pulou; 437 testes: 3 falharam, 432 passaram, 2 pularam |
| Cobertura parcial | reprovada | 73,03% de statements/linhas contra gate de 85%; mede somente 16 arquivos selecionados |
| Playwright anônimo | parcialmente aprovado | 34 passaram e 3 autenticados pularam em 37 testes |
| Suíte E2E total | insuficiente | 483 testes em 46 arquivos; caminhos autenticados dependem de env ausente no CI |
| actionlint | aprovado | Workflows têm sintaxe válida |
| npm audit | reprovado | 15 vulnerabilidades: 1 baixa, 7 moderadas, 6 altas e 1 crítica |
| Deno check por Edge | reprovado | 124 aprovadas e 45 reprovadas |
| Deno lint | reprovado | 275 problemas e 7 erros de parser |

O build mostrou chunks grandes e avisos de circularidade entre chunks manuais. Os maiores JavaScript sem gzip foram vendor-pdf 577,5 KiB, vendor 465 KiB, charts 431,9 KiB, core 407,4 KiB, App 249,2 KiB e WinLoss 240,3 KiB. O PWA precache ficou em aproximadamente 683 KiB.

As falhas unitárias atuais cobrem, entre outras, quatro violações de alta cardinalidade em filtros .in, divergência entre sales e sales_with_markup e um cálculo semanal sensível a data/fuso. A documentação que declara 97,6% não representa a cobertura real do projeto inteiro.

## Achados de segurança

### P0 — chave service_role versionada e ativa

Uma mesma chave service_role do destino está hardcoded em 12 scripts:

- scripts/remove-demos-cleanup.ts
- scripts/remove-demos-final.ts
- scripts/remove-demos-v2.ts
- scripts/remove-demos-v3.ts
- scripts/remove-demos.ts
- scripts/run-win-loss-analysis.ts
- scripts/seed-august-sales.ts
- scripts/seed-deal-outcomes.ts
- scripts/seed-fake-data.ts
- scripts/seed-probe.ts
- scripts/seed-race-cars.ts
- scripts/seed-real-people.ts

O segredo não é reproduzido. Ele foi confirmado como service_role do projeto usyxfpqlsspldubptrdl e ainda aceito pelo endpoint OpenAPI em leitura. O gitleaks encontrou 20 ocorrências no estado versionado atual e 31 no histórico; a triagem separou esse segredo real, a credencial da migrate-helper, cinco ocorrências de anon JWT em migrations e falsos positivos/chaves publicáveis.

**Impacto:** bypass de RLS e controle administrativo do projeto destino.
**Ação:** rotação/revogação imediata, investigação de logs, remoção dos valores do estado atual e, após autorização específica, expurgo coordenado do histórico.

### P0 — migrate-helper exfiltra credenciais

supabase/functions/migrate-helper/index.ts:

- declara que é temporária e deve ser removida após migração nas linhas 1–3;
- contém uma credencial fixa na linha 5;
- usa CORS wildcard nas linhas 6–10;
- está com verify_jwt=false em supabase/config.toml;
- devolve SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY e SUPABASE_DB_URL na ação credentials, linhas 24–29.

O ping com a chave versionada respondeu HTTP 200 na origem; a rota não existe no destino. A ação credentials deliberadamente não foi chamada.

**Impacto:** quem obtiver o repositório/histórico pode solicitar segredos administrativos e conexão do banco origem.
**Ação:** desativar a função implantada, rotacionar a credencial fixa, service_role e senha/URL do banco potencialmente expostas e auditar acessos.

### P0/P1 — WebAuthn sem verificação criptográfica

supabase/functions/webauthn/index.ts:270–360 apenas verifica presença de campos e igualdade do challenge. Não verifica assinatura contra a chave pública armazenada, rpIdHash, origin, flags de presença/verificação, contador do autenticador ou CBOR/COSE. Depois incrementa o contador por conta própria, gera magic link administrativo e devolve hashed_token/action_link.

A própria função exclui login-options e login-verify da autenticação interna e enumera credenciais por e-mail. No destino, as tabelas WebAuthn estavam vazias no snapshot, reduzindo a explorabilidade atual, mas o desenho permite tomada de conta assim que uma passkey existir. O fluxo deve permanecer desabilitado até implementação com biblioteca WebAuthn auditada e testes de ataque.

### P0 de triagem — exposição SECURITY DEFINER no destino

A view v_security_definer_exposure retornou 217 rotinas SECURITY DEFINER:

- 30 executáveis por anon;
- 204 executáveis por authenticated;
- 15 sem search_path fixado;
- 11 simultaneamente executáveis por anon e sem search_path.

Os metadados comprovam configuração e grants, não que todas as 217 rotinas sejam exploráveis. Nenhuma foi invocada. A combinação de EXECUTE para anon, search_path ausente e nomes mutáveis como hard_delete/restore exige triagem P0, seguida de teste seguro por assinatura e contrato.

As 30 expostas a anon são:

add_league_weekly_xp, add_salesperson_xp, audit_trigger, auto_victory_post, check_2fa_failed_attempts, claim_pending_cadence_tasks, cleanup_expired_narrative_cache, ensure_single_default_filter, fn_quotes_inbound_ordering_guard, fn_test_backdate_cron_alert, fn_test_cleanup_cron_alerts, fn_test_mark_cron_failure, fn_test_simulate_stalled_check, get_deleted_records, hard_delete_record, has_role, increment_combo, increment_goal_progress, is_country_blocked, is_email_opted_out, log_audit_event, log_data_access, log_security_event, protect_pa_nudge_content, restore_deleted_record, restore_record, soft_delete_record, trg_invalidate_forecast_narrative_cache, trg_recording_generate_coaching e trigger_auto_coaching_on_recording.

As 11 sem search_path são audit_trigger, auto_victory_post, check_2fa_failed_attempts, get_deleted_records, hard_delete_record, log_audit_event, log_data_access, log_security_event, restore_deleted_record, restore_record e soft_delete_record.

Os nomes indicam mutação, restauração, exclusão, logging, teste e privilégios; revogar/ajustar EXECUTE exige uma matriz funcional e autorização explícita.

### P1 — autorização insuficiente em Edge Functions

Das 169 funções, 140 obtêm cliente service-role; 93 dessas não validam identidade dentro do handler e 74 executam escrita ou RPC. Apenas 11 casaram com guardas explícitas de role/admin no rastreio conservador.

Casos prioritários:

- ranking-api lista vendedores e altera score por e-mail sem escopo de organização;
- auto-reassign-inactive reatribui portfólios sem guarda;
- dispatch-webhook permite a qualquer autenticado escolher evento/payload e assinar com segredo real;
- winloss-webhook-dispatcher faz fan-out service-role sem auth interna;
- external-db-bridge aceita select/insert/update/delete/RPC após mera autenticação;
- process-race-event não vincula o usuário à venda;
- execute-workflow não verifica ownership do workflow ou sale_id;
- export-winloss-pdf e revops-hub expõem dados globais;
- next-best-action, predictive-intelligence e revenue-forecast-ai aceitam IDs/filtros arbitrários;
- send-quote-to-client lê a quote por service-role sem validar acesso.

### P1 — webhooks e endpoints públicos

Somente log-web-vitals, receive-quote-sync, email-unsubscribe e migrate-helper estão com verify_jwt=false. Pelo menos dez contratos de provider, iframe ou pré-login permanecem atrás do JWT padrão: receive-quote-webhook, inbound-email-webhook, multichannel-status-webhook, twilio-call-status, twilio-call-twiml, report-embed-public, bitrix24-oauth, ranking-api, get-client-ip e webauthn.

O gateway bloqueia o uso legítimo; simplesmente torná-los públicos criaria escrita forjável. inbound-email-webhook, multichannel-status-webhook e os callbacks Twilio não verificam assinatura de provider adequadamente. bitrix24-oauth não implementa state/PKCE. O conserto precisa combinar verify_jwt coerente, HMAC/assinatura, anti-replay, allowlist e rate limit.

### P1 — prêmio decidido no cliente

src/hooks/gamification/usePrizeWheel.ts decide o prêmio com Math.random no navegador, grava tipo/valor/rótulo fornecidos pelo cliente e decrementa giros em uma operação separada. As policies não validam o prêmio e permitem escrita própria.

**Impacto:** prêmio fabricável, repetição de giro e lost update.
**Ação:** RPC transacional server-side com lock, idempotency key, sorteio e validação no servidor; revogação de insert/update direto somente após aprovação.

### P1 — CSP e persistência local

Há 159 referências a localStorage e 20 a sessionStorage em 54 arquivos. A sessão Supabase/JWT é persistida no localStorage, enquanto a CSP de index.html permite unsafe-inline e unsafe-eval. Perguntas/respostas de NLQ e explicações win/loss são armazenadas no browser. Isso amplia o impacto de XSS e vazamento same-origin.

## Arquitetura e estado do frontend

src/routes/AppRoutes.tsx declara 174 rotas: 4 públicas, 1 protegida fora do layout e 169 sob proteção global. A auditoria classificou 143 como **candidatas integradas**, 26 como parciais, 2 como iniciadas/UI local e 3 como shells/redirecionamentos. “Candidata integrada” significa apenas que existe ligação estática plausível; não significa pronta em produção.

As 26 rotas parciais são:

/dashboard, /dashboard/:section, /sdr, /cadencias, /cadencias-orcamentos, /follow-up/audit, /conversational-intelligence, /assinatura-digital, /analytics, /inteligencia-compras, /ferramentas/bi, /pricing-intelligence, /portfolio, /lead-routing, /metas-atividades, /arena, /usage-analytics, /configuracoes, /race-arena/spectator/:seasonId, /meus-pedidos/:id, /acompanhamento-pedidos, /acompanhamento-pedidos/:id, /analytics/evolution, /seguranca, /admin/comercial e /admin/telemetria.

As rotas /inteligencia e /onboarding-tracking são somente iniciadas/UI local. /, /dashboard/* e * são shells/redirecionamentos.

### Dados fabricados ou apresentados como reais

| Área | Evidência | Efeito |
|---|---|---|
| Acompanhamento de pedidos | src/hooks/orders/useOrderTracking.ts | inventa etapas, parcelas, ETA, NF e saúde; mistura quotes reais com mocks |
| Follow-up audit | src/pages/FollowUpAudit.tsx | sempre inclui pessoas mock e faz fallback silencioso |
| Usage Analytics | src/pages/UsageAnalytics.tsx | usa status de vendas como page views e sorteia logins |
| BI cliente/setor | src/hooks/bi/useClientVsIndustry.ts | fixa cliente em 85 e usa fallback hardcoded |
| BI cliente | src/hooks/bi/useClientBI.ts | recência/pedidos/categorias artificiais e confiança 90 |
| Cadências | EliteCadenceAnalytics.tsx | injeta percentuais e afirmações sem fonte |
| SDR/IA | SDRConversationInsights.tsx e ArenaAITips.tsx | demo e tendência aleatória apresentadas como inteligência |
| Precificação | DiscountOptimizer.tsx e PriceElasticityChart.tsx | recomendação fixa e curva aleatória com rótulo “Live Model” |
| Onboarding | OnboardingTracking.tsx | estado apenas em memória, perdido no refresh |
| Inteligência | IntelligenceCockpit.tsx e LiveIntelligenceFeed.tsx | cards, feed e ações estáticas |
| Dashboard | FuturisticSpeedometerDashboard.tsx e Speedometer.tsx | drilldowns fixos e valores randomizados |
| Aprovação de cadências | ApprovalQueue.tsx | dados locais e toast de envio/descarte sem backend |
| Assinatura digital | useDigitalSignatures.ts e AssinaturaDigital.tsx | muda status e declara envio sem provedor/entrega |
| Enriquecimento | supabase/functions/enrich-lead/index.ts | fabrica headcount, receita, funding, stack, verificação e sinais e persiste |
| Workflow | workflow-executor | registra ações simuladas como success |
| Multicanal | send-multichannel-message | header mock gera mensagem e persiste sent |

Mocks de teste são normais; mocks produtivos silenciosos não são. Se um modo de demonstração for necessário, ele deve ser explícito, isolado, não persistir em tabelas reais e exibir banner inequívoco.

### Ações visíveis sem efeito

Foram confirmados botões/comandos sem handler real em ArenaAITips, ApprovalQueue, AssinaturaDigital, FeatureComparison, ImprovementPlan, BattleArena, ConversationalIntelligenceHub, IntelligenceCockpit, StrategicRecommendations, PricingIntelligenceHub, EmptyStateGuide, IntelligenceSettings, SDRCommandBar, EvolutionCurvesPage, SecurityDashboard e AdminComercial. Também faltam handlers para visualizar/baixar assinatura e visualizar/editar aprovação.

### Contratos e fluxos quebrados

- FollowUpTerritoryRules consulta auth_users_view, ausente dos tipos e migrations.
- usePurchaseHistory força uma associação orders → profiles:user_id que não consta no contrato.
- ai-agent-orchestrator e sequence-runner usam leads; pipeline-pulse-aggregator usa lead_routing_assignments; ranking-api usa team_members. Essas relações não constam no contrato gerado/destino.
- email-bulk-send, email-bulk-retry e send-churn-alert-email usam enqueue_email, inexistente nos tipos e em migrations.
- auto_pause_enrollment, auto_promote_sequence_winners e claim_pending_cadence_tasks existem em migrations, mas não nos tipos gerados, indicando tipos desatualizados ou drift de aplicação.
- Há 57 campos lidos por 25 Edge Functions e 19 campos filtrados/escritos por 11 funções que não constam no contrato gerado.
- O vocabulário de sales.status tem 15 usos fora da constraint em nove funções, incluindo open, closed_won, closed_lost, fechado, Perdido, Vendido, in_progress e negotiating.
- send-quote-to-client chama a função inexistente send-transactional-email e envia payload incompatível para send-multichannel-message.
- /lead-routing apenas administra regras; useAutoAssignLead não é consumido e não há trigger/chamada ativa da RPC.
- /portfolio implementa round-robin por localStorage e contagens N+1, portanto não é consistente entre usuários/abas.
- /meus-pedidos/:id volta para /meus-pedidos, rota que não existe.
- /race-arena/spectator/:seasonId não tem produtor de link encontrado e pode expor IDs, nomes, avatares, vendas e progresso conforme grants divergentes.
- Status de venda ganha diverge entre completed/won/closed e filtros que consideram somente completed.

### Código não alcançado — candidato, não lixo

O grafo de imports a partir de src/main.tsx, excluindo testes/stories/specs, encontrou:

- 2 páginas produtivas não alcançadas: src/pages/ConversationalIntelligence.tsx e src/pages/RaceArena.tsx;
- 21 hooks não alcançados: ai/useAICopilot.ts, cadences/index.ts, cadences/useCadenceMetrics.ts, conversational/useCoachingProgress.ts, conversational/useDiarizeRecording.ts, conversational/useTranscribeRecording.ts, conversational/useUploadCallRecording.ts, deal-intelligence/useDealVelocity.ts, playbooks/index.ts, revenue/useRevenueIntelligence.ts, sales/useGoals.ts, sessionHelpers.ts, suppliers/index.ts, useCombo.ts, useIPBlocking.ts, useMFA.ts, useRateLimit.ts, useReauthentication.ts, useSessionManagement.ts, win-loss/useUpsellSuggestions.ts e win-loss/useUserDashboardLayout.ts;
- 2 services não alcançados: comboService.ts e goalsService.ts;
- 131 componentes não alcançados, concentrados em deal-intelligence, gamification, ui, security, dashboard, conversational, pipeline, atoms, effects, race e win-loss.

Não se deve excluir nenhum deles sem procurar imports dinâmicos, consumidores externos, feature flags, testes e tráfego. Há duplicações byte a byte entre atoms/badge e ui/badge, atoms/input e ui/input, atoms/skeleton e ui/skeleton; a variante atoms/skeleton ainda é usada.

### Consultas, performance e acessibilidade

- 317 ocorrências de .select("*"); há consultas ilimitadas de todos os clientes/produtos, atividades sobrepostas e ranking agregado no cliente.
- Quatro violações de alta cardinalidade já são cobertas por teste e falham.
- O dependency-cruiser marca oito zero-incoming: utils/fuzzing.ts, lib/schemas/commercial.ts, lib/bi/mockData.ts, components/ui/sonner.tsx e quatro Animated indicators.
- O build usa lazy loading/chunks manuais, mas módulos grandes e chunks circulares permanecem.
- Há 82 botões icon-only alcançáveis sem nome acessível estático.
- O axe cobre somente 10 de 174 rotas; rotas autenticadas são puladas e regras color-contrast/svg-img-alt são parcialmente suprimidas.
- AdminTelemetria monta MainLayout dentro de outro MainLayout.
- StrictMode está aninhado em main.tsx e App.tsx.
- ClientPurchaseHistory grava storage dentro de useMemo.

## Edge Functions

### Verificação de compilação

Das 169 funções, 124 passaram e 45 falharam. As sete falhas de sintaxe/parser são:

- calculate-committee-coverage — byte U+0001;
- calibrate-win-probabilities — fechamento incompatível;
- calibrate-win-probability — byte U+0001;
- check-v4-callback-alerts — byte U+0001;
- coaching-impact-summary — byte U+0001;
- nlq-query — import aninhado/quebrado;
- notify-v4-quote-status — type query inválida.

As 38 falhas TypeScript são:

aggregate-coaching-scorecard, ai-copilot, ai-email-composer, analyze-objection-handling, analyze-stage-conversion, bitrix24-sync, deal-probability, deal-risk-digest, dispatch-webhook, edge-retry-threshold-alert, elevenlabs-voice, execute-workflow, external-db-bridge, extract-committee-from-call, forecast-narrative, generate-loss-coaching, lead-scoring, notify-quote-conversion, onboarding-launcher, personal-assistant-stream, predict-quota-attainment, predictive-scoring-explain, process-cadence-tasks, process-race-event, process-scheduled-sends, receive-quote-sync, refresh-stage-baselines, report-builder-execute, report-embed-public, run-retry-tests, salesperson-coaching, scheduled-reports-runner, semantic-search, semantic-search-universal, stress-test-contracts, wal-health-alert, winloss-webhook-health-monitor e workflow-executor.

Cinco entrypoints compartilham a mesma quebra em _shared/retry.ts, que torna telemetry indevidamente obrigatório. O bundler atual classifica erros TypeScript como warning e só falha por import; portanto, o CI pode aceitar essas 38 quebras.

### Presença nos projetos

Probes OPTIONS não mutáveis sobre os 169 nomes locais mostraram:

| Estado | Quantidade |
|---|---:|
| Presentes na origem | 165 |
| Presentes no destino | 85 |
| Presentes só na origem | 80 |
| Ausentes nos dois | 4 |
| Presentes só no destino | 0 |

Ausentes nos dois: calculate-committee-coverage, calibrate-win-probabilities, calibrate-win-probability e coaching-impact-summary.

As 80 presentes somente na origem são:

activity-goal-alerts, admin-conversion-trail, ai-agent-orchestrator, analyze-pipeline-coverage, auto-reassign-inactive, challenge-expiration-alerts, check-lead-sla, check-quote-expiration, check-v4-callback-alerts, compute-forecast-accuracy, cron-failure-alerter, deal-risk-digest, elevenlabs-stt, email-unsubscribe, extract-deal-stakeholders, generate-loss-coaching, generate-revenue-forecast, inbound-email-webhook, lead-scoring, migrate-helper, multichannel-status-webhook, new-device-alert, nlq-query, notify-critical-pattern, notify-v4-quote-status, predict-quota-attainment, process-cadence-tasks, process-call-recording-ingest, process-race-event, process-scheduled-sends, purchase-intelligence-forecast, push-subscribe, qbr-generator, qbr-scheduler, ranking-api, receive-quote-sync, receive-quote-webhook, recompute-stage-baselines, refresh-stage-baselines, renewal-automation, report-builder-execute, rotate-daily-challenges, run-retry-tests, salesperson-coaching, schedule-optimal-send, scheduled-report-trigger, scheduled-reports-runner, sdr-consecutive-alerts, semantic-coverage, semantic-index-entity, semantic-reindex-batch, semantic-search-universal, send-alert-notifications, send-churn-alert-email, send-multichannel-message, send-password-reset, send-push-notification, send-quote-to-client, send-time-optimizer, sequence-ab-promote, sequence-enroll, sequence-record-reply, sequence-runner, simulate-load, snapshot-forecast, stress-test-contracts, summarize-call-recording, test-integration-connection, transcribe-call-recording, twilio-call-status, twilio-call-twiml, twilio-click-to-call, wal-health-alert, webauthn, winloss-webhook-dispatcher, winloss-webhook-health-monitor, winloss-webhook-replay, winloss-webhook-replay-batch, winloss-webhook-timeline e workflow-executor.

OPTIONS respondeu 500/503 em oito rotas presentes na origem e quatro no destino. Isso não comprova falha do POST real, mas exige logs/runtime. Dezoito funções locais não têm referência produtiva estática:

admin-conversion-trail, analyze-pipeline-coverage, check-quote-expiration, check-v4-callback-alerts, deal-risk-digest, elevenlabs-stt, generate-loss-coaching, inbound-email-webhook, migrate-helper, multichannel-status-webhook, process-scheduled-sends, ranking-api, send-quote-to-client, sequence-record-reply, simulate-load, wal-health-alert, winloss-webhook-health-monitor e winloss-webhook-replay-batch.

Elas podem ser cron, webhook ou API externa; a lista não autoriza remoção.

## Banco origem — inventário profundo

Coleta em 26/08/2026 19:20 UTC, PostgreSQL 17.6, aproximadamente 5,62 GiB e cache hit de 99,355%. As estatísticas cobrem cerca de 40 dias.

### Objetos por schema

| Schema | Tabelas | Views | MVs | Rotinas | Policies | Triggers |
|---|---:|---:|---:|---:|---:|---:|
| public | 391 | 192 | 4 | 1.280 | 927 | 385 |
| auth | 23 | 0 | 0 | 4 | 0 | 1 |
| storage | 8 | 0 | 0 | 17 | 52 | 4 |
| realtime | 10 | 0 | 0 | 15 | 0 | 1 |
| supplier_stricker | 17 | 4 | 0 | 4 | 0 | 5 |
| cf_recon | 6 | 7 | 0 | 0 | 6 | 0 |
| prod_audit | 5 | 1 | 0 | 6 | 0 | 0 |
| classification_audit | 1 | 2 | 0 | 5 | 0 | 0 |
| analytics | 0 | 0 | 7 | 0 | 0 | 0 |
| internal | 0 | 0 | 1 | 0 | 0 | 0 |
| cron | 2 | 0 | 0 | 7 | 2 | 1 |
| net | 2 | 0 | 0 | 12 | 0 | 0 |
| pgmq | 1 | 0 | 0 | 40 | 0 | 0 |
| extensions | 1 | 4 | 0 | 175 | 0 | 0 |
| supabase_functions | 2 | 0 | 0 | 1 | 0 | 0 |
| supabase_migrations | 1 | 0 | 0 | 0 | 0 | 0 |
| vault | 1 | 1 | 0 | 5 | 0 | 0 |

auth, storage, realtime, cron, net, vault, extensions, pgmq e GraphQL são infraestrutura gerenciada. Não devem ser copiados ou “corrigidos” cegamente.

### Colunas, constraints e índices no public

- 5.086 colunas em tabelas/partições: 2.057 NOT NULL, 3.029 nullable, 2.025 com default, 8 identity, 24 generated, 228 JSON/JSONB e 939 UUID.
- 1.324 constraints: 391 PK, 396 FK, 190 UNIQUE e 347 CHECK.
- Todas as 391 tabelas possuem PK; não há constraint NOT VALID no public.
- Nenhuma FK está sem índice cujo prefixo cubra suas colunas.
- 1.170 índices: 391 primários, 632 únicos, 152 parciais e 7 por expressão.
- Não há índice inválido, not ready ou grupo de definição duplicada.
- Índices ocupam aproximadamente 1,38 GiB.
- 159 índices não únicos/sem constraint registram idx_scan=0 no período, somando aproximadamente 65 MiB. Os maiores estão em stock_snapshots e stock_daily_summary.

Índice sem scan não é lixo: é preciso observar janela maior, planos de consulta e jobs sazonais antes de propor remoção.

### Volume e tabelas vazias

No public há estimativa de 4.918.999 linhas: 257 relações com estimativa positiva e 134 com zero. A classificação das 134:

- 123 tabelas independentes vazias, todas com registros de scan;
- 9 partições filhas vazias, todas com scans;
- 2 pais particionados vazios e sem scan: magazine_public_view_events e supplier_products_raw_history, que naturalmente não guardam linha diretamente.

**Conclusão:** nenhuma tabela independente pode ser chamada de lixo pelo critério “vazia/sem uso”.

Maiores objetos:

- stock_snapshots: aproximadamente 1,54 GiB e 729.945 linhas;
- supplier_products_raw_history_p2026_08: aproximadamente 616 MiB e 434.378 linhas;
- partições de junho/julho: aproximadamente 577/514 MiB;
- stock_daily_summary: aproximadamente 514 MiB e 1.451.302 linhas;
- supplier_products_raw: aproximadamente 353 MiB;
- products: aproximadamente 174 MiB;
- product_images: aproximadamente 141 MiB.

### RLS e policies

- 390 de 391 tabelas public têm RLS habilitado; somente uma usa FORCE RLS.
- 927 policies: 925 permissivas e 2 restritivas.
- 176 expressões USING true e 48 WITH CHECK true precisam ser classificadas por intenção; catálogo público e service_role podem justificar parte delas.
- anon_catalog_grant_audit_log tem RLS, zero policies e grants contraditórios; o efeito atual é deny-all para anon/authenticated.
- magazine_public_view_events_2026_11 é uma partição futura vazia, com RLS e zero policies/grants; provável deny-by-default intencional.
- **supplier_products_raw_history_p2026_11 é defeito comprovado:** RLS desabilitado, zero policies e SELECT/INSERT para authenticated. O acesso direto à partição contorna a proteção do pai.

### Privilégios e default ACLs

Grants relacionais:

| Papel | SELECT | INSERT | UPDATE | DELETE | MAINTAIN | REFERENCES/TRIGGER |
|---|---:|---:|---:|---:|---:|---:|
| anon | 56 | 231 | 229 | 229 | 477 | 254 |
| authenticated | 432 | 341 | 337 | 336 | 542 | 350 |
| service_role | 587 | 587 | 587 | 587 | 587 | 587 |

RLS ainda controla linhas de usuários normais, mas não justifica MAINTAIN, REFERENCES e TRIGGER amplos. Todos os 23 sequences públicos concedem SELECT, UPDATE e USAGE a anon/authenticated/service_role.

Default ACLs de objetos criados por supabase_admin concedem por padrão CRUD, TRUNCATE, MAINTAIN, REFERENCES e TRIGGER a anon/authenticated. Funções futuras continuam recebendo EXECUTE amplo conforme o owner. A migration final endureceu somente o caminho do owner postgres; o owner supabase_admin permanece permissivo.

Há 10 event triggers habilitados que revogam parte dos grants futuros, mas eles não corrigem todo o problema de tabelas/sequences/default ACL.

### Funções, stubs e triggers

No public existem 1.280 funções e zero procedures:

- 530 são SECURITY DEFINER;
- todas as 530 têm search_path explicitamente fixado;
- 356 funções são executáveis por anon e 712 por authenticated;
- 10 SECURITY DEFINER são executáveis por anon e 70 por authenticated.

As 10 SECURITY DEFINER executáveis por anon são check_login_rate_limit, fn_check_login_allowed, fn_global_search, fn_product_active_for_rls, fn_super_filtro, fn_super_filtro_facets, fn_super_filtro_price_range, get_catalog_bestseller_page, get_quote_token_by_value e submit_quote_response. get_catalog_bestseller_page não limita p_limit e merece teto contra abuso.

Stubs/no-ops comprovados:

- build_full_scope_grants_v() retorna SELECT 1;
- refresh_full_scope_grants_view() retorna SELECT 1;
- next_in_step_up_queue() retorna JSONB vazio;
- process_step_up_queue() retorna 0;
- fn_force_user_logout, fn_log_login_attempt, fn_log_price_change, fn_log_step_up_event, fn_validate_role_change, limit_recently_viewed_products, magic_up_audit_changes e voice_command_audit apenas retornam NEW.

Há 295 trigger functions e 62 sem qualquer trigger consumidor; uma contagem preliminar de 63 foi corrigida porque handle_new_user é consumida por auth.users.on_auth_user_created, enquanto fn_handle_new_user é outra função e permanece órfã. Há ainda 343 objetos de rotina, correspondentes a 340 nomes únicos, sem consumidor visível nas dependências de catálogo, triggers, cron ou grants API. Cinco enums não são usados em colunas: categoria_cor_enum, familia_cor_enum, payment_status, silver_norm_status e tipo_cor_enum. Onze rotinas contêm TODO/FIXME/placeholder.

**Defeito comprovado:** trg_log_price_change está ligado a product_variants e chama fn_log_price_change, que apenas retorna NEW. A auditoria de mudança de preço prometida não ocorre.

### Views e materialized views

- 192 views públicas; 183 usam security_invoker.
- Nove views owner-context são acessíveis por anon e aparentam ser façades públicas.
- v_products_public expõe 184 colunas, incluindo custo, organização, fornecedor, impostos e metadados de sincronização; a projeção precisa ser minimizada e aprovada.
- Há 12 materialized views, todas populadas e com índice único válido.
- internal.mv_product_leaf_category concede SELECT direto a anon/authenticated e USAGE em internal, apesar de uma façade pública depender dela.
- analytics.mv_product_compositions também concede SELECT a anon; validar intenção.
- 123 views não possuem dependência reversa entre views nem grants diretos para anon/authenticated; serviços externos ainda podem consumi-las.

### Enums e extensões

Os 15 enums públicos incluem app_role, categoria_cor_enum, conversation_event_type, familia_cor_enum, magazine_reaction_kind, magazine_reaction_status, org_role, payment_status, produtos_padronizacao_status, role_migration_item_status, role_migration_status, silver_norm_status, step_up_action, supplier_raw_status e tipo_cor_enum.

As 16 extensões instaladas são http, hypopg, index_advisor, moddatetime, pg_cron, pg_graphql, pg_net, pg_stat_statements, pg_trgm, pgcrypto, pgmq, plpgsql, supabase_vault, unaccent, uuid-ossp e wrappers.

### Realtime

A publicação supabase_realtime inclui auth.users e nove relações public: device_login_notifications, discount_approval_requests, login_attempts, notifications, order_items, orders, quote_items, quotes e workspace_notifications. A presença de auth.users é incomum e precisa de teste de autorização específico; a publicação sozinha não prova vazamento.

### Jobs

- 137 jobs: 135 ativos e 2 inativos.
- 165.154 execuções retidas: 165.151 sucessos e 3 falhas.
- **Job 297 está 100% quebrado:** três execuções, três falhas, incluindo 23/08/2026, porque VACUUM não pode rodar dentro de transaction block.
- Jobs 202 e 274 estão inativos e podem ter sido aposentados intencionalmente.
- Existem 17 jobs de rede. A varredura não encontrou JWT ou bearer longo literal, mas isso não comprova gestão correta de segredo.

### Migrations na origem

O ledger oficial contém 2.354 versões distintas:

- 398 sem nome;
- 48 nomes duplicados, abrangendo 96 registros;
- 3 versões não numéricas;
- 6 versões numéricas fora do padrão de 14 dígitos;
- primeira 001; última 20260718135800.

O repositório tem 592 arquivos locais, enquanto o ledger tem 2.354 entradas. Não se pode inferir “1.762 migrations perdidas” por simples subtração: pode haver squashing, histórico externo, nomes alterados e bases de produto diferentes. É necessário comparar checksums/DDL normalizado.

Nas migrations locais:

- há uma migration futura em relação à data da auditoria: 20260830000000_fix_race_leaderboard_status.sql;
- três timestamps são duplicados: 20260104143930, 20260104170152 e 20260104181000;
- duas migrations contêm DROP TABLE, uma contém DROP COLUMN e 25 contêm DELETE FROM;
- 315 arquivos criam policies, 208 criam índices e 247 criam funções;
- 12 arquivos contêm 14 chamadas cron.schedule e 10 cron.unschedule;
- cinco arquivos contêm URLs Supabase e cinco ocorrências de anon JWT precisam migrar para Vault/configuração.

Nenhuma migration foi executada.

## Banco destino — o que foi e não foi comprovado

### Superfície verificável

| Item | Resultado |
|---|---:|
| Relações expostas no OpenAPI | 433 |
| Colunas descritas | 4.372 |
| RPCs expostas | 210 |
| Relações CRUD-capable no contrato | 409 |
| Relações GET-only no contrato | 24 |
| RPCs GET+POST | 71 |
| RPCs POST-only | 139 |
| Relações com ao menos uma linha no probe | 112 |
| Relações sem linha no probe | 320 |
| Relações não sondáveis | 1, v_platform_wal_health com 403 |

Amostragem de uma linha não mede volume e “vazia” não significa descartável.

Os tipos gerados têm 378 tabelas, 27 views e 181 funções tipadas; 180 aparecem no destino e uma existe somente nos tipos. O contrato está defasado em relação à superfície destino. Existem 28 relações expostas no destino e ausentes dos tipos:

ab_tests, activities_active, audit_log, cadence_enrollments, clients_active, data_access_log, entity_versions, experiment_assignments, experiment_variants, experiments, migration_log, password_history, roles, security_events, session_activity, tasks_active, user_2fa, user_2fa_backup_codes, user_2fa_log, user_permissions_cache, v_active_activities, v_active_clients, v_active_products, v_active_suppliers, v_active_teams, v_deleted_clients, webhook_events e webhook_logs.

Há 30 RPCs destino ausentes dos tipos:

add_league_weekly_xp, add_salesperson_xp, aggregate_sales_stats, archive_old_activities, archive_old_data, bulk_update_deal_stages, calculate_deal_health_score, calculate_deal_probability, calculate_team_performance, check_2fa_failed_attempts, check_failed_attempts, claim_pending_cadence_tasks, cleanup_deleted_records, cleanup_old_audit_logs, cleanup_old_records, generate_sales_forecast, get_deleted_records, hard_delete_record, increment_combo, increment_goal_progress, is_admin_or_manager, log_security_event, record_login_attempt, refresh_materialized_views, reindex_tables, restore_deleted_record, restore_record, soft_delete_record, update_client_score e update_lead_score.

Uma busca conservadora em TS/JS versionado encontrou 85 relações destino sem chamada literal .from e 85 RPCs sem chamada literal .rpc. Isso inclui views, triggers, funções administrativas e consumidores externos. A ausência estática só cria fila de investigação.

### Storage

Buckets existentes: comprovantes-financeiro, nfe-xml e nfe-certificados, todos privados.

Buckets usados pelo código e ausentes: call-recordings, quote-pdfs e report-snapshots. A incompatibilidade com o destino é comprovada; ela só constitui perda/incompletude operacional se esse for o projeto canônico realmente usado pelo frontend.

### Catálogo profundo bloqueado

Não foi possível comprovar no destino:

- tabelas versus views físicas e schemas não expostos;
- constraints e índices completos;
- RLS/policies;
- triggers;
- funções não expostas, bodies, volatility e search_path;
- enums e extensões;
- grants/default ACLs;
- publicações;
- cron/jobs;
- ledger de migrations.

O RPC fn_list_cron_jobs e o wrapper fn_admin_security_definer_exposure filtram por auth.uid/role. Chamados como service_role sem usuário, retornam vazio; até validar o contrato esperado, isso é uma limitação do método de coleta, não defeito comprovado. A view direta de SECURITY DEFINER foi legível e originou os números críticos já registrados.

## Origem versus destino

O domínio da origem é fortemente orientado a catálogo, fornecedores, estoque e orçamento; o destino é orientado a CRM, gamificação, cadências e inteligência comercial. A diferença é muito maior do que drift normal.

### Relações

- Origem: 587 relações físicas/API no public, sendo 391 tabelas, 192 views e 4 MVs.
- Destino OpenAPI: 433 relações.
- Interseção nominal: apenas 23.
- Somente origem: 564.
- Somente destino: 410.

As 23 comuns são:

audit_log, ip_whitelist, login_attempts, notification_preferences, notifications, order_items, orders, password_reset_requests, permissions, price_history, products, push_subscriptions, query_telemetry, quote_items, quotes, role_permissions, roles, sales_goals, saved_filters, scheduled_reports, suppliers, user_roles e webhook_deliveries.

Mesmo nelas, há 529 colunas na origem, 261 no destino, somente 143 nomes comuns, 386 somente origem e 118 somente destino. products tem 184 colunas na origem e 18 no destino; quotes 60 versus 39; suppliers 42 versus 21; orders 37 versus 15.

### Funções/RPCs

- Origem: 976 nomes únicos, excluindo trigger/event-trigger.
- Destino: 210 RPCs.
- Interseção nominal: 11.
- Somente origem: 965.
- Somente destino: 199.

As 11 comuns são check_rate_limit, get_client_seasonality, get_client_top_products, get_industry_benchmark_stats, get_industry_seasonality, get_industry_top_products, has_permission, has_role, mark_all_notifications_read, refresh_materialized_views e search_products_semantic.

### Classificação responsável da divergência

**Defeitos e riscos comprovados, independentes da topologia:**

- chave service_role exposta e ativa;
- migrate-helper insegura e implantada na origem;
- WebAuthn sem verificação criptográfica;
- configuração SECURITY DEFINER do destino a revisar: 30 rotinas com EXECUTE para anon, 15 sem search_path e 11 com ambas as condições; explorabilidade não testada;
- job 297, trigger de preço no-op e partição futura sem RLS na origem.

**Incompatibilidades comprovadas, mas ainda não classificáveis como perda:**

- três buckets usados pelo código ausentes no destino;
- quatro relações/RPCs essenciais do código ausentes do contrato destino;
- tipos gerados defasados em ao menos 28 relações e 30 RPCs;
- 80 Edge Functions presentes na origem e ausentes no destino.

**Provavelmente intencionais:**

- schemas gerenciados Supabase;
- pais particionados sem linhas;
- partições futuras vazias em deny-by-default;
- façades públicas de catálogo;
- MVs populadas e indexadas;
- jobs 202/274 inativos, até confirmação de aposentadoria;
- diferenças decorrentes de produtos/domínios realmente distintos, se essa for a arquitetura desejada.

**Não classificáveis sem acesso adicional:**

- os 564/410 objetos exclusivos;
- os 965/199 nomes de rotina exclusivos;
- as incompatibilidades de bucket, contrato e deploy acima, até decidir qual projeto é canônico;
- 159 índices sem scan;
- 123 views sem consumidor direto;
- 343 rotinas sem consumidor visível;
- 62 trigger functions órfãs;
- 134 relações estimadas vazias;
- objetos profundos do destino não expostos.

Antes de qualquer sincronização, o proprietário precisa responder: a origem é banco de catálogo compartilhado e o destino é banco CRM separado, ou o destino deveria ser uma réplica/migração integral? Copiar ou apagar objetos antes dessa decisão causaria perda real.

## Candidatos a limpeza — aprovação obrigatória

Esta seção é deliberadamente uma **fila de decisão**, não uma lista de exclusão.

| Candidato | Evidência | Risco de apagar | Validação exigida | Proposta |
|---|---|---|---|---|
| bundle-stats/stats.json e stats.html | aproximadamente 9,4 MiB versionados apesar do ignore | perder baseline histórico | confirmar se CI/publicação os consome | regenerar como artefato de CI ou manter só baseline compacto |
| supabase/.temp versionado | 8 arquivos de link/versões/pooler; project-ref aponta destino | quebrar tooling de alguém | confrontar docs e CI | retirar do Git e regenerar localmente |
| deployed.txt e local.txt | dizem 10/170 enquanto live mostra 165/85 e local atual é 169 | perder runbook manual | achar consumidores em scripts/CI | substituir por inventário gerado por ambiente |
| package-lock.json, bun.lock e bun.lockb | três lockfiles | quebrar build de uma plataforma | escolher oficialmente npm ou Bun | manter um formato canônico e atualizar CI |
| cinco remove-demos*.ts | sobreposição nominal e segredo real | perder procedimento operacional | diff semântico e runbook | consolidar em comando idempotente e seguro |
| sete scripts de seed/análise com segredo | credencial real hardcoded | perder fixture útil | separar código de credencial | parametrizar por env/Vault; não excluir sem decisão |
| páginas ConversationalIntelligence.tsx e RaceArena.tsx | não alcançadas pelo entrypoint | feature flag/import externo | busca runtime e git history | remover ou redirecionar somente após evidência |
| 21 hooks, 2 services e 131 módulos de componente não alcançados | grafo determinístico | features futuras/barrels | imports dinâmicos, flags, telemetria | decisão por lote pequeno |
| duplicatas atoms/ui | três pares exatos; skeleton atoms ainda usado | quebrar imports/design system | codemod e testes visuais | escolher implementação canônica |
| oito zero-incoming do dependency-cruiser | nenhum import estático | scripts/import dinâmico | busca ampla e build | avaliar individualmente |
| lib/bi/mockData.ts | órfão | possível documentação/demo | busca e histórico | provável remoção após aprovação |
| relatórios históricos 10/10/production | contradizem estado atual | perder trilha de auditoria | política de documentação | mover para docs/history e marcar “histórico” |
| migrations com timestamp duplicado/futuro | 3 pares e 1 futura | destruir provenance/replay | ledger, checksum, ambientes | nunca renomear após aplicação; documentar e criar corretiva |
| 159 índices com idx_scan=0 | estatística de ~40 dias | degradar consultas sazonais | pg_stat maior, EXPLAIN e workload | revisão individual, não limpeza em massa |
| 62 trigger functions e 343 rotinas sem consumidor catalogável | ausência em catálogos | chamadas por app/Edge/SQL dinâmico | logs, busca de código e grants | quarentena/deprecação antes de eventual DROP |
| 123 views sem consumidor direto | sem dependência/grant direto | serviço/admin externo | logs PostgREST/SQL | inventariar owners e SLAs |
| 134 relações estimadas vazias | todas as independentes tiveram scan | perder estrutura futura | owner funcional e ciclo de dados | manter até decisão explícita |
| jobs 202 e 274 inativos | estado runtime | aposentadoria deliberada | runbook, owner, última execução | documentar ou reativar; não remover |
| cinco enums sem coluna | sem uso direto | uso por função/cast externo | dependências e código | deprecar antes de remover |

### Itens que **não** são lixo nesta auditoria

- qualquer tabela apenas por estar vazia;
- partições futuras ou pais particionados;
- schemas gerenciados do Supabase;
- migrations já registradas em qualquer ambiente;
- views/RPCs sem chamada literal no frontend;
- Edge Functions sem invocação estática, pois podem ser webhook/cron/API;
- índices sem scan em uma janela curta;
- arquivos com segredo que ainda contenham lógica operacional útil — primeiro parametrizar e preservar histórico de forma segura.

## Matriz de autorização necessária

| Ação futura | Pode ser feita sem nova autorização? |
|---|---|
| Corrigir código e testes em branch isolada | Sim, após aprovação deste plano como escopo |
| Ler logs/catálogos sem dados pessoais | Sim |
| Rotacionar qualquer segredo | **Não; autorização operacional explícita** |
| Desativar/deletar Edge Function implantada | **Não; autorização explícita** |
| DDL em tabela/coluna/constraint/índice/policy/função/trigger/view/enum/extensão/privilégio/job | **Não; autorização explícita por lote** |
| DML/limpeza de dados | **Não; autorização explícita e backup** |
| Reescrever histórico Git | **Não; autorização explícita e janela coordenada** |
| Remover arquivo candidato a lixo | **Não; aprovação nominal do lote** |
| Deploy, canário, mudança de tráfego ou merge de código funcional | **Não; gate de CI e autorização de release** |

## Plano de melhorias e correções em 100 etapas

Cada etapa gera evidência verificável. “Gate explícito” significa que a ação não pode avançar apenas porque este plano foi aprovado em geral.

### Fase A — contenção, custódia e linha de base

1. **Abrir incidente de credenciais.** Registrar os dois P0, owners, horário e cadeia de custódia sem copiar valores sensíveis. **Saída:** ticket de incidente. **Gate:** nenhum.
2. **Congelar deploys destrutivos.** Suspender migrations, deleções, alteração de grants e deploy não emergencial nos dois projetos. **Saída:** janela de mudança registrada. **Gate:** autorização operacional.
3. **Confirmar a função de cada projeto.** Decidir formalmente se origem é catálogo compartilhado e destino é CRM separado ou se deveria haver réplica/migração. **Saída:** ADR de topologia. **Gate:** decisão do proprietário.
4. **Desativar migrate-helper na origem.** Confirmar logs e remover a função do runtime sem chamar credentials. **Saída:** rota 404 e evidência de deploy. **Gate:** autorização explícita para Edge implantada.
5. **Rotacionar a chave fixa da migrate-helper.** Invalidar a credencial versionada e procurar uso legítimo. **Saída:** chave antiga rejeitada. **Gate:** autorização de segredo.
6. **Rotacionar service_role do destino.** Revogar a chave presente nos 12 scripts e atualizar consumidores autorizados via secrets manager. **Saída:** chave antiga rejeitada e smoke autorizado. **Gate:** autorização de segredo/janela.
7. **Rotacionar credenciais potencialmente exfiltráveis da origem.** Incluir service_role e conexão de banco após avaliar logs da migrate-helper. **Saída:** credenciais antigas rejeitadas. **Gate:** autorização de segredo/janela.
8. **Investigar uso indevido.** Consultar Auth, API, Edge, PostgREST e banco pelo período de exposição, preservando evidência e LGPD. **Saída:** relatório de impacto. **Gate:** acesso a logs.
9. **Bloquear login WebAuthn.** Desabilitar login-options/login-verify até existir verificação criptográfica completa. **Saída:** feature flag/rota bloqueada. **Gate:** autorização de runtime.
10. **Criar scorecard de prontidão real.** Substituir “10/10” por gates objetivos deste documento. **Saída:** painel baseline vermelho/amarelo/verde. **Gate:** nenhum.

### Fase B — acesso auditável e identidade dos ambientes

11. **Reparar o conector SQL somente leitura do destino.** Provisionar exec_sql seguro ou token Management API de leitura, sem função genérica gravável. **Saída:** SELECT de catálogo aprovado. **Gate:** autorização de infraestrutura.
12. **Capturar snapshots de catálogo.** Exportar metadados, nunca dados pessoais, de origem e destino no mesmo instante. **Saída:** manifests assinados. **Gate:** acesso RO.
13. **Registrar fingerprints dos projetos.** Project ref, região, versão Postgres/PostgREST, schemas e owners. **Saída:** inventário canônico. **Gate:** nenhum.
14. **Reconciliar referências de projeto.** Resolver config.toml, .temp, index.html, envs, scripts e CI que hoje apontam para três refs. **Saída:** matriz ambiente→ref. **Gate:** decisão de topologia.
15. **Definir fonte de verdade das migrations.** Escolher ledger canônico e política para 592 arquivos versus 2.354 entradas. **Saída:** ADR de migrations. **Gate:** decisão de arquitetura.
16. **Gerar tipos por ambiente.** Produzir tipos origem/destino separadamente, com commit/ref e PostgREST versionados. **Saída:** contratos reproduzíveis. **Gate:** acesso RO.
17. **Isolar toolchains Node/Bun/Deno.** Impedir que Deno altere node_modules do npm; fixar versões iguais às do CI. **Saída:** setup reproduzível. **Gate:** nenhum.
18. **Escolher package manager canônico.** Validar plataformas e decidir package-lock ou Bun; não apagar locks ainda. **Saída:** ADR e CI piloto. **Gate:** aprovação do lote de limpeza.
19. **Criar baseline automatizado de presença Edge.** Comparar local, origem e destino via Management API/OPTIONS seguro. **Saída:** manifest por ambiente. **Gate:** acesso RO.
20. **Criar baseline de tráfego e erros.** Mapear rotas, RPCs, relações, funções e jobs realmente usados por 30–90 dias. **Saída:** inventário de consumidores. **Gate:** retenção/logs disponíveis.

### Fase C — reconciliação integral dos bancos

21. **Comparar schemas e relações.** Classificar cada uma das 564/410 diferenças como intencional, faltante, renomeada ou obsoleta. **Saída:** matriz assinada por owner. **Gate:** catálogo destino completo.
22. **Comparar todas as colunas.** Tipo, nullable, default, identity, generated, comentário e posição por relação comum. **Saída:** diff de 386/118 nomes e demais estruturas. **Gate:** nenhum DDL.
23. **Comparar constraints.** PK, FK, UNIQUE, CHECK, deferrability, validação e ação referencial. **Saída:** diff com severidade. **Gate:** catálogo destino completo.
24. **Comparar índices.** Definição normalizada, include, parcial, expressão, validade, tamanho e uso. **Saída:** matriz de equivalência/perda. **Gate:** catálogo destino completo.
25. **Comparar RLS e FORCE RLS.** Cobertura por tabela/partição e efeito por role. **Saída:** mapa deny/allow real. **Gate:** catálogo destino completo.
26. **Comparar policies.** Roles, comando, permissiva/restritiva, USING e WITH CHECK semanticamente normalizados. **Saída:** diff revisável. **Gate:** catálogo destino completo.
27. **Comparar rotinas.** Assinatura, body hash, owner, volatility, parallel, SECURITY DEFINER/INVOKER, search_path e grants. **Saída:** diff das 965/199 diferenças. **Gate:** catálogo destino completo.
28. **Comparar triggers, views e MVs.** Consumers, security_invoker, dependências, refresh e índices únicos. **Saída:** grafo de impacto. **Gate:** catálogo destino completo.
29. **Comparar enums, extensões e publicações.** Valores/ordem, versões, schemas e tabelas Realtime. **Saída:** diff de infraestrutura. **Gate:** catálogo destino completo.
30. **Comparar privilégios, jobs e ledger.** ACL/default ACL, sequences, cron, Vault e checksums de migration. **Saída:** reconciliação completa, sem aplicar nada. **Gate:** autorização apenas para leitura.

### Fase D — hardening de banco

31. **Corrigir a partição p2026_11.** Preparar migration para habilitar RLS e alinhar grants/policies com o pai. **Saída:** teste de acesso direto e pelo pai. **Gate:** autorização DDL explícita.
32. **Corrigir o job 297.** Mover VACUUM para mecanismo que rode fora de transação ou substituir por manutenção suportada. **Saída:** execução bem-sucedida. **Gate:** autorização de job.
33. **Implementar o log de preço.** Definir payload, retenção e idempotência de fn_log_price_change/trg_log_price_change. **Saída:** teste de mudança auditada. **Gate:** autorização de função/trigger.
34. **Fechar default ACLs.** Revogar grants futuros excessivos de postgres e supabase_admin, preservando Supabase gerenciado. **Saída:** teste de criação de objeto. **Gate:** autorização de privilégios.
35. **Reduzir grants de tabelas e sequences.** Remover MAINTAIN/REFERENCES/TRIGGER e escrita de anon onde não justificada. **Saída:** matriz mínima por role. **Gate:** autorização por lote.
36. **Revisar policies literais true.** Classificar as 176 USING e 48 CHECK; substituir somente as não intencionais. **Saída:** testes anon/authenticated/service_role. **Gate:** autorização RLS por lote.
37. **Minimizar façades públicas.** Reduzir v_products_public e revisar as nove views owner-context. **Saída:** contrato público aprovado. **Gate:** decisão funcional e DDL.
38. **Rever MVs/publicações.** Remover acesso direto desnecessário a internal.mv_product_leaf_category e validar auth.users no Realtime. **Saída:** testes Realtime/API. **Gate:** autorização de grants/publicação.
39. **Endurecer SECURITY DEFINER.** Revalidar as 10 da origem e 217 do destino; fixar search_path, ownership e EXECUTE mínimo. **Saída:** zero rotina mutável perigosa para anon. **Gate:** autorização função/grants.
40. **Resolver stubs de banco.** Implementar, desativar ou deprecar os no-ops e as 11 rotinas marcadas, começando pelas que têm consumidor. **Saída:** decisão nominal e teste por rotina. **Gate:** autorização de função/trigger.

### Fase E — estabilização das Edge Functions

41. **Eliminar os sete erros de parser.** Remover bytes U+0001 e corrigir imports/fechamentos/type query com diff mínimo. **Saída:** sete deno check verdes. **Gate:** nenhum DDL.
42. **Corrigir _shared/retry.ts.** Tornar telemetry coerente e validar os cinco consumidores quebrados. **Saída:** testes unitários de retry e cinco checks verdes. **Gate:** nenhum.
43. **Zerar as outras 33 falhas TypeScript.** Corrigir por domínio, sem casts que escondam drift. **Saída:** 169/169 deno check. **Gate:** nenhum DDL.
44. **Tornar check de tipos bloqueante no CI.** Falhar por qualquer erro TS, sintaxe, import não versionado ou byte de controle. **Saída:** teste negativo do workflow. **Gate:** nenhum.
45. **Reconciliar tabelas, RPCs e campos usados pelas Edges.** Resolver leads, lead_routing_assignments, team_members, enqueue_email e 76 usos de campo incompatível. **Saída:** contratos gerados sem escape untyped. **Gate:** DDL somente se aprovado.
46. **Unificar sales.status.** Definir enum/vocabulário canônico e migrar filtros/fixtures/constraint. **Saída:** testes de cada funil. **Gate:** decisão de negócio e possível DDL.
47. **Projetar autenticação dos endpoints externos.** JWT, HMAC/provider signature, state/PKCE, anti-replay e rate limit por rota. **Saída:** threat model e testes negativos. **Gate:** mudança de config/deploy.
48. **Aplicar autorização/ownership nas funções service-role.** Priorizar as 74 que escrevem e os casos globais listados. **Saída:** matriz função→papel→escopo e testes. **Gate:** deploy Edge autorizado.
49. **Consertar envio de quote.** Criar/ligar serviço transacional real e alinhar payload/auth do multicanal, com idempotência. **Saída:** quote→e-mail/WhatsApp em staging. **Gate:** credenciais/provider e deploy.
50. **Remover simulação persistida como sucesso.** Corrigir enrich-lead, workflow-executor e mock multicanal; registrar provenance explícita. **Saída:** nenhum dado fabricado em tabelas reais. **Gate:** decisão de produto.

### Fase F — integridade do frontend e produto

51. **Parametrizar os 12 scripts secretos.** Ler env/Vault, negar execução sem project ref explícito e adicionar dry-run. **Saída:** gitleaks limpo no HEAD. **Gate:** nenhum segredo novo.
52. **Planejar expurgo do histórico.** Mapear clones, branches, tags, CI e consumidores antes de git-filter-repo. **Saída:** runbook e janela. **Gate:** autorização explícita para reescrita.
53. **Mover a roleta para RPC atômica.** Sorteio, saldo, prêmio e ledger em uma transação com idempotência. **Saída:** testes concorrentes/adversariais. **Gate:** autorização DDL/RLS.
54. **Isolar todos os mocks produtivos.** Substituir por dados reais ou modo DEMO não persistente com banner. **Saída:** catálogo dos 15 casos e testes. **Gate:** decisão produto por módulo.
55. **Consertar assinatura digital.** Integrar provedor/e-mail, callbacks assinados e estado verificável; não declarar envio antes da entrega. **Saída:** fluxo E2E em staging. **Gate:** custo/provedor.
56. **Consertar contratos do frontend.** Resolver auth_users_view e orders→profiles, regenerar tipos e remover casts de bypass. **Saída:** testes de Configurações e histórico. **Gate:** possível DDL.
57. **Ligar lead routing ao backend.** Tornar auto_assign_lead consumido e round-robin transacional, sem localStorage/N+1. **Saída:** teste concorrente multiusuário. **Gate:** autorização RPC/trigger.
58. **Corrigir navegação de pedidos.** Criar /meus-pedidos ou ajustar retorno/produtores de links; separar acompanhamento real de demo. **Saída:** E2E de lista→detalhe→volta. **Gate:** nenhum.
59. **Resolver privacidade da rota espectador.** Definir campos públicos, pseudonimização e grants; criar produtor de link seguro/expirável. **Saída:** teste anon e privacy review. **Gate:** decisão de negócio/RLS.
60. **Unificar semântica de venda ganha.** Centralizar completed/won/closed e adaptar KPIs/LTV/Edge/DB. **Saída:** contrato e fixtures canônicas. **Gate:** decisão de negócio.

### Fase G — completar funcionalidades parciais

61. **Inventariar cada ação sem efeito.** Para os 16 módulos, decidir implementar, ocultar ou marcar “em breve”. **Saída:** matriz botão→efeito→owner. **Gate:** decisão produto.
62. **Persistir onboarding.** Modelar ownership, etapas e auditoria ou remover a promessa da rota. **Saída:** reload/multiusuário preserva estado. **Gate:** autorização de modelo DB.
63. **Corrigir Follow-up Audit.** Remover mistura/fallback silencioso e exibir erro/estado vazio honestos. **Saída:** testes sucesso, vazio e falha. **Gate:** nenhum DDL se view existir.
64. **Corrigir Usage Analytics.** Coletar eventos reais de página/login com privacidade e retenção; remover aleatoriedade. **Saída:** métricas rastreáveis. **Gate:** modelo de telemetria/LGPD.
65. **Completar BI, SDR e pricing.** Substituir benchmarks, scores e curvas fabricados por fontes/provenance ou modo demo. **Saída:** cada card informa fonte e timestamp. **Gate:** decisão de dados.
66. **Completar Conversational Intelligence.** Ligar upload, transcrição, diarização, feed e coaching a contratos reais. **Saída:** chamada→transcrição→insight E2E. **Gate:** provedor/custo e storage.
67. **Criar os três buckets faltantes.** Definir policies, limites, MIME, retenção e antivírus para call-recordings, quote-pdfs e report-snapshots. **Saída:** testes por role. **Gate:** autorização Storage.
68. **Completar workflows e multicanal.** Executar ações reais, callbacks assinados, retries/DLQ e estados truthful. **Saída:** E2E de sucesso/falha/retry. **Gate:** provedores e deploy.
69. **Reconciliar integrações externas.** Bitrix24, Twilio, ElevenLabs, e-mail e webhooks com secret inventory e health checks. **Saída:** matriz configured/degraded/disabled. **Gate:** credenciais/custo.
70. **Criar Definition of Done por rota.** Para as 174 rotas, exigir UI, contrato, auth, estados, testes, observabilidade e tráfego. **Saída:** catálogo 174/174 sem “pronta” por inferência. **Gate:** owners.

### Fase H — dados, performance e confiabilidade

71. **Paginar consultas ilimitadas.** Priorizar clientes, produtos, atividades e ranking; selecionar colunas mínimas. **Saída:** limites e cursor testados. **Gate:** nenhum DDL inicial.
72. **Corrigir filtros .in de alta cardinalidade.** Substituir quatro violações por join/RPC/batching seguro. **Saída:** testes unitários verdes e carga limite. **Gate:** possível RPC.
73. **Eliminar N+1 e agregações no cliente.** Migrar ranking, carga de vendedores e KPIs para queries/RPCs indexáveis. **Saída:** orçamento de queries por tela. **Gate:** possível DDL.
74. **Validar índices por workload.** Correlacionar os 159 sem scan com query plans e sazonalidade; criar/drop somente individualmente. **Saída:** parecer por índice. **Gate:** autorização explícita por índice.
75. **Revisar partições e retenção.** Garantir criação futura com RLS/grants herdados, archival e vacuum/analyze. **Saída:** teste de próxima partição. **Gate:** autorização DDL/job.
76. **Tornar jobs observáveis.** Owner, SLA, timeout, idempotência, retry e alerta para os 137 jobs. **Saída:** catálogo e zero falha silenciosa. **Gate:** mudança de job autorizada.
77. **Implementar concorrência segura.** Locks/constraints/idempotency em prêmio, lead routing, cadências, quotes, workflows e webhooks. **Saída:** testes de corrida. **Gate:** possível DDL.
78. **Definir retenção de auditoria e telemetria.** Separar segurança, negócio e debug conforme LGPD. **Saída:** política e jobs testados. **Gate:** aprovação jurídica/negócio.
79. **Criar SLOs e tracing ponta a ponta.** request_id de browser→Edge→PostgREST/provider, métricas RED e alertas acionáveis. **Saída:** dashboards e runbook. **Gate:** infraestrutura.
80. **Testar backup e restauração.** PITR, Storage, secrets, migrations e restore drill isolado. **Saída:** RPO/RTO medidos. **Gate:** ambiente/custo.

### Fase I — qualidade e segurança contínuas

81. **Zerar lint atual.** Corrigir 5 erros e revisar 19 warnings sem refatoração ampla. **Saída:** npm run lint verde. **Gate:** nenhum.
82. **Corrigir testes unitários.** Resolver as três falhas e os quatro casos de cardinalidade sem afrouxar asserts. **Saída:** Vitest 100% verde. **Gate:** nenhum.
83. **Medir cobertura real.** Incluir todo src elegível, separar generated/UI trivial e elevar progressivamente até 85% significativo. **Saída:** relatório não-curado. **Gate:** política de qualidade.
84. **Executar E2E autenticado no CI.** Contas/fixtures isoladas, secrets protegidos e cleanup; falhar quando auth não estiver configurada. **Saída:** fluxos críticos não pulados. **Gate:** ambiente de teste.
85. **Expandir acessibilidade.** Cobrir 174 rotas por amostragem de estados, remover suppressions justificadas e nomear 82 botões. **Saída:** axe/teclado/reader gates. **Gate:** nenhum.
86. **Automatizar testes Edge.** Testes por 169 entrypoints, contratos, auth negativa, CORS, SSRF, webhooks e service-role. **Saída:** cobertura por função. **Gate:** ambiente isolado.
87. **Endurecer supply chain.** Resolver 15 vulnerabilidades, pin Deno/npm, SBOM, Dependabot e gitleaks em pre-receive/CI. **Saída:** zero crítica/alta sem aceite. **Gate:** upgrades avaliados.
88. **Endurecer CSP e storage do browser.** Remover unsafe-eval/inline progressivamente e reduzir JWT/dados sensíveis persistidos. **Saída:** CSP report-only→enforced. **Gate:** plano de compatibilidade.
89. **Definir budgets de performance.** Chunks, LCP/INP/CLS, queries, memória e PWA; quebrar módulos/chunks apenas por hotspot medido. **Saída:** gate de regressão. **Gate:** nenhum.
90. **Executar carga e caos controlados.** Rate limits, retries, DLQ, providers fora, DB lento e concorrência, nunca em produção sem janela. **Saída:** relatório e capacidade. **Gate:** ambiente/custo.

### Fase J — limpeza governada e liberação

91. **Publicar manifesto de candidatos.** Listar hash, tamanho, owner, último uso e motivo para cada arquivo/objeto, sem deletar. **Saída:** checklist aprovável. **Gate:** nenhum.
92. **Validar os 131 módulos, 21 hooks, 2 services e 2 páginas.** Cruzar imports, flags, telemetria, docs e owners. **Saída:** manter/migrar/deprecar por item. **Gate:** nenhum.
93. **Consolidar duplicatas e scripts.** Escolher atoms/ui e um remove-demos seguro por lote pequeno. **Saída:** imports migrados e testes verdes. **Gate:** aprovação nominal de arquivos.
94. **Limpar artefatos de tooling.** Tratar bundle-stats, supabase/.temp e manifests stale, preservando geração automatizada. **Saída:** redução mensurada do Git. **Gate:** aprovação nominal de arquivos.
95. **Normalizar locks e documentação histórica.** Manter lock canônico e mover alegações antigas para history com cabeçalho de validade. **Saída:** onboarding/CI reproduzível. **Gate:** aprovação nominal.
96. **Deprecar antes de remover objetos de banco.** Revogar consumidores em staging, alertar uso e observar ao menos um ciclo de negócio. **Saída:** zero chamada no período acordado. **Gate:** autorização por objeto.
97. **Submeter lote de remoção ao proprietário.** Mostrar evidência, impacto, rollback e backup de cada item. **Saída:** aprovação/rejeição explícita nominal. **Gate:** obrigatório.
98. **Fazer canário com rollback automático.** Aplicar correções aprovadas em staging/canário, observar SLOs e tráfego real. **Saída:** evidência de estabilidade. **Gate:** autorização de release.
99. **Executar smoke ponta a ponta em produção.** Login, quote→sale, pedido, webhook, gamificação, relatórios e jobs sem fabricar dados. **Saída:** evidência assinada e sem PII. **Gate:** janela/tráfego autorizado.
100. **Certificar ou rejeitar prontidão.** Só declarar pronto quando P0/P1 estiverem fechados, CI verde, reconciliação aprovada, restore testado e tráfego real saudável. **Saída:** ata go/no-go e backlog residual. **Gate:** proprietário, engenharia e operação.

## Critérios finais de aceite

O sistema somente pode ser chamado de pronto quando:

- nenhum segredo privilegiado versionado estiver ativo;
- migrate-helper e fluxos de teste/abuso não estiverem expostos;
- WebAuthn tiver verificação criptográfica completa ou estiver desabilitado;
- 169/169 Edge Functions locais passarem check e as implantadas corresponderem ao ambiente decidido;
- grants, RLS e SECURITY DEFINER tiverem testes por papel;
- origem/destino tiverem topologia e diferenças formalmente aprovadas;
- CI obrigatório estiver verde sem skips silenciosos;
- nenhum mock silencioso contaminar métricas ou dados;
- backup/restore e rollback tiverem evidência recente;
- os principais fluxos tiverem tráfego real observado dentro dos SLOs;
- toda exclusão tiver aprovação nominal, backup e rollback.

## Próximas autorizações recomendadas

Por ordem:

- autorização emergencial para desativar migrate-helper na origem e rotacionar as credenciais potencialmente expostas;
- autorização para bloquear WebAuthn até o conserto;
- autorização para reparar acesso SQL somente leitura do destino;
- decisão arquitetural sobre a relação origem/destino;
- aprovação de uma primeira onda **sem DDL**: corrigir parser/types/lint/testes e parametrizar scripts;
- somente depois, aprovações DDL/grants/RLS por lotes pequenos e reversíveis;
- limpeza de arquivos e objetos apenas após o manifesto nominal da etapa 97.

## Apêndice A — 131 módulos de componentes não alcançados

Lista reproduzida pelo grafo determinístico do dependency-cruiser, partindo de src/main.tsx e incluindo imports dinâmicos resolvíveis. Foram excluídos testes, specs e stories. Alguns itens são barrels/helpers, não necessariamente componentes React.

**accessibility:** FocusTrap.tsx, LiveRegion.tsx, index.ts.

**activities:** ActivityGoalCard.tsx.

**analytics:** ConversionAnalysis.tsx, DemandForecast.tsx, ProductMix.tsx, SalesForecast.tsx.

**atoms:** SmartImage.tsx, badge.tsx, button.tsx, card.tsx, input.tsx.

**auth:** PermissionGate.tsx.

**cadences:** CadenceMetricsPanel.tsx, EnrollCadenceDialog.tsx, ProspectCadenceControls.tsx.

**collaboration:** MentionInput.tsx.

**conversational:** CallRecordingPlayer.tsx, CallRecordingUploader.tsx, CallStatsPanel.tsx, CoachingProgressCard.tsx, DiarizeButton.tsx, SentimentBadge.tsx, TranscribeButton.tsx, TranscriptViewer.tsx.

**copilot:** AICopilotFab.tsx.

**dashboard:** ActivityChart.tsx, ActivityItem.tsx, ClientInfoCard.tsx, EnhancedStatCard.tsx, GoalProgressCard.tsx, MyAssignedTasks.tsx, PipelineOverview.tsx, StatCardCompact.tsx, TimeRangePicker.tsx.

**deal-intelligence:** BuyingCommitteeCard.tsx, CommitteeCoverageRing.tsx, DMURoleBadge.tsx, DealHealthCard.tsx, DealHealthFactorsList.tsx, DealHealthSparkline.tsx, DealVelocityCard.tsx, StakeholderFormDialog.tsx, StakeholderListItem.tsx, VelocityForecastTimeline.tsx, VelocityStatusBadge.tsx, committee/CommitteeCoverageSparkline.tsx, committee/CommitteeExtractionBadge.tsx, committee/RoleCoverageMatrix.tsx, velocity/StageTransitionsTimeline.tsx, velocity/StageVelocityCard.tsx, velocityHelpers.ts.

**effects:** AnimatedCoinsIndicator.tsx, AnimatedFireIndicator.tsx, AnimatedLevelIndicator.tsx, AnimatedXPParticles.tsx, ComboExplosion.tsx.

**engagement:** EmailScore/EmailScoreCard.tsx, EngagementScoreCard.tsx, SendTime/SendTimeBadge.tsx.

**errors:** PageErrorBoundary.tsx, withErrorBoundary.tsx.

**gamification:** AchievementCard.tsx, BadgeDisplay.tsx, ComboIndicator.tsx, CompetitiveLeaderboard.tsx, FlashSalesBanner.tsx, LeaderboardCard.tsx, PointsDisplay.tsx, ProgressRing.tsx, RealtimeXPRanking.tsx, SeasonalEventBanner.tsx, StreakCounter.tsx, XPBar.tsx, XPHistoryTimeline.tsx, XPRankingRow.tsx, XPTimelineItem.tsx.

**goals:** GoalTracker.tsx.

**molecules:** SlideOverPanel.tsx.

**pipeline:** AIEmailWriter.tsx, DealAutoSummary.tsx, DealTimeline.tsx, ExplainableWinProbability.tsx, QuickActions.tsx, SLAIndicator.tsx, dealTimelineConstants.tsx.

**profile:** ProfilePerformanceCard.tsx.

**race:** MiniMap.tsx, ProportionalFireworks.tsx, RaceAchievementShareCard.tsx, RaceSidebarSkeleton.tsx, SeasonReplayModal.tsx.

**security:** BlockedIPsPanel.tsx, IPWhitelistPanel.tsx, KnownDevices.tsx, MFASetup.tsx, MFATotpTab.tsx, MFAVerification.tsx, PushNotificationSettings.tsx, RateLimitDashboard.tsx, RateLimitStatsCards.tsx, ReauthDialog.tsx, RoleManager.tsx, SessionManager.tsx.

**sequences:** BestSendWindowCard.tsx.

**settings:** SecurityAlertSoundSettings.tsx, SettingsPanel.tsx.

**shared:** EmptyStateClients.tsx, ExportButton.tsx.

**tasks:** TaskCard.tsx, TaskListAdvanced.tsx.

**teams:** MemberList.tsx.

**ui:** Microinteractions.tsx, accordion.tsx, command-palette.tsx, enhanced-select.tsx, expandable-card.tsx, floating-action-button.tsx, password-input.tsx, password-strength.tsx, premium-empty-state.tsx, ripple-button.tsx, sonner.tsx, stepper.tsx, swipeable-card.tsx.

**win-loss:** DashboardLayoutEditor.tsx, UpsellSuggestionCard.tsx, WebhookDeliveryItem.tsx, WebhookReplayHistory.tsx, WinLossSkeletons.tsx.

## Apêndice B — rotinas parciais e trigger functions órfãs na origem

As 11 rotinas com marcador explícito são:

- fn_apply_transform — placeholder;
- fn_decompose_kit_from_ficha — placeholder;
- fn_generate_category_jsonld — TODO;
- fn_normalize_ncm — placeholder;
- fn_parse_product_weight — placeholder;
- fn_product_name_quality_score — TODO;
- fn_sm_pipeline_health — placeholder;
- fn_sm_session_check — placeholder;
- fn_spot_batch_to_silver — TODO;
- purge_expired_security_data — placeholder;
- trg_categories_seo_autofill — TODO.

O marcador pode estar apenas em comentário/texto; o corpo precisa de inspeção semântica antes de ser declarado incompleto.

As 62 trigger functions realmente sem consumidor são:

audit_mcp_api_keys_changes, audit_mcp_key_insert, audit_mcp_key_revoke, audit_user_role_changes, cleanup_old_telemetry, enforce_created_by_owner, ensure_single_primary_image, fill_integration_credential_metadata, fn_audit_role_changes, fn_auto_classify_packing, fn_cor_generate_slug, fn_cor_updated_at, fn_force_user_logout, fn_handle_new_user, fn_hex_to_rgb, fn_inherit_techniques_from_material, fn_log_login_attempt, fn_log_step_up_event, fn_silver_set_updated_at, fn_sync_novelty_to_product, fn_sync_vss_to_variant, fn_trigger_auto_sync_dimensions, fn_trigger_variant_price, fn_update_product_search_vector, fn_validate_role_change, generate_order_number, generate_order_number_v3, guard_mcp_api_keys_writes, limit_recently_viewed_products, log_mcp_key_changes, log_mcp_key_revocation, log_price_change, magic_up_audit_changes, mark_for_processing_trigger, move_favorite_to_trash, notify_new_order, prevent_profile_role_change, prevent_role_self_update, set_is_imported_from_origin, set_optimization_queue_updated_at, sync_order_payment_status, tg_set_updated_at, trg_auto_revoke_mcp_on_role_loss, trg_sync_external_connections, trg_update_is_thermal, trg_validate_allowed_techniques, trigger_auto_classify_product, trigger_gerar_nome_variante, trigger_mark_for_processing, trigger_set_updated_at, trim_connection_test_history, update_app_settings_timestamp, update_categories_updated_at, update_notebook_tables_timestamp, update_print_area_images_updated_at, update_product_images_timestamp, update_product_videos_timestamp, update_staging_updated_at, validate_discount_approval_status, validate_ip_access_control, validate_secret_rotation_action_type e voice_command_audit.

## Apêndice C — 343 objetos de rotina sem consumidor catalogável

São 343 objetos e 340 nomes únicos por causa de três overloads. Critério: sem trigger consumidor, dependência reversa em pg_depend, nome em cron.job ou EXECUTE para anon/authenticated. Chamadas pela aplicação, Edge, service_role, SQL dinâmico ou nomes armazenados em dados não são detectadas; portanto, esta lista **não autoriza DROP**.

### Gerais

~~~text
_get_user_primary_role
audit_mcp_api_keys_changes
audit_mcp_key_insert
audit_mcp_key_revoke
audit_ownership_orphans
audit_rls_coverage
audit_rls_matrix
audit_user_role_changes
auto_revoke_orphan_full_keys
block_ip_temp
calculate_seo_score
check_auth_throttling
check_edge_rate_limit
check_geo_country_allowed
check_ip_access
check_mcp_abuse_threshold
check_owner_email
check_telemetry_regression
claim_next_optimization
claim_webhook_delivery
classify_product_origin
classify_xbz_category(p_product_name text)
classify_xbz_category(p_raw_data jsonb)
clean_old_audit_logs
clean_old_rate_limits
cleanup_discount_test_data
cleanup_expired_collection_trash
cleanup_expired_favorite_trash
cleanup_expired_novelties
cleanup_expired_public_comparisons
cleanup_expired_step_up
cleanup_expired_step_up_tokens
cleanup_old_login_attempts
cleanup_old_logs
cleanup_old_notifications
cleanup_old_telemetry
cleanup_orphan_step_up_artifacts
cleanup_rate_limits
cleanup_webhook_logs
clear_auth_attempts
clear_user_token_revocations
complete_optimization
cron_invoke_edge
detect_geo_violations
e2e_cleanup_check_rate_limit
enforce_created_by_owner
enqueue_optimization
ensure_single_primary_image
execute_role_migration_batch
fill_integration_credential_metadata
force_logout_all_users
force_user_logout
generate_order_number
generate_order_number_v3
get_pending_images_for_sync
get_pending_videos_for_sync
get_public_schema_signatures
get_vault_secret
grant_mcp_full_to_user
guard_mcp_api_keys_writes
increment_webhook_stats
limit_recently_viewed_products
log_audit
log_full_scope_grant
log_login_attempt
log_mcp_key_changes
log_mcp_key_revocation
log_price_change
log_step_up_audit
log_voice_command
magazine_auto_archive_stale_drafts
magazine_cleanup_orphan_state
magazine_cleanup_view_events
magic_up_audit_changes
maintain_webhook_metrics
mark_for_processing_trigger
mcp_audit_violation
mcp_kv_set
mcp_kv_try_lock
move_favorite_to_trash
notify_hardening_regression
notify_new_order
ownership_check_orphans
ownership_repair
prevent_profile_role_change
prevent_role_self_update
process_notifications_queue
process_supplier_product
process_supplier_products_batch
purge_edge_invocations_old
purge_favorite_trash_old
purge_old_audit_logs
rate_limit_check
reconcile_cf_image_status
record_app_vital
record_auth_attempt
record_mcp_access_violation
record_public_token_failure
record_schema_drift_result
register_ai_routing_decision
release_webhook_delivery_lock
repair_ownership_orphans
reset_mockup_credit_limits
reset_optimization_queue
reset_user_step_up_state
retry_failed_webhook_deliveries
revoke_all_user_tokens
revoke_mcp_full_from_user
rpc_enrich_kit_component
seed_discount_test_users
send_digest_notification
set_is_imported_from_origin
set_optimization_queue_updated_at
sincronizar_estoque_spot
snapshot_hardening_status
store_user_token_revocation
sync_external_connections_from_credentials()
sync_external_connections_from_credentials(_trigger_secret_name text, _trigger_op text, _trigger_user_id uuid)
sync_order_payment_status
tg_set_updated_at
trg_auto_revoke_mcp_on_role_loss
trg_sync_external_connections
trg_update_is_thermal
trg_validate_allowed_techniques
trigger_auto_classify_product
trigger_gerar_nome_variante
trigger_mark_for_processing
trigger_set_updated_at
trim_connection_test_history
unblock_ip
update_app_settings_timestamp
update_categories_updated_at
update_notebook_tables_timestamp
update_preferred_suppliers
update_print_area_images_updated_at
update_product_images_timestamp
update_product_videos_timestamp
update_staging_updated_at
validate_discount_approval_status
validate_edge_functions_base_url
validate_ip_access_control
validate_secret_rotation_action_type
vault_delete_secret
vault_get_secret
vault_list_secret_names
vault_set_secret
voice_command_audit
~~~

### Prefixos fn_a a fn_c

~~~text
fn_admin_sync_external_connections
fn_ai_quota_summary
fn_anon_access_audit
fn_apply_auto_tag_rules
fn_apply_crm_callback
fn_apply_supplier_flag_tags
fn_asia_complete_image_upload
fn_asia_complete_image_upload_batch
fn_asia_dispatch_queue_batch
fn_asia_enqueue_videos
fn_asia_find_not_found
fn_asia_fix_multi_main_images
fn_asia_harvest_queue_batch
fn_asia_import_youtube_videos
fn_asia_ingest_all_pages
fn_asia_legacy_dispatch_batch
fn_asia_legacy_harvest_batch
fn_asia_legacy_run_cycle
fn_asia_link_video
fn_asia_mark_upload_error
fn_asia_monitor_variants
fn_asia_populate_image_queue
fn_asia_recover_stale_queue
fn_asia_site_promote_to_gold
fn_asia_stock_fast_sync
fn_assert_public_contract
fn_auto_similarity_groups_v2
fn_auto_similarity_groups_v3
fn_backfill_all_product_tags
fn_backfill_asia_properties
fn_backfill_is_thermal
fn_bronze_mark_absent
fn_bulk_request_deactivation
fn_bulk_update_image_dimensions
fn_capture_schema_baseline
fn_cf_collect_sm_legacy_dispatch
fn_cf_collect_sm_legacy_harvest
fn_cf_recon_collect
fn_cf_recon_dispatch
fn_cf_sm_legacy_insert_batch
fn_check_rowtype_staleness
fn_cleanup_log_tables
fn_color_link_all_suppliers
fn_compute_and_record_drift
fn_cron_watchdog
~~~

### Prefixos fn_d a fn_h

~~~text
fn_decompose_kit_from_ficha
fn_dequeue_ai_enrichment
fn_dryrun_raw_v2
fn_dryrun_standardize_supplier
fn_ema_kpi_by_level
fn_enrich_asia_components_batch
fn_enrich_pen_categories
fn_enrich_properties_batch
fn_expire_novelties
fn_extract_dimensions_from_text
fn_extract_item_dims_xbz_from_bronze
fn_extract_kit_dims_from_somarcas_bronze
fn_extract_kit_dims_from_spot_bronze
fn_extract_kit_dims_from_xbz_bronze
fn_extract_notebook_feature_codes
fn_extract_pkg_dims_from_bronze
fn_fetch_xbz_ficha
fn_generate_trends_insights
fn_get_asia_api_key
fn_get_asia_product_dims_for_kit
fn_get_asia_secret_key
fn_get_cf_account_id
fn_get_cf_api_token
fn_get_cf_credentials
fn_get_image_upload_queue
fn_get_sm_session_cookie
fn_get_spot_access_key
fn_get_spot_feb2026_ids
fn_handle_new_user
fn_health_check_gravacao
~~~

### Prefixos fn_i a fn_p

~~~text
fn_ingest_asia_api_batch
fn_ingest_asia_hg_batch
fn_ingest_asia_hg_batch_debug
fn_ingest_asia_hg_debug_sample
fn_ingest_bronze_batch
fn_ingest_colors_batch
fn_ingest_customization_options_batch
fn_ingestion_health
fn_ingestion_run_close
fn_ingestion_run_open
fn_is_bulk_import_mode
fn_is_graphic_material
fn_kit_from_ficha
fn_link_asia_colors_from_bronze
fn_link_cf_image
fn_link_sm_colors_from_title
fn_match_canonical_color
fn_notebook_specs_health
fn_parse_binding_color_code
fn_parse_binding_type_code
fn_parse_cover_material_code
fn_parse_cover_type_code
fn_parse_ficha_tecnica_text
fn_parse_kit_page_dimensions
fn_parse_paper_color_code
fn_parse_paper_format
fn_parse_paper_ruling
fn_parse_paper_weight
fn_parse_sheet_count
fn_pipeline_health_monitor
fn_process_all_kit_component_enrichments
fn_process_raw_v2
fn_product_images_health_check
fn_promote_customization_to_gold
fn_promote_kit_component_padronizacao
fn_promote_padronizacao
~~~

### Prefixos fn_q a fn_z

~~~text
fn_rebuild_category_ancestors
fn_rebuild_color_swatches
fn_recalc_has_optional_packaging
fn_repair_canonical_chains
fn_resolve_supplier
fn_resync_product_image_urls
fn_resync_product_media
fn_run_schema_drift_check
fn_run_smoke_tests
fn_rupture_anomalia_report
fn_rupture_health_check
fn_save_ai_enrichment_results
fn_site_pipeline_health
fn_site_promote_to_gold
fn_sm_category_seed
fn_sm_enqueue_videos
fn_sm_link_video
fn_sm_pipeline_health
fn_sm_populate_colors
fn_sm_populate_videos_from_site
fn_sm_promote_videos_from_site
fn_sm_site_collect
fn_sm_site_enqueue
fn_sm_to_silver
fn_sm_url_map_from_site_urls
fn_smoke_tests_categorization
fn_spot_color_integrity_check
fn_spot_customization_prices_to_gold
fn_spot_detect_new_images
fn_spot_direct_prices_gold
fn_spot_direct_stock_gold
fn_spot_enqueue_new_videos
fn_spot_enqueue_vimeo_eu
fn_spot_enrich_image_colors
fn_spot_eu_diff_get_refs
fn_spot_fix_materials
fn_spot_gold_enrich
fn_spot_link_video
fn_spot_print_positions
fn_spot_process_batch
fn_spot_process_ref
fn_spot_reconcile_variant_to_legacy
fn_spot_silver_enrich
fn_spot_variant_repl_enrich
fn_spot_vimeo_daily_sync
fn_standardize_kit_component
fn_standardize_supplier
fn_sync_all_is_new
fn_sync_asia_colors
fn_sync_novelty_to_product
fn_sync_product_physical_from_products
fn_sync_products_videos_cache
fn_sync_profile_role_from_user_roles
fn_sync_stock_bronze_to_gold
fn_sync_stock_bronze_to_gold_spot
fn_tag_product_complete
fn_trigger_schema_drift_fetch
fn_update_image_dimensions
fn_upsert_asia_wp_batch
fn_upsert_stock_to_bronze(p_sku text, p_quantity integer, p_next_date1 text, p_next_qty1 integer)
fn_upsert_stock_to_bronze(p_supplier_id uuid, p_items jsonb)
fn_upsert_stocks_bulk_spot
fn_vacuum_high_dead_tuples
fn_video_link
fn_video_link_to_products
fn_video_queue_next
fn_video_queue_old_uid
fn_video_queue_update
fn_video_retry_errors
fn_video_set_dimensions
fn_video_sim_export
fn_video_sim_upsert
fn_xbz_dispatch_image_batch
fn_xbz_enqueue_videos
fn_xbz_enrich_stock_batch
fn_xbz_harvest_image_batch
fn_xbz_link_images_to_colors
fn_xbz_link_video
fn_xbz_populate_images_from_site
fn_xbz_populate_videos_from_site
fn_xbz_recover_stale
fn_xbz_run_image_cycle
fn_xbz_site_enqueue
fn_xbz_stock_fast_sync
fn_xbz_stock_fast_sync_v2
~~~

## Apêndice D — perguntas que o mapa estrutural deixa abertas

- Qual é a relação operacional real entre o conjunto implantado de Edge Functions e o fluxo documentado de release?
- A alegação de plataforma pronta representa outro ambiente/commit ou apenas documentação não atualizada?
- Por que getLocalISODate cruza tantos domínios e qual é o risco de fuso nos KPIs?
- Quais comunidades “dormentes” representam roadmap aprovado e quais são código abandonado?
- Qual é o banco canônico para catálogo/fornecedores e qual é o canônico para CRM/gamificação?

A pergunta mais importante é a última: sem uma resposta formal, qualquer tentativa de “sincronizar” origem e destino pode destruir diferenças intencionais ou consolidar perdas reais.
